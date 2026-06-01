import Link from 'next/link';
import { Nav } from '@/components/Nav';

export default function MeuEventoPage() {
  return (
    <main className="reim-shell pb-24">
      <section className="rounded-b-[2rem] bg-reimBlack p-6 text-white">
        <h1 className="font-serif text-3xl">Meu Evento</h1>
        <p className="mt-2 text-white/60">Casamento Ana & João • 15/12/2026</p>
        <div className="mt-4 h-2 rounded-full bg-white/20"><div className="h-full w-1/2 rounded-full bg-reimGold" /></div>
      </section>
      <section className="p-5">
        {['Fotografia — Studio Lima Foto ✅','Totem — Photofest Totem ✅','Buffet — Buffet Celebrare ⏳','Decoração — Buscar'].map(item => <div key={item} className="mb-3 rounded-3xl border border-reimBorder bg-white p-5">{item}</div>)}
        <Link href="/orcamentos" className="block rounded-2xl bg-reimBlack py-4 text-center font-bold text-white">Solicitar orçamento de todos</Link>
      </section>
      <Nav />
    </main>
  );
}
