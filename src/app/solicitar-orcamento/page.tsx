import Link from 'next/link';
import {
  ArrowLeft,
  CalendarDays,
  Camera,
  MapPin,
  MessageCircle,
  Send,
  User,
  Users,
} from 'lucide-react';

export default function SolicitarOrcamentoPage() {
  return (
    <main className="min-h-screen bg-black text-[#151515]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#fbf7f1] pb-10 shadow-2xl">
        {/* TOPO */}
        <section className="relative overflow-hidden rounded-b-[34px] bg-black px-6 pb-8 pt-7 text-white">
          <div className="absolute inset-0 bg-[url('/layout01-fundo.png')] bg-cover bg-center opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/80 to-black" />

          <div className="relative z-10">
            <Link
              href="/fornecedor/demo"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#e3a925]"
            >
              <ArrowLeft size={17} />
              Voltar
            </Link>

            <h1 className="mt-5 font-serif text-[34px] leading-tight">
              Solicitar orçamento
            </h1>

            <p className="mt-2 text-sm text-white/70">
              Envie os detalhes do seu evento para o fornecedor.
            </p>
          </div>
        </section>

        {/* FORNECEDOR */}
        <section className="px-6 pt-6">
          <div className="rounded-[26px] bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,.08)]">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff7e8] text-[#d99200]">
                <Camera size={30} />
              </div>

              <div>
                <p className="text-xs font-bold text-gray-500">Fornecedor</p>
                <h2 className="text-lg font-extrabold">Studio Premium</h2>
                <p className="text-sm text-gray-500">Fotografia & Filmagem</p>
              </div>
            </div>
          </div>
        </section>

        {/* FORMULÁRIO */}
        <section className="px-6 pt-6">
          <div className="space-y-4">
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-extrabold">
                <User size={17} className="text-[#d99200]" />
                Nome
              </span>
              <input
                className="w-full rounded-[22px] bg-white px-5 py-4 text-sm font-medium outline-none ring-1 ring-[#f1e7cf] placeholder:text-gray-400"
                placeholder="Seu nome"
              />
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-extrabold">
                <MessageCircle size={17} className="text-[#d99200]" />
                WhatsApp
              </span>
              <input
                className="w-full rounded-[22px] bg-white px-5 py-4 text-sm font-medium outline-none ring-1 ring-[#f1e7cf] placeholder:text-gray-400"
                placeholder="(73) 99999-9999"
              />
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-extrabold">
                <CalendarDays size={17} className="text-[#d99200]" />
                Data do evento
              </span>
              <input
                type="date"
                className="w-full rounded-[22px] bg-white px-5 py-4 text-sm font-medium outline-none ring-1 ring-[#f1e7cf]"
              />
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-extrabold">
                <MapPin size={17} className="text-[#d99200]" />
                Cidade do evento
              </span>
              <input
                className="w-full rounded-[22px] bg-white px-5 py-4 text-sm font-medium outline-none ring-1 ring-[#f1e7cf] placeholder:text-gray-400"
                defaultValue="Eunápolis"
              />
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-extrabold">
                <Users size={17} className="text-[#d99200]" />
                Quantidade de convidados
              </span>
              <input
                type="number"
                className="w-full rounded-[22px] bg-white px-5 py-4 text-sm font-medium outline-none ring-1 ring-[#f1e7cf] placeholder:text-gray-400"
                placeholder="Ex: 150"
              />
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-extrabold">
                <MessageCircle size={17} className="text-[#d99200]" />
                Mensagem para o fornecedor
              </span>
              <textarea
                className="min-h-[130px] w-full resize-none rounded-[22px] bg-white px-5 py-4 text-sm font-medium outline-none ring-1 ring-[#f1e7cf] placeholder:text-gray-400"
                placeholder="Conte um pouco sobre seu evento..."
              />
            </label>
          </div>

          <Link
            href="/orcamentos"
            className="mt-7 flex items-center justify-center gap-2 rounded-[24px] bg-[#e3a925] py-4 text-center font-extrabold text-white shadow-lg"
          >
            <Send size={21} />
            Enviar solicitação
          </Link>

          <p className="mt-3 text-center text-xs leading-5 text-gray-500">
            O fornecedor receberá seu pedido e poderá responder com um orçamento dentro do app.
          </p>
        </section>
      </div>
    </main>
  );
}
