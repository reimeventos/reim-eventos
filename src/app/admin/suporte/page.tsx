"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Headset,
  Loader2,
  Mail,
  MessageCircle,
  RefreshCw,
  Send,
  ShieldCheck,
  User,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type SupportTicket = {
  id: string;
  user_id?: string | null;
  user_email?: string | null;
  user_name?: string | null;
  reason?: string | null;
  message: string;
  status?: string | null;
  source?: string | null;
  admin_reply?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

function formatDateBR(dateValue?: string | null) {
  if (!dateValue) return "Sem data";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Sem data";
  }

  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusInfo(status?: string | null) {
  const normalized = String(status || "").toLowerCase();

  if (["resolvido", "fechado", "concluido", "concluído"].includes(normalized)) {
    return {
      label: "Resolvido",
      className: "bg-green-50 text-green-700",
      icon: CheckCircle2,
    };
  }

  if (["em_atendimento", "em atendimento", "andamento"].includes(normalized)) {
    return {
      label: "Em atendimento",
      className: "bg-blue-50 text-blue-700",
      icon: MessageCircle,
    };
  }

  return {
    label: "Aberto",
    className: "bg-[#fff7e8] text-[#b97900]",
    icon: Clock,
  };
}

export default function AdminSuportePage() {
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [reply, setReply] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function loadTickets() {
    try {
      setLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      const loadedTickets = (data || []) as SupportTicket[];

      setTickets(loadedTickets);

      if (selectedTicket) {
        const updatedSelected = loadedTickets.find((item) => item.id === selectedTicket.id);
        setSelectedTicket(updatedSelected || null);
        setReply(updatedSelected?.admin_reply || "");
      } else if (loadedTickets.length > 0) {
        setSelectedTicket(loadedTickets[0]);
        setReply(loadedTickets[0].admin_reply || "");
      }
    } catch (error: any) {
      console.error("Erro ao carregar suporte:", error);
      setErrorMessage(error?.message || "Não foi possível carregar os chamados de suporte.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTickets();
  }, []);

  async function updateTicketStatus(ticket: SupportTicket, status: string) {
    try {
      setSavingId(ticket.id);
      setErrorMessage("");

      const { error } = await supabase
        .from("support_tickets")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", ticket.id);

      if (error) {
        throw error;
      }

      await loadTickets();
    } catch (error: any) {
      console.error("Erro ao atualizar chamado:", error);
      setErrorMessage(error?.message || "Não foi possível atualizar o chamado.");
    } finally {
      setSavingId("");
    }
  }

  async function saveReply() {
    if (!selectedTicket) return;

    try {
      setSavingId(selectedTicket.id);
      setErrorMessage("");

      const { error } = await supabase
        .from("support_tickets")
        .update({
          admin_reply: reply.trim(),
          status: reply.trim() ? "em_atendimento" : selectedTicket.status || "aberto",
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedTicket.id);

      if (error) {
        throw error;
      }

      await loadTickets();
    } catch (error: any) {
      console.error("Erro ao salvar resposta:", error);
      setErrorMessage(error?.message || "Não foi possível salvar a resposta.");
    } finally {
      setSavingId("");
    }
  }

  const openTickets = tickets.filter((item) => String(item.status || "aberto").toLowerCase() === "aberto").length;
  const answeredTickets = tickets.filter((item) => String(item.status || "").toLowerCase() === "em_atendimento").length;
  const solvedTickets = tickets.filter((item) =>
    ["resolvido", "fechado", "concluido", "concluído"].includes(String(item.status || "").toLowerCase())
  ).length;

  return (
    <main className="min-h-screen bg-black text-[#151515]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#fbf7f1] pb-10 shadow-2xl">
        <section className="relative overflow-hidden rounded-b-[34px] bg-black px-6 pb-8 pt-7 text-white">
          <div className="absolute inset-0 bg-[url('/layout01-fundo.png')] bg-cover bg-center opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/85 to-black" />

          <div className="relative z-10">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#e3a925]"
            >
              <ArrowLeft size={17} />
              Voltar para Admin
            </Link>

            <div className="mt-6 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e3a925] text-white shadow-lg">
                <Headset size={31} />
              </div>

              <div>
                <p className="text-sm font-bold text-[#e3a925]">
                  Administração
                </p>

                <h1 className="font-serif text-[34px] leading-tight">
                  Suporte
                </h1>

                <p className="mt-1 text-sm text-white/70">
                  Atendimentos enviados por clientes e fornecedores.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={loadTickets}
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-[22px] bg-white px-4 py-4 text-sm font-extrabold text-black disabled:opacity-60"
            >
              {loading ? (
                <Loader2 size={19} className="animate-spin" />
              ) : (
                <RefreshCw size={19} />
              )}
              Atualizar chamados
            </button>
          </div>
        </section>

        <section className="grid grid-cols-3 gap-3 px-6 pt-6">
          <div className="rounded-[22px] bg-white p-4 text-center shadow-sm ring-1 ring-[#f1e7cf]">
            <p className="text-2xl font-extrabold text-[#d99200]">{openTickets}</p>
            <p className="mt-1 text-[11px] font-bold text-gray-600">Abertos</p>
          </div>

          <div className="rounded-[22px] bg-white p-4 text-center shadow-sm ring-1 ring-[#f1e7cf]">
            <p className="text-2xl font-extrabold text-blue-600">{answeredTickets}</p>
            <p className="mt-1 text-[11px] font-bold text-gray-600">Atend.</p>
          </div>

          <div className="rounded-[22px] bg-white p-4 text-center shadow-sm ring-1 ring-[#f1e7cf]">
            <p className="text-2xl font-extrabold text-green-600">{solvedTickets}</p>
            <p className="mt-1 text-[11px] font-bold text-gray-600">Resolvidos</p>
          </div>
        </section>

        <section className="px-6 pt-6">
          {errorMessage && (
            <div className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {errorMessage}
            </div>
          )}

          {loading && (
            <div className="rounded-[28px] bg-white p-6 text-center shadow-sm ring-1 ring-[#f1e7cf]">
              <Loader2 size={38} className="mx-auto animate-spin text-[#d99200]" />
              <p className="mt-3 text-sm font-bold text-gray-500">
                Carregando chamados...
              </p>
            </div>
          )}

          {!loading && tickets.length === 0 && (
            <div className="rounded-[28px] bg-white p-6 text-center shadow-sm ring-1 ring-[#f1e7cf]">
              <Headset size={42} className="mx-auto text-[#d99200]" />

              <h2 className="mt-4 text-xl font-extrabold">
                Nenhum chamado ainda
              </h2>

              <p className="mt-2 text-sm leading-5 text-gray-500">
                Quando cliente, fornecedor ou cerimonialista enviar uma solicitação pelo Perfil, ela aparecerá aqui.
              </p>
            </div>
          )}

          {!loading && tickets.length > 0 && (
            <>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-extrabold">Chamados recebidos</h2>
                <span className="text-xs font-bold text-gray-500">
                  {tickets.length} total
                </span>
              </div>

              <div className="space-y-4">
                {tickets.map((ticket) => {
                  const statusInfo = getStatusInfo(ticket.status);
                  const StatusIcon = statusInfo.icon;
                  const isSelected = selectedTicket?.id === ticket.id;

                  return (
                    <button
                      key={ticket.id}
                      type="button"
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setReply(ticket.admin_reply || "");
                      }}
                      className={`w-full rounded-[28px] bg-white p-5 text-left shadow-[0_10px_25px_rgba(0,0,0,.08)] ring-1 ${
                        isSelected ? "ring-[#e3a925]" : "ring-[#f1e7cf]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-extrabold uppercase tracking-wide text-[#d99200]">
                            {ticket.reason || "Suporte"}
                          </p>

                          <h3 className="mt-1 text-lg font-extrabold">
                            {ticket.user_name || ticket.user_email || "Usuário"}
                          </h3>

                          <p className="mt-1 text-xs font-bold text-gray-500">
                            {formatDateBR(ticket.created_at)}
                          </p>
                        </div>

                        <span className={`flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-extrabold ${statusInfo.className}`}>
                          <StatusIcon size={13} />
                          {statusInfo.label}
                        </span>
                      </div>

                      <p className="mt-3 line-clamp-2 text-sm font-medium leading-5 text-gray-600">
                        {ticket.message}
                      </p>
                    </button>
                  );
                })}
              </div>

              {selectedTicket && (
                <div className="mt-6 rounded-[28px] bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,.08)] ring-1 ring-[#f1e7cf]">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff7e8] text-[#d99200]">
                      <User size={30} />
                    </div>

                    <div className="flex-1">
                      <p className="text-xs font-extrabold uppercase tracking-wide text-[#d99200]">
                        Chamado selecionado
                      </p>

                      <h2 className="mt-1 text-lg font-extrabold">
                        {selectedTicket.user_name || "Usuário"}
                      </h2>

                      <p className="mt-2 flex items-center gap-2 break-all text-sm font-bold text-gray-500">
                        <Mail size={16} className="text-[#d99200]" />
                        {selectedTicket.user_email || "Sem e-mail"}
                      </p>

                      <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#fff7e8] px-4 py-2 text-xs font-extrabold text-[#b97900]">
                        <ShieldCheck size={15} />
                        {selectedTicket.reason || "Suporte"}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl bg-[#fbf7f1] p-4">
                    <p className="text-xs font-extrabold uppercase tracking-wide text-gray-500">
                      Mensagem do usuário
                    </p>

                    <p className="mt-2 whitespace-pre-wrap text-sm font-bold leading-6 text-[#151515]">
                      {selectedTicket.message}
                    </p>
                  </div>

                  <div className="mt-4">
                    <label className="text-sm font-extrabold text-[#151515]">
                      Resposta / anotação do Admin
                    </label>

                    <textarea
                      value={reply}
                      onChange={(event) => setReply(event.target.value)}
                      rows={5}
                      className="mt-2 w-full resize-none rounded-2xl border border-[#f1e7cf] bg-[#fbf7f1] px-4 py-4 text-sm font-bold leading-5 text-[#151515] outline-none placeholder:text-gray-400"
                      placeholder="Digite uma resposta ou anotação interna..."
                    />
                  </div>

                  <button
                    type="button"
                    onClick={saveReply}
                    disabled={savingId === selectedTicket.id}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-[22px] bg-black px-4 py-4 text-sm font-extrabold text-white disabled:opacity-60"
                  >
                    {savingId === selectedTicket.id ? (
                      <Loader2 size={19} className="animate-spin" />
                    ) : (
                      <Send size={19} />
                    )}
                    Salvar resposta
                  </button>

                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => updateTicketStatus(selectedTicket, "em_atendimento")}
                      disabled={savingId === selectedTicket.id}
                      className="rounded-[20px] bg-blue-50 px-4 py-3 text-xs font-extrabold text-blue-700 disabled:opacity-60"
                    >
                      Em atendimento
                    </button>

                    <button
                      type="button"
                      onClick={() => updateTicketStatus(selectedTicket, "resolvido")}
                      disabled={savingId === selectedTicket.id}
                      className="rounded-[20px] bg-green-50 px-4 py-3 text-xs font-extrabold text-green-700 disabled:opacity-60"
                    >
                      Resolvido
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
