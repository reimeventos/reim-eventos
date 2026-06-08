'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Heart,
  MapPin,
  PartyPopper,
  Save,
  Users,
  Building2,
  MessageCircle,
} from 'lucide-react';
import { getMyEvent, updateMyEvent } from '@/lib/events';

function formatDateForInput(date?: string) {
  if (!date) return '';

  if (date.includes('T')) {
    return date.split('T')[0];
  }

  return date;
}

export default function EditarMeuEventoPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [eventName, setEventName] = useState('');
  const [eventType, setEventType] = useState('Casamento');
  const [coupleName, setCoupleName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventCity, setEventCity] = useState('Eunápolis');
  const [guestsCount, setGuestsCount] = useState('');
  const [eventSpace, setEventSpace] = useState('');
  const [notes, setNotes] = useState('');

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function loadEvent() {
      try {
        setLoading(true);
        setErrorMessage('');

        const data = await getMyEvent();

        if (data) {
          setEventName(data.event_name || data.title || 'Meu Evento');
          setEventType(data.event_type || 'Casamento');
          setCoupleName(data.couple_name || '');
          setEventDate(formatDateForInput(data.event_date));
          setEventCity(data.event_city || data.city || 'Eunápolis');
          setGuestsCount(
            data.guests_count || data.guest_count
              ? String(data.guests_count || data.guest_count)
              : ''
          );
          setEventSpace(data.event_space || '');
          setNotes(data.notes || '');
        }
      } catch (error: any) {
        console.error('Erro ao carregar evento:', error);
        setErrorMessage(
          error?.message || 'Não foi possível carregar os dados do evento.'
        );
      } finally {
        setLoading(false);
      }
    }

    loadEvent();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSuccessMessage('');
    setErrorMessage('');

    if (!eventName.trim()) {
      setErrorMessage('Informe o nome do evento.');
      return;
    }

    try {
      setSaving(true);

      await updateMyEvent({
        event_name: eventName,
        title: 'Meu Evento',
        event_type: eventType,
        couple_name: coupleName,
        event_date: eventDate || undefined,
        event_city: eventCity,
        guests_count: guestsCount ? Number(guestsCount) : null,
        event_space: eventSpace,
        notes,
      });

      setSuccessMessage('Dados do evento atualizados com sucesso!');
    } catch (error: any) {
      console.error('Erro ao salvar evento:', error);
      setErrorMessage(
        error?.message || 'Não foi possível salvar os dados do evento.'
      );
    } finally {
      setSaving(false);
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
              href="/meu-evento"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#e3a925]"
            >
              <ArrowLeft size={17} />
              Voltar
            </Link>

            <div className="mt-6 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e3a925] text-white shadow-lg">
                <Heart size={31} />
              </div>

              <div>
                <h1 className="font-serif text-[32px] leading-tight">
                  Editar evento
                </h1>

                <p className="mt-1 text-sm text-white/70">
                  Atualize os dados principais do seu evento.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 pt-6">
          {loading && (
            <div className="rounded-[28px] bg-white p-6 text-center shadow-sm ring-1 ring-[#f1e7cf]">
              <Heart size={38} className="mx-auto text-[#d99200]" />
              <p className="mt-3 text-sm font-bold text-gray-600">
                Carregando dados do evento...
              </p>
            </div>
          )}

          {!loading && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-extrabold">
                  <Heart size={17} className="text-[#d99200]" />
                  Nome do evento
                </span>

                <input
                  value={eventName}
                  onChange={(event) => setEventName(event.target.value)}
                  className="w-full rounded-[22px] bg-white px-5 py-4 text-sm font-medium outline-none ring-1 ring-[#f1e7cf] placeholder:text-gray-400"
                  placeholder="Ex: Casamento Maria & João"
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
                  <Heart size={17} className="text-[#d99200]" />
                  Nome do casal / aniversariante
                </span>

                <input
                  value={coupleName}
                  onChange={(event) => setCoupleName(event.target.value)}
                  className="w-full rounded-[22px] bg-white px-5 py-4 text-sm font-medium outline-none ring-1 ring-[#f1e7cf] placeholder:text-gray-400"
                  placeholder="Ex: Maria & João"
                />
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

              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-extrabold">
                  <Users size={17} className="text-[#d99200]" />
                  Quantidade de convidados
                </span>

                <input
                  type="number"
                  min="1"
                  value={guestsCount}
                  onChange={(event) => setGuestsCount(event.target.value)}
                  className="w-full rounded-[22px] bg-white px-5 py-4 text-sm font-medium outline-none ring-1 ring-[#f1e7cf] placeholder:text-gray-400"
                  placeholder="Ex: 150"
                />
              </label>

              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-extrabold">
                  <Building2 size={17} className="text-[#d99200]" />
                  Espaço do evento
                </span>

                <input
                  value={eventSpace}
                  onChange={(event) => setEventSpace(event.target.value)}
                  className="w-full rounded-[22px] bg-white px-5 py-4 text-sm font-medium outline-none ring-1 ring-[#f1e7cf] placeholder:text-gray-400"
                  placeholder="Ex: Campo Verde"
                />
              </label>

              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-extrabold">
                  <MessageCircle size={17} className="text-[#d99200]" />
                  Observações
                </span>

                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  className="min-h-[120px] w-full resize-none rounded-[22px] bg-white px-5 py-4 text-sm font-medium outline-none ring-1 ring-[#f1e7cf] placeholder:text-gray-400"
                  placeholder="Ex: Preferências, horários, estilo do evento..."
                />
              </label>

              {errorMessage && (
                <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                  {errorMessage}
                </div>
              )}

              {successMessage && (
                <div className="flex items-center gap-2 rounded-2xl bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
                  <CheckCircle2 size={18} />
                  {successMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="mt-7 flex w-full items-center justify-center gap-2 rounded-[24px] bg-[#e3a925] py-4 text-center font-extrabold text-white shadow-lg disabled:opacity-60"
              >
                <Save size={21} />
                {saving ? 'Salvando...' : 'Salvar dados do evento'}
              </button>

              <Link
                href="/meu-evento"
                className="block rounded-[24px] bg-black py-4 text-center font-extrabold text-white shadow-lg"
              >
                Voltar para Meu Evento
              </Link>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
