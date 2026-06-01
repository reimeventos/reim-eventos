import Link from 'next/link';
import { Nav } from '@/components/Nav';

const categories = [
  ['📸', 'Fotografia', '& Filmagem'],
  ['🍽️', 'Buffet', ''],
  ['🌸', 'Ornamentação', ''],
  ['📷', 'Cabine &', 'Totem'],
  ['💍', 'Cerimonial', ''],
  ['🎵', 'Música &', 'Bandas'],
  ['🎂', 'Bolos &', 'Doces'],
  ['🏛️', 'Espaços de', 'Eventos'],
];

const suppliers = [
  {
    name: 'Studio Premium',
    type: 'Fotografia & Filmagem',
    city: 'Porto Seguro',
    rating: '4.9',
    img: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=900&auto=format&fit=crop'
  },
  {
    name: 'Sabor Eventos',
    type: 'Buffet',
    city: 'Eunápolis',
    rating: '4.8',
    img: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=900&auto=format&fit=crop'
  },
  {
    name: 'Photofest Totem',
    type: 'Cabine & Totem',
    city: 'Trancoso',
    rating: '4.9',
    img: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=900&auto=format&fit=crop'
  }
];

export default function HomePage() {
  return (
    <main className="reim-shell pb-24">
      <section className="relative overflow-hidden rounded-b-[34px] bg-reimBlack text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center opacity-55" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/45 to-black/95" />

        <div className="relative px-5 pb-7 pt-5">
          <div className="flex items-center justify-between">
            <button className="rounded-2xl bg-black/35 px-4 py-3 text-xl shadow-xl">☰</button>
            <Link href="/admin" className="relative rounded-2xl bg-black/35 px-4 py-3 text-xl shadow-xl">
              🔔
              <span className="absolute -right-1 -top-1 rounded-full bg-pink-500 px-1.5 text-[10px] font-bold">3</span>
            </Link>
          </div>

          <div className="mt-4 text-center">
            <div className="text-5xl leading-none text-reimGoldLight drop-shadow-[0_0_12px_rgba(240,196,107,.75)]">♛</div>
            <h1 className="font-serif text-[42px] tracking-[.08em] leading-none text-white drop-shadow-xl">REIM</h1>
            <div className="mt-1 tracking-[.38em] text-reimGoldLight">EVENTOS</div>
            <p className="mx-auto mt-3 max-w-[260px] font-serif text-[15px] italic leading-5 text-white">
              Todos os fornecedores do seu evento em um só lugar
            </p>
            <div className="mx-auto mt-3 h-[2px] w-24 rounded-full bg-reimGoldLight" />
          </div>

          <div className="mt-7 rounded-[26px] bg-white/95 p-3 text-reimBlack shadow-2xl backdrop-blur">
            <div className="mb-3 flex items-center justify-between rounded-2xl bg-white px-3 py-2 text-sm font-bold shadow-sm">
              <span>📍 Porto Seguro</span>
              <span className="text-reimGold">⌄</span>
            </div>
            <Link href="/buscar" className="flex items-center gap-3 rounded-2xl bg-white px-4 py-4 shadow-lg">
              <span className="text-2xl text-reimGold">⌕</span>
              <span className="text-sm text-gray-500">O que você procura para seu evento?</span>
              <span className="ml-auto text-reimGold">🎙️</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="px-5 pt-6">
        <div className="grid grid-cols-4 gap-3">
          {categories.map(([icon, a, b]) => (
            <Link href="/buscar" key={a} className="rounded-[24px] border border-reimBorder bg-white px-2 py-4 text-center text-[11px] font-bold shadow-sm">
              <span className="mb-2 block text-3xl text-reimGold">{icon}</span>
              {a}{b && <><br />{b}</>}
            </Link>
          ))}
        </div>

        <div className="mt-6 overflow-hidden rounded-[28px] bg-reimBlack text-white shadow-xl">
          <div className="flex items-center gap-4 p-5">
            <div className="rounded-2xl border border-reimGold/60 p-3 text-3xl">🗓️</div>
            <div className="flex-1">
              <h2 className="font-bold">PLANEJE SEU EVENTO</h2>
              <p className="mt-1 text-sm text-white/75">Monte sua lista e organize tudo em um só lugar!</p>
              <Link href="/meu-evento" className="mt-3 inline-block rounded-full bg-reimGold px-5 py-2 text-sm font-bold text-white shadow-lg">
                Criar meu evento ›
              </Link>
            </div>
            <div className="h-24 w-24 rounded-3xl bg-[url('https://images.unsplash.com/photo-1523438885200-e635ba2c371e?q=80&w=500&auto=format&fit=crop')] bg-cover bg-center" />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <h2 className="text-lg font-extrabold">Fornecedores em destaque ✨</h2>
          <Link href="/buscar" className="text-sm font-bold text-reimGold">Ver todos</Link>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-3">
          {suppliers.map((s) => (
            <Link href="/fornecedor/demo" key={s.name} className="overflow-hidden rounded-[22px] border border-reimBorder bg-white shadow-sm">
              <div className="relative h-28 bg-cover bg-center" style={{ backgroundImage: `url(${s.img})` }}>
                <span className="absolute left-2 top-2 rounded-full bg-reimGold px-2 py-1 text-[10px] font-bold text-white">Premium</span>
                <span className="absolute right-2 top-2 rounded-full bg-black/45 px-2 py-1 text-white">♡</span>
              </div>
              <div className="p-3">
                <b className="block truncate text-xs">{s.name}</b>
                <p className="truncate text-[10px] text-gray-500">{s.type}</p>
                <p className="mt-1 text-[10px] font-bold text-reimGold">⭐ {s.rating}</p>
                <p className="text-[10px] text-gray-500">📍 {s.city}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Nav />
    </main>
  );
}
