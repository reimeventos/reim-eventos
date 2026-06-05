import { supabase } from './supabase';

export async function getMySupplierProfile() {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error('Login necessário');

  const { data, error } = await supabase
    .from('suppliers')
    .select('*, categories(id, name, slug), media(*)')
    .eq('owner_id', user.id)
    .single();

  if (error) throw error;
  return data;
}

export async function updateMySupplierProfile(payload: {
  business_name: string;
  description?: string;
  city: string;
  whatsapp: string;
  instagram?: string;
  website?: string;
  average_price?: string;
  category_id?: string;
}) {
  const supplier = await getMySupplierProfile();

  const hasMinimumProfile = Boolean(
    payload.business_name &&
    payload.city &&
    payload.whatsapp &&
    payload.category_id
  );

  const { data, error } = await supabase
    .from('suppliers')
    .update({
      ...payload,
      status: hasMinimumProfile ? 'ativo' : 'pendente_perfil',
      updated_at: new Date().toISOString(),
    })
    .eq('id', supplier.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function uploadSupplierPhoto(file: File, isCover = false) {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error('Login necessário');

  const supplier = await getMySupplierProfile();

  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowed.includes(file.type)) {
    throw new Error('Envie JPG, PNG ou WEBP.');
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error('A imagem deve ter no máximo 5MB.');
  }

  const ext = file.name.split('.').pop();
  const filePath = `${supplier.id}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('supplier-media')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage
    .from('supplier-media')
    .getPublicUrl(filePath);

  if (isCover) {
    await supabase
      .from('media')
      .update({ is_cover: false })
      .eq('supplier_id', supplier.id);
  }

  const { data, error } = await supabase
    .from('media')
    .insert({
      supplier_id: supplier.id,
      owner_id: user.id,
      type: 'foto',
      file_url: urlData.publicUrl,
      is_cover: isCover,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getSupplierLeads() {
  const supplier = await getMySupplierProfile();

  const { data, error } = await supabase
    .from('quote_requests')
    .select('*')
    .eq('supplier_id', supplier.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getSupplierLeadById(id: string) {
  const supplier = await getMySupplierProfile();

  const { data, error } = await supabase
    .from('quote_requests')
    .select('*')
    .eq('id', id)
    .eq('supplier_id', supplier.id)
    .single();

  if (error) throw error;
  return data;
}

export async function createQuoteRequest(data: {
  supplier_id: string;
  customer_name: string;
  customer_whatsapp: string;
  event_type: string;
  event_date?: string;
  event_time?: string;
  event_space?: string;
  event_city?: string;
  guests_count?: number;
  service_needed?: string;
  notes?: string;
}) {
  const { error } = await supabase
    .from('quote_requests')
    .insert([
      {
        supplier_id: data.supplier_id,
        customer_name: data.customer_name,
        customer_whatsapp: data.customer_whatsapp,
        event_type: data.event_type,
        event_date: data.event_date || null,
        event_time: data.event_time || null,
        event_space: data.event_space || null,
        event_city: data.event_city || null,
        guests_count: data.guests_count || null,
        service_needed: data.service_needed || null,
        notes: data.notes || null,
      },
    ]);

  if (error) {
    console.error('Erro ao criar solicitação de orçamento:', error);
    throw error;
  }

  return true;
}

export async function createQuoteResponse(data: {
  quote_request_id: string;
  service_offered: string;
  duration_period?: string;
  proposal_value: string;
  payment_terms?: string;
  proposal_validity?: string;
  observations?: string;
}) {
  const supplier = await getMySupplierProfile();

  const { error } = await supabase
    .from('quote_responses')
    .insert([
      {
        quote_request_id: data.quote_request_id,
        supplier_id: supplier.id,
        service_offered: data.service_offered,
        duration_period: data.duration_period || null,
        proposal_value: data.proposal_value,
        payment_terms: data.payment_terms || null,
        proposal_validity: data.proposal_validity || null,
        observations: data.observations || null,
      },
    ]);

  if (error) {
    console.error('Erro ao criar resposta de orçamento:', error);
    throw error;
  }

  const { error: updateError } = await supabase
    .from('quote_requests')
    .update({ status: 'respondido' })
    .eq('id', data.quote_request_id)
    .eq('supplier_id', supplier.id);

  if (updateError) {
    console.error('Erro ao atualizar status do pedido:', updateError);
    throw updateError;
  }

  return true;
}

export async function getQuoteResponseByRequestId(requestId: string) {
  const { data, error } = await supabase
    .from('quote_responses')
    .select('*, suppliers(business_name, city, whatsapp, instagram, categories(name))')
    .eq('quote_request_id', requestId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) throw error;
  return data;
}

export async function acceptQuoteResponse(data: {
  quote_response_id: string;
  quote_request_id: string;
}) {
  const { error: responseError } = await supabase
    .from('quote_responses')
    .update({ status: 'aceito' })
    .eq('id', data.quote_response_id);

  if (responseError) {
    console.error('Erro ao aceitar orçamento:', responseError);
    throw responseError;
  }

  const { error: requestError } = await supabase
    .from('quote_requests')
    .update({ status: 'aceito' })
    .eq('id', data.quote_request_id);

  if (requestError) {
    console.error('Erro ao atualizar solicitação como aceita:', requestError);
    throw requestError;
  }

  return true;
}

export async function requestQuoteAdjustment(data: {
  quote_response_id: string;
  quote_request_id: string;
  adjustment_notes: string;
}) {
  const { error: responseError } = await supabase
    .from('quote_responses')
    .update({
      status: 'ajuste_solicitado',
      adjustment_notes: data.adjustment_notes,
      adjustment_requested_at: new Date().toISOString(),
    })
    .eq('id', data.quote_response_id);

  if (responseError) {
    console.error('Erro ao solicitar ajuste:', responseError);
    throw responseError;
  }

  const { error: requestError } = await supabase
    .from('quote_requests')
    .update({ status: 'ajuste_solicitado' })
    .eq('id', data.quote_request_id);

  if (requestError) {
    console.error('Erro ao atualizar pedido como ajuste solicitado:', requestError);
    throw requestError;
  }

  return true;
}
