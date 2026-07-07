import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Variável de ambiente ausente: ${name}`);
  }

  return value;
}

function addMonths(date: Date, months: number) {
  const nextDate = new Date(date);
  nextDate.setMonth(nextDate.getMonth() + months);
  return nextDate;
}

function getBillingMonths(subscription: any, externalReference?: string | null) {
  const billingPeriod = String(subscription?.billing_period || '').toLowerCase();
  const reference = String(externalReference || '');

  if (billingPeriod === 'anual' || reference.includes(':billing:anual')) {
    return 12;
  }

  if (
    billingPeriod === 'trimestral' ||
    reference.includes(':billing:trimestral')
  ) {
    return 3;
  }

  return 1;
}

function getTopic(payload: any, request: NextRequest) {
  return (
    payload?.type ||
    payload?.topic ||
    payload?.action?.split('.')?.[0] ||
    request.nextUrl.searchParams.get('type') ||
    request.nextUrl.searchParams.get('topic') ||
    ''
  );
}

function getResourceId(payload: any, request: NextRequest) {
  return (
    payload?.data?.id ||
    payload?.id ||
    payload?.resource ||
    request.nextUrl.searchParams.get('data.id') ||
    request.nextUrl.searchParams.get('id') ||
    ''
  );
}

function isMercadoPagoTestWebhook(payload: any, resourceId: string) {
  const id = String(resourceId || payload?.data?.id || payload?.id || '');

  return (
    id === '123456' ||
    id === '123456789' ||
    String(payload?.data?.id || '') === '123456'
  );
}

function normalizePlan(plan: string) {
  const normalized = String(plan || '').toLowerCase();

  if (normalized.includes('premium')) return 'premium';
  if (normalized.includes('profissional')) return 'profissional';

  return normalized || 'profissional';
}

function parseExternalReference(reference?: string | null) {
  const text = String(reference || '');
  const parts = text.split(':');

  const supplierIndex = parts.indexOf('supplier');
  const planIndex = parts.indexOf('plan');

  return {
    supplierId:
      supplierIndex >= 0 && parts[supplierIndex + 1]
        ? parts[supplierIndex + 1]
        : '',
    plan:
      planIndex >= 0 && parts[planIndex + 1]
        ? normalizePlan(parts[planIndex + 1])
        : '',
  };
}

function isApprovedPayment(data: any) {
  const status = String(data?.status || '').toLowerCase();

  return status === 'approved' || status === 'authorized';
}

function isActivePreapproval(data: any) {
  const status = String(data?.status || '').toLowerCase();

  return status === 'authorized' || status === 'active';
}

function isCanceledOrPaused(data: any) {
  const status = String(data?.status || '').toLowerCase();

  return (
    status === 'cancelled' ||
    status === 'canceled' ||
    status === 'paused' ||
    status === 'finished' ||
    status === 'expired'
  );
}

async function fetchMercadoPagoResource(path: string) {
  const accessToken = getRequiredEnv('MERCADO_PAGO_ACCESS_TOKEN');

  const response = await fetch(`https://api.mercadopago.com${path}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('Erro ao consultar Mercado Pago:', path, data);
    throw new Error(
      data?.message ||
        data?.error ||
        `Não foi possível consultar Mercado Pago em ${path}.`
    );
  }

  return data;
}

async function getMercadoPagoDetails(topic: string, resourceId: string) {
  const normalizedTopic = String(topic || '').toLowerCase();

  if (
    normalizedTopic.includes('subscription_preapproval') ||
    normalizedTopic.includes('preapproval')
  ) {
    const preapproval = await fetchMercadoPagoResource(
      `/preapproval/${resourceId}`
    );

    return {
      kind: 'preapproval',
      preapproval,
      payment: null,
      authorizedPayment: null,
    };
  }

  if (
    normalizedTopic.includes('subscription_authorized_payment') ||
    normalizedTopic.includes('authorized_payment')
  ) {
    const authorizedPayment = await fetchMercadoPagoResource(
      `/authorized_payments/${resourceId}`
    );

    return {
      kind: 'authorized_payment',
      preapproval: null,
      payment: null,
      authorizedPayment,
    };
  }

  if (normalizedTopic.includes('payment')) {
    const payment = await fetchMercadoPagoResource(`/v1/payments/${resourceId}`);

    return {
      kind: 'payment',
      preapproval: null,
      payment,
      authorizedPayment: null,
    };
  }

  return {
    kind: 'unknown',
    preapproval: null,
    payment: null,
    authorizedPayment: null,
  };
}

