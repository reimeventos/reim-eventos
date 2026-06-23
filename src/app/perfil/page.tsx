'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Bell,
  Briefcase,
  Building2,
  Crown,
  Heart,
  ImageIcon,
  LogIn,
  LogOut,
  LayoutDashboard,
  Mail,
  MessageSquare,
  Pencil,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react';
import { Nav } from '@/components/Nav';
import { supabase } from '@/lib/supabase';

function getTestAccountType(email: string) {
  const normalized = email.toLowerCase();

  if (normalized.startsWith('cliente@')) {
    return 'Cliente';
  }

  if (normalized.startsWith('fornecedor@')) {
    return 'Fornecedor';
  }

  if (normalized.startsWith('cerimonialista@')) {
    return 'Cerimonialista';
  }

  return '';
}

function getCategoryName(supplier: any) {
  if (!supplier) return '';

  if (Array.isArray(supplier.categories)) {
    return supplier.categories[0]?.name || '';
  }

  return supplier.categories?.name || '';
}

function isCerimonialistaCategory(categoryName: string) {
  const normalized = String(categoryName || '').toLowerCase();

  return (
    normalized.includes('cerimonial') ||
    normalized.includes('cerimonialista') ||
    normalized.includes('assessoria')
  );
}

export default function PerfilPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [accountType, setAccountType] = useState('Cliente');
  const [supplier, setSupplier] = useState<any>(null);
  const [supplierName, setSupplierName] = useState('');
  const [profileName, setProfileName] = useState('');
  const [hasCollaboratorAccess, setHasCollaboratorAccess] = useState(false);
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
        setSupplier(null);
        setSupplierName('');
        setHasCollaboratorAccess(false);
        return;
      }

      const email = currentUser.email || '';
      const testType = getTestAccountType(email);

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (profileData?.full_name) {
        setProfileName(profileData.full_name);
      }

      const profileRole = String(profileData?.role || '').toLowerCase();

      if (profileRole === 'admin' || profileRole === 'administrador') {
        setSupplier(null);
        setSupplierName('');
        setHasCollaboratorAccess(false);
        setAccountType('Admin');
        return;
      }

      /*
        Regra principal:
        Cerimonialista com vitrine é fornecedor.
        Portanto fornecedor precisa ter prioridade sobre event_collaborators.
      */
      const { data: suppliersData } = await supabase
        .from('suppliers')
        .select(`
          id,
          business_name,
          owner_id,
          categories(name, slug)
        `)
        .eq('owner_id', currentUser.id)
        .limit(1);

      const currentSupplier = suppliersData?.[0] || null;

      if (currentSupplier) {
        const categoryName = getCategoryName(currentSupplier);
        const isCerimonialistaSupplier = isCerimonialistaCategory(categoryName);

        setSupplier(currentSupplier);
        setSupplierName(currentSupplier.business_name || '');
        setAccountType(
          isCerimonialistaSupplier
            ? 'Fornecedor Cerimonialista'
            : 'Fornecedor'
        );

        const { data: collaboratorData } = await supabase
          .from('event_collaborators')
          .select('id,status')
          .ilike('collaborator_email', email)
          .limit(1);

        setHasCollaboratorAccess(Boolean(collaboratorData?.length));
        return;
      }

      setSupplier(null);
      setSupplierName('');

      const { data: collaboratorData } = await supabase
        .from('event_collaborators')
        .select('id,status')
        .ilike('collaborator_email', email)
        .limit(1);

      if (collaboratorData && collaboratorData.length > 0) {
        setAccountType('Cerimonialista');
        setHasCollaboratorAccess(true);
        return;
      }

      setHasCollaboratorAccess(false);

      if (testType === 'Fornecedor') {
        setAccountType('Fornecedor');
        return;
      }

      if (testType === 'Cerimonialista') {
        setAccountType('Cerimonialista');
        return;
      }

      if (testType === 'Cliente') {
        setAccountType('Cliente');
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
  const displayName = profileName || supplierName || email || 'Usuário não logado';

  const isFornecedor = Boolean(supplier?.id) || accountType === 'Fornecedor';
  const isFornecedorCerimonialista = accountType === 'Fornecedor Cerimonialista';
  const isCerimonialistaOnly =
    accountType === 'Cerimonialista' && !supplier?.id;
  const isCliente = accountType === 'Cliente';
  const isAdmin = accountType === 'Admin';

  const adminCards = [
    {
      title: 'Área Admin',
      subtitle: 'Painel principal',
      href: '/admin',
      icon: LayoutDashboard,
    },
    {
      title: 'Aprovações',
      subtitle: 'Liberar planos',
      href: '/admin/assinaturas',
      icon: Crown,
    },
    {
      title: 'Fornecedores',
      subtitle: 'Cadastros',
      href: '/admin/fornecedores',
      icon: Building2,
    },
    {
      title: 'Clientes',
      subtitle: 'Usuários',
      href: '/admin/clientes',
      icon: Users,
    },
    {
      title: 'Orçamentos',
      subtitle: 'Solicitações',
      href: '/admin/orcamentos',
      icon: Bell,
    },
    {
      title: 'Segurança',
      subtitle: 'LGPD',
      href: '/seguranca',
      icon: ShieldCheck,
    },
  ];

  const supplierCards = [
    {
      title: 'Painel',
      subtitle: 'Fornecedor',
      href: '/painel-fornecedor',
      icon: Briefcase,
    },
    {
      title: 'Mídias',
      subtitle: 'Fotos e vídeos',
      href: '/painel-fornecedor/fotos',
      icon: ImageIcon,
    },
    {
      title: 'Leads',
      subtitle: 'Pedidos recebidos',
      href: '/painel-fornecedor/leads',
      icon: MessageSquare,
    },
    {
      title: 'Vitrine',
      subtitle: 'Editar perfil',
      href: '/painel-fornecedor/editar',
      icon: Pencil,
    },
    {
      title: 'Planos',
      subtitle: 'Assinatura',
      href: '/painel-fornecedor/planos',
      icon: Crown,
    },
  ];

  const clientCards = [
    {
      title: 'Meu Evento',
      subtitle: 'Cliente',
      href: '/meu-evento',
      icon: Heart,
    },
    {
      title: 'Orçamentos',
      subtitle: 'Cliente',
      href: '/orcamentos',
      icon: Bell,
    },
  ];

  const cerimonialCards = [
    {
      title: 'Convites',
      subtitle: 'Eventos que atuo',
      href: '/cerimonialista/convites',
      icon: Users,
    },
  ];

  const cards = isAdmin
    ? adminCards
    : isFornecedor
      ? isFornecedorCerimonialista || hasCollaboratorAccess
        ? [...supplierCards, ...cerimonialCards]
        : supplierCards
      : isCerimonialistaOnly
        ? cerimonialCards
        : clientCards;

  return (
    <main className="min-h-screen bg-black text-[#151515]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#fbf7f1] pb-28 shadow-2xl">
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
                <User size={31} />
              </div>

              <div>
                <h1 className="font-serif text-[34px] leading-tight">
                  Perfil
                </h1>
                <p className="mt-1 text-sm text-white/70">
                  Veja sua conta e acesse seus painéis.
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
                Faça login para solicitar orçamentos, salvar fornecedores e acessar sua conta.
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
                    <h2 className="text-lg font-extrabold">Conta logada</h2>

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

                    {supplierName && (
                      <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-xs font-extrabold text-green-700">
                        <Building2 size={15} />
                        {supplierName}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {isAdmin && (
                <div className="mt-4 rounded-[24px] bg-[#151515] p-5 text-white shadow-lg">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e3a925]">
                      <ShieldCheck size={25} />
                    </div>

                    <div>
                      <p className="text-base font-extrabold">
                        Administração do REIM
                      </p>

                      <p className="mt-1 text-xs leading-5 text-white/70">
                        Esta conta tem acesso à área administrativa para aprovar assinaturas,
                        consultar cadastros, acompanhar orçamentos e gerenciar a plataforma.
                      </p>

                      <Link
                        href="/admin"
                        className="mt-4 flex items-center justify-center gap-2 rounded-[20px] bg-[#e3a925] px-4 py-3 text-sm font-extrabold text-white"
                      >
                        <LayoutDashboard size={19} />
                        Entrar na Área Administrativa
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {isFornecedorCerimonialista && (
                <div className="mt-4 rounded-[22px] bg-[#151515] p-4 text-white shadow-lg">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e3a925]">
                      <ShieldCheck size={23} />
                    </div>

                    <div>
                      <p className="text-sm font-extrabold">
                        Cerimonialista é fornecedor no REIM
                      </p>

                      <p className="mt-1 text-xs leading-5 text-white/70">
                        Esta conta tem painel de fornecedor, vitrine, leads e planos.
                        Além disso, pode atuar dentro do evento da cliente quando for autorizada.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                  {errorMessage}
                </div>
              )}

              <div className="mt-5 grid grid-cols-2 gap-3">
                {cards.map((card) => {
                  const Icon = card.icon;

                  return (
                    <Link
                      key={`${card.title}-${card.href}`}
                      href={card.href}
                      className="rounded-[22px] bg-white p-4 shadow-sm ring-1 ring-[#f1e7cf]"
                    >
                      <Icon size={24} className="text-[#d99200]" />
                      <p className="mt-3 text-sm font-extrabold">{card.title}</p>
                      <p className="mt-1 text-xs font-bold text-gray-500">
                        {card.subtitle}
                      </p>
                    </Link>
                  );
                })}
              </div>

              {isCliente && (
                <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-center text-xs font-bold leading-5 text-gray-500 ring-1 ring-[#f1e7cf]">
                  Clientes usam o REIM gratuitamente para organizar evento, salvar fornecedores e pedir orçamentos.
                </p>
              )}

              {isCerimonialistaOnly && (
                <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-center text-xs font-bold leading-5 text-gray-500 ring-1 ring-[#f1e7cf]">
                  Esta conta atua como cerimonialista convidada. Para ter vitrine pública e receber leads, é preciso ter cadastro de fornecedor.
                </p>
              )}

              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-[24px] bg-red-600 py-4 text-center font-extrabold text-white shadow-lg disabled:opacity-60"
              >
                <LogOut size={21} />
                {signingOut ? 'Saindo...' : 'Sair da conta'}
              </button>
            </>
          )}
        </section>

        {!isAdmin && <Nav />}
      </div>
    </main>
  );
}
