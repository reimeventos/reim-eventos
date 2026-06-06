import { supabase } from './supabase';

export async function listQuoteMessages(quoteRequestId: string) {
  const { data, error } = await supabase
    .from('quote_messages')
    .select('*')
    .eq('quote_request_id', quoteRequestId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Erro ao buscar mensagens:', error);
    throw error;
  }

  return data ?? [];
}

export async function sendQuoteMessage(data: {
  quote_request_id: string;
  supplier_id?: string | null;
  sender_type: 'cliente' | 'fornecedor';
  sender_name?: string;
  message: string;
}) {
  const { error } = await supabase.from('quote_messages').insert([
    {
      quote_request_id: data.quote_request_id,
      supplier_id: data.supplier_id || null,
      sender_type: data.sender_type,
      sender_name: data.sender_name || null,
      message: data.message,

      // Quem envia já leu a própria mensagem.
      // O outro lado fica como não lida.
      read_by_client: data.sender_type === 'cliente',
      read_by_supplier: data.sender_type === 'fornecedor',
    },
  ]);

  if (error) {
    console.error('Erro ao enviar mensagem:', error);
    throw error;
  }

  return true;
}

export async function markMessagesAsRead(data: {
  quote_request_id: string;
  reader_type: 'cliente' | 'fornecedor';
}) {
  const updateData =
    data.reader_type === 'fornecedor'
      ? { read_by_supplier: true }
      : { read_by_client: true };

  const { error } = await supabase
    .from('quote_messages')
    .update(updateData)
    .eq('quote_request_id', data.quote_request_id);

  if (error) {
    console.error('Erro ao marcar mensagens como lidas:', error);
    throw error;
  }

  return true;
}

export async function countUnreadMessages(data: {
  quote_request_id: string;
  reader_type: 'cliente' | 'fornecedor';
}) {
  const column =
    data.reader_type === 'fornecedor' ? 'read_by_supplier' : 'read_by_client';

  const { count, error } = await supabase
    .from('quote_messages')
    .select('*', { count: 'exact', head: true })
    .eq('quote_request_id', data.quote_request_id)
    .eq(column, false);

  if (error) {
    console.error('Erro ao contar mensagens não lidas:', error);
    throw error;
  }

  return count ?? 0;
}
