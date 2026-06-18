'use client';

import { useEffect, useState } from 'react';
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
  MapPin,
  MessageCircle,
  Phone,
  Share2,
  ShieldCheck,
  Star,
  X,
} from 'lucide-react';

function isVideoUrl(url: string) {
  const normalized = String(url || '').toLowerCase();

  return (
    normalized.includes('.mp4') ||
    normalized.includes('.webm') ||
    normalized.includes('.mov') ||
    normalized.includes('video')
  );
}

function getCoverImage(supplier: any) {
  const cover = supplier?.media?.find((item: any) => item.is_cover);

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

  if (Number.isNaN(numberValue)) {
    return String(value);
  }

  return numberValue.toFixed(1);
}

function formatWhatsAppLink(value: any) {
  if (!value) return 'https://wa.me/5573999999999';

  const onlyNumbers = String(value).replace(/\D/g, '');

  if (!onlyNumbers) {
    return 'https://wa.me/5573999999999';
  }

  if (onlyNumbers.startsWith('55')) {
    return `https://wa.me/${onlyNumbers}`;
  }

  return `https://wa.me/55${onlyNumbers}`;
}

function getCategoryName(supplier: any) {
  if (!supplier) return 'Categoria não informada';

  if (Array.isArray(supplier.categories)) {
    return supplier.categories[0]?.name || 'Categoria não informada';
  }

  return supplier.categories?.name || 'Categoria não informada';
}

function isCerimonialistaCategory(categoryName: string) {
  const normalized = categoryName.toLowerCase();

  return (
    normalized.includes('cerimonial') ||
    normalized.includes('assessoria') ||
    normalized.includes('cerimonialista')
  );
}

function getServices(categoryName: string) {
  const normalized = categoryName.toLowerCase();

  if (isCerimonialistaCategory(categoryName)) {
    return [
      'Organização do evento',
      'Acompanhamento da cliente',
      'Contato com fornecedores',
      'Roteiro do evento',
      'Cerimonial do dia',
      'Assessoria personalizada',
    ];
  }

  if (normalized.includes('foto') || normalized.includes('film')) {
    return [
      'Casamentos',
      'Aniversários',
      'Eventos corporativos',
      'Ensaio pré-evento',
      'Filmagem',
      'Álbum digital',
    ];
  }

  if (normalized.includes('buffet')) {
    return [
      'Casamentos',
      'Aniversários',
      'Eventos corporativos',
      'Jantar',
      'Coquetel',
      'Coffee break',
    ];
  }

  if (normalized.includes('totem') || normalized.includes('cabine')) {
    return [
      'Totem fotográfico',
      'Cabine de fotos',
      'Fotos impressas',
      'Aniversários',
      'Casamentos',
      'Eventos corporativos',
    ];
  }

  return [
    'Casamentos',
    'Aniversários',
    'Eventos corporativos',
    'Debutantes',
    'Eventos sociais',
    'Serviço personalizado',
  ];
}

