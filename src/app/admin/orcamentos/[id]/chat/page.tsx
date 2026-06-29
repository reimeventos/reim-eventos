import Link from "next/link";
import {
  ArrowLeft,
  Headset,
  MessageCircle,
  Send,
  ShieldCheck,
  User,
} from "lucide-react";

const budgets = [
  {
    id: "1",
    client: "Maria Souza",
    supplier: "Studio Premium",
    eventType: "Casamento",
  },
  {
    id: "2",
    client: "Ana Clara",
    supplier: "Photofest Totem",
    eventType: "Aniversário",
  },
  {
    id: "3",
    client: "João Marcos",
    supplier: "Sabor Eventos",
    eventType: "Evento corporativo",
  },
  {
    id: "4",
    client: "Camila Rocha",
    supplier: "Decora Luxo",
    eventType: "Debutante",
  },
];

export default function AdminOrcamentoSuportePage({
  params,
}: {
  params: { id: string };
}) {
  const budget = budgets.find((item) => item.id === params.id) || budgets[0];

  return (
    <main className="min-h-screen bg-black text-[#151515]">
      <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col overflow-hidden bg-[#fbf7f1] shadow-2xl">
        <section className="relative overflow-hidden rounded-b-[34px] bg-black px-6 pb-7 pt-7 text-white">
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
                <Headset size={31} />
              </div>

              <div>
                <p className="text-sm font-bold text-[#e3a925]">
                  Atendimento interno
                </p>

                <h1 className="font-serif text-[32px] leading-tight">
                  Suporte do orçamento
                </h1>

                <p className="mt-1 text-sm text-white/70">
                  Ajuda administrativa para cliente ou fornecedor.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 pt-5">
          <div className="rounded-[26px] bg-white p-4 shadow-sm ring-1 ring-[#f1e7cf]">
            <p className="text-xs font-extrabold uppercase tracking-wide text-[#d99200]">
              Orçamento #{budget.id}
            </p>

            <p className="mt-2 text-lg font-extrabold">{budget.eventType}</p>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#fbf7f1] p-3">
                <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                  <User size={14} className="text-[#d99200]" />
                  Cliente
                </p>
                <p className="mt-1 text-sm font-extrabold">{budget.client}</p>
              </div>

              <div className="rounded-2xl bg-[#fbf7f1] p-3">
                <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                  <ShieldCheck size={14} className="text-[#d99200]" />
                  Fornecedor
                </p>
                <p className="mt-1 text-sm font-extrabold">{budget.supplier}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex-1 space-y-4 px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black text-white">
              <ShieldCheck size={18} />
            </div>

            <div className="rounded-[22px] rounded-tl-md bg-white p-4 text-sm font-medium leading-relaxed text-gray-700 shadow-sm ring-1 ring-[#f1e7cf]">
              Este espaço é para suporte administrativo do orçamento. Não substitui a conversa comercial entre cliente e fornecedor.
            </div>
          </div>

          <div className="ml-auto flex max-w-[85%] items-start gap-3">
            <div className="rounded-[22px] rounded-tr-md bg-[#e3a925] p-4 text-sm font-bold leading-relaxed text-white shadow-sm">
              Registrar dúvida, ajuda ou acompanhamento interno aqui.
            </div>
          </div>
        </section>

        <section className="border-t border-[#f1e7cf] bg-white px-5 py-4">
          <div className="flex items-center gap-3 rounded-[22px] bg-[#fbf7f1] p-2 ring-1 ring-[#f1e7cf]">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#d99200]">
              <MessageCircle size={20} />
            </div>

            <input
              className="w-full bg-transparent text-sm font-medium text-black outline-none placeholder:text-gray-500"
              placeholder="Escrever mensagem de suporte..."
            />

            <button className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-black text-white">
              <Send size={18} />
            </button>
          </div>

          <Link
            href="/admin"
            className="mt-4 flex w-full items-center justify-center rounded-2xl bg-[#e3a925] px-5 py-4 text-sm font-extrabold text-white"
          >
            Voltar para Painel do Admin
          </Link>
        </section>
      </div>
    </main>
  );
}
