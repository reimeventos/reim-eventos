import { supabase } from './supabase';

export async function getMyEvent() {
  const user = (await supabase.auth.getUser()).data.user;

  if (!user) {
    throw new Error('Login necessário.');
  }

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .or(`client_id.eq.${user.id},customer_id.eq.${user.id}`)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Erro ao buscar evento:', error);
    throw error;
  }

  return data;
}

export async function getMyEvents() {
  const user = (await supabase.auth.getUser()).data.user;

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('events')
    .select('*, event_items(*, suppliers(*))')
    .or(`client_id.eq.${user.id},customer_id.eq.${user.id}`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar eventos:', error);
    throw error;
  }

  return data ?? [];
}

export async function createOrUpdateMyEvent(payload: {
  title?: string;
  event_name?: string;
  eventName?: string;
  event_type?: string;
  couple_name?: string;
  event_date?: string;
  eventDate?: string;
  event_city?: string;
  city?: string;
  guests_count?: number | null;
  guestCount?: number | null;
  event_space?: string;
  notes?: string;
}) {
  const user = (await supabase.auth.getUser()).data.user;

  if (!user) {
    throw new Error('Login necessário.');
  }

  const currentEvent = await getMyEvent();

  const eventName =
    payload.event_name ||
    payload.eventName ||
    payload.couple_name ||
    payload.title ||
    'Meu Evento';

  const eventDate = payload.event_date || payload.eventDate || null;
  const eventCity = payload.event_city || payload.city || 'Eunápolis';
  const guestsCount =
    payload.guests_count !== undefined
      ? payload.guests_count
      : payload.guestCount !== undefined
        ? payload.guestCount
        : null;

  const dataToSave = {
    client_id: user.id,
    customer_id: user.id,

    event_name: eventName,
    title: payload.title || 'Meu Evento',
    event_type: payload.event_type || 'Casamento',
    couple_name: payload.couple_name || null,

    event_date: eventDate,

    city: eventCity,
    event_city: eventCity,
    state: 'BA',

    guest_count: guestsCount,
    guests_count: guestsCount,

    event_space: payload.event_space || null,
    notes: payload.notes || null,
    updated_at: new Date().toISOString(),
  };

  if (currentEvent?.id) {
    const { data, error } = await supabase
      .from('events')
      .update(dataToSave)
      .eq('id', currentEvent.id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar evento:', error);
      throw error;
    }

    return data;
  }

  const { data, error } = await supabase
    .from('events')
    .insert([dataToSave])
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar evento:', error);
    throw error;
  }

  return data;
}

export async function updateMyEvent(payload: {
  title?: string;
  event_name?: string;
  eventName?: string;
  event_type?: string;
  couple_name?: string;
  event_date?: string;
  eventDate?: string;
  event_city?: string;
  city?: string;
  guests_count?: number | null;
  guestCount?: number | null;
  event_space?: string;
  notes?: string;
}) {
  return createOrUpdateMyEvent(payload);
}

export async function createEvent(input: {
  eventName: string;
  eventDate?: string;
  city?: string;
  guestCount?: number;
}) {
  return createOrUpdateMyEvent({
    eventName: input.eventName,
    eventDate: input.eventDate,
    city: input.city,
    guestCount: input.guestCount,
  });
}
