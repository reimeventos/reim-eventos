'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  BarChart3,
  Bell,
  Camera,
  Crown,
  FileText,
  ImageIcon,
  MessageCircle,
  Pencil,
  Settings,
  Star,
  ToggleRight,
  WalletCards,
} from 'lucide-react';

function getServiceCitiesFromSupplier(supplier: any) {
  const mainCity = supplier?.city || '';
  const serviceCities = Array.isArray(supplier?.service_cities)
    ? supplier.service_cities
    : [];

  return Array.from(
    new Set(
      [mainCity, ...serviceCities]
        .map((city) => String(city || '').trim())
        .filter(Boolean)
    )
  );
}

import { supabase } from '@/lib/supabase';

function getCategoryName(supplier: any) {
  if (!supplier) return 'Categoria não informada';

  if (Array.isArray(supplier.categories)) {
    return supplier.categories[0]?.name || 'Categoria não informada';
  }

  return supplier.categories?.name || 'Categoria não informada';
}

function formatPrice(value: any) {
  if (!value) return 'R$ 0';

  const numberValue = Number(value);

  if (!Number.isNaN(numberValue)) {
    return numberValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  return String(value);
}

function isPendingLead(status?: string) {
  return status === 'novo' || status === 'aguardando_resposta' || !status;
}


function formatDate(date?: string) {
  if (!date) return 'Não informado';

  const [year, month, day] = String(date).split('-');

  if (!year || !month || !day) return date;

  return `${day}/${month}/${year}`;
}

function getDaysUntil(date?: string) {
  if (!date) return null;

  const today = new Date();
  const target = new Date(date);

  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  const diff = target.getTime() - today.getTime();

  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getSubscriptionInfo(subscription: any, visibility?: any) {
  if (visibility && visibility.can_receive_quote === false) {
    if (visibility.public_badge === 'novo_no_reim') {
      return {
        label: 'Perfil pendente',
        detail:
          'Seu teste grátis está ativo, mas sua vitrine ainda precisa estar com perfil ativo para aparecer e responder leads.',
        tone: 'warning',
        planLabel: 'Teste grátis',
        statusLabel: 'Perfil pendente',
        isExpired: true,
        isBlocked: true,
        daysLeft: null as number | null,
      };
    }

    if (visibility.public_badge === 'pendente') {
      return {
        label: 'Pagamento pendente',
        detail: 'Aguarde a confirmação do pagamento pelo admin REIM.',
        tone: 'warning',
        planLabel:
          subscription?.plan === 'premium'
            ? 'Premium Destaque'
            : subscription?.plan === 'profissional'
              ? 'Profissional'
              : 'Plano pendente',
        statusLabel: 'Pendente',
        isExpired: false,
        isBlocked: true,
        daysLeft: null as number | null,
      };
    }

    if (visibility.public_badge === 'sem_assinatura') {
      return {
        label: 'Sem plano ativo',
        detail: 'Inicie o teste grátis de 7 dias ou escolha um plano para receber e responder leads.',
        tone: 'warning',
        planLabel: 'Sem plano',
        statusLabel: 'Sem assinatura',
        isExpired: true,
        isBlocked: true,
        daysLeft: null as number | null,
      };
    }

    if (visibility.public_badge === 'expirado' || visibility.public_badge === 'cancelado') {
      return {
        label:
          visibility.public_badge === 'cancelado'
            ? 'Assinatura cancelada'
            : 'Assinatura expirada',
        detail: 'Escolha o plano Profissional ou Premium para continuar recebendo leads.',
        tone: 'danger',
        planLabel:
          subscription?.plan === 'premium'
            ? 'Premium Destaque'
            : subscription?.plan === 'profissional'
              ? 'Profissional'
              : subscription?.plan === 'teste_7_dias'
                ? 'Teste grátis'
                : 'Sem plano',
        statusLabel: visibility.public_badge === 'cancelado' ? 'Cancelado' : 'Expirado',
        isExpired: true,
        isBlocked: true,
        daysLeft: null as number | null,
      };
    }

    return {
      label: 'Vitrine indisponível',
      detail: 'Sua vitrine não está habilitada para aparecer nas buscas ou responder leads neste momento.',
      tone: 'danger',
      planLabel: 'Indisponível',
      statusLabel: 'Bloqueado',
      isExpired: true,
      isBlocked: true,
      daysLeft: null as number | null,
    };
  }

  if (!subscription) {
    return {
      label: 'Sem plano ativo',
      detail: 'Inicie o teste grátis de 7 dias ou escolha um plano.',
      tone: 'warning',
      planLabel: 'Sem plano',
      statusLabel: 'Sem assinatura',
      isExpired: true,
      isBlocked: true,
      daysLeft: null as number | null,
    };
  }

  const plan = subscription.plan || '';
  const status = subscription.status || '';
  const dueDate = subscription.due_date || '';
  const trialEndsAt = subscription.trial_ends_at || '';
  const daysLeft = getDaysUntil(dueDate || trialEndsAt);

  const expiredByDate = daysLeft !== null && daysLeft < 0;
  const isExpired =
    status === 'expirado' ||
    status === 'cancelado' ||
    (status === 'teste' && expiredByDate);

  if (status === 'teste' && !isExpired) {
    return {
      label: 'Teste grátis ativo',
      detail:
        daysLeft === 0
          ? 'Seu teste vence hoje. Escolha um plano para continuar sem interrupção.'
          : `Seu teste grátis vence em ${daysLeft} dia(s).`,
      tone: 'info',
      planLabel: 'Teste grátis',
      statusLabel: 'Teste 7 dias',
      isExpired: false,
      isBlocked: false,
      daysLeft,
    };
  }

  if (status === 'pendente') {
    return {
      label: 'Pagamento pendente',
      detail: 'Aguarde a confirmação do pagamento pelo admin REIM.',
      tone: 'warning',
      planLabel:
        plan === 'premium'
          ? 'Premium Destaque'
          : plan === 'profissional'
            ? 'Profissional'
            : 'Plano pendente',
      statusLabel: 'Pendente',
      isExpired: false,
      isBlocked: true,
      daysLeft,
    };
  }

  if (status === 'ativo') {
    return {
      label: 'Plano ativo',
      detail:
        daysLeft !== null
          ? `Seu plano está ativo até ${formatDate(dueDate)}.`
          : 'Seu plano está ativo. Acompanhe os detalhes em Meu Plano.',
      tone: 'success',
      planLabel:
        plan === 'premium'
          ? 'Premium Destaque'
          : plan === 'profissional'
            ? 'Profissional'
            : 'Plano ativo',
      statusLabel: 'Ativo',
      isExpired: false,
      isBlocked: false,
      daysLeft,
    };
  }

  return {
    label: 'Assinatura expirada',
    detail: 'Escolha o plano Profissional ou Premium para continuar recebendo leads.',
    tone: 'danger',
    planLabel:
      plan === 'premium'
        ? 'Premium Destaque'
        : plan === 'profissional'
          ? 'Profissional'
          : plan === 'teste_7_dias'
            ? 'Teste grátis'
            : 'Sem plano',
    statusLabel: status === 'cancelado' ? 'Cancelado' : 'Expirado',
    isExpired: true,
    isBlocked: true,
    daysLeft,
  };
}


export default function PainelFornecedorPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [checkingRedirect, setCheckingRedirect] = useState(true);
  const [supplier, setSupplier] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [publicVisibility, setPublicVisibility] = useState<any>(null);
  const [leadsCount, setLeadsCount] = useState(0);
  const [pendingLeadsCount, setPendingLeadsCount] = useState(0);
  const [cerimonialistaLeadsCount, setCerimonialistaLeadsCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [closedCount, setClosedCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  async function loadPanel() {
    try {
      setLoading(true);
      setCheckingRedirect(true);
      setErrorMessage('');

      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      const user = userData.user;

      if (!user) {
        router.replace('/login?redirect=/painel-fornecedor');
        return;
      }

      /*
        Regra correta:
        Cerimonialista com vitrine é fornecedor.
        Portanto não redirecionamos cerimonialista@ direto para convites.
        Primeiro verificamos se existe supplier.owner_id para esta conta.
      */

      setCheckingRedirect(false);

      const { data: supplierData, error: supplierError } = await supabase
        .from('suppliers')
        .select(`
          *,
          categories(name, slug),
          media(file_url, is_cover)
        `)
        .eq('owner_id', user.id)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (supplierError) {
        throw supplierError;
      }

      if (!supplierData) {
        setSupplier(null);
        setSubscription(null);
        setErrorMessage('Nenhum fornecedor vinculado a esta conta.');
        return;
      }

      setSupplier(supplierData);

      const { data: visibilityData, error: visibilityError } = await supabase
        .from('supplier_public_visibility')
        .select(
          'supplier_id, supplier_status, subscription_status, plan, trial_active, plan_active, can_appear_public, can_receive_quote, public_badge, public_label, public_notice'
        )
        .eq('supplier_id', supplierData.id)
        .maybeSingle();

      if (visibilityError) {
        console.error('Erro ao buscar visibilidade do fornecedor:', visibilityError);
      }

      setPublicVisibility(visibilityData || null);

      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('supplier_subscriptions')
        .select('*')
        .eq('supplier_id', supplierData.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (subscriptionError) {
        console.error('Erro ao buscar assinatura do fornecedor:', subscriptionError);
      }

      setSubscription(subscriptionData?.[0] || null);

      const { data: requestsData, error: requestsError } = await supabase
        .from('quote_requests')
        .select('id,status,created_by_role')
        .eq('supplier_id', supplierData.id);

      if (requestsError) {
        console.error('Erro ao buscar leads:', requestsError);
      }

      const requests = requestsData || [];

      setLeadsCount(requests.length);
      setPendingLeadsCount(
        requests.filter((item: any) => isPendingLead(item.status)).length
      );
      setCerimonialistaLeadsCount(
        requests.filter((item: any) => item.created_by_role === 'cerimonialista')
          .length
      );
      setAnsweredCount(
        requests.filter((item: any) =>
          ['respondido', 'revisado', 'ajuste_solicitado'].includes(item.status)
        ).length
      );
      setClosedCount(
        requests.filter((item: any) =>
          ['aceito', 'fechado'].includes(item.status)
        ).length
      );

      const { data: messagesData, error: messagesError } = await supabase
        .from('quote_messages')
        .select('id, sender_type, quote_requests!inner(supplier_id)')
        .eq('quote_requests.supplier_id', supplierData.id)
        .eq('read_by_supplier', false)
        .in('sender_type', ['cliente', 'cerimonialista']);

      if (messagesError) {
        console.error('Erro ao buscar mensagens não lidas:', messagesError);
      }

      setUnreadCount(messagesData?.length || 0);
    } catch (error: any) {
      console.error('Erro ao carregar painel fornecedor:', error);
      setErrorMessage(error?.message || 'Não foi possível carregar o painel.');
    } finally {
      setLoading(false);
      setCheckingRedirect(false);
    }
  }

  useEffect(() => {
    loadPanel();
  }, []);

  if (loading || checkingRedirect) {
    const serviceCities = getServiceCitiesFromSupplier(supplier);

  return (
      <main className="min-h-screen bg-black text-[#151515]">
        <div className="mx-auto flex min-h-screen w-full max-w-[430px] items-center justify-center bg-[#fbf7f1] px-6 text-center shadow-2xl">
          <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-[#f1e7cf]">
            <Camera size={42} className="mx-auto text-[#d99200]" />
            <h1 className="mt-4 text-xl font-extrabold">Carregando painel</h1>
            <p className="mt-2 text-sm font-bold text-gray-500">
              Verificando conta logada...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!supplier) {
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

              <h1 className="mt-6 font-serif text-[34px] leading-tight">
                Painel fornecedor
              </h1>

              <p className="mt-2 text-sm text-white/70">
                Acesso restrito a contas com fornecedor vinculado.
              </p>
            </div>
          </section>

          <section className="px-6 pt-6">
            <div className="rounded-[28px] bg-white p-6 text-center shadow-sm ring-1 ring-[#f1e7cf]">
              <AlertCircle size={42} className="mx-auto text-[#d99200]" />

              <h2 className="mt-4 text-xl font-extrabold">
                Nenhum fornecedor encontrado
              </h2>

              <p className="mt-2 text-sm leading-5 text-gray-500">
                {errorMessage ||
                  'Esta conta não possui um fornecedor vinculado. Use uma conta de fornecedor ou crie um perfil profissional.'}
              </p>

              <div className="mt-5 space-y-3">
                <Link
                  href="/perfil"
                  className="block rounded-[22px] bg-black py-4 text-center font-extrabold text-white shadow-lg"
                >
                  Voltar para Perfil
                </Link>

                <Link
                  href="/cerimonialista/convites"
                  className="block rounded-[22px] bg-[#e3a925] py-4 text-center font-extrabold text-white shadow-lg"
                >
                  Ir para convites da cerimonialista
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  }

  const supplierName = supplier.business_name || 'Fornecedor';
  const categoryName = getCategoryName(supplier);
  const rating = supplier.rating_average || '4.9';
  const averagePrice = formatPrice(supplier.average_price);
  const subscriptionInfo = getSubscriptionInfo(subscription, publicVisibility);
  const planLabel = subscriptionInfo.planLabel;
  const publicPriceStatus = supplier.show_price ? 'Ativado' : 'Desativado';
  const hasAttention = unreadCount > 0 || pendingLeadsCount > 0;
  const canReceiveQuote = Boolean(publicVisibility?.can_receive_quote);
  const canAppearPublic = Boolean(publicVisibility?.can_appear_public);

  const shortcuts = [
    {
      title: 'Leads recebidos',
      desc:
        !canReceiveQuote
          ? 'Regularize sua vitrine para responder leads'
          : unreadCount > 0
            ? `${unreadCount} mensagem(ns) nova(s) aguardando leitura`
            : pendingLeadsCount > 0
              ? `${pendingLeadsCount} lead(s) novo(s) aguardando resposta`
              : 'Veja pedidos de orçamento dos clientes',
      href: '/painel-fornecedor/leads',
      icon: MessageCircle,
      color: hasAttention ? 'bg-pink-500' : 'bg-[#e3a925]',
      highlight: hasAttention,
      badge: unreadCount > 0 ? unreadCount : pendingLeadsCount,
    },
    {
      title: 'Editar vitrine',
      desc: 'Atualize nome, descrição e serviços',
      href: '/painel-fornecedor/editar',
      icon: Pencil,
      color: 'bg-black',
      highlight: false,
      badge: 0,
    },
    {
      title: 'Enviar mídias',
      desc: 'Adicione imagens na sua galeria',
      href: '/painel-fornecedor/fotos',
      icon: ImageIcon,
      color: 'bg-black',
      highlight: false,
      badge: 0,
    },
    {
      title: 'Planos da vitrine',
      desc: 'Teste grátis, Profissional e Premium',
      href: '/painel-fornecedor/planos',
      icon: Crown,
      color: 'bg-[#e3a925]',
      highlight: false,
      badge: 0,
    },
  ];

  return (
    <main className="min-h-screen bg-black text-[#151515]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#fbf7f1] pb-10 shadow-2xl">
        {/* TOPO */}
        <section className="relative overflow-hidden rounded-b-[34px] bg-black px-6 pb-8 pt-7 text-white">
          <div className="absolute inset-0 bg-[url('/layout01-fundo.png')] bg-cover bg-center opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/85 to-black" />

          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-sm font-bold text-[#e3a925]"
                >
                  <ArrowLeft size={16} />
                  Home
                </Link>

                <p className="mt-4 text-sm font-bold text-[#e3a925]">
                  Fornecedor
                </p>

                <h1 className="mt-2 font-serif text-[34px] leading-tight">
                  Painel
                </h1>
              </div>

              <Link
                href="/painel-fornecedor/leads"
                className={
                  unreadCount > 0
                    ? 'relative flex h-12 w-12 items-center justify-center rounded-full bg-pink-500 text-white shadow-lg ring-4 ring-pink-500/25'
                    : 'relative flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-[#e3a925]'
                }
              >
                <Bell size={24} />

                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-white px-1 text-xs font-extrabold text-pink-600">
                    {unreadCount}
                  </span>
                )}
              </Link>
            </div>

            <div className="mt-6 rounded-[28px] bg-white/10 p-5 backdrop-blur">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e3a925] text-white shadow-lg">
                  <Camera size={34} />
                </div>

                <div>
                  <h2 className="text-xl font-extrabold">{supplierName}</h2>

                  <p className="mt-1 text-sm text-white/70">
                    {categoryName}
                  </p>

                  <p className="mt-2 flex items-center gap-1 text-sm font-bold text-[#e3a925]">
                    <Star size={15} fill="#e3a925" />
                    {rating} • {planLabel}
                  </p>
                </div>
              </div>
            </div>

            {hasAttention && (
              <Link
                href="/painel-fornecedor/leads"
                className="mt-4 block rounded-[22px] bg-white p-4 text-[#151515] shadow-lg"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-pink-500 text-white">
                    <Bell size={23} />
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-extrabold">
                      Atenção nos leads
                    </p>

                    <p className="mt-1 text-xs font-bold leading-5 text-gray-600">
                      {unreadCount > 0
                        ? `${unreadCount} mensagem(ns) nova(s) da cliente ou cerimonialista.`
                        : `${pendingLeadsCount} lead(s) novo(s) aguardando resposta.`}
                    </p>
                  </div>
                </div>
              </Link>
            )}
          </div>
        </section>

        {/* RESUMO */}
        <section className="grid grid-cols-4 gap-2 px-6 pt-6">
          <div className="rounded-[20px] bg-white p-3 text-center shadow-sm ring-1 ring-[#f1e7cf]">
            <p className="text-xl font-extrabold text-[#d99200]">
              {leadsCount}
            </p>
            <p className="mt-1 text-[10px] font-bold text-gray-600">Leads</p>
          </div>

          <div className="rounded-[20px] bg-white p-3 text-center shadow-sm ring-1 ring-[#f1e7cf]">
            <p className="text-xl font-extrabold text-pink-600">
              {unreadCount}
            </p>
            <p className="mt-1 text-[10px] font-bold text-gray-600">Msgs</p>
          </div>

          <div className="rounded-[20px] bg-white p-3 text-center shadow-sm ring-1 ring-[#f1e7cf]">
            <p className="text-xl font-extrabold text-blue-600">
              {answeredCount}
            </p>
            <p className="mt-1 text-[10px] font-bold text-gray-600">Resp.</p>
          </div>

          <div className="rounded-[20px] bg-white p-3 text-center shadow-sm ring-1 ring-[#f1e7cf]">
            <p className="text-xl font-extrabold text-green-600">
              {closedCount}
            </p>
            <p className="mt-1 text-[10px] font-bold text-gray-600">Fechado</p>
          </div>
        </section>

        <section className="px-6 pt-4">
          <div
            className={
              subscriptionInfo.tone === 'danger'
                ? 'rounded-[22px] bg-red-50 p-4 text-sm leading-5 text-red-700 ring-1 ring-red-100'
                : subscriptionInfo.tone === 'warning'
                  ? 'rounded-[22px] bg-yellow-50 p-4 text-sm leading-5 text-yellow-800 ring-1 ring-yellow-100'
                  : subscriptionInfo.tone === 'success'
                    ? 'rounded-[22px] bg-green-50 p-4 text-sm leading-5 text-green-700 ring-1 ring-green-100'
                    : 'rounded-[22px] bg-blue-50 p-4 text-sm leading-5 text-blue-700 ring-1 ring-blue-100'
            }
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/70">
                {subscriptionInfo.tone === 'danger' ? (
                  <AlertCircle size={22} />
                ) : (
                  <Crown size={22} />
                )}
              </div>

              <div className="flex-1">
                <p className="font-extrabold">{subscriptionInfo.label}</p>
                <p className="mt-1 text-xs font-bold opacity-80">
                  {subscriptionInfo.detail}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/70 px-3 py-1 text-[10px] font-extrabold">
                    {subscriptionInfo.planLabel}
                  </span>

                  <span className="rounded-full bg-white/70 px-3 py-1 text-[10px] font-extrabold">
                    {subscriptionInfo.statusLabel}
                  </span>
                </div>

                {subscriptionInfo.isBlocked && (
                  <Link
                    href="/painel-fornecedor/planos"
                    className="mt-3 inline-flex rounded-full bg-[#e3a925] px-4 py-2 text-xs font-extrabold text-white shadow-sm"
                  >
                    Escolher plano
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 pt-4">
          <div
            className={
              canAppearPublic && canReceiveQuote
                ? 'rounded-[22px] bg-green-50 p-4 text-sm leading-5 text-green-700 ring-1 ring-green-100'
                : 'rounded-[22px] bg-red-50 p-4 text-sm leading-5 text-red-700 ring-1 ring-red-100'
            }
          >
            <p className="font-extrabold">Status público da vitrine</p>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-2xl bg-white/70 p-3">
                <p className="text-[10px] font-extrabold uppercase opacity-70">
                  Nas buscas
                </p>
                <p className="mt-1 text-sm font-extrabold">
                  {canAppearPublic ? 'Aparecendo' : 'Oculta'}
                </p>
              </div>

              <div className="rounded-2xl bg-white/70 p-3">
                <p className="text-[10px] font-extrabold uppercase opacity-70">
                  Orçamentos
                </p>
                <p className="mt-1 text-sm font-extrabold">
                  {canReceiveQuote ? 'Recebendo' : 'Bloqueado'}
                </p>
              </div>
            </div>

            {!canReceiveQuote && (
              <p className="mt-3 text-xs font-bold opacity-90">
                Sua vitrine não aparece para clientes e não recebe/responde novos orçamentos até regularizar perfil ou assinatura.
              </p>
            )}

            {publicVisibility?.public_badge === 'novo_no_reim' &&
              canReceiveQuote && (
                <p className="mt-3 text-xs font-bold opacity-90">
                  Você está em fase inicial no REIM. Após o teste, escolha um plano para continuar aparecendo nas buscas.
                </p>
              )}

            {!canReceiveQuote && (
              <Link
                href="/painel-fornecedor/planos"
                className="mt-4 inline-flex rounded-full bg-[#e3a925] px-4 py-2 text-xs font-extrabold text-white shadow-sm"
              >
                Escolher plano
              </Link>
            )}
          </div>
        </section>

        {cerimonialistaLeadsCount > 0 && (
          <section className="px-6 pt-4">
            <div className="rounded-[22px] bg-[#fff7e8] p-4 text-sm leading-5 text-[#7a5200] ring-1 ring-[#f1e7cf]">
              <p className="font-extrabold">
                {cerimonialistaLeadsCount} lead(s) vieram de cerimonialista.
              </p>
              <p className="mt-1">
                Na tela de leads você consegue ver a origem de cada solicitação.
              </p>
            </div>
          </section>
        )}

        {/* ATALHOS */}
        <section className="px-6 pt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-extrabold">Ações rápidas</h2>
            <span className="text-xs font-bold text-gray-500">Gerenciar</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {shortcuts.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className={
                    item.highlight
                      ? 'relative rounded-[26px] bg-white p-5 shadow-[0_10px_25px_rgba(219,39,119,.20)] ring-2 ring-pink-300'
                      : 'relative rounded-[26px] bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,.08)] ring-1 ring-[#f1e7cf]'
                  }
                >
                  {item.badge > 0 && (
                    <span className="absolute right-3 top-3 flex h-7 min-w-7 items-center justify-center rounded-full bg-pink-500 px-2 text-xs font-extrabold text-white">
                      {item.badge}
                    </span>
                  )}

                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.color} text-white`}
                  >
                    <Icon size={25} />
                  </div>

                  <h3 className="mt-4 text-sm font-extrabold">
                    {item.title}
                  </h3>

                  <p className="mt-1 text-xs leading-4 text-gray-500">
                    {item.desc}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* CONFIGURAÇÕES */}
        <section className="px-6 pt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-extrabold">Configurações</h2>
            <Settings size={20} className="text-[#d99200]" />
          </div>

          <div className="space-y-4">
            <div className="rounded-[26px] bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,.08)] ring-1 ring-[#f1e7cf]">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff7e8] text-[#d99200]">
                    <ToggleRight size={27} />
                  </div>

                  <div>
                    <h3 className="text-sm font-extrabold">Preço público</h3>
                    <p className="mt-1 text-xs text-gray-500">
                      Mostrar valor na vitrine
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-extrabold text-gray-600">
                  {publicPriceStatus}
                </span>
              </div>
            </div>

            <div className="rounded-[26px] bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,.08)] ring-1 ring-[#f1e7cf]">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff7e8] text-[#d99200]">
                    <WalletCards size={27} />
                  </div>

                  <div>
                    <h3 className="text-sm font-extrabold">Valor inicial</h3>
                    <p className="mt-1 text-xs text-gray-500">
                      Usado se preço público estiver ativo
                    </p>
                  </div>
                </div>

                <span className="text-sm font-extrabold text-[#d99200]">
                  {averagePrice}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* RELATÓRIO */}
        <section className="px-6 pt-6">
          <div className="rounded-[28px] bg-black p-5 text-white shadow-xl">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e3a925] text-white">
                <BarChart3 size={30} />
              </div>

              <div className="flex-1">
                <h2 className="text-lg font-extrabold">Resumo da semana</h2>
                <p className="mt-2 text-sm leading-5 text-white/70">
                  {subscriptionInfo.isBlocked
                    ? 'Sua vitrine está bloqueada para aparecer nas buscas ou responder leads. Regularize perfil ou assinatura para continuar usando todos os recursos do fornecedor.'
                    : hasAttention
                      ? 'Você tem leads ou mensagens novas aguardando atenção. Responda rápido para aumentar as chances de fechar contrato.'
                      : 'Sua vitrine está pronta para receber novos pedidos de orçamento. Mantenha fotos e informações atualizadas.'}
                </p>

                <Link
                  href="/painel-fornecedor/leads"
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#e3a925] px-5 py-2 text-sm font-extrabold text-white"
                >
                  <FileText size={17} />
                  Ver leads
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
