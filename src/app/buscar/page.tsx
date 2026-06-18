'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  MapPin,
  Search,
  Star,
  X,
} from 'lucide-react';
import { Nav } from '@/components/Nav';
import { listCategories, listSuppliers } from '@/lib/suppliers';

function getSupplierCover(supplier: any) {
  if (Array.isArray(supplier?.media) && supplier.media.length > 0) {
    const cover =
      supplier.media.find((item: any) => item?.is_cover) || supplier.media[0];

    return cover?.file_url || '/layout01-fundo.png';
  }

  return '/layout01-fundo.png';
}

function getCategoryName(supplier: any) {
  if (Array.isArray(supplier?.categories)) {
    return supplier.categories[0]?.name || 'Fornecedor';
  }

  return supplier?.categories?.name || 'Fornecedor';
}

function formatPrice(value: any) {
  if (value === null || value === undefined || value === '') {
    return 'Sob consulta';
  }

  const numericValue = Number(String(value).replace(',', '.'));

  if (Number.isNaN(numericValue)) {
    return `A partir de ${value}`;
  }

  return `A partir de ${numericValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })}`;
}

export default function BuscarPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');

  const city = 'Eunápolis';

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setErrorMessage('');

        const [categoriesData, suppliersData] = await Promise.all([
          listCategories(),
          listSuppliers({ city }),
        ]);

        setCategories(categoriesData || []);
        setSuppliers(suppliersData || []);
      } catch (error) {
        console.error(error);
        setErrorMessage('Não foi possível carregar os fornecedores.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((supplier) => {
      const categoryName = getCategoryName(supplier).toLowerCase();
      const businessName = String(supplier?.business_name || '').toLowerCase();
      const description = String(supplier?.description || '').toLowerCase();
      const cityName = String(supplier?.city || '').toLowerCase();
      const search = appliedSearch.trim().toLowerCase();

      const matchCategory =
        selectedCategoryId === 'all' ||
        supplier?.category_id === selectedCategoryId;

      const matchSearch =
        !search ||
        businessName.includes(search) ||
        description.includes(search) ||
        categoryName.includes(search) ||
        cityName.includes(search);

      return matchCategory && matchSearch;
    });
  }, [suppliers, appliedSearch, selectedCategoryId]);

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAppliedSearch(searchInput.trim());
  }

  function handleClearSearch() {
    setSearchInput('');
    setAppliedSearch('');
  }

  return (
    <main className="min-h-screen bg-black text-[#151515]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#fbf7f1] pb-28 shadow-2xl">
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

            <h1 className="mt-5 font-serif text-[34px] leading-tight">
              Buscar fornecedores
            </h1>

            <p className="mt-2 text-sm text-white/70">
              Encontre serviços para seu evento
            </p>

            <form onSubmit={handleSearchSubmit} className="mt-5">
              <div className="flex items-center gap-2 rounded-[28px] bg-white p-3 shadow-lg">
                <div className="flex flex-1 items-center gap-3 rounded-[22px] bg-[#fbf7f1] px-4 py-3">
                  <Search size={20} className="text-[#d99200]" />

                  <input
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    placeholder="Fotógrafo, buffet, totem..."
                    className="w-full bg-transparent text-sm font-medium text-[#151515] outline-none placeholder:text-gray-400"
                  />

                  {searchInput && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f1e7cf] text-gray-600"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  className="shrink-0 rounded-[20px] bg-[#e3a925] px-4 py-3 text-sm font-extrabold text-white shadow-lg"
                >
                  Buscar
                </button>
              </div>
            </form>

            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white">
              <MapPin size={15} className="text-[#e3a925]" />
              {city}
            </div>
          </div>
        </section>

        {/* CATEGORIAS */}
        <section className="px-6 pt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[26px] font-serif leading-none">Categorias</h2>
            <span className="text-xs font-bold text-[#d99200]">
              {categories.length + 1} categorias
            </span>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2">
            <button
              type="button"
              onClick={() => setSelectedCategoryId('all')}
              className={
                selectedCategoryId === 'all'
                  ? 'min-w-[110px] rounded-[22px] border border-[#e3a925] bg-[#fff7e8] px-4 py-4 text-center shadow-sm'
                  : 'min-w-[110px] rounded-[22px] border border-[#f1e7cf] bg-white px-4 py-4 text-center shadow-sm'
              }
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#fff7e8] text-[#d99200]">
                <Search size={20} />
              </div>
              <p className="mt-3 text-sm font-extrabold">Todos</p>
            </button>

            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setSelectedCategoryId(category.id)}
                className={
                  selectedCategoryId === category.id
                    ? 'min-w-[110px] rounded-[22px] border border-[#e3a925] bg-[#fff7e8] px-4 py-4 text-center shadow-sm'
                    : 'min-w-[110px] rounded-[22px] border border-[#f1e7cf] bg-white px-4 py-4 text-center shadow-sm'
                }
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#fff7e8] text-[#d99200]">
                  <Search size={20} />
                </div>
                <p className="mt-3 text-sm font-extrabold leading-4">
                  {category.name}
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* RESULTADOS */}
        <section className="px-6 pt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[26px] font-serif leading-none">Resultados</h2>
            <span className="text-xs font-bold text-gray-500">
              {filteredSuppliers.length} encontrado(s)
            </span>
          </div>

          {loading && (
            <div className="rounded-[28px] bg-white p-6 text-center text-sm font-bold text-gray-500 shadow-sm ring-1 ring-[#f1e7cf]">
              Carregando fornecedores...
            </div>
          )}

          {!loading && errorMessage && (
            <div className="rounded-[28px] bg-red-50 px-5 py-4 text-sm font-bold text-red-700 shadow-sm ring-1 ring-red-100">
              {errorMessage}
            </div>
          )}

          {!loading && !errorMessage && filteredSuppliers.length === 0 && (
            <div className="rounded-[28px] bg-white p-6 text-center shadow-sm ring-1 ring-[#f1e7cf]">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#fff7e8] text-[#d99200]">
                <Search size={30} />
              </div>

              <h3 className="mt-4 text-lg font-extrabold">
                Nenhum fornecedor encontrado
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Tente buscar por outro nome, serviço ou categoria.
              </p>
            </div>
          )}

          <div className="space-y-4">
            {filteredSuppliers.map((supplier) => {
              const cover = getSupplierCover(supplier);
              const categoryName = getCategoryName(supplier);

              return (
                <div
                  key={supplier.id}
                  className="overflow-hidden rounded-[30px] bg-white shadow-[0_10px_25px_rgba(0,0,0,.08)] ring-1 ring-[#f1e7cf]"
                >
                  <div className="relative h-[170px] w-full overflow-hidden">
                    <img
                      src={cover}
                      alt={supplier.business_name}
                      className="h-full w-full object-cover"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    {supplier?.is_featured && (
                      <div className="absolute left-4 top-4 rounded-full bg-[#e3a925] px-3 py-1 text-xs font-extrabold text-white">
                        Destaque
                      </div>
                    )}

                    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                      <div className="text-white">
                        <p className="text-xs font-bold text-white/80">
                          {categoryName}
                        </p>
                        <h3 className="mt-1 text-[28px] font-serif leading-none">
                          {supplier.business_name}
                        </h3>
                      </div>

                      <div className="flex items-center gap-1 rounded-full bg-black/70 px-3 py-1 text-sm font-extrabold text-[#ffd76a]">
                        <Star size={14} fill="#ffd76a" />
                        {supplier?.rating_average || '4.9'}
                      </div>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                          <MapPin size={14} className="text-[#d99200]" />
                          {supplier?.city || 'Eunápolis'}
                        </div>

                        <p className="mt-2 text-sm font-bold text-gray-500">
                          {formatPrice(supplier?.average_price)}
                        </p>
                      </div>

                      <Link
                        href={`/fornecedor/${supplier.id}`}
                        className="rounded-full bg-black px-5 py-3 text-sm font-extrabold text-white"
                      >
                        Ver vitrine
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <Nav />
      </div>
    </main>
  );
}
