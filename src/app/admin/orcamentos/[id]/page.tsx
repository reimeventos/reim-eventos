import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  Headset,
  Star,
  User,
  Users,
  WalletCards,
} from "lucide-react";

const budgets = [
  {
    id: "1",
    client: "Maria Souza",
    supplier: "Studio Premium",
    eventType: "Casamento",
    date: "22/06/2026",
    status: "Respondido",
    statusType: "answered",
    value: "R$ 2.500,00",
    city: "Eunápolis",
    description: "Pedido de orçamento acompanhado pelo painel administrativo.",
  },
  {
    id: "2",
    client: "Ana Clara",
    supplier: "Photofest Totem",
    eventType: "Aniversário",
    date: "15/07/2026",
    status: "Aguardando",
    statusType: "pending",
    value: "Sob consulta",
    city: "Eunápolis",
    description: "Pedido aguardando resposta do fornecedor.",
  },
  {
    id: "3",
    client: "João Marcos",
    supplier: "Sabor Eventos",
    eventType: "Evento corporativo",
    date: "10/08/2026",
    status: "Fechado",
    statusType: "closed",
    value: "R$ 4.800,00",
    city: "Porto Seguro",
    description: "Orçamento fechado pelo cliente.",
  },
  {
    id: "4",
    client: "Camila Rocha",
    supplier: "Decora Luxo",
    eventType: "Debutante",
    date: "05/09/2026",
    status: "Aguardando",
    statusType: "pending",
    value: "Sob consulta",
    city: "Eunápolis",
    description: "Pedido aguardando retorno comercial.",
  },
];

function StatusBadge({ statusType, status }: { statusType: string; status: string }) {
  if (statusType === "closed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-[11px] font-extrabold text-green-700">
        <CheckCircle2 size={13} />
        {status}
      </span>
    );
  }

  if (statusType === "answered") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-extrabold text-blue-700">
        <Headset size={13} />
        {status}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#fff7e8] px-3 py-1 text-[11px] font-extrabold text-[#b97900]">
      <Clock size={13} />
      {status}
    </span>
  );
}

export default function AdminOrcamentoDetalhePage({
  params,
}: {
  params: { id: string };
}) {
  const budget = budgets.find((item) => item.id === params.id) || budgets[0];

  return (
    <main className="min-h-screen bg-black text-[#151515]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#fbf7f1] pb-10 shadow-2xl">
        <section className="relative overflow-hidden rounded-b-[34px] bg-black px-6 pb-8 pt-7 text-white">
          <div className="absolute inset-0 bg-[url('/layout01-fundo.png')] bg-cover bg-center opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/85 to-black" />

          <div className="relative z-10">
            <Link
              href="/admin/orcamentos"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#e3a925]"
            >
              <ArrowLeft size={17} />
              Voltar para Orçamentos
            </Link>

            <div className="mt-6 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e3a925] text-white shadow-lg">
                <FileText size={31} />
              </div>

              <div>
                <p className="text-sm font-bold text-[#e3a925]">
                  Administração
                </p>

                <h1 className="font-serif text-[31px] leading-tight">
                  Detalhe do orçamento
                </h1>

                <p className="mt-1 text-sm text-white/70">
                  Visualização interna do pedido.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 pt-6">
          <div className="rounded-[28px] bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,.08)] ring-1 ring-[#f1e7cf]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wide text-[#d99200]">
                  Orçamento #{budget.id}
                </p>

                <h2 className="mt-1 text-2xl font-extrabold">
                  {budget.supplier}
                </h2>

                <p className="mt-1 text-sm font-bold text-gray-500">
                  Cliente: {budget.client}
                </p>
              </div>

              <StatusBadge statusType={budget.statusType} status={budget.status} />
            </div>

            <p className="mt-4 rounded-2xl bg-[#fbf7f1] p-4 text-sm font-medium leading-relaxed text-gray-600">
              {budget.description}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#fbf7f1] p-3">
                <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                  <User size={14} className="text-[#d99200]" />
                  Evento
                </p>
                <p className="mt-1 text-sm font-extrabold">{budget.eventType}</p>
              </div>

              <div className="rounded-2xl bg-[#fbf7f1] p-3">
                <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                  <CalendarDays size={14} className="text-[#d99200]" />
                  Data
                </p>
                <p className="mt-1 text-sm font-extrabold">{budget.date}</p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#fbf7f1] p-3">
                <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                  <Users size={14} className="text-[#d99200]" />
                  Cidade
                </p>
                <p className="mt-1 text-sm font-extrabold">{budget.city}</p>
              </div>

              <div className="rounded-2xl bg-[#fff7e8] p-3">
                <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                  <WalletCards size={14} className="text-[#d99200]" />
                  Valor
                </p>
                <p className="mt-1 text-sm font-extrabold text-[#d99200]">
                  {budget.value}
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <span className="flex items-center gap-1 text-sm font-bold text-[#d99200]">
                <Star size={15} fill="#e3a925" className="text-[#e3a925]" />
                REIM EVENTOS
              </span>

              <Link
                href={`/admin/orcamentos/${budget.id}/chat`}
                className="rounded-full bg-black px-5 py-3 text-xs font-extrabold text-white"
              >
                Abrir suporte
              </Link>
            </div>
          </div>

          <Link
            href="/admin"
            className="mt-5 flex h-13 w-full items-center justify-center rounded-2xl bg-[#e3a925] px-5 py-4 text-sm font-extrabold text-white shadow-lg"
          >
            Voltar para Painel do Admin
          </Link>
        </section>
      </div>
    </main>
  );
}
