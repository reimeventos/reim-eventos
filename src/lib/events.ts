import { supabase } from './supabase';

export async function createEvent(input: { eventName: string; eventDate?: string; city?: string; guestCount?: number }) {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error('Login necessário');
  const { data, error } = await supabase.from('events').insert({
    client_id: user.id,
    event_name: input.eventName,
    event_date: input.eventDate,
    city: input.city,
    guest_count: input.guestCount,
    state: 'BA'
  }).select().single();
  if (error) throw error;
  return data;
}

export async function getMyEvents() {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return [];
  const { data, error } = await supabase.from('events').select('*, event_items(*, suppliers(*))').eq('client_id', user.id).order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}
