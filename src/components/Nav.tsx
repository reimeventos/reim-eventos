'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Heart,
  Home,
  ImageIcon,
  MessageSquare,
  Search,
  ShieldCheck,
  User,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

function getTestAccountType(email: string) {
  const normalized = email.toLowerCase();

  if (normalized.startsWith('cliente@')) return 'cliente';
  if (normalized.startsWith('fornecedor@')) return 'fornecedor';
  if (normalized.startsWith('cerimonialista@')) return 'cerimonialista';

  return '';
}

export function Nav() {
  const [accountType, setAccountType] = useState('cliente');

  useEffect(() => {
    async function loadAccountType() {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const user = userData.user;

        if (!user) {
          setAccountType('cliente');
          return;
        }

        const email = user.email || '';

        // Cerimonialista com vitrine é fornecedor. Fornecedor tem prioridade.
        const { data: supplierData } = await supabase
          .from('suppliers')
          .select('id')
          .eq('owner_id', user.id)
          .limit(1);

        if (supplierData && supplierData.length > 0) {
          setAccountType('fornecedor');
          return;
        }

        const { data: collaboratorData } = await supabase
          .from('event_collaborators')
          .select('id')
          .ilike('collaborator_email', email)
          .limit(1);

        if (collaboratorData && collaboratorData.length > 0) {
          setAccountType('cerimonialista');
          return;
        }

        const testType = getTestAccountType(email);

        if (testType) {
          setAccountType(testType);
          return;
        }

        setAccountType('cliente');
      } catch (error) {
        console.error('Erro ao identificar tipo de conta no menu:', error);
        setAccountType('cliente');
      }
    }

    loadAccountType();
  }, []);

  const isCliente = accountType === 'cliente';
  const isFornecedor = accountType === 'fornecedor';
  const isCerimonialista = accountType === 'cerimonialista';

  const centerHref = isCliente
    ? '/meu-evento'
    : isCerimonialista
      ? '/cerimonialista/convites'
      : '/painel-fornecedor';

  const centerLabel = isCliente
    ? 'Meu Evento'
    : isCerimonialista
      ? 'Convites'
      : 'Painel';

  const CenterIcon = isCliente ? Heart : isCerimonialista ? ShieldCheck : Briefcase;

  const secondHref = isFornecedor ? '/painel-fornecedor/fotos' : '/buscar';
  const secondLabel = isFornecedor ? 'Mídias' : 'Buscar';
  const SecondIcon = isFornecedor ? ImageIcon : Search;

  const fourthHref = isFornecedor ? '/painel-fornecedor/leads' : '/orcamentos';
  const fourthLabel = isFornecedor ? 'Leads' : 'Orçamentos';

  return (
    <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 rounded-t-[34px] bg-white/95 px-6 pb-4 pt-3 shadow-[0_-10px_30px_rgba(0,0,0,.16)] backdrop-blur">
      <div className="grid grid-cols-5 items-end text-center">
        <Link href="/" className="text-[#e3a925]">
          <Home size={30} className="mx-auto" fill="#e3a925" />
          <div className="mt-1 text-[12px] font-bold">Home</div>
          <div className="mx-auto mt-1 h-[2px] w-7 rounded-full bg-[#e3a925]" />
        </Link>

        <Link href={secondHref} className="text-[#222]">
          <SecondIcon size={30} className="mx-auto" />
          <div className="mt-1 text-[12px]">{secondLabel}</div>
        </Link>

     <Link href={centerHref} className="-mt-8">
  <div className="mx-auto flex h-[64px] w-[64px] items-center justify-center rounded-full bg-[#e3a925] text-white shadow-[0_8px_20px_rgba(227,169,37,.45)]">
    <CenterIcon size={32} strokeWidth={2.4} />
  </div>
  <div className="mt-1 text-[11px] font-bold text-[#222]">
    {centerLabel}
  </div>
</Link>

        <Link href={fourthHref} className="text-[#222]">
          <MessageSquare size={30} className="mx-auto" />
          <div className="mt-1 text-[12px]">{fourthLabel}</div>
        </Link>

        <Link href="/perfil" className="text-[#222]">
          <User size={30} className="mx-auto" />
          <div className="mt-1 text-[12px]">Perfil</div>
        </Link>
      </div>
    </nav>
  );
}
