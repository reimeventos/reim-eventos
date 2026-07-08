import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

type PlanKey = 'profissional' | 'premium';
type BillingPeriod = 'mensal' | 'trimestral' | 'anual';

const PLAN_CONFIG: Record<PlanKey, { label: string; monthlyAmount: number }> = {
  profissional: {
    label: 'Plano Profissional REIM EVENTOS',
    monthlyAmount: Number(process.env.MP_PLAN_PROFISSIONAL_AMOUNT || 49.9),
  },
  premium: {
    label: 'Plano Premium Destaque REIM EVENTOS',
    monthlyAmount: Number(process.env.MP_PLAN_PREMIUM_AMOUNT || 89.9),
  },
};

const BILLING_CONFIG: Record<
  BillingPeriod,
  { label: string; months: number; days: number }
> = {
  mensal: { label: 'Mensal', months: 1, days: 30 },
  trimestral: { label: 'Trimestral', months: 3, days: 90 },
  anual: { label: 'Anual', months: 12, days: 365 },
};

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Variável de ambiente ausente: ${name}`);
  }

  return value;
}

function getSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return 'http://localhost:3000';
}

function normalizePlan(plan: string): PlanKey | null {
  const normalized = String(plan || '').toLowerCase().trim();

  if (
    normalized === 'profissional' ||
    normalized === 'professional' ||
    normalized === 'plano_profissional'
  ) {
    return 'profissional';
  }

  if (
    normalized === 'premium' ||
    normalized === 'premium_destaque' ||
    normalized === 'plano_premium'
  ) {
    return 'premium';
  }

  return null;
}

function normalizeBillingPeriod(period: string): BillingPeriod {
  const normalized = String(period || '').toLowerCase().trim();

  if (normalized === 'trimestral') return 'trimestral';
  if (normalized === 'anual') return 'anual';

  return 'mensal';
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function getFallbackAmount(plan: PlanKey, billingPeriod: BillingPeriod) {
  const monthlyAmount = PLAN_CONFIG[plan].monthlyAmount;

  if (billingPeriod === 'trimestral') return monthlyAmount * 3;
  if (billingPeriod === 'anual') return monthlyAmount * 12;

  return monthlyAmount;
}

export async function POST(request: NextRequest) {
  try {
    const mercadoPagoAccessToken = getRequiredEnv('MERCADO_PAGO_ACCESS_TOKEN');
    const supabaseUrl = getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL');
    const supabaseAnonKey = getRequiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    const supabaseServiceRoleKey = getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY');
    const siteUrl = getSiteUrl();

    const authHeader = request.headers.get('authorization') || '';

    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data: userData, error: userError } =
      await supabaseUser.auth.getUser();

    if (userError || !userData.user) {
      return NextResponse.json(
        { error: 'Login necessário para assinar um plano.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const supplierId = String(body?.supplier_id || '').trim();
    const plan = normalizePlan(String(body?.plan || ''));
    const billingPeriod = normalizeBillingPeriod(
      String(body?.billing_period || '')
    );

    if (!supplierId) {
      return NextResponse.json(
        { error: 'Fornecedor não informado.' },
        { status: 400 }
      );
    }

    if (!plan) {
      return NextResponse.json(
        { error: 'Plano inválido. Use profissional ou premium.' },
        { status: 400 }
      );
    }

    const { data: supplier, error: supplierError } = await supabaseAdmin
      .from('suppliers')
      .select('id, owner_id, business_name')
      .eq('id', supplierId)
      .maybeSingle();

    if (supplierError) throw supplierError;

    if (!supplier?.id) {
      return NextResponse.json(
        { error: 'Fornecedor não encontrado.' },
        { status: 404 }
      );
    }

    if (supplier.owner_id !== userData.user.id) {
      return NextResponse.json(
        { error: 'Você não tem permissão para assinar este fornecedor.' },
        { status: 403 }
      );
    }

    const planConfig = PLAN_CONFIG[plan];
    const billingConfig = BILLING_CONFIG[billingPeriod];

    /*
     * Valor oficial vem do servidor/Vercel.
     * MP_PLAN_PREMIUM_AMOUNT=5 deixa o Premium Mensal em R$ 5,00 para teste.
     */
    const transactionAmount = Number(
      getFallbackAmount(plan, billingPeriod).toFixed(2)
    );

    const dueDate = addDays(new Date(), billingConfig.days);
    const externalReference = `supplier:${supplierId}:plan:${plan}:billing:${billingPeriod}:checkout_pro:user:${userData.user.id}`;

    const successUrl = `${siteUrl}/painel-fornecedor/planos?mp_status=success&plan=${plan}&billing=${billingPeriod}`;
    const pendingUrl = `${siteUrl}/painel-fornecedor/planos?mp_status=pending&plan=${plan}&billing=${billingPeriod}`;
    const failureUrl = `${siteUrl}/painel-fornecedor/planos?mp_status=failure&plan=${plan}&billing=${billingPeriod}`;
    const notificationUrl = `${siteUrl}/api/mercadopago/webhook`;

    const preferencePayload = {
      external_reference: externalReference,
      notification_url: notificationUrl,
      back_urls: {
        success: successUrl,
        pending: pendingUrl,
        failure: failureUrl,
      },
      auto_return: 'approved',
      items: [
        {
          id: `${plan}-${billingPeriod}`,
          title: `${planConfig.label} - ${billingConfig.label}`,
          description: `Acesso REIM EVENTOS por ${billingConfig.days} dias.`,
          quantity: 1,
          unit_price: transactionAmount,
          currency_id: 'BRL',
        },
      ],
      metadata: {
        supplier_id: supplierId,
        plan,
        billing_period: billingPeriod,
        user_id: userData.user.id,
        checkout_type: 'checkout_pro',
      },
      payer: {
        email: userData.user.email || undefined,
      },
    };

    const mercadoPagoResponse = await fetch(
      'https://api.mercadopago.com/checkout/preferences',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${mercadoPagoAccessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferencePayload),
      }
    );

    const mercadoPagoData = await mercadoPagoResponse.json();

    if (!mercadoPagoResponse.ok) {
      console.error('Erro Mercado Pago Checkout Pro:', mercadoPagoData);

      return NextResponse.json(
        {
          error:
            mercadoPagoData?.message ||
            mercadoPagoData?.error ||
            'Não foi possível criar o pagamento no Mercado Pago.',
          details: mercadoPagoData,
        },
        { status: mercadoPagoResponse.status }
      );
    }

    const initPoint =
      mercadoPagoData?.init_point ||
      mercadoPagoData?.sandbox_init_point ||
      '';

    const subscriptionPayload = {
      supplier_id: supplierId,
      plan,
      status: 'pendente',
      value: transactionAmount,
      due_date: dueDate.toISOString(),
      billing_period: billingPeriod,
      is_featured: plan === 'premium',
      payment_provider: 'mercadopago',
      payment_status: 'pending',
      checkout_type: 'checkout_pro',
      mercadopago_preference_id: mercadoPagoData?.id || null,
      mercadopago_preapproval_id: null,
      mercadopago_payment_id: null,
      mercadopago_payer_email: userData.user.email || null,
      mercadopago_status: 'pending',
      mercadopago_external_reference: externalReference,
      mercadopago_init_point: mercadoPagoData?.init_point || null,
      mercadopago_sandbox_init_point:
        mercadoPagoData?.sandbox_init_point || null,
      webhook_raw: mercadoPagoData,
      updated_at: new Date().toISOString(),
    };

    const { data: existingSubscription } = await supabaseAdmin
      .from('supplier_subscriptions')
      .select('id')
      .eq('supplier_id', supplierId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    let savedSubscription = null;

    if (existingSubscription?.id) {
      const { data, error } = await supabaseAdmin
        .from('supplier_subscriptions')
        .update(subscriptionPayload)
        .eq('id', existingSubscription.id)
        .select('*')
        .maybeSingle();

      if (error) throw error;
      savedSubscription = data;
    } else {
      const { data, error } = await supabaseAdmin
        .from('supplier_subscriptions')
        .insert(subscriptionPayload)
        .select('*')
        .maybeSingle();

      if (error) throw error;
      savedSubscription = data;
    }

    return NextResponse.json({
      ok: true,
      supplier_id: supplierId,
      subscription: savedSubscription,
      mercadopago_preference_id: mercadoPagoData?.id || null,
      init_point: initPoint,
      sandbox_init_point: mercadoPagoData?.sandbox_init_point || null,
    });
  } catch (error: any) {
    console.error('Erro ao criar Checkout Pro Mercado Pago:', error);

    return NextResponse.json(
      {
        error:
          error?.message ||
          'Não foi possível iniciar o pagamento pelo Mercado Pago.',
      },
      { status: 500 }
    );
  }
}
