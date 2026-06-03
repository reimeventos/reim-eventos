import Link from 'next/link';
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  MessageCircle,
  Search,
  Star,
  User,
  Users,
  WalletCards,
} from 'lucide-react';

const budgets = [
  {
    id: '1',
    client: 'Maria Souza',
    supplier: 'Studio Premium',
    eventType: 'Casamento',
    date: '22/06/2026',
    status: 'Respondido',
    statusType: 'answered',
    value: 'R$ 2.500,00',
    city: 'Eunápolis',
  },
  {
    id: '2',
    client: 'Ana Clara',
    supplier: 'Photofest Totem',
    eventType: 'Aniversário',
    date: '15/07/2026',
    status: 'Aguardando',
    statusType: 'pending',
    value: 'Sob consulta',
    city: 'Eunápolis',
  },
  {
    id: '3',
    client: 'João Marcos',
    supplier: 'Sabor Eventos',
    eventType: 'Evento corporativo',
    date: '10/08/2026',
    status: 'Fechado',
    statusType: 'closed',
    value: 'R$ 4.800,00',
    city: 'Porto Seguro',
  },
  {
    id: '4',
    client: 'Camila Rocha',
    supplier: 'Decora Luxo',
    eventType: 'Debutante',
    date: '05/09/2026',
    status: 'Aguardando',
    statusType: 'pending',
    value: 'Sob consulta',
    city: 'Eunápolis',
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

export default function AdminOrcamentosPage() {
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
                <FileText size={31} />
              </div>

              <div>
                <p className="text-sm font-bold text-[#e3a925]">
                  Administração
                </p>

                <h1 className="font-serif text-[34px] leading-tight">
                  Orçamentos
                </h1>

                <p className="mt-1 text-sm text-white/70">
                  Acompanhe pedidos, respostas e fechamentos.
                </p>
              </div>
            </div>

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
            <p className="text-2xl font-extrabold text-[#d99200]">483</p>
            <p className="mt-1 text-[11px] font-bold text-gray-600">
              Total
            </p>
          </div>

          <div className="rounded-[22px] bg-white p-4 text-center shadow-sm ring-1 ring-[#f1e7cf]">
            <p className="text-2xl font-extrabold text-blue-600">218</p>
            <p className="mt-1 text-[11px] font-bold text-gray-600">
              Respondidos
            </p>
          </div>

          <div className="rounded-[22px] bg-white p-4 text-center shadow-sm ring-1 ring-[#f1e7cf]">
            <p className="text-2xl font-extrabold text-green-600">76</p>
            <p className="mt-1 text-[11px] font-bold text-gray-600">
              Fechados
            </p>
          </div>
        </section>

        {/* LISTA */}
        <section className="px-6 pt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-extrabold">Lista de orçamentos</h2>
            <span className="text-xs font-bold text-gray-500">
              {budgets.length} exibidos
            </span>
          </div>

          <div className="space-y-4">
            {budgets.map((item) => (
              <div
                key={item.id}
                className="rounded-[28px] bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,.08)] ring-1 ring-[#f1e7cf]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-extrabold">
                      {item.supplier}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      Cliente: {item.client}
                    </p>
                  </div>

                  <StatusBadge statusType={item.statusType} status={item.status} />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-[#fbf7f1] p-3">
                    <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                      <User size={14} className="text-[#d99200]" />
                      Evento
                    </p>
                    <p className="mt-1 text-sm font-extrabold">
                      {item.eventType}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#fbf7f1] p-3">
                    <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                      <CalendarDays size={14} className="text-[#d99200]" />
                      Data
                    </p>
                    <p className="mt-1 text-sm font-extrabold">
                      {item.date}
                    </p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-[#fbf7f1] p-3">
                    <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                      <Users size={14} className="text-[#d99200]" />
                      Cidade
                    </p>
                    <p className="mt-1 text-sm font-extrabold">
                      {item.city}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#fff7e8] p-3">
                    <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                      <WalletCards size={14} className="text-[#d99200]" />
                      Valor
                    </p>
                    <p className="mt-1 text-sm font-extrabold text-[#d99200]">
                      {item.value}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-sm font-bold text-[#d99200]">
                    <Star size={15} fill="#e3a925" className="text-[#e3a925]" />
                    REIM EVENTOS
                  </span>

                  <div className="flex gap-2">
                    <Link
                      href={`/orcamentos/${item.id}`}
                      className="rounded-full bg-[#fbf7f1] px-4 py-2 text-xs font-extrabold text-[#151515] ring-1 ring-[#f1e7cf]"
                    >
                      Ver
                    </Link>

                    <Link
                      href={`/orcamentos/${item.id}/chat`}
                      className="rounded-full bg-black px-4 py-2 text-xs font-extrabold text-white"
                    >
                      Chat
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
