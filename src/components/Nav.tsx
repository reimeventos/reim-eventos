import Link from 'next/link';

export function Nav() {
  return (
    <nav className="fixed bottom-0 left-1/2 z-50 grid w-full max-w-[430px] -translate-x-1/2 grid-cols-5 border-t border-reimBorder bg-white px-1 py-2 text-center text-[10px]">
      <Link href="/"><span className="block text-xl">🏠</span>Home</Link>
      <Link href="/buscar"><span className="block text-xl">🔎</span>Buscar</Link>
      <Link href="/meu-evento"><span className="block text-xl">❤️</span>Evento</Link>
      <Link href="/painel-fornecedor"><span className="block text-xl">💼</span>Fornecedor</Link>
      <Link href="/admin"><span className="block text-xl">🛡️</span>Admin</Link>
    </nav>
  );
}
