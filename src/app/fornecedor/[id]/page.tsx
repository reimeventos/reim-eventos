'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getSupplier } from '@/lib/marketplace';
import {
  ArrowLeft,
  CalendarDays,
  Camera,
  Heart,
  Image as ImageIcon,
  MapPin,
  MessageCircle,
  Phone,
  Share2,
  Star,
} from 'lucide-react';

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

function getServices(categoryName: string) {
  const normalized = categoryName.toLowerCase();

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

  useEffect(() => {
    async function loadSupplier() {
      try {
        setLoading(true);
        setErrorMessage('');

        if (!supplierId) {
          setErrorMessage('Fornecedor não informado.');
          return;
        }

        const data = await getSupplier(supplierId);

        if (!data) {
          setErrorMessage('Fornecedor não encontrado no Supabase.');
          return;
        }

        setSupplier(data);
      } catch (error) {
        console.error('Erro ao carregar fornecedor:', error);
        setErrorMessage('Erro ao carregar fornecedor.');
      } finally {
        setLoading(false);
      }
    }

    loadSupplier();
  }, [supplierId]);

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
              Buscando dados do fornecedor...
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
              href="/buscar"
              className="mt-5 block rounded-[22px] bg-[#e3a925] py-3 text-sm font-extrabold text-white"
            >
              Voltar para busca
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const supplierName = supplier.business_name || 'Fornecedor';
  const categoryName = supplier.categories?.name || 'Categoria não informada';
  const city = supplier.city || 'Cidade não informada';
  const rating = formatRating(supplier.rating_average);
  const price = formatPrice(supplier.average_price);
  const description =
    supplier.description ||
    'Fornecedor cadastrado no REIM EVENTOS. Solicite um orçamento para saber mais detalhes sobre serviços, disponibilidade e valores.';
  const coverImage = getCoverImage(supplier);
  const gallery = getGallery(supplier);
  const services = getServices(categoryName);
  const whatsappLink = formatWhatsAppLink(supplier.whatsapp);
  const supplierTag = supplier.is_featured ? 'Destaque' : 'Premium';

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
              href="/buscar"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-black/65 text-white shadow-xl"
            >
              <ArrowLeft size={25} />
            </Link>

            <div className="flex gap-3">
              <button className="flex h-12 w-12 items-center justify-center rounded-full bg-black/65 text-white shadow-xl">
                <Share2 size={22} />
              </button>

              <button className="flex h-12 w-12 items-center justify-center rounded-full bg-black/65 text-white shadow-xl">
                <Heart size={23} />
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
              <Camera size={16} className="text-[#e3a925]" />
              {categoryName}
            </p>
          </div>
        </section>

        {/* CONTEÚDO */}
        <section className="-mt-6 rounded-t-[34px] bg-[#fbf7f1] px-6 pt-7 relative z-20">
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

          {/* DESCRIÇÃO */}
          <div className="mt-5">
            <h2 className="text-lg font-extrabold">Sobre o fornecedor</h2>

            <p className="mt-3 text-sm leading-6 text-gray-700">
              {description}
            </p>
          </div>

          {/* SERVIÇOS */}
          <div className="mt-6">
            <h2 className="text-lg font-extrabold">Serviços oferecidos</h2>

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
              {gallery.map((img: string) => (
                <img
                  key={img}
                  src={img}
                  alt="Galeria do fornecedor"
                  className="h-28 w-full rounded-[20px] object-cover shadow-sm"
                />
              ))}
            </div>
          </div>

          {/* CTA PRINCIPAL */}
          <div className="mt-7 space-y-3">
            <Link
              href={`/solicitar-orcamento?fornecedor=${supplier.id}`}
              className="flex items-center justify-center gap-2 rounded-[22px] bg-[#e3a925] py-4 text-center font-extrabold text-white shadow-lg"
            >
              <MessageCircle size={22} />
              Solicitar orçamento
            </Link>

            <Link
              href="/meu-evento"
              className="flex items-center justify-center gap-2 rounded-[22px] bg-black py-4 text-center font-extrabold text-white shadow-lg"
            >
              <CalendarDays size={22} />
              Salvar no Meu Evento
            </Link>

            <a
              href={whatsappLink}
              className="flex items-center justify-center gap-2 rounded-[22px] bg-white py-4 text-center font-extrabold text-[#151515] shadow-sm ring-1 ring-[#f1e7cf]"
            >
              <Phone size={22} className="text-[#d99200]" />
              Chamar no WhatsApp
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
