import Link from 'next/link';
import {
  ArrowLeft,
  Cake,
  Camera,
  CheckCircle2,
  Edit,
  Flower2,
  Gem,
  Landmark,
  Music2,
  Plus,
  Search,
  Settings,
  Trash2,
  Utensils,
  Video,
} from 'lucide-react';

const categories = [
  {
    name: 'Fotografia & Filmagem',
    suppliers: 32,
    status: 'Ativa',
    icon: Camera,
  },
  {
    name: 'Buffet',
    suppliers: 21,
    status: 'Ativa',
    icon: Utensils,
  },
  {
    name: 'Ornamentação',
    suppliers: 18,
    status: 'Ativa',
    icon: Flower2,
  },
  {
    name: 'Cabine & Totem',
    suppliers: 14,
    status: 'Ativa',
    icon: Video,
  },
  {
    name: 'Cerimonial',
    suppliers: 11,
    status: 'Ativa',
    icon: Gem,
  },
  {
    name: 'Música & Bandas',
    suppliers: 9,
    status: 'Ativa',
    icon: Music2,
  },
  {
    name: 'Bolos & Doces',
    suppliers: 8,
    status: 'Ativa',
    icon: Cake,
  },
  {
    name: 'Espaços de Eventos',
    suppliers: 6,
    status: 'Ativa',
    icon: Landmark,
  },
];

export default function AdminCategoriasPage() {
  return (
    <main className="min-h-screen bg-black text-[#151515]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#fbf7f1] pb-10 shadow-2xl">
        {/* TOPO */}
        <section className="relative overflow-hidden rounded-b-[34px] bg-black px-6 pb-8 pt-7 text-white">
          <div className="absolute inset-0 bg-[url('/layout01-fundo.png')] bg-cover bg-center opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/85 to-black" />

          <div className="relative z-10">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#e3a925]"
            >
              <ArrowLeft size={17} />
              Voltar
            </Link>

            <div className="mt-6 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e3a925] text-white shadow-lg">
                <Settings size={31} />
              </div>

              <div>
                <p className="text-sm font-bold text-[#e3a925]">
                  Administração
                </p>

                <h1 className="font-serif text-[34px] leading-tight">
                  Categorias
                </h1>

                <p className="mt-1 text-sm text-white/70">
                  Gerencie os tipos de serviços do app.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-[26px] bg-white p-3 shadow-2xl">
              <div className="flex items-center gap-3 rounded-[20px] bg-[#f7f2ea] px-4 py-4">
                <Search size={25} className="text-[#d99200]" />
                <input
                  className="w-full bg-transparent text-sm font-medium text-black outline-none placeholder:text-gray-500"
                  placeholder="Buscar categoria..."
                />
              </div>
            </div>
          </div>
        </section>

        {/* RESUMO */}
        <section className="grid grid-cols-3 gap-3 px-6 pt-6">
          <div className="rounded-[22px] bg-white p-4 text-center shadow-sm ring-1 ring-[#f1e7cf]">
            <p className="text-2xl font-extrabold text-[#d99200]">8</p>
            <p className="mt-1 text-[11px] font-bold text-gray-600">
              Categorias
            </p>
          </div>

          <div className="rounded-[22px] bg-white p-4 text-center shadow-sm ring-1 ring-[#f1e7cf]">
            <p className="text-2xl font-extrabold text-green-600">8</p>
            <p className="mt-1 text-[11px] font-bold text-gray-600">
              Ativas
            </p>
          </div>

          <div className="rounded-[22px] bg-white p-4 text-center shadow-sm ring-1 ring-[#f1e7cf]">
            <p className="text-2xl font-extrabold text-blue-600">119</p>
            <p className="mt-1 text-[11px] font-bold text-gray-600">
              Fornecedores
            </p>
          </div>
        </section>

        {/* NOVA CATEGORIA */}
        <section className="px-6 pt-6">
          <button className="flex w-full items-center justify-center gap-2 rounded-[24px] bg-[#e3a925] py-4 text-center font-extrabold text-white shadow-lg">
            <Plus size={21} />
            Nova categoria
          </button>
        </section>

        {/* LISTA */}
        <section className="px-6 pt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-extrabold">Lista de categorias</h2>
            <span className="text-xs font-bold text-gray-500">
              {categories.length} exibidas
            </span>
          </div>

          <div className="space-y-4">
            {categories.map((category) => {
              const Icon = category.icon;

              return (
                <div
                  key={category.name}
                  className="rounded-[28px] bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,.08)] ring-1 ring-[#f1e7cf]"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff7e8] text-[#d99200]">
                      <Icon size={30} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-extrabold">
                            {category.name}
                          </h3>

                          <p className="mt-1 text-sm text-gray-500">
                            {category.suppliers} fornecedores cadastrados
                          </p>
                        </div>

                        <span className="flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-[11px] font-extrabold text-green-700">
                          <CheckCircle2 size={13} />
                          {category.status}
                        </span>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <button className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#fbf7f1] px-4 py-2 text-xs font-extrabold text-[#151515] ring-1 ring-[#f1e7cf]">
                          <Edit size={15} />
                          Editar
                        </button>

                        <button className="flex flex-1 items-center justify-center gap-2 rounded-full bg-black px-4 py-2 text-xs font-extrabold text-white">
                          Destacar
                        </button>

                        <button className="rounded-full bg-red-50 px-4 py-2 text-red-700">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
