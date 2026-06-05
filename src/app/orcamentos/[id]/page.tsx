'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  Download,
  FileText,
  MessageCircle,
  RefreshCcw,
  Send,
} from 'lucide-react';
import { getQuoteResponseByRequestId } from '@/lib/suppliers';

export default function OrcamentoRecebidoPage() {
  const params = useParams();
  const requestId = String(params.id || '');

  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!requestId) return;

    getQuoteResponseByRequestId(requestId)
      .then((data) => {
        setQuote(data);
      })
      .catch((error) => {
        console.error('Erro ao carregar orçamento:', error);
        setErrorMessage('Orçamento ainda não encontrado ou não respondido pelo fornecedor.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [requestId]);

  function formatDateTime(date?: string) {
    if (!date) return 'Data não informada';

    const formatted = new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    return formatted;
  }

  const supplierName = quote?.suppliers?.business_name || 'Fornecedor';
  const supplierCity = quote?.suppliers?.city || 'Cidade não informada';
  const supplierCategory =
    quote?.suppliers?.categories?.name || 'Fornecedor de eventos';

  return (
    <main className="min-h-screen bg-black text-[#151515]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#fbf7f1] pb-10 shadow-2xl">
        <section className="relative overflow-hidden rounded-b-[34px] bg-black px-6 pb-8 pt-7 text-white">
          <div className="absolute inset-0 bg-[url('/layout01-fundo.png')] bg-cover bg-center opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/85 to-black" />

          <div className="relative z-10">
            <Link
              href="/orcamentos"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#e3a925]"
            >
              <ArrowLeft size={17} />
              Voltar
            </Link>

            <h1 className="mt-5 font-serif text-[34px] leading-tight">
              Orçamento recebido
            </h1>

            <p className="mt-2 text-sm text-white/70">
              Veja a proposta enviada pelo fornecedor.
            </p>
          </div>
        </section>

        <section className="px-6 pt-6">
          {loading && (
            <div className="rounded-[28px] bg-white p-6 text-center shadow-sm ring-1 ring-[#f1e7cf]">
              <p className="text-sm font-bold text-gray-500">
                Carregando orçamento...
              </p>
            </div>
          )}

          {!loading && errorMessage && (
            <div className="rounded-[28px] bg-white p-6 text-center shadow-sm ring-1 ring-[#f1e7cf]">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#fff7e8] text-[#d99200]">
                <FileText size={32} />
              </div>

              <h2 className="mt-4 text-lg font-extrabold">
                Orçamento não disponível
              </h2>

              <p className="mt-2 text-sm leading-5 text-gray-500">
                {errorMessage}
              </p>

              <Link
                href="/buscar"
                className="mt-5 flex items-center justify-center gap-2 rounded-[22px] bg-[#e3a925] py-4 text-center font-extrabold text-white shadow-lg"
              >
                Buscar fornecedores
              </Link>
            </div>
          )}

          {!loading && quote && (
            <>
              <div className="rounded-[28px] bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,.08)]">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff7e8] text-[#d99200]">
                    <Building2 size={30} />
                  </div>

                  <div>
                    <p className="text-xs font-bold text-gray-500">
                      Fornecedor
                    </p>
                    <h2 className="text-lg font-extrabold">{supplierName}</h2>
                    <p className="text-sm text-gray-500">{supplierCategory}</p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl bg-[#fbf7f1] p-3">
                  <p className="text-xs font-bold text-gray-500">Cidade</p>
                  <p className="mt-1 text-sm font-extrabold">{supplierCity}</p>
                </div>
              </div>

              <div className="mt-5 rounded-[28px] bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,.08)]">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-extrabold">Proposta</h2>

                  <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-extrabold text-green-700">
                    Respondido
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="rounded-2xl bg-[#fbf7f1] p-3">
                    <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                      <FileText size={14} className="text-[#d99200]" />
                      Serviço oferecido
                    </p>
                    <p className="mt-1 text-sm font-extrabold">
                      {quote.service_offered || 'Não informado'}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#fbf7f1] p-3">
                    <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                      <CalendarDays size={14} className="text-[#d99200]" />
                      Duração / período
                    </p>
                    <p className="mt-1 text-sm font-extrabold">
                      {quote.duration_period || 'Não informado'}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#fff7e8] p-4">
                    <p className="text-xs font-bold text-[#b97900]">
                      Valor da proposta
                    </p>
                    <p className="mt-1 text-2xl font-extrabold text-[#151515]">
                      {quote.proposal_value || 'Valor não informado'}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#fbf7f1] p-3">
                    <p className="text-xs font-bold text-gray-500">
                      Forma de pagamento
                    </p>
                    <p className="mt-1 text-sm font-extrabold">
                      {quote.payment_terms || 'Não informado'}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#fbf7f1] p-3">
                    <p className="text-xs font-bold text-gray-500">
                      Validade da proposta
                    </p>
                    <p className="mt-1 text-sm font-extrabold">
                      {quote.proposal_validity || 'Não informado'}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#fbf7f1] p-3">
                    <p className="text-xs font-bold text-gray-500">
                      Observações
                    </p>
                    <p className="mt-2 text-sm leading-5 text-gray-600">
                      {quote.observations || 'Sem observações adicionais.'}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#fbf7f1] p-3">
                    <p className="text-xs font-bold text-gray-500">
                      Enviado em
                    </p>
                    <p className="mt-1 text-sm font-extrabold">
                      {formatDateTime(quote.created_at)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <button className="flex w-full items-center justify-center gap-2 rounded-[24px] bg-[#e3a925] py-4 text-center font-extrabold text-white shadow-lg">
                  <CheckCircle2 size={21} />
                  Aceitar orçamento
                </button>

                <button className="flex w-full items-center justify-center gap-2 rounded-[24px] bg-white py-4 text-center font-extrabold text-[#151515] shadow-sm ring-1 ring-[#f1e7cf]">
                  <RefreshCcw size={21} />
                  Solicitar ajuste
                </button>

                <Link
                  href={`/orcamentos/${requestId}/chat`}
                  className="flex w-full items-center justify-center gap-2 rounded-[24px] bg-black py-4 text-center font-extrabold text-white shadow-lg"
                >
                  <MessageCircle size={21} />
                  Conversar com fornecedor
                </Link>

                <button className="flex w-full items-center justify-center gap-2 rounded-[24px] bg-white py-4 text-center font-extrabold text-[#151515] shadow-sm ring-1 ring-[#f1e7cf]">
                  <Download size={21} />
                  Baixar PDF
                </button>
              </div>

              <p className="mt-4 text-center text-xs leading-5 text-gray-500">
                Você pode aceitar, pedir ajuste ou conversar com o fornecedor antes de fechar.
              </p>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
