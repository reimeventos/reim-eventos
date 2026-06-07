import { supabase } from './supabase';

export async function getClientNotifications() {
  const { data, error } = await supabase
    .from('quote_requests')
    .select(`
      id,
      status,
      event_type,
      created_at,
      suppliers(
        business_name
      ),
      quote_responses(
        id,
        status,
        created_at
      ),
      quote_messages(
        id,
        sender_type,
        read_by_client,
        created_at
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar notificações da cliente:', error);
    throw error;
  }

  const requests = data ?? [];

  const unreadMessages = requests.reduce((total, request: any) => {
    const messages = request.quote_messages || [];

    const unread = messages.filter(
      (message: any) =>
        message.sender_type === 'fornecedor' &&
        message.read_by_client === false
    ).length;

    return total + unread;
  }, 0);

  const respondedQuotes = requests.filter((request: any) => {
    return request.status === 'respondido';
  }).length;

  const adjustmentQuotes = requests.filter((request: any) => {
    return request.status === 'ajuste_solicitado';
  }).length;

  const acceptedQuotes = requests.filter((request: any) => {
    return request.status === 'aceito' || request.status === 'fechado';
  }).length;

  const total =
    unreadMessages +
    respondedQuotes +
    adjustmentQuotes +
    acceptedQuotes;

  return {
    total,
    unreadMessages,
    respondedQuotes,
    adjustmentQuotes,
    acceptedQuotes,
    requests,
  };
}

export async function getSupplierNotifications() {
  const user = (await supabase.auth.getUser()).data.user;

  if (!user) {
    throw new Error('Login necessário');
  }

  const { data: supplier, error: supplierError } = await supabase
    .from('suppliers')
    .select('id, business_name')
    .eq('owner_id', user.id)
    .maybeSingle();

  if (supplierError) {
    console.error('Erro ao buscar fornecedor:', supplierError);
    throw supplierError;
  }

  if (!supplier) {
    return {
      total: 0,
      unreadMessages: 0,
      newRequests: 0,
      adjustmentRequests: 0,
      supplier: null,
      requests: [],
    };
  }

  const { data, error } = await supabase
    .from('quote_requests')
    .select(`
      id,
      status,
      event_type,
      customer_name,
      created_at,
      quote_messages(
        id,
        sender_type,
        read_by_supplier,
        created_at
      )
    `)
    .eq('supplier_id', supplier.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar notificações do fornecedor:', error);
    throw error;
  }

  const requests = data ?? [];

  const unreadMessages = requests.reduce((total, request: any) => {
    const messages = request.quote_messages || [];

    const unread = messages.filter(
      (message: any) =>
        message.sender_type === 'cliente' &&
        message.read_by_supplier === false
    ).length;

    return total + unread;
  }, 0);

  const newRequests = requests.filter((request: any) => {
    return request.status === 'aguardando_resposta';
  }).length;

  const adjustmentRequests = requests.filter((request: any) => {
    return request.status === 'ajuste_solicitado';
  }).length;

  const total = unreadMessages + newRequests + adjustmentRequests;

  return {
    total,
    unreadMessages,
    newRequests,
    adjustmentRequests,
    supplier,
    requests,
  };
}

export async function getAdminNotifications() {
  const { data, error } = await supabase
    .from('supplier_subscriptions')
    .select(`
      id,
      status,
      plan_name,
      created_at,
      suppliers(
        business_name,
        city
      )
    `)
    .eq('status', 'pendente')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar notificações do admin:', error);
    throw error;
  }

  const pendingPremium = data ?? [];

  return {
    total: pendingPremium.length,
    pendingPremium: pendingPremium.length,
    subscriptions: pendingPremium,
  };
}
