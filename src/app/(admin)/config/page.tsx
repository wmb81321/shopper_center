import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AgentConfigEditor } from "@/components/agent-config-editor";
import { Separator } from "@/components/ui/separator";

export default async function ConfigPage() {
  const supabase = await createClient();
  const { data: configs } = await supabase
    .from("agent_config")
    .select("*")
    .order("key");

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configuración</h1>
        <p className="text-sm text-muted-foreground">Ajusta el comportamiento del agente AI</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Parámetros del agente</CardTitle>
          <CardDescription>
            Estos valores controlan el tono, las políticas y los mensajes del agente en WhatsApp.
            Los cambios aplican en tiempo real.
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4">
          <AgentConfigEditor configs={configs ?? []} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Infraestructura</CardTitle>
          <CardDescription>Referencias del sistema (solo lectura)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            {[
              { label: "Supabase URL", value: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "—" },
              { label: "WhatsApp Phone ID", value: "1104608296062284" },
              { label: "n8n URL", value: "https://n8n-production-8ea7.up.railway.app" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{item.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
