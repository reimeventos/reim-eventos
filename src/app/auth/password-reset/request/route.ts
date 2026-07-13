import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendTransactionalEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL!;

const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY!;

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

type PasswordResetRequestBody = {
  email?: string;
};

function normalizeEmail(value: string) {
  return String(value || '')
    .trim()
    .toLowerCase();
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    value
  );
}

async function findUserProfile(email: string) {
  const {
    data: supplierAcceptance,
  } = await supabaseAdmin
    .from('supplier_contract_acceptances')
    .select(
      'user_id,accepted_by_name,accepted_by_email,supplier_id,supplier_business_name'
    )
    .eq(
      'accepted_by_email',
      email
    )
    .order('accepted_at', {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  if (supplierAcceptance?.user_id) {
    return {
      userId:
        supplierAcceptance.user_id,

      supplierId:
        supplierAcceptance.supplier_id ||
        null,

      recipientName:
        supplierAcceptance.accepted_by_name ||
        supplierAcceptance.supplier_business_name ||
        'Usuário REIM EVENTOS',
    };
  }

  const {
    data: suppliers,
  } = await supabaseAdmin
    .from('suppliers')
    .select(
      'id,owner_id,business_name,email,contact_email,responsible_name,contact_name'
    )
    .or(
      `email.eq.${email},contact_email.eq.${email}`
    )
    .limit(1);

  const supplier =
    suppliers?.[0] || null;

  if (supplier) {
    return {
      userId:
        supplier.owner_id || null,

      supplierId:
        supplier.id,

      recipientName:
        supplier.responsible_name ||
        supplier.contact_name ||
        supplier.business_name ||
        'Fornecedor REIM EVENTOS',
    };
  }

  return {
    userId: null,
    supplierId: null,
    recipientName:
      'Usuário REIM EVENTOS',
  };
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

    const body =
      (await request.json()) as PasswordResetRequestBody;

    const email =
      normalizeEmail(
        body?.email || ''
      );

    if (!isValidEmail(email)) {
      return NextResponse.json(
        {
          error:
            'Informe um endereço de e-mail válido.',
        },
        {
          status: 400,
        }
      );
    }

    const redirectTo =
      `${siteUrl}/redefinir-senha`;

    const {
      data: linkData,
      error: linkError,
    } =
      await supabaseAdmin.auth.admin.generateLink(
        {
          type: 'recovery',

          email,

          options: {
            redirectTo,
          },
        }
      );

    /*
     * Para evitar revelar se um e-mail possui ou não cadastro,
     * a resposta pública será sempre genérica.
     */
    if (
      linkError ||
      !linkData?.properties?.action_link
    ) {
      console.error(
        'Solicitação de recuperação sem link válido:',
        linkError
      );

      return NextResponse.json({
        success: true,

        message:
          'Se este e-mail estiver cadastrado, você receberá as instruções para redefinir sua senha.',
      });
    }

    const actionLink =
      linkData.properties.action_link;

    const profile =
      await findUserProfile(email);

    try {
      await sendTransactionalEmail({
        notificationType:
          'recuperacao_senha',

        recipientEmail:
          email,

        recipientName:
          profile.recipientName,

        supplierId:
          profile.supplierId,

        userId:
          profile.userId,

        subject:
          'Redefinição de senha — REIM EVENTOS',

        title:
          'Redefina sua senha',

        message:
          'Recebemos uma solicitação para redefinir a senha da sua conta no REIM EVENTOS. Use o botão abaixo para criar uma nova senha.',

        buttonText:
          'Criar nova senha',

        buttonUrl:
          actionLink,

        details: [
          {
            label: 'Conta',
            value: email,
          },
          {
            label: 'Solicitação',
            value:
              'Redefinição de senha',
          },
          {
            label: 'Segurança',
            value:
              'Link de uso restrito',
          },
        ],

        notice:
          'Se você não solicitou esta alteração, ignore este e-mail e sua senha continuará a mesma.',

        metadata: {
          source:
            'password_reset_request',

          email,

          requested_at:
            new Date().toISOString(),

          redirect_to:
            redirectTo,
        },

        idempotencyKey:
          `password-reset-${email}-${Date.now()}`,
      });
    } catch (emailError) {
      console.error(
        'Link de recuperação criado, mas o e-mail falhou:',
        emailError
      );

      return NextResponse.json(
        {
          error:
            'Não foi possível enviar o e-mail de recuperação agora. Tente novamente em alguns minutos.',
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,

      message:
        'Se este e-mail estiver cadastrado, você receberá as instruções para redefinir sua senha.',
    });
  } catch (error: any) {
    console.error(
      'Erro na recuperação de senha:',
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          'Não foi possível solicitar a redefinição de senha.',
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
      'Rota de solicitação de recuperação de senha ativa.',
  });
}
