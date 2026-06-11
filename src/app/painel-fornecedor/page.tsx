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
import { supabase } from '@/lib/supabase';

const shortcuts = [
  {
    title: 'Leads recebidos',
    desc: 'Veja pedidos de orçamento dos clientes',
    href: '/painel-fornecedor/leads',
    icon: MessageCircle,
    color: 'bg-[#e3a925]',
  },
  {
    title: 'Editar vitrine',
    desc: 'Atualize nome, descrição e serviços',
    href: '/painel-fornecedor/editar',
    icon: Pencil,
    color: 'bg-black',
  },
  {
    title: 'Enviar mídias',
    desc: 'Adicione imagens na sua galeria',
    href: '/painel-fornecedor/fotos',
    icon: ImageIcon,
    color: 'bg-black',
  },
  {
    title: 'Planos',
    desc: 'Gerencie seu plano premium',
    href: '/planos',
    icon: Crown,
    color: 'bg-[#e3a925]',
  },
];

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

function isCerimonialistaTestAccount(email: string) {
  return email.toLowerCase().startsWith('cerimonialista@');
}

export default function PainelFornecedorPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [checkingRedirect, setCheckingRedirect] = useState(true);
  const [supplier, setSupplier] = useState<any>(null);
  const [leadsCount, setLeadsCount] = useState(0);
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

      const email = user.email || '';

      if (isCerimonialistaTestAccount(email)) {
        router.replace('/cerimonialista/convites');
        return;
      }

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
        setErrorMessage('Nenhum fornecedor vinculado a esta conta.');
        return;
      }

      setSupplier(supplierData);

      const { data: requestsData, error: requestsError } = await supabase
        .from('quote_requests')
        .select('id,status')
        .eq('supplier_id', supplierData.id);

      if (requestsError) {
        console.error('Erro ao buscar leads:', requestsError);
      }

      const requests = requestsData || [];

      setLeadsCount(requests.length);
      setAnsweredCount(
        requests.filter((item: any) =>
          ['respondido', 'revisado'].includes(item.status)
        ).length
      );
      setClosedCount(
        requests.filter((item: any) => item.status === 'aceito').length
      );

      const { data: messagesData, error: messagesError } = await supabase
        .from('quote_messages')
        .select('id, quote_requests!inner(supplier_id)')
        .eq('quote_requests.supplier_id', supplierData.id)
        .eq('read_by_supplier', false);

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
  const planLabel = supplier.is_featured ? 'Plano Premium' : 'Plano gratuito';
  const publicPriceStatus = supplier.show_price ? 'Ativado' : 'Desativado';

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
                  href="/perfil"
                  className="inline-flex items-center gap-2 text-sm font-bold text-[#e3a925]"
                >
                  <ArrowLeft size={16} />
                  Perfil
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
                className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-[#e3a925]"
              >
                <Bell size={24} />

                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-pink-500 px-1 text-xs font-extrabold text-white">
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
          </div>
        </section>

        {/* RESUMO */}
        <section className="grid grid-cols-3 gap-3 px-6 pt-6">
          <div className="rounded-[22px] bg-white p-4 text-center shadow-sm ring-1 ring-[#f1e7cf]">
            <p className="text-2xl font-extrabold text-[#d99200]">
              {leadsCount}
            </p>
            <p className="mt-1 text-[11px] font-bold text-gray-600">Leads</p>
          </div>

          <div className="rounded-[22px] bg-white p-4 text-center shadow-sm ring-1 ring-[#f1e7cf]">
            <p className="text-2xl font-extrabold text-blue-600">
              {answeredCount}
            </p>
            <p className="mt-1 text-[11px] font-bold text-gray-600">
              Respondido
            </p>
          </div>

          <div className="rounded-[22px] bg-white p-4 text-center shadow-sm ring-1 ring-[#f1e7cf]">
            <p className="text-2xl font-extrabold text-green-600">
              {closedCount}
            </p>
            <p className="mt-1 text-[11px] font-bold text-gray-600">
              Fechado
            </p>
          </div>
        </section>

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
                  className="rounded-[26px] bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,.08)] ring-1 ring-[#f1e7cf]"
                >
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
                  Sua vitrine recebeu novos pedidos de orçamento. Responda rápido
                  para aumentar as chances de fechar contrato.
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
