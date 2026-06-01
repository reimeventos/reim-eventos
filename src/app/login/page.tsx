'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Brand } from '@/components/Brand';
import { login } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await login(email, password);
    router.push('/');
  }

  return (
    <main className="reim-shell min-h-screen bg-reimBlack p-6 text-white">
      <div className="pt-10"><Brand /></div>
      <form onSubmit={handleSubmit} className="mt-10 rounded-[2rem] bg-white p-6 text-reimBlack">
        <h2 className="mb-4 text-xl font-bold">Entrar</h2>
        <input className="mb-3 w-full rounded-2xl border border-reimBorder p-4" placeholder="E-mail" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="mb-3 w-full rounded-2xl border border-reimBorder p-4" placeholder="Senha" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="w-full rounded-2xl bg-reimGold py-4 font-bold text-white">Entrar</button>
        <button type="button" onClick={()=>router.push('/cadastro')} className="mt-4 w-full text-sm text-reimGold">Criar conta</button>
      </form>
    </main>
  );
}
