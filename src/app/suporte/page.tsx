"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Headset,
  Loader2,
  Mail,
  MessageCircle,
  Send,
  ShieldCheck,
  User,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const supportReasons = [
  "Ajuda com orçamento",
  "Ajuda com fornecedor",
  "Ajuda com minha conta",
  "Ajuda com pagamento/plano",
  "Problema técnico",
  "Outro assunto",
];

export default function SuportePage() {
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profileName, setProfileName] = useState("");
  const [reason, setReason] = useState(supportReasons[0]);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function loadUser() {
    try {
      setLoading(true);
      setErrorMessage("");

      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      setUser(currentUser);

      if (currentUser?.id) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", currentUser.id)
          .maybeSingle();

        setProfileName(profileData?.full_name || "");
      }
    } catch (error: any) {
      console.error("Erro ao carregar suporte:", error);
      setErrorMessage("Não foi possível carregar seus dados.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUser();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!message.trim()) {
      setErrorMessage("Digite uma mensagem para enviar ao suporte.");
      return;
    }

    try {
      setSending(true);
      setErrorMessage("");

      const payload = {
        user_id: user?.id || null,
        user_email: user?.email || "",
        user_name: profileName || user?.email || "Usuário",
        reason,
        message: message.trim(),
        status: "aberto",
        source: "perfil",
      };

      const { error } = await supabase.from("support_tickets").insert(payload);

      if (error) {
        throw error;
      }

      setSent(true);
      setMessage("");
    } catch (error: any) {
      console.error("Erro ao enviar suporte:", error);
      setErrorMessage(
        error?.message?.includes("support_tickets")
          ? "A tabela support_tickets ainda não foi criada no Supabase."
          : error?.message || "Não foi possível enviar sua mensagem."
      );
    } finally {
      setSending(false);
    }
  }

  const displayName = profileName || user?.email || "Visitante";
  const displayEmail = user?.email || "Não logado";

  return (
    <main className="min-h-screen bg-black text-[#151515]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#fbf7f1] pb-10 shadow-2xl">
        <section className="relative overflow-hidden rounded-b-[34px] bg-black px-6 pb-8 pt-7 text-white">
          <div className="absolute inset-0 bg-[url('/layout01-fundo.png')] bg-cover bg-center opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/85 to-black" />

          <div className="relative z-10">
            <Link
              href="/perfil"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#e3a925]"
            >
              <ArrowLeft size={17} />
              Voltar para Perfil
            </Link>

            <div className="mt-6 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e3a925] text-white shadow-lg">
                <Headset size={31} />
              </div>

              <div>
                <p className="text-sm font-bold text-[#e3a925]">
                  Atendimento REIM
                </p>

                <h1 className="font-serif text-[34px] leading-tight">
                  Suporte
                </h1>

                <p className="mt-1 text-sm text-white/70">
                  Envie sua dúvida para nossa equipe.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 pt-6">
          {loading && (
            <div className="rounded-[28px] bg-white p-6 text-center shadow-sm ring-1 ring-[#f1e7cf]">
              <Loader2 size={38} className="mx-auto animate-spin text-[#d99200]" />
              <p className="mt-3 text-sm font-bold text-gray-500">
                Carregando suporte...
              </p>
            </div>
          )}

          {!loading && (
            <>
              <div className="rounded-[28px] bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,.08)] ring-1 ring-[#f1e7cf]">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff7e8] text-[#d99200]">
                    <User size={30} />
                  </div>

                  <div className="flex-1">
                    <h2 className="text-lg font-extrabold">
                      Dados do atendimento
                    </h2>

                    <p className="mt-2 text-sm font-extrabold text-[#151515]">
                      {displayName}
                    </p>

                    <p className="mt-2 flex items-center gap-2 break-all text-sm font-bold text-gray-500">
                      <Mail size={16} className="text-[#d99200]" />
                      {displayEmail}
                    </p>

                    <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#fff7e8] px-4 py-2 text-xs font-extrabold text-[#b97900]">
                      <ShieldCheck size={15} />
                      Suporte REIM
                    </div>
                  </div>
                </div>
              </div>

              {sent && (
                <div className="mt-4 rounded-[24px] bg-green-50 p-5 text-green-700 shadow-sm ring-1 ring-green-100">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={24} className="shrink-0" />
                    <div>
                      <p className="font-extrabold">Mensagem enviada</p>
                      <p className="mt-1 text-sm font-bold leading-5">
                        Recebemos sua solicitação. Nossa equipe vai acompanhar pelo painel administrativo.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                  {errorMessage}
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                className="mt-5 rounded-[28px] bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,.08)] ring-1 ring-[#f1e7cf]"
              >
                <div>
                  <label className="text-sm font-extrabold text-[#151515]">
                    Motivo do contato
                  </label>

                  <select
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    className="mt-2 h-13 w-full rounded-2xl border border-[#f1e7cf] bg-[#fbf7f1] px-4 py-4 text-sm font-bold text-[#151515] outline-none"
                  >
                    {supportReasons.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-4">
                  <label className="text-sm font-extrabold text-[#151515]">
                    Mensagem
                  </label>

                  <textarea
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    rows={7}
                    className="mt-2 w-full resize-none rounded-2xl border border-[#f1e7cf] bg-[#fbf7f1] px-4 py-4 text-sm font-bold leading-5 text-[#151515] outline-none placeholder:text-gray-400"
                    placeholder="Descreva sua dúvida ou problema..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-[24px] bg-black py-4 text-center font-extrabold text-white shadow-lg disabled:opacity-60"
                >
                  {sending ? (
                    <>
                      <Loader2 size={21} className="animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send size={21} />
                      Enviar para suporte
                    </>
                  )}
                </button>
              </form>

              <div className="mt-5 rounded-[24px] bg-[#151515] p-5 text-white shadow-lg">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e3a925]">
                    <MessageCircle size={25} />
                  </div>

                  <div>
                    <p className="text-base font-extrabold">
                      Como funciona?
                    </p>

                    <p className="mt-1 text-xs leading-5 text-white/70">
                      Este canal é para suporte geral do REIM. Para conversa comercial sobre orçamento, use o chat do orçamento com o fornecedor.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
