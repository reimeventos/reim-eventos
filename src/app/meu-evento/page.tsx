import Link from 'next/link';
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Heart,
  MapPin,
  Plus,
  Share2,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import { Nav } from '@/components/Nav';

const suppliers = [
  {
    category: 'Fotografia & Filmagem',
    name: 'Studio Premium',
    status: 'Contratado',
    statusType: 'confirmed',
    addedBy: 'Maria Souza',
  },
  {
    category: 'Cabine & Totem',
    name: 'Photofest Totem',
    status: 'Contratado',
    statusType: 'confirmed',
    addedBy: 'Cerimonialista',
  },
  {
    category: 'Buffet',
    name: 'Sabor Eventos',
    status: 'Orçamento respondido',
    statusType: 'pending',
    addedBy: 'Maria Souza',
  },
  {
    category: 'Decoração',
    name: 'Buscar fornecedor',
    status: 'Pendente',
    statusType: 'empty',
    addedBy: '',
  },
];

function StatusBadge({ statusType, status }: { statusType: string; status: string }) {
  if (statusType === 'confirmed') {
    return (
      <span className="flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-[11px] font-extrabold text-green-700">
        <CheckCircle2 size={13} />
        {status}
      </span>
    );
  }

  if (statusType === 'pending') {
    return (
      <span className="flex items-center gap-1 rounded-full bg-[#fff7e8] px-3 py-1 text-[11px] font-extrabold text-[#b97900]">
        <Clock size={13} />
        {status}
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-[11px] font-extrabold text-gray-600">
      <Plus size={13} />
      {status}
    </span>
  );
}

export default function MeuEventoPage() {
  return (
    <main className="min-h-screen bg-black text-[#151515]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#fbf7f1] pb-28 shadow-2xl">
        {/* TOPO */}
        <section className="relative overflow-hidden rounded-b-[34px] bg-black px-6 pb-8 pt-7 text-white">
          <div className="absolute inset-0 bg-[url('/layout01-fundo.png')] bg-cover bg-center opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/80 to-black" />

          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-sm font-bold text-[#e3a925]">
                ‹ Voltar
              </Link>

              <button className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-[#e3a925]">
                <Share2 size={21} />
              </button>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e3a925] text-white shadow-lg">
                <Heart size={31} />
              </div>

              <div>
                <h1 className="font-serif text-[34px] leading-tight">
                  Meu Evento
                </h1>
                <p className="mt-1 text-sm text-white/70">
                  Casamento Maria & João
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/10 p-3">
                <p className="flex items-center gap-2 text-xs font-bold text-white/60">
                  <CalendarDays size={14} className="text-[#e3a925]" />
                  Data
                </p>
                <p className="mt-1 text-sm font-extrabold">22/06/2026</p>
              </div>

              <div className="rounded-2xl bg-white/10 p-3">
                <p className="flex items-center gap-2 text-xs font-bold text-white/60">
                  <MapPin size={14} className="text-[#e3a925]" />
                  Cidade
                </p>
                <p className="mt-1 text-sm font-extrabold">Eunápolis</p>
              </div>
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between text-xs font-bold text-white/70">
                <span>Progresso do evento</span>
                <span>60%</span>
              </div>

              <div className="mt-2 h-2 rounded-full bg-white/20">
                <div className="h-full w-[60%] rounded-full bg-[#e3a925]" />
              </div>
            </div>
          </div>
        </section>

        {/* COMPARTILHAR COM CERIMONIALISTA */}
        <section className="px-6 pt-6">
          <div className="rounded-[28px] bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,.08)]">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff7e8] text-[#d99200]">
                <UserPlus size={30} />
              </div>

              <div className="flex-1">
                <h2 className="text-lg font-extrabold">
                  Compartilhar evento
                </h2>

                <p className="mt-1 text-sm leading-5 text-gray-600">
                  Convide sua cerimonialista para ajudar a adicionar fornecedores,
                  solicitar orçamentos e organizar a lista.
                </p>

                <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-[22px] bg-[#e3a925] py-3 text-sm font-extrabold text-white shadow-lg">
                  <Share2 size={18} />
                  Compartilhar com cerimonialista
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* COLABORADORES */}
        <section className="px-6 pt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-extrabold">Colaboradores</h2>
            <span className="text-xs font-bold text-gray-500">2 pessoas</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[22px] bg-white p-4 shadow-sm ring-1 ring-[#f1e7cf]">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-[#d99200]" />
                <p className="text-sm font-extrabold">Maria Souza</p>
              </div>
              <p className="mt-2 text-xs font-bold text-gray-500">
                Dona do evento
              </p>
            </div>

            <div className="rounded-[22px] bg-white p-4 shadow-sm ring-1 ring-[#f1e7cf]">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-[#d99200]" />
                <p className="text-sm font-extrabold">Cerimonialista</p>
              </div>
              <p className="mt-2 text-xs font-bold text-gray-500">
                Editora
              </p>
            </div>
          </div>
        </section>

        {/* FORNECEDORES DO EVENTO */}
        <section className="px-6 pt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-extrabold">Fornecedores do evento</h2>

            <Link href="/buscar" className="text-xs font-extrabold text-[#d99200]">
              Adicionar
            </Link>
          </div>

          <div className="space-y-4">
            {suppliers.map((item) => (
              <div
                key={item.category}
                className="rounded-[28px] bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,.08)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-gray-500">
                      {item.category}
                    </p>

                    <h3 className="mt-1 text-lg font-extrabold">
                      {item.name}
                    </h3>
                  </div>

                  <StatusBadge statusType={item.statusType} status={item.status} />
                </div>

                {item.addedBy && (
                  <p className="mt-3 text-xs font-bold text-gray-500">
                    Adicionado por: {item.addedBy}
                  </p>
                )}

                <div className="mt-4 flex gap-2">
                  {item.statusType === 'empty' ? (
                    <Link
                      href="/buscar"
                      className="flex-1 rounded-full bg-[#e3a925] px-4 py-2 text-center text-xs font-extrabold text-white"
                    >
                      Buscar fornecedor
                    </Link>
                  ) : (
                    <Link
                      href="/orcamentos"
                      className="flex-1 rounded-full bg-black px-4 py-2 text-center text-xs font-extrabold text-white"
                    >
                      Ver orçamento
                    </Link>
                  )}

                  <button className="rounded-full bg-[#fbf7f1] px-4 py-2 text-[#151515] ring-1 ring-[#f1e7cf]">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/orcamentos"
            className="mt-6 block rounded-[24px] bg-black py-4 text-center font-extrabold text-white shadow-lg"
          >
            Ver todos os orçamentos
          </Link>
        </section>

        <Nav />
      </div>
    </main>
  );
}
