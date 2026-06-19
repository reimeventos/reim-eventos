'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Crown,
  Loader2,
  ShieldCheck,
  Sparkles,
  Star,
  Zap,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

type PlanKey = 'teste_7_dias' | 'premium' | 'profissional';

const plans: {
  key: PlanKey;
  name: string;
  price: string;
  value: number;
  statusOnRequest: 'teste' | 'pendente';
  highlight: string;
  icon: any;
  badge?: string;
  features: string[];
}[] = [
  {
    key: 'teste_7_dias',
    name: 'Teste grátis',
    price: '7 dias grátis',
    value: 0,
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
    name: 'Premium',
    price: 'R$ 49,90/mês',
    value: 49.9,
    statusOnRequest: 'pendente',
    highlight: 'Mais destaque para vender mais',
    icon: Crown,
    badge: 'Mais escolhido',
    features: [
      'Destaque na busca',
      'Selo Premium na vitrine',
      'Mais fotos e vídeos',
      'Maior visibilidade para clientes',
      'Aparece em fornecedores em destaque',
    ],
  },
  {
    key: 'profissional',
    name: 'Profissional',
    price: 'R$ 89,90/mês',
    value: 89.9,
    statusOnRequest: 'pendente',
    highlight: 'Para fornecedores que querem prioridade',
    icon: Zap,
    features: [
      'Tudo do Premium',
      'Prioridade nos destaques',
      'Mais espaço para portfólio',
      'Melhor posicionamento comercial',
      'Suporte prioritário',
    ],
  },
];

