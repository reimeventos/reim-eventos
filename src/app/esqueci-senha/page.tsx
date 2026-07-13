'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Loader2,
  LockKeyhole,
  Mail,
  Send,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get('email') || '';

    if (emailParam) {
      setEmail(emailParam.trim().toLowerCase());
    }
  }, []);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setSending(true);
      setSuccessMessage('');
      setErrorMessage('');

      const normalizedEmail = email.trim().toLowerCase();

      if (!normalizedEmail) {
        setErrorMessage(
          'Informe o e-mail cadastrado na sua conta.'
        );
        return;
      }

      const redirectTo =
        window.location.origin + '/redefinir-senha';

      const { error } =
        await supabase.auth.resetPasswordForEmail(
          normalizedEmail,
          {
            redirectTo,
          }
        );

      if (error) {
        throw error;
      }

      setSuccessMessage(
        'Se este e-mail estiver cadastrado, você receberá as instruções para redefinir sua senha.'
      );
    } catch (error: any) {
      console.error(
        'Erro ao solicitar recuperação de senha:',
        error
      );

      const message = String(
        error?.message || ''
      ).toLowerCase();

      if (
        message.includes('rate limit') ||
        message.includes('too many requests')
      ) {
        setErrorMessage(
          'Muitas tentativas foram realizadas. Aguarde alguns minutos e tente novamente.'
        );
      } else {
        setErrorMessage(
          error?.message ||
            'Não foi possível enviar o e-mail de recuperação.'
        );
      }
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
              href="/login"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#e3a925]"
            >
              <ArrowLeft size={17} />
              Voltar ao login
            </Link>

            <div className="mt-6">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#e3a925]">
                REIM EVENTOS
              </p>

              <h1 className="mt-2 font-serif text-[34px] leading-tight">
                Esqueci minha senha
              </h1>

              <p className="mt-2 text-sm leading-5 text-white/70">
                Informe o e-mail cadastrado para receber o link de redefinição.
              </p>
            </div>
          </div>
        </section>

        <section className="px-6 pt-6">
          <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-[#f1e7cf]">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#fff7e8] text-[#d99200]">
                <LockKeyhole size={26} />
              </div>

              <div>
                <h2 className="text-lg font-extrabold">
                  Redefinição de senha
                </h2>

                <p className="mt-2 text-sm leading-5 text-gray-600">
                  Enviaremos um link seguro para o e-mail da sua conta.
                </p>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-6"
            >
              <label
                htmlFor="email"
                className="text-sm font-extrabold text-[#151515]"
              >
                E-mail cadastrado
              </label>

              <div className="mt-2 flex items-center gap-3 rounded-[20px] bg-[#fbf7f1] px-4 ring-1 ring-[#f1e7cf] focus-within:ring-2 focus-within:ring-[#e3a925]">
                <Mail
                  size={19}
                  className="shrink-0 text-[#d99200]"
                />

                <input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="seuemail@exemplo.com"
                  disabled={sending}
                  className="w-full bg-transparent py-4 text-sm font-semibold text-[#151515] outline-none placeholder:text-gray-400 disabled:opacity-60"
                />
              </div>

              <button
                type="submit"
                disabled={
                  sending ||
                  !email.trim()
                }
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-[22px] bg-[#e3a925] py-4 text-sm font-extrabold text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sending ? (
                  <>
                    <Loader2
                      size={19}
                      className="animate-spin"
                    />
                    Enviando link...
                  </>
                ) : (
                  <>
                    <Send size={19} />
                    Enviar link de recuperação
                  </>
                )}
              </button>
            </form>
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
                    Solicitação recebida
                  </p>

                  <p className="mt-1 text-sm leading-5 text-green-700">
                    {successMessage}
                  </p>

                  <p className="mt-3 text-xs leading-5 text-green-700/80">
                    Confira também a pasta de spam ou lixo eletrônico.
                  </p>
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
                    Não foi possível enviar
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
              Segurança da sua conta
            </h2>

            <p className="mt-2 text-sm leading-6 text-white/70">
              O REIM EVENTOS nunca solicitará sua senha por e-mail, telefone ou mensagem.
            </p>

            <p className="mt-3 text-xs leading-5 text-white/50">
              O link recebido deve ser utilizado somente pelo titular da conta.
            </p>
          </div>

          <div className="mt-5 text-center">
            <Link
              href="/login"
              className="text-sm font-extrabold text-[#d99200]"
            >
              Lembrei minha senha
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
