'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AlterarSenhaPage() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    async function checkSession() {
      try {
        setCheckingSession(true);
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!userData.user) {
          router.replace('/login?redirect=' + encodeURIComponent('/alterar-senha'));
          return;
        }
      } catch (error: any) {
        console.error('Erro ao verificar sessão para alterar senha:', error);
        setErrorMessage(error?.message || 'Não foi possível verificar sua sessão.');
      } finally {
        setCheckingSession(false);
      }
    }
    checkSession();
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!newPassword.trim()) {
      setErrorMessage('Informe a nova senha.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage('A nova senha precisa ter pelo menos 6 caracteres.');
      return;
    }
    if (!confirmPassword.trim()) {
      setErrorMessage('Confirme a nova senha.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('A confirmação não corresponde à nova senha.');
      return;
    }

    try {
      setSaving(true);
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setNewPassword('');
      setConfirmPassword('');
      setSuccessMessage('Senha alterada com sucesso.');
    } catch (error: any) {
      console.error('Erro ao alterar senha:', error);
      const message = String(error?.message || '');
      if (message.toLowerCase().includes('different from the old password')) {
        setErrorMessage('Escolha uma senha diferente da senha atual.');
        return;
      }
      if (message.toLowerCase().includes('password should be at least')) {
        setErrorMessage('A nova senha precisa ter pelo menos 6 caracteres.');
        return;
      }
      setErrorMessage(message || 'Não foi possível alterar a senha.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-[#151515]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#fbf7f1] pb-10 shadow-2xl">
        <section className="relative overflow-hidden rounded-b-[34px] bg-black px-6 pb-8 pt-7 text-white">
          <div className="absolute inset-0 bg-[url('/layout01-fundo.png')] bg-cover bg-center opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/85 to-black" />
          <div className="relative z-10">
            <Link href="/perfil" className="inline-flex items-center gap-2 text-sm font-bold text-[#e3a925]">
              <ArrowLeft size={17} />
              Voltar ao perfil
            </Link>
            <div className="mt-6 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e3a925] text-white shadow-lg">
                <KeyRound size={31} />
              </div>
              <div>
                <h1 className="font-serif text-[31px] leading-tight">Alterar senha</h1>
                <p className="mt-1 text-sm text-white/70">Atualize a senha da sua conta REIM.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 pt-6">
          {checkingSession ? (
            <div className="rounded-[28px] bg-white p-6 text-center shadow-sm ring-1 ring-[#f1e7cf]">
              <Loader2 size={36} className="mx-auto animate-spin text-[#d99200]" />
              <p className="mt-3 text-sm font-bold text-gray-500">Verificando sua conta...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="rounded-[28px] bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,.08)] ring-1 ring-[#f1e7cf]">
              <div className="flex items-start gap-3 rounded-[22px] bg-[#fff7e8] p-4 text-[#8a6100] ring-1 ring-[#f1e7cf]">
                <ShieldCheck size={22} className="mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-extrabold">Proteja sua conta</p>
                  <p className="mt-1 text-xs font-bold leading-5">Use uma senha diferente das que você utiliza em outros serviços.</p>
                </div>
              </div>

              <label className="mt-5 block">
                <span className="text-sm font-extrabold">Nova senha</span>
                <div className="mt-2 flex items-center rounded-[20px] border border-[#f1e7cf] bg-[#fbf7f1] px-4">
                  <input type={showPassword ? 'text' : 'password'} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" placeholder="Mínimo de 6 caracteres" className="min-w-0 flex-1 bg-transparent py-4 text-sm font-medium outline-none" />
                  <button type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} className="ml-3 text-gray-500">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </label>

              <label className="mt-4 block">
                <span className="text-sm font-extrabold">Confirmar nova senha</span>
                <div className="mt-2 flex items-center rounded-[20px] border border-[#f1e7cf] bg-[#fbf7f1] px-4">
                  <input type={showConfirmation ? 'text' : 'password'} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" placeholder="Digite novamente" className="min-w-0 flex-1 bg-transparent py-4 text-sm font-medium outline-none" />
                  <button type="button" onClick={() => setShowConfirmation((current) => !current)} aria-label={showConfirmation ? 'Ocultar confirmação' : 'Mostrar confirmação'} className="ml-3 text-gray-500">
                    {showConfirmation ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </label>

              {errorMessage && <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold leading-5 text-red-700">{errorMessage}</div>}
              {successMessage && <div className="mt-4 flex items-center gap-2 rounded-2xl bg-green-50 px-4 py-3 text-sm font-bold text-green-700"><CheckCircle2 size={19} />{successMessage}</div>}

              <button type="submit" disabled={saving} className="mt-5 flex w-full items-center justify-center gap-2 rounded-[22px] bg-[#e3a925] py-4 text-center font-extrabold text-white shadow-lg disabled:opacity-60">
                {saving ? <Loader2 size={20} className="animate-spin" /> : <KeyRound size={20} />}
                {saving ? 'Alterando senha...' : 'Salvar nova senha'}
              </button>

              {successMessage && <Link href="/perfil" className="mt-3 block rounded-[22px] bg-black py-4 text-center font-extrabold text-white shadow-lg">Voltar ao Perfil</Link>}
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
