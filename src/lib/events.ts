import { supabase } from './supabase';

type EventPayload = {
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
};

function normalizeCity(value?: string) {
  const city = String(value || '').trim();

  return city || 'Eunápolis';
}

function isMissingColumnError(error: any, columnName: string) {
  const message = String(error?.message || '').toLowerCase();
  const details = String(error?.details || '').toLowerCase();
  const hint = String(error?.hint || '').toLowerCase();
  const column = columnName.toLowerCase();

  return (
    error?.code === 'PGRST204' ||
    message.includes(`'${column}'`) ||
    message.includes(`"${column}"`) ||
    message.includes(column) ||
    details.includes(column) ||
    hint.includes(column)
  );
}

async function saveEventWithFallback({
  currentEventId,
  dataToSave,
}: {
  currentEventId?: string;
  dataToSave: any;
}) {
  const savePayload = async (payload: any) => {
    if (currentEventId) {
      return supabase
        .from('events')
        .update(payload)
        .eq('id', currentEventId)
        .select()
        .single();
    }

    return supabase.from('events').insert([payload]).select().single();
  };

  let { data, error } = await savePayload(dataToSave);

  if (!error) {
    return data;
  }

  const canRetryWithoutCity = dataToSave.city && isMissingColumnError(error, 'city');

  if (canRetryWithoutCity) {
    console.warn(
      'Campo city não encontrado na tabela events. Tentando salvar apenas event_city.'
    );

    const { city, ...payloadWithoutCity } = dataToSave;

    const retry = await savePayload(payloadWithoutCity);

    if (!retry.error) {
      return retry.data;
    }

    error = retry.error;
  }

  const canRetryWithoutEventCity =
    dataToSave.event_city && isMissingColumnError(error, 'event_city');

  if (canRetryWithoutEventCity) {
    console.warn(
      'Campo event_city não encontrado na tabela events. Tentando salvar apenas city.'
    );

    const { event_city, ...payloadWithoutEventCity } = dataToSave;

    const retry = await savePayload(payloadWithoutEventCity);

    if (!retry.error) {
      return retry.data;
    }

    error = retry.error;
  }

  throw error;
}

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

export async function createOrUpdateMyEvent(payload: EventPayload) {
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
  const eventCity = normalizeCity(payload.event_city || payload.city);
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

  try {
    return await saveEventWithFallback({
      currentEventId: currentEvent?.id,
      dataToSave,
    });
  } catch (error) {
    console.error(
      currentEvent?.id ? 'Erro ao atualizar evento:' : 'Erro ao criar evento:',
      error
    );
    throw error;
  }
}

export async function updateMyEvent(payload: EventPayload) {
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
