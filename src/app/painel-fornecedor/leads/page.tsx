'use client';

import { useEffect, useState } from 'react';
import { getSupplierLeads } from '@/lib/suppliers';
import Link from 'next/link';
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  MapPin,
  MessageCircle,
  Users,
  Building2,
  FileText,
  Phone,
  User,
  PartyPopper,
  Camera,
} from 'lucide-react';

export default function LeadsFornecedorPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSupplierLeads()
      .then((data) => {
        setLeads(data || []);
      })
      .catch((error) => {
        console.error('Erro ao carregar leads:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  function formatDate(date?: string) {
    if (!date) return 'Data não informada';

    const [year, month, day] = date.split('-');

    if (!year || !month || !day) {
      return date;
    }

    return `${day}/${month}/${year}`;
  }

  return (
    <main className="min-h-screen bg-black text-[#151515]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#fbf7f1] pb-10 shadow-2xl">
        <section className="relative overflow-hidden rounded-b-[34px] bg-black px-6 pb-8 pt-7 text-white">
          <div className="absolute inset-0 bg-[url('/layout01-fundo.png')] bg-cover bg-center opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/85 to-black" />

          <div className="relative z-10">
            <Link
              href="/painel-fornecedor"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#e3a925]"
            >
              <ArrowLeft size={17} />
              Voltar
            </Link>

            <h1 className="mt-5 font-serif text-[34px] leading-tight">
              Leads recebidos
            </h1>

            <p className="mt-2 text-sm text-white/70">
              Pedidos de orçamento enviados pelos clientes.
            </p>
          </div>
        </section>

        <section className="grid grid-cols-3 gap-3 px-6 pt-6">
          <div className="rounded-[22px] bg-white p-4 text-center shadow-sm ring-1 ring-[#f1e7cf]">
            <p className="text-2xl font-extrabold text-[#d99200]">
              {leads.length}
            </p>
            <p className="mt-1 text-[11px] font-bold text-gray-600">
              Recebidos
            </p>
          </div>

          <div className="rounded-[22px] bg-white p-4 text-center shadow-sm ring-1 ring-[#f1e7cf]">
            <p className="text-2xl font-extrabold text-blue-600">
              {leads.filter((lead) => lead.status === 'respondido').length}
            </p>
            <p className="mt-1 text-[11px] font-bold text-gray-600">
              Respondidos
            </p>
          </div>

          <div className="rounded-[22px] bg-white p-4 text-center shadow-sm ring-1 ring-[#f1e7cf]">
            <p className="text-2xl font-extrabold text-green-600">
              {leads.filter((lead) => lead.status === 'fechado').length}
            </p>
            <p className="mt-1 text-[11px] font-bold text-gray-600">
              Fechados
            </p>
          </div>
        </section>

        <section className="px-6 pt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-extrabold">Solicitações</h2>

            <span className="rounded-full bg-[#fff7e8] px-3 py-1 text-xs font-extrabold text-[#b97900]">
              {loading ? 'Carregando...' : `${leads.length} lead(s)`}
            </span>
          </div>

          {loading && (
            <div className="rounded-[28px] bg-white p-6 text-center shadow-sm ring-1 ring-[#f1e7cf]">
              <p className="text-sm font-bold text-gray-500">
                Carregando leads...
              </p>
            </div>
          )}

          {!loading && leads.length === 0 && (
            <div className="rounded-[28px] bg-white p-6 text-center shadow-sm ring-1 ring-[#f1e7cf]">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#fff7e8] text-[#d99200]">
                <MessageCircle size={32} />
              </div>

              <h3 className="mt-4 text-lg font-extrabold">
                Nenhum lead recebido ainda
              </h3>

              <p className="mt-2 text-sm leading-5 text-gray-500">
                Quando uma noiva solicitar orçamento, o pedido aparecerá aqui.
              </p>
            </div>
          )}

          <div className="space-y-4">
            {leads.map((lead) => {
              const clientName = lead.customer_name || 'Cliente não informado';
              const phone = lead.customer_whatsapp || 'WhatsApp não informado';
              const eventType = lead.event_type || 'Evento não informado';
              const serviceNeeded = lead.service_needed || 'Serviço não informado';
              const city = lead.event_city || 'Cidade não informada';
              const eventDate = formatDate(lead.event_date);
              const eventSpace = lead.event_space || 'Não informado';
              const guests = lead.guests_count || 'Não informado';
              const notes = lead.notes || 'Cliente não informou mensagem.';
              const status = lead.status || 'aguardando_resposta';

              return (
                <div
                  key={lead.id}
                  className="rounded-[28px] bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,.08)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-extrabold">{eventType}</h3>

                      <p className="mt-1 flex items-center gap-1 text-sm font-bold text-gray-500">
                        <MapPin size={15} className="text-[#d99200]" />
                        {city}
                      </p>
                    </div>

                    <span className="flex items-center gap-1 rounded-full bg-[#fff7e8] px-3 py-1 text-[11px] font-extrabold text-[#b97900]">
                      <Clock size={13} />
                      {status === 'aguardando_resposta' ? 'Novo' : status}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-[#fbf7f1] p-3">
                      <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                        <User size={14} className="text-[#d99200]" />
                        Cliente
                      </p>
                      <p className="mt-1 text-sm font-extrabold">
                        {clientName}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#fbf7f1] p-3">
                      <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                        <Phone size={14} className="text-[#d99200]" />
                        WhatsApp
                      </p>
                      <p className="mt-1 text-sm font-extrabold">{phone}</p>
                    </div>

                    <div className="rounded-2xl bg-[#fbf7f1] p-3">
                      <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                        <CalendarDays size={14} className="text-[#d99200]" />
                        Data
                      </p>
                      <p className="mt-1 text-sm font-extrabold">{eventDate}</p>
                    </div>

                    <div className="rounded-2xl bg-[#fbf7f1] p-3">
                      <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                        <Users size={14} className="text-[#d99200]" />
                        Convidados
                      </p>
                      <p className="mt-1 text-sm font-extrabold">{guests}</p>
                    </div>
                  </div>

                  <div className="mt-3 rounded-2xl bg-[#fbf7f1] p-3">
                    <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                      <Camera size={14} className="text-[#d99200]" />
                      Serviço desejado
                    </p>
                    <p className="mt-1 text-sm font-extrabold">
                      {serviceNeeded}
                    </p>
                  </div>

                  <div className="mt-3 rounded-2xl bg-[#fbf7f1] p-3">
                    <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                      <Building2 size={14} className="text-[#d99200]" />
                      {serviceNeeded === 'Espaço de festa'
                        ? 'Preferência de estrutura'
                        : 'Espaço do evento'}
                    </p>
                    <p className="mt-1 text-sm font-extrabold">
                      {eventSpace}
                    </p>
                  </div>

                  <div className="mt-3 rounded-2xl bg-[#fbf7f1] p-3">
                    <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                      <PartyPopper size={14} className="text-[#d99200]" />
                      Tipo de evento
                    </p>
                    <p className="mt-1 text-sm font-extrabold">
                      {eventType}
                    </p>
                  </div>

                  <div className="mt-4">
                    <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                      <MessageCircle size={14} className="text-[#d99200]" />
                      Mensagem
                    </p>

                    <p className="mt-2 text-sm leading-5 text-gray-600">
                      {notes}
                    </p>
                  </div>

                  <div className="mt-5 space-y-3">
                    <Link
                      href={`/painel-fornecedor/leads/${lead.id}/responder`}
                      className="flex items-center justify-center gap-2 rounded-[22px] bg-[#e3a925] py-4 text-center font-extrabold text-white shadow-lg"
                    >
                      <FileText size={21} />
                      Responder orçamento
                    </Link>

                    <div className="grid grid-cols-2 gap-3">
                      <Link
                        href={`/orcamentos/${lead.id}/chat`}
                        className="flex items-center justify-center gap-2 rounded-[20px] bg-black py-3 text-center text-sm font-extrabold text-white"
                      >
                        <MessageCircle size={18} />
                        Chat
                      </Link>

                      <button className="flex items-center justify-center gap-2 rounded-[20px] bg-[#fbf7f1] py-3 text-center text-sm font-extrabold text-[#151515] ring-1 ring-[#f1e7cf]">
                        <CheckCircle2 size={18} className="text-green-600" />
                        Marcar visto
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
