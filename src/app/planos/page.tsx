'use client';

import { useEffect, useState } from 'react';
import { listPlans, simulatePlanActivation } from '@/lib/payments';
import { useRouter } from 'next/navigation';

export default function PlanosPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => { listPlans().then(setPlans); }, []);

  async function activate(id: string) {
    await simulatePlanActivation(id);
    router.push('/pagamento/sucesso');
  }

  return (
    <main className="reim-shell p-6">
      <h1 className="font-serif text-3xl">Planos REIM</h1>
      <section className="mt-6 space-y-4">
        {plans.map(plan => (
          <div key={plan.id} className="rounded-[2rem] border border-reimBorder bg-white p-6">
            <h2 className="font-serif text-2xl">{plan.name}</h2>
            <p className="mt-2 text-sm text-gray-500">{plan.description}</p>
            <p className="mt-5 text-3xl font-bold">{(plan.price_cents/100).toLocaleString('pt-BR', { style:'currency', currency:'BRL' })}</p>
            <p className="mt-2 text-xs text-gray-500">Reajuste anual mediante aviso prévio.</p>
            <button onClick={()=>activate(plan.id)} className="mt-5 w-full rounded-2xl bg-reimGold py-4 font-bold text-white">Assinar / Simular aprovação</button>
          </div>
        ))}
      </section>
    </main>
  );
}
