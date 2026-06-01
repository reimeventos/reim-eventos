import Link from 'next/link';
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

const gallery = [
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=900&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=900&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?q=80&w=900&auto=format&fit=crop',
];

const services = [
  'Casamentos',
  'Aniversários',
  'Eventos corporativos',
  'Ensaio pré-evento',
  'Filmagem',
  'Álbum digital',
];

export default function FornecedorPage() {
  return (
    <main className="min-h-screen bg-black text-[#151515]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#fbf7f1] pb-8 shadow-2xl">
        {/* CAPA */}
        <section className="relative h-[340px] overflow-hidden bg-black text-white">
          <img
            className="absolute inset-0 h-full w-full object-cover"
            src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1000&auto=format&fit=crop"
            alt="Studio Premium"
          />

          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/85" />

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
              ♛ Premium
            </span>

            <h1 className="mt-3 font-serif text-[36px] leading-tight">
              Studio Premium
            </h1>

            <p className="mt-1 flex items-center gap-2 text-sm text-white/85">
              <Camera size={16} className="text-[#e3a925]" />
              Fotografia & Filmagem
            </p>
          </div>
        </section>

        {/* CONTEÚDO */}
        <section className="-mt-6 rounded-t-[34px] bg-[#fbf7f1] px-6 pt-7 relative z-20">
          {/* INFO */}
          <div className="rounded-[26px] bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,.08)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="flex items-center gap-2 text-sm font-bold text-gray-700">
                  <MapPin size={17} className="text-[#d99200]" />
                  Eunápolis
                </p>

                <p className="mt-2 flex items-center gap-2 text-sm font-bold text-gray-700">
                  <Star size={17} fill="#e3a925" className="text-[#e3a925]" />
                  4.9 • 128 avaliações
                </p>
              </div>

              <div className="rounded-2xl bg-[#fff7e8] px-4 py-3 text-center">
                <p className="text-xs font-bold text-gray-500">A partir de</p>
                <p className="text-sm font-extrabold text-[#d99200]">
                  R$ 1.200
                </p>
              </div>
            </div>
          </div>

          {/* DESCRIÇÃO */}
          <div className="mt-5">
            <h2 className="text-lg font-extrabold">Sobre o fornecedor</h2>

            <p className="mt-3 text-sm leading-6 text-gray-700">
              Fornecedor premium especializado em fotografia e filmagem para
              casamentos, aniversários, debutantes e eventos corporativos.
              Atendimento com qualidade, pontualidade e acabamento profissional.
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
              {gallery.map((img) => (
                <img
                  key={img}
                  src={img}
                  alt="Galeria do fornecedor"
                  className="h-28 rounded-[20px] object-cover shadow-sm"
                />
              ))}
            </div>
          </div>

          {/* CTA PRINCIPAL */}
          <div className="mt-7 space-y-3">
            <Link
              href="/orcamentos"
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
              href="https://wa.me/5573999999999"
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
