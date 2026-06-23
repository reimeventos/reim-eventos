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
  Grid3X3,
  LayoutDashboard,
  Loader2,
  LockKeyhole,
  LogOut,
  Settings,
  ShieldCheck,
  Store,
  UserCheck,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
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
  if (plan === 'premium') return 'Premium';
  if (plan === 'profissional') return 'Profissional';
  if (plan === 'teste_7_dias') return 'Teste grátis';
  if (plan === 'gratuito') return 'Gratuito';
  return 'Plano';
}

function formatPeriod(period?: string | null) {
  if (period === 'mensal') return 'Mensal';
  if (period === 'trimestral') return 'Trimestral';
  if (period === 'anual') return 'Anual';
  return 'Mensal';
}

export default function AdminPage() {
  const router = useRouter();

  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [pendingSubscriptions, setPendingSubscriptions] = useState<
    PendingSubscription[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const todayText = useMemo(() => {
    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
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
        .limit(3);

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

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-black text-[#151515]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#f7f2ea] pb-24 shadow-2xl">
        <section className="relative overflow-hidden rounded-b-[28px] bg-black px-5 pb-5 pt-5 text-white">
          <div className="absolute inset-0 bg-[url('/layout01-fundo.png')] bg-cover bg-center opacity-35" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/90 to-black" />

          <div className="relative z-10">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e3a925] text-white shadow-lg">
                  <ShieldCheck size={24} />
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#e3a925]">
                    Área Administrativa
                  </p>

                  <h1 className="font-serif text-[26px] leading-tight">
                    Admin REIM
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/admin/assinaturas"
                  className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-[#e3a925] ring-1 ring-white/10"
                  title="Pendências"
                >
                  <Bell size={21} />

                  {stats.pendingSubscriptions > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-extrabold text-white">
                      {stats.pendingSubscriptions}
                    </span>
                  )}
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-white/80 ring-1 ring-white/10"
                  title="Sair"
                >
                  <LogOut size={19} />
                </button>
              </div>
            </div>

            <div className="mt-4 rounded-[22px] bg-white/10 px-4 py-3 ring-1 ring-white/10">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#e3a925]">
                    Visão geral
                  </p>
                  <p className="mt-1 text-xs font-bold capitalize text-white/75">
                    {todayText}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-lg font-black">{formatCurrency(stats.mrr)}</p>
                  <p className="text-[10px] font-bold text-white/55">MRR</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 pt-5">
          {loading && (
            <div className="rounded-[24px] bg-white p-5 text-center shadow-sm ring-1 ring-[#f1e7cf]">
              <Loader2 className="mx-auto animate-spin text-[#d99200]" size={28} />
              <p className="mt-3 text-sm font-bold text-gray-500">
                Carregando administração...
              </p>
            </div>
          )}

          {!loading && errorMessage && (
            <div className="rounded-[22px] bg-red-50 p-4 text-sm font-bold leading-5 text-red-700 ring-1 ring-red-100">
              {errorMessage}
            </div>
          )}

          {!loading && (
            <>
              {stats.pendingSubscriptions > 0 && (
                <Link
                  href="/admin/assinaturas"
                  className="mb-4 flex items-center gap-3 rounded-[24px] border border-[#e3a925] bg-[#fff7e8] p-4 shadow-sm"
                >
                  <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e3a925] text-white">
                    <Bell size={22} />
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-extrabold text-white">
                      {stats.pendingSubscriptions}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="text-sm font-black">Aprovação pendente</h2>
                    <p className="mt-1 text-[11px] font-bold leading-4 text-[#8a6100]">
                      Plano aguardando conferência de pagamento.
                    </p>
                  </div>

                  <ChevronRight className="shrink-0 text-[#d99200]" size={20} />
                </Link>
              )}

              <div className="grid grid-cols-4 gap-2">
                <MiniStat
                  label="Pend."
                  value={stats.pendingSubscriptions}
                  active={stats.pendingSubscriptions > 0}
                />
                <MiniStat label="Ativas" value={stats.activeSubscriptions} />
                <MiniStat label="Fornec." value={stats.suppliers} />
                <MiniStat label="Clientes" value={stats.clients} />
              </div>

              <SectionTitle title="Menu administrativo" />

              <div className="grid grid-cols-3 gap-3">
                <AdminIcon
                  href="/admin/assinaturas"
                  icon={<ClipboardCheck size={24} />}
                  title="Aprovar"
                  badge={stats.pendingSubscriptions}
                  active={stats.pendingSubscriptions > 0}
                />

                <AdminIcon
                  href="/admin/assinaturas"
                  icon={<Crown size={24} />}
                  title="Assinaturas"
                />

                <AdminIcon
                  href="/admin/fornecedores"
                  icon={<Store size={24} />}
                  title="Fornecedores"
                />

                <AdminIcon
                  href="/admin/clientes"
                  icon={<Users size={24} />}
                  title="Clientes"
                />

                <AdminIcon
                  href="/admin/orcamentos"
                  icon={<FileText size={24} />}
                  title="Orçamentos"
                />

                <AdminIcon
                  href="/admin/categorias"
                  icon={<Grid3X3 size={24} />}
                  title="Categorias"
                />

                <AdminIcon
                  href="#vitrines"
                  icon={<Gem size={24} />}
                  title="Vitrines"
                  disabled
                />

                <AdminIcon
                  href="#relatorios"
                  icon={<BarChart3 size={24} />}
                  title="Relatórios"
                  disabled
                />

                <AdminIcon
                  href="/seguranca"
                  icon={<LockKeyhole size={24} />}
                  title="Segurança"
                />
              </div>

              <SectionTitle title="Indicadores rápidos" />

              <div className="grid grid-cols-2 gap-3">
                <InfoCard
                  title="Usuários"
                  value={stats.clients}
                  subtitle="perfis cadastrados"
                  icon={<UserCheck size={20} />}
                />
                <InfoCard
                  title="Categorias"
                  value={stats.categories}
                  subtitle="ativas na busca"
                  icon={<FolderKanban size={20} />}
                />
                <InfoCard
                  title="Testes"
                  value={stats.trialSubscriptions}
                  subtitle="em período grátis"
                  icon={<CalendarCheck size={20} />}
                />
                <InfoCard
                  title="Destaques"
                  value={stats.featuredSuppliers}
                  subtitle="vitrines premium"
                  icon={<Gem size={20} />}
                />
              </div>

              {pendingSubscriptions.length > 0 && (
                <>
                  <SectionTitle title="Pendências recentes" />

                  <div className="space-y-2">
                    {pendingSubscriptions.map((item) => (
                      <Link
                        key={item.id}
                        href="/admin/assinaturas"
                        className="flex items-center gap-3 rounded-[22px] bg-white p-3 shadow-sm ring-1 ring-[#f1e7cf]"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#fff7e8] text-[#d99200]">
                          <AlertCircle size={20} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-xs font-black">
                            {item.suppliers?.business_name || 'Fornecedor'}
                          </h3>

                          <p className="mt-0.5 text-[11px] font-bold text-gray-500">
                            {formatPlan(item.plan)} • {formatPeriod(item.billing_period)}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-xs font-black text-[#d99200]">
                            {formatCurrency(Number(item.value || 0))}
                          </p>
                          <p className="text-[10px] font-bold text-red-600">
                            pendente
                          </p>
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
          <div className="grid grid-cols-5 gap-1 text-center text-[10px] font-extrabold text-gray-500">
            <Link href="/admin" className="rounded-2xl bg-[#151515] px-2 py-2 text-white">
              Admin
            </Link>

            <Link href="/admin/assinaturas" className="relative rounded-2xl px-2 py-2">
              Aprovar
              {stats.pendingSubscriptions > 0 && (
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-600" />
              )}
            </Link>

            <Link href="/admin/fornecedores" className="rounded-2xl px-2 py-2">
              Fornec.
            </Link>

            <Link href="/admin/clientes" className="rounded-2xl px-2 py-2">
              Clientes
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-2xl px-2 py-2"
            >
              Sair
            </button>
          </div>
        </nav>
      </div>
    </main>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="mb-3 mt-6 flex items-center justify-between">
      <h2 className="text-base font-black">{title}</h2>
    </div>
  );
}

function MiniStat({
  label,
  value,
  active = false,
}: {
  label: string;
  value: number | string;
  active?: boolean;
}) {
  return (
    <div
      className={
        active
          ? 'rounded-[18px] border border-[#e3a925] bg-[#fff7e8] px-2 py-3 text-center'
          : 'rounded-[18px] bg-white px-2 py-3 text-center shadow-sm ring-1 ring-[#f1e7cf]'
      }
    >
      <p className={active ? 'text-lg font-black text-red-600' : 'text-lg font-black'}>
        {value}
      </p>
      <p className="mt-0.5 text-[10px] font-extrabold text-gray-500">{label}</p>
    </div>
  );
}

function AdminIcon({
  href,
  icon,
  title,
  badge = 0,
  active = false,
  disabled = false,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  badge?: number;
  active?: boolean;
  disabled?: boolean;
}) {
  const content = (
    <div
      className={
        disabled
          ? 'relative flex min-h-[92px] flex-col items-center justify-center rounded-[24px] bg-white/65 p-3 text-center opacity-70 ring-1 ring-[#f1e7cf]'
          : active
            ? 'relative flex min-h-[92px] flex-col items-center justify-center rounded-[24px] border border-[#e3a925] bg-[#fff7e8] p-3 text-center shadow-sm'
            : 'relative flex min-h-[92px] flex-col items-center justify-center rounded-[24px] bg-white p-3 text-center shadow-sm ring-1 ring-[#f1e7cf]'
      }
    >
      <div
        className={
          active
            ? 'flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e3a925] text-white'
            : 'flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff7e8] text-[#d99200]'
        }
      >
        {icon}
      </div>

      <p className="mt-2 text-[11px] font-black leading-4">{title}</p>

      {badge > 0 && (
        <span className="absolute right-2 top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-black text-white">
          {badge}
        </span>
      )}

      {disabled && (
        <span className="absolute bottom-2 rounded-full bg-[#fbf7f1] px-2 py-0.5 text-[9px] font-black text-gray-400 ring-1 ring-[#f1e7cf]">
          em breve
        </span>
      )}
    </div>
  );

  if (disabled || href.startsWith('#')) {
    return <div>{content}</div>;
  }

  return <Link href={href}>{content}</Link>;
}

function InfoCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: number | string;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-[22px] bg-white p-4 shadow-sm ring-1 ring-[#f1e7cf]">
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#fff7e8] text-[#d99200]">
          {icon}
        </div>
        <p className="text-xl font-black">{value}</p>
      </div>

      <p className="mt-3 text-xs font-black">{title}</p>
      <p className="mt-0.5 text-[11px] font-bold text-gray-500">{subtitle}</p>
    </div>
  );
}
