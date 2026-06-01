import { supabase } from './supabase';

export async function getQuote(quoteId: string) {
  const { data, error } = await supabase
    .from('quotes')
    .select('*, events(event_name, event_date, city), suppliers(business_name), profiles(full_name)')
    .eq('id', quoteId)
    .single();
  if (error) throw error;
  return data;
}

export async function sendMessage(quoteId: string, message: string) {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error('Login necessário');
  const { data, error } = await supabase.from('messages').insert({ quote_id: quoteId, sender_id: user.id, message }).select().single();
  if (error) throw error;
  return data;
}

export async function listMessages(quoteId: string) {
  const { data, error } = await supabase.from('messages').select('*').eq('quote_id', quoteId).order('created_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export function subscribeMessages(quoteId: string, callback: () => void) {
  const channel = supabase
    .channel(`quote-${quoteId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `quote_id=eq.${quoteId}` }, callback)
    .subscribe();
  return () => supabase.removeChannel(channel);
}
