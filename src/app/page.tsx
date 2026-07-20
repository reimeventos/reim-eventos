'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  Bell,
  Cake,
  CalendarDays,
  Camera,
  ChevronDown,
  Flower2,
  Gem,
  Heart,
  Landmark,
  MapPin,
  Menu,
  Mic,
  Music2,
  Search,
  Utensils,
  Video,
  X,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Nav } from '@/components/Nav';

const categories = [
  { icon: Camera, title: 'Fotografia', subtitle: '& Filmagem' },
  { icon: Utensils, title: 'Buffet', subtitle: '' },
  { icon: Flower2, title: 'Ornamentação', subtitle: '' },
  { icon: Video, title: 'Cabine &', subtitle: 'Totem' },
  { icon: Gem, title: 'Cerimonial', subtitle: '' },
  { icon: Music2, title: 'Música &', subtitle: 'Bandas' },
  { icon: Cake, title: 'Bolos &', subtitle: 'Doces' },
  { icon: Landmark, title: 'Espaços de', subtitle: 'Eventos' },
];

const fallbackImages = [
  'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=800&auto=format&fit=crop',
];

function CrownLogo() {
  return (
    <svg
      width="92"
      height="72"
      viewBox="0 0 120 90"
      className="mx-auto drop-shadow-[0_0_14px_rgba(227,169,37,.85)]"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffe59a" />
          <stop offset="45%" stopColor="#e8b53c" />
          <stop offset="100%" stopColor="#b87a06" />
        </linearGradient>
      </defs>

      <circle cx="18" cy="18" r="6.5" fill="url(#goldGradient)" />
      <circle cx="40" cy="11" r="6.5" fill="url(#goldGradient)" />
      <circle cx="60" cy="8" r="6.5" fill="url(#goldGradient)" />
      <circle cx="80" cy="11" r="6.5" fill="url(#goldGradient)" />
      <circle cx="102" cy="18" r="6.5" fill="url(#goldGradient)" />

      <path
        d="M16 24 L26 58 L40 24 L52 58 L60 18 L68 58 L80 24 L94 58 L104 24 L108 64 H12 Z"
        fill="url(#goldGradient)"
        stroke="#f8d77c"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      <rect
        x="20"
        y="64"
        width="80"
        height="9"
        rx="4.5"
        fill="url(#goldGradient)"
        stroke="#f8d77c"
        strokeWidth="2"
      />
    </svg>
  );
}

function getTestAccountType(email: string) {
  const normalized = email.toLowerCase();

  if (normalized.startsWith('cliente@')) {
    return 'cliente';
  }

  if (normalized.startsWith('fornecedor@')) {
    return 'fornecedor';
  }

  if (normalized.startsWith('cerimonialista@')) {
    return 'cerimonialista';
  }

  if (normalized.startsWith('admin@')) {
    return 'admin';
  }

  return '';
}

function getBellHref(accountType: string) {
  if (accountType === 'admin') {
    return '/admin';
  }

  if (accountType === 'fornecedor') {
    return '/painel-fornecedor/leads';
  }

  if (accountType === 'cerimonialista') {
    return '/cerimonialista/convites';
  }

  if (accountType === 'cliente') {
    return '/orcamentos';
  }

  return '/perfil';
}

function getPlanHref(accountType: string) {
  if (accountType === 'fornecedor') {
    return '/painel-fornecedor';
  }

  if (accountType === 'cerimonialista') {
    return '/cerimonialista/convites';
  }

  return '/meu-evento';
}

function getPlanButtonText(accountType: string) {
  if (accountType === 'fornecedor') {
    return 'Abrir painel';
  }

  if (accountType === 'cerimonialista') {
    return 'Ver convites';
  }

  return 'Criar meu evento';
}

