'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Crown,
  FileText,
  Loader2,
  Search,
  ShieldCheck,
  UserCog,
  XCircle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

type AuditLog = {
  id: string;
  admin_id: string | null;
  admin_email: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  supplier_id: string | null;
  subscription_id: string | null;
  description: string | null;
  old_data: any | null;
  new_data: any | null;
  created_at: string;
};

function formatDateTime(value?: string | null) {
  if (!value) return 'Sem data';

  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
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

function getActionLabel(action: string) {
  if (action === 'subscription_approved') return 'Assinatura aprovada';
  if (action === 'subscription_cancelled') return 'Assinatura cancelada';
  if (action === 'subscription_expired') return 'Assinatura expirada';
  if (action === 'subscription_featured_on') return 'Destaque ativado';
  if (action === 'subscription_featured_off') return 'Destaque removido';
  if (action === 'supplier_status_changed') return 'Status do fornecedor';
  if (action === 'admin_login') return 'Login admin';
  return action;
}

function getActionIcon(action: string) {
  if (action.includes('approved') || action.includes('on')) {
    return <CheckCircle2 size={19} />;
  }

  if (action.includes('cancelled') || action.includes('expired') || action.includes('off')) {
    return <XCircle size={19} />;
  }

  if (action.includes('subscription')) {
    return <Crown size={19} />;
  }

  return <ClipboardList size={19} />;
}

export default function AdminAuditoriaPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('todas');

  useEffect(() => {
    loadLogs();
  }, []);

  async function loadLogs() {
    try {
      setLoading(true);
      setErrorMessage('');

      const { data, error } = await supabase
        .from('admin_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        throw error;
      }

      setLogs((data || []) as AuditLog[]);
    } catch (error: any) {
      console.error('Erro ao carregar auditoria:', error);
      setErrorMessage(
        error?.message ||
          'Não foi possível carregar a auditoria. Confira se a tabela admin_audit_logs foi criada.'
      );
    } finally {
      setLoading(false);
    }
  }

  const actions = useMemo(() => {
    return Array.from(new Set(logs.map((log) => log.action))).sort();
  }, [logs]);

  const filteredLogs = useMemo(() => {
    const term = normalizeText(search);

    return logs.filter((log) => {
      const matchAction = actionFilter === 'todas' || log.action === actionFilter;

      const content = normalizeText(
        [
          log.admin_email,
          log.action,
          getActionLabel(log.action),
          log.entity_type,
          log.description,
          log.supplier_id,
          log.subscription_id,
        ]
          .filter(Boolean)
          .join(' ')
      );

      const matchSearch = !term || content.includes(term);

      return matchAction && matchSearch;
    });
  }, [logs, search, actionFilter]);

  const stats = useMemo(() => {
    return {
      total: logs.length,
      approvals: logs.filter((log) => log.action === 'subscription_approved').length,
      cancellations: logs.filter((log) => log.action === 'subscription_cancelled').length,
      expirations: logs.filter((log) => log.action === 'subscription_expired').length,
    };
  }, [logs]);

  return (
    <main className="min-h-screen bg-black text-[#151515]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#f7f2ea] pb-24 shadow-2xl">
        <section className="relative overflow-hidden rounded-b-[28px] bg-black px-5 pb-5 pt-5 text-white">
          <div className="absolute inset-0 bg-[url('/layout01-fundo.png')] bg-cover bg-center opacity-35" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/90 to-black" />

          <div className="relative z-10">
            <Link
              href="/admin/seguranca"
              className="inline-flex items-center gap-2 text-xs font-black text-[#e3a925]"
            >
              <ArrowLeft size={16} />
              Voltar à Segurança
            </Link>

            <div className="mt-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e3a925] text-white shadow-lg">
                <ClipboardList size={27} />
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#e3a925]">
                  Área Administrativa
                </p>

                <h1 className="font-serif text-[28px] leading-tight">
                  Auditoria
                </h1>

                <p className="mt-1 text-xs font-bold text-white/65">
                  Histórico de ações críticas do Admin.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 pt-5">
          <div className="grid grid-cols-4 gap-2">
            <MiniStat label="Total" value={stats.total} />
            <MiniStat label="Aprov." value={stats.approvals} />
            <MiniStat label="Cancel." value={stats.cancellations} />
            <MiniStat label="Expir." value={stats.expirations} />
          </div>

          <div className="mt-4 flex items-center rounded-[22px] bg-white px-4 py-3 shadow-sm ring-1 ring-[#f1e7cf]">
            <Search size={19} className="shrink-0 text-[#d99200]" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar ação, admin, descrição..."
              className="ml-3 w-full bg-transparent text-sm font-bold outline-none placeholder:text-gray-400"
            />
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setActionFilter('todas')}
              className={
                actionFilter === 'todas'
                  ? 'shrink-0 rounded-full bg-[#151515] px-4 py-2 text-xs font-black text-white'
                  : 'shrink-0 rounded-full bg-white px-4 py-2 text-xs font-black text-gray-500 ring-1 ring-[#f1e7cf]'
              }
            >
              Todas
            </button>

            {actions.map((action) => (
              <button
                key={action}
                type="button"
                onClick={() => setActionFilter(action)}
                className={
                  actionFilter === action
                    ? 'shrink-0 rounded-full bg-[#151515] px-4 py-2 text-xs font-black text-white'
                    : 'shrink-0 rounded-full bg-white px-4 py-2 text-xs font-black text-gray-500 ring-1 ring-[#f1e7cf]'
                }
              >
                {getActionLabel(action)}
              </button>
            ))}
          </div>

          {loading && (
            <div className="mt-5 rounded-[24px] bg-white p-5 text-center shadow-sm ring-1 ring-[#f1e7cf]">
              <Loader2 className="mx-auto animate-spin text-[#d99200]" size={30} />
              <p className="mt-3 text-sm font-bold text-gray-500">
                Carregando auditoria...
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
                  Registros encontrados
                </h2>

                <span className="rounded-full bg-white px-3 py-1 text-[11px] font-black text-gray-500 ring-1 ring-[#f1e7cf]">
                  {filteredLogs.length}
                </span>
              </div>

              {filteredLogs.length === 0 ? (
                <div className="rounded-[24px] bg-white p-5 text-center shadow-sm ring-1 ring-[#f1e7cf]">
                  <ShieldCheck className="mx-auto text-[#d99200]" size={32} />
                  <p className="mt-3 text-sm font-black">
                    Nenhum registro encontrado
                  </p>
                  <p className="mt-1 text-xs font-bold leading-5 text-gray-500">
                    Quando o Admin aprovar, cancelar ou expirar assinaturas,
                    os registros aparecerão aqui.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredLogs.map((log) => (
                    <article
                      key={log.id}
                      className="rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-[#f1e7cf]"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#fff7e8] text-[#d99200]">
                          {getActionIcon(log.action)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-sm font-black">
                              {getActionLabel(log.action)}
                            </h3>

                            <span className="shrink-0 rounded-full bg-[#fbf7f1] px-2 py-1 text-[9px] font-black uppercase text-gray-500 ring-1 ring-[#f1e7cf]">
                              {log.entity_type}
                            </span>
                          </div>

                          <p className="mt-1 text-xs font-bold leading-5 text-gray-500">
                            {log.description || 'Sem descrição.'}
                          </p>

                          <div className="mt-3 grid gap-2 rounded-[18px] bg-[#fbf7f1] p-3 text-[10px] font-bold text-gray-500 ring-1 ring-[#f1e7cf]">
                            <p className="flex items-center gap-2">
                              <UserCog size={13} className="text-[#d99200]" />
                              {log.admin_email || 'Admin não identificado'}
                            </p>

                            <p className="flex items-center gap-2">
                              <CalendarClock size={13} className="text-[#d99200]" />
                              {formatDateTime(log.created_at)}
                            </p>

                            {log.subscription_id && (
                              <p className="flex items-center gap-2 break-all">
                                <FileText size={13} className="text-[#d99200]" />
                                Assinatura: {log.subscription_id}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
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

            <Link href="/admin/seguranca" className="rounded-2xl px-2 py-2">
              Segur.
            </Link>

            <Link
              href="/admin/auditoria"
              className="rounded-2xl bg-[#151515] px-2 py-2 text-white"
            >
              Auditoria
            </Link>

            <Link href="/admin/relatorios" className="rounded-2xl px-2 py-2">
              Relat.
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
