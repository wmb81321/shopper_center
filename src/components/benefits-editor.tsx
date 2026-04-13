"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { Pencil, X, Plus, Check } from "lucide-react";
import type { Benefit } from "@/lib/types";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });

export function BenefitsEditor({ benefit }: { benefit: Benefit }) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({
    payment_type: benefit.payment_type,
    delivery_cost: benefit.delivery_cost,
    coverage: benefit.coverage,
    delivery_days: String(benefit.delivery_days),
    required_fields: [...benefit.required_fields],
  });
  const [newField, setNewField] = useState("");

  function addField() {
    const val = newField.trim();
    if (val && !form.required_fields.includes(val)) {
      setForm((f) => ({ ...f, required_fields: [...f.required_fields, val] }));
    }
    setNewField("");
  }

  function removeField(field: string) {
    setForm((f) => ({ ...f, required_fields: f.required_fields.filter((v) => v !== field) }));
  }

  async function save() {
    setLoading(true);
    await supabase
      .from("benefits")
      .update({
        payment_type: form.payment_type,
        delivery_cost: form.delivery_cost,
        coverage: form.coverage,
        delivery_days: Number(form.delivery_days),
        required_fields: form.required_fields,
      })
      .eq("id", benefit.id);
    setLoading(false);
    setEditing(false);
    router.refresh();
  }

  function cancel() {
    setForm({
      payment_type: benefit.payment_type,
      delivery_cost: benefit.delivery_cost,
      coverage: benefit.coverage,
      delivery_days: String(benefit.delivery_days),
      required_fields: [...benefit.required_fields],
    });
    setEditing(false);
  }

  return (
    <div className="space-y-6">
      {/* Delivery config */}
      <div className="rounded-lg border">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <p className="text-sm font-semibold">Configuración de entrega</p>
          {!editing ? (
            <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
              <Pencil className="h-3.5 w-3.5 mr-1.5" />
              Editar
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={cancel}>Cancelar</Button>
              <Button size="sm" onClick={save} disabled={loading}>
                {loading ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          )}
        </div>

        <div className="p-4 space-y-4">
          {editing ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Tipo de pago</Label>
                  <Input
                    value={form.payment_type}
                    onChange={(e) => setForm((f) => ({ ...f, payment_type: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Costo de envío</Label>
                  <Input
                    value={form.delivery_cost}
                    onChange={(e) => setForm((f) => ({ ...f, delivery_cost: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Cobertura</Label>
                  <Input
                    value={form.coverage}
                    onChange={(e) => setForm((f) => ({ ...f, coverage: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Días de entrega</Label>
                  <Input
                    type="number"
                    value={form.delivery_days}
                    onChange={(e) => setForm((f) => ({ ...f, delivery_days: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Datos requeridos para ordenar</Label>
                <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                  {form.required_fields.map((field) => (
                    <Badge key={field} variant="secondary" className="gap-1 pr-1">
                      {field}
                      <button
                        onClick={() => removeField(field)}
                        className="hover:text-destructive transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Agregar campo..."
                    value={newField}
                    onChange={(e) => setNewField(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addField()}
                    className="h-8 text-sm"
                  />
                  <Button size="sm" variant="outline" onClick={addField} className="h-8">
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Tipo de pago</dt>
                <dd className="font-medium mt-0.5">{benefit.payment_type}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Costo de envío</dt>
                <dd className="font-medium mt-0.5">{benefit.delivery_cost}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Cobertura</dt>
                <dd className="font-medium mt-0.5">{benefit.coverage}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Tiempo de entrega</dt>
                <dd className="font-medium mt-0.5">{benefit.delivery_days} días hábiles</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-xs text-muted-foreground mb-1.5">Datos requeridos</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {benefit.required_fields.map((f) => (
                    <Badge key={f} variant="outline" className="text-xs font-normal">
                      <Check className="h-3 w-3 mr-1" />
                      {f}
                    </Badge>
                  ))}
                </dd>
              </div>
            </dl>
          )}
        </div>
      </div>

      {/* World Cup dates - read only */}
      {benefit.world_cup_start && (
        <div className="rounded-lg border">
          <div className="px-4 py-3 border-b">
            <p className="text-sm font-semibold">Copa del Mundo 2026</p>
          </div>
          <div className="p-4 space-y-3">
            <div className="text-sm">
              <span className="text-muted-foreground text-xs">Inicio del Mundial</span>
              <p className="font-medium mt-0.5">{formatDate(benefit.world_cup_start)}</p>
            </div>
            {benefit.colombia_matches && benefit.colombia_matches.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Partidos de Colombia</p>
                <div className="space-y-1.5">
                  {benefit.colombia_matches.map((match) => (
                    <div key={match.date} className="flex items-center justify-between text-sm py-1.5 px-3 rounded-md bg-muted/40">
                      <span className="font-medium">🇨🇴 vs {match.opponent}</span>
                      <span className="text-muted-foreground text-xs">{formatDate(match.date)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
