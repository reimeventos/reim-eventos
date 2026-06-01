import Link from 'next/link';

export default function PainelFornecedorPage() {
  return (
    <main className="reim-shell pb-10">
      <section className="rounded-b-[2rem] bg-reimBlack p-6 text-white">
        <h1 className="font-serif text-3xl">Painel Fornecedor</h1>
        <p className="mt-2 text-white/60">Vitrine, leads, fotos e plano</p>
      </section>

      <section className="grid grid-cols-2 gap-3 p-5">
        {['Fotos', 'Leads', 'Vitrine', 'Plano'].map(i => (
          <div key={i} className="rounded-3xl border border-reimBorder bg-white p-5 font-bold">{i}</div>
        ))}

        <Link href="/painel-fornecedor/editar" className="rounded-2xl bg-reimBlack py-4 text-center font-bold text-white">Editar vitrine</Link>
        <Link href="/painel-fornecedor/fotos" className="rounded-2xl bg-reimGold py-4 text-center font-bold text-white">Enviar fotos</Link>
        <Link href="/painel-fornecedor/leads" className="rounded-2xl bg-white py-4 text-center font-bold text-reimBlack border border-reimBorder">Ver leads</Link>
        <Link href="/planos" className="rounded-2xl bg-white py-4 text-center font-bold text-reimBlack border border-reimBorder">Planos</Link>
      </section>
    </main>
  );
}
