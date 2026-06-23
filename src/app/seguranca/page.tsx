import Link from 'next/link';
import { ArrowLeft, CheckCircle2, KeyRound, ShieldAlert, ShieldCheck } from 'lucide-react';

export default function SegurancaPage() {
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
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#e3a925]">Proteção REIM</p>
              <h1 className="mt-2 font-serif text-[34px] leading-tight">Segurança</h1>
              <p className="mt-2 text-sm leading-5 text-white/70">
                Boas práticas, regras de acesso e medidas para proteger dados de clientes, fornecedores e cerimonialistas.
              </p>
            </div>
          </div>
        </section>

        <section className="px-6 pt-6">
          <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-[#f1e7cf]">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#fff7e8] text-[#d99200]">
                <ShieldCheck size={27} />
              </div>
              <div>
                <h2 className="text-lg font-extrabold">Segurança da plataforma</h2>
                <p className="mt-2 text-sm leading-5 text-gray-600">
                  A segurança do REIM EVENTOS depende de controles técnicos no app, regras de banco de dados, cuidado dos usuários e evolução contínua dos recursos de autenticação.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <ArticleCard title="1. Separação de perfis">
              O app separa permissões entre cliente, fornecedor, cerimonialista e admin. Cada perfil deve acessar somente as áreas e dados necessários para sua função.
            </ArticleCard>
            <ArticleCard title="2. Regras de acesso">
              Clientes devem ver apenas seus eventos e orçamentos. Fornecedores devem ver apenas seus leads, vitrines e assinaturas. Cerimonialistas devem ver apenas eventos autorizados. Admin deve ter acesso restrito e protegido.
            </ArticleCard>
            <ArticleCard title="3. Banco de dados e RLS">
              As políticas de segurança do Supabase devem impedir acesso indevido a registros de terceiros, usando vínculos como owner_id, customer_id, supplier_id e permissões de colaborador.
            </ArticleCard>
            <ArticleCard title="4. Login e senha">
              O usuário deve usar senha forte, não compartilhar acesso e sair da conta em dispositivos públicos ou compartilhados. A senha não deve ser enviada por WhatsApp ou mensagens.
            </ArticleCard>
            <ArticleCard title="5. Dois fatores">
              A autenticação em dois fatores é recomendada principalmente para Admin e, futuramente, para fornecedores. A prioridade inicial é tornar 2FA obrigatório para Admin e opcional para fornecedores.
            </ArticleCard>
            <ArticleCard title="6. Dados sensíveis">
              Evite inserir dados desnecessários no app. Informações como endereço, telefone, detalhes do evento e conversas devem ser usadas apenas para orçamento, organização e execução do serviço.
            </ArticleCard>
            <ArticleCard title="7. Comprovantes e pagamentos">
              Comprovantes enviados por WhatsApp ou futuramente pelo app devem ser tratados com cuidado, somente para conferência do pagamento e ativação da assinatura.
            </ArticleCard>
            <ArticleCard title="8. Proibição de vazamento">
              É proibido copiar, vender, expor ou compartilhar dados de clientes, fornecedores, eventos, mensagens ou orçamentos fora da finalidade da plataforma.
            </ArticleCard>
            <ArticleCard title="9. Monitoramento e logs">
              O REIM pode registrar ações importantes, como login, criação de orçamento, envio de mensagem, alteração de plano, aceite e ações administrativas, para segurança, auditoria e suporte.
            </ArticleCard>
            <ArticleCard title="10. Denúncia de incidente">
              Caso o usuário identifique acesso indevido, vazamento, suspeita de fraude ou uso irregular da conta, deve avisar imediatamente a equipe REIM para bloqueio, análise e correção.
            </ArticleCard>
          </div>

          <div className="mt-6 rounded-[28px] bg-black p-5 text-white shadow-xl">
            <div className="flex items-start gap-3">
              <KeyRound size={28} className="shrink-0 text-[#e3a925]" />
              <div>
                <h2 className="text-lg font-extrabold">Próxima melhoria</h2>
                <p className="mt-2 text-sm leading-5 text-white/70">
                  Implementar autenticação em dois fatores para Admin e, posteriormente, liberar 2FA opcional para fornecedores.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-[22px] bg-red-50 p-4 text-sm leading-5 text-red-700 ring-1 ring-red-100">
            <p className="flex items-start gap-2 font-extrabold">
              <ShieldAlert size={18} className="mt-0.5 shrink-0" /> Aviso importante
            </p>
            <p className="mt-2">
              Nenhum sistema é 100% imune a riscos. Por isso, o REIM deve manter revisões constantes de permissões, políticas de banco, senhas, acessos administrativos e regras de armazenamento.
            </p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <Link href="/termos" className="rounded-[22px] bg-white px-4 py-3 text-center text-xs font-extrabold text-[#151515] ring-1 ring-[#f1e7cf]">Termos</Link>
            <Link href="/privacidade" className="rounded-[22px] bg-[#e3a925] px-4 py-3 text-center text-xs font-extrabold text-white">Privacidade</Link>
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
