import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const mercadoPagoAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN!;
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://reim-eventos.vercel.app';

const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceRoleKey
);

type CreateCheckoutBody = {
  supplier_id?: string;
};

export async function POST(request: Request) {
  try {
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return NextResponse.json(
        {
          error: 'Variáveis do Supabase não configuradas.',
        },
        {
          status: 500,
        }
      );
    }

    if (!mercadoPagoAccessToken) {
      return NextResponse.json(
        {
          error: 'MERCADOPAGO_ACCESS_TOKEN não configurado.',
        },
        {
          status: 500,
        }
      );
    }

    const body = (await request.json()) as CreateCheckoutBody;

    const supplierId = body?.supplier_id;

    if (!supplierId) {
      return NextResponse.json(
        {
          error: 'supplier_id é obrigatório.',
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Busca o fornecedor usando somente campos que sabemos
     * que existem na tabela suppliers do REIM EVENTOS.
     */
    const {
      data: supplier,
      error: supplierError,
    } = await supabaseAdmin
      .from('suppliers')
      .select('id,business_name,owner_id,status,is_featured')
      .eq('id', supplierId)
      .maybeSingle();

    if (supplierError) {
      console.error(
        'Erro do Supabase ao buscar fornecedor:',
        supplierError
      );

      return NextResponse.json(
        {
          error: `Erro ao buscar fornecedor: ${supplierError.message}`,
        },
        {
          status: 500,
        }
      );
    }

    if (!supplier?.id) {
      console.error(
        'Fornecedor não encontrado para supplier_id:',
        supplierId
      );

      return NextResponse.json(
        {
          error: 'Fornecedor não encontrado.',
        },
        {
          status: 404,
        }
      );
    }

    const planName = 'Premium Mensal';

    const amount = 5;

    const externalReference =
      `supplier:${supplier.id}:premium_mensal:${Date.now()}`;

    const preferencePayload = {
      items: [
        {
          id: 'reim-premium-mensal',
          title: 'REIM EVENTOS - Premium Mensal',
          description:
            'Plano Premium Mensal para fornecedor REIM EVENTOS',
          quantity: 1,
          currency_id: 'BRL',
          unit_price: amount,
        },
      ],

      payer: {
        name:
          supplier.business_name ||
          'Fornecedor REIM EVENTOS',
      },

      external_reference: externalReference,

      back_urls: {
        success:
          `${siteUrl}/painel-fornecedor/planos?pagamento=sucesso`,

        failure:
          `${siteUrl}/painel-fornecedor/planos?pagamento=falha`,

        pending:
          `${siteUrl}/painel-fornecedor/planos?pagamento=pendente`,
      },

      auto_return: 'approved',

      notification_url:
        `${siteUrl}/api/mercadopago/webhook`,

      metadata: {
        supplier_id: supplier.id,
        plan: 'premium_mensal',
        source: 'reim_eventos',
      },
    };

    const mpResponse = await fetch(
      'https://api.mercadopago.com/checkout/preferences',
      {
        method: 'POST',

        headers: {
          Authorization:
            `Bearer ${mercadoPagoAccessToken}`,

          'Content-Type': 'application/json',
        },

        body: JSON.stringify(preferencePayload),
      }
    );

    const mpData = await mpResponse.json();

    if (!mpResponse.ok) {
      console.error(
        'Erro Mercado Pago ao criar preferência:',
        mpData
      );

      return NextResponse.json(
        {
          error:
            'Erro ao criar checkout no Mercado Pago.',

          details: mpData,
        },
        {
          status: 500,
        }
      );
    }

    const preferenceId =
      mpData.id as string | undefined;

    const checkoutUrl =
      mpData.init_point as string | undefined;

    if (!preferenceId || !checkoutUrl) {
      return NextResponse.json(
        {
          error:
            'Mercado Pago não retornou preference_id ou checkout_url.',

          details: mpData,
        },
        {
          status: 500,
        }
      );
    }

    /*
     * Aqui apenas registramos que o checkout foi criado.
     * O plano NÃO fica ativo ainda.
     *
     * A ativação acontece somente quando o webhook
     * receber confirmação de pagamento approved.
     */
    const subscriptionPayload = {
      supplier_id: supplier.id,

      plan: 'premium',

      status: 'pendente',

      value: amount,

      billing_period: 'mensal',

      mercadopago_preference_id: preferenceId,

      mercadopago_status: 'pending_checkout',

      mercadopago_external_reference:
        externalReference,

      checkout_url: checkoutUrl,

      updated_at: new Date().toISOString(),
    };

    const {
      data: existingSubscriptions,
      error: existingSubscriptionError,
    } = await supabaseAdmin
      .from('supplier_subscriptions')
      .select('id')
      .eq('supplier_id', supplier.id)
      .order('created_at', {
        ascending: false,
      })
      .limit(1);

    if (existingSubscriptionError) {
      console.error(
        'Erro ao consultar assinatura existente:',
        existingSubscriptionError
      );

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
      existingSubscriptions?.[0] || null;

    if (existingSubscription?.id) {
      const {
        error: updateError,
      } = await supabaseAdmin
        .from('supplier_subscriptions')
        .update(subscriptionPayload)
        .eq('id', existingSubscription.id);

      if (updateError) {
        console.error(
          'Erro ao atualizar assinatura:',
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
        .insert(subscriptionPayload);

      if (insertError) {
        console.error(
          'Erro ao criar assinatura:',
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

    return NextResponse.json({
      success: true,

      supplier_id: supplier.id,

      preference_id: preferenceId,

      checkout_url: checkoutUrl,

      plan: planName,

      amount,
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
