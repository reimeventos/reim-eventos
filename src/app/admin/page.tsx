export default function AdminPage() {
  return (
    <main className="reim-shell p-6">
      <h1 className="font-serif text-3xl">Admin REIM</h1>
      <section className="mt-6 grid grid-cols-2 gap-3">
        {['127 Fornecedores','84 Assinaturas','483 Orçamentos','R$ 4.820 MRR'].map(i => <div key={i} className="rounded-3xl border border-reimBorder bg-white p-5 font-bold">{i}</div>)}
      </section>
    </main>
  );
}
