'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  BarChart3,
  Bell,
  Building2,
  CalendarCheck,
  ChevronRight,
  ClipboardCheck,
  Crown,
  FileText,
  FolderKanban,
  Gem,
  LayoutGrid,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  Store,
  UserCheck,
  Users,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

type DashboardStats = {
  suppliers: number;
  clients: number;
  quotes: number;
  activeSubscriptions: number;
  pendingSubscriptions: number;
  trialSubscriptions: number;
  expiredSubscriptions: number;
  categories: number;
  featuredSuppliers: number;
  mrr: number;
};

type PendingSubscription = {
  id: string;
  supplier_id: string | null;
  plan: string | null;
  billing_period: string | null;
  status: string | null;
  value: number | null;
  due_date: string | null;
  suppliers?: {
    business_name?: string | null;
    city?: string | null;
  } | null;
};

const initialStats: DashboardStats = {
  suppliers: 0,
  clients: 0,
  quotes: 0,
  activeSubscriptions: 0,
  pendingSubscriptions: 0,
  trialSubscriptions: 0,
  expiredSubscriptions: 0,
  categories: 0,
  featuredSuppliers: 0,
  mrr: 0,
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);
}

function formatPlan(plan?: string | null) {
  if (plan === 'premium') return 'Premium Destaque';
  if (plan === 'profissional') return 'Profissional';
  if (plan === 'teste_7_dias') return 'Teste grátis';
  if (plan === 'gratuito') return 'Gratuito';
  return 'Plano não informado';
}

function formatPeriod(period?: string | null) {
  if (period === 'mensal') return 'Mensal';
  if (period === 'trimestral') return 'Trimestral';
  if (period === 'anual') return 'Anual';
  return 'Mensal';
}

