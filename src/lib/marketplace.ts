import { supabase } from './supabase';

export async function listSuppliers(filters?: {
  city?: string;
  search?: string;
  categoryId?: string;
}) {
  let query = supabase
    .from('suppliers')
    .select('*, categories(name, slug), media(file_url, is_cover)')
    .order('is_featured', { ascending: false })
    .order('rating_average', { ascending: false });

  // Aceita fornecedores ativos/aprovados.
  // Se depois quiser esconder pendentes, ajustamos aqui.
  query = query.or('status.eq.ativo,status.eq.aprovado,status.eq.active');

  if (filters?.city) {
    query = query.ilike('city', `%${filters.city}%`);
  }

  if (filters?.search) {
    query = query.or(
      `business_name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
    );
  }

  if (filters?.categoryId) {
    query = query.eq('category_id', filters.categoryId);
  }

  const { data, error } = await query;

  if (error) throw error;

  return data ?? [];
}

export async function getSupplier(id: string) {
  const { data, error } = await supabase
    .from('suppliers')
    .select('*, categories(name, slug), media(*)')
    .eq('id', id)
    .single();

  if (error) throw error;

  return data;
}

export async function listCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) throw error;

  return data ?? [];
}
