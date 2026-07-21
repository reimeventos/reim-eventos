'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Eye,
  FileText,
  Heart,
  Loader2,
  MapPin,
  MessageCircle,
  Plus,
  Square,
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
    return supplier.categories[0]?.name || 'Categoria não informada';
  }

  return supplier?.categories?.name || 'Categoria não informada';
}

function getCoverImage(supplier: any) {
  const media = Array.isArray(supplier?.media) ? supplier.media : [];
  const cover = media.find((item: any) => item?.is_cover);

  return (
    cover?.file_url ||
    media[0]?.file_url ||
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1000&auto=format&fit=crop'
  );
}

function formatRating(value: any) {
  const numberValue = Number(value);

  if (!value || Number.isNaN(numberValue) || numberValue <= 0) {
    return 'Novo';
  }

  return numberValue.toFixed(1);
}

function getEventCity(event: any) {
  return event?.event_city || event?.city || 'Eunápolis';
}

export default function FavoritosPage() {
  const router = useRouter();

  const [savedSuppliers, setSavedSuppliers] = useState<any[]>([]);
  const [eventData, setEventData] = useState<any>(null);
  const [quoteRequests, setQuoteRequests] = useState<any[]>([]);
  const [selectedSupplierIds, setSelectedSupplierIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  async function loadPage() {
    try {
      setLoading(true);
      setErrorMessage('');

      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError) throw userError;

      const user = userData.user;

      if (!user) {
        router.replace(
          '/login?redirect=' + encodeURIComponent('/favoritos')
        );
        return;
      }

      const [savedResult, eventResult] = await Promise.all([
        listSavedSuppliers(),
        getMyEvent().catch(() => null),
      ]);

      const savedList = savedResult || [];
      setSavedSuppliers(savedList);
      setEventData(eventResult);

      const supplierIds = savedList
        .map(
          (item: any) =>
            getSupplierFromSaved(item)?.id || item?.supplier_id
        )
        .filter(Boolean);

      setSelectedSupplierIds((current) =>
        current.filter((id) => supplierIds.includes(id))
      );

      if (supplierIds.length === 0) {
        setQuoteRequests([]);
        return;
      }

      const { data: quoteData, error: quoteError } =
        await supabase
          .from('quote_requests')
          .select('id,supplier_id,status,created_at')
          .eq('customer_id', user.id)
          .in('supplier_id', supplierIds)
          .order('created_at', { ascending: false });

      if (quoteError) {
        console.error(
          'Erro ao carregar orçamentos dos favoritos:',
          quoteError
        );
      }

      setQuoteRequests(quoteData || []);
    } catch (error: any) {
      console.error('Erro ao carregar favoritos:', error);
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

  const validSuppliers = useMemo(
    () =>
      savedSuppliers
        .map((item) => ({
          savedItem: item,
          supplier: getSupplierFromSaved(item),
        }))
        .filter((item) => Boolean(item.supplier?.id)),
    [savedSuppliers]
  );

  const availableSupplierIds = validSuppliers
    .map((item) => item.supplier.id)
    .filter(Boolean);

  const allSelected =
    availableSupplierIds.length > 0 &&
    availableSupplierIds.every((id) =>
      selectedSupplierIds.includes(id)
    );

  function toggleSupplier(supplierId: string) {
    setSelectedSupplierIds((current) =>
      current.includes(supplierId)
        ? current.filter((id) => id !== supplierId)
        : [...current, supplierId]
    );
  }

  function toggleAll() {
    setSelectedSupplierIds(
      allSelected ? [] : availableSupplierIds
    );
  }

  function getQuoteForSupplier(supplierId: string) {
    return (
      quoteRequests.find(
        (quote) => quote.supplier_id === supplierId
      ) || null
    );
  }

  async function handleRemove(supplierId: string) {
    const confirmed = window.confirm(
      'Deseja remover este fornecedor dos seus favoritos?'
    );

    if (!confirmed) return;

    try {
      setRemovingId(supplierId);
      setErrorMessage('');
      setSuccessMessage('');

      await unsaveSupplier(supplierId);
      setSelectedSupplierIds((current) =>
        current.filter((id) => id !== supplierId)
      );
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

  const eventCity = getEventCity(eventData);
  const selectedCount = selectedSupplierIds.length;
  const selectedQuery = encodeURIComponent(
    selectedSupplierIds.join(',')
  );

  return (
    <main className="min-h-screen bg-black text-[#151515]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#fbf7f1] pb-40 shadow-2xl">
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
                <Heart size={31} fill="currentColor" />
              </div>

              <div>
                <p className="text-sm font-bold text-[#e3a925]">
                  Cliente
                </p>
                <h1 className="font-serif text-[34px] leading-tight">
                  Meus favoritos
                </h1>
                <p className="mt-1 text-sm text-white/70">
                  Selecione todos ou apenas alguns fornecedores.
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="rounded-[20px] bg-white/10 p-3 text-center">
                <p className="text-xl font-extrabold text-[#e3a925]">
                  {validSuppliers.length}
                </p>
                <p className="mt-1 text-[10px] font-bold text-white/60">
                  Favoritos
                </p>
              </div>

              <div className="rounded-[20px] bg-white/10 p-3 text-center">
                <p className="text-xl font-extrabold text-[#e3a925]">
                  {selectedCount}
                </p>
                <p className="mt-1 text-[10px] font-bold text-white/60">
                  Selecionados
                </p>
              </div>

              <div className="rounded-[20px] bg-white/10 p-3 text-center">
                <p className="text-xl font-extrabold text-[#e3a925]">
                  {quoteRequests.length}
                </p>
                <p className="mt-1 text-[10px] font-bold text-white/60">
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
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-extrabold">
                Lista de favoritos
              </h2>
              <p className="mt-1 text-xs font-bold text-gray-500">
                Marque quem receberá o orçamento.
              </p>
            </div>

            <Link
              href={`/buscar?cidade=${encodeURIComponent(
                eventCity
              )}`}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e3a925] text-white shadow-lg"
            >
              <Plus size={22} />
            </Link>
          </div>

          {!loading && validSuppliers.length > 0 && (
            <button
              type="button"
              onClick={toggleAll}
              className="mb-4 flex w-full items-center justify-between rounded-[20px] bg-white px-4 py-4 text-left shadow-sm ring-1 ring-[#f1e7cf]"
            >
              <span className="text-sm font-extrabold">
                {allSelected
                  ? 'Desmarcar todos'
                  : 'Selecionar todos'}
              </span>

              <span
                className={
                  allSelected
                    ? 'flex h-7 w-7 items-center justify-center rounded-lg bg-[#e3a925] text-white'
                    : 'flex h-7 w-7 items-center justify-center rounded-lg border-2 border-[#d7c9aa] text-transparent'
                }
              >
                {allSelected ? (
                  <Check size={18} />
                ) : (
                  <Square size={16} />
                )}
              </span>
            </button>
          )}

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

          {!loading && validSuppliers.length === 0 && (
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
              {validSuppliers.map(
                ({ savedItem, supplier }) => {
                  const quote =
                    getQuoteForSupplier(supplier.id);
                  const rating = formatRating(
                    supplier.rating_average
                  );
                  const isSelected =
                    selectedSupplierIds.includes(
                      supplier.id
                    );

                  return (
                    <div
                      key={
                        savedItem.id || supplier.id
                      }
                      className={
                        isSelected
                          ? 'overflow-hidden rounded-[28px] bg-white shadow-[0_10px_25px_rgba(0,0,0,.08)] ring-2 ring-[#e3a925]'
                          : 'overflow-hidden rounded-[28px] bg-white shadow-[0_10px_25px_rgba(0,0,0,.08)] ring-1 ring-[#f1e7cf]'
                      }
                    >
                      <button
                        type="button"
                        onClick={() =>
                          toggleSupplier(supplier.id)
                        }
                        className="flex w-full items-center gap-3 p-4 text-left"
                      >
                        <span
                          className={
                            isSelected
                              ? 'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#e3a925] text-white'
                              : 'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 border-[#d7c9aa] text-transparent'
                          }
                        >
                          <Check size={18} />
                        </span>

                        <img
                          src={getCoverImage(
                            supplier
                          )}
                          alt={
                            supplier.business_name ||
                            'Fornecedor'
                          }
                          className="h-20 w-20 shrink-0 rounded-[18px] object-cover"
                        />

                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-base font-extrabold">
                            {supplier.business_name ||
                              'Fornecedor'}
                          </h3>

                          <p className="mt-1 truncate text-xs font-bold text-gray-500">
                            {getCategoryName(
                              supplier
                            )}
                          </p>

                          <p className="mt-2 flex items-center gap-1 text-xs font-bold text-[#b97900]">
                            <Star
                              size={13}
                              fill={
                                rating === 'Novo'
                                  ? 'none'
                                  : '#e3a925'
                              }
                            />
                            {rating}
                          </p>

                          <p className="mt-1 flex items-center gap-1 truncate text-xs font-bold text-gray-500">
                            <MapPin size={13} />
                            {supplier.city ||
                              'Cidade não informada'}
                          </p>
                        </div>
                      </button>

                      <div className="grid grid-cols-2 gap-3 border-t border-[#f1e7cf] p-4">
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

                        <button
                          type="button"
                          onClick={() =>
                            handleRemove(
                              supplier.id
                            )
                          }
                          disabled={
                            removingId === supplier.id
                          }
                          className="col-span-2 flex items-center justify-center gap-2 rounded-[18px] bg-red-50 py-3 text-sm font-extrabold text-red-700 disabled:opacity-60"
                        >
                          <Trash2 size={16} />
                          {removingId === supplier.id
                            ? 'Removendo...'
                            : 'Remover dos favoritos'}
                        </button>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </section>

        {!loading && selectedCount > 0 && (
          <div className="fixed bottom-[82px] left-1/2 z-30 w-full max-w-[430px] -translate-x-1/2 px-6">
            <Link
              href={`/meu-evento/solicitar-todos?cidade=${encodeURIComponent(
                eventCity
              )}&fornecedores=${selectedQuery}`}
              className="flex w-full items-center justify-center gap-2 rounded-[24px] bg-[#e3a925] py-4 text-center font-extrabold text-white shadow-[0_14px_35px_rgba(0,0,0,.25)]"
            >
              <MessageCircle size={21} />
              Solicitar para {selectedCount}{' '}
              fornecedor(es)
            </Link>
          </div>
        )}

        <Nav />
      </div>
    </main>
  );
}
