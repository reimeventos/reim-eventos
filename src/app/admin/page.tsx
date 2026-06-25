// src/app/admin/page.tsx
'use client';

import Link from 'next/link';
import {
  BadgeCheck,
  BarChart3,
  Bell,
  ClipboardCheck,
  FileSearch,
  LayoutGrid,
  Lock,
  SearchCheck,
  Shield,
  Store,
  Users,
} from 'lucide-react';

const cards = [
  {
    title: 'Aprovações',
    desc: 'Pendências e liberações do sistema',
    href: '/admin/assinaturas',
    icon: ClipboardCheck,
    badge: 'Pendente',
  },
  {
    title: 'Fornecedores',
    desc: 'Ver cadastros e vitrines',
    href: '/admin/fornecedores',
    icon: Store,
    badge: 'Cadastro',
  },
  {
    title: 'Clientes',
    desc: 'Ver contas de clientes',
    href: '/admin/clientes',
    icon: Users,
    badge: 'Ativo',
  },
  {
    title: 'Assinaturas',
    desc: 'Planos, pagamentos e ativações',
    href: '/admin/assinaturas',
    icon: BadgeCheck,
    badge: 'Planos',
  },
  {
    title: 'Vitrines',
    desc: 'Visualizar vitrines por categoria',
    href: '/admin/vitrines',
    icon: LayoutGrid,
    badge: 'Catálogo',
  },
  {
    title: 'Relatórios',
    desc: 'Resumo geral do sistema',
    href: '/admin/relatorios',
    icon: BarChart3,
    badge: 'Sistema',
  },
  {
    title: 'Segurança',
    desc: 'Controles e proteção interna',
    href: '/admin/seguranca',
    icon: Shield,
    badge: 'Proteção',
  },
  {
    title: 'Auditoria',
    desc: 'Histórico de ações administrativas',
    href: '/admin/auditoria',
    icon: FileSearch,
    badge: 'Logs',
  },
];

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-black text-[#151515]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#fbf7f1] pb-10 shadow-2xl">
        {/* TOPO */}
        <section className="relative overflow-hidden rounded-b-[30px] bg-black px-5 pb-7 pt-7 text-white">
          <div className="absolute inset-0 bg-[url('/layout01-fundo.png')] bg-cover bg-center opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/85 to-black" />

          <div className="relative z-10">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-[#e3a925]">
                  REIM EVENTOS
                </p>
                <h1 className="mt-1 font-serif text-[30px] leading-tight">
                  Área Administrativa
                </h1>
                <p className="mt-2 text-sm text-white/70">
                  Painel do dono do app para acompanhar, liberar e controlar o
                  sistema.
                </p>
              </div>

              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[#e3a925]">
                <Bell size={23} />
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-extrabold text-white">
                  !
                </span>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2">
              <div className="rounded-2xl bg-white/10 p-3 text-center">
                <p className="text-lg font-extrabold text-[#e3a925]">Admin</p>
                <p className="mt-1 text-[10px] font-bold text-white/70">
                  Acesso total
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 p-3 text-center">
                <p className="text-lg font-extrabold text-[#e3a925]">Home</p>
                <p className="mt-1 text-[10px] font-bold text-white/70">
                  Controle central
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 p-3 text-center">
                <p className="text-lg font-extrabold text-[#e3a925]">Logs</p>
                <p className="mt-1 text-[10px] font-bold text-white/70">
                  Auditoria ativa
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ALERTA */}
        <section className="px-5 pt-5">
          <div className="rounded-[22px] bg-[#fff7e8] p-4 shadow-sm ring-1 ring-[#f1e7cf]">
            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e3a925] text-white">
                <SearchCheck size={20} />
              </div>

              <div className="flex-1">
                <h2 className="text-sm font-extrabold text-[#7a5200]">
                  Central administrativa
                </h2>
                <p className="mt-1 text-xs leading-5 text-[#8a6721]">
                  Aqui você acompanha aprovações, assinaturas, vitrines,
                  clientes, segurança e agora também a auditoria do sistema.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* MENU */}
        <section className="px-5 pt-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-extrabold">Acessos rápidos</h2>
            <span className="text-xs font-bold text-gray-500">
              {cards.length} módulos
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {cards.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-[#f1e7cf]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#151515] text-[#e3a925]">
                      <Icon size={22} />
                    </div>

                    <span className="rounded-full bg-[#fff7e8] px-2 py-1 text-[10px] font-extrabold text-[#b97900]">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="mt-3 text-sm font-extrabold">{item.title}</h3>
                  <p className="mt-1 text-[11px] leading-4 text-gray-500">
                    {item.desc}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* BLOCO EXTRA */}
        <section className="px-5 pt-5">
          <div className="rounded-[24px] bg-black p-5 text-white shadow-xl">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e3a925] text-white">
                <Lock size={24} />
              </div>

              <div>
                <h3 className="text-sm font-extrabold">Controle administrativo</h3>
                <p className="mt-2 text-xs leading-5 text-white/75">
                  Use a área administrativa para liberar planos, revisar
                  cadastros, monitorar logs e acompanhar o crescimento do REIM.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
