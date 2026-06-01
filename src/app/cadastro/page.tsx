'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerClient, registerSupplier } from '@/lib/auth';

export default function CadastroPage() {
  const router = useRouter();
  const [type, setType] = useState<'cliente'|'fornecedor'>('cliente');
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [city, setCity] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (type === 'cliente') await registerClient({ fullName, email, password, whatsapp, city });
    else await registerSupplier({ fullName, businessName, email, password, whatsapp, city });
    router.push(type === 'cliente' ? '/' : '/painel-fornecedor');
  }

  return (
    <main className="reim-shell p-6">
      <h1 className="font-serif text-3xl">Criar conta</h1>
      <form onSubmit={handleSubmit} className="mt-6 rounded-[2rem] border border-reimBorder bg-white p-6">
        <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl bg-reimBg p-1">
          <button type="button" onClick={()=>setType('cliente')} className={`rounded-xl py-3 ${type==='cliente'?'bg-reimBlack text-white':''}`}>Cliente</button>
          <button type="button" onClick={()=>setType('fornecedor')} className={`rounded-xl py-3 ${type==='fornecedor'?'bg-reimBlack text-white':''}`}>Fornecedor</button>
        </div>
        <input className="mb-3 w-full rounded-2xl border p-4" placeholder="Nome completo" value={fullName} onChange={e=>setFullName(e.target.value)} />
        {type === 'fornecedor' && <input className="mb-3 w-full rounded-2xl border p-4" placeholder="Nome da empresa" value={businessName} onChange={e=>setBusinessName(e.target.value)} />}
        <input className="mb-3 w-full rounded-2xl border p-4" placeholder="E-mail" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="mb-3 w-full rounded-2xl border p-4" placeholder="Senha" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <input className="mb-3 w-full rounded-2xl border p-4" placeholder="WhatsApp" value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} />
        <input className="mb-3 w-full rounded-2xl border p-4" placeholder="Cidade" value={city} onChange={e=>setCity(e.target.value)} />
        <button className="w-full rounded-2xl bg-reimGold py-4 font-bold text-white">Criar conta</button>
      </form>
    </main>
  );
}
