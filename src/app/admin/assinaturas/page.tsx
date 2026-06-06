'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  Crown,
  Search,
  ShieldAlert,
  Star,
  WalletCards,
  XCircle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

function StatusBadge({ status }: { status: string }) {
  if (status === 'ativo') {
    return (
      <span className="flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-[11px] font-extrabold text-green-700">
        <CheckCircle2 size={13} />
        Ativa
      </span>
    );
  }

  if (status === 'pendente') {
    return (
      <span className="flex items-center gap-1 rounded-full bg-[#fff7e8] px-3 py-1 text-[11px] font-extrabold text-[#b97900]">
        <Clock size={13} />
        Pendente
      </span>
    );
  }

  if (status === 'vencido') {
    return (
      <span className="flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-[11px] font-extrabold text-orange-700">
        <ShieldAlert size={13} />
        Vencida
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-[11px] font-extrabold text-red-700">
      <XCircle size={13} />
      Cancelada
    </span>
  );
}

export default function AdminAssinaturasPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setErrorMessage('');

      const [subscriptionsResult, suppliersResult] = await Promise.all([
        supabase
          .from('supplier_subscriptions')
          .select(`
            *,
            suppliers(
              id,
              business_name,
              city,
              status,
              is_featured
            )
          `)
          .order('created_at', { ascending: false }),

        supabase
          .from('suppliers')
          .select('id, business_name, city, status, is_featured')
          .eq('status', 'ativo')
          .order('business_name', { ascending: true }),
      ]);

      if (subscriptionsResult.error) throw subscriptionsResult.error;
      if (suppliersResult.error) throw suppliersResult.error;

      setSubscriptions(subscriptionsResult.data || []);
      setSuppliers(suppliersResult.data || []);
    } catch (error) {
      console.error('Erro ao carregar assinaturas:', error);
      setErrorMessage('Não foi possível carregar as assinaturas.');
    } finally {
      setLoading(false);
    }
  }

  function formatMoney(value?: number | string | null) {
    if (value === null || value === undefined || value === '') {
      return 'R$ 0,00';
    }

    const numberValue = Number(value);

    return numberValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  function formatDate(date?: string | null) {
    if (!date) return 'Sem vencimento';

    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  function statusText(status: string) {
    if (status === 'ativo') return 'Ativa';
    if (status === 'pendente') return 'Pendente';
    if (status === 'vencido') return 'Vencida';
    if (status === 'cancelado') return 'Cancelada';
    return status;
  }

  async function updateSubscriptionStatus(
    subscriptionId: string,
    status: 'ativo' | 'pendente' | 'cancelado' | 'vencido',
    isFeatured: boolean
  ) {
    try {
      setSavingId(subscriptionId);
      setErrorMessage('');
      setSuccessMessage('');

      const { error } = await supabase
        .from('supplier_subscriptions')
        .update({
          status,
          is_featured: isFeatured,
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscriptionId);

      if (error) throw error;

      setSuccessMessage('Assinatura atualizada com sucesso.');
      await loadData();
    } catch (error) {
      console.error('Erro ao atualizar assinatura:', error);
      setErrorMessage('Não foi possível atualizar a assinatura.');
    } finally {
      setSavingId('');
    }
  }

  async function createPremiumSubscription(supplierId: string) {
    try {
      setSavingId(supplierId);
      setErrorMessage('');
      setSuccessMessage('');

      const { error } = await supabase.from('supplier_subscriptions').insert([
        {
          supplier_id: supplierId,
          plan_name: 'Premium Destaque',
          status: 'ativo',
          is_featured: true,
          amount: 49.9,
          payment_method: 'manual',
          notes: 'Assinatura criada pelo Admin REIM EVENTOS',
        },
      ]);

      if (error) throw error;

      setSuccessMessage('Plano Premium criado com sucesso.');
      await loadData();
    } catch (error) {
      console.error('Erro ao criar assinatura:', error);
      setErrorMessage('Não foi possível criar a assinatura.');
    } finally {
      setSavingId('');
    }
  }

  const filteredSubscriptions = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return subscriptions;

    return subscriptions.filter((item) => {
      const supplierName = item.suppliers?.business_name || '';
      const city = item.suppliers?.city || '';
      const planName = item.plan_name || '';

      return (
        supplierName.toLowerCase().includes(term) ||
        city.toLowerCase().includes(term) ||
        planName.toLowerCase().includes(term)
      );
    });
  }, [subscriptions, search]);

  const suppliersWithoutSubscription = useMemo(() => {
    const supplierIdsWithSubscription = new Set(
      subscriptions.map((item) => item.supplier_id)
    );

    return suppliers.filter((supplier) => {
      return !supplierIdsWithSubscription.has(supplier.id);
    });
  }, [subscriptions, suppliers]);

  const activeCount = subscriptions.filter((item) => item.status === 'ativo').length;
  const pendingCount = subscriptions.filter((item) => item.status === 'pendente').length;

  const mrr = subscriptions
    .filter((item) => item.status === 'ativo')
    .reduce((total, item) => total + Number(item.amount || 0), 0);

  return (
    <main className="min-h-screen bg-black text-[#151515]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#fbf7f1] pb-10 shadow-2xl">
        {/* TOPO */}
        <section className="relative overflow-hidden rounded-b-[34px] bg-black px-6 pb-8 pt-7 text-white">
          <div className="absolute inset-0 bg-[url('/layout01-fundo.png')] bg-cover bg-center opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/85 to-black" />

          <div className="relative z-10">
            <Link
              href="/admin"
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
                <p className="text-sm font-bold text-[#e3a925]">
                  Administração
                </p>

                <h1 className="font-serif text-[34px] leading-tight">
                  Assinaturas
                </h1>

                <p className="mt-1 text-sm text-white/70">
                  Controle planos, pagamentos e destaque na Home.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-[26px] bg-white p-3 shadow-2xl">
              <div className="flex items-center gap-3 rounded-[20px] bg-[#f7f2ea] px-4 py-4">
                <Search size={25} className="text-[#d99200]" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="w-full bg-transparent text-sm font-medium text-black outline-none placeholder:text-gray-500"
                  placeholder="Buscar assinatura..."
                />
              </div>
            </div>
          </div>
        </section>

        {/* RESUMO */}
        <section className="grid grid-cols-3 gap-3 px-6 pt-6">
          <div className="rounded-[22px] bg-white p-4 text-center shadow-sm ring-1 ring-[#f1e7cf]">
            <p className="text-2xl font-extrabold text-green-600">
              {activeCount}
            </p>
            <p className="mt-1 text-[11px] font-bold text-gray-600">
              Ativas
            </p>
          </div>

          <div className="rounded-[22px] bg-white p-4 text-center shadow-sm ring-1 ring-[#f1e7cf]">
            <p className="text-2xl font-extrabold text-[#d99200]">
              {pendingCount}
            </p>
            <p className="mt-1 text-[11px] font-bold text-gray-600">
              Pendentes
            </p>
          </div>

          <div className="rounded-[22px] bg-white p-4 text-center shadow-sm ring-1 ring-[#f1e7cf]">
            <p className="text-lg font-extrabold text-[#d99200]">
              {formatMoney(mrr)}
            </p>
            <p className="mt-1 text-[11px] font-bold text-gray-600">
              MRR
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

        {/* FORNECEDORES SEM PLANO */}
        {suppliersWithoutSubscription.length > 0 && (
          <section className="px-6 pt-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-extrabold">Sem assinatura</h2>
              <span className="text-xs font-bold text-gray-500">
                {suppliersWithoutSubscription.length} fornecedor(es)
              </span>
            </div>

            <div className="space-y-3">
              {suppliersWithoutSubscription.map((supplier) => (
                <div
                  key={supplier.id}
                  className="rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-[#f1e7cf]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-extrabold">
                        {supplier.business_name}
                      </h3>
                      <p className="mt-1 text-xs font-bold text-gray-500">
                        {supplier.city || 'Cidade não informada'}
                      </p>
                    </div>

                    <button
                      onClick={() => createPremiumSubscription(supplier.id)}
                      disabled={savingId === supplier.id}
                      className="rounded-full bg-[#e3a925] px-4 py-2 text-xs font-extrabold text-white disabled:opacity-60"
                    >
                      {savingId === supplier.id ? 'Criando...' : 'Ativar Premium'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* LISTA */}
        <section className="px-6 pt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-extrabold">Lista de assinaturas</h2>
            <span className="text-xs font-bold text-gray-500">
              {loading
                ? 'Carregando...'
                : `${filteredSubscriptions.length} exibida(s)`}
            </span>
          </div>

          {loading && (
            <div className="rounded-[28px] bg-white p-6 text-center shadow-sm ring-1 ring-[#f1e7cf]">
              <p className="text-sm font-bold text-gray-500">
                Carregando assinaturas...
              </p>
            </div>
          )}

          {!loading && filteredSubscriptions.length === 0 && (
            <div className="rounded-[28px] bg-white p-6 text-center shadow-sm ring-1 ring-[#f1e7cf]">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#fff7e8] text-[#d99200]">
                <Crown size={34} />
              </div>

              <h3 className="mt-4 text-lg font-extrabold">
                Nenhuma assinatura encontrada
              </h3>

              <p className="mt-2 text-sm leading-5 text-gray-500">
                Quando um fornecedor contratar um plano, ele aparecerá aqui.
              </p>
            </div>
          )}

          <div className="space-y-4">
            {filteredSubscriptions.map((item) => {
              const supplierName =
                item.suppliers?.business_name || 'Fornecedor não informado';
              const city = item.suppliers?.city || 'Cidade não informada';
              const isActive = item.status === 'ativo';
              const isPending = item.status === 'pendente';
              const isCanceled = item.status === 'cancelado';
              const isExpired = item.status === 'vencido';

              return (
                <div
                  key={item.id}
                  className={
                    isActive && item.is_featured
                      ? 'rounded-[28px] bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,.10)] ring-2 ring-[#e3a925]'
                      : 'rounded-[28px] bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,.08)] ring-1 ring-[#f1e7cf]'
                  }
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-extrabold">
                        {supplierName}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        {city}
                      </p>
                    </div>

                    <StatusBadge status={item.status} />
                  </div>

                  {isActive && item.is_featured && (
                    <div className="mt-4 rounded-2xl bg-[#151515] p-4 text-white">
                      <p className="flex items-center gap-2 text-xs font-extrabold text-[#f7d67b]">
                        <Crown size={15} />
                        Destaque ativo na Home
                      </p>

                      <p className="mt-2 text-sm leading-5 text-white/80">
                        Este fornecedor aparece em “Fornecedores em destaque”.
                      </p>
                    </div>
                  )}

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-[#fbf7f1] p-3">
                      <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                        <Crown size={14} className="text-[#d99200]" />
                        Plano
                      </p>
                      <p className="mt-1 text-sm font-extrabold">
                        {item.plan_name || 'Gratuito'}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#fbf7f1] p-3">
                      <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                        <WalletCards size={14} className="text-[#d99200]" />
                        Valor
                      </p>
                      <p className="mt-1 text-sm font-extrabold">
                        {formatMoney(item.amount)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 rounded-2xl bg-[#fbf7f1] p-3">
                    <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                      <CalendarDays size={14} className="text-[#d99200]" />
                      Vencimento
                    </p>
                    <p className="mt-1 text-sm font-extrabold">
                      {formatDate(item.expires_at)}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1 text-sm font-bold text-[#d99200]">
                      <Star size={15} fill="#e3a925" className="text-[#e3a925]" />
                      {item.payment_method || 'manual'}
                    </span>

                    <div className="flex flex-wrap justify-end gap-2">
                      {!isActive && (
                        <button
                          onClick={() =>
                            updateSubscriptionStatus(item.id, 'ativo', true)
                          }
                          disabled={savingId === item.id}
                          className="rounded-full bg-green-600 px-4 py-2 text-xs font-extrabold text-white disabled:opacity-60"
                        >
                          {savingId === item.id ? 'Salvando...' : 'Ativar'}
                        </button>
                      )}

                      {isActive && (
                        <button
                          onClick={() =>
                            updateSubscriptionStatus(item.id, 'cancelado', false)
                          }
                          disabled={savingId === item.id}
                          className="rounded-full bg-red-600 px-4 py-2 text-xs font-extrabold text-white disabled:opacity-60"
                        >
                          {savingId === item.id ? 'Salvando...' : 'Cancelar'}
                        </button>
                      )}

                      {isActive && item.is_featured && (
                        <button
                          onClick={() =>
                            updateSubscriptionStatus(item.id, 'ativo', false)
                          }
                          disabled={savingId === item.id}
                          className="rounded-full bg-black px-4 py-2 text-xs font-extrabold text-white disabled:opacity-60"
                        >
                          Remover destaque
                        </button>
                      )}

                      {isActive && !item.is_featured && (
                        <button
                          onClick={() =>
                            updateSubscriptionStatus(item.id, 'ativo', true)
                          }
                          disabled={savingId === item.id}
                          className="rounded-full bg-[#e3a925] px-4 py-2 text-xs font-extrabold text-white disabled:opacity-60"
                        >
                          Destacar
                        </button>
                      )}
                    </div>
                  </div>

                  {isPending && (
                    <div className="mt-3 flex items-center gap-2 rounded-[20px] bg-[#fff7e8] px-4 py-3 text-sm font-bold text-[#b97900]">
                      <ShieldAlert size={18} />
                      Assinatura aguardando confirmação de pagamento.
                    </div>
                  )}

                  {isCanceled && (
                    <div className="mt-3 flex items-center gap-2 rounded-[20px] bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                      <XCircle size={18} />
                      Assinatura cancelada. O fornecedor não aparece em destaque.
                    </div>
                  )}

                  {isExpired && (
                    <div className="mt-3 flex items-center gap-2 rounded-[20px] bg-orange-50 px-4 py-3 text-sm font-bold text-orange-700">
                      <ShieldAlert size={18} />
                      Assinatura vencida. O destaque foi removido.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
