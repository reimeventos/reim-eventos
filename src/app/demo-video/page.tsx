'use client';

import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Cake,
  Camera,
  Check,
  ChevronRight,
  GlassWater,
  Heart,
  Home,
  Landmark,
  Loader2,
  MapPin,
  Music2,
  PartyPopper,
  Search,
  Sparkles,
  Star,
  Store,
  Users,
  Utensils,
  WandSparkles,
} from 'lucide-react';

type DemoSupplier = {
  id: string;
  name: string;
  category: string;
  city: string;
  rating: number;
  reviews: number;
  image: string;
  featured?: boolean;
};

const categories = [
  {
    name: 'Espaço de Eventos',
    icon: Landmark,
    image: '/categorias/espaco-de-eventos.jpg',
  },
  {
    name: 'Buffet',
    icon: Utensils,
    image: '/categorias/buffet.jpg',
  },
  {
    name: 'Fotografia',
    icon: Camera,
    image: '/categorias/fotografia-e-filmagem.jpg',
  },
  {
    name: 'Bandas',
    icon: Music2,
    image: '/categorias/bandas-e-musicos.jpg',
  },
  {
    name: 'Bolos e Doces',
    icon: Cake,
    image: '/categorias/bolo-doces-e-salgados.jpg',
  },
  {
    name: 'Decoração',
    icon: WandSparkles,
    image: '/categorias/decoracao.jpg',
  },
  {
    name: 'Drinks',
    icon: GlassWater,
    image: '/categorias/drinks-e-barman.jpg',
  },
  {
    name: 'Animação',
    icon: PartyPopper,
    image: '/categorias/animadores-e-personagens.jpg',
  },
];

const suppliers: DemoSupplier[] = [
  {
    id: 'bella-festa',
    name: 'Espaço Bella Festa',
    category: 'Espaço de Eventos',
    city: 'Eunápolis',
    rating: 4.9,
    reviews: 38,
    image: '/categorias/espaco-de-eventos.jpg',
    featured: true,
  },
  {
    id: 'sabor-arte',
    name: 'Buffet Sabor & Arte',
    category: 'Buffet',
    city: 'Porto Seguro',
    rating: 4.8,
    reviews: 27,
    image: '/categorias/buffet.jpg',
    featured: true,
  },
  {
    id: 'luz-do-dia',
    name: 'Fotografia Luz do Dia',
    category: 'Fotografia e Filmagem',
    city: 'Eunápolis',
    rating: 5,
    reviews: 41,
    image: '/categorias/fotografia-e-filmagem.jpg',
  },
  {
    id: 'celebration',
    name: 'Banda Celebration',
    category: 'Bandas & Músicos',
    city: 'Itabela',
    rating: 4.7,
    reviews: 19,
    image: '/categorias/bandas-e-musicos.jpg',
  },
  {
    id: 'doces-encanto',
    name: 'Doces Encanto',
    category: 'Bolos, Doces e Salgados',
    city: 'Eunápolis',
    rating: 4.9,
    reviews: 33,
    image: '/categorias/bolo-doces-e-salgados.jpg',
  },
  {
    id: 'jardim-sonhos',
    name: 'Decoração Jardim dos Sonhos',
    category: 'Decoração',
    city: 'Porto Seguro',
    rating: 4.8,
    reviews: 24,
    image: '/categorias/decoracao.jpg',
  },
  {
    id: 'premium-drinks',
    name: 'Premium Drinks & Barman',
    category: 'Drinks e Barman',
    city: 'Eunápolis',
    rating: 4.9,
    reviews: 29,
    image: '/categorias/drinks-e-barman.jpg',
  },
  {
    id: 'atelier-noivos',
    name: 'Atelier dos Noivos',
    category: 'Vestuário',
    city: 'Porto Seguro',
    rating: 4.8,
    reviews: 18,
    image: '/categorias/atelier-de-noivos.jpg',
  },
];

type Screen = 'home' | 'favorites' | 'request' | 'success';

function DemoImage({
  src,
  alt,
  fallback,
}: {
  src: string;
  alt: string;
  fallback: React.ReactNode;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <>{fallback}</>;
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className="h-full w-full object-cover"
    />
  );
}

