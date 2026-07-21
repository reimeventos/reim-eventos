import { supabase } from "./supabase";

export type Supplier = {
  id: string;
  owner_id?: string | null;
  user_id?: string | null;
  category_id?: string | null;
  status?: string | null;
  is_featured?: boolean | null;
  business_name?: string | null;
  company_name?: string | null;
  fantasy_name?: string | null;
  name?: string | null;
  title?: string | null;
  description?: string | null;
  short_description?: string | null;
  category?: string | null;
  city?: string | null;
  service_cities?: string[] | null;
  state?: string | null;
  address?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  instagram?: string | null;
  website?: string | null;
  cover_url?: string | null;
  logo_url?: string | null;
  image_url?: string | null;
  price_from?: number | null;
  rating?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
  [key: string]: any;
};

export type SupplierMedia = {
  id: string;
  supplier_id: string;
  url?: string | null;
  image_url?: string | null;
  file_url?: string | null;
  type?: string | null;
  position?: number | null;
  created_at?: string | null;
  [key: string]: any;
};

export type SupplierCategory = {
  id: string;
  name?: string | null;
  title?: string | null;
  slug?: string | null;
  icon?: string | null;
  created_at?: string | null;
  [key: string]: any;
};

export type SupplierSubscription = {
  id: string;
  supplier_id?: string | null;
  status?: string | null;
  plan?: string | null;
  plan_name?: string | null;
  public_label?: string | null;
  current_period_end?: string | null;
  ends_at?: string | null;
  trial_ends_at?: string | null;
  created_at?: string | null;
  [key: string]: any;
};

export type SupplierVisibility = {
  supplier_id?: string | null;
  owner_id?: string | null;
  can_appear_public?: boolean | null;
  can_receive_quote?: boolean | null;
  public_badge?: string | null;
  public_label?: string | null;
  public_notice?: string | null;
  [key: string]: any;
};

export function getSupabase() {
  return supabase;
}

export function getSupplierDisplayName(supplier?: Supplier | null) {
  if (!supplier) return "Fornecedor";

  return (
    supplier.business_name ||
    supplier.company_name ||
    supplier.fantasy_name ||
    supplier.name ||
    supplier.title ||
    "Fornecedor"
  );
}

export function normalizeCityName(city?: string | null) {
  return String(city || "").trim();
}

export function getSupplierServiceCities(supplier?: Supplier | null) {
  if (!supplier) return [];

  const mainCity = normalizeCityName(supplier.city);
  const serviceCities = Array.isArray(supplier.service_cities)
    ? supplier.service_cities
    : [];

  return Array.from(
    new Set(
      [mainCity, ...serviceCities]
        .map((city) => normalizeCityName(city))
        .filter(Boolean)
    )
  );
}

export function supplierAttendsCity(
  supplier?: Supplier | null,
  city?: string | null
) {
  const selectedCity = normalizeCityName(city).toLowerCase();

  if (!supplier || !selectedCity) return false;

  return getSupplierServiceCities(supplier).some(
    (item) => item.toLowerCase() === selectedCity
  );
}

export function getEventCityFromQuoteRequest(quoteRequest?: any) {
  return (
    quoteRequest?.event_city ||
    quoteRequest?.city ||
    quoteRequest?.event?.event_city ||
    quoteRequest?.event?.city ||
    "Cidade não informada"
  );
}

export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("Erro ao buscar usuário:", error);
    return null;
  }

  return user;
}

export async function getSupplierByOwner(ownerId: string) {
  const { data, error } = await supabase
    .from("suppliers")
    .select("*")
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (error) {
    console.error("Erro ao buscar fornecedor pelo owner_id:", error);
    return null;
  }

  return data as Supplier | null;
}

export async function getSupplierByUserId(userId: string) {
  return getSupplierByOwner(userId);
}

export async function getCurrentSupplier() {
  const user = await getCurrentUser();

  if (!user) return null;

  return getSupplierByOwner(user.id);
}

export async function getMySupplier() {
  return getCurrentSupplier();
}

export async function getMySupplierProfile() {
  return getCurrentSupplier();
}

export async function getSupplierById(id: string) {
  const { data, error } = await supabase
    .from("suppliers")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Erro ao buscar fornecedor por ID:", error);
    return null;
  }

  return data as Supplier | null;
}

