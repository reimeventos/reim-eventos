"use client";

import { useEffect, useState } from "react";
import {
  Crown,
  CheckCircle,
  Loader2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Supplier = {
  id: string;
  owner_id?: string | null;
  business_name?: string | null;
  name?: string | null;
  company_name?: string | null;
  status?: string | null;
  is_featured?: boolean | null;
};

type Subscription = {
  id: string;
  supplier_id: string;
  plan: string | null;
  status: string | null;
  mercadopago_status?: string | null;
  checkout_url?: string | null;
  paid_at?: string | null;
  expires_at?: string | null;
};

export default function PlanosFornecedorPage() {
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState("");
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [paymentMessage, setPaymentMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pagamento = params.get("pagamento");

    if (pagamento === "sucesso") {
      setPaymentMessage(
        "Pagamento recebido. Estamos confirmando com o Mercado Pago. Em alguns instantes seu plano será ativado."
      );
    }

    if (pagamento === "pendente") {
      setPaymentMessage(
        "Seu pagamento está pendente. Assim que for aprovado, seu plano Premium será ativado automaticamente."
      );
    }

    if (pagamento === "falha") {
      setPaymentMessage(
        "O pagamento não foi concluído. Você pode tentar novamente quando quiser."
      );
    }

    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("Você precisa estar logado como fornecedor para acessar os planos.");
        return;
      }

      const { data: supplierData, error: supplierError } = await supabase
        .from("suppliers")
        .select("*")
        .eq("owner_id", user.id)
        .limit(1)
        .maybeSingle();

      if (supplierError) {
        console.error("Erro ao buscar fornecedor:", supplierError);
        setError(
          `Erro ao buscar fornecedor: ${supplierError.message || "erro desconhecido"}`
        );
        return;
      }

      if (!supplierData) {
        setError("Nenhum fornecedor encontrado para este usuário.");
        return;
      }

      setSupplier(supplierData as Supplier);

      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from("supplier_subscriptions")
        .select("*")
        .eq("supplier_id", supplierData.id)
        .limit(1)
        .maybeSingle();

      if (subscriptionError) {
        console.error("Erro ao buscar assinatura:", subscriptionError);
      }

      if (subscriptionData) {
        setSubscription(subscriptionData as Subscription);
      } else {
        setSubscription(null);
      }
    } catch (err) {
      console.error("Erro geral ao carregar planos:", err);
      setError("Erro inesperado ao carregar a página de planos.");
    } finally {
      setLoading(false);
    }
  }

  async function handlePremiumCheckout() {
    try {
      if (!supplier?.id) {
        setError("Fornecedor não encontrado.");
        return;
      }

      setCheckoutLoading(true);
      setError("");

      const response = await fetch("/api/mercadopago/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          supplier_id: supplier.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Erro ao criar checkout:", data);
        setError(data?.error || "Erro ao iniciar pagamento.");
        return;
      }

      if (!data?.checkout_url) {
        setError("Checkout não retornou URL de pagamento.");
        return;
      }

      window.location.href = data.checkout_url;
    } catch (err) {
      console.error("Erro ao iniciar checkout:", err);
      setError("Erro inesperado ao iniciar pagamento.");
    } finally {
      setCheckoutLoading(false);
    }
  }

  const supplierName =
    supplier?.business_name ||
    supplier?.company_name ||
    supplier?.name ||
    "Fornecedor";

  const isPremiumActive =
    subscription?.plan === "premium" && subscription?.status === "ativo";

  const isPending =
    subscription?.plan === "premium" && subscription?.status === "pendente";

  return (
    <main className="min-h-screen bg-[#0b0b0f] text-white">
      <div className="mx-auto max-w-5xl px-4 py-6">
        <Link
          href="/painel-fornecedor"
          className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-300 hover:text-white"
        >
          <ArrowLeft size={18} />
          Voltar ao painel
        </Link>

        <section className="mb-8 rounded-3xl border border-yellow-500/20 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black p-6 shadow-2xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-sm text-yellow-300">
                <Crown size={16} />
                Planos do fornecedor
              </div>

              <h1 className="text-2xl font-bold md:text-4xl">
                Destaque sua empresa no REIM EVENTOS
              </h1>

              <p className="mt-3 max-w-2xl text-sm text-zinc-300 md:text-base">
                Ative o plano Premium Mensal e deixe seu fornecedor visível para
                clientes encontrarem, salvarem e solicitarem orçamento.
              </p>
            </div>

            <div className="rounded-2xl border border-yellow-500/20 bg-black/40 p-4 text-center">
              <p className="text-sm text-zinc-400">Premium Mensal</p>
              <p className="mt-1 text-3xl font-black text-yellow-300">R$ 5</p>
              <p className="text-xs text-zinc-500">pagamento avulso</p>
            </div>
          </div>
        </section>

        {loading && (
          <div className="flex items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-zinc-300">
            <Loader2 className="mr-2 animate-spin" size={20} />
            Carregando planos...
          </div>
        )}

        {!loading && error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            <AlertCircle className="mt-0.5 shrink-0" size={20} />
            <span>{error}</span>
          </div>
        )}

        {!loading && paymentMessage && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-100">
            <AlertCircle className="mt-0.5 shrink-0" size={20} />
            <span>{paymentMessage}</span>
          </div>
        )}

        {!loading && supplier && (
          <div className="grid gap-6 md:grid-cols-2">
            <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-900">
                  <CheckCircle className="text-zinc-300" size={22} />
                </div>
                <div>
                  <h2 className="font-bold">Plano Atual</h2>
                  <p className="text-sm text-zinc-400">{supplierName}</p>
                </div>
              </div>

              {isPremiumActive ? (
                <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-4">
                  <p className="font-semibold text-green-300">Premium ativo</p>
                  <p className="mt-1 text-sm text-green-100/80">
                    Seu fornecedor está ativo e destacado no REIM EVENTOS.
                  </p>

                  {subscription?.expires_at && (
                    <p className="mt-3 text-xs text-green-100/60">
                      Válido até:{" "}
                      {new Date(subscription.expires_at).toLocaleDateString(
                        "pt-BR"
                      )}
                    </p>
                  )}
                </div>
              ) : isPending ? (
                <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4">
                  <p className="font-semibold text-yellow-300">
                    Pagamento pendente
                  </p>
                  <p className="mt-1 text-sm text-yellow-100/80">
                    Seu checkout foi iniciado. Após aprovação do Mercado Pago,
                    o plano será ativado automaticamente.
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl border border-zinc-700 bg-zinc-900 p-4">
                  <p className="font-semibold text-zinc-100">
                    Plano gratuito/inativo
                  </p>
                  <p className="mt-1 text-sm text-zinc-400">
                    Ative o Premium para aparecer com destaque e receber mais
                    pedidos de orçamento.
                  </p>
                </div>
              )}

              <button
                onClick={loadData}
                className="mt-4 w-full rounded-xl border border-zinc-700 px-4 py-3 text-sm font-semibold text-zinc-200 hover:bg-zinc-900"
              >
                Atualizar status
              </button>
            </section>

            <section className="rounded-3xl border border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 via-zinc-950 to-zinc-950 p-6 shadow-xl">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-500/20">
                  <Crown className="text-yellow-300" size={25} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-yellow-300">
                    Premium Mensal
                  </h2>
                  <p className="text-sm text-zinc-300">
                    Pagamento único válido por 30 dias
                  </p>
                </div>
              </div>

              <div className="mb-5">
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-black text-white">R$ 5</span>
                  <span className="mb-2 text-sm text-zinc-400">/ mês</span>
                </div>
              </div>

              <ul className="mb-6 space-y-3 text-sm text-zinc-200">
                <li className="flex gap-2">
                  <CheckCircle className="shrink-0 text-yellow-300" size={18} />
                  Fornecedor ativo na busca pública
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="shrink-0 text-yellow-300" size={18} />
                  Destaque na vitrine do REIM EVENTOS
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="shrink-0 text-yellow-300" size={18} />
                  Recebimento de pedidos de orçamento
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="shrink-0 text-yellow-300" size={18} />
                  Validade de 30 dias após aprovação
                </li>
              </ul>

              <button
                onClick={handlePremiumCheckout}
                disabled={checkoutLoading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-yellow-400 px-5 py-4 text-base font-black text-black shadow-lg hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {checkoutLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Abrindo pagamento...
                  </>
                ) : isPremiumActive ? (
                  <>
                    <Crown size={20} />
                    Renovar Premium por R$ 5
                  </>
                ) : (
                  <>
                    <Crown size={20} />
                    Ativar Premium por R$ 5
                  </>
                )}
              </button>

              <p className="mt-3 text-center text-xs text-zinc-500">
                Você será redirecionado para o Checkout Pro do Mercado Pago.
              </p>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
