import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  FileText,
  MapPin,
  MessageCircle,
  Save,
  Send,
  User,
  Users,
} from 'lucide-react';

export default function ResponderOrcamentoPage() {
  return (
    <main className="min-h-screen bg-black text-[#151515]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#fbf7f1] pb-10 shadow-2xl">
        {/* TOPO */}
        <section className="relative overflow-hidden rounded-b-[34px] bg-black px-6 pb-8 pt-7 text-white">
          <div className="absolute inset-0 bg-[url('/layout01-fundo.png')] bg-cover bg-center opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/85 to-black" />

          <div className="relative z-10">
            <Link
              href="/painel-fornecedor/leads"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#e3a925]"
            >
              <ArrowLeft size={17} />
              Voltar
            </Link>

            <h1 className="mt-5 font-serif text-[34px] leading-tight">
              Responder orçamento
            </h1>

            <p className="mt-2 text-sm text-white/70">
              Preencha a proposta para enviar ao cliente.
            </p>
          </div>
        </section>

        {/* DADOS DO PEDIDO */}
        <section className="px-6 pt-6">
          <div className="rounded-[28px] bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,.08)]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-extrabold">Pedido recebido</h2>

              <span className="rounded-full bg-[#fff7e8] px-3 py-1 text-xs font-extrabold text-[#b97900]">
                Novo
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#fbf7f1] p-3">
                <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                  <User size={14} className="text-[#d99200]" />
                  Cliente
                </p>
                <p className="mt-1 text-sm font-extrabold">Maria Souza</p>
              </div>

              <div className="rounded-2xl bg-[#fbf7f1] p-3">
                <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                  <CalendarDays size={14} className="text-[#d99200]" />
                  Data
                </p>
                <p className="mt-1 text-sm font-extrabold">22/06/2026</p>
              </div>

              <div className="rounded-2xl bg-[#fbf7f1] p-3">
                <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                  <MapPin size={14} className="text-[#d99200]" />
                  Cidade
                </p>
                <p className="mt-1 text-sm font-extrabold">Eunápolis</p>
              </div>

              <div className="rounded-2xl bg-[#fbf7f1] p-3">
                <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                  <Users size={14} className="text-[#d99200]" />
                  Convidados
                </p>
                <p className="mt-1 text-sm font-extrabold">150</p>
              </div>
            </div>

            <div className="mt-3 rounded-2xl bg-[#fbf7f1] p-3">
              <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                <Building2 size={14} className="text-[#d99200]" />
                Espaço do evento
              </p>
              <p className="mt-1 text-sm font-extrabold">Espaço Villa Real</p>
            </div>

            <div className="mt-4">
              <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                <MessageCircle size={14} className="text-[#d99200]" />
                Mensagem da cliente
              </p>

              <p className="mt-2 text-sm leading-5 text-gray-600">
                Gostaria de orçamento para cobertura de casamento, com fotos da
                cerimônia, recepção e making of.
              </p>
            </div>
          </div>
        </section>

        {/* FORMULÁRIO DA PROPOSTA */}
        <section className="px-6 pt-6">
          <div className="mb-4">
            <h2 className="text-lg font-extrabold">Montar proposta</h2>
            <p className="mt-1 text-sm text-gray-500">
              Essa resposta poderá virar um orçamento oficial dentro do app.
            </p>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-extrabold">
                <FileText size={17} className="text-[#d99200]" />
                Serviço oferecido
              </span>
              <input
                className="w-full rounded-[22px] bg-white px-5 py-4 text-sm font-medium outline-none ring-1 ring-[#f1e7cf] placeholder:text-gray-400"
                placeholder="Ex: Cobertura fotográfica completa"
              />
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-extrabold">
                <CalendarDays size={17} className="text-[#d99200]" />
                Duração / período
              </span>
              <input
                className="w-full rounded-[22px] bg-white px-5 py-4 text-sm font-medium outline-none ring-1 ring-[#f1e7cf] placeholder:text-gray-400"
                placeholder="Ex: 4 horas, cerimônia + recepção"
              />
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-extrabold">
                Valor da proposta
              </span>
              <input
                className="w-full rounded-[22px] bg-white px-5 py-4 text-sm font-medium outline-none ring-1 ring-[#f1e7cf] placeholder:text-gray-400"
                placeholder="Ex: R$ 2.500,00"
              />
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-extrabold">
                Forma de pagamento
              </span>
              <input
                className="w-full rounded-[22px] bg-white px-5 py-4 text-sm font-medium outline-none ring-1 ring-[#f1e7cf] placeholder:text-gray-400"
                placeholder="Ex: 2x de R$ 1.250,00"
              />
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-extrabold">
                Validade da proposta
              </span>
              <input
                className="w-full rounded-[22px] bg-white px-5 py-4 text-sm font-medium outline-none ring-1 ring-[#f1e7cf] placeholder:text-gray-400"
                placeholder="Ex: 7 dias"
              />
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-extrabold">
                Observações
              </span>
              <textarea
                className="min-h-[130px] w-full resize-none rounded-[22px] bg-white px-5 py-4 text-sm font-medium outline-none ring-1 ring-[#f1e7cf] placeholder:text-gray-400"
                placeholder="Inclua detalhes, itens inclusos, deslocamento, horários, condições..."
              />
            </label>
          </div>

          <div className="mt-7 space-y-3">
            <Link
              href="/orcamentos"
              className="flex items-center justify-center gap-2 rounded-[24px] bg-[#e3a925] py-4 text-center font-extrabold text-white shadow-lg"
            >
              <Send size={21} />
              Enviar orçamento
            </Link>

            <button className="flex w-full items-center justify-center gap-2 rounded-[24px] bg-black py-4 text-center font-extrabold text-white shadow-lg">
              <Save size={21} />
              Salvar rascunho
            </button>
          </div>

          <p className="mt-3 text-center text-xs leading-5 text-gray-500">
            Depois de enviado, a cliente poderá abrir o orçamento dentro do app,
            aceitar, solicitar ajuste ou baixar PDF.
          </p>
        </section>
      </div>
    </main>
  );
}
