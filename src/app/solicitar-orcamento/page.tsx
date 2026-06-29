'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Camera,
  Lock,
  LogIn,
  LogOut,
  MapPin,
  MessageCircle,
  PartyPopper,
  Send,
  ShieldCheck,
  User,
  UserPlus,
  Users,
} from 'lucide-react';
import { getSupplier } from '@/lib/marketplace';
import { supabase } from '@/lib/supabase';

function formatCategoryName(supplier: any) {
  return supplier?.categories?.name || 'Serviço não informado';
}

function isSpaceCategory(text: string) {
  const normalized = text.toLowerCase();

  return (
    normalized.includes('espaço') ||
    normalized.includes('espaco') ||
    normalized.includes('local') ||
    normalized.includes('salão') ||
    normalized.includes('salao')
  );
}

function formatWhatsapp(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);

  if (digits.length <= 2) return digits;

  if (digits.length <= 7) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function countWhatsappDigits(value: string) {
  return value.replace(/\D/g, '').length;
}

function SolicitarOrcamentoContent() {
  const searchParams = useSearchParams();

  const supplierId = searchParams.get('fornecedor') || '';
  const targetCustomerId = searchParams.get('cliente') || '';
  const returnUrl = searchParams.get('voltar') || '';
  const cityFromSearch = searchParams.get('cidade') || '';

  const isCerimonialistaMode = Boolean(targetCustomerId);

  const [supplier, setSupplier] = useState<any>(null);
  const [publicVisibility, setPublicVisibility] = useState<any>(null);
  const [loadingSupplier, setLoadingSupplier] = useState(true);

  const [user, setUser] = useState<any>(null);
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('');
  const [profileName, setProfileName] = useState('');
  const [loadingUser, setLoadingUser] = useState(true);

  const [checkingCerimonialista, setCheckingCerimonialista] = useState(false);
  const [cerimonialistaAllowed, setCerimonialistaAllowed] = useState(false);
  const [sharedEvent, setSharedEvent] = useState<any>(null);
  const [sharedInvite, setSharedInvite] = useState<any>(null);

  const [customerName, setCustomerName] = useState('');
  const [customerWhatsapp, setCustomerWhatsapp] = useState('');
  const [eventType, setEventType] = useState('Casamento');
  const [eventDate, setEventDate] = useState('');
  const [eventCity, setEventCity] = useState(cityFromSearch || 'Eunápolis');
  const [eventSpace, setEventSpace] = useState('');
  const [structurePreference, setStructurePreference] = useState('Ainda não sei');
  const [guestsCount, setGuestsCount] = useState('');
  const [serviceNeeded, setServiceNeeded] = useState('');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const supplierCategory = formatCategoryName(supplier);
  const supplierName = supplier?.business_name || 'Fornecedor';
  const canReceiveQuote = Boolean(publicVisibility?.can_receive_quote);
  const isNewSupplierOnReim = publicVisibility?.public_badge === 'novo_no_reim';

  const isEventSpaceSupplier =
    isSpaceCategory(supplierCategory) || isSpaceCategory(serviceNeeded);

  const currentPath = supplierId
    ? `/solicitar-orcamento?fornecedor=${supplierId}${
        targetCustomerId ? `&cliente=${targetCustomerId}` : ''
      }${returnUrl ? `&voltar=${encodeURIComponent(returnUrl)}` : ''}${
        cityFromSearch ? `&cidade=${encodeURIComponent(cityFromSearch)}` : ''
      }`
    : '/solicitar-orcamento';

  const loginHref = `/login?redirect=${encodeURIComponent(currentPath)}`;
  const cadastroHref = `/cadastro?redirect=${encodeURIComponent(currentPath)}`;

  const backHref = returnUrl
    ? returnUrl
    : supplierId
      ? `/fornecedor/${supplierId}${
          targetCustomerId || cityFromSearch
            ? `?${[
                targetCustomerId ? `cliente=${targetCustomerId}` : '',
                targetCustomerId
                  ? `voltar=${encodeURIComponent(returnUrl || '/')}`
                  : '',
                cityFromSearch
                  ? `cidade=${encodeURIComponent(cityFromSearch)}`
                  : '',
              ]
                .filter(Boolean)
                .join('&')}`
            : ''
        }`
      : cityFromSearch
        ? `/buscar?cidade=${encodeURIComponent(cityFromSearch)}`
        : '/buscar';

  const isSupplierAccount =
    !isCerimonialistaMode &&
    (userRole === 'fornecedor' ||
      userRole === 'supplier' ||
      userEmail === 'fornecedor@reimeventos.com');

  useEffect(() => {
    async function loadUser() {
      try {
        setLoadingUser(true);

        const { data } = await supabase.auth.getUser();
        const currentUser = data.user || null;

        setUser(currentUser);
        setUserEmail(currentUser?.email || '');

        if (currentUser?.id) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('role, full_name')
            .eq('id', currentUser.id)
            .maybeSingle();

          setUserRole(profileData?.role || '');
          setProfileName(profileData?.full_name || '');
        } else {
          setUserRole('');
          setProfileName('');
        }
      } catch (error) {
        console.error('Erro ao verificar login:', error);
        setUser(null);
        setUserEmail('');
        setUserRole('');
        setProfileName('');
      } finally {
        setLoadingUser(false);
      }
    }

    loadUser();
  }, []);

  useEffect(() => {
    async function loadSupplier() {
      try {
        setLoadingSupplier(true);

        if (!supplierId) {
          setSupplier(null);
          return;
        }

        const data = await getSupplier(supplierId);

        if (data) {
          const { data: visibilityData, error: visibilityError } = await supabase
            .from('supplier_public_visibility')
            .select(
              'supplier_id, can_appear_public, can_receive_quote, public_badge, public_label, public_notice'
            )
            .eq('supplier_id', supplierId)
            .maybeSingle();

          if (visibilityError) {
            console.error('Erro ao carregar visibilidade do fornecedor:', visibilityError);
          }

          setPublicVisibility(visibilityData || null);
          setSupplier(data);
          setServiceNeeded(formatCategoryName(data));

          if (cityFromSearch) {
            setEventCity(cityFromSearch);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar fornecedor:', error);
        setSupplier(null);
      } finally {
        setLoadingSupplier(false);
      }
    }

    loadSupplier();
  }, [supplierId]);

  useEffect(() => {
    async function loadCerimonialistaContext() {
      if (!isCerimonialistaMode || !user?.email || !targetCustomerId) {
        setCerimonialistaAllowed(false);
        setSharedEvent(null);
        setSharedInvite(null);
        return;
      }

      try {
        setCheckingCerimonialista(true);

        const { data: invite, error: inviteError } = await supabase
          .from('event_collaborators')
          .select('*')
          .eq('owner_id', targetCustomerId)
          .ilike('collaborator_email', user.email)
          .eq('status', 'aceito')
          .limit(1)
          .maybeSingle();

        if (inviteError) throw inviteError;

        if (!invite) {
          setCerimonialistaAllowed(false);
          setErrorMessage(
            'Esta conta não está autorizada a solicitar orçamento para esta cliente.'
          );
          return;
        }

        setSharedInvite(invite);
        setCerimonialistaAllowed(true);

        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('*')
          .or(`customer_id.eq.${targetCustomerId},client_id.eq.${targetCustomerId}`)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (eventError) throw eventError;

        if (eventData) {
          setSharedEvent(eventData);

          const ownerName =
            invite.owner_name ||
            eventData.couple_name ||
            eventData.event_name ||
            eventData.title ||
            '';

          setCustomerName(ownerName);
          setEventType(eventData.event_type || 'Casamento');
          setEventDate(eventData.event_date || '');
          setEventCity(cityFromSearch || eventData.event_city || eventData.city || 'Eunápolis');
          setEventSpace(eventData.event_space || '');
          setGuestsCount(
            eventData.guests_count || eventData.guest_count
              ? String(eventData.guests_count || eventData.guest_count)
              : ''
          );
        }
      } catch (error: any) {
        console.error('Erro ao validar cerimonialista:', error);
        setCerimonialistaAllowed(false);
        setErrorMessage(
          error?.message ||
            'Não foi possível validar sua permissão como cerimonialista.'
        );
      } finally {
        setCheckingCerimonialista(false);
      }
    }

    loadCerimonialistaContext();
  }, [isCerimonialistaMode, user?.email, targetCustomerId]);

  async function handleSignOut() {
    try {
      setSigningOut(true);
      await supabase.auth.signOut();
      setUser(null);
      setUserEmail('');
      setUserRole('');
      setProfileName('');
      setErrorMessage('');
      setSuccessMessage('');
    } catch (error) {
      console.error('Erro ao sair da conta:', error);
      setErrorMessage('Não foi possível sair da conta. Tente novamente.');
    } finally {
      setSigningOut(false);
    }
  }

  async function createQuoteRequestDirect(payload: {
    customer_id: string;
    supplier_id: string;
    customer_name: string;
    customer_whatsapp: string;
    event_type: string;
    event_date?: string;
    event_city?: string;
    event_space?: string;
    guests_count?: number;
    service_needed?: string;
    notes?: string;
    created_by_user_id: string;
    created_by_role: string;
    created_by_name: string;
    created_by_email: string;
  }) {
    const { error } = await supabase.from('quote_requests').insert([
      {
        customer_id: payload.customer_id,
        supplier_id: payload.supplier_id,
        customer_name: payload.customer_name,
        customer_whatsapp: payload.customer_whatsapp,
        event_type: payload.event_type,
        event_date: payload.event_date || null,
        event_time: null,
        event_space: payload.event_space || null,
        event_city: payload.event_city || null,
        guests_count: payload.guests_count || null,
        service_needed: payload.service_needed || null,
        notes: payload.notes || null,
        status: 'novo',
        created_by_user_id: payload.created_by_user_id,
        created_by_role: payload.created_by_role,
        created_by_name: payload.created_by_name,
        created_by_email: payload.created_by_email,
      },
    ]);

    if (error) throw error;

    return true;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSuccessMessage('');
    setErrorMessage('');

    if (!user) {
      setErrorMessage('Para solicitar orçamento, faça login ou crie sua conta.');
      return;
    }

    if (isSupplierAccount) {
      setErrorMessage(
        'Você está logado como fornecedor. Para solicitar orçamento, entre com uma conta de cliente.'
      );
      return;
    }

    if (isCerimonialistaMode && !cerimonialistaAllowed) {
      setErrorMessage(
        'Sua conta de cerimonialista não está autorizada a solicitar orçamento para esta cliente.'
      );
      return;
    }

    if (!supplierId) {
      setErrorMessage(
        'Fornecedor não identificado. Volte para a vitrine e clique em Solicitar orçamento novamente.'
      );
      return;
    }

    if (!canReceiveQuote) {
      setErrorMessage(
        'Este fornecedor não está recebendo novas solicitações de orçamento no momento.'
      );
      return;
    }

    if (!customerName.trim()) {
      setErrorMessage('Informe o nome da cliente.');
      return;
    }

    if (!customerWhatsapp.trim()) {
      setErrorMessage('Informe o WhatsApp da cliente.');
      return;
    }

    if (countWhatsappDigits(customerWhatsapp) < 10) {
      setErrorMessage('Informe um WhatsApp válido com DDD.');
      return;
    }

    try {
      setLoading(true);

      const finalCustomerId = isCerimonialistaMode ? targetCustomerId : user.id;

      const createdByRole = isCerimonialistaMode ? 'cerimonialista' : 'cliente';

      const createdByName = isCerimonialistaMode
        ? profileName ||
          sharedInvite?.collaborator_name ||
          userEmail ||
          'Cerimonialista'
        : customerName;

      await createQuoteRequestDirect({
        customer_id: finalCustomerId,
        supplier_id: supplierId,
        customer_name: customerName,
        customer_whatsapp: customerWhatsapp,
        event_type: eventType,
        event_date: eventDate || undefined,
        event_city: eventCity,
        event_space: isEventSpaceSupplier ? structurePreference : eventSpace,
        guests_count: guestsCount ? Number(guestsCount) : undefined,
        service_needed: serviceNeeded || supplierCategory,
        notes:
          notes ||
          (isEventSpaceSupplier
            ? 'Gostaria de consultar disponibilidade para a data informada e receber orçamento do espaço.'
            : ''),
        created_by_user_id: user.id,
        created_by_role: createdByRole,
        created_by_name: createdByName,
        created_by_email: userEmail,
      });

      setSuccessMessage(
        isCerimonialistaMode
          ? 'Solicitação enviada em nome da cliente! O fornecedor receberá o pedido.'
          : 'Solicitação enviada com sucesso! Acompanhe a resposta em Meus Orçamentos.'
      );

      setCustomerWhatsapp('');
      setNotes('');

      if (!isCerimonialistaMode) {
        setCustomerName('');
        setEventType('Casamento');
        setEventDate('');
        setEventCity(cityFromSearch || 'Eunápolis');
        setEventSpace('');
        setStructurePreference('Ainda não sei');
        setGuestsCount('');
        setServiceNeeded(supplierCategory);
      }
    } catch (error: any) {
      console.error(error);

      setErrorMessage(
        error?.message ||
          'Não foi possível enviar a solicitação. Tente novamente.'
      );
    } finally {
      setLoading(false);
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
              href={backHref}
              className="inline-flex items-center gap-2 text-sm font-bold text-[#e3a925]"
            >
              <ArrowLeft size={17} />
              Voltar
            </Link>

            <h1 className="mt-5 font-serif text-[34px] leading-tight">
              Solicitar orçamento
            </h1>

            <p className="mt-2 text-sm text-white/70">
              {isCerimonialistaMode
                ? 'Envie o pedido em nome da cliente.'
                : 'Envie os detalhes do seu evento para o fornecedor.'}
            </p>

            {isCerimonialistaMode && (
              <div className="mt-4 flex items-start gap-3 rounded-2xl bg-white/10 p-4 text-white ring-1 ring-white/10">
                <ShieldCheck size={20} className="mt-0.5 text-[#e3a925]" />
                <div>
                  <p className="text-sm font-extrabold">Modo cerimonialista</p>
                  <p className="mt-1 text-xs leading-5 text-white/70">
                    Esta solicitação será salva no evento da cliente autorizada.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="px-6 pt-6">
          <div className="rounded-[26px] bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,.08)]">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff7e8] text-[#d99200]">
                <Camera size={30} />
              </div>

              <div>
                <p className="text-xs font-bold text-gray-500">Fornecedor</p>

                <h2 className="text-lg font-extrabold">
                  {loadingSupplier ? 'Carregando fornecedor...' : supplierName}
                </h2>

                <p className="text-sm text-gray-500">
                  {loadingSupplier ? 'Buscando dados...' : supplierCategory}
                </p>

                {!supplierId && (
                  <p className="mt-1 text-xs font-bold text-red-600">
                    Fornecedor não identificado.
                  </p>
                )}
              </div>
            </div>
          </div>

          {cityFromSearch && (
            <div className="mt-4 rounded-[22px] bg-[#fff7e8] px-4 py-3 text-sm leading-5 text-[#7a5200] ring-1 ring-[#f1e7cf]">
              <p className="font-extrabold">Cidade selecionada na busca</p>
              <p className="mt-1">
                Esta solicitação será enviada para atendimento em <strong>{cityFromSearch}</strong>.
              </p>
            </div>
          )}
        </section>

        {isNewSupplierOnReim && (
          <section className="px-6 pt-4">
            <div className="rounded-[22px] bg-[#fff7e8] px-4 py-3 text-sm leading-5 text-[#7a5200] ring-1 ring-[#f1e7cf]">
              <p className="font-extrabold">Novo fornecedor no REIM</p>
              <p className="mt-1">
                Este fornecedor está em fase inicial na plataforma. Aguarde a confirmação de disponibilidade após solicitar o orçamento.
              </p>
            </div>
          </section>
        )}

        {!loadingSupplier && supplierId && !canReceiveQuote && (
          <section className="px-6 pt-4">
            <div className="rounded-[22px] bg-red-50 px-4 py-3 text-sm leading-5 text-red-700 ring-1 ring-red-100">
              <p className="font-extrabold">Fornecedor indisponível no momento</p>
              <p className="mt-1">
                Esta vitrine não está recebendo novas solicitações de orçamento agora.
              </p>

              <Link
                href={backHref}
                className="mt-4 flex items-center justify-center rounded-[20px] bg-red-600 py-3 text-sm font-extrabold text-white"
              >
                Voltar para a vitrine
              </Link>
            </div>
          </section>
        )}

        {loadingUser && (
          <section className="px-6 pt-6">
            <div className="rounded-[28px] bg-white p-6 text-center shadow-sm ring-1 ring-[#f1e7cf]">
              <Lock size={36} className="mx-auto text-[#d99200]" />
              <p className="mt-3 text-sm font-bold text-gray-600">
                Verificando sua conta...
              </p>
            </div>
          </section>
        )}

        {!loadingUser && !user && (
          <section className="px-6 pt-6">
            <div className="rounded-[28px] bg-white p-6 text-center shadow-[0_10px_25px_rgba(0,0,0,.08)] ring-1 ring-[#f1e7cf]">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff7e8] text-[#d99200]">
                <Lock size={34} />
              </div>

              <h2 className="mt-5 text-xl font-extrabold">
                Acesse sua conta para solicitar orçamento
              </h2>

              <p className="mt-3 text-sm leading-6 text-gray-600">
                Para enviar uma solicitação, você precisa estar logado. Assim seus
                pedidos ficam salvos no app e você pode acompanhar respostas,
                orçamentos e conversas com os fornecedores.
              </p>

              <div className="mt-6 space-y-3">
                <Link
                  href={loginHref}
                  className="flex items-center justify-center gap-2 rounded-[22px] bg-[#e3a925] py-4 text-center font-extrabold text-white shadow-lg"
                >
                  <LogIn size={21} />
                  Fazer login
                </Link>

                <Link
                  href={cadastroHref}
                  className="flex items-center justify-center gap-2 rounded-[22px] bg-black py-4 text-center font-extrabold text-white shadow-lg"
                >
                  <UserPlus size={21} />
                  Criar conta
                </Link>

                <Link
                  href={backHref}
                  className="block rounded-[22px] bg-white py-4 text-center font-extrabold text-[#151515] ring-1 ring-[#f1e7cf]"
                >
                  Voltar para vitrine
                </Link>
              </div>
            </div>
          </section>
        )}

        {!loadingUser && user && isSupplierAccount && (
          <section className="px-6 pt-6">
            <div className="rounded-[28px] bg-white p-6 text-center shadow-[0_10px_25px_rgba(0,0,0,.08)] ring-1 ring-[#f1e7cf]">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff7e8] text-[#d99200]">
                <Lock size={34} />
              </div>

              <h2 className="mt-5 text-xl font-extrabold">
                Você está logado como fornecedor
              </h2>

              <p className="mt-3 text-sm leading-6 text-gray-600">
                Esta conta está vinculada ao painel do fornecedor. Para solicitar
                orçamento, saia desta conta e entre como cliente.
              </p>

              <p className="mt-3 rounded-2xl bg-[#fbf7f1] px-4 py-3 text-xs font-bold text-gray-500">
                Conta atual: {userEmail || 'fornecedor'}
              </p>

              <div className="mt-6 space-y-3">
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="flex w-full items-center justify-center gap-2 rounded-[22px] bg-[#e3a925] py-4 text-center font-extrabold text-white shadow-lg disabled:opacity-60"
                >
                  <LogOut size={21} />
                  {signingOut ? 'Saindo...' : 'Sair desta conta'}
                </button>

                <Link
                  href={loginHref}
                  className="flex items-center justify-center gap-2 rounded-[22px] bg-black py-4 text-center font-extrabold text-white shadow-lg"
                >
                  <LogIn size={21} />
                  Entrar como cliente
                </Link>

                <Link
                  href={cadastroHref}
                  className="flex items-center justify-center gap-2 rounded-[22px] bg-white py-4 text-center font-extrabold text-[#151515] ring-1 ring-[#f1e7cf]"
                >
                  <UserPlus size={21} />
                  Criar conta cliente
                </Link>
              </div>
            </div>
          </section>
        )}

        {!loadingUser && user && !isSupplierAccount && canReceiveQuote && (
          <section className="px-6 pt-6">
            {isCerimonialistaMode && checkingCerimonialista && (
              <div className="mb-4 rounded-[24px] bg-white p-4 text-sm font-bold text-gray-600 ring-1 ring-[#f1e7cf]">
                Validando permissão da cerimonialista...
              </div>
            )}

            {isCerimonialistaMode && cerimonialistaAllowed && (
              <div className="mb-4 rounded-[24px] bg-green-50 p-4 text-sm font-bold leading-5 text-green-700 ring-1 ring-green-100">
                Solicitação em nome da cliente:{' '}
                {sharedInvite?.owner_name ||
                  sharedEvent?.couple_name ||
                  sharedEvent?.event_name ||
                  'Cliente'}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="rounded-[24px] bg-white p-4 text-sm font-bold text-gray-600 ring-1 ring-[#f1e7cf]">
                Conta logada: {userEmail || 'cliente'}
              </div>

              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-extrabold">
                  <User size={17} className="text-[#d99200]" />
                  {isCerimonialistaMode ? 'Nome da cliente' : 'Nome'}
                </span>
                <input
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  className="w-full rounded-[22px] bg-white px-5 py-4 text-sm font-medium outline-none ring-1 ring-[#f1e7cf] placeholder:text-gray-400"
                  placeholder={isCerimonialistaMode ? 'Nome da cliente' : 'Seu nome'}
                />
              </label>

              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-extrabold">
                  <MessageCircle size={17} className="text-[#d99200]" />
                  WhatsApp {isCerimonialistaMode ? 'da cliente' : ''}
                </span>
                <input
                  inputMode="numeric"
                  maxLength={15}
                  value={customerWhatsapp}
                  onChange={(event) =>
                    setCustomerWhatsapp(formatWhatsapp(event.target.value))
                  }
                  className="w-full rounded-[22px] bg-white px-5 py-4 text-sm font-medium outline-none ring-1 ring-[#f1e7cf] placeholder:text-gray-400"
                  placeholder="(73) 99999-9999"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Informe o DDD + número. Ex: (73) 99999-9999
                </p>
              </label>

              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-extrabold">
                  <PartyPopper size={17} className="text-[#d99200]" />
                  Tipo de evento
                </span>
                <select
                  value={eventType}
                  onChange={(event) => setEventType(event.target.value)}
                  className="w-full rounded-[22px] bg-white px-5 py-4 text-sm font-medium outline-none ring-1 ring-[#f1e7cf]"
                >
                  <option>Casamento</option>
                  <option>Aniversário</option>
                  <option>Debutante</option>
                  <option>Evento corporativo</option>
                  <option>Formatura</option>
                  <option>Batizado</option>
                  <option>Chá revelação</option>
                  <option>Outro</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-extrabold">
                  <Camera size={17} className="text-[#d99200]" />
                  Serviço desejado
                </span>
                <input
                  value={serviceNeeded}
                  onChange={(event) => setServiceNeeded(event.target.value)}
                  className="w-full rounded-[22px] bg-white px-5 py-4 text-sm font-medium outline-none ring-1 ring-[#f1e7cf] placeholder:text-gray-400"
                  placeholder="Ex: Fotografia, buffet, decoração..."
                />
              </label>

              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-extrabold">
                  <CalendarDays size={17} className="text-[#d99200]" />
                  Data do evento
                </span>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(event) => setEventDate(event.target.value)}
                  className="w-full rounded-[22px] bg-white px-5 py-4 text-sm font-medium outline-none ring-1 ring-[#f1e7cf]"
                />
              </label>

              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-extrabold">
                  <MapPin size={17} className="text-[#d99200]" />
                  Cidade do evento
                </span>
                <input
                  value={eventCity}
                  onChange={(event) => setEventCity(event.target.value)}
                  className="w-full rounded-[22px] bg-white px-5 py-4 text-sm font-medium outline-none ring-1 ring-[#f1e7cf] placeholder:text-gray-400"
                  placeholder="Ex: Eunápolis"
                />
              </label>

              {isEventSpaceSupplier ? (
                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-sm font-extrabold">
                    <Building2 size={17} className="text-[#d99200]" />
                    Preferência de estrutura
                  </span>
                  <select
                    value={structurePreference}
                    onChange={(event) =>
                      setStructurePreference(event.target.value)
                    }
                    className="w-full rounded-[22px] bg-white px-5 py-4 text-sm font-medium outline-none ring-1 ring-[#f1e7cf]"
                  >
                    <option>Salão fechado</option>
                    <option>Área ao ar livre</option>
                    <option>Espaço com piscina</option>
                    <option>Cerimônia e recepção no mesmo local</option>
                    <option>Espaço com hospedagem</option>
                    <option>Ainda não sei</option>
                  </select>

                  <p className="mt-2 text-xs leading-5 text-gray-500">
                    Para espaços de evento, o cliente consulta disponibilidade da data e orçamento do local.
                  </p>
                </label>
              ) : (
                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-sm font-extrabold">
                    <Building2 size={17} className="text-[#d99200]" />
                    Espaço do evento
                  </span>
                  <input
                    value={eventSpace}
                    onChange={(event) => setEventSpace(event.target.value)}
                    className="w-full rounded-[22px] bg-white px-5 py-4 text-sm font-medium outline-none ring-1 ring-[#f1e7cf] placeholder:text-gray-400"
                    placeholder="Ex: Espaço Villa Real, clube, fazenda..."
                  />
                </label>
              )}

              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-extrabold">
                  <Users size={17} className="text-[#d99200]" />
                  Quantidade de convidados
                </span>
                <input
                  type="number"
                  min="1"
                  value={guestsCount}
                  onChange={(event) => setGuestsCount(event.target.value)}
                  className="w-full rounded-[22px] bg-white px-5 py-4 text-sm font-medium outline-none ring-1 ring-[#f1e7cf] placeholder:text-gray-400"
                  placeholder="Ex: 150"
                />
              </label>

              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-extrabold">
                  <MessageCircle size={17} className="text-[#d99200]" />
                  Mensagem para o fornecedor
                </span>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  className="min-h-[130px] w-full resize-none rounded-[22px] bg-white px-5 py-4 text-sm font-medium outline-none ring-1 ring-[#f1e7cf] placeholder:text-gray-400"
                  placeholder={
                    isEventSpaceSupplier
                      ? 'Ex: Gostaria de saber se o espaço está disponível para essa data e qual o orçamento...'
                      : 'Conte um pouco sobre o evento...'
                  }
                />
              </label>

              {errorMessage && (
                <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                  {errorMessage}
                </div>
              )}

              {successMessage && (
                <div className="rounded-2xl bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
                  {successMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={
                  loading ||
                  loadingSupplier ||
                  checkingCerimonialista ||
                  !canReceiveQuote ||
                  (isCerimonialistaMode && !cerimonialistaAllowed)
                }
                className="mt-7 flex w-full items-center justify-center gap-2 rounded-[24px] bg-[#e3a925] py-4 text-center font-extrabold text-white shadow-lg disabled:opacity-60"
              >
                <Send size={21} />
                {loading
                  ? 'Enviando...'
                  : isCerimonialistaMode
                    ? 'Enviar em nome da cliente'
                    : 'Enviar solicitação'}
              </button>
            </form>

            <p className="mt-3 text-center text-xs leading-5 text-gray-500">
              O fornecedor receberá o pedido e poderá responder com um orçamento dentro do app.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}

export default function SolicitarOrcamentoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#fbf7f1] p-6">Carregando...</div>
      }
    >
      <SolicitarOrcamentoContent />
    </Suspense>
  );
}