async function findSubscription(supabaseAdmin: any, details: any) {
  const preapprovalId =
    details?.preapproval?.id ||
    details?.authorizedPayment?.preapproval_id ||
    details?.authorizedPayment?.preapproval?.id ||
    details?.payment?.metadata?.preapproval_id ||
    '';

  const paymentId =
    details?.payment?.id || details?.authorizedPayment?.payment_id || '';

  const externalReference =
    details?.preapproval?.external_reference ||
    details?.authorizedPayment?.external_reference ||
    details?.payment?.external_reference ||
    '';

  if (preapprovalId) {
    const { data } = await supabaseAdmin
      .from('supplier_subscriptions')
      .select('*')
      .eq('mercadopago_preapproval_id', String(preapprovalId))
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data?.id) return data;
  }

  if (paymentId) {
    const { data } = await supabaseAdmin
      .from('supplier_subscriptions')
      .select('*')
      .eq('mercadopago_payment_id', String(paymentId))
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data?.id) return data;
  }

  if (externalReference) {
    const { data } = await supabaseAdmin
      .from('supplier_subscriptions')
      .select('*')
      .eq('mercadopago_external_reference', String(externalReference))
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data?.id) return data;
  }

  const parsedReference = parseExternalReference(externalReference);

  if (parsedReference.supplierId) {
    const { data } = await supabaseAdmin
      .from('supplier_subscriptions')
      .select('*')
      .eq('supplier_id', parsedReference.supplierId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data?.id) return data;
  }

  return null;
}

