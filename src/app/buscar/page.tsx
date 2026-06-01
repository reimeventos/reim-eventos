import Link from 'next/link';
import { Nav } from '@/components/Nav';
import {
  Camera,
  Cake,
  Flower2,
  Gem,
  Landmark,
  MapPin,
  Music2,
  Search,
  Star,
  Utensils,
  Video,
} from 'lucide-react';

const categories = [
  { icon: Camera, name: 'Fotografia' },
  { icon: Utensils, name: 'Buffet' },
  { icon: Flower2, name: 'Ornamentação' },
  { icon: Video, name: 'Totem' },
  { icon: Gem, name: 'Cerimonial' },
  { icon: Music2, name: 'Música' },
  { icon: Cake, name: 'Bolos' },
  { icon: Landmark, name: 'Espaços' },
];

const suppliers = [
  {
    name: 'Studio Premium',
    category: 'Fotografia & Filmagem',
    city: 'Eunápolis',
    price: 'R$ 1.200+',
    rating: '4.9',
    tag: 'Premium',
    image:
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=900&auto=format&fit=crop',
  },
  {
    name: 'Photofest Totem',
    category: 'Cabine & Totem',
    city: 'Eunápolis',
    price: 'R$ 1.100+',
    rating: '4.9',
    tag: 'Destaque',
    image:
      'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=900&auto=format&fit=crop',
  },
  {
    name: 'Sabor Eventos',
    category: 'Buffet Completo',
    city: 'Eunápolis',
    price: 'Sob consulta',
    rating: '4.8',
    tag: 'Premium',
    image:
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=900&auto=format&fit=crop',
  },
  {
    name: 'Decora Luxo',
    category: 'Ornamentação',
    city: 'Eunápolis',
    price: 'R$ 900+',
    rating: '4.7',
    tag: 'Novo',
    image:
      'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?q=80&w=900&auto=format&fit=crop',
  },
];

export default function BuscarPage() {
  return (
    <main className="min-h-screen bg-black text-[#151515]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#fbf7f1] pb-28 shadow-2xl">
        {/* TOPO */}
        <section className="relative overflow-hidden rounded-b-[34px] bg-black px-6 pb-8 pt-7 text-white">
          <div className="absolute inset-0 bg-[url('/layout01-fundo.png')] bg-cover bg-center opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/75 to-black" />

          <div className="relative z-10">
            <Link href="/" className="text-sm font-bold text-[#e3a925]">
              ‹ Voltar
            </Link>

            <h1 className="mt-5 font-serif text-[34px] leading-tight">
              Buscar fornecedores
            </h1>

            <p className="mt-2 text-sm text-white/70">
              Encontre serviços para seu evento em Eunápolis
            </p>

            <div className="mt-6 rounded-[26px] bg-white p-3 shadow-2xl">
              <div className="flex items-center gap-3 rounded-[20px] bg-[#f7f2ea] px-4 py-4">
                <Search size={25} className="text-[#d99200]" />
                <input
                  className="w-full bg-transparent text-sm font-medium text-black outline-none placeholder:text-gray-500"
                  placeholder="Fotógrafo, buffet, totem..."
                />
              </div>
            </div>

            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white/90">
              <MapPin size={16} className="text-[#e3a925]" />
              Eunápolis
            </div>
          </div>
        </section>

        {/* FILTROS */}
        <section className="px-6 pt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-extrabold">Categorias</h2>
            <span className="text-xs font-bold text-[#d99200]">Filtros</span>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2">
            {categories.map((cat) => {
              const Icon = cat.icon;

              return (
                <Link
                  href="/buscar"
                  key={cat.name}
                  className="min-w-[92px] rounded-[22px] bg-white p-3 text-center shadow-sm ring-1 ring-[#f1e7cf]"
                >
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#fff7e8] text-[#d99200]">
                    <Icon size={25} strokeWidth={2.2} />
                  </div>
                  <p className="mt-2 text-[11px] font-extrabold">{cat.name}</p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* RESULTADOS */}
        <section className="px-6 pt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-extrabold">Resultados</h2>
            <span className="text-xs font-bold text-gray-500">
              {suppliers.length} encontrados
            </span>
          </div>

          <div className="space-y-4">
            {suppliers.map((supplier) => (
              <Link
                href="/fornecedor/demo"
                key={supplier.name}
                className="block overflow-hidden rounded-[28px] bg-white shadow-[0_10px_25px_rgba(0,0,0,.08)]"
              >
                <div className="relative h-44 bg-cover bg-center">
                  <img
                    src={supplier.image}
                    alt={supplier.name}
                    className="h-full w-full object-cover"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                  <span className="absolute left-4 top-4 rounded-full bg-[#e3a925] px-3 py-1 text-xs font-extrabold text-white">
                    ♛ {supplier.tag}
                  </span>

                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
                    <div>
                      <h3 className="text-xl font-extrabold">
                        {supplier.name}
                      </h3>
                      <p className="text-sm text-white/80">
                        {supplier.category}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 rounded-full bg-black/45 px-3 py-1 text-sm font-bold">
                      <Star size={15} fill="#e3a925" className="text-[#e3a925]" />
                      {supplier.rating}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4">
                  <div>
                    <p className="flex items-center gap-1 text-sm font-bold text-gray-700">
                      <MapPin size={15} className="text-[#d99200]" />
                      {supplier.city}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      A partir de {supplier.price}
                    </p>
                  </div>

                  <span className="rounded-full bg-black px-4 py-2 text-xs font-bold text-white">
                    Ver vitrine
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <Nav />
      </div>
    </main>
  );
}
