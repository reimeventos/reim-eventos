import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendTransactionalEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL!;

const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY!;

const mercadoPagoAccessToken =
  process.env.MERCADOPAGO_ACCESS_TOKEN!;

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://reim-eventos.vercel.app';

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

type BillingPeriod =
  | 'mensal'
  | 'trimestral'
  | 'anual';

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
      'Erro ao consultar pagamento Mercado Pago:',
      data
    );

    throw new Error(
      'Erro ao consultar pagamento no Mercado Pago.'
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
    periodFromReference ===
      'trimestral' ||
    periodFromReference ===
      'anual'
  ) {
    return periodFromReference;
  }

  return 'mensal';
}

function formatMoney(
  value: number
) {
  return value.toLocaleString(
    'pt-BR',
    {
      style: 'currency',
      currency: 'BRL',
    }
  );
}

function formatDate(
  value: string
) {
  return new Date(value).toLocaleDateString(
    'pt-BR',
    {
      timeZone: 'America/Bahia',
    }
  );
}

async function getSupplierEmailData(
  supplierId: string
) {
  const {
    data: supplier,
    error: supplierError,
  } = await supabaseAdmin
    .from('suppliers')
    .select('*')
    .eq('id', supplierId)
    .maybeSingle();

  if (
    supplierError ||
    !supplier
  ) {
    console.error(
      'Não foi possível buscar fornecedor para e-mail:',
      supplierError
    );

    return null;
  }

  const ownerId =
    supplier.owner_id || null;

  let authEmail = '';
  let authName = '';
  let authPhone = '';

  if (ownerId) {
    const {
      data: authUserData,
      error: authUserError,
    } =
      await supabaseAdmin.auth.admin.getUserById(
        ownerId
      );

    if (!authUserError) {
      const authUser =
        authUserData.user;

      authEmail =
        authUser?.email || '';

      authName =
        authUser?.user_metadata
          ?.full_name ||
        authUser?.user_metadata?.name ||
        authUser?.user_metadata?.nome ||
        '';

      authPhone =
        authUser?.phone ||
        authUser?.user_metadata?.phone ||
        authUser?.user_metadata
          ?.telefone ||
        authUser?.user_metadata
          ?.whatsapp ||
        '';
    }
  }

  const recipientEmail =
    authEmail ||
    supplier.email ||
    supplier.contact_email ||
    '';

  const recipientName =
    authName ||
    supplier.responsible_name ||
    supplier.contact_name ||
    supplier.owner_name ||
    supplier.business_name ||
    supplier.company_name ||
    supplier.name ||
    'Fornecedor REIM EVENTOS';

  const businessName =
    supplier.business_name ||
    supplier.company_name ||
    supplier.name ||
    'Fornecedor REIM EVENTOS';

  const phone =
    authPhone ||
    supplier.phone ||
    supplier.telefone ||
    supplier.whatsapp ||
    supplier.contact_phone ||
    '';

  return {
    supplier,
    ownerId,
    recipientEmail,
    recipientName,
    businessName,
    phone,
  };
}

async function emailAlreadyProcessed(
  paymentId: string
) {
  const {
    data,
    error,
  } = await supabaseAdmin
    .from('email_notifications')
    .select('id,email_status')
    .eq(
      'notification_type',
      'plano_ativado'
    )
    .contains('metadata', {
      payment_id: paymentId,
    })
    .in('email_status', [
      'enviado',
      'enviando',
    ])
    .limit(1);

  if (error) {
    console.error(
      'Erro ao verificar duplicidade de e-mail:',
      error
    );

    return false;
  }

  return Boolean(
    data && data.length > 0
  );
}

