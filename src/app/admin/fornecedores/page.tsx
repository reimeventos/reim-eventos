import Link from 'next/link';
import {
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  Crown,
  Eye,
  MapPin,
  Search,
  ShieldCheck,
  Star,
  XCircle,
} from 'lucide-react';

const suppliers = [
  {
    name: 'Studio Premium',
    category: 'Fotografia & Filmagem',
    city: 'Eunápolis',
    status: 'Aprovado',
    plan: 'Premium',
    rating: '4.9',
    featured: true,
  },
  {
    name: 'Photofest Totem',
    category: 'Cabine & Totem',
    city: 'Eunápolis',
    status: 'Aprovado',
    plan: 'Premium',
    rating: '4.9',
    featured: true,
  },
  {
    name: 'Sabor Eventos',
    category: 'Buffet',
    city: 'Porto Seguro',
    status: 'Pendente',
    plan: 'Básico',
    rating: '4.8',
    featured: false,
  },
  {
    name: 'Decora Luxo',
    category: 'Ornamentação',
    city: 'Eunápolis',
    status: 'Pendente',
    plan: 'Básico',
    rating: '4.7',
    featured: false,
  },
];

function StatusBadge({ status }: { status: string }) {
  if (status === 'Aprovado') {
    return (
      <span className="flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-[11px] font-extrabold text-green-700">
        <CheckCircle2 size={13} />
        Aprovado
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1 rounded-full bg-[#fff7e8] px-3 py-1 text-[11px] font-extrabold text-[#b97900]">
      <ShieldCheck size={13} />
      Pendente
    </span>
  );
}

export default function AdminFornecedoresPage() {
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
                <Briefcase size={31} />
              </div>

              <div>
                <p className="text-sm font-bold text-[#e3a925]">
                  Administração
                </p>

                <h1 className="font-serif text-[34px] leading-tight">
                  Fornecedores
                </h1>

                <p className="mt-1 text-sm text-white/70">
                  Aprove, destaque e gerencie vitrines.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-[26px] bg-white p-3 shadow-2xl">
              <div className="flex items-center gap-3 rounded-[20px] bg-[#f7f2ea] px-4 py-4">
                <Search size={25} className="text-[#d99200]" />
                <input
                  className="w-full bg-transparent text-sm font-medium text-black outline-none placeholder:text-gray-500"
                  placeholder="Buscar fornecedor..."
                />
              </div>
            </div>
          </div>
        </section>

        {/* RESUMO */}
        <section className="grid grid-cols-3 gap-3 px-6 pt-6">
          <div className="rounded-[22px] bg-white p-4 text-center shadow-sm ring-1 ring-[#f1e7cf]">
            <p className="text-2xl font-extrabold text-[#d99200]">127</p>
            <p className="mt-1 text-[11px] font-bold text-gray-600">
              Total
            </p>
          </div>

          <div className="rounded-[22px] bg-white p-4 text-center shadow-sm ring-1 ring-[#f1e7cf]">
            <p className="text-2xl font-extrabold text-green-600">96</p>
            <p className="mt-1 text-[11px] font-bold text-gray-600">
              Aprovados
            </p>
          </div>

          <div className="rounded-[22px] bg-white p-4 text-center shadow-sm ring-1 ring-[#f1e7cf]">
            <p className="text-2xl font-extrabold text-[#b97900]">31</p>
            <p className="mt-1 text-[11px] font-bold text-gray-600">
              Pendentes
            </p>
          </div>
        </section>

        {/* LISTA */}
        <section className="px-6 pt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-extrabold">Lista de fornecedores</h2>
            <span className="text-xs font-bold text-gray-500">
              {suppliers.length} exibidos
            </span>
          </div>

          <div className="space-y-4">
            {suppliers.map((supplier) => (
              <div
                key={supplier.name}
                className="rounded-[28px] bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,.08)] ring-1 ring-[#f1e7cf]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-extrabold">
                      {supplier.name}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      {supplier.category}
                    </p>
                  </div>

                  <StatusBadge status={supplier.status} />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-[#fbf7f1] p-3">
                    <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                      <MapPin size={14} className="text-[#d99200]" />
                      Cidade
                    </p>
                    <p className="mt-1 text-sm font-extrabold">
                      {supplier.city}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#fbf7f1] p-3">
                    <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                      <Crown size={14} className="text-[#d99200]" />
                      Plano
                    </p>
                    <p className="mt-1 text-sm font-extrabold">
                      {supplier.plan}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-sm font-bold text-[#d99200]">
                    <Star size={15} fill="#e3a925" className="text-[#e3a925]" />
                    {supplier.rating}
                    {supplier.featured ? ' • Destaque' : ''}
                  </span>

                  <div className="flex gap-2">
                    <Link
                      href="/fornecedor/demo"
                      className="rounded-full bg-[#fbf7f1] px-4 py-2 text-xs font-extrabold text-[#151515] ring-1 ring-[#f1e7cf]"
                    >
                      <span className="inline-flex items-center gap-1">
                        <Eye size={14} />
                        Ver
                      </span>
                    </Link>

                    {supplier.status === 'Pendente' ? (
                      <button className="rounded-full bg-green-600 px-4 py-2 text-xs font-extrabold text-white">
                        Aprovar
                      </button>
                    ) : (
                      <button className="rounded-full bg-black px-4 py-2 text-xs font-extrabold text-white">
                        Destacar
                      </button>
                    )}
                  </div>
                </div>

                {supplier.status === 'Pendente' && (
                  <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-[20px] bg-red-50 py-3 text-sm font-extrabold text-red-700">
                    <XCircle size={18} />
                    Reprovar cadastro
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
