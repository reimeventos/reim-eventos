'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  AlertCircle,
  Building2,
  CalendarDays,
  CheckCircle2,
  FileText,
  MapPin,
  MessageCircle,
  Send,
  ShieldCheck,
  User,
  Users,
  PartyPopper,
  RefreshCcw,
} from 'lucide-react';
import { createQuoteResponse, getSupplierLeadById } from '@/lib/suppliers';
import { supabase } from '@/lib/supabase';


function getDaysUntil(date?: string) {
  if (!date) return null;

  const today = new Date();
  const target = new Date(date);

  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  const diff = target.getTime() - today.getTime();

  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getSubscriptionAccess(subscription: any, visibility?: any) {
  if (visibility && visibility.can_receive_quote === false) {
    if (visibility.public_badge === 'novo_no_reim') {
      return {
        blocked: true,
        label: 'Perfil do fornecedor pendente',
        description:
          'Seu teste está ativo, mas a vitrine ainda precisa estar com perfil ativo para responder orçamentos.',
        tone: 'warning',
      };
    }

    if (visibility.public_badge === 'pendente') {
      return {
        blocked: true,
        label: 'Pagamento pendente',
        description:
          'Aguarde a confirmação do pagamento pelo admin REIM para responder orçamentos.',
        tone: 'warning',
      };
    }

    if (visibility.public_badge === 'expirado') {
      return {
        blocked: true,
        label: 'Teste ou assinatura expirada',
        description:
          'Para responder este orçamento, escolha o plano Profissional ou Premium.',
        tone: 'danger',
      };
    }

    if (visibility.public_badge === 'cancelado') {
      return {
        blocked: true,
        label: 'Assinatura cancelada',
        description:
          'Escolha um novo plano para voltar a responder orçamentos.',
        tone: 'danger',
      };
    }

    if (visibility.public_badge === 'sem_assinatura') {
      return {
        blocked: true,
        label: 'Assinatura não encontrada',
        description:
          'Escolha o plano Profissional ou Premium para responder orçamentos.',
        tone: 'danger',
      };
    }

    return {
      blocked: true,
      label: 'Fornecedor indisponível',
      description:
        'Sua vitrine não está habilitada para responder orçamentos neste momento.',
      tone: 'danger',
    };
  }

  if (!subscription) {
    return {
      blocked: true,
      label: 'Assinatura não encontrada',
      description:
        'Escolha o plano Profissional ou Premium para responder orçamentos.',
      tone: 'danger',
    };
  }

  const status = subscription.status || '';
  const dueDate = subscription.due_date || '';
  const trialEndsAt = subscription.trial_ends_at || '';
  const daysLeft = getDaysUntil(dueDate || trialEndsAt);

  const expiredByDate = daysLeft !== null && daysLeft < 0;
  const blocked =
    status === 'expirado' ||
    status === 'cancelado' ||
    (status === 'teste' && expiredByDate);

  if (blocked) {
    return {
      blocked: true,
      label: 'Teste ou assinatura expirada',
      description:
        'Para responder este orçamento, escolha o plano Profissional ou Premium.',
      tone: 'danger',
    };
  }

  if (status === 'pendente') {
    return {
      blocked: true,
      label: 'Pagamento pendente',
      description:
        'Aguarde a confirmação do pagamento pelo admin REIM para responder orçamentos.',
      tone: 'warning',
    };
  }

  if (status === 'teste') {
    return {
      blocked: false,
      label: 'Teste grátis ativo',
      description:
        daysLeft === 0
          ? 'Seu teste vence hoje. Você ainda pode responder, mas escolha um plano para continuar.'
          : `Seu teste grátis vence em ${daysLeft} dia(s).`,
      tone: 'info',
    };
  }

  if (status === 'ativo') {
    return {
      blocked: false,
      label: 'Plano ativo',
      description: 'Você pode responder normalmente os orçamentos recebidos.',
      tone: 'success',
    };
  }

  return {
    blocked: true,
    label: 'Assinatura necessária',
    description:
      'Escolha o plano Profissional ou Premium para responder orçamentos.',
    tone: 'danger',
  };
}


export default function ResponderOrcamentoPage() {
  const params = useParams();
  const leadId = String(params.id || '');

  const [lead, setLead] = useState<any>(null);
  const [latestResponse, setLatestResponse] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [publicVisibility, setPublicVisibility] = useState<any>(null);
  const [loadingLead, setLoadingLead] = useState(true);

  const [serviceOffered, setServiceOffered] = useState('');
  const [durationPeriod, setDurationPeriod] = useState('');
  const [proposalValue, setProposalValue] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [proposalValidity, setProposalValidity] = useState('');
  const [observations, setObservations] = useState('');

  const [sending, setSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!leadId) return;

    getSupplierLeadById(leadId)
      .then(async (data) => {
        setLead(data);

        const responses = data?.quote_responses || [];
        const sortedResponses = [...responses].sort((a, b) => {
          return (
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
          );
        });

        const last = sortedResponses[0] || null;
        setLatestResponse(last);

        setServiceOffered(last?.service_offered || data?.service_needed || '');
        setDurationPeriod(last?.duration_period || '');
        setProposalValue(last?.proposal_value || '');
        setPaymentTerms(last?.payment_terms || '');
        setProposalValidity(last?.proposal_validity || '');
        setObservations(last?.observations || '');

        if (data?.supplier_id) {
          const { data: visibilityData, error: visibilityError } =
            await supabase
              .from('supplier_public_visibility')
              .select(
                'supplier_id, supplier_status, subscription_status, plan, trial_active, plan_active, can_appear_public, can_receive_quote, public_badge, public_label, public_notice'
              )
              .eq('supplier_id', data.supplier_id)
              .maybeSingle();

          if (visibilityError) {
            console.error('Erro ao carregar visibilidade do fornecedor:', visibilityError);
          }

          setPublicVisibility(visibilityData || null);

          const { data: subscriptionData, error: subscriptionError } =
            await supabase
              .from('supplier_subscriptions')
              .select('*')
              .eq('supplier_id', data.supplier_id)
              .order('created_at', { ascending: false })
              .limit(1);

          if (subscriptionError) {
            console.error('Erro ao carregar assinatura:', subscriptionError);
          }

          setSubscription(subscriptionData?.[0] || null);
        }
      })
      .catch((error) => {
        console.error('Erro ao carregar pedido:', error);
        setErrorMessage('Não foi possível carregar o pedido.');
      })
      .finally(() => {
        setLoadingLead(false);
      });
  }, [leadId]);

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

  function getOriginInfo(item: any) {
    const role = item?.created_by_role || 'cliente';
    const name = item?.created_by_name || '';
    const email = item?.created_by_email || '';

    if (role === 'cerimonialista') {
      return {
        label: 'Solicitado pela cerimonialista',
        detail: name || email || 'Cerimonialista',
        description:
          'Esta solicitação foi enviada por uma cerimonialista autorizada pela cliente no evento.',
        icon: ShieldCheck,
        boxClass: 'bg-green-50 text-green-800 ring-green-100',
        iconClass: 'text-green-700',
      };
    }

    if (role === 'cliente_lote') {
      return {
        label: 'Enviado em lote pela cliente',
        detail: name || email || item?.customer_name || 'Cliente',
        description:
          'Esta solicitação veio do botão “Solicitar orçamento para todos”.',
        icon: FileText,
        boxClass: 'bg-blue-50 text-blue-800 ring-blue-100',
        iconClass: 'text-blue-700',
      };
    }

    return {
      label: 'Solicitado pela cliente',
      detail: name || email || item?.customer_name || 'Cliente',
      description: 'Esta solicitação foi enviada diretamente pela cliente.',
      icon: User,
      boxClass: 'bg-[#fff7e8] text-[#7a5200] ring-[#f1e7cf]',
      iconClass: 'text-[#d99200]',
    };
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSuccessMessage('');
    setErrorMessage('');

    if (!leadId) {
      setErrorMessage('Pedido não identificado.');
      return;
    }

    const access = getSubscriptionAccess(subscription, publicVisibility);

    if (access.blocked) {
      setErrorMessage(access.description);
      return;
    }

    if (!serviceOffered.trim()) {
      setErrorMessage('Informe o serviço oferecido.');
      return;
    }

    if (!proposalValue.trim()) {
      setErrorMessage('Informe o valor da proposta.');
      return;
    }

    try {
      setSending(true);

      await createQuoteResponse({
        quote_request_id: leadId,
        service_offered: serviceOffered,
        duration_period: durationPeriod,
        proposal_value: proposalValue,
        payment_terms: paymentTerms,
        proposal_validity: proposalValidity,
        observations,
      });

      setLead({
        ...lead,
        status: 'respondido',
      });

      setSuccessMessage(
        isAdjustmentRequested
          ? 'Proposta revisada enviada com sucesso! O status voltou para respondido.'
          : 'Orçamento enviado com sucesso! O pedido foi marcado como respondido.'
      );
    } catch (error) {
      console.error(error);
      setErrorMessage('Não foi possível enviar o orçamento. Tente novamente.');
    } finally {
      setSending(false);
    }
  }

  const clientName = lead?.customer_name || 'Cliente não informado';
  const eventType = lead?.event_type || 'Evento não informado';
  const eventDate = formatDate(lead?.event_date);
  const city = lead?.event_city || 'Cidade não informada';
  const guests = lead?.guests_count || 'Não informado';
  const eventSpace = lead?.event_space || 'Não informado';
  const notes = lead?.notes || 'Cliente não informou mensagem.';
  const status = lead?.status || 'aguardando_resposta';
  const serviceNeeded = lead?.service_needed || 'Serviço não informado';
  const isEventSpace = lead?.service_needed === 'Espaço de festa';
  const isAdjustmentRequested = status === 'ajuste_solicitado';
  const adjustmentNotes = latestResponse?.adjustment_notes || '';

  const originInfo = getOriginInfo(lead);
  const OriginIcon = originInfo.icon;
  const subscriptionAccess = getSubscriptionAccess(subscription, publicVisibility);

  return (
    <main className="min-h-screen bg-black text-[#151515]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#fbf7f1] pb-40 shadow-2xl">
        <section className="relative overflow-hidden rounded-b-[34px] bg-black px-6 pb-8 pt-7 text-white">
          <div className="absolute inset-0 bg-[url('/layout01-fundo.png')] bg-cover bg-center opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/85 to-black" />

          <div className="relative z-10">
            <Link
              href="/painel-fornecedor/leads"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#e3a925]"
            >
              <ArrowLeft size={17} />
              Voltar
            </Link>

            <div className="mt-6">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#e3a925]">
                Painel do fornecedor
              </p>

              <h1 className="mt-2 font-serif text-[34px] leading-tight">
                {isAdjustmentRequested ? 'Revisar orçamento' : 'Responder orçamento'}
              </h1>

              <p className="mt-2 text-sm text-white/70">
                {clientName} • {eventType}
              </p>
            </div>

            <div className="mt-6 rounded-[28px] bg-white/10 p-4 backdrop-blur">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white/60">
                    Pedido recebido
                  </p>

                  <h2 className="mt-1 line-clamp-1 text-xl font-extrabold">
                    {eventType}
                  </h2>

                  <p className="mt-1 flex items-center gap-2 text-xs font-bold text-white/70">
                    <MapPin size={13} className="text-[#e3a925]" />
                    {city}
                  </p>
                </div>

                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-extrabold ring-1 ${statusClass(status)}`}
                >
                  {statusLabel(status)}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="rounded-2xl bg-black/25 p-3 text-center">
                  <CalendarDays size={16} className="mx-auto text-[#e3a925]" />
                  <p className="mt-1 text-[10px] font-bold text-white/50">Data</p>
                  <p className="mt-1 text-[11px] font-extrabold">{eventDate}</p>
                </div>

                <div className="rounded-2xl bg-black/25 p-3 text-center">
                  <Users size={16} className="mx-auto text-[#e3a925]" />
                  <p className="mt-1 text-[10px] font-bold text-white/50">
                    Convidados
                  </p>
                  <p className="mt-1 text-[11px] font-extrabold">{guests}</p>
                </div>

                <div className="rounded-2xl bg-black/25 p-3 text-center">
                  <PartyPopper size={16} className="mx-auto text-[#e3a925]" />
                  <p className="mt-1 text-[10px] font-bold text-white/50">
                    Evento
                  </p>
                  <p className="mt-1 line-clamp-1 text-[11px] font-extrabold">
                    {eventType}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 pt-6">
          {loadingLead ? (
            <div className="rounded-[28px] bg-white p-6 text-center shadow-sm ring-1 ring-[#f1e7cf]">
              <FileText size={38} className="mx-auto text-[#d99200]" />
              <p className="mt-3 text-sm font-bold text-gray-500">
                Carregando pedido...
              </p>
            </div>
          ) : (
            <>
              <div className={`rounded-[24px] p-4 ring-1 ${originInfo.boxClass}`}>
                <p className="flex items-center gap-2 text-xs font-extrabold">
                  <OriginIcon size={16} className={originInfo.iconClass} />
                  Origem da solicitação
                </p>

                <p className="mt-2 text-sm font-extrabold">{originInfo.label}</p>

                {originInfo.detail && (
                  <p className="mt-1 break-all text-xs font-bold opacity-80">
                    {originInfo.detail}
                  </p>
                )}

                <p className="mt-2 text-xs leading-5 opacity-80">
                  {originInfo.description}
                </p>
              </div>

              {isAdjustmentRequested && (
                <div className="mt-4 rounded-[24px] bg-yellow-50 p-4 ring-1 ring-yellow-200">
                  <p className="flex items-center gap-2 text-xs font-extrabold text-yellow-800">
                    <AlertCircle size={15} />
                    Cliente solicitou ajuste
                  </p>

                  <p className="mt-2 text-sm leading-5 text-yellow-900">
                    {adjustmentNotes ||
                      'A cliente solicitou ajuste, mas não informou detalhes.'}
                  </p>
                </div>
              )}

              <div className="mt-4 rounded-[28px] bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,.08)] ring-1 ring-[#f1e7cf]">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-lg font-extrabold">Resumo do pedido</h2>

                  <Link
                    href={`/orcamentos/${leadId}/chat`}
                    className="flex items-center gap-2 rounded-full bg-black px-3 py-2 text-xs font-extrabold text-white"
                  >
                    <MessageCircle size={14} className="text-[#e3a925]" />
                    Chat
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-[#fbf7f1] p-3">
                    <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                      <User size={14} className="text-[#d99200]" />
                      Cliente
                    </p>
                    <p className="mt-1 line-clamp-1 text-sm font-extrabold">
                      {clientName}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#fbf7f1] p-3">
                    <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                      <FileText size={14} className="text-[#d99200]" />
                      Serviço
                    </p>
                    <p className="mt-1 line-clamp-1 text-sm font-extrabold">
                      {serviceNeeded}
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
                      <MapPin size={14} className="text-[#d99200]" />
                      Cidade
                    </p>
                    <p className="mt-1 line-clamp-1 text-sm font-extrabold">
                      {city}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#fbf7f1] p-3">
                    <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                      <Users size={14} className="text-[#d99200]" />
                      Convidados
                    </p>
                    <p className="mt-1 text-sm font-extrabold">{guests}</p>
                  </div>

                  <div className="rounded-2xl bg-[#fbf7f1] p-3">
                    <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                      <Building2 size={14} className="text-[#d99200]" />
                      {isEventSpace ? 'Estrutura' : 'Espaço'}
                    </p>
                    <p className="mt-1 line-clamp-1 text-sm font-extrabold">
                      {eventSpace}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl bg-[#fbf7f1] p-4">
                  <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                    <MessageCircle size={14} className="text-[#d99200]" />
                    Mensagem da cliente
                  </p>

                  <p className="mt-2 text-sm leading-5 text-gray-600">{notes}</p>
                </div>
              </div>

              <div
                className={
                  subscriptionAccess.tone === 'danger'
                    ? 'mt-4 rounded-[24px] bg-red-50 p-4 text-sm leading-5 text-red-700 ring-1 ring-red-100'
                    : subscriptionAccess.tone === 'warning'
                      ? 'mt-4 rounded-[24px] bg-yellow-50 p-4 text-sm leading-5 text-yellow-800 ring-1 ring-yellow-100'
                      : subscriptionAccess.tone === 'success'
                        ? 'mt-4 rounded-[24px] bg-green-50 p-4 text-sm leading-5 text-green-700 ring-1 ring-green-100'
                        : 'mt-4 rounded-[24px] bg-blue-50 p-4 text-sm leading-5 text-blue-700 ring-1 ring-blue-100'
                }
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/70">
                    <ShieldCheck size={22} />
                  </div>

                  <div className="flex-1">
                    <p className="font-extrabold">{subscriptionAccess.label}</p>
                    <p className="mt-1 text-xs font-bold opacity-80">
                      {subscriptionAccess.description}
                    </p>

                    {publicVisibility?.public_badge === 'novo_no_reim' &&
                      !subscriptionAccess.blocked && (
                        <p className="mt-2 rounded-2xl bg-white/70 px-3 py-2 text-xs font-bold opacity-90">
                          Novo fornecedor no REIM: mantenha seu plano ativo para continuar recebendo e respondendo leads após o teste.
                        </p>
                      )}

                    {subscriptionAccess.blocked && (
                      <Link
                        href="/painel-fornecedor/planos"
                        className="mt-3 inline-flex rounded-full bg-[#e3a925] px-4 py-2 text-xs font-extrabold text-white shadow-sm"
                      >
                        Escolher plano
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              <section className="pt-6">
                <div className="mb-4">
                  <h2 className="text-lg font-extrabold">
                    {isAdjustmentRequested ? 'Revisar proposta' : 'Montar proposta'}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    {isAdjustmentRequested
                      ? 'Os dados abaixo vieram da última proposta. Altere apenas o necessário.'
                      : 'Essa resposta poderá virar um orçamento oficial dentro do app.'}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <label className="block">
                    <span className="mb-2 flex items-center gap-2 text-sm font-extrabold">
                      <FileText size={17} className="text-[#d99200]" />
                      Serviço oferecido
                    </span>
                    <input
                      value={serviceOffered}
                      onChange={(event) => setServiceOffered(event.target.value)}
                      className="w-full rounded-[22px] bg-white px-5 py-4 text-sm font-medium outline-none ring-1 ring-[#f1e7cf] placeholder:text-gray-400"
                      placeholder="Ex: Cobertura fotográfica completa"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 flex items-center gap-2 text-sm font-extrabold">
                      <CalendarDays size={17} className="text-[#d99200]" />
                      Duração / período
                    </span>
                    <input
                      value={durationPeriod}
                      onChange={(event) => setDurationPeriod(event.target.value)}
                      className="w-full rounded-[22px] bg-white px-5 py-4 text-sm font-medium outline-none ring-1 ring-[#f1e7cf] placeholder:text-gray-400"
                      placeholder="Ex: 4 horas, cerimônia + recepção"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 flex items-center gap-2 text-sm font-extrabold">
                      Valor da proposta
                    </span>
                    <input
                      value={proposalValue}
                      onChange={(event) => setProposalValue(event.target.value)}
                      className="w-full rounded-[22px] bg-white px-5 py-4 text-sm font-medium outline-none ring-1 ring-[#f1e7cf] placeholder:text-gray-400"
                      placeholder="Ex: R$ 2.500,00"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 flex items-center gap-2 text-sm font-extrabold">
                      Forma de pagamento
                    </span>
                    <input
                      value={paymentTerms}
                      onChange={(event) => setPaymentTerms(event.target.value)}
                      className="w-full rounded-[22px] bg-white px-5 py-4 text-sm font-medium outline-none ring-1 ring-[#f1e7cf] placeholder:text-gray-400"
                      placeholder="Ex: 2x de R$ 1.250,00"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 flex items-center gap-2 text-sm font-extrabold">
                      Validade da proposta
                    </span>
                    <input
                      value={proposalValidity}
                      onChange={(event) => setProposalValidity(event.target.value)}
                      className="w-full rounded-[22px] bg-white px-5 py-4 text-sm font-medium outline-none ring-1 ring-[#f1e7cf] placeholder:text-gray-400"
                      placeholder="Ex: 7 dias"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 flex items-center gap-2 text-sm font-extrabold">
                      Observações
                    </span>
                    <textarea
                      value={observations}
                      onChange={(event) => setObservations(event.target.value)}
                      className="min-h-[130px] w-full resize-none rounded-[22px] bg-white px-5 py-4 text-sm font-medium outline-none ring-1 ring-[#f1e7cf] placeholder:text-gray-400"
                      placeholder="Inclua detalhes, itens inclusos, deslocamento, horários, condições..."
                    />
                  </label>

                  {errorMessage && (
                    <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                      {errorMessage}
                    </div>
                  )}

                  {successMessage && (
                    <div className="rounded-2xl bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
                      {successMessage}
                    </div>
                  )}

                  <div className="sticky bottom-4 z-30 mt-7 rounded-[28px] bg-[#fbf7f1]/95 p-3 shadow-[0_-10px_30px_rgba(0,0,0,.10)] backdrop-blur">
                    <button
                      type="submit"
                      disabled={sending || subscriptionAccess.blocked}
                      className="flex w-full items-center justify-center gap-2 rounded-[24px] bg-[#e3a925] py-4 text-center font-extrabold text-white shadow-lg disabled:opacity-60"
                    >
                      {isAdjustmentRequested ? (
                        <RefreshCcw size={21} />
                      ) : (
                        <Send size={21} />
                      )}
                      {subscriptionAccess.blocked
                        ? 'Plano necessário para responder'
                        : sending
                          ? 'Enviando...'
                          : isAdjustmentRequested
                            ? 'Enviar proposta revisada'
                            : 'Enviar orçamento'}
                    </button>

                    <Link
                      href={`/orcamentos/${leadId}/chat`}
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-[24px] bg-black py-4 text-center font-extrabold text-white shadow-lg"
                    >
                      <MessageCircle size={21} />
                      Conversar no chat
                    </Link>
                  </div>
                </form>

                <p className="mt-3 text-center text-xs leading-5 text-gray-500">
                  Depois de enviado, a cliente poderá abrir o orçamento dentro do app,
                  aceitar, solicitar ajuste ou baixar PDF.
                </p>
              </section>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
