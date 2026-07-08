import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const mercadoPagoAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

type MercadoPagoPayment = {
  id?: number | string;
  status?: string;
  external_reference?: string;
  preference_id?: string;
  metadata?: {
    supplier_id?: string;
    plan?: string;
    source?: string;
  };
};

async function getPaymentFromMercadoPago(paymentId: string) {
  const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${mercadoPagoAccessToken}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Erro ao consultar pagamento Mercado Pago:", data);
    throw new Error("Erro ao consultar pagamento no Mercado Pago.");
  }

  return data as MercadoPagoPayment;
}

function addDays(date: Date, days: number) {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
}

export async function POST(request: Request) {
  try {
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return NextResponse.json(
        { error: "Variáveis do Supabase não configuradas." },
        { status: 500 }
      );
    }

    if (!mercadoPagoAccessToken) {
      return NextResponse.json(
        { error: "MERCADOPAGO_ACCESS_TOKEN não configurado." },
        { status: 500 }
      );
    }

    const body = await request.json();

    console.log("Webhook Mercado Pago recebido:", JSON.stringify(body));

    const paymentId =
      body?.data?.id ||
      body?.id ||
      body?.resource?.split?.("/")?.pop?.();

    const type = body?.type || body?.topic;

    if (!paymentId) {
      return NextResponse.json({
        success: true,
        ignored: true,
        reason: "Webhook sem paymentId.",
      });
    }

    if (type && type !== "payment") {
      return NextResponse.json({
        success: true,
        ignored: true,
        reason: `Tipo ignorado: ${type}`,
      });
    }

    const payment = await getPaymentFromMercadoPago(String(paymentId));

    const mpPaymentId = payment.id ? String(payment.id) : String(paymentId);
    const mpStatus = payment.status || "unknown";
    const preferenceId = payment.preference_id || null;
    const externalReference = payment.external_reference || null;
    const supplierIdFromMetadata = payment.metadata?.supplier_id || null;

    let supplierId: string | null = supplierIdFromMetadata;

    if (!supplierId && externalReference?.startsWith("supplier:")) {
      const parts = externalReference.split(":");
      supplierId = parts[1] || null;
    }

    if (!supplierId && preferenceId) {
      const { data: subscriptionByPreference } = await supabaseAdmin
        .from("supplier_subscriptions")
        .select("supplier_id")
        .eq("mercadopago_preference_id", preferenceId)
        .maybeSingle();

      supplierId = subscriptionByPreference?.supplier_id || null;
    }

    if (!supplierId && externalReference) {
      const { data: subscriptionByReference } = await supabaseAdmin
        .from("supplier_subscriptions")
        .select("supplier_id")
        .eq("mercadopago_external_reference", externalReference)
        .maybeSingle();

      supplierId = subscriptionByReference?.supplier_id || null;
    }

    if (!supplierId) {
      console.error("Fornecedor não identificado no webhook:", payment);

      return NextResponse.json({
        success: true,
        ignored: true,
        reason: "Fornecedor não identificado.",
      });
    }

    const now = new Date();
    const isApproved = mpStatus === "approved";

    const subscriptionStatus = isApproved ? "ativo" : "pendente";
    const paidAt = isApproved ? now.toISOString() : null;
    const expiresAt = isApproved ? addDays(now, 30).toISOString() : null;

    const updatePayload: Record<string, unknown> = {
      plan: "premium",
      status: subscriptionStatus,
      mercadopago_payment_id: mpPaymentId,
      mercadopago_status: mpStatus,
    };

    if (preferenceId) {
      updatePayload.mercadopago_preference_id = preferenceId;
    }

    if (externalReference) {
      updatePayload.mercadopago_external_reference = externalReference;
    }

    if (isApproved) {
      updatePayload.paid_at = paidAt;
      updatePayload.expires_at = expiresAt;
    }

    const { data: existingSubscription } = await supabaseAdmin
      .from("supplier_subscriptions")
      .select("id")
      .eq("supplier_id", supplierId)
      .maybeSingle();

    if (existingSubscription?.id) {
      const { error: updateError } = await supabaseAdmin
        .from("supplier_subscriptions")
        .update(updatePayload)
        .eq("id", existingSubscription.id);

      if (updateError) {
        console.error("Erro ao atualizar assinatura pelo webhook:", updateError);

        return NextResponse.json(
          { error: "Erro ao atualizar assinatura." },
          { status: 500 }
        );
      }
    } else {
      const { error: insertError } = await supabaseAdmin
        .from("supplier_subscriptions")
        .insert({
          supplier_id: supplierId,
          ...updatePayload,
        });

      if (insertError) {
        console.error("Erro ao criar assinatura pelo webhook:", insertError);

        return NextResponse.json(
          { error: "Erro ao criar assinatura." },
          { status: 500 }
        );
      }
    }

    if (isApproved) {
      const { error: supplierUpdateError } = await supabaseAdmin
        .from("suppliers")
        .update({
          status: "ativo",
          is_featured: true,
        })
        .eq("id", supplierId);

      if (supplierUpdateError) {
        console.error("Erro ao ativar fornecedor premium:", supplierUpdateError);
      }
    }

    return NextResponse.json({
      success: true,
      supplier_id: supplierId,
      payment_id: mpPaymentId,
      mercadopago_status: mpStatus,
      subscription_status: subscriptionStatus,
    });
  } catch (error) {
    console.error("Erro geral webhook Mercado Pago:", error);

    return NextResponse.json(
      { error: "Erro interno no webhook Mercado Pago." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Webhook Mercado Pago REIM EVENTOS ativo.",
  });
}
