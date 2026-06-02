import Link from 'next/link';
import {
  ArrowLeft,
  ImageIcon,
  Upload,
  Video,
  Camera,
} from 'lucide-react';

export default function FotosFornecedorPage() {
  return (
    <main className="min-h-screen bg-black text-[#151515]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#fbf7f1] pb-10 shadow-2xl">
        {/* TOPO */}
        <section className="relative overflow-hidden rounded-b-[34px] bg-black px-6 pb-8 pt-7 text-white">
          <div className="absolute inset-0 bg-[url('/layout01-fundo.png')] bg-cover bg-center opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/85 to-black" />

          <div className="relative z-10">
            <Link
              href="/painel-fornecedor"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#e3a925]"
            >
              <ArrowLeft size={17} />
              Voltar
            </Link>

            <h1 className="mt-5 font-serif text-[34px] leading-tight">
              Mídias da vitrine
            </h1>

            <p className="mt-2 text-sm text-white/70">
              Envie fotos e vídeos para valorizar sua vitrine.
            </p>
          </div>
        </section>

        {/* UPLOAD */}
        <section className="px-6 pt-6">
          <div className="rounded-[28px] border-2 border-dashed border-[#e3a925]/60 bg-white p-6 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#fff7e8] text-[#d99200]">
              <Upload size={32} />
            </div>

            <h2 className="mt-4 text-lg font-extrabold">
              Enviar nova mídia
            </h2>

            <p className="mt-2 text-sm leading-5 text-gray-500">
              Fotos em JPG, PNG ou WEBP até 5MB.
              <br />
              Vídeos em MP4 até 50MB.
            </p>

            <button className="mt-5 rounded-[22px] bg-[#e3a925] px-6 py-3 text-sm font-extrabold text-white shadow-lg">
              Selecionar arquivo
            </button>
          </div>
        </section>

        {/* TIPOS */}
        <section className="grid grid-cols-2 gap-4 px-6 pt-6">
          <div className="rounded-[24px] bg-white p-5 text-center shadow-sm ring-1 ring-[#f1e7cf]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff7e8] text-[#d99200]">
              <ImageIcon size={29} />
            </div>
            <h3 className="mt-3 text-sm font-extrabold">Fotos</h3>
            <p className="mt-1 text-xs text-gray-500">
              Galeria da vitrine
            </p>
          </div>

          <div className="rounded-[24px] bg-white p-5 text-center shadow-sm ring-1 ring-[#f1e7cf]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff7e8] text-[#d99200]">
              <Video size={29} />
            </div>
            <h3 className="mt-3 text-sm font-extrabold">Vídeos</h3>
            <p className="mt-1 text-xs text-gray-500">
              Reels e portfólio
            </p>
          </div>
        </section>

        {/* PRÉVIA */}
        <section className="px-6 pt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-extrabold">Prévia da galeria</h2>
            <span className="text-xs font-bold text-gray-500">3 mídias</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex h-28 items-center justify-center rounded-[22px] bg-white text-[#d99200] shadow-sm ring-1 ring-[#f1e7cf]"
              >
                <Camera size={30} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
