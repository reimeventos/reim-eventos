import 'server-only';

import { createClient } from '@supabase/supabase-js';
import { createEmailTemplate } from '@/lib/email-template';

const RESEND_API_URL = 'https://api.resend.com/emails';

const FROM_EMAIL =
  'REIM EVENTOS <contato@reimeventos.com.br>';

const SUPPORT_EMAIL =
  'contato@reimeventos.com.br';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://reim-eventos.vercel.app';

export type EmailNotificationType =
  | 'boas_vindas_cliente'
  | 'boas_vindas_fornecedor'
  | 'contrato_aceito'
  | 'pagamento_pendente'
  | 'pagamento_aprovado'
  | 'plano_ativado'
  | 'plano_vencendo'
  | 'plano_expirado'
  | 'recuperacao_senha'
  | 'suporte'
  | 'teste';

type EmailDetail = {
  label: string;
  value: string;
};

export type SendTransactionalEmailParams = {
  notificationType: EmailNotificationType;

  recipientEmail: string;

  recipientName?: string | null;

  subject: string;

  title: string;

  message: string;

  buttonText?: string;

  buttonUrl?: string;

  details?: EmailDetail[];

  notice?: string;

  supplierId?: string | null;

  userId?: string | null;

  metadata?: Record<string, unknown>;

  idempotencyKey?: string;
};

type ResendSuccessResponse = {
  id?: string;
};

type ResendErrorResponse = {
  message?: string;
  name?: string;
  statusCode?: number;
};

function getSupabaseAdmin() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL não configurada.'
    );
  }

  if (!serviceRoleKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY não configurada.'
    );
  }

  return createClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

function validateEmail(email: string) {
  const normalizedEmail =
    String(email || '')
      .trim()
      .toLowerCase();

  const emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(normalizedEmail)) {
    throw new Error(
      'Endereço de e-mail inválido.'
    );
  }

  return normalizedEmail;
}

function createPlainText(params: {
  recipientName?: string | null;
  title: string;
  message: string;
  details?: EmailDetail[];
  buttonText?: string;
  buttonUrl?: string;
  notice?: string;
}) {
  const lines: string[] = [];

  lines.push(
    params.recipientName
      ? `Olá, ${params.recipientName}!`
      : 'Olá!'
  );

  lines.push('');
  lines.push(params.title);
  lines.push('');
  lines.push(params.message);

  if (params.details?.length) {
    lines.push('');

    params.details.forEach((item) => {
      lines.push(
        `${item.label}: ${item.value}`
      );
    });
  }

  if (
    params.buttonText &&
    params.buttonUrl
  ) {
    lines.push('');
    lines.push(params.buttonText);
    lines.push(params.buttonUrl);
  }

  if (params.notice) {
    lines.push('');
    lines.push(params.notice);
  }

  lines.push('');
  lines.push('REIM EVENTOS');
  lines.push(
    'Todos os fornecedores do seu evento em um só lugar.'
  );
  lines.push('');
  lines.push(
    `Atendimento: ${SUPPORT_EMAIL}`
  );
  lines.push(
    `Termos de Uso: ${SITE_URL}/termos`
  );
  lines.push(
    `Política de Privacidade: ${SITE_URL}/privacidade`
  );

  return lines.join('\n');
}

async function createEmailLog(
  params: SendTransactionalEmailParams,
  recipientEmail: string
) {
  const supabaseAdmin =
    getSupabaseAdmin();

  const {
    data,
    error,
  } = await supabaseAdmin
    .from('email_notifications')
    .insert({
      supplier_id:
        params.supplierId || null,

      user_id:
        params.userId || null,

      notification_type:
        params.notificationType,

      recipient_email:
        recipientEmail,

      recipient_name:
        params.recipientName || null,

      subject:
        params.subject,

      email_status:
        'pendente',

      provider:
        'resend',

      metadata: {
        ...(params.metadata || {}),

        button_text:
          params.buttonText || null,

        button_url:
          params.buttonUrl || null,

        idempotency_key:
          params.idempotencyKey || null,
      },
    })
    .select('id')
    .single();

  if (error) {
    console.error(
      'Erro ao criar histórico de e-mail:',
      error
    );

    throw new Error(
      `Não foi possível registrar o e-mail: ${error.message}`
    );
  }

  return {
    supabaseAdmin,
    emailLogId: data.id as string,
  };
}

