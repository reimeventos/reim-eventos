import { supabase } from './supabase';

export async function listPlans() {
  const { data, error } = await supabase.from('plans').select('*').eq('is_active', true).order('price_cents');
  if (error) throw error;
  return data ?? [];
}

// V2: simulação local. No V3 entra Mercado Pago real via webhook.
export async function simulatePlanActivation(planId: string) {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error('Login necessário');

  const { data: supplier, error: supplierError } = await supabase
    .from('suppliers')
    .select('*')
    .eq('owner_id', user.id)
    .single();
  if (supplierError) throw supplierError;

  const { data: plan, error: planError } = await supabase
    .from('plans')
    .select('*')
    .eq('id', planId)
    .single();
  if (planError) throw planError;

  const now = new Date();
  const ends = new Date(now);
  ends.setDate(ends.getDate() + plan.duration_days);

  const { error: subError } = await supabase.from('subscriptions').insert({
    supplier_id: supplier.id,
    plan_id: planId,
    status: 'ativa',
    starts_at: now.toISOString(),
    ends_at: ends.toISOString(),
    payment_provider: 'simulado'
  });
  if (subError) throw subError;

  const hasMinimumProfile = Boolean(supplier.business_name && supplier.city && supplier.whatsapp && supplier.category_id);
  await supabase.from('suppliers').update({ status: hasMinimumProfile ? 'ativo' : 'pendente_perfil' }).eq('id', supplier.id);

  return true;
}
