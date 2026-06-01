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
  const hasMinimumProfile = Boolean(payload.business_name && payload.city && payload.whatsapp && payload.category_id);

  const { data, error } = await supabase
    .from('suppliers')
    .update({
      ...payload,
      status: hasMinimumProfile ? 'ativo' : 'pendente_perfil',
      updated_at: new Date().toISOString()
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
  if (!allowed.includes(file.type)) throw new Error('Envie JPG, PNG ou WEBP.');
  if (file.size > 5 * 1024 * 1024) throw new Error('A imagem deve ter no máximo 5MB.');

  const ext = file.name.split('.').pop();
  const filePath = `${supplier.id}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('supplier-media')
    .upload(filePath, file, { cacheControl: '3600', upsert: false });

  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage.from('supplier-media').getPublicUrl(filePath);

  if (isCover) {
    await supabase.from('media').update({ is_cover: false }).eq('supplier_id', supplier.id);
  }

  const { data, error } = await supabase.from('media').insert({
    supplier_id: supplier.id,
    owner_id: user.id,
    type: 'foto',
    file_url: urlData.publicUrl,
    is_cover: isCover
  }).select().single();

  if (error) throw error;
  return data;
}

export async function getSupplierLeads() {
  const supplier = await getMySupplierProfile();
  const { data, error } = await supabase
    .from('quotes')
    .select('*, events(event_name, event_date, city, guest_count), profiles(full_name, whatsapp)')
    .eq('supplier_id', supplier.id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}
