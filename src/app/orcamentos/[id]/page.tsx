'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  Download,
  FileText,
  MessageCircle,
  RefreshCcw,
  ShieldCheck,
  User,
} from 'lucide-react';
import {
  acceptQuoteResponse,
  getQuoteResponseByRequestId,
  requestQuoteAdjustment,
} from '@/lib/suppliers';
import { supabase } from '@/lib/supabase';

function isCerimonialistaCategory(categoryName?: string) {
  const normalized = String(categoryName || '').toLowerCase();

  return (
    normalized.includes('cerimonial') ||
    normalized.includes('cerimonialista') ||
    normalized.includes('assessoria')
  );
}

function getOriginInfo(origin: any) {
  const role = origin?.created_by_role || 'cliente';
  const name = origin?.created_by_name || '';
  const email = origin?.created_by_email || '';

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

export default function OrcamentoRecebidoPage() {
  const params = useParams();
  const requestId = String(params.id || '');

  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [adjusting, setAdjusting] = useState(false);
  const [invitingCerimonial, setInvitingCerimonial] = useState(false);
  const [cerimonialInviteStatus, setCerimonialInviteStatus] = useState('');
  const [quoteRequestOrigin, setQuoteRequestOrigin] = useState<any>(null);
  const [showAdjustmentBox, setShowAdjustmentBox] = useState(false);
  const [adjustmentNotes, setAdjustmentNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!requestId) return;

    async function loadQuote() {
      try {
        setLoading(true);
        setErrorMessage('');

        const data = await getQuoteResponseByRequestId(requestId);

        setQuote(data);
        setAdjustmentNotes(data?.adjustment_notes || '');

        const { data: originData, error: originError } = await supabase
          .from('quote_requests')
          .select('created_by_user_id,created_by_role,created_by_name,created_by_email')
          .eq('id', requestId)
          .maybeSingle();

        if (originError) {
          console.error('Erro ao carregar origem do orçamento:', originError);
          setQuoteRequestOrigin(null);
        } else {
          setQuoteRequestOrigin(originData || null);
        }

        if (data?.status === 'aceito') {
          await loadCerimonialInviteStatus(data);
        }
      } catch (error) {
        console.error('Erro ao carregar orçamento:', error);
        setErrorMessage(
          'Orçamento ainda não encontrado ou não respondido pelo fornecedor.'
        );
      } finally {
        setLoading(false);
      }
    }

    loadQuote();
  }, [requestId]);

  async function getMyEvent() {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      throw new Error('Login necessário.');
    }

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .or(`client_id.eq.${user.id},customer_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data?.id) {
      throw new Error('Evento do cliente não encontrado.');
    }

    return {
      user,
      event: data,
    };
  }

  async function getSupplierWithOwner(supplierId: string) {
    const { data: supplier, error: supplierError } = await supabase
      .from('suppliers')
      .select(`
        id,
        business_name,
        owner_id,
        categories(name, slug)
      `)
      .eq('id', supplierId)
      .maybeSingle();

    if (supplierError) {
      throw supplierError;
    }

    if (!supplier?.id) {
      throw new Error('Fornecedor não encontrado.');
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id,email,full_name')
      .eq('id', supplier.owner_id)
      .maybeSingle();

    if (profileError) {
      throw profileError;
    }

    if (!profile?.email) {
      throw new Error(
        'Este fornecedor ainda não possui e-mail de perfil vinculado.'
      );
    }

    return {
      supplier,
      profile,
    };
  }

  async function loadCerimonialInviteStatus(quoteData?: any) {
    try {
      const currentQuote = quoteData || quote;

      if (!currentQuote?.supplier_id) return;

      const { event } = await getMyEvent();

      const { data, error } = await supabase
        .from('event_collaborators')
        .select('id,status,supplier_id')
        .eq('event_id', event.id)
        .eq('supplier_id', currentQuote.supplier_id)
        .maybeSingle();

      if (error) {
        console.error('Erro ao verificar convite da cerimonialista:', error);
        return;
      }

      setCerimonialInviteStatus(data?.status || '');
    } catch (error) {
      console.error('Erro ao carregar status da atuação:', error);
    }
  }

  async function handleInviteCerimonialistaToEvent() {
    setSuccessMessage('');
    setErrorMessage('');

    if (!quote?.supplier_id) {
      setErrorMessage('Fornecedor não identificado.');
      return;
    }

    try {
      setInvitingCerimonial(true);

      const { user, event } = await getMyEvent();
      const { supplier, profile } = await getSupplierWithOwner(quote.supplier_id);

      const ownerId = event.customer_id || event.client_id || user.id;

      const ownerName =
        event.couple_name ||
        event.event_name ||
        event.title ||
        'Cliente';

      const { error } = await supabase.from('event_collaborators').upsert(
        {
          event_id: event.id,
          owner_id: ownerId,
          owner_email: user.email || '',
          owner_name: ownerName,
          collaborator_email: String(profile.email).toLowerCase(),
          collaborator_name:
            supplier.business_name ||
            profile.full_name ||
            'Cerimonialista',
          role: 'cerimonialista',
          status: 'aceito',
          supplier_id: supplier.id,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'event_id,collaborator_email',
        }
      );

      if (error) {
        throw error;
      }

      setCerimonialInviteStatus('aceito');

      setSuccessMessage(
        'Cerimonialista autorizado para atuar neste evento.'
      );
    } catch (error: any) {
      console.error('Erro ao convidar cerimonialista:', error);

      setErrorMessage(
        error?.message ||
          'Não foi possível convidar este cerimonialista para atuar no evento.'
      );
    } finally {
      setInvitingCerimonial(false);
    }
  }

  function formatDateTime(date?: string) {
    if (!date) return 'Data não informada';

    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  function handleDownloadPdf() {
    window.print();
  }

  async function handleAcceptQuote() {
    setSuccessMessage('');
    setErrorMessage('');

    if (!quote?.id || !requestId) {
      setErrorMessage('Orçamento não identificado.');
      return;
    }

    try {
      setAccepting(true);

      await acceptQuoteResponse({
        quote_response_id: quote.id,
        quote_request_id: requestId,
      });

      const updatedQuote = {
        ...quote,
        status: 'aceito',
      };

      setQuote(updatedQuote);
      setShowAdjustmentBox(false);
      setSuccessMessage(
        'Orçamento aceito com sucesso! O fornecedor será informado pelo app.'
      );

      await loadCerimonialInviteStatus(updatedQuote);
    } catch (error) {
      console.error(error);
      setErrorMessage('Não foi possível aceitar o orçamento. Tente novamente.');
    } finally {
      setAccepting(false);
    }
  }

  async function handleRequestAdjustment() {
    setSuccessMessage('');
    setErrorMessage('');

    if (!quote?.id || !requestId) {
      setErrorMessage('Orçamento não identificado.');
      return;
    }

    if (!adjustmentNotes.trim()) {
      setErrorMessage('Descreva o ajuste que você deseja solicitar.');
      return;
    }

    try {
      setAdjusting(true);

      await requestQuoteAdjustment({
        quote_response_id: quote.id,
        quote_request_id: requestId,
        adjustment_notes: adjustmentNotes,
      });

      setQuote({
        ...quote,
        status: 'ajuste_solicitado',
        adjustment_notes: adjustmentNotes,
        adjustment_requested_at: new Date().toISOString(),
      });

      setSuccessMessage(
        'Solicitação de ajuste enviada com sucesso! O fornecedor poderá revisar a proposta.'
      );
    } catch (error) {
      console.error(error);
      setErrorMessage('Não foi possível solicitar ajuste. Tente novamente.');
    } finally {
      setAdjusting(false);
    }
  }

  const supplierName = quote?.suppliers?.business_name || 'Fornecedor';
  const supplierCity = quote?.suppliers?.city || 'Cidade não informada';
  const supplierCategory =
    quote?.suppliers?.categories?.name || 'Fornecedor de eventos';
  const supplierWhatsapp = quote?.suppliers?.whatsapp || '';
  const supplierInstagram = quote?.suppliers?.instagram || '';

  const quoteStatus = quote?.status || 'enviado';
  const isAccepted = quoteStatus === 'aceito';
  const isAdjustmentRequested = quoteStatus === 'ajuste_solicitado';
  const isCerimonialista = isCerimonialistaCategory(supplierCategory);
  const isCerimonialAlreadyAuthorized = cerimonialInviteStatus === 'aceito';

  const budgetCode = requestId
    ? `ORC-${requestId.slice(0, 8).toUpperCase()}`
    : 'ORC-REIM';

  function statusLabel() {
    if (isAccepted) return 'Aceito';
    if (isAdjustmentRequested) return 'Ajuste solicitado';
    return 'Respondido';
  }

  function statusColors() {
    if (isAccepted) {
      return {
        bg: '#dcfce7',
        color: '#166534',
        border: '#86efac',
      };
    }

    if (isAdjustmentRequested) {
      return {
        bg: '#fef9c3',
        color: '#854d0e',
        border: '#fde68a',
      };
    }

    return {
      bg: '#e8fff2',
      color: '#166534',
      border: '#bbf7d0',
    };
  }

  const printStatus = statusColors();
  const originInfo = getOriginInfo(quoteRequestOrigin);
  const OriginIcon = originInfo.icon;

  return (
    <>
      <style jsx global>{`
        .print-area {
          display: none;
        }

        @media print {
          @page {
            size: A4;
            margin: 0;
          }

          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
          }

          body * {
            visibility: hidden !important;
          }

          .print-area,
          .print-area * {
            visibility: visible !important;
          }

          .print-area {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            min-height: 100vh !important;
            background: #ffffff !important;
            color: #151515 !important;
            font-family: Arial, Helvetica, sans-serif !important;
          }

          .screen-area {
            display: none !important;
          }

          .print-area > div {
            min-height: auto !important;
            padding: 0 34px 16px !important;
          }

          .print-area header {
            padding: 16px 34px !important;
            border-bottom-width: 4px !important;
          }

          .print-area header > div > div:first-child > div:nth-child(2) {
            font-size: 28px !important;
            margin-top: 6px !important;
          }

          .print-area header > div > div:first-child > div:nth-child(3) {
            font-size: 11px !important;
            margin-top: 4px !important;
          }

          .print-area header > div > div:last-child {
            min-width: 125px !important;
            padding: 10px 12px !important;
            border-radius: 16px !important;
          }

          .print-area header > div > div:last-child > div:nth-child(1) {
            font-size: 22px !important;
          }

          .print-area header > div > div:last-child > div:nth-child(2) {
            font-size: 23px !important;
          }

          .print-area section {
            margin-top: 12px !important;
          }

          .print-area section:first-of-type {
            padding-top: 14px !important;
          }

          .print-area h1 {
            font-size: 23px !important;
          }

          .print-area p {
            margin-top: 5px !important;
          }

          .print-area section,
          .print-area footer {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          .print-area [style*='padding: 18px'] {
            padding: 11px !important;
          }

          .print-area [style*='padding: 16px'] {
            padding: 11px !important;
          }

          .print-area [style*='padding: 14px'] {
            padding: 9px !important;
          }

          .print-area [style*='gap: 12'] {
            gap: 8px !important;
          }

          .print-area [style*='gap: 20'] {
            gap: 12px !important;
          }

          .print-area [style*='font-size: 35'] {
            font-size: 28px !important;
          }

          .print-area [style*='font-size: 30'] {
            font-size: 23px !important;
          }

          .print-area [style*='font-size: 28'] {
            font-size: 23px !important;
          }

          .print-area [style*='font-size: 26'] {
            font-size: 21px !important;
          }

          .print-area [style*='font-size: 16'] {
            font-size: 14px !important;
          }

          .print-area [style*='font-size: 15'] {
            font-size: 13px !important;
          }

          .print-area [style*='font-size: 14'] {
            font-size: 12px !important;
          }

          .print-area [style*='marginTop: 22'] {
            margin-top: 12px !important;
          }

          .print-area footer {
            margin-top: 12px !important;
            padding-top: 9px !important;
          }
        }
      `}</style>

      <main className="screen-area min-h-screen bg-black text-[#151515]">
        <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#fbf7f1] pb-10 shadow-2xl">
          <section className="relative overflow-hidden rounded-b-[34px] bg-black px-6 pb-8 pt-7 text-white">
            <div className="absolute inset-0 bg-[url('/layout01-fundo.png')] bg-cover bg-center opacity-45" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/85 to-black" />

            <div className="relative z-10">
              <Link
                href="/orcamentos"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#e3a925]"
              >
                <ArrowLeft size={17} />
                Voltar
              </Link>

              <h1 className="mt-5 font-serif text-[34px] leading-tight">
                Orçamento recebido
              </h1>

              <p className="mt-2 text-sm text-white/70">
                Veja a proposta enviada pelo fornecedor.
              </p>
            </div>
          </section>

          <section className="px-6 pt-6">
            {loading && (
              <div className="rounded-[28px] bg-white p-6 text-center shadow-sm ring-1 ring-[#f1e7cf]">
                <p className="text-sm font-bold text-gray-500">
                  Carregando orçamento...
                </p>
              </div>
            )}

            {!loading && errorMessage && !quote && (
              <div className="rounded-[28px] bg-white p-6 text-center shadow-sm ring-1 ring-[#f1e7cf]">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#fff7e8] text-[#d99200]">
                  <FileText size={32} />
                </div>

                <h2 className="mt-4 text-lg font-extrabold">
                  Orçamento não disponível
                </h2>

                <p className="mt-2 text-sm leading-5 text-gray-500">
                  {errorMessage}
                </p>

                <Link
                  href="/buscar"
                  className="mt-5 flex items-center justify-center gap-2 rounded-[22px] bg-[#e3a925] py-4 text-center font-extrabold text-white shadow-lg"
                >
                  Buscar fornecedores
                </Link>
              </div>
            )}

            {!loading && quote && (
              <>
                <div className="rounded-[28px] bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,.08)]">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff7e8] text-[#d99200]">
                      <Building2 size={30} />
                    </div>

                    <div>
                      <p className="text-xs font-bold text-gray-500">
                        Fornecedor
                      </p>
                      <h2 className="text-lg font-extrabold">{supplierName}</h2>
                      <p className="text-sm text-gray-500">{supplierCategory}</p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl bg-[#fbf7f1] p-3">
                    <p className="text-xs font-bold text-gray-500">Cidade</p>
                    <p className="mt-1 text-sm font-extrabold">{supplierCity}</p>
                  </div>
                </div>

                <div
                  className={`mt-5 rounded-[28px] p-5 shadow-sm ring-1 ${originInfo.className}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/70">
                      <OriginIcon size={30} />
                    </div>

                    <div className="flex-1">
                      <p className="text-xs font-bold opacity-80">
                        Origem da solicitação
                      </p>

                      <h2 className="mt-1 text-lg font-extrabold">
                        {originInfo.label}
                      </h2>

                      {originInfo.detail && (
                        <p className="mt-2 break-all text-sm font-bold opacity-80">
                          {originInfo.detail}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-[28px] bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,.08)]">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-extrabold">Proposta</h2>

                    <span
                      className={
                        isAccepted
                          ? 'rounded-full bg-green-100 px-3 py-1 text-xs font-extrabold text-green-700'
                          : isAdjustmentRequested
                            ? 'rounded-full bg-yellow-100 px-3 py-1 text-xs font-extrabold text-yellow-700'
                            : 'rounded-full bg-green-50 px-3 py-1 text-xs font-extrabold text-green-700'
                      }
                    >
                      {statusLabel()}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-2xl bg-[#fbf7f1] p-3">
                      <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                        <FileText size={14} className="text-[#d99200]" />
                        Serviço oferecido
                      </p>
                      <p className="mt-1 text-sm font-extrabold">
                        {quote.service_offered || 'Não informado'}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#fbf7f1] p-3">
                      <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                        <CalendarDays size={14} className="text-[#d99200]" />
                        Duração / período
                      </p>
                      <p className="mt-1 text-sm font-extrabold">
                        {quote.duration_period || 'Não informado'}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#fff7e8] p-4">
                      <p className="text-xs font-bold text-[#b97900]">
                        Valor da proposta
                      </p>
                      <p className="mt-1 text-2xl font-extrabold text-[#151515]">
                        {quote.proposal_value || 'Valor não informado'}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#fbf7f1] p-3">
                      <p className="text-xs font-bold text-gray-500">
                        Forma de pagamento
                      </p>
                      <p className="mt-1 text-sm font-extrabold">
                        {quote.payment_terms || 'Não informado'}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#fbf7f1] p-3">
                      <p className="text-xs font-bold text-gray-500">
                        Validade da proposta
                      </p>
                      <p className="mt-1 text-sm font-extrabold">
                        {quote.proposal_validity || 'Não informado'}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#fbf7f1] p-3">
                      <p className="text-xs font-bold text-gray-500">
                        Observações
                      </p>
                      <p className="mt-2 text-sm leading-5 text-gray-600">
                        {quote.observations || 'Sem observações adicionais.'}
                      </p>
                    </div>

                    {quote.adjustment_notes && (
                      <div className="rounded-2xl bg-yellow-50 p-3">
                        <p className="text-xs font-bold text-yellow-700">
                          Ajuste solicitado
                        </p>
                        <p className="mt-2 text-sm leading-5 text-yellow-800">
                          {quote.adjustment_notes}
                        </p>
                      </div>
                    )}

                    <div className="rounded-2xl bg-[#fbf7f1] p-3">
                      <p className="text-xs font-bold text-gray-500">
                        Enviado em
                      </p>
                      <p className="mt-1 text-sm font-extrabold">
                        {formatDateTime(quote.created_at)}
                      </p>
                    </div>
                  </div>
                </div>

                {isAccepted && isCerimonialista && (
                  <div className="mt-5 rounded-[28px] bg-[#151515] p-5 text-white shadow-lg">
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e3a925] text-white">
                        <ShieldCheck size={30} />
                      </div>

                      <div className="flex-1">
                        <h2 className="text-lg font-extrabold">
                          Cerimonialista contratado
                        </h2>

                        <p className="mt-2 text-sm leading-5 text-white/70">
                          Deseja permitir que este cerimonialista atue no seu evento dentro do REIM, ajudando a organizar fornecedores e acompanhar orçamentos?
                        </p>

                        {isCerimonialAlreadyAuthorized ? (
                          <div className="mt-4 rounded-2xl bg-green-50 px-4 py-3 text-sm font-extrabold text-green-700">
                            Cerimonialista já autorizado para atuar neste evento.
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={handleInviteCerimonialistaToEvent}
                            disabled={invitingCerimonial}
                            className="mt-4 flex w-full items-center justify-center gap-2 rounded-[22px] bg-[#e3a925] py-4 text-center font-extrabold text-white shadow-lg disabled:opacity-60"
                          >
                            <ShieldCheck size={21} />
                            {invitingCerimonial
                              ? 'Convidando...'
                              : 'Convidar para atuar no evento'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {errorMessage && (
                  <div className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                    {errorMessage}
                  </div>
                )}

                {successMessage && (
                  <div className="mt-5 rounded-2xl bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
                    {successMessage}
                  </div>
                )}

                {showAdjustmentBox && !isAccepted && (
                  <div className="mt-5 rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-[#f1e7cf]">
                    <h3 className="text-lg font-extrabold">
                      Solicitar ajuste
                    </h3>

                    <p className="mt-1 text-sm leading-5 text-gray-500">
                      Descreva o que você deseja alterar na proposta.
                    </p>

                    <textarea
                      value={adjustmentNotes}
                      onChange={(event) => setAdjustmentNotes(event.target.value)}
                      className="mt-4 min-h-[120px] w-full resize-none rounded-[22px] bg-[#fbf7f1] px-5 py-4 text-sm font-medium outline-none ring-1 ring-[#f1e7cf] placeholder:text-gray-400"
                      placeholder="Ex: Gostaria de ajustar a forma de pagamento, incluir mais horas ou revisar o valor..."
                    />

                    <button
                      onClick={handleRequestAdjustment}
                      disabled={adjusting}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-[24px] bg-[#e3a925] py-4 text-center font-extrabold text-white shadow-lg disabled:opacity-60"
                    >
                      <RefreshCcw size={21} />
                      {adjusting ? 'Enviando ajuste...' : 'Enviar pedido de ajuste'}
                    </button>
                  </div>
                )}

                <div className="mt-6 space-y-3">
                  <button
                    onClick={handleAcceptQuote}
                    disabled={accepting || isAccepted}
                    className="flex w-full items-center justify-center gap-2 rounded-[24px] bg-[#e3a925] py-4 text-center font-extrabold text-white shadow-lg disabled:opacity-60"
                  >
                    <CheckCircle2 size={21} />
                    {isAccepted
                      ? 'Orçamento aceito'
                      : accepting
                        ? 'Aceitando...'
                        : 'Aceitar orçamento'}
                  </button>

                  <button
                    onClick={() => {
                      setErrorMessage('');
                      setSuccessMessage('');
                      setShowAdjustmentBox(!showAdjustmentBox);
                    }}
                    disabled={isAccepted}
                    className="flex w-full items-center justify-center gap-2 rounded-[24px] bg-white py-4 text-center font-extrabold text-[#151515] shadow-sm ring-1 ring-[#f1e7cf] disabled:opacity-60"
                  >
                    <RefreshCcw size={21} />
                    {showAdjustmentBox ? 'Fechar ajuste' : 'Solicitar ajuste'}
                  </button>

                  <Link
                    href={`/orcamentos/${requestId}/chat`}
                    className="flex w-full items-center justify-center gap-2 rounded-[24px] bg-black py-4 text-center font-extrabold text-white shadow-lg"
                  >
                    <MessageCircle size={21} />
                    Conversar com fornecedor
                  </Link>

                  <button
                    onClick={handleDownloadPdf}
                    className="flex w-full items-center justify-center gap-2 rounded-[24px] bg-white py-4 text-center font-extrabold text-[#151515] shadow-sm ring-1 ring-[#f1e7cf]"
                  >
                    <Download size={21} />
                    Baixar PDF
                  </button>
                </div>

                <p className="mt-4 text-center text-xs leading-5 text-gray-500">
                  Você pode aceitar, pedir ajuste ou conversar com o fornecedor antes de fechar.
                </p>
              </>
            )}
          </section>
        </div>
      </main>

      {quote && (
        <div className="print-area">
          <div
            style={{
              minHeight: '100vh',
              background: '#ffffff',
              color: '#151515',
              padding: '0 42px 28px',
            }}
          >
            <header
              style={{
                marginLeft: -42,
                marginRight: -42,
                background:
                  'linear-gradient(135deg, #0f0f0f 0%, #1d1d1d 42%, #c89418 100%)',
                color: '#ffffff',
                padding: '26px 42px',
                borderBottom: '6px solid #e3a925',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 20,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 13,
                      letterSpacing: 5,
                      fontWeight: 700,
                      color: '#f7d67b',
                    }}
                  >
                    REIM EVENTOS
                  </div>

                  <div
                    style={{
                      marginTop: 10,
                      fontSize: 35,
                      fontWeight: 900,
                      lineHeight: 1.1,
                      color: '#ffffff',
                    }}
                  >
                    Orçamento Oficial
                  </div>

                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 13,
                      color: '#f3f3f3',
                    }}
                  >
                    Documento gerado pela plataforma REIM EVENTOS
                  </div>
                </div>

                <div
                  style={{
                    minWidth: 170,
                    border: '2px solid rgba(255,255,255,0.28)',
                    borderRadius: 20,
                    background: 'rgba(255,255,255,0.10)',
                    padding: '16px 18px',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      fontSize: 30,
                      lineHeight: 1,
                      color: '#f7d67b',
                    }}
                  >
                    ♕
                  </div>

                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 30,
                      lineHeight: 1,
                      fontWeight: 800,
                      letterSpacing: 2,
                      color: '#ffffff',
                      fontFamily: 'Georgia, Times New Roman, serif',
                    }}
                  >
                    REIM
                  </div>

                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 12,
                      letterSpacing: 4,
                      fontWeight: 700,
                      color: '#f7d67b',
                    }}
                  >
                    EVENTOS
                  </div>
                </div>
              </div>
            </header>

            <section style={{ paddingTop: 24 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 16,
                }}
              >
                <div>
                  <h1
                    style={{
                      margin: 0,
                      fontSize: 28,
                      fontWeight: 900,
                      color: '#151515',
                    }}
                  >
                    Proposta de Orçamento
                  </h1>

                  <p
                    style={{
                      marginTop: 8,
                      fontSize: 13,
                      color: '#555',
                      lineHeight: 1.5,
                    }}
                  >
                    Este orçamento foi emitido por um fornecedor cadastrado na plataforma{' '}
                    <strong>REIM EVENTOS</strong>.
                  </p>
                </div>

                <div
                  style={{
                    background: '#fff7e8',
                    border: '1px solid #e3a925',
                    borderRadius: 14,
                    padding: '12px 16px',
                    textAlign: 'right',
                    minWidth: 145,
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      color: '#9a6a00',
                    }}
                  >
                    Nº DO ORÇAMENTO
                  </div>
                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 16,
                      fontWeight: 900,
                      color: '#151515',
                    }}
                  >
                    {budgetCode}
                  </div>
                </div>
              </div>
            </section>

            <section
              style={{
                marginTop: 18,
                borderRadius: 18,
                overflow: 'hidden',
                border:
                  quoteRequestOrigin?.created_by_role === 'cerimonialista'
                    ? '1px solid #bbf7d0'
                    : '1px solid #e3a925',
              }}
            >
              <div
                style={{
                  background:
                    quoteRequestOrigin?.created_by_role === 'cerimonialista'
                      ? '#e8fff2'
                      : '#fff7e8',
                  padding: '14px 18px',
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color:
                      quoteRequestOrigin?.created_by_role === 'cerimonialista'
                        ? '#166534'
                        : '#9a6a00',
                  }}
                >
                  ORIGEM DA SOLICITAÇÃO
                </div>

                <div
                  style={{
                    marginTop: 5,
                    fontSize: 16,
                    fontWeight: 900,
                    color:
                      quoteRequestOrigin?.created_by_role === 'cerimonialista'
                        ? '#166534'
                        : '#151515',
                  }}
                >
                  {originInfo.label}
                </div>

                {originInfo.detail && (
                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 13,
                      color: '#555',
                    }}
                  >
                    {originInfo.detail}
                  </div>
                )}
              </div>
            </section>

            <section
              style={{
                marginTop: 22,
                borderRadius: 18,
                overflow: 'hidden',
                border: '1px solid #eadfca',
              }}
            >
              <div
                style={{
                  background: '#151515',
                  color: '#ffffff',
                  padding: '14px 18px',
                  fontSize: 16,
                  fontWeight: 800,
                }}
              >
                Dados do Fornecedor
              </div>

              <div
                style={{
                  background: '#ffffff',
                  padding: 18,
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 12,
                }}
              >
                <div
                  style={{
                    background: '#fbf7f1',
                    padding: 14,
                    borderRadius: 14,
                    border: '1px solid #f1e7cf',
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#8b8b8b' }}>
                    Fornecedor
                  </div>
                  <div style={{ marginTop: 5, fontSize: 16, fontWeight: 800 }}>
                    {supplierName}
                  </div>
                </div>

                <div
                  style={{
                    background: '#fbf7f1',
                    padding: 14,
                    borderRadius: 14,
                    border: '1px solid #f1e7cf',
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#8b8b8b' }}>
                    Categoria
                  </div>
                  <div style={{ marginTop: 5, fontSize: 16, fontWeight: 800 }}>
                    {supplierCategory}
                  </div>
                </div>

                <div
                  style={{
                    background: '#fbf7f1',
                    padding: 14,
                    borderRadius: 14,
                    border: '1px solid #f1e7cf',
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#8b8b8b' }}>
                    Cidade
                  </div>
                  <div style={{ marginTop: 5, fontSize: 16, fontWeight: 800 }}>
                    {supplierCity}
                  </div>
                </div>

                <div
                  style={{
                    background: printStatus.bg,
                    padding: 14,
                    borderRadius: 14,
                    border: `1px solid ${printStatus.border}`,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: printStatus.color,
                    }}
                  >
                    Status da proposta
                  </div>
                  <div
                    style={{
                      marginTop: 5,
                      fontSize: 16,
                      fontWeight: 800,
                      color: printStatus.color,
                    }}
                  >
                    {statusLabel()}
                  </div>
                </div>

                <div
                  style={{
                    gridColumn: '1 / -1',
                    background: isAccepted ? '#e8fff2' : '#fff7e8',
                    padding: 14,
                    borderRadius: 14,
                    border: isAccepted ? '1px solid #bbf7d0' : '1px solid #e3a925',
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: isAccepted ? '#166534' : '#9a6a00',
                    }}
                  >
                    Contato do fornecedor
                  </div>

                  {isAccepted ? (
                    <div style={{ marginTop: 6, fontSize: 14, lineHeight: 1.6 }}>
                      {supplierWhatsapp && <div><strong>WhatsApp:</strong> {supplierWhatsapp}</div>}
                      {supplierInstagram && <div><strong>Instagram:</strong> {supplierInstagram}</div>}
                      {!supplierWhatsapp && !supplierInstagram && (
                        <div>Contato direto não informado pelo fornecedor.</div>
                      )}
                    </div>
                  ) : (
                    <div style={{ marginTop: 6, fontSize: 14, lineHeight: 1.6 }}>
                      Contato direto disponível após aceitar o orçamento. Antes disso, converse pelo chat do app REIM EVENTOS.
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section
              style={{
                marginTop: 20,
                borderRadius: 18,
                overflow: 'hidden',
                border: '1px solid #eadfca',
              }}
            >
              <div
                style={{
                  background: '#e3a925',
                  color: '#151515',
                  padding: '14px 18px',
                  fontSize: 16,
                  fontWeight: 900,
                }}
              >
                Detalhes da Proposta
              </div>

              <div style={{ background: '#ffffff', padding: 18 }}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      background: '#fbf7f1',
                      borderRadius: 14,
                      padding: 14,
                      border: '1px solid #f1e7cf',
                    }}
                  >
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#8b8b8b' }}>
                      Serviço oferecido
                    </div>
                    <div style={{ marginTop: 5, fontSize: 15, fontWeight: 800 }}>
                      {quote.service_offered || 'Não informado'}
                    </div>
                  </div>

                  <div
                    style={{
                      background: '#fbf7f1',
                      borderRadius: 14,
                      padding: 14,
                      border: '1px solid #f1e7cf',
                    }}
                  >
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#8b8b8b' }}>
                      Duração / período
                    </div>
                    <div style={{ marginTop: 5, fontSize: 15, fontWeight: 800 }}>
                      {quote.duration_period || 'Não informado'}
                    </div>
                  </div>

                  <div
                    style={{
                      background: 'linear-gradient(135deg, #fff7e8 0%, #fce8b4 100%)',
                      borderRadius: 14,
                      padding: 16,
                      border: '1px solid #e3a925',
                    }}
                  >
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#9a6a00' }}>
                      Valor da proposta
                    </div>
                    <div
                      style={{
                        marginTop: 6,
                        fontSize: 26,
                        fontWeight: 900,
                      }}
                    >
                      {quote.proposal_value || 'Valor não informado'}
                    </div>
                  </div>

                  <div
                    style={{
                      background: '#fbf7f1',
                      borderRadius: 14,
                      padding: 14,
                      border: '1px solid #f1e7cf',
                    }}
                  >
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#8b8b8b' }}>
                      Forma de pagamento
                    </div>
                    <div style={{ marginTop: 5, fontSize: 15, fontWeight: 800 }}>
                      {quote.payment_terms || 'Não informado'}
                    </div>
                  </div>

                  <div
                    style={{
                      background: '#fbf7f1',
                      borderRadius: 14,
                      padding: 14,
                      border: '1px solid #f1e7cf',
                    }}
                  >
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#8b8b8b' }}>
                      Validade da proposta
                    </div>
                    <div style={{ marginTop: 5, fontSize: 15, fontWeight: 800 }}>
                      {quote.proposal_validity || 'Não informado'}
                    </div>
                  </div>

                  <div
                    style={{
                      background: '#fbf7f1',
                      borderRadius: 14,
                      padding: 14,
                      border: '1px solid #f1e7cf',
                    }}
                  >
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#8b8b8b' }}>
                      Enviado em
                    </div>
                    <div style={{ marginTop: 5, fontSize: 15, fontWeight: 800 }}>
                      {formatDateTime(quote.created_at)}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 12,
                    background: '#fbf7f1',
                    borderRadius: 14,
                    padding: 14,
                    border: '1px solid #f1e7cf',
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#8b8b8b' }}>
                    Observações
                  </div>
                  <div
                    style={{
                      marginTop: 7,
                      fontSize: 14,
                      lineHeight: 1.5,
                    }}
                  >
                    {quote.observations || 'Sem observações adicionais.'}
                  </div>
                </div>

                {quote.adjustment_notes && (
                  <div
                    style={{
                      marginTop: 12,
                      background: '#fff8db',
                      borderRadius: 14,
                      padding: 14,
                      border: '1px solid #f3d36b',
                    }}
                  >
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#9a6a00' }}>
                      Ajuste solicitado
                    </div>
                    <div
                      style={{
                        marginTop: 7,
                        fontSize: 14,
                        lineHeight: 1.5,
                        color: '#7a5800',
                      }}
                    >
                      {quote.adjustment_notes}
                    </div>
                  </div>
                )}
              </div>
            </section>

            <section
              style={{
                marginTop: 22,
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 20,
              }}
            >
              <div>
                <div
                  style={{
                    borderTop: '1px solid #151515',
                    paddingTop: 8,
                    textAlign: 'center',
                    fontSize: 12,
                    color: '#151515',
                  }}
                >
                  Assinatura do Cliente
                </div>
              </div>

              <div>
                <div
                  style={{
                    borderTop: '1px solid #151515',
                    paddingTop: 8,
                    textAlign: 'center',
                    fontSize: 12,
                    color: '#151515',
                  }}
                >
                  Assinatura do Fornecedor
                </div>
              </div>
            </section>

            <section
              style={{
                marginTop: 22,
                background: 'linear-gradient(135deg, #151515 0%, #2d2d2d 100%)',
                color: '#ffffff',
                borderRadius: 18,
                padding: 18,
              }}
            >
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 900,
                  color: '#f7d67b',
                }}
              >
                Informações importantes
              </div>

              <p
                style={{
                  margin: '8px 0 0',
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: '#f3f3f3',
                }}
              >
                Este documento registra a proposta enviada pelo fornecedor dentro do app REIM EVENTOS.
                A contratação, pagamento, prazos, execução do serviço e demais condições devem ser confirmados
                diretamente entre cliente e fornecedor.
              </p>
            </section>

            <footer
              style={{
                marginTop: 20,
                borderTop: '3px solid #e3a925',
                paddingTop: 14,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 20,
                fontSize: 11,
                color: '#444',
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight: 900,
                    color: '#151515',
                    letterSpacing: 1,
                  }}
                >
                  REIM EVENTOS
                </div>
                <div style={{ marginTop: 4 }}>
                  Todos os fornecedores do seu evento em um só lugar.
                </div>
                <div style={{ marginTop: 4 }}>
                  reimeventos.com.br • Eunápolis - BA
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div>
                  Gerado em {new Date().toLocaleDateString('pt-BR')}
                </div>
                <div style={{ marginTop: 4 }}>
                  Código do pedido: {requestId}
                </div>
                <div style={{ marginTop: 4 }}>
                  Nº {budgetCode}
                </div>
              </div>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}