async function sendPlanActivatedEmail(
  params: {
    supplierId: string;
    paymentId: string;
    preferenceId: string | null;
    billingPeriod: BillingPeriod;
    amount: number;
    paidAt: string;
    expiresAt: string;
  }
) {
  const alreadyProcessed =
    await emailAlreadyProcessed(
      params.paymentId
    );

  if (alreadyProcessed) {
    console.log(
      'E-mail de plano ativado já processado:',
      params.paymentId
    );

    return;
  }

  const emailData =
    await getSupplierEmailData(
      params.supplierId
    );

  if (
    !emailData?.recipientEmail
  ) {
    console.error(
      'Fornecedor sem e-mail para envio:',
      params.supplierId
    );

    return;
  }

  const planConfig =
    PLAN_CONFIG[
      params.billingPeriod
    ];

  try {
    await sendTransactionalEmail({
      notificationType:
        'plano_ativado',

      recipientEmail:
        emailData.recipientEmail,

      recipientName:
        emailData.recipientName,

      supplierId:
        params.supplierId,

      userId:
        emailData.ownerId,

      subject:
        'Seu plano REIM EVENTOS foi ativado',

      title:
        'Plano Premium ativado',

      message:
        `Seu pagamento foi confirmado e o plano Premium ${planConfig.label} já está ativo. Sua vitrine está liberada para aparecer na plataforma e receber pedidos de orçamento.`,

      buttonText:
        'Acessar painel do fornecedor',

      buttonUrl:
        `${siteUrl}/painel-fornecedor`,

      details: [
        {
          label: 'Fornecedor',
          value:
            emailData.businessName,
        },
        {
          label: 'Plano',
          value:
            `Premium ${planConfig.label}`,
        },
        {
          label: 'Valor',
          value:
            formatMoney(
              params.amount
            ),
        },
        {
          label: 'Pagamento',
          value:
            'Aprovado',
        },
        {
          label: 'Ativado em',
          value:
            formatDate(
              params.paidAt
            ),
        },
        {
          label: 'Válido até',
          value:
            formatDate(
              params.expiresAt
            ),
        },
      ],

      notice:
        'Guarde este e-mail como comprovante da ativação. Caso precise de atendimento, responda para contato@reimeventos.com.br.',

      metadata: {
        source:
          'mercadopago_webhook',

        payment_id:
          params.paymentId,

        preference_id:
          params.preferenceId,

        billing_period:
          params.billingPeriod,

        amount:
          params.amount,

        paid_at:
          params.paidAt,

        expires_at:
          params.expiresAt,

        supplier_business_name:
          emailData.businessName,

        phone:
          emailData.phone || null,
      },

      idempotencyKey:
        `plano-ativado-${params.paymentId}`,
    });
  } catch (error) {
    console.error(
      'Pagamento foi ativado, mas o e-mail falhou:',
      error
    );
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

    if (
      !mercadoPagoAccessToken
    ) {
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

    const supplierIdFromMetadata =
      payment.metadata
        ?.supplier_id ||
      null;

    const billingPeriod =
      getBillingPeriod(payment);

    const planConfig =
      PLAN_CONFIG[
        billingPeriod
      ];

    let supplierId:
      | string
      | null =
      supplierIdFromMetadata;

    if (
      !supplierId &&
      externalReference?.startsWith(
        'supplier:'
      )
    ) {
      const parts =
        externalReference.split(':');

      supplierId =
        parts[1] || null;
    }

    if (
      !supplierId &&
      preferenceId
    ) {
      const {
        data:
          subscriptionByPreference,
      } = await supabaseAdmin
        .from(
          'supplier_subscriptions'
        )
        .select('supplier_id')
        .eq(
          'mercadopago_preference_id',
          preferenceId
        )
        .maybeSingle();

      supplierId =
        subscriptionByPreference
          ?.supplier_id ||
        null;
    }

    if (
      !supplierId &&
      externalReference
    ) {
      const {
        data:
          subscriptionByReference,
      } = await supabaseAdmin
        .from(
          'supplier_subscriptions'
        )
        .select('supplier_id')
        .eq(
          'mercadopago_external_reference',
          externalReference
        )
        .maybeSingle();

      supplierId =
        subscriptionByReference
          ?.supplier_id ||
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

    const now =
      new Date();

    const isApproved =
      mpStatus === 'approved';

    const subscriptionStatus =
      isApproved
        ? 'ativo'
        : 'pendente';

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

    const updatePayload:
      Record<string, unknown> = {
      plan: 'premium',

      status:
        subscriptionStatus,

      value:
        planConfig.amount,

      billing_period:
        billingPeriod,

      mercadopago_payment_id:
        mpPaymentId,

      mercadopago_status:
        mpStatus,

      updated_at:
        now.toISOString(),
    };

    if (preferenceId) {
      updatePayload
        .mercadopago_preference_id =
        preferenceId;
    }

    if (externalReference) {
      updatePayload
        .mercadopago_external_reference =
        externalReference;
    }

    if (
      isApproved &&
      paidAt &&
      expiresAt
    ) {
      updatePayload.paid_at =
        paidAt;

      updatePayload.expires_at =
        expiresAt;

      updatePayload.due_date =
        expiresAt.split('T')[0];
    }

    const {
      data:
        existingSubscriptions,
      error:
        existingSubscriptionError,
    } = await supabaseAdmin
      .from(
        'supplier_subscriptions'
      )
      .select('id')
      .eq(
        'supplier_id',
        supplierId
      )
      .order('created_at', {
        ascending: false,
      })
      .limit(1);

    if (
      existingSubscriptionError
    ) {
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
      existingSubscriptions?.[0] ||
      null;

    if (
      existingSubscription?.id
    ) {
      const {
        error: updateError,
      } = await supabaseAdmin
        .from(
          'supplier_subscriptions'
        )
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
        .from(
          'supplier_subscriptions'
        )
        .insert({
          supplier_id:
            supplierId,

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

    if (
      isApproved &&
      paidAt &&
      expiresAt
    ) {
      const {
        error:
          supplierUpdateError,
      } = await supabaseAdmin
        .from('suppliers')
        .update({
          status: 'ativo',
          is_featured: true,
        })
        .eq(
          'id',
          supplierId
        );

      if (
        supplierUpdateError
      ) {
        console.error(
          'Erro ao ativar fornecedor Premium:',
          supplierUpdateError
        );
      }

      if (preferenceId) {
        const {
          error:
            acceptanceUpdateError,
        } = await supabaseAdmin
          .from(
            'supplier_contract_acceptances'
          )
          .update({
            mercadopago_payment_id:
              mpPaymentId,
          })
          .eq(
            'mercadopago_preference_id',
            preferenceId
          );

        if (
          acceptanceUpdateError
        ) {
          console.error(
            'Erro ao vincular pagamento ao aceite:',
            acceptanceUpdateError
          );
        }
      }

      await sendPlanActivatedEmail({
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

    emails: {
      plan_activated:
        'enabled',
    },

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
