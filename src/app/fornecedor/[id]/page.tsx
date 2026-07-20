'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getSupplier } from '@/lib/marketplace';
import {
  isSupplierSaved,
  saveSupplier,
  saveSupplierForCustomer,
  unsaveSupplier,
  unsaveSupplierForCustomer,
} from '@/lib/suppliers';
import { supabase } from '@/lib/supabase';
import {
  ArrowLeft,
  CalendarDays,
  Camera,
  CheckCircle2,
  Heart,
  Image as ImageIcon,
  Loader2,
  MapPin,
  MessageCircle,
  PackageCheck,
  Phone,
  PlayCircle,
  Share2,
  ShieldCheck,
  Star,
  X,
} from 'lucide-react';

const VIDEO_THUMBNAIL_SECOND = 30;

function isVideoUrl(url: string) {
  const normalized = String(url || '').toLowerCase();

  return (
    normalized.includes('.mp4') ||
    normalized.includes('.webm') ||
    normalized.includes('.mov') ||
    normalized.includes('video')
  );
}

function PublicVideoThumbnail({
  url,
}: {
  url: string;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  function handleLoadedMetadata() {
    const video = videoRef.current;

    if (!video) return;

    try {
      const duration = Number(video.duration || 0);

      if (duration > VIDEO_THUMBNAIL_SECOND) {
        video.currentTime = VIDEO_THUMBNAIL_SECOND;
      } else if (duration > 1) {
        video.currentTime = Math.max(duration - 1, 0.1);
      } else {
        video.currentTime = 0.1;
      }
    } catch (error) {
      console.error(
        'Não foi possível posicionar o vídeo para miniatura pública:',
        error
      );
    }
  }

  function handleSeeked() {
    setReady(true);
  }

  function handleCanPlay() {
    if (ready) return;

    const video = videoRef.current;

    if (!video) return;

    const duration = Number(video.duration || 0);

    if (duration <= VIDEO_THUMBNAIL_SECOND) {
      setReady(true);
    }
  }

  if (failed) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#151515] via-[#2a2110] to-[#d99200] px-2 text-center text-white">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#d99200] shadow-lg">
          <PlayCircle size={24} />
        </div>

        <p className="mt-2 text-[10px] font-extrabold">
          Vídeo
        </p>

        <p className="mt-0.5 text-[9px] font-bold text-white/75">
          Assistir
        </p>
      </div>
    );
  }

  return (
    <>
      <video
        ref={videoRef}
        src={url}
        className="h-full w-full object-cover"
        muted
        playsInline
        preload="metadata"
        onLoadedMetadata={handleLoadedMetadata}
        onSeeked={handleSeeked}
        onCanPlay={handleCanPlay}
        onError={() => setFailed(true)}
      />

      <div
        className={
          ready
            ? 'absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-black/15'
            : 'absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#151515] via-[#2a2110] to-[#d99200]'
        }
      >
        {!ready && (
          <Loader2
            size={22}
            className="animate-spin text-[#e3a925]"
          />
        )}
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#d99200] shadow-lg">
          <PlayCircle size={24} />
        </div>
      </div>
    </>
  );
}

function getCoverImage(supplier: any) {
  const cover = supplier?.media?.find(
    (item: any) => item.is_cover
  );

  if (cover?.file_url) {
    return cover.file_url;
  }

  if (supplier?.media?.[0]?.file_url) {
    return supplier.media[0].file_url;
  }

  return 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1000&auto=format&fit=crop';
}

function getGallery(supplier: any) {
  const media = supplier?.media || [];

  if (media.length > 0) {
    return media
      .filter((item: any) => item.file_url)
      .slice(0, 3)
      .map((item: any) => item.file_url);
  }

  return [
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=900&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=900&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?q=80&w=900&auto=format&fit=crop',
  ];
}

function getSupplierServices(supplier: any) {
  if (!Array.isArray(supplier?.services)) {
    return [];
  }

  return supplier.services
    .map((service: any) =>
      String(service || '').trim()
    )
    .filter(Boolean);
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
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue) || numberValue <= 0) {
    return 'Sem avaliações';
  }

  return numberValue.toFixed(1);
}

