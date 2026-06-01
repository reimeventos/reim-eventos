import Link from 'next/link';

export default function FornecedorPage() {
  return (
    <main className="reim-shell pb-10">
      <img className="h-72 w-full object-cover" src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1000&auto=format&fit=crop" alt="" />
      <section className="-mt-8 rounded-t-[2rem] bg-white p-6 relative">
        <span className="rounded-full bg-[#FFF4D8] px-3 py-2 text-xs font-bold text-[#7D5A15]">Fotografia</span>
        <h1 className="mt-3 font-serif text-3xl">Studio Lima Foto</h1>
        <p className="mt-1 text-sm text-gray-500">Porto Seguro • ⭐ 4.9 • 128 avaliações</p>
        <p className="mt-5 text-gray-700">Fornecedor premium para casamentos, aniversários e eventos corporativos.</p>
        <Link href="/meu-evento" className="mt-6 block rounded-2xl bg-reimGold py-4 text-center font-bold text-white">Salvar no Meu Evento</Link>
        <Link href="/orcamentos" className="mt-3 block rounded-2xl bg-reimBlack py-4 text-center font-bold text-white">Solicitar orçamento</Link>
      </section>
    </main>
  );
}
