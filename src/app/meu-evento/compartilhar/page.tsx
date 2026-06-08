'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  Heart,
  Mail,
  Send,
  ShieldCheck,
  UserPlus,
  Users,
} from 'lucide-react';
import { inviteEventCollaborator } from '@/lib/collaborators';

export default function CompartilharEventoPage() {
  const [collaboratorName, setCollaboratorName] = useState('');
  const [collaboratorEmail, setCollaboratorEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

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
    } catch (error: any) {
      console.error('Erro ao enviar convite:', error);
      setErrorMessage(
        error?.message || 'Não foi possível enviar o convite.'
      );
    } finally {
      setSending(false);
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
