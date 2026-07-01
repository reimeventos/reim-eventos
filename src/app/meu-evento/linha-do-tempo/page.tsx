'use client';

import Link from 'next/link';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Bell,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  Heart,
  MapPin,
  MessageCircle,
  RefreshCcw,
  Search,
  ShieldCheck,
  User,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

type TimelineItem = {
  id: string;
  type:
    | 'event_created'
    | 'supplier_saved'
    | 'quote_requested'
    | 'quote_responded'
    | 'quote_adjustment'
    | 'quote_accepted'
    | 'message';
  title: string;
  description: string;
  date: string;
  supplierName?: string;
  eventCity?: string;
  href?: string;
  actor?: string;
};

function formatDateTime(date?: string) {
  if (!date) return 'Data não informada';

  try {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return date;
  }
}

function getEventTitle(event: any) {
  const name =
    event?.couple_name ||
    event?.event_name ||
    event?.title ||
    'Meu evento';

  if (String(name).toLowerCase().startsWith('evento')) {
    return name;
  }

  return `Evento de ${name}`;
}

function getEventOwnerId(event: any) {
  return event?.customer_id || event?.client_id || null;
}

function getEventCity(event: any) {
  return event?.event_city || event?.city || 'Cidade não informada';
}

function cityAttendanceText(city: string) {
  if (!city || city === 'Cidade não informada') {
    return 'Cidade do evento não informada';
  }

  return `Atendimento em ${city}`;
}

function formatEventDate(date?: string) {
  if (!date) return 'Data não informada';

  const [year, month, day] = date.split('-');

  if (!year || !month || !day) return date;

  return `${day}/${month}/${year}`;
}

function getSupplierNameFromSaved(item: any) {
  const supplier = Array.isArray(item.suppliers)
    ? item.suppliers[0]
    : item.suppliers;

  return supplier?.business_name || 'Fornecedor';
}

function getSupplierNameFromQuote(item: any) {
  const supplier = Array.isArray(item.suppliers)
    ? item.suppliers[0]
    : item.suppliers;

  return supplier?.business_name || 'Fornecedor';
}

function getIcon(type: TimelineItem['type']) {
  if (type === 'event_created') return CalendarDays;
  if (type === 'supplier_saved') return Heart;
  if (type === 'quote_requested') return FileText;
  if (type === 'quote_responded') return Bell;
  if (type === 'quote_adjustment') return RefreshCcw;
  if (type === 'quote_accepted') return CheckCircle2;
  return MessageCircle;
}

function getIconClass(type: TimelineItem['type']) {
  if (type === 'quote_accepted') return 'bg-green-100 text-green-700';
  if (type === 'quote_adjustment') return 'bg-yellow-100 text-yellow-800';
  if (type === 'message') return 'bg-[#151515] text-[#e3a925]';
  if (type === 'supplier_saved') return 'bg-pink-50 text-pink-700';
  return 'bg-[#fff7e8] text-[#d99200]';
}

function getLineClass(type: TimelineItem['type']) {
  if (type === 'quote_accepted') return 'ring-green-200';
  if (type === 'quote_adjustment') return 'ring-yellow-200';
  if (type === 'message') return 'ring-[#151515]/20';
  return 'ring-[#f1e7cf]';
}

