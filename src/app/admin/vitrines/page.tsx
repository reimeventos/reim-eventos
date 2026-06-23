'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Building2,
  Crown,
  Eye,
  Gem,
  Grid3X3,
  ImageIcon,
  Loader2,
  MapPin,
  Search,
  ShieldCheck,
  Store,
  Tag,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

type SupplierItem = {
  id: string;
  business_name: string | null;
  city: string | null;
  status: string | null;
  is_featured: boolean | null;
  whatsapp: string | null;
  created_at: string | null;
  categories?: {
    id?: string | null;
    name?: string | null;
    slug?: string | null;
  } | null;
  media?: {
    id: string;
    url: string | null;
    type: string | null;
    is_cover: boolean | null;
  }[];
};

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function getCategoryName(supplier: SupplierItem) {
  if (Array.isArray(supplier.categories)) {
    return supplier.categories[0]?.name || 'Sem categoria';
  }

  return supplier.categories?.name || 'Sem categoria';
}

function getCoverImage(supplier: SupplierItem) {
  const media = supplier.media || [];
  const cover = media.find((item) => item.is_cover && item.type !== 'video');
  const firstPhoto = media.find((item) => item.type !== 'video');

  return cover?.url || firstPhoto?.url || '';
}

export default function AdminVitrinesPage() {
  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('todas');

  useEffect(() => {
    loadSuppliers();
  }, []);

  async function loadSuppliers() {
    try {
      setLoading(true);
      setErrorMessage('');

      const { data, error } = await supabase
        .from('suppliers')
        .select(
          `
          id,
          business_name,
          city,
          status,
          is_featured,
          whatsapp,
          created_at,
          categories (
            id,
            name,
            slug
          ),
          media (
            id,
            url,
            type,
            is_cover
          )
        `
        )
        .order('business_name', { ascending: true });

      if (error) {
        throw error;
      }

      setSuppliers((data || []) as SupplierItem[]);
    } catch (error: any) {
      console.error('Erro ao carregar vitrines:', error);
      setErrorMessage(error?.message || 'Não foi possível carregar as vitrines.');
    } finally {
      setLoading(false);
    }
  }

  const categories = useMemo(() => {
    const list = suppliers
      .map((supplier) => getCategoryName(supplier))
      .filter(Boolean);

    return Array.from(new Set(list)).sort((a, b) => a.localeCompare(b));
  }, [suppliers]);

  const filteredSuppliers = useMemo(() => {
    const term = normalizeText(search);

    return suppliers.filter((supplier) => {
      const categoryName = getCategoryName(supplier);

      const matchCategory =
        categoryFilter === 'todas' || categoryName === categoryFilter;

      const content = normalizeText(
        [
          supplier.business_name,
          supplier.city,
          supplier.status,
          categoryName,
          supplier.whatsapp,
        ]
          .filter(Boolean)
          .join(' ')
      );

      const matchSearch = !term || content.includes(term);

      return matchCategory && matchSearch;
    });
  }, [suppliers, search, categoryFilter]);

  const stats = useMemo(() => {
    return {
      total: suppliers.length,
      active: suppliers.filter((supplier) => supplier.status === 'ativo').length,
      featured: suppliers.filter((supplier) => supplier.is_featured).length,
      categories: categories.length,
    };
  }, [suppliers, categories]);

  return (
    <main className="min-h-screen bg-black text-[#151515]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#f7f2ea] pb-24 shadow-2xl">
        <section className="relative overflow-hidden rounded-b-[28px] bg-black px-5 pb-5 pt-5 text-white">
          <div className="absolute inset-0 bg-[url('/layout01-fundo.png')] bg-cover bg-center opacity-35" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/90 to-black" />

          <div className="relative z-10">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 text-xs font-black text-[#e3a925]"
            >
              <ArrowLeft size={16} />
              Voltar ao Admin
            </Link>

            <div className="mt-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e3a925] text-white shadow-lg">
                <Gem size={27} />
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#e3a925]">
                  Área Administrativa
                </p>

                <h1 className="font-serif text-[28px] leading-tight">
                  Vitrines
                </h1>

                <p className="mt-1 text-xs font-bold text-white/65">
                  Fornecedores organizados por categoria.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 pt-5">
          <div className="grid grid-cols-4 gap-2">
            <MiniStat label="Total" value={stats.total} />
            <MiniStat label="Ativas" value={stats.active} />
            <MiniStat label="Premium" value={stats.featured} />
            <MiniStat label="Categorias" value={stats.categories} />
          </div>

          <div className="mt-4 flex items-center rounded-[22px] bg-white px-4 py-3 shadow-sm ring-1 ring-[#f1e7cf]">
            <Search size={19} className="shrink-0 text-[#d99200]" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar vitrine, cidade, categoria..."
              className="ml-3 w-full bg-transparent text-sm font-bold outline-none placeholder:text-gray-400"
            />
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setCategoryFilter('todas')}
              className={
                categoryFilter === 'todas'
                  ? 'shrink-0 rounded-full bg-[#151515] px-4 py-2 text-xs font-black text-white'
                  : 'shrink-0 rounded-full bg-white px-4 py-2 text-xs font-black text-gray-500 ring-1 ring-[#f1e7cf]'
              }
            >
              Todas
            </button>

            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setCategoryFilter(category)}
                className={
                  categoryFilter === category
                    ? 'shrink-0 rounded-full bg-[#151515] px-4 py-2 text-xs font-black text-white'
                    : 'shrink-0 rounded-full bg-white px-4 py-2 text-xs font-black text-gray-500 ring-1 ring-[#f1e7cf]'
                }
              >
                {category}
              </button>
            ))}
          </div>

          {loading && (
            <div className="mt-5 rounded-[24px] bg-white p-5 text-center shadow-sm ring-1 ring-[#f1e7cf]">
              <Loader2 className="mx-auto animate-spin text-[#d99200]" size={30} />
              <p className="mt-3 text-sm font-bold text-gray-500">
                Carregando vitrines...
              </p>
            </div>
          )}

          {!loading && errorMessage && (
            <div className="mt-5 rounded-[22px] bg-red-50 p-4 text-sm font-bold leading-5 text-red-700 ring-1 ring-red-100">
              {errorMessage}
            </div>
          )}

          {!loading && !errorMessage && (
            <>
              <div className="mb-3 mt-6 flex items-center justify-between">
                <h2 className="text-base font-black">
                  Vitrines encontradas
                </h2>

                <span className="rounded-full bg-white px-3 py-1 text-[11px] font-black text-gray-500 ring-1 ring-[#f1e7cf]">
                  {filteredSuppliers.length}
                </span>
              </div>

              {filteredSuppliers.length === 0 ? (
                <div className="rounded-[24px] bg-white p-5 text-center shadow-sm ring-1 ring-[#f1e7cf]">
                  <Store className="mx-auto text-[#d99200]" size={32} />
                  <p className="mt-3 text-sm font-black">
                    Nenhuma vitrine encontrada
                  </p>
                  <p className="mt-1 text-xs font-bold leading-5 text-gray-500">
                    Tente buscar por outro nome, cidade ou categoria.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredSuppliers.map((supplier) => {
                    const categoryName = getCategoryName(supplier);
                    const cover = getCoverImage(supplier);

                    return (
                      <article
                        key={supplier.id}
                        className="overflow-hidden rounded-[24px] bg-white shadow-sm ring-1 ring-[#f1e7cf]"
                      >
                        <div className="flex gap-3 p-3">
                          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-[20px] bg-[#fff7e8]">
                            {cover ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={cover}
                                alt={supplier.business_name || 'Vitrine'}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[#d99200]">
                                <ImageIcon size={30} />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="truncate text-sm font-black">
                                {supplier.business_name || 'Fornecedor'}
                              </h3>

                              {supplier.is_featured && (
                                <span className="shrink-0 rounded-full bg-[#151515] px-2 py-1 text-[9px] font-black uppercase text-[#e3a925]">
                                  Premium
                                </span>
                              )}
                            </div>

                            <p className="mt-1 flex items-center gap-2 truncate text-[11px] font-bold text-gray-500">
                              <Tag size={13} className="shrink-0 text-[#d99200]" />
                              {categoryName}
                            </p>

                            <p className="mt-1 flex items-center gap-2 truncate text-[11px] font-bold text-gray-500">
                              <MapPin size={13} className="shrink-0 text-[#d99200]" />
                              {supplier.city || 'Cidade não informada'}
                            </p>

                            <div className="mt-2 flex items-center gap-2">
                              <span
                                className={
                                  supplier.status === 'ativo'
                                    ? 'rounded-full bg-green-50 px-2 py-1 text-[9px] font-black uppercase text-green-700'
                                    : 'rounded-full bg-gray-100 px-2 py-1 text-[9px] font-black uppercase text-gray-500'
                                }
                              >
                                {supplier.status || 'sem status'}
                              </span>

                              {supplier.is_featured && (
                                <span className="flex items-center gap-1 rounded-full bg-[#fff7e8] px-2 py-1 text-[9px] font-black uppercase text-[#b97900]">
                                  <Crown size={11} />
                                  destaque
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 border-t border-[#f1e7cf]">
                          <Link
                            href={`/fornecedor/${supplier.id}`}
                            className="flex items-center justify-center gap-2 py-3 text-xs font-black text-[#d99200]"
                          >
                            <Eye size={16} />
                            Ver pública
                          </Link>

                          <Link
                            href="/admin/fornecedores"
                            className="flex items-center justify-center gap-2 border-l border-[#f1e7cf] py-3 text-xs font-black text-[#151515]"
                          >
                            <Building2 size={16} />
                            Gerenciar
                          </Link>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </section>

        <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-[430px] -translate-x-1/2 border-t border-[#f1e7cf] bg-white/95 px-4 py-3 shadow-[0_-8px_25px_rgba(0,0,0,.08)] backdrop-blur">
          <div className="grid grid-cols-5 gap-1 text-center text-[10px] font-extrabold text-gray-500">
            <Link href="/admin" className="rounded-2xl px-2 py-2">
              Admin
            </Link>

            <Link href="/admin/assinaturas" className="rounded-2xl px-2 py-2">
              Aprovar
            </Link>

            <Link href="/admin/fornecedores" className="rounded-2xl px-2 py-2">
              Fornec.
            </Link>

            <Link href="/admin/clientes" className="rounded-2xl px-2 py-2">
              Clientes
            </Link>

            <Link
              href="/admin/vitrines"
              className="rounded-2xl bg-[#151515] px-2 py-2 text-white"
            >
              Vitrines
            </Link>
          </div>
        </nav>
      </div>
    </main>
  );
}

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-[18px] bg-white px-2 py-3 text-center shadow-sm ring-1 ring-[#f1e7cf]">
      <p className="text-lg font-black">{value}</p>
      <p className="mt-0.5 text-[10px] font-extrabold text-gray-500">{label}</p>
    </div>
  );
}
