"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Crown,
  Edit3,
  Eye,
  FileText,
  Home,
  ImageIcon,
  Loader2,
  LogOut,
  MessageCircle,
  Search,
  Star,
  Store,
  User,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Supplier = {
  id: string;
  owner_id?: string | null;
  status?: string | null;
  is_featured?: boolean | null;
  created_at?: string | null;
  business_name?: string | null;
  company_name?: string | null;
  fantasy_name?: string | null;
  name?: string | null;
  title?: string | null;
  category?: string | null;
  city?: string | null;
  state?: string | null;
};

type Subscription = {
  id?: string;
  supplier_id?: string;
  status?: string | null;
  plan_name?: string | null;
  plan?: string | null;
  public_label?: string | null;
  current_period_end?: string | null;
  ends_at?: string | null;
  trial_ends_at?: string | null;
  created_at?: string | null;
};

type DashboardStats = {
  totalLeads: number;
  unansweredLeads: number;
  totalResponses: number;
  closedQuotes: number;
  unreadMessages: number;
};

function getSupplierName(supplier: Supplier | null) {
  if (!supplier) return "Fornecedor";
  return supplier.business_name || supplier.company_name || supplier.fantasy_name || supplier.name || supplier.title || "Minha vitrine";
}

function formatDateBR(dateValue?: string | null) {
  if (!dateValue) return null;
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("pt-BR");
}

function getPlanName(subscription: Subscription | null, supplier: Supplier | null) {
  if (!subscription) {
    if (supplier?.is_featured) return "Premium Destaque";
    return "gratuito";
  }

  return subscription.plan_name || subscription.plan || subscription.public_label || (supplier?.is_featured ? "Premium Destaque" : "gratuito");
}

function isActiveSubscription(subscription: Subscription | null) {
  if (!subscription) return false;
  const status = String(subscription.status || "").toLowerCase();
  return ["active", "ativo", "trialing", "teste", "paid", "pago"].includes(status);
}

