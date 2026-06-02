import Link from 'next/link';
import {
  Bell,
  Briefcase,
  CalendarDays,
  ChevronRight,
  Heart,
  LogOut,
  MessageCircle,
  Settings,
  ShieldCheck,
  User,
  UserRound,
  WalletCards,
} from 'lucide-react';
import { Nav } from '@/components/Nav';

const menuItems = [
  {
    title: 'Meu Evento',
    desc: 'Organize fornecedores e orçamentos',
    href: '/meu-evento',
    icon: Heart,
  },
  {
    title: 'Meus Orçamentos',
    desc: 'Acompanhe pedidos e respostas',
    href: '/orcamentos',
    icon: MessageCircle,
  },
  {
    title: 'Painel Fornecedor',
    desc: 'Gerencie sua vitrine e leads',
    href: '/painel-fornecedor',
    icon: Briefcase,
  },
  {
    title: 'Planos REIM',
    desc: 'Assinatura e destaque no app',
    href: '/planos',
    icon: WalletCards,
  },
];

export default function PerfilPage() {
  return (
    <main className="min-h-screen bg-black text-[#151515]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#fbf7f1] pb-28 shadow-2xl">
        {/* TOPO */}
        <section className="relative overflow-hidden rounded-b-[34px] bg-black px-6 pb-8 pt-7 text-white">
          <div className="absolute inset-0 bg-[url('/layout01-fundo.png')] bg-cover bg-center opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/85 to-black" />

          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-sm font-bold text-[#e3a925]">
                ‹ Voltar
              </Link>

              <button className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-[#e3a925]">
                <Bell size={22} />
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-pink-500 px-1 text-[10px] font-extrabold text-white">
                  3
                </span>
              </button>
            </div>

            <div className="mt-7 flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-[28px] bg-[#e3a925] text-white shadow-lg">
                <UserRound size={42} />
              </div>

              <div>
                <p className="text-sm font-bold text-[#e3a925]">Minha conta</p>
                <h1 className="mt-1 font-serif text-[34px] leading-tight">
                  Maria Souza
                </h1>
                <p className="mt-1 text-sm text-white/70">
                  Cliente / Noiva
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* DADOS DA CONTA */}
        <section className="px-6 pt-6">
          <div className="rounded-[28px] bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,.08)]">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff7e8] text-[#d99200]">
                <ShieldCheck size={30} />
              </div>

              <div className="flex-1">
                <h2 className="text-lg font-extrabold">Conta verificada</h2>
                <p className="mt-1 text-sm leading-5 text-gray-600">
                  Seu perfil está pronto para solicitar orçamentos, salvar
                  fornecedores e organizar seu evento.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* RESUMO */}
        <section className="grid grid-cols-3 gap-3 px-6 pt-6">
          <div className="rounded-[22px] bg-white p-4 text-center shadow-sm ring-1 ring-[#f1e7cf]">
            <CalendarDays size={24} className="mx-auto text-[#d99200]" />
            <p className="mt-2 text-[11px] font-bold text-gray-600">
              Evento
            </p>
          </div>

          <div className="rounded-[22px] bg-white p-4 text-center shadow-sm ring-1 ring-[#f1e7cf]">
            <MessageCircle size={24} className="mx-auto text-[#d99200]" />
            <p className="mt-2 text-[11px] font-bold text-gray-600">
              Orçamentos
            </p>
          </div>

          <div className="rounded-[22px] bg-white p-4 text-center shadow-sm ring-1 ring-[#f1e7cf]">
            <Briefcase size={24} className="mx-auto text-[#d99200]" />
            <p className="mt-2 text-[11px] font-bold text-gray-600">
              Fornecedor
            </p>
          </div>
        </section>

        {/* MENU */}
        <section className="px-6 pt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-extrabold">Acessos rápidos</h2>
            <Settings size={20} className="text-[#d99200]" />
          </div>

          <div className="space-y-4">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  href={item.href}
                  key={item.title}
                  className="flex items-center gap-4 rounded-[26px] bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,.08)] ring-1 ring-[#f1e7cf]"
                >
                  <div className="flex h-13 w-13 min-w-13 items-center justify-center rounded-2xl bg-[#fff7e8] p-3 text-[#d99200]">
                    <Icon size={27} />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-sm font-extrabold">{item.title}</h3>
                    <p className="mt-1 text-xs leading-4 text-gray-500">
                      {item.desc}
                    </p>
                  </div>

                  <ChevronRight size={21} className="text-gray-400" />
                </Link>
              );
            })}
          </div>
        </section>

        {/* TIPO DE CONTA */}
        <section className="px-6 pt-6">
          <div className="rounded-[28px] bg-black p-5 text-white shadow-xl">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e3a925] text-white">
                <User size={30} />
              </div>

              <div className="flex-1">
                <h2 className="text-lg font-extrabold">
                  Tipo de conta
                </h2>

                <p className="mt-2 text-sm leading-5 text-white/70">
                  Esta conta pode navegar como cliente e também acessar o painel
                  de fornecedor para gerenciar vitrine e leads.
                </p>

                <Link
                  href="/painel-fornecedor"
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#e3a925] px-5 py-2 text-sm font-extrabold text-white"
                >
                  Acessar painel fornecedor
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* SAIR */}
        <section className="px-6 pt-6">
          <button className="flex w-full items-center justify-center gap-2 rounded-[24px] bg-white py-4 text-center font-extrabold text-[#151515] shadow-sm ring-1 ring-[#f1e7cf]">
            <LogOut size={21} className="text-[#d99200]" />
            Sair da conta
          </button>
        </section>

        <Nav />
      </div>
    </main>
  );
}
