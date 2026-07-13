'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Lock, LogIn, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [redirectTo, setRedirectTo] = useState('/perfil');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const redirectParam = params.get('redirect') || '';
    const emailParam = params.get('email') || '';

    if (redirectParam && redirectParam.startsWith('/')) {
      setRedirectTo(redirectParam);
    } else {
      setRedirectTo('/perfil');
    }

    if (emailParam) {
      setEmail(emailParam.trim().toLowerCase());
    }
  }, []);

  useEffect(() => {
    async function checkSession() {
      try {
        const { data } = await supabase.auth.getUser();

        if (data.user) {
          router.replace('/perfil');
          return;
        }
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
      } finally {
        setCheckingSession(false);
      }
    }

    checkSession();
  }, [router]);

  function getCadastroHref() {
    const params = new URLSearchParams();

    if (redirectTo) {
      params.set('redirect', redirectTo);
    }

    if (email.trim()) {
      params.set('email', email.trim().toLowerCase());
    }

    if (redirectTo.includes('/cerimonialista/convites')) {
      params.set('type', 'cerimonialista');
    }

    const query = params.toString();

    return query ? '/cadastro?' + query : '/cadastro';
  }

  function getForgotPasswordHref() {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      return '/esqueci-senha';
    }

    return '/esqueci-senha?email=' + encodeURIComponent(cleanEmail);
  }

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage('Informe seu e-mail.');
      return;
    }

    if (!password.trim()) {
      setErrorMessage('Informe sua senha.');
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        throw error;
      }

      router.replace(redirectTo || '/perfil');
      router.refresh();
    } catch (error: any) {
      console.error('Erro ao fazer login:', error);

      const message = String(error?.message || '').toLowerCase();

      if (
        message.includes('invalid login credentials') ||
        message.includes('invalid credentials')
      ) {
        setErrorMessage('E-mail ou senha inválidos.');
      } else {
        setErrorMessage(error?.message || 'Não foi possível fazer login.');
      }
    } finally {
      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <main className="min-h-screen bg-black text-[#151515]">
        <div className="mx-auto flex min-h-screen w-full max-w-[430px] items-center justify-center bg-[#fbf7f1] px-6 text-center shadow-2xl">
          <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-[#f1e7cf]">
            <Lock size={38} className="mx-auto text-[#d99200]" />

            <p className="mt-3 text-sm font-bold text-gray-500">
              Verificando sessão...
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
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e3a925] text-white shadow-lg">
                <Lock size={34} />
              </div>

              <h1 className="font-serif text-[36px] leading-tight text-[#151515]">
                REIM EVENTOS
              </h1>

              <p className="mt-2 text-sm font-bold text-gray-500">
                Entre para acessar sua conta.
              </p>
            </div>

            {redirectTo.includes('/cerimonialista/convites') && (
              <div className="mb-5 rounded-[24px] bg-[#151515] px-5 py-4 text-white shadow-lg">
                <p className="text-sm font-extrabold text-[#e3a925]">
                  Convite de cerimonialista
                </p>

                <p className="mt-2 text-xs leading-5 text-white/75">
                  Entre com sua conta ou crie uma nova usando o e-mail informado
                  no convite.
                </p>
              </div>
            )}

            <form
              onSubmit={handleLogin}
              className="rounded-[30px] bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,.08)] ring-1 ring-[#f1e7cf]"
            >
              <h2 className="text-xl font-extrabold">Entrar</h2>

              <label className="mt-5 block">
                <span className="mb-2 flex items-center gap-2 text-sm font-extrabold">
                  <Mail size={17} className="text-[#d99200]" />
                  E-mail
                </span>

                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-[22px] bg-[#fbf7f1] px-5 py-4 text-sm font-medium outline-none ring-1 ring-[#f1e7cf] placeholder:text-gray-400"
                  placeholder="cliente@reimeventos.com"
                  autoComplete="email"
                />
              </label>

              <label className="mt-4 block">
                <span className="mb-2 flex items-center gap-2 text-sm font-extrabold">
                  <Lock size={17} className="text-[#d99200]" />
                  Senha
                </span>

                <div className="flex items-center rounded-[22px] bg-[#fbf7f1] px-5 py-4 ring-1 ring-[#f1e7cf]">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-gray-400"
                    placeholder="Sua senha"
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="ml-3 text-gray-500"
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </label>

              <div className="mt-3 text-right">
                <Link
                  href={getForgotPasswordHref()}
                  className="text-sm font-extrabold text-[#d99200]"
                >
                  Esqueci minha senha
                </Link>
              </div>

              {errorMessage && (
                <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-[24px] bg-[#e3a925] py-4 text-center font-extrabold text-white shadow-lg disabled:opacity-60"
              >
                <LogIn size={21} />
                {loading ? 'Entrando...' : 'Entrar'}
              </button>

              <div className="mt-4 rounded-[20px] bg-[#fbf7f1] px-4 py-3 text-center text-[11px] font-bold leading-5 text-gray-500 ring-1 ring-[#f1e7cf]">
                Ao entrar, você concorda com os{' '}
                <Link
                  href="/termos"
                  className="font-extrabold text-[#d99200] underline"
                >
                  Termos de Uso
                </Link>{' '}
                e com a{' '}
                <Link
                  href="/privacidade"
                  className="font-extrabold text-[#d99200] underline"
                >
                  Política de Privacidade
                </Link>{' '}
                do REIM EVENTOS.
              </div>

              <Link
                href={getCadastroHref()}
                className="mt-4 block text-center text-sm font-bold text-[#d99200]"
              >
                Criar conta
              </Link>
            </form>

            <div className="mt-5 rounded-[24px] bg-white px-4 py-4 text-center text-xs font-bold leading-5 text-gray-500 shadow-sm ring-1 ring-[#f1e7cf]">
              Após entrar, você será levado para a tela correta conforme sua conta.
            </div>

            <div className="mt-4 flex items-center justify-center gap-4 text-[11px] font-extrabold text-gray-500">
              <Link href="/termos" className="text-[#d99200]">
                Termos
              </Link>

              <span>•</span>

              <Link href="/privacidade" className="text-[#d99200]">
                Privacidade
              </Link>

              <span>•</span>

              <Link href="/seguranca" className="text-[#d99200]">
                Segurança
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
