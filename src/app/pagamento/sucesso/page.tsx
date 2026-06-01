import Link from 'next/link';

export default function PagamentoSucessoPage() {
  return (
    <main className="reim-shell flex min-h-screen flex-col items-center justify-center bg-reimBlack p-6 text-center text-white">
      <div className="text-6xl">✅</div>
      <h1 className="mt-5 font-serif text-3xl">Pagamento aprovado!</h1>
      <p className="mt-3 text-white/70">Sua assinatura foi ativada. Se o perfil estiver completo, a vitrine será publicada.</p>
      <Link href="/painel-fornecedor" className="mt-8 rounded-2xl bg-reimGold px-8 py-4 font-bold">Ir para painel</Link>
    </main>
  );
}