function LinhaDoTempoContent() {
  const searchParams = useSearchParams();
  const requestedEventId = searchParams.get('evento') || '';

  const [eventData, setEventData] = useState<any>(null);
  const [ownerId, setOwnerId] = useState('');
  const [viewerMode, setViewerMode] = useState<'cliente' | 'cerimonialista'>(
    'cliente'
  );
  const [savedSuppliers, setSavedSuppliers] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  async function loadTimeline() {
    try {
      setLoading(true);
      setErrorMessage('');

      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!user?.id || !user?.email) {
        setErrorMessage('Faça login para ver a linha do tempo do evento.');
        return;
      }

      let selectedEvent: any = null;
      let mode: 'cliente' | 'cerimonialista' = 'cliente';

      if (requestedEventId) {
        const { data: eventById, error: eventByIdError } = await supabase
          .from('events')
          .select('*')
          .eq('id', requestedEventId)
          .maybeSingle();

        if (eventByIdError) throw eventByIdError;

        if (!eventById) {
          setErrorMessage('Evento não encontrado.');
          return;
        }

        const eventOwnerId = getEventOwnerId(eventById);

        if (eventOwnerId === user.id) {
          selectedEvent = eventById;
          mode = 'cliente';
        } else {
          const { data: collaborator, error: collaboratorError } = await supabase
            .from('event_collaborators')
            .select('id,status,owner_id,collaborator_email')
            .eq('event_id', requestedEventId)
            .ilike('collaborator_email', user.email)
            .eq('status', 'aceito')
            .maybeSingle();

          if (collaboratorError) throw collaboratorError;

          if (!collaborator) {
            setErrorMessage(
              'Você não tem permissão para ver a linha do tempo deste evento.'
            );
            return;
          }

          selectedEvent = eventById;
          mode = 'cerimonialista';
        }
      } else {
        const { data: myEvent, error: myEventError } = await supabase
          .from('events')
          .select('*')
          .or(`customer_id.eq.${user.id},client_id.eq.${user.id}`)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (myEventError) throw myEventError;

        if (myEvent) {
          selectedEvent = myEvent;
          mode = 'cliente';
        } else {
          const { data: collaborator, error: collaboratorError } = await supabase
            .from('event_collaborators')
            .select('event_id,status,owner_id,collaborator_email')
            .ilike('collaborator_email', user.email)
            .eq('status', 'aceito')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (collaboratorError) throw collaboratorError;

          if (collaborator?.event_id) {
            const { data: sharedEvent, error: sharedEventError } = await supabase
              .from('events')
              .select('*')
              .eq('id', collaborator.event_id)
              .maybeSingle();

            if (sharedEventError) throw sharedEventError;

            selectedEvent = sharedEvent;
            mode = 'cerimonialista';
          }
        }
      }

      if (!selectedEvent?.id) {
        setErrorMessage('Nenhum evento encontrado para esta conta.');
        return;
      }

      const finalOwnerId = getEventOwnerId(selectedEvent);

      if (!finalOwnerId) {
        setErrorMessage('Não foi possível identificar o dono do evento.');
        return;
      }

      setEventData(selectedEvent);
      setOwnerId(finalOwnerId);
      setViewerMode(mode);

      const { data: savedData, error: savedError } = await supabase
        .from('saved_suppliers')
        .select(`
          id,
          created_at,
          supplier_id,
          suppliers(
            id,
            business_name,
            city,
            categories(name)
          )
        `)
        .eq('customer_id', finalOwnerId)
        .order('created_at', { ascending: false });

      if (savedError) throw savedError;

      setSavedSuppliers(savedData || []);

      const { data: quotesData, error: quotesError } = await supabase
        .from('quote_requests')
        .select(`
          id,
          supplier_id,
          customer_id,
          customer_name,
          event_type,
          event_date,
          event_city,
          service_needed,
          status,
          notes,
          created_at,
          created_by_role,
          created_by_name,
          created_by_email,
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
            proposal_value,
            payment_terms,
            adjustment_notes,
            adjustment_requested_at,
            created_at
          ),
          quote_messages(
            id,
            sender_type,
            sender_name,
            message,
            created_at
          )
        `)
        .eq('customer_id', finalOwnerId)
        .order('created_at', { ascending: false });

      if (quotesError) throw quotesError;

      setQuotes(quotesData || []);
    } catch (error: any) {
      console.error('Erro ao carregar linha do tempo:', error);
      setErrorMessage(
        error?.message || 'Não foi possível carregar a linha do tempo.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTimeline();
  }, [requestedEventId]);

  const timeline = useMemo(() => {
    const items: TimelineItem[] = [];
    const eventCity = getEventCity(eventData);

    if (eventData?.created_at) {
      items.push({
        id: `event-${eventData.id}`,
        type: 'event_created',
        title: 'Evento criado',
        description: `${getEventTitle(eventData)} • ${eventCity}`,
        date: eventData.created_at,
        eventCity,
        actor: viewerMode === 'cerimonialista' ? 'Cliente' : 'Você',
      });
    }

    savedSuppliers.forEach((item) => {
      const supplierName = getSupplierNameFromSaved(item);

      items.push({
        id: `saved-${item.id}`,
        type: 'supplier_saved',
        title: 'Fornecedor salvo no evento',
        description: supplierName,
        date: item.created_at,
        supplierName,
        eventCity,
        href: `/fornecedor/${item.supplier_id}?cidade=${encodeURIComponent(eventCity)}`,
      });
    });

    quotes.forEach((quote) => {
      const supplierName = getSupplierNameFromQuote(quote);
      const createdByRole = quote.created_by_role || 'cliente';
      const quoteCity = quote.event_city || eventCity;

      items.push({
        id: `quote-${quote.id}`,
        type: 'quote_requested',
        title:
          createdByRole === 'cerimonialista'
            ? 'Orçamento solicitado pela cerimonialista'
            : 'Orçamento solicitado',
        description: `${supplierName} • ${
          quote.service_needed || 'Serviço não informado'
        } • ${quoteCity}`,
        date: quote.created_at,
        eventCity: quoteCity,
        supplierName,
        href: `/orcamentos/${quote.id}`,
        actor:
          createdByRole === 'cerimonialista'
            ? quote.created_by_name || quote.created_by_email || 'Cerimonialista'
            : quote.customer_name || 'Cliente',
      });

      const responses = quote.quote_responses || [];

      responses.forEach((response: any) => {
        items.push({
          id: `response-${response.id}`,
          type:
            response.status === 'aceito' || quote.status === 'aceito'
              ? 'quote_accepted'
              : response.status === 'ajuste_solicitado' ||
                  quote.status === 'ajuste_solicitado'
                ? 'quote_adjustment'
                : 'quote_responded',
          title:
            response.status === 'aceito' || quote.status === 'aceito'
              ? 'Orçamento aceito'
              : response.status === 'ajuste_solicitado' ||
                  quote.status === 'ajuste_solicitado'
                ? 'Ajuste solicitado'
                : 'Proposta recebida',
          description:
            response.status === 'ajuste_solicitado' ||
            quote.status === 'ajuste_solicitado'
              ? response.adjustment_notes ||
                'A cliente solicitou ajuste na proposta.'
              : `${supplierName} • ${
                  response.proposal_value || 'Valor não informado'
                }`,
          date:
            response.adjustment_requested_at ||
            response.created_at ||
            quote.created_at,
          supplierName,
          eventCity: quoteCity,
          href: `/orcamentos/${quote.id}`,
          actor:
            response.status === 'ajuste_solicitado' ||
            quote.status === 'ajuste_solicitado'
              ? 'Cliente'
              : supplierName,
        });
      });

      const messages = quote.quote_messages || [];

      messages.forEach((message: any) => {
        let actor = 'Cliente';

        if (message.sender_type === 'fornecedor') {
          actor = supplierName;
        }

        if (message.sender_type === 'cerimonialista') {
          actor = message.sender_name || 'Cerimonialista';
        }

        items.push({
          id: `message-${message.id}`,
          type: 'message',
          title: 'Mensagem no chat',
          description: message.message || 'Mensagem enviada',
          date: message.created_at,
          supplierName,
          eventCity: quoteCity,
          href: `/orcamentos/${quote.id}/chat`,
          actor,
        });
      });
    });

    return items.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [eventData, savedSuppliers, quotes, viewerMode]);

  const acceptedCount = quotes.filter(
    (quote) => quote.status === 'aceito' || quote.status === 'fechado'
  ).length;

  const respondedCount = quotes.filter((quote) =>
    ['respondido', 'aceito', 'fechado', 'ajuste_solicitado'].includes(
      quote.status
    )
  ).length;

  const messageCount = quotes.reduce((total, quote) => {
    return total + (quote.quote_messages || []).length;
  }, 0);

  const eventCity = getEventCity(eventData);
  const eventDate = formatEventDate(eventData?.event_date);
  const eventSpace = eventData?.event_space || 'Espaço não informado';
  const guestsCount =
    eventData?.guests_count || eventData?.guest_count || 'Não informado';

  const backHref =
    viewerMode === 'cerimonialista'
      ? eventData?.id
        ? `/cerimonialista/evento/${eventData.id}?cidade=${encodeURIComponent(eventCity)}`
        : '/cerimonialista/convites'
      : '/meu-evento';

  return (
    <main className="min-h-screen bg-black text-[#151515]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#fbf7f1] pb-10 shadow-2xl">
        <section className="relative overflow-hidden rounded-b-[34px] bg-black px-6 pb-8 pt-7 text-white">
          <div className="absolute inset-0 bg-[url('/layout01-fundo.png')] bg-cover bg-center opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/85 to-black" />

          <div className="relative z-10">
            <Link
              href={backHref}
              className="inline-flex items-center gap-2 text-sm font-bold text-[#e3a925]"
            >
              <ArrowLeft size={17} />
              Voltar
            </Link>

            <div className="mt-6 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e3a925] text-white shadow-lg">
                <Clock size={30} />
              </div>

              <div>
                <h1 className="font-serif text-[32px] leading-tight">
                  Linha do tempo
                </h1>

                <p className="mt-1 text-sm text-white/70">
                  Histórico completo do evento.
                </p>

                <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-extrabold text-[#f7d67b]">
                  <MapPin size={14} />
                  {cityAttendanceText(eventCity)}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 pt-6">
          {loading && (
            <div className="rounded-[28px] bg-white p-6 text-center shadow-sm ring-1 ring-[#f1e7cf]">
              <Clock size={36} className="mx-auto text-[#d99200]" />
              <p className="mt-3 text-sm font-bold text-gray-500">
                Carregando linha do tempo...
              </p>
            </div>
          )}

          {!loading && errorMessage && (
            <div className="rounded-[28px] bg-red-50 p-6 text-center text-sm font-bold leading-5 text-red-700 ring-1 ring-red-100">
              {errorMessage}
            </div>
          )}

          {!loading && !errorMessage && eventData && (
            <>
              <div className="rounded-[28px] bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,.08)] ring-1 ring-[#f1e7cf]">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff7e8] text-[#d99200]">
                    {viewerMode === 'cerimonialista' ? (
                      <ShieldCheck size={30} />
                    ) : (
                      <Heart size={30} />
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="text-xs font-bold text-gray-500">
                      {viewerMode === 'cerimonialista'
                        ? 'Evento compartilhado'
                        : 'Meu evento'}
                    </p>

                    <h2 className="mt-1 text-xl font-extrabold">
                      {getEventTitle(eventData)}
                    </h2>

                    <p className="mt-2 flex items-center gap-2 text-sm font-bold text-gray-500">
                      <MapPin size={14} className="text-[#d99200]" />
                      {cityAttendanceText(eventCity)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-[24px] bg-[#151515] p-4 text-white shadow-lg">
                <p className="flex items-center gap-2 text-xs font-extrabold text-[#f7d67b]">
                  <MapPin size={15} />
                  Cidade do evento
                </p>

                <h2 className="mt-2 text-lg font-extrabold">
                  {cityAttendanceText(eventCity)}
                </h2>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="rounded-2xl bg-white/10 p-2 text-center">
                    <p className="text-[10px] font-bold text-white/55">Data</p>
                    <p className="mt-1 text-[11px] font-extrabold">{eventDate}</p>
                  </div>

                  <div className="rounded-2xl bg-white/10 p-2 text-center">
                    <p className="text-[10px] font-bold text-white/55">Pessoas</p>
                    <p className="mt-1 text-[11px] font-extrabold">{guestsCount}</p>
                  </div>

                  <div className="rounded-2xl bg-white/10 p-2 text-center">
                    <p className="text-[10px] font-bold text-white/55">Espaço</p>
                    <p className="mt-1 line-clamp-1 text-[11px] font-extrabold">
                      {eventSpace}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-4 gap-2">
                <div className="rounded-[20px] bg-white p-3 text-center shadow-sm ring-1 ring-[#f1e7cf]">
                  <p className="text-xl font-extrabold text-[#d99200]">
                    {savedSuppliers.length}
                  </p>
                  <p className="mt-1 text-[10px] font-bold text-gray-600">
                    Salvos
                  </p>
                </div>

                <div className="rounded-[20px] bg-white p-3 text-center shadow-sm ring-1 ring-[#f1e7cf]">
                  <p className="text-xl font-extrabold text-blue-600">
                    {respondedCount}
                  </p>
                  <p className="mt-1 text-[10px] font-bold text-gray-600">
                    Resp.
                  </p>
                </div>

                <div className="rounded-[20px] bg-white p-3 text-center shadow-sm ring-1 ring-[#f1e7cf]">
                  <p className="text-xl font-extrabold text-green-600">
                    {acceptedCount}
                  </p>
                  <p className="mt-1 text-[10px] font-bold text-gray-600">
                    Aceitos
                  </p>
                </div>

                <div className="rounded-[20px] bg-white p-3 text-center shadow-sm ring-1 ring-[#f1e7cf]">
                  <p className="text-xl font-extrabold text-[#151515]">
                    {messageCount}
                  </p>
                  <p className="mt-1 text-[10px] font-bold text-gray-600">
                    Msgs
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-[28px] bg-[#151515] p-5 text-white shadow-lg">
                <h2 className="text-lg font-extrabold">
                  Resumo do andamento
                </h2>

                <p className="mt-2 text-sm leading-5 text-white/70">
                  Acompanhe em ordem tudo que aconteceu no evento em {eventCity}: fornecedores salvos, pedidos enviados, propostas, ajustes, aceites e conversas.
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <Link
                    href={
                      viewerMode === 'cerimonialista'
                        ? `/cerimonialista/evento/${eventData.id}?cidade=${encodeURIComponent(eventCity)}`
                        : '/meu-evento'
                    }
                    className="rounded-[20px] bg-white py-3 text-center text-sm font-extrabold text-[#151515]"
                  >
                    Ver evento
                  </Link>

                  <Link
                    href="/orcamentos"
                    className="rounded-[20px] bg-[#e3a925] py-3 text-center text-sm font-extrabold text-white"
                  >
                    Orçamentos
                  </Link>
                </div>
              </div>

              <section className="pt-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-extrabold">Histórico</h2>

                  <span className="rounded-full bg-[#fff7e8] px-3 py-1 text-xs font-extrabold text-[#b97900]">
                    {timeline.length} item(ns)
                  </span>
                </div>

                {timeline.length === 0 && (
                  <div className="rounded-[28px] bg-white p-6 text-center shadow-sm ring-1 ring-[#f1e7cf]">
                    <Search size={36} className="mx-auto text-[#d99200]" />
                    <h3 className="mt-4 text-lg font-extrabold">
                      Nada registrado ainda
                    </h3>
                    <p className="mt-2 text-sm leading-5 text-gray-500">
                      Quando houver fornecedores, orçamentos ou mensagens, eles aparecerão aqui.
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  {timeline.map((item) => {
                    const Icon = getIcon(item.type);

                    const content = (
                      <div
                        className={`rounded-[26px] bg-white p-5 shadow-sm ring-1 ${getLineClass(
                          item.type
                        )}`}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${getIconClass(
                              item.type
                            )}`}
                          >
                            <Icon size={24} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <h3 className="text-base font-extrabold">
                                  {item.title}
                                </h3>

                                {item.actor && (
                                  <p className="mt-1 text-xs font-bold text-[#b97900]">
                                    Por: {item.actor}
                                  </p>
                                )}
                              </div>

                              {item.href && (
                                <span className="rounded-full bg-[#fbf7f1] px-3 py-1 text-[10px] font-extrabold text-gray-600 ring-1 ring-[#f1e7cf]">
                                  Abrir
                                </span>
                              )}
                            </div>

                            <p className="mt-2 text-sm leading-5 text-gray-600">
                              {item.description}
                            </p>

                            {item.supplierName && (
                              <p className="mt-2 flex items-center gap-1 text-xs font-bold text-gray-500">
                                <Building2 size={13} className="text-[#d99200]" />
                                {item.supplierName}
                              </p>
                            )}

                            {item.eventCity && (
                              <p className="mt-2 flex items-center gap-1 text-xs font-bold text-[#b97900]">
                                <MapPin size={13} />
                                {cityAttendanceText(item.eventCity)}
                              </p>
                            )}

                            <p className="mt-3 text-xs font-bold text-gray-400">
                              {formatDateTime(item.date)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );

                    if (item.href) {
                      return (
                        <Link key={item.id} href={item.href} className="block">
                          {content}
                        </Link>
                      );
                    }

                    return <div key={item.id}>{content}</div>;
                  })}
                </div>
              </section>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

export default function LinhaDoTempoPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#fbf7f1] p-6">
          Carregando linha do tempo...
        </main>
      }
    >
      <LinhaDoTempoContent />
    </Suspense>
  );
}
