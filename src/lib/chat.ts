import { supabase } from './supabase';

export type QuoteSenderType = 'cliente' | 'fornecedor' | 'cerimonialista';
export type QuoteReaderType = 'cliente' | 'fornecedor' | 'cerimonialista';

function getReadColumnByReader(readerType: QuoteReaderType) {
  if (readerType === 'fornecedor') return 'read_by_supplier';

  // Cliente e cerimonialista usam a mesma coluna de leitura do lado do cliente,
  // porque a tabela atual possui apenas read_by_client e read_by_supplier.
  return 'read_by_client';
}

function buildInitialReadState(senderType: QuoteSenderType) {
  return {
    read_by_client: senderType === 'cliente' || senderType === 'cerimonialista',
    read_by_supplier: senderType === 'fornecedor',
  };
}

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

export async function listQuoteMessagesWithContext(quoteRequestId: string) {
  const { data, error } = await supabase
    .from('quote_messages')
    .select(`
      *,
      quote_requests(
        id,
        supplier_id,
        event_city,
        event_type,
        event_date,
        event_space,
        guests_count,
        service_needed,
        status,
        customer_id,
        customer_name,
        created_by_role,
        created_by_name,
        created_by_email,
        suppliers(
          id,
          business_name,
          city,
          service_cities,
          categories(name, slug)
        )
      )
    `)
    .eq('quote_request_id', quoteRequestId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Erro ao buscar mensagens com contexto:', error);
    throw error;
  }

  return data ?? [];
}

export async function sendQuoteMessage(data: {
  quote_request_id: string;
  supplier_id?: string | null;
  sender_type: QuoteSenderType;
  sender_name?: string;
  message: string;
}) {
  const cleanMessage = String(data.message || '').trim();

  if (!cleanMessage) {
    throw new Error('Mensagem vazia.');
  }

  const readState = buildInitialReadState(data.sender_type);

  const { error } = await supabase.from('quote_messages').insert([
    {
      quote_request_id: data.quote_request_id,
      supplier_id: data.supplier_id || null,
      sender_type: data.sender_type,
      sender_name: data.sender_name || null,
      message: cleanMessage,
      ...readState,
    },
  ]);

  if (error) {
    console.error('Erro ao enviar mensagem:', error);
    throw error;
  }

  await supabase
    .from('quote_requests')
    .update({
      updated_at: new Date().toISOString(),
    })
    .eq('id', data.quote_request_id);

  return true;
}

export async function markMessagesAsRead(data: {
  quote_request_id: string;
  reader_type: QuoteReaderType;
}) {
  const column = getReadColumnByReader(data.reader_type);

  let query = supabase
    .from('quote_messages')
    .update({ [column]: true })
    .eq('quote_request_id', data.quote_request_id)
    .eq(column, false);

  if (data.reader_type === 'fornecedor') {
    query = query.neq('sender_type', 'fornecedor');
  }

  if (data.reader_type === 'cliente') {
    query = query.neq('sender_type', 'cliente');
  }

  if (data.reader_type === 'cerimonialista') {
    query = query.neq('sender_type', 'cerimonialista');
  }

  const { error } = await query;

  if (error) {
    console.error('Erro ao marcar mensagens como lidas:', error);
    throw error;
  }

  return true;
}

export async function countUnreadMessages(data: {
  quote_request_id: string;
  reader_type: QuoteReaderType;
}) {
  const column = getReadColumnByReader(data.reader_type);

  let query = supabase
    .from('quote_messages')
    .select('*', { count: 'exact', head: true })
    .eq('quote_request_id', data.quote_request_id)
    .eq(column, false);

  if (data.reader_type === 'fornecedor') {
    query = query.neq('sender_type', 'fornecedor');
  }

  if (data.reader_type === 'cliente') {
    query = query.neq('sender_type', 'cliente');
  }

  if (data.reader_type === 'cerimonialista') {
    query = query.neq('sender_type', 'cerimonialista');
  }

  const { count, error } = await query;

  if (error) {
    console.error('Erro ao contar mensagens não lidas:', error);
    throw error;
  }

  return count ?? 0;
}

export async function countUnreadMessagesForSupplier(supplierId: string) {
  if (!supplierId) return 0;

  const { count, error } = await supabase
    .from('quote_messages')
    .select('*', { count: 'exact', head: true })
    .eq('supplier_id', supplierId)
    .eq('read_by_supplier', false)
    .neq('sender_type', 'fornecedor');

  if (error) {
    console.error('Erro ao contar mensagens não lidas do fornecedor:', error);
    return 0;
  }

  return count ?? 0;
}

export async function countUnreadMessagesForCustomer(customerId: string) {
  if (!customerId) return 0;

  const { data: requests, error: requestError } = await supabase
    .from('quote_requests')
    .select('id')
    .eq('customer_id', customerId);

  if (requestError) {
    console.error('Erro ao buscar orçamentos do cliente:', requestError);
    return 0;
  }

  const requestIds = (requests || []).map((item) => item.id).filter(Boolean);

  if (requestIds.length === 0) return 0;

  const { count, error } = await supabase
    .from('quote_messages')
    .select('*', { count: 'exact', head: true })
    .in('quote_request_id', requestIds)
    .eq('read_by_client', false)
    .neq('sender_type', 'cliente');

  if (error) {
    console.error('Erro ao contar mensagens não lidas do cliente:', error);
    return 0;
  }

  return count ?? 0;
}
