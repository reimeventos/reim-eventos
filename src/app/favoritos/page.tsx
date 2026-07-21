'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  FileText,
  Heart,
  Loader2,
  MapPin,
  MessageCircle,
  Plus,
  Star,
  Trash2,
} from 'lucide-react';
import { Nav } from '@/components/Nav';
import {
  listSavedSuppliers,
  unsaveSupplier,
} from '@/lib/suppliers';
import { getMyEvent } from '@/lib/events';
import { supabase } from '@/lib/supabase';

function getSupplierFromSaved(item: any) {
  if (Array.isArray(item?.suppliers)) {
    return item.suppliers[0] || null;
  }

  return item?.suppliers || null;
}

function getCategoryName(supplier: any) {
  if (Array.isArray(supplier?.categories)) {
    return (
      supplier.categories[0]?.name ||
      'Categoria não informada'
    );
  }

  return (
    supplier?.categories?.name ||
    'Categoria não informada'
  );
}

function getCoverImage(supplier: any) {
  const media = Array.isArray(supplier?.media)
    ? supplier.media
    : [];

  const cover = media.find(
    (item: any) => item?.is_cover
  );

  return (
    cover?.file_url ||
    media[0]?.file_url ||
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1000&auto=format&fit=crop'
  );
}

function formatRating(value: any) {
  const numericValue = Number(value);

  if (
    value === null ||
    value === undefined ||
    value === '' ||
    Number.isNaN(numericValue) ||
    numericValue <= 0
  ) {
    return 'Novo';
  }

  return numericValue.toFixed(1);
}

function getEventCity(event: any) {
  return (
    event?.event_city ||
    event?.city ||
    'Eunápolis'
  );
}

