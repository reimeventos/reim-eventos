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
    },
  ]);

  if (error) {
    console.error('Erro ao enviar mensagem:', error);
    throw error;
  }

  return true;
}
