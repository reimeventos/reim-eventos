'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Brand } from '@/components/Brand';
import { login } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage('Informe o e-mail.');
      return;
    }

    if (!password.trim()) {
      setErrorMessage('Informe a senha.');
      return;
    }

    try {
      setLoading(true);

      await login(email, password);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        throw new Error('Usuário não encontrado após login.');
      }

      const { data: supplier } = await supabase
        .from('suppliers')
        .select('id')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (supplier?.id) {
        router.push('/painel-fornecedor/leads');
        return;
      }

      router.push('/');
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      setErrorMessage('Não foi possível entrar. Confira e-mail e senha.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="reim-shell min-h-screen bg-reimBlack p-6 text-white">
      <div className="pt-10">
        <Brand />
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-10 rounded-[2rem] bg-white p-6 text-reimBlack"
      >
        <h2 className="mb-4 text-xl font-bold">Entrar</h2>

        <input
          className="mb-3 w-full rounded-2xl border border-reimBorder p-4"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="mb-3 w-full rounded-2xl border border-reimBorder p-4"
          placeholder="Senha"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {errorMessage && (
          <div className="mb-3 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {errorMessage}
          </div>
        )}

        <button
          disabled={loading}
          className="w-full rounded-2xl bg-reimGold py-4 font-bold text-white disabled:opacity-60"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>

        <button
          type="button"
          onClick={() => router.push('/cadastro')}
          className="mt-4 w-full text-sm text-reimGold"
        >
          Criar conta
        </button>
      </form>
    </main>
  );
}
