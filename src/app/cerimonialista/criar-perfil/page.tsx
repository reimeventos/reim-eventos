'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle2,
  Heart,
  Instagram,
  Link as LinkIcon,
  MapPin,
  MessageCircle,
  Save,
  ShieldCheck,
  User,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function CriarPerfilCerimonialistaPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [userEmail, setUserEmail] = useState('');
  const [existingSupplierId, setExistingSupplierId] = useState('');
  const [categoryId, setCategoryId] = useState('');

  const [businessName, setBusinessName] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('Eunápolis');
  const [whatsapp, setWhatsapp] = useState('');
  const [instagram, setInstagram] = useState('');
  const [website, setWebsite] = useState('');
  const [averagePrice, setAveragePrice] = useState('');

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  function formatWhatsapp(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 11);

    if (digits.length <= 2) return digits;

    if (digits.length <= 7) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    }

    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setErrorMessage('');

        const { data: userData } = await supabase.auth.getUser();
        const user = userData.user;

        if (!user) {
          setErrorMessage('Faça login como cerimonialista para criar seu perfil.');
          return;
        }

        setUserEmail(user.email || '');

        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', 'cerimonialista')
          .maybeSingle();

        if (categoryError) {
          throw categoryError;
        }

        if (!categoryData?.id) {
          setErrorMessage('Categoria Cerimonialista não encontrada.');
          return;
        }

        setCategoryId(categoryData.id);

        const { data: supplierData, error: supplierError } = await supabase
          .from('suppliers')
          .select('*')
          .eq('owner_id', user.id)
          .limit(1)
          .maybeSingle();

        if (supplierError) {
          throw supplierError;
        }

        if (supplierData) {
          setExistingSupplierId(supplierData.id);
          setBusinessName(supplierData.business_name || '');
          setDescription(supplierData.description || '');
          setCity(supplierData.city || 'Eunápolis');
          setWhatsapp(supplierData.whatsapp || '');
          setInstagram(supplierData.instagram || '');
          setWebsite(supplierData.website || '');
          setAveragePrice(supplierData.average_price || '');
        }
      } catch (error: any) {
        console.error('Erro ao carregar perfil profissional:', error);
        setErrorMessage(
          error?.message || 'Não foi possível carregar os dados do perfil.'
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSuccessMessage('');
    setErrorMessage('');

    if (!businessName.trim()) {
      setErrorMessage('Informe o nome profissional ou nome da empresa.');
      return;
    }

    if (!city.trim()) {
      setErrorMessage('Informe a cidade de atendimento.');
      return;
    }

    if (!whatsapp.trim()) {
      setErrorMessage('Informe o WhatsApp profissional.');
      return;
    }

    if (!categoryId) {
      setErrorMessage('Categoria Cerimonialista não encontrada.');
      return;
    }

    try {
      setSaving(true);

      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!user) {
        setErrorMessage('Faça login novamente.');
        return;
      }

      const payload = {
        owner_id: user.id,
        category_id: categoryId,
        business_name: businessName.trim(),
        description:
          description.trim() ||
          'Cerimonialista cadastrada no REIM EVENTOS para organização, acompanhamento e assessoria de eventos.',
        city: city.trim(),
        whatsapp: whatsapp.trim(),
        instagram: instagram.trim() || null,
        website: website.trim() || null,
        average_price: averagePrice.trim() || null,
        status: 'ativo',
        is_featured: false,
        rating_average: 4.9,
        updated_at: new Date().toISOString(),
      };

      let supplierId = existingSupplierId;

      if (existingSupplierId) {
        const { data, error } = await supabase
          .from('suppliers')
          .update(payload)
          .eq('id', existingSupplierId)
          .select()
          .single();

        if (error) throw error;

        supplierId = data.id;
      } else {
        const { data, error } = await supabase
          .from('suppliers')
          .insert([payload])
          .select()
          .single();

        if (error) throw error;

        supplierId = data.id;
        setExistingSupplierId(data.id);
      }

      if (supplierId && user.email) {
        await supabase
          .from('event_collaborators')
          .update({
            supplier_id: supplierId,
            updated_at: new Date().toISOString(),
          })
          .ilike('collaborator_email', user.email);
      }

      setSuccessMessage('Perfil profissional criado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao salvar perfil profissional:', error);
      setErrorMessage(
        error?.message || 'Não foi possível criar o perfil profissional.'
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-[#151515]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#fbf7f1] pb-10 shadow-2xl">
        <section className="relative overflow-hidden rounded-b-[34px] bg-black px-6 pb-8 pt-7 text-white">
          <div className="absolute inset-0 bg-[url('/layout01-fundo.png')] bg-cover bg-center opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/80 to-black" />

          <div className="relative z-10">
            <Link
              href="/cerimonialista/convites"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#e3a925]"
            >
              <ArrowLeft size={17} />
              Voltar
            </Link>

            <div className="mt-6 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e3a925] text-white shadow-lg">
                <ShieldCheck size={31} />
              </div>

              <div>
                <h1 className="font-serif text-[31px] leading-tight">
                  Perfil profissional
                </h1>

                <p className="mt-1 text-sm text-white/70">
                  Crie sua vitrine de cerimonialista no REIM.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 pt-6">
          {loading && (
            <div className="rounded-[28px] bg-white p-6 text-center shadow-sm ring-1 ring-[#f1e7cf]">
              <Heart size={38} className="mx-auto text-[#d99200]" />
              <p className="mt-3 text-sm font-bold text-gray-500">
                Carregando perfil...
              </p>
            </div>
          )}

          {!loading && (
            <>
              <div className="mb-5 rounded-[28px] bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,.08)] ring-1 ring-[#f1e7cf]">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff7e8] text-[#d99200]">
                    <BriefcaseBusiness size={30} />
                  </div>

                  <div className="flex-1">
                    <h2 className="text-lg font-extrabold">
                      Vire fornecedora no REIM
                    </h2>

                    <p className="mt-1 text-sm leading-5 text-gray-600">
                      Após criar seu perfil, clientes poderão ver sua vitrine,
                      salvar seu serviço e solicitar orçamento.
                    </p>

                    {userEmail && (
                      <p className="mt-3 rounded-2xl bg-[#fbf7f1] px-4 py-3 text-xs font-bold text-gray-500">
                        Conta logada: {userEmail}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-sm font-extrabold">
                    <User size={17} className="text-[#d99200]" />
                    Nome profissional / empresa
                  </span>

                  <input
                    value={businessName}
                    onChange={(event) => setBusinessName(event.target.value)}
                    className="w-full rounded-[22px] bg-white px-5 py-4 text-sm font-medium outline-none ring-1 ring-[#f1e7cf] placeholder:text-gray-400"
                    placeholder="Ex: Ana Cerimonial"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-sm font-extrabold">
                    <MapPin size={17} className="text-[#d99200]" />
                    Cidade de atendimento
                  </span>

                  <input
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    className="w-full rounded-[22px] bg-white px-5 py-4 text-sm font-medium outline-none ring-1 ring-[#f1e7cf] placeholder:text-gray-400"
                    placeholder="Ex: Eunápolis"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-sm font-extrabold">
                    <MessageCircle size={17} className="text-[#d99200]" />
                    WhatsApp profissional
                  </span>

                  <input
                    inputMode="numeric"
                    maxLength={15}
                    value={whatsapp}
                    onChange={(event) =>
                      setWhatsapp(formatWhatsapp(event.target.value))
                    }
                    className="w-full rounded-[22px] bg-white px-5 py-4 text-sm font-medium outline-none ring-1 ring-[#f1e7cf] placeholder:text-gray-400"
                    placeholder="(73) 99999-9999"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-sm font-extrabold">
                    <Instagram size={17} className="text-[#d99200]" />
                    Instagram
                  </span>

                  <input
                    value={instagram}
                    onChange={(event) => setInstagram(event.target.value)}
                    className="w-full rounded-[22px] bg-white px-5 py-4 text-sm font-medium outline-none ring-1 ring-[#f1e7cf] placeholder:text-gray-400"
                    placeholder="@seuinstagram"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-sm font-extrabold">
                    <LinkIcon size={17} className="text-[#d99200]" />
                    Site ou link
                  </span>

                  <input
                    value={website}
                    onChange={(event) => setWebsite(event.target.value)}
                    className="w-full rounded-[22px] bg-white px-5 py-4 text-sm font-medium outline-none ring-1 ring-[#f1e7cf] placeholder:text-gray-400"
                    placeholder="https://..."
                  />
                </label>

                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-sm font-extrabold">
                    <BriefcaseBusiness size={17} className="text-[#d99200]" />
                    Valor médio / inicial
                  </span>

                  <input
                    value={averagePrice}
                    onChange={(event) => setAveragePrice(event.target.value)}
                    className="w-full rounded-[22px] bg-white px-5 py-4 text-sm font-medium outline-none ring-1 ring-[#f1e7cf] placeholder:text-gray-400"
                    placeholder="Ex: 1200"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-sm font-extrabold">
                    <ShieldCheck size={17} className="text-[#d99200]" />
                    Descrição dos serviços
                  </span>

                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    className="min-h-[130px] w-full resize-none rounded-[22px] bg-white px-5 py-4 text-sm font-medium outline-none ring-1 ring-[#f1e7cf] placeholder:text-gray-400"
                    placeholder="Conte sobre sua atuação como cerimonialista, assessoria, organização e acompanhamento de eventos."
                  />
                </label>

                {errorMessage && (
                  <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                    {errorMessage}
                  </div>
                )}

                {successMessage && (
                  <div className="flex items-center gap-2 rounded-2xl bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
                    <CheckCircle2 size={18} />
                    {successMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-[24px] bg-[#e3a925] py-4 text-center font-extrabold text-white shadow-lg disabled:opacity-60"
                >
                  <Save size={21} />
                  {saving
                    ? 'Salvando...'
                    : existingSupplierId
                      ? 'Atualizar perfil profissional'
                      : 'Criar perfil profissional'}
                </button>

                {existingSupplierId && (
                  <Link
                    href={`/fornecedor/${existingSupplierId}`}
                    className="block rounded-[24px] bg-black py-4 text-center font-extrabold text-white shadow-lg"
                  >
                    Ver minha vitrine
                  </Link>
                )}

                <Link
                  href="/cerimonialista/convites"
                  className="block rounded-[24px] bg-white py-4 text-center font-extrabold text-[#151515] shadow-sm ring-1 ring-[#f1e7cf]"
                >
                  Voltar para convites
                </Link>
              </form>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
