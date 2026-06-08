'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Heart,
  MapPin,
  ShieldCheck,
  UserCheck,
  XCircle,
  Users,
  Building2,
} from 'lucide-react';
import {
  acceptEventCollaboration,
  declineEventCollaboration,
  listMyCollaborationInvites,
} from '@/lib/collaborators';

function formatDate(date?: string) {
  if (!date) return 'Data não informada';

  const [year, month, day] = date.split('-');

  if (!year || !month || !day) return date;

  return `${day}/${month}/${year}`;
}

function getEventFromInvite(invite: any) {
  if (Array.isArray(invite.events)) {
    return invite.events[0] || null;
  }

  return invite.events || null;
}

function getEventTitle(event: any) {
  return event?.couple_name || event?.event_name || event?.title || 'Meu Evento';
}

function getEventCity(event: any) {
  return event?.event_city || event?.city || 'Cidade não informada';
}

function getGuestsCount(event: any) {
  return event?.guests_count || event?.guest_count || null;
}

function statusClass(status: string) {
  if (status === 'aceito') return 'bg-green-50 text-green-700';
  if (status === 'recusado') return 'bg-red-50 text-red-700';
  return 'bg-[#fff7e8] text-[#b97900]';
}

function statusLabel(status: string) {
  if (status === 'aceito') return 'Aceito';
  if (status === 'recusado') return 'Recusado';
  return 'Pendente';
}

