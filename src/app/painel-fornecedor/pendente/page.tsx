'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowLeft,
  Clock,
  Crown,
  Home,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

function formatDate(date?: string) {
  if (!date) return 'Não informado';
  const [year, month, day] = String(date).split('-');
  if (!year || !month || !day) return date;
  return `${day}/${month}/${year}`;
}

function getPlanLabel(plan?: string) {
  if (plan === 'premium') return 'Premium Destaque';
  if (plan === 'profissional') return 'Profissional';
  if (plan === 'teste_7_dias') return 'Teste grátis';
  return 'Sem plano';
}

function getStatusLabel(status?: string) {
  if (status === 'pendente') return 'Pendente de pagamento/aprovação';
  if (status === 'expirado') return 'Expirado';
  if (status === 'cancelado') return 'Cancelado';
  if (status === 'teste') return 'Teste grátis';
  if (status === 'ativo') return 'Ativo';
  return 'Assinatura necessária';
}

export default function PainelFornecedorPendentePage() {
  const [loading, setLoading] = useState(true);
  const [supplier, setSupplier] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);

  async function loadData() {
    try {
      setLoading(true);

      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!user) return;

      const { data: supplierData } = await supabase
        .from('suppliers')
        .select('id,business_name,owner_id')
        .eq('owner_id', user.id)
        .limit(1)
        .maybeSingle();

      setSupplier(supplierData || null);

      if (supplierData?.id) {
        const { data: subscriptionData } = await supabase
          .from('supplier_subscriptions')
          .select('*')
          .eq('supplier_id', supplierData.id)
          .order('created_at', { ascending: false })
          .limit(1);

        setSubscription(subscriptionData?.[0] || null);
      }
    } catch (error) {
      console.error('Erro ao carregar assinatura pendente:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const status = subscription?.status || '';
  const isPending = status === 'pendente';

  return (
    <main className="min-h-screen bg-black text-[#151515]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#fbf7f1] pb-10 shadow-2xl">
        <section className="relative overflow-hidden rounded-b-[34px] bg-black px-6 pb-8 pt-7 text-white">
          <div className="absolute inset-0 bg-[url('/layout01-fundo.png')] bg-cover bg-center opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/85 to-black" />

          <div className="relative z-10">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#e3a925]"
            >
              <ArrowLeft size={17} />
              Home
            </Link>

            <div className="mt-6">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#e3a925]">
                Acesso do fornecedor
              </p>

              <h1 className="mt-2 font-serif text-[34px] leading-tight">
                {isPending ? 'Pagamento pendente' : 'Plano necessário'}
              </h1>

              <p className="mt-2 text-sm text-white/70">
                Para acessar o painel, sua assinatura precisa estar ativa.
              </p>
            </div>
          </div>
        </section>

        <section className="px-6 pt-6">
          {loading ? (
            <div className="rounded-[28px] bg-white p-6 text-center shadow-sm ring-1 ring-[#f1e7cf]">
              <Loader2 size={38} className="mx-auto animate-spin text-[#d99200]" />
              <p className="mt-3 text-sm font-bold text-gray-500">
                Verificando assinatura...
              </p>
            </div>
          ) : (
            <>
              <div
                className={
                  isPending
                    ? 'rounded-[28px] bg-yellow-50 p-6 shadow-sm ring-1 ring-yellow-100'
                    : 'rounded-[28px] bg-red-50 p-6 shadow-sm ring-1 ring-red-100'
                }
              >
                <div
                  className={
                    isPending
                      ? 'mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-yellow-700'
                      : 'mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-red-700'
                  }
                >
                  {isPending ? <Clock size={34} /> : <AlertCircle size={34} />}
                </div>

                <h2
                  className={
                    isPending
                      ? 'mt-5 text-center text-xl font-extrabold text-yellow-900'
                      : 'mt-5 text-center text-xl font-extrabold text-red-800'
                  }
                >
                  {isPending
                    ? 'Plano aguardando confirmação'
                    : 'Acesso bloqueado'}
                </h2>

                <p
                  className={
                    isPending
                      ? 'mt-2 text-center text-sm leading-5 text-yellow-900'
                      : 'mt-2 text-center text-sm leading-5 text-red-800'
                  }
                >
                  {isPending
                    ? 'Seu plano foi solicitado e está aguardando confirmação de pagamento ou aprovação do admin REIM.'
                    : 'Seu teste grátis expirou ou você ainda não possui um plano ativo.'}
                </p>

                <div className="mt-5 rounded-[22px] bg-white/75 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-bold text-gray-500">
                      Fornecedor
                    </span>
                    <strong className="line-clamp-1 text-right text-sm">
                      {supplier?.business_name || 'Fornecedor'}
                    </strong>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-xs font-bold text-gray-500">
                      Plano
                    </span>
                    <strong className="text-sm">
                      {getPlanLabel(subscription?.plan)}
                    </strong>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-xs font-bold text-gray-500">
                      Status
                    </span>
                    <strong className="text-sm">
                      {getStatusLabel(subscription?.status)}
                    </strong>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-xs font-bold text-gray-500">
                      Vencimento
                    </span>
                    <strong className="text-sm">
                      {formatDate(subscription?.due_date)}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <Link
                  href="/painel-fornecedor/planos"
                  className="flex items-center justify-center gap-2 rounded-[24px] bg-[#e3a925] py-4 text-center font-extrabold text-white shadow-lg"
                >
                  <Crown size={21} />
                  {isPending ? 'Ver plano solicitado' : 'Escolher plano'}
                </Link>

                <Link
                  href="/"
                  className="flex items-center justify-center gap-2 rounded-[24px] bg-black py-4 text-center font-extrabold text-white shadow-lg"
                >
                  <Home size={21} />
                  Voltar para Home
                </Link>
              </div>

              {isPending && (
                <div className="mt-5 rounded-[22px] bg-white p-4 text-sm leading-5 text-gray-600 ring-1 ring-[#f1e7cf]">
                  <p className="flex items-center gap-2 font-extrabold text-[#151515]">
                    <ShieldCheck size={18} className="text-[#d99200]" />
                    O que acontece agora?
                  </p>

                  <p className="mt-2">
                    Após a confirmação do pagamento, o admin ativa seu plano e o
                    painel do fornecedor será liberado automaticamente.
                  </p>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
