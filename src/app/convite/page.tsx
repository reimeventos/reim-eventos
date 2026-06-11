'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, LogIn, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ConvitePage() {
  const router = useRouter();

  useEffect(() => {
    async function redirectInvite() {
      const { data } = await supabase.auth.getUser();

      if (data.user) {
        router.replace('/cerimonialista/convites');
        return;
      }

      router.replace('/login?redirect=/cerimonialista/convites');
    }

    redirectInvite();
  }, [router]);

  return (
    <main className="min-h-screen bg-black text-[#151515]">
      <div className="mx-auto flex min-h-screen w-full max-w-[430px] items-center justify-center bg-[#fbf7f1] px-6 text-center shadow-2xl">
        <div className="rounded-[30px] bg-white p-6 shadow-[0_10px_25px_rgba(0,0,0,.08)] ring-1 ring-[#f1e7cf]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e3a925] text-white shadow-lg">
            <ShieldCheck size={34} />
          </div>

          <h1 className="mt-5 font-serif text-[32px] leading-tight">
            Convite REIM
          </h1>

          <p className="mt-3 text-sm leading-5 text-gray-600">
            Você recebeu um convite para atuar como cerimonialista em um evento.
          </p>

          <div className="mt-5 flex items-center justify-center gap-2 rounded-2xl bg-[#fff7e8] px-4 py-3 text-sm font-bold text-[#b97900]">
            <Heart size={17} />
            Redirecionando...
          </div>

          <Link
            href="/login?redirect=/cerimonialista/convites"
            className="mt-5 flex items-center justify-center gap-2 rounded-[24px] bg-[#e3a925] py-4 text-center font-extrabold text-white shadow-lg"
          >
            <LogIn size={21} />
            Entrar no REIM
          </Link>
        </div>
      </div>
    </main>
  );
}
