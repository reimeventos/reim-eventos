'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CalendarDays,
  Clock,
  Heart,
  MapPin,
  Share2,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
  Camera,
  MessageCircle,
  Star,
  Pencil,
  Send,
  Eye,
} from 'lucide-react';
import { Nav } from '@/components/Nav';
import { listSavedSuppliers, unsaveSupplier } from '@/lib/suppliers';
import { getMyEvent } from '@/lib/events';
import { listEventCollaborators } from '@/lib/collaborators';
import { supabase } from '@/lib/supabase';

function getTestAccountType(email: string) {
  const normalized = email.toLowerCase();

  if (normalized.startsWith('cliente@')) return 'cliente';
  if (normalized.startsWith('fornecedor@')) return 'fornecedor';
  if (normalized.startsWith('cerimonialista@')) return 'cerimonialista';

  return '';
}

function getSupplierFromSaved(item: any) {
  if (Array.isArray(item.suppliers)) return item.suppliers[0] || null;
  return item.suppliers || null;
}

function getSupplierFromCollaborator(item: any) {
  if (Array.isArray(item.suppliers)) return item.suppliers[0] || null;
  return item.suppliers || null;
}

function getCategoryName(supplier: any) {
  if (!supplier) return 'Categoria não informada';

  if (Array.isArray(supplier.categories)) {
    return supplier.categories[0]?.name || 'Categoria não informada';
  }

  return supplier.categories?.name || 'Categoria não informada';
}

function getCoverImage(supplier: any) {
  const media = supplier?.media || [];
  const cover = media.find((item: any) => item.is_cover);

  if (cover?.file_url) return cover.file_url;
  if (media?.[0]?.file_url) return media[0].file_url;

  return 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1000&auto=format&fit=crop';
}

