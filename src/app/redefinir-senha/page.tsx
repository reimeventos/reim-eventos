'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function RedefinirSenhaPage() {
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [checkingLink, setCheckingLink] = useState(true);
  const [linkValid, setLinkValid] = useState(false);
  const [loading, setLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    let mounted = true;

    async function prepareRecoverySession() {
      try {
        setCheckingLink(true);
        setErrorMessage('');

        const params = new URLSearchParams(window.location.search);

        const code = params.get('code');
        const tokenHash = params.get('token_hash');
        const type = params.get('type');

        /*
         * CASO 1:
         * O Supabase devolveu um código PKCE na URL.
         */
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            throw error;
          }

          if (mounted) {
            setLinkValid(true);
          }

          return;
        }

        /*
         * CASO 2:
         * O e-mail personalizado trouxe token_hash + type=recovery.
         */
        if (tokenHash && type === 'recovery') {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: 'recovery',
          });

          if (error) {
            throw error;
          }

          if (mounted) {
            setLinkValid(true);
          }

          return;
        }

        /*
         * CASO 3:
         * O link do Supabase já criou a sessão automaticamente
         * antes de abrir esta página.
         */
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (session?.user) {
          if (mounted) {
            setLinkValid(true);
          }

          return;
        }

        /*
         * Nenhuma sessão ou token de recuperação válido encontrado.
         */
        if (mounted) {
          setLinkValid(false);
          setErrorMessage(
            'Este link de recuperação é inválido ou expirou. Solicite um novo link para redefinir sua senha.'
          );
        }
      } catch (error: any) {
        console.error('Erro ao validar recuperação de senha:', error);

        if (!mounted) return;

        const message = String(error?.message || '').toLowerCase();

        if (
          message.includes('expired') ||
          message.includes('otp_expired') ||
          message.includes('invalid') ||
          message.includes('token')
        ) {
          setErrorMessage(
            'Este link de recuperação é inválido ou expirou. Solicite um novo link para redefinir sua senha.'
          );
        } else {
          setErrorMessage(
            error?.message ||
              'Não foi possível validar o link de recuperação de senha.'
          );
        }

        setLinkValid(false);
      } finally {
        if (mounted) {
          setCheckingLink(false);
        }
      }
    }

    prepareRecoverySession();

    /*
     * Também acompanha mudanças de autenticação.
     * Isso ajuda quando o Supabase cria a sessão através
     * do evento PASSWORD_RECOVERY.
     */
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === 'PASSWORD_RECOVERY' && session?.user) {
        setLinkValid(true);
        setErrorMessage('');
        setCheckingLink(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage('');
    setSuccessMessage('');

    if (!linkValid) {
      setErrorMessage(
        'Este link de recuperação não é mais válido. Solicite um novo link.'
      );
      return;
    }

    if (!password) {
      setErrorMessage('Informe sua nova senha.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('A nova senha precisa ter pelo menos 6 caracteres.');
      return;
    }

    if (!confirmPassword) {
      setErrorMessage('Confirme sua nova senha.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('As senhas não são iguais.');
      return;
    }

    try {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error(
          'Sua sessão de recuperação expirou. Solicite um novo link.'
        );
      }

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        throw error;
      }

      setSuccessMessage('Senha alterada com sucesso!');
      setPassword('');
      setConfirmPassword('');

      /*
       * Encerra a sessão temporária de recuperação.
       * Depois disso, o usuário fará login normalmente
       * usando a nova senha.
       */
      await supabase.auth.signOut();

      window.setTimeout(() => {
        router.replace('/login?senha_redefinida=1');
        router.refresh();
      }, 1800);
    } catch (error: any) {
      console.error('Erro ao redefinir senha:', error);

      const message = String(error?.message || '').toLowerCase();

      if (
        message.includes('same password') ||
        message.includes('different from the old password')
      ) {
        setErrorMessage(
          'Escolha uma nova senha diferente da senha utilizada anteriormente.'
        );
        return;
      }

      if (
        message.includes('session') ||
        message.includes('jwt') ||
        message.includes('expired')
      ) {
        setLinkValid(false);
        setErrorMessage(
          'Sua sessão de recuperação expirou. Solicite um novo link.'
        );
        return;
      }

      if (
        message.includes('password should be at least') ||
        message.includes('weak password')
      ) {
        setErrorMessage('A nova senha precisa ter pelo menos 6 caracteres.');
        return;
      }

      setErrorMessage(
        error?.message ||
          'Não foi possível alterar sua senha. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * TELA ENQUANTO VALIDA O LINK
   */
  if (checkingLink) {
    return (
      <main className="min-h-screen bg-black text-[#151515]">
        <div className="mx-auto flex min-h-screen w-full max-w-[430px] items-center justify-center bg-[#fbf7f1] px-6 text-center shadow-2xl">
          <div className="w-full rounded-[30px] bg-white p-7 shadow-xl ring-1 ring-[#f1e7cf]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e3a925] text-white shadow-lg">
              <Loader2 size={34} className="animate-spin" />
            </div>

            <h1 className="mt-5 font-serif text-[30px] leading-tight text-[#151515]">
              REIM EVENTOS
            </h1>

            <p className="mt-3 text-sm font-bold leading-6 text-gray-500">
              Validando seu link de recuperação...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-[#151515]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#fbf7f1] shadow-2xl">
        <section className="relative flex min-h-screen items-center justify-center px-6 py-10">
          <div className="absolute inset-0 bg-[url('/layout01-fundo.png')] bg-cover bg-center opacity-20" />

          <div className="absolute inset-0 bg-gradient-to-b from-[#fbf7f1]/90 via-[#fbf7f1]/95 to-[#fbf7f1]" />

          <div className="relative z-10 w-full">
            {/* CABEÇALHO */}
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e3a925] text-white shadow-lg">
                <KeyRound size={34} />
              </div>

              <h1 className="font-serif text-[36px] leading-tight text-[#151515]">
                REIM EVENTOS
              </h1>

              <p className="mt-2 text-sm font-bold text-gray-500">
                Redefinição de senha
              </p>
            </div>

            {/* LINK INVÁLIDO OU EXPIRADO */}
            {!linkValid ? (
              <div className="rounded-[30px] bg-white p-6 text-center shadow-xl ring-1 ring-[#f1e7cf]">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
                  <AlertCircle size={34} />
                </div>

                <h2 className="mt-5 text-xl font-extrabold text-[#151515]">
                  Link inválido ou expirado
                </h2>

                <p className="mt-3 text-sm font-medium leading-6 text-gray-500">
                  {errorMessage ||
                    'Este link de recuperação não pode mais ser utilizado.'}
                </p>

                <Link
                  href="/esqueci-senha"
                  className="mt-6 flex w-full items-center justify-center rounded-2xl bg-[#e3a925] px-5 py-4 text-sm font-extrabold text-white shadow-lg transition active:scale-[0.98]"
                >
                  Solicitar novo link
                </Link>

                <Link
                  href="/login"
                  className="mt-3 flex w-full items-center justify-center rounded-2xl bg-[#151515] px-5 py-4 text-sm font-extrabold text-white transition active:scale-[0.98]"
                >
                  Voltar para o login
                </Link>
              </div>
            ) : (
              /* FORMULÁRIO DE NOVA SENHA */
              <div className="rounded-[30px] bg-white p-6 shadow-xl ring-1 ring-[#f1e7cf]">
                <div className="mb-5 text-center">
                  <Lock
                    size={34}
                    className="mx-auto text-[#d99200]"
                    strokeWidth={2.2}
                  />

                  <h2 className="mt-3 text-xl font-extrabold text-[#151515]">
                    Crie sua nova senha
                  </h2>

                  <p className="mt-2 text-sm font-medium leading-6 text-gray-500">
                    Digite uma nova senha para acessar sua conta no REIM EVENTOS.
                  </p>
                </div>

                <form onSubmit={handleSubmit}>
                  {/* NOVA SENHA */}
                  <label className="mb-2 block text-xs font-extrabold uppercase tracking-wide text-gray-500">
                    Nova senha
                  </label>

                  <div className="relative">
                    <Lock
                      size={20}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#d99200]"
                    />

                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Digite sua nova senha"
                      autoComplete="new-password"
                      disabled={loading}
                      className="w-full rounded-2xl border border-[#f1e7cf] bg-[#fbf7f1] py-4 pl-12 pr-12 text-sm font-bold text-[#151515] outline-none placeholder:font-medium placeholder:text-gray-400 focus:border-[#e3a925] disabled:opacity-60"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      disabled={loading}
                      aria-label={
                        showPassword ? 'Ocultar senha' : 'Mostrar senha'
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showPassword ? (
                        <EyeOff size={21} />
                      ) : (
                        <Eye size={21} />
                      )}
                    </button>
                  </div>

                  <p className="mt-2 text-xs font-medium text-gray-400">
                    Use pelo menos 6 caracteres.
                  </p>

                  {/* CONFIRMAR NOVA SENHA */}
                  <label className="mb-2 mt-5 block text-xs font-extrabold uppercase tracking-wide text-gray-500">
                    Confirmar nova senha
                  </label>

                  <div className="relative">
                    <Lock
                      size={20}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#d99200]"
                    />

                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      placeholder="Digite novamente sua senha"
                      autoComplete="new-password"
                      disabled={loading}
                      className="w-full rounded-2xl border border-[#f1e7cf] bg-[#fbf7f1] py-4 pl-12 pr-12 text-sm font-bold text-[#151515] outline-none placeholder:font-medium placeholder:text-gray-400 focus:border-[#e3a925] disabled:opacity-60"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword((current) => !current)
                      }
                      disabled={loading}
                      aria-label={
                        showConfirmPassword
                          ? 'Ocultar confirmação de senha'
                          : 'Mostrar confirmação de senha'
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={21} />
                      ) : (
                        <Eye size={21} />
                      )}
                    </button>
                  </div>

                  {/* ERRO */}
                  {errorMessage && (
                    <div className="mt-5 flex items-start gap-3 rounded-2xl bg-red-50 p-4 text-sm font-bold leading-5 text-red-700 ring-1 ring-red-100">
                      <AlertCircle
                        size={20}
                        className="mt-0.5 shrink-0"
                      />

                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* SUCESSO */}
                  {successMessage && (
                    <div className="mt-5 flex items-start gap-3 rounded-2xl bg-green-50 p-4 text-sm font-bold leading-5 text-green-700 ring-1 ring-green-100">
                      <CheckCircle2
                        size={20}
                        className="mt-0.5 shrink-0"
                      />

                      <span>
                        {successMessage} Você será direcionado para o login.
                      </span>
                    </div>
                  )}

                  {/* BOTÃO */}
                  <button
                    type="submit"
                    disabled={loading || Boolean(successMessage)}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#e3a925] px-5 py-4 text-sm font-extrabold text-white shadow-lg transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Alterando senha...
                      </>
                    ) : successMessage ? (
                      <>
                        <CheckCircle2 size={20} />
                        Senha alterada
                      </>
                    ) : (
                      <>
                        <KeyRound size={20} />
                        Salvar nova senha
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-5 border-t border-[#f1e7cf] pt-5 text-center">
                  <Link
                    href="/login"
                    className="text-sm font-extrabold text-[#d99200]"
                  >
                    Voltar para o login
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
