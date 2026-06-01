'use client';

import { useEffect, useState } from 'react';
import { getMySupplierProfile, updateMySupplierProfile } from '@/lib/suppliers';
import { listCategories } from '@/lib/marketplace';
import { useRouter } from 'next/navigation';

export default function EditarVitrinePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({ business_name: '', description: '', city: '', whatsapp: '', instagram: '', website: '', average_price: '', category_id: '' });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    async function load() {
      const [supplier, cats] = await Promise.all([getMySupplierProfile(), listCategories()]);
      setCategories(cats);
      setForm({
        business_name: supplier.business_name ?? '',
        description: supplier.description ?? '',
        city: supplier.city ?? '',
        whatsapp: supplier.whatsapp ?? '',
        instagram: supplier.instagram ?? '',
        website: supplier.website ?? '',
        average_price: supplier.average_price ?? '',
        category_id: supplier.category_id ?? ''
      });
    }
    load();
  }, []);

  function setField(k: string, v: string) { setForm(prev => ({ ...prev, [k]: v })); }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    await updateMySupplierProfile(form);
    setMsg('Vitrine atualizada com sucesso.');
    setTimeout(() => router.push('/painel-fornecedor'), 700);
  }

  return (
    <main className="reim-shell p-6">
      <h1 className="font-serif text-3xl">Editar vitrine</h1>
      <form onSubmit={save} className="mt-6 rounded-[2rem] border border-reimBorder bg-white p-6">
        <input className="mb-3 w-full rounded-2xl border p-4" placeholder="Nome da empresa" value={form.business_name} onChange={e=>setField('business_name', e.target.value)} />
        <select className="mb-3 w-full rounded-2xl border p-4" value={form.category_id} onChange={e=>setField('category_id', e.target.value)}>
          <option value="">Categoria</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input className="mb-3 w-full rounded-2xl border p-4" placeholder="Cidade" value={form.city} onChange={e=>setField('city', e.target.value)} />
        <input className="mb-3 w-full rounded-2xl border p-4" placeholder="WhatsApp" value={form.whatsapp} onChange={e=>setField('whatsapp', e.target.value)} />
        <input className="mb-3 w-full rounded-2xl border p-4" placeholder="Instagram" value={form.instagram} onChange={e=>setField('instagram', e.target.value)} />
        <input className="mb-3 w-full rounded-2xl border p-4" placeholder="Preço médio" value={form.average_price} onChange={e=>setField('average_price', e.target.value)} />
        <textarea className="mb-3 w-full rounded-2xl border p-4" placeholder="Descrição" value={form.description} onChange={e=>setField('description', e.target.value)} />
        {msg && <p className="mb-3 text-sm text-reimGold">{msg}</p>}
        <button className="w-full rounded-2xl bg-reimGold py-4 font-bold text-white">Salvar</button>
      </form>
    </main>
  );
}
