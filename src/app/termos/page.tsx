import Link from 'next/link';
import { ArrowLeft, CheckCircle2, FileText, ShieldCheck } from 'lucide-react';

export default function TermosPage() {
  return (
    <main className="min-h-screen bg-black text-[#151515]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#fbf7f1] pb-10 shadow-2xl">
        <section className="relative overflow-hidden rounded-b-[34px] bg-black px-6 pb-8 pt-7 text-white">
          <div className="absolute inset-0 bg-[url('/layout01-fundo.png')] bg-cover bg-center opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/85 to-black" />
          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-[#e3a925]">
              <ArrowLeft size={17} /> Voltar
            </Link>
            <div className="mt-6">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#e3a925]">REIM EVENTOS</p>
              <h1 className="mt-2 font-serif text-[34px] leading-tight">Termos de Uso</h1>
              <p className="mt-2 text-sm leading-5 text-white/70">
                Regras de uso da plataforma, responsabilidades de clientes, fornecedores, cerimonialistas e administração.
              </p>
            </div>
          </div>
        </section>

        <section className="px-6 pt-6">
          <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-[#f1e7cf]">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#fff7e8] text-[#d99200]">
                <FileText size={26} />
              </div>
              <div>
                <h2 className="text-lg font-extrabold">Aceite dos termos</h2>
                <p className="mt-2 text-sm leading-5 text-gray-600">
                  Ao acessar ou utilizar o REIM EVENTOS, o usuário declara que leu, entendeu e concorda com estes Termos de Uso e com a Política de Privacidade.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <ArticleCard title="1. Sobre o REIM EVENTOS">
              O REIM EVENTOS é uma plataforma digital que conecta clientes, fornecedores e cerimonialistas para facilitar a busca, organização, solicitação de orçamentos, comunicação e acompanhamento de serviços relacionados a eventos.
            </ArticleCard>
            <ArticleCard title="2. Intermediação">
              O REIM EVENTOS atua como plataforma de conexão e organização. A execução do serviço contratado, qualidade, disponibilidade, atendimento, entrega, emissão de documentos e cumprimento do orçamento são de responsabilidade do fornecedor contratado.
            </ArticleCard>
            <ArticleCard title="3. Cadastro e responsabilidade do usuário">
              O usuário deve fornecer informações verdadeiras, atuais e completas. É proibido criar cadastros falsos, usar dados de terceiros sem autorização, compartilhar login ou tentar acessar áreas que não pertençam ao seu perfil.
            </ArticleCard>
            <ArticleCard title="4. Clientes">
              O cliente pode buscar fornecedores, salvar opções, criar seu evento, solicitar orçamentos, conversar com fornecedores e autorizar cerimonialistas a ajudarem na organização do evento.
            </ArticleCard>
            <ArticleCard title="5. Fornecedores">
              O fornecedor é responsável por manter sua vitrine atualizada, informar preços, condições, disponibilidade, prazos, serviços inclusos e responder aos pedidos de orçamento com clareza e boa-fé.
            </ArticleCard>
            <ArticleCard title="6. Cerimonialistas">
              O cerimonialista pode atuar como fornecedor com vitrine própria ou como colaborador autorizado dentro do evento da cliente. Quando atuar em evento de terceiro, deve respeitar os limites de acesso e a finalidade da autorização recebida.
            </ArticleCard>
            <ArticleCard title="7. Orçamentos, mensagens e aceite">
              Orçamentos, ajustes, aceite e mensagens podem ficar registrados no app para segurança das partes. O aceite de orçamento dentro do app pode ser usado como evidência da negociação entre cliente e fornecedor.
            </ArticleCard>
            <ArticleCard title="8. Planos dos fornecedores">
              O uso da plataforma por clientes é gratuito. Fornecedores podem ter teste grátis e, após o período de teste, precisam contratar plano Profissional ou Premium para continuar usando recursos como vitrine, leads, respostas e mídias.
            </ArticleCard>
            <ArticleCard title="9. Pagamento e ativação de planos">
              Na fase inicial, os pagamentos podem ser feitos por PIX manual e aprovados pelo Admin após conferência. No futuro, o REIM poderá utilizar meios automáticos de pagamento, como PIX, cartão ou boleto.
            </ArticleCard>
            <ArticleCard title="10. Conteúdos proibidos">
              É proibido publicar conteúdo falso, ofensivo, discriminatório, fraudulento, ilegal, que viole direitos de terceiros, exponha dados pessoais indevidamente ou tente desviar clientes/fornecedores de forma indevida da plataforma.
            </ArticleCard>
            <ArticleCard title="11. Suspensão de conta">
              O REIM EVENTOS poderá suspender ou limitar contas em caso de fraude, uso indevido, tentativa de acesso não autorizado, reclamações graves, inadimplência, violação destes termos ou risco à segurança da plataforma.
            </ArticleCard>
            <ArticleCard title="12. Dados pessoais e LGPD">
              O tratamento de dados pessoais ocorre conforme a Política de Privacidade. O REIM utiliza dados para funcionamento da plataforma, comunicação, segurança, organização do evento, orçamentos, suporte e cumprimento de obrigações legais.
            </ArticleCard>
            <ArticleCard title="13. Alterações dos termos">
              Estes Termos podem ser atualizados para melhoria do app, adequação legal, novos recursos ou mudança de operação. A versão mais recente ficará disponível nesta página.
            </ArticleCard>
          </div>

          <div className="mt-6 rounded-[28px] bg-black p-5 text-white shadow-xl">
            <div className="flex items-start gap-3">
              <ShieldCheck size={28} className="shrink-0 text-[#e3a925]" />
              <div>
                <h2 className="text-lg font-extrabold">Última atualização</h2>
                <p className="mt-2 text-sm leading-5 text-white/70">
                  Versão inicial para publicação do REIM EVENTOS. Recomenda-se revisão jurídica antes do uso definitivo em produção.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <Link href="/privacidade" className="rounded-[22px] bg-white px-4 py-3 text-center text-xs font-extrabold text-[#151515] ring-1 ring-[#f1e7cf]">Privacidade</Link>
            <Link href="/seguranca" className="rounded-[22px] bg-[#e3a925] px-4 py-3 text-center text-xs font-extrabold text-white">Segurança</Link>
          </div>
        </section>
      </div>
    </main>
  );
}

function ArticleCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="rounded-[26px] bg-white p-5 shadow-sm ring-1 ring-[#f1e7cf]">
      <h2 className="flex items-start gap-2 text-base font-extrabold">
        <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[#d99200]" />
        {title}
      </h2>
      <p className="mt-3 text-sm leading-6 text-gray-600">{children}</p>
    </article>
  );
}
