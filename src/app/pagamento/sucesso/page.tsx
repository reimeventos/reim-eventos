import Link from 'next/link';
import {
  CheckCircle2,
  Crown,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export default function PagamentoSucessoPage() {
  return (
    <main className="min-h-screen bg-black text-[#151515]">
      <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col overflow-hidden bg-[#fbf7f1] shadow-2xl">
        {/* TOPO */}
        <section className="relative flex flex-1 items-center justify-center overflow-hidden px-6 py-10">
          <div className="absolute inset-0 bg-[url('/layout01-fundo.png')] bg-cover bg-center opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#fbf7f1]/80 via-[#fbf7f1]/95 to-[#fbf7f1]" />

          <div className="relative z-10 w-full text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[30px] bg-green-500 text-white shadow-[0_12px_35px_rgba(34,197,94,.35)]">
              <CheckCircle2 size={58} strokeWidth={2.5} />
            </div>

            <h1 className="mt-7 font-serif text-[36px] leading-tight text-[#151515]">
              Pagamento aprovado!
            </h1>

            <p className="mx-auto mt-4 max-w-[310px] text-sm leading-6 text-gray-600">
              Sua assinatura foi ativada com sucesso. Agora sua vitrine pode
              aparecer com mais destaque no REIM EVENTOS.
            </p>

            <div className="mt-7 rounded-[28px] bg-white p-5 text-left shadow-[0_10px_25px_rgba(0,0,0,.08)] ring-1 ring-[#f1e7cf]">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff7e8] text-[#d99200]">
                  <Crown size={31} />
                </div>

                <div>
                  <h2 className="text-lg font-extrabold">
                    Plano ativado
                  </h2>

                  <p className="mt-1 text-sm leading-5 text-gray-600">
                    Seu perfil de fornecedor foi atualizado. Confira sua vitrine
                    e responda seus leads pelo painel.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-[22px] bg-white p-4 text-center shadow-sm ring-1 ring-[#f1e7cf]">
                <Sparkles size={25} className="mx-auto text-[#d99200]" />
                <p className="mt-2 text-xs font-extrabold text-gray-700">
                  Mais destaque
                </p>
              </div>

              <div className="rounded-[22px] bg-white p-4 text-center shadow-sm ring-1 ring-[#f1e7cf]">
                <ShieldCheck size={25} className="mx-auto text-[#d99200]" />
                <p className="mt-2 text-xs font-extrabold text-gray-700">
                  Selo Premium
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <Link
                href="/painel-fornecedor"
                className="block rounded-[24px] bg-[#e3a925] py-4 text-center font-extrabold text-white shadow-lg"
              >
                Ir para painel
              </Link>

              <Link
                href="/fornecedor/demo"
                className="block rounded-[24px] bg-black py-4 text-center font-extrabold text-white shadow-lg"
              >
                Ver minha vitrine
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
