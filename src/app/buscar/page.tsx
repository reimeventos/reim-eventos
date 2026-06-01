import Link from 'next/link';
import { Nav } from '@/components/Nav';

export default function BuscarPage() {
  return (
    <main className="reim-shell pb-24">
      <section className="rounded-b-[2rem] bg-reimBlack p-6 text-white">
        <h1 className="font-serif text-3xl">Buscar fornecedores</h1>
        <input className="mt-5 w-full rounded-2xl p-4 text-reimBlack" placeholder="Fotógrafo, buffet, totem..." />
      </section>
      <section className="p-5">
        <Link href="/fornecedor/demo" className="block overflow-hidden rounded-3xl border border-reimBorder bg-white shadow-sm">
          <img className="h-44 w-full object-cover" src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=900&auto=format&fit=crop" alt="" />
          <div className="p-4"><b>Studio Lima Foto</b><p className="text-sm text-gray-500">Fotografia • Porto Seguro • R$ 1.200+</p></div>
        </Link>
      </section>
      <Nav />
    </main>
  );
}
