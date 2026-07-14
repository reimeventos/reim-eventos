'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Crown,
  ExternalLink,
  FileText,
  Loader2,
  ShieldCheck,
  Sparkles,
  Star,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

type PlanKey = 'teste_7_dias' | 'premium';
type BillingPeriod = 'mensal' | 'trimestral' | 'anual';

const CONTRACT_VERSION = '1.0';

const billingOptions: {
  key: BillingPeriod;
  label: string;
  shortLabel: string;
  days: number;
  value: number;
}[] = [
  {
    key: 'mensal',
    label: 'Mensal',
    shortLabel: '30 dias',
    days: 30,
    value: 25,
  },
  {
    key: 'trimestral',
    label: 'Trimestral',
    shortLabel: '90 dias',
    days: 90,
    value: 65,
  },
  {
    key: 'anual',
    label: 'Anual',
    shortLabel: '365 dias',
    days: 365,
    value: 250,
  },
];

const planPrices: Record<
  Exclude<PlanKey, 'teste_7_dias'>,
  Record<BillingPeriod, number>
> = {
  premium: {
    mensal: 25,
    trimestral: 65,
    anual: 250,
  },
};

const plans: {
  key: PlanKey;
  name: string;
  statusOnRequest: 'teste' | 'pendente';
  highlight: string;
  icon: any;
  badge?: string;
  features: string[];
}[] = [
  {
    key: 'teste_7_dias',
    name: 'Teste grátis',
    statusOnRequest: 'teste',
    highlight: 'Para fornecedores conhecerem a plataforma',
    icon: Star,
    features: [
      'Vitrine liberada por 7 dias',
      'Receber pedidos de orçamento',
      'Responder propostas',
      'Chat com clientes',
      'Fotos e vídeos para testar a vitrine',
    ],
  },
  {
    key: 'premium',
    name: 'Premium Destaque',
    statusOnRequest: 'pendente',
    highlight: 'Plano completo para ter mais visibilidade',
    icon: Crown,
    badge: 'Mais completo',
    features: [
      'Fornecedor ativo na busca pública',
      'Destaque na vitrine do REIM EVENTOS',
      'Selo Premium na vitrine',
      'Recebimento de pedidos de orçamento',
      'Galeria de fotos e vídeos',
      'Painel de leads',
      'Chat com clientes',
    ],
  },
];

function getPlanLabel(plan?: string) {
  if (plan === 'premium') return 'Premium Destaque';

  if (plan === 'teste_7_dias' || plan === 'gratuito') {
    return 'Teste grátis';
  }

  return 'Sem plano';
}

function getStatusLabel(status?: string) {
  if (status === 'ativo') return 'Ativo';
  if (status === 'teste') return 'Teste 7 dias';
  if (status === 'pendente') return 'Pendente';
  if (status === 'cancelado') return 'Cancelado';
  if (status === 'expirado') return 'Expirado';

  return 'Sem assinatura';
}

function getBillingLabel(period?: string) {
  if (period === 'trimestral') return 'Trimestral';
  if (period === 'anual') return 'Anual';

  return 'Mensal';
}

function getStatusClass(status?: string) {
  if (status === 'ativo') {
    return 'bg-green-50 text-green-700 ring-green-100';
  }

  if (status === 'teste') {
    return 'bg-blue-50 text-blue-700 ring-blue-100';
  }

  if (status === 'pendente') {
    return 'bg-yellow-50 text-yellow-800 ring-yellow-100';
  }

  if (status === 'cancelado' || status === 'expirado') {
    return 'bg-red-50 text-red-700 ring-red-100';
  }

  return 'bg-gray-50 text-gray-600 ring-gray-100';
}

function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);

  return copy.toISOString().split('T')[0];
}

function formatDate(date?: string) {
  if (!date) return 'Não informado';

  const cleanDate = String(date).split('T')[0];
  const [year, month, day] = cleanDate.split('-');

  if (!year || !month || !day) return date;

  return `${day}/${month}/${year}`;
}

