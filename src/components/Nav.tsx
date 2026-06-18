'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Heart,
  Home,
  MessageSquare,
  Search,
  ShieldCheck,
  User,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

function getTestAccountType(email: string) {
  const normalized = email.toLowerCase();

  if (normalized.startsWith('cliente@')) {
    return 'cliente';
  }

  if (normalized.startsWith('fornecedor@')) {
    return 'fornecedor';
  }

  if (normalized.startsWith('cerimonialista@')) {
    return 'cerimonialista';
  }

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
        const testType = getTestAccountType(email);

        if (testType) {
          setAccountType(testType);
          return;
        }

        /*
          IMPORTANTE:
          Verificamos fornecedor ANTES de cerimonialista.

          Motivo:
          Uma conta de fornecedor pode aparecer em event_collaborators
          quando é cerimonialista aceita para atuar em um evento.
          Se verificarmos colaborador primeiro, o menu mostra "Convites"
          em vez de "Painel".
        */
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

  const searchHref = isFornecedor ? '/painel-fornecedor/fotos' : '/buscar';
  const searchLabel = isFornecedor ? 'Mídias' : 'Buscar';
  const SearchIcon = isFornecedor ? Briefcase : Search;

  const quotesHref = isFornecedor ? '/painel-fornecedor/leads' : '/orcamentos';
  const quotesLabel = isFornecedor ? 'Leads' : 'Orçamentos';

  const perfilHref = isFornecedor ? '/painel-fornecedor/editar' : '/perfil';
  const perfilLabel = isFornecedor ? 'Vitrine' : 'Perfil';

  return (
    <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 rounded-t-[34px] bg-white/95 px-6 pb-4 pt-3 shadow-[0_-10px_30px_rgba(0,0,0,.16)] backdrop-blur">
      <div className="grid grid-cols-5 items-end text-center">
        <Link href="/" className="text-[#e3a925]">
          <Home size={30} className="mx-auto" fill="#e3a925" />
          <div className="mt-1 text-[12px] font-bold">Home</div>
          <div className="mx-auto mt-1 h-[2px] w-7 rounded-full bg-[#e3a925]" />
        </Link>

        <Link href={searchHref} className="text-[#222]">
          <SearchIcon size={30} className="mx-auto" />
          <div className="mt-1 text-[12px]">{searchLabel}</div>
        </Link>

        <Link href={centerHref} className="-mt-10">
          <div className="mx-auto flex h-[76px] w-[76px] items-center justify-center rounded-full bg-[#e3a925] text-white shadow-[0_8px_25px_rgba(227,169,37,.55)]">
            <CenterIcon size={40} strokeWidth={2.4} />
          </div>
          <div className="mt-1 text-[12px] font-bold text-[#222]">
            {centerLabel}
          </div>
        </Link>

        <Link href={quotesHref} className="text-[#222]">
          <MessageSquare size={30} className="mx-auto" />
          <div className="mt-1 text-[12px]">{quotesLabel}</div>
        </Link>

        <Link href={perfilHref} className="text-[#222]">
          <User size={30} className="mx-auto" />
          <div className="mt-1 text-[12px]">{perfilLabel}</div>
        </Link>
      </div>
    </nav>
  );
}
