'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  AlertCircle,
  Briefcase,
  CheckCircle2,
  Crown,
  Eye,
  Loader2,
  MapPin,
  RefreshCcw,
  Search,
  ShieldCheck,
  Star,
  XCircle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

function getCategoryName(supplier: any) {
  if (!supplier) return 'Categoria não informada';

  if (Array.isArray(supplier.categories)) {
    return supplier.categories[0]?.name || 'Categoria não informada';
  }

  return supplier.categories?.name || 'Categoria não informada';
}

function getPlanLabel(visibility: any) {
  const plan = visibility?.plan || '';

  if (plan === 'premium') return 'Premium Destaque';
  if (plan === 'profissional') return 'Profissional';
  if (plan === 'teste_7_dias') return 'Teste grátis';

  if (visibility?.subscription_status === 'ativo') return 'Plano ativo';
  if (visibility?.subscription_status === 'pendente') return 'Pendente';
  if (!visibility?.subscription_status) return 'Sem assinatura';

  return visibility.subscription_status;
}

function getPublicStatusLabel(visibility: any) {
  if (visibility?.can_receive_quote) return 'Liberado';
  if (visibility?.public_badge === 'novo_no_reim') return 'Perfil pendente';
  if (visibility?.public_badge === 'pendente') return 'Pagamento pendente';
  if (visibility?.public_badge === 'sem_assinatura') return 'Sem assinatura';
  if (visibility?.public_badge === 'expirado') return 'Expirado';
  if (visibility?.public_badge === 'cancelado') return 'Cancelado';

  return 'Bloqueado';
}