export default function AdminPage() {
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [pendingSubscriptions, setPendingSubscriptions] = useState<
    PendingSubscription[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const todayText = useMemo(() => {
    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
    }).format(new Date());
  }, []);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function getCount(table: string, filter?: (query: any) => any) {
    let query = supabase.from(table).select('*', {
      count: 'exact',
      head: true,
    });

    if (filter) {
      query = filter(query);
    }

    const { count, error } = await query;

    if (error) {
      console.error(`Erro ao contar ${table}:`, error);
      return 0;
    }

    return count || 0;
  }

  async function loadDashboard() {
    try {
      setLoading(true);
      setErrorMessage('');

      const [
        suppliersCount,
        clientsCount,
        quotesCount,
        activeSubscriptionsCount,
        pendingSubscriptionsCount,
        trialSubscriptionsCount,
        expiredSubscriptionsCount,
        categoriesCount,
        featuredSuppliersCount,
      ] = await Promise.all([
        getCount('suppliers'),
        getCount('profiles'),
        getCount('quote_requests'),
        getCount('supplier_subscriptions', (query) => query.eq('status', 'ativo')),
        getCount('supplier_subscriptions', (query) =>
          query.eq('status', 'pendente')
        ),
        getCount('supplier_subscriptions', (query) => query.eq('status', 'teste')),
        getCount('supplier_subscriptions', (query) =>
          query.in('status', ['expirado', 'cancelado'])
        ),
        getCount('categories'),
        getCount('suppliers', (query) => query.eq('is_featured', true)),
      ]);

      const { data: activeSubscriptions, error: activeError } = await supabase
        .from('supplier_subscriptions')
        .select('value,billing_period,status')
        .eq('status', 'ativo');

      if (activeError) {
        console.error('Erro ao calcular MRR:', activeError);
      }

      const mrr =
        activeSubscriptions?.reduce((total: number, item: any) => {
          const value = Number(item?.value || 0);
          const period = item?.billing_period || 'mensal';

          if (period === 'trimestral') return total + value / 3;
          if (period === 'anual') return total + value / 12;

          return total + value;
        }, 0) || 0;

      const { data: pendingData, error: pendingError } = await supabase
        .from('supplier_subscriptions')
        .select(
          `
          id,
          supplier_id,
          plan,
          billing_period,
          status,
          value,
          due_date,
          suppliers (
            business_name,
            city
          )
        `
        )
        .eq('status', 'pendente')
        .order('updated_at', { ascending: false })
        .limit(5);

      if (pendingError) {
        console.error('Erro ao buscar pendências:', pendingError);
      }

      setStats({
        suppliers: suppliersCount,
        clients: clientsCount,
        quotes: quotesCount,
        activeSubscriptions: activeSubscriptionsCount,
        pendingSubscriptions: pendingSubscriptionsCount,
        trialSubscriptions: trialSubscriptionsCount,
        expiredSubscriptions: expiredSubscriptionsCount,
        categories: categoriesCount,
        featuredSuppliers: featuredSuppliersCount,
        mrr,
      });

      setPendingSubscriptions((pendingData || []) as PendingSubscription[]);
    } catch (error: any) {
      console.error('Erro ao carregar painel admin:', error);
      setErrorMessage(
        error?.message || 'Não foi possível carregar o painel administrativo.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-[#151515]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#fbf7f1] pb-24 shadow-2xl">
        <section className="relative overflow-hidden rounded-b-[34px] bg-black px-6 pb-8 pt-7 text-white">
          <div className="absolute inset-0 bg-[url('/layout01-fundo.png')] bg-cover bg-center opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/85 to-black" />

          <div className="relative z-10">
            <Link
              href="/perfil"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#e3a925]"
            >
              ← Voltar
            </Link>

            <div className="mt-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e3a925] text-white shadow-lg">
                  <ShieldCheck size={31} />
                </div>

                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#e3a925]">
                    Área do dono
                  </p>

                  <h1 className="font-serif text-[31px] leading-tight">
                    Admin REIM
                  </h1>

                  <p className="mt-1 text-sm text-white/70">
                    Aprovações, liberações, cadastros e relatórios.
                  </p>
                </div>
              </div>

              <Link
                href="/admin/assinaturas"
                className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[#e3a925] ring-1 ring-white/10"
                title="Pendências"
              >
                <Bell size={24} />

                {stats.pendingSubscriptions > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-extrabold text-white">
                    {stats.pendingSubscriptions}
                  </span>
                )}
              </Link>
            </div>

            <div className="mt-5 rounded-[26px] bg-white/10 p-4 ring-1 ring-white/10">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#e3a925]">
                Hoje
              </p>
              <p className="mt-1 text-sm font-bold capitalize text-white/80">
                {todayText}
              </p>
            </div>
          </div>
        </section>

        <section className="px-6 pt-6">
          {loading && (
            <div className="rounded-[28px] bg-white p-5 text-center shadow-sm ring-1 ring-[#f1e7cf]">
              <Loader2 className="mx-auto animate-spin text-[#d99200]" size={32} />
              <p className="mt-3 text-sm font-bold text-gray-500">
                Carregando painel administrativo...
              </p>
            </div>
          )}

          {!loading && errorMessage && (
            <div className="rounded-[24px] bg-red-50 p-4 text-sm font-bold leading-5 text-red-700 ring-1 ring-red-100">
              {errorMessage}
            </div>
          )}

          {!loading && (
            <>
              {stats.pendingSubscriptions > 0 && (
                <Link
                  href="/admin/assinaturas"
                  className="mb-5 flex items-center gap-4 rounded-[30px] border-2 border-[#e3a925] bg-[#fff7e8] p-5 shadow-lg"
                >
                  <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#e3a925] text-white">
                    <Bell size={28} />
                    <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-extrabold text-white">
                      {stats.pendingSubscriptions}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="text-base font-extrabold">
                      Aprovação pendente
                    </h2>
                    <p className="mt-1 text-xs font-bold leading-5 text-[#8a6100]">
                      {stats.pendingSubscriptions} plano(s) aguardando conferência
                      de pagamento/liberação.
                    </p>
                  </div>

                  <ChevronRight className="shrink-0 text-[#d99200]" size={22} />
                </Link>
              )}

              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  icon={<ClipboardCheck size={23} />}
                  label="Pendências"
                  value={stats.pendingSubscriptions}
                  detail="aprovações"
                  href="/admin/assinaturas"
                  highlight={stats.pendingSubscriptions > 0}
                />

                <StatCard
                  icon={<Crown size={23} />}
                  label="Assinaturas"
                  value={stats.activeSubscriptions}
                  detail="ativas"
                  href="/admin/assinaturas"
                />

                <StatCard
                  icon={<Building2 size={23} />}
                  label="Fornecedores"
                  value={stats.suppliers}
                  detail="cadastrados"
                  href="/admin/fornecedores"
                />

                <StatCard
                  icon={<Users size={23} />}
                  label="Usuários"
                  value={stats.clients}
                  detail="perfis"
                  href="#clientes"
                />

                <StatCard
                  icon={<FileText size={23} />}
                  label="Orçamentos"
                  value={stats.quotes}
                  detail="solicitados"
                  href="/admin/orcamentos"
                />

                <StatCard
                  icon={<BarChart3 size={23} />}
                  label="MRR"
                  value={formatCurrency(stats.mrr)}
                  detail="receita mensal"
                  href="/admin/assinaturas"
                />
              </div>

              <SectionTitle title="Ações administrativas" subtitle="Atalhos do dono do app" />

              <div className="space-y-3">
                <AdminAction
                  href="/admin/assinaturas"
                  icon={<Bell size={24} />}
                  title="Aprovações e liberações"
                  description="Aprovar pagamentos pendentes, ativar, cancelar ou expirar planos."
                  badge={
                    stats.pendingSubscriptions > 0
                      ? `${stats.pendingSubscriptions} pendente(s)`
                      : 'ok'
                  }
                  danger={stats.pendingSubscriptions > 0}
                />

                <AdminAction
                  href="/admin/fornecedores"
                  icon={<Store size={24} />}
                  title="Cadastros de fornecedores"
                  description="Ver fornecedores cadastrados, status, cidade, categoria e vitrines."
                  badge={`${stats.suppliers}`}
                />

                <AdminAction
                  href="#clientes"
                  icon={<UserCheck size={24} />}
                  title="Cadastros de clientes"
                  description="Próxima tela: consultar clientes cadastrados e histórico básico."
                  badge={`${stats.clients}`}
                  disabled
                />

                <AdminAction
                  href="/admin/orcamentos"
                  icon={<CalendarCheck size={24} />}
                  title="Orçamentos e eventos"
                  description="Acompanhar pedidos de orçamento e movimentação da plataforma."
                  badge={`${stats.quotes}`}
                />
              </div>

              <SectionTitle title="Vitrines e categorias" subtitle="Organização do marketplace" />

              <div className="space-y-3">
                <AdminAction
                  href="/admin/categorias"
                  icon={<LayoutGrid size={24} />}
                  title="Categorias"
                  description="Gerenciar categorias usadas na busca e nas vitrines."
                  badge={`${stats.categories}`}
                />

                <AdminAction
                  href="#vitrines"
                  icon={<Gem size={24} />}
                  title="Vitrines por categoria"
                  description="Próxima tela: ver fornecedores agrupados por categoria e destaque."
                  badge={`${stats.featuredSuppliers} destaque(s)`}
                  disabled
                />
              </div>

              <SectionTitle title="Relatórios" subtitle="Visão de crescimento" />

              <div className="space-y-3">
                <AdminAction
                  href="#relatorios"
                  icon={<BarChart3 size={24} />}
                  title="Relatórios do app"
                  description="Próxima tela: receita, planos, leads, orçamentos e fornecedores."
                  badge="em breve"
                  disabled
                />

                <AdminAction
                  href="/seguranca"
                  icon={<LockKeyhole size={24} />}
                  title="Segurança e LGPD"
                  description="Consultar página pública de segurança, boas práticas e proteção de dados."
                  badge="ativo"
                />
              </div>

              {pendingSubscriptions.length > 0 && (
                <>
                  <SectionTitle
                    title="Últimas pendências"
                    subtitle="Pagamentos aguardando aprovação"
                  />

                  <div className="space-y-3">
                    {pendingSubscriptions.map((item) => (
                      <Link
                        key={item.id}
                        href="/admin/assinaturas"
                        className="block rounded-[26px] bg-white p-4 shadow-sm ring-1 ring-[#f1e7cf]"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-extrabold">
                              {item.suppliers?.business_name || 'Fornecedor'}
                            </h3>

                            <p className="mt-1 text-xs font-bold text-gray-500">
                              {formatPlan(item.plan)} • {formatPeriod(item.billing_period)}
                            </p>

                            <p className="mt-1 text-xs font-bold text-[#d99200]">
                              {formatCurrency(Number(item.value || 0))}
                            </p>
                          </div>

                          <span className="rounded-full bg-yellow-100 px-3 py-1 text-[10px] font-extrabold uppercase text-yellow-800">
                            Pendente
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </section>

        <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-[430px] -translate-x-1/2 border-t border-[#f1e7cf] bg-white/95 px-4 py-3 shadow-[0_-8px_25px_rgba(0,0,0,.08)] backdrop-blur">
          <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-extrabold text-gray-500">
            <Link href="/admin" className="rounded-2xl bg-[#151515] px-2 py-2 text-white">
              Painel
            </Link>

            <Link href="/admin/assinaturas" className="relative rounded-2xl px-2 py-2">
              Assin.
              {stats.pendingSubscriptions > 0 && (
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-600" />
              )}
            </Link>

            <Link href="/admin/fornecedores" className="rounded-2xl px-2 py-2">
              Fornec.
            </Link>

            <Link href="/admin/orcamentos" className="rounded-2xl px-2 py-2">
              Orçam.
            </Link>
          </div>
        </nav>
      </div>
    </main>
  );
}

function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-3 mt-7">
      <h2 className="text-lg font-extrabold">{title}</h2>
      <p className="mt-1 text-xs font-bold text-gray-500">{subtitle}</p>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  detail,
  href,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  detail: string;
  href: string;
  highlight?: boolean;
}) {
  const content = (
    <div
      className={
        highlight
          ? 'relative min-h-[132px] rounded-[28px] border-2 border-[#e3a925] bg-[#fff7e8] p-4 shadow-sm'
          : 'relative min-h-[132px] rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-[#f1e7cf]'
      }
    >
      <div
        className={
          highlight
            ? 'flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e3a925] text-white'
            : 'flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff7e8] text-[#d99200]'
        }
      >
        {icon}
      </div>

      <p className="mt-5 text-2xl font-black">{value}</p>

      <p className="mt-1 text-xs font-extrabold text-gray-500">
        {label} • {detail}
      </p>

      {highlight && (
        <span className="absolute right-3 top-3 rounded-full bg-red-600 px-2 py-1 text-[10px] font-extrabold text-white">
          !
        </span>
      )}
    </div>
  );

  if (href.startsWith('#')) {
    return <div>{content}</div>;
  }

  return <Link href={href}>{content}</Link>;
}

function AdminAction({
  href,
  icon,
  title,
  description,
  badge,
  danger = false,
  disabled = false,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  badge: string;
  danger?: boolean;
  disabled?: boolean;
}) {
  const content = (
    <div
      className={
        disabled
          ? 'flex items-center gap-4 rounded-[26px] bg-white/70 p-4 opacity-75 shadow-sm ring-1 ring-[#f1e7cf]'
          : danger
            ? 'flex items-center gap-4 rounded-[26px] border-2 border-[#e3a925] bg-[#fff7e8] p-4 shadow-sm'
            : 'flex items-center gap-4 rounded-[26px] bg-white p-4 shadow-sm ring-1 ring-[#f1e7cf]'
      }
    >
      <div
        className={
          danger
            ? 'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e3a925] text-white'
            : 'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#fff7e8] text-[#d99200]'
        }
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-extrabold">{title}</h3>

          <span
            className={
              danger
                ? 'shrink-0 rounded-full bg-red-600 px-2 py-1 text-[10px] font-extrabold text-white'
                : 'shrink-0 rounded-full bg-[#fbf7f1] px-2 py-1 text-[10px] font-extrabold text-gray-500 ring-1 ring-[#f1e7cf]'
            }
          >
            {badge}
          </span>
        </div>

        <p className="mt-1 text-xs font-bold leading-5 text-gray-500">
          {description}
        </p>
      </div>

      {!disabled && <ChevronRight className="shrink-0 text-[#d99200]" size={21} />}
    </div>
  );

  if (disabled || href.startsWith('#')) {
    return <div>{content}</div>;
  }

  return <Link href={href}>{content}</Link>;
}
