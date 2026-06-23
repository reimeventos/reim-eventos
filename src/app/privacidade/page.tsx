import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Database, Lock } from 'lucide-react';

export default function PrivacidadePage() {
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
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#e3a925]">LGPD</p>
              <h1 className="mt-2 font-serif text-[34px] leading-tight">Política de Privacidade</h1>
              <p className="mt-2 text-sm leading-5 text-white/70">
                Como o REIM EVENTOS coleta, usa, protege e compartilha dados dentro da plataforma.
              </p>
            </div>
          </div>
        </section>

        <section className="px-6 pt-6">
          <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-[#f1e7cf]">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#fff7e8] text-[#d99200]">
                <Database size={26} />
              </div>
              <div>
                <h2 className="text-lg font-extrabold">Proteção de dados</h2>
                <p className="mt-2 text-sm leading-5 text-gray-600">
                  O REIM EVENTOS trata dados pessoais para permitir a criação de eventos, vitrines, orçamentos, comunicação entre usuários, segurança, suporte e gestão da plataforma.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <ArticleCard title="1. Dados que podemos coletar">
              Nome, e-mail, telefone/WhatsApp, cidade, dados do evento, mensagens, orçamentos, respostas, fornecedores salvos, dados da vitrine, mídias enviadas pelo fornecedor e informações técnicas básicas de acesso e segurança.
            </ArticleCard>
            <ArticleCard title="2. Finalidade do uso dos dados">
              Usamos os dados para criar contas, identificar usuários, conectar clientes e fornecedores, organizar eventos, permitir orçamentos, liberar acesso conforme plano, enviar comunicações, prevenir fraudes e melhorar a experiência do app.
            </ArticleCard>
            <ArticleCard title="3. Dados de clientes">
              Dados do cliente e do evento são usados para solicitação de orçamento, organização do evento e comunicação com fornecedores ou cerimonialistas autorizados. Fornecedores só devem usar esses dados para responder e executar a negociação solicitada.
            </ArticleCard>
            <ArticleCard title="4. Dados de fornecedores">
              Dados de fornecedores podem aparecer em vitrines públicas, como nome comercial, cidade, categoria, descrição, fotos, vídeos e serviços oferecidos. Dados de pagamento e assinatura são usados para controle administrativo do REIM.
            </ArticleCard>
            <ArticleCard title="5. Cerimonialistas autorizados">
              Quando o cliente autoriza uma cerimonialista, ela pode visualizar e interagir com informações do evento dentro dos limites necessários para ajudar na organização.
            </ArticleCard>
            <ArticleCard title="6. Compartilhamento de dados">
              O REIM compartilha dados somente quando necessário para funcionamento da plataforma, como entre cliente, fornecedor e cerimonialista autorizado. Não vendemos dados pessoais.
            </ArticleCard>
            <ArticleCard title="7. Segurança">
              Utilizamos controles técnicos e organizacionais para reduzir risco de acesso indevido, incluindo autenticação, regras de permissão, controle por usuário, políticas de acesso no banco e separação entre perfis de cliente, fornecedor, cerimonialista e admin.
            </ArticleCard>
            <ArticleCard title="8. Retenção dos dados">
              Dados podem ser mantidos enquanto a conta estiver ativa ou enquanto forem necessários para histórico de orçamento, segurança, suporte, cumprimento legal, prevenção de fraudes ou defesa de direitos.
            </ArticleCard>
            <ArticleCard title="9. Direitos do titular">
              O usuário poderá solicitar acesso, correção, atualização ou exclusão de seus dados, observados os limites técnicos, contratuais, legais e de segurança.
            </ArticleCard>
            <ArticleCard title="10. Cookies e tecnologias">
              O app pode usar recursos técnicos para manter login, melhorar navegação, medir funcionamento, prevenir abuso e garantir segurança da sessão.
            </ArticleCard>
            <ArticleCard title="11. Crianças e adolescentes">
              O REIM não é direcionado a crianças. Quando informações de eventos envolvendo menores forem inseridas, o responsável deve limitar os dados ao necessário para organização do evento.
            </ArticleCard>
            <ArticleCard title="12. Alterações da política">
              Esta política pode ser atualizada conforme evolução da plataforma, exigências legais ou novas funcionalidades. A versão atual ficará disponível nesta página.
            </ArticleCard>
          </div>

          <div className="mt-6 rounded-[28px] bg-black p-5 text-white shadow-xl">
            <div className="flex items-start gap-3">
              <Lock size={28} className="shrink-0 text-[#e3a925]" />
              <div>
                <h2 className="text-lg font-extrabold">Canal de contato</h2>
                <p className="mt-2 text-sm leading-5 text-white/70">
                  Para dúvidas sobre privacidade ou dados pessoais, entre em contato pelo atendimento oficial do REIM EVENTOS.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <Link href="/termos" className="rounded-[22px] bg-white px-4 py-3 text-center text-xs font-extrabold text-[#151515] ring-1 ring-[#f1e7cf]">Termos</Link>
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
