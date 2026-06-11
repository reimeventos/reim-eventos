'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Building2, Heart, ShieldCheck, UserPlus } from 'lucide-react';
import { registerClient, registerSupplier } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

type AccountType = 'cliente' | 'fornecedor' | 'cerimonialista';

export default function CadastroPage() {
  const router = useRouter();

  const [type, setType] = useState<AccountType>('cliente');
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [city, setCity] = useState('');

  const [redirectTo, setRedirectTo] = useState('/perfil');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const redirectParam = params.get('redirect') || '';
    const emailParam = params.get('email') || '';
    const typeParam = params.get('type') || '';

    if (redirectParam && redirectParam.startsWith('/')) {
      setRedirectTo(redirectParam);
    }

    if (emailParam) {
      setEmail(emailParam.trim().toLowerCase());
    }

    if (typeParam === 'fornecedor') {
      setType('fornecedor');
    }

    if (
      typeParam === 'cerimonialista' ||
      redirectParam.includes('/cerimonialista/convites')
    ) {
      setType('cerimonialista');
      setRedirectTo('/cerimonialista/convites');
    }
  }, []);

  function formatWhatsapp(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 11);

    if (digits.length <= 2) return digits;

    if (digits.length <= 7) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    }

    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  function getTitle() {
    if (type === 'fornecedor') return 'Criar conta fornecedor';
    if (type === 'cerimonialista') return 'Criar conta cerimonialista';
    return 'Criar conta cliente';
  }

  function getDescription() {
    if (type === 'fornecedor') {
      return 'Cadastre sua empresa para receber orçamentos no REIM.';
    }

    if (type === 'cerimonialista') {
      return 'Crie sua conta para aceitar convites e atuar em eventos de clientes.';
    }

    return 'Cadastre-se para salvar fornecedores e solicitar orçamentos.';
  }

  async function createProfileIfNeeded(input: {
    id: string;
    email: string;
    fullName: string;
    whatsapp: string;
    city: string;
    accountType: AccountType;
  }) {
    const { error } = await supabase.from('profiles').upsert(
      {
        id: input.id,
        email: input.email,
        full_name: input.fullName,
        whatsapp: input.whatsapp,
        city: input.city,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'id',
      }
    );

    if (error) {
      console.error('Erro ao criar profile:', error);
    }
  }

  async function getCerimonialistaCategoryId() {
    const { data, error } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', 'cerimonialista')
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data?.id) {
      throw new Error('Categoria cerimonialista não encontrada.');
    }

    return data.id;
  }

  async function createCerimonialistaSupplierAndLink(input: {
    userId: string;
    email: string;
    fullName: string;
    whatsapp: string;
    city: string;
  }) {
    const categoryId = await getCerimonialistaCategoryId();

    const supplierBusinessName =
      businessName.trim() || input.fullName.trim() || 'Cerimonialista';

    const { data: existingSupplier, error: existingSupplierError } = await supabase
      .from('suppliers')
      .select('id,business_name')
      .eq('owner_id', input.userId)
      .limit(1)
      .maybeSingle();

    if (existingSupplierError) {
      throw existingSupplierError;
    }

    let supplierId = existingSupplier?.id || '';

    if (!supplierId) {
      const { data: createdSupplier, error: createSupplierError } = await supabase
        .from('suppliers')
        .insert({
          owner_id: input.userId,
          category_id: categoryId,
          business_name: supplierBusinessName,
          description:
            'Cerimonialista cadastrada no REIM EVENTOS para organização, acompanhamento e assessoria de eventos.',
          city: input.city.trim() || 'Eunápolis',
          whatsapp: input.whatsapp.trim(),
          instagram: null,
          average_price: '1200',
          status: 'ativo',
          is_featured: false,
          rating_average: 4.9,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (createSupplierError) {
        throw createSupplierError;
      }

      supplierId = createdSupplier.id;
    }

    if (supplierId) {
      const { error: updateInviteError } = await supabase
        .from('event_collaborators')
        .update({
          status: 'aceito',
          supplier_id: supplierId,
          updated_at: new Date().toISOString(),
        })
        .ilike('collaborator_email', input.email);

      if (updateInviteError) {
        console.error('Erro ao vincular convite da cerimonialista:', updateInviteError);
      }
    }

    return supplierId;
  }

  async function signInAndRedirect(cleanEmail: string, cleanPassword: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: cleanPassword,
    });

    if (error) {
      router.push(
        `/login?redirect=${encodeURIComponent(redirectTo)}&email=${encodeURIComponent(
          cleanEmail
        )}`
      );
      return;
    }

    if (data.user) {
      await createProfileIfNeeded({
        id: data.user.id,
        email: cleanEmail,
        fullName: fullName.trim(),
        whatsapp: whatsapp.trim(),
        city: city.trim(),
        accountType: type,
      });

      if (type === 'cerimonialista') {
        await createCerimonialistaSupplierAndLink({
          userId: data.user.id,
          email: cleanEmail,
          fullName: fullName.trim(),
          whatsapp: whatsapp.trim(),
          city: city.trim(),
        });
      }
    }

    if (type === 'cerimonialista') {
      router.push('/cerimonialista/convites');
      router.refresh();
      return;
    }

    router.push(redirectTo || '/perfil');
    router.refresh();
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setErrorMessage('');
    setSuccessMessage('');

    if (!fullName.trim()) {
      setErrorMessage('Informe o nome completo.');
      return;
    }

    if (type === 'fornecedor' && !businessName.trim()) {
      setErrorMessage('Informe o nome da empresa.');
      return;
    }

    if (!email.trim()) {
      setErrorMessage('Informe o e-mail.');
      return;
    }

    if (!password.trim()) {
      setErrorMessage('Informe a senha.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }

    if (!whatsapp.trim()) {
      setErrorMessage('Informe o WhatsApp.');
      return;
    }

    if (!city.trim()) {
      setErrorMessage('Informe a cidade.');
      return;
    }

    try {
      setLoading(true);

      const cleanEmail = email.trim().toLowerCase();
      const cleanPassword = password;

      if (type === 'cliente' || type === 'cerimonialista') {
        await registerClient({
          fullName: fullName.trim(),
          email: cleanEmail,
          password: cleanPassword,
          whatsapp: whatsapp.trim(),
          city: city.trim(),
        });

        setSuccessMessage(
          type === 'cerimonialista'
            ? 'Conta de cerimonialista criada com sucesso!'
            : 'Conta de cliente criada com sucesso!'
        );

        await signInAndRedirect(cleanEmail, cleanPassword);
        return;
      }

      await registerSupplier({
        fullName: fullName.trim(),
        businessName: businessName.trim(),
        email: cleanEmail,
        password: cleanPassword,
        whatsapp: whatsapp.trim(),
        city: city.trim(),
      });

      setSuccessMessage('Conta de fornecedor criada com sucesso!');
      await signInAndRedirect(cleanEmail, cleanPassword);
    } catch (error: any) {
      console.error('Erro ao criar conta:', error);

      const message = String(error?.message || '');

      if (message.includes('User already registered')) {
        setErrorMessage('Este e-mail já está cadastrado. Tente fazer login.');
        return;
      }

      if (message.includes('Password should be at least')) {
        setErrorMessage('A senha precisa ter pelo menos 6 caracteres.');
        return;
      }

      if (message.includes('duplicate key')) {
        setErrorMessage('Já existe cadastro com esses dados. Tente fazer login.');
        return;
      }

      setErrorMessage(
        message ||
          'Não foi possível criar a conta. Verifique os dados e tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-[#151515]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#fbf7f1] pb-10 shadow-2xl">
        <section className="relative overflow-hidden rounded-b-[34px] bg-black px-6 pb-8 pt-7 text-white">
          <div className="absolute inset-0 bg-[url('/layout01-fundo.png')] bg-cover bg-center opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/85 to-black" />

          <div className="relative z-10">
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="inline-flex items-center gap-2 text-sm font-bold text-[#e3a925]"
            >
              <ArrowLeft size={17} />
              Voltar
            </button>

            <div className="mt-6 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e3a925] text-white shadow-lg">
                {type === 'fornecedor' ? (
                  <Building2 size={31} />
                ) : type === 'cerimonialista' ? (
                  <ShieldCheck size={31} />
                ) : (
                  <Heart size={31} />
                )}
              </div>

              <div>
                <h1 className="font-serif text-[31px] leading-tight">
                  {getTitle()}
                </h1>

                <p className="mt-1 text-sm text-white/70">
                  {getDescription()}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 pt-6">
          <form
            onSubmit={handleSubmit}
            className="rounded-[2rem] border border-[#f1e7cf] bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,.08)]"
          >
            <div className="mb-4 grid grid-cols-3 gap-2 rounded-2xl bg-[#fbf7f1] p-1">
              <button
                type="button"
                onClick={() => setType('cliente')}
                className={
                  type === 'cliente'
                    ? 'rounded-xl bg-[#151515] py-3 text-[11px] font-extrabold text-white'
                    : 'rounded-xl py-3 text-[11px] font-extrabold text-[#151515]'
                }
              >
                Cliente
              </button>

              <button
                type="button"
                onClick={() => setType('cerimonialista')}
                className={
                  type === 'cerimonialista'
                    ? 'rounded-xl bg-[#151515] py-3 text-[11px] font-extrabold text-white'
                    : 'rounded-xl py-3 text-[11px] font-extrabold text-[#151515]'
                }
              >
                Cerimonial
              </button>

              <button
                type="button"
                onClick={() => setType('fornecedor')}
                className={
                  type === 'fornecedor'
                    ? 'rounded-xl bg-[#151515] py-3 text-[11px] font-extrabold text-white'
                    : 'rounded-xl py-3 text-[11px] font-extrabold text-[#151515]'
                }
              >
                Fornecedor
              </button>
            </div>

            {type === 'cerimonialista' && (
              <div className="mb-4 rounded-2xl bg-[#fff7e8] px-4 py-3 text-xs font-bold leading-5 text-[#8a6100]">
                Você está criando uma conta para acessar convites recebidos de clientes.
                O REIM também criará sua vitrine profissional como cerimonialista.
              </div>
            )}

            <input
              className="mb-3 w-full rounded-2xl border border-[#f1e7cf] p-4 text-sm font-medium outline-none placeholder:text-gray-400"
              placeholder="Nome completo"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />

            {type === 'fornecedor' && (
              <input
                className="mb-3 w-full rounded-2xl border border-[#f1e7cf] p-4 text-sm font-medium outline-none placeholder:text-gray-400"
                placeholder="Nome da empresa"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
            )}

            {type === 'cerimonialista' && (
              <input
                className="mb-3 w-full rounded-2xl border border-[#f1e7cf] p-4 text-sm font-medium outline-none placeholder:text-gray-400"
                placeholder="Nome da vitrine. Ex: Ana Cerimonial"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
            )}

            <input
              className="mb-3 w-full rounded-2xl border border-[#f1e7cf] p-4 text-sm font-medium outline-none placeholder:text-gray-400"
              placeholder="E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              className="mb-3 w-full rounded-2xl border border-[#f1e7cf] p-4 text-sm font-medium outline-none placeholder:text-gray-400"
              placeholder="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <input
              className="mb-3 w-full rounded-2xl border border-[#f1e7cf] p-4 text-sm font-medium outline-none placeholder:text-gray-400"
              placeholder="WhatsApp"
              value={whatsapp}
              onChange={(e) => setWhatsapp(formatWhatsapp(e.target.value))}
              maxLength={15}
              inputMode="numeric"
            />

            <input
              className="mb-3 w-full rounded-2xl border border-[#f1e7cf] p-4 text-sm font-medium outline-none placeholder:text-gray-400"
              placeholder="Cidade"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />

            {errorMessage && (
              <div className="mb-3 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="mb-3 rounded-2xl bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
                {successMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#e3a925] py-4 font-extrabold text-white shadow-lg disabled:opacity-60"
            >
              <UserPlus size={21} />
              {loading ? 'Criando conta...' : 'Criar conta'}
            </button>

            <button
              type="button"
              onClick={() =>
                router.push(
                  `/login?redirect=${encodeURIComponent(
                    redirectTo
                  )}&email=${encodeURIComponent(email.trim().toLowerCase())}`
                )
              }
              className="mt-4 w-full text-sm font-bold text-[#b97900]"
            >
              Já tenho conta
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