function formatPrice(value: any) {
  if (!value) return 'Sob consulta';

  const numberValue = Number(value);

  if (!Number.isNaN(numberValue)) {
    return numberValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  return String(value);
}

function formatRating(value: any) {
  if (!value) return '4.9';

  const numberValue = Number(value);

  if (Number.isNaN(numberValue)) return String(value);

  return numberValue.toFixed(1);
}

function formatDate(date?: string) {
  if (!date) return 'Data não informada';

  const [year, month, day] = date.split('-');

  if (!year || !month || !day) return date;

  return `${day}/${month}/${year}`;
}

function getEventTitle(event: any) {
  return event?.couple_name || event?.event_name || event?.title || 'Meu Evento';
}

function getEventDate(event: any) {
  return event?.event_date || '';
}

function getEventCity(event: any) {
  return event?.event_city || event?.city || 'Eunápolis';
}

function getGuestsCount(event: any) {
  return event?.guests_count || event?.guest_count || null;
}

function getEventSpace(event: any) {
  return event?.event_space || '';
}

function getCollaboratorDisplayName(item: any) {
  const supplier = getSupplierFromCollaborator(item);

  return (
    supplier?.business_name ||
    item?.collaborator_name ||
    item?.collaborator_email ||
    'Cerimonialista'
  );
}

function getCollaboratorStatusLabel(status: string) {
  if (status === 'aceito') return 'Atuando no evento';
  if (status === 'recusado') return 'Recusado';
  return 'Pendente';
}

function getCollaboratorStatusClass(status: string) {
  if (status === 'aceito') {
    return 'bg-green-50 text-green-700 ring-green-100';
  }

  if (status === 'recusado') {
    return 'bg-red-50 text-red-700 ring-red-100';
  }

  return 'bg-yellow-50 text-yellow-700 ring-yellow-100';
}

function getCollaboratorLink(item: any) {
  const supplier = getSupplierFromCollaborator(item);
  const supplierId = item?.supplier_id || supplier?.id;

  if (supplierId) {
    return `/fornecedor/${supplierId}`;
  }

  return '/meu-evento/compartilhar';
}

function getWhatsappShareUrl() {
  const appUrl = 'https://reim-eventos.vercel.app';
  const text =
    'Conheça o REIM EVENTOS: encontre fornecedores para casamento, aniversário e eventos em Eunápolis. Acesse: ' +
    appUrl;

  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export default function MeuEventoPage() {
  const router = useRouter();

  const [checkingAccess, setCheckingAccess] = useState(true);
  const [eventData, setEventData] = useState<any>(null);
  const [savedSuppliers, setSavedSuppliers] = useState<any[]>([]);
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState('');
  const [removingCollaboratorId, setRemovingCollaboratorId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  async function checkAccess() {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!user) {
        router.replace('/login?redirect=/meu-evento');
        return false;
      }

      const email = user.email || '';
      const testType = getTestAccountType(email);

      if (testType === 'cerimonialista') {
        router.replace('/cerimonialista/convites');
        return false;
      }

      if (testType === 'fornecedor') {
        router.replace('/painel-fornecedor');
        return false;
      }

      if (testType === 'cliente') {
        return true;
      }

      const { data: collaboratorData } = await supabase
        .from('event_collaborators')
        .select('id')
        .ilike('collaborator_email', email)
        .limit(1);

      if (collaboratorData && collaboratorData.length > 0) {
        router.replace('/cerimonialista/convites');
        return false;
      }

      const { data: supplierData } = await supabase
        .from('suppliers')
        .select('id')
        .eq('owner_id', user.id)
        .limit(1);

      if (supplierData && supplierData.length > 0) {
        router.replace('/painel-fornecedor');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao verificar acesso ao Meu Evento:', error);
      return true;
    }
  }

  async function loadPageData() {
    try {
      setLoading(true);
      setErrorMessage('');

      const canAccess = await checkAccess();

      if (!canAccess) return;

      const [eventResult, suppliersResult, collaboratorsResult] =
        await Promise.all([
          getMyEvent().catch(() => null),
          listSavedSuppliers(),
          listEventCollaborators().catch(() => []),
        ]);

      setEventData(eventResult);
      setSavedSuppliers(suppliersResult || []);
      setCollaborators(collaboratorsResult || []);
    } catch (error: any) {
      console.error('Erro ao carregar Meu Evento:', error);
      setErrorMessage(
        error?.message || 'Não foi possível carregar os dados do Meu Evento.'
      );
    } finally {
      setLoading(false);
      setCheckingAccess(false);
    }
  }

  useEffect(() => {
    loadPageData();
  }, []);

  async function handleRemoveSupplier(supplierId: string) {
    try {
      setRemovingId(supplierId);
      setSuccessMessage('');
      setErrorMessage('');

      await unsaveSupplier(supplierId);
      await loadPageData();

      setSuccessMessage('Fornecedor removido do Meu Evento.');
    } catch (error: any) {
      console.error('Erro ao remover fornecedor:', error);
      setErrorMessage(
        error?.message ||
          'Não foi possível remover este fornecedor do Meu Evento.'
      );
    } finally {
      setRemovingId('');
    }
  }

  async function handleRemoveCollaborator(collaboratorId: string) {
    const confirmed = window.confirm(
      'Deseja remover o acesso desta cerimonialista ao seu evento?'
    );

    if (!confirmed) return;

    try {
      setRemovingCollaboratorId(collaboratorId);
      setSuccessMessage('');
      setErrorMessage('');

      const { error } = await supabase
        .from('event_collaborators')
        .delete()
        .eq('id', collaboratorId);

      if (error) {
        throw error;
      }

      await loadPageData();

      setSuccessMessage('Acesso da cerimonialista removido com sucesso.');
    } catch (error: any) {
      console.error('Erro ao remover colaborador:', error);

      setErrorMessage(
        error?.message ||
          'Não foi possível remover o acesso da cerimonialista.'
      );
    } finally {
      setRemovingCollaboratorId('');
    }
  }

  if (checkingAccess || loading) {
    return (
      <main className="min-h-screen bg-black text-[#151515]">
        <div className="mx-auto flex min-h-screen w-full max-w-[430px] items-center justify-center bg-[#fbf7f1] px-6 text-center shadow-2xl">
          <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-[#f1e7cf]">
            <Heart size={42} className="mx-auto text-[#d99200]" />
            <h1 className="mt-4 text-xl font-extrabold">Carregando Meu Evento</h1>
            <p className="mt-2 text-sm font-bold text-gray-500">
              Verificando conta logada...
            </p>
          </div>
        </div>
      </main>
    );
  }

  const totalSaved = savedSuppliers.length;
  const progress = totalSaved > 0 ? Math.min(100, totalSaved * 20) : 0;

  const eventTitle = getEventTitle(eventData);
  const eventDate = getEventDate(eventData);
  const eventCity = getEventCity(eventData);
  const guestsCount = getGuestsCount(eventData);
  const eventSpace = getEventSpace(eventData);

  const peopleCount = 1 + collaborators.length;
  const whatsappShareUrl = getWhatsappShareUrl();

  return (
    <main className="min-h-screen bg-black text-[#151515]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#fbf7f1] pb-28 shadow-2xl">
        <section className="relative overflow-hidden rounded-b-[34px] bg-black px-6 pb-8 pt-7 text-white">
          <div className="absolute inset-0 bg-[url('/layout01-fundo.png')] bg-cover bg-center opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/80 to-black" />

          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-sm font-bold text-[#e3a925]">
                ‹ Voltar
              </Link>

              <a
                href={whatsappShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-[#e3a925]"
              >
                <Share2 size={21} />
              </a>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e3a925] text-white shadow-lg">
                <Heart size={31} />
              </div>

              <div className="flex-1">
                <h1 className="font-serif text-[34px] leading-tight">
                  Meu Evento
                </h1>
                <p className="mt-1 text-sm text-white/70">
                  {eventTitle}
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/10 p-3">
                <p className="flex items-center gap-2 text-xs font-bold text-white/60">
                  <CalendarDays size={14} className="text-[#e3a925]" />
                  Data
                </p>
                <p className="mt-1 text-sm font-extrabold">
                  {formatDate(eventDate)}
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 p-3">
                <p className="flex items-center gap-2 text-xs font-bold text-white/60">
                  <MapPin size={14} className="text-[#e3a925]" />
                  Cidade
                </p>
                <p className="mt-1 text-sm font-extrabold">{eventCity}</p>
              </div>

              <div className="rounded-2xl bg-white/10 p-3">
                <p className="flex items-center gap-2 text-xs font-bold text-white/60">
                  <Users size={14} className="text-[#e3a925]" />
                  Convidados
                </p>
                <p className="mt-1 text-sm font-extrabold">
                  {guestsCount ? guestsCount : 'Não informado'}
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 p-3">
                <p className="flex items-center gap-2 text-xs font-bold text-white/60">
                  <MapPin size={14} className="text-[#e3a925]" />
                  Espaço
                </p>
                <p className="mt-1 line-clamp-1 text-sm font-extrabold">
                  {eventSpace || 'Não informado'}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between text-xs font-bold text-white/70">
                <span>Progresso do evento</span>
                <span>{progress}%</span>
              </div>

              <div className="mt-2 h-2 rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-[#e3a925]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <Link
                href="/meu-evento/editar"
                className="flex items-center justify-center gap-2 rounded-[22px] bg-white/10 py-3 text-sm font-extrabold text-white ring-1 ring-white/10"
              >
                <Pencil size={17} className="text-[#e3a925]" />
                Editar
              </Link>

              <Link
                href="/meu-evento/linha-do-tempo"
                className="flex items-center justify-center gap-2 rounded-[22px] bg-[#e3a925] py-3 text-sm font-extrabold text-white shadow-lg"
              >
                <Clock size={17} />
                Linha do tempo
              </Link>
            </div>
          </div>
        </section>

        {(errorMessage || successMessage) && (
          <section className="px-6 pt-4">
            {errorMessage && (
              <div className="rounded-[22px] bg-red-50 p-4 text-sm font-bold leading-5 text-red-700 ring-1 ring-red-100">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="rounded-[22px] bg-green-50 p-4 text-sm font-bold leading-5 text-green-700 ring-1 ring-green-100">
                {successMessage}
              </div>
            )}
          </section>
        )}

        <section className="px-6 pt-6">
          <div className="rounded-[28px] bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,.08)]">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff7e8] text-[#d99200]">
                <UserPlus size={30} />
              </div>

              <div className="flex-1">
                <h2 className="text-lg font-extrabold">
                  Compartilhar evento
                </h2>

                <p className="mt-1 text-sm leading-5 text-gray-600">
                  Convide sua cerimonialista para ajudar a adicionar fornecedores,
                  solicitar orçamentos e organizar a lista.
                </p>

                <a
                  href="/meu-evento/compartilhar"
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-[22px] bg-[#e3a925] py-3 text-sm font-extrabold text-white shadow-lg"
                >
                  <Share2 size={18} />
                  Compartilhar com cerimonialista
                </a>
              </div>
            </div>
          </div>

          <a
            href={whatsappShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-[24px] bg-green-600 py-4 text-center font-extrabold text-white shadow-lg"
          >
            <Send size={20} />
            Compartilhar REIM pelo WhatsApp
          </a>
        </section>

        <section className="px-6 pt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-extrabold">Colaboradores</h2>
            <span className="text-xs font-bold text-gray-500">
              {peopleCount} pessoa(s)
            </span>
          </div>

          <div className="space-y-3">
            <div className="rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-[#f1e7cf]">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff7e8] text-[#d99200]">
                  <Users size={22} />
                </div>

                <div>
                  <p className="text-sm font-extrabold">Cliente</p>
                  <p className="mt-1 text-xs font-bold text-gray-500">
                    Dona do evento
                  </p>
                </div>
              </div>
            </div>

            {collaborators.length === 0 && (
              <a
                href="/meu-evento/compartilhar"
                className="block rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-[#f1e7cf]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff7e8] text-[#d99200]">
                    <ShieldCheck size={22} />
                  </div>

                  <div>
                    <p className="text-sm font-extrabold">Cerimonialista</p>
                    <p className="mt-1 text-xs font-bold text-gray-500">
                      Não convidada
                    </p>
                  </div>
                </div>
              </a>
            )}

            {collaborators.map((item) => {
              const statusLabel = getCollaboratorStatusLabel(item.status);
              const statusClass = getCollaboratorStatusClass(item.status);
              const link = getCollaboratorLink(item);
              const supplier = getSupplierFromCollaborator(item);
              const hasSupplier = Boolean(item?.supplier_id || supplier?.id);
              const isAccepted = item.status === 'aceito';

              return (
                <div
                  key={item.id}
                  className="rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-[#f1e7cf]"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff7e8] text-[#d99200]">
                      <ShieldCheck size={22} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="line-clamp-1 text-sm font-extrabold">
                            {getCollaboratorDisplayName(item)}
                          </p>

                          <p className="mt-1 break-words text-xs font-bold text-gray-500">
                            {item.collaborator_email}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-extrabold ring-1 ${statusClass}`}
                        >
                          {statusLabel}
                        </span>
                      </div>

                      {isAccepted && (
                        <div className="mt-3 rounded-2xl bg-green-50 p-3 text-sm leading-5 text-green-800 ring-1 ring-green-100">
                          Esta cerimonialista está autorizada a atuar no evento,
                          buscar fornecedores e acompanhar orçamentos.
                        </div>
                      )}

                      {!isAccepted && item.status !== 'recusado' && (
                        <div className="mt-3 rounded-2xl bg-yellow-50 p-3 text-sm leading-5 text-yellow-800 ring-1 ring-yellow-100">
                          Convite enviado. A cerimonialista ainda precisa aceitar.
                        </div>
                      )}

                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <Link
                          href={link}
                          className="flex items-center justify-center gap-2 rounded-[20px] bg-[#fbf7f1] py-3 text-center text-sm font-extrabold text-[#151515] ring-1 ring-[#f1e7cf]"
                        >
                          <Eye size={17} className="text-[#d99200]" />
                          {hasSupplier ? 'Ver vitrine' : 'Ver convite'}
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleRemoveCollaborator(item.id)}
                          disabled={removingCollaboratorId === item.id}
                          className="flex items-center justify-center gap-2 rounded-[20px] bg-white py-3 text-center text-sm font-extrabold text-red-700 ring-1 ring-red-100 disabled:opacity-60"
                        >
                          <Trash2 size={17} />
                          {removingCollaboratorId === item.id
                            ? 'Removendo...'
                            : 'Remover acesso'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="px-6 pt-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold">Fornecedores salvos</h2>
              <p className="mt-1 text-xs font-bold text-gray-500">
                {`${totalSaved} fornecedor(es) no Meu Evento`}
              </p>
            </div>

            <Link href="/buscar" className="text-xs font-extrabold text-[#d99200]">
              Adicionar
            </Link>
          </div>

          {savedSuppliers.length === 0 && (
            <div className="rounded-[28px] bg-white p-6 text-center shadow-sm ring-1 ring-[#f1e7cf]">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#fff7e8] text-[#d99200]">
                <Heart size={32} />
              </div>

              <h3 className="mt-4 text-lg font-extrabold">
                Nenhum fornecedor salvo ainda
              </h3>

              <p className="mt-2 text-sm leading-5 text-gray-500">
                Abra uma vitrine e toque em “Salvar no Meu Evento” para montar
                sua lista de fornecedores.
              </p>

              <Link
                href="/buscar"
                className="mt-5 block rounded-[22px] bg-[#e3a925] py-3 text-sm font-extrabold text-white shadow-lg"
              >
                Buscar fornecedores
              </Link>
            </div>
          )}

          <div className="space-y-4">
            {savedSuppliers.map((item) => {
              const supplier = getSupplierFromSaved(item);

              if (!supplier) return null;

              const supplierId = supplier.id || item.supplier_id;
              const supplierName = supplier.business_name || 'Fornecedor';
              const categoryName = getCategoryName(supplier);
              const city = supplier.city || 'Cidade não informada';
              const rating = formatRating(supplier.rating_average);
              const price = formatPrice(supplier.average_price);
              const coverImage = getCoverImage(supplier);

              return (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-[28px] bg-white shadow-[0_10px_25px_rgba(0,0,0,.08)] ring-1 ring-[#f1e7cf]"
                >
                  <div className="relative h-36">
                    <img
                      src={coverImage}
                      alt={supplierName}
                      className="h-full w-full object-cover"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                    <span className="absolute left-4 top-4 rounded-full bg-[#e3a925] px-3 py-1 text-xs font-extrabold text-white">
                      ♡ Salvo
                    </span>

                    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
                      <div>
                        <p className="text-xs font-bold text-white/75">
                          {categoryName}
                        </p>

                        <h3 className="text-xl font-extrabold">
                          {supplierName}
                        </h3>
                      </div>

                      <div className="flex items-center gap-1 rounded-full bg-black/45 px-3 py-1 text-sm font-bold">
                        <Star
                          size={15}
                          fill="#e3a925"
                          className="text-[#e3a925]"
                        />
                        {rating}
                      </div>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="flex items-center gap-1 text-sm font-bold text-gray-700">
                          <MapPin size={15} className="text-[#d99200]" />
                          {city}
                        </p>

                        <p className="mt-1 text-xs font-bold text-gray-500">
                          {price === 'Sob consulta'
                            ? 'Valor sob consulta'
                            : `A partir de ${price}`}
                        </p>
                      </div>

                      <span className="flex items-center gap-1 rounded-full bg-[#fff7e8] px-3 py-1 text-[11px] font-extrabold text-[#b97900]">
                        <Clock size={13} />
                        Salvo
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <Link
                        href={`/fornecedor/${supplierId}`}
                        className="flex items-center justify-center gap-2 rounded-[20px] bg-[#fbf7f1] py-3 text-center text-sm font-extrabold text-[#151515] ring-1 ring-[#f1e7cf]"
                      >
                        <Camera size={17} className="text-[#d99200]" />
                        Ver vitrine
                      </Link>

                      <Link
                        href={`/solicitar-orcamento?fornecedor=${supplierId}`}
                        className="flex items-center justify-center gap-2 rounded-[20px] bg-[#e3a925] py-3 text-center text-sm font-extrabold text-white shadow-lg"
                      >
                        <MessageCircle size={17} />
                        Orçamento
                      </Link>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveSupplier(supplierId)}
                      disabled={removingId === supplierId}
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-[20px] bg-white py-3 text-center text-sm font-extrabold text-red-700 ring-1 ring-red-100 disabled:opacity-60"
                    >
                      <Trash2 size={17} />
                      {removingId === supplierId
                        ? 'Removendo...'
                        : 'Remover do Meu Evento'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {savedSuppliers.length > 0 && (
            <div className="mt-6 space-y-3">
              <a
                href="/meu-evento/solicitar-todos"
                className="flex w-full items-center justify-center gap-2 rounded-[24px] bg-black py-4 text-center font-extrabold text-white shadow-lg"
              >
                <MessageCircle size={21} />
                Solicitar orçamento para todos
              </a>

              <Link
                href="/orcamentos"
                className="block rounded-[24px] bg-white py-4 text-center font-extrabold text-[#151515] shadow-sm ring-1 ring-[#f1e7cf]"
              >
                Ver todos os orçamentos
              </Link>
            </div>
          )}
        </section>

        <Nav />
      </div>
    </main>
  );
}
