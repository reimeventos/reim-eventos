'use client';

import { useEffect, useState } from 'react';
import { getSupplierLeads } from '@/lib/suppliers';
import Link from 'next/link';
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  MapPin,
  MessageCircle,
  Users,
  Building2,
  FileText,
  Phone,
  User,
  PartyPopper,
  Camera,
  RefreshCcw,
  AlertCircle,
  Bell,
  Store,
  ShieldCheck,
} from 'lucide-react';

export default function LeadsFornecedorPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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

    if (!year || !month || !day) {
      return date;
    }

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
      return 'bg-yellow-100 text-yellow-800';
    }

    if (status === 'aceito' || status === 'fechado') {
      return 'bg-green-100 text-green-700';
    }

    if (status === 'respondido') {
      return 'bg-blue-50 text-blue-700';
    }

    return 'bg-[#fff7e8] text-[#b97900]';
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

  const newCount = leads.filter(
    (lead) => lead.status === 'novo' || lead.status === 'aguardando_resposta'
  ).length;

  const adjustmentCount = leads.filter(
    (lead) => lead.status === 'ajuste_solicitado'
  ).length;

  const closedCount = leads.filter(
    (lead) => lead.status === 'aceito' || lead.status === 'fechado'
  ).length;

  const totalUnreadMessages = leads.reduce((total, lead) => {
    const messages = lead.quote_messages || [];

    const unread = messages.filter(
      (message: any) =>
        message.sender_type === 'cliente' &&
        message.read_by_supplier === false
    ).length;

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

            <h1 className="mt-5 font-serif text-[34px] leading-tight">
              Leads recebidos
            </h1>

            <p className="mt-2 text-sm text-white/70">
              Pedidos de orçamento enviados pelos clientes.
            </p>
          </div>
        </section>

        <section className="grid grid-cols-3 gap-3 px-6 pt-6">
          <div className="rounded-[22px] bg-white p-4 text-center shadow-sm ring-1 ring-[#f1e7cf]">
            <p className="text-2xl font-extrabold text-[#d99200]">
              {newCount}
            </p>
            <p className="mt-1 text-[11px] font-bold text-gray-600">
              Novos
            </p>
          </div>

          <div className="rounded-[22px] bg-white p-4 text-center shadow-sm ring-1 ring-[#f1e7cf]">
            <p className="text-2xl font-extrabold text-yellow-600">
              {adjustmentCount}
            </p>
            <p className="mt-1 text-[11px] font-bold text-gray-600">
              Ajustes
            </p>
          </div>

          <div className="rounded-[22px] bg-white p-4 text-center shadow-sm ring-1 ring-[#f1e7cf]">
            <p className="text-2xl font-extrabold text-green-600">
              {closedCount}
            </p>
            <p className="mt-1 text-[11px] font-bold text-gray-600">
              Aceitos
            </p>
          </div>
        </section>

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
                  Abra o chat do orçamento para responder.
                </p>
              </div>
            </div>
          </section>
        )}

        <section className="px-6 pt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-extrabold">Solicitações</h2>

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
                Quando uma noiva solicitar orçamento, o pedido aparecerá aqui.
              </p>
            </div>
          )}

          <div className="space-y-4">
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

              const isAccepted = status === 'aceito' || status === 'fechado';
              const isCerimonialista = isCerimonialistaCategory(supplierCategory);

              const responses = lead.quote_responses || [];
              const latestResponse =
                responses.length > 0 ? responses[responses.length - 1] : null;

              const adjustmentNotes =
                latestResponse?.adjustment_notes || lead.adjustment_notes || '';

              const hasAdjustment = status === 'ajuste_solicitado';

              const messages = lead.quote_messages || [];

              const unreadMessages = messages.filter(
                (message: any) =>
                  message.sender_type === 'cliente' &&
                  message.read_by_supplier === false
              ).length;

              const hasUnreadMessages = unreadMessages > 0;

              const cardClass = isAccepted
                ? 'rounded-[28px] bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,.10)] ring-2 ring-green-300'
                : hasAdjustment
                  ? 'rounded-[28px] bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,.10)] ring-2 ring-yellow-300'
                  : hasUnreadMessages
                    ? 'rounded-[28px] bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,.12)] ring-2 ring-[#e3a925]'
                    : 'rounded-[28px] bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,.08)] ring-1 ring-[#f1e7cf]';

              return (
                <div key={lead.id} className={cardClass}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-extrabold">{eventType}</h3>

                      <p className="mt-1 flex items-center gap-1 text-sm font-bold text-gray-500">
                        <MapPin size={15} className="text-[#d99200]" />
                        {city}
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
                        {isAccepted ? (
                          <CheckCircle2 size={13} />
                        ) : hasAdjustment ? (
                          <AlertCircle size={13} />
                        ) : (
                          <Clock size={13} />
                        )}
                        {statusLabel(status)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl bg-[#151515] p-4 text-white">
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

                  {isAccepted && (
                    <div className="mt-4 rounded-2xl bg-green-50 p-4 ring-1 ring-green-200">
                      <p className="flex items-center gap-2 text-xs font-extrabold text-green-800">
                        <CheckCircle2 size={15} />
                        Orçamento aceito pelo cliente
                      </p>

                      <p className="mt-2 text-sm leading-5 text-green-900">
                        Este orçamento foi aceito. A partir de agora, use o chat para alinhar os detalhes finais com o cliente.
                      </p>
                    </div>
                  )}

                  {isAccepted && isCerimonialista && (
                    <div className="mt-4 rounded-2xl bg-[#151515] p-4 text-white">
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
                    <div className="mt-4 rounded-2xl bg-yellow-50 p-4 ring-1 ring-yellow-200">
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
                    <div className="mt-4 rounded-2xl bg-[#151515] p-4 text-white">
                      <p className="flex items-center gap-2 text-xs font-extrabold text-[#f7d67b]">
                        <Bell size={15} />
                        Mensagem nova no chat
                      </p>

                      <p className="mt-2 text-sm leading-5 text-white/80">
                        A cliente enviou{' '}
                        {unreadMessages === 1
                          ? 'uma nova mensagem.'
                          : `${unreadMessages} novas mensagens.`}
                      </p>
                    </div>
                  )}

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-[#fbf7f1] p-3">
                      <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                        <User size={14} className="text-[#d99200]" />
                        Cliente
                      </p>
                      <p className="mt-1 text-sm font-extrabold">
                        {clientName}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#fbf7f1] p-3">
                      <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                        <Phone size={14} className="text-[#d99200]" />
                        WhatsApp
                      </p>
                      <p className="mt-1 break-words text-sm font-extrabold">
                        {phone}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#fbf7f1] p-3">
                      <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                        <CalendarDays size={14} className="text-[#d99200]" />
                        Data
                      </p>
                      <p className="mt-1 text-sm font-extrabold">{eventDate}</p>
                    </div>

                    <div className="rounded-2xl bg-[#fbf7f1] p-3">
                      <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                        <Users size={14} className="text-[#d99200]" />
                        Convidados
                      </p>
                      <p className="mt-1 text-sm font-extrabold">{guests}</p>
                    </div>
                  </div>

                  <div className="mt-3 rounded-2xl bg-[#fbf7f1] p-3">
                    <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                      <Camera size={14} className="text-[#d99200]" />
                      Serviço desejado
                    </p>
                    <p className="mt-1 text-sm font-extrabold">
                      {serviceNeeded}
                    </p>
                  </div>

                  <div className="mt-3 rounded-2xl bg-[#fbf7f1] p-3">
                    <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                      <Building2 size={14} className="text-[#d99200]" />
                      {isSpaceService(serviceNeeded)
                        ? 'Preferência de estrutura'
                        : 'Espaço do evento'}
                    </p>
                    <p className="mt-1 text-sm font-extrabold">{eventSpace}</p>
                  </div>

                  <div className="mt-3 rounded-2xl bg-[#fbf7f1] p-3">
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
                            ? 'flex items-center justify-center gap-2 rounded-[22px] bg-yellow-500 py-4 text-center font-extrabold text-white shadow-lg'
                            : 'flex items-center justify-center gap-2 rounded-[22px] bg-[#e3a925] py-4 text-center font-extrabold text-white shadow-lg'
                        }
                      >
                        <FileText size={21} />
                        {hasAdjustment
                          ? 'Revisar orçamento'
                          : 'Responder orçamento'}
                      </Link>
                    )}

                    {isAccepted && (
                      <div className="flex items-center justify-center gap-2 rounded-[22px] bg-green-50 py-4 text-center font-extrabold text-green-700 ring-1 ring-green-200">
                        <CheckCircle2 size={21} />
                        Orçamento aceito
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <Link
                        href={`/orcamentos/${lead.id}/chat`}
                        className={
                          hasUnreadMessages
                            ? 'relative flex items-center justify-center gap-2 rounded-[20px] bg-[#151515] py-3 text-center text-sm font-extrabold text-white ring-2 ring-[#e3a925]'
                            : 'flex items-center justify-center gap-2 rounded-[20px] bg-black py-3 text-center text-sm font-extrabold text-white'
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

                      <button className="flex items-center justify-center gap-2 rounded-[20px] bg-[#fbf7f1] py-3 text-center text-sm font-extrabold text-[#151515] ring-1 ring-[#f1e7cf]">
                        <CheckCircle2 size={18} className="text-green-600" />
                        Marcar visto
                      </button>
                    </div>

                    {isAccepted && isCerimonialista && (
                      <Link
                        href="/cerimonialista/convites"
                        className="flex items-center justify-center gap-2 rounded-[22px] bg-[#151515] py-4 text-center font-extrabold text-white shadow-lg"
                      >
                        <ShieldCheck size={21} className="text-[#e3a925]" />
                        Ver atuação no evento
                      </Link>
                    )}
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
