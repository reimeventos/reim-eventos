'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  MessageCircle,
  Send,
  User,
  Building2,
} from 'lucide-react';
import {
  listQuoteMessages,
  markMessagesAsRead,
  sendQuoteMessage,
} from '@/lib/chat';
import { getQuoteResponseByRequestId } from '@/lib/suppliers';
import { supabase } from '@/lib/supabase';

export default function ChatOrcamentoPage() {
  const params = useParams();
  const requestId = String(params.id || '');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [quote, setQuote] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [senderType, setSenderType] = useState<'cliente' | 'fornecedor'>('cliente');
  const [senderName, setSenderName] = useState('Cliente');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!requestId) return;

    async function loadChat() {
      try {
        setLoading(true);

        const [quoteData, messagesData] = await Promise.all([
          getQuoteResponseByRequestId(requestId),
          listQuoteMessages(requestId),
        ]);

        setQuote(quoteData);
        setMessages(messagesData);

        const user = (await supabase.auth.getUser()).data.user;

        let detectedSenderType: 'cliente' | 'fornecedor' = 'cliente';
        let detectedSenderName = 'Cliente';

        if (user && quoteData?.supplier_id) {
          const { data: supplierOwner } = await supabase
            .from('suppliers')
            .select('id, business_name')
            .eq('id', quoteData.supplier_id)
            .eq('owner_id', user.id)
            .maybeSingle();

          if (supplierOwner) {
            detectedSenderType = 'fornecedor';
            detectedSenderName =
              supplierOwner.business_name ||
              quoteData?.suppliers?.business_name ||
              'Fornecedor';
          }
        }

        setSenderType(detectedSenderType);
        setSenderName(detectedSenderName);

        await markMessagesAsRead({
          quote_request_id: requestId,
          reader_type: detectedSenderType,
        });

        const updatedMessages = await listQuoteMessages(requestId);
        setMessages(updatedMessages);
      } catch (error) {
        console.error(error);
        setErrorMessage('Não foi possível carregar o chat.');
      } finally {
        setLoading(false);
      }
    }

    loadChat();
  }, [requestId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage('');

    if (!message.trim()) {
      return;
    }

    try {
      setSending(true);

      await sendQuoteMessage({
        quote_request_id: requestId,
        supplier_id: quote?.supplier_id || null,
        sender_type: senderType,
        sender_name: senderName,
        message: message.trim(),
      });

      setMessage('');

      const updatedMessages = await listQuoteMessages(requestId);
      setMessages(updatedMessages);
    } catch (error) {
      console.error(error);
      setErrorMessage('Não foi possível enviar a mensagem.');
    } finally {
      setSending(false);
    }
  }

  const supplierName = quote?.suppliers?.business_name || 'Fornecedor';
  const supplierCategory =
    quote?.suppliers?.categories?.name || 'Fornecedor de eventos';

  const isSupplierMode = senderType === 'fornecedor';

  return (
    <main className="min-h-screen bg-black text-[#151515]">
      <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col overflow-hidden bg-[#fbf7f1] shadow-2xl">
        <section className="relative overflow-hidden rounded-b-[34px] bg-black px-6 pb-6 pt-7 text-white">
          <div className="absolute inset-0 bg-[url('/layout01-fundo.png')] bg-cover bg-center opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/85 to-black" />

          <div className="relative z-10">
            <Link
              href={isSupplierMode ? '/painel-fornecedor/leads' : `/orcamentos/${requestId}`}
              className="inline-flex items-center gap-2 text-sm font-bold text-[#e3a925]"
            >
              <ArrowLeft size={17} />
              Voltar
            </Link>

            <h1 className="mt-5 font-serif text-[32px] leading-tight">
              Chat do orçamento
            </h1>

            <p className="mt-2 text-sm text-white/70">
              Converse sobre detalhes da proposta.
            </p>
          </div>
        </section>

        <section className="px-6 pt-5">
          <div className="rounded-[26px] bg-white p-4 shadow-[0_10px_25px_rgba(0,0,0,.08)]">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff7e8] text-[#d99200]">
                <Building2 size={26} />
              </div>

              <div>
                <p className="text-xs font-bold text-gray-500">Fornecedor</p>
                <h2 className="text-base font-extrabold">{supplierName}</h2>
                <p className="text-xs text-gray-500">{supplierCategory}</p>
              </div>
            </div>
          </div>

          <div
            className={
              isSupplierMode
                ? 'mt-3 rounded-2xl bg-[#fff7e8] px-4 py-3 text-xs font-extrabold text-[#9a6a00] ring-1 ring-[#e3a925]/30'
                : 'mt-3 rounded-2xl bg-white px-4 py-3 text-xs font-extrabold text-gray-600 ring-1 ring-[#f1e7cf]'
            }
          >
            Você está respondendo como: {isSupplierMode ? 'Fornecedor' : 'Cliente'}
          </div>
        </section>

        <section className="flex-1 px-6 py-5">
          {loading && (
            <div className="rounded-[24px] bg-white p-5 text-center text-sm font-bold text-gray-500">
              Carregando mensagens...
            </div>
          )}

          {!loading && errorMessage && (
            <div className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {errorMessage}
            </div>
          )}

          {!loading && messages.length === 0 && (
            <div className="rounded-[28px] bg-white p-6 text-center shadow-sm ring-1 ring-[#f1e7cf]">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#fff7e8] text-[#d99200]">
                <MessageCircle size={34} />
              </div>

              <h2 className="mt-4 text-lg font-extrabold">
                Nenhuma mensagem ainda
              </h2>

              <p className="mt-2 text-sm leading-5 text-gray-500">
                Envie uma mensagem para combinar detalhes do orçamento.
              </p>
            </div>
          )}

          <div className="space-y-3">
            {messages.map((item) => {
              const isSupplier = item.sender_type === 'fornecedor';

              return (
                <div
                  key={item.id}
                  className={`flex ${isSupplier ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={
                      isSupplier
                        ? 'max-w-[82%] rounded-3xl rounded-tl-md bg-white px-4 py-3 shadow-sm ring-1 ring-[#f1e7cf]'
                        : 'max-w-[82%] rounded-3xl rounded-tr-md bg-[#e3a925] px-4 py-3 text-white shadow-sm'
                    }
                  >
                    <div className="mb-1 flex items-center gap-1 text-[11px] font-extrabold opacity-80">
                      {isSupplier ? <Building2 size={12} /> : <User size={12} />}
                      {item.sender_name || (isSupplier ? 'Fornecedor' : 'Cliente')}
                    </div>

                    <p className="text-sm leading-5">{item.message}</p>

                    <p className="mt-2 text-[10px] opacity-70">
                      {new Date(item.created_at).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>
        </section>

        <section className="border-t border-[#f1e7cf] bg-white px-5 py-4">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="min-w-0 flex-1 rounded-[22px] bg-[#fbf7f1] px-4 py-4 text-sm font-medium outline-none ring-1 ring-[#f1e7cf] placeholder:text-gray-400"
              placeholder={
                isSupplierMode
                  ? 'Responder como fornecedor...'
                  : 'Digite sua mensagem...'
              }
            />

            <button
              type="submit"
              disabled={sending}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e3a925] text-white shadow-lg disabled:opacity-60"
            >
              <Send size={21} />
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
