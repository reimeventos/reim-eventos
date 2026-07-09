import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Crown,
} from 'lucide-react';

export default function ContratoFornecedorPage() {
  return (
    <main className="min-h-screen bg-black text-[#151515]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#fbf7f1] pb-10 shadow-2xl">
        <section className="relative overflow-hidden rounded-b-[34px] bg-black px-6 pb-8 pt-7 text-white">
          <div className="absolute inset-0 bg-[url('/layout01-fundo.png')] bg-cover bg-center opacity-45" />

          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/85 to-black" />

          <div className="relative z-10">
            <Link
              href="/painel-fornecedor/planos"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#e3a925]"
            >
              <ArrowLeft size={17} />
              Voltar aos planos
            </Link>

            <div className="mt-6">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#e3a925]">
                REIM EVENTOS
              </p>

              <h1 className="mt-2 font-serif text-[34px] leading-tight">
                Contrato do Fornecedor
              </h1>

              <p className="mt-2 text-sm leading-5 text-white/70">
                Condições aplicáveis aos fornecedores que contratam planos e
                utilizam a vitrine, os leads e demais recursos profissionais do
                REIM EVENTOS.
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
                  Contrato de adesão do fornecedor
                </h2>

                <p className="mt-2 text-sm leading-5 text-gray-600">
                  Ao marcar a caixa de aceite e prosseguir com a contratação de
                  um plano, o fornecedor declara que leu, compreendeu e concorda
                  integralmente com este Contrato do Fornecedor, com os Termos
                  de Uso e com a Política de Privacidade do REIM EVENTOS.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <ArticleCard title="1. Partes e objeto do contrato">
              Este Contrato disciplina a relação entre o REIM EVENTOS,
              plataforma digital de conexão, organização e intermediação
              tecnológica no setor de eventos, e o fornecedor que utiliza a
              plataforma para divulgar sua atividade profissional, manter
              vitrine própria, receber pedidos de orçamento, enviar propostas,
              comunicar-se com clientes e utilizar outros recursos
              disponibilizados pelo aplicativo.
            </ArticleCard>

            <ArticleCard title="2. Natureza do REIM EVENTOS">
              O fornecedor reconhece que o REIM EVENTOS atua como plataforma
              tecnológica destinada a facilitar a conexão, a comunicação e a
              organização da relação entre clientes e fornecedores
              independentes. O REIM EVENTOS não executa diretamente os serviços
              anunciados pelos fornecedores, não integra suas equipes, não
              emprega seus profissionais e não assume automaticamente as
              obrigações comerciais, técnicas ou operacionais assumidas pelo
              fornecedor perante o cliente.
            </ArticleCard>

            <ArticleCard title="3. Independência do fornecedor">
              O fornecedor atua por sua própria conta e risco, com autonomia
              técnica, administrativa, financeira e operacional. A utilização
              da plataforma não cria vínculo empregatício, sociedade,
              representação comercial, franquia, mandato, associação,
              exclusividade ou qualquer relação semelhante entre o fornecedor e
              o REIM EVENTOS.
            </ArticleCard>

            <ArticleCard title="4. Responsabilidade pela execução dos serviços">
              O fornecedor é responsável pela execução integral dos serviços
              que oferecer, negociar ou contratar com clientes encontrados por
              meio do REIM EVENTOS, incluindo qualidade, segurança,
              pontualidade, disponibilidade, equipamentos, equipe,
              deslocamento, montagem, desmontagem, atendimento, entrega,
              licenças, autorizações, obrigações tributárias e demais condições
              relacionadas à sua atividade.
            </ArticleCard>

            <ArticleCard title="5. Informações verdadeiras e atualizadas">
              O fornecedor deverá manter corretas, atuais e completas as
              informações de sua vitrine, incluindo nome comercial, categoria,
              descrição, localização, meios de atendimento permitidos pela
              plataforma, serviços oferecidos, fotos, vídeos, disponibilidade,
              preços quando divulgados e demais informações apresentadas aos
              clientes.
            </ArticleCard>

            <ArticleCard title="6. Orçamentos e propostas">
              Toda proposta enviada pelo fornecedor deverá apresentar
              informações claras e verdadeiras sobre o serviço, incluindo,
              quando aplicável, preço, data, horário, duração, itens inclusos,
              condições de pagamento, validade da proposta, custos adicionais,
              regras de cancelamento e demais condições relevantes para a
              contratação.
            </ArticleCard>

            <ArticleCard title="7. Relação entre cliente e fornecedor">
              A contratação do serviço ocorre diretamente entre cliente e
              fornecedor. O fornecedor será responsável pelo cumprimento do
              orçamento aceito, das condições combinadas e das obrigações legais
              relacionadas ao serviço contratado. O fato de o contato inicial,
              a proposta, a comunicação ou o aceite terem ocorrido dentro do
              REIM EVENTOS não transfere automaticamente à plataforma as
              obrigações próprias do fornecedor.
            </ArticleCard>

            <ArticleCard title="8. Limites de atuação e responsabilidade do REIM EVENTOS">
              O REIM EVENTOS não garante resultado, qualidade, disponibilidade,
              pontualidade, capacidade técnica, solvência, cumprimento
              contratual ou comportamento de fornecedores ou clientes
              independentes. O REIM EVENTOS responderá pelas obrigações e falhas
              que sejam diretamente atribuíveis aos seus próprios serviços e
              sistemas, nos limites da legislação aplicável, permanecendo o
              fornecedor responsável pelos seus próprios atos, omissões,
              serviços, empregados, contratados, equipamentos e obrigações.
            </ArticleCard>

            <ArticleCard title="9. Reclamações, processos e cooperação">
              Caso o REIM EVENTOS seja incluído em reclamação administrativa,
              procedimento extrajudicial, ação judicial ou qualquer outra
              demanda relacionada a ato, omissão, atraso, cancelamento,
              inadimplemento, defeito, fraude, dano ou outra conduta atribuída ao
              fornecedor, este deverá cooperar de boa-fé com a apuração dos
              fatos e fornecer, quando solicitado, documentos, registros,
              conversas, comprovantes, contratos, notas fiscais e demais
              informações relacionadas ao caso.
            </ArticleCard>

            <ArticleCard title="10. Ressarcimento e direito de regresso">
              Na medida permitida pela legislação aplicável, caso o REIM EVENTOS
              venha a sofrer prejuízo, condenação, acordo, despesa ou custo
              comprovadamente decorrente de ato ou omissão imputável ao
              fornecedor, poderá buscar o respectivo ressarcimento ou exercer
              direito de regresso contra o responsável, preservado o direito de
              defesa e considerada eventual responsabilidade própria da
              plataforma determinada por lei ou decisão competente.
            </ArticleCard>

            <ArticleCard title="11. Danos causados pelo fornecedor">
              O fornecedor será responsável por danos materiais, pessoais,
              morais ou de outra natureza que sejam diretamente decorrentes de
              sua conduta, de seus serviços, de sua equipe, de seus equipamentos
              ou do descumprimento de obrigações assumidas com o cliente,
              observadas as circunstâncias concretas de cada caso e a legislação
              aplicável.
            </ArticleCard>

            <ArticleCard title="12. Reclamações e medidas de proteção da plataforma">
              O REIM EVENTOS poderá analisar reclamações recebidas sobre
              fornecedores e, quando houver indícios relevantes de fraude, risco
              à segurança, grave descumprimento contratual, conteúdo ilegal,
              repetidas reclamações fundamentadas ou violação destes documentos,
              poderá limitar recursos, suspender temporariamente a conta,
              solicitar esclarecimentos ou adotar outras medidas razoáveis de
              proteção da plataforma e de seus usuários.
            </ArticleCard>

            <ArticleCard title="13. Fotos, vídeos, marcas e outros conteúdos">
              O fornecedor declara possuir autorização, licença ou direito para
              utilizar todas as fotos, vídeos, textos, músicas, logotipos,
              marcas e demais conteúdos que inserir no REIM EVENTOS. O
              fornecedor será responsável por eventuais violações de direitos
              autorais, direitos de imagem, propriedade intelectual, privacidade
              ou outros direitos de terceiros relacionados aos materiais que
              publicar.
            </ArticleCard>

            <ArticleCard title="14. Autorização para exibição da vitrine">
              Durante a utilização da plataforma, o fornecedor autoriza o REIM
              EVENTOS a armazenar, processar, redimensionar e exibir os
              conteúdos enviados por ele para fins de funcionamento da vitrine,
              busca, divulgação interna da plataforma, apresentação aos clientes
              e demais funcionalidades diretamente relacionadas ao serviço.
              Essa autorização não transfere a propriedade intelectual do
              conteúdo ao REIM EVENTOS.
            </ArticleCard>

            <ArticleCard title="15. Planos disponíveis">
              Atualmente, o fornecedor poderá contratar o plano Premium nos
              períodos mensal, trimestral ou anual, conforme as opções
              apresentadas na plataforma. O REIM EVENTOS poderá futuramente
              criar, alterar ou descontinuar planos, funcionalidades e condições
              comerciais, preservando os períodos já integralmente pagos e
              observando as regras deste Contrato e da legislação aplicável.
            </ArticleCard>

            <ArticleCard title="16. Valores dos planos">
              Os valores comerciais atualmente previstos são: R$ 25,00 para o
              plano mensal, com validade de 30 dias; R$ 65,00 para o plano
              trimestral, com validade de 90 dias; e R$ 250,00 para o plano
              anual, com validade de 365 dias.
            </ArticleCard>

            <ArticleCard title="17. Pagamento e ativação">
              O pagamento poderá ser realizado pelos meios eletrônicos
              disponibilizados pela plataforma, incluindo o Checkout Pro do
              Mercado Pago e outros meios que venham a ser implementados. A
              ativação do plano ocorrerá após a confirmação do pagamento pelo
              respectivo provedor. Pagamentos pendentes, rejeitados, cancelados
              ou não confirmados não garantem ativação do plano.
            </ArticleCard>

            <ArticleCard title="18. Pagamento avulso e ausência de renovação automática">
              Os planos atualmente são contratados por pagamento avulso e não
              possuem renovação automática. Encerrada a validade do período
              contratado, o fornecedor deverá realizar nova contratação para
              continuar utilizando os recursos sujeitos a plano pago, salvo se
              no futuro for disponibilizada modalidade de renovação automática
              e houver aceite expresso do fornecedor.
            </ArticleCard>

            <ArticleCard title="19. Reajuste anual">
              Os valores dos planos poderão ser reajustados uma vez a cada
              período mínimo de 12 meses, em percentual de até 5% ao ano. O
              reajuste não será aplicado retroativamente, não modificará valores
              já pagos e não reduzirá o prazo de validade de um plano já
              adquirido. O novo preço será aplicado apenas às novas contratações
              ou futuras renovações realizadas após sua entrada em vigor e será
              apresentado ao fornecedor antes da contratação.
            </ArticleCard>

            <ArticleCard title="20. Teste grátis">
              Quando disponibilizado, o teste grátis poderá ser utilizado uma
              única vez por fornecedor, conta ou perfil, conforme as regras da
              plataforma. É proibido criar cadastros duplicados, utilizar dados
              de terceiros ou adotar outros meios com a finalidade de obter
              repetidos períodos gratuitos de maneira indevida.
            </ArticleCard>

            <ArticleCard title="21. Expiração do plano">
              Após o fim da validade do plano pago ou do período de teste, a
              vitrine e os recursos condicionados à existência de plano ativo
              poderão ser limitados, ocultados ou suspensos até que uma nova
              contratação seja realizada e confirmada.
            </ArticleCard>

            <ArticleCard title="22. Ausência de garantia de quantidade de clientes ou vendas">
              A contratação de um plano não garante quantidade mínima de
              visualizações, contatos, leads, pedidos de orçamento,
              contratações, faturamento ou qualquer resultado comercial
              específico. O desempenho do fornecedor poderá variar conforme sua
              categoria, localização, qualidade da vitrine, demanda dos
              clientes, concorrência e outros fatores.
            </ArticleCard>

            <ArticleCard title="23. Condutas proibidas">
              É proibido utilizar a plataforma para fraude, falsidade,
              discriminação, conteúdo ilegal, violação de direitos de terceiros,
              coleta indevida de dados, tentativa de invasão, manipulação de
              avaliações, uso de identidades falsas, obtenção indevida de
              benefícios ou qualquer prática contrária à legislação, aos Termos
              de Uso ou a este Contrato.
            </ArticleCard>

            <ArticleCard title="24. Segurança da conta">
              O fornecedor é responsável pela guarda de suas credenciais de
              acesso e pelas atividades realizadas em sua conta, devendo
              comunicar ao REIM EVENTOS qualquer suspeita de acesso não
              autorizado, comprometimento de senha ou uso indevido do perfil.
            </ArticleCard>

            <ArticleCard title="25. Dados pessoais e LGPD">
              O tratamento de dados pessoais relacionado à utilização da
              plataforma ocorrerá conforme a Política de Privacidade e a
              legislação aplicável. O fornecedor compromete-se a utilizar dados
              de clientes acessados por meio do REIM EVENTOS somente para
              finalidades legítimas relacionadas ao atendimento, elaboração de
              orçamentos, contratação e execução dos serviços, não podendo
              vender, compartilhar indevidamente ou utilizar esses dados para
              finalidades incompatíveis.
            </ArticleCard>

            <ArticleCard title="26. Comunicações eletrônicas">
              O fornecedor concorda que comunicações relacionadas à conta,
              pagamentos, planos, segurança, suporte, alterações contratuais e
              funcionamento da plataforma poderão ser realizadas por meios
              eletrônicos, incluindo avisos no aplicativo, e-mail e outros
              canais informados pelo próprio fornecedor.
            </ArticleCard>

            <ArticleCard title="27. Aceite eletrônico">
              O fornecedor reconhece como manifestação válida de sua vontade o
              aceite realizado eletronicamente na plataforma, inclusive por meio
              da marcação de caixa de concordância seguida da continuidade do
              processo de contratação. O REIM EVENTOS poderá manter registros
              técnicos do aceite, incluindo identificação do fornecedor,
              usuário, versão do contrato, plano, período, valor, data e horário
              da concordância.
            </ArticleCard>

            <ArticleCard title="28. Versão aceita do contrato">
              Para fins de segurança e comprovação, cada aceite poderá ser
              vinculado à versão específica deste Contrato vigente na data da
              contratação. Alterações posteriores não modificarão
              retroativamente as condições de um período já integralmente pago,
              salvo quando exigido por lei.
            </ArticleCard>

            <ArticleCard title="29. Alterações contratuais">
              Este Contrato poderá ser atualizado para refletir mudanças legais,
              operacionais, comerciais, tecnológicas ou de segurança. A versão
              mais recente ficará disponível na plataforma. Sempre que uma
              alteração exigir novo aceite do fornecedor, a plataforma poderá
              solicitar nova concordância antes de permitir futuras
              contratações ou utilização de funcionalidades específicas.
            </ArticleCard>

            <ArticleCard title="30. Suspensão e encerramento da conta">
              O REIM EVENTOS poderá suspender, limitar ou encerrar contas em
              caso de fraude, violação grave ou reiterada deste Contrato, risco à
              segurança, uso ilegal da plataforma ou determinação de autoridade
              competente, assegurando, quando cabível, oportunidade de
              esclarecimento e observância da legislação aplicável.
            </ArticleCard>

            <ArticleCard title="31. Rescisão pelo fornecedor">
              O fornecedor poderá deixar de utilizar a plataforma a qualquer
              momento. A desistência voluntária após a contratação de um plano
              observará as regras aplicáveis à relação, o meio de pagamento
              utilizado, o estágio de utilização do serviço e a legislação
              vigente, não havendo promessa genérica de reembolso automático
              fora das hipóteses legalmente aplicáveis.
            </ArticleCard>

            <ArticleCard title="32. Integração com Termos de Uso e Política de Privacidade">
              Este Contrato deve ser interpretado em conjunto com os Termos de
              Uso e a Política de Privacidade do REIM EVENTOS. Em relação às
              obrigações específicas dos fornecedores assinantes, prevalecerão
              as condições específicas deste Contrato, sem afastar normas legais
              obrigatórias.
            </ArticleCard>

            <ArticleCard title="33. Legislação aplicável e resolução de conflitos">
              Este Contrato será interpretado conforme a legislação brasileira.
              As partes poderão buscar solução amigável para eventuais
              divergências antes da adoção de medidas judiciais, sem prejuízo do
              direito de recorrer aos órgãos e autoridades competentes quando
              necessário.
            </ArticleCard>

            <ArticleCard title="34. Foro">
              Quando juridicamente permitido, fica eleito o foro competente da
              sede do responsável pelo REIM EVENTOS para solução de conflitos
              relacionados a este Contrato, sem prejuízo de eventual foro
              legalmente obrigatório ou de direitos inderrogáveis previstos na
              legislação aplicável.
            </ArticleCard>
          </div>

          <div className="mt-6 rounded-[28px] bg-black p-5 text-white shadow-xl">
            <div className="flex items-start gap-3">
              <Crown
                size={28}
                className="shrink-0 text-[#e3a925]"
              />

              <div>
                <h2 className="text-lg font-extrabold">
                  Versão do contrato
                </h2>

                <p className="mt-2 text-sm leading-5 text-white/70">
                  Contrato do Fornecedor — Versão 1.0.
                </p>

                <p className="mt-2 text-sm leading-5 text-white/70">
                  Aplicável aos fornecedores que contratarem planos pagos do
                  REIM EVENTOS e realizarem o aceite eletrônico desta versão.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-[#f1e7cf]">
            <div className="flex items-start gap-3">
              <ShieldCheck
                size={26}
                className="shrink-0 text-[#d99200]"
              />

              <div>
                <h2 className="text-base font-extrabold">
                  Documentos relacionados
                </h2>

                <p className="mt-2 text-sm leading-5 text-gray-600">
                  Este contrato deve ser lido em conjunto com os Termos de Uso e
                  a Política de Privacidade do REIM EVENTOS.
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <Link
                href="/termos"
                className="rounded-[22px] bg-white px-4 py-3 text-center text-xs font-extrabold text-[#151515] ring-1 ring-[#f1e7cf]"
              >
                Termos de Uso
              </Link>

              <Link
                href="/privacidade"
                className="rounded-[22px] bg-[#e3a925] px-4 py-3 text-center text-xs font-extrabold text-white"
              >
                Privacidade
              </Link>
            </div>
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
