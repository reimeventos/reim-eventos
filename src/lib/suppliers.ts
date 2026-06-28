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

export async function getCurrentSupplier() {
  const user = await getCurrentUser();

  if (!user) return null;

  return getSupplierByOwner(user.id);
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
  const { count: totalLeads, error: totalLeadsError } = await supabase
    .from("quote_requests")
    .select("id", { count: "exact", head: true })
    .eq("supplier_id", supplierId);

  if (totalLeadsError) {
    console.error("Erro ao contar leads:", totalLeadsError);
  }

  const { count: totalResponses, error: responsesError } = await supabase
    .from("quote_responses")
    .select("id", { count: "exact", head: true })
    .eq("supplier_id", supplierId);

  if (responsesError) {
    console.error("Erro ao contar respostas:", responsesError);
  }

  const { count: closedQuotes, error: closedQuotesError } = await supabase
    .from("quote_requests")
    .select("id", { count: "exact", head: true })
    .eq("supplier_id", supplierId)
    .in("status", ["aceito", "accepted", "fechado", "closed"]);

  if (closedQuotesError) {
    console.error("Erro ao contar fechados:", closedQuotesError);
  }

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
    .select("*")
    .eq("supplier_id", supplierId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar pedidos de orçamento:", error);
    return [];
  }

  return data || [];
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

export async function getSupplierLeadById(leadId: string) {
  const { data, error } = await supabase
    .from("quote_requests")
    .select("*")
    .eq("id", leadId)
    .maybeSingle();

  if (error) {
    console.error("Erro ao buscar lead do fornecedor:", error);
    return null;
  }

  return data;
}

export async function getQuoteResponseByRequestId(quoteRequestId: string) {
  const { data, error } = await supabase
    .from("quote_responses")
    .select("*")
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
        updated_at: new Date().toISOString(),
      })
      .eq("id", quoteRequestId);

    if (requestError) {
      console.error("Erro ao atualizar status do pedido:", requestError);
    }
  }

  return data;
}

export async function acceptQuoteResponse(responseId: string) {
  const { data: responseData, error: responseError } = await supabase
    .from("quote_responses")
    .update({
      status: "aceito",
      accepted_at: new Date().toISOString(),
    })
    .eq("id", responseId)
    .select("*")
    .single();

  if (responseError) {
    console.error("Erro ao aceitar resposta do orçamento:", responseError);
    throw responseError;
  }

  const quoteRequestId = responseData?.quote_request_id;

  if (quoteRequestId) {
    const { error: requestError } = await supabase
      .from("quote_requests")
      .update({
        status: "aceito",
        updated_at: new Date().toISOString(),
      })
      .eq("id", quoteRequestId);

    if (requestError) {
      console.error("Erro ao atualizar pedido de orçamento:", requestError);
    }
  }

  return responseData;
}

export async function requestQuoteAdjustment(
  responseId: string,
  adjustmentMessage: string
) {
  const { data: responseData, error: responseError } = await supabase
    .from("quote_responses")
    .update({
      status: "ajuste_solicitado",
      adjustment_request: adjustmentMessage,
      adjustment_requested_at: new Date().toISOString(),
    })
    .eq("id", responseId)
    .select("*")
    .single();

  if (responseError) {
    console.error("Erro ao solicitar ajuste no orçamento:", responseError);
    throw responseError;
  }

  const quoteRequestId = responseData?.quote_request_id;

  if (quoteRequestId) {
    const { error: requestError } = await supabase
      .from("quote_requests")
      .update({
        status: "ajuste_solicitado",
        updated_at: new Date().toISOString(),
      })
      .eq("id", quoteRequestId);

    if (requestError) {
      console.error("Erro ao atualizar pedido com ajuste:", requestError);
    }
  }

  return responseData;
}

/* Compatibilidade com nomes antigos usados nas páginas */
export const getSuppliers = listSuppliers;
export const getAllSuppliers = listSuppliers;
export const getPublicSuppliers = getActiveSuppliers;
export const getSupplier = getSupplierById;
export const getSupplierDetails = getSupplierById;
export const getSupplierBySlug = getSupplierById;
export const getSupplierByUserId = getSupplierByOwner;
export const getMySupplier = getCurrentSupplier;
export const getMySupplierProfile = getCurrentSupplier;
export const getSupplierImages = getSupplierMedia;
export const getMediaBySupplier = getSupplierMedia;
export const getSupplierPhotos = getSupplierMedia;
export const getAllCategories = getSupplierCategories;
export const listCategories = getSupplierCategories;
export const getSupplierPlan = getSupplierSubscription;
export const getSupplierSubscriptionStatus = getSupplierSubscription;
export const getSupplierLeads = getSupplierQuoteRequests;
export const getSupplierLead = getSupplierLeadById;
export const getQuoteRequestsBySupplier = getSupplierQuoteRequests;
export const getQuoteResponsesBySupplier = getSupplierResponses;
export const getQuoteResponse = getQuoteResponseByRequestId;

const suppliersApi = {
  getSupabase,
  getCurrentUser,
  getCurrentSupplier,
  getSupplierByOwner,
  getSupplierById,
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
  getSupplierUnansweredQuoteRequests,
  getSupplierResponses,
  getSupplierLeads,
  getSupplierLead,
  getSupplierLeadById,
  getQuoteRequestsBySupplier,
  getQuoteResponsesBySupplier,
  getQuoteResponseByRequestId,
  getQuoteResponse,
  createQuoteResponse,
  acceptQuoteResponse,
  requestQuoteAdjustment,
  getSupplierDisplayName,
};

export default suppliersApi;
