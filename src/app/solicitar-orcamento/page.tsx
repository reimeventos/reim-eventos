'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Camera,
  MapPin,
  MessageCircle,
  PartyPopper,
  Send,
  User,
  Users,
} from 'lucide-react';
import { createQuoteRequest } from '../../lib/suppliers';

function SolicitarOrcamentoContent() {
  const searchParams = useSearchParams();
  const supplierId = searchParams.get('fornecedor') || '';

  const [customerName, setCustomerName] = useState('');
  const [customerWhatsapp, setCustomerWhatsapp] = useState('');
  const [eventType, setEventType] = useState('Casamento');
  const [eventDate, setEventDate] = useState('');
  const [eventCity, setEventCity] = useState('Eunápolis');
  const [eventSpace, setEventSpace] = useState('');
  const [structurePreference, setStructurePreference] = useState('Ainda não sei');
  const [guestsCount, setGuestsCount] = useState('');
  const [serviceNeeded, setServiceNeeded] = useState('Fotografia & Filmagem');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const isEventSpaceSupplier = serviceNeeded === 'Espaço de festa';

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSuccessMessage('');
    setErrorMessage('');

    if (!supplierId) {
      setErrorMessage('Fornecedor não identificado. Volte para a vitrine e clique em Solicitar orçamento novamente.');
      return;
    }

    if (!customerName.trim()) {
      setErrorMessage('Informe seu nome.');
      return;
    }

    if (!customerWhatsapp.trim()) {
      setErrorMessage('Informe seu WhatsApp.');
      return;
    }

    try {
      setLoading(true);

      await createQuoteRequest({
        supplier_id: supplierId,
        customer_name: customerName,
        customer_whatsapp: customerWhatsapp,
        event_type: eventType,
        event_date: eventDate || undefined,
        event_city: eventCity,
        event_space: isEventSpaceSupplier ? structurePreference : eventSpace,
        guests_count: guestsCount ? Number(guestsCount) : undefined,
        service_needed: serviceNeeded,
        notes: notes || (
          isEventSpaceSupplier
            ? 'Gostaria de consultar disponibilidade para a data informada e receber orçamento do espaço.'
            : ''
        ),
      });

      setSuccessMessage('Solicitação enviada com sucesso! O fornecedor poderá responder com um orçamento dentro do app.');

      setCustomerName('');
      setCustomerWhatsapp('');
      setEventType('Casamento');
      setEventDate('');
      setEventCity('Eunápolis');
      setEventSpace('');
      setStructurePreference('Ainda não sei');
      setGuestsCount('');
      setServiceNeeded('Fotografia & Filmagem');
      setNotes('');
    } catch (error) {
      console.error(error);
      setErrorMessage('Não foi possível enviar a solicitação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-[#151515]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#fbf7f1] pb-10 shadow-2xl">
        <section className="relative overflow-hidden rounded-b-[34px] bg-black px-6 pb-8 pt-7 text-white">
          <div className="absolute inset-0 bg-[url('/layout01-fundo.png')] bg-cover bg-center opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/80 to-black" />

          <div className="relative z-10">
            <Link
              href={supplierId ? `/fornecedor/${supplierId}` : '/buscar'}
              className="inline-flex items-center gap-2 text-sm font-bold text-[#e3a925]"
            >
              <ArrowLeft size={17} />
              Voltar
            </Link>

            <h1 className="mt-5 font-serif text-[34px] leading-tight">
              Solicitar orçamento
            </h1>

            <p className="mt-2 text-sm text-white/70">
              Envie os detalhes do seu evento para o fornecedor.
            </p>
          </div>
        </section>

        <section className="px-6 pt-6">
          <div className="rounded-[26px] bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,.08)]">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff7e8] text-[#d99200]">
                <Camera size={30} />
              </div>

              <div>
                <p className="text-xs font-bold text-gray-500">Fornecedor</p>
                <h2 className="text-lg font-extrabold">Studio Premium</h2>
                <p className="text-sm text-gray-500">{serviceNeeded}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-extrabold">
                <User size={17} className="text-[#d99200]" />
                Nome
              </span>
              <input
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                className="w-full rounded-[22px] bg-white px-5 py-4 text-sm font-medium outline-none ring-1 ring-[#f1e7cf] placeholder:text-gray-400"
                placeholder="Seu nome"
              />
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-extrabold">
                <MessageCircle size={17} className="text-[#d99200]" />
                WhatsApp
              </span>
              <input
                value={customerWhatsapp}
                onChange={(event) => setCustomerWhatsapp(event.target.value)}
                className="w-full rounded-[22px] bg-white px-5 py-4 text-sm font-medium outline-none ring-1 ring-[#f1e7cf] placeholder:text-gray-400"
                placeholder="(73) 99999-9999"
              />
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-extrabold">
                <PartyPopper size={17} className="text-[#d99200]" />
                Tipo de evento
              </span>
              <select
                value={eventType}
                onChange={(event) => setEventType(event.target.value)}
                className="w-full rounded-[22px] bg-white px-5 py-4 text-sm font-medium outline-none ring-1 ring-[#f1e7cf]"
              >
                <option>Casamento</option>
                <option>Aniversário</option>
                <option>Debutante</option>
                <option>Evento corporativo</option>
                <option>Formatura</option>
                <option>Batizado</option>
                <option>Chá revelação</option>
                <option>Outro</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-extrabold">
                <Camera size={17} className="text-[#d99200]" />
                Serviço desejado
              </span>
              <select
                value={serviceNeeded}
                onChange={(event) => setServiceNeeded(event.target.value)}
                className="w-full rounded-[22px] bg-white px-5 py-4 text-sm font-medium outline-none ring-1 ring-[#f1e7cf]"
              >
                <option>Fotografia & Filmagem</option>
                <option>Buffet</option>
                <option>Decoração</option>
                <option>Som e iluminação</option>
                <option>Cabine & Totem</option>
                <option>Cerimonial</option>
                <option>Espaço de festa</option>
                <option>Outro serviço</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-extrabold">
                <CalendarDays size={17} className="text-[#d99200]" />
                Data do evento
              </span>
              <input
                type="date"
                value={eventDate}
                onChange={(event) => setEventDate(event.target.value)}
                className="w-full rounded-[22px] bg-white px-5 py-4 text-sm font-medium outline-none ring-1 ring-[#f1e7cf]"
              />
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-extrabold">
                <MapPin size={17} className="text-[#d99200]" />
                Cidade do evento
              </span>
              <input
                value={eventCity}
                onChange={(event) => setEventCity(event.target.value)}
                className="w-full rounded-[22px] bg-white px-5 py-4 text-sm font-medium outline-none ring-1 ring-[#f1e7cf] placeholder:text-gray-400"
                placeholder="Ex: Eunápolis"
              />
            </label>

            {isEventSpaceSupplier ? (
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-extrabold">
                  <Building2 size={17} className="text-[#d99200]" />
                  Preferência de estrutura
                </span>
                <select
                  value={structurePreference}
                  onChange={(event) => setStructurePreference(event.target.value)}
                  className="w-full rounded-[22px] bg-white px-5 py-4 text-sm font-medium outline-none ring-1 ring-[#f1e7cf]"
                >
                  <option>Salão fechado</option>
                  <option>Área ao ar livre</option>
                  <option>Espaço com piscina</option>
                  <option>Cerimônia e recepção no mesmo local</option>
                  <option>Espaço com hospedagem</option>
                  <option>Ainda não sei</option>
                </select>

                <p className="mt-2 text-xs leading-5 text-gray-500">
                  Para espaços de evento, o cliente consulta disponibilidade da data e orçamento do local.
                </p>
              </label>
            ) : (
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-extrabold">
                  <Building2 size={17} className="text-[#d99200]" />
                  Espaço do evento
                </span>
                <input
                  value={eventSpace}
                  onChange={(event) => setEventSpace(event.target.value)}
                  className="w-full rounded-[22px] bg-white px-5 py-4 text-sm font-medium outline-none ring-1 ring-[#f1e7cf] placeholder:text-gray-400"
                  placeholder="Ex: Espaço Villa Real, clube, fazenda..."
                />
              </label>
            )}

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-extrabold">
                <Users size={17} className="text-[#d99200]" />
                Quantidade de convidados
              </span>
              <input
                type="number"
                value={guestsCount}
                onChange={(event) => setGuestsCount(event.target.value)}
                className="w-full rounded-[22px] bg-white px-5 py-4 text-sm font-medium outline-none ring-1 ring-[#f1e7cf] placeholder:text-gray-400"
                placeholder="Ex: 150"
              />
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-extrabold">
                <MessageCircle size={17} className="text-[#d99200]" />
                Mensagem para o fornecedor
              </span>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className="min-h-[130px] w-full resize-none rounded-[22px] bg-white px-5 py-4 text-sm font-medium outline-none ring-1 ring-[#f1e7cf] placeholder:text-gray-400"
                placeholder={
                  isEventSpaceSupplier
                    ? 'Ex: Gostaria de saber se o espaço está disponível para essa data e qual o orçamento...'
                    : 'Conte um pouco sobre seu evento...'
                }
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

            <button
              type="submit"
              disabled={loading}
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-[24px] bg-[#e3a925] py-4 text-center font-extrabold text-white shadow-lg disabled:opacity-60"
            >
              <Send size={21} />
              {loading ? 'Enviando...' : 'Enviar solicitação'}
            </button>
          </form>

          <p className="mt-3 text-center text-xs leading-5 text-gray-500">
            O fornecedor receberá seu pedido e poderá responder com um orçamento dentro do app.
          </p>
        </section>
      </div>
    </main>
  );
}

export default function SolicitarOrcamentoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fbf7f1] p-6">Carregando...</div>}>
      <SolicitarOrcamentoContent />
    </Suspense>
  );
}
