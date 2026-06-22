'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  BarChart3,
  Bell,
  Briefcase,
  CheckCircle2,
  Crown,
  FileText,
  Loader2,
  MessageCircle,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Star,
  Users,
  WalletCards,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const recentSuppliers = [
  {
    name: 'Studio Premium',
    category: 'Fotografia & Filmagem',
    status: 'Aprovado',
    premium: true,
  },
  {
    name: 'Photofest Totem',
    category: 'Cabine & Totem',
    status: 'Aprovado',
    premium: true,
  },
  {
    name: 'Sabor Eventos',
    category: 'Buffet',
    status: 'Pendente',
    premium: false,
  },
];

function formatMoney(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [suppliersCount, setSuppliersCount] = useState(0);
  const [activeSubscriptionsCount, setActiveSubscriptionsCount] = useState(0);
  const [pendingSubscriptionsCount, setPendingSubscriptionsCount] = useState(0);
  const [quoteRequestsCount, setQuoteRequestsCount] = useState(0);
  const [mrr, setMrr] = useState(0);

  useEffect(() => {
    loadAdminStats();
  }, []);

  async function loadAdminStats() {
    try {
      setLoading(true);

      const [
        suppliersResult,
        subscriptionsResult,
        pendingSubscriptionsResult,
        quoteRequestsResult,
        activeSubscriptionsResult,
      ] = await Promise.all([
        supabase.from('suppliers').select('id', { count: 'exact', head: true }),

        supabase
          .from('supplier_subscriptions')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'ativo'),

        supabase
          .from('supplier_subscriptions')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pendente'),

        supabase.from('quote_requests').select('id', { count: 'exact', head: true }),

        supabase
          .from('supplier_subscriptions')
          .select('value')
          .eq('status', 'ativo'),
      ]);

      setSuppliersCount(suppliersResult.count || 0);
      setActiveSubscriptionsCount(subscriptionsResult.count || 0);
      setPendingSubscriptionsCount(pendingSubscriptionsResult.count || 0);
      setQuoteRequestsCount(quoteRequestsResult.count || 0);

      const monthlyRevenue = (activeSubscriptionsResult.data || []).reduce(
        (total, item: any) => total + Number(item.value || 0),
        0
      );

      setMrr(monthlyRevenue);
    } catch (error) {
      console.error('Erro ao carregar indicadores do Admin:', error);
    } finally {
      setLoading(false);
    }
  }

  const stats = [
    {
      title: 'Fornecedores',
      value: loading ? '...' : String(suppliersCount),
      desc: 'cadastrados',
      icon: Briefcase,
      color: 'text-[#d99200]',
    },
    {
      title: 'Assinaturas',
      value: loading ? '...' : String(activeSubscriptionsCount),
      desc:
        pendingSubscriptionsCount > 0
          ? `${pendingSubscriptionsCount} pendente(s)`
          : 'ativas',
      icon: Crown,
      color:
        pendingSubscriptionsCount > 0 ? 'text-[#d99200]' : 'text-blue-600',
      alert: pendingSubscriptionsCount > 0,
    },
    {
      title: 'Orçamentos',
      value: loading ? '...' : String(quoteRequestsCount),
      desc: 'solicitados',
      icon: MessageCircle,
      color: 'text-green-600',
    },
    {
      title: 'MRR',
      value: loading ? '...' : formatMoney(mrr),
      desc: 'receita mensal',
      icon: WalletCards,
      color: 'text-[#d99200]',
    },
  ];

  const actions = [
    {
      title: 'Fornecedores',
      desc: 'Aprovar, editar e destacar vitrines',
      href: '/admin/fornecedores',
      icon: Briefcase,
    },
    {
      title: 'Assinaturas',
      desc:
        pendingSubscriptionsCount > 0
          ? `${pendingSubscriptionsCount} plano(s) aguardando aprovação`
          : 'Acompanhar planos ativos',
      href: '/admin/assinaturas',
      icon: Crown,
      alert: pendingSubscriptionsCount > 0,
    },
    {
      title: 'Orçamentos',
      desc: 'Ver solicitações e respostas',
      href: '/admin/orcamentos',
      icon: FileText,
    },
    {
      title: 'Categorias',
      desc: 'Gerenciar tipos de serviço',
      href: '/admin/categorias',
      icon: Settings,
    },
  ];

  return (
    <main className="min-h-screen bg-black text-[#151515]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#fbf7f1] pb-10 shadow-2xl">
        {/* TOPO */}
        <section className="relative overflow-hidden rounded-b-[34px] bg-black px-6 pb-8 pt-7 text-white">
          <div className="absolute inset-0 bg-[url('/layout01-fundo.png')] bg-cover bg-center opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/85 to-black" />

          <div className="relative z-10">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#e3a925]"
            >
              <ArrowLeft size={17} />
              Voltar
            </Link>

            <div className="mt-6 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e3a925] text-white shadow-lg">
                <ShieldCheck size={31} />
              </div>

              <div>
                <p className="text-sm font-bold text-[#e3a925]">
                  Administração
                </p>

                <h1 className="font-serif text-[34px] leading-tight">
                  Admin REIM
                </h1>

                <p className="mt-1 text-sm text-white/70">
                  Controle geral da plataforma
                </p>
              </div>
            </div>

            {pendingSubscriptionsCount > 0 && (
              <Link
                href="/admin/assinaturas"
                className="mt-6 flex items-center gap-3 rounded-[24px] bg-[#fff7e8] p-4 text-[#151515] shadow-2xl ring-2 ring-[#e3a925]"
              >
                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e3a925] text-white">
                  <Bell size={25} />
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-extrabold text-white">
                    {pendingSubscriptionsCount}
                  </span>
                </div>

                <div className="flex-1">
                  <p className="text-sm font-extrabold">
                    Plano aguardando aprovação
                  </p>
                  <p className="mt-1 text-xs leading-4 text-gray-600">
                    {pendingSubscriptionsCount} assinatura(s) pendente(s) de
                    pagamento/aprovação.
                  </p>
                </div>

                <ShieldAlert size={22} className="text-[#d99200]" />
              </Link>
            )}
          </div>
        </section>

        {/* INDICADORES */}
        <section className="grid grid-cols-2 gap-4 px-6 pt-6">
          {stats.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className={
                  item.alert
                    ? 'relative rounded-[26px] bg-white p-5 shadow-[0_10px_25px_rgba(217,119,6,.20)] ring-2 ring-[#e3a925]'
                    : 'rounded-[26px] bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,.08)] ring-1 ring-[#f1e7cf]'
                }
              >
                {item.alert && (
                  <span className="absolute right-3 top-3 flex h-6 min-w-6 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-extrabold text-white">
                    {pendingSubscriptionsCount}
                  </span>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff7e8]">
                    <Icon size={26} className={item.color} />
                  </div>

                  {loading ? (
                    <Loader2 size={18} className="animate-spin text-gray-300" />
                  ) : (
                    <BarChart3 size={18} className="text-gray-300" />
                  )}
                </div>

                <p className="mt-4 text-2xl font-extrabold">{item.value}</p>
                <p
                  className={
                    item.alert
                      ? 'mt-1 text-xs font-extrabold text-[#b97900]'
                      : 'mt-1 text-xs font-bold text-gray-500'
                  }
                >
                  {item.title} • {item.desc}
                </p>
              </div>
            );
          })}
        </section>

        {/* AÇÕES */}
        <section className="px-6 pt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-extrabold">Ações administrativas</h2>
            <span className="text-xs font-bold text-gray-500">Gerenciar</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {actions.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  href={item.href}
                  key={item.title}
                  className={
                    item.alert
                      ? 'relative rounded-[26px] bg-[#fff7e8] p-5 shadow-[0_10px_25px_rgba(217,119,6,.20)] ring-2 ring-[#e3a925]'
                      : 'rounded-[26px] bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,.08)] ring-1 ring-[#f1e7cf]'
                  }
                >
                  {item.alert && (
                    <span className="absolute right-3 top-3 flex h-6 min-w-6 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-extrabold text-white">
                      {pendingSubscriptionsCount}
                    </span>
                  )}

                  <div
                    className={
                      item.alert
                        ? 'flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e3a925] text-white'
                        : 'flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white'
                    }
                  >
                    <Icon size={25} />
                  </div>

                  <h3 className="mt-4 text-sm font-extrabold">
                    {item.title}
                  </h3>

                  <p
                    className={
                      item.alert
                        ? 'mt-1 text-xs font-bold leading-4 text-[#b97900]'
                        : 'mt-1 text-xs leading-4 text-gray-500'
                    }
                  >
                    {item.desc}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* FORNECEDORES RECENTES */}
        <section className="px-6 pt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-extrabold">Fornecedores recentes</h2>

            <Link
              href="/admin/fornecedores"
              className="text-xs font-bold text-[#d99200]"
            >
              Ver todos
            </Link>
          </div>

          <div className="space-y-4">
            {recentSuppliers.map((supplier) => (
              <div
                key={supplier.name}
                className="rounded-[28px] bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,.08)] ring-1 ring-[#f1e7cf]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-extrabold">
                      {supplier.name}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      {supplier.category}
                    </p>
                  </div>

                  {supplier.status === 'Aprovado' ? (
                    <span className="flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-[11px] font-extrabold text-green-700">
                      <CheckCircle2 size={13} />
                      Aprovado
                    </span>
                  ) : (
                    <span className="rounded-full bg-[#fff7e8] px-3 py-1 text-[11px] font-extrabold text-[#b97900]">
                      Pendente
                    </span>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-sm font-bold text-[#d99200]">
                    <Star size={15} fill="#e3a925" className="text-[#e3a925]" />
                    {supplier.premium ? 'Premium' : 'Básico'}
                  </span>

                  <div className="flex gap-2">
                    <Link
                      href="/admin/fornecedores"
                      className="rounded-full bg-[#fbf7f1] px-4 py-2 text-xs font-extrabold text-[#151515] ring-1 ring-[#f1e7cf]"
                    >
                      Editar
                    </Link>

                    <Link
                      href="/admin/fornecedores"
                      className="rounded-full bg-black px-4 py-2 text-xs font-extrabold text-white"
                    >
                      Destacar
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* RESUMO FINAL */}
        <section className="px-6 pt-6">
          <div className="rounded-[28px] bg-black p-5 text-white shadow-xl">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e3a925] text-white">
                <Users size={30} />
              </div>

              <div className="flex-1">
                <h2 className="text-lg font-extrabold">Status da plataforma</h2>

                <p className="mt-2 text-sm leading-5 text-white/70">
                  Plataforma ativa, fornecedores em crescimento e orçamentos
                  sendo acompanhados dentro do REIM EVENTOS.
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Link
                    href="/admin/fornecedores"
                    className="rounded-full bg-[#e3a925] px-3 py-2 text-center text-[11px] font-extrabold text-white"
                  >
                    Fornecedores
                  </Link>

                  <Link
                    href="/admin/assinaturas"
                    className={
                      pendingSubscriptionsCount > 0
                        ? 'relative rounded-full bg-[#e3a925] px-3 py-2 text-center text-[11px] font-extrabold text-white'
                        : 'rounded-full bg-white px-3 py-2 text-center text-[11px] font-extrabold text-[#151515]'
                    }
                  >
                    Assinaturas
                    {pendingSubscriptionsCount > 0 && (
                      <span className="absolute -right-1 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-extrabold text-white">
                        {pendingSubscriptionsCount}
                      </span>
                    )}
                  </Link>

                  <Link
                    href="/admin/orcamentos"
                    className="rounded-full bg-white px-3 py-2 text-center text-[11px] font-extrabold text-[#151515]"
                  >
                    Orçamentos
                  </Link>

                  <Link
                    href="/admin/categorias"
                    className="rounded-full bg-white px-3 py-2 text-center text-[11px] font-extrabold text-[#151515]"
                  >
                    Categorias
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
