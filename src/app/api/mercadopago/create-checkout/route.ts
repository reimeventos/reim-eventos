import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

type CreateCheckoutBody = {
  supplier_id?: string;
  billing_period?: BillingPeriod;
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

function formatMoney(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
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

  if (supplierError || !supplier) {
    console.error(
      'Erro ao buscar fornecedor para o lembrete:',
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

async function schedulePendingPaymentReminder(
  params: {
    supplierId: string;
    preferenceId: string;
    checkoutUrl: string;
    billingPeriod: BillingPeriod;
    amount: number;
  }
) {
  const emailData =
    await getSupplierEmailData(
      params.supplierId
    );

  if (!emailData?.recipientEmail) {
    console.error(
      'Fornecedor sem e-mail para lembrete pendente:',
      params.supplierId
    );

    return;
  }

  const planConfig =
    PLAN_CONFIG[
      params.billingPeriod
    ];

  const scheduledFor =
    new Date(
      Date.now() + 30 * 60 * 1000
    ).toISOString();

  const {
    error: scheduleError,
  } = await supabaseAdmin
    .from('email_notifications')
    .insert({
      supplier_id:
        params.supplierId,

      user_id:
        emailData.ownerId,

      notification_type:
        'pagamento_pendente',

      recipient_email:
        emailData.recipientEmail,

      recipient_name:
        emailData.recipientName,

      subject:
        'Seu pagamento REIM EVENTOS ainda está pendente',

      email_status:
        'pendente',

      provider:
        'resend',

      scheduled_for:
        scheduledFor,

      metadata: {
        source:
          'mercadopago_create_checkout',

        preference_id:
          params.preferenceId,

        checkout_url:
          params.checkoutUrl,

        billing_period:
          params.billingPeriod,

        plan_label:
          planConfig.label,

        amount:
          params.amount,

        amount_formatted:
          formatMoney(
            params.amount
          ),

        duration_days:
          planConfig.days,

        supplier_business_name:
          emailData.businessName,

        phone:
          emailData.phone || null,

        reminder_delay_minutes:
          30,
      },
    });

  if (scheduleError) {
    console.error(
      'Checkout criado, mas não foi possível agendar o lembrete:',
      scheduleError
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
      (await request.json()) as CreateCheckoutBody;

    const supplierId =
      body?.supplier_id;

    const billingPeriod: BillingPeriod =
      body?.billing_period ===
        'trimestral'
        ? 'trimestral'
        : body?.billing_period ===
            'anual'
          ? 'anual'
          : 'mensal';

    if (!supplierId) {
      return NextResponse.json(
        {
          error:
            'supplier_id é obrigatório.',
        },
        {
          status: 400,
        }
      );
    }

    const planConfig =
      PLAN_CONFIG[
        billingPeriod
      ];

    const {
      data: supplier,
      error: supplierError,
    } = await supabaseAdmin
      .from('suppliers')
      .select(
        'id,business_name,owner_id,status,is_featured'
      )
      .eq('id', supplierId)
      .maybeSingle();

    if (supplierError) {
      return NextResponse.json(
        {
          error:
            `Erro ao buscar fornecedor: ${supplierError.message}`,
        },
        {
          status: 500,
        }
      );
    }

    if (!supplier?.id) {
      return NextResponse.json(
        {
          error:
            'Fornecedor não encontrado.',
        },
        {
          status: 404,
        }
      );
    }

    const amount =
      planConfig.amount;

    const externalReference =
      `supplier:${supplier.id}:premium:${billingPeriod}:${Date.now()}`;

    const preferencePayload = {
      items: [
        {
          id:
            `reim-premium-${billingPeriod}`,

          title:
            `REIM EVENTOS - Premium ${planConfig.label}`,

          description:
            `Plano Premium ${planConfig.label} para fornecedor REIM EVENTOS`,

          quantity: 1,

          currency_id:
            'BRL',

          unit_price:
            amount,
        },
      ],

      payer: {
        name:
          supplier.business_name ||
          'Fornecedor REIM EVENTOS',
      },

      external_reference:
        externalReference,

      back_urls: {
        success:
          `${siteUrl}/painel-fornecedor/planos?pagamento=sucesso`,

        failure:
          `${siteUrl}/painel-fornecedor/planos?pagamento=falha`,

        pending:
          `${siteUrl}/painel-fornecedor/planos?pagamento=pendente`,
      },

      auto_return:
        'approved',

      notification_url:
        `${siteUrl}/api/mercadopago/webhook`,

      metadata: {
        supplier_id:
          supplier.id,

        plan:
          'premium',

        billing_period:
          billingPeriod,

        amount,

        duration_days:
          planConfig.days,

        source:
          'reim_eventos',
      },
    };

    const mpResponse =
      await fetch(
        'https://api.mercadopago.com/checkout/preferences',
        {
          method: 'POST',

          headers: {
            Authorization:
              `Bearer ${mercadoPagoAccessToken}`,

            'Content-Type':
              'application/json',
          },

          body:
            JSON.stringify(
              preferencePayload
            ),

          cache:
            'no-store',
        }
      );

    const mpData =
      await mpResponse.json();

    if (!mpResponse.ok) {
      console.error(
        'Erro Mercado Pago ao criar preferência:',
        mpData
      );

      return NextResponse.json(
        {
          error:
            'Erro ao criar checkout no Mercado Pago.',

          details:
            mpData,
        },
        {
          status: 500,
        }
      );
    }

    const preferenceId =
      mpData.id as
        | string
        | undefined;

    const checkoutUrl =
      mpData.init_point as
        | string
        | undefined;

    if (
      !preferenceId ||
      !checkoutUrl
    ) {
      return NextResponse.json(
        {
          error:
            'Mercado Pago não retornou preference_id ou checkout_url.',
        },
        {
          status: 500,
        }
      );
    }

    const subscriptionPayload = {
      supplier_id:
        supplier.id,

      plan:
        'premium',

      status:
        'pendente',

      value:
        amount,

      billing_period:
        billingPeriod,

      mercadopago_preference_id:
        preferenceId,

      mercadopago_status:
        'pending_checkout',

      mercadopago_external_reference:
        externalReference,

      checkout_url:
        checkoutUrl,

      updated_at:
        new Date().toISOString(),
    };

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
        supplier.id
      )
      .order('created_at', {
        ascending: false,
      })
      .limit(1);

    if (existingSubscriptionError) {
      return NextResponse.json(
        {
          error:
            'Erro ao consultar assinatura do fornecedor.',
        },
        {
          status: 500,
        }
      );
    }

    const existingSubscription =
      existingSubscriptions?.[0] ||
      null;

    if (existingSubscription?.id) {
      const {
        error: updateError,
      } = await supabaseAdmin
        .from(
          'supplier_subscriptions'
        )
        .update(
          subscriptionPayload
        )
        .eq(
          'id',
          existingSubscription.id
        );

      if (updateError) {
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
        .insert(
          subscriptionPayload
        );

      if (insertError) {
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

    await schedulePendingPaymentReminder({
      supplierId:
        supplier.id,

      preferenceId,

      checkoutUrl,

      billingPeriod,

      amount,
    });

    return NextResponse.json({
      success: true,

      supplier_id:
        supplier.id,

      preference_id:
        preferenceId,

      checkout_url:
        checkoutUrl,

      plan:
        'premium',

      plan_name:
        `Premium ${planConfig.label}`,

      billing_period:
        billingPeriod,

      amount,

      duration_days:
        planConfig.days,

      reminder_scheduled_for:
        new Date(
          Date.now() +
            30 * 60 * 1000
        ).toISOString(),
    });
  } catch (error: any) {
    console.error(
      'Erro geral create-checkout:',
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          'Erro interno ao criar checkout.',
      },
      {
        status: 500,
      }
    );
  }
}
