'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  BarChart3,
  Bell,
  Building2,
  CalendarCheck,
  Crown,
  FileText,
  Gem,
  Grid3X3,
  Loader2,
  TrendingUp,
  Users,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

type ReportStats = {
  clients: number;
  suppliers: number;
  quotes: number;
  activeSubscriptions: number;
  pendingSubscriptions: number;
  trialSubscriptions: number;
  featuredSuppliers: number;
  categories: number;
  mrr: number;
};

const initialStats: ReportStats = {
  clients: 0,
  suppliers: 0,
  quotes: 0,
  activeSubscriptions: 0,
  pendingSubscriptions: 0,
  trialSubscriptions: 0,
  featuredSuppliers: 0,
  categories: 0,
  mrr: 0,
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);
}

export default function AdminRelatoriosPage() {
  const [stats, setStats] = useState<ReportStats>(initialStats);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadReports();
  }, []);

  async function getCount(table: string, filter?: (query: any) => any) {
    let query = supabase.from(table).select('*', {
      count: 'exact',
      head: true,
    });

    if (filter) query = filter(query);

    const { count, error } = await query;

    if (error) {
      console.error(`Erro ao contar ${table}:`, error);
      return 0;
    }

    return count || 0;
  }

  async function loadReports() {
    try {
      setLoading(true);
      setErrorMessage('');

      const [
        clientsCount,
        suppliersCount,
        quotesCount,
        activeSubscriptionsCount,
        pendingSubscriptionsCount,
        trialSubscriptionsCount,
        featuredSuppliersCount,
        categoriesCount,
      ] = await Promise.all([
        getCount('profiles'),
        getCount('suppliers'),
        getCount('quote_requests'),
        getCount('supplier_subscriptions', (query) => query.eq('status', 'ativo')),
        getCount('supplier_subscriptions', (query) => query.eq('status', 'pendente')),
        getCount('supplier_subscriptions', (query) => query.eq('status', 'teste')),
        getCount('suppliers', (query) => query.eq('is_featured', true)),
        getCount('categories'),
      ]);

      const { data: activeSubscriptions, error: activeError } = await supabase
        .from('supplier_subscriptions')
        .select('value,billing_period,status')
        .eq('status', 'ativo');

      if (activeError) console.error('Erro ao calcular MRR:', activeError);

      const mrr =
        activeSubscriptions?.reduce((total: number, item: any) => {
          const value = Number(item?.value || 0);
          const period = item?.billing_period || 'mensal';

          if (period === 'trimestral') return total + value / 3;
          if (period === 'anual') return total + value / 12;

          return total + value;
        }, 0) || 0;

      setStats({
        clients: clientsCount,
        suppliers: suppliersCount,
        quotes: quotesCount,
        activeSubscriptions: activeSubscriptionsCount,
        pendingSubscriptions: pendingSubscriptionsCount,
        trialSubscriptions: trialSubscriptionsCount,
        featuredSuppliers: featuredSuppliersCount,
        categories: categoriesCount,
        mrr,
      });
    } catch (error: any) {
      console.error('Erro ao carregar relatórios:', error);
      setErrorMessage(error?.message || 'Não foi possível carregar os relatórios.');
    } finally {
      setLoading(false);
    }
  }

  const conversionText = useMemo(() => {
    if (!stats.suppliers) return '0%';
    const percentage = (stats.activeSubscriptions / stats.suppliers) * 100;
    return `${percentage.toFixed(1).replace('.', ',')}%`;
  }, [stats.suppliers, stats.activeSubscriptions]);

  return (
    <main className="min-h-screen bg-black text-[#151515]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#f7f2ea] pb-24 shadow-2xl">
        <section className="relative overflow-hidden rounded-b-[28px] bg-black px-5 pb-5 pt-5 text-white">
          <div className="absolute inset-0 bg-[url('/layout01-fundo.png')] bg-cover bg-center opacity-35" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/90 to-black" />

          <div className="relative z-10">
            <Link href="/admin" className="inline-flex items-center gap-2 text-xs font-black text-[#e3a925]">
              <ArrowLeft size={16} />
              Voltar ao Admin
            </Link>

            <div className="mt-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e3a925] text-white shadow-lg">
                <BarChart3 size={23} />
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#e3a925]">
                  Área Administrativa
                </p>
                <h1 className="font-serif text-[28px] leading-tight">Relatórios</h1>
                <p className="mt-1 text-[11px] font-bold text-white/65">
                  Visão geral do crescimento do REIM.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 pt-5">
          {loading && (
            <div className="rounded-[24px] bg-white p-5 text-center shadow-sm ring-1 ring-[#f1e7cf]">
              <Loader2 className="mx-auto animate-spin text-[#d99200]" size={30} />
              <p className="mt-3 text-sm font-bold text-gray-500">Carregando relatórios...</p>
            </div>
          )}

          {!loading && errorMessage && (
            <div className="rounded-[22px] bg-red-50 p-4 text-sm font-bold leading-5 text-red-700 ring-1 ring-red-100">
              {errorMessage}
            </div>
          )}

          {!loading && !errorMessage && (
            <>
              <div className="rounded-[24px] bg-[#151515] p-4 text-white shadow-lg">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#e3a925]">
                      Receita mensal
                    </p>
                    <h2 className="mt-2 text-2xl font-black">{formatCurrency(stats.mrr)}</h2>
                    <p className="mt-1 text-[11px] font-bold text-white/55">
                      MRR estimado com planos ativos.
                    </p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e3a925]">
                    <TrendingUp size={24} />
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <ReportCard icon={<Users size={18} />} title="Clientes" value={stats.clients} subtitle="perfis cadastrados" />
                <ReportCard icon={<Building2 size={18} />} title="Fornecedores" value={stats.suppliers} subtitle="vitrines cadastradas" />
                <ReportCard icon={<FileText size={18} />} title="Orçamentos" value={stats.quotes} subtitle="solicitações criadas" />
                <ReportCard icon={<Crown size={18} />} title="Planos ativos" value={stats.activeSubscriptions} subtitle="assinaturas liberadas" />
                <ReportCard icon={<Bell size={18} />} title="Pendentes" value={stats.pendingSubscriptions} subtitle="aguardando aprovação" highlight={stats.pendingSubscriptions > 0} />
                <ReportCard icon={<CalendarCheck size={18} />} title="Testes grátis" value={stats.trialSubscriptions} subtitle="fornecedores em teste" />
                <ReportCard icon={<Gem size={18} />} title="Destaques" value={stats.featuredSuppliers} subtitle="vitrines premium" />
                <ReportCard icon={<Grid3X3 size={18} />} title="Categorias" value={stats.categories} subtitle="áreas do marketplace" />
              </div>

              <div className="mt-5 rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-[#f1e7cf]">
                <p className="text-sm font-black">Conversão de fornecedores</p>
                <div className="mt-4 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-2xl font-black text-[#d99200]">{conversionText}</p>
                    <p className="mt-1 text-[11px] font-bold leading-5 text-gray-500">
                      Fornecedores com plano ativo sobre o total cadastrado.
                    </p>
                  </div>
                  <Crown size={28} className="shrink-0 text-[#d99200]" />
                </div>
              </div>

              <div className="mt-5 rounded-[24px] bg-[#fff7e8] p-4 text-[#8a6100] ring-1 ring-[#f1e7cf]">
                <p className="text-sm font-black">Próximas melhorias</p>
                <ul className="mt-3 space-y-2 text-xs font-bold leading-5">
                  <li>• gráfico mensal de novos clientes</li>
                  <li>• gráfico mensal de fornecedores</li>
                  <li>• ranking de categorias mais solicitadas</li>
                  <li>• taxa de resposta dos fornecedores</li>
                  <li>• total de orçamentos aceitos</li>
                </ul>
              </div>
            </>
          )}
        </section>

        <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-[430px] -translate-x-1/2 border-t border-[#f1e7cf] bg-white/95 px-4 py-3 shadow-[0_-8px_25px_rgba(0,0,0,.08)] backdrop-blur">
          <div className="grid grid-cols-5 gap-1 text-center text-[10px] font-extrabold text-gray-500">
            <Link href="/admin" className="rounded-2xl px-2 py-2">Home</Link>
            <Link href="/admin/assinaturas" className="rounded-2xl px-2 py-2">Aprovar</Link>
            <Link href="/admin/fornecedores" className="rounded-2xl px-2 py-2">Fornec.</Link>
            <Link href="/admin/clientes" className="rounded-2xl px-2 py-2">Clientes</Link>
            <Link href="/admin/relatorios" className="rounded-2xl bg-[#151515] px-2 py-2 text-white">Relat.</Link>
          </div>
        </nav>
      </div>
    </main>
  );
}

function ReportCard({
  icon,
  title,
  value,
  subtitle,
  highlight = false,
}: {
  icon: React.ReactNode;
  title: string;
  value: number | string;
  subtitle: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={
        highlight
          ? 'rounded-[22px] border border-[#e3a925] bg-[#fff7e8] p-3 shadow-sm'
          : 'rounded-[22px] bg-white p-3 shadow-sm ring-1 ring-[#f1e7cf]'
      }
    >
      <div
        className={
          highlight
            ? 'flex h-9 w-9 items-center justify-center rounded-2xl bg-[#e3a925] text-white'
            : 'flex h-9 w-9 items-center justify-center rounded-2xl bg-[#fff7e8] text-[#d99200]'
        }
      >
        {icon}
      </div>
      <p className={highlight ? 'mt-3 text-xl font-black text-red-600' : 'mt-3 text-xl font-black'}>
        {value}
      </p>
      <p className="mt-1 text-[11px] font-black">{title}</p>
      <p className="mt-0.5 text-[10px] font-bold leading-4 text-gray-500">{subtitle}</p>
    </div>
  );
}
