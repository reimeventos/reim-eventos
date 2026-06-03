import Link from 'next/link';
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  Crown,
  Search,
  ShieldAlert,
  Star,
  WalletCards,
  XCircle,
} from 'lucide-react';

const subscriptions = [
  {
    supplier: 'Studio Premium',
    plan: 'Trimestral',
    value: 'R$ 69,90',
    status: 'Ativa',
    payment: 'Pago',
    nextBilling: '22/07/2026',
    city: 'Eunápolis',
  },
  {
    supplier: 'Photofest Totem',
    plan: 'Anual',
    value: 'R$ 249,90',
    status: 'Ativa',
    payment: 'Pago',
    nextBilling: '15/01/2027',
    city: 'Eunápolis',
  },
  {
    supplier: 'Sabor Eventos',
    plan: 'Mensal',
    value: 'R$ 29,90',
    status: 'Pendente',
    payment: 'Aguardando',
    nextBilling: 'Aguardando ativação',
    city: 'Porto Seguro',
  },
  {
    supplier: 'Decora Luxo',
    plan: 'Mensal',
    value: 'R$ 29,90',
    status: 'Cancelada',
    payment: 'Cancelado',
    nextBilling: 'Sem renovação',
    city: 'Eunápolis',
  },
];

function StatusBadge({ status }: { status: string }) {
  if (status === 'Ativa') {
    return (
      <span className="flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-[11px] font-extrabold text-green-700">
        <CheckCircle2 size={13} />
        Ativa
      </span>
    );
  }

  if (status === 'Pendente') {
    return (
      <span className="flex items-center gap-1 rounded-full bg-[#fff7e8] px-3 py-1 text-[11px] font-extrabold text-[#b97900]">
        <Clock size={13} />
        Pendente
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-[11px] font-extrabold text-red-700">
      <XCircle size={13} />
      Cancelada
    </span>
  );
}

export default function AdminAssinaturasPage() {
  return (
    <main className="min-h-screen bg-black text-[#151515]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#fbf7f1] pb-10 shadow-2xl">
        {/* TOPO */}
        <section className="relative overflow-hidden rounded-b-[34px] bg-black px-6 pb-8 pt-7 text-white">
          <div className="absolute inset-0 bg-[url('/layout01-fundo.png')] bg-cover bg-center opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/85 to-black" />

          <div className="relative z-10">
            <Link
              href="/admin"
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
                <p className="text-sm font-bold text-[#e3a925]">
                  Administração
                </p>

                <h1 className="font-serif text-[34px] leading-tight">
                  Assinaturas
                </h1>

                <p className="mt-1 text-sm text-white/70">
                  Controle planos, pagamentos e vencimentos.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-[26px] bg-white p-3 shadow-2xl">
              <div className="flex items-center gap-3 rounded-[20px] bg-[#f7f2ea] px-4 py-4">
                <Search size={25} className="text-[#d99200]" />
                <input
                  className="w-full bg-transparent text-sm font-medium text-black outline-none placeholder:text-gray-500"
                  placeholder="Buscar assinatura..."
                />
              </div>
            </div>
          </div>
        </section>

        {/* RESUMO */}
        <section className="grid grid-cols-3 gap-3 px-6 pt-6">
          <div className="rounded-[22px] bg-white p-4 text-center shadow-sm ring-1 ring-[#f1e7cf]">
            <p className="text-2xl font-extrabold text-green-600">84</p>
            <p className="mt-1 text-[11px] font-bold text-gray-600">
              Ativas
            </p>
          </div>

          <div className="rounded-[22px] bg-white p-4 text-center shadow-sm ring-1 ring-[#f1e7cf]">
            <p className="text-2xl font-extrabold text-[#d99200]">12</p>
            <p className="mt-1 text-[11px] font-bold text-gray-600">
              Pendentes
            </p>
          </div>

          <div className="rounded-[22px] bg-white p-4 text-center shadow-sm ring-1 ring-[#f1e7cf]">
            <p className="text-2xl font-extrabold text-[#d99200]">
              R$ 4.820
            </p>
            <p className="mt-1 text-[11px] font-bold text-gray-600">
              MRR
            </p>
          </div>
        </section>

        {/* LISTA */}
        <section className="px-6 pt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-extrabold">Lista de assinaturas</h2>
            <span className="text-xs font-bold text-gray-500">
              {subscriptions.length} exibidas
            </span>
          </div>

          <div className="space-y-4">
            {subscriptions.map((item) => (
              <div
                key={item.supplier}
                className="rounded-[28px] bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,.08)] ring-1 ring-[#f1e7cf]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-extrabold">
                      {item.supplier}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      {item.city}
                    </p>
                  </div>

                  <StatusBadge status={item.status} />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-[#fbf7f1] p-3">
                    <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                      <Crown size={14} className="text-[#d99200]" />
                      Plano
                    </p>
                    <p className="mt-1 text-sm font-extrabold">{item.plan}</p>
                  </div>

                  <div className="rounded-2xl bg-[#fbf7f1] p-3">
                    <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                      <WalletCards size={14} className="text-[#d99200]" />
                      Valor
                    </p>
                    <p className="mt-1 text-sm font-extrabold">{item.value}</p>
                  </div>
                </div>

                <div className="mt-3 rounded-2xl bg-[#fbf7f1] p-3">
                  <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                    <CalendarDays size={14} className="text-[#d99200]" />
                    Próxima cobrança
                  </p>
                  <p className="mt-1 text-sm font-extrabold">
                    {item.nextBilling}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-sm font-bold text-[#d99200]">
                    <Star size={15} fill="#e3a925" className="text-[#e3a925]" />
                    {item.payment}
                  </span>

                  <div className="flex gap-2">
                    <button className="rounded-full bg-[#fbf7f1] px-4 py-2 text-xs font-extrabold text-[#151515] ring-1 ring-[#f1e7cf]">
                      Ver
                    </button>

                    {item.status === 'Ativa' ? (
                      <button className="rounded-full bg-black px-4 py-2 text-xs font-extrabold text-white">
                        Renovar
                      </button>
                    ) : item.status === 'Pendente' ? (
                      <button className="rounded-full bg-green-600 px-4 py-2 text-xs font-extrabold text-white">
                        Ativar
                      </button>
                    ) : (
                      <button className="rounded-full bg-[#e3a925] px-4 py-2 text-xs font-extrabold text-white">
                        Reativar
                      </button>
                    )}
                  </div>
                </div>

                {item.status === 'Pendente' && (
                  <div className="mt-3 flex items-center gap-2 rounded-[20px] bg-[#fff7e8] px-4 py-3 text-sm font-bold text-[#b97900]">
                    <ShieldAlert size={18} />
                    Assinatura aguardando confirmação de pagamento.
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