export default function FavoritosPage() {
  const router = useRouter();

  const [savedSuppliers, setSavedSuppliers] =
    useState<any[]>([]);
  const [eventData, setEventData] =
    useState<any>(null);
  const [quoteRequests, setQuoteRequests] =
    useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] =
    useState('');
  const [errorMessage, setErrorMessage] =
    useState('');
  const [successMessage, setSuccessMessage] =
    useState('');

  async function loadPage() {
    try {
      setLoading(true);
      setErrorMessage('');

      const {
        data: userData,
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      const user = userData.user;

      if (!user) {
        router.replace(
          '/login?redirect=' +
            encodeURIComponent('/favoritos')
        );
        return;
      }

      const [savedResult, eventResult] =
        await Promise.all([
          listSavedSuppliers(),
          getMyEvent().catch(() => null),
        ]);

      const savedList = savedResult || [];
      setSavedSuppliers(savedList);
      setEventData(eventResult);

      const supplierIds = savedList
        .map(
          (item: any) =>
            getSupplierFromSaved(item)?.id ||
            item?.supplier_id
        )
        .filter(Boolean);

      if (supplierIds.length === 0) {
        setQuoteRequests([]);
        return;
      }

      const {
        data: quoteData,
        error: quoteError,
      } = await supabase
        .from('quote_requests')
        .select('id,supplier_id,status,created_at')
        .eq('customer_id', user.id)
        .in('supplier_id', supplierIds)
        .order('created_at', {
          ascending: false,
        });

      if (quoteError) {
        console.error(
          'Erro ao carregar orçamentos dos favoritos:',
          quoteError
        );
      }

      setQuoteRequests(quoteData || []);
    } catch (error: any) {
      console.error(
        'Erro ao carregar favoritos:',
        error
      );

      setErrorMessage(
        error?.message ||
          'Não foi possível carregar seus favoritos.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPage();
  }, []);

  async function handleRemove(
    supplierId: string
  ) {
    const confirmed = window.confirm(
      'Deseja remover este fornecedor dos seus favoritos?'
    );

    if (!confirmed) return;

    try {
      setRemovingId(supplierId);
      setErrorMessage('');
      setSuccessMessage('');

      await unsaveSupplier(supplierId);
      await loadPage();

      setSuccessMessage(
        'Fornecedor removido dos favoritos.'
      );
    } catch (error: any) {
      setErrorMessage(
        error?.message ||
          'Não foi possível remover o fornecedor.'
      );
    } finally {
      setRemovingId('');
    }
  }

  function getQuoteForSupplier(
    supplierId: string
  ) {
    return (
      quoteRequests.find(
        (quote) =>
          quote.supplier_id === supplierId
      ) || null
    );
  }

  const eventCity = getEventCity(eventData);

  return (
    <main className="min-h-screen bg-black text-[#151515]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#fbf7f1] pb-36 shadow-2xl">
        <section className="relative overflow-hidden rounded-b-[34px] bg-black px-6 pb-8 pt-7 text-white">
          <div className="absolute inset-0 bg-[url('/layout01-fundo.png')] bg-cover bg-center opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/80 to-black" />

          <div className="relative z-10">
            <Link
              href="/perfil"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#e3a925]"
            >
              <ArrowLeft size={17} />
              Voltar ao Perfil
            </Link>

            <div className="mt-6 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e3a925] text-white shadow-lg">
                <Heart
                  size={31}
                  fill="currentColor"
                />
              </div>

              <div>
                <p className="text-sm font-bold text-[#e3a925]">
                  Cliente
                </p>

                <h1 className="font-serif text-[34px] leading-tight">
                  Meus favoritos
                </h1>

                <p className="mt-1 text-sm text-white/70">
                  Fornecedores salvos para o seu evento.
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-[20px] bg-white/10 p-4 text-center">
                <p className="text-2xl font-extrabold text-[#e3a925]">
                  {savedSuppliers.length}
                </p>
                <p className="mt-1 text-xs font-bold text-white/60">
                  Favoritos
                </p>
              </div>

              <div className="rounded-[20px] bg-white/10 p-4 text-center">
                <p className="text-2xl font-extrabold text-[#e3a925]">
                  {quoteRequests.length}
                </p>
                <p className="mt-1 text-xs font-bold text-white/60">
                  Orçamentos
                </p>
              </div>
            </div>
          </div>
        </section>

        {(errorMessage || successMessage) && (
          <section className="px-6 pt-4">
            {errorMessage && (
              <div className="rounded-[22px] bg-red-50 p-4 text-sm font-bold text-red-700">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="flex items-center gap-2 rounded-[22px] bg-green-50 p-4 text-sm font-bold text-green-700">
                <CheckCircle2 size={18} />
                {successMessage}
              </div>
            )}
          </section>
        )}

        <section className="px-6 pt-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold">
                Fornecedores salvos
              </h2>
              <p className="mt-1 text-xs font-bold text-gray-500">
                Solicite orçamento individual ou para todos.
              </p>
            </div>

            <Link
              href={`/buscar?cidade=${encodeURIComponent(
                eventCity
              )}`}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e3a925] text-white shadow-lg"
            >
              <Plus size={22} />
            </Link>
          </div>

          {loading && (
            <div className="rounded-[28px] bg-white p-6 text-center shadow-sm ring-1 ring-[#f1e7cf]">
              <Loader2
                size={36}
                className="mx-auto animate-spin text-[#d99200]"
              />
              <p className="mt-3 text-sm font-bold text-gray-500">
                Carregando favoritos...
              </p>
            </div>
          )}

          {!loading &&
            savedSuppliers.length === 0 && (
              <div className="rounded-[28px] bg-white p-6 text-center shadow-sm ring-1 ring-[#f1e7cf]">
                <Heart
                  size={40}
                  className="mx-auto text-[#d99200]"
                />

                <h3 className="mt-4 text-lg font-extrabold">
                  Nenhum favorito salvo
                </h3>

                <p className="mt-2 text-sm leading-5 text-gray-500">
                  Salve fornecedores nas vitrines para encontrá-los aqui.
                </p>

                <Link
                  href={`/buscar?cidade=${encodeURIComponent(
                    eventCity
                  )}`}
                  className="mt-5 flex items-center justify-center gap-2 rounded-[22px] bg-[#e3a925] py-4 font-extrabold text-white"
                >
                  <Plus size={20} />
                  Buscar fornecedores
                </Link>
              </div>
            )}

          {!loading && (
            <div className="space-y-4">
              {savedSuppliers.map((item) => {
                const supplier =
                  getSupplierFromSaved(item);

                if (!supplier?.id) {
                  return null;
                }

                const quote =
                  getQuoteForSupplier(
                    supplier.id
                  );

                const rating = formatRating(
                  supplier.rating_average
                );

                return (
                  <div
                    key={item.id || supplier.id}
                    className="overflow-hidden rounded-[28px] bg-white shadow-[0_10px_25px_rgba(0,0,0,.08)] ring-1 ring-[#f1e7cf]"
                  >
                    <img
                      src={getCoverImage(supplier)}
                      alt={
                        supplier.business_name ||
                        'Fornecedor'
                      }
                      className="h-40 w-full object-cover"
                    />

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-extrabold">
                            {supplier.business_name ||
                              'Fornecedor'}
                          </h3>

                          <p className="mt-1 text-sm text-gray-500">
                            {getCategoryName(
                              supplier
                            )}
                          </p>
                        </div>

                        <span className="flex items-center gap-1 rounded-full bg-[#fff7e8] px-3 py-1 text-xs font-extrabold text-[#b97900]">
                          <Star
                            size={14}
                            fill={
                              rating === 'Novo'
                                ? 'none'
                                : '#e3a925'
                            }
                          />
                          {rating}
                        </span>
                      </div>

                      <p className="mt-3 flex items-center gap-2 text-sm font-bold text-gray-600">
                        <MapPin
                          size={16}
                          className="text-[#d99200]"
                        />
                        {supplier.city ||
                          'Cidade não informada'}
                      </p>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <Link
                          href={`/fornecedor/${supplier.id}`}
                          className="flex items-center justify-center gap-2 rounded-[18px] bg-[#fbf7f1] py-3 text-sm font-extrabold ring-1 ring-[#f1e7cf]"
                        >
                          <Eye size={16} />
                          Ver vitrine
                        </Link>

                        {quote?.id ? (
                          <Link
                            href={`/orcamentos/${quote.id}`}
                            className="flex items-center justify-center gap-2 rounded-[18px] bg-black py-3 text-sm font-extrabold text-white"
                          >
                            <FileText size={16} />
                            Ver orçamento
                          </Link>
                        ) : (
                          <Link
                            href={`/solicitar-orcamento?fornecedor=${supplier.id}&cidade=${encodeURIComponent(
                              eventCity
                            )}`}
                            className="flex items-center justify-center gap-2 rounded-[18px] bg-[#e3a925] py-3 text-sm font-extrabold text-white"
                          >
                            <MessageCircle size={16} />
                            Orçamento
                          </Link>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleRemove(
                            supplier.id
                          )
                        }
                        disabled={
                          removingId ===
                          supplier.id
                        }
                        className="mt-3 flex w-full items-center justify-center gap-2 rounded-[18px] bg-red-50 py-3 text-sm font-extrabold text-red-700 disabled:opacity-60"
                      >
                        <Trash2 size={16} />
                        {removingId ===
                        supplier.id
                          ? 'Removendo...'
                          : 'Remover dos favoritos'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {!loading &&
          savedSuppliers.length > 0 && (
            <div className="fixed bottom-[82px] left-1/2 z-30 w-full max-w-[430px] -translate-x-1/2 px-6">
              <Link
                href={`/meu-evento/solicitar-todos?cidade=${encodeURIComponent(
                  eventCity
                )}`}
                className="flex w-full items-center justify-center gap-2 rounded-[24px] bg-[#e3a925] py-4 text-center font-extrabold text-white shadow-[0_14px_35px_rgba(0,0,0,.25)]"
              >
                <MessageCircle size={21} />
                Solicitar orçamento de todos
              </Link>
            </div>
          )}

        <Nav />
      </div>
    </main>
  );
}
