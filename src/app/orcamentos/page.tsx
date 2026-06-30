'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Bell,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  FileText,
  MapPin,
  MessageCircle,
  Send,
  Search,
  ShieldCheck,
  Trash2,
  User,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function OrcamentosPage() {
  const [orcamentos, setOrcamentos] = useState<any[]>([]);
  const [expandedOrcamentoId, setExpandedOrcamentoId] = useState('');
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

  function cityAttendanceText(city: string) {
    if (!city || city === 'Cidade não informada') {
      return 'Cidade do evento não informada';
    }

    return `Atendimento em ${city}`;
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
    if (status === 'respondido') return 'bg-blue-50 text-blue-700 ring-blue-100';

    if (status === 'ajuste_solicitado') {
      return 'bg-yellow-100 text-yellow-800 ring-yellow-200';
    }

    if (status === 'aceito' || status === 'fechado') {
      return 'bg-green-100 text-green-700 ring-green-200';
    }

    return 'bg-[#fff7e8] text-[#b97900] ring-[#f1e7cf]';
  }

  function statusIcon(status?: string) {
    if (status === 'aceito' || status === 'fechado') return CheckCircle2;
    if (status === 'respondido') return FileText;
    return Clock;
  }

  function getSupplierCategory(item: any) {
    const category = item.suppliers?.categories;

    if (Array.isArray(category)) {
      return category[0]?.name || item.service_needed || 'Fornecedor de eventos';
    }

    return category?.name || item.service_needed || 'Fornecedor de eventos';
  }

  function isBatchQuote(item: any) {
    const role = String(item.created_by_role || '').toLowerCase();
    const origin = String(
      item.origin || item.request_origin || item.source || item.created_origin || ''
    ).toLowerCase();
    const notes = String(item.notes || '').toLowerCase();

    return (
      role === 'cliente_lote' ||
      role === 'lote' ||
      origin === 'lote' ||
      origin === 'batch' ||
      item.sent_in_batch === true ||
      notes.includes('enviado em lote') ||
      notes.includes('orçamento para todos') ||
      notes.includes('orcamento para todos')
    );
  }

  function getOriginInfo(item: any) {
    const role = item.created_by_role || 'cliente';
    const name = item.created_by_name || '';
    const email = item.created_by_email || '';

    if (role === 'cerimonialista') {
      return {
        label: 'Cerimonialista',
        detail: name || email || 'Cerimonialista autorizada',
        icon: ShieldCheck,
        className: 'bg-green-50 text-green-700 ring-green-100',
      };
    }

    if (isBatchQuote(item)) {
      return {
        label: 'Enviado em lote',
        detail: 'Solicitar orçamento para todos',
        icon: Send,
        className: 'bg-blue-50 text-blue-700 ring-blue-100',
      };
    }

    return {
      label: 'Você',
      detail: name || email || 'Solicitado por você',
      icon: User,
      className: 'bg-[#fff7e8] text-[#b97900] ring-[#f1e7cf]',
    };
  }

  function getLatestResponse(item: any) {
    const responses = item.quote_responses || [];

    const sortedResponses = [...responses].sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return sortedResponses[0] || null;
  }

  function countUnreadMessages(item: any) {
    const messages = item.quote_messages || [];

    return messages.filter(
      (message: any) =>
        message.sender_type === 'fornecedor' &&
        message.read_by_client === false
    ).length;
  }

  const totalUnreadMessages = orcamentos.reduce((total, item) => {
    return total + countUnreadMessages(item);
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

  const batchCount = orcamentos.filter((item) => isBatchQuote(item)).length;

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

            <div className="mt-6">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#e3a925]">
                Meu Evento
              </p>

              <h1 className="mt-2 font-serif text-[34px] leading-tight">
                Meus Orçamentos
              </h1>

              <p className="mt-2 text-sm text-white/70">
                Acompanhe solicitações, propostas e mensagens em uma lista compacta.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="rounded-[20px] bg-white/10 p-3 text-center">
                <p className="text-2xl font-extrabold text-[#e3a925]">
                  {orcamentos.length}
                </p>
                <p className="mt-1 text-[10px] font-bold text-white/60">
                  Pedidos
                </p>
              </div>

              <div className="rounded-[20px] bg-white/10 p-3 text-center">
                <p className="text-2xl font-extrabold text-green-400">
                  {respondedCount}
                </p>
                <p className="mt-1 text-[10px] font-bold text-white/60">
                  Respondidos
                </p>
              </div>

              <div className="rounded-[20px] bg-white/10 p-3 text-center">
                <p className="text-2xl font-extrabold text-blue-400">
                  {acceptedCount}
                </p>
                <p className="mt-1 text-[10px] font-bold text-white/60">
                  Aceitos
                </p>
              </div>
            </div>
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

        {batchCount > 0 && (
          <section className="px-6 pt-4">
            <div className="flex items-start gap-3 rounded-[22px] bg-blue-50 px-4 py-4 text-blue-800 ring-1 ring-blue-100">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100">
                <Send size={22} />
              </div>

              <div>
                <p className="text-sm font-extrabold">
                  {batchCount === 1
                    ? '1 orçamento foi enviado em lote'
                    : `${batchCount} orçamentos foram enviados em lote`}
                </p>
                <p className="mt-1 text-xs leading-5 text-blue-700">
                  Esses pedidos vieram do botão “Solicitar orçamento para todos”.
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
                  Toque no orçamento e abra o chat para visualizar.
                </p>
              </div>
            </div>
          </section>
        )}

        <section className="px-6 pt-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold">Solicitações</h2>
              <p className="mt-1 text-xs font-bold text-gray-500">
                Toque em um orçamento para ver as ações.
              </p>
            </div>

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

          <div className="space-y-3">
            {orcamentos.map((item) => {
              const latestResponse = getLatestResponse(item);
              const unreadMessages = countUnreadMessages(item);
              const hasUnreadMessages = unreadMessages > 0;

              const supplierName = item.suppliers?.business_name || 'Fornecedor';
              const supplierCity = item.suppliers?.city || 'Cidade não informada';
              const eventCity = item.event_city || 'Cidade não informada';
              const supplierCategory = getSupplierCategory(item);

              const status = item.status || 'aguardando_resposta';
              const StatusIcon = statusIcon(status);
              const eventType = item.event_type || 'Evento não informado';
              const eventDate = formatDate(item.event_date);

              const serviceNeeded =
                item.service_needed ||
                latestResponse?.service_offered ||
                'Serviço não informado';

              const originInfo = getOriginInfo(item);
              const OriginIcon = originInfo.icon;
              const isExpanded = expandedOrcamentoId === item.id;
              const isAccepted = status === 'aceito' || status === 'fechado';

              return (
                <div
                  key={item.id}
                  className={
                    isAccepted
                      ? 'rounded-[24px] bg-white p-3 shadow-sm ring-2 ring-green-200'
                      : hasUnreadMessages
                        ? 'rounded-[24px] bg-white p-3 shadow-sm ring-2 ring-[#e3a925]'
                        : 'rounded-[24px] bg-white p-3 shadow-sm ring-1 ring-[#f1e7cf]'
                  }
                >
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedOrcamentoId(isExpanded ? '' : item.id)
                    }
                    className="flex w-full items-center gap-3 text-left"
                  >
                    <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-[18px] bg-[#151515] text-white">
                      <Building2 size={30} className="text-[#e3a925]" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="line-clamp-1 text-sm font-extrabold">
                          {supplierName}
                        </p>

                        {hasUnreadMessages && (
                          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#e3a925] px-1.5 text-[10px] font-extrabold text-white">
                            {unreadMessages}
                          </span>
                        )}
                      </div>

                      <p className="mt-1 line-clamp-1 text-xs font-bold text-gray-500">
                        {eventType} • {eventCity}
                      </p>

                      <p className="mt-0.5 line-clamp-1 text-[11px] font-bold text-gray-400">
                        {supplierCategory}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span
                          className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-extrabold ring-1 ${statusClass(status)}`}
                        >
                          <StatusIcon size={11} />
                          {statusLabel(status)}
                        </span>

                        <span className="flex items-center gap-1 rounded-full bg-[#fff7e8] px-2.5 py-1 text-[10px] font-extrabold text-[#b97900] ring-1 ring-[#f1e7cf]">
                          <MapPin size={11} />
                          {eventCity}
                        </span>

                        <span
                          className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-extrabold ring-1 ${originInfo.className}`}
                        >
                          <OriginIcon size={11} />
                          {originInfo.label}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isAccepted ? (
                        <CheckCircle2 size={22} className="text-green-600" />
                      ) : isExpanded ? (
                        <ChevronDown size={22} className="text-[#d99200]" />
                      ) : (
                        <ChevronRight size={22} className="text-gray-400" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="mt-4 rounded-[22px] bg-[#fbf7f1] p-4 ring-1 ring-[#f1e7cf]">
                      {hasUnreadMessages && (
                        <div className="mb-3 rounded-2xl bg-[#151515] p-4 text-white">
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

                      <div
                        className={`rounded-2xl px-4 py-3 text-sm font-bold ring-1 ${originInfo.className}`}
                      >
                        <p className="flex items-center gap-2">
                          <OriginIcon size={17} />
                          Origem: {originInfo.label}
                        </p>

                        {originInfo.detail && (
                          <p className="mt-1 break-all text-xs font-bold opacity-80">
                            {originInfo.detail}
                          </p>
                        )}
                      </div>

                      <div className="mt-4 rounded-2xl bg-[#151515] p-4 text-white">
                        <p className="flex items-center gap-2 text-xs font-extrabold text-[#f7d67b]">
                          <MapPin size={15} />
                          Cidade do evento
                        </p>

                        <p className="mt-2 text-lg font-extrabold">
                          {cityAttendanceText(eventCity)}
                        </p>

                        <p className="mt-1 text-xs leading-5 text-white/70">
                          Este pedido foi solicitado para essa cidade de atendimento.
                        </p>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded-2xl bg-white p-3">
                          <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                            <CalendarDays size={14} className="text-[#d99200]" />
                            Data
                          </p>
                          <p className="mt-1 text-sm font-extrabold">
                            {eventDate}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-white p-3">
                          <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                            <MapPin size={14} className="text-[#d99200]" />
                            Cidade do evento
                          </p>
                          <p className="mt-1 line-clamp-1 text-sm font-extrabold">
                            {eventCity}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 rounded-2xl bg-white p-3">
                        <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                          <FileText size={14} className="text-[#d99200]" />
                          Serviço
                        </p>
                        <p className="mt-1 text-sm font-extrabold">
                          {serviceNeeded}
                        </p>
                      </div>

                      <div className="mt-3 rounded-2xl bg-white p-3">
                        <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                          <Building2 size={14} className="text-[#d99200]" />
                          Cidade do fornecedor
                        </p>
                        <p className="mt-1 text-sm font-extrabold">
                          {supplierCity}
                        </p>
                      </div>

                      <div className="mt-3 rounded-2xl bg-white p-3">
                        <p className="text-xs font-bold text-gray-500">
                          Tipo de evento
                        </p>
                        <p className="mt-1 text-sm font-extrabold">
                          {eventType}
                        </p>
                      </div>

                      {latestResponse && (
                        <div className="mt-3 rounded-2xl bg-[#fff7e8] p-4 ring-1 ring-[#f1e7cf]">
                          <p className="text-xs font-bold text-[#b97900]">
                            Última proposta • {eventCity}
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

                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <Link
                          href={`/orcamentos/${item.id}`}
                          className="flex items-center justify-center gap-2 rounded-[18px] bg-[#e3a925] py-3 text-center text-sm font-extrabold text-white shadow-lg"
                        >
                          <FileText size={16} />
                          {latestResponse ? 'Ver orçamento' : 'Aguardar'}
                        </Link>

                        <Link
                          href={`/orcamentos/${item.id}/chat`}
                          className={
                            hasUnreadMessages
                              ? 'relative flex items-center justify-center gap-2 rounded-[18px] bg-black py-3 text-center text-sm font-extrabold text-white shadow-lg ring-2 ring-[#e3a925]'
                              : 'flex items-center justify-center gap-2 rounded-[18px] bg-black py-3 text-center text-sm font-extrabold text-white shadow-lg'
                          }
                        >
                          <MessageCircle size={16} />
                          Chat

                          {hasUnreadMessages && (
                            <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-[#e3a925] px-2 text-[11px] font-extrabold text-white">
                              {unreadMessages}
                            </span>
                          )}
                        </Link>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteOrcamento(item.id)}
                        disabled={deletingId === item.id}
                        className="mt-3 flex w-full items-center justify-center gap-2 rounded-[18px] bg-white py-3 text-center text-sm font-extrabold text-red-700 ring-1 ring-red-100 disabled:opacity-60"
                      >
                        <Trash2 size={16} />
                        {deletingId === item.id
                          ? 'Excluindo...'
                          : 'Excluir orçamento'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
