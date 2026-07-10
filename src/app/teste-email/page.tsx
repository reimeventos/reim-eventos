'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Mail,
  Send,
  AlertCircle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function TesteEmailPage() {
  const [sending, setSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');

  async function handleSendTestEmail() {
    try {
      setSending(true);
      setSuccessMessage('');
      setErrorMessage('');
      setRecipientEmail('');

      const {
        data: sessionData,
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      const session = sessionData.session;

      if (!session?.access_token) {
        throw new Error(
          'Sessão não encontrada. Faça login novamente.'
        );
      }

      const response = await fetch('/api/email/test', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            'Não foi possível enviar o e-mail de teste.'
        );
      }

      setRecipientEmail(data?.recipient || '');

      setSuccessMessage(
        'E-mail enviado com sucesso. Verifique a caixa de entrada e também a pasta de spam.'
      );
    } catch (error: any) {
      console.error(
        'Erro ao enviar e-mail de teste:',
        error
      );

      setErrorMessage(
        error?.message ||
          'Não foi possível enviar o e-mail de teste.'
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

          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/85 to-black" />

          <div className="relative z-10">
            <Link
              href="/painel-fornecedor"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#e3a925]"
            >
              <ArrowLeft size={17} />
              Voltar
            </Link>

            <div className="mt-6">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#e3a925]">
                REIM EVENTOS
              </p>

              <h1 className="mt-2 font-serif text-[34px] leading-tight">
                Teste de e-mail
              </h1>

              <p className="mt-2 text-sm leading-5 text-white/70">
                Envie uma mensagem de teste para o e-mail da conta que está
                conectada ao aplicativo.
              </p>
            </div>
          </div>
        </section>

        <section className="px-6 pt-6">
          <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-[#f1e7cf]">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#fff7e8] text-[#d99200]">
                <Mail size={26} />
              </div>

              <div>
                <h2 className="text-lg font-extrabold">
                  Primeiro envio real
                </h2>

                <p className="mt-2 text-sm leading-5 text-gray-600">
                  O teste será enviado por:
                </p>

                <p className="mt-1 text-sm font-extrabold text-[#d99200]">
                  contato@reimeventos.com.br
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-[22px] bg-[#fbf7f1] p-4 ring-1 ring-[#f1e7cf]">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                Destinatário
              </p>

              <p className="mt-2 text-sm font-bold text-[#151515]">
                E-mail da conta atualmente logada
              </p>
            </div>

            <button
              type="button"
              onClick={handleSendTestEmail}
              disabled={sending}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-[22px] bg-[#e3a925] py-4 text-sm font-extrabold text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
            >
              {sending ? (
                <>
                  <Loader2
                    size={19}
                    className="animate-spin"
                  />
                  Enviando...
                </>
              ) : (
                <>
                  <Send size={19} />
                  Enviar e-mail de teste
                </>
              )}
            </button>
          </div>

          {successMessage && (
            <div className="mt-5 rounded-[24px] bg-green-50 p-4 ring-1 ring-green-100">
              <div className="flex items-start gap-3">
                <CheckCircle2
                  size={22}
                  className="mt-0.5 shrink-0 text-green-600"
                />

                <div>
                  <p className="text-sm font-extrabold text-green-700">
                    Envio concluído
                  </p>

                  <p className="mt-1 text-sm leading-5 text-green-700">
                    {successMessage}
                  </p>

                  {recipientEmail && (
                    <p className="mt-2 break-all text-xs font-bold text-green-800">
                      Destinatário: {recipientEmail}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="mt-5 rounded-[24px] bg-red-50 p-4 ring-1 ring-red-100">
              <div className="flex items-start gap-3">
                <AlertCircle
                  size={22}
                  className="mt-0.5 shrink-0 text-red-600"
                />

                <div>
                  <p className="text-sm font-extrabold text-red-700">
                    Falha no envio
                  </p>

                  <p className="mt-1 text-sm leading-5 text-red-700">
                    {errorMessage}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-5 rounded-[24px] bg-black p-5 text-white shadow-xl">
            <h2 className="text-base font-extrabold">
              Antes do teste
            </h2>

            <p className="mt-2 text-sm leading-6 text-white/70">
              Confirme no Resend se o domínio
              <strong className="text-[#e3a925]">
                {' '}reimeventos.com.br{' '}
              </strong>
              já aparece como verificado.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