function StatusBadge({ supplier, visibility }: { supplier: any; visibility: any }) {
  const status = supplier?.status || '';
  const canReceiveQuote = Boolean(visibility?.can_receive_quote);

  if (canReceiveQuote) {
    return (
      <span className="flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-[11px] font-extrabold text-green-700">
        <CheckCircle2 size={13} />
        Liberado
      </span>
    );
  }

  if (status === 'pendente_perfil') {
    return (
      <span className="flex items-center gap-1 rounded-full bg-[#fff7e8] px-3 py-1 text-[11px] font-extrabold text-[#b97900]">
        <ShieldCheck size={13} />
        Perfil pendente
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-[11px] font-extrabold text-red-700">
      <XCircle size={13} />
      {getPublicStatusLabel(visibility)}
    </span>
  );
}

export default function AdminFornecedoresPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [visibilityBySupplier, setVisibilityBySupplier] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState('');
  const [search, setSearch] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  async function logAdminAction(action: string, description: string, targetId?: string) {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      await supabase.rpc('log_admin_action', {
        p_action: action,
        p_description: description,
        p_target_table: 'suppliers',
        p_target_id: targetId || null,
        p_admin_user_id: user?.id || null,
        p_admin_email: user?.email || null,
      });
    } catch (error) {
      console.error('Erro ao registrar auditoria:', error);
    }
  }

  async function loadSuppliers() {
    try {
      setLoading(true);
      setErrorMessage('');

      const { data: suppliersData, error: suppliersError } = await supabase
        .from('suppliers')
        .select(`
          *,
          categories(name, slug)
        `)
        .order('created_at', { ascending: false });

      if (suppliersError) {
        throw suppliersError;
      }

      const { data: visibilityData, error: visibilityError } = await supabase
        .from('supplier_public_visibility')
        .select(
          'supplier_id, business_name, supplier_status, plan, subscription_status, trial_active, plan_active, can_appear_public, can_receive_quote, public_badge, public_label'
        );

      if (visibilityError) {
        throw visibilityError;
      }

      const visibilityMap = (visibilityData || []).reduce((acc: any, item: any) => {
        acc[item.supplier_id] = item;
        return acc;
      }, {});

      setSuppliers(suppliersData || []);
      setVisibilityBySupplier(visibilityMap);
    } catch (error: any) {
      console.error('Erro ao carregar fornecedores:', error);
      setErrorMessage(error?.message || 'Não foi possível carregar fornecedores.');
      setSuppliers([]);
      setVisibilityBySupplier({});
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSuppliers();
  }, []);

  const filteredSuppliers = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    if (!normalized) return suppliers;

    return suppliers.filter((supplier) => {
      const visibility = visibilityBySupplier[supplier.id] || {};
      const categoryName = getCategoryName(supplier);

      return (
        String(supplier.business_name || '').toLowerCase().includes(normalized) ||
        String(supplier.city || '').toLowerCase().includes(normalized) ||
        String(categoryName || '').toLowerCase().includes(normalized) ||
        String(supplier.status || '').toLowerCase().includes(normalized) ||
        String(visibility.public_badge || '').toLowerCase().includes(normalized)
      );
    });
  }, [suppliers, search, visibilityBySupplier]);

  const totalCount = suppliers.length;
  const approvedCount = suppliers.filter((item) => item.status === 'ativo').length;
  const pendingCount = suppliers.filter((item) => item.status === 'pendente_perfil').length;
  const visibleCount = suppliers.filter(
    (item) => visibilityBySupplier[item.id]?.can_receive_quote
  ).length;

  async function handleApproveSupplier(supplier: any) {
    try {
      setSavingId(supplier.id);
      setSuccessMessage('');
      setErrorMessage('');

      const { error } = await supabase
        .from('suppliers')
        .update({
          status: 'ativo',
          updated_at: new Date().toISOString(),
        })
        .eq('id', supplier.id);

      if (error) throw error;

      await logAdminAction(
        'Fornecedor aprovado',
        `Fornecedor aprovado pelo admin: ${supplier.business_name || supplier.id}`,
        supplier.id
      );

      setSuccessMessage(`${supplier.business_name || 'Fornecedor'} aprovado com sucesso.`);
      await loadSuppliers();
    } catch (error: any) {
      console.error('Erro ao aprovar fornecedor:', error);
      setErrorMessage(error?.message || 'Não foi possível aprovar este fornecedor.');
    } finally {
      setSavingId('');
    }
  }

  async function handleRejectSupplier(supplier: any) {
    const confirmed = window.confirm(
      `Deseja reprovar/bloquear o cadastro de ${supplier.business_name || 'este fornecedor'}?`
    );

    if (!confirmed) return;

    try {
      setSavingId(supplier.id);
      setSuccessMessage('');
      setErrorMessage('');

      const { error } = await supabase
        .from('suppliers')
        .update({
          status: 'reprovado',
          updated_at: new Date().toISOString(),
        })
        .eq('id', supplier.id);

      if (error) throw error;

      await logAdminAction(
        'Fornecedor reprovado',
        `Fornecedor reprovado/bloqueado pelo admin: ${supplier.business_name || supplier.id}`,
        supplier.id
      );

      setSuccessMessage(`${supplier.business_name || 'Fornecedor'} reprovado/bloqueado.`);
      await loadSuppliers();
    } catch (error: any) {
      console.error('Erro ao reprovar fornecedor:', error);
      setErrorMessage(error?.message || 'Não foi possível reprovar este fornecedor.');
    } finally {
      setSavingId('');
    }
  }

  async function handleToggleFeatured(supplier: any) {
    try {
      setSavingId(supplier.id);
      setSuccessMessage('');
      setErrorMessage('');

      const nextFeatured = !Boolean(supplier.is_featured);

      const { error } = await supabase
        .from('suppliers')
        .update({
          is_featured: nextFeatured,
          updated_at: new Date().toISOString(),
        })
        .eq('id', supplier.id);

      if (error) throw error;

      await logAdminAction(
        nextFeatured ? 'Fornecedor destacado' : 'Destaque removido',
        `${nextFeatured ? 'Destaque ativado' : 'Destaque removido'} para fornecedor: ${
          supplier.business_name || supplier.id
        }`,
        supplier.id
      );

      setSuccessMessage(
        nextFeatured
          ? `${supplier.business_name || 'Fornecedor'} marcado como destaque.`
          : `Destaque removido de ${supplier.business_name || 'fornecedor'}.`
      );

      await loadSuppliers();
    } catch (error: any) {
      console.error('Erro ao alterar destaque:', error);
      setErrorMessage(error?.message || 'Não foi possível alterar o destaque.');
    } finally {
      setSavingId('');
    }
  }

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
                <Briefcase size={31} />
              </div>

              <div>
                <p className="text-sm font-bold text-[#e3a925]">
                  Administração
                </p>

                <h1 className="font-serif text-[34px] leading-tight">
                  Fornecedores
                </h1>

                <p className="mt-1 text-sm text-white/70">
                  Aprove, destaque e gerencie vitrines reais.
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
                  placeholder="Buscar fornecedor..."
                />

                {loading && <Loader2 size={18} className="animate-spin text-[#d99200]" />}
              </div>
            </div>
          </div>
        </section>

        {/* RESUMO */}
        <section className="grid grid-cols-4 gap-2 px-6 pt-6">
          <div className="rounded-[20px] bg-white p-3 text-center shadow-sm ring-1 ring-[#f1e7cf]">
            <p className="text-xl font-extrabold text-[#d99200]">{totalCount}</p>
            <p className="mt-1 text-[10px] font-bold text-gray-600">Total</p>
          </div>

          <div className="rounded-[20px] bg-white p-3 text-center shadow-sm ring-1 ring-[#f1e7cf]">
            <p className="text-xl font-extrabold text-green-600">{approvedCount}</p>
            <p className="mt-1 text-[10px] font-bold text-gray-600">Ativos</p>
          </div>

          <div className="rounded-[20px] bg-white p-3 text-center shadow-sm ring-1 ring-[#f1e7cf]">
            <p className="text-xl font-extrabold text-[#b97900]">{pendingCount}</p>
            <p className="mt-1 text-[10px] font-bold text-gray-600">Pend.</p>
          </div>

          <div className="rounded-[20px] bg-white p-3 text-center shadow-sm ring-1 ring-[#f1e7cf]">
            <p className="text-xl font-extrabold text-blue-600">{visibleCount}</p>
            <p className="mt-1 text-[10px] font-bold text-gray-600">Públicos</p>
          </div>
        </section>

        {(successMessage || errorMessage) && (
          <section className="px-6 pt-4">
            {successMessage && (
              <div className="rounded-[22px] bg-green-50 px-4 py-3 text-sm font-bold text-green-700 ring-1 ring-green-100">
                {successMessage}
              </div>
            )}

            {errorMessage && (
              <div className="rounded-[22px] bg-red-50 px-4 py-3 text-sm font-bold text-red-700 ring-1 ring-red-100">
                {errorMessage}
              </div>
            )}
          </section>
        )}

        <section className="px-6 pt-4">
          <button
            type="button"
            onClick={loadSuppliers}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-[20px] bg-black py-3 text-sm font-extrabold text-white disabled:opacity-60"
          >
            <RefreshCcw size={17} className={loading ? 'animate-spin' : ''} />
            Atualizar lista
          </button>
        </section>

        {/* LISTA */}
        <section className="px-6 pt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-extrabold">Lista de fornecedores</h2>
            <span className="text-xs font-bold text-gray-500">
              {filteredSuppliers.length} exibidos
            </span>
          </div>

          {loading && (
            <div className="rounded-[28px] bg-white p-6 text-center shadow-sm ring-1 ring-[#f1e7cf]">
              <Loader2 size={34} className="mx-auto animate-spin text-[#d99200]" />
              <p className="mt-3 text-sm font-bold text-gray-500">
                Carregando fornecedores...
              </p>
            </div>
          )}

          {!loading && filteredSuppliers.length === 0 && (
            <div className="rounded-[28px] bg-white p-6 text-center shadow-sm ring-1 ring-[#f1e7cf]">
              <AlertCircle size={38} className="mx-auto text-[#d99200]" />
              <h3 className="mt-4 text-lg font-extrabold">
                Nenhum fornecedor encontrado
              </h3>
              <p className="mt-2 text-sm leading-5 text-gray-500">
                Tente buscar por outro nome, cidade, categoria ou status.
              </p>
            </div>
          )}

          <div className="space-y-4">
            {!loading &&
              filteredSuppliers.map((supplier) => {
                const visibility = visibilityBySupplier[supplier.id] || null;
                const supplierName = supplier.business_name || 'Fornecedor';
                const category = getCategoryName(supplier);
                const city = supplier.city || 'Cidade não informada';
                const rating = supplier.rating_average || '4.9';
                const planLabel = getPlanLabel(visibility);
                const publicStatus = getPublicStatusLabel(visibility);
                const isSaving = savingId === supplier.id;

                return (
                  <div
                    key={supplier.id}
                    className="rounded-[28px] bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,.08)] ring-1 ring-[#f1e7cf]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-extrabold">
                          {supplierName}
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                          {category}
                        </p>
                      </div>

                      <StatusBadge supplier={supplier} visibility={visibility} />
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-[#fbf7f1] p-3">
                        <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                          <MapPin size={14} className="text-[#d99200]" />
                          Cidade
                        </p>
                        <p className="mt-1 line-clamp-1 text-sm font-extrabold">
                          {city}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-[#fbf7f1] p-3">
                        <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                          <Crown size={14} className="text-[#d99200]" />
                          Plano
                        </p>
                        <p className="mt-1 line-clamp-1 text-sm font-extrabold">
                          {planLabel}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-[#fbf7f1] p-3">
                        <p className="text-xs font-bold text-gray-500">
                          Nas buscas
                        </p>
                        <p className="mt-1 text-sm font-extrabold">
                          {visibility?.can_appear_public ? 'Aparece' : 'Oculto'}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-[#fbf7f1] p-3">
                        <p className="text-xs font-bold text-gray-500">
                          Orçamentos
                        </p>
                        <p className="mt-1 text-sm font-extrabold">
                          {visibility?.can_receive_quote ? 'Recebe' : 'Bloqueado'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <span className="flex items-center gap-1 text-sm font-bold text-[#d99200]">
                        <Star size={15} fill="#e3a925" className="text-[#e3a925]" />
                        {rating}
                        {supplier.is_featured ? ' • Destaque' : ''}
                      </span>

                      <span className="rounded-full bg-[#fbf7f1] px-3 py-1 text-[11px] font-extrabold text-gray-600 ring-1 ring-[#f1e7cf]">
                        {publicStatus}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link
                        href={`/fornecedor/${supplier.id}`}
                        className="rounded-full bg-[#fbf7f1] px-4 py-2 text-xs font-extrabold text-[#151515] ring-1 ring-[#f1e7cf]"
                      >
                        <span className="inline-flex items-center gap-1">
                          <Eye size={14} />
                          Ver
                        </span>
                      </Link>

                      {supplier.status === 'pendente_perfil' && (
                        <button
                          type="button"
                          onClick={() => handleApproveSupplier(supplier)}
                          disabled={isSaving}
                          className="rounded-full bg-green-600 px-4 py-2 text-xs font-extrabold text-white disabled:opacity-60"
                        >
                          {isSaving ? 'Aprovando...' : 'Aprovar perfil'}
                        </button>
                      )}

                      {supplier.status !== 'pendente_perfil' && (
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(supplier)}
                          disabled={isSaving}
                          className="rounded-full bg-black px-4 py-2 text-xs font-extrabold text-white disabled:opacity-60"
                        >
                          {isSaving
                            ? 'Salvando...'
                            : supplier.is_featured
                              ? 'Remover destaque'
                              : 'Destacar'}
                        </button>
                      )}
                    </div>

                    {supplier.status === 'pendente_perfil' && (
                      <button
                        type="button"
                        onClick={() => handleRejectSupplier(supplier)}
                        disabled={isSaving}
                        className="mt-3 flex w-full items-center justify-center gap-2 rounded-[20px] bg-red-50 py-3 text-sm font-extrabold text-red-700 disabled:opacity-60"
                      >
                        <XCircle size={18} />
                        {isSaving ? 'Salvando...' : 'Reprovar cadastro'}
                      </button>
                    )}

                    {supplier.status !== 'pendente_perfil' &&
                      visibility?.can_receive_quote === false && (
                        <div className="mt-4 rounded-[18px] bg-red-50 px-4 py-3 text-xs font-bold leading-5 text-red-700 ring-1 ring-red-100">
                          Este fornecedor está cadastrado, mas não aparece/recebe orçamento por causa do status do plano ou assinatura.
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
