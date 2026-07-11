import 'server-only';

import { createClient } from '@supabase/supabase-js';
import {
  EmailNotificationType,
  sendTransactionalEmail,
} from '@/lib/email';

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

export type BillingPeriod =
  | 'mensal'
  | 'trimestral'
  | 'anual';

type SupplierRecipient = {
  supplierId: string;
  ownerId: string | null;
  recipientEmail: string;
  recipientName: string;
  businessName: string;
  phone: string;
};

type PlanActivatedParams = {
  supplierId: string;
  paymentId: string;
  preferenceId?: string | null;
  billingPeriod: BillingPeriod;
  amount: number;
  paidAt: string;
  expiresAt: string;
};

type PaymentPendingParams = {
  supplierId: string;
  preferenceId: string;
  checkoutUrl: string;
  billingPeriod: BillingPeriod;
  amount: number;
};

type ContractAcceptedParams = {
  supplierId: string;
  acceptanceId: string;
  billingPeriod: BillingPeriod;
  amount: number;
  acceptedAt: string;
  contractVersion: string;
};

type WelcomeSupplierParams = {
  supplierId: string;
};

const PLAN_CONFIG: Record<
  BillingPeriod,
  {
    label: string;
    days: number;
  }
> = {
  mensal: {
    label: 'Mensal',
    days: 30,
  },
  trimestral: {
    label: 'Trimestral',
    days: 90,
  },
  anual: {
    label: 'Anual',
    days: 365,
  },
};

function formatMoney(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(
    'pt-BR',
    {
      timeZone: 'America/Bahia',
    }
  );
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString(
    'pt-BR',
    {
      timeZone: 'America/Bahia',
      dateStyle: 'short',
      timeStyle: 'short',
    }
  );
}

async function getSupplierRecipient(
  supplierId: string
): Promise<SupplierRecipient | null> {
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
      'Central de notificações: fornecedor não encontrado.',
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

    if (authUserError) {
      console.error(
        'Central de notificações: erro ao buscar usuário.',
        authUserError
      );
    } else {
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

  if (!recipientEmail) {
    console.error(
      'Central de notificações: fornecedor sem e-mail.',
      supplierId
    );

    return null;
  }

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
    supplierId,
    ownerId,
    recipientEmail,
    recipientName,
    businessName,
    phone,
  };
}

async function notificationAlreadySent(
  notificationType: EmailNotificationType,
  metadataKey: string,
  metadataValue: string
) {
  const {
    data,
    error,
  } = await supabaseAdmin
    .from('email_notifications')
    .select('id,email_status')
    .eq(
      'notification_type',
      notificationType
    )
    .contains('metadata', {
      [metadataKey]: metadataValue,
    })
    .in('email_status', [
      'enviado',
      'enviando',
    ])
    .limit(1);

  if (error) {
    console.error(
      'Central de notificações: erro ao verificar duplicidade.',
      error
    );

    return false;
  }

  return Boolean(
    data && data.length > 0
  );
}

