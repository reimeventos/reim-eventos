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

  /*
    Temporariamente sem filtro de status.
    Assim conseguimos mostrar fornecedores cadastrados no Supabase,
    mesmo que estejam como ativo, aprovado, pendente ou outro status.
  */

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

  if (error) {
    console.error('Erro em listSuppliers:', error);
    throw error;
  }

  return data ?? [];
}

export async function getSupplier(id: string) {
  const { data, error } = await supabase
    .from('suppliers')
    .select('*, categories(name, slug), media(file_url, is_cover)')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Erro em getSupplier:', error);
    throw error;
  }

  return data;
}

export async function listCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('Erro em listCategories:', error);
    throw error;
  }

  return data ?? [];
}
