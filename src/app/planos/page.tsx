'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Crown,
  Gem,
  Rocket,
  ShieldCheck,
  Sparkles,
  Star,
  WalletCards,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function PlanosPage() {
  const [supplier, setSupplier] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setErrorMessage('');

      const user = (await supabase.auth.getUser()).data.user;

      if (!user) {
        setErrorMessage('Faça login como fornecedor para ver seus planos.');
        return;
      }

      const { data: supplierData, error: supplierError } = await supabase
        .from('suppliers')
        .select('id, business_name, city, status, is_featured')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (supplierError) throw supplierError;

      if (!supplierData) {
        setErrorMessage('Perfil de fornecedor não encontrado.');
        return;
      }

      setSupplier(supplierData);

      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('supplier_subscriptions')
        .select('*')
        .eq('supplier_id', supplierData.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (subscriptionError) throw subscriptionError;

      setSubscription(subscriptionData);
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
      setErrorMessage('Não foi possível carregar seus planos.');
    } finally {
      setLoading(false);
    }
  }

  function formatMoney(value?: number | string | null) {
    if (value === null || value === undefined || value === '') {
      return 'R$ 0,00';
    }

    return Number(value).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  function currentPlanLabel() {
    if (!subscription) return 'Gratuito';

    if (subscription.status === 'ativo' && subscription.is_featured) {
      return 'Premium Destaque';
    }

    if (subscription.status === 'pendente') {
      return 'Premium solicitado';
    }

    if (subscription.status === 'cancelado') {
      return 'Premium cancelado';
    }

    if (subscription.status === 'vencido') {
      return 'Premium vencido';
    }

    return 'Gratuito';
  }

  function currentPlanBadge() {
    if (subscription?.status === 'ativo' && subscription?.is_featured) {
      return (
        <span className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-[11px] font-extrabold text-green-700">
          <CheckCircle2 size={13} />
          Ativo
        </span>
      );
    }

    if (subscription?.status === 'pendente') {
      return (
        <span className="flex items-center gap-1 rounded-full bg-[#fff7e8] px-3 py-1 text-[11px] font-extrabold text-[#b97900]">
          <Clock size={13} />
          Aguardando
        </span>
      );
    }

    return (
      <span className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-[11px] font-extrabold text-gray-700">
        <ShieldCheck size={13} />
        Gratuito
      </span>
    );
  }

  async function handleRequestPremium() {
    try {
      setRequesting(true);
      setErrorMessage('');
      setSuccessMessage('');

      if (!supplier?.id) {
        setErrorMessage('Fornecedor não identificado.');
        return;
      }

      if (subscription?.status === 'ativo' && subscription?.is_featured) {
        setErrorMessage('Seu plano Premium já está ativo.');
        return;
      }

      if (subscription?.status === 'pendente') {
        setErrorMessage('Você já possui uma solicitação Premium aguardando aprovação.');
        return;
      }

      if (subscription?.id) {
        const { error } = await supabase
          .from('supplier_subscriptions')
          .update({
            plan_name: 'Premium Destaque',
            status: 'pendente',
            is_featured: false,
            amount: 49.9,
            payment_method: 'pendente',
            notes: 'Fornecedor solicitou ativação do Premium pelo app.',
            updated_at: new Date().toISOString(),
          })
          .eq('id', subscription.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('supplier_subscriptions').insert([
          {
            supplier_id: supplier.id,
            plan_name: 'Premium Destaque',
            status: 'pendente',
            is_featured: false,
            amount: 49.9,
            payment_method: 'pendente',
            notes: 'Fornecedor solicitou ativação do Premium pelo app.',
          },
        ]);

        if (error) throw error;
      }

      setSuccessMessage(
        'Solicitação enviada com sucesso! O admin poderá ativar seu plano Premium.'
      );

      await loadData();
    } catch (error) {
      console.error('Erro ao solicitar Premium:', error);
      setErrorMessage('Não foi possível solicitar o plano Premium.');
    } finally {
      setRequesting(false);
    }
  }

  const isPremiumActive =
    subscription?.status === 'ativo' && subscription?.is_featured === true;

  const isPremiumPending = subscription?.status === 'pendente';

  return (
    <main className="min-h-screen bg-black text-[#151515]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#fbf7f1] pb-10 shadow-2xl">
        {/* TOPO */}
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

            <div className="mt-6 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e3a925] text-white shadow-lg">
                <Crown size={31} />
              </div>

              <div>
                <h1 className="font-serif text-[34px] leading-tight">
                  Planos REIM
                </h1>
                <p className="mt-1 text-sm text-white/70">
                  Escolha como sua vitrine será exibida.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-[26px] bg-white/10 p-4 backdrop-blur">
              <p className="flex items-center gap-2 text-sm font-bold text-[#e3a925]">
                <Sparkles size={17} />
                Fornecedores em destaque recebem mais visualizações e pedidos.
              </p>
            </div>
          </div>
        </section>

        {/* STATUS ATUAL */}
        <section className="px-6 pt-6">
          <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-[#f1e7cf]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-gray-500">
                  Sua vitrine
                </p>

                <h2 className="mt-1 text-lg font-extrabold">
                  {supplier?.business_name || 'Fornecedor'}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {supplier?.city || 'Cidade não informada'}
                </p>
              </div>

              {currentPlanBadge()}
            </div>

            <div className="mt-4 rounded-2xl bg-[#fbf7f1] p-3">
              <p className="text-xs font-bold text-gray-500">
                Plano atual
              </p>

              <p className="mt-1 text-sm font-extrabold">
                {loading ? 'Carregando...' : currentPlanLabel()}
              </p>
            </div>

            {isPremiumActive && (
              <div className="mt-4 rounded-2xl bg-[#151515] p-4 text-white">
                <p className="flex items-center gap-2 text-xs font-extrabold text-[#f7d67b]">
                  <Crown size={15} />
                  Destaque ativo na Home
                </p>

                <p className="mt-2 text-sm leading-5 text-white/80">
                  Sua vitrine aparece em “Fornecedores em destaque”.
                </p>
              </div>
            )}

            {isPremiumPending && (
              <div className="mt-4 rounded-2xl bg-[#fff7e8] p-4 text-[#9a6a00] ring-1 ring-[#e3a925]/30">
                <p className="flex items-center gap-2 text-xs font-extrabold">
                  <Clock size={15} />
                  Solicitação em análise
                </p>

                <p className="mt-2 text-sm leading-5">
                  O admin precisa confirmar a ativação do seu plano Premium.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* RESUMO */}
        <section className="grid grid-cols-3 gap-3 px-6 pt-6">
          <div className="rounded-[22px] bg-white p-4 text-center shadow-sm ring-1 ring-[#f1e7cf]">
            <Star size={24} className="mx-auto text-[#d99200]" fill="#d99200" />
            <p className="mt-2 text-[11px] font-bold text-gray-600">
              Destaque
            </p>
          </div>

          <div className="rounded-[22px] bg-white p-4 text-center shadow-sm ring-1 ring-[#f1e7cf]">
            <WalletCards size={24} className="mx-auto text-[#d99200]" />
            <p className="mt-2 text-[11px] font-bold text-gray-600">
              Mensal
            </p>
          </div>

          <div className="rounded-[22px] bg-white p-4 text-center shadow-sm ring-1 ring-[#f1e7cf]">
            <Gem size={24} className="mx-auto text-[#d99200]" />
            <p className="mt-2 text-[11px] font-bold text-gray-600">
              Premium
            </p>
          </div>
        </section>

        {errorMessage && (
          <section className="px-6 pt-4">
            <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {errorMessage}
            </div>
          </section>
        )}

        {successMessage && (
          <section className="px-6 pt-4">
            <div className="rounded-2xl bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
              {successMessage}
            </div>
          </section>
        )}

        {/* PLANOS */}
        <section className="px-6 pt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-extrabold">Escolha seu plano</h2>
            <span className="text-xs font-bold text-gray-500">
              2 opções
            </span>
          </div>

          <div className="space-y-5">
            {/* PLANO GRATUITO */}
            <div className="rounded-[30px] bg-white p-5 text-[#151515] shadow-[0_10px_25px_rgba(0,0,0,.08)] ring-1 ring-[#f1e7cf]">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff7e8] text-[#d99200]">
                    <ShieldCheck size={30} />
                  </div>

                  <div>
                    <span className="rounded-full bg-[#fff7e8] px-3 py-1 text-[11px] font-extrabold text-[#b97900]">
                      Básico
                    </span>

                    <h3 className="mt-3 font-serif text-2xl leading-tight">
                      Gratuito
                    </h3>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-sm leading-5 text-gray-500">
                Para fornecedores que querem aparecer na busca e receber pedidos de orçamento.
              </p>

              <div className="mt-5">
                <p className="text-3xl font-extrabold">
                  R$ 0,00
                </p>

                <p className="mt-1 text-xs font-bold text-gray-500">
                  cadastro gratuito
                </p>
              </div>

              <div className="mt-5 space-y-3">
                {[
                  'Vitrine básica no app',
                  'Aparece na busca de fornecedores',
                  'Receber pedidos de orçamento',
                  'Responder orçamentos pelo app',
                  'Acesso ao painel de leads',
                ].map((benefit) => (
                  <div key={benefit} className="flex items-center gap-2">
                    <CheckCircle2 size={17} className="text-green-600" />
                    <span className="text-sm font-bold text-gray-700">
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-[24px] bg-[#fbf7f1] py-4 text-center font-extrabold text-[#151515] ring-1 ring-[#f1e7cf]">
                Plano base
              </div>
            </div>

            {/* PLANO PREMIUM */}
            <div className="rounded-[30px] bg-black p-5 text-white shadow-[0_10px_25px_rgba(0,0,0,.12)]">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e3a925] text-white">
                    <Crown size={30} />
                  </div>

                  <div>
                    <span className="rounded-full bg-[#e3a925] px-3 py-1 text-[11px] font-extrabold text-white">
                      Mais visibilidade
                    </span>

                    <h3 className="mt-3 font-serif text-2xl leading-tight">
                      Premium Destaque
                    </h3>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-sm leading-5 text-white/70">
                Para fornecedores que querem aparecer em destaque na Home e aumentar as chances de receber pedidos.
              </p>

              <div className="mt-5">
                <p className="text-3xl font-extrabold">
                  {formatMoney(subscription?.amount || 49.9)}
                </p>

                <p className="mt-1 text-xs font-bold text-white/60">
                  valor mensal sugerido
                </p>
              </div>

              <div className="mt-5 space-y-3">
                {[
                  'Aparece em Fornecedores em destaque na Home',
                  'Selo Premium na vitrine',
                  'Mais visibilidade para clientes/noivas',
                  'Prioridade em campanhas e chamadas futuras',
                  'Ideal para quem quer receber mais orçamentos',
                ].map((benefit) => (
                  <div key={benefit} className="flex items-center gap-2">
                    <CheckCircle2 size={17} className="text-[#e3a925]" />
                    <span className="text-sm font-bold text-white/85">
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>

              <p className="mt-5 text-xs leading-5 text-white/50">
                A ativação do destaque é confirmada pelo Admin REIM EVENTOS.
              </p>

              <button
                onClick={handleRequestPremium}
                disabled={loading || requesting || isPremiumActive || isPremiumPending}
                className={
                  isPremiumActive
                    ? 'mt-5 block w-full rounded-[24px] bg-green-600 py-4 text-center font-extrabold text-white shadow-lg disabled:opacity-100'
                    : isPremiumPending
                      ? 'mt-5 block w-full rounded-[24px] bg-[#fff7e8] py-4 text-center font-extrabold text-[#9a6a00] shadow-lg disabled:opacity-100'
                      : 'mt-5 block w-full rounded-[24px] bg-[#e3a925] py-4 text-center font-extrabold text-white shadow-lg disabled:opacity-60'
                }
              >
                {requesting
                  ? 'Enviando solicitação...'
                  : isPremiumActive
                    ? 'Premium ativo'
                    : isPremiumPending
                      ? 'Aguardando aprovação'
                      : 'Solicitar Premium'}
              </button>
            </div>

            {/* PLANO FUTURO */}
            <div className="rounded-[30px] bg-white p-5 text-[#151515] shadow-[0_10px_25px_rgba(0,0,0,.08)] ring-1 ring-[#f1e7cf]">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff7e8] text-[#d99200]">
                  <Rocket size={30} />
                </div>

                <div>
                  <span className="rounded-full bg-[#fff7e8] px-3 py-1 text-[11px] font-extrabold text-[#b97900]">
                    Em breve
                  </span>

                  <h3 className="mt-3 font-serif text-2xl leading-tight">
                    Profissional
                  </h3>
                </div>
              </div>

              <p className="mt-4 text-sm leading-5 text-gray-500">
                Futuramente, este plano poderá incluir relatórios, impulsionamento e recursos avançados.
              </p>

              <div className="mt-5 rounded-[24px] bg-[#fbf7f1] py-4 text-center font-extrabold text-gray-500 ring-1 ring-[#f1e7cf]">
                Em desenvolvimento
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function formatMoney(value?: number | string | null) {
  if (value === null || value === undefined || value === '') {
    return 'R$ 49,90';
  }

  return Number(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}
