'use client';

import { useEffect, useState } from 'react';
import { getMySupplierProfile, uploadSupplierPhoto } from '@/lib/suppliers';

export default function FotosFornecedorPage() {
  const [supplier, setSupplier] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [msg, setMsg] = useState('');

  async function load() {
    const s = await getMySupplierProfile();
    setSupplier(s);
    setPhotos(s.media ?? []);
  }

  useEffect(() => { load(); }, []);

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMsg('Enviando...');
    await uploadSupplierPhoto(file, photos.length === 0);
    setMsg('Foto enviada com sucesso.');
    await load();
  }

  return (
    <main className="reim-shell p-6">
      <h1 className="font-serif text-3xl">Fotos da vitrine</h1>
      <label className="mt-6 block rounded-[2rem] border border-dashed border-reimGold bg-white p-8 text-center">
        <b>Enviar nova foto</b>
        <p className="mt-2 text-sm text-gray-500">JPG, PNG ou WEBP até 5MB</p>
        <input className="hidden" type="file" accept="image/jpeg,image/png,image/webp" onChange={upload} />
      </label>
      {msg && <p className="mt-4 text-sm text-reimGold">{msg}</p>}
      <div className="mt-6 grid grid-cols-2 gap-3">
        {photos.map(p => <img key={p.id} className="h-36 rounded-3xl object-cover" src={p.file_url} alt="" />)}
      </div>
    </main>
  );
}
