'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  Loader2,
  Mail,
  MapPin,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
  Phone,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

type ClientProfile = {
  id: string;
  email: string | null;
  full_name: string | null;
  whatsapp: string | null;
  city: string | null;
  role?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
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

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export default function AdminClientesPage() {
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadClients();
  }, []);

  async function loadClients() {
    try {
      setLoading(true);
      setErrorMessage('');

      const { data, error } = await supabase
        .from('profiles')
        .select('id,email,full_name,whatsapp,city,role,created_at,updated_at')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setClients((data || []) as ClientProfile[]);
    } catch (error: any) {
      console.error('Erro ao carregar clientes:', error);
      setErrorMessage(
        error?.message || 'Não foi possível carregar os clientes cadastrados.'
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredClients = useMemo(() => {
    const term = normalizeText(search);

    if (!term) return clients;

    return clients.filter((client) => {
      const content = normalizeText(
        [
          client.full_name,
          client.email,
          client.whatsapp,
          client.city,
          client.role,
        ]
          .filter(Boolean)
          .join(' ')
      );

      return content.includes(term);
    });
  }, [clients, search]);

  const stats = useMemo(() => {
    const admins = clients.filter((client) => {
      const role = String(client.role || '').toLowerCase();
      return role === 'admin' || role === 'administrador';
    }).length;

    const withWhatsapp = clients.filter((client) =>
      String(client.whatsapp || '').trim()
    ).length;

    const withCity = clients.filter((client) =>
      String(client.city || '').trim()
    ).length;

    return {
      total: clients.length,
      admins,
      withWhatsapp,
      withCity,
    };
  }, [clients]);

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
                <Users size={27} />
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#e3a925]">
                  Área Administrativa
                </p>

                <h1 className="font-serif text-[28px] leading-tight">
                  Clientes
                </h1>

                <p className="mt-1 text-xs font-bold text-white/65">
                  Cadastros e contatos dos usuários.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 pt-5">
          <div className="grid grid-cols-4 gap-2">
            <MiniStat label="Total" value={stats.total} />
            <MiniStat label="Admin" value={stats.admins} />
            <MiniStat label="WhatsApp" value={stats.withWhatsapp} />
            <MiniStat label="Cidade" value={stats.withCity} />
          </div>

          <div className="mt-4 flex items-center rounded-[22px] bg-white px-4 py-3 shadow-sm ring-1 ring-[#f1e7cf]">
            <Search size={19} className="shrink-0 text-[#d99200]" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nome, e-mail, WhatsApp..."
              className="ml-3 w-full bg-transparent text-sm font-bold outline-none placeholder:text-gray-400"
            />
          </div>

          {loading && (
            <div className="mt-5 rounded-[24px] bg-white p-5 text-center shadow-sm ring-1 ring-[#f1e7cf]">
              <Loader2 className="mx-auto animate-spin text-[#d99200]" size={30} />
              <p className="mt-3 text-sm font-bold text-gray-500">
                Carregando clientes...
              </p>
            </div>
          )}

          {!loading && errorMessage && (
            <div className="mt-5 rounded-[22px] bg-red-50 p-4 text-sm font-bold leading-5 text-red-700 ring-1 ring-red-100">
              {errorMessage}
            </div>
          )}

          {!loading && !errorMessage && (
            <>
              <div className="mb-3 mt-6 flex items-center justify-between">
                <h2 className="text-base font-black">
                  Cadastros encontrados
                </h2>

                <span className="rounded-full bg-white px-3 py-1 text-[11px] font-black text-gray-500 ring-1 ring-[#f1e7cf]">
                  {filteredClients.length}
                </span>
              </div>

              {filteredClients.length === 0 ? (
                <div className="rounded-[24px] bg-white p-5 text-center shadow-sm ring-1 ring-[#f1e7cf]">
                  <UserCheck className="mx-auto text-[#d99200]" size={32} />
                  <p className="mt-3 text-sm font-black">
                    Nenhum cliente encontrado
                  </p>
                  <p className="mt-1 text-xs font-bold leading-5 text-gray-500">
                    Tente buscar por outro nome, e-mail ou cidade.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredClients.map((client) => {
                    const role = String(client.role || '').toLowerCase();
                    const isAdmin = role === 'admin' || role === 'administrador';

                    return (
                      <article
                        key={client.id}
                        className="rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-[#f1e7cf]"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={
                              isAdmin
                                ? 'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#151515] text-[#e3a925]'
                                : 'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#fff7e8] text-[#d99200]'
                            }
                          >
                            {isAdmin ? <ShieldCheck size={22} /> : <UserCheck size={22} />}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="truncate text-sm font-black">
                                {client.full_name || 'Nome não informado'}
                              </h3>

                              {isAdmin && (
                                <span className="shrink-0 rounded-full bg-[#151515] px-2 py-1 text-[9px] font-black uppercase text-[#e3a925]">
                                  Admin
                                </span>
                              )}
                            </div>

                            <InfoLine
                              icon={<Mail size={14} />}
                              text={client.email || 'E-mail não informado'}
                            />

                            <InfoLine
                              icon={<Phone size={14} />}
                              text={client.whatsapp || 'WhatsApp não informado'}
                            />

                            <InfoLine
                              icon={<MapPin size={14} />}
                              text={client.city || 'Cidade não informada'}
                            />

                            <div className="mt-3 flex items-center justify-between gap-3 rounded-[18px] bg-[#fbf7f1] px-3 py-2 text-[11px] font-bold text-gray-500 ring-1 ring-[#f1e7cf]">
                              <span className="flex items-center gap-1">
                                <CalendarDays size={13} />
                                Cadastro: {formatDate(client.created_at)}
                              </span>

                              <ChevronRight size={15} className="text-[#d99200]" />
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </section>

        <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-[430px] -translate-x-1/2 border-t border-[#f1e7cf] bg-white/95 px-4 py-3 shadow-[0_-8px_25px_rgba(0,0,0,.08)] backdrop-blur">
          <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-extrabold text-gray-500">
            <Link href="/admin" className="rounded-2xl px-2 py-2">
              Admin
            </Link>

            <Link href="/admin/assinaturas" className="rounded-2xl px-2 py-2">
              Aprovar
            </Link>

            <Link href="/admin/fornecedores" className="rounded-2xl px-2 py-2">
              Fornec.
            </Link>

            <Link
              href="/admin/clientes"
              className="rounded-2xl bg-[#151515] px-2 py-2 text-white"
            >
              Clientes
            </Link>
          </div>
        </nav>
      </div>
    </main>
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

function InfoLine({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <p className="mt-1 flex items-center gap-2 truncate text-[11px] font-bold text-gray-500">
      <span className="shrink-0 text-[#d99200]">{icon}</span>
      <span className="truncate">{text}</span>
    </p>
  );
}