function getPlanLabel(plan?: string) {
  if (plan === 'premium') return 'Premium';
  if (plan === 'profissional') return 'Profissional';
  if (plan === 'teste_7_dias' || plan === 'gratuito') return 'Teste grátis';
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

function getStatusClass(status?: string) {
  if (status === 'ativo') return 'bg-green-50 text-green-700 ring-green-100';
  if (status === 'teste') return 'bg-blue-50 text-blue-700 ring-blue-100';
  if (status === 'pendente') return 'bg-yellow-50 text-yellow-800 ring-yellow-100';
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

  const [year, month, day] = String(date).split('-');

  if (!year || !month || !day) return date;

  return `${day}/${month}/${year}`;
}

export default function PlanosFornecedorPage() {
  const [supplier, setSupplier] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [requestingPlan, setRequestingPlan] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  async function loadData() {
    try {
      setLoading(true);
      setErrorMessage('');
      setSuccessMessage('');

      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!user) {
        setSupplier(null);
        setSubscription(null);
        setErrorMessage('Faça login como fornecedor para acessar os planos.');
        return;
      }

      const { data: supplierData, error: supplierError } = await supabase
        .from('suppliers')
        .select('id,business_name,status,is_featured,owner_id')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (supplierError) throw supplierError;

      if (!supplierData?.id) {
        setSupplier(null);
        setSubscription(null);
        setErrorMessage('Perfil de fornecedor não encontrado para esta conta.');
        return;
      }

      setSupplier(supplierData);

      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('supplier_subscriptions')
        .select('*')
        .eq('supplier_id', supplierData.id)
        .limit(1);

      if (subscriptionError) throw subscriptionError;

      setSubscription(subscriptionData?.[0] || null);
    } catch (error: any) {
      console.error('Erro ao carregar planos:', error);
      setErrorMessage(error?.message || 'Não foi possível carregar os planos.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleRequestPlan(planKey: PlanKey) {
    setErrorMessage('');
    setSuccessMessage('');

    if (!supplier?.id) {
      setErrorMessage('Perfil de fornecedor não carregado.');
      return;
    }

    const plan = plans.find((item) => item.key === planKey);

    if (!plan) return;

    const confirmed = window.confirm(
      planKey === 'teste_7_dias'
        ? 'Deseja iniciar o teste grátis de 7 dias para fornecedor?'
        : `Deseja solicitar o plano ${plan.name}? Após o pagamento por PIX/link, o admin ativará sua assinatura.`
    );

    if (!confirmed) return;

    try {
      setRequestingPlan(planKey);

      const payload = {
        supplier_id: supplier.id,
        plan: plan.key,
        status: plan.statusOnRequest,
        value: plan.value,
        due_date: plan.key === 'teste_7_dias' ? addDays(new Date(), 7) : addDays(new Date(), 30),
        is_featured: plan.key !== 'teste_7_dias',
      };

      if (subscription?.supplier_id) {
        const { error } = await supabase
          .from('supplier_subscriptions')
          .update(payload)
          .eq('supplier_id', supplier.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('supplier_subscriptions')
          .insert(payload);

        if (error) throw error;
      }

      setSuccessMessage(
        plan.key === 'teste_7_dias'
          ? 'Teste grátis de 7 dias iniciado para este fornecedor.'
          : `Solicitação do plano ${plan.name} enviada. Aguarde a confirmação do pagamento pelo admin.`
      );

      await loadData();
    } catch (error: any) {
      console.error('Erro ao solicitar plano:', error);
      setErrorMessage(
        error?.message ||
          'Não foi possível solicitar este plano. Verifique as permissões no Supabase.'
      );
    } finally {
      setRequestingPlan('');
    }
  }

  const currentPlan = subscription?.plan || '';
  const currentStatus = subscription?.status || '';
  const dueDate = subscription?.due_date || '';
  const hasSubscription = Boolean(subscription?.supplier_id);

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
                <p className="text-xs font-bold text-white/60">Fornecedor</p>
                <h2 className="mt-1 line-clamp-1 text-xl font-extrabold">
                  {supplier.business_name || 'Minha vitrine'}
                </h2>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="rounded-2xl bg-black/25 p-3 text-center">
                    <Crown size={18} className="mx-auto text-[#e3a925]" />
                    <p className="mt-1 text-[10px] font-bold text-white/50">
                      Plano
                    </p>
                    <p className="mt-1 text-[12px] font-extrabold">
                      {getPlanLabel(currentPlan)}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-black/25 p-3 text-center">
                    <ShieldCheck size={18} className="mx-auto text-[#e3a925]" />
                    <p className="mt-1 text-[10px] font-bold text-white/50">
                      Status
                    </p>
                    <p className="mt-1 text-[12px] font-extrabold">
                      {getStatusLabel(currentStatus)}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-black/25 p-3 text-center">
                    <Sparkles size={18} className="mx-auto text-[#e3a925]" />
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
              <Loader2 size={36} className="mx-auto animate-spin text-[#d99200]" />
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

          {!loading && supplier && (
            <>
              <div className="rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-[#f1e7cf]">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#fff7e8] text-[#d99200]">
                    <AlertCircle size={23} />
                  </div>

                  <div>
                    <h2 className="text-base font-extrabold">
                      Modelo inicial para publicação
                    </h2>

                    <p className="mt-1 text-sm leading-5 text-gray-600">
                      Cliente não paga. Fornecedor tem 7 dias grátis para testar. Após isso, solicita Premium ou Profissional e o admin ativa após confirmar o pagamento.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                {plans.map((plan) => {
                  const PlanIcon = plan.icon;
                  const isCurrent = currentPlan === plan.key;
                  const isPending = isCurrent && currentStatus === 'pendente';
                  const isActive = isCurrent && currentStatus === 'ativo';
                  const isTest = isCurrent && currentStatus === 'teste';

                  return (
                    <div
                      key={plan.key}
                      className={
                        plan.key === 'premium'
                          ? 'rounded-[28px] bg-[#151515] p-5 text-white shadow-lg ring-2 ring-[#e3a925]'
                          : 'rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-[#f1e7cf]'
                      }
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div
                            className={
                              plan.key === 'premium'
                                ? 'flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e3a925] text-white'
                                : 'flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff7e8] text-[#d99200]'
                            }
                          >
                            <PlanIcon size={26} />
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-extrabold">
                                {plan.name}
                              </h3>

                              {plan.badge && (
                                <span className="rounded-full bg-[#e3a925] px-2 py-1 text-[9px] font-extrabold text-white">
                                  {plan.badge}
                                </span>
                              )}
                            </div>

                            <p
                              className={
                                plan.key === 'premium'
                                  ? 'mt-1 text-sm text-white/70'
                                  : 'mt-1 text-sm text-gray-500'
                              }
                            >
                              {plan.highlight}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p
                            className={
                              plan.key === 'premium'
                                ? 'text-base font-extrabold text-[#f7d67b]'
                                : 'text-base font-extrabold text-[#151515]'
                            }
                          >
                            {plan.price}
                          </p>

                          {isCurrent && (
                            <span
                              className={`mt-2 inline-block rounded-full px-3 py-1 text-[10px] font-extrabold ring-1 ${getStatusClass(currentStatus)}`}
                            >
                              {getStatusLabel(currentStatus)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 space-y-2">
                        {plan.features.map((feature) => (
                          <div
                            key={feature}
                            className={
                              plan.key === 'premium'
                                ? 'flex items-center gap-2 text-sm text-white/80'
                                : 'flex items-center gap-2 text-sm text-gray-700'
                            }
                          >
                            <CheckCircle2
                              size={16}
                              className={
                                plan.key === 'premium'
                                  ? 'text-[#f7d67b]'
                                  : 'text-green-600'
                              }
                            />
                            {feature}
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRequestPlan(plan.key)}
                        disabled={requestingPlan === plan.key || isActive || isPending || isTest}
                        className={
                          plan.key === 'premium'
                            ? 'mt-5 flex w-full items-center justify-center gap-2 rounded-[22px] bg-[#e3a925] py-4 text-sm font-extrabold text-white shadow-lg disabled:opacity-60'
                            : 'mt-5 flex w-full items-center justify-center gap-2 rounded-[22px] bg-black py-4 text-sm font-extrabold text-white shadow-lg disabled:opacity-60'
                        }
                      >
                        {requestingPlan === plan.key ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            Solicitando...
                          </>
                        ) : isPending ? (
                          'Aguardando confirmação'
                        ) : isActive ? (
                          'Plano atual'
                        ) : isTest ? (
                          'Teste em andamento'
                        ) : plan.key === 'teste_7_dias' ? (
                          hasSubscription ? 'Teste já utilizado' : 'Iniciar teste grátis'
                        ) : (
                          `Solicitar ${plan.name}`
                        )}
                      </button>
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