export default function FornecedorPage() {
  const params = useParams();
  const supplierId = String(params?.id || '');

  const [supplier, setSupplier] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedMedia, setSelectedMedia] = useState('');

  const [targetCustomerId, setTargetCustomerId] = useState('');
  const [returnUrl, setReturnUrl] = useState('/buscar');

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const isCerimonialistaMode = Boolean(targetCustomerId);

  useEffect(() => {
    async function loadSupplier() {
      try {
        setLoading(true);
        setErrorMessage('');

        if (!supplierId) {
          setErrorMessage('Vitrine não informada.');
          return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const customerIdFromUrl = urlParams.get('cliente') || '';
        const returnUrlFromUrl = urlParams.get('voltar') || '/buscar';

        setTargetCustomerId(customerIdFromUrl);
        setReturnUrl(returnUrlFromUrl);

        const data = await getSupplier(supplierId);

        if (!data) {
          setErrorMessage('Vitrine não encontrada no Supabase.');
          return;
        }

        setSupplier(data);

        if (customerIdFromUrl) {
          const { data: savedData, error: savedError } = await supabase
            .from('saved_suppliers')
            .select('id')
            .eq('customer_id', customerIdFromUrl)
            .eq('supplier_id', supplierId)
            .maybeSingle();

          if (savedError) {
            console.error('Erro ao verificar fornecedor salvo da cliente:', savedError);
          }

          setSaved(Boolean(savedData));
        } else {
          const alreadySaved = await isSupplierSaved(supplierId);
          setSaved(alreadySaved);
        }
      } catch (error) {
        console.error('Erro ao carregar fornecedor:', error);
        setErrorMessage('Erro ao carregar fornecedor.');
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
        setSaveMessage('Fornecedor não identificado.');
        return;
      }

      if (isCerimonialistaMode) {
        if (saved) {
          await unsaveSupplierForCustomer(targetCustomerId, supplierId);
          setSaved(false);
          setSaveMessage('Fornecedor removido do evento da cliente.');
        } else {
          await saveSupplierForCustomer(targetCustomerId, supplierId);
          setSaved(true);
          setSaveMessage('Fornecedor salvo no evento da cliente.');
        }

        return;
      }

      if (saved) {
        await unsaveSupplier(supplierId);
        setSaved(false);
        setSaveMessage('Fornecedor removido do Meu Evento.');
      } else {
        await saveSupplier(supplierId);
        setSaved(true);
        setSaveMessage('Fornecedor salvo no Meu Evento.');
      }
    } catch (error: any) {
      console.error('Erro ao salvar fornecedor:', error);
      setSaveMessage(
        error?.message ||
          'Não foi possível salvar/remover este fornecedor.'
      );
    } finally {
      setSaving(false);
    }
  }

  function getQuoteLink() {
    if (isCerimonialistaMode) {
      return `/solicitar-orcamento?fornecedor=${supplierId}&cliente=${targetCustomerId}&voltar=${encodeURIComponent(
        returnUrl
      )}`;
    }

    return `/solicitar-orcamento?fornecedor=${supplierId}`;
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-[#151515]">
        <div className="mx-auto flex min-h-screen w-full max-w-[430px] items-center justify-center bg-[#fbf7f1] px-6 text-center shadow-2xl">
          <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-[#f1e7cf]">
            <Camera size={42} className="mx-auto text-[#d99200]" />
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
            <Camera size={42} className="mx-auto text-[#d99200]" />
            <h1 className="mt-4 text-xl font-extrabold">
              Vitrine não encontrada
            </h1>
            <p className="mt-2 text-sm leading-5 text-gray-500">
              {errorMessage || 'Não foi possível carregar esse fornecedor.'}
            </p>

            <p className="mt-3 rounded-2xl bg-[#fbf7f1] p-3 text-xs font-bold text-gray-500">
              ID: {supplierId}
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

  const categoryName = getCategoryName(supplier);
  const isCerimonialista = isCerimonialistaCategory(categoryName);
  const supplierName = supplier.business_name || (isCerimonialista ? 'Cerimonialista' : 'Fornecedor');
  const publicTypeLabel = isCerimonialista ? 'Cerimonialista' : 'Fornecedor';
  const city = supplier.city || 'Cidade não informada';
  const rating = formatRating(supplier.rating_average);
  const price = formatPrice(supplier.average_price);
  const description =
    supplier.description ||
    (isCerimonialista
      ? 'Cerimonialista cadastrada no REIM EVENTOS. Solicite uma proposta para saber mais sobre acompanhamento, organização, disponibilidade e valores.'
      : 'Fornecedor cadastrado no REIM EVENTOS. Solicite um orçamento para saber mais detalhes sobre serviços, disponibilidade e valores.');
  const coverImage = getCoverImage(supplier);
  const gallery = getGallery(supplier);
  const services = getServices(categoryName);
  const whatsappLink = formatWhatsAppLink(supplier.whatsapp);
  const supplierTag = supplier.is_featured
    ? 'Destaque'
    : isCerimonialista
      ? 'Cerimonialista'
      : 'Premium';

  return (
    <main className="min-h-screen bg-black text-[#151515]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#fbf7f1] pb-8 shadow-2xl">
        {/* CAPA */}
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
                className={`flex h-12 w-12 items-center justify-center rounded-full shadow-xl ${
                  saved
                    ? 'bg-[#e3a925] text-white'
                    : 'bg-black/65 text-white'
                } disabled:opacity-60`}
              >
                <Heart size={23} fill={saved ? 'white' : 'none'} />
              </button>
            </div>
          </div>

          <div className="absolute bottom-8 left-6 right-6 z-10">
            <span className="rounded-full bg-[#e3a925] px-3 py-1 text-xs font-extrabold text-white">
              ♛ {supplierTag}
            </span>

            <h1 className="mt-3 font-serif text-[36px] leading-tight">
              {supplierName}
            </h1>

            <p className="mt-1 flex items-center gap-2 text-sm text-white/85">
              {isCerimonialista ? (
                <ShieldCheck size={16} className="text-[#e3a925]" />
              ) : (
                <Camera size={16} className="text-[#e3a925]" />
              )}
              {categoryName}
            </p>
          </div>
        </section>

        {/* CONTEÚDO */}
        <section className="relative z-20 -mt-6 rounded-t-[34px] bg-[#fbf7f1] px-6 pt-7">
          {/* INFO */}
          <div className="rounded-[26px] bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,.08)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="flex items-center gap-2 text-sm font-bold text-gray-700">
                  <MapPin size={17} className="text-[#d99200]" />
                  {city}
                </p>

                <p className="mt-2 flex items-center gap-2 text-sm font-bold text-gray-700">
                  <Star size={17} fill="#e3a925" className="text-[#e3a925]" />
                  {rating} • 128 avaliações
                </p>
              </div>

              <div className="rounded-2xl bg-[#fff7e8] px-4 py-3 text-center">
                <p className="text-xs font-bold text-gray-500">
                  {price === 'Sob consulta' ? 'Valor' : 'A partir de'}
                </p>

                <p className="text-sm font-extrabold text-[#d99200]">
                  {price}
                </p>
              </div>
            </div>
          </div>

          {isCerimonialista && !isCerimonialistaMode && (
            <div className="mt-4 rounded-2xl bg-[#fff7e8] px-4 py-3 text-sm leading-5 text-[#7a5200] ring-1 ring-[#f1e7cf]">
              <p className="font-extrabold">Perfil profissional de cerimonialista</p>
              <p className="mt-1">
                Essa vitrine mostra a profissional que pode acompanhar seu evento, organizar fornecedores e apoiar a cliente nos orçamentos.
              </p>
            </div>
          )}

          {isCerimonialistaMode && (
            <div className="mt-4 rounded-2xl bg-[#151515] px-4 py-3 text-sm font-bold text-white">
              Modo cerimonialista: alterações serão salvas no evento da cliente.
            </div>
          )}

          {saveMessage && (
            <div
              className={`mt-4 rounded-2xl px-4 py-3 text-sm font-bold ${
                saved
                  ? 'bg-green-50 text-green-700'
                  : saveMessage.includes('removido')
                    ? 'bg-[#fff7e8] text-[#b97900]'
                    : 'bg-red-50 text-red-700'
              }`}
            >
              {saveMessage}
            </div>
          )}

          {saved && (
            <div className="mt-4 flex items-center gap-2 rounded-2xl bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
              <CheckCircle2 size={18} />
              {isCerimonialistaMode
                ? `${publicTypeLabel} salva no evento da cliente.`
                : `${publicTypeLabel} salvo(a) no seu Meu Evento.`}
            </div>
          )}

          {/* DESCRIÇÃO */}
          <div className="mt-5">
            <h2 className="text-lg font-extrabold">{isCerimonialista ? 'Sobre a cerimonialista' : 'Sobre o fornecedor'}</h2>

            <p className="mt-3 text-sm leading-6 text-gray-700">
              {description}
            </p>
          </div>

          {/* SERVIÇOS */}
          <div className="mt-6">
            <h2 className="text-lg font-extrabold">{isCerimonialista ? 'Serviços da cerimonialista' : 'Serviços oferecidos'}</h2>

            <div className="mt-3 flex flex-wrap gap-2">
              {services.map((service) => (
                <span
                  key={service}
                  className="rounded-full bg-white px-4 py-2 text-xs font-bold text-gray-700 shadow-sm ring-1 ring-[#f1e7cf]"
                >
                  {service}
                </span>
              ))}
            </div>
          </div>

          {/* GALERIA */}
          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-extrabold">Galeria</h2>

              <span className="flex items-center gap-1 text-xs font-bold text-[#d99200]">
                <ImageIcon size={15} />
                Ver fotos
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {gallery.map((img: string) => {
                const isVideo = isVideoUrl(img);

                return (
                  <button
                    key={img}
                    type="button"
                    onClick={() => setSelectedMedia(img)}
                    className="group relative h-28 w-full overflow-hidden rounded-[20px] bg-[#151515] shadow-sm"
                  >
                    {isVideo ? (
                      <video
                        src={img}
                        className="h-full w-full object-cover"
                        muted
                        playsInline
                      />
                    ) : (
                      <img
                        src={img}
                        alt="Galeria do fornecedor"
                        className="h-full w-full object-cover transition group-hover:scale-105"
                      />
                    )}

                    <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/15" />

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
              })}
            </div>
          </div>

          {/* CTA PRINCIPAL */}
          <div className="mt-7 space-y-3">
            <Link
              href={getQuoteLink()}
              className="flex items-center justify-center gap-2 rounded-[22px] bg-[#e3a925] py-4 text-center font-extrabold text-white shadow-lg"
            >
              <MessageCircle size={22} />
              {isCerimonialista ? 'Solicitar proposta' : 'Solicitar orçamento'}
            </Link>

            <button
              type="button"
              onClick={handleSaveSupplier}
              disabled={saving}
              className={`flex w-full items-center justify-center gap-2 rounded-[22px] py-4 text-center font-extrabold shadow-lg disabled:opacity-60 ${
                saved
                  ? 'bg-green-600 text-white'
                  : 'bg-black text-white'
              }`}
            >
              {saved ? (
                <>
                  <CheckCircle2 size={22} />
                  {isCerimonialistaMode
                    ? `${publicTypeLabel} salva no evento`
                    : 'Salvo no Meu Evento'}
                </>
              ) : (
                <>
                  <CalendarDays size={22} />
                  {isCerimonialistaMode
                    ? `Salvar ${publicTypeLabel.toLowerCase()} no evento`
                    : 'Salvar no Meu Evento'}
                </>
              )}
            </button>

            <a
              href={whatsappLink}
              className="flex items-center justify-center gap-2 rounded-[22px] bg-white py-4 text-center font-extrabold text-[#151515] shadow-sm ring-1 ring-[#f1e7cf]"
            >
              <Phone size={22} className="text-[#d99200]" />
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
              onClick={() => setSelectedMedia('')}
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
                onClick={() => setSelectedMedia('')}
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