async function updateEmailLog(
  emailLogId: string,
  payload: Record<string, unknown>
) {
  try {
    const supabaseAdmin =
      getSupabaseAdmin();

    const { error } = await supabaseAdmin
      .from('email_notifications')
      .update(payload)
      .eq('id', emailLogId);

    if (error) {
      console.error(
        'Erro ao atualizar histórico de e-mail:',
        error
      );
    }
  } catch (error) {
    console.error(
      'Erro inesperado ao atualizar histórico de e-mail:',
      error
    );
  }
}

export async function sendTransactionalEmail(
  params: SendTransactionalEmailParams
) {
  const resendApiKey =
    process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    throw new Error(
      'RESEND_API_KEY não configurada.'
    );
  }

  const recipientEmail =
    validateEmail(params.recipientEmail);

  const {
    emailLogId,
  } = await createEmailLog(
    params,
    recipientEmail
  );

  try {
    await updateEmailLog(
      emailLogId,
      {
        email_status: 'enviando',
        error_message: null,
        failed_at: null,
      }
    );

    const html =
      createEmailTemplate({
        title: params.title,

        recipientName:
          params.recipientName || undefined,

        message:
          params.message,

        buttonText:
          params.buttonText,

        buttonUrl:
          params.buttonUrl,

        details:
          params.details,

        notice:
          params.notice,
      });

    const text =
      createPlainText({
        recipientName:
          params.recipientName,

        title:
          params.title,

        message:
          params.message,

        details:
          params.details,

        buttonText:
          params.buttonText,

        buttonUrl:
          params.buttonUrl,

        notice:
          params.notice,
      });

    const headers: Record<
      string,
      string
    > = {
      Authorization:
        `Bearer ${resendApiKey}`,

      'Content-Type':
        'application/json',
    };

    if (params.idempotencyKey) {
      headers[
        'Idempotency-Key'
      ] = params.idempotencyKey;
    }

    const response = await fetch(
      RESEND_API_URL,
      {
        method: 'POST',

        headers,

        body: JSON.stringify({
          from: FROM_EMAIL,

          to: [
            recipientEmail,
          ],

          reply_to:
            SUPPORT_EMAIL,

          subject:
            params.subject,

          html,

          text,
        }),

        cache: 'no-store',
      }
    );

    const responseData =
      (await response.json()) as
        | ResendSuccessResponse
        | ResendErrorResponse;

    if (!response.ok) {
      const resendError =
        responseData as ResendErrorResponse;

      const errorMessage =
        resendError.message ||
        'O Resend recusou o envio do e-mail.';

      await updateEmailLog(
        emailLogId,
        {
          email_status:
            'falhou',

          error_message:
            errorMessage,

          failed_at:
            new Date().toISOString(),

          metadata: {
            ...(params.metadata || {}),

            resend_error:
              responseData,

            idempotency_key:
              params.idempotencyKey ||
              null,
          },
        }
      );

      throw new Error(
        errorMessage
      );
    }

    const successData =
      responseData as ResendSuccessResponse;

    await updateEmailLog(
      emailLogId,
      {
        email_status:
          'enviado',

        provider:
          'resend',

        provider_message_id:
          successData.id || null,

        sent_at:
          new Date().toISOString(),

        failed_at:
          null,

        error_message:
          null,

        metadata: {
          ...(params.metadata || {}),

          resend_response:
            responseData,

          idempotency_key:
            params.idempotencyKey ||
            null,
        },
      }
    );

    return {
      success: true,

      emailLogId,

      provider:
        'resend',

      providerMessageId:
        successData.id || null,

      recipientEmail,
    };
  } catch (error: any) {
    const errorMessage =
      error?.message ||
      'Erro inesperado ao enviar e-mail.';

    await updateEmailLog(
      emailLogId,
      {
        email_status:
          'falhou',

        error_message:
          errorMessage,

        failed_at:
          new Date().toISOString(),
      }
    );

    console.error(
      'Erro ao enviar e-mail pelo Resend:',
      error
    );

    throw new Error(
      errorMessage
    );
  }
}
