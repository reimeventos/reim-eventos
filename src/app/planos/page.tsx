'use client';

import { useEffect, useState } from 'react';
import { listPlans, simulatePlanActivation } from '@/lib/payments';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  Crown,
  Gem,
  Rocket,
  ShieldCheck,
  Sparkles,
  Star,
  WalletCards,
} from 'lucide-react';

function getPlanIcon(index: number) {
  if (index === 0) return ShieldCheck;
  if (index === 1) return Crown;
  return Rocket;
}

function getPlanLabel(index: number) {
  if (index === 0) return 'Básico';
  if (index === 1) return 'Mais escolhido';
  return 'Profissional';
}

function getPlanBenefits(index: number) {
  if (index === 0) {
    return [
      'Vitrine básica no app',
      'Receber pedidos de orçamento',
      'Cadastro em uma categoria',
      'Galeria inicial de mídias',
    ];
  }

  if (index === 1) {
    return [
      'Selo Premium na vitrine',
      'Mais destaque na busca',
      'Fotos e vídeos na galeria',
      'Responder orçamentos pelo app',
      'Acesso ao painel de leads',
    ];
  }

  return [
    'Destaque avançado no app',
    'Relatórios de desempenho',
    'Prioridade na listagem',
    'Mais mídias na vitrine',
    'Suporte prioritário',
  ];
}

export default function PlanosPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    listPlans().then(setPlans);
  }, []);

  async function activate(id: string) {
    await simulatePlanActivation(id);
    router.push('/pagamento/sucesso');
  }

  return (
    <main className="min-h-screen bg-black text-[#151515]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#fbf7f1] pb-10 shadow-2xl">
        {/* TOPO */}
        <section className="relative overflow-hidden rounded-b-[34px] bg-black px-6 pb-8 pt-7 text-white">
          <div className="absolute inset-0 bg-[url('/layout01-fundo.png')] bg-cover bg-center opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/85 to-black" />

          <div className="relative z-10">
            <Link
              href="/painel-fornecedor"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#e3a925]"
            >
              <ArrowLeft size={17} />
              Voltar
            </Link>

            <div className="mt-6 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e3a925] text-white shadow-lg">
                <Crown size={31} />
              </div>

              <div>
                <h1 className="font-serif text-[34px] leading-tight">
                  Planos REIM
                </h1>
                <p className="mt-1 text-sm text-white/70">
                  Escolha como sua vitrine será exibida.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-[26px] bg-white/10 p-4 backdrop-blur">
              <p className="flex items-center gap-2 text-sm font-bold text-[#e3a925]">
                <Sparkles size={17} />
                Fornecedores em destaque recebem mais visualizações e pedidos.
              </p>
            </div>
          </div>
        </section>

        {/* RESUMO */}
        <section className="grid grid-cols-3 gap-3 px-6 pt-6">
          <div className="rounded-[22px] bg-white p-4 text-center shadow-sm ring-1 ring-[#f1e7cf]">
            <Star size={24} className="mx-auto text-[#d99200]" fill="#d99200" />
            <p className="mt-2 text-[11px] font-bold text-gray-600">
              Destaque
            </p>
          </div>

          <div className="rounded-[22px] bg-white p-4 text-center shadow-sm ring-1 ring-[#f1e7cf]">
            <WalletCards size={24} className="mx-auto text-[#d99200]" />
            <p className="mt-2 text-[11px] font-bold text-gray-600">
              Mensal
            </p>
          </div>

          <div className="rounded-[22px] bg-white p-4 text-center shadow-sm ring-1 ring-[#f1e7cf]">
            <Gem size={24} className="mx-auto text-[#d99200]" />
            <p className="mt-2 text-[11px] font-bold text-gray-600">
              Premium
            </p>
          </div>
        </section>

        {/* PLANOS */}
        <section className="px-6 pt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-extrabold">Escolha seu plano</h2>
            <span className="text-xs font-bold text-gray-500">
              {plans.length || 0} opções
            </span>
          </div>

          <div className="space-y-5">
            {plans.map((plan, index) => {
              const Icon = getPlanIcon(index);
              const benefits = getPlanBenefits(index);
              const isFeatured = index === 1;

              return (
                <div
                  key={plan.id}
                  className={`rounded-[30px] p-5 shadow-[0_10px_25px_rgba(0,0,0,.08)] ${
                    isFeatured
                      ? 'bg-black text-white'
                      : 'bg-white text-[#151515] ring-1 ring-[#f1e7cf]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                          isFeatured
                            ? 'bg-[#e3a925] text-white'
                            : 'bg-[#fff7e8] text-[#d99200]'
                        }`}
                      >
                        <Icon size={30} />
                      </div>

                      <div>
                        <span
                          className={`rounded-full px-3 py-1 text-[11px] font-extrabold ${
                            isFeatured
                              ? 'bg-[#e3a925] text-white'
                              : 'bg-[#fff7e8] text-[#b97900]'
                          }`}
                        >
                          {getPlanLabel(index)}
                        </span>

                        <h3 className="mt-3 font-serif text-2xl leading-tight">
                          {plan.name}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <p
                    className={`mt-4 text-sm leading-5 ${
                      isFeatured ? 'text-white/70' : 'text-gray-500'
                    }`}
                  >
                    {plan.description}
                  </p>

                  <div className="mt-5">
                    <p className="text-3xl font-extrabold">
                      {(plan.price_cents / 100).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </p>

                    <p
                      className={`mt-1 text-xs font-bold ${
                        isFeatured ? 'text-white/60' : 'text-gray-500'
                      }`}
                    >
                      por período contratado
                    </p>
                  </div>

                  <div className="mt-5 space-y-3">
                    {benefits.map((benefit) => (
                      <div key={benefit} className="flex items-center gap-2">
                        <CheckCircle2
                          size={17}
                          className={isFeatured ? 'text-[#e3a925]' : 'text-green-600'}
                        />
                        <span
                          className={`text-sm font-bold ${
                            isFeatured ? 'text-white/85' : 'text-gray-700'
                          }`}
                        >
                          {benefit}
                        </span>
                      </div>
                    ))}
                  </div>

                  <p
                    className={`mt-5 text-xs leading-5 ${
                      isFeatured ? 'text-white/50' : 'text-gray-500'
                    }`}
                  >
                    Reajuste anual mediante aviso prévio.
                  </p>

                  <button
                    onClick={() => activate(plan.id)}
                    className={`mt-5 w-full rounded-[24px] py-4 font-extrabold shadow-lg ${
                      isFeatured
                        ? 'bg-[#e3a925] text-white'
                        : 'bg-black text-white'
                    }`}
                  >
                    Assinar / Simular aprovação
                  </button>
                </div>
              );
            })}

            {plans.length === 0 && (
              <div className="rounded-[28px] bg-white p-6 text-center shadow-sm ring-1 ring-[#f1e7cf]">
                <Crown size={36} className="mx-auto text-[#d99200]" />
                <h3 className="mt-4 text-lg font-extrabold">
                  Carregando planos
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Aguarde enquanto buscamos as opções disponíveis.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
