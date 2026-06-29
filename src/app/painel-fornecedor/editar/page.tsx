'use client';

import { useEffect, useState } from 'react';
import { getMySupplierProfile } from '@/lib/suppliers';
import { listCategories } from '@/lib/marketplace';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  AtSign,
  Building2,
  Camera,
  Globe,
  MapPin,
  MessageCircle,
  Plus,
  Pencil,
  Save,
  ToggleRight,
  WalletCards,
} from 'lucide-react';

const defaultServiceCities = [
  'Eunápolis',
  'Porto Seguro',
  "Arraial d'Ajuda",
  'Trancoso',
  'Belmonte',
  'Teixeira de Freitas',
  'Itagimirim',
  'Itabela',
];

function normalizeCity(city: string) {
  return String(city || '').trim();
}


export default function EditarVitrinePage() {
  const router = useRouter();

  const [categories, setCategories] = useState<any[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>(defaultServiceCities);
  const [newCity, setNewCity] = useState('');

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
    service_cities: [] as string[],
  });

  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const [supplier, cats] = await Promise.all([
        getMySupplierProfile(),
        listCategories(),
      ]);

      const supplierData = supplier as any;

      setCategories(cats || []);

      try {
        const { data: suppliersCities } = await supabase
          .from('suppliers')
          .select('city, service_cities');

        const citiesFromSuppliers = (suppliersCities || []).flatMap((item: any) => [
          item.city,
          ...(Array.isArray(item.service_cities) ? item.service_cities : []),
        ]);

        const mergedCities = Array.from(
          new Set(
            [...defaultServiceCities, ...citiesFromSuppliers]
              .map((city) => normalizeCity(city))
              .filter(Boolean)
          )
        ).sort((a, b) => a.localeCompare(b, 'pt-BR'));

        setAvailableCities(mergedCities);
      } catch (error) {
        console.error('Erro ao carregar cidades atendidas:', error);
      }

      const mainCity = supplierData?.city ?? '';
      const savedServiceCities = Array.isArray(supplierData?.service_cities)
        ? supplierData.service_cities
        : [];

      const serviceCities = Array.from(
        new Set(
          [mainCity, ...savedServiceCities]
            .map((city) => normalizeCity(city))
            .filter(Boolean)
        )
      );

      setForm({
        business_name: supplierData?.business_name ?? '',
        description: supplierData?.description ?? '',
        city: mainCity,
        whatsapp: supplierData?.whatsapp ?? '',
        instagram: supplierData?.instagram ?? '',
        website: supplierData?.website ?? '',
        average_price: supplierData?.average_price ?? '',
        category_id: supplierData?.category_id ?? '',
        show_price: supplierData?.show_price ? 'true' : 'false',
        service_cities: serviceCities,
      });
    }

    load();
  }, []);

  function setField(k: string, v: string) {
    setForm((prev) => {
      const next: any = { ...prev, [k]: v };

      if (k === 'city') {
        const city = normalizeCity(v);

        if (city && !next.service_cities.includes(city)) {
          next.service_cities = [city, ...next.service_cities];
        }
      }

      return next;
    });
  }

  function toggleServiceCity(city: string) {
    const normalizedCity = normalizeCity(city);

    if (!normalizedCity) return;

    setForm((prev) => {
      const alreadySelected = prev.service_cities.includes(normalizedCity);
      const mainCity = normalizeCity(prev.city);

      if (alreadySelected && normalizedCity === mainCity) {
        return prev;
      }

      return {
        ...prev,
        service_cities: alreadySelected
          ? prev.service_cities.filter((item) => item !== normalizedCity)
          : [...prev.service_cities, normalizedCity],
      };
    });
  }

  function addNewServiceCity() {
    const city = normalizeCity(newCity);

    if (!city) return;

    setAvailableCities((current) =>
      current.includes(city)
        ? current
        : [...current, city].sort((a, b) => a.localeCompare(b, 'pt-BR'))
    );

    setForm((prev) => ({
      ...prev,
      service_cities: prev.service_cities.includes(city)
        ? prev.service_cities
        : [...prev.service_cities, city],
    }));

    setNewCity('');
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();

    try {
      setSaving(true);
      setMsg('');
      setErrorMsg('');

      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      const user = userData.user;

      if (!user) {
        setErrorMsg('Sua sessão expirou. Entre novamente para salvar.');
        return;
      }

      const serviceCities = Array.from(
        new Set(
          [form.city, ...form.service_cities]
            .map((city) => normalizeCity(city))
            .filter(Boolean)
        )
      );

      const { error } = await supabase
        .from('suppliers')
        .update({
          business_name: form.business_name,
          description: form.description,
          city: form.city,
          whatsapp: form.whatsapp,
          instagram: form.instagram,
          website: form.website,
          average_price: form.average_price,
          category_id: form.category_id || null,
          show_price: form.show_price === 'true',
          service_cities: serviceCities,
          updated_at: new Date().toISOString(),
        })
        .eq('owner_id', user.id);

      if (error) {
        throw error;
      }

      setForm((prev) => ({
        ...prev,
        service_cities: serviceCities,
      }));

      setMsg('Vitrine atualizada com sucesso.');

      setTimeout(() => router.push('/painel-fornecedor'), 900);
    } catch (error: any) {
      console.error('Erro ao salvar vitrine:', error);
      setErrorMsg(
        error?.message ||
          'Não foi possível salvar a vitrine. Verifique os dados e tente novamente.'
      );
    } finally {
      setSaving(false);
    }
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

        {/* CARD FORNECEDOR */}
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
                Cidade principal
              </span>
              <input
                className="w-full rounded-[22px] bg-white px-5 py-4 text-sm font-medium outline-none ring-1 ring-[#f1e7cf] placeholder:text-gray-400"
                placeholder="Ex: Eunápolis"
                value={form.city}
                onChange={(e) => setField('city', e.target.value)}
              />
              <p className="mt-2 text-xs leading-5 text-gray-500">
                Essa é a cidade onde sua empresa fica. Ela sempre entra automaticamente nas cidades atendidas.
              </p>
            </label>

            <div className="rounded-[26px] bg-white p-5 shadow-sm ring-1 ring-[#f1e7cf]">
              <div className="mb-4 flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#fff7e8] text-[#d99200]">
                  <MapPin size={27} />
                </div>

                <div>
                  <h3 className="text-sm font-extrabold">Cidades onde atende</h3>
                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Marque todas as regiões onde você pode realizar atendimento.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {availableCities.map((city) => {
                  const checked = form.service_cities.includes(city);
                  const isMainCity = normalizeCity(form.city) === city;

                  return (
                    <button
                      key={city}
                      type="button"
                      onClick={() => toggleServiceCity(city)}
                      className={
                        checked
                          ? 'rounded-[18px] bg-[#e3a925] px-3 py-3 text-left text-xs font-extrabold text-white shadow-sm'
                          : 'rounded-[18px] bg-[#fbf7f1] px-3 py-3 text-left text-xs font-extrabold text-gray-700 ring-1 ring-[#f1e7cf]'
                      }
                    >
                      {city}
                      {isMainCity && (
                        <span className="mt-1 block text-[10px] opacity-80">
                          Cidade principal
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 flex gap-2">
                <input
                  className="min-w-0 flex-1 rounded-[18px] bg-[#fbf7f1] px-4 py-3 text-sm font-medium outline-none ring-1 ring-[#f1e7cf] placeholder:text-gray-400"
                  placeholder="Adicionar cidade"
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                />

                <button
                  type="button"
                  onClick={addNewServiceCity}
                  className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[18px] bg-black text-white"
                >
                  <Plus size={20} />
                </button>
              </div>

              <p className="mt-3 text-xs leading-5 text-gray-500">
                Se o cliente buscar uma cidade que você atende, sua vitrine poderá aparecer mesmo que sua empresa seja de outra cidade.
              </p>
            </div>

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
                <AtSign size={17} className="text-[#d99200]" />
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

              <p className="mt-2 text-xs leading-5 text-gray-500">
                Quando ativo, o valor inicial aparece na sua vitrine pública.
              </p>
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

            {errorMsg && (
              <p className="rounded-[18px] bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                {errorMsg}
              </p>
            )}

            {msg && (
              <p className="rounded-[18px] bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
                {msg}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-[24px] bg-[#e3a925] py-4 text-center font-extrabold text-white shadow-lg disabled:opacity-60"
            >
              <Save size={21} />
              {saving ? 'Salvando...' : 'Salvar vitrine'}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