function formatMoney(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function getPlanPrice(
  planKey: PlanKey,
  period: BillingPeriod
) {
  if (planKey === 'teste_7_dias') return 0;

  return planPrices[planKey][period];
}

function getPlanPriceLabel(
  planKey: PlanKey,
  period: BillingPeriod
) {
  if (planKey === 'teste_7_dias') {
    return '7 dias grátis';
  }

  const option = billingOptions.find(
    (item) => item.key === period
  );

  return `${formatMoney(
    getPlanPrice(planKey, period)
  )} / ${option?.shortLabel || 'período'}`;
}

export default function PlanosFornecedorPage() {
  const [supplier, setSupplier] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [contractAcceptance, setContractAcceptance] =
    useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [requestingPlan, setRequestingPlan] = useState('');

  const [selectedBilling, setSelectedBilling] =
    useState<BillingPeriod>('mensal');

  const [contractAccepted, setContractAccepted] =
    useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [paymentMessage, setPaymentMessage] = useState('');

  async function loadData() {
    try {
      setLoading(true);
      setErrorMessage('');

      const params = new URLSearchParams(
        window.location.search
      );

      const pagamento = params.get('pagamento');

      const {
        data: userData,
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      const user = userData.user;

      if (!user) {
        setSupplier(null);
        setSubscription(null);
        setContractAcceptance(null);
        setContractAccepted(false);
        setPaymentMessage('');

        setErrorMessage(
          'Faça login como fornecedor para acessar os planos.'
        );

        return;
      }

      const {
        data: supplierData,
        error: supplierError,
      } = await supabase
        .from('suppliers')
        .select('*')
        .eq('owner_id', user.id)
        .limit(1)
        .maybeSingle();

      if (supplierError) {
        throw supplierError;
      }

      if (!supplierData?.id) {
        setSupplier(null);
        setSubscription(null);
        setContractAcceptance(null);
        setContractAccepted(false);
        setPaymentMessage('');

        setErrorMessage(
          'Perfil de fornecedor não encontrado para esta conta.'
        );

        return;
      }

      setSupplier(supplierData);

      const {
        data: subscriptionData,
        error: subscriptionError,
      } = await supabase
        .from('supplier_subscriptions')
        .select('*')
        .eq('supplier_id', supplierData.id)
        .order('created_at', {
          ascending: false,
        })
        .limit(1);

      if (subscriptionError) {
        throw subscriptionError;
      }

      const currentSubscription =
        subscriptionData?.[0] || null;

      setSubscription(currentSubscription);

      if (
        currentSubscription?.billing_period === 'mensal' ||
        currentSubscription?.billing_period === 'trimestral' ||
        currentSubscription?.billing_period === 'anual'
      ) {
        setSelectedBilling(
          currentSubscription.billing_period
        );
      }

      const {
        data: acceptanceData,
        error: acceptanceError,
      } = await supabase
        .from('supplier_contract_acceptances')
        .select('*')
        .eq('supplier_id', supplierData.id)
        .order('accepted_at', {
          ascending: false,
        })
        .limit(1);

      if (acceptanceError) {
        console.error(
          'Erro ao carregar aceite do contrato:',
          acceptanceError
        );

        setContractAcceptance(null);
        setContractAccepted(false);
      } else {
        const latestAcceptance =
          acceptanceData?.[0] || null;

        setContractAcceptance(latestAcceptance);

        setContractAccepted(
          Boolean(latestAcceptance?.id)
        );
      }

      const currentPlan =
        currentSubscription?.plan ||
        currentSubscription?.plan_name ||
        '';

      const isPremiumActive =
        currentPlan === 'premium' &&
        currentSubscription?.status === 'ativo';

      if (pagamento === 'sucesso') {
        if (isPremiumActive) {
          setPaymentMessage('');
        } else {
          setPaymentMessage(
            'Pagamento recebido. Estamos confirmando com o Mercado Pago. Em alguns instantes seu plano será ativado.'
          );
        }
      } else if (pagamento === 'pendente') {
        setPaymentMessage(
          'Seu pagamento está pendente. Assim que for aprovado, seu plano Premium será ativado automaticamente.'
        );
      } else if (pagamento === 'falha') {
        setPaymentMessage(
          'O pagamento não foi concluído. Você pode tentar novamente quando quiser.'
        );
      } else {
        setPaymentMessage('');
      }
    } catch (error: any) {
      console.error(
        'Erro ao carregar planos:',
        error
      );

      setErrorMessage(
        error?.message ||
          'Não foi possível carregar os planos.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleBillingChange(
    period: BillingPeriod
  ) {
    setSelectedBilling(period);

    if (contractAcceptance?.id) {
      setContractAccepted(true);
    } else {
      setContractAccepted(false);
    }

    setErrorMessage('');
    setSuccessMessage('');
  }

  async function saveContractAcceptance(
    billingPeriod: BillingPeriod,
    price: number
  ) {
    const {
      data: userData,
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      throw userError;
    }

    const user = userData.user;

    if (!user) {
      throw new Error(
        'Sessão expirada. Faça login novamente.'
      );
    }

    if (!supplier?.id) {
      throw new Error(
        'Fornecedor não encontrado.'
      );
    }

    const userMetadata =
      user.user_metadata || {};

    const acceptedByName =
      userMetadata.full_name ||
      userMetadata.name ||
      userMetadata.nome ||
      supplier.responsible_name ||
      supplier.contact_name ||
      supplier.owner_name ||
      supplier.business_name ||
      '';

    const acceptedByEmail =
      user.email ||
      supplier.email ||
      supplier.contact_email ||
      '';

    const acceptedByPhone =
      user.phone ||
      userMetadata.phone ||
      userMetadata.telefone ||
      userMetadata.whatsapp ||
      supplier.phone ||
      supplier.telefone ||
      supplier.whatsapp ||
      supplier.contact_phone ||
      '';

    const supplierBusinessName =
      supplier.business_name ||
      supplier.company_name ||
      supplier.name ||
      'Fornecedor REIM EVENTOS';

    const {
      data: acceptanceData,
      error: acceptanceError,
    } = await supabase
      .from('supplier_contract_acceptances')
      .insert({
        supplier_id: supplier.id,
        user_id: user.id,
        contract_version: CONTRACT_VERSION,
        plan: 'premium',
        billing_period: billingPeriod,
        price,
        accepted_by_name:
          acceptedByName || null,
        accepted_by_email:
          acceptedByEmail || null,
        accepted_by_phone:
          acceptedByPhone || null,
        supplier_business_name:
          supplierBusinessName,
        user_agent:
          typeof navigator !== 'undefined'
            ? navigator.userAgent
            : null,
        ip_address: null,
      })
      .select('*')
      .single();

    if (acceptanceError) {
      console.error(
        'Erro ao registrar aceite do contrato:',
        acceptanceError
      );

      throw new Error(
        `Não foi possível registrar o aceite do contrato: ${acceptanceError.message}`
      );
    }

    setContractAcceptance(acceptanceData);
    setContractAccepted(true);

    return acceptanceData;
  }

  async function handleRequestPlan(
    planKey: PlanKey
  ) {
    setErrorMessage('');
    setSuccessMessage('');

    if (!supplier?.id) {
      setErrorMessage(
        'Perfil de fornecedor não carregado.'
      );

      return;
    }

    const plan = plans.find(
      (item) => item.key === planKey
    );

    if (!plan) {
      return;
    }

    const billingPeriod: BillingPeriod =
      planKey === 'teste_7_dias'
        ? 'mensal'
        : selectedBilling;

    const billingLabel =
      getBillingLabel(billingPeriod);

    const value = getPlanPrice(
      planKey,
      billingPeriod
    );

    if (
      planKey === 'premium' &&
      !contractAccepted
    ) {
      setErrorMessage(
        'Para continuar, leia e aceite o Contrato do Fornecedor e os Termos de Uso.'
      );

      return;
    }

    const confirmed = window.confirm(
      planKey === 'teste_7_dias'
        ? 'Deseja iniciar o teste grátis de 7 dias para fornecedor?'
        : `Você será direcionado para o Mercado Pago para contratar o plano ${plan.name} no período ${billingLabel} por ${formatMoney(
            value
          )}. Deseja continuar?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setRequestingPlan(planKey);

      if (planKey === 'premium') {
        let acceptance =
          contractAcceptance;

        if (!acceptance?.id) {
          acceptance =
            await saveContractAcceptance(
              billingPeriod,
              value
            );
        }

        const response = await fetch(
          '/api/mercadopago/create-checkout',
          {
            method: 'POST',
            headers: {
              'Content-Type':
                'application/json',
            },
            body: JSON.stringify({
              supplier_id: supplier.id,
              billing_period:
                billingPeriod,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ||
              'Não foi possível iniciar o pagamento no Mercado Pago.'
          );
        }

        const paymentLink =
          data?.checkout_url;

        if (
          acceptance?.id &&
          data?.preference_id
        ) {
          const {
            error: acceptanceUpdateError,
          } = await supabase
            .from(
              'supplier_contract_acceptances'
            )
            .update({
              mercadopago_preference_id:
                data.preference_id,
            })
            .eq(
              'id',
              acceptance.id
            );

          if (acceptanceUpdateError) {
            console.error(
              'Não foi possível vincular a preferência do Mercado Pago ao aceite:',
              acceptanceUpdateError
            );
          }
        }

        if (!paymentLink) {
          throw new Error(
            'O Mercado Pago não retornou o link de pagamento.'
          );
        }

        setSuccessMessage(
          'Contrato aceito. Abrindo pagamento no Mercado Pago...'
        );

        window.location.href =
          paymentLink;

        return;
      }

      const dueDate = addDays(
        new Date(),
        7
      );

      const payload = {
        supplier_id: supplier.id,
        plan: plan.key,
        status: plan.statusOnRequest,
        value,
        due_date: dueDate,
        billing_period: billingPeriod,
        is_featured: false,
        payment_provider: 'manual',
        payment_status: 'free_trial',
        updated_at:
          new Date().toISOString(),
      };

      if (subscription?.supplier_id) {
        const { error } = await supabase
          .from('supplier_subscriptions')
          .update(payload)
          .eq(
            'supplier_id',
            supplier.id
          );

        if (error) {
          throw error;
        }
      } else {
        const { error } = await supabase
          .from('supplier_subscriptions')
          .insert(payload);

        if (error) {
          throw error;
        }
      }

      setSuccessMessage(
        'Teste grátis de 7 dias iniciado para este fornecedor.'
      );

      await loadData();
    } catch (error: any) {
      console.error(
        'Erro ao solicitar plano:',
        error
      );

      setErrorMessage(
        error?.message ||
          'Não foi possível solicitar este plano.'
      );
    } finally {
      setRequestingPlan('');
    }
  }

  const currentPlan =
    subscription?.plan ||
    subscription?.plan_name ||
    '';

  const currentStatus =
    subscription?.status || '';

  const currentBilling =
    subscription?.billing_period ||
    'mensal';

  const dueDate =
    subscription?.due_date ||
    subscription?.expires_at ||
    subscription?.current_period_end ||
    subscription?.end_date ||
    subscription?.ends_at ||
    '';

  const hasSubscription = Boolean(
    subscription?.supplier_id
  );

  const mercadoPagoPaymentLink =
    subscription?.checkout_url || '';

  return (
    <main className="min-h-screen bg-black text-[#151515]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#fbf7f1] pb-10 shadow-2xl">
        <section className="relative overflow-hidden rounded-b-[34px] bg-black px-6 pb-8 pt-7 text-white">
          <div className="absolute inset-0 bg-[url('/layout01-fundo.png')] bg-cover bg-center opacity-45" />

          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/85 to-black" />

          <div className="relative z-10">
            <Link
              href="/painel-fornecedor"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#e3a925]"
            >
              <ArrowLeft size={17} />
              Voltar
            </Link>

            <div className="mt-6">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#e3a925]">
                Assinatura do fornecedor
              </p>

              <h1 className="mt-2 font-serif text-[34px] leading-tight">
                Planos da vitrine
              </h1>

              <p className="mt-2 text-sm text-white/70">
                Clientes usam grátis. A cobrança é apenas para fornecedores.
              </p>
            </div>

            {supplier && (
              <div className="mt-6 rounded-[28px] bg-white/10 p-4 backdrop-blur">
                <p className="text-xs font-bold text-white/60">
                  Fornecedor
                </p>

                <h2 className="mt-1 line-clamp-1 text-xl font-extrabold">
                  {supplier.business_name ||
                    supplier.company_name ||
                    supplier.name ||
                    'Minha vitrine'}
                </h2>

                <div className="mt-4 grid grid-cols-4 gap-2">
                  <div className="rounded-2xl bg-black/25 p-3 text-center">
                    <Crown
                      size={18}
                      className="mx-auto text-[#e3a925]"
                    />

                    <p className="mt-1 text-[10px] font-bold text-white/50">
                      Plano
                    </p>

                    <p className="mt-1 text-[12px] font-extrabold">
                      {getPlanLabel(
                        currentPlan
                      )}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-black/25 p-3 text-center">
                    <ShieldCheck
                      size={18}
                      className="mx-auto text-[#e3a925]"
                    />

                    <p className="mt-1 text-[10px] font-bold text-white/50">
                      Status
                    </p>

                    <p className="mt-1 text-[12px] font-extrabold">
                      {getStatusLabel(
                        currentStatus
                      )}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-black/25 p-3 text-center">
                    <Sparkles
                      size={18}
                      className="mx-auto text-[#e3a925]"
                    />

                    <p className="mt-1 text-[10px] font-bold text-white/50">
                      Período
                    </p>

                    <p className="mt-1 text-[12px] font-extrabold">
                      {getBillingLabel(
                        currentBilling
                      )}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-black/25 p-3 text-center">
                    <Sparkles
                      size={18}
                      className="mx-auto text-[#e3a925]"
                    />

                    <p className="mt-1 text-[10px] font-bold text-white/50">
                      Vence
                    </p>

                    <p className="mt-1 text-[12px] font-extrabold">
                      {formatDate(dueDate)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="px-6 pt-6">
          {loading && (
            <div className="rounded-[28px] bg-white p-6 text-center shadow-sm ring-1 ring-[#f1e7cf]">
              <Loader2
                size={36}
                className="mx-auto animate-spin text-[#d99200]"
              />

              <p className="mt-3 text-sm font-bold text-gray-500">
                Carregando planos...
              </p>
            </div>
          )}

          {!loading && errorMessage && (
            <div className="mb-4 rounded-[22px] bg-red-50 p-4 text-sm font-bold leading-5 text-red-700 ring-1 ring-red-100">
              {errorMessage}
            </div>
          )}

          {!loading && successMessage && (
            <div className="mb-4 rounded-[22px] bg-green-50 p-4 text-sm font-bold leading-5 text-green-700 ring-1 ring-green-100">
              {successMessage}
            </div>
          )}

          {!loading && paymentMessage && (
            <div className="mb-4 rounded-[22px] bg-yellow-50 p-4 text-sm font-bold leading-5 text-yellow-800 ring-1 ring-yellow-100">
              {paymentMessage}
            </div>
          )}

          {!loading && supplier && (
            <>
              <div className="rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-[#f1e7cf]">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#fff7e8] text-[#d99200]">
                    <AlertCircle size={23} />
                  </div>

                  <div>
                    <h2 className="text-base font-extrabold">
                      Escolha o plano e o período
                    </h2>

                    <p className="mt-1 text-sm leading-5 text-gray-600">
                      No plano Premium, o fornecedor escolhe o período, aceita o contrato e é direcionado para o Mercado Pago. Após a confirmação do pagamento, a ativação é automática.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-[#f1e7cf]">
                <p className="text-sm font-extrabold">
                  Período de cobrança
                </p>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  {billingOptions.map(
                    (option) => (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() =>
                          handleBillingChange(
                            option.key
                          )
                        }
                        className={
                          selectedBilling ===
                          option.key
                            ? 'rounded-[18px] bg-[#e3a925] px-2 py-3 text-xs font-extrabold text-white shadow-sm'
                            : 'rounded-[18px] bg-[#fbf7f1] px-2 py-3 text-xs font-extrabold text-gray-500 ring-1 ring-[#f1e7cf]'
                        }
                      >
                        {option.label}
                      </button>
                    )
                  )}
                </div>

                <div className="mt-4 rounded-[20px] bg-[#fbf7f1] p-4 ring-1 ring-[#f1e7cf]">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-gray-500">
                        Plano selecionado
                      </p>

                      <p className="mt-1 text-sm font-extrabold">
                        Premium{' '}
                        {getBillingLabel(
                          selectedBilling
                        )}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-extrabold text-[#d99200]">
                        {formatMoney(
                          planPrices.premium[
                            selectedBilling
                          ]
                        )}
                      </p>

                      <p className="text-[10px] font-bold text-gray-500">
                        {
                          billingOptions.find(
                            (item) =>
                              item.key ===
                              selectedBilling
                          )?.shortLabel
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <p className="mt-3 text-xs leading-5 text-gray-500">
                  Mensal: R$ 25 por 30 dias. Trimestral: R$ 65 por 90 dias. Anual: R$ 250 por 365 dias.
                </p>
              </div>

              <div className="mt-5 space-y-4">
                {plans.map((plan) => {
                  const PlanIcon = plan.icon;

                  const isCurrent =
                    currentPlan === plan.key;

                  const isPending =
                    isCurrent &&
                    currentStatus ===
                      'pendente';

                  const isActive =
                    isCurrent &&
                    currentStatus ===
                      'ativo';

                  const isTest =
                    isCurrent &&
                    currentStatus ===
                      'teste';

                  const selectedPrice =
                    getPlanPrice(
                      plan.key,
                      selectedBilling
                    );

                  return (
                    <div
                      key={plan.key}
                      className={
                        plan.key ===
                        'premium'
                          ? 'rounded-[28px] bg-[#151515] p-5 text-white shadow-lg ring-2 ring-[#e3a925]'
                          : 'rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-[#f1e7cf]'
                      }
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div
                            className={
                              plan.key ===
                              'premium'
                                ? 'flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e3a925] text-white'
                                : 'flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff7e8] text-[#d99200]'
                            }
                          >
                            <PlanIcon
                              size={26}
                            />
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-extrabold">
                                {plan.name}
                              </h3>

                              {plan.badge && (
                                <span className="rounded-full bg-[#e3a925] px-2 py-1 text-[9px] font-extrabold text-white">
                                  {
                                    plan.badge
                                  }
                                </span>
                              )}
                            </div>

                            <p
                              className={
                                plan.key ===
                                'premium'
                                  ? 'mt-1 text-sm text-white/70'
                                  : 'mt-1 text-sm text-gray-500'
                              }
                            >
                              {
                                plan.highlight
                              }
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p
                            className={
                              plan.key ===
                              'premium'
                                ? 'text-base font-extrabold text-[#f7d67b]'
                                : 'text-base font-extrabold text-[#151515]'
                            }
                          >
                            {getPlanPriceLabel(
                              plan.key,
                              selectedBilling
                            )}
                          </p>

                          {plan.key !==
                            'teste_7_dias' && (
                            <p
                              className={
                                plan.key ===
                                'premium'
                                  ? 'mt-1 text-[11px] font-bold text-white/50'
                                  : 'mt-1 text-[11px] font-bold text-gray-500'
                              }
                            >
                              {getBillingLabel(
                                selectedBilling
                              )}
                            </p>
                          )}

                          {isCurrent && (
                            <span
                              className={`mt-2 inline-block rounded-full px-3 py-1 text-[10px] font-extrabold ring-1 ${getStatusClass(
                                currentStatus
                              )}`}
                            >
                              {getStatusLabel(
                                currentStatus
                              )}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 space-y-2">
                        {plan.features.map(
                          (feature) => (
                            <div
                              key={feature}
                              className={
                                plan.key ===
                                'premium'
                                  ? 'flex items-center gap-2 text-sm text-white/80'
                                  : 'flex items-center gap-2 text-sm text-gray-700'
                              }
                            >
                              <CheckCircle2
                                size={16}
                                className={
                                  plan.key ===
                                  'premium'
                                    ? 'text-[#f7d67b]'
                                    : 'text-green-600'
                                }
                              />

                              {feature}
                            </div>
                          )
                        )}
                      </div>

                      {plan.key === 'premium' && (
                        <>
                          <div className="mt-4 rounded-2xl bg-white/10 p-3 text-xs font-bold text-white/70">
                            Valor no Mercado Pago:{' '}
                            {formatMoney(
                              selectedPrice
                            )}{' '}
                            • Período:{' '}
                            {getBillingLabel(
                              selectedBilling
                            )}
                          </div>

                          <div className="mt-4 rounded-[22px] border border-white/10 bg-white/5 p-4">
                            <div className="flex items-start gap-3">
                              <FileText
                                size={22}
                                className="mt-0.5 shrink-0 text-[#f7d67b]"
                              />

                              <div>
                                <p className="text-sm font-extrabold text-white">
                                  Contrato do Fornecedor
                                </p>

                                <p className="mt-1 text-xs leading-5 text-white/60">
                                  Leia o contrato e os Termos de Uso antes de continuar para o pagamento.
                                </p>
                              </div>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-2">
                              <Link
                                href="/contrato-fornecedor"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-1 rounded-[16px] bg-white/10 px-3 py-3 text-center text-[11px] font-extrabold text-white"
                              >
                                Ler contrato
                                <ExternalLink
                                  size={13}
                                />
                              </Link>

                              <Link
                                href="/termos"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-1 rounded-[16px] bg-white/10 px-3 py-3 text-center text-[11px] font-extrabold text-white"
                              >
                                Termos de Uso
                                <ExternalLink
                                  size={13}
                                />
                              </Link>
                            </div>

                            {contractAcceptance?.id ? (
                              <div className="mt-4 rounded-[18px] bg-green-500/15 p-4 ring-1 ring-green-400/25">
                                <div className="flex items-start gap-3">
                                  <CheckCircle2
                                    size={22}
                                    className="mt-0.5 shrink-0 text-green-400"
                                  />

                                  <div>
                                    <p className="text-sm font-extrabold text-green-300">
                                      Contrato aceito
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-white/70">
                                      Aceite registrado em{' '}
                                      {formatDate(
                                        contractAcceptance.accepted_at ||
                                          contractAcceptance.created_at
                                      )}
                                      .
                                    </p>

                                    {contractAcceptance.accepted_by_email && (
                                      <p className="mt-1 break-all text-[11px] leading-5 text-white/50">
                                        {contractAcceptance.accepted_by_email}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-[18px] bg-black/30 p-3">
                                <input
                                  type="checkbox"
                                  checked={
                                    contractAccepted
                                  }
                                  onChange={(event) =>
                                    setContractAccepted(
                                      event.target
                                        .checked
                                    )
                                  }
                                  className="mt-1 h-5 w-5 shrink-0 accent-[#e3a925]"
                                />

                                <span className="text-xs font-bold leading-5 text-white/80">
                                  Li e aceito o Contrato do Fornecedor, versão{' '}
                                  {CONTRACT_VERSION}, e os Termos de Uso do REIM EVENTOS.
                                </span>
                              </label>
                            )}

                            {!contractAccepted &&
                              !isActive &&
                              !isPending &&
                              !contractAcceptance?.id && (
                                <p className="mt-3 text-center text-[11px] font-bold text-[#f7d67b]">
                                  Marque a caixa acima para liberar o pagamento.
                                </p>
                              )}
                          </div>
                        </>
                      )}

                      {isPending &&
                      isCurrent &&
                      mercadoPagoPaymentLink ? (
                        <button
                          type="button"
                          onClick={() => {
                            window.location.href =
                              mercadoPagoPaymentLink;
                          }}
                          className={
                            plan.key ===
                            'premium'
                              ? 'mt-5 flex w-full items-center justify-center gap-2 rounded-[22px] bg-[#e3a925] py-4 text-sm font-extrabold text-white shadow-lg'
                              : 'mt-5 flex w-full items-center justify-center gap-2 rounded-[22px] bg-black py-4 text-sm font-extrabold text-white shadow-lg'
                          }
                        >
                          Continuar pagamento no Mercado Pago
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            handleRequestPlan(
                              plan.key
                            )
                          }
                          disabled={
                            requestingPlan ===
                              plan.key ||
                            isActive ||
                            isPending ||
                            isTest ||
                            (plan.key ===
                              'teste_7_dias' &&
                              hasSubscription) ||
                            (plan.key ===
                              'premium' &&
                              !contractAccepted)
                          }
                          className={
                            plan.key ===
                            'premium'
                              ? 'mt-5 flex w-full items-center justify-center gap-2 rounded-[22px] bg-[#e3a925] py-4 text-sm font-extrabold text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-40'
                              : 'mt-5 flex w-full items-center justify-center gap-2 rounded-[22px] bg-black py-4 text-sm font-extrabold text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-60'
                          }
                        >
                          {requestingPlan ===
                          plan.key ? (
                            <>
                              <Loader2
                                size={18}
                                className="animate-spin"
                              />

                              {plan.key ===
                              'teste_7_dias'
                                ? 'Iniciando...'
                                : 'Registrando aceite e abrindo Mercado Pago...'}
                            </>
                          ) : isPending ? (
                            'Aguardando pagamento'
                          ) : isActive ? (
                            'Plano atual'
                          ) : isTest ? (
                            'Teste em andamento'
                          ) : plan.key ===
                            'teste_7_dias' ? (
                            hasSubscription ? (
                              'Teste já utilizado'
                            ) : (
                              'Iniciar teste grátis'
                            )
                          ) : (
                            `Assinar Premium por ${formatMoney(
                              selectedPrice
                            )}`
                          )}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
