'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Camera } from 'lucide-react';
import { supabase } from '@/lib/supabase';

function getDaysUntil(date?: string) {
  if (!date) return null;
  const today = new Date();
  const target = new Date(date);
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function getBlockReason(subscription: any) {
  if (!subscription) return 'sem-assinatura';

  const status = subscription.status || '';
  const dueDate = subscription.due_date || '';
  const trialEndsAt = subscription.trial_ends_at || '';
  const daysLeft = getDaysUntil(dueDate || trialEndsAt);
  const expiredByDate = daysLeft !== null && daysLeft < 0;

  if (status === 'pendente') return 'pendente';

  if (
    status === 'expirado' ||
    status === 'cancelado' ||
    (status === 'teste' && expiredByDate)
  ) {
    return 'expirado';
  }

  if (status === 'teste' || status === 'ativo') return '';

  return 'sem-assinatura';
}

export function SupplierSubscriptionGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    async function checkSupplierSubscription() {
      try {
        setChecking(true);
        setAllowed(false);

        const allowedPaths = [
          '/painel-fornecedor/planos',
          '/painel-fornecedor/pendente',
        ];

        const isAllowedPath = allowedPaths.some((path) =>
          pathname?.startsWith(path)
        );

        if (isAllowedPath) {
          setAllowed(true);
          return;
        }

        const { data: userData } = await supabase.auth.getUser();
        const user = userData.user;

        if (!user) {
          router.replace('/login?redirect=/painel-fornecedor');
          return;
        }

        const { data: supplierData, error: supplierError } = await supabase
          .from('suppliers')
          .select('id,owner_id')
          .eq('owner_id', user.id)
          .limit(1)
          .maybeSingle();

        if (supplierError) {
          console.error('Erro ao verificar fornecedor:', supplierError);
          setAllowed(true);
          return;
        }

        if (!supplierData?.id) {
          setAllowed(true);
          return;
        }

        const { data: subscriptionData, error: subscriptionError } =
          await supabase
            .from('supplier_subscriptions')
            .select('*')
            .eq('supplier_id', supplierData.id)
            .order('created_at', { ascending: false })
            .limit(1);

        if (subscriptionError) {
          console.error('Erro ao verificar assinatura:', subscriptionError);
          setAllowed(true);
          return;
        }

        const subscription = subscriptionData?.[0] || null;
        const blockReason = getBlockReason(subscription);

        if (blockReason) {
          router.replace(`/painel-fornecedor/pendente?motivo=${blockReason}`);
          return;
        }

        setAllowed(true);
      } catch (error) {
        console.error('Erro ao validar acesso do fornecedor:', error);
        setAllowed(true);
      } finally {
        setChecking(false);
      }
    }

    checkSupplierSubscription();
  }, [pathname, router]);

  if (checking || !allowed) {
    return (
      <main className="min-h-screen bg-black text-[#151515]">
        <div className="mx-auto flex min-h-screen w-full max-w-[430px] items-center justify-center bg-[#fbf7f1] px-6 text-center shadow-2xl">
          <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-[#f1e7cf]">
            <Camera size={42} className="mx-auto text-[#d99200]" />
            <h1 className="mt-4 text-xl font-extrabold">
              Verificando assinatura
            </h1>
            <p className="mt-2 text-sm font-bold text-gray-500">
              Aguarde um instante...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
