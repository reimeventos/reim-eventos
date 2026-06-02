'use client';

import { useEffect, useState } from 'react';
import { getMySupplierProfile, updateMySupplierProfile } from '@/lib/suppliers';
import { listCategories } from '@/lib/marketplace';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  Camera,
  Globe,
  Instagram,
  MapPin,
  MessageCircle,
  Pencil,
  Save,
  ToggleRight,
  WalletCards,
} from 'lucide-react';

export default function EditarVitrinePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({
    business_name: '',
    description: '',
    city: '',
    whatsapp: '',
    instagram: '',
    website: '',
    average_price: '',
    category_id: '',
    show_price: 'false',
  });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    async function load() {
      const [supplier, cats] = await Promise.all([
        getMySupplierProfile(),
        listCategories(),
      ]);

      setCategories(cats || []);

      setForm({
        business_name: supplier?.business_name ?? '',
        description: supplier?.description ?? '',
        city: supplier?.city ?? '',
        whatsapp: supplier?.whatsapp ?? '',
        instagram: supplier?.instagram ?? '',
        website: supplier?.website ?? '',
        average_price: supplier?.average_price ?? '',
        category_id: supplier?.category_id ?? '',
        show_price: supplier?.show_price ? 'true' : 'false',
      });
    }

    load();
  }, []);

  function setField(k: string, v: string) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();

    await updateMySupplierProfile({
      ...form,
      show_price: form.show_price === 'true',
    });

    setMsg('Vitrine atualizada com sucesso.');

    setTimeout(() => router.push('/painel-fornecedor'), 700);
  }

  return (
    <main className="min-h-screen bg-black text-[#151515]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#fbf7f1] pb-10 shadow-2xl">
        {/* TOPO */}
        <section className="relative overflow-hidden rounded-b-[34px] bg-black px-6 pb-8 pt-7 text-white">
          <div className="absolute inset-0 bg-[url('/layout01-fundo.png')] bg-cover bg-center opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/85 to-black" />

          <div className="relative z-10">
            <Link
              href="/painel-fornecedor"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#e3a925]"
            >
              <ArrowLeft size={17} />
              Voltar
            </Link>

            <h1 className="mt-5 font-serif text-[34px] leading-tight">
              Editar vitrine
            </h1>

            <p className="mt-2 text-sm text-white/70">
              Atualize as informações públicas do seu perfil.
            </p>
          </div>
        </section>

        {/* CARD */}
        <section className="px-6 pt-6">
          <div className="rounded-[28px] bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,.08)]">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff7e8] text-[#d99200]">
                <Camera size={30} />
              </div>

              <div>
                <p className="text-xs font-bold text-gray-500">Fornecedor</p>
                <h2 className="text-lg font-extrabold">
                  {form.business_name || 'Studio Premium'}
                </h2>
                <p className="text-sm text-gray-500">
                  Edite sua vitrine pública
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FORMULÁRIO */}
        <section className="px-6 pt-6">
          <form onSubmit={save} className="space-y-4">
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-extrabold">
                <Building2 size={17} className="text-[#d99200]" />
                Nome da empresa
              </span>
              <input
                className="w-full rounded-[22px] bg-white px-5 py-4 text-sm font-medium outline-none ring-1 ring-[#f1e7cf] placeholder:text-gray-400"
                placeholder="Nome da empresa"
                value={form.business_name}
                onChange={(e) => setField('business_name', e.target.value)}
              />
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-extrabold">
                <Pencil size={17} className="text-[#d99200]" />
                Categoria
              </span>
              <select
                className="w-full rounded-[22px] bg-white px-5 py-4 text-sm font-medium outline-none ring-1 ring-[#f1e7cf]"
                value={form.category_id}
                onChange={(e) => setField('category_id', e.target.value)}
              >
                <option value="">Selecione uma categoria</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-extrabold">
                <MapPin size={17} className="text-[#d99200]" />
                Cidade
              </span>
              <input
                className="w-full rounded-[22px] bg-white px-5 py-4 text-sm font-medium outline-none ring-1 ring-[#f1e7cf] placeholder:text-gray-400"
                placeholder="Ex: Eunápolis"
                value={form.city}
                onChange={(e) => setField('city', e.target.value)}
              />
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-extrabold">
                <MessageCircle size={17} className="text-[#d99200]" />
                WhatsApp
              </span>
              <input
                className="w-full rounded-[22px] bg-white px-5 py-4 text-sm font-medium outline-none ring-1 ring-[#f1e7cf] placeholder:text-gray-400"
                placeholder="(73) 99999-9999"
                value={form.whatsapp}
                onChange={(e) => setField('whatsapp', e.target.value)}
              />
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-extrabold">
                <Instagram size={17} className="text-[#d99200]" />
                Instagram
              </span>
              <input
                className="w-full rounded-[22px] bg-white px-5 py-4 text-sm font-medium outline-none ring-1 ring-[#f1e7cf] placeholder:text-gray-400"
                placeholder="@suaempresa"
                value={form.instagram}
                onChange={(e) => setField('instagram', e.target.value)}
              />
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-extrabold">
                <Globe size={17} className="text-[#d99200]" />
                Site
              </span>
              <input
                className="w-full rounded-[22px] bg-white px-5 py-4 text-sm font-medium outline-none ring-1 ring-[#f1e7cf] placeholder:text-gray-400"
                placeholder="https://suaempresa.com"
                value={form.website}
                onChange={(e) => setField('website', e.target.value)}
              />
            </label>

            {/* PREÇO PÚBLICO */}
            <div className="rounded-[26px] bg-white p-5 shadow-sm ring-1 ring-[#f1e7cf]">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff7e8] text-[#d99200]">
                  <ToggleRight size={27} />
                </div>

                <div>
                  <h3 className="text-sm font-extrabold">Preço público</h3>
                  <p className="text-xs text-gray-500">
                    Escolha se o valor aparece na vitrine
                  </p>
                </div>
              </div>

              <select
                className="w-full rounded-[22px] bg-[#fbf7f1] px-5 py-4 text-sm font-medium outline-none ring-1 ring-[#f1e7cf]"
                value={form.show_price}
                onChange={(e) => setField('show_price', e.target.value)}
              >
                <option value="false">Não mostrar preço público</option>
                <option value="true">Mostrar preço público</option>
              </select>
            </div>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-extrabold">
                <WalletCards size={17} className="text-[#d99200]" />
                Valor inicial / preço médio
              </span>
              <input
                className="w-full rounded-[22px] bg-white px-5 py-4 text-sm font-medium outline-none ring-1 ring-[#f1e7cf] placeholder:text-gray-400"
                placeholder="Ex: R$ 1.200"
                value={form.average_price}
                onChange={(e) => setField('average_price', e.target.value)}
              />
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-extrabold">
                <Pencil size={17} className="text-[#d99200]" />
                Descrição da vitrine
              </span>
              <textarea
                className="min-h-[140px] w-full resize-none rounded-[22px] bg-white px-5 py-4 text-sm font-medium outline-none ring-1 ring-[#f1e7cf] placeholder:text-gray-400"
                placeholder="Fale sobre sua empresa, experiência, diferenciais e serviços..."
                value={form.description}
                onChange={(e) => setField('description', e.target.value)}
              />
            </label>

            {msg && (
              <p className="rounded-[18px] bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
                {msg}
              </p>
            )}

            <button className="flex w-full items-center justify-center gap-2 rounded-[24px] bg-[#e3a925] py-4 text-center font-extrabold text-white shadow-lg">
              <Save size={21} />
              Salvar vitrine
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
