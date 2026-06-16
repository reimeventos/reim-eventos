'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Bell,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  MessageCircle,
  Search,
  ShieldCheck,
  Trash2,
  User,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function OrcamentosPage() {
  const [orcamentos, setOrcamentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  async function loadOrcamentos() {
    try {
      setLoading(true);
      setErrorMessage('');
      setSuccessMessage('');

      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!user) {
        setOrcamentos([]);
        setErrorMessage('Faça login para ver seus orçamentos.');
        return;
      }

      const { data, error } = await supabase
        .from('quote_requests')
        .select(`
          *,
          suppliers(
            id,
            business_name,
            city,
            categories(name)
          ),
          quote_responses(
            id,
            status,
            service_offered,
            duration_period,
            proposal_value,
            payment_terms,
            proposal_validity,
            observations,
            adjustment_notes,
            adjustment_requested_at,
            created_at
          ),
          quote_messages(
            id,
            sender_type,
            read_by_client,
            read_by_supplier,
            created_at
          )
        `)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOrcamentos(data || []);
    } catch (error) {
      console.error('Erro ao carregar orçamentos:', error);
      setErrorMessage('Não foi possível carregar seus orçamentos.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrcamentos();
  }, []);

  async function handleDeleteOrcamento(orcamentoId: string) {
    const confirmed = window.confirm(
      'Deseja excluir este orçamento? Essa ação removerá a solicitação, mensagens e proposta vinculada.'
    );

    if (!confirmed) return;

    try {
      setDeletingId(orcamentoId);
      setErrorMessage('');
      setSuccessMessage('');

      const { error: messagesError } = await supabase
        .from('quote_messages')
        .delete()
        .eq('quote_request_id', orcamentoId);

      if (messagesError) throw messagesError;

      const { error: responsesError } = await supabase
        .from('quote_responses')
        .delete()
        .eq('quote_request_id', orcamentoId);

      if (responsesError) throw responsesError;

      const { error: requestError } = await supabase
        .from('quote_requests')
        .delete()
        .eq('id', orcamentoId);

      if (requestError) throw requestError;

      setOrcamentos((current) =>
        current.filter((item) => item.id !== orcamentoId)
      );

      setSuccessMessage('Orçamento excluído com sucesso.');
    } catch (error: any) {
      console.error('Erro ao excluir orçamento:', error);
      setErrorMessage(
        error?.message ||
          'Não foi possível excluir este orçamento. Verifique as permissões no Supabase.'
      );
    } finally {
      setDeletingId('');
    }
  }

  function formatDate(date?: string) {
    if (!date) return 'Data não informada';

    const [year, month, day] = date.split('-');

    if (!year || !month || !day) return date;

    return `${day}/${month}/${year}`;
  }

  function statusLabel(status?: string) {
    if (status === 'aguardando_resposta') return 'Aguardando';
    if (status === 'novo') return 'Aguardando';
    if (status === 'respondido') return 'Respondido';
    if (status === 'ajuste_solicitado') return 'Ajuste solicitado';
    if (status === 'aceito') return 'Aceito';
    if (status === 'fechado') return 'Fechado';
    return 'Aguardando';
  }

  function statusClass(status?: string) {
    if (status === 'respondido') return 'bg-green-50 text-green-700';

    if (status === 'ajuste_solicitado') {
      return 'bg-yellow-100 text-yellow-800';
    }

    if (status === 'aceito' || status === 'fechado') {
      return 'bg-green-100 text-green-700';
    }

    return 'bg-[#fff7e8] text-[#b97900]';
  }

  function getOriginInfo(item: any) {
    const role = item.created_by_role || 'cliente';
    const name = item.created_by_name || '';
    const email = item.created_by_email || '';

    if (role === 'cerimonialista') {
      return {
        label: 'Solicitado pela cerimonialista',
        detail: name || email || 'Cerimonialista',
        icon: ShieldCheck,
        className: 'bg-green-50 text-green-700 ring-green-100',
      };
    }

    return {
      label: 'Solicitado por você',
      detail: name || email || 'Cliente',
      icon: User,
      className: 'bg-[#fff7e8] text-[#b97900] ring-[#f1e7cf]',
    };
  }

  const totalUnreadMessages = orcamentos.reduce((total, item) => {
    const messages = item.quote_messages || [];

    const unread = messages.filter(
      (message: any) =>
        message.sender_type === 'fornecedor' &&
        message.read_by_client === false
    ).length;

    return total + unread;
  }, 0);

  const respondedCount = orcamentos.filter(
    (item) => item.status === 'respondido'
  ).length;

  const acceptedCount = orcamentos.filter(
    (item) => item.status === 'aceito' || item.status === 'fechado'
  ).length;

  const cerimonialistaCount = orcamentos.filter(
    (item) => item.created_by_role === 'cerimonialista'
  ).length;

  return (
    <main className="min-h-screen bg-black text-[#151515]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#fbf7f1] pb-24 shadow-2xl">
        <section className="relative overflow-hidden rounded-b-[34px] bg-black px-6 pb-8 pt-7 text-white">
          <div className="absolute inset-0 bg-[url('/layout01-fundo.png')] bg-cover bg-center opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/85 to-black" />

          <div className="relative z-10">
            <Link
              href="/perfil"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#e3a925]"
            >
              <ArrowLeft size={17} />
              Voltar
            </Link>

            <h1 className="mt-5 font-serif text-[34px] leading-tight">
              Meus Orçamentos
            </h1>

            <p className="mt-2 text-sm text-white/70">
              Acompanhe suas solicitações, propostas e mensagens.
            </p>
          </div>
        </section>

        <section className="grid grid-cols-3 gap-3 px-6 pt-6">
          <div className="rounded-[22px] bg-white p-4 text-center shadow-sm ring-1 ring-[#f1e7cf]">
            <p className="text-2xl font-extrabold text-[#d99200]">
              {orcamentos.length}
            </p>
            <p className="mt-1 text-[11px] font-bold text-gray-600">
              Pedidos
            </p>
          </div>

          <div className="rounded-[22px] bg-white p-4 text-center shadow-sm ring-1 ring-[#f1e7cf]">
            <p className="text-2xl font-extrabold text-green-600">
              {respondedCount}
            </p>
            <p className="mt-1 text-[11px] font-bold text-gray-600">
              Respondidos
            </p>
          </div>

          <div className="rounded-[22px] bg-white p-4 text-center shadow-sm ring-1 ring-[#f1e7cf]">
            <p className="text-2xl font-extrabold text-blue-600">
              {acceptedCount}
            </p>
            <p className="mt-1 text-[11px] font-bold text-gray-600">
              Aceitos
            </p>
          </div>
        </section>

        {cerimonialistaCount > 0 && (
          <section className="px-6 pt-4">
            <div className="flex items-start gap-3 rounded-[22px] bg-green-50 px-4 py-4 text-green-800 ring-1 ring-green-100">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-100">
                <ShieldCheck size={22} />
              </div>

              <div>
                <p className="text-sm font-extrabold">
                  {cerimonialistaCount === 1
                    ? '1 orçamento foi solicitado pela cerimonialista'
                    : `${cerimonialistaCount} orçamentos foram solicitados pela cerimonialista`}
                </p>
                <p className="mt-1 text-xs leading-5 text-green-700">
                  Esses pedidos foram enviados por uma cerimonialista autorizada no seu evento.
                </p>
              </div>
            </div>
          </section>
        )}

        {successMessage && (
          <section className="px-6 pt-4">
            <div className="flex items-center gap-2 rounded-2xl bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
              <CheckCircle2 size={18} />
              {successMessage}
            </div>
          </section>
        )}

        {totalUnreadMessages > 0 && (
          <section className="px-6 pt-4">
            <div className="flex items-center gap-3 rounded-[22px] bg-[#151515] px-4 py-4 text-white shadow-lg">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e3a925]">
                <Bell size={22} />
              </div>

              <div>
                <p className="text-sm font-extrabold">
                  {totalUnreadMessages === 1
                    ? '1 nova mensagem'
                    : `${totalUnreadMessages} novas mensagens`}
                </p>
                <p className="mt-1 text-xs text-white/70">
                  Abra o chat do orçamento para visualizar.
                </p>
              </div>
            </div>
          </section>
        )}

        <section className="px-6 pt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-extrabold">Solicitações</h2>

            <span className="rounded-full bg-[#fff7e8] px-3 py-1 text-xs font-extrabold text-[#b97900]">
              {loading ? 'Carregando...' : `${orcamentos.length} orçamento(s)`}
            </span>
          </div>

          {loading && (
            <div className="rounded-[28px] bg-white p-6 text-center shadow-sm ring-1 ring-[#f1e7cf]">
              <p className="text-sm font-bold text-gray-500">
                Carregando orçamentos...
              </p>
            </div>
          )}

          {!loading && errorMessage && (
            <div className="rounded-[28px] bg-red-50 p-6 text-center text-sm font-bold text-red-700 ring-1 ring-red-100">
              {errorMessage}
            </div>
          )}

          {!loading && !errorMessage && orcamentos.length === 0 && (
            <div className="rounded-[28px] bg-white p-6 text-center shadow-sm ring-1 ring-[#f1e7cf]">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#fff7e8] text-[#d99200]">
                <Search size={32} />
              </div>

              <h3 className="mt-4 text-lg font-extrabold">
                Nenhum orçamento ainda
              </h3>

              <p className="mt-2 text-sm leading-5 text-gray-500">
                Quando você solicitar orçamento a um fornecedor, ele aparecerá aqui.
              </p>

              <Link
                href="/buscar"
                className="mt-5 flex items-center justify-center gap-2 rounded-[22px] bg-[#e3a925] py-4 text-center font-extrabold text-white shadow-lg"
              >
                Buscar fornecedores
              </Link>
            </div>
          )}

          <div className="space-y-4">
            {orcamentos.map((item) => {
              const responses = item.quote_responses || [];
              const sortedResponses = [...responses].sort((a, b) => {
                return (
                  new Date(b.created_at).getTime() -
                  new Date(a.created_at).getTime()
                );
              });

              const latestResponse = sortedResponses[0] || null;

              const messages = item.quote_messages || [];
              const unreadMessages = messages.filter(
                (message: any) =>
                  message.sender_type === 'fornecedor' &&
                  message.read_by_client === false
              ).length;

              const hasUnreadMessages = unreadMessages > 0;

              const supplierName =
                item.suppliers?.business_name || 'Fornecedor';

              const supplierCity =
                item.suppliers?.city ||
                item.event_city ||
                'Cidade não informada';

              const supplierCategory =
                item.suppliers?.categories?.name ||
                item.service_needed ||
                'Fornecedor de eventos';

              const status = item.status || 'aguardando_resposta';
              const eventType = item.event_type || 'Evento não informado';
              const eventDate = formatDate(item.event_date);

              const serviceNeeded =
                item.service_needed ||
                latestResponse?.service_offered ||
                'Serviço não informado';

              const originInfo = getOriginInfo(item);
              const OriginIcon = originInfo.icon;

              return (
                <div
                  key={item.id}
                  className={
                    hasUnreadMessages
                      ? 'rounded-[28px] bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,.12)] ring-2 ring-[#e3a925]'
                      : 'rounded-[28px] bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,.08)]'
                  }
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-extrabold">{eventType}</h3>

                      <p className="mt-1 flex items-center gap-1 text-sm font-bold text-gray-500">
                        <Building2 size={15} className="text-[#d99200]" />
                        {supplierName}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {hasUnreadMessages && (
                        <span className="flex items-center gap-1 rounded-full bg-[#151515] px-3 py-1 text-[11px] font-extrabold text-white">
                          <Bell size={13} className="text-[#e3a925]" />
                          {unreadMessages === 1
                            ? '1 nova msg'
                            : `${unreadMessages} novas msg`}
                        </span>
                      )}

                      <span
                        className={`flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-extrabold ${statusClass(status)}`}
                      >
                        {status === 'respondido' ||
                        status === 'aceito' ||
                        status === 'fechado' ? (
                          <CheckCircle2 size={13} />
                        ) : (
                          <Clock size={13} />
                        )}
                        {statusLabel(status)}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`mt-4 rounded-2xl px-4 py-3 text-sm font-bold ring-1 ${originInfo.className}`}
                  >
                    <p className="flex items-center gap-2">
                      <OriginIcon size={17} />
                      {originInfo.label}
                    </p>

                    {originInfo.detail && (
                      <p className="mt-1 break-all text-xs font-bold opacity-80">
                        {originInfo.detail}
                      </p>
                    )}
                  </div>

                  {hasUnreadMessages && (
                    <div className="mt-4 rounded-2xl bg-[#151515] p-4 text-white">
                      <p className="flex items-center gap-2 text-xs font-extrabold text-[#f7d67b]">
                        <Bell size={15} />
                        Mensagem nova no chat
                      </p>

                      <p className="mt-2 text-sm leading-5 text-white/80">
                        O fornecedor enviou{' '}
                        {unreadMessages === 1
                          ? 'uma nova mensagem.'
                          : `${unreadMessages} novas mensagens.`}
                      </p>
                    </div>
                  )}

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-[#fbf7f1] p-3">
                      <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                        <CalendarDays size={14} className="text-[#d99200]" />
                        Data
                      </p>
                      <p className="mt-1 text-sm font-extrabold">
                        {eventDate}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#fbf7f1] p-3">
                      <p className="text-xs font-bold text-gray-500">
                        Cidade
                      </p>
                      <p className="mt-1 text-sm font-extrabold">
                        {supplierCity}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 rounded-2xl bg-[#fbf7f1] p-3">
                    <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                      <FileText size={14} className="text-[#d99200]" />
                      Serviço
                    </p>
                    <p className="mt-1 text-sm font-extrabold">
                      {serviceNeeded}
                    </p>
                  </div>

                  {supplierCategory && supplierCategory !== serviceNeeded && (
                    <div className="mt-3 rounded-2xl bg-[#fbf7f1] p-3">
                      <p className="text-xs font-bold text-gray-500">
                        Categoria
                      </p>
                      <p className="mt-1 text-sm font-extrabold">
                        {supplierCategory}
                      </p>
                    </div>
                  )}

                  {latestResponse && (
                    <div className="mt-3 rounded-2xl bg-[#fff7e8] p-4 ring-1 ring-[#f1e7cf]">
                      <p className="text-xs font-bold text-[#b97900]">
                        Última proposta
                      </p>

                      <p className="mt-1 text-2xl font-extrabold text-[#151515]">
                        {latestResponse.proposal_value || 'Valor não informado'}
                      </p>

                      <p className="mt-1 text-xs font-bold text-gray-500">
                        {latestResponse.payment_terms ||
                          'Forma de pagamento não informada'}
                      </p>
                    </div>
                  )}

                  <div className="mt-5 space-y-3">
                    <Link
                      href={`/orcamentos/${item.id}`}
                      className="flex items-center justify-center gap-2 rounded-[22px] bg-[#e3a925] py-4 text-center font-extrabold text-white shadow-lg"
                    >
                      <FileText size={21} />
                      {latestResponse ? 'Ver orçamento' : 'Aguardar resposta'}
                    </Link>

                    <Link
                      href={`/orcamentos/${item.id}/chat`}
                      className={
                        hasUnreadMessages
                          ? 'relative flex items-center justify-center gap-2 rounded-[22px] bg-black py-4 text-center font-extrabold text-white shadow-lg ring-2 ring-[#e3a925]'
                          : 'flex items-center justify-center gap-2 rounded-[22px] bg-black py-4 text-center font-extrabold text-white shadow-lg'
                      }
                    >
                      <MessageCircle size={21} />
                      Chat

                      {hasUnreadMessages && (
                        <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-[#e3a925] px-2 text-[11px] font-extrabold text-white">
                          {unreadMessages}
                        </span>
                      )}
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDeleteOrcamento(item.id)}
                      disabled={deletingId === item.id}
                      className="flex w-full items-center justify-center gap-2 rounded-[22px] bg-white py-4 text-center font-extrabold text-red-700 shadow-sm ring-1 ring-red-100 disabled:opacity-60"
                    >
                      <Trash2 size={21} />
                      {deletingId === item.id
                        ? 'Excluindo...'
                        : 'Excluir orçamento'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
