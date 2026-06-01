import Link from 'next/link';
import {
  Bell,
  Cake,
  CalendarDays,
  Camera,
  ChevronDown,
  Flower2,
  Gem,
  Heart,
  Home,
  Landmark,
  MapPin,
  Menu,
  MessageSquare,
  Mic,
  Music2,
  Search,
  User,
  Utensils,
  Video,
} from 'lucide-react';

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

const suppliers = [
  {
    name: 'Studio Premium',
    type: 'Fotografia & Filmagem',
    city: 'Eunápolis',
    rating: '4.9',
    img: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800&auto=format&fit=crop',
  },
  {
    name: 'Sabor Eventos',
    type: 'Buffet',
    city: 'Eunápolis',
    rating: '4.8',
    img: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=800&auto=format&fit=crop',
  },
  {
    name: 'Photofest Totem',
    type: 'Cabine & Totem',
    city: 'Trancoso',
    rating: '4.9',
    img: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=800&auto=format&fit=crop',
  },
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

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-[#151515]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#fbf7f1] shadow-2xl">
        {/* TOPO */}
        <section className="relative h-[480px] overflow-hidden rounded-b-[36px] bg-black text-white">
          <img
            src="/layout01-fundo.png"
            alt="Fundo REIM Eventos"
            className="absolute inset-0 h-full w-full object-cover object-[78%_top]"
          />

          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/18 to-black/78" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#fbf7f1] via-[#fbf7f1]/75 to-transparent" />

          <div className="relative z-10 flex items-center justify-between px-7 pt-7">
            <button className="flex h-[58px] w-[58px] items-center justify-center rounded-full bg-black/72 text-white shadow-xl">
              <Menu size={32} strokeWidth={2.8} />
            </button>

            <Link
              href="/admin"
              className="relative flex h-[58px] w-[58px] items-center justify-center rounded-full bg-black/72 text-[#e7ad28] shadow-xl"
            >
              <Bell size={28} fill="#e7ad28" />
              <span className="absolute -right-1 -top-1 flex h-7 min-w-7 items-center justify-center rounded-full bg-pink-500 px-1 text-sm font-extrabold text-white">
                3
              </span>
            </Link>
          </div>

          {/* LOGO CENTRAL */}
          <div className="relative z-10 mt-5 text-center">
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
            <div className="mb-4 flex items-center justify-between rounded-[24px] bg-white px-5 py-4 text-[18px] font-extrabold shadow-sm">
              <span className="flex items-center gap-3">
                <MapPin size={22} fill="#e0a21e" className="text-[#e0a21e]" />
                Eunápolis
              </span>
              <ChevronDown size={22} className="text-[#e0a21e]" />
            </div>

            <Link
              href="/buscar"
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
                <Link href="/buscar" key={cat.title} className="text-center">
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
                    href="/meu-evento"
                    className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#e3a925] px-5 py-2 text-[12px] font-bold text-white shadow-lg"
                  >
                    Criar meu evento
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

            <Link href="/buscar" className="text-[13px] font-bold text-[#d99200]">
              Ver todos
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {suppliers.map((s) => (
              <Link
                href="/fornecedor/demo"
                key={s.name}
                className="overflow-hidden rounded-[20px] bg-white shadow-[0_10px_25px_rgba(0,0,0,.10)]"
              >
                <div
                  className="relative h-[96px] bg-cover bg-center"
                  style={{ backgroundImage: `url(${s.img})` }}
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
                    {s.name}
                  </b>

                  <p className="mt-1 truncate text-[10px] text-gray-600">
                    {s.type}
                  </p>

                  <p className="mt-1 text-[10px] font-bold text-[#d99200]">
                    ★ {s.rating}
                  </p>

                  <p className="truncate text-[10px] text-gray-500">
                    📍 {s.city}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* MENU INFERIOR */}
        <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 rounded-t-[34px] bg-white/95 px-6 pb-4 pt-3 shadow-[0_-10px_30px_rgba(0,0,0,.16)] backdrop-blur">
          <div className="grid grid-cols-5 items-end text-center">
            <Link href="/" className="text-[#e3a925]">
              <Home size={30} className="mx-auto" fill="#e3a925" />
              <div className="mt-1 text-[12px] font-bold">Home</div>
              <div className="mx-auto mt-1 h-[2px] w-7 rounded-full bg-[#e3a925]" />
            </Link>

            <Link href="/buscar" className="text-[#222]">
              <Search size={30} className="mx-auto" />
              <div className="mt-1 text-[12px]">Buscar</div>
            </Link>

            <Link href="/meu-evento" className="-mt-10">
              <div className="mx-auto flex h-[76px] w-[76px] items-center justify-center rounded-full bg-[#e3a925] text-white shadow-[0_8px_25px_rgba(227,169,37,.55)]">
                <Heart size={40} strokeWidth={2.4} />
              </div>
              <div className="mt-1 text-[12px] font-bold text-[#222]">
                Meu Evento
              </div>
            </Link>

            <Link href="/orcamentos" className="text-[#222]">
              <MessageSquare size={30} className="mx-auto" />
              <div className="mt-1 text-[12px]">Orçamentos</div>
            </Link>

            <Link href="/perfil" className="text-[#222]">
              <User size={30} className="mx-auto" />
              <div className="mt-1 text-[12px]">Perfil</div>
            </Link>
          </div>
        </nav>
      </div>
    </main>
  );
}
