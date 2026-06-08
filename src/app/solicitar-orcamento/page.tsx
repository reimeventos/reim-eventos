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
  MapPin,
  MessageCircle,
  PartyPopper,
  Send,
  User,
  UserPlus,
  Users,
} from 'lucide-react';
import { createQuoteRequest } from '@/lib/suppliers';
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

function SolicitarOrcamentoContent() {
  const searchParams = useSearchParams();
  const supplierId = searchParams.get('fornecedor') || '';

  const [supplier, setSupplier] = useState<any>(null);
  const [loadingSupplier, setLoadingSupplier] = useState(true);

  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [customerName, setCustomerName] = useState('');
  const [customerWhatsapp, setCustomerWhatsapp] = useState('');
  const [eventType, setEventType] = useState('Casamento');
  const [eventDate, setEventDate] = useState('');
  const [eventCity, setEventCity] = useState('Eunápolis');
  const [eventSpace, setEventSpace] = useState('');
  const [structurePreference, setStructurePreference] = useState('Ainda não sei');
  const [guestsCount, setGuestsCount] = useState('');
  const [serviceNeeded, setServiceNeeded] = useState('');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const supplierCategory = formatCategoryName(supplier);
  const supplierName = supplier?.business_name || 'Fornecedor';

  const isEventSpaceSupplier =
    isSpaceCategory(supplierCategory) || isSpaceCategory(serviceNeeded);

  const currentPath = supplierId
    ? `/solicitar-orcamento?fornecedor=${supplierId}`
    : '/solicitar-orcamento';

  const loginHref = `/login?redirect=${encodeURIComponent(currentPath)}`;
  const cadastroHref = `/cadastro?redirect=${encodeURIComponent(currentPath)}`;

  useEffect(() => {
    async function loadUser() {
      try {
        setLoadingUser(true);

        const { data } = await supabase.auth.getUser();

        setUser(data.user || null);
      } catch (error) {
        console.error('Erro ao verificar login:', error);
        setUser(null);
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
          setSupplier(data);
          setServiceNeeded(formatCategoryName(data));
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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSuccessMessage('');
    setErrorMessage('');

    if (!user) {
      setErrorMessage('Para solicitar orçamento, faça login ou crie sua conta.');
      return;
    }

    if (!supplierId) {
      setErrorMessage(
        'Fornecedor não identificado. Volte para a vitrine e clique em Solicitar orçamento novamente.'
      );
      return;
    }

    if (!customerName.trim()) {
      setErrorMessage('Informe seu nome.');
      return;
    }

    if (!customerWhatsapp.trim()) {
      setErrorMessage('Informe seu WhatsApp.');
      return;
    }

    try {
      setLoading(true);

      await createQuoteRequest({
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
      });

      setSuccessMessage(
        'Solicitação enviada com sucesso! O fornecedor poderá responder com um orçamento dentro do app.'
      );

      setCustomerName('');
      setCustomerWhatsapp('');
      setEventType('Casamento');
      setEventDate('');
      setEventCity('Eunápolis');
      setEventSpace('');
      setStructurePreference('Ainda não sei');
      setGuestsCount('');
      setServiceNeeded(supplierCategory);
      setNotes('');
    } catch (error) {
      console.error(error);
      setErrorMessage('Não foi possível enviar a solicitação. Tente novamente.');
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
              href={supplierId ? `/fornecedor/${supplierId}` : '/buscar'}
              className="inline-flex items-center gap-2 text-sm font-bold text-[#e3a925]"
            >
              <ArrowLeft size={17} />
              Voltar
            </Link>

            <h1 className="mt-5 font-serif text-[34px] leading-tight">
              Solicitar orçamento
            </h1>

            <p className="mt-2 text-sm text-white/70">
              Envie os detalhes do seu evento para o fornecedor.
            </p>
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
        </section>

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
                  href={supplierId ? `/fornecedor/${supplierId}` : '/buscar'}
                  className="block rounded-[22px] bg-white py-4 text-center font-extrabold text-[#151515] ring-1 ring-[#f1e7cf]"
                >
                  Voltar para vitrine
                </Link>
              </div>
            </div>
          </section>
        )}

        {!loadingUser && user && (
          <section className="px-6 pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-extrabold">
                  <User size={17} className="text-[#d99200]" />
                  Nome
                </span>
                <input
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  className="w-full rounded-[22px] bg-white px-5 py-4 text-sm font-medium outline-none ring-1 ring-[#f1e7cf] placeholder:text-gray-400"
                  placeholder="Seu nome"
                />
              </label>

              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-extrabold">
                  <MessageCircle size={17} className="text-[#d99200]" />
                  WhatsApp
                </span>
                <input
                  value={customerWhatsapp}
                  onChange={(event) => setCustomerWhatsapp(event.target.value)}
                  className="w-full rounded-[22px] bg-white px-5 py-4 text-sm font-medium outline-none ring-1 ring-[#f1e7cf] placeholder:text-gray-400"
                  placeholder="(73) 99999-9999"
                />
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
                      : 'Conte um pouco sobre seu evento...'
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
                disabled={loading || loadingSupplier}
                className="mt-7 flex w-full items-center justify-center gap-2 rounded-[24px] bg-[#e3a925] py-4 text-center font-extrabold text-white shadow-lg disabled:opacity-60"
              >
                <Send size={21} />
                {loading ? 'Enviando...' : 'Enviar solicitação'}
              </button>
            </form>

            <p className="mt-3 text-center text-xs leading-5 text-gray-500">
              O fornecedor receberá seu pedido e poderá responder com um orçamento dentro do app.
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
