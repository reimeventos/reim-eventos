import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendTransactionalEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL!;

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://reim-eventos.vercel.app';

function getBearerToken(request: Request) {
  const authorization =
    request.headers.get('authorization') || '';

  if (!authorization.startsWith('Bearer ')) {
    return null;
  }

  return authorization.replace('Bearer ', '').trim();
}

export async function POST(request: Request) {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        {
          error:
            'Variáveis públicas do Supabase não configuradas.',
        },
        {
          status: 500,
        }
      );
    }

    const accessToken =
      getBearerToken(request);

    if (!accessToken) {
      return NextResponse.json(
        {
          error:
            'Sessão não informada.',
        },
        {
          status: 401,
        }
      );
    }

    const supabaseAuth = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    const {
      data: userData,
      error: userError,
    } = await supabaseAuth.auth.getUser(
      accessToken
    );

    if (
      userError ||
      !userData.user
    ) {
      return NextResponse.json(
        {
          error:
            'Sessão inválida ou expirada.',
        },
        {
          status: 401,
        }
      );
    }

    const user =
      userData.user;

    if (!user.email) {
      return NextResponse.json(
        {
          error:
            'A conta autenticada não possui e-mail.',
        },
        {
          status: 400,
        }
      );
    }

    const userMetadata =
      user.user_metadata || {};

    const recipientName =
      userMetadata.full_name ||
      userMetadata.name ||
      userMetadata.nome ||
      'Usuário REIM EVENTOS';

    const result =
      await sendTransactionalEmail({
        notificationType: 'teste',

        recipientEmail:
          user.email,

        recipientName,

        userId:
          user.id,

        subject:
          'Teste de e-mail — REIM EVENTOS',

        title:
          'Seu e-mail está funcionando',

        message:
          'Este é o primeiro e-mail transacional enviado pelo REIM EVENTOS usando o domínio reimeventos.com.br. Se você recebeu esta mensagem, a integração com o Resend está funcionando corretamente.',

        buttonText:
          'Acessar REIM EVENTOS',

        buttonUrl:
          siteUrl,

        details: [
          {
            label: 'Tipo',
            value: 'Teste de integração',
          },
          {
            label: 'Remetente',
            value:
              'contato@reimeventos.com.br',
          },
          {
            label: 'Status',
            value:
              'Envio realizado',
          },
        ],

        notice:
          'Este teste não altera sua conta, plano ou pagamento.',

        metadata: {
          source:
            'api_email_test',

          tested_at:
            new Date().toISOString(),
        },

        idempotencyKey:
          `email-test-${user.id}-${Date.now()}`,
      });

    return NextResponse.json({
      success: true,

      message:
        'E-mail de teste enviado.',

      recipient:
        user.email,

      provider:
        result.provider,

      provider_message_id:
        result.providerMessageId,

      email_log_id:
        result.emailLogId,
    });
  } catch (error: any) {
    console.error(
      'Erro na rota de teste de e-mail:',
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          'Não foi possível enviar o e-mail de teste.',
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
      'Rota protegida de teste de e-mail ativa. Use POST autenticado para enviar.',
  });
}
