import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const mercadoPagoAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN!;

const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceRoleKey
);

type BillingPeriod = 'mensal' | 'trimestral' | 'anual';

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
    label: string;
  }
> = {
  mensal: {
    amount: 25,
    days: 30,
    label: 'Mensal',
  },

  trimestral: {
    amount: 65,
    days: 90,
    label: 'Trimestral',
  },

  anual: {
    amount: 250,
    days: 365,
    label: 'Anual',
  },
};

async function getPaymentFromMercadoPago(paymentId: string) {
  const response = await fetch(
    `https://api.mercadopago.com/v1/payments/${paymentId}`,
    {
      method: 'GET',

      headers: {
        Authorization: `Bearer ${mercadoPagoAccessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error(
      'Erro ao consultar pagamento Mercado Pago:',
      data
    );

    throw new Error(
      'Erro ao consultar pagamento no Mercado Pago.'
    );
  }

  return data as MercadoPagoPayment;
}

function addDays(date: Date, days: number) {
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

  const parts = externalReference.split(':');

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

export async function POST(request: Request) {
  try {
    if (!supabaseUrl || !supabaseServiceRoleKey) {
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

    const body = await request.json();

    console.log(
      'Webhook Mercado Pago recebido:',
      JSON.stringify(body)
    );

    const paymentId =
      body?.data?.id ||
      body?.id ||
      body?.resource?.split?.('/')?.pop?.();

    const type =
      body?.type ||
      body?.topic;

    if (!paymentId) {
      return NextResponse.json({
        success: true,
        ignored: true,
        reason: 'Webhook sem paymentId.',
      });
    }

    if (type && type !== 'payment') {
      return NextResponse.json({
        success: true,
        ignored: true,
        reason: `Tipo ignorado: ${type}`,
      });
    }

    const payment =
      await getPaymentFromMercadoPago(
        String(paymentId)
      );

    const mpPaymentId = payment.id
      ? String(payment.id)
      : String(paymentId);

    const mpStatus =
      payment.status || 'unknown';

    const preferenceId =
      payment.preference_id || null;

    const externalReference =
      payment.external_reference || null;

    const supplierIdFromMetadata =
      payment.metadata?.supplier_id || null;

    const billingPeriod =
      getBillingPeriod(payment);

    const planConfig =
      PLAN_CONFIG[billingPeriod];

    let supplierId: string | null =
      supplierIdFromMetadata;

    /*
     * Tenta identificar o fornecedor pela referência externa.
     *
     * Formato:
     * supplier:UUID:premium:mensal:timestamp
     */
    if (
      !supplierId &&
      externalReference?.startsWith('supplier:')
    ) {
      const parts =
        externalReference.split(':');

      supplierId =
        parts[1] || null;
    }

    /*
     * Tenta localizar pela preference_id.
     */
    if (!supplierId && preferenceId) {
      const {
        data: subscriptionByPreference,
      } = await supabaseAdmin
        .from('supplier_subscriptions')
        .select('supplier_id')
        .eq(
          'mercadopago_preference_id',
          preferenceId
        )
        .maybeSingle();

      supplierId =
        subscriptionByPreference?.supplier_id ||
        null;
    }

    /*
     * Tenta localizar pela external_reference.
     */
    if (!supplierId && externalReference) {
      const {
        data: subscriptionByReference,
      } = await supabaseAdmin
        .from('supplier_subscriptions')
        .select('supplier_id')
        .eq(
          'mercadopago_external_reference',
          externalReference
        )
        .maybeSingle();

      supplierId =
        subscriptionByReference?.supplier_id ||
        null;
    }

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

    const now = new Date();

    const isApproved =
      mpStatus === 'approved';

    const subscriptionStatus =
      isApproved ? 'ativo' : 'pendente';

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

    const updatePayload: Record<
      string,
      unknown
    > = {
      plan: 'premium',

      status: subscriptionStatus,

      value: planConfig.amount,

      billing_period: billingPeriod,

      mercadopago_payment_id:
        mpPaymentId,

      mercadopago_status:
        mpStatus,

      updated_at:
        now.toISOString(),
    };

    if (preferenceId) {
      updatePayload.mercadopago_preference_id =
        preferenceId;
    }

    if (externalReference) {
      updatePayload.mercadopago_external_reference =
        externalReference;
    }

    if (isApproved) {
      updatePayload.paid_at =
        paidAt;

      updatePayload.expires_at =
        expiresAt;

      /*
       * Mantém também due_date atualizado
       * para compatibilidade com telas antigas.
       */
      updatePayload.due_date =
        expiresAt
          ? expiresAt.split('T')[0]
          : null;
    }

    const {
      data: existingSubscriptions,
      error: existingSubscriptionError,
    } = await supabaseAdmin
      .from('supplier_subscriptions')
      .select('id')
      .eq('supplier_id', supplierId)
      .order('created_at', {
        ascending: false,
      })
      .limit(1);

    if (existingSubscriptionError) {
      console.error(
        'Erro ao consultar assinatura:',
        existingSubscriptionError
      );

      return NextResponse.json(
        {
          error:
            'Erro ao consultar assinatura.',
        },
        {
          status: 500,
        }
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
        console.error(
          'Erro ao atualizar assinatura pelo webhook:',
          updateError
        );

        return NextResponse.json(
          {
            error:
              `Erro ao atualizar assinatura: ${updateError.message}`,
          },
          {
            status: 500,
          }
        );
      }
    } else {
      const {
        error: insertError,
      } = await supabaseAdmin
        .from('supplier_subscriptions')
        .insert({
          supplier_id: supplierId,
          ...updatePayload,
        });

      if (insertError) {
        console.error(
          'Erro ao criar assinatura pelo webhook:',
          insertError
        );

        return NextResponse.json(
          {
            error:
              `Erro ao criar assinatura: ${insertError.message}`,
          },
          {
            status: 500,
          }
        );
      }
    }

    /*
     * Se o pagamento foi aprovado,
     * garante que o fornecedor fique ativo.
     *
     * O destaque Premium também continuará
     * sendo sincronizado pelas regras já existentes
     * no REIM EVENTOS.
     */
    if (isApproved) {
      const {
        error: supplierUpdateError,
      } = await supabaseAdmin
        .from('suppliers')
        .update({
          status: 'ativo',
          is_featured: true,
        })
        .eq('id', supplierId);

      if (supplierUpdateError) {
        console.error(
          'Erro ao ativar fornecedor Premium:',
          supplierUpdateError
        );
      }
    }

    return NextResponse.json({
      success: true,

      supplier_id: supplierId,

      payment_id: mpPaymentId,

      mercadopago_status: mpStatus,

      subscription_status:
        subscriptionStatus,

      plan: 'premium',

      billing_period:
        billingPeriod,

      amount:
        planConfig.amount,

      duration_days:
        planConfig.days,

      expires_at:
        expiresAt,
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

    plans: {
      mensal: {
        value: 25,
        days: 30,
      },

      trimestral: {
        value: 65,
        days: 90,
      },

      anual: {
        value: 250,
        days: 365,
      },
    },
  });
}
