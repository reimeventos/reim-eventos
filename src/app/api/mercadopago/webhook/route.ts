import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  BillingPeriod,
  NotificationCenter,
} from '@/lib/notification-center';

export const dynamic = 'force-dynamic';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL!;

const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY!;

const mercadoPagoAccessToken =
  process.env.MERCADOPAGO_ACCESS_TOKEN!;

const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

type MercadoPagoPayment = {
  id?: number | string;
  status?: string;
  external_reference?: string;
  preference_id?: string;

  metadata?: {
    supplier_id?: string;
    plan?: string;
    billing_period?: BillingPeriod;
    amount?: number | string;
    duration_days?: number | string;
    source?: string;
  };
};

const PLAN_CONFIG: Record<
  BillingPeriod,
  {
    amount: number;
    days: number;
    featuredDays: number;
    label: string;
    plan: 'profissional' | 'premium';
  }
> = {
  mensal: {
    amount: 25,
    days: 30,
    featuredDays: 0,
    label: 'Básico Mensal',
    plan: 'profissional',
  },

  trimestral: {
    amount: 65,
    days: 90,
    featuredDays: 60,
    label: 'Trimestral com 2 meses de destaque',
    plan: 'premium',
  },

  anual: {
    amount: 250,
    days: 365,
    featuredDays: 365,
    label: 'Premium Anual',
    plan: 'premium',
  },
};

