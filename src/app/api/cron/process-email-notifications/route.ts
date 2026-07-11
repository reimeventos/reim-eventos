import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendTransactionalEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL!;

const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY!;

const cronSecret =
  process.env.CRON_SECRET!;

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

const PLAN_CONFIG: Record<
  BillingPeriod,
  {
    label: string;
    amount: number;
    days: number;
  }
> = {
  mensal: {
    label: 'Mensal',
    amount: 25,
    days: 30,
  },

  trimestral: {
    label: 'Trimestral',
    amount: 65,
    days: 90,
  },

  anual: {
    label: 'Anual',
    amount: 250,
    days: 365,
  },
};

function formatMoney(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function getAuthorizationToken(
  request: Request
) {
  const authorization =
    request.headers.get('authorization') || '';

  if (!authorization.startsWith('Bearer ')) {
    return '';
  }

  return authorization
    .replace('Bearer ', '')
    .trim();
}

function getBillingPeriod(
  value: unknown
): BillingPeriod {
  if (value === 'trimestral') {
    return 'trimestral';
  }

  if (value === 'anual') {
    return 'anual';
  }

  return 'mensal';
}

async function updateScheduledNotification(
  notificationId: string,
  payload: Record<string, unknown>
) {
  const { error } = await supabaseAdmin
    .from('email_notifications')
    .update(payload)
    .eq('id', notificationId);

  if (error) {
    console.error(
      'Erro ao atualizar lembrete agendado:',
      error
    );
  }
}

async function processPendingReminders() {
  const now =
    new Date().toISOString();

  const {
    data: scheduledNotifications,
    error: scheduledError,
  } = await supabaseAdmin
    .from('email_notifications')
    .select('*')
    .eq(
      'notification_type',
      'pagamento_pendente'
    )
    .eq(
      'email_status',
      'pendente'
    )
    .lte(
      'scheduled_for',
      now
    )
    .order(
      'scheduled_for',
      {
        ascending: true,
      }
    )
    .limit(50);

  if (scheduledError) {
    throw new Error(
      `Erro ao buscar lembretes pendentes: ${scheduledError.message}`
    );
  }

  const results: Array<{
    notification_id: string;
    status: string;
    reason?: string;
    email_log_id?: string;
  }> = [];

  for (
    const notification of
    scheduledNotifications || []
  ) {
    try {
      const metadata =
        notification.metadata || {};

      const preferenceId =
        metadata.preference_id || '';

      const checkoutUrl =
        metadata.checkout_url || '';

      const billingPeriod =
        getBillingPeriod(
          metadata.billing_period
        );

      const planConfig =
        PLAN_CONFIG[
          billingPeriod
        ];

      const amount =
        Number(
          metadata.amount ||
            planConfig.amount
        );

      if (!preferenceId) {
        await updateScheduledNotification(
          notification.id,
          {
            email_status:
              'cancelado',

            error_message:
              'Lembrete sem preference_id.',

            metadata: {
              ...metadata,

              cancellation_reason:
                'missing_preference_id',

              processed_at:
                new Date().toISOString(),
            },
          }
        );

        results.push({
          notification_id:
            notification.id,

          status:
            'cancelado',

          reason:
            'Sem preference_id',
        });

        continue;
      }

      const {
        data: subscriptions,
        error: subscriptionError,
      } = await supabaseAdmin
        .from(
          'supplier_subscriptions'
        )
        .select(
          'id,status,mercadopago_status,mercadopago_payment_id,mercadopago_preference_id'
        )
        .eq(
          'mercadopago_preference_id',
          preferenceId
        )
        .order(
          'created_at',
          {
            ascending: false,
          }
        )
        .limit(1);

      if (subscriptionError) {
        throw new Error(
          subscriptionError.message
        );
      }

      const subscription =
        subscriptions?.[0] || null;

      if (!subscription) {
        await updateScheduledNotification(
          notification.id,
          {
            email_status:
              'cancelado',

            error_message:
              'Assinatura não encontrada para a preferência.',

            metadata: {
              ...metadata,

              cancellation_reason:
                'subscription_not_found',

              processed_at:
                new Date().toISOString(),
            },
          }
        );

        results.push({
          notification_id:
            notification.id,

          status:
            'cancelado',

          reason:
            'Assinatura não encontrada',
        });

        continue;
      }

      const paymentWasApproved =
        subscription.status ===
          'ativo' ||
        subscription.mercadopago_status ===
          'approved' ||
        Boolean(
          subscription
            .mercadopago_payment_id
        );

      if (paymentWasApproved) {
        await updateScheduledNotification(
          notification.id,
          {
            email_status:
              'cancelado',

            error_message:
              null,

            metadata: {
              ...metadata,

              cancellation_reason:
                'payment_approved',

              processed_at:
                new Date().toISOString(),
            },
          }
        );

        results.push({
          notification_id:
            notification.id,

          status:
            'cancelado',

          reason:
            'Pagamento já aprovado',
        });

        continue;
      }

      const isStillPending =
        subscription.status ===
          'pendente' &&
        (
          subscription.mercadopago_status ===
            'pending_checkout' ||
          subscription.mercadopago_status ===
            'pending' ||
          !subscription.mercadopago_status
        );

      if (!isStillPending) {
        await updateScheduledNotification(
          notification.id,
          {
            email_status:
              'cancelado',

            error_message:
              null,

            metadata: {
              ...metadata,

              cancellation_reason:
                'subscription_not_pending',

              processed_at:
                new Date().toISOString(),

              subscription_status:
                subscription.status,

              mercadopago_status:
                subscription.mercadopago_status,
            },
          }
        );

        results.push({
          notification_id:
            notification.id,

          status:
            'cancelado',

          reason:
            'Assinatura não está pendente',
        });

        continue;
      }

      if (!checkoutUrl) {
        await updateScheduledNotification(
          notification.id,
          {
            email_status:
              'falhou',

            error_message:
              'Checkout sem URL de pagamento.',

            failed_at:
              new Date().toISOString(),

            metadata: {
              ...metadata,

              processed_at:
                new Date().toISOString(),
            },
          }
        );

        results.push({
          notification_id:
            notification.id,

          status:
            'falhou',

          reason:
            'Checkout sem URL',
        });

        continue;
      }

      const emailResult =
        await sendTransactionalEmail({
          notificationType:
            'pagamento_pendente',

          recipientEmail:
            notification.recipient_email,

          recipientName:
            notification.recipient_name,

          supplierId:
            notification.supplier_id,

          userId:
            notification.user_id,

          subject:
            'Seu pagamento REIM EVENTOS ainda está pendente',

          title:
            'Conclua a ativação do seu plano',

          message:
            `Identificamos que a contratação do plano Premium ${planConfig.label} ainda não foi concluída. Caso deseje continuar, utilize o botão abaixo para retornar ao pagamento.`,

          buttonText:
            'Continuar pagamento',

          buttonUrl:
            checkoutUrl,

          details: [
            {
              label:
                'Fornecedor',

              value:
                metadata
                  .supplier_business_name ||
                'Fornecedor REIM EVENTOS',
            },

            {
              label:
                'Plano',

              value:
                `Premium ${planConfig.label}`,
            },

            {
              label:
                'Valor',

              value:
                formatMoney(
                  amount
                ),
            },

            {
              label:
                'Validade',

              value:
                `${planConfig.days} dias após a aprovação`,
            },

            {
              label:
                'Status',

              value:
                'Pagamento pendente',
            },
          ],

          notice:
            'Caso você tenha desistido da contratação, basta ignorar esta mensagem. Nenhuma cobrança será realizada automaticamente.',

          metadata: {
            source:
              'scheduled_payment_reminder',

            scheduled_notification_id:
              notification.id,

            preference_id:
              preferenceId,

            billing_period:
              billingPeriod,

            amount,

            checkout_url:
              checkoutUrl,
          },

          idempotencyKey:
            `pagamento-pendente-${preferenceId}`,
        });

      await updateScheduledNotification(
        notification.id,
        {
          email_status:
            'enviado',

          provider:
            emailResult.provider,

          provider_message_id:
            emailResult.providerMessageId,

          sent_at:
            new Date().toISOString(),

          error_message:
            null,

          metadata: {
            ...metadata,

            processed_at:
              new Date().toISOString(),

            sent_email_log_id:
              emailResult.emailLogId,

            processing_result:
              'reminder_sent',
          },
        }
      );

      results.push({
        notification_id:
          notification.id,

        status:
          'enviado',

        email_log_id:
          emailResult.emailLogId,
      });
    } catch (error: any) {
      console.error(
        'Erro ao processar lembrete:',
        notification.id,
        error
      );

      await updateScheduledNotification(
        notification.id,
        {
          email_status:
            'falhou',

          error_message:
            error?.message ||
            'Erro inesperado ao processar lembrete.',

          failed_at:
            new Date().toISOString(),

          metadata: {
            ...(notification.metadata ||
              {}),

            processed_at:
              new Date().toISOString(),
          },
        }
      );

      results.push({
        notification_id:
          notification.id,

        status:
          'falhou',

        reason:
          error?.message ||
          'Erro inesperado',
      });
    }
  }

  return {
    found:
      scheduledNotifications?.length ||
      0,

    processed:
      results.length,

    results,
  };
}

export async function GET(
  request: Request
) {
  try {
    if (!cronSecret) {
      return NextResponse.json(
        {
          error:
            'CRON_SECRET não configurada.',
        },
        {
          status: 500,
        }
      );
    }

    const suppliedToken =
      getAuthorizationToken(
        request
      );

    if (
      !suppliedToken ||
      suppliedToken !== cronSecret
    ) {
      return NextResponse.json(
        {
          error:
            'Acesso não autorizado.',
        },
        {
          status: 401,
        }
      );
    }

    const result =
      await processPendingReminders();

    return NextResponse.json({
      success: true,

      executed_at:
        new Date().toISOString(),

      ...result,
    });
  } catch (error: any) {
    console.error(
      'Erro na rotina de e-mails:',
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          'Erro ao processar notificações de e-mail.',
      },
      {
        status: 500,
      }
    );
  }
}