export default function HomePage() {
  const [featuredSuppliers, setFeaturedSuppliers] = useState<any[]>([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);
  const [accountType, setAccountType] = useState('cliente');
  const [notificationCount, setNotificationCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Eunápolis');
  const [availableCities, setAvailableCities] = useState<string[]>([
    'Eunápolis',
    'Porto Seguro',
    "Arraial d'Ajuda",
    'Trancoso',
    'Belmonte',
    'Teixeira de Freitas',
    'Itagimirim',
    'Itabela',
  ]);

  useEffect(() => {
    async function loadAccountType() {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const user = userData.user;

        if (!user) {
          setAccountType('cliente');
          setNotificationCount(0);
          return;
        }

        const email = user.email || '';
        const testType = getTestAccountType(email);

        if (testType) {
          setAccountType(testType);
        } else {
          const { data: collaboratorData } = await supabase
            .from('event_collaborators')
            .select('id')
            .ilike('collaborator_email', email)
            .limit(1);

          if (collaboratorData && collaboratorData.length > 0) {
            setAccountType('cerimonialista');
          } else {
            const { data: supplierData } = await supabase
              .from('suppliers')
              .select('id')
              .eq('owner_id', user.id)
              .limit(1);

            if (supplierData && supplierData.length > 0) {
              setAccountType('fornecedor');
            } else {
              setAccountType('cliente');
            }
          }
        }

        const currentType = testType || accountType;

        if (testType === 'cerimonialista') {
          const { data } = await supabase
            .from('event_collaborators')
            .select('id,status')
            .ilike('collaborator_email', email)
            .eq('status', 'pendente');

          setNotificationCount(data?.length || 0);
          return;
        }

        if (testType === 'fornecedor') {
          const { data: supplierData } = await supabase
            .from('suppliers')
            .select('id')
            .eq('owner_id', user.id)
            .limit(1)
            .maybeSingle();

          if (supplierData?.id) {
            const { data } = await supabase
              .from('quote_requests')
              .select('id')
              .eq('supplier_id', supplierData.id)
              .eq('status', 'novo');

            setNotificationCount(data?.length || 0);
          }

          return;
        }

        if (testType === 'cliente' || currentType === 'cliente') {
          const { data } = await supabase
            .from('quote_requests')
            .select('id')
            .eq('customer_id', user.id)
            .in('status', ['respondido', 'ajuste_solicitado']);

          setNotificationCount(data?.length || 0);
          return;
        }

        if (testType === 'admin') {
          setNotificationCount(0);
        }
      } catch (error) {
        console.error('Erro ao carregar tipo da conta:', error);
        setAccountType('cliente');
        setNotificationCount(0);
      }
    }

    loadAccountType();
  }, []);

  useEffect(() => {
    async function loadAvailableCities() {
      try {
        const fixedCities = [
          'Eunápolis',
          'Porto Seguro',
          "Arraial d'Ajuda",
          'Trancoso',
          'Belmonte',
          'Teixeira de Freitas',
          'Itagimirim',
          'Itabela',
        ];

        const { data, error } = await supabase
          .from('suppliers')
          .select('city')
          .not('city', 'is', null);

        if (error) {
          throw error;
        }

        const supplierCities = (data || [])
          .map((item: any) => String(item.city || '').trim())
          .filter(Boolean);

        const mergedCities = Array.from(
          new Set([...fixedCities, ...supplierCities])
        ).sort((a, b) => a.localeCompare(b, 'pt-BR'));

        setAvailableCities(mergedCities);
      } catch (error) {
        console.error('Erro ao carregar cidades:', error);
      }
    }

    loadAvailableCities();
  }, []);

  useEffect(() => {
    async function loadFeaturedSuppliers() {
      try {
        setLoadingSuppliers(true);

        const { data, error } = await supabase
          .from('suppliers')
          .select(`
            id,
            business_name,
            city,
            rating_average,
            is_featured,
            status,
            categories(name),
            media(file_url, is_cover)
          `)
          .eq('status', 'ativo')
          .eq('is_featured', true)
          .order('rating_average', { ascending: false })
          .limit(3);

        if (error) {
          throw error;
        }

        const supplierRows = data || [];
        const supplierIds = supplierRows
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
              'Erro ao carregar avaliações dos fornecedores em destaque:',
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

        const suppliersWithReviews = supplierRows
          .map((item: any) => ({
            ...item,
            review_count: Number(reviewStatsMap[item.id]?.review_count || 0),
            real_rating_average:
              reviewStatsMap[item.id]?.rating_average !== null &&
              reviewStatsMap[item.id]?.rating_average !== undefined
                ? Number(reviewStatsMap[item.id].rating_average)
                : null,
          }))
          .sort((a: any, b: any) => {
            const ratingA = Number(a.real_rating_average || 0);
            const ratingB = Number(b.real_rating_average || 0);
            return ratingB - ratingA;
          });

        setFeaturedSuppliers(suppliersWithReviews);
      } catch (error) {
        console.error('Erro ao carregar fornecedores em destaque:', error);
        setFeaturedSuppliers([]);
      } finally {
        setLoadingSuppliers(false);
      }
    }

    loadFeaturedSuppliers();
  }, []);

  function getSupplierImage(supplier: any, index: number) {
    const media = supplier?.media || [];
    const cover = media.find((item: any) => item.is_cover);
    const firstMedia = media[0];

    return (
      cover?.file_url ||
      firstMedia?.file_url ||
      fallbackImages[index] ||
      fallbackImages[0]
    );
  }

  function getSupplierCategory(supplier: any) {
    if (Array.isArray(supplier?.categories)) {
      return supplier.categories[0]?.name || 'Fornecedor de eventos';
    }

    return supplier?.categories?.name || 'Fornecedor de eventos';
  }

  const bellHref = getBellHref(accountType);
  const planHref = getPlanHref(accountType);
  const planButtonText = getPlanButtonText(accountType);

  return (
    <main className="min-h-screen bg-black text-[#151515]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#fbf7f1] shadow-2xl">
        {/* TOPO */}
        <section className="relative h-[480px] overflow-hidden rounded-b-[36px] bg-black text-white">
          <img
            src="/layout01-fundo-sem-noivos.png"
            alt="Fundo REIM Eventos"
            className="absolute inset-0 h-full w-full object-cover object-[78%_top]"
          />

          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/18 to-black/78" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#fbf7f1] via-[#fbf7f1]/75 to-transparent" />

          <div className="relative z-10 flex items-center justify-between px-7 pt-7">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="flex h-[58px] w-[58px] items-center justify-center rounded-full bg-black/72 text-white shadow-xl"
            >
              <Menu size={32} strokeWidth={2.8} />
            </button>

            <Link
              href={bellHref}
              className="relative flex h-[58px] w-[58px] items-center justify-center rounded-full bg-black/72 text-[#e7ad28] shadow-xl"
            >
              <Bell size={28} fill="#e7ad28" />

              {notificationCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-7 min-w-7 items-center justify-center rounded-full bg-pink-500 px-1 text-sm font-extrabold text-white">
                  {notificationCount}
                </span>
              )}
            </Link>
          </div>

          {/* LOGO CENTRAL */}
          <div className="relative z-10 mt-0 text-center">
            <CrownLogo />

            <h1 className="mt-1 font-serif text-[60px] leading-none tracking-[0.12em] text-white drop-shadow-[0_3px_8px_rgba(0,0,0,.35)]">
              REIM
            </h1>

            <div className="mt-2 text-[20px] font-semibold tracking-[0.42em] text-[#e3a925]">
              EVENTOS
            </div>

            <p className="mx-auto mt-4 max-w-[310px] font-serif text-[19px] italic leading-7 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,.45)]">
              Todos os fornecedores do seu evento em um só lugar
            </p>

            <div className="mx-auto mt-4 h-[3px] w-28 rounded-full bg-[#e3a925]" />
          </div>
        </section>

        {/* BUSCA */}
        <section className="relative z-20 -mt-14 px-6">
          <div className="rounded-[30px] bg-[#f7f4ef] p-4 shadow-[0_20px_45px_rgba(0,0,0,.18)]">
            <div className="relative mb-4">
              <button
                type="button"
                onClick={() => setCityOpen((current) => !current)}
                className="flex w-full items-center justify-between rounded-[24px] bg-white px-5 py-4 text-[18px] font-extrabold shadow-sm"
              >
                <span className="flex items-center gap-3">
                  <MapPin size={22} fill="#e0a21e" className="text-[#e0a21e]" />
                  {selectedCity}
                </span>
                <ChevronDown
                  size={22}
                  className={`text-[#e0a21e] transition ${
                    cityOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {cityOpen && (
                <div className="absolute left-0 right-0 top-[64px] z-40 max-h-72 overflow-y-auto rounded-[24px] bg-white p-2 shadow-2xl ring-1 ring-[#f1e7cf]">
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

            <Link
              href={`/buscar?cidade=${encodeURIComponent(selectedCity)}`}
              className="flex items-center gap-4 rounded-[24px] bg-white px-5 py-5 shadow-lg"
            >
              <Search size={32} className="text-[#d99200]" />
              <span className="flex-1 text-[15px] leading-5 text-gray-500">
                O que você procura para seu evento?
              </span>
              <Mic size={24} className="text-[#d99200]" />
            </Link>
          </div>
        </section>

        {/* CATEGORIAS */}
        <section className="px-6 pt-8">
          <div className="grid grid-cols-4 gap-x-4 gap-y-7">
            {categories.map((cat) => {
              const Icon = cat.icon;

              return (
                <Link
                    href={`/buscar?cidade=${encodeURIComponent(selectedCity)}`}
                    key={cat.title}
                    className="text-center"
                  >
                  <div className="mx-auto flex h-[76px] w-[76px] items-center justify-center rounded-full bg-white shadow-[0_10px_22px_rgba(0,0,0,.08)] ring-1 ring-[#f1e7cf]">
                    <Icon
                      size={32}
                      strokeWidth={2.2}
                      className="text-[#d89a12]"
                    />
                  </div>

                  <div className="mt-2 text-[11px] font-extrabold leading-4 text-black">
                    {cat.title}
                    {cat.subtitle && (
                      <>
                        <br />
                        {cat.subtitle}
                      </>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* PLANEJE SEU EVENTO */}
        <section className="px-6 pt-8">
          <div className="overflow-hidden rounded-[26px] bg-black text-white shadow-xl">
            <div className="relative min-h-[132px] p-5">
              <div
                className="absolute inset-0 bg-cover bg-right"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1523438885200-e635ba2c371e?q=80&w=800&auto=format&fit=crop')",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/20" />

              <div className="relative flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-[#e3a925]">
                  <CalendarDays size={40} strokeWidth={2.2} />
                </div>

                <div className="max-w-[230px]">
                  <h2 className="text-[18px] font-extrabold">
                    PLANEJE SEU EVENTO
                  </h2>

                  <p className="mt-1 text-[13px] leading-5 text-white/90">
                    Monte sua lista e organize tudo em um só lugar!
                  </p>

                  <Link
                    href={planHref}
                    className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#e3a925] px-5 py-2 text-[12px] font-bold text-white shadow-lg"
                  >
                    {planButtonText}
                    <span className="text-lg leading-none">›</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FORNECEDORES */}
        <section className="px-6 pb-32 pt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[18px] font-extrabold">
              Fornecedores em destaque ✨
            </h2>

            <Link
              href={`/buscar?cidade=${encodeURIComponent(selectedCity)}`}
              className="text-[13px] font-bold text-[#d99200]"
            >
              Ver todos
            </Link>
          </div>

          {loadingSuppliers && (
            <div className="rounded-[22px] bg-white p-5 text-center text-sm font-bold text-gray-500 shadow-sm ring-1 ring-[#f1e7cf]">
              Carregando fornecedores...
            </div>
          )}

          {!loadingSuppliers && featuredSuppliers.length === 0 && (
            <div className="rounded-[22px] bg-white p-5 text-center text-sm font-bold text-gray-500 shadow-sm ring-1 ring-[#f1e7cf]">
              Nenhum fornecedor em destaque encontrado.
            </div>
          )}

          {!loadingSuppliers && featuredSuppliers.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              {featuredSuppliers.map((supplier, index) => (
                <Link
                  href={`/fornecedor/${supplier.id}`}
                  key={supplier.id}
                  className="overflow-hidden rounded-[20px] bg-white shadow-[0_10px_25px_rgba(0,0,0,.10)]"
                >
                  <div
                    className="relative h-[96px] bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${getSupplierImage(supplier, index)})`,
                    }}
                  >
                    <span className="absolute left-2 top-2 rounded-full bg-[#e3a925] px-2 py-1 text-[9px] font-extrabold text-white">
                      ♛ Premium
                    </span>

                    <span className="absolute right-2 top-2 text-xl text-white drop-shadow">
                      ♡
                    </span>
                  </div>

                  <div className="p-3">
                    <b className="block truncate text-[12px] leading-4">
                      {supplier.business_name || 'Fornecedor'}
                    </b>

                    <p className="mt-1 truncate text-[10px] text-gray-600">
                      {getSupplierCategory(supplier)}
                    </p>

                    <p className="mt-1 text-[10px] font-bold text-[#d99200]">
                      {supplier.review_count > 0 &&
                      supplier.real_rating_average !== null
                        ? `★ ${Number(supplier.real_rating_average).toFixed(1)} (${supplier.review_count})`
                        : 'Novo no REIM'}
                    </p>

                    <p className="truncate text-[10px] text-gray-500">
                      📍 {supplier.city || 'Eunápolis'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {menuOpen && (
          <div className="fixed inset-0 z-[90] bg-black/70">
            <div className="ml-auto min-h-screen w-[82%] max-w-[330px] bg-[#fbf7f1] p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#d99200]">
                    REIM Eventos
                  </p>
                  <h2 className="mt-1 font-serif text-2xl font-bold">
                    Menu
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-black text-white"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="mt-7 space-y-3">
                <Link
                  href="/"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-[22px] bg-white px-5 py-4 text-sm font-extrabold shadow-sm ring-1 ring-[#f1e7cf]"
                >
                  Home
                </Link>

                <Link
                  href={`/buscar?cidade=${encodeURIComponent(selectedCity)}`}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-[22px] bg-white px-5 py-4 text-sm font-extrabold shadow-sm ring-1 ring-[#f1e7cf]"
                >
                  Buscar fornecedores
                </Link>

                <Link
                  href="/meu-evento"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-[22px] bg-white px-5 py-4 text-sm font-extrabold shadow-sm ring-1 ring-[#f1e7cf]"
                >
                  Meu Evento
                </Link>

                <Link
                  href="/orcamentos"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-[22px] bg-white px-5 py-4 text-sm font-extrabold shadow-sm ring-1 ring-[#f1e7cf]"
                >
                  Meus Orçamentos
                </Link>

                <Link
                  href="/painel-fornecedor"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-[22px] bg-white px-5 py-4 text-sm font-extrabold shadow-sm ring-1 ring-[#f1e7cf]"
                >
                  Painel do Fornecedor
                </Link>

                <Link
                  href="/perfil"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-[22px] bg-black px-5 py-4 text-sm font-extrabold text-white shadow-sm"
                >
                  Perfil / Entrar
                </Link>
              </div>
            </div>
          </div>
        )}

        <Nav />
      </div>
    </main>
  );
}
