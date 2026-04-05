"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Bot, User, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Conversation, Message } from "@/lib/types";

type ConversationWithCustomer = Conversation & {
  customers?: { name?: string; phone?: string } | null;
};

const statusConfig = {
  ai_active: { label: "AI activo", variant: "default" as const, icon: Bot, color: "text-green-500" },
  human_active: { label: "Manual", variant: "destructive" as const, icon: User, color: "text-destructive" },
  closed: { label: "Cerrada", variant: "secondary" as const, icon: MessageSquare, color: "text-muted-foreground" },
};

const formatDate = (date?: string) => {
  if (!date) return "—";
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

export function ConversationsList({ conversations }: { conversations: ConversationWithCustomer[] }) {
  const [selected, setSelected] = useState<ConversationWithCustomer | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function openConversation(conv: ConversationWithCustomer) {
    setSelected(conv);
    setLoadingMessages(true);
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conv.id)
      .order("created_at", { ascending: true });
    setMessages(data ?? []);
    setLoadingMessages(false);
  }

  async function takeControl() {
    if (!selected) return;
    setUpdatingStatus(true);
    await supabase
      .from("conversations")
      .update({ status: "human_active" })
      .eq("id", selected.id);
    setUpdatingStatus(false);
    setSelected(null);
    router.refresh();
  }

  async function returnToBot() {
    if (!selected) return;
    setUpdatingStatus(true);
    await supabase
      .from("conversations")
      .update({ status: "ai_active" })
      .eq("id", selected.id);
    setUpdatingStatus(false);
    setSelected(null);
    router.refresh();
  }

  if (conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
        No hay conversaciones con este filtro
      </div>
    );
  }

  return (
    <>
      <div className="divide-y divide-border">
        {conversations.map((conv) => {
          const customer = Array.isArray(conv.customers) ? conv.customers[0] : conv.customers;
          const cfg = statusConfig[conv.status];
          const Icon = cfg.icon;

          return (
            <button
              key={conv.id}
              onClick={() => openConversation(conv)}
              className="w-full flex items-center justify-between px-6 py-3 hover:bg-muted/40 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <span className="text-sm font-medium">
                    {(customer?.name?.[0] ?? customer?.phone?.[0] ?? "?").toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium">{customer?.name ?? customer?.phone ?? "Desconocido"}</p>
                  {customer?.name && (
                    <p className="text-xs text-muted-foreground font-mono">{customer.phone}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">{formatDate(conv.last_message_at ?? conv.updated_at)}</span>
                <Badge variant={cfg.variant} className="text-xs gap-1">
                  <Icon className="h-3 w-3" />
                  {cfg.label}
                </Badge>
              </div>
            </button>
          );
        })}
      </div>

      <Sheet open={!!selected} onOpenChange={() => setSelected(null)}>
        <SheetContent className="w-full sm:max-w-lg flex flex-col p-0">
          <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
            <SheetTitle className="text-base">
              {(() => {
                const c = Array.isArray(selected?.customers) ? selected?.customers[0] : selected?.customers;
                return c?.name ?? c?.phone ?? "Conversación";
              })()}
            </SheetTitle>
            {selected && (
              <div className="flex gap-2 mt-2">
                {selected.status !== "human_active" && (
                  <Button size="sm" variant="destructive" onClick={takeControl} disabled={updatingStatus}>
                    <User className="h-3.5 w-3.5 mr-1.5" />
                    Tomar control
                  </Button>
                )}
                {selected.status === "human_active" && (
                  <Button size="sm" variant="outline" onClick={returnToBot} disabled={updatingStatus}>
                    <Bot className="h-3.5 w-3.5 mr-1.5" />
                    Devolver al bot
                  </Button>
                )}
              </div>
            )}
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {loadingMessages ? (
              <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
                Cargando mensajes...
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
                No hay mensajes
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.direction === "outbound" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${
                      msg.direction === "outbound"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted text-foreground rounded-bl-sm"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                    <p className={`text-xs mt-1 ${msg.direction === "outbound" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {formatDate(msg.created_at)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
