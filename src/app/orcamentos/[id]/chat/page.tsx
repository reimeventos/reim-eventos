import Link from 'next/link';
import {
  ArrowLeft,
  Camera,
  CheckCheck,
  FileText,
  MessageCircle,
  Paperclip,
  Send,
  User,
} from 'lucide-react';

const messages = [
  {
    from: 'fornecedor',
    name: 'Studio Premium',
    time: '09:20',
    text: 'Olá, Maria! Recebemos sua solicitação e enviamos o orçamento para cobertura fotográfica completa.',
  },
  {
    from: 'cliente',
    name: 'Maria Souza',
    time: '09:28',
    text: 'Obrigada! Gostei da proposta. Esse valor inclui making of da noiva?',
  },
  {
    from: 'fornecedor',
    name: 'Studio Premium',
    time: '09:35',
    text: 'Inclui sim. Podemos cobrir making of, cerimônia e recepção dentro do pacote de 4 horas.',
  },
];

export default function OrcamentoChatPage() {
  return (
    <main className="min-h-screen bg-black text-[#151515]">
      <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col overflow-hidden bg-[#fbf7f1] shadow-2xl">
        {/* TOPO */}
        <section className="relative overflow-hidden rounded-b-[28px] bg-black px-5 pb-5 pt-6 text-white">
          <div className="absolute inset-0 bg-[url('/layout01-fundo.png')] bg-cover bg-center opacity-35" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/85 to-black" />

          <div className="relative z-10 flex items-center gap-4">
            <Link
              href="/orcamentos"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-[#e3a925]"
            >
              <ArrowLeft size={22} />
            </Link>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff7e8] text-[#d99200]">
              <Camera size={26} />
            </div>

            <div className="flex-1">
              <h1 className="text-lg font-extrabold">Studio Premium</h1>
              <p className="text-xs text-white/65">
                Orçamento • Fotografia & Filmagem
              </p>
            </div>

            <span className="flex h-3 w-3 rounded-full bg-green-400" />
          </div>
        </section>

        {/* CARD DO ORÇAMENTO */}
        <section className="px-5 pt-5">
          <Link
            href="/orcamentos/1"
            className="flex items-center justify-between rounded-[24px] bg-white p-4 shadow-[0_10px_25px_rgba(0,0,0,.08)] ring-1 ring-[#f1e7cf]"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff7e8] text-[#d99200]">
                <FileText size={24} />
              </div>

              <div>
                <p className="text-sm font-extrabold">Orçamento respondido</p>
                <p className="text-xs text-gray-500">R$ 2.500,00 • válido por 7 dias</p>
              </div>
            </div>

            <span className="text-xs font-extrabold text-[#d99200]">
              Abrir
            </span>
          </Link>
        </section>

        {/* MENSAGENS */}
        <section className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          {messages.map((msg, index) => {
            const isClient = msg.from === 'cliente';

            return (
              <div
                key={index}
                className={`flex ${isClient ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[82%] rounded-[24px] px-4 py-3 shadow-sm ${
                    isClient
                      ? 'rounded-br-md bg-[#e3a925] text-white'
                      : 'rounded-bl-md bg-white text-[#151515] ring-1 ring-[#f1e7cf]'
                  }`}
                >
                  <p
                    className={`mb-1 text-[11px] font-extrabold ${
                      isClient ? 'text-white/80' : 'text-[#d99200]'
                    }`}
                  >
                    {msg.name}
                  </p>

                  <p className="text-sm leading-5">{msg.text}</p>

                  <div
                    className={`mt-2 flex items-center justify-end gap-1 text-[10px] ${
                      isClient ? 'text-white/80' : 'text-gray-400'
                    }`}
                  >
                    {msg.time}
                    {isClient && <CheckCheck size={13} />}
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* CAMPO DE MENSAGEM */}
        <section className="border-t border-[#eadfca] bg-white/95 px-4 pb-4 pt-3">
          <div className="flex items-center gap-3">
            <button className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fbf7f1] text-[#d99200] ring-1 ring-[#f1e7cf]">
              <Paperclip size={22} />
            </button>

            <div className="flex min-h-[46px] flex-1 items-center gap-2 rounded-full bg-[#fbf7f1] px-4 ring-1 ring-[#f1e7cf]">
              <MessageCircle size={19} className="text-[#d99200]" />
              <input
                className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-gray-400"
                placeholder="Digite sua mensagem..."
              />
            </div>

            <button className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e3a925] text-white shadow-lg">
              <Send size={20} />
            </button>
          </div>

          <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-gray-500">
            <User size={13} />
            Conversa registrada no orçamento
          </div>
        </section>
      </div>
    </main>
  );
}
