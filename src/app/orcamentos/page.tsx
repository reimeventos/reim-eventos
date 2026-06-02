import Link from 'next/link';
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  MessageCircle,
  Search,
  Star,
  User,
} from 'lucide-react';
import { Nav } from '@/components/Nav';

const budgets = [
  {
    supplier: 'Studio Premium',
    category: 'Fotografia & Filmagem',
    eventType: 'Casamento',
    date: '22/06/2026',
    status: 'Aguardando resposta',
    statusType: 'pending',
    message: 'Olá! Recebemos seu pedido e em breve enviaremos uma proposta.',
    rating: '4.9',
    id: '1',
  },
  {
    supplier: 'Photofest Totem',
    category: 'Cabine & Totem',
    eventType: 'Aniversário',
    date: '15/07/2026',
    status: 'Respondido',
    statusType: 'answered',
    message: 'Temos disponibilidade para sua data. Clique para ver a resposta.',
    rating: '4.9',
    id: '2',
  },
  {
    supplier: 'Sabor Eventos',
    category: 'Buffet',
    eventType: 'Evento corporativo',
    date: '10/08/2026',
    status: 'Fechado',
    statusType: 'closed',
    message: 'Orçamento aprovado. Fornecedor salvo no seu evento.',
    rating: '4.8',
    id: '3',
  },
];

function StatusBadge({ statusType, status }: { statusType: string; status: string }) {
  if (statusType === 'answered') {
    return (
      <span className="flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-extrabold text-blue-700">
        <MessageCircle size={13} />
        {status}
      </span>
    );
  }

  if (statusType === 'closed') {
    return (
      <span className="flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-[11px] font-extrabold text-green-700">
        <CheckCircle2 size={13} />
        {status}
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1 rounded-full bg-[#fff7e8] px-3 py-1 text-[11px] font-extrabold text-[#b97900]">
      <Clock size={13} />
      {status}
    </span>
  );
}

export default function OrcamentosPage() {
  return (
    <main className="min-h-screen bg-black text-[#151515]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#fbf7f1] pb-28 shadow-2xl">
        {/* TOPO */}
        <section className="relative overflow-hidden rounded-b-[34px] bg-black px-6 pb-8 pt-7 text-white">
          <div className="absolute inset-0 bg-[url('/layout01-fundo.png')] bg-cover bg-center opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/80 to-black" />

          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-[#e3a925]">
              <ArrowLeft size={17} />
              Voltar
            </Link>

            <h1 className="mt-5 font-serif text-[34px] leading-tight">
              Orçamentos
            </h1>

            <p className="mt-2 text-sm text-white/70">
              Acompanhe seus pedidos enviados aos fornecedores.
            </p>

            <div className="mt-6 rounded-[26px] bg-white p-3 shadow-2xl">
              <div className="flex items-center gap-3 rounded-[20px] bg-[#f7f2ea] px-4 py-4">
                <Search size={25} className="text-[#d99200]" />
                <input
                  className="w-full bg-transparent text-sm font-medium text-black outline-none placeholder:text-gray-500"
                  placeholder="Buscar orçamento..."
                />
              </div>
            </div>
          </div>
        </section>

        {/* RESUMO */}
        <section className="grid grid-cols-3 gap-3 px-6 pt-6">
          <div className="rounded-[22px] bg-white p-4 text-center shadow-sm ring-1 ring-[#f1e7cf]">
            <p className="text-2xl font-extrabold text-[#d99200]">1</p>
            <p className="mt-1 text-[11px] font-bold text-gray-600">Aguardando</p>
          </div>

          <div className="rounded-[22px] bg-white p-4 text-center shadow-sm ring-1 ring-[#f1e7cf]">
            <p className="text-2xl font-extrabold text-blue-600">1</p>
            <p className="mt-1 text-[11px] font-bold text-gray-600">Respondido</p>
          </div>

          <div className="rounded-[22px] bg-white p-4 text-center shadow-sm ring-1 ring-[#f1e7cf]">
            <p className="text-2xl font-extrabold text-green-600">1</p>
            <p className="mt-1 text-[11px] font-bold text-gray-600">Fechado</p>
          </div>
        </section>

        {/* LISTA */}
        <section className="px-6 pt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-extrabold">Meus pedidos</h2>
            <span className="text-xs font-bold text-gray-500">
              {budgets.length} orçamentos
            </span>
          </div>

          <div className="space-y-4">
            {budgets.map((item) => (
              <div
                key={item.supplier}
                className="rounded-[28px] bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,.08)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-extrabold">{item.supplier}</h3>
                    <p className="mt-1 text-sm text-gray-500">{item.category}</p>
                  </div>

                  <StatusBadge statusType={item.statusType} status={item.status} />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-[#fbf7f1] p-3">
                    <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                      <CalendarDays size={14} className="text-[#d99200]" />
                      Data
                    </p>
                    <p className="mt-1 text-sm font-extrabold">{item.date}</p>
                  </div>

                  <div className="rounded-2xl bg-[#fbf7f1] p-3">
                    <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                      <User size={14} className="text-[#d99200]" />
                      Evento
                    </p>
                    <p className="mt-1 text-sm font-extrabold">{item.eventType}</p>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-5 text-gray-600">
                  {item.message}
                </p>

                <div className="mt-4 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-sm font-bold text-[#d99200]">
                    <Star size={15} fill="#e3a925" className="text-[#e3a925]" />
                    {item.rating}
                  </span>

                  <div className="flex gap-2">
                    <Link
                      href={`/orcamentos/${item.id}`}
                      className="rounded-full bg-[#fbf7f1] px-4 py-2 text-xs font-extrabold text-[#151515] ring-1 ring-[#f1e7cf]"
                    >
                      Detalhes
                    </Link>

                    <Link
                      href={`/orcamentos/${item.id}/chat`}
                      className="rounded-full bg-black px-4 py-2 text-xs font-extrabold text-white"
                    >
                      Conversar
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <Nav />
      </div>
    </main>
  );
}
