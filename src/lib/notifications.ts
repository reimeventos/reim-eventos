import { supabase } from './supabase';

function getSupplierNameFromRequest(request: any) {
  const supplier = Array.isArray(request?.suppliers)
    ? request.suppliers[0]
    : request?.suppliers;

  return supplier?.business_name || 'Fornecedor';
}

function getEventCityFromRequest(request: any) {
  return request?.event_city || request?.city || 'Cidade não informada';
}

function cityAttendanceText(city?: string | null) {
  if (!city || city === 'Cidade não informada') {
    return 'Cidade do evento não informada';
  }

  return `Atendimento em ${city}`;
}

function getLatestDate(items: any[] = []) {
  const dates = items
    .map((item) => item?.created_at)
    .filter(Boolean)
    .map((date) => new Date(date).getTime())
    .filter((date) => !Number.isNaN(date));

  if (dates.length === 0) return null;

  return new Date(Math.max(...dates)).toISOString();
}

function buildRequestNotificationSummary(request: any) {
  const city = getEventCityFromRequest(request);
  const supplierName = getSupplierNameFromRequest(request);

  return {
    id: request.id,
    supplierName,
    customerName: request.customer_name || 'Cliente',
    eventType: request.event_type || 'Evento',
    eventCity: city,
    cityLabel: cityAttendanceText(city),
    status: request.status,
    href: `/orcamentos/${request.id}`,
    chatHref: `/orcamentos/${request.id}/chat`,
    createdAt: request.created_at,
  };
}

export async function getClientNotifications() {
  const user = (await supabase.auth.getUser()).data.user;

  let query = supabase
    .from('quote_requests')
    .select(`
      id,
      status,
      event_type,
      event_city,
      customer_id,
      customer_name,
      created_at,
      suppliers(
        id,
        business_name,
        city,
        service_cities
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

  if (user?.id) {
    query = query.eq('customer_id', user.id);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Erro ao buscar notificações da cliente:', error);
    throw error;
  }

  const requests = data ?? [];

  const unreadMessages = requests.reduce((total, request: any) => {
    const messages = request.quote_messages || [];

    const unread = messages.filter(
      (message: any) =>
        message.sender_type !== 'cliente' &&
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

  const items = requests.map((request: any) => {
    const unreadCount = (request.quote_messages || []).filter(
      (message: any) =>
        message.sender_type !== 'cliente' &&
        message.read_by_client === false
    ).length;

    const latestResponseAt = getLatestDate(request.quote_responses || []);
    const latestMessageAt = getLatestDate(request.quote_messages || []);

    return {
      ...buildRequestNotificationSummary(request),
      unreadCount,
      latestResponseAt,
      latestMessageAt,
      hasUnreadMessage: unreadCount > 0,
      hasResponse: request.status === 'respondido',
      hasAdjustment: request.status === 'ajuste_solicitado',
      isAccepted: request.status === 'aceito' || request.status === 'fechado',
    };
  });

  return {
    total,
    unreadMessages,
    respondedQuotes,
    adjustmentQuotes,
    acceptedQuotes,
    requests,
    items,
  };
}

export async function getSupplierNotifications() {
  const user = (await supabase.auth.getUser()).data.user;

  if (!user) {
    throw new Error('Login necessário');
  }

  const { data: supplier, error: supplierError } = await supabase
    .from('suppliers')
    .select('id, business_name, city, service_cities')
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
      items: [],
    };
  }

  const { data, error } = await supabase
    .from('quote_requests')
    .select(`
      id,
      status,
      event_type,
      event_city,
      customer_name,
      created_by_role,
      created_by_name,
      created_by_email,
      created_at,
      suppliers(
        id,
        business_name,
        city,
        service_cities
      ),
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
        message.sender_type !== 'fornecedor' &&
        message.read_by_supplier === false
    ).length;

    return total + unread;
  }, 0);

  const newRequests = requests.filter((request: any) => {
    return request.status === 'aguardando_resposta' || request.status === 'novo';
  }).length;

  const adjustmentRequests = requests.filter((request: any) => {
    return request.status === 'ajuste_solicitado';
  }).length;

  const total = unreadMessages + newRequests + adjustmentRequests;

  const items = requests.map((request: any) => {
    const unreadCount = (request.quote_messages || []).filter(
      (message: any) =>
        message.sender_type !== 'fornecedor' &&
        message.read_by_supplier === false
    ).length;

    return {
      ...buildRequestNotificationSummary({
        ...request,
        suppliers: supplier,
      }),
      unreadCount,
      latestMessageAt: getLatestDate(request.quote_messages || []),
      requestedBy:
        request.created_by_role === 'cerimonialista'
          ? request.created_by_name || request.created_by_email || 'Cerimonialista'
          : request.customer_name || 'Cliente',
      createdByRole: request.created_by_role || 'cliente',
      hasUnreadMessage: unreadCount > 0,
      isNewRequest:
        request.status === 'aguardando_resposta' || request.status === 'novo',
      hasAdjustment: request.status === 'ajuste_solicitado',
      href: `/painel-fornecedor/leads/${request.id}/responder`,
      chatHref: `/orcamentos/${request.id}/chat`,
    };
  });

  return {
    total,
    unreadMessages,
    newRequests,
    adjustmentRequests,
    supplier,
    requests,
    items,
  };
}