export default function ConvitesCerimonialistaPage() {
  const [invites, setInvites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  async function loadInvites() {
    try {
      setLoading(true);
      setErrorMessage('');

      const data = await listMyCollaborationInvites();
      setInvites(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar convites:', error);
      setErrorMessage(
        error?.message ||
          'Não foi possível carregar os convites da cerimonialista.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInvites();
  }, []);

  async function handleAccept(id: string) {
    try {
      setUpdatingId(id);
      setSuccessMessage('');
      setErrorMessage('');

      await acceptEventCollaboration(id);
      await loadInvites();

      setSuccessMessage('Convite aceito com sucesso.');
    } catch (error: any) {
      console.error('Erro ao aceitar convite:', error);
      setErrorMessage(error?.message || 'Não foi possível aceitar o convite.');
    } finally {
      setUpdatingId('');
    }
  }

  async function handleDecline(id: string) {
    try {
      setUpdatingId(id);
      setSuccessMessage('');
      setErrorMessage('');

      await declineEventCollaboration(id);
      await loadInvites();

      setSuccessMessage('Convite recusado.');
    } catch (error: any) {
      console.error('Erro ao recusar convite:', error);
      setErrorMessage(error?.message || 'Não foi possível recusar o convite.');
    } finally {
      setUpdatingId('');
    }
  }

  const pendingCount = invites.filter((item) => item.status === 'pendente').length;
  const acceptedCount = invites.filter((item) => item.status === 'aceito').length;

  return (
    <main className="min-h-screen bg-black text-[#151515]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#fbf7f1] pb-10 shadow-2xl">
        <section className="relative overflow-hidden rounded-b-[34px] bg-black px-6 pb-8 pt-7 text-white">
          <div className="absolute inset-0 bg-[url('/layout01-fundo.png')] bg-cover bg-center opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/80 to-black" />

          <div className="relative z-10">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#e3a925]"
            >
              <ArrowLeft size={17} />
              Voltar
            </Link>

            <div className="mt-6 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e3a925] text-white shadow-lg">
                <ShieldCheck size={31} />
              </div>

              <div>
                <h1 className="font-serif text-[31px] leading-tight">
                  Convites
                </h1>

                <p className="mt-1 text-sm text-white/70">
                  Eventos compartilhados com você.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3 px-6 pt-6">
          <div className="rounded-[22px] bg-white p-4 text-center shadow-sm ring-1 ring-[#f1e7cf]">
            <p className="text-2xl font-extrabold text-[#d99200]">
              {pendingCount}
            </p>
            <p className="mt-1 text-[11px] font-bold text-gray-600">
              Pendentes
            </p>
          </div>

          <div className="rounded-[22px] bg-white p-4 text-center shadow-sm ring-1 ring-[#f1e7cf]">
            <p className="text-2xl font-extrabold text-green-600">
              {acceptedCount}
            </p>
            <p className="mt-1 text-[11px] font-bold text-gray-600">
              Aceitos
            </p>
          </div>
        </section>

        <section className="px-6 pt-6">
          {errorMessage && (
            <div className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 flex items-center gap-2 rounded-2xl bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
              <CheckCircle2 size={18} />
              {successMessage}
            </div>
          )}

          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-extrabold">Meus convites</h2>

            <button
              type="button"
              onClick={loadInvites}
              className="rounded-full bg-[#fff7e8] px-3 py-1 text-xs font-extrabold text-[#b97900]"
            >
              {loading ? 'Carregando...' : `${invites.length} convite(s)`}
            </button>
          </div>

          {loading && (
            <div className="rounded-[28px] bg-white p-6 text-center shadow-sm ring-1 ring-[#f1e7cf]">
              <Heart size={38} className="mx-auto text-[#d99200]" />
              <p className="mt-3 text-sm font-bold text-gray-500">
                Carregando convites...
              </p>
            </div>
          )}

          {!loading && invites.length === 0 && (
            <div className="rounded-[28px] bg-white p-6 text-center shadow-sm ring-1 ring-[#f1e7cf]">
              <ShieldCheck size={38} className="mx-auto text-[#d99200]" />

              <h3 className="mt-4 text-lg font-extrabold">
                Nenhum convite encontrado
              </h3>

              <p className="mt-2 text-sm leading-5 text-gray-500">
                Quando uma cliente compartilhar um evento com seu e-mail, o convite aparecerá aqui.
              </p>
            </div>
          )}

          <div className="space-y-4">
            {invites.map((invite) => {
              const event = getEventFromInvite(invite);
              const title = getEventTitle(event);
              const city = getEventCity(event);
              const guests = getGuestsCount(event);
              const eventDate = formatDate(event?.event_date);
              const eventSpace = event?.event_space || 'Não informado';
              const isPending = invite.status === 'pendente';
              const isAccepted = invite.status === 'aceito';

              return (
                <div
                  key={invite.id}
                  className="rounded-[28px] bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,.08)] ring-1 ring-[#f1e7cf]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-extrabold">{title}</h3>

                      <p className="mt-1 text-sm font-bold text-gray-500">
                        Permissão: {invite.role || 'cerimonialista'}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-extrabold ${statusClass(
                        invite.status
                      )}`}
                    >
                      {statusLabel(invite.status)}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
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
                      <p className="mt-1 text-sm font-extrabold">
                        {guests || 'Não informado'}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#fbf7f1] p-3">
                      <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                        <Building2 size={14} className="text-[#d99200]" />
                        Espaço
                      </p>
                      <p className="mt-1 line-clamp-1 text-sm font-extrabold">
                        {eventSpace}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    {isPending && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleAccept(invite.id)}
                          disabled={updatingId === invite.id}
                          className="flex w-full items-center justify-center gap-2 rounded-[22px] bg-[#e3a925] py-4 text-center font-extrabold text-white shadow-lg disabled:opacity-60"
                        >
                          <UserCheck size={21} />
                          {updatingId === invite.id
                            ? 'Aceitando...'
                            : 'Aceitar convite'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDecline(invite.id)}
                          disabled={updatingId === invite.id}
                          className="flex w-full items-center justify-center gap-2 rounded-[22px] bg-white py-4 text-center font-extrabold text-red-700 ring-1 ring-red-100 disabled:opacity-60"
                        >
                          <XCircle size={21} />
                          Recusar convite
                        </button>
                      </>
                    )}

                    {isAccepted && (
                      <Link
                        href="/meu-evento"
                        className="flex w-full items-center justify-center gap-2 rounded-[22px] bg-black py-4 text-center font-extrabold text-white shadow-lg"
                      >
                        <Heart size={21} />
                        Abrir evento
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
