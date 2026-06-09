'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Camera,
  CheckCircle2,
  Heart,
  MapPin,
  MessageCircle,
  Search,
  ShieldCheck,
  Star,
  Users,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

function formatDate(date?: string) {
  if (!date) return 'Data não informada';

  const [year, month, day] = date.split('-');

  if (!year || !month || !day) return date;

  return `${day}/${month}/${year}`;
}

function getEventTitle(event: any) {
  const base =
    event?.couple_name ||
    event?.event_name ||
    event?.title ||
    'Evento da cliente';

  if (String(base).toLowerCase().includes('maria')) {
    return 'Evento da Maria';
  }

  if (String(base).includes('&')) {
    return `Evento de ${base}`;
  }

  return `Evento de ${base}`;
}

function getEventCity(event: any) {
  return event?.event_city || event?.city || 'Cidade não informada';
}

function getGuestsCount(event: any) {
  return event?.guests_count || event?.guest_count || null;
}

function getOwnerId(event: any) {
  return event?.customer_id || event?.client_id || null;
}

function getSupplierFromSaved(item: any) {
  if (Array.isArray(item.suppliers)) {
    return item.suppliers[0] || null;
  }

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

export default function CerimonialistaEventoPage() {
  const params = useParams();
  const eventId = String(params?.id || '');

  const [eventData, setEventData] = useState<any>(null);
  const [inviteData, setInviteData] = useState<any>(null);
  const [savedSuppliers, setSavedSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  async function loadEvent() {
    try {
      setLoading(true);
      setErrorMessage('');

      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!user?.email) {
        setErrorMessage('Faça login como cerimonialista para acessar este evento.');
        return;
      }

      const { data: invite, error: inviteError } = await supabase
        .from('event_collaborators')
        .select('*')
        .eq('event_id', eventId)
        .ilike('collaborator_email', user.email)
        .maybeSingle();

      if (inviteError) {
        throw inviteError;
      }

      if (!invite) {
        setErrorMessage('Este evento não foi compartilhado com esta conta.');
        return;
      }

      if (invite.status !== 'aceito') {
        setErrorMessage('Aceite o convite antes de atuar neste evento.');
        setInviteData(invite);
        return;
      }

      setInviteData(invite);

      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .maybeSingle();

      if (eventError) {
        throw eventError;
      }

      if (!event) {
        setErrorMessage('Evento não encontrado.');
        return;
      }

      setEventData(event);

      const ownerId = getOwnerId(event);

      if (ownerId) {
        const { data: saved, error: savedError } = await supabase
          .from('saved_suppliers')
          .select(`
            id,
            created_at,
            supplier_id,
            suppliers(
              id,
              business_name,
              description,
              city,
              whatsapp,
              average_price,
              rating_average,
              is_featured,
              categories(name, slug),
              media(file_url, is_cover)
            )
          `)
          .eq('customer_id', ownerId)
          .order('created_at', { ascending: false });

        if (!savedError) {
          setSavedSuppliers(saved || []);
        }
      }
    } catch (error: any) {
      console.error('Erro ao carregar evento da cerimonialista:', error);
      setErrorMessage(
        error?.message || 'Não foi possível carregar este evento.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  const title = getEventTitle(eventData);
  const city = getEventCity(eventData);
  const eventDate = formatDate(eventData?.event_date);
  const guests = getGuestsCount(eventData);
  const eventSpace = eventData?.event_space || 'Não informado';
  const eventType = eventData?.event_type || 'Evento';
  const ownerName =
    inviteData?.owner_name ||
    eventData?.couple_name ||
    eventData?.event_name ||
    'Cliente';

  const ownerEmail = inviteData?.owner_email || 'E-mail não informado';

  return (
    <main className="min-h-screen bg-black text-[#151515]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#fbf7f1] pb-10 shadow-2xl">
        <section className="relative overflow-hidden rounded-b-[34px] bg-black px-6 pb-8 pt-7 text-white">
          <div className="absolute inset-0 bg-[url('/layout01-fundo.png')] bg-cover bg-center opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/80 to-black" />

          <div className="relative z-10">
            <Link
              href="/cerimonialista/convites"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#e3a925]"
            >
              <ArrowLeft size={17} />
              Voltar
            </Link>

            <div className="mt-6 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e3a925] text-white shadow-lg">
                <ShieldCheck size={31} />
              </div>

              <div>
                <h1 className="font-serif text-[31px] leading-tight">
                  {loading ? 'Carregando...' : title}
                </h1>

                <p className="mt-1 text-sm text-white/70">
                  Área da cerimonialista
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 pt-6">
          {loading && (
            <div className="rounded-[28px] bg-white p-6 text-center shadow-sm ring-1 ring-[#f1e7cf]">
              <Heart size={38} className="mx-auto text-[#d99200]" />
              <p className="mt-3 text-sm font-bold text-gray-500">
                Carregando evento...
              </p>
            </div>
          )}

          {!loading && errorMessage && (
            <div className="rounded-[28px] bg-red-50 p-5 text-sm font-bold leading-5 text-red-700 ring-1 ring-red-100">
              {errorMessage}

              <Link
                href="/cerimonialista/convites"
                className="mt-5 block rounded-[22px] bg-black py-3 text-center text-sm font-extrabold text-white"
              >
                Voltar para convites
              </Link>
            </div>
          )}

          {!loading && !errorMessage && eventData && (
            <>
              <div className="rounded-[28px] bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,.08)] ring-1 ring-[#f1e7cf]">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff7e8] text-[#d99200]">
                    <CheckCircle2 size={30} />
                  </div>

                  <div className="flex-1">
                    <h2 className="text-lg font-extrabold">
                      Você está atuando neste evento
                    </h2>

                    <p className="mt-2 text-sm font-bold text-gray-600">
                      Cliente: {ownerName}
                    </p>

                    <p className="mt-1 break-all text-xs font-bold text-gray-500">
                      {ownerEmail}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-[22px] bg-white p-4 shadow-sm ring-1 ring-[#f1e7cf]">
                  <CalendarDays size={22} className="text-[#d99200]" />
                  <p className="mt-2 text-xs font-bold text-gray-500">
                    Data
                  </p>
                  <p className="mt-1 text-sm font-extrabold">{eventDate}</p>
                </div>

                <div className="rounded-[22px] bg-white p-4 shadow-sm ring-1 ring-[#f1e7cf]">
                  <MapPin size={22} className="text-[#d99200]" />
                  <p className="mt-2 text-xs font-bold text-gray-500">
                    Cidade
                  </p>
                  <p className="mt-1 text-sm font-extrabold">{city}</p>
                </div>

                <div className="rounded-[22px] bg-white p-4 shadow-sm ring-1 ring-[#f1e7cf]">
                  <Users size={22} className="text-[#d99200]" />
                  <p className="mt-2 text-xs font-bold text-gray-500">
                    Convidados
                  </p>
                  <p className="mt-1 text-sm font-extrabold">
                    {guests || 'Não informado'}
                  </p>
                </div>

                <div className="rounded-[22px] bg-white p-4 shadow-sm ring-1 ring-[#f1e7cf]">
                  <Building2 size={22} className="text-[#d99200]" />
                  <p className="mt-2 text-xs font-bold text-gray-500">
                    Espaço
                  </p>
                  <p className="mt-1 line-clamp-1 text-sm font-extrabold">
                    {eventSpace}
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-[28px] bg-[#151515] p-5 text-white shadow-lg">
                <h2 className="text-lg font-extrabold">
                  Ações da cerimonialista
                </h2>

                <p className="mt-2 text-sm leading-5 text-white/70">
                  Você poderá ajudar a cliente adicionando fornecedores e acompanhando os orçamentos deste evento.
                </p>

                <div className="mt-5 space-y-3">
                  <Link
                    href="/buscar"
                    className="flex items-center justify-center gap-2 rounded-[22px] bg-[#e3a925] py-4 text-center font-extrabold text-white shadow-lg"
                  >
                    <Search size={21} />
                    Buscar fornecedores
                  </Link>

                  <Link
                    href="/orcamentos"
                    className="flex items-center justify-center gap-2 rounded-[22px] bg-white py-4 text-center font-extrabold text-[#151515]"
                  >
                    <MessageCircle size={21} />
                    Ver orçamentos
                  </Link>
                </div>
              </div>

              <section className="pt-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-extrabold">
                    Fornecedores da cliente
                  </h2>

                  <span className="text-xs font-bold text-gray-500">
                    {savedSuppliers.length} salvo(s)
                  </span>
                </div>

                {savedSuppliers.length === 0 && (
                  <div className="rounded-[28px] bg-white p-6 text-center shadow-sm ring-1 ring-[#f1e7cf]">
                    <Heart size={38} className="mx-auto text-[#d99200]" />

                    <h3 className="mt-4 text-lg font-extrabold">
                      Nenhum fornecedor salvo
                    </h3>

                    <p className="mt-2 text-sm leading-5 text-gray-500">
                      Use a busca para ajudar a cliente a encontrar fornecedores.
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  {savedSuppliers.map((item) => {
                    const supplier = getSupplierFromSaved(item);

                    if (!supplier) return null;

                    const supplierName = supplier.business_name || 'Fornecedor';
                    const supplierId = supplier.id || item.supplier_id;
                    const categoryName = getCategoryName(supplier);
                    const supplierCity = supplier.city || 'Cidade não informada';
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
                          <p className="flex items-center gap-1 text-sm font-bold text-gray-700">
                            <MapPin size={15} className="text-[#d99200]" />
                            {supplierCity}
                          </p>

                          <p className="mt-1 text-xs font-bold text-gray-500">
                            {price === 'Sob consulta'
                              ? 'Valor sob consulta'
                              : `A partir de ${price}`}
                          </p>

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
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
