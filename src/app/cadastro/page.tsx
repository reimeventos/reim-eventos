'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerClient, registerSupplier } from '@/lib/auth';

export default function CadastroPage() {
  const router = useRouter();

  const [type, setType] = useState<'cliente' | 'fornecedor'>('cliente');
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [city, setCity] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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

      if (type === 'cliente') {
        await registerClient({
          fullName: fullName.trim(),
          email: email.trim(),
          password,
          whatsapp: whatsapp.trim(),
          city: city.trim(),
        });

        setSuccessMessage('Conta de cliente criada com sucesso!');
        router.push('/login');
        return;
      }

      await registerSupplier({
        fullName: fullName.trim(),
        businessName: businessName.trim(),
        email: email.trim(),
        password,
        whatsapp: whatsapp.trim(),
        city: city.trim(),
      });

      setSuccessMessage('Conta de fornecedor criada com sucesso!');
      router.push('/login');
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
        message || 'Não foi possível criar a conta. Verifique os dados e tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-[#151515]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#fbf7f1] px-6 py-8 shadow-2xl">
        <section className="relative overflow-hidden rounded-b-[34px] bg-black px-6 pb-8 pt-7 text-white">
          <div className="absolute inset-0 bg-[url('/layout01-fundo.png')] bg-cover bg-center opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/85 to-black" />

          <div className="relative z-10">
            <h1 className="font-serif text-[34px] leading-tight">
              Criar conta
            </h1>

            <p className="mt-2 text-sm text-white/70">
              Cadastre-se para solicitar ou responder orçamentos.
            </p>
          </div>
        </section>

        <form
          onSubmit={handleSubmit}
          className="mt-6 rounded-[2rem] border border-[#f1e7cf] bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,.08)]"
        >
          <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl bg-[#fbf7f1] p-1">
            <button
              type="button"
              onClick={() => setType('cliente')}
              className={
                type === 'cliente'
                  ? 'rounded-xl bg-[#151515] py-3 text-sm font-extrabold text-white'
                  : 'rounded-xl py-3 text-sm font-extrabold text-[#151515]'
              }
            >
              Cliente
            </button>

            <button
              type="button"
              onClick={() => setType('fornecedor')}
              className={
                type === 'fornecedor'
                  ? 'rounded-xl bg-[#151515] py-3 text-sm font-extrabold text-white'
                  : 'rounded-xl py-3 text-sm font-extrabold text-[#151515]'
              }
            >
              Fornecedor
            </button>
          </div>

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
            onChange={(e) => setWhatsapp(e.target.value)}
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
            className="w-full rounded-2xl bg-[#e3a925] py-4 font-extrabold text-white shadow-lg disabled:opacity-60"
          >
            {loading ? 'Criando conta...' : 'Criar conta'}
          </button>

          <button
            type="button"
            onClick={() => router.push('/login')}
            className="mt-4 w-full text-sm font-bold text-[#b97900]"
          >
            Já tenho conta
          </button>
        </form>
      </div>
    </main>
  );
}
