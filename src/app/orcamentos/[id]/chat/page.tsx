'use client';

import { useEffect, useState } from 'react';
import { getQuote, listMessages, sendMessage, subscribeMessages } from '@/lib/chat';
import { supabase } from '@/lib/supabase';

export default function ChatPage({ params }: { params: { id: string } }) {
  const quoteId = params.id;
  const [quote, setQuote] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<string | undefined>();
  const [text, setText] = useState('');

  async function load() {
    setQuote(await getQuote(quoteId));
    setMessages(await listMessages(quoteId));
    setCurrentUser((await supabase.auth.getUser()).data.user?.id);
  }

  useEffect(() => {
    load();
    const unsub = subscribeMessages(quoteId, load);
    return () => { unsub(); };
  }, [quoteId]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    await sendMessage(quoteId, text);
    setText('');
    await load();
  }

  return (
    <main className="reim-shell flex min-h-screen flex-col bg-reimBg">
      <header className="bg-reimBlack p-5 text-white">
        <p className="text-xs text-reimGoldLight">Orçamento</p>
        <h1 className="font-serif text-2xl">{quote?.suppliers?.business_name ?? 'Chat'}</h1>
      </header>
      <section className="flex-1 space-y-3 p-5">
        {messages.map(m => (
          <div key={m.id} className={`max-w-[80%] rounded-3xl p-4 text-sm ${m.sender_id === currentUser ? 'ml-auto bg-reimBlack text-white' : 'bg-white border border-reimBorder'}`}>
            {m.message}
          </div>
        ))}
      </section>
      <form onSubmit={send} className="flex gap-2 border-t border-reimBorder bg-white p-4">
        <input className="flex-1 rounded-2xl border border-reimBorder p-3" value={text} onChange={e=>setText(e.target.value)} placeholder="Digite sua mensagem..." />
        <button className="rounded-2xl bg-reimGold px-5 font-bold text-white">Enviar</button>
      </form>
    </main>
  );
}
