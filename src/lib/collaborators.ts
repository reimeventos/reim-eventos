import { supabase } from './supabase';
import { getMyEvent } from './events';

export async function listEventCollaborators() {
  const event = await getMyEvent();

  if (!event?.id) {
    return [];
  }

  const { data, error } = await supabase
    .from('event_collaborators')
    .select('*')
    .eq('event_id', event.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao listar colaboradores:', error);
    throw error;
  }

  return data ?? [];
}

export async function inviteEventCollaborator(input: {
  collaborator_email: string;
  collaborator_name?: string;
  role?: string;
}) {
  const user = (await supabase.auth.getUser()).data.user;

  if (!user) {
    throw new Error('Login necessário.');
  }

  const event = await getMyEvent();

  if (!event?.id) {
    throw new Error('Evento não encontrado.');
  }

  const email = input.collaborator_email.trim().toLowerCase();

  if (!email) {
    throw new Error('Informe o e-mail da cerimonialista.');
  }

  const ownerEmail = user.email || '';

  const { data, error } = await supabase
    .from('event_collaborators')
    .upsert(
      {
        event_id: event.id,
        owner_id: user.id,
        owner_email: ownerEmail,
        owner_name: event.couple_name || event.event_name || event.title || 'Cliente',
        collaborator_email: email,
        collaborator_name: input.collaborator_name?.trim() || null,
        role: input.role || 'cerimonialista',
        status: 'pendente',
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'event_id,collaborator_email',
      }
    )
    .select()
    .single();

  if (error) {
    console.error('Erro ao convidar colaborador:', error);
    throw error;
  }

  return data;
}

export async function removeEventCollaborator(collaboratorId: string) {
  const { error } = await supabase
    .from('event_collaborators')
    .delete()
    .eq('id', collaboratorId);

  if (error) {
    console.error('Erro ao remover colaborador:', error);
    throw error;
  }

  return true;
}

export async function listMyCollaborationInvites() {
  const user = (await supabase.auth.getUser()).data.user;

  if (!user?.email) {
    return [];
  }

  const { data, error } = await supabase
    .from('event_collaborators')
    .select(`
      *,
      events(
        id,
        event_name,
        title,
        event_type,
        couple_name,
        event_date,
        city,
        event_city,
        guest_count,
        guests_count,
        event_space,
        notes
      )
    `)
    .ilike('collaborator_email', user.email)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao listar convites:', error);
    throw error;
  }

  return data ?? [];
}

export async function acceptEventCollaboration(collaboratorId: string) {
  const { data, error } = await supabase
    .from('event_collaborators')
    .update({
      status: 'aceito',
      updated_at: new Date().toISOString(),
    })
    .eq('id', collaboratorId)
    .select()
    .single();

  if (error) {
    console.error('Erro ao aceitar colaboração:', error);
    throw error;
  }

  return data;
}

export async function declineEventCollaboration(collaboratorId: string) {
  const { data, error } = await supabase
    .from('event_collaborators')
    .update({
      status: 'recusado',
      updated_at: new Date().toISOString(),
    })
    .eq('id', collaboratorId)
    .select()
    .single();

  if (error) {
    console.error('Erro ao recusar colaboração:', error);
    throw error;
  }

  return data;
}