export async function getSupplier(id: string) {
  return getSupplierById(id);
}

export async function getSupplierDetails(id: string) {
  return getSupplierById(id);
}

export async function getSupplierBySlug(idOrSlug: string) {
  const { data, error } = await supabase
    .from("suppliers")
    .select("*")
    .or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`)
    .maybeSingle();

  if (error) {
    return getSupplierById(idOrSlug);
  }

  return data as Supplier | null;
}

export async function getSupplierPublicById(id: string) {
  return getSupplierById(id);
}

export async function getSupplierForEdit(id: string) {
  return getSupplierById(id);
}

export async function getSupplierProfile(id: string) {
  return getSupplierById(id);
}

export async function listSuppliers() {
  const { data, error } = await supabase
    .from("suppliers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao listar fornecedores:", error);
    return [];
  }

  return (data || []) as Supplier[];
}

export async function getSuppliers() {
  return listSuppliers();
}

export async function getAllSuppliers() {
  return listSuppliers();
}

export async function getActiveSuppliers() {
  const { data, error } = await supabase
    .from("suppliers")
    .select("*")
    .in("status", ["ativo", "active"])
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao listar fornecedores ativos:", error);
    return [];
  }

  return (data || []) as Supplier[];
}

export async function getPublicSuppliers() {
  return getActiveSuppliers();
}

export async function getFeaturedSuppliers(limit = 8) {
  const { data, error } = await supabase
    .from("suppliers")
    .select("*")
    .in("status", ["ativo", "active"])
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Erro ao listar fornecedores em destaque:", error);
    return [];
  }

  return (data || []) as Supplier[];
}

export async function searchSuppliers(
  searchTerm = "",
  categoryId?: string | null
) {
  let query = supabase
    .from("suppliers")
    .select("*")
    .in("status", ["ativo", "active"])
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  if (searchTerm.trim()) {
    const term = `%${searchTerm.trim()}%`;

    query = query.or(
      `business_name.ilike.${term},company_name.ilike.${term},fantasy_name.ilike.${term},name.ilike.${term},title.ilike.${term},description.ilike.${term},city.ilike.${term}`
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao buscar fornecedores:", error);
    return [];
  }

  return (data || []) as Supplier[];
}

export async function searchSuppliersByCity(
  city?: string | null,
  searchTerm = "",
  categoryId?: string | null
) {
  const selectedCity = normalizeCityName(city);
  const suppliers = await searchSuppliers(searchTerm, categoryId);

  if (!selectedCity) return suppliers;

  return suppliers.sort((a, b) => {
    const aAttends = supplierAttendsCity(a, selectedCity) ? 1 : 0;
    const bAttends = supplierAttendsCity(b, selectedCity) ? 1 : 0;

    if (aAttends !== bAttends) return bAttends - aAttends;

    const aFeatured = a.is_featured ? 1 : 0;
    const bFeatured = b.is_featured ? 1 : 0;

    if (aFeatured !== bFeatured) return bFeatured - aFeatured;

    return 0;
  });
}

export async function createSupplier(payload: Partial<Supplier>) {
  const { data, error } = await supabase
    .from("suppliers")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    console.error("Erro ao criar fornecedor:", error);
    throw error;
  }

  return data as Supplier;
}

export async function updateSupplier(id: string, payload: Partial<Supplier>) {
  const updatePayload = {
    ...payload,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("suppliers")
    .update(updatePayload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error("Erro ao atualizar fornecedor:", error);
    throw error;
  }

  return data as Supplier;
}

export async function updateSupplierProfile(
  id: string,
  payload: Partial<Supplier>
) {
  return updateSupplier(id, payload);
}

export async function updateMySupplierProfile(payload: Partial<Supplier>) {
  const supplier = await getCurrentSupplier();

  if (!supplier?.id) {
    throw new Error("Fornecedor não encontrado para o usuário atual.");
  }

  return updateSupplier(supplier.id, payload);
}

export async function saveSupplierProfile(
  id: string,
  payload: Partial<Supplier>
) {
  return updateSupplier(id, payload);
}

export async function upsertSupplier(payload: Partial<Supplier>) {
  const { data, error } = await supabase
    .from("suppliers")
    .upsert(payload)
    .select("*")
    .single();

  if (error) {
    console.error("Erro ao salvar fornecedor:", error);
    throw error;
  }

  return data as Supplier;
}

export async function ensureSupplierForUser(
  ownerId: string,
  payload?: Partial<Supplier>
) {
  const existingSupplier = await getSupplierByOwner(ownerId);

  if (existingSupplier) return existingSupplier;

  return createSupplier({
    owner_id: ownerId,
    status: "pendente",
    is_featured: false,
    ...(payload || {}),
  });
}

export async function getSupplierMedia(supplierId: string) {
  const { data, error } = await supabase
    .from("media")
    .select("*")
    .eq("supplier_id", supplierId)
    .order("position", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar mídia do fornecedor:", error);
    return [];
  }

  return (data || []) as SupplierMedia[];
}

export async function getSupplierImages(supplierId: string) {
  return getSupplierMedia(supplierId);
}

export async function getMediaBySupplier(supplierId: string) {
  return getSupplierMedia(supplierId);
}

export async function getSupplierPhotos(supplierId: string) {
  return getSupplierMedia(supplierId);
}

export async function addSupplierMedia(payload: Partial<SupplierMedia>) {
  const { data, error } = await supabase
    .from("media")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    console.error("Erro ao adicionar mídia:", error);
    throw error;
  }

  return data as SupplierMedia;
}

export async function updateSupplierMedia(
  id: string,
  payload: Partial<SupplierMedia>
) {
  const { data, error } = await supabase
    .from("media")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error("Erro ao atualizar mídia:", error);
    throw error;
  }

  return data as SupplierMedia;
}

export async function deleteSupplierMedia(id: string) {
  const { error } = await supabase.from("media").delete().eq("id", id);

  if (error) {
    console.error("Erro ao apagar mídia:", error);
    throw error;
  }

  return true;
}

export async function getSupplierCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Erro ao buscar categorias:", error);
    return [];
  }

  return (data || []) as SupplierCategory[];
}

export async function getCategories() {
  return getSupplierCategories();
}

export async function getAllCategories() {
  return getSupplierCategories();
}

export async function listCategories() {
  return getSupplierCategories();
}

export async function getSupplierSubscription(supplierId: string) {
  const { data, error } = await supabase
    .from("supplier_subscriptions")
    .select("*")
    .eq("supplier_id", supplierId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Erro ao buscar assinatura do fornecedor:", error);
    return null;
  }

  return data as SupplierSubscription | null;
}

export async function getSupplierPlan(supplierId: string) {
  return getSupplierSubscription(supplierId);
}

export async function getSupplierSubscriptionStatus(supplierId: string) {
  return getSupplierSubscription(supplierId);
}

export async function getSupplierVisibility(supplierId: string) {
  const { data, error } = await supabase
    .from("supplier_public_visibility")
    .select("*")
    .eq("supplier_id", supplierId)
    .maybeSingle();

  if (error) {
    console.error("Erro ao buscar visibilidade pública:", error);
    return null;
  }

  return data as SupplierVisibility | null;
}

export async function getSupplierPublicVisibility(supplierId: string) {
  return getSupplierVisibility(supplierId);
}

export async function getSupplierUnansweredLeadsCount(ownerId: string) {
  const { count, error } = await supabase
    .from("supplier_unanswered_quote_requests")
    .select("id", { count: "exact", head: true })
    .eq("supplier_owner_id", ownerId);

  if (error) {
    console.error("Erro ao contar leads sem resposta:", error);
    return 0;
  }

  return count || 0;
}

export async function getSupplierStats(
  supplierId: string,
  ownerId?: string | null
) {
  const { count: totalLeads } = await supabase
    .from("quote_requests")
    .select("id", { count: "exact", head: true })
    .eq("supplier_id", supplierId);

  const { count: totalResponses } = await supabase
    .from("quote_responses")
    .select("id", { count: "exact", head: true })
    .eq("supplier_id", supplierId);

  const { count: closedQuotes } = await supabase
    .from("quote_requests")
    .select("id", { count: "exact", head: true })
    .eq("supplier_id", supplierId)
    .in("status", ["aceito", "accepted", "fechado", "closed"]);

  let unansweredLeads = 0;

  if (ownerId) {
    unansweredLeads = await getSupplierUnansweredLeadsCount(ownerId);
  }

  return {
    totalLeads: totalLeads || 0,
    unansweredLeads,
    totalResponses: totalResponses || 0,
    closedQuotes: closedQuotes || 0,
  };
}

export async function getSupplierQuoteRequests(supplierId: string) {
  const { data, error } = await supabase
    .from("quote_requests")
    .select(`
      *,
      quote_responses(*),
      quote_messages(*),
      suppliers(
        id,
        business_name,
        city,
        service_cities,
        categories(name, slug)
      )
    `)
    .eq("supplier_id", supplierId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar pedidos de orçamento:", error);
    return [];
  }

  return data || [];
}

export async function getSupplierLeads(supplierId?: string | null) {
  let finalSupplierId = supplierId;

  if (!finalSupplierId) {
    const supplier = await getCurrentSupplier();
    finalSupplierId = supplier?.id || null;
  }

  if (!finalSupplierId) return [];

  return getSupplierQuoteRequests(finalSupplierId);
}

export async function getQuoteRequestsBySupplier(supplierId?: string | null) {
  return getSupplierLeads(supplierId);
}

export async function getSupplierUnansweredQuoteRequests(ownerId: string) {
  const { data, error } = await supabase
    .from("supplier_unanswered_quote_requests")
    .select("*")
    .eq("supplier_owner_id", ownerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar leads sem resposta:", error);
    return [];
  }

  return data || [];
}

export async function getSupplierResponses(supplierId: string) {
  const { data, error } = await supabase
    .from("quote_responses")
    .select("*")
    .eq("supplier_id", supplierId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar respostas do fornecedor:", error);
    return [];
  }

  return data || [];
}

export async function getQuoteResponsesBySupplier(supplierId: string) {
  return getSupplierResponses(supplierId);
}

export async function getSupplierLeadById(leadId: string) {
  const { data, error } = await supabase
    .from("quote_requests")
    .select(`
      *,
      quote_responses(*),
      quote_messages(*),
      suppliers(
        id,
        owner_id,
        business_name,
        city,
        service_cities,
        whatsapp,
        categories(name, slug)
      )
    `)
    .eq("id", leadId)
    .maybeSingle();

  if (error) {
    console.error("Erro ao buscar lead do fornecedor:", error);
    return null;
  }

  return data;
}

export async function getSupplierLead(leadId: string) {
  return getSupplierLeadById(leadId);
}

export async function getQuoteResponseByRequestId(quoteRequestId: string) {
  const { data, error } = await supabase
    .from("quote_responses")
    .select(`
      *,
      suppliers(
        id,
        owner_id,
        business_name,
        city,
        service_cities,
        whatsapp,
        categories(name, slug)
      ),
      quote_requests(
        id,
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
        created_by_email
      )
    `)
    .eq("quote_request_id", quoteRequestId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Erro ao buscar resposta do orçamento:", error);
    return null;
  }

  return data;
}

export async function getQuoteResponse(quoteRequestId: string) {
  return getQuoteResponseByRequestId(quoteRequestId);
}

export async function createQuoteResponse(
  payloadOrQuoteRequestId: any,
  maybePayload?: any
) {
  const payload =
    typeof payloadOrQuoteRequestId === "string"
      ? {
          ...(maybePayload || {}),
          quote_request_id: payloadOrQuoteRequestId,
        }
      : payloadOrQuoteRequestId;

  const { data, error } = await supabase
    .from("quote_responses")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    console.error("Erro ao criar resposta do orçamento:", error);
    throw error;
  }

  const quoteRequestId = data?.quote_request_id || payload?.quote_request_id;

  if (quoteRequestId) {
    const { error: requestError } = await supabase
      .from("quote_requests")
      .update({
        status: "respondido",
      })
      .eq("id", quoteRequestId);

    if (requestError) {
      console.error("Erro ao atualizar status do pedido:", requestError);
    }
  }

  return data;
}

export async function acceptQuoteResponse(payloadOrResponseId: any) {
  const responseId =
    typeof payloadOrResponseId === "string"
      ? payloadOrResponseId
      : payloadOrResponseId?.quote_response_id ||
        payloadOrResponseId?.response_id ||
        payloadOrResponseId?.id;

  const quoteRequestIdFromPayload =
    typeof payloadOrResponseId === "object"
      ? payloadOrResponseId?.quote_request_id
      : null;

  if (!responseId) {
    throw new Error("ID da resposta do orçamento não informado.");
  }

  const { data: responseData, error: responseError } = await supabase
    .from("quote_responses")
    .update({
      status: "aceito",
    })
    .eq("id", responseId)
    .select("*")
    .single();

  if (responseError) {
    console.error("Erro ao aceitar resposta do orçamento:", responseError);
    throw responseError;
  }

  const quoteRequestId =
    quoteRequestIdFromPayload || responseData?.quote_request_id;

  if (quoteRequestId) {
    const { error: requestError } = await supabase
      .from("quote_requests")
      .update({
        status: "aceito",
      })
      .eq("id", quoteRequestId);

    if (requestError) {
      console.error("Erro ao atualizar pedido como aceito:", requestError);
      throw requestError;
    }
  }

  return responseData;
}

export async function requestQuoteAdjustment(
  responseIdOrPayload: any,
  adjustmentMessage?: string
) {
  const responseId =
    typeof responseIdOrPayload === "string"
      ? responseIdOrPayload
      : responseIdOrPayload?.quote_response_id ||
        responseIdOrPayload?.response_id ||
        responseIdOrPayload?.id;

  const message =
    adjustmentMessage ||
    responseIdOrPayload?.adjustment_message ||
    responseIdOrPayload?.message ||
    responseIdOrPayload?.adjustment_request ||
    "";

  const quoteRequestIdFromPayload =
    typeof responseIdOrPayload === "object"
      ? responseIdOrPayload?.quote_request_id
      : null;

  if (!responseId) {
    throw new Error("ID da resposta do orçamento não informado.");
  }

  const { data: responseData, error: responseError } = await supabase
    .from("quote_responses")
    .update({
      status: "ajuste_solicitado",
      adjustment_notes: message,
      adjustment_requested_at: new Date().toISOString(),
    })
    .eq("id", responseId)
    .select("*")
    .single();

  if (responseError) {
    console.error("Erro ao solicitar ajuste no orçamento:", responseError);
    throw responseError;
  }

  const quoteRequestId =
    quoteRequestIdFromPayload || responseData?.quote_request_id;

  if (quoteRequestId) {
    const { error: requestError } = await supabase
      .from("quote_requests")
      .update({
        status: "ajuste_solicitado",
      })
      .eq("id", quoteRequestId);

    if (requestError) {
      console.error("Erro ao atualizar pedido como ajuste solicitado:", requestError);
      throw requestError;
    }
  }

  return responseData;
}

/* Fornecedores salvos / Meu Evento */

async function resolveCustomerId(customerId?: string | null) {
  if (customerId) return customerId;

  const user = await getCurrentUser();

  return user?.id || null;
}

export async function isSupplierSaved(
  supplierId: string,
  customerId?: string | null
) {
  const finalCustomerId = await resolveCustomerId(customerId);

  if (!finalCustomerId || !supplierId) return false;

  const { data, error } = await supabase
    .from("saved_suppliers")
    .select("id")
    .eq("supplier_id", supplierId)
    .eq("customer_id", finalCustomerId)
    .maybeSingle();

  if (error) {
    console.error("Erro ao verificar fornecedor salvo:", error);
    return false;
  }

  return !!data;
}

export async function saveSupplierForCustomer(
  customerId: string,
  supplierId: string
) {
  if (!customerId || !supplierId) return null;

  const { data: existing } = await supabase
    .from("saved_suppliers")
    .select("*")
    .eq("customer_id", customerId)
    .eq("supplier_id", supplierId)
    .maybeSingle();

  if (existing) return existing;

  const { data, error } = await supabase
    .from("saved_suppliers")
    .insert({
      customer_id: customerId,
      supplier_id: supplierId,
    })
    .select("*")
    .single();

  if (error) {
    console.error("Erro ao salvar fornecedor:", error);
    throw error;
  }

  return data;
}

export async function saveSupplier(
  supplierId: string,
  customerId?: string | null
) {
  const finalCustomerId = await resolveCustomerId(customerId);

  if (!finalCustomerId) {
    throw new Error("Usuário não autenticado para salvar fornecedor.");
  }

  return saveSupplierForCustomer(finalCustomerId, supplierId);
}

export async function unsaveSupplierForCustomer(
  customerId: string,
  supplierId: string
) {
  if (!customerId || !supplierId) return false;

  const { error } = await supabase
    .from("saved_suppliers")
    .delete()
    .eq("customer_id", customerId)
    .eq("supplier_id", supplierId);

  if (error) {
    console.error("Erro ao remover fornecedor salvo:", error);
    throw error;
  }

  return true;
}

export async function unsaveSupplier(
  supplierId: string,
  customerId?: string | null
) {
  const finalCustomerId = await resolveCustomerId(customerId);

  if (!finalCustomerId) {
    throw new Error("Usuário não autenticado para remover fornecedor.");
  }

  return unsaveSupplierForCustomer(finalCustomerId, supplierId);
}

export async function getSavedSuppliers(customerId?: string | null) {
  const finalCustomerId = await resolveCustomerId(customerId);

  if (!finalCustomerId) return [];

  const { data, error } = await supabase
    .from("saved_suppliers")
    .select(`
      *,
      suppliers(
        *,
        categories(name, slug),
        media(file_url, is_cover, created_at)
      )
    `)
    .eq("customer_id", finalCustomerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar fornecedores salvos:", error);
    return [];
  }

  return data || [];
}

export async function listSavedSuppliers(customerId?: string | null) {
  return getSavedSuppliers(customerId);
}

export async function getCustomerSavedSuppliers(customerId: string) {
  return getSavedSuppliers(customerId);
}

export async function getSavedSuppliersByCustomer(customerId: string) {
  return getSavedSuppliers(customerId);
}

export async function toggleSaveSupplier(
  supplierId: string,
  customerId?: string | null
) {
  const finalCustomerId = await resolveCustomerId(customerId);

  if (!finalCustomerId) {
    throw new Error("Usuário não autenticado.");
  }

  const alreadySaved = await isSupplierSaved(supplierId, finalCustomerId);

  if (alreadySaved) {
    await unsaveSupplierForCustomer(finalCustomerId, supplierId);
    return { saved: false };
  }

  await saveSupplierForCustomer(finalCustomerId, supplierId);
  return { saved: true };
}

const suppliersApi = {
  getSupabase,
  getCurrentUser,
  getCurrentSupplier,
  getMySupplier,
  getMySupplierProfile,
  updateMySupplierProfile,

  getSupplierByOwner,
  getSupplierByUserId,
  getSupplierById,
  getSupplier,
  getSupplierDetails,
  getSupplierBySlug,
  getSupplierPublicById,
  getSupplierForEdit,
  getSupplierProfile,

  listSuppliers,
  getSuppliers,
  getAllSuppliers,
  getPublicSuppliers,
  getActiveSuppliers,
  getFeaturedSuppliers,
  searchSuppliers,
  searchSuppliersByCity,

  createSupplier,
  updateSupplier,
  updateSupplierProfile,
  saveSupplierProfile,
  upsertSupplier,
  ensureSupplierForUser,

  getSupplierMedia,
  getSupplierImages,
  getMediaBySupplier,
  getSupplierPhotos,
  addSupplierMedia,
  updateSupplierMedia,
  deleteSupplierMedia,

  getSupplierCategories,
  getCategories,
  getAllCategories,
  listCategories,

  getSupplierSubscription,
  getSupplierPlan,
  getSupplierSubscriptionStatus,
  getSupplierVisibility,
  getSupplierPublicVisibility,

  getSupplierUnansweredLeadsCount,
  getSupplierStats,
  getSupplierQuoteRequests,
  getSupplierLeads,
  getQuoteRequestsBySupplier,
  getSupplierUnansweredQuoteRequests,
  getSupplierResponses,
  getQuoteResponsesBySupplier,
  getSupplierLeadById,
  getSupplierLead,

  getQuoteResponseByRequestId,
  getQuoteResponse,
  createQuoteResponse,
  acceptQuoteResponse,
  requestQuoteAdjustment,

  isSupplierSaved,
  saveSupplier,
  saveSupplierForCustomer,
  unsaveSupplier,
  unsaveSupplierForCustomer,
  getSavedSuppliers,
  listSavedSuppliers,
  getCustomerSavedSuppliers,
  getSavedSuppliersByCustomer,
  toggleSaveSupplier,

  getSupplierDisplayName,
  normalizeCityName,
  getSupplierServiceCities,
  supplierAttendsCity,
  getEventCityFromQuoteRequest,
};

export default suppliersApi;