export default function PainelFornecedorPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    unansweredLeads: 0,
    totalResponses: 0,
    closedQuotes: 0,
    unreadMessages: 0,
  });

  const supplierName = getSupplierName(supplier);
  const planName = getPlanName(subscription, supplier);
  const planActive = isActiveSubscription(subscription);

  const planEndDate =
    formatDateBR(subscription?.current_period_end) ||
    formatDateBR(subscription?.ends_at) ||
    formatDateBR(subscription?.trial_ends_at);

  async function loadDashboard() {
    try {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push("/login");
        return;
      }

      const { data: supplierData, error: supplierError } = await supabase
        .from("suppliers")
        .select("*")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (supplierError) console.error("Erro ao buscar fornecedor:", supplierError);

      if (!supplierData) {
        setSupplier(null);
        setLoading(false);
        return;
      }

      const currentSupplier = supplierData as Supplier;
      setSupplier(currentSupplier);

      const supplierId = currentSupplier.id;

      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from("supplier_subscriptions")
        .select("*")
        .eq("supplier_id", supplierId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (subscriptionError) console.error("Erro ao buscar assinatura:", subscriptionError);

      setSubscription((subscriptionData as Subscription) || null);

      const { count: totalLeadsCount } = await supabase
        .from("quote_requests")
        .select("id", { count: "exact", head: true })
        .eq("supplier_id", supplierId);

      const { count: unansweredLeadsCount } = await supabase
        .from("supplier_unanswered_quote_requests")
        .select("id", { count: "exact", head: true })
        .eq("supplier_owner_id", user.id);

      const { count: responsesCount } = await supabase
        .from("quote_responses")
        .select("id", { count: "exact", head: true })
        .eq("supplier_id", supplierId);

      const { count: closedQuotesCount } = await supabase
        .from("quote_requests")
        .select("id", { count: "exact", head: true })
        .eq("supplier_id", supplierId)
        .in("status", ["aceito", "accepted", "fechado", "closed"]);

      let unreadMessagesCount = 0;

      const { data: supplierQuotes } = await supabase
        .from("quote_requests")
        .select("id")
        .eq("supplier_id", supplierId);

      const quoteIds = supplierQuotes?.map((item: { id: string }) => item.id) || [];

      if (quoteIds.length > 0) {
        const { count: messagesCount } = await supabase
          .from("quote_messages")
          .select("id", { count: "exact", head: true })
          .in("quote_request_id", quoteIds)
          .eq("read_by_supplier", false);

        unreadMessagesCount = messagesCount || 0;
      }

      setStats({
        totalLeads: totalLeadsCount || 0,
        unansweredLeads: unansweredLeadsCount || 0,
        totalResponses: responsesCount || 0,
        closedQuotes: closedQuotesCount || 0,
        unreadMessages: unreadMessagesCount,
      });
    } catch (error) {
      console.error("Erro ao carregar painel:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-amber-400" />
          <p className="text-white font-bold">Carregando painel...</p>
        </div>
      </main>
    );
  }

  if (!supplier) {
    return (
      <main className="min-h-screen bg-black flex justify-center">
        <section className="w-full max-w-[390px] min-h-screen bg-[#f8f2e9] px-5 py-8">
          <div className="bg-white rounded-[32px] p-7 shadow-sm border border-amber-100">
            <div className="w-14 h-14 rounded-2xl bg-pink-500 text-white flex items-center justify-center mb-5">
              <Store className="w-7 h-7" />
            </div>

            <h1 className="text-2xl font-black text-slate-950 mb-2">Complete sua vitrine</h1>

            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              Ainda não encontramos uma vitrine vinculada ao seu usuário. Cadastre os dados do seu negócio para começar a receber pedidos de orçamento.
            </p>

            <Link href="/fornecedor/cadastro" className="w-full h-[52px] rounded-2xl bg-black text-white font-black flex items-center justify-center">
              Criar minha vitrine
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black flex justify-center">
      <section className="w-full max-w-[390px] min-h-screen bg-[#f8f2e9] pb-24">
        <div className="bg-black text-white rounded-b-[36px] px-5 pt-7 pb-7 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(236,72,153,0.35),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(245,158,11,0.28),transparent_35%)]" />

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-[11px] font-black text-amber-300 uppercase tracking-wide">Painel do fornecedor</p>
                <h1 className="text-[25px] font-black mt-1 leading-[1.05] max-w-[255px]">Olá, {supplierName}</h1>
              </div>

              <button onClick={handleLogout} className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center shrink-0" aria-label="Sair">
                <LogOut className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-[26px] bg-white/10 border border-white/10 p-4 mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-400 text-black flex items-center justify-center">
                  <Crown className="w-6 h-6" />
                </div>

                <div>
                  <p className="text-xs text-white/75 font-bold">Status da vitrine</p>
                  <p className="font-black text-amber-300 flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 fill-amber-300" />
                    4.9 • {planName}
                  </p>
                </div>
              </div>
            </div>

            {stats.unansweredLeads > 0 && (
              <div className="rounded-[22px] bg-white px-4 py-4 shadow-sm flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-pink-500 flex items-center justify-center text-white">
                  <Bell className="w-5 h-5" />
                </div>

                <div>
                  <p className="font-black text-slate-900 text-sm">Atenção nos leads</p>
                  <p className="text-xs font-bold text-slate-700">{stats.unansweredLeads} lead(s) novo(s) aguardando resposta.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-5 pt-5">
          <div className="grid grid-cols-4 gap-2 mb-4">
            <div className="bg-white rounded-2xl border border-amber-100 p-3 text-center">
              <p className="text-lg font-black text-amber-500">{stats.totalLeads}</p>
              <p className="text-[11px] font-bold text-slate-700 mt-1">Leads</p>
            </div>

            <div className="bg-white rounded-2xl border border-amber-100 p-3 text-center">
              <p className="text-lg font-black text-pink-500">{stats.unreadMessages}</p>
              <p className="text-[11px] font-bold text-slate-700 mt-1">Msgs</p>
            </div>

            <div className="bg-white rounded-2xl border border-amber-100 p-3 text-center">
              <p className="text-lg font-black text-blue-600">{stats.totalResponses}</p>
              <p className="text-[11px] font-bold text-slate-700 mt-1">Resp.</p>
            </div>

            <div className="bg-white rounded-2xl border border-amber-100 p-3 text-center">
              <p className="text-lg font-black text-green-600">{stats.closedQuotes}</p>
              <p className="text-[11px] font-bold text-slate-700 mt-1">Fechado</p>
            </div>
          </div>

          <div className="rounded-[26px] bg-emerald-50 border border-emerald-100 p-5 mb-4">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-white text-emerald-700 flex items-center justify-center shrink-0">
                <Crown className="w-6 h-6" />
              </div>

              <div>
                <p className="font-black text-emerald-700">{planActive ? "Plano ativo" : "Plano não ativo"}</p>

                <p className="text-sm text-emerald-700/80 font-bold mt-1">
                  {planActive && planEndDate
                    ? `Seu plano está ativo até ${planEndDate}.`
                    : planActive
                    ? "Seu plano está ativo."
                    : "Ative um plano para aparecer melhor na vitrine."}
                </p>

                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="px-4 py-2 rounded-full bg-white text-emerald-700 text-xs font-black">{planName}</span>
                  <span className="px-4 py-2 rounded-full bg-white text-emerald-700 text-xs font-black">{planActive ? "Ativo" : "Pendente"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[26px] bg-emerald-50 border border-emerald-100 p-5 mb-7">
            <p className="font-black text-emerald-700 mb-4">Status público da vitrine</p>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/80 p-4">
                <p className="text-[10px] font-black text-emerald-600/70 uppercase">Nas buscas</p>
                <p className="font-black text-emerald-700 mt-2">{supplier.status === "ativo" || supplier.status === "active" ? "Aparecendo" : "Pendente"}</p>
              </div>

              <div className="rounded-2xl bg-white/80 p-4">
                <p className="text-[10px] font-black text-emerald-600/70 uppercase">Orçamentos</p>
                <p className="font-black text-emerald-700 mt-2">{supplier.status === "ativo" || supplier.status === "active" ? "Recebendo" : "Bloqueado"}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-slate-950">Ações rápidas</h2>
            <Link href="/painel-fornecedor/leads" className="text-sm font-black text-slate-500">Gerenciar</Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/painel-fornecedor/leads"
              className={`relative rounded-[24px] bg-white p-4 border min-h-[132px] ${
                stats.unansweredLeads > 0 ? "border-pink-400 shadow-[0_0_0_2px_rgba(236,72,153,0.12)]" : "border-amber-100"
              }`}
            >
              {stats.unansweredLeads > 0 && (
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center font-black">
                  {stats.unansweredLeads}
                </div>
              )}

              <div className="w-11 h-11 rounded-2xl bg-pink-500 text-white flex items-center justify-center mb-4">
                <MessageCircle className="w-5 h-5" />
              </div>

              <p className="font-black text-slate-950 text-sm">Leads recebidos</p>
              <p className="text-xs text-slate-500 mt-2 leading-snug">
                {stats.unansweredLeads > 0 ? `${stats.unansweredLeads} lead(s) novo(s) aguardando resposta` : "Acompanhe seus pedidos"}
              </p>
            </Link>

            <Link href={`/fornecedor/${supplier.id}/editar`} className="rounded-[24px] bg-white p-4 border border-amber-100 min-h-[132px]">
              <div className="w-11 h-11 rounded-2xl bg-black text-white flex items-center justify-center mb-4">
                <Edit3 className="w-5 h-5" />
              </div>
              <p className="font-black text-slate-950 text-sm">Editar vitrine</p>
              <p className="text-xs text-slate-500 mt-2 leading-snug">Atualize nome, descrição e serviços</p>
            </Link>

            <Link href={`/fornecedor/${supplier.id}`} className="rounded-[24px] bg-white p-4 border border-amber-100 min-h-[132px]">
              <div className="w-11 h-11 rounded-2xl bg-amber-400 text-black flex items-center justify-center mb-4">
                <Eye className="w-5 h-5" />
              </div>
              <p className="font-black text-slate-950 text-sm">Ver vitrine</p>
              <p className="text-xs text-slate-500 mt-2 leading-snug">Veja como os clientes enxergam seu perfil</p>
            </Link>

            <Link href="/planos" className="rounded-[24px] bg-white p-4 border border-amber-100 min-h-[132px]">
              <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mb-4">
                <Crown className="w-5 h-5" />
              </div>
              <p className="font-black text-slate-950 text-sm">Meu plano</p>
              <p className="text-xs text-slate-500 mt-2 leading-snug">Gerencie assinatura e destaque</p>
            </Link>

            <Link href="/buscar" className="rounded-[24px] bg-white p-4 border border-amber-100 min-h-[132px]">
              <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-4">
                <Search className="w-5 h-5" />
              </div>
              <p className="font-black text-slate-950 text-sm">Buscar</p>
              <p className="text-xs text-slate-500 mt-2 leading-snug">Consulte a vitrine pública do REIM</p>
            </Link>

            <Link href="/perfil" className="rounded-[24px] bg-white p-4 border border-amber-100 min-h-[132px]">
              <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center mb-4">
                <User className="w-5 h-5" />
              </div>
              <p className="font-black text-slate-950 text-sm">Perfil</p>
              <p className="text-xs text-slate-500 mt-2 leading-snug">Dados da conta e notificações</p>
            </Link>
          </div>

          <div className="mt-6 rounded-[26px] bg-black text-white p-5">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-white text-black flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>

              <div>
                <p className="font-black">Regra dos alertas</p>
                <p className="text-sm text-white/70 mt-1 leading-relaxed">
                  Leads novos ficam destacados até que o fornecedor envie uma resposta ao cliente.
                </p>
              </div>
            </div>
          </div>
        </div>

        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-white/95 backdrop-blur border-t border-amber-100 rounded-t-[28px] px-6 pt-3 pb-4 shadow-[0_-10px_30px_rgba(0,0,0,0.08)]">
          <div className="grid grid-cols-5 items-end text-[10px] font-bold text-slate-700">
            <Link href="/" className="flex flex-col items-center gap-1 text-amber-500">
              <Home className="w-5 h-5" />
              Home
            </Link>

            <Link href="/painel-fornecedor/fotos" className="flex flex-col items-center gap-1">
              <ImageIcon className="w-5 h-5" />
              Mídias
            </Link>

            <Link href="/painel-fornecedor" className="flex flex-col items-center gap-1 -mt-9">
              <div className="w-16 h-16 rounded-full bg-amber-400 text-white flex items-center justify-center shadow-lg border-4 border-white">
                <Store className="w-8 h-8" />
              </div>
              Painel
            </Link>

            <Link href="/painel-fornecedor/leads" className="flex flex-col items-center gap-1">
              <MessageCircle className="w-5 h-5" />
              Leads
            </Link>

            <Link href="/perfil" className="flex flex-col items-center gap-1">
              <User className="w-5 h-5" />
              Perfil
            </Link>
          </div>
        </nav>
      </section>
    </main>
  );
}