async function getPaymentFromMercadoPago(
  paymentId: string
) {
  const response = await fetch(
    `https://api.mercadopago.com/v1/payments/${paymentId}`,
    {
      method: 'GET',

      headers: {
        Authorization:
          `Bearer ${mercadoPagoAccessToken}`,

        'Content-Type':
          'application/json',
      },

      cache: 'no-store',
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error(
      'Erro ao consultar pagamento no Mercado Pago:',
      data
    );

    throw new Error(
      'Não foi possível consultar o pagamento no Mercado Pago.'
    );
  }

  return data as MercadoPagoPayment;
}

function addDays(
  date: Date,
  days: number
) {
  const newDate = new Date(date);

  newDate.setDate(
    newDate.getDate() + days
  );

  return newDate;
}

function getBillingPeriod(
  payment: MercadoPagoPayment
): BillingPeriod {
  const metadataPeriod =
    payment.metadata?.billing_period;

  if (
    metadataPeriod === 'mensal' ||
    metadataPeriod === 'trimestral' ||
    metadataPeriod === 'anual'
  ) {
    return metadataPeriod;
  }

  const externalReference =
    payment.external_reference || '';

  const parts =
    externalReference.split(':');

  const periodFromReference =
    parts.find(
      (part) =>
        part === 'mensal' ||
        part === 'trimestral' ||
        part === 'anual'
    );

  if (
    periodFromReference === 'trimestral' ||
    periodFromReference === 'anual'
  ) {
    return periodFromReference;
  }

  return 'mensal';
}

async function findSupplierId(
  payment: MercadoPagoPayment
) {
  const supplierIdFromMetadata =
    payment.metadata?.supplier_id || null;

  if (supplierIdFromMetadata) {
    return supplierIdFromMetadata;
  }

  const externalReference =
    payment.external_reference || null;

  if (
    externalReference?.startsWith(
      'supplier:'
    )
  ) {
    const parts =
      externalReference.split(':');

    const supplierId =
      parts[1] || null;

    if (supplierId) {
      return supplierId;
    }
  }

  const preferenceId =
    payment.preference_id || null;

  if (preferenceId) {
    const {
      data: subscriptionByPreference,
      error: preferenceError,
    } = await supabaseAdmin
      .from('supplier_subscriptions')
      .select('supplier_id')
      .eq(
        'mercadopago_preference_id',
        preferenceId
      )
      .maybeSingle();

    if (preferenceError) {
      console.error(
        'Erro ao localizar fornecedor pela preferência:',
        preferenceError
      );
    }

    if (
      subscriptionByPreference?.supplier_id
    ) {
      return subscriptionByPreference.supplier_id;
    }
  }

  if (externalReference) {
    const {
      data: subscriptionByReference,
      error: referenceError,
    } = await supabaseAdmin
      .from('supplier_subscriptions')
      .select('supplier_id')
      .eq(
        'mercadopago_external_reference',
        externalReference
      )
      .maybeSingle();

    if (referenceError) {
      console.error(
        'Erro ao localizar fornecedor pela referência:',
        referenceError
      );
    }

    if (
      subscriptionByReference?.supplier_id
    ) {
      return subscriptionByReference.supplier_id;
    }
  }

  return null;
}

async function updateSubscription(
  params: {
    supplierId: string;
    paymentId: string;
    paymentStatus: string;
    preferenceId: string | null;
    externalReference: string | null;
    billingPeriod: BillingPeriod;
    amount: number;
    paidAt: string | null;
    expiresAt: string | null;
    featuredUntil: string | null;
    plan: 'profissional' | 'premium';
    isFeatured: boolean;
  }
) {
  const isApproved =
    params.paymentStatus === 'approved';

  const subscriptionStatus =
    isApproved
      ? 'ativo'
      : 'pendente';

  const updatePayload:
    Record<string, unknown> = {
      plan: params.plan,

      status:
        subscriptionStatus,

      value:
        params.amount,

      billing_period:
        params.billingPeriod,

      is_featured:
        params.isFeatured,

      featured_until:
        params.featuredUntil,

      mercadopago_payment_id:
        params.paymentId,

      mercadopago_status:
        params.paymentStatus,

      updated_at:
        new Date().toISOString(),
    };

  if (params.preferenceId) {
    updatePayload
      .mercadopago_preference_id =
      params.preferenceId;
  }

  if (params.externalReference) {
    updatePayload
      .mercadopago_external_reference =
      params.externalReference;
  }

  if (
    isApproved &&
    params.paidAt &&
    params.expiresAt
  ) {
    updatePayload.paid_at =
      params.paidAt;

    updatePayload.expires_at =
      params.expiresAt;

    updatePayload.due_date =
      params.expiresAt.split('T')[0];
  }

  const {
    data: existingSubscriptions,
    error: existingSubscriptionError,
  } = await supabaseAdmin
    .from('supplier_subscriptions')
    .select('id')
    .eq(
      'supplier_id',
      params.supplierId
    )
    .order('created_at', {
      ascending: false,
    })
    .limit(1);

  if (existingSubscriptionError) {
    throw new Error(
      `Erro ao consultar assinatura: ${existingSubscriptionError.message}`
    );
  }

  const existingSubscription =
    existingSubscriptions?.[0] || null;

  if (existingSubscription?.id) {
    const {
      error: updateError,
    } = await supabaseAdmin
      .from('supplier_subscriptions')
      .update(updatePayload)
      .eq(
        'id',
        existingSubscription.id
      );

    if (updateError) {
      throw new Error(
        `Erro ao atualizar assinatura: ${updateError.message}`
      );
    }

    return;
  }

  const {
    error: insertError,
  } = await supabaseAdmin
    .from('supplier_subscriptions')
    .insert({
      supplier_id:
        params.supplierId,

      ...updatePayload,
    });

  if (insertError) {
    throw new Error(
      `Erro ao criar assinatura: ${insertError.message}`
    );
  }
}

async function activateSupplier(
  supplierId: string,
  isFeatured: boolean
) {
  const {
    error,
  } = await supabaseAdmin
    .from('suppliers')
    .update({
      status: 'ativo',
      is_featured: isFeatured,
    })
    .eq(
      'id',
      supplierId
    );

  if (error) {
    console.error(
      'Erro ao ativar fornecedor após pagamento:',
      error
    );
  }
}

async function linkPaymentToContractAcceptance(
  preferenceId: string | null,
  paymentId: string
) {
  if (!preferenceId) {
    return;
  }

  const {
    error,
  } = await supabaseAdmin
    .from('supplier_contract_acceptances')
    .update({
      mercadopago_payment_id:
        paymentId,
    })
    .eq(
      'mercadopago_preference_id',
      preferenceId
    );

  if (error) {
    console.error(
      'Erro ao vincular pagamento ao aceite do contrato:',
      error
    );
  }
}

async function cancelPendingPaymentReminder(
  preferenceId: string | null,
  paymentId: string
) {
  if (!preferenceId) {
    return;
  }

  const {
    data: reminders,
    error: reminderSearchError,
  } = await supabaseAdmin
    .from('email_notifications')
    .select('id,metadata')
    .eq(
      'notification_type',
      'pagamento_pendente'
    )
    .eq(
      'email_status',
      'pendente'
    )
    .contains('metadata', {
      preference_id:
        preferenceId,
    });

  if (reminderSearchError) {
    console.error(
      'Erro ao procurar lembrete de pagamento:',
      reminderSearchError
    );

    return;
  }

  for (
    const reminder of reminders || []
  ) {
    const metadata =
      reminder.metadata || {};

    const {
      error: reminderUpdateError,
    } = await supabaseAdmin
      .from('email_notifications')
      .update({
        email_status:
          'cancelado',

        error_message:
          null,

        metadata: {
          ...metadata,

          cancellation_reason:
            'payment_approved',

          payment_id:
            paymentId,

          cancelled_at:
            new Date().toISOString(),
        },
      })
      .eq(
        'id',
        reminder.id
      );

    if (reminderUpdateError) {
      console.error(
        'Erro ao cancelar lembrete pendente:',
        reminderUpdateError
      );
    }
  }
}

export async function POST(
  request: Request
) {
  try {
    if (
      !supabaseUrl ||
      !supabaseServiceRoleKey
    ) {
      return NextResponse.json(
        {
          error:
            'Variáveis do Supabase não configuradas.',
        },
        {
          status: 500,
        }
      );
    }

    if (!mercadoPagoAccessToken) {
      return NextResponse.json(
        {
          error:
            'MERCADOPAGO_ACCESS_TOKEN não configurado.',
        },
        {
          status: 500,
        }
      );
    }

    const body =
      await request.json();

    console.log(
      'Webhook Mercado Pago recebido:',
      JSON.stringify(body)
    );

    const paymentId =
      body?.data?.id ||
      body?.id ||
      body?.resource
        ?.split?.('/')
        ?.pop?.();

    const type =
      body?.type ||
      body?.topic;

    if (!paymentId) {
      return NextResponse.json({
        success: true,
        ignored: true,
        reason:
          'Webhook sem paymentId.',
      });
    }

    if (
      type &&
      type !== 'payment'
    ) {
      return NextResponse.json({
        success: true,
        ignored: true,
        reason:
          `Tipo ignorado: ${type}`,
      });
    }

    const payment =
      await getPaymentFromMercadoPago(
        String(paymentId)
      );

    const mpPaymentId =
      payment.id
        ? String(payment.id)
        : String(paymentId);

    const mpStatus =
      payment.status ||
      'unknown';

    const preferenceId =
      payment.preference_id ||
      null;

    const externalReference =
      payment.external_reference ||
      null;

    const billingPeriod =
      getBillingPeriod(payment);

    const planConfig =
      PLAN_CONFIG[
        billingPeriod
      ];

    const supplierId =
      await findSupplierId(
        payment
      );

    if (!supplierId) {
      console.error(
        'Fornecedor não identificado no webhook:',
        payment
      );

      return NextResponse.json({
        success: true,
        ignored: true,
        reason:
          'Fornecedor não identificado.',
      });
    }

    const now =
      new Date();

    const isApproved =
      mpStatus === 'approved';

    const paidAt =
      isApproved
        ? now.toISOString()
        : null;

    const expiresAt =
      isApproved
        ? addDays(
            now,
            planConfig.days
          ).toISOString()
        : null;

    const featuredUntil =
      isApproved &&
      planConfig.featuredDays > 0
        ? addDays(
            now,
            planConfig.featuredDays
          ).toISOString()
        : null;

    const isFeatured =
      isApproved &&
      planConfig.featuredDays > 0;

    await updateSubscription({
      supplierId,

      paymentId:
        mpPaymentId,

      paymentStatus:
        mpStatus,

      preferenceId,

      externalReference,

      billingPeriod,

      amount:
        planConfig.amount,

      paidAt,

      expiresAt,

      featuredUntil,

      plan:
        planConfig.plan,

      isFeatured,
    });

    if (
      isApproved &&
      paidAt &&
      expiresAt
    ) {
      await activateSupplier(
        supplierId,
        isFeatured
      );

      await linkPaymentToContractAcceptance(
        preferenceId,
        mpPaymentId
      );

      await cancelPendingPaymentReminder(
        preferenceId,
        mpPaymentId
      );

      try {
        await NotificationCenter.planActivated({
          supplierId,

          paymentId:
            mpPaymentId,

          preferenceId,

          billingPeriod,

          amount:
            planConfig.amount,

          paidAt,

          expiresAt,
        });
      } catch (notificationError) {
        console.error(
          'Pagamento aprovado, mas a notificação de ativação falhou:',
          notificationError
        );
      }
    }

    return NextResponse.json({
      success: true,

      supplier_id:
        supplierId,

      payment_id:
        mpPaymentId,

      mercadopago_status:
        mpStatus,

      subscription_status:
        isApproved
          ? 'ativo'
          : 'pendente',

      plan:
        planConfig.plan,

      is_featured:
        isFeatured,

      featured_until:
        featuredUntil,

      billing_period:
        billingPeriod,

      amount:
        planConfig.amount,

      duration_days:
        planConfig.days,

      expires_at:
        expiresAt,

      notification_center:
        isApproved
          ? 'planActivated'
          : null,
    });
  } catch (error: any) {
    console.error(
      'Erro geral webhook Mercado Pago:',
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          'Erro interno no webhook Mercado Pago.',
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,

    message:
      'Webhook Mercado Pago REIM EVENTOS ativo.',

    notification_center:
      'enabled',

    plans: {
      mensal: {
        value: 25,
        days: 30,
        featured_days: 0,
        plan: 'profissional',
      },

      trimestral: {
        value: 65,
        days: 90,
        featured_days: 60,
        plan: 'premium',
      },

      anual: {
        value: 250,
        days: 365,
        featured_days: 365,
        plan: 'premium',
      },
    },
  });
}
