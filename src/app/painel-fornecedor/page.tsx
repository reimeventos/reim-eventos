import Link from 'next/link';
import {
  BarChart3,
  Bell,
  Camera,
  Crown,
  FileText,
  ImageIcon,
  MessageCircle,
  Pencil,
  Settings,
  Star,
  ToggleRight,
  WalletCards,
} from 'lucide-react';

const shortcuts = [
  {
    title: 'Leads recebidos',
    desc: 'Veja pedidos de orçamento dos clientes',
    href: '/painel-fornecedor/leads',
    icon: MessageCircle,
    color: 'bg-[#e3a925]',
  },
  {
    title: 'Editar vitrine',
    desc: 'Atualize nome, descrição e serviços',
    href: '/painel-fornecedor/editar',
    icon: Pencil,
    color: 'bg-black',
  },
  {
    title: 'Enviar mídias',
    desc: 'Adicione imagens na sua galeria',
    href: '/painel-fornecedor/fotos',
    icon: ImageIcon,
    color: 'bg-black',
  },
  {
    title: 'Planos',
    desc: 'Gerencie seu plano premium',
    href: '/planos',
    icon: Crown,
    color: 'bg-[#e3a925]',
  },
];

export default function PainelFornecedorPage() {
  return (
    <main className="min-h-screen bg-black text-[#151515]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#fbf7f1] pb-10 shadow-2xl">
        {/* TOPO */}
        <section className="relative overflow-hidden rounded-b-[34px] bg-black px-6 pb-8 pt-7 text-white">
          <div className="absolute inset-0 bg-[url('/layout01-fundo.png')] bg-cover bg-center opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/85 to-black" />

          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-[#e3a925]">Fornecedor</p>
                <h1 className="mt-2 font-serif text-[34px] leading-tight">
                  Painel
                </h1>
              </div>

              <Link
                href="/painel-fornecedor/leads"
                className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-[#e3a925]"
              >
                <Bell size={24} />
                <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-pink-500 px-1 text-xs font-extrabold text-white">
                  3
                </span>
              </Link>
            </div>

            <div className="mt-6 rounded-[28px] bg-white/10 p-5 backdrop-blur">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e3a925] text-white shadow-lg">
                  <Camera size={34} />
                </div>

                <div>
                  <h2 className="text-xl font-extrabold">Studio Premium</h2>
                  <p className="mt-1 text-sm text-white/70">
                    Fotografia & Filmagem
                  </p>

                  <p className="mt-2 flex items-center gap-1 text-sm font-bold text-[#e3a925]">
                    <Star size={15} fill="#e3a925" />
                    4.9 • Plano Premium
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* RESUMO */}
        <section className="grid grid-cols-3 gap-3 px-6 pt-6">
          <div className="rounded-[22px] bg-white p-4 text-center shadow-sm ring-1 ring-[#f1e7cf]">
            <p className="text-2xl font-extrabold text-[#d99200]">3</p>
            <p className="mt-1 text-[11px] font-bold text-gray-600">Leads</p>
          </div>

          <div className="rounded-[22px] bg-white p-4 text-center shadow-sm ring-1 ring-[#f1e7cf]">
            <p className="text-2xl font-extrabold text-blue-600">1</p>
            <p className="mt-1 text-[11px] font-bold text-gray-600">Respondido</p>
          </div>

          <div className="rounded-[22px] bg-white p-4 text-center shadow-sm ring-1 ring-[#f1e7cf]">
            <p className="text-2xl font-extrabold text-green-600">1</p>
            <p className="mt-1 text-[11px] font-bold text-gray-600">Fechado</p>
          </div>
        </section>

        {/* ATALHOS */}
        <section className="px-6 pt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-extrabold">Ações rápidas</h2>
            <span className="text-xs font-bold text-gray-500">Gerenciar</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {shortcuts.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="rounded-[26px] bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,.08)] ring-1 ring-[#f1e7cf]"
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.color} text-white`}
                  >
                    <Icon size={25} />
                  </div>

                  <h3 className="mt-4 text-sm font-extrabold">
                    {item.title}
                  </h3>

                  <p className="mt-1 text-xs leading-4 text-gray-500">
                    {item.desc}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* CONFIGURAÇÕES */}
        <section className="px-6 pt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-extrabold">Configurações</h2>
            <Settings size={20} className="text-[#d99200]" />
          </div>

          <div className="space-y-4">
            <div className="rounded-[26px] bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,.08)] ring-1 ring-[#f1e7cf]">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff7e8] text-[#d99200]">
                    <ToggleRight size={27} />
                  </div>

                  <div>
                    <h3 className="text-sm font-extrabold">Preço público</h3>
                    <p className="mt-1 text-xs text-gray-500">
                      Mostrar valor na vitrine
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-extrabold text-gray-600">
                  Desativado
                </span>
              </div>
            </div>

            <div className="rounded-[26px] bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,.08)] ring-1 ring-[#f1e7cf]">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff7e8] text-[#d99200]">
                    <WalletCards size={27} />
                  </div>

                  <div>
                    <h3 className="text-sm font-extrabold">Valor inicial</h3>
                    <p className="mt-1 text-xs text-gray-500">
                      Usado se preço público estiver ativo
                    </p>
                  </div>
                </div>

                <span className="text-sm font-extrabold text-[#d99200]">
                  R$ 1.200
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* RELATÓRIO */}
        <section className="px-6 pt-6">
          <div className="rounded-[28px] bg-black p-5 text-white shadow-xl">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e3a925] text-white">
                <BarChart3 size={30} />
              </div>

              <div className="flex-1">
                <h2 className="text-lg font-extrabold">Resumo da semana</h2>
                <p className="mt-2 text-sm leading-5 text-white/70">
                  Sua vitrine recebeu novos pedidos de orçamento. Responda rápido
                  para aumentar as chances de fechar contrato.
                </p>

                <Link
                  href="/painel-fornecedor/leads"
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#e3a925] px-5 py-2 text-sm font-extrabold text-white"
                >
                  <FileText size={17} />
                  Ver leads
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
