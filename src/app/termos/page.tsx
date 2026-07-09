import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  ShieldCheck,
} from 'lucide-react';

export default function TermosPage() {
  return (
    <main className="min-h-screen bg-black text-[#151515]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#fbf7f1] pb-10 shadow-2xl">
        <section className="relative overflow-hidden rounded-b-[34px] bg-black px-6 pb-8 pt-7 text-white">
          <div className="absolute inset-0 bg-[url('/layout01-fundo.png')] bg-cover bg-center opacity-45" />

          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/85 to-black" />

          <div className="relative z-10">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#e3a925]"
            >
              <ArrowLeft size={17} />
              Voltar
            </Link>

            <div className="mt-6">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#e3a925]">
                REIM EVENTOS
              </p>

              <h1 className="mt-2 font-serif text-[34px] leading-tight">
                Termos de Uso
              </h1>

              <p className="mt-2 text-sm leading-5 text-white/70">
                Regras de uso da plataforma, responsabilidades de clientes,
                fornecedores, cerimonialistas e administração.
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
                <h2 className="text-lg font-extrabold">
                  Aceite dos termos
                </h2>

                <p className="mt-2 text-sm leading-5 text-gray-600">
                  Ao acessar ou utilizar o REIM EVENTOS, o usuário declara que
                  leu, entendeu e concorda com estes Termos de Uso e com a
                  Política de Privacidade.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <ArticleCard title="1. Sobre o REIM EVENTOS">
              O REIM EVENTOS é uma plataforma digital que conecta clientes,
              fornecedores e cerimonialistas para facilitar a busca,
              organização, solicitação de orçamentos, comunicação e
              acompanhamento de serviços relacionados a eventos.
            </ArticleCard>

            <ArticleCard title="2. Intermediação">
              O REIM EVENTOS atua como plataforma de conexão e organização. A
              execução do serviço contratado, qualidade, disponibilidade,
              atendimento, entrega, emissão de documentos e cumprimento do
              orçamento são de responsabilidade do fornecedor contratado.
            </ArticleCard>

            <ArticleCard title="3. Cadastro e responsabilidade do usuário">
              O usuário deve fornecer informações verdadeiras, atuais e
              completas. É proibido criar cadastros falsos, usar dados de
              terceiros sem autorização, compartilhar login ou tentar acessar
              áreas que não pertençam ao seu perfil.
            </ArticleCard>

            <ArticleCard title="4. Clientes">
              O cliente pode buscar fornecedores, salvar opções, criar seu
              evento, solicitar orçamentos, conversar com fornecedores e
              autorizar cerimonialistas a ajudarem na organização do evento.
            </ArticleCard>

            <ArticleCard title="5. Fornecedores">
              O fornecedor é responsável por manter sua vitrine atualizada,
              informar corretamente seus serviços, condições, disponibilidade,
              prazos, itens inclusos e responder aos pedidos de orçamento com
              clareza e boa-fé.
            </ArticleCard>

            <ArticleCard title="6. Cerimonialistas">
              O cerimonialista pode atuar como fornecedor com vitrine própria
              ou como colaborador autorizado dentro do evento da cliente.
              Quando atuar em evento de terceiro, deve respeitar os limites de
              acesso e a finalidade da autorização recebida.
            </ArticleCard>

            <ArticleCard title="7. Orçamentos, mensagens e aceite">
              Orçamentos, ajustes, aceite e mensagens podem ficar registrados
              no aplicativo para segurança das partes. O aceite de orçamento
              realizado dentro do REIM EVENTOS poderá servir como registro da
              negociação realizada entre cliente e fornecedor.
            </ArticleCard>

            <ArticleCard title="8. Planos dos fornecedores">
              O uso da plataforma por clientes é gratuito. Fornecedores podem
              utilizar um período de teste grátis, quando disponível, e
              posteriormente contratar o plano Premium nas modalidades mensal,
              trimestral ou anual para manter a vitrine ativa e utilizar os
              recursos disponibilizados pela plataforma, incluindo recebimento
              de pedidos de orçamento, respostas, chat, galeria de mídias,
              painel de leads e demais funcionalidades previstas no plano
              contratado.
            </ArticleCard>

            <ArticleCard title="9. Valores e períodos dos planos">
              Os valores vigentes do plano Premium são: R$ 25,00 para o período
              mensal, com validade de 30 dias; R$ 65,00 para o período
              trimestral, com validade de 90 dias; e R$ 250,00 para o período
              anual, com validade de 365 dias. Os valores apresentados nesta
              página correspondem à tabela comercial vigente e poderão ser
              atualizados conforme as regras de reajuste previstas nestes
              Termos de Uso.
            </ArticleCard>

            <ArticleCard title="10. Pagamento e ativação dos planos">
              O pagamento dos planos poderá ser realizado pelos meios
              eletrônicos disponibilizados pelo REIM EVENTOS, incluindo o
              Checkout Pro do Mercado Pago e outros meios que venham a ser
              oferecidos futuramente. A ativação do plano ocorre após a
              confirmação do pagamento pelo respectivo provedor de pagamento.
              Pagamentos ainda pendentes de confirmação não garantem a
              ativação imediata do plano.
            </ArticleCard>

            <ArticleCard title="11. Validade, renovação e nova contratação">
              O plano contratado permanecerá válido pelo período correspondente
              à modalidade adquirida. Atualmente, os planos são contratados por
              pagamento avulso e não possuem renovação automática, salvo se
              essa funcionalidade vier a ser disponibilizada futuramente e
              aceita expressamente pelo fornecedor. Ao final do período
              contratado, o fornecedor deverá realizar nova contratação para
              continuar utilizando os recursos sujeitos a plano pago.
            </ArticleCard>

            <ArticleCard title="12. Reajuste anual dos planos">
              Os valores dos planos poderão ser reajustados uma vez a cada
              período mínimo de 12 meses, em percentual de até 5% ao ano. O
              reajuste não será aplicado retroativamente nem modificará o valor,
              a validade ou as condições de um período já integralmente pago.
              O novo valor será aplicável somente às novas contratações ou
              futuras renovações realizadas após a entrada em vigor da nova
              tabela de preços. Sempre que aplicável, o novo valor será
              apresentado ao fornecedor antes da contratação.
            </ArticleCard>

            <ArticleCard title="13. Teste grátis">
              O período de teste grátis, quando disponibilizado, poderá ser
              utilizado uma única vez por fornecedor, conta ou perfil, conforme
              as regras da plataforma. O REIM EVENTOS poderá limitar, suspender
              ou encerrar o teste em caso de fraude, duplicidade indevida,
              tentativa de obter múltiplos períodos gratuitos ou violação destes
              Termos de Uso.
            </ArticleCard>

            <ArticleCard title="14. Expiração, suspensão e inadimplência">
              Após o término da validade do plano pago ou do período de teste,
              o acesso a determinados recursos poderá ser limitado ou
              suspenso. O REIM EVENTOS também poderá suspender ou limitar
              contas em caso de fraude, uso indevido, tentativa de acesso não
              autorizado, reclamações graves, violação destes Termos ou risco à
              segurança da plataforma.
            </ArticleCard>

            <ArticleCard title="15. Conteúdos proibidos">
              É proibido publicar conteúdo falso, ofensivo, discriminatório,
              fraudulento, ilegal, que viole direitos de terceiros, exponha
              dados pessoais indevidamente ou tente utilizar a plataforma para
              práticas abusivas, enganosas ou contrárias à legislação
              aplicável.
            </ArticleCard>

            <ArticleCard title="16. Responsabilidade sobre conteúdos e mídias">
              O fornecedor declara possuir autorização, licença ou direito para
              utilizar as fotos, vídeos, textos, logotipos, marcas e demais
              conteúdos publicados em sua vitrine ou enviados pela plataforma.
              O fornecedor será responsável por eventuais violações de direitos
              autorais, direitos de imagem, propriedade intelectual ou direitos
              de terceiros relacionados ao conteúdo que publicar.
            </ArticleCard>

            <ArticleCard title="17. Dados pessoais e LGPD">
              O tratamento de dados pessoais ocorre conforme a Política de
              Privacidade. O REIM EVENTOS utiliza dados para funcionamento da
              plataforma, autenticação, comunicação, segurança, organização de
              eventos, solicitação de orçamentos, suporte, prevenção de fraude
              e cumprimento de obrigações legais.
            </ArticleCard>

            <ArticleCard title="18. Alterações dos termos e dos serviços">
              Estes Termos poderão ser atualizados para melhoria do aplicativo,
              adequação legal, lançamento de novos recursos, mudanças
              operacionais ou alterações nas condições dos serviços. A versão
              mais recente ficará disponível nesta página. Alterações que
              afetem preços não modificarão períodos já pagos e serão aplicadas
              conforme as regras previstas nestes Termos.
            </ArticleCard>
          </div>

          <div className="mt-6 rounded-[28px] bg-black p-5 text-white shadow-xl">
            <div className="flex items-start gap-3">
              <ShieldCheck
                size={28}
                className="shrink-0 text-[#e3a925]"
              />

              <div>
                <h2 className="text-lg font-extrabold">
                  Última atualização
                </h2>

                <p className="mt-2 text-sm leading-5 text-white/70">
                  Termos atualizados para contemplar os planos mensal,
                  trimestral e anual, pagamento eletrônico, ativação automática
                  após confirmação do pagamento e política de reajuste anual de
                  até 5%. Recomenda-se revisão jurídica profissional antes do
                  uso definitivo em produção.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <Link
              href="/privacidade"
              className="rounded-[22px] bg-white px-4 py-3 text-center text-xs font-extrabold text-[#151515] ring-1 ring-[#f1e7cf]"
            >
              Privacidade
            </Link>

            <Link
              href="/seguranca"
              className="rounded-[22px] bg-[#e3a925] px-4 py-3 text-center text-xs font-extrabold text-white"
            >
              Segurança
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

function ArticleCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <article className="rounded-[26px] bg-white p-5 shadow-sm ring-1 ring-[#f1e7cf]">
      <h2 className="flex items-start gap-2 text-base font-extrabold">
        <CheckCircle2
          size={18}
          className="mt-0.5 shrink-0 text-[#d99200]"
        />

        {title}
      </h2>

      <p className="mt-3 text-sm leading-6 text-gray-600">
        {children}
      </p>
    </article>
  );
}
