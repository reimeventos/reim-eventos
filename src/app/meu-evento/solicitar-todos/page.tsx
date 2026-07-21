'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  Heart,
  Lock,
  LogIn,
  MapPin,
  MessageCircle,
  PartyPopper,
  Send,
  User,
  Users,
} from 'lucide-react';
import { createQuoteRequest, listSavedSuppliers } from '@/lib/suppliers';
import { getMyEvent } from '@/lib/events';
import { supabase } from '@/lib/supabase';

function getSupplierFromSaved(item: any) {
  if (Array.isArray(item.suppliers)) {
    return item.suppliers[0] || null;
  }

  return item.suppliers || null;
}

function getCategoryName(supplier: any) {
  if (!supplier) return 'Serviço não informado';

  if (Array.isArray(supplier.categories)) {
    return supplier.categories[0]?.name || 'Serviço não informado';
  }

  return supplier.categories?.name || 'Serviço não informado';
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

function formatDateForInput(date?: string) {
  if (!date) return '';

  if (date.includes('T')) {
    return date.split('T')[0];
  }

  return date;
}

export default function SolicitarTodosPage() {
  const [user, setUser] = useState<any>(null);
  const [userEmail, setUserEmail] = useState('');
  const [loadingUser, setLoadingUser] = useState(true);

  const [savedSuppliers, setSavedSuppliers] = useState<any[]>([]);
  const [selectedSupplierIds, setSelectedSupplierIds] = useState<string[]>([]);
  const [existingQuoteSupplierIds, setExistingQuoteSupplierIds] = useState<string[]>([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);

  const [customerName, setCustomerName] = useState('');
  const [customerWhatsapp, setCustomerWhatsapp] = useState('');
  const [eventType, setEventType] = useState('Casamento');
  const [eventDate, setEventDate] = useState('');
  const [eventCity, setEventCity] = useState('Eunápolis');
  const [eventSpace, setEventSpace] = useState('');
  const [guestsCount, setGuestsCount] = useState('');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoadingUser(true);
        setLoadingSuppliers(true);

        const { data } = await supabase.auth.getUser();
        const currentUser = data.user || null;

        setUser(currentUser);
        setUserEmail(currentUser?.email || '');

        if (currentUser) {
          const [eventData, suppliersData] = await Promise.all([
            getMyEvent().catch(() => null),
            listSavedSuppliers(),
          ]);

          const params = new URLSearchParams(window.location.search);
          const selectedParam = params.get('fornecedores') || '';
          const requestedIds = selectedParam
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);

          const allSavedList = suppliersData || [];
          const savedList =
            requestedIds.length > 0
              ? allSavedList.filter((item: any) => {
                  const supplier = getSupplierFromSaved(item);
                  return supplier?.id && requestedIds.includes(supplier.id);
                })
              : allSavedList;

          setSavedSuppliers(savedList);
          setSelectedSupplierIds(requestedIds);

          const supplierIds = savedList
            .map((item: any) => getSupplierFromSaved(item)?.id)
            .filter(Boolean);

          if (supplierIds.length > 0) {
            const { data: existingQuotes, error: existingQuotesError } =
              await supabase
                .from('quote_requests')
                .select('supplier_id')
                .eq('customer_id', currentUser.id)
                .in('supplier_id', supplierIds);

            if (existingQuotesError) {
              console.error(
                'Erro ao verificar orçamentos já enviados:',
                existingQuotesError
              );
              setExistingQuoteSupplierIds([]);
            } else {
              setExistingQuoteSupplierIds(
                Array.from(
                  new Set(
                    (existingQuotes || [])
                      .map((quote: any) => quote.supplier_id)
                      .filter(Boolean)
                  )
                )
              );
            }
          } else {
            setExistingQuoteSupplierIds([]);
          }

          if (eventData) {
            setEventType(eventData.event_type || 'Casamento');
            setEventDate(formatDateForInput(eventData.event_date));
            setEventCity(eventData.event_city || eventData.city || 'Eunápolis');
            setEventSpace(eventData.event_space || '');

            const guests =
              eventData.guests_count || eventData.guest_count || '';

            setGuestsCount(guests ? String(guests) : '');

            if (eventData.notes) {
              setNotes(eventData.notes);
            }
          }
        } else {
          setSavedSuppliers([]);
          setExistingQuoteSupplierIds([]);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setUser(null);
        setUserEmail('');
        setSavedSuppliers([]);
        setExistingQuoteSupplierIds([]);
      } finally {
        setLoadingUser(false);
        setLoadingSuppliers(false);
      }
    }

    loadInitialData();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSuccessMessage('');
    setErrorMessage('');

    if (!user) {
      setErrorMessage('Para solicitar orçamento, faça login como cliente.');
      return;
    }

    if (savedSuppliers.length === 0) {
      setErrorMessage('Você ainda não possui fornecedores salvos no Meu Evento.');
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

    if (countWhatsappDigits(customerWhatsapp) < 10) {
      setErrorMessage('Informe um WhatsApp válido com DDD.');
      return;
    }

    if (!eventDate) {
      setErrorMessage('Informe a data do evento.');
      return;
    }

    try {
      setLoading(true);

      const suppliersToSend = savedSuppliers.filter((item) => {
        const supplier = getSupplierFromSaved(item);
        return supplier?.id && !existingQuoteSupplierIds.includes(supplier.id);
      });

      if (suppliersToSend.length === 0) {
        setErrorMessage(
          'Todos os fornecedores salvos já possuem solicitação de orçamento.'
        );
        return;
      }

      const confirmed = window.confirm(
        `Enviar solicitação para ${suppliersToSend.length} fornecedor(es)?`
      );

      if (!confirmed) return;

      let totalSent = 0;
      const sentSupplierIds: string[] = [];

      for (const item of suppliersToSend) {
        const supplier = getSupplierFromSaved(item);

        if (!supplier?.id) continue;

        const categoryName = getCategoryName(supplier);

        await createQuoteRequest({
          supplier_id: supplier.id,
          customer_name: customerName,
          customer_whatsapp: customerWhatsapp,
          event_type: eventType,
          event_date: eventDate,
          event_city: eventCity,
          event_space: eventSpace,
          guests_count: guestsCount ? Number(guestsCount) : undefined,
          service_needed: categoryName,
          notes:
            notes ||
            `Gostaria de orçamento para ${eventType.toLowerCase()} com ${
              guestsCount || 'quantidade de'
            } convidados.`,
        });

        totalSent += 1;
        sentSupplierIds.push(supplier.id);
      }

      if (totalSent === 0) {
        setErrorMessage('Não foi possível enviar para nenhum fornecedor salvo.');
        return;
      }

      setSuccessMessage(
        totalSent === 1
          ? 'Solicitação enviada com sucesso para 1 fornecedor salvo.'
          : `Solicitações enviadas com sucesso para ${totalSent} fornecedores salvos.`
      );

      setExistingQuoteSupplierIds((current) =>
        Array.from(new Set([...current, ...sentSupplierIds]))
      );

      setCustomerName('');
      setCustomerWhatsapp('');
    } catch (error: any) {
      console.error('Erro ao solicitar orçamento para todos:', error);

      setErrorMessage(
        error?.message ||
          'Não foi possível enviar as solicitações. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  }

  const suppliersToSendCount = savedSuppliers.filter((item) => {
    const supplier = getSupplierFromSaved(item);
    return supplier?.id && !existingQuoteSupplierIds.includes(supplier.id);
  }).length;

  return (
    <main className="min-h-screen bg-black text-[#151515]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#fbf7f1] pb-10 shadow-2xl">
        <section className="relative overflow-hidden rounded-b-[34px] bg-black px-6 pb-8 pt-7 text-white">
          <div className="absolute inset-0 bg-[url('/layout01-fundo.png')] bg-cover bg-center opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/80 to-black" />

          <div className="relative z-10">
            <Link
              href="/meu-evento"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#e3a925]"
            >
              <ArrowLeft size={17} />
              Voltar
            </Link>

            <div className="mt-6 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e3a925] text-white shadow-lg">
                <MessageCircle size={31} />
              </div>

              <div>
                <h1 className="font-serif text-[31px] leading-tight">
                  Orçamento para todos
                </h1>

                <p className="mt-1 text-sm text-white/70">
                  Envie uma solicitação para todos os fornecedores salvos.
                </p>
              </div>
            </div>
          </div>
        </section>

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
                Acesse sua conta
              </h2>

              <p className="mt-3 text-sm leading-6 text-gray-600">
                Para solicitar orçamento para seus fornecedores salvos, você precisa estar logado como cliente.
              </p>

              <Link
                href="/login?redirect=/meu-evento/solicitar-todos"
                className="mt-6 flex items-center justify-center gap-2 rounded-[22px] bg-[#e3a925] py-4 text-center font-extrabold text-white shadow-lg"
              >
                <LogIn size={21} />
                Fazer login
              </Link>
            </div>
          </section>
        )}

        {!loadingUser && user && (
          <>
            <section className="px-6 pt-6">
              <div className="rounded-[28px] bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,.08)] ring-1 ring-[#f1e7cf]">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff7e8] text-[#d99200]">
                    <Heart size={30} />
                  </div>

                  <div className="flex-1">
                    <h2 className="text-lg font-extrabold">
                      Fornecedores salvos
                    </h2>

                    <p className="mt-1 text-sm leading-5 text-gray-600">
                      {loadingSuppliers
                        ? 'Carregando fornecedores...'
                        : `${suppliersToSendCount} de ${savedSuppliers.length} fornecedor(es) receberão esta solicitação.`}
                    </p>

                    <p className="mt-3 rounded-2xl bg-[#fbf7f1] px-4 py-3 text-xs font-bold text-gray-500">
                      Conta logada: {userEmail || 'cliente'}
                    </p>

                    {existingQuoteSupplierIds.length > 0 && (
                      <p className="mt-2 flex items-start gap-2 rounded-2xl bg-yellow-50 px-4 py-3 text-xs font-bold leading-5 text-yellow-800 ring-1 ring-yellow-100">
                        <AlertCircle size={15} className="mt-0.5 shrink-0" />
                        Fornecedores que já receberam orçamento não serão enviados novamente.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {!loadingSuppliers && savedSuppliers.length > 0 && (
              <section className="px-6 pt-5">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-lg font-extrabold">Lista de fornecedores</h2>

                  <Link
                    href="/meu-evento"
                    className="text-xs font-extrabold text-[#d99200]"
                  >
                    Editar lista
                  </Link>
                </div>

                <div className="space-y-3">
                  {savedSuppliers.map((item) => {
                    const supplier = getSupplierFromSaved(item);

                    if (!supplier) return null;

                    const categoryName = getCategoryName(supplier);
                    const isAlreadyRequested = existingQuoteSupplierIds.includes(
                      supplier.id
                    );

                    return (
                      <div
                        key={item.id}
                        className="rounded-[22px] bg-white p-4 shadow-sm ring-1 ring-[#f1e7cf]"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-base font-extrabold">
                              {supplier.business_name || 'Fornecedor'}
                            </h3>

                            <p className="mt-1 text-xs font-bold text-gray-500">
                              {categoryName}
                            </p>
                          </div>

                          {isAlreadyRequested ? (
                            <span className="rounded-full bg-yellow-50 px-3 py-1 text-[11px] font-extrabold text-yellow-800 ring-1 ring-yellow-100">
                              Já enviado
                            </span>
                          ) : (
                            <span className="rounded-full bg-green-50 px-3 py-1 text-[11px] font-extrabold text-green-700 ring-1 ring-green-100">
                              Vai receber
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {!loadingSuppliers && savedSuppliers.length === 0 && (
              <section className="px-6 pt-6">
                <div className="rounded-[28px] bg-white p-6 text-center shadow-sm ring-1 ring-[#f1e7cf]">
                  <Heart size={38} className="mx-auto text-[#d99200]" />

                  <h2 className="mt-4 text-lg font-extrabold">
                    Nenhum fornecedor salvo
                  </h2>

                  <p className="mt-2 text-sm leading-5 text-gray-500">
                    Salve fornecedores no Meu Evento antes de solicitar orçamento para todos.
                  </p>

                  <Link
                    href="/buscar"
                    className="mt-5 block rounded-[22px] bg-[#e3a925] py-3 text-sm font-extrabold text-white shadow-lg"
                  >
                    Buscar fornecedores
                  </Link>
                </div>
              </section>
            )}

            {!loadingSuppliers && savedSuppliers.length > 0 && (
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

                  <label className="block">
                    <span className="mb-2 flex items-center gap-2 text-sm font-extrabold">
                      <Building2 size={17} className="text-[#d99200]" />
                      Espaço do evento
                    </span>
                    <input
                      value={eventSpace}
                      onChange={(event) => setEventSpace(event.target.value)}
                      className="w-full rounded-[22px] bg-white px-5 py-4 text-sm font-medium outline-none ring-1 ring-[#f1e7cf] placeholder:text-gray-400"
                      placeholder="Ex: Campo Verde"
                    />
                  </label>

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
                      Mensagem para os fornecedores
                    </span>
                    <textarea
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      className="min-h-[130px] w-full resize-none rounded-[22px] bg-white px-5 py-4 text-sm font-medium outline-none ring-1 ring-[#f1e7cf] placeholder:text-gray-400"
                      placeholder="Conte um pouco sobre seu evento. Esta mensagem será enviada para todos os fornecedores salvos."
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

                  {suppliersToSendCount === 0 && (
                    <div className="rounded-2xl bg-yellow-50 px-4 py-3 text-sm font-bold leading-5 text-yellow-800 ring-1 ring-yellow-100">
                      Todos os fornecedores salvos já possuem orçamento solicitado.
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || suppliersToSendCount === 0}
                    className="mt-7 flex w-full items-center justify-center gap-2 rounded-[24px] bg-black py-4 text-center font-extrabold text-white shadow-lg disabled:opacity-60"
                  >
                    <Send size={21} />
                    {loading
                      ? 'Enviando...'
                      : `Enviar para ${suppliersToSendCount} fornecedor(es)`}
                  </button>
                </form>

                <p className="mt-3 text-center text-xs leading-5 text-gray-500">
                  Cada fornecedor receberá uma solicitação individual no painel dele.
                </p>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
