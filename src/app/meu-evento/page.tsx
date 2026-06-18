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
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FileText,
  Plus,
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
  if (status === 'aceito') return 'Atuando';
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

function getQuoteStatusLabel(status?: string) {
  if (status === 'novo' || status === 'aguardando_resposta') return 'Orçamento enviado';
  if (status === 'respondido') return 'Respondido';
  if (status === 'ajuste_solicitado') return 'Ajuste solicitado';
  if (status === 'aceito' || status === 'fechado') return 'Aceito';
  return 'Selecionado';
}

function getQuoteStatusClass(status?: string) {
  if (status === 'aceito' || status === 'fechado') {
    return 'bg-green-50 text-green-700 ring-green-100';
  }

  if (status === 'respondido') {
    return 'bg-blue-50 text-blue-700 ring-blue-100';
  }

  if (status === 'ajuste_solicitado') {
    return 'bg-yellow-50 text-yellow-800 ring-yellow-100';
  }

  if (status === 'novo' || status === 'aguardando_resposta') {
    return 'bg-[#fff7e8] text-[#b97900] ring-[#f1e7cf]';
  }

  return 'bg-gray-50 text-gray-600 ring-gray-100';
}

export default function MeuEventoPage() {
  const router = useRouter();

  const [checkingAccess, setCheckingAccess] = useState(true);
  const [eventData, setEventData] = useState<any>(null);
  const [savedSuppliers, setSavedSuppliers] = useState<any[]>([]);
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [quoteRequests, setQuoteRequests] = useState<any[]>([]);
  const [expandedSupplierId, setExpandedSupplierId] = useState('');
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

  async function loadQuoteRequests(customerId: string, supplierIds: string[]) {
    if (!customerId || supplierIds.length === 0) {
      setQuoteRequests([]);
      return;
    }

    const { data, error } = await supabase
      .from('quote_requests')
      .select(`
        id,
        supplier_id,
        status,
        created_at,
        quote_responses(
          id,
          status,
          created_at,
          proposal_value
        )
      `)
      .eq('customer_id', customerId)
      .in('supplier_id', supplierIds)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao carregar status dos orçamentos:', error);
      setQuoteRequests([]);
      return;
    }

    setQuoteRequests(data || []);
  }

  async function loadPageData() {
    try {
      setLoading(true);
      setErrorMessage('');

      const canAccess = await checkAccess();

      if (!canAccess) return;

      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      const [eventResult, suppliersResult, collaboratorsResult] =
        await Promise.all([
          getMyEvent().catch(() => null),
          listSavedSuppliers(),
          listEventCollaborators().catch(() => []),
        ]);

      const savedList = suppliersResult || [];
      const supplierIds = savedList
        .map((item: any) => getSupplierFromSaved(item)?.id || item?.supplier_id)
        .filter(Boolean);

      setEventData(eventResult);
      setSavedSuppliers(savedList);
      setCollaborators(collaboratorsResult || []);

      if (user?.id) {
        await loadQuoteRequests(user.id, supplierIds);
      }
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
    const confirmed = window.confirm(
      'Deseja remover este fornecedor do seu evento?'
    );

    if (!confirmed) return;

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

  function getQuoteForSupplier(supplierId: string) {
    const quotes = quoteRequests.filter(
      (quote) => quote.supplier_id === supplierId
    );

    if (quotes.length === 0) return null;

    return quotes[0];
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
  const requestedCount = quoteRequests.length;
  const acceptedCount = quoteRequests.filter((quote) =>
    ['aceito', 'fechado'].includes(quote.status)
  ).length;
  const pendingCount = Math.max(totalSaved - requestedCount, 0);
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
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#fbf7f1] pb-36 shadow-2xl">
        <section className="relative overflow-hidden rounded-b-[34px] bg-black px-6 pb-8 pt-7 text-white">
          <div className="absolute inset-0 bg-[url('/layout01-fundo.png')] bg-cover bg-center opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/80 to-black" />

          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-sm font-bold text-[#e3a925]">
                ‹ Voltar
              </Link>

              <div className="flex items-center gap-3">
                <Link
                  href="/meu-evento/editar"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-[#e3a925]"
                >
                  <Pencil size={19} />
                </Link>

                <a
                  href={whatsappShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-[#e3a925]"
                >
                  <Share2 size={19} />
                </a>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#e3a925]">
                Meu Evento
              </p>

              <h1 className="mt-2 font-serif text-[34px] leading-tight">
                {eventTitle}
              </h1>

              <p className="mt-2 text-sm text-white/70">
                Organize fornecedores, orçamentos e colaboradores em um só lugar.
              </p>
            </div>

            <div className="mt-6 overflow-hidden rounded-[28px] bg-white/10 backdrop-blur">
              <div className="relative h-44">
                <img
                  src="/layout01-fundo.png"
                  alt={eventTitle}
                  className="h-full w-full object-cover opacity-75"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute bottom-4 left-4 right-4">
                  <h2 className="font-serif text-[24px] leading-tight text-white">
                    {eventTitle}
                  </h2>

                  <p className="mt-1 flex items-center gap-2 text-xs font-bold text-white/75">
                    <MapPin size={13} className="text-[#e3a925]" />
                    {eventCity}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-4 gap-2">
              <div className="rounded-2xl bg-white/10 p-3 text-center">
                <CalendarDays size={17} className="mx-auto text-[#e3a925]" />
                <p className="mt-2 text-[10px] font-bold text-white/55">
                  Data
                </p>
                <p className="mt-1 text-[11px] font-extrabold">
                  {formatDate(eventDate)}
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 p-3 text-center">
                <Users size={17} className="mx-auto text-[#e3a925]" />
                <p className="mt-2 text-[10px] font-bold text-white/55">
                  Convidados
                </p>
                <p className="mt-1 text-[11px] font-extrabold">
                  {guestsCount ? guestsCount : 'N/I'}
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 p-3 text-center">
                <MapPin size={17} className="mx-auto text-[#e3a925]" />
                <p className="mt-2 text-[10px] font-bold text-white/55">
                  Cidade
                </p>
                <p className="mt-1 line-clamp-1 text-[11px] font-extrabold">
                  {eventCity}
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 p-3 text-center">
                <MapPin size={17} className="mx-auto text-[#e3a925]" />
                <p className="mt-2 text-[10px] font-bold text-white/55">
                  Espaço
                </p>
                <p className="mt-1 line-clamp-1 text-[11px] font-extrabold">
                  {eventSpace || 'N/I'}
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
                href="/meu-evento/linha-do-tempo"
                className="flex items-center justify-center gap-2 rounded-[22px] bg-[#e3a925] py-3 text-sm font-extrabold text-white shadow-lg"
              >
                <Clock size={17} />
                Linha do tempo
              </Link>

              <Link
                href="/orcamentos"
                className="flex items-center justify-center gap-2 rounded-[22px] bg-white/10 py-3 text-sm font-extrabold text-white ring-1 ring-white/10"
              >
                <FileText size={17} className="text-[#e3a925]" />
                Orçamentos
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

        <section className="grid grid-cols-4 gap-2 px-6 pt-6">
          <div className="rounded-[20px] bg-white p-3 text-center shadow-sm ring-1 ring-[#f1e7cf]">
            <p className="text-xl font-extrabold text-[#d99200]">
              {totalSaved}
            </p>
            <p className="mt-1 text-[10px] font-bold text-gray-600">Salvos</p>
          </div>

          <div className="rounded-[20px] bg-white p-3 text-center shadow-sm ring-1 ring-[#f1e7cf]">
            <p className="text-xl font-extrabold text-blue-600">
              {requestedCount}
            </p>
            <p className="mt-1 text-[10px] font-bold text-gray-600">
              Orçamentos
            </p>
          </div>

          <div className="rounded-[20px] bg-white p-3 text-center shadow-sm ring-1 ring-[#f1e7cf]">
            <p className="text-xl font-extrabold text-green-600">
              {acceptedCount}
            </p>
            <p className="mt-1 text-[10px] font-bold text-gray-600">Aceitos</p>
          </div>

          <div className="rounded-[20px] bg-white p-3 text-center shadow-sm ring-1 ring-[#f1e7cf]">
            <p className="text-xl font-extrabold text-yellow-600">
              {pendingCount}
            </p>
            <p className="mt-1 text-[10px] font-bold text-gray-600">Pendentes</p>
          </div>
        </section>

        <section className="px-6 pt-6">
          <div className="rounded-[28px] bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,.08)] ring-1 ring-[#f1e7cf]">
            <div className="flex items-start gap-4">
              <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-[#fff7e8] text-[#d99200]">
                <UserPlus size={28} />
              </div>

              <div className="flex-1">
                <h2 className="text-lg font-extrabold">
                  Compartilhar evento
                </h2>

                <p className="mt-1 text-sm leading-5 text-gray-600">
                  Convide sua cerimonialista para ajudar a organizar fornecedores e orçamentos.
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <Link
                    href="/meu-evento/compartilhar"
                    className="flex items-center justify-center gap-2 rounded-[20px] bg-[#e3a925] py-3 text-sm font-extrabold text-white shadow-lg"
                  >
                    <Share2 size={17} />
                    Cerimonialista
                  </Link>

                  <a
                    href={whatsappShareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-[20px] bg-green-600 py-3 text-sm font-extrabold text-white shadow-lg"
                  >
                    <Send size={17} />
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 pt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-extrabold">Colaboradores</h2>
            <span className="text-xs font-bold text-gray-500">
              {peopleCount} pessoa(s)
            </span>
          </div>

          <div className="space-y-3">
            <div className="rounded-[22px] bg-white p-4 shadow-sm ring-1 ring-[#f1e7cf]">
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
              <Link
                href="/meu-evento/compartilhar"
                className="block rounded-[22px] bg-white p-4 shadow-sm ring-1 ring-[#f1e7cf]"
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
              </Link>
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
                  className="rounded-[22px] bg-white p-4 shadow-sm ring-1 ring-[#f1e7cf]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff7e8] text-[#d99200]">
                      <ShieldCheck size={22} />
                    </div>

                    <div className="min-w-0 flex-1">
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
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <Link
                        href={link}
                        className="flex items-center justify-center gap-2 rounded-[18px] bg-[#fbf7f1] py-3 text-center text-sm font-extrabold text-[#151515] ring-1 ring-[#f1e7cf]"
                      >
                        <Eye size={16} className="text-[#d99200]" />
                        {hasSupplier ? 'Ver vitrine' : 'Ver convite'}
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleRemoveCollaborator(item.id)}
                        disabled={removingCollaboratorId === item.id}
                        className="flex items-center justify-center gap-2 rounded-[18px] bg-white py-3 text-center text-sm font-extrabold text-red-700 ring-1 ring-red-100 disabled:opacity-60"
                      >
                        <Trash2 size={16} />
                        {removingCollaboratorId === item.id
                          ? 'Removendo...'
                          : 'Remover'}
                      </button>
                    </div>
                  )}

                  {!isAccepted && item.status !== 'recusado' && (
                    <div className="mt-3 rounded-2xl bg-yellow-50 p-3 text-sm leading-5 text-yellow-800 ring-1 ring-yellow-100">
                      Convite enviado. A cerimonialista ainda precisa aceitar.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="px-6 pt-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold">Minha lista de fornecedores</h2>
              <p className="mt-1 text-xs font-bold text-gray-500">
                Toque em um fornecedor para ver as ações.
              </p>
            </div>

            <Link
              href="/buscar"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e3a925] text-white shadow-lg"
            >
              <Plus size={21} />
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

          <div className="space-y-3">
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
              const quote = getQuoteForSupplier(supplierId);
              const isExpanded = expandedSupplierId === supplierId;
              const isAccepted =
                quote?.status === 'aceito' || quote?.status === 'fechado';
              const statusLabel = getQuoteStatusLabel(quote?.status);
              const statusClass = getQuoteStatusClass(quote?.status);

              return (
                <div
                  key={item.id}
                  className={
                    isAccepted
                      ? 'rounded-[24px] bg-white p-3 shadow-sm ring-2 ring-green-200'
                      : 'rounded-[24px] bg-white p-3 shadow-sm ring-1 ring-[#f1e7cf]'
                  }
                >
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedSupplierId(isExpanded ? '' : supplierId)
                    }
                    className="flex w-full items-center gap-3 text-left"
                  >
                    <img
                      src={coverImage}
                      alt={supplierName}
                      className="h-[72px] w-[72px] shrink-0 rounded-[18px] object-cover"
                    />

                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-extrabold">
                        {supplierName}
                      </p>

                      <p className="mt-1 line-clamp-1 text-xs font-bold text-gray-500">
                        {categoryName}
                      </p>

                      <div className="mt-2 flex items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ring-1 ${statusClass}`}
                        >
                          {statusLabel}
                        </span>

                        <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                          <Star
                            size={11}
                            fill="#e3a925"
                            className="text-[#e3a925]"
                          />
                          {rating}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isAccepted ? (
                        <CheckCircle2 size={22} className="text-green-600" />
                      ) : isExpanded ? (
                        <ChevronDown size={22} className="text-[#d99200]" />
                      ) : (
                        <ChevronRight size={22} className="text-gray-400" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="mt-4 rounded-[22px] bg-[#fbf7f1] p-4 ring-1 ring-[#f1e7cf]">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-2xl bg-white p-3">
                          <p className="flex items-center gap-1 text-xs font-bold text-gray-500">
                            <MapPin size={13} className="text-[#d99200]" />
                            Cidade
                          </p>
                          <p className="mt-1 line-clamp-1 text-sm font-extrabold">
                            {city}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-white p-3">
                          <p className="text-xs font-bold text-gray-500">
                            Valor
                          </p>
                          <p className="mt-1 line-clamp-1 text-sm font-extrabold">
                            {price}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <Link
                          href={`/fornecedor/${supplierId}`}
                          className="flex items-center justify-center gap-2 rounded-[18px] bg-white py-3 text-center text-sm font-extrabold text-[#151515] ring-1 ring-[#f1e7cf]"
                        >
                          <Eye size={16} className="text-[#d99200]" />
                          Ver vitrine
                        </Link>

                        {quote?.id ? (
                          <Link
                            href={`/orcamentos/${quote.id}`}
                            className={
                              isAccepted
                                ? 'flex items-center justify-center gap-2 rounded-[18px] bg-green-600 py-3 text-center text-sm font-extrabold text-white shadow-lg'
                                : 'flex items-center justify-center gap-2 rounded-[18px] bg-black py-3 text-center text-sm font-extrabold text-white shadow-lg'
                            }
                          >
                            <FileText size={16} />
                            Ver orçamento
                          </Link>
                        ) : (
                          <Link
                            href={`/solicitar-orcamento?fornecedor=${supplierId}`}
                            className="flex items-center justify-center gap-2 rounded-[18px] bg-[#e3a925] py-3 text-center text-sm font-extrabold text-white shadow-lg"
                          >
                            <MessageCircle size={16} />
                            Orçamento
                          </Link>
                        )}
                      </div>

                      {quote?.id && (
                        <Link
                          href={`/orcamentos/${quote.id}/chat`}
                          className="mt-3 flex items-center justify-center gap-2 rounded-[18px] bg-white py-3 text-center text-sm font-extrabold text-[#151515] ring-1 ring-[#f1e7cf]"
                        >
                          <MessageCircle size={16} className="text-[#d99200]" />
                          Abrir chat
                        </Link>
                      )}

                      {!isAccepted && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSupplier(supplierId)}
                          disabled={removingId === supplierId}
                          className="mt-3 flex w-full items-center justify-center gap-2 rounded-[18px] bg-white py-3 text-center text-sm font-extrabold text-red-700 ring-1 ring-red-100 disabled:opacity-60"
                        >
                          <Trash2 size={16} />
                          {removingId === supplierId
                            ? 'Removendo...'
                            : 'Remover do evento'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {savedSuppliers.length > 0 && (
            <div className="fixed bottom-[82px] left-1/2 z-30 w-full max-w-[430px] -translate-x-1/2 px-6">
              <Link
                href="/meu-evento/solicitar-todos"
                className="flex w-full items-center justify-center gap-2 rounded-[24px] bg-[#e3a925] py-4 text-center font-extrabold text-white shadow-[0_14px_35px_rgba(0,0,0,.25)]"
              >
                <MessageCircle size={21} />
                Solicitar orçamento de todos
              </Link>
            </div>
          )}
        </section>

        <Nav />
      </div>
    </main>
  );
}
