'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Nav } from '@/components/Nav';
import { listCategories } from '@/lib/marketplace';
import { supabase } from '@/lib/supabase';
import {
  ArrowRight,
  Camera,
  Cake,
  CheckCircle2,
  ChevronDown,
  Flower2,
  Gem,
  Heart,
  Landmark,
  MapPin,
  Music2,
  Search,
  ShieldCheck,
  Star,
  Utensils,
  Video,
  X,
} from 'lucide-react';

const defaultCities = [
  'Eunápolis',
  'Porto Seguro',
  "Arraial d'Ajuda",
  'Trancoso',
  'Belmonte',
  'Teixeira de Freitas',
  'Itagimirim',
  'Itabela',
];

function normalizeText(value: any) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function supplierAttendsCity(supplier: any, city: string) {
  const selectedCity = normalizeText(city);

  if (!selectedCity) return true;

  const serviceCities = Array.isArray(supplier?.service_cities)
    ? supplier.service_cities
    : [];

  const allCities = [supplier?.city, ...serviceCities]
    .map((item) => normalizeText(item))
    .filter(Boolean);

  return allCities.includes(selectedCity);
}


function getCategoryIcon(name: string) {
  const normalized = name.toLowerCase();

  if (normalized.includes('foto') || normalized.includes('film')) return Camera;
  if (normalized.includes('buffet')) return Utensils;
  if (normalized.includes('ornament') || normalized.includes('decor')) return Flower2;
  if (normalized.includes('totem') || normalized.includes('cabine')) return Video;
  if (normalized.includes('cerimonial')) return ShieldCheck;

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

  return Gem;
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

function getCategoryNameFromSupplier(supplier: any) {
  if (Array.isArray(supplier?.categories)) {
    return supplier.categories[0]?.name || 'Categoria não informada';
  }

  return supplier?.categories?.name || 'Categoria não informada';
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
  if (value === null || value === undefined || value === '') return '';

  const numberValue = Number(value);

  if (Number.isNaN(numberValue)) {
    return '';
  }

  return numberValue.toFixed(1);
}

function getPublicTag(visibility: any, supplier: any) {
  if (visibility?.public_badge === 'novo_no_reim') {
    return 'Novo no REIM';
  }

  if (visibility?.public_badge === 'premium' || supplier?.is_featured) {
    return 'Premium';
  }

  return 'Ativo';
}

export default function BuscarPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [visibilityBySupplier, setVisibilityBySupplier] = useState<Record<string, any>>({});
  const [reviewStatsBySupplier, setReviewStatsBySupplier] = useState<Record<string, any>>({});
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('Eunápolis');
  const [cityOpen, setCityOpen] = useState(false);
  const [availableCities, setAvailableCities] = useState<string[]>(defaultCities);
  const [showingAlternativeCities, setShowingAlternativeCities] = useState(false);
  const [alternativeCities, setAlternativeCities] = useState<string[]>([]);
  const [localSuppliersCount, setLocalSuppliersCount] = useState(0);
  const [otherCitiesSuppliersCount, setOtherCitiesSuppliersCount] = useState(0);

  const [targetCustomerId, setTargetCustomerId] = useState('');
  const [returnUrl, setReturnUrl] = useState('/');

  const [savingSupplierId, setSavingSupplierId] = useState('');
  const [savedSupplierIds, setSavedSupplierIds] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const isCerimonialistaMode = Boolean(targetCustomerId);
  const hasActiveSearch = Boolean(appliedSearch.trim());

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cliente = params.get('cliente') || '';
    const voltar = params.get('voltar') || '/';
    const cidade = params.get('cidade') || 'Eunápolis';

    setTargetCustomerId(cliente);
    setReturnUrl(voltar);
    setSelectedCity(cidade);
  }, []);

  useEffect(() => {
    async function loadSavedForTargetCustomer() {
      if (!targetCustomerId) return;

      try {
        const { data, error } = await supabase
          .from('saved_suppliers')
          .select('supplier_id')
          .eq('customer_id', targetCustomerId);

        if (error) {
          console.error('Erro ao carregar fornecedores salvos da cliente:', error);
          return;
        }

        setSavedSupplierIds((data || []).map((item: any) => item.supplier_id));
      } catch (error) {
        console.error('Erro ao verificar salvos:', error);
      }
    }

    loadSavedForTargetCustomer();
  }, [targetCustomerId]);

  useEffect(() => {
    async function loadAvailableCities() {
      try {
        const { data } = await supabase
          .from('suppliers')
          .select('city, service_cities');

        const supplierCities = (data || []).flatMap((item: any) => [
          item.city,
          ...(Array.isArray(item.service_cities) ? item.service_cities : []),
        ]);

        const cities = Array.from(
          new Set(
            [...defaultCities, ...supplierCities]
              .map((city) => String(city || '').trim())
              .filter(Boolean)
          )
        ).sort((a, b) => a.localeCompare(b, 'pt-BR'));

        setAvailableCities(cities);
      } catch (error) {
        console.error('Erro ao carregar cidades:', error);
      }
    }

    loadAvailableCities();
  }, []);

  function getSupplierLink(supplierId: string) {
    if (isCerimonialistaMode) {
      return `/fornecedor/${supplierId}?cliente=${targetCustomerId}&voltar=${encodeURIComponent(
        returnUrl
      )}`;
    }

    return `/fornecedor/${supplierId}`;
  }

  async function loadSuppliers(categoryId?: string, searchText?: string, cityText?: string) {
    try {
      setLoadingSuppliers(true);
      setShowingAlternativeCities(false);
      setAlternativeCities([]);
      setLocalSuppliersCount(0);
      setOtherCitiesSuppliersCount(0);

      /*
        Regra pública:
        1) Só carregamos fornecedores liberados pela supplier_public_visibility.
        2) Primeiro mostramos fornecedores que atendem a cidade escolhida.
        3) Se não tiver resultado na cidade, mostramos alternativas em outras cidades
           para o cliente não ficar sem opção.
      */
      const { data: visibilityData, error: visibilityError } = await supabase
        .from('supplier_public_visibility')
        .select(
          'supplier_id, public_badge, public_label, public_notice, can_appear_public, can_receive_quote'
        )
        .eq('can_appear_public', true)
        .eq('can_receive_quote', true);

      if (visibilityError) {
        throw visibilityError;
      }

      const visibleRows = visibilityData || [];
      const visibleIds = visibleRows
        .map((item: any) => item.supplier_id)
        .filter(Boolean);

      const visibilityMap = visibleRows.reduce((acc: any, item: any) => {
        acc[item.supplier_id] = item;
        return acc;
      }, {});

      setVisibilityBySupplier(visibilityMap);

      if (visibleIds.length === 0) {
        setSuppliers([]);
        setReviewStatsBySupplier({});
        return;
      }

      let query = supabase
        .from('suppliers')
        .select(`
          id,
          business_name,
          description,
          city,
          service_cities,
          whatsapp,
          instagram,
          website,
          average_price,
          rating_average,
          is_featured,
          show_price,
          status,
          category_id,
          categories(name),
          media(file_url, is_cover)
        `)
        .in('id', visibleIds)
        .eq('status', 'ativo')
        .order('is_featured', { ascending: false })
        .order('rating_average', { ascending: false });

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      const supplierIds = (data || [])
        .map((item: any) => item.id)
        .filter(Boolean);

      let reviewStatsMap: Record<string, any> = {};

      if (supplierIds.length > 0) {
        const { data: reviewStatsData, error: reviewStatsError } = await supabase
          .from('supplier_review_stats')
          .select('supplier_id, review_count, rating_average')
          .in('supplier_id', supplierIds);

        if (reviewStatsError) {
          console.error(
            'Erro ao carregar avaliações reais dos fornecedores:',
            reviewStatsError
          );
        } else {
          reviewStatsMap = (reviewStatsData || []).reduce(
            (acc: Record<string, any>, item: any) => {
              acc[item.supplier_id] = item;
              return acc;
            },
            {}
          );
        }
      }

      setReviewStatsBySupplier(reviewStatsMap);

      const normalizedSearch = String(searchText || '').trim().toLowerCase();

      const filteredBySearch = (data || []).filter((supplier: any) => {
        if (!normalizedSearch) return true;

        const supplierName = String(supplier.business_name || '').toLowerCase();
        const description = String(supplier.description || '').toLowerCase();
        const city = String(supplier.city || '').toLowerCase();
        const categoryName = getCategoryNameFromSupplier(supplier).toLowerCase();

        return (
          supplierName.includes(normalizedSearch) ||
          description.includes(normalizedSearch) ||
          city.includes(normalizedSearch) ||
          categoryName.includes(normalizedSearch)
        );
      });

      const cityToUse = cityText || selectedCity;
      const suppliersInSelectedCity = filteredBySearch.filter((supplier: any) =>
        supplierAttendsCity(supplier, cityToUse)
      );

      const suppliersFromOtherCities = filteredBySearch.filter(
        (supplier: any) => !supplierAttendsCity(supplier, cityToUse)
      );

      const citiesFound = Array.from(
        new Set(
          suppliersFromOtherCities
            .map((supplier: any) => String(supplier.city || '').trim())
            .filter(Boolean)
        )
      );

      /*
        Ordem da busca:
        1) fornecedores que atendem a cidade escolhida
        2) fornecedores de outras cidades, como alternativas
        Assim o fornecedor que marcou Porto Seguro aparece em Porto Seguro,
        mas quem é de Eunápolis também pode aparecer logo abaixo como opção extra.
      */
      setLocalSuppliersCount(suppliersInSelectedCity.length);
      setOtherCitiesSuppliersCount(suppliersFromOtherCities.length);
      setShowingAlternativeCities(
        suppliersFromOtherCities.length > 0 && Boolean(cityToUse)
      );
      setAlternativeCities(citiesFound);
      setSuppliers([...suppliersInSelectedCity, ...suppliersFromOtherCities]);
    } catch (error) {
      console.error('Erro ao carregar fornecedores:', error);
      setSuppliers([]);
      setVisibilityBySupplier({});
      setReviewStatsBySupplier({});
      setShowingAlternativeCities(false);
      setAlternativeCities([]);
      setLocalSuppliersCount(0);
      setOtherCitiesSuppliersCount(0);
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

      await loadSuppliers('', '', selectedCity);
    }

    loadInitialData();
  }, []);

  useEffect(() => {
    loadSuppliers(selectedCategoryId, appliedSearch, selectedCity);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCity]);

  const filteredSuppliers = useMemo(() => {
    const normalizedSearch = appliedSearch.trim().toLowerCase();

    if (!normalizedSearch) {
      return suppliers;
    }

    return suppliers.filter((supplier) => {
      const supplierName = String(supplier.business_name || '').toLowerCase();
      const description = String(supplier.description || '').toLowerCase();
      const city = String(supplier.city || '').toLowerCase();
      const categoryName = getCategoryNameFromSupplier(supplier).toLowerCase();

      return (
        supplierName.includes(normalizedSearch) ||
        description.includes(normalizedSearch) ||
        city.includes(normalizedSearch) ||
        categoryName.includes(normalizedSearch)
      );
    });
  }, [suppliers, appliedSearch]);

  function handleCategoryClick(categoryId: string) {
    const nextCategoryId = selectedCategoryId === categoryId ? '' : categoryId;

    setSelectedCategoryId(nextCategoryId);
    setAppliedSearch('');
    setSearch('');
    loadSuppliers(nextCategoryId, '', selectedCity);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();

    const value = search.trim();
    setAppliedSearch(value);
    loadSuppliers(selectedCategoryId, value, selectedCity);
  }

  function handleClearSearch() {
    setSearch('');
    setAppliedSearch('');
    loadSuppliers(selectedCategoryId, '', selectedCity);
  }

  async function handleSaveForCustomer(supplierId: string, supplierName: string) {
    if (!targetCustomerId) return;

    try {
      setSavingSupplierId(supplierId);
      setSuccessMessage('');
      setErrorMessage('');

      const { data: existing, error: existingError } = await supabase
        .from('saved_suppliers')
        .select('id')
        .eq('customer_id', targetCustomerId)
        .eq('supplier_id', supplierId)
        .limit(1);

      if (existingError) {
        throw existingError;
      }

      if (existing && existing.length > 0) {
        setSavedSupplierIds((current) =>
          current.includes(supplierId) ? current : [...current, supplierId]
        );
        setSuccessMessage(`${supplierName} já estava salvo no evento da cliente.`);
        return;
      }

      const { error } = await supabase.from('saved_suppliers').insert({
        customer_id: targetCustomerId,
        supplier_id: supplierId,
      });

      if (error) {
        throw error;
      }

      setSavedSupplierIds((current) =>
        current.includes(supplierId) ? current : [...current, supplierId]
      );

      setSuccessMessage(`${supplierName} adicionado ao evento da cliente.`);
    } catch (error: any) {
      console.error('Erro ao salvar fornecedor para cliente:', error);
      setErrorMessage(
        error?.message ||
          'Não foi possível adicionar este fornecedor ao evento da cliente.'
      );
    } finally {
      setSavingSupplierId('');
    }
  }

  return (
    <main className="min-h-screen bg-black text-[#151515]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#fbf7f1] pb-40 shadow-2xl">
        <section className="relative rounded-b-[34px] bg-black px-6 pb-8 pt-7 text-white">
          <div className="absolute inset-0 bg-[url('/layout01-fundo.png')] bg-cover bg-center opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/75 to-black" />

          <div className="relative z-10">
            <Link href={returnUrl} className="text-sm font-bold text-[#e3a925]">
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
                  <p className="text-sm font-extrabold">Modo cerimonialista</p>
                  <p className="mt-1 text-xs leading-5 text-white/70">
                    Ao tocar em “Adicionar ao evento”, o fornecedor será salvo no evento da cliente.
                  </p>
                </div>
              </div>
            )}

            <form
              onSubmit={handleSearchSubmit}
              className="mt-6 rounded-[28px] bg-white p-3 shadow-2xl"
            >
              <div className="flex items-center gap-2">
                <div className="flex min-w-0 flex-1 items-center gap-3 rounded-[22px] bg-[#f7f2ea] px-4 py-4">
                  <Search size={22} className="shrink-0 text-[#d99200]" />

                  <input
                    className="w-full min-w-0 bg-transparent text-sm font-medium text-black outline-none placeholder:text-gray-500"
                    placeholder="Fotógrafo, buffet, cerimonialista..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />

                  {search && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  aria-label="Buscar"
                  className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[20px] bg-[#e3a925] text-white shadow-lg active:scale-95"
                >
                  <ArrowRight size={24} />
                </button>
              </div>
            </form>

            {hasActiveSearch && (
              <div className="mt-3 flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3 text-xs font-bold text-white">
                <span>
                  Buscando por:{' '}
                  <strong className="text-[#e3a925]">{appliedSearch}</strong>
                </span>

                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="text-[#e3a925]"
                >
                  Limpar
                </button>
              </div>
            )}

            <div className="mt-4">
              <button
                type="button"
                onClick={() => setCityOpen((current) => !current)}
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white/90"
              >
                <MapPin size={16} className="text-[#e3a925]" />
                {selectedCity}
                <ChevronDown
                  size={15}
                  className={`text-[#e3a925] transition ${
                    cityOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {cityOpen && (
                <div className="mt-3 max-h-72 overflow-y-auto rounded-[24px] bg-white p-2 text-[#151515] shadow-2xl ring-1 ring-[#f1e7cf]">
                  {availableCities.map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => {
                        setSelectedCity(city);
                        setCityOpen(false);
                      }}
                      className={`flex w-full items-center gap-3 rounded-[18px] px-4 py-3 text-left text-sm font-extrabold ${
                        selectedCity === city
                          ? 'bg-[#fff7e8] text-[#b97900]'
                          : 'text-[#151515]'
                      }`}
                    >
                      <MapPin size={16} className="text-[#d99200]" />
                      {city}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {(successMessage || errorMessage) && (
          <section className="px-6 pt-4">
            {successMessage && (
              <div className="flex items-center gap-2 rounded-2xl bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
                <CheckCircle2 size={18} />
                {successMessage}
              </div>
            )}

            {errorMessage && (
              <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                {errorMessage}
              </div>
            )}
          </section>
        )}

        {!hasActiveSearch && (
          <section className="px-6 pt-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-extrabold">Categorias</h2>
              <span className="text-xs font-bold text-[#d99200]">
                {loadingCategories
                  ? 'Carregando...'
                  : `${categories.length + 1} categorias`}
              </span>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2">
              <button
                type="button"
                onClick={() => handleCategoryClick('')}
                className={`min-w-[104px] rounded-[22px] p-3 text-center shadow-sm ring-1 transition ${
                  selectedCategoryId === ''
                    ? 'bg-[#e3a925] text-white ring-[#e3a925]'
                    : 'bg-white text-[#151515] ring-[#f1e7cf]'
                }`}
              >
                <div
                  className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${
                    selectedCategoryId === ''
                      ? 'bg-white/20 text-white'
                      : 'bg-[#fff7e8] text-[#d99200]'
                  }`}
                >
                  <Search size={25} strokeWidth={2.2} />
                </div>

                <p className="mt-2 line-clamp-2 text-[11px] font-extrabold leading-4">
                  Todos
                </p>
              </button>

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
        )}

        <section className={hasActiveSearch ? 'px-6 pt-5' : 'px-6 pt-6'}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-extrabold">
              {hasActiveSearch ? 'Resultado da busca' : 'Resultados'}
            </h2>
            <span className="text-xs font-bold text-gray-500">
              {loadingSuppliers
                ? 'Carregando...'
                : `${filteredSuppliers.length} encontrados`}
            </span>
          </div>

          {showingAlternativeCities && !loadingSuppliers && (
            <div className="mb-4 rounded-[24px] bg-[#fff7e8] p-4 text-sm leading-5 text-[#7a5200] ring-1 ring-[#f1e7cf]">
              {localSuppliersCount > 0 ? (
                <>
                  <p className="font-extrabold">
                    Primeiro mostramos fornecedores que atendem {selectedCity}.
                  </p>
                  <p className="mt-1">
                    Logo abaixo também aparecem opções de outras cidades:{' '}
                    <strong>{alternativeCities.join(', ') || 'regiões próximas'}</strong>.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-extrabold">
                    Nenhum fornecedor encontrado em {selectedCity}.
                  </p>
                  <p className="mt-1">
                    Encontramos opções em outras cidades:{' '}
                    <strong>{alternativeCities.join(', ') || 'regiões próximas'}</strong>.
                  </p>
                </>
              )}
            </div>
          )}

          {loadingSuppliers && (
            <div className="rounded-[28px] bg-white p-6 text-center shadow-sm ring-1 ring-[#f1e7cf]">
              <p className="text-sm font-bold text-gray-500">
                Carregando fornecedores...
              </p>
            </div>
          )}

          {!loadingSuppliers && filteredSuppliers.length === 0 && (
            <div className="rounded-[28px] bg-white p-6 text-center shadow-sm ring-1 ring-[#f1e7cf]">
              <Search size={36} className="mx-auto text-[#d99200]" />
              <h3 className="mt-4 text-lg font-extrabold">
                Nenhum fornecedor encontrado
              </h3>
              <p className="mt-2 text-sm leading-5 text-gray-500">
                Tente buscar por outro nome, serviço ou categoria.
              </p>
            </div>
          )}

          <div className="space-y-4">
            {filteredSuppliers.map((supplier, index) => {
              const supplierName = supplier.business_name || 'Fornecedor';
              const categoryName = getCategoryNameFromSupplier(supplier);
              const city = supplier.city || 'Cidade não informada';
              const price = formatPrice(supplier.average_price);
              const coverImage = getCoverImage(supplier);
              const supplierId = supplier.id || 'demo';
              const visibility = visibilityBySupplier[supplierId] || null;
              const reviewStats = reviewStatsBySupplier[supplierId] || null;
              const reviewCount = Number(reviewStats?.review_count || 0);
              const rating = formatRating(reviewStats?.rating_average);
              const tag = getPublicTag(visibility, supplier);
              const isSavedForCustomer = savedSupplierIds.includes(supplierId);

              return (
                <div key={supplierId}>
                  {index === 0 && localSuppliersCount > 0 && (
                    <div className="mb-3 rounded-[18px] bg-green-50 px-4 py-3 text-xs font-extrabold text-green-700 ring-1 ring-green-100">
                      Opções que atendem {selectedCity}
                    </div>
                  )}

                  {index === localSuppliersCount &&
                    otherCitiesSuppliersCount > 0 && (
                      <div className="mb-3 mt-5 rounded-[18px] bg-[#fff7e8] px-4 py-3 text-xs font-extrabold text-[#7a5200] ring-1 ring-[#f1e7cf]">
                        Outras cidades disponíveis
                      </div>
                    )}

                  <div
                    className="overflow-hidden rounded-[28px] bg-white shadow-[0_10px_25px_rgba(0,0,0,.08)]"
                  >
                  <Link href={getSupplierLink(supplierId)} className="block">
                    <div className="relative h-44 bg-cover bg-center">
                      <img
                        src={coverImage}
                        alt={supplierName}
                        className="h-full w-full object-cover"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                      <span className="absolute left-4 top-4 rounded-full bg-[#e3a925] px-3 py-1 text-xs font-extrabold text-white">
                        {tag === 'Premium' ? '♛ Premium' : tag}
                      </span>

                      {isSavedForCustomer && (
                        <span className="absolute right-4 top-4 rounded-full bg-green-600 px-3 py-1 text-xs font-extrabold text-white">
                          Salvo
                        </span>
                      )}

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
                          {reviewCount > 0 && rating ? (
                            <>
                              <Star
                                size={15}
                                fill="#e3a925"
                                className="text-[#e3a925]"
                              />
                              {rating} ({reviewCount})
                            </>
                          ) : (
                            <span className="text-xs">Novo no REIM</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>

                  <div className="p-4">
                    <div className="flex items-center justify-between gap-3">
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

                        {Array.isArray(supplier.service_cities) &&
                          supplier.service_cities.length > 0 && (
                            <p className="mt-1 text-[11px] font-bold text-[#b97900]">
                              Atende: {supplier.service_cities.slice(0, 3).join(', ')}
                            </p>
                          )}
                      </div>

                      <Link
                        href={getSupplierLink(supplierId)}
                        className="rounded-full bg-black px-4 py-2 text-xs font-bold text-white"
                      >
                        Ver vitrine
                      </Link>
                    </div>

                    {visibility?.public_badge === 'novo_no_reim' && (
                      <div className="mt-4 rounded-[18px] bg-[#fff7e8] px-4 py-3 text-xs font-bold leading-5 text-[#8a6100] ring-1 ring-[#f1e7cf]">
                        <p className="font-extrabold">Novo fornecedor no REIM</p>
                        <p className="mt-1">
                          Este fornecedor está em fase inicial na plataforma. Aguarde a confirmação de disponibilidade após solicitar o orçamento.
                        </p>
                      </div>
                    )}

                    {isCerimonialistaMode && (
                      <button
                        type="button"
                        onClick={() => handleSaveForCustomer(supplierId, supplierName)}
                        disabled={savingSupplierId === supplierId || isSavedForCustomer}
                        className={
                          isSavedForCustomer
                            ? 'mt-4 flex w-full items-center justify-center gap-2 rounded-[20px] bg-green-50 py-3 text-center text-sm font-extrabold text-green-700 ring-1 ring-green-100'
                            : 'mt-4 flex w-full items-center justify-center gap-2 rounded-[20px] bg-[#e3a925] py-3 text-center text-sm font-extrabold text-white shadow-lg disabled:opacity-60'
                        }
                      >
                        {isSavedForCustomer ? (
                          <>
                            <CheckCircle2 size={18} />
                            Adicionado ao evento
                          </>
                        ) : (
                          <>
                            <Heart size={18} />
                            {savingSupplierId === supplierId
                              ? 'Adicionando...'
                              : 'Adicionar ao evento da cliente'}
                          </>
                        )}
                      </button>
                    )}
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