function formatReviewDate(value?: string | null) {
  if (!value) return '';

  return new Date(value).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatWhatsAppLink(value: any) {
  if (!value) return 'https://wa.me/5573999999999';

  const onlyNumbers = String(value).replace(/\D/g, '');

  if (!onlyNumbers) {
    return 'https://wa.me/5573999999999';
  }

  if (onlyNumbers.startsWith('55')) {
    return 'https://wa.me/' + onlyNumbers;
  }

  return 'https://wa.me/55' + onlyNumbers;
}

function getServiceCities(supplier: any) {
  const cities = Array.isArray(supplier?.service_cities)
    ? supplier.service_cities
    : [];

  const mainCity = supplier?.city || '';

  return Array.from(
    new Set(
      [mainCity, ...cities]
        .map((item: any) =>
          String(item || '').trim()
        )
        .filter(Boolean)
    )
  );
}

function getCategoryName(supplier: any) {
  if (!supplier) {
    return 'Categoria não informada';
  }

  if (Array.isArray(supplier.categories)) {
    return (
      supplier.categories[0]?.name ||
      'Categoria não informada'
    );
  }

  return (
    supplier.categories?.name ||
    'Categoria não informada'
  );
}

function isCerimonialistaCategory(
  categoryName: string
) {
  const normalized =
    categoryName.toLowerCase();

  return (
    normalized.includes('cerimonial') ||
    normalized.includes('assessoria') ||
    normalized.includes('cerimonialista')
  );
}

function getPublicSupplierTag(
  visibility: any,
  supplier: any,
  isCerimonialista: boolean
) {
  if (
    visibility?.public_badge === 'novo_no_reim'
  ) {
    return 'Novo no REIM';
  }

  if (
    visibility?.public_badge === 'premium' ||
    supplier?.is_featured
  ) {
    return '♛ Premium';
  }

  if (
    visibility?.public_badge === 'ativo'
  ) {
    return 'Ativo';
  }

  return isCerimonialista
    ? 'Cerimonialista'
    : 'Indisponível';
}

export default function FornecedorPage() {
  const params = useParams();

  const supplierId = String(
    params?.id || ''
  );

  const [supplier, setSupplier] =
    useState<any>(null);

  const [
    publicVisibility,
    setPublicVisibility,
  ] = useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('');

  const [
    selectedMedia,
    setSelectedMedia,
  ] = useState('');

  const [
    targetCustomerId,
    setTargetCustomerId,
  ] = useState('');

  const [returnUrl, setReturnUrl] =
    useState('/buscar');

  const [
    selectedCity,
    setSelectedCity,
  ] = useState('');

  const [saved, setSaved] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [
    saveMessage,
    setSaveMessage,
  ] = useState('');

  const [reviewStats, setReviewStats] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);

  const isCerimonialistaMode =
    Boolean(targetCustomerId);

  useEffect(() => {
    async function loadSupplier() {
      try {
        setLoading(true);
        setErrorMessage('');

        if (!supplierId) {
          setErrorMessage(
            'Vitrine não informada.'
          );

          return;
        }

        const urlParams =
          new URLSearchParams(
            window.location.search
          );

        const customerIdFromUrl =
          urlParams.get('cliente') || '';

        const returnUrlFromUrl =
          urlParams.get('voltar') ||
          '/buscar';

        const cityFromUrl =
          urlParams.get('cidade') || '';

        setTargetCustomerId(
          customerIdFromUrl
        );

        setReturnUrl(returnUrlFromUrl);

        setSelectedCity(cityFromUrl);

        const data =
          await getSupplier(supplierId);

        if (!data) {
          setErrorMessage(
            'Vitrine não encontrada no Supabase.'
          );

          return;
        }

        const {
          data: visibilityData,
          error: visibilityError,
        } = await supabase
          .from(
            'supplier_public_visibility'
          )
          .select(
            'supplier_id, can_appear_public, can_receive_quote, public_badge, public_label, public_notice'
          )
          .eq(
            'supplier_id',
            supplierId
          )
          .maybeSingle();

        if (visibilityError) {
          console.error(
            'Erro ao carregar visibilidade da vitrine:',
            visibilityError
          );
        }

        setPublicVisibility(
          visibilityData || null
        );

        setSupplier(data);

        const { data: statsData, error: statsError } = await supabase
          .from('supplier_review_stats')
          .select('*')
          .eq('supplier_id', supplierId)
          .maybeSingle();

        if (statsError) {
          console.error('Erro ao carregar média das avaliações:', statsError);
        }

        setReviewStats(statsData || null);

        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select('*')
          .eq('supplier_id', supplierId)
          .order('created_at', { ascending: false });

        if (reviewsError) {
          console.error('Erro ao carregar avaliações da vitrine:', reviewsError);
          setReviews([]);
        } else {
          const reviewRows = reviewsData || [];
          const clientIds = Array.from(
            new Set(
              reviewRows
                .map((item: any) => item.client_id)
                .filter(Boolean)
            )
          );

          let profilesById: Record<string, any> = {};

          if (clientIds.length > 0) {
            const { data: profilesData, error: profilesError } = await supabase
              .from('profiles')
              .select('id, full_name')
              .in('id', clientIds);

            if (profilesError) {
              console.error('Erro ao carregar nomes das avaliações:', profilesError);
            }

            profilesById = Object.fromEntries(
              (profilesData || []).map((profile: any) => [profile.id, profile])
            );
          }

          setReviews(
            reviewRows.map((item: any) => ({
              ...item,
              client_name:
                profilesById[item.client_id]?.full_name || 'Cliente REIM',
            }))
          );
        }

        if (customerIdFromUrl) {
          const {
            data: savedData,
            error: savedError,
          } = await supabase
            .from('saved_suppliers')
            .select('id')
            .eq(
              'customer_id',
              customerIdFromUrl
            )
            .eq(
              'supplier_id',
              supplierId
            )
            .maybeSingle();

          if (savedError) {
            console.error(
              'Erro ao verificar fornecedor salvo da cliente:',
              savedError
            );
          }

          setSaved(Boolean(savedData));
        } else {
          const alreadySaved =
            await isSupplierSaved(
              supplierId
            );

          setSaved(alreadySaved);
        }
      } catch (error) {
        console.error(
          'Erro ao carregar fornecedor:',
          error
        );

        setErrorMessage(
          'Erro ao carregar fornecedor.'
        );
      } finally {
        setLoading(false);
      }
    }

    loadSupplier();
  }, [supplierId]);

  async function handleSaveSupplier() {
    try {
      setSaving(true);
      setSaveMessage('');

      if (!supplierId) {
        setSaveMessage(
          'Fornecedor não identificado.'
        );

        return;
      }

      if (isCerimonialistaMode) {
        if (saved) {
          await unsaveSupplierForCustomer(
            targetCustomerId,
            supplierId
          );

          setSaved(false);

          setSaveMessage(
            'Fornecedor removido do evento da cliente.'
          );
        } else {
          await saveSupplierForCustomer(
            targetCustomerId,
            supplierId
          );

          setSaved(true);

          setSaveMessage(
            'Fornecedor salvo no evento da cliente.'
          );
        }

        return;
      }

      if (saved) {
        await unsaveSupplier(supplierId);

        setSaved(false);

        setSaveMessage(
          'Fornecedor removido do Meu Evento.'
        );
      } else {
        await saveSupplier(supplierId);

        setSaved(true);

        setSaveMessage(
          'Fornecedor salvo no Meu Evento.'
        );
      }
    } catch (error: any) {
      console.error(
        'Erro ao salvar fornecedor:',
        error
      );

      setSaveMessage(
        error?.message ||
          'Não foi possível salvar/remover este fornecedor.'
      );
    } finally {
      setSaving(false);
    }
  }

  function getQuoteLink() {
    const cityParam =
      selectedCity
        ? '&cidade=' +
          encodeURIComponent(selectedCity)
        : '';

    if (isCerimonialistaMode) {
      return (
        '/solicitar-orcamento?fornecedor=' +
        supplierId +
        '&cliente=' +
        targetCustomerId +
        '&voltar=' +
        encodeURIComponent(returnUrl) +
        cityParam
      );
    }

    return (
      '/solicitar-orcamento?fornecedor=' +
      supplierId +
      cityParam
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-[#151515]">
        <div className="mx-auto flex min-h-screen w-full max-w-[430px] items-center justify-center bg-[#fbf7f1] px-6 text-center shadow-2xl">
          <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-[#f1e7cf]">
            <Camera
              size={42}
              className="mx-auto text-[#d99200]"
            />

            <h1 className="mt-4 text-xl font-extrabold">
              Carregando vitrine
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Buscando dados da vitrine...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (errorMessage || !supplier) {
    return (
      <main className="min-h-screen bg-black text-[#151515]">
        <div className="mx-auto flex min-h-screen w-full max-w-[430px] items-center justify-center bg-[#fbf7f1] px-6 text-center shadow-2xl">
          <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-[#f1e7cf]">
            <Camera
              size={42}
              className="mx-auto text-[#d99200]"
            />

            <h1 className="mt-4 text-xl font-extrabold">
              Vitrine não encontrada
            </h1>

            <p className="mt-2 text-sm leading-5 text-gray-500">
              {errorMessage ||
                'Não foi possível carregar esse fornecedor.'}
            </p>

            <Link
              href={returnUrl}
              className="mt-5 block rounded-[22px] bg-[#e3a925] py-3 text-sm font-extrabold text-white"
            >
              Voltar
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const categoryName =
    getCategoryName(supplier);

  const isCerimonialista =
    isCerimonialistaCategory(
      categoryName
    );

  const supplierName =
    supplier.business_name ||
    (isCerimonialista
      ? 'Cerimonialista'
      : 'Fornecedor');

  const publicTypeLabel =
    isCerimonialista
      ? 'Cerimonialista'
      : 'Fornecedor';

  const city =
    supplier.city ||
    'Cidade não informada';

  const reviewCount = Number(reviewStats?.review_count || 0);

  const rating = formatRating(
    reviewStats?.rating_average
  );

  const price =
    formatPrice(
      supplier.average_price
    );

  const description =
    supplier.description ||
    (isCerimonialista
      ? 'Cerimonialista cadastrada no REIM EVENTOS.'
      : 'Fornecedor cadastrado no REIM EVENTOS.');

  const coverImage =
    getCoverImage(supplier);

  const gallery =
    getGallery(supplier);

  const services =
    getSupplierServices(supplier);

  const whatsappLink =
    formatWhatsAppLink(
      supplier.whatsapp
    );

  const serviceCities =
    getServiceCities(supplier);

  const canReceiveQuote =
    Boolean(
      publicVisibility?.can_receive_quote
    );

  const supplierTag =
    getPublicSupplierTag(
      publicVisibility,
      supplier,
      isCerimonialista
    );

  return (
    <main className="min-h-screen bg-black text-[#151515]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#fbf7f1] pb-8 shadow-2xl">
        <section className="relative h-[340px] overflow-hidden bg-black text-white">
          <img
            className="absolute inset-0 h-full w-full object-cover"
            src={coverImage}
            alt={supplierName}
          />

          <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/10 to-black/85" />

          <div className="relative z-10 flex items-center justify-between px-6 pt-7">
            <Link
              href={returnUrl}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-black/65 text-white shadow-xl"
            >
              <ArrowLeft size={25} />
            </Link>

            <div className="flex gap-3">
              <button className="flex h-12 w-12 items-center justify-center rounded-full bg-black/65 text-white shadow-xl">
                <Share2 size={22} />
              </button>

              <button
                type="button"
                onClick={handleSaveSupplier}
                disabled={saving}
                className={
                  'flex h-12 w-12 items-center justify-center rounded-full shadow-xl ' +
                  (saved
                    ? 'bg-[#e3a925] text-white'
                    : 'bg-black/65 text-white') +
                  ' disabled:opacity-60'
                }
              >
                <Heart
                  size={23}
                  fill={
                    saved
                      ? 'white'
                      : 'none'
                  }
                />
              </button>
            </div>
          </div>

          <div className="absolute bottom-8 left-6 right-6 z-10">
            <span className="rounded-full bg-[#e3a925] px-3 py-1 text-xs font-extrabold text-white">
              {supplierTag}
            </span>

            <h1 className="mt-3 font-serif text-[36px] leading-tight">
              {supplierName}
            </h1>

            <p className="mt-1 flex items-center gap-2 text-sm text-white/85">
              {isCerimonialista ? (
                <ShieldCheck
                  size={16}
                  className="text-[#e3a925]"
                />
              ) : (
                <Camera
                  size={16}
                  className="text-[#e3a925]"
                />
              )}

              {categoryName}
            </p>
          </div>
        </section>

        <section className="relative z-20 -mt-6 rounded-t-[34px] bg-[#fbf7f1] px-6 pt-7">
          <div className="rounded-[26px] bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,.08)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="flex items-center gap-2 text-sm font-bold text-gray-700">
                  <MapPin
                    size={17}
                    className="text-[#d99200]"
                  />

                  {city}
                </p>

                <p className="mt-2 flex items-center gap-2 text-sm font-bold text-gray-700">
                  <Star
                    size={17}
                    fill="#e3a925"
                    className="text-[#e3a925]"
                  />

                  {reviewCount > 0
                    ? `${rating} • ${reviewCount} ${reviewCount === 1 ? 'avaliação' : 'avaliações'}`
                    : 'Ainda sem avaliações'}
                </p>
              </div>

              <div className="rounded-2xl bg-[#fff7e8] px-4 py-3 text-center">
                <p className="text-xs font-bold text-gray-500">
                  {price === 'Sob consulta'
                    ? 'Valor'
                    : 'A partir de'}
                </p>

                <p className="text-sm font-extrabold text-[#d99200]">
                  {price}
                </p>
              </div>
            </div>
          </div>

          {serviceCities.length > 0 && (
            <div className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm leading-5 text-gray-700 shadow-sm ring-1 ring-[#f1e7cf]">
              <p className="font-extrabold text-[#151515]">
                Cidades onde atende
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {serviceCities.map(
                  (cityName) => (
                    <span
                      key={cityName}
                      className="rounded-full bg-[#fff7e8] px-3 py-1 text-xs font-extrabold text-[#7a5200]"
                    >
                      {cityName}
                    </span>
                  )
                )}
              </div>
            </div>
          )}

          {saveMessage && (
            <div
              className={
                'mt-4 rounded-2xl px-4 py-3 text-sm font-bold ' +
                (saved
                  ? 'bg-green-50 text-green-700'
                  : saveMessage.includes(
                        'removido'
                      )
                    ? 'bg-[#fff7e8] text-[#b97900]'
                    : 'bg-red-50 text-red-700')
              }
            >
              {saveMessage}
            </div>
          )}

          {saved && (
            <div className="mt-4 flex items-center gap-2 rounded-2xl bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
              <CheckCircle2 size={18} />

              {isCerimonialistaMode
                ? publicTypeLabel +
                  ' salva no evento da cliente.'
                : publicTypeLabel +
                  ' salvo(a) no seu Meu Evento.'}
            </div>
          )}

          <div className="mt-5">
            <h2 className="text-lg font-extrabold">
              {isCerimonialista
                ? 'Sobre a cerimonialista'
                : 'Sobre o fornecedor'}
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-700">
              {description}
            </p>
          </div>

          {services.length > 0 && (
            <div className="mt-6 overflow-hidden rounded-[26px] bg-white shadow-sm ring-1 ring-[#f1e7cf]">
              <div className="flex items-center gap-3 border-b border-[#f1e7cf] px-4 py-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#fff7e8] text-[#d99200]">
                  <PackageCheck size={24} />
                </div>

                <div>
                  <h2 className="text-base font-extrabold text-[#151515]">
                    Serviços oferecidos
                  </h2>

                  <p className="mt-0.5 text-[11px] font-bold text-gray-500">
                    Serviços disponíveis neste fornecedor
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 p-4">
                {services.map(
                  (service: string) => (
                    <div
                      key={service}
                      className="flex min-h-[48px] items-center gap-2 rounded-[17px] bg-[#fbf7f1] px-3 py-2.5 ring-1 ring-[#f1e7cf]"
                    >
                      <CheckCircle2
                        size={15}
                        className="shrink-0 text-[#d99200]"
                      />

                      <span className="text-[11px] font-extrabold leading-4 text-[#151515]">
                        {service}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          <div className="mt-6 overflow-hidden rounded-[26px] bg-white shadow-sm ring-1 ring-[#f1e7cf]">
            <div className="flex items-center justify-between border-b border-[#f1e7cf] px-5 py-4">
              <div>
                <h2 className="text-lg font-extrabold">Avaliações</h2>
                <p className="mt-1 text-xs font-bold text-gray-500">
                  Opiniões reais de clientes do REIM EVENTOS
                </p>
              </div>

              <div className="rounded-2xl bg-[#fff7e8] px-3 py-2 text-center">
                <p className="flex items-center justify-center gap-1 text-sm font-extrabold text-[#d99200]">
                  <Star size={15} fill="#e3a925" />
                  {reviewCount > 0 ? rating : '—'}
                </p>
                <p className="mt-0.5 text-[10px] font-bold text-gray-500">
                  {reviewCount} {reviewCount === 1 ? 'avaliação' : 'avaliações'}
                </p>
              </div>
            </div>

            {reviews.length === 0 ? (
              <div className="px-5 py-6 text-center">
                <Star size={30} className="mx-auto text-gray-300" />
                <p className="mt-3 text-sm font-extrabold text-gray-600">
                  Ainda não há avaliações
                </p>
                <p className="mt-1 text-xs leading-5 text-gray-500">
                  As avaliações aparecerão aqui após clientes concluírem suas contratações.
                </p>
              </div>
            ) : (
              <div className="space-y-4 p-5">
                {reviews.map((review: any) => (
                  <div
                    key={review.id}
                    className="rounded-[22px] bg-[#fbf7f1] p-4 ring-1 ring-[#f1e7cf]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-extrabold">
                          {review.client_name}
                        </p>
                        <p className="mt-1 text-[11px] font-bold text-gray-500">
                          {formatReviewDate(review.created_at)}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={15}
                            className={
                              star <= Number(review.rating || 0)
                                ? 'text-[#e3a925]'
                                : 'text-gray-300'
                            }
                            fill={
                              star <= Number(review.rating || 0)
                                ? '#e3a925'
                                : 'none'
                            }
                          />
                        ))}
                      </div>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-gray-700">
                      {review.comment}
                    </p>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <div className="rounded-2xl bg-white px-3 py-2 text-[11px] font-bold text-gray-600">
                        Atendimento: <strong>{review.attendance}/5</strong>
                      </div>
                      <div className="rounded-2xl bg-white px-3 py-2 text-[11px] font-bold text-gray-600">
                        Pontualidade: <strong>{review.punctuality}/5</strong>
                      </div>
                      <div className="rounded-2xl bg-white px-3 py-2 text-[11px] font-bold text-gray-600">
                        Qualidade: <strong>{review.quality}/5</strong>
                      </div>
                      <div className="rounded-2xl bg-white px-3 py-2 text-[11px] font-bold text-gray-600">
                        Custo-benefício: <strong>{review.value_score}/5</strong>
                      </div>
                    </div>

                    {review.supplier_reply && (
                      <div className="mt-4 rounded-2xl bg-[#151515] p-4 text-white">
                        <p className="text-xs font-extrabold text-[#f7d67b]">
                          Resposta do fornecedor
                        </p>
                        <p className="mt-2 text-sm leading-6 text-white/80">
                          {review.supplier_reply}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-extrabold">
                Galeria
              </h2>

              <span className="flex items-center gap-1 text-xs font-bold text-[#d99200]">
                <ImageIcon size={15} />
                Ver fotos
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {gallery.map(
                (img: string) => {
                  const isVideo =
                    isVideoUrl(img);

                  return (
                    <button
                      key={img}
                      type="button"
                      onClick={() =>
                        setSelectedMedia(img)
                      }
                      className="group relative h-28 w-full overflow-hidden rounded-[20px] bg-[#151515] shadow-sm"
                    >
                      {isVideo ? (
                        <PublicVideoThumbnail
                          url={img}
                        />
                      ) : (
                        <img
                          src={img}
                          alt="Galeria do fornecedor"
                          className="h-full w-full object-cover transition group-hover:scale-105"
                        />
                      )}

                      <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/65 px-2 py-1 text-[9px] font-extrabold text-white">
                        Ampliar
                      </span>

                      {isVideo && (
                        <span className="absolute right-2 top-2 rounded-full bg-black/65 px-2 py-1 text-[9px] font-extrabold text-white">
                          Vídeo
                        </span>
                      )}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          <div className="mt-7 space-y-3">
            {canReceiveQuote ? (
              <Link
                href={getQuoteLink()}
                className="flex items-center justify-center gap-2 rounded-[22px] bg-[#e3a925] py-4 text-center font-extrabold text-white shadow-lg"
              >
                <MessageCircle size={22} />
                Solicitar orçamento
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="flex w-full items-center justify-center gap-2 rounded-[22px] bg-gray-300 py-4 text-center font-extrabold text-gray-600 shadow-sm"
              >
                <MessageCircle size={22} />
                Solicitação indisponível
              </button>
            )}

            <button
              type="button"
              onClick={handleSaveSupplier}
              disabled={saving}
              className={
                'flex w-full items-center justify-center gap-2 rounded-[22px] py-4 text-center font-extrabold shadow-lg disabled:opacity-60 ' +
                (saved
                  ? 'bg-green-600 text-white'
                  : 'bg-black text-white')
              }
            >
              {saved ? (
                <>
                  <CheckCircle2 size={22} />
                  Salvo no Meu Evento
                </>
              ) : (
                <>
                  <CalendarDays size={22} />
                  Salvar no Meu Evento
                </>
              )}
            </button>

            <a
              href={whatsappLink}
              className="flex items-center justify-center gap-2 rounded-[22px] bg-white py-4 text-center font-extrabold text-[#151515] shadow-sm ring-1 ring-[#f1e7cf]"
            >
              <Phone
                size={22}
                className="text-[#d99200]"
              />

              Chamar no WhatsApp
            </a>

            <Link
              href={returnUrl}
              className="block rounded-[22px] bg-white py-4 text-center font-extrabold text-[#151515] shadow-sm ring-1 ring-[#f1e7cf]"
            >
              Voltar
            </Link>
          </div>
        </section>
      </div>

      {selectedMedia && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 px-4">
          <button
            type="button"
            onClick={() =>
              setSelectedMedia('')
            }
            className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur"
          >
            <X size={24} />
          </button>

          <div className="w-full max-w-[430px]">
            <div className="overflow-hidden rounded-[28px] bg-[#151515] shadow-2xl">
              {isVideoUrl(selectedMedia) ? (
                <video
                  src={selectedMedia}
                  className="max-h-[78vh] w-full object-contain"
                  controls
                  autoPlay
                />
              ) : (
                <img
                  src={selectedMedia}
                  alt="Mídia ampliada"
                  className="max-h-[78vh] w-full object-contain"
                />
              )}
            </div>

            <button
              type="button"
              onClick={() =>
                setSelectedMedia('')
              }
              className="mt-4 flex w-full items-center justify-center rounded-[22px] bg-[#e3a925] py-4 text-sm font-extrabold text-white shadow-lg"
            >
              Fechar visualização
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