async function upsertPaymentHistory(
  supabaseAdmin: any,
  subscription: any,
  details: any,
  webhookPayload: any
) {
  const payment = details.payment || details.authorizedPayment || null;

  if (!payment) return;

  const paymentId = String(payment?.id || payment?.payment_id || '');
  const preapprovalId =
    payment?.preapproval_id ||
    payment?.preapproval?.id ||
    subscription?.mercadopago_preapproval_id ||
    '';

  const paymentPayload = {
    supplier_id: subscription?.supplier_id || null,
    subscription_id: subscription?.id || null,
    provider: 'mercadopago',
    mercadopago_payment_id: paymentId || null,
    mercadopago_preapproval_id: preapprovalId || null,
    mercadopago_external_reference:
      payment?.external_reference ||
      subscription?.mercadopago_external_reference ||
      null,
    plan: subscription?.plan || null,
    amount:
      payment?.transaction_amount ||
      payment?.amount ||
      payment?.transaction_details?.total_paid_amount ||
      null,
    currency: payment?.currency_id || 'BRL',
    status: payment?.status || null,
    status_detail: payment?.status_detail || null,
    payment_method_id: payment?.payment_method_id || null,
    payment_type_id: payment?.payment_type_id || null,
    payer_email:
      payment?.payer?.email ||
      payment?.payer_email ||
      subscription?.mercadopago_payer_email ||
      null,
    paid_at: isApprovedPayment(payment) ? new Date().toISOString() : null,
    approved_at: isApprovedPayment(payment) ? new Date().toISOString() : null,
    due_date: subscription?.due_date || null,
    raw: {
      webhook: webhookPayload,
      mercado_pago: payment,
    },
    updated_at: new Date().toISOString(),
  };

  if (paymentId) {
    const { data: existingPayment } = await supabaseAdmin
      .from('supplier_payments')
      .select('id')
      .eq('mercadopago_payment_id', paymentId)
      .limit(1)
      .maybeSingle();

    if (existingPayment?.id) {
      await supabaseAdmin
        .from('supplier_payments')
        .update(paymentPayload)
        .eq('id', existingPayment.id);

      return;
    }
  }

  await supabaseAdmin.from('supplier_payments').insert(paymentPayload);
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json().catch(() => ({}));
    const topic = getTopic(payload, request);
    const resourceId = String(getResourceId(payload, request));

    if (isMercadoPagoTestWebhook(payload, resourceId)) {
      return NextResponse.json({
        ok: true,
        test: true,
        message:
          'Webhook de teste recebido com sucesso. O ID de teste do Mercado Pago não será consultado na API.',
        topic,
        resource_id: resourceId,
      });
    }

    const supabaseUrl = getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL');
    const supabaseServiceRoleKey = getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY');

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    if (!resourceId) {
      return NextResponse.json({
        ok: true,
        ignored: true,
        reason: 'Webhook sem resource id.',
      });
    }

    const details = await getMercadoPagoDetails(topic, resourceId);

    if (details.kind === 'unknown') {
      return NextResponse.json({
        ok: true,
        ignored: true,
        reason: `Tópico não tratado: ${topic}`,
      });
    }

    const subscription = await findSubscription(supabaseAdmin, details);

    if (!subscription?.id) {
      console.error('Assinatura REIM não localizada para webhook:', {
        topic,
        resourceId,
        details,
      });

      return NextResponse.json({
        ok: true,
        ignored: true,
        reason: 'Assinatura local não encontrada.',
      });
    }

    const preapproval = details.preapproval || null;
    const payment = details.payment || details.authorizedPayment || null;

    const preapprovalId =
      preapproval?.id ||
      payment?.preapproval_id ||
      payment?.preapproval?.id ||
      subscription.mercadopago_preapproval_id ||
      null;

    const paymentId =
      details.payment?.id ||
      details.authorizedPayment?.payment_id ||
      details.authorizedPayment?.id ||
      null;

    const externalReference =
      preapproval?.external_reference ||
      payment?.external_reference ||
      subscription.mercadopago_external_reference ||
      null;

    const parsedReference = parseExternalReference(externalReference);
    const plan = normalizePlan(parsedReference.plan || subscription.plan || '');
    const approved = isApprovedPayment(payment) || isActivePreapproval(preapproval);
    const canceledOrPaused =
      isCanceledOrPaused(preapproval) || isCanceledOrPaused(payment);

    let nextStatus = subscription.status || 'pendente';
    let paymentStatus =
      payment?.status || preapproval?.status || subscription.payment_status || 'pending';
    let dueDate = subscription.due_date || null;
    let paidAt = subscription.paid_at || null;
    let canceledAt = subscription.canceled_at || null;

    if (approved) {
      nextStatus = 'ativo';
      paymentStatus = 'approved';
      paidAt = new Date().toISOString();
      dueDate = addMonths(
        new Date(),
        getBillingMonths(subscription, externalReference)
      ).toISOString();
      canceledAt = null;
    }

    if (canceledOrPaused) {
      nextStatus = String(preapproval?.status || payment?.status)
        .toLowerCase()
        .includes('cancel')
        ? 'cancelado'
        : 'expirado';
      paymentStatus = preapproval?.status || payment?.status || 'canceled';
      canceledAt = new Date().toISOString();
    }

    const updatePayload = {
      plan,
      billing_period: subscription.billing_period || null,
      status: nextStatus,
      due_date: dueDate,
      payment_provider: 'mercadopago',
      payment_status: paymentStatus,
      paid_at: paidAt,
      canceled_at: canceledAt,
      mercadopago_preapproval_id: preapprovalId,
      mercadopago_payment_id: paymentId,
      mercadopago_payer_email:
        preapproval?.payer_email ||
        payment?.payer?.email ||
        payment?.payer_email ||
        subscription.mercadopago_payer_email ||
        null,
      mercadopago_status:
        preapproval?.status ||
        payment?.status ||
        subscription.mercadopago_status ||
        null,
      mercadopago_external_reference: externalReference,
      last_webhook_at: new Date().toISOString(),
      webhook_last_event: payload?.action || topic || details.kind,
      webhook_raw: {
        webhook: payload,
        mercado_pago: {
          kind: details.kind,
          preapproval,
          payment,
        },
      },
      updated_at: new Date().toISOString(),
    };

    const { error: updateError } = await supabaseAdmin
      .from('supplier_subscriptions')
      .update(updatePayload)
      .eq('id', subscription.id);

    if (updateError) {
      throw updateError;
    }

    if (approved && subscription.supplier_id) {
      const { error: supplierError } = await supabaseAdmin
        .from('suppliers')
        .update({
          status: 'ativo',
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscription.supplier_id);

      if (supplierError) {
        console.error('Não foi possível ativar supplier.status:', supplierError);
      }
    }

    await upsertPaymentHistory(supabaseAdmin, subscription, details, payload);

    return NextResponse.json({
      ok: true,
      topic,
      resource_id: resourceId,
      subscription_id: subscription.id,
      supplier_id: subscription.supplier_id,
      status: nextStatus,
      payment_status: paymentStatus,
    });
  } catch (error: any) {
    console.error('Erro no webhook Mercado Pago:', error);

    return NextResponse.json(
      {
        ok: false,
        error: error?.message || 'Erro ao processar webhook Mercado Pago.',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: 'mercadopago-webhook',
  });
}
