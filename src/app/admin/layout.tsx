'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Lock, ShieldAlert, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const TEMP_ADMIN_EMAILS = [
  'admin@reimeventos.com',
  'roninho100@gmail.com',
];

function isAllowedAdmin(email: string, role?: string | null) {
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanRole = String(role || '').trim().toLowerCase();

  return (
    cleanRole === 'admin' ||
    cleanRole === 'administrador' ||
    TEMP_ADMIN_EMAILS.includes(cleanEmail)
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function checkAdminAccess() {
      try {
        setLoading(true);
        setErrorMessage('');

        const { data: userData, error: userError } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        const user = userData.user;

        if (!user) {
          router.replace('/login?redirect=/admin');
          return;
        }

        const email = user.email || '';
        setUserEmail(email);

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role,email,full_name')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) {
          console.error('Erro ao verificar perfil admin:', profileError);
        }

        const profileRole = profileData?.role || '';

        if (!isAllowedAdmin(email, profileRole)) {
          setAllowed(false);
          return;
        }

        setAllowed(true);
      } catch (error: any) {
        console.error('Erro ao validar acesso admin:', error);
        setAllowed(false);
        setErrorMessage(error?.message || 'Não foi possível validar seu acesso.');
      } finally {
        setLoading(false);
      }
    }

    checkAdminAccess();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-[#151515]">
        <div className="mx-auto flex min-h-screen w-full max-w-[430px] items-center justify-center bg-[#fbf7f1] px-6 text-center shadow-2xl">
          <div className="rounded-[30px] bg-white p-6 shadow-sm ring-1 ring-[#f1e7cf]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff7e8] text-[#d99200]">
              <Lock size={32} />
            </div>

            <h1 className="mt-4 text-xl font-extrabold">
              Verificando acesso
            </h1>

            <p className="mt-2 text-sm font-bold leading-5 text-gray-500">
              Aguarde enquanto validamos sua permissão de administrador.
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!allowed) {
    return (
      <main className="min-h-screen bg-black text-[#151515]">
        <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#fbf7f1] pb-10 shadow-2xl">
          <section className="relative overflow-hidden rounded-b-[34px] bg-black px-6 pb-8 pt-7 text-white">
            <div className="absolute inset-0 bg-[url('/layout01-fundo.png')] bg-cover bg-center opacity-45" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/85 to-black" />

            <div className="relative z-10">
              <Link
                href="/perfil"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#e3a925]"
              >
                <ArrowLeft size={17} />
                Voltar
              </Link>

              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-600 text-white shadow-lg">
                  <ShieldAlert size={31} />
                </div>

                <div>
                  <p className="text-sm font-bold text-[#e3a925]">
                    Área restrita
                  </p>

                  <h1 className="font-serif text-[31px] leading-tight">
                    Acesso negado
                  </h1>

                  <p className="mt-1 text-sm text-white/70">
                    Esta área é exclusiva para administradores do REIM.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="px-6 pt-6">
            <div className="rounded-[30px] bg-white p-5 shadow-sm ring-1 ring-[#f1e7cf]">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                  <Lock size={27} />
                </div>

                <div>
                  <h2 className="text-lg font-extrabold">
                    Você não tem permissão de Admin
                  </h2>

                  <p className="mt-2 text-sm leading-5 text-gray-600">
                    Conta atual:{' '}
                    <span className="font-extrabold">
                      {userEmail || 'não identificada'}
                    </span>
                  </p>

                  {errorMessage && (
                    <p className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-xs font-bold leading-5 text-red-700">
                      {errorMessage}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <Link
                  href="/perfil"
                  className="rounded-[22px] bg-[#151515] px-4 py-3 text-center text-xs font-extrabold text-white"
                >
                  Ir para perfil
                </Link>

                <button
                  type="button"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    router.push('/login?redirect=/admin');
                    router.refresh();
                  }}
                  className="rounded-[22px] bg-[#e3a925] px-4 py-3 text-center text-xs font-extrabold text-white"
                >
                  Trocar conta
                </button>
              </div>
            </div>

            <div className="mt-5 rounded-[24px] bg-[#fff7e8] p-4 text-xs font-bold leading-5 text-[#8a6100] ring-1 ring-[#f1e7cf]">
              Para liberar o acesso, o perfil do usuário precisa ter{' '}
              <span className="font-extrabold">role = admin</span> na tabela{' '}
              <span className="font-extrabold">profiles</span>.
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <>
      <div className="hidden">
        <ShieldCheck />
      </div>
      {children}
    </>
  );
}
