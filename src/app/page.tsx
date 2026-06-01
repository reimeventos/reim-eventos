import Link from 'next/link';

const categories = [
  { icon: '📸', title: 'Fotografia', subtitle: '& Filmagem' },
  { icon: '🍽️', title: 'Buffet', subtitle: '' },
  { icon: '🌸', title: 'Ornamentação', subtitle: '' },
  { icon: '📷', title: 'Cabine &', subtitle: 'Totem' },
  { icon: '💍', title: 'Cerimonial', subtitle: '' },
  { icon: '🎵', title: 'Música &', subtitle: 'Bandas' },
  { icon: '🎂', title: 'Bolos &', subtitle: 'Doces' },
  { icon: '🏛️', title: 'Espaços de', subtitle: 'Eventos' },
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

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black py-0 text-[#161616] sm:py-6">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#fbf7f1] shadow-2xl sm:min-h-[920px] sm:rounded-[42px] sm:border-[8px] sm:border-[#151515]">
        
        {/* TOPO */}
        <section className="relative overflow-hidden rounded-b-[34px] bg-black text-white">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center opacity-75" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/35 to-black/90" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#fbf7f1] via-[#fbf7f1]/80 to-transparent" />

          <div className="relative px-6 pb-20 pt-8">
            <div className="flex items-center justify-between">
              <button className="flex h-14 w-14 items-center justify-center rounded-full bg-black/65 text-3xl shadow-xl">
                ≡
              </button>

              <Link
                href="/admin"
                className="relative flex h-14 w-14 items-center justify-center rounded-full bg-black/65 text-2xl shadow-xl"
              >
                🔔
                <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-pink-500 px-1 text-xs font-bold text-white">
                  3
                </span>
              </Link>
            </div>

            <div className="mt-5 text-center">
              <div className="text-6xl leading-none text-[#e4ad32] drop-shadow-[0_0_16px_rgba(228,173,50,.55)]">
                ♛
              </div>

              <h1 className="mt-1 font-serif text-[54px] leading-none tracking-[0.14em] text-white drop-shadow-xl">
                REIM
              </h1>

              <div className="mt-1 text-[20px] font-semibold tracking-[0.42em] text-[#e4ad32]">
                EVENTOS
              </div>

              <p className="mx-auto mt-4 max-w-[300px] font-serif text-[18px] italic leading-6 text-white drop-shadow">
                Todos os fornecedores do seu evento em um só lugar
              </p>

              <div className="mx-auto mt-4 h-[2px] w-24 rounded-full bg-[#e4ad32]" />
            </div>
          </div>
        </section>

        {/* BUSCA */}
        <section className="relative z-10 -mt-16 px-6">
          <div className="rounded-[28px] bg-white/95 p-3 shadow-2xl backdrop-blur">
            <div className="mb-3 flex items-center justify-between rounded-[22px] bg-white px-5 py-4 text-[16px] font-extrabold shadow-sm">
              <span className="flex items-center gap-2">
                <span className="text-[#e4a018]">📍</span>
                Eunápolis
              </span>
              <span className="text-xl text-[#e4a018]">⌄</span>
            </div>

            <Link
              href="/buscar"
              className="flex items-center gap-3 rounded-[22px] bg-white px-5 py-4 shadow-lg"
            >
              <span className="text-3xl text-[#d89200]">⌕</span>
              <span className="text-sm text-gray-500">
                O que você procura para seu evento?
              </span>
              <span className="ml-auto text-2xl text-[#d89200]">🎙️</span>
            </Link>
          </div>
        </section>

        {/* CATEGORIAS */}
        <section className="px-6 pt-7">
          <div className="grid grid-cols-4 gap-x-4 gap-y-5">
            {categories.map((cat) => (
              <Link href="/buscar" key={cat.title} className="text-center">
                <div className="mx-auto flex h-[74px] w-[74px] items-center justify-center rounded-full bg-white text-[34px] text-[#d89200] shadow-[0_10px_25px_rgba(0,0,0,.08)]">
                  {cat.icon}
                </div>

                <div className="mt-2 text-[11px] font-extrabold leading-3 text-black">
                  {cat.title}
                  {cat.subtitle && (
                    <>
                      <br />
                      {cat.subtitle}
                    </>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* PLANEJE SEU EVENTO */}
        <section className="px-6 pt-7">
          <div className="overflow-hidden rounded-[26px] bg-black text-white shadow-xl">
            <div className="relative min-h-[132px] p-5">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523438885200-e635ba2c371e?q=80&w=800&auto=format&fit=crop')] bg-cover bg-right opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/10" />

              <div className="relative flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#e4ad32]/50 text-3xl text-[#e4ad32]">
                  🗓️
                </div>

                <div className="max-w-[210px]">
                  <h2 className="text-[18px] font-extrabold">
                    PLANEJE SEU EVENTO
                  </h2>

                  <p className="mt-1 text-[13px] leading-5 text-white/85">
                    Monte sua lista e organize tudo em um só lugar!
                  </p>

                  <Link
                    href="/meu-evento"
                    className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#e4ad32] px-5 py-2 text-[12px] font-bold text-white shadow-lg"
                  >
                    Criar meu evento
                    <span>›</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FORNECEDORES */}
        <section className="px-6 pb-28 pt-7">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[18px] font-extrabold">
              Fornecedores em destaque ✨
            </h2>

            <Link href="/buscar" className="text-[13px] font-bold text-[#d89200]">
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
                  className="relative h-[92px] bg-cover bg-center"
                  style={{ backgroundImage: `url(${s.img})` }}
                >
                  <span className="absolute left-2 top-2 rounded-full bg-[#e4ad32] px-2 py-1 text-[9px] font-extrabold text-white">
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

                  <p className="mt-1 text-[10px] font-bold text-[#d89200]">
                    ⭐ {s.rating}
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
        <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 rounded-t-[34px] bg-white/95 px-5 pb-4 pt-3 shadow-[0_-10px_30px_rgba(0,0,0,.15)] backdrop-blur sm:bottom-6 sm:rounded-[34px]">
          <div className="grid grid-cols-5 items-end text-center">
            <Link href="/" className="text-[#e4ad32]">
              <div className="text-3xl">🏠</div>
              <div className="mt-1 text-[11px] font-bold">Home</div>
              <div className="mx-auto mt-1 h-[2px] w-6 rounded-full bg-[#e4ad32]" />
            </Link>

            <Link href="/buscar" className="text-[#222]">
              <div className="text-3xl">⌕</div>
              <div className="mt-1 text-[11px]">Buscar</div>
            </Link>

            <Link href="/meu-evento" className="-mt-10">
              <div className="mx-auto flex h-[74px] w-[74px] items-center justify-center rounded-full bg-[#e4ad32] text-4xl text-white shadow-[0_8px_25px_rgba(228,173,50,.55)]">
                ♡
              </div>
              <div className="mt-1 text-[11px] font-bold text-[#222]">
                Meu Evento
              </div>
            </Link>

            <Link href="/orcamentos" className="text-[#222]">
              <div className="text-3xl">💬</div>
              <div className="mt-1 text-[11px]">Orçamentos</div>
            </Link>

            <Link href="/perfil" className="text-[#222]">
              <div className="text-3xl">👤</div>
              <div className="mt-1 text-[11px]">Perfil</div>
            </Link>
          </div>
        </nav>
      </div>
    </main>
  );
}