export default function DemoVideoPage() {
  const [screen, setScreen] = useState<Screen>('home');
  const [favorites, setFavorites] = useState<string[]>([
    'bella-festa',
    'sabor-arte',
    'luz-do-dia',
  ]);
  const [selected, setSelected] = useState<string[]>([
    'bella-festa',
    'sabor-arte',
    'luz-do-dia',
  ]);
  const [sending, setSending] = useState(false);

  const favoriteSuppliers = useMemo(
    () => suppliers.filter((supplier) => favorites.includes(supplier.id)),
    [favorites]
  );

  function toggleFavorite(id: string) {
    setFavorites((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  function toggleSelected(id: string) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  async function sendDemoRequest() {
    if (selected.length === 0) return;

    setSending(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setSending(false);
    setScreen('success');
  }

  return (
    <main className="min-h-screen bg-black text-[#181818]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#fbf7f1] pb-28 shadow-2xl">
        {screen === 'home' && (
          <>
            <section className="relative overflow-hidden rounded-b-[38px] bg-black px-5 pb-7 pt-6 text-white">
              <div className="absolute inset-0 bg-[url('/layout01-fundo.png')] bg-cover bg-center opacity-45" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/85 to-black" />

              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#e3a925]">
                      Demonstração
                    </p>
                    <h1 className="mt-1 font-serif text-[34px] leading-none">
                      REIM EVENTOS
                    </h1>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e3a925] text-white shadow-lg">
                    <Sparkles size={25} />
                  </div>
                </div>

                <p className="mt-4 max-w-[310px] text-sm font-semibold leading-6 text-white/80">
                  Todos os fornecedores do seu evento em um só lugar.
                </p>

                <div className="mt-5 flex items-center gap-3 rounded-[22px] bg-white px-4 py-4 text-black shadow-xl">
                  <Search size={22} className="text-[#d99200]" />
                  <span className="text-sm font-semibold text-gray-500">
                    Buscar fornecedores...
                  </span>
                </div>
              </div>
            </section>

            <section className="px-5 pt-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-extrabold">Categorias</h2>
                <span className="text-xs font-bold text-[#d99200]">
                  Ver todas
                </span>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {categories.map((category) => {
                  const Icon = category.icon;

                  return (
                    <div key={category.name} className="text-center">
                      <div className="mx-auto h-16 w-16 overflow-hidden rounded-full bg-white shadow-md ring-2 ring-white">
                        <DemoImage
                          src={category.image}
                          alt={category.name}
                          fallback={
                            <div className="flex h-full w-full items-center justify-center bg-[#fff3d8] text-[#d99200]">
                              <Icon size={27} />
                            </div>
                          }
                        />
                      </div>

                      <p className="mt-2 line-clamp-2 text-[10px] font-extrabold leading-3">
                        {category.name}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="px-5 pt-7">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-extrabold">
                    Fornecedores em destaque
                  </h2>
                  <p className="mt-1 text-xs font-semibold text-gray-500">
                    Perfis demonstrativos para apresentação
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {suppliers.slice(0, 5).map((supplier) => {
                  const isFavorite = favorites.includes(supplier.id);

                  return (
                    <article
                      key={supplier.id}
                      className="overflow-hidden rounded-[26px] bg-white shadow-[0_12px_28px_rgba(0,0,0,.10)] ring-1 ring-[#f1e7cf]"
                    >
                      <div className="relative h-40 bg-[#f2eadf]">
                        <DemoImage
                          src={supplier.image}
                          alt={supplier.name}
                          fallback={
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#2a2116] to-black text-[#e3a925]">
                              <Store size={45} />
                            </div>
                          }
                        />

                        <button
                          type="button"
                          onClick={() => toggleFavorite(supplier.id)}
                          className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/95 shadow-lg"
                        >
                          <Heart
                            size={23}
                            className={
                              isFavorite
                                ? 'fill-red-500 text-red-500'
                                : 'text-gray-700'
                            }
                          />
                        </button>

                        {supplier.featured && (
                          <span className="absolute bottom-3 left-3 rounded-full bg-[#e3a925] px-3 py-1 text-[10px] font-extrabold text-white shadow">
                            DESTAQUE
                          </span>
                        )}
                      </div>

                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-base font-extrabold">
                              {supplier.name}
                            </h3>
                            <p className="mt-1 text-xs font-semibold text-gray-500">
                              {supplier.category}
                            </p>
                          </div>

                          <ChevronRight size={21} className="text-[#d99200]" />
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-1 text-sm font-extrabold">
                            <Star
                              size={16}
                              className="fill-[#e3a925] text-[#e3a925]"
                            />
                            {supplier.rating.toFixed(1)}
                            <span className="text-xs font-semibold text-gray-400">
                              ({supplier.reviews})
                            </span>
                          </div>

                          <div className="flex items-center gap-1 text-xs font-bold text-gray-500">
                            <MapPin size={14} />
                            {supplier.city}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          </>
        )}

        {screen === 'favorites' && (
          <>
            <section className="rounded-b-[34px] bg-black px-5 pb-7 pt-6 text-white">
              <button
                type="button"
                onClick={() => setScreen('home')}
                className="flex items-center gap-2 text-sm font-bold text-[#e3a925]"
              >
                <ArrowLeft size={18} />
                Voltar
              </button>

              <div className="mt-6 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e3a925]">
                  <Heart size={28} className="fill-white" />
                </div>

                <div>
                  <p className="text-sm font-bold text-[#e3a925]">
                    Planejamento
                  </p>
                  <h1 className="font-serif text-[34px]">Favoritos</h1>
                </div>
              </div>
            </section>

            <section className="px-5 pt-6">
              <div className="rounded-[24px] bg-[#fff5dd] p-4 text-sm font-bold leading-6 text-[#7a5610] ring-1 ring-[#f1d28d]">
                Selecione os fornecedores e envie um pedido de orçamento para
                todos de uma só vez.
              </div>

              <div className="mt-5 space-y-4">
                {favoriteSuppliers.map((supplier) => {
                  const isSelected = selected.includes(supplier.id);

                  return (
                    <article
                      key={supplier.id}
                      className={`rounded-[26px] bg-white p-4 shadow-sm ring-2 ${
                        isSelected
                          ? 'ring-[#e3a925]'
                          : 'ring-[#f1e7cf]'
                      }`}
                    >
                      <div className="flex gap-4">
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-[#f2eadf]">
                          <DemoImage
                            src={supplier.image}
                            alt={supplier.name}
                            fallback={
                              <div className="flex h-full w-full items-center justify-center bg-[#fff3d8] text-[#d99200]">
                                <Store size={30} />
                              </div>
                            }
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-base font-extrabold">
                            {supplier.name}
                          </h3>
                          <p className="mt-1 text-xs font-semibold text-gray-500">
                            {supplier.category}
                          </p>

                          <div className="mt-2 flex items-center gap-1 text-xs font-bold text-gray-500">
                            <MapPin size={13} />
                            {supplier.city}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleSelected(supplier.id)}
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                            isSelected
                              ? 'bg-[#e3a925] text-white'
                              : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          {isSelected && <Check size={19} />}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setScreen('request')}
                disabled={selected.length === 0}
                className="mt-6 w-full rounded-[24px] bg-[#e3a925] py-4 text-sm font-extrabold text-white shadow-lg disabled:opacity-50"
              >
                Solicitar orçamento para {selected.length}{' '}
                {selected.length === 1 ? 'fornecedor' : 'fornecedores'}
              </button>
            </section>
          </>
        )}

        {screen === 'request' && (
          <>
            <section className="rounded-b-[34px] bg-black px-5 pb-7 pt-6 text-white">
              <button
                type="button"
                onClick={() => setScreen('favorites')}
                className="flex items-center gap-2 text-sm font-bold text-[#e3a925]"
              >
                <ArrowLeft size={18} />
                Voltar
              </button>

              <div className="mt-6">
                <p className="text-sm font-bold text-[#e3a925]">
                  Pedido coletivo
                </p>
                <h1 className="mt-1 font-serif text-[32px]">
                  Solicitar orçamento
                </h1>
                <p className="mt-2 text-sm leading-6 text-white/70">
                  Um único pedido será enviado aos fornecedores selecionados.
                </p>
              </div>
            </section>

            <section className="px-5 pt-6">
              <div className="space-y-4">
                <label className="block rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-[#f1e7cf]">
                  <span className="text-xs font-extrabold text-gray-500">
                    Tipo do evento
                  </span>
                  <div className="mt-2 text-sm font-extrabold">
                    Aniversário
                  </div>
                </label>

                <label className="block rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-[#f1e7cf]">
                  <span className="text-xs font-extrabold text-gray-500">
                    Data do evento
                  </span>
                  <div className="mt-2 text-sm font-extrabold">
                    18 de outubro de 2026
                  </div>
                </label>

                <label className="block rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-[#f1e7cf]">
                  <span className="text-xs font-extrabold text-gray-500">
                    Cidade
                  </span>
                  <div className="mt-2 text-sm font-extrabold">Eunápolis</div>
                </label>

                <label className="block rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-[#f1e7cf]">
                  <span className="text-xs font-extrabold text-gray-500">
                    Observações
                  </span>
                  <div className="mt-2 text-sm font-semibold leading-6 text-gray-600">
                    Evento para aproximadamente 120 convidados. Gostaria de
                    receber disponibilidade, valores e condições de pagamento.
                  </div>
                </label>
              </div>

              <div className="mt-5 rounded-[24px] bg-white p-4 ring-1 ring-[#f1e7cf]">
                <div className="flex items-center gap-3">
                  <Users size={22} className="text-[#d99200]" />
                  <div>
                    <p className="text-sm font-extrabold">
                      {selected.length} fornecedores selecionados
                    </p>
                    <p className="mt-1 text-xs font-semibold text-gray-500">
                      Cada fornecedor receberá seu próprio pedido.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={sendDemoRequest}
                disabled={sending}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-[24px] bg-[#e3a925] py-4 text-sm font-extrabold text-white shadow-lg disabled:opacity-70"
              >
                {sending && <Loader2 size={19} className="animate-spin" />}
                {sending ? 'Enviando pedidos...' : 'Enviar pedido em um clique'}
              </button>
            </section>
          </>
        )}

        {screen === 'success' && (
          <section className="flex min-h-[820px] flex-col items-center justify-center px-7 text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-green-600">
              <Check size={50} strokeWidth={3} />
            </div>

            <p className="mt-7 text-xs font-extrabold uppercase tracking-[0.25em] text-[#d99200]">
              Pedido enviado
            </p>

            <h1 className="mt-3 font-serif text-[36px] leading-tight">
              Pronto! Seu evento está mais organizado.
            </h1>

            <p className="mt-4 text-sm font-semibold leading-7 text-gray-600">
              Seu pedido foi enviado para {selected.length} fornecedores.
              Agora basta acompanhar as propostas pelo REIM EVENTOS.
            </p>

            <button
              type="button"
              onClick={() => {
                setScreen('home');
                setSelected(['bella-festa', 'sabor-arte', 'luz-do-dia']);
              }}
              className="mt-8 w-full rounded-[24px] bg-black py-4 text-sm font-extrabold text-white"
            >
              Voltar para o início
            </button>

            <div className="mt-8 rounded-[26px] bg-[#fff5dd] px-5 py-4 text-sm font-extrabold text-[#8b6418] ring-1 ring-[#f1d28d]">
              reimeventos.com.br
            </div>
          </section>
        )}

        {screen !== 'success' && (
          <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 rounded-t-[32px] bg-white/95 px-6 pb-4 pt-3 shadow-[0_-10px_30px_rgba(0,0,0,.15)] backdrop-blur">
            <div className="grid grid-cols-3 items-end text-center">
              <button
                type="button"
                onClick={() => setScreen('home')}
                className={screen === 'home' ? 'text-[#e3a925]' : 'text-gray-500'}
              >
                <Home
                  size={27}
                  className="mx-auto"
                  fill={screen === 'home' ? '#e3a925' : 'none'}
                />
                <p className="mt-1 text-[11px] font-bold">Home</p>
              </button>

              <button
                type="button"
                onClick={() => setScreen('favorites')}
                className={
                  screen === 'favorites'
                    ? 'text-[#e3a925]'
                    : 'text-gray-500'
                }
              >
                <Heart
                  size={27}
                  className="mx-auto"
                  fill={screen === 'favorites' ? '#e3a925' : 'none'}
                />
                <p className="mt-1 text-[11px] font-bold">Favoritos</p>
              </button>

              <button
                type="button"
                onClick={() => setScreen('request')}
                className={
                  screen === 'request'
                    ? 'text-[#e3a925]'
                    : 'text-gray-500'
                }
              >
                <Users size={27} className="mx-auto" />
                <p className="mt-1 text-[11px] font-bold">Orçamento</p>
              </button>
            </div>
          </nav>
        )}
      </div>
    </main>
  );
}
