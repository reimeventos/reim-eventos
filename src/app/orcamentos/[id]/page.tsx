import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  MapPin,
  MessageCircle,
  Pencil,
  ShieldCheck,
  Star,
  User,
  Users,
} from 'lucide-react';

export default function OrcamentoDetalhePage() {
  return (
    <main className="min-h-screen bg-black text-[#151515]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#fbf7f1] pb-10 shadow-2xl">
        {/* TOPO */}
        <section className="relative overflow-hidden rounded-b-[34px] bg-black px-6 pb-8 pt-7 text-white">
          <div className="absolute inset-0 bg-[url('/layout01-fundo.png')] bg-cover bg-center opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/85 to-black" />

          <div className="relative z-10">
            <Link
              href="/orcamentos"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#e3a925]"
            >
              <ArrowLeft size={17} />
              Voltar
            </Link>

            <h1 className="mt-5 font-serif text-[34px] leading-tight">
              Orçamento
            </h1>

            <p className="mt-2 text-sm text-white/70">
              Proposta enviada pelo fornecedor.
            </p>
          </div>
        </section>

        {/* STATUS */}
        <section className="px-6 pt-6">
          <div className="rounded-[28px] bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,.08)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-gray-500">Fornecedor</p>
                <h2 className="mt-1 text-xl font-extrabold">Studio Premium</h2>

                <p className="mt-2 flex items-center gap-1 text-sm font-bold text-[#d99200]">
                  <Star size={16} fill="#e3a925" className="text-[#e3a925]" />
                  4.9 • Fotografia & Filmagem
                </p>
              </div>

              <span className="flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-extrabold text-blue-700">
                <MessageCircle size={13} />
                Respondido
              </span>
            </div>
          </div>
        </section>

        {/* DADOS DO EVENTO */}
        <section className="px-6 pt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-extrabold">Dados do evento</h2>
            <span className="text-xs font-bold text-gray-500">Pedido da cliente</span>
          </div>

          <div className="rounded-[28px] bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,.08)]">
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
                  <FileText size={14} className="text-[#d99200]" />
                  Tipo
                </p>
                <p className="mt-1 text-sm font-extrabold">Casamento</p>
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
                <MapPin size={14} className="text-[#d99200]" />
                Cidade
              </p>
              <p className="mt-1 text-sm font-extrabold">Eunápolis</p>
            </div>

            <div className="mt-3 rounded-2xl bg-[#fbf7f1] p-3">
              <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                <Building2 size={14} className="text-[#d99200]" />
                Espaço do evento
              </p>
              <p className="mt-1 text-sm font-extrabold">Espaço Villa Real</p>
            </div>
          </div>
        </section>

        {/* PROPOSTA */}
        <section className="px-6 pt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-extrabold">Proposta do fornecedor</h2>
            <span className="flex items-center gap-1 text-xs font-bold text-[#d99200]">
              <ShieldCheck size={15} />
              Oficial
            </span>
          </div>

          <div className="rounded-[28px] bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,.08)]">
            <div className="space-y-3">
              <div className="rounded-2xl bg-[#fbf7f1] p-4">
                <p className="text-xs font-bold text-gray-500">Serviço oferecido</p>
                <p className="mt-1 text-sm font-extrabold">
                  Cobertura fotográfica completa
                </p>
              </div>

              <div className="rounded-2xl bg-[#fbf7f1] p-4">
                <p className="text-xs font-bold text-gray-500">Duração / período</p>
                <p className="mt-1 text-sm font-extrabold">
                  4 horas • Cerimônia + recepção
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-[#fff7e8] p-4">
                  <p className="text-xs font-bold text-gray-500">Valor</p>
                  <p className="mt-1 text-lg font-extrabold text-[#d99200]">
                    R$ 2.500,00
                  </p>
                </div>

                <div className="rounded-2xl bg-[#fbf7f1] p-4">
                  <p className="flex items-center gap-1 text-xs font-bold text-gray-500">
                    <Clock size={14} className="text-[#d99200]" />
                    Validade
                  </p>
                  <p className="mt-1 text-sm font-extrabold">7 dias</p>
                </div>
              </div>

              <div className="rounded-2xl bg-[#fbf7f1] p-4">
                <p className="text-xs font-bold text-gray-500">Forma de pagamento</p>
                <p className="mt-1 text-sm font-extrabold">
                  2x de R$ 1.250,00
                </p>
              </div>

              <div className="rounded-2xl bg-[#fbf7f1] p-4">
                <p className="text-xs font-bold text-gray-500">Observações</p>
                <p className="mt-2 text-sm leading-5 text-gray-600">
                  Inclui cobertura da cerimônia e recepção, tratamento das fotos,
                  galeria digital para os convidados e entrega online. Deslocamento
                  incluso para Eunápolis.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* AÇÕES */}
        <section className="px-6 pt-7">
          <div className="space-y-3">
            <Link
              href="/meu-evento"
              className="flex items-center justify-center gap-2 rounded-[24px] bg-[#e3a925] py-4 text-center font-extrabold text-white shadow-lg"
            >
              <CheckCircle2 size={22} />
              Aceitar orçamento
            </Link>

            <Link
              href="/orcamentos"
              className="flex items-center justify-center gap-2 rounded-[24px] bg-black py-4 text-center font-extrabold text-white shadow-lg"
            >
              <Pencil size={21} />
              Solicitar ajuste
            </Link>

            <button className="flex w-full items-center justify-center gap-2 rounded-[24px] bg-white py-4 text-center font-extrabold text-[#151515] shadow-sm ring-1 ring-[#f1e7cf]">
              <Download size={21} className="text-[#d99200]" />
              Baixar PDF
            </button>

            <Link
              href="/orcamentos/1/chat"
              className="flex items-center justify-center gap-2 rounded-[24px] bg-white py-4 text-center font-extrabold text-[#151515] shadow-sm ring-1 ring-[#f1e7cf]"
            >
              <MessageCircle size={21} className="text-[#d99200]" />
              Conversar com fornecedor
            </Link>
          </div>

          <p className="mt-4 text-center text-xs leading-5 text-gray-500">
            Este orçamento é uma proposta registrada dentro do REIM EVENTOS.
            Confirme os detalhes antes de aceitar.
          </p>
        </section>
      </div>
    </main>
  );
}
