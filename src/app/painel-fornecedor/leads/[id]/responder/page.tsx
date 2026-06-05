'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  AlertCircle,
  Building2,
  CalendarDays,
  FileText,
  MapPin,
  MessageCircle,
  Save,
  Send,
  User,
  Users,
  PartyPopper,
  RefreshCcw,
} from 'lucide-react';
import { createQuoteResponse, getSupplierLeadById } from '@/lib/suppliers';

export default function ResponderOrcamentoPage() {
  const params = useParams();
  const leadId = String(params.id || '');

  const [lead, setLead] = useState<any>(null);
  const [latestResponse, setLatestResponse] = useState<any>(null);
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
      .then((data) => {
        setLead(data);

        const responses = data?.quote_responses || [];
        const sortedResponses = [...responses].sort((a, b) => {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

        const last = sortedResponses[0] || null;
        setLatestResponse(last);

        setServiceOffered(last?.service_offered || data?.service_needed || '');
        setDurationPeriod(last?.duration_period || '');
        setProposalValue(last?.proposal_value || '');
        setPaymentTerms(last?.payment_terms || '');
        setProposalValidity(last?.proposal_validity || '');
        setObservations(last?.observations || '');
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
    if (status === 'aguardando_resposta') return 'Novo';
    if (status === 'respondido') return 'Respondido';
    if (status === 'ajuste_solicitado') return 'Ajuste solicitado';
    if (status === 'aceito') return 'Aceito';
    if (status === 'fechado') return 'Fechado';
    return status;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSuccessMessage('');
    setErrorMessage('');

    if (!leadId) {
      setErrorMessage('Pedido não identificado.');
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
  const isEventSpace = lead?.service_needed === 'Espaço de festa';
  const isAdjustmentRequested = status === 'ajuste_solicitado';
  const adjustmentNotes = latestResponse?.adjustment_notes || '';

  return (
    <main className="min-h-screen bg-black text-[#151515]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#fbf7f1] pb-10 shadow-2xl">
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

            <h1 className="mt-5 font-serif text-[34px] leading-tight">
              {isAdjustmentRequested ? 'Revisar orçamento' : 'Responder orçamento'}
            </h1>

            <p className="mt-2 text-sm text-white/70">
              {isAdjustmentRequested
                ? 'Edite a proposta conforme o ajuste solicitado pela cliente.'
                : 'Preencha a proposta para enviar ao cliente.'}
            </p>
          </div>
        </section>

        <section className="px-6 pt-6">
          <div className="rounded-[28px] bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,.08)]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-extrabold">Pedido recebido</h2>

              <span
                className={
                  isAdjustmentRequested
                    ? 'rounded-full bg-yellow-100 px-3 py-1 text-xs font-extrabold text-yellow-800'
                    : 'rounded-full bg-[#fff7e8] px-3 py-1 text-xs font-extrabold text-[#b97900]'
                }
              >
                {statusLabel(status)}
              </span>
            </div>

            {loadingLead ? (
              <p className="text-sm font-bold text-gray-500">
                Carregando pedido...
              </p>
            ) : (
              <>
                {isAdjustmentRequested && (
                  <div className="mb-4 rounded-2xl bg-yellow-50 p-4 ring-1 ring-yellow-200">
                    <p className="flex items-center gap-2 text-xs font-extrabold text-yellow-800">
                      <AlertCircle size={15} />
                      Cliente solicitou ajuste
                    </p>

                    <p className="mt-2 text-sm leading-5 text-yellow-900">
                      {adjustmentNotes || 'A cliente solicitou ajuste, mas não informou detalhes.'}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-[#fbf7f1] p-3">
                    <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                      <User size={14} className="text-[#d99200]" />
                      Cliente
                    </p>
                    <p className="mt-1 text-sm font-extrabold">{clientName}</p>
                  </div>

                  <div className="rounded-2xl bg-[#fbf7f1] p-3">
                    <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                      <PartyPopper size={14} className="text-[#d99200]" />
                      Tipo de evento
                    </p>
                    <p className="mt-1 text-sm font-extrabold">{eventType}</p>
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
                    <p className="mt-1 text-sm font-extrabold">{city}</p>
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
                      <MessageCircle size={14} className="text-[#d99200]" />
                      Status
                    </p>
                    <p className="mt-1 text-sm font-extrabold">
                      {statusLabel(status)}
                    </p>
                  </div>
                </div>

                <div className="mt-3 rounded-2xl bg-[#fbf7f1] p-3">
                  <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                    <Building2 size={14} className="text-[#d99200]" />
                    {isEventSpace ? 'Preferência de estrutura' : 'Espaço do evento'}
                  </p>
                  <p className="mt-1 text-sm font-extrabold">{eventSpace}</p>
                </div>

                <div className="mt-4">
                  <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                    <MessageCircle size={14} className="text-[#d99200]" />
                    Mensagem da cliente
                  </p>

                  <p className="mt-2 text-sm leading-5 text-gray-600">
                    {notes}
                  </p>
                </div>
              </>
            )}
          </div>
        </section>

        <section className="px-6 pt-6">
          <div className="mb-4">
            <h2 className="text-lg font-extrabold">
              {isAdjustmentRequested ? 'Revisar proposta' : 'Montar proposta'}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {isAdjustmentRequested
                ? 'Os dados abaixo foram preenchidos com a última proposta. Altere apenas o necessário.'
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

            <div className="mt-7 space-y-3">
              <button
                type="submit"
                disabled={sending}
                className="flex w-full items-center justify-center gap-2 rounded-[24px] bg-[#e3a925] py-4 text-center font-extrabold text-white shadow-lg disabled:opacity-60"
              >
                {isAdjustmentRequested ? <RefreshCcw size={21} /> : <Send size={21} />}
                {sending
                  ? 'Enviando...'
                  : isAdjustmentRequested
                    ? 'Enviar proposta revisada'
                    : 'Enviar orçamento'}
              </button>

              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-[24px] bg-black py-4 text-center font-extrabold text-white shadow-lg"
              >
                <Save size={21} />
                Salvar rascunho
              </button>
            </div>
          </form>

          <p className="mt-3 text-center text-xs leading-5 text-gray-500">
            Depois de enviado, a cliente poderá abrir o orçamento dentro do app,
            aceitar, solicitar ajuste ou baixar PDF.
          </p>
        </section>
      </div>
    </main>
  );
}
