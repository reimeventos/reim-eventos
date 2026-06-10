'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Nav } from '@/components/Nav';
import { listCategories, listSuppliers } from '@/lib/marketplace';
import {
  Camera,
  Cake,
  Flower2,
  Gem,
  Landmark,
  MapPin,
  Music2,
  Search,
  ShieldCheck,
  Star,
  Utensils,
  Video,
} from 'lucide-react';

function getCategoryIcon(name: string) {
  const normalized = name.toLowerCase();

  if (normalized.includes('foto') || normalized.includes('film')) return Camera;
  if (normalized.includes('buffet')) return Utensils;
  if (normalized.includes('ornament') || normalized.includes('decor')) return Flower2;
  if (normalized.includes('totem') || normalized.includes('cabine')) return Video;
  if (normalized.includes('cerimonial')) return Gem;

  if (
    normalized.includes('música') ||
    normalized.includes('musica') ||
    normalized.includes('banda')
  ) {
    return Music2;
  }

  if (normalized.includes('bolo') || normalized.includes('doce')) return Cake;

  if (
    normalized.includes('espaço') ||
    normalized.includes('espaco') ||
    normalized.includes('eventos')
  ) {
    return Landmark;
  }

  return Camera;
}

function getCoverImage(supplier: any) {
  const cover = supplier.media?.find((item: any) => item.is_cover);

  if (cover?.file_url) {
    return cover.file_url;
  }

  if (supplier.media?.[0]?.file_url) {
    return supplier.media[0].file_url;
  }

  return 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1000&auto=format&fit=crop';
}

