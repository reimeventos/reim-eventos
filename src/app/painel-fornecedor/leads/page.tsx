'use client';

import { useEffect, useState } from 'react';
import { getSupplierLeads } from '@/lib/suppliers';
import Link from 'next/link';

export default function LeadsFornecedorPage() {
  const [leads, setLeads] = useState<any[]>([]);

  useEffect(() => { getSupplierLeads().then(setLeads); }, []);

  return (
    <main className="reim-shell p-6">
      <h1 className="font-serif text-3xl">Leads recebidos</h1>
      <section className="mt-6 space-y-4">
        {leads.length === 0 && <div className="rounded-3xl border border-reimBorder bg-white p-6 text-gray-500">Nenhum lead recebido ainda.</div>}
        {leads.map(lead => (
          <div key={lead.id} className="rounded-3xl border border-reimBorder bg-white p-5">
            <b>{lead.events?.event_name}</b>
            <p className="mt-1 text-sm text-gray-500">{lead.events?.city} • {lead.events?.event_date}</p>
            <p className="mt-3 text-sm">{lead.message}</p>
            <Link className="mt-4 block rounded-2xl bg-reimBlack py-3 text-center font-bold text-white" href={`/orcamentos/${lead.id}/chat`}>Responder no chat</Link>
          </div>
        ))}
      </section>
    </main>
  );
}
