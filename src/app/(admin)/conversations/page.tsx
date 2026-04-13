import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConversationsList } from "@/components/conversations-list";

export default async function ConversationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("conversations")
    .select("*, customers(name, phone)")
    .order("updated_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data: conversations } = await query;

  const [{ count: aiCount }, { count: humanCount }] = await Promise.all([
    supabase.from("conversations").select("*", { count: "exact", head: true }).eq("status", "ai_active"),
    supabase.from("conversations").select("*", { count: "exact", head: true }).eq("status", "human_active"),
  ]);

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Conversaciones</h1>
        <p className="text-sm text-muted-foreground">Historial de chats — toma el control cuando sea necesario</p>
      </div>

      {/* Summary badges */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-sm">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-muted-foreground">AI activo:</span>
          <span className="font-medium">{aiCount ?? 0}</span>
        </div>
        {humanCount && humanCount > 0 ? (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-destructive/30 bg-destructive/5 text-sm">
            <span className="h-2 w-2 rounded-full bg-destructive" />
            <span className="text-muted-foreground">Manual activo:</span>
            <span className="font-medium text-destructive">{humanCount}</span>
          </div>
        ) : null}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {[
          { value: undefined, label: "Todas" },
          { value: "ai_active", label: "Con AI" },
          { value: "human_active", label: "Manual" },
          { value: "closed", label: "Cerradas" },
        ].map((f) => (
          <a
            key={f.value ?? "all"}
            href={f.value ? `/conversations?status=${f.value}` : "/conversations"}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              status === f.value || (!status && !f.value)
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
            }`}
          >
            {f.label}
          </a>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {conversations?.length ?? 0} conversacion{(conversations?.length ?? 0) !== 1 ? "es" : ""}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ConversationsList conversations={conversations ?? []} />
        </CardContent>
      </Card>
    </div>
  );
}
