'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Copy,
  Crown,
  Home,
  Loader2,
  MessageCircle,
  QrCode,
  ShieldCheck,
  WalletCards,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Dados temporários para TESTE. Depois vamos trocar pela conta Mercado Pago com CNPJ do REIM
const ADMIN_WHATSAPP = '5573999093801';
const PIX_KEY = '73999093801';
const PIX_RECEIVER = 'Ronivaldo Costa Pinheiro';
const PIX_BANK = 'Mercado Pago';

function formatDate(date?: string) {
  if (!date) return 'Não informado';

  const [year, month, day] = String(date).split('-');

  if (!year || !month || !day) return date;

  return `${day}/${month}/${year}`;
}

function formatMoney(value?: number | string | null) {
  const amount = Number(value || 0);

  return amount.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
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

function getBillingLabel(period?: string) {
  if (period === 'trimestral') return 'Trimestral';
  if (period === 'anual') return 'Anual';
  return 'Mensal';
}

function safeText(value?: string | null) {
  return value && String(value).trim() ? value : 'Fornecedor';
}

export default function PainelFornecedorPendentePage() {
  const [loading, setLoading] = useState(true);
  const [supplier, setSupplier] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [copied, setCopied] = useState(false);

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

  const whatsappMessage = useMemo(() => {
    const supplierName = safeText(supplier?.business_name);
    const plan = getPlanLabel(subscription?.plan);
    const period = getBillingLabel(subscription?.billing_period);
    const value = formatMoney(subscription?.value);

    return encodeURIComponent(
      `Olá, equipe REIM. Sou fornecedor(a) ${supplierName}. Solicitei o plano ${plan}, período ${period}, valor ${value}. Já realizei ou quero realizar o pagamento para ativação da minha vitrine.`
    );
  }, [supplier, subscription]);

  const whatsappUrl = `https://wa.me/${ADMIN_WHATSAPP}?text=${whatsappMessage}`;

  async function copyPixKey() {
    try {
      await navigator.clipboard.writeText(PIX_KEY);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2500);
    } catch (error) {
      console.error('Erro ao copiar PIX:', error);
      alert('Não foi possível copiar a chave PIX. Copie manualmente.');
    }
  }

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
                    ? 'Seu plano foi solicitado. Após o pagamento e confirmação do admin, seu painel será liberado automaticamente.'
                    : 'Seu teste grátis expirou ou você ainda não possui um plano ativo.'}
                </p>

                <div className="mt-5 rounded-[22px] bg-white/75 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-bold text-gray-500">
                      Fornecedor
                    </span>
                    <strong className="line-clamp-1 text-right text-sm">
                      {safeText(supplier?.business_name)}
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
                      Período
                    </span>
                    <strong className="text-sm">
                      {getBillingLabel(subscription?.billing_period)}
                    </strong>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-xs font-bold text-gray-500">
                      Valor
                    </span>
                    <strong className="text-sm">
                      {formatMoney(subscription?.value)}
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

              {isPending && (
                <div className="mt-5 rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-[#f1e7cf]">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#fff7e8] text-[#d99200]">
                      <WalletCards size={27} />
                    </div>

                    <div>
                      <h2 className="text-lg font-extrabold">
                        Como realizar o pagamento
                      </h2>
                      <p className="mt-1 text-sm leading-5 text-gray-600">
                        Efetue o pagamento via PIX e envie o comprovante para o
                        atendimento REIM. Após conferência, o admin ativa seu plano.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-[22px] bg-[#fbf7f1] p-4 ring-1 ring-[#f1e7cf]">
                    <div className="flex items-center gap-2 text-sm font-extrabold text-[#151515]">
                      <QrCode size={18} className="text-[#d99200]" />
                      Dados para PIX
                    </div>

                    <div className="mt-4 space-y-3">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400">
                          Favorecido
                        </p>
                        <p className="mt-1 text-sm font-extrabold">
                          {PIX_RECEIVER}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400">
                          Instituição
                        </p>
                        <p className="mt-1 text-sm font-extrabold">
                          {PIX_BANK}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400">
                          Chave PIX
                        </p>
                        <div className="mt-1 rounded-2xl bg-white px-3 py-3 text-xs font-extrabold leading-5 text-[#151515] ring-1 ring-[#f1e7cf]">
                          {PIX_KEY}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={copyPixKey}
                        className="flex w-full items-center justify-center gap-2 rounded-[20px] bg-black py-3 text-sm font-extrabold text-white"
                      >
                        {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                        {copied ? 'Chave copiada' : 'Copiar chave PIX'}
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 rounded-[22px] bg-green-50 p-4 ring-1 ring-green-100">
                    <p className="flex items-center gap-2 text-sm font-extrabold text-green-800">
                      <ShieldCheck size={18} />
                      Enviar comprovante
                    </p>

                    <p className="mt-2 text-sm leading-5 text-green-800">
                      Depois do pagamento, envie o comprovante no WhatsApp para
                      agilizar a liberação do painel.
                    </p>

                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-[20px] bg-green-600 py-3 text-sm font-extrabold text-white shadow-sm"
                    >
                      <MessageCircle size={18} />
                      Enviar comprovante no WhatsApp
                    </a>
                  </div>
                </div>
              )}

              <div className="mt-5 space-y-3">
                <Link
                  href="/painel-fornecedor/planos"
                  className="flex items-center justify-center gap-2 rounded-[24px] bg-[#e3a925] py-4 text-center font-extrabold text-white shadow-lg"
                >
                  <Crown size={21} />
                  {isPending ? 'Ver ou trocar plano solicitado' : 'Escolher plano'}
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

                  <div className="mt-3 space-y-2">
                    <p className="flex gap-2">
                      <span className="font-extrabold text-[#d99200]">1.</span>
                      Faça o pagamento via PIX.
                    </p>
                    <p className="flex gap-2">
                      <span className="font-extrabold text-[#d99200]">2.</span>
                      Envie o comprovante para o WhatsApp REIM.
                    </p>
                    <p className="flex gap-2">
                      <span className="font-extrabold text-[#d99200]">3.</span>
                      O admin confirma e ativa seu plano.
                    </p>
                    <p className="flex gap-2">
                      <span className="font-extrabold text-[#d99200]">4.</span>
                      Seu painel, leads, mídias e vitrine são liberados.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
