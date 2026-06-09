'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Bell,
  Building2,
  CalendarHeart,
  Heart,
  LogIn,
  LogOut,
  Mail,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react';
import { Nav } from '@/components/Nav';
import { supabase } from '@/lib/supabase';

export default function PerfilPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [accountType, setAccountType] = useState('Cliente');
  const [supplierName, setSupplierName] = useState('');
  const [profileName, setProfileName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  async function loadUser() {
    try {
      setLoading(true);
      setErrorMessage('');

      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      const currentUser = userData.user;

      setUser(currentUser);

      if (!currentUser) {
        setAccountType('Visitante');
        return;
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (profileData?.full_name) {
        setProfileName(profileData.full_name);
      }

      const { data: suppliersData } = await supabase
        .from('suppliers')
        .select('business_name')
        .eq('owner_id', currentUser.id)
        .limit(1);

      if (suppliersData && suppliersData.length > 0) {
        setAccountType('Fornecedor');
        setSupplierName(suppliersData[0]?.business_name || '');
        return;
      }

      const { data: collaboratorData } = await supabase
        .from('event_collaborators')
        .select('id,status')
        .ilike('collaborator_email', currentUser.email || '')
        .limit(1);

      if (collaboratorData && collaboratorData.length > 0) {
        setAccountType('Cerimonialista');
        return;
      }

      setAccountType('Cliente');
    } catch (error: any) {
      console.error('Erro ao carregar perfil:', error);
      setErrorMessage(error?.message || 'Não foi possível carregar o perfil.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUser();
  }, []);

  async function handleSignOut() {
    try {
      setSigningOut(true);
      await supabase.auth.signOut();

      router.push('/login');
      router.refresh();
    } catch (error: any) {
      console.error('Erro ao sair:', error);
      setErrorMessage(error?.message || 'Não foi possível sair da conta.');
    } finally {
      setSigningOut(false);
    }
  }

  const email = user?.email || '';
  const displayName =
    profileName ||
    supplierName ||
    email ||
    'Usuário não logado';

  return (
    <main className="min-h-screen bg-black text-[#151515]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#fbf7f1] pb-28 shadow-2xl">
        <section className="relative overflow-hidden rounded-b-[34px] bg-black px-6 pb-8 pt-7 text-white">
          <div className="absolute inset-0 bg-[url('/layout01-fundo.png')] bg-cover bg-center opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/80 to-black" />

          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-[#e3a925]">
              <ArrowLeft size={17} />
              Voltar
            </Link>

            <div className="mt-6 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e3a925] text-white shadow-lg">
                <User size={31} />
              </div>

              <div>
                <h1 className="font-serif text-[34px] leading-tight">
                  Perfil
                </h1>
                <p className="mt-1 text-sm text-white/70">
                  Veja sua conta e acesse os testes.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 pt-6">
          {loading && (
            <div className="rounded-[28px] bg-white p-6 text-center shadow-sm ring-1 ring-[#f1e7cf]">
              <User size={38} className="mx-auto text-[#d99200]" />
              <p className="mt-3 text-sm font-bold text-gray-500">
                Carregando conta...
              </p>
            </div>
          )}

          {!loading && !user && (
            <div className="rounded-[28px] bg-white p-6 text-center shadow-[0_10px_25px_rgba(0,0,0,.08)] ring-1 ring-[#f1e7cf]">
              <User size={42} className="mx-auto text-[#d99200]" />

              <h2 className="mt-4 text-xl font-extrabold">
                Você não está logado
              </h2>

              <p className="mt-2 text-sm leading-5 text-gray-500">
                Faça login para solicitar orçamentos, salvar fornecedores e testar as contas.
              </p>

              <Link
                href="/login"
                className="mt-5 flex items-center justify-center gap-2 rounded-[24px] bg-[#e3a925] py-4 text-center font-extrabold text-white shadow-lg"
              >
                <LogIn size={21} />
                Fazer login
              </Link>
            </div>
          )}

          {!loading && user && (
            <>
              <div className="rounded-[28px] bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,.08)] ring-1 ring-[#f1e7cf]">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff7e8] text-[#d99200]">
                    <User size={30} />
                  </div>

                  <div className="flex-1">
                    <h2 className="text-lg font-extrabold">
                      Conta logada
                    </h2>

                    <p className="mt-2 text-sm font-extrabold text-[#151515]">
                      {displayName}
                    </p>

                    <p className="mt-2 flex items-center gap-2 break-all text-sm font-bold text-gray-500">
                      <Mail size={16} className="text-[#d99200]" />
                      {email}
                    </p>

                    <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#fff7e8] px-4 py-2 text-xs font-extrabold text-[#b97900]">
                      <ShieldCheck size={15} />
                      Tipo: {accountType}
                    </div>
                  </div>
                </div>
              </div>

              {errorMessage && (
                <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                  {errorMessage}
                </div>
              )}

              <div className="mt-5 grid grid-cols-2 gap-3">
                <Link
                  href="/meu-evento"
                  className="rounded-[22px] bg-white p-4 shadow-sm ring-1 ring-[#f1e7cf]"
                >
                  <Heart size={24} className="text-[#d99200]" />
                  <p className="mt-3 text-sm font-extrabold">Meu Evento</p>
                  <p className="mt-1 text-xs font-bold text-gray-500">
                    Cliente
                  </p>
                </Link>

                <Link
                  href="/orcamentos"
                  className="rounded-[22px] bg-white p-4 shadow-sm ring-1 ring-[#f1e7cf]"
                >
                  <Bell size={24} className="text-[#d99200]" />
                  <p className="mt-3 text-sm font-extrabold">Orçamentos</p>
                  <p className="mt-1 text-xs font-bold text-gray-500">
                    Cliente
                  </p>
                </Link>

                <Link
                  href="/painel-fornecedor/leads"
                  className="rounded-[22px] bg-white p-4 shadow-sm ring-1 ring-[#f1e7cf]"
                >
                  <Building2 size={24} className="text-[#d99200]" />
                  <p className="mt-3 text-sm font-extrabold">Leads</p>
                  <p className="mt-1 text-xs font-bold text-gray-500">
                    Fornecedor
                  </p>
                </Link>

                <Link
                  href="/cerimonialista/convites"
                  className="rounded-[22px] bg-white p-4 shadow-sm ring-1 ring-[#f1e7cf]"
                >
                  <Users size={24} className="text-[#d99200]" />
                  <p className="mt-3 text-sm font-extrabold">Convites</p>
                  <p className="mt-1 text-xs font-bold text-gray-500">
                    Cerimonialista
                  </p>
                </Link>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-[24px] bg-red-600 py-4 text-center font-extrabold text-white shadow-lg disabled:opacity-60"
              >
                <LogOut size={21} />
                {signingOut ? 'Saindo...' : 'Sair da conta'}
              </button>

              <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-center text-xs font-bold leading-5 text-gray-500 ring-1 ring-[#f1e7cf]">
                Use esta tela para conferir qual usuário está logado antes de testar cliente, fornecedor ou cerimonialista.
              </p>
            </>
          )}
        </section>

        <Nav />
      </div>
    </main>
  );
}
