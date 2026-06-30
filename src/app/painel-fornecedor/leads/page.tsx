'use client';

import { useEffect, useState } from 'react';
import { getSupplierLeads } from '@/lib/suppliers';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import {
  ArrowLeft,
  AlertCircle,
  Bell,
  Building2,
  CalendarDays,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  FileText,
  MapPin,
  MessageCircle,
  PartyPopper,
  Phone,
  RefreshCcw,
  ShieldCheck,
  Store,
  User,
  Users,
} from 'lucide-react';

export default function LeadsFornecedorPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [expandedLeadId, setExpandedLeadId] = useState('');
  const [loading, setLoading] = useState(true);
  const [markingSeenId, setMarkingSeenId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  async function loadLeads() {
    try {
      setLoading(true);
      setErrorMessage('');

      const data = await getSupplierLeads();
      setLeads(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar leads:', error);
      setErrorMessage(
        error?.message ||
          'Não foi possível carregar os leads. Verifique se você está logado como fornecedor.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLeads();
  }, []);

  function formatDate(date?: string) {
    if (!date) return 'Data não informada';

    const [year, month, day] = date.split('-');

    if (!year || !month || !day) return date;

    return `${day}/${month}/${year}`;
  }

  function statusLabel(status: string) {
    if (status === 'novo') return 'Novo';
    if (status === 'aguardando_resposta') return 'Novo';
    if (status === 'respondido') return 'Respondido';
    if (status === 'ajuste_solicitado') return 'Ajuste solicitado';
    if (status === 'aceito') return 'Aceito';
    if (status === 'fechado') return 'Fechado';

    return status || 'Novo';
  }

  function statusClass(status: string) {
    if (status === 'ajuste_solicitado') {
      return 'bg-yellow-100 text-yellow-800 ring-yellow-200';
    }

    if (status === 'aceito' || status === 'fechado') {
      return 'bg-green-100 text-green-700 ring-green-200';
    }

    if (status === 'respondido') {
      return 'bg-blue-50 text-blue-700 ring-blue-100';
    }

    return 'bg-[#fff7e8] text-[#b97900] ring-[#f1e7cf]';
  }

  function statusIcon(status: string) {
    if (status === 'aceito' || status === 'fechado') return CheckCircle2;
    if (status === 'ajuste_solicitado') return AlertCircle;
    if (status === 'respondido') return FileText;
    return Clock;
  }

  function isNewLeadStatus(status: string) {
    return status === 'novo' || status === 'aguardando_resposta' || !status;
  }

  function cityAttendanceLabel(city: string) {
    if (!city || city === 'Cidade não informada') {
      return 'Cidade não informada';
    }

    return `Atendimento em ${city}`;
  }

  function isSpaceService(service: string) {
    const normalized = String(service || '').toLowerCase();

    return (
      normalized.includes('espaço') ||
      normalized.includes('espaco') ||
      normalized.includes('local') ||
      normalized.includes('salão') ||
      normalized.includes('salao')
    );
  }

  function isCerimonialistaCategory(category: string) {
    const normalized = String(category || '').toLowerCase();

    return (
      normalized.includes('cerimonial') ||
      normalized.includes('cerimonialista') ||
      normalized.includes('assessoria')
    );
  }

  function getSupplierName(lead: any) {
    if (Array.isArray(lead.suppliers)) {
      return lead.suppliers[0]?.business_name || 'Fornecedor não informado';
    }

    return lead.suppliers?.business_name || 'Fornecedor não informado';
  }

  function getSupplierCategory(lead: any) {
    const supplier = Array.isArray(lead.suppliers)
      ? lead.suppliers[0]
      : lead.suppliers;

    if (Array.isArray(supplier?.categories)) {
      return supplier.categories[0]?.name || '';
    }

    return supplier?.categories?.name || '';
  }

  function getOriginInfo(lead: any) {
    const role = lead.created_by_role || 'cliente';
    const name = lead.created_by_name || '';
    const email = lead.created_by_email || '';

    if (role === 'cerimonialista') {
      return {
        label: 'Cerimonialista',
        title: 'Solicitado pela cerimonialista',
        detail: name || email || 'Cerimonialista',
        description:
          'Este pedido foi enviado por uma cerimonialista autorizada pela cliente.',
        icon: ShieldCheck,
        boxClass: 'bg-green-50 text-green-800 ring-green-100',
        iconClass: 'text-green-700',
      };
    }

    if (role === 'cliente_lote') {
      return {
        label: 'Lote',
        title: 'Enviado em lote pela cliente',
        detail: name || email || lead.customer_name || 'Cliente',
        description:
          'Este pedido veio do botão “Solicitar orçamento para todos”.',
        icon: FileText,
        boxClass: 'bg-blue-50 text-blue-800 ring-blue-100',
        iconClass: 'text-blue-700',
      };
    }

    return {
      label: 'Cliente',
      title: 'Solicitado pela cliente',
      detail: name || email || lead.customer_name || 'Cliente',
      description: 'Este pedido foi enviado diretamente pela cliente.',
      icon: User,
      boxClass: 'bg-[#fff7e8] text-[#7a5200] ring-[#f1e7cf]',
      iconClass: 'text-[#d99200]',
    };
  }

  function isUnreadForSupplier(message: any) {
    return (
      message.read_by_supplier === false &&
      (message.sender_type === 'cliente' ||
        message.sender_type === 'cerimonialista')
    );
  }

  function unreadSenderText(messages: any[]) {
    const unreadMessages = messages.filter(isUnreadForSupplier);

    const hasClient = unreadMessages.some(
      (message: any) => message.sender_type === 'cliente'
    );

    const hasCerimonialista = unreadMessages.some(
      (message: any) => message.sender_type === 'cerimonialista'
    );

    if (hasClient && hasCerimonialista) {
      return 'A cliente e a cerimonialista enviaram';
    }

    if (hasCerimonialista) {
      return 'A cerimonialista enviou';
    }

    return 'A cliente enviou';
  }

  async function handleMarkSeen(leadId: string) {
    try {
      setMarkingSeenId(leadId);
      setErrorMessage('');

      const { error } = await supabase
        .from('quote_messages')
        .update({ read_by_supplier: true })
        .eq('quote_request_id', leadId)
        .eq('read_by_supplier', false);

      if (error) throw error;

      setLeads((current) =>
        current.map((lead) => {
          if (lead.id !== leadId) return lead;

          const updatedMessages = (lead.quote_messages || []).map(
            (message: any) => ({
              ...message,
              read_by_supplier: true,
            })
          );

          return {
            ...lead,
            quote_messages: updatedMessages,
          };
        })
      );
    } catch (error: any) {
      console.error('Erro ao marcar mensagens como vistas:', error);
      setErrorMessage(
        error?.message || 'Não foi possível marcar as mensagens como vistas.'
      );
    } finally {
      setMarkingSeenId('');
    }
  }

  const newCount = leads.filter(
    (lead) => lead.status === 'novo' || lead.status === 'aguardando_resposta'
  ).length;

  const adjustmentCount = leads.filter(
    (lead) => lead.status === 'ajuste_solicitado'
  ).length;

  const closedCount = leads.filter(
    (lead) => lead.status === 'aceito' || lead.status === 'fechado'
  ).length;

  const cerimonialistaCount = leads.filter(
    (lead) => lead.created_by_role === 'cerimonialista'
  ).length;

  const batchCount = leads.filter(
    (lead) => lead.created_by_role === 'cliente_lote'
  ).length;

  const totalUnreadMessages = leads.reduce((total, lead) => {
    const messages = lead.quote_messages || [];
    const unread = messages.filter(isUnreadForSupplier).length;

    return total + unread;
  }, 0);

  return (
    <main className="min-h-screen bg-black text-[#151515]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#fbf7f1] pb-10 shadow-2xl">
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

            <p className="mt-6 text-xs font-bold uppercase tracking-[0.25em] text-[#e3a925]">
              Painel do fornecedor
            </p>

            <h1 className="mt-2 font-serif text-[34px] leading-tight">
              Leads recebidos
            </h1>

            <p className="mt-2 text-sm text-white/70">
              Pedidos de orçamento enviados pelos clientes e cerimonialistas autorizadas.
            </p>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-white/10 p-3 text-center">
                <p className="text-2xl font-extrabold text-[#e3a925]">
                  {newCount}
                </p>
                <p className="mt-1 text-[10px] font-bold text-white/60">
                  Novos
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 p-3 text-center">
                <p className="text-2xl font-extrabold text-yellow-300">
                  {adjustmentCount}
                </p>
                <p className="mt-1 text-[10px] font-bold text-white/60">
                  Ajustes
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 p-3 text-center">
                <p className="text-2xl font-extrabold text-green-300">
                  {closedCount}
                </p>
                <p className="mt-1 text-[10px] font-bold text-white/60">
                  Aceitos
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 pt-4">
          <div className="flex items-start gap-3 rounded-[22px] bg-[#fff7e8] px-4 py-4 text-[#7a5200] ring-1 ring-[#f1e7cf]">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f7d67b]">
              <MapPin size={22} />
            </div>

            <div>
              <p className="text-sm font-extrabold">
                Leads por cidade de atendimento
              </p>

              <p className="mt-1 text-xs leading-5">
                Os pedidos aparecem conforme as cidades que você marcou em Editar vitrine.
              </p>

              <Link
                href="/painel-fornecedor/editar"
                className="mt-3 inline-flex rounded-full bg-black px-4 py-2 text-xs font-extrabold text-white"
              >
                Editar cidades
              </Link>
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
                    ? '1 lead veio de cerimonialista'
                    : `${cerimonialistaCount} leads vieram de cerimonialista`}
                </p>

                <p className="mt-1 text-xs leading-5 text-green-700">
                  Pedidos enviados em nome da cliente por cerimonialistas autorizadas.
                </p>
              </div>
            </div>
          </section>
        )}

        {batchCount > 0 && (
          <section className="px-6 pt-4">
            <div className="flex items-start gap-3 rounded-[22px] bg-blue-50 px-4 py-4 text-blue-800 ring-1 ring-blue-100">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100">
                <FileText size={22} />
              </div>

              <div>
                <p className="text-sm font-extrabold">
                  {batchCount === 1
                    ? '1 lead veio de envio em lote'
                    : `${batchCount} leads vieram de envio em lote`}
                </p>

                <p className="mt-1 text-xs leading-5 text-blue-700">
                  Pedidos enviados usando “Solicitar orçamento para todos”.
                </p>
              </div>
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
                  Abra o chat do orçamento ou marque como visto.
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
                Toque em um lead para ver detalhes e ações.
              </p>
            </div>

            <button
              type="button"
              onClick={loadLeads}
              className="rounded-full bg-[#fff7e8] px-3 py-1 text-xs font-extrabold text-[#b97900]"
            >
              {loading ? 'Carregando...' : `${leads.length} lead(s)`}
            </button>
          </div>

          {errorMessage && (
            <div className="mb-4 rounded-[22px] bg-red-50 p-4 text-sm font-bold leading-5 text-red-700 ring-1 ring-red-100">
              {errorMessage}
            </div>
          )}

          {loading && (
            <div className="rounded-[28px] bg-white p-6 text-center shadow-sm ring-1 ring-[#f1e7cf]">
              <p className="text-sm font-bold text-gray-500">
                Carregando leads...
              </p>
            </div>
          )}

          {!loading && !errorMessage && leads.length === 0 && (
            <div className="rounded-[28px] bg-white p-6 text-center shadow-sm ring-1 ring-[#f1e7cf]">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#fff7e8] text-[#d99200]">
                <MessageCircle size={32} />
              </div>

              <h3 className="mt-4 text-lg font-extrabold">
                Nenhum lead recebido ainda
              </h3>

              <p className="mt-2 text-sm leading-5 text-gray-500">
                Quando uma cliente ou cerimonialista autorizada solicitar orçamento, o pedido aparecerá aqui.
              </p>
            </div>
          )}

          <div className="space-y-3">
            {leads.map((lead) => {
              const supplierName = getSupplierName(lead);
              const supplierCategory = getSupplierCategory(lead);

              const clientName = lead.customer_name || 'Cliente não informado';
              const phone = lead.customer_whatsapp || 'WhatsApp não informado';
              const eventType = lead.event_type || 'Evento não informado';
              const serviceNeeded =
                lead.service_needed || supplierCategory || 'Serviço não informado';
              const city = lead.event_city || 'Cidade não informada';
              const eventDate = formatDate(lead.event_date);
              const eventSpace = lead.event_space || 'Não informado';
              const guests = lead.guests_count || 'Não informado';
              const notes = lead.notes || 'Cliente não informou mensagem.';
              const status = lead.status || 'novo';
              const isNewLead = isNewLeadStatus(status);

              const originInfo = getOriginInfo(lead);
              const OriginIcon = originInfo.icon;
              const StatusIcon = statusIcon(status);

              const isAccepted = status === 'aceito' || status === 'fechado';
              const isCerimonialista = isCerimonialistaCategory(supplierCategory);

              const responses = lead.quote_responses || [];
              const latestResponse =
                responses.length > 0 ? responses[responses.length - 1] : null;

              const adjustmentNotes =
                latestResponse?.adjustment_notes || lead.adjustment_notes || '';

              const hasAdjustment = status === 'ajuste_solicitado';
              const messages = lead.quote_messages || [];
              const unreadMessages = messages.filter(isUnreadForSupplier).length;
              const hasUnreadMessages = unreadMessages > 0;
              const isExpanded = expandedLeadId === lead.id;

              const cardClass = isAccepted
                ? 'rounded-[24px] bg-white p-3 shadow-sm ring-2 ring-green-200'
                : hasAdjustment
                  ? 'rounded-[24px] bg-white p-3 shadow-sm ring-2 ring-yellow-200'
                  : hasUnreadMessages
                    ? 'rounded-[24px] bg-white p-3 shadow-sm ring-2 ring-[#e3a925]'
                    : 'rounded-[24px] bg-white p-3 shadow-sm ring-1 ring-[#f1e7cf]';

              return (
                <div key={lead.id} className={cardClass}>
                  <button
                    type="button"
                    onClick={() => setExpandedLeadId(isExpanded ? '' : lead.id)}
                    className="flex w-full items-center gap-3 text-left"
                  >
                    <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-[18px] bg-[#151515] text-white">
                      {hasUnreadMessages ? (
                        <Bell size={28} className="text-[#e3a925]" />
                      ) : isAccepted ? (
                        <CheckCircle2 size={28} className="text-green-400" />
                      ) : hasAdjustment ? (
                        <RefreshCcw size={28} className="text-yellow-300" />
                      ) : (
                        <MessageCircle size={28} className="text-[#e3a925]" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-extrabold">
                        {eventType}
                      </p>

                      <p className="mt-1 line-clamp-1 text-xs font-bold text-gray-500">
                        {clientName} • {city}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ring-1 ${statusClass(status)}`}
                        >
                          {statusLabel(status)}
                        </span>

                        {isNewLead && (
                          <span className="rounded-full bg-[#151515] px-2.5 py-1 text-[10px] font-extrabold text-white">
                            Novo lead
                          </span>
                        )}

                        <span className="rounded-full bg-[#fff7e8] px-2.5 py-1 text-[10px] font-extrabold text-[#7a5200] ring-1 ring-[#f1e7cf]">
                          {cityAttendanceLabel(city)}
                        </span>

                        <span className="rounded-full bg-gray-50 px-2.5 py-1 text-[10px] font-extrabold text-gray-600 ring-1 ring-gray-100">
                          {originInfo.label}
                        </span>

                        {hasUnreadMessages && (
                          <span className="rounded-full bg-[#151515] px-2.5 py-1 text-[10px] font-extrabold text-white">
                            {unreadMessages} msg
                          </span>
                        )}
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
                      <div className={`rounded-2xl p-4 ring-1 ${originInfo.boxClass}`}>
                        <p className="flex items-center gap-2 text-xs font-extrabold">
                          <OriginIcon size={16} className={originInfo.iconClass} />
                          Origem do lead
                        </p>

                        <p className="mt-2 text-sm font-extrabold">
                          {originInfo.title}
                        </p>

                        {originInfo.detail && (
                          <p className="mt-1 break-all text-xs font-bold opacity-80">
                            {originInfo.detail}
                          </p>
                        )}

                        <p className="mt-2 text-xs leading-5 opacity-80">
                          {originInfo.description}
                        </p>
                      </div>

                      <div className="mt-3 rounded-2xl bg-[#151515] p-4 text-white">
                        <p className="flex items-center gap-2 text-xs font-extrabold text-[#f7d67b]">
                          <Store size={15} />
                          Fornecedor destino
                        </p>

                        <p className="mt-2 text-base font-extrabold">
                          {supplierName}
                        </p>

                        {supplierCategory && (
                          <p className="mt-1 text-xs font-bold text-white/60">
                            {supplierCategory}
                          </p>
                        )}
                      </div>

                      <div className="mt-3 rounded-2xl bg-[#fff7e8] p-4 text-[#7a5200] ring-1 ring-[#f1e7cf]">
                        <p className="flex items-center gap-2 text-xs font-extrabold">
                          <MapPin size={15} />
                          Cidade de atendimento
                        </p>

                        <p className="mt-2 text-sm font-extrabold">
                          {cityAttendanceLabel(city)}
                        </p>

                        <p className="mt-1 text-xs leading-5">
                          Este lead foi enviado para atendimento nesta cidade do evento.
                        </p>
                      </div>

                      {isAccepted && (
                        <div className="mt-3 rounded-2xl bg-green-50 p-4 ring-1 ring-green-200">
                          <p className="flex items-center gap-2 text-xs font-extrabold text-green-800">
                            <CheckCircle2 size={15} />
                            Orçamento aceito pelo cliente
                          </p>

                          <p className="mt-2 text-sm leading-5 text-green-900">
                            Este orçamento foi aceito. Use o chat para alinhar os detalhes finais com o cliente.
                          </p>
                        </div>
                      )}

                      {isAccepted && isCerimonialista && (
                        <div className="mt-3 rounded-2xl bg-[#151515] p-4 text-white">
                          <p className="flex items-center gap-2 text-xs font-extrabold text-[#f7d67b]">
                            <ShieldCheck size={15} />
                            Atuando nesse evento
                          </p>

                          <p className="mt-2 text-sm leading-5 text-white/80">
                            O cliente autorizou este cerimonialista a atuar no evento dentro do REIM.
                          </p>
                        </div>
                      )}

                      {hasAdjustment && (
                        <div className="mt-3 rounded-2xl bg-yellow-50 p-4 ring-1 ring-yellow-200">
                          <p className="flex items-center gap-2 text-xs font-extrabold text-yellow-800">
                            <RefreshCcw size={15} />
                            Cliente solicitou ajuste
                          </p>

                          <p className="mt-2 text-sm leading-5 text-yellow-900">
                            {adjustmentNotes ||
                              'A cliente solicitou ajuste, mas não informou detalhes.'}
                          </p>
                        </div>
                      )}

                      {hasUnreadMessages && (
                        <div className="mt-3 rounded-2xl bg-[#151515] p-4 text-white">
                          <p className="flex items-center gap-2 text-xs font-extrabold text-[#f7d67b]">
                            <Bell size={15} />
                            Mensagem nova no chat
                          </p>

                          <p className="mt-2 text-sm leading-5 text-white/80">
                            {unreadSenderText(messages)}{' '}
                            {unreadMessages === 1
                              ? 'uma nova mensagem.'
                              : `${unreadMessages} novas mensagens.`}
                          </p>
                        </div>
                      )}

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded-2xl bg-white p-3">
                          <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                            <User size={14} className="text-[#d99200]" />
                            Cliente
                          </p>
                          <p className="mt-1 line-clamp-1 text-sm font-extrabold">
                            {clientName}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-white p-3">
                          <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                            <Phone size={14} className="text-[#d99200]" />
                            WhatsApp
                          </p>
                          <p className="mt-1 break-words text-sm font-extrabold">
                            {phone}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-white p-3">
                          <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                            <CalendarDays size={14} className="text-[#d99200]" />
                            Data
                          </p>
                          <p className="mt-1 text-sm font-extrabold">{eventDate}</p>
                        </div>

                        <div className="rounded-2xl bg-white p-3">
                          <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                            <MapPin size={14} className="text-[#d99200]" />
                            Cidade do evento
                          </p>
                          <p className="mt-1 text-sm font-extrabold">{city}</p>
                        </div>

                        <div className="rounded-2xl bg-white p-3">
                          <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                            <Users size={14} className="text-[#d99200]" />
                            Convidados
                          </p>
                          <p className="mt-1 text-sm font-extrabold">{guests}</p>
                        </div>
                      </div>

                      <div className="mt-3 rounded-2xl bg-white p-3">
                        <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                          <Camera size={14} className="text-[#d99200]" />
                          Serviço desejado
                        </p>
                        <p className="mt-1 text-sm font-extrabold">
                          {serviceNeeded}
                        </p>
                      </div>

                      <div className="mt-3 rounded-2xl bg-white p-3">
                        <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                          <Building2 size={14} className="text-[#d99200]" />
                          {isSpaceService(serviceNeeded)
                            ? 'Preferência de estrutura'
                            : 'Espaço do evento'}
                        </p>
                        <p className="mt-1 text-sm font-extrabold">{eventSpace}</p>
                      </div>

                      <div className="mt-3 rounded-2xl bg-white p-3">
                        <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                          <PartyPopper size={14} className="text-[#d99200]" />
                          Tipo de evento
                        </p>
                        <p className="mt-1 text-sm font-extrabold">{eventType}</p>
                      </div>

                      <div className="mt-4">
                        <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                          <MessageCircle size={14} className="text-[#d99200]" />
                          Mensagem
                        </p>

                        <p className="mt-2 text-sm leading-5 text-gray-600">
                          {notes}
                        </p>
                      </div>

                      <div className="mt-5 space-y-3">
                        {!isAccepted && (
                          <Link
                            href={`/painel-fornecedor/leads/${lead.id}/responder`}
                            className={
                              hasAdjustment
                                ? 'flex items-center justify-center gap-2 rounded-[20px] bg-yellow-500 py-4 text-center font-extrabold text-white shadow-lg'
                                : 'flex items-center justify-center gap-2 rounded-[20px] bg-[#e3a925] py-4 text-center font-extrabold text-white shadow-lg'
                            }
                          >
                            <FileText size={21} />
                            {hasAdjustment ? 'Revisar orçamento' : 'Responder orçamento'}
                          </Link>
                        )}

                        {isAccepted && (
                          <div className="flex items-center justify-center gap-2 rounded-[20px] bg-green-50 py-4 text-center font-extrabold text-green-700 ring-1 ring-green-200">
                            <CheckCircle2 size={21} />
                            Orçamento aceito
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                          <Link
                            href={`/orcamentos/${lead.id}/chat`}
                            className={
                              hasUnreadMessages
                                ? 'relative flex items-center justify-center gap-2 rounded-[18px] bg-[#151515] py-3 text-center text-sm font-extrabold text-white ring-2 ring-[#e3a925]'
                                : 'flex items-center justify-center gap-2 rounded-[18px] bg-black py-3 text-center text-sm font-extrabold text-white'
                            }
                          >
                            <MessageCircle size={18} />
                            Chat

                            {hasUnreadMessages && (
                              <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-[#e3a925] px-2 text-[11px] font-extrabold text-white">
                                {unreadMessages}
                              </span>
                            )}
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleMarkSeen(lead.id)}
                            disabled={!hasUnreadMessages || markingSeenId === lead.id}
                            className={
                              hasUnreadMessages
                                ? 'flex items-center justify-center gap-2 rounded-[18px] bg-white py-3 text-center text-sm font-extrabold text-[#151515] ring-1 ring-[#f1e7cf] disabled:opacity-60'
                                : 'flex items-center justify-center gap-2 rounded-[18px] bg-green-50 py-3 text-center text-sm font-extrabold text-green-700 ring-1 ring-green-100 disabled:opacity-70'
                            }
                          >
                            <CheckCircle2 size={18} className="text-green-600" />
                            {markingSeenId === lead.id
                              ? 'Marcando...'
                              : hasUnreadMessages
                                ? 'Marcar visto'
                                : 'Visto'}
                          </button>
                        </div>

                        {isAccepted && isCerimonialista && (
                          <Link
                            href="/cerimonialista/convites"
                            className="flex items-center justify-center gap-2 rounded-[20px] bg-[#151515] py-4 text-center font-extrabold text-white shadow-lg"
                          >
                            <ShieldCheck size={21} className="text-[#e3a925]" />
                            Ver atuação no evento
                          </Link>
                        )}
                      </div>
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