function formatPrice(value: any) {
  if (!value) return 'Sob consulta';

  if (typeof value === 'number') {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  const numberValue = Number(value);

  if (!Number.isNaN(numberValue)) {
    return numberValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  return String(value);
}

function formatRating(value: any) {
  if (!value) return '4.9';

  const numberValue = Number(value);

  if (Number.isNaN(numberValue)) {
    return String(value);
  }

  return numberValue.toFixed(1);
}

export default function BuscarPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [search, setSearch] = useState('');

  const [targetCustomerId, setTargetCustomerId] = useState('');
  const [returnUrl, setReturnUrl] = useState('/');

  const isCerimonialistaMode = Boolean(targetCustomerId);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cliente = params.get('cliente') || '';
    const voltar = params.get('voltar') || '/';

    setTargetCustomerId(cliente);
    setReturnUrl(voltar);
  }, []);

  function getSupplierLink(supplierId: string) {
    if (isCerimonialistaMode) {
      return `/fornecedor/${supplierId}?cliente=${targetCustomerId}&voltar=${encodeURIComponent(
        returnUrl
      )}`;
    }

    return `/fornecedor/${supplierId}`;
  }

  async function loadSuppliers(categoryId?: string, searchText?: string) {
    try {
      setLoadingSuppliers(true);

      const data = await listSuppliers({
        categoryId: categoryId || undefined,
        search: searchText || undefined,
      });

      setSuppliers(data || []);
    } catch (error) {
      console.error('Erro ao carregar fornecedores:', error);
      setSuppliers([]);
    } finally {
      setLoadingSuppliers(false);
    }
  }

  useEffect(() => {
    async function loadInitialData() {
      try {
        const cats = await listCategories();
        setCategories(cats || []);
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }

      await loadSuppliers();
    }

    loadInitialData();
  }, []);

  function handleCategoryClick(categoryId: string) {
    const nextCategoryId = selectedCategoryId === categoryId ? '' : categoryId;

    setSelectedCategoryId(nextCategoryId);
    loadSuppliers(nextCategoryId, search);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    loadSuppliers(selectedCategoryId, search);
  }

  return (
    <main className="min-h-screen bg-black text-[#151515]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#fbf7f1] pb-40 shadow-2xl">
        {/* TOPO */}
        <section className="relative overflow-hidden rounded-b-[34px] bg-black px-6 pb-8 pt-7 text-white">
          <div className="absolute inset-0 bg-[url('/layout01-fundo.png')] bg-cover bg-center opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/75 to-black" />

          <div className="relative z-10">
            <Link
              href={returnUrl}
              className="text-sm font-bold text-[#e3a925]"
            >
              ‹ Voltar
            </Link>

            <h1 className="mt-5 font-serif text-[34px] leading-tight">
              Buscar fornecedores
            </h1>

            <p className="mt-2 text-sm text-white/70">
              Encontre serviços para seu evento
            </p>

            {isCerimonialistaMode && (
              <div className="mt-4 flex items-start gap-3 rounded-2xl bg-white/10 p-4 text-white ring-1 ring-white/10">
                <ShieldCheck size={20} className="mt-0.5 text-[#e3a925]" />
                <div>
                  <p className="text-sm font-extrabold">
                    Modo cerimonialista
                  </p>
                  <p className="mt-1 text-xs leading-5 text-white/70">
                    Ao abrir uma vitrine, o fornecedor será salvo no evento da cliente.
                  </p>
                </div>
              </div>
            )}

            <form
              onSubmit={handleSearchSubmit}
              className="mt-6 rounded-[26px] bg-white p-3 shadow-2xl"
            >
              <div className="flex items-center gap-3 rounded-[20px] bg-[#f7f2ea] px-4 py-4">
                <Search size={25} className="text-[#d99200]" />
                <input
                  className="w-full bg-transparent text-sm font-medium text-black outline-none placeholder:text-gray-500"
                  placeholder="Fotógrafo, buffet, totem..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </form>

            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white/90">
              <MapPin size={16} className="text-[#e3a925]" />
              Eunápolis
            </div>
          </div>
        </section>

        {/* CATEGORIAS */}
        <section className="px-6 pt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-extrabold">Categorias</h2>
            <span className="text-xs font-bold text-[#d99200]">
              {loadingCategories
                ? 'Carregando...'
                : `${categories.length} categorias`}
            </span>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2">
            {categories.map((cat) => {
              const Icon = getCategoryIcon(cat.name || '');
              const isSelected = selectedCategoryId === cat.id;

              return (
                <button
                  type="button"
                  onClick={() => handleCategoryClick(cat.id)}
                  key={cat.id}
                  className={`min-w-[104px] rounded-[22px] p-3 text-center shadow-sm ring-1 transition ${
                    isSelected
                      ? 'bg-[#e3a925] text-white ring-[#e3a925]'
                      : 'bg-white text-[#151515] ring-[#f1e7cf]'
                  }`}
                >
                  <div
                    className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-[#fff7e8] text-[#d99200]'
                    }`}
                  >
                    <Icon size={25} strokeWidth={2.2} />
                  </div>

                  <p className="mt-2 line-clamp-2 text-[11px] font-extrabold leading-4">
                    {cat.name}
                  </p>
                </button>
              );
            })}

            {!loadingCategories && categories.length === 0 && (
              <div className="rounded-[22px] bg-white p-4 text-sm font-bold text-gray-500 ring-1 ring-[#f1e7cf]">
                Nenhuma categoria cadastrada.
              </div>
            )}
          </div>
        </section>

        {/* RESULTADOS */}
        <section className="px-6 pt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-extrabold">Resultados</h2>
            <span className="text-xs font-bold text-gray-500">
              {loadingSuppliers
                ? 'Carregando...'
                : `${suppliers.length} encontrados`}
            </span>
          </div>

          {loadingSuppliers && (
            <div className="rounded-[28px] bg-white p-6 text-center shadow-sm ring-1 ring-[#f1e7cf]">
              <p className="text-sm font-bold text-gray-500">
                Carregando fornecedores...
              </p>
            </div>
          )}

          {!loadingSuppliers && suppliers.length === 0 && (
            <div className="rounded-[28px] bg-white p-6 text-center shadow-sm ring-1 ring-[#f1e7cf]">
              <Search size={36} className="mx-auto text-[#d99200]" />
              <h3 className="mt-4 text-lg font-extrabold">
                Nenhum fornecedor encontrado
              </h3>
              <p className="mt-2 text-sm leading-5 text-gray-500">
                Ainda não há fornecedores ativos cadastrados no Supabase para essa busca.
              </p>
            </div>
          )}

          <div className="space-y-4">
            {suppliers.map((supplier) => {
              const supplierName = supplier.business_name || 'Fornecedor';
              const categoryName =
                supplier.categories?.name || 'Categoria não informada';
              const city = supplier.city || 'Cidade não informada';
              const rating = formatRating(supplier.rating_average);
              const price = formatPrice(supplier.average_price);
              const coverImage = getCoverImage(supplier);
              const supplierId = supplier.id || 'demo';
              const tag = supplier.is_featured ? 'Destaque' : 'Premium';

              return (
                <Link
                  href={getSupplierLink(supplierId)}
                  key={supplierId}
                  className="block overflow-hidden rounded-[28px] bg-white shadow-[0_10px_25px_rgba(0,0,0,.08)]"
                >
                  <div className="relative h-44 bg-cover bg-center">
                    <img
                      src={coverImage}
                      alt={supplierName}
                      className="h-full w-full object-cover"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                    <span className="absolute left-4 top-4 rounded-full bg-[#e3a925] px-3 py-1 text-xs font-extrabold text-white">
                      ♛ {tag}
                    </span>

                    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
                      <div>
                        <h3 className="text-xl font-extrabold">
                          {supplierName}
                        </h3>
                        <p className="text-sm text-white/80">
                          {categoryName}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 rounded-full bg-black/45 px-3 py-1 text-sm font-bold">
                        <Star
                          size={15}
                          fill="#e3a925"
                          className="text-[#e3a925]"
                        />
                        {rating}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4">
                    <div>
                      <p className="flex items-center gap-1 text-sm font-bold text-gray-700">
                        <MapPin size={15} className="text-[#d99200]" />
                        {city}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {price === 'Sob consulta'
                          ? 'Valor sob consulta'
                          : `A partir de ${price}`}
                      </p>
                    </div>

                    <span className="rounded-full bg-black px-4 py-2 text-xs font-bold text-white">
                      Ver vitrine
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <Nav />
      </div>
    </main>
  );
}
