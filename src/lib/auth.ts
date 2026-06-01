import { supabase } from './supabase';

export async function login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function registerClient(input: { fullName: string; email: string; password: string; whatsapp?: string; city?: string }) {
  const { data, error } = await supabase.auth.signUp({ email: input.email, password: input.password });
  if (error) throw error;
  const userId = data.user?.id;
  if (!userId) throw new Error('Usuário não criado');

  const { error: profileError } = await supabase.from('profiles').insert({
    id: userId,
    role: 'cliente',
    full_name: input.fullName,
    email: input.email,
    whatsapp: input.whatsapp,
    city: input.city,
    state: 'BA'
  });
  if (profileError) throw profileError;
  return data;
}

export async function registerSupplier(input: { fullName: string; businessName: string; email: string; password: string; whatsapp: string; city: string }) {
  const { data, error } = await supabase.auth.signUp({ email: input.email, password: input.password });
  if (error) throw error;
  const userId = data.user?.id;
  if (!userId) throw new Error('Usuário não criado');

  const { error: profileError } = await supabase.from('profiles').insert({
    id: userId,
    role: 'fornecedor',
    full_name: input.fullName,
    email: input.email,
    whatsapp: input.whatsapp,
    city: input.city,
    state: 'BA'
  });
  if (profileError) throw profileError;

  const { error: supplierError } = await supabase.from('suppliers').insert({
    owner_id: userId,
    business_name: input.businessName,
    city: input.city,
    whatsapp: input.whatsapp,
    state: 'BA',
    status: 'pendente_perfil'
  });
  if (supplierError) throw supplierError;
  return data;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
