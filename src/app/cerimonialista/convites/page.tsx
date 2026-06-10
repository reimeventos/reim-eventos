'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  Heart,
  Mail,
  Send,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import {
  inviteEventCollaborator,
  listEventCollaborators,
  removeEventCollaborator,
} from '@/lib/collaborators';

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

function getCollaboratorName(item: any) {
  return (
    item?.collaborator_name ||
    item?.suppliers?.business_name ||
    item?.collaborator_email ||
    'Cerimonialista'
  );
}

export default function CompartilharEventoPage() {
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [removingId, setRemovingId] = useState('');

  const [collaboratorName, setCollaboratorName] = useState('');
  const [collaboratorEmail, setCollaboratorEmail] = useState('');

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  async function loadCollaborators() {
    try {
      setLoading(true);
      setErrorMessage('');

      const data = await listEventCollaborators();
      setCollaborators(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar colaboradores:', error);
      setErrorMessage(
        error?.message || 'Não foi possível carregar os colaboradores.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCollaborators();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSuccessMessage('');
    setErrorMessage('');

    if (!collaboratorEmail.trim()) {
      setErrorMessage('Informe o e-mail da cerimonialista.');
      return;
    }

    try {
      setSending(true);

      await inviteEventCollaborator({
        collaborator_name: collaboratorName,
        collaborator_email: collaboratorEmail,
        role: 'cerimonialista',
      });

      setSuccessMessage('Convite enviado com sucesso!');
      setCollaboratorName('');
      setCollaboratorEmail('');

      await loadCollaborators();
    } catch (error: any) {
      console.error('Erro ao enviar convite:', error);
      setErrorMessage(error?.message || 'Não foi possível enviar o convite.');
    } finally {
      setSending(false);
    }
  }

  async function handleRemoveCollaborator(id: string) {
    try {
      setRemovingId(id);
      setSuccessMessage('');
      setErrorMessage('');

      await removeEventCollaborator(id);
      await loadCollaborators();

      setSuccessMessage('Cerimonialista removida do evento.');
    } catch (error: any) {
      console.error('Erro ao remover cerimonialista:', error);
      setErrorMessage(
        error?.message || 'Não foi possível remover a cerimonialista.'
      );
    } finally {
      setRemovingId('');
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
                <UserPlus size={31} />
              </div>

              <div>
                <h1 className="font-serif text-[31px] leading-tight">
                  Compartilhar evento
                </h1>

                <p className="mt-1 text-sm text-white/70">
                  Convide sua cerimonialista para ajudar na organização.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 pt-6">
          <div className="rounded-[28px] bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,.08)] ring-1 ring-[#f1e7cf]">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff7e8] text-[#d99200]">
                <ShieldCheck size={30} />
              </div>

              <div className="flex-1">
                <h2 className="text-lg font-extrabold">
                  Permissão da cerimonialista
                </h2>

                <p className="mt-1 text-sm leading-5 text-gray-600">
                  A cerimonialista poderá colaborar no evento, ajudar na lista de fornecedores e acompanhar os orçamentos.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 pt-6">
          <form
            onSubmit={handleSubmit}
            className="rounded-[28px] bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,.08)] ring-1 ring-[#f1e7cf]"
          >
            <h2 className="text-lg font-extrabold">Enviar convite</h2>

            <label className="mt-4 block">
              <span className="mb-2 flex items-center gap-2 text-sm font-extrabold">
                <Users size={17} className="text-[#d99200]" />
                Nome da cerimonialista
              </span>

              <input
                value={collaboratorName}
                onChange={(event) => setCollaboratorName(event.target.value)}
                className="w-full rounded-[22px] bg-[#fbf7f1] px-5 py-4 text-sm font-medium outline-none ring-1 ring-[#f1e7cf] placeholder:text-gray-400"
                placeholder="Ex: Ana Cerimonial"
              />
            </label>

            <label className="mt-4 block">
              <span className="mb-2 flex items-center gap-2 text-sm font-extrabold">
                <Mail size={17} className="text-[#d99200]" />
                E-mail
              </span>

              <input
                type="email"
                value={collaboratorEmail}
                onChange={(event) => setCollaboratorEmail(event.target.value)}
                className="w-full rounded-[22px] bg-[#fbf7f1] px-5 py-4 text-sm font-medium outline-none ring-1 ring-[#f1e7cf] placeholder:text-gray-400"
                placeholder="cerimonialista@email.com"
              />
            </label>

            {errorMessage && (
              <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="mt-4 flex items-center gap-2 rounded-2xl bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
                <CheckCircle2 size={18} />
                {successMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={sending}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-[24px] bg-[#e3a925] py-4 text-center font-extrabold text-white shadow-lg disabled:opacity-60"
            >
              <Send size={21} />
              {sending ? 'Enviando...' : 'Enviar convite'}
            </button>
          </form>
        </section>

        <section className="px-6 pt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-extrabold">Cerimonialistas convidadas</h2>

            <button
              type="button"
              onClick={loadCollaborators}
              className="rounded-full bg-[#fff7e8] px-3 py-1 text-xs font-extrabold text-[#b97900]"
            >
              {loading ? 'Carregando...' : `${collaborators.length} convite(s)`}
            </button>
          </div>

          {loading && (
            <div className="rounded-[28px] bg-white p-6 text-center shadow-sm ring-1 ring-[#f1e7cf]">
              <Heart size={36} className="mx-auto text-[#d99200]" />
              <p className="mt-3 text-sm font-bold text-gray-500">
                Carregando convites...
              </p>
            </div>
          )}

          {!loading && collaborators.length === 0 && (
            <div className="rounded-[28px] bg-white p-6 text-center shadow-sm ring-1 ring-[#f1e7cf]">
              <UserPlus size={38} className="mx-auto text-[#d99200]" />

              <h3 className="mt-4 text-lg font-extrabold">
                Nenhuma cerimonialista convidada
              </h3>

              <p className="mt-2 text-sm leading-5 text-gray-500">
                Envie um convite para permitir colaboração no evento.
              </p>
            </div>
          )}

          <div className="space-y-4">
            {collaborators.map((item) => (
              <div
                key={item.id}
                className="rounded-[28px] bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,.08)] ring-1 ring-[#f1e7cf]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-extrabold">
                      {getCollaboratorName(item)}
                    </h3>

                    <p className="mt-1 break-all text-sm font-bold text-gray-500">
                      {item.collaborator_email}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-extrabold ${statusClass(
                      item.status
                    )}`}
                  >
                    {statusLabel(item.status)}
                  </span>
                </div>

                <p className="mt-3 text-xs font-bold text-gray-500">
                  Permissão: {item.role || 'cerimonialista'}
                </p>

                <button
                  type="button"
                  onClick={() => handleRemoveCollaborator(item.id)}
                  disabled={removingId === item.id}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-[20px] bg-white py-3 text-center text-sm font-extrabold text-red-700 ring-1 ring-red-100 disabled:opacity-60"
                >
                  <Trash2 size={17} />
                  {removingId === item.id
                    ? 'Removendo...'
                    : 'Remover cerimonialista'}
                </button>
              </div>
            ))}
          </div>

          <Link
            href="/meu-evento"
            className="mt-6 block rounded-[24px] bg-black py-4 text-center font-extrabold text-white shadow-lg"
          >
            Voltar para Meu Evento
          </Link>
        </section>
      </div>
    </main>
  );
}