export async function getCerimonialistaNotifications() {
  const user = (await supabase.auth.getUser()).data.user;

  if (!user?.email) {
    return {
      total: 0,
      unreadMessages: 0,
      acceptedInvites: 0,
      pendingInvites: 0,
      requests: [],
      invites: [],
      items: [],
    };
  }

  const { data: invites, error: invitesError } = await supabase
    .from('event_collaborators')
    .select(`
      id,
      event_id,
      owner_id,
      owner_name,
      owner_email,
      status,
      created_at,
      events(
        id,
        event_name,
        couple_name,
        event_city,
        city,
        event_type,
        event_date
      )
    `)
    .ilike('collaborator_email', user.email)
    .order('created_at', { ascending: false });

  if (invitesError) {
    console.error('Erro ao buscar convites da cerimonialista:', invitesError);
    throw invitesError;
  }

  const acceptedInvites = (invites || []).filter(
    (invite: any) => invite.status === 'aceito'
  );

  const ownerIds = acceptedInvites
    .map((invite: any) => invite.owner_id)
    .filter(Boolean);

  let requests: any[] = [];

  if (ownerIds.length > 0) {
    const { data, error } = await supabase
      .from('quote_requests')
      .select(`
        id,
        status,
        event_type,
        event_city,
        customer_id,
        customer_name,
        created_by_role,
        created_by_name,
        created_by_email,
        created_at,
        suppliers(
          id,
          business_name,
          city,
          service_cities
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
      .in('customer_id', ownerIds)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar notificações da cerimonialista:', error);
      throw error;
    }

    requests = data || [];
  }

  const unreadMessages = requests.reduce((total, request: any) => {
    const messages = request.quote_messages || [];

    const unread = messages.filter(
      (message: any) =>
        message.sender_type !== 'cerimonialista' &&
        message.read_by_client === false
    ).length;

    return total + unread;
  }, 0);

  const pendingInvites = (invites || []).filter(
    (invite: any) => invite.status === 'pendente'
  ).length;

  const items = requests.map((request: any) => {
    const unreadCount = (request.quote_messages || []).filter(
      (message: any) =>
        message.sender_type !== 'cerimonialista' &&
        message.read_by_client === false
    ).length;

    return {
      ...buildRequestNotificationSummary(request),
      unreadCount,
      latestMessageAt: getLatestDate(request.quote_messages || []),
      latestResponseAt: getLatestDate(request.quote_responses || []),
      hasUnreadMessage: unreadCount > 0,
      href: `/orcamentos/${request.id}`,
      chatHref: `/orcamentos/${request.id}/chat`,
    };
  });

  const total = unreadMessages + pendingInvites;

  return {
    total,
    unreadMessages,
    acceptedInvites: acceptedInvites.length,
    pendingInvites,
    requests,
    invites: invites || [],
    items,
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
        city,
        service_cities
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
