'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Database,
  Eye,
  FileText,
  KeyRound,
  Loader2,
  LockKeyhole,
  ShieldAlert,
  ShieldCheck,
  UserCog,
  Users,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

type AdminProfile = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string | null;
  created_at: string | null;
};

type SecurityStats = {
  admins: number;
  profiles: number;
  suppliers: number;
  media: number;
  quoteRequests: number;
  quoteResponses: number;
  quoteMessages: number;
  subscriptions: number;
};

const initialStats: SecurityStats = {
  admins: 0,
  profiles: 0,
  suppliers: 0,
  media: 0,
  quoteRequests: 0,
  quoteResponses: 0,
  quoteMessages: 0,
  subscriptions: 0,
};

function formatDate(value?: string | null) {
  if (!value) return 'Sem data';

  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    }).format(new Date(value));
  } catch {
    return 'Sem data';
  }
}

export default function AdminSegurancaPage() {
  const [admins, setAdmins] = useState<AdminProfile[]>([]);
  const [stats, setStats] = useState<SecurityStats>(initialStats);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadSecurity();
  }, []);

  async function getCount(table: string, filter?: (query: any) => any) {
    let query = supabase.from(table).select('*', {
      count: 'exact',
      head: true,
    });

    if (filter) {
      query = filter(query);
    }

    const { count, error } = await query;

    if (error) {
      console.error(`Erro ao contar ${table}:`, error);
      return 0;
    }

    return count || 0;
  }

  async function loadSecurity() {
    try {
      setLoading(true);
      setErrorMessage('');

      const [
        adminsCount,
        profilesCount,
        suppliersCount,
        mediaCount,
        quoteRequestsCount,
        quoteResponsesCount,
        quoteMessagesCount,
        subscriptionsCount,
      ] = await Promise.all([
        getCount('profiles', (query) => query.eq('role', 'admin')),
        getCount('profiles'),
        getCount('suppliers'),
        getCount('media'),
        getCount('quote_requests'),
        getCount('quote_responses'),
        getCount('quote_messages'),
        getCount('supplier_subscriptions'),
      ]);

      const { data: adminData, error: adminError } = await supabase
        .from('profiles')
        .select('id,email,full_name,role,created_at')
        .eq('role', 'admin')
        .order('created_at', { ascending: true });

      if (adminError) {
        throw adminError;
      }

      setStats({
        admins: adminsCount,
        profiles: profilesCount,
        suppliers: suppliersCount,
        media: mediaCount,
        quoteRequests: quoteRequestsCount,
        quoteResponses: quoteResponsesCount,
        quoteMessages: quoteMessagesCount,
        subscriptions: subscriptionsCount,
      });

      setAdmins((adminData || []) as AdminProfile[]);
    } catch (error: any) {
      console.error('Erro ao carregar segurança:', error);
      setErrorMessage(
        error?.message || 'Não foi possível carregar o painel de segurança.'
      );
    } finally {
      setLoading(false);
    }
  }

  const protectedAreas = useMemo(
    () => [
      {
        title: 'Área Admin protegida',
        description: 'O arquivo src/app/admin/layout.tsx bloqueia usuários sem role admin.',
        status: 'ativo',
      },
      {
        title: 'Fornecedor bloqueado por assinatura',
        description: 'O painel do fornecedor exige teste ativo ou assinatura ativa.',
        status: 'ativo',
      },
      {
        title: 'Aceite de Termos no cadastro',
        description: 'Cadastro exige checkbox de Termos de Uso e Política de Privacidade.',
        status: 'ativo',
      },
      {
        title: 'Páginas LGPD publicadas',
        description: '/termos, /privacidade e /seguranca já estão disponíveis.',
        status: 'ativo',
      },
      {
        title: '2FA para Admin',
        description: 'Próxima etapa: autenticação em dois fatores para contas Admin.',
        status: 'pendente',
      },
      {
        title: 'Auditoria de ações',
        description: 'Próxima etapa: registrar aprovações, cancelamentos e ações críticas.',
        status: 'pendente',
      },
    ],
    []
  );

  return (
    <main className="min-h-screen bg-black text-[#151515]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#f7f2ea] pb-24 shadow-2xl">
        <section className="relative overflow-hidden rounded-b-[28px] bg-black px-5 pb-5 pt-5 text-white">
          <div className="absolute inset-0 bg-[url('/layout01-fundo.png')] bg-cover bg-center opacity-35" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/90 to-black" />

          <div className="relative z-10">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 text-xs font-black text-[#e3a925]"
            >
              <ArrowLeft size={16} />
              Voltar ao Admin
            </Link>

            <div className="mt-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e3a925] text-white shadow-lg">
                <LockKeyhole size={27} />
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#e3a925]">
                  Área Administrativa
                </p>

                <h1 className="font-serif text-[28px] leading-tight">
                  Segurança
                </h1>

                <p className="mt-1 text-xs font-bold text-white/65">
                  Controle de acesso, LGPD e próximos reforços.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 pt-5">
          {loading && (
            <div className="rounded-[24px] bg-white p-5 text-center shadow-sm ring-1 ring-[#f1e7cf]">
              <Loader2 className="mx-auto animate-spin text-[#d99200]" size={30} />
              <p className="mt-3 text-sm font-bold text-gray-500">
                Carregando segurança...
              </p>
            </div>
          )}

          {!loading && errorMessage && (
            <div className="rounded-[22px] bg-red-50 p-4 text-sm font-bold leading-5 text-red-700 ring-1 ring-red-100">
              {errorMessage}
            </div>
          )}

          {!loading && !errorMessage && (
            <>
              <div className="grid grid-cols-4 gap-2">
                <MiniStat label="Admins" value={stats.admins} />
                <MiniStat label="Perfis" value={stats.profiles} />
                <MiniStat label="Fornec." value={stats.suppliers} />
                <MiniStat label="Mídias" value={stats.media} />
              </div>

              <div className="mt-4 rounded-[26px] bg-[#151515] p-4 text-white shadow-lg">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e3a925]">
                    <ShieldCheck size={24} />
                  </div>

                  <div>
                    <p className="text-sm font-black">
                      Segurança atual do REIM
                    </p>

                    <p className="mt-1 text-xs font-bold leading-5 text-white/65">
                      Admin protegido, aceite de termos ativo, páginas LGPD publicadas
                      e fornecedor bloqueado quando assinatura está pendente ou vencida.
                    </p>
                  </div>
                </div>
              </div>

              <SectionTitle title="Contas Admin" />

              {admins.length === 0 ? (
                <div className="rounded-[24px] bg-red-50 p-4 text-sm font-bold leading-5 text-red-700 ring-1 ring-red-100">
                  Nenhuma conta com role admin foi encontrada.
                </div>
              ) : (
                <div className="space-y-2">
                  {admins.map((admin) => (
                    <article
                      key={admin.id}
                      className="flex items-center gap-3 rounded-[22px] bg-white p-3 shadow-sm ring-1 ring-[#f1e7cf]"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#151515] text-[#e3a925]">
                        <UserCog size={21} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-xs font-black">
                          {admin.full_name || 'Admin'}
                        </h3>

                        <p className="truncate text-[11px] font-bold text-gray-500">
                          {admin.email || 'E-mail não informado'}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="rounded-full bg-[#fff7e8] px-2 py-1 text-[9px] font-black uppercase text-[#b97900]">
                          admin
                        </p>
                        <p className="mt-1 text-[9px] font-bold text-gray-400">
                          {formatDate(admin.created_at)}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              <SectionTitle title="Checklist de proteção" />

              <div className="space-y-2">
                {protectedAreas.map((item) => {
                  const active = item.status === 'ativo';

                  return (
                    <article
                      key={item.title}
                      className={
                        active
                          ? 'rounded-[22px] bg-white p-4 shadow-sm ring-1 ring-[#f1e7cf]'
                          : 'rounded-[22px] bg-[#fff7e8] p-4 shadow-sm ring-1 ring-[#f1e7cf]'
                      }
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={
                            active
                              ? 'flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-green-700'
                              : 'flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-yellow-100 text-yellow-800'
                          }
                        >
                          {active ? (
                            <CheckCircle2 size={20} />
                          ) : (
                            <ShieldAlert size={20} />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-xs font-black">{item.title}</h3>

                            <span
                              className={
                                active
                                  ? 'shrink-0 rounded-full bg-green-50 px-2 py-1 text-[9px] font-black uppercase text-green-700'
                                  : 'shrink-0 rounded-full bg-yellow-100 px-2 py-1 text-[9px] font-black uppercase text-yellow-800'
                              }
                            >
                              {item.status}
                            </span>
                          </div>

                          <p className="mt-1 text-[11px] font-bold leading-5 text-gray-500">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              <SectionTitle title="Dados protegidos" />

              <div className="grid grid-cols-2 gap-2">
                <DataCard icon={<Users size={18} />} title="Perfis" value={stats.profiles} />
                <DataCard icon={<Database size={18} />} title="Leads" value={stats.quoteRequests} />
                <DataCard icon={<FileText size={18} />} title="Respostas" value={stats.quoteResponses} />
                <DataCard icon={<Eye size={18} />} title="Mensagens" value={stats.quoteMessages} />
              </div>

              <div className="mt-5 rounded-[24px] bg-[#fff7e8] p-4 text-[#8a6100] ring-1 ring-[#f1e7cf]">
                <p className="flex items-center gap-2 text-sm font-black">
                  <KeyRound size={18} />
                  Próximo passo técnico
                </p>

                <p className="mt-2 text-xs font-bold leading-5">
                  Implementar 2FA para Admin e criar tabela de auditoria para registrar
                  ativações, cancelamentos, expiração de plano e alterações críticas.
                </p>
              </div>
            </>
          )}
        </section>

        <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-[430px] -translate-x-1/2 border-t border-[#f1e7cf] bg-white/95 px-4 py-3 shadow-[0_-8px_25px_rgba(0,0,0,.08)] backdrop-blur">
          <div className="grid grid-cols-5 gap-1 text-center text-[10px] font-extrabold text-gray-500">
            <Link href="/admin" className="rounded-2xl px-2 py-2">
              Home
            </Link>

            <Link href="/admin/assinaturas" className="rounded-2xl px-2 py-2">
              Aprovar
            </Link>

            <Link href="/admin/fornecedores" className="rounded-2xl px-2 py-2">
              Fornec.
            </Link>

            <Link href="/admin/clientes" className="rounded-2xl px-2 py-2">
              Clientes
            </Link>

            <Link
              href="/admin/seguranca"
              className="rounded-2xl bg-[#151515] px-2 py-2 text-white"
            >
              Segur.
            </Link>
          </div>
        </nav>
      </div>
    </main>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="mb-3 mt-6 flex items-center justify-between">
      <h2 className="text-base font-black">{title}</h2>
    </div>
  );
}

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-[18px] bg-white px-2 py-3 text-center shadow-sm ring-1 ring-[#f1e7cf]">
      <p className="text-lg font-black">{value}</p>
      <p className="mt-0.5 text-[10px] font-extrabold text-gray-500">{label}</p>
    </div>
  );
}

function DataCard({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: number | string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-[20px] bg-white p-3 shadow-sm ring-1 ring-[#f1e7cf]">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[#fff7e8] text-[#d99200]">
        {icon}
      </div>

      <div>
        <p className="text-lg font-black leading-none">{value}</p>
        <p className="mt-1 text-[10px] font-bold text-gray-500">{title}</p>
      </div>
    </div>
  );
}