async function sendPlanActivated(
  params: PlanActivatedParams
) {
  const alreadySent =
    await notificationAlreadySent(
      'plano_ativado',
      'payment_id',
      params.paymentId
    );

  if (alreadySent) {
    return {
      success: true,
      skipped: true,
      reason:
        'E-mail de plano ativado já enviado.',
    };
  }

  const recipient =
    await getSupplierRecipient(
      params.supplierId
    );

  if (!recipient) {
    return {
      success: false,
      skipped: true,
      reason:
        'Fornecedor sem destinatário válido.',
    };
  }

  const planConfig =
    PLAN_CONFIG[
      params.billingPeriod
    ];

  const result =
    await sendTransactionalEmail({
      notificationType:
        'plano_ativado',

      recipientEmail:
        recipient.recipientEmail,

      recipientName:
        recipient.recipientName,

      supplierId:
        recipient.supplierId,

      userId:
        recipient.ownerId,

      subject:
        'Seu plano REIM EVENTOS foi ativado',

      title:
        'Plano Premium ativado',

      message:
        `Seu pagamento foi confirmado e o plano Premium ${planConfig.label} já está ativo. Sua vitrine foi liberada para aparecer na plataforma e receber pedidos de orçamento.`,

      buttonText:
        'Acessar painel do fornecedor',

      buttonUrl:
        `${siteUrl}/painel-fornecedor`,

      details: [
        {
          label: 'Fornecedor',
          value:
            recipient.businessName,
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
          value: 'Aprovado',
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
        'Guarde este e-mail como comprovante da ativação do plano. Para atendimento, responda para contato@reimeventos.com.br.',

      metadata: {
        source:
          'notification_center',

        event:
          'plan_activated',

        payment_id:
          params.paymentId,

        preference_id:
          params.preferenceId || null,

        billing_period:
          params.billingPeriod,

        amount:
          params.amount,

        paid_at:
          params.paidAt,

        expires_at:
          params.expiresAt,

        supplier_business_name:
          recipient.businessName,

        phone:
          recipient.phone || null,
      },

      idempotencyKey:
        `plano-ativado-${params.paymentId}`,
    });

  return {
    ...result,
    skipped: false,
  };
}

async function sendPaymentPendingReminder(
  params: PaymentPendingParams
) {
  const alreadySent =
    await notificationAlreadySent(
      'pagamento_pendente',
      'preference_id',
      params.preferenceId
    );

  if (alreadySent) {
    return {
      success: true,
      skipped: true,
      reason:
        'Lembrete de pagamento já enviado.',
    };
  }

  const recipient =
    await getSupplierRecipient(
      params.supplierId
    );

  if (!recipient) {
    return {
      success: false,
      skipped: true,
      reason:
        'Fornecedor sem destinatário válido.',
    };
  }

  const planConfig =
    PLAN_CONFIG[
      params.billingPeriod
    ];

  const result =
    await sendTransactionalEmail({
      notificationType:
        'pagamento_pendente',

      recipientEmail:
        recipient.recipientEmail,

      recipientName:
        recipient.recipientName,

      supplierId:
        recipient.supplierId,

      userId:
        recipient.ownerId,

      subject:
        'Seu pagamento REIM EVENTOS ainda está pendente',

      title:
        'Conclua a ativação do seu plano',

      message:
        `Identificamos que a contratação do plano Premium ${planConfig.label} ainda não foi concluída. Caso deseje continuar, utilize o botão abaixo para retornar ao pagamento.`,

      buttonText:
        'Continuar pagamento',

      buttonUrl:
        params.checkoutUrl,

      details: [
        {
          label: 'Fornecedor',
          value:
            recipient.businessName,
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
          label: 'Validade',
          value:
            `${planConfig.days} dias após a aprovação`,
        },
        {
          label: 'Status',
          value:
            'Pagamento pendente',
        },
      ],

      notice:
        'Caso você tenha desistido da contratação, basta ignorar esta mensagem. Nenhuma cobrança será realizada automaticamente.',

      metadata: {
        source:
          'notification_center',

        event:
          'payment_pending',

        preference_id:
          params.preferenceId,

        billing_period:
          params.billingPeriod,

        amount:
          params.amount,

        checkout_url:
          params.checkoutUrl,

        supplier_business_name:
          recipient.businessName,

        phone:
          recipient.phone || null,
      },

      idempotencyKey:
        `pagamento-pendente-${params.preferenceId}`,
    });

  return {
    ...result,
    skipped: false,
  };
}

async function sendContractAccepted(
  params: ContractAcceptedParams
) {
  const alreadySent =
    await notificationAlreadySent(
      'contrato_aceito',
      'acceptance_id',
      params.acceptanceId
    );

  if (alreadySent) {
    return {
      success: true,
      skipped: true,
      reason:
        'E-mail de contrato aceito já enviado.',
    };
  }

  const recipient =
    await getSupplierRecipient(
      params.supplierId
    );

  if (!recipient) {
    return {
      success: false,
      skipped: true,
      reason:
        'Fornecedor sem destinatário válido.',
    };
  }

  const planConfig =
    PLAN_CONFIG[
      params.billingPeriod
    ];

  const result =
    await sendTransactionalEmail({
      notificationType:
        'contrato_aceito',

      recipientEmail:
        recipient.recipientEmail,

      recipientName:
        recipient.recipientName,

      supplierId:
        recipient.supplierId,

      userId:
        recipient.ownerId,

      subject:
        'Contrato do Fornecedor aceito — REIM EVENTOS',

      title:
        'Contrato aceito com sucesso',

      message:
        'Registramos seu aceite eletrônico do Contrato do Fornecedor e dos Termos de Uso do REIM EVENTOS.',

      buttonText:
        'Ler Contrato do Fornecedor',

      buttonUrl:
        `${siteUrl}/contrato-fornecedor`,

      details: [
        {
          label: 'Fornecedor',
          value:
            recipient.businessName,
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
          label: 'Versão',
          value:
            params.contractVersion,
        },
        {
          label: 'Aceito em',
          value:
            formatDateTime(
              params.acceptedAt
            ),
        },
      ],

      notice:
        'Este registro confirma o aceite eletrônico realizado antes do processo de pagamento.',

      metadata: {
        source:
          'notification_center',

        event:
          'contract_accepted',

        acceptance_id:
          params.acceptanceId,

        contract_version:
          params.contractVersion,

        billing_period:
          params.billingPeriod,

        amount:
          params.amount,

        accepted_at:
          params.acceptedAt,

        supplier_business_name:
          recipient.businessName,
      },

      idempotencyKey:
        `contrato-aceito-${params.acceptanceId}`,
    });

  return {
    ...result,
    skipped: false,
  };
}

async function sendWelcomeSupplier(
  params: WelcomeSupplierParams
) {
  const alreadySent =
    await notificationAlreadySent(
      'boas_vindas_fornecedor',
      'supplier_id',
      params.supplierId
    );

  if (alreadySent) {
    return {
      success: true,
      skipped: true,
      reason:
        'E-mail de boas-vindas já enviado.',
    };
  }

  const recipient =
    await getSupplierRecipient(
      params.supplierId
    );

  if (!recipient) {
    return {
      success: false,
      skipped: true,
      reason:
        'Fornecedor sem destinatário válido.',
    };
  }

  const result =
    await sendTransactionalEmail({
      notificationType:
        'boas_vindas_fornecedor',

      recipientEmail:
        recipient.recipientEmail,

      recipientName:
        recipient.recipientName,

      supplierId:
        recipient.supplierId,

      userId:
        recipient.ownerId,

      subject:
        'Bem-vindo ao REIM EVENTOS',

      title:
        'Sua empresa chegou ao REIM EVENTOS',

      message:
        'Seu cadastro de fornecedor foi criado. Complete sua vitrine, adicione fotos e vídeos e mantenha suas informações atualizadas para apresentar seus serviços aos clientes.',

      buttonText:
        'Acessar painel do fornecedor',

      buttonUrl:
        `${siteUrl}/painel-fornecedor`,

      details: [
        {
          label: 'Fornecedor',
          value:
            recipient.businessName,
        },
        {
          label: 'E-mail',
          value:
            recipient.recipientEmail,
        },
        {
          label: 'Status',
          value:
            'Cadastro realizado',
        },
      ],

      notice:
        'Para aparecer publicamente e receber pedidos de orçamento, será necessário possuir teste grátis ou plano ativo.',

      metadata: {
        source:
          'notification_center',

        event:
          'supplier_welcome',

        supplier_id:
          params.supplierId,

        supplier_business_name:
          recipient.businessName,
      },

      idempotencyKey:
        `boas-vindas-fornecedor-${params.supplierId}`,
    });

  return {
    ...result,
    skipped: false,
  };
}

export const NotificationCenter = {
  planActivated:
    sendPlanActivated,

  paymentPendingReminder:
    sendPaymentPendingReminder,

  contractAccepted:
    sendContractAccepted,

  welcomeSupplier:
    sendWelcomeSupplier,
};
