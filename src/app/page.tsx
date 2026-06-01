import Link from 'next/link';

const categories = [
  { icon: '📸', title: 'Fotografia', desc: 'Fotos e filmagem' },
  { icon: '🍽️', title: 'Buffet', desc: 'Comidas e bebidas' },
  { icon: '🌸', title: 'Decoração', desc: 'Ornamentação' },
  { icon: '📷', title: 'Totem', desc: 'Cabine e fotos' },
  { icon: '💍', title: 'Cerimonial', desc: 'Organização' },
  { icon: '🎵', title: 'Música', desc: 'Bandas e DJ' },
  { icon: '🎂', title: 'Bolos', desc: 'Doces e buffet' },
  { icon: '🏛️', title: 'Espaços', desc: 'Locais de eventos' },
];

const suppliers = [
  {
    name: 'Studio Premium',
    type: 'Fotografia & Filmagem',
    city: 'Porto Seguro',
    rating: '4.9',
    img: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=900&auto=format&fit=crop',
  },
  {
    name: 'Sabor Eventos',
    type: 'Buffet Completo',
    city: 'Eunápolis',
    rating: '4.8',
    img: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=900&auto=format&fit=crop',
  },
  {
    name: 'Photofest Totem',
    type: 'Cabine & Totem',
    city: 'Trancoso',
    rating: '4.9',
    img: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=900&auto=format&fit=crop',
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f7f2ea] text-[#1d1a16]">
      <section className="relative min-h-[620px] overflow-hidden bg-black text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-black/25" />

        <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          <div>
            <div className="text-3xl text-[#d7a84f]">♛</div>
            <h1 className="font-serif text-3xl tracking-[0.18em]">REIM</h1>
            <p className="tracking-[0.45em] text-[#d7a84f] text-xs">EVENTOS</p>
          </div>

          <nav className="hidden items-center gap-8 text-sm font-semibold md:flex">
            <Link href="/">Home</Link>
            <Link href="/buscar">Buscar</Link>
            <Link href="/meu-evento">Meu Evento</Link>
            <Link href="/painel-fornecedor">Fornecedor</Link>
            <Link href="/admin" className="rounded-full bg-[#d7a84f] px-5 py-2 text-black">
              Admin
            </Link>
          </nav>

          <button className="rounded-2xl bg-white/10 px-4 py-3 text-xl md:hidden">☰</button>
        </header>

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 px-6 pb-20 pt-10 md:grid-cols-2 md:pt-20">
          <div>
            <p className="mb-4 inline-block rounded-full border border-[#d7a84f]/50 bg-black/30 px-4 py-2 text-sm text-[#f0d28a]">
              Plataforma premium para eventos
            </p>

            <h2 className="font-serif text-5xl leading-tight md:text-7xl">
              Encontre fornecedores para o seu evento
            </h2>

            <p className="mt-5 max-w-xl text-lg leading-8 text-white/80">
              Todos os fornecedores em um só lugar: fotografia, buffet, decoração,
              música, cerimonial, totem fotográfico e muito mais.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/buscar"
                className="rounded-full bg-[#d7a84f] px-8 py-4 text-center font-bold text-black shadow-xl"
              >
                Buscar fornecedores
              </Link>

              <Link
                href="/painel-fornecedor"
                className="rounded-full border border-white/30 bg-white/10 px-8 py-4 text-center font-bold text-white"
              >
                Sou fornecedor
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] bg-white/95 p-5 text-black shadow-2xl">
            <div className="rounded-[1.5rem] bg-[#f7f2ea] p-4">
              <div className="mb-4 rounded-2xl bg-white px-4 py-4 font-bold shadow">
                📍 Porto Seguro
              </div>

              <Link
                href="/buscar"
                className="flex items-center gap-3 rounded-2xl bg-white px-5 py-5 shadow-lg"
              >
                <span className="text-2xl text-[#d7a84f]">⌕</span>
                <span className="text-gray-500">O que você procura para seu evento?</span>
              </Link>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-black p-5 text-white">
                <p className="text-3xl font-bold">+80</p>
                <p className="text-sm text-white/70">fornecedores</p>
              </div>
              <div className="rounded-2xl bg-[#d7a84f] p-5 text-black">
                <p className="text-3xl font-bold">4.9</p>
                <p className="text-sm">avaliação média</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="font-bold text-[#b8892f]">Categorias</p>
            <h2 className="font-serif text-4xl">Escolha o que precisa</h2>
          </div>
          <Link href="/buscar" className="hidden font-bold text-[#b8892f] md:block">
            Ver todos
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {categories.map((cat) => (
            <Link
              href="/buscar"
              key={cat.title}
              className="rounded-[1.5rem] border border-black/5 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <span className="text-4xl">{cat.icon}</span>
              <h3 className="mt-4 font-bold">{cat.title}</h3>
              <p className="mt-1 text-sm text-gray-500">{cat.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-14">
        <div className="overflow-hidden rounded-[2rem] bg-black text-white shadow-2xl">
          <div className="grid items-center gap-6 p-8 md:grid-cols-2 md:p-12">
            <div>
              <p className="text-[#d7a84f] font-bold">Planejamento</p>
              <h2 className="mt-2 font-serif text-4xl">Organize seu evento com facilidade</h2>
              <p className="mt-4 text-white/70">
                Crie sua lista, salve fornecedores favoritos e acompanhe tudo em um só lugar.
              </p>
              <Link
                href="/meu-evento"
                className="mt-6 inline-block rounded-full bg-[#d7a84f] px-7 py-3 font-bold text-black"
              >
                Criar meu evento
              </Link>
            </div>

            <div className="h-72 rounded-[1.5rem] bg-[url('https://images.unsplash.com/photo-1523438885200-e635ba2c371e?q=80&w=900&auto=format&fit=crop')] bg-cover bg-center" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="font-bold text-[#b8892f]">Destaques</p>
            <h2 className="font-serif text-4xl">Fornecedores em destaque</h2>
          </div>
          <Link href="/buscar" className="hidden font-bold text-[#b8892f] md:block">
            Ver todos
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {suppliers.map((s) => (
            <Link
              href="/fornecedor/demo"
              key={s.name}
              className="overflow-hidden rounded-[1.7rem] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div
                className="relative h-64 bg-cover bg-center"
                style={{ backgroundImage: `url(${s.img})` }}
              >
                <span className="absolute left-4 top-4 rounded-full bg-[#d7a84f] px-4 py-2 text-sm font-bold text-black">
                  Premium
                </span>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold">{s.name}</h3>
                <p className="mt-1 text-gray-500">{s.type}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-bold text-[#b8892f]">⭐ {s.rating}</span>
                  <span className="text-gray-500">📍 {s.city}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <footer className="bg-black px-6 py-10 text-center text-white">
        <div className="text-3xl text-[#d7a84f]">♛</div>
        <h2 className="font-serif text-3xl tracking-[0.18em]">REIM</h2>
        <p className="tracking-[0.45em] text-[#d7a84f] text-xs">EVENTOS</p>
        <p className="mt-4 text-sm text-white/60">
          Todos os fornecedores do seu evento em um só lugar.
        </p>
      </footer>
    </main>
  );
}
