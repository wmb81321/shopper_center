"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import type { AgentConfig } from "@/lib/types";
import { Check, X } from "lucide-react";

export function AgentConfigEditor({ configs }: { configs: AgentConfig[] }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  function startEdit(config: AgentConfig) {
    setEditing(config.key);
    setEditValue(config.value);
  }

  async function saveEdit(config: AgentConfig) {
    setSaving(true);
    await supabase
      .from("agent_config")
      .update({ value: editValue })
      .eq("id", config.id);
    setSaving(false);
    setEditing(null);
    router.refresh();
  }

  if (configs.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        No hay configuraciones en la tabla agent_config
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {configs.map((config) => (
        <div key={config.key} className="py-3 flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-mono font-medium text-foreground">{config.key}</p>
                {config.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">{config.description}</p>
                )}
              </div>
              {editing !== config.key && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs shrink-0"
                  onClick={() => startEdit(config)}
                >
                  Editar
                </Button>
              )}
            </div>

            {editing === config.key ? (
              <div className="flex items-center gap-2 mt-2">
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="h-8 text-sm"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveEdit(config);
                    if (e.key === "Escape") setEditing(null);
                  }}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 shrink-0 text-green-500"
                  onClick={() => saveEdit(config)}
                  disabled={saving}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 shrink-0"
                  onClick={() => setEditing(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <p className="text-sm text-foreground mt-1.5 font-mono bg-muted px-2 py-1 rounded text-xs break-all">
                {config.value || <span className="text-muted-foreground italic">vacío</span>}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
