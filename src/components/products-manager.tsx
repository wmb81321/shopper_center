"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/types";
import { Pencil, Trash2, Plus, X } from "lucide-react";

const formatCOP = (amount: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(amount);

type FormState = {
  name: string;
  short_description: string;
  description: string;
  category: string;
  product_type: string;
  combo_type: string;
  combo_items: string[];
  base_price: string;
  sale_price: string;
  price_regular: string;
  price_promo: string;
  promo_active: boolean;
  features: string[];
  size_info: string;
  ai_selling_points: string;
  ai_objection_handling: string;
  ai_keywords: string[];
  is_active: boolean;
};

const emptyForm = (): FormState => ({
  name: "",
  short_description: "",
  description: "",
  category: "",
  product_type: "individual",
  combo_type: "",
  combo_items: [],
  base_price: "",
  sale_price: "",
  price_regular: "",
  price_promo: "",
  promo_active: true,
  features: [],
  size_info: "",
  ai_selling_points: "",
  ai_objection_handling: "",
  ai_keywords: [],
  is_active: true,
});

const productToForm = (p: Product): FormState => ({
  name: p.name,
  short_description: p.short_description ?? "",
  description: p.description ?? "",
  category: p.category ?? "",
  product_type: p.product_type ?? "individual",
  combo_type: p.combo_type ?? "",
  combo_items: p.combo_items ?? [],
  base_price: String(p.base_price),
  sale_price: String(p.sale_price),
  price_regular: p.price_regular != null ? String(p.price_regular) : "",
  price_promo: p.price_promo != null ? String(p.price_promo) : "",
  promo_active: p.promo_active ?? true,
  features: p.features ?? [],
  size_info: p.size_info ?? "",
  ai_selling_points: p.ai_selling_points ?? "",
  ai_objection_handling: p.ai_objection_handling ?? "",
  ai_keywords: p.ai_keywords ?? [],
  is_active: p.is_active,
});

function TagInput({ label, values, onChange }: { label: string; values: string[]; onChange: (v: string[]) => void }) {
  const [input, setInput] = useState("");
  function add() {
    const val = input.trim();
    if (val && !values.includes(val)) onChange([...values, val]);
    setInput("");
  }
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <div className="flex flex-wrap gap-1.5 min-h-[28px]">
        {values.map((v) => (
          <Badge key={v} variant="secondary" className="gap-1 pr-1 text-xs">
            {v}
            <button onClick={() => onChange(values.filter((x) => x !== v))}>
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
          placeholder="Escribir y Enter..."
          className="h-8 text-sm"
        />
        <Button type="button" size="sm" variant="outline" className="h-8 px-2" onClick={add}>
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

function ProductForm({ form, onChange }: { form: FormState; onChange: (f: FormState) => void }) {
  const set = (patch: Partial<FormState>) => onChange({ ...form, ...patch });
  return (
    <div className="space-y-5 py-4">
      {/* Basic */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Información básica</p>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Nombre *</Label>
            <Input value={form.name} onChange={(e) => set({ name: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Descripción corta</Label>
            <Input value={form.short_description} onChange={(e) => set({ short_description: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Descripción completa</Label>
            <Textarea value={form.description} onChange={(e) => set({ description: e.target.value })} rows={3} className="text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Categoría</Label>
              <Input value={form.category} onChange={(e) => set({ category: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Tipo</Label>
              <select
                value={form.product_type}
                onChange={(e) => set({ product_type: e.target.value })}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="individual">Individual</option>
                <option value="combo">Combo</option>
              </select>
            </div>
          </div>
          {form.product_type === "combo" && (
            <div className="space-y-3 pl-3 border-l-2 border-muted">
              <div className="space-y-1.5">
                <Label className="text-xs">Tipo de combo</Label>
                <Input
                  placeholder="pareja, parceros, amigas..."
                  value={form.combo_type}
                  onChange={(e) => set({ combo_type: e.target.value })}
                />
              </div>
              <TagInput label="Items del combo" values={form.combo_items} onChange={(v) => set({ combo_items: v })} />
            </div>
          )}
          <div className="space-y-1.5">
            <Label className="text-xs">Info de talla</Label>
            <Input
              placeholder="Ej: Talla única — XS hasta L"
              value={form.size_info}
              onChange={(e) => set({ size_info: e.target.value })}
            />
          </div>
          <TagInput label="Características / Features" values={form.features} onChange={(v) => set({ features: v })} />
        </div>
      </div>

      <Separator />

      {/* Pricing */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Precios</p>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Precio base / costo (COP)</Label>
              <Input type="number" value={form.base_price} onChange={(e) => set({ base_price: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Precio de venta (COP)</Label>
              <Input type="number" value={form.sale_price} onChange={(e) => set({ sale_price: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Precio regular campaña</Label>
              <Input type="number" placeholder="Opcional" value={form.price_regular} onChange={(e) => set({ price_regular: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Precio promo campaña</Label>
              <Input type="number" placeholder="Opcional" value={form.price_promo} onChange={(e) => set({ price_promo: e.target.value })} />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-md border px-3 py-2">
            <div>
              <p className="text-sm font-medium">Precio promo activo</p>
              <p className="text-xs text-muted-foreground">Mostrar precio promo en lugar del regular</p>
            </div>
            <Switch checked={form.promo_active} onCheckedChange={(v) => set({ promo_active: v })} />
          </div>
        </div>
      </div>

      <Separator />

      {/* AI hints */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Contexto para AI</p>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Puntos de venta</Label>
            <Textarea
              placeholder="Qué destacar al vender este producto..."
              value={form.ai_selling_points}
              onChange={(e) => set({ ai_selling_points: e.target.value })}
              rows={2}
              className="text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Manejo de objeciones</Label>
            <Textarea
              placeholder="Cómo responder cuando dicen que es caro, que no confían, etc..."
              value={form.ai_objection_handling}
              onChange={(e) => set({ ai_objection_handling: e.target.value })}
              rows={2}
              className="text-sm"
            />
          </div>
          <TagInput label="Keywords para búsqueda" values={form.ai_keywords} onChange={(v) => set({ ai_keywords: v })} />
        </div>
      </div>

      <Separator />

      {/* Status */}
      <div className="flex items-center justify-between rounded-md border px-3 py-2">
        <div>
          <p className="text-sm font-medium">Producto activo</p>
          <p className="text-xs text-muted-foreground">Visible para el agente AI</p>
        </div>
        <Switch checked={form.is_active} onCheckedChange={(v) => set({ is_active: v })} />
      </div>
    </div>
  );
}

export function ProductsManager({ products }: { products: Product[] }) {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  function openEdit(product: Product) {
    setEditingProduct(product);
    setForm(productToForm(product));
    setIsCreating(false);
  }

  function openCreate() {
    setEditingProduct(null);
    setForm(emptyForm());
    setIsCreating(true);
  }

  function closeSheet() {
    setEditingProduct(null);
    setIsCreating(false);
  }

  function buildPayload(f: FormState) {
    return {
      name: f.name.trim(),
      short_description: f.short_description || null,
      description: f.description || null,
      category: f.category || null,
      product_type: f.product_type || null,
      combo_type: f.product_type === "combo" ? (f.combo_type || null) : null,
      combo_items: f.product_type === "combo" ? f.combo_items : [],
      base_price: Number(f.base_price) || 0,
      sale_price: Number(f.sale_price) || 0,
      price_regular: f.price_regular ? Number(f.price_regular) : null,
      price_promo: f.price_promo ? Number(f.price_promo) : null,
      promo_active: f.promo_active,
      features: f.features,
      size_info: f.size_info || null,
      ai_selling_points: f.ai_selling_points || null,
      ai_objection_handling: f.ai_objection_handling || null,
      ai_keywords: f.ai_keywords.length ? f.ai_keywords : null,
      is_active: f.is_active,
    };
  }

  async function save() {
    if (!form.name.trim()) return;
    setLoading(true);
    if (editingProduct) {
      await supabase.from("products").update(buildPayload(form)).eq("id", editingProduct.id);
    } else {
      await supabase.from("products").insert({ ...buildPayload(form), source: "manual" });
    }
    setLoading(false);
    closeSheet();
    router.refresh();
  }

  async function deleteProduct(id: string) {
    await supabase.from("products").delete().eq("id", id);
    setDeletingId(null);
    router.refresh();
  }

  const sheetOpen = !!editingProduct || isCreating;

  return (
    <>
      {/* New product button */}
      <div className="flex justify-end px-4 py-3 border-b">
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1.5" />
          Nuevo producto
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Origen</TableHead>
              <TableHead>Costo</TableHead>
              <TableHead>Venta</TableHead>
              <TableHead>Promo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-[80px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const hasCampaign = product.price_regular != null && product.price_promo != null;
              return (
                <TableRow key={product.id} className={!product.is_active ? "opacity-50" : ""}>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium leading-tight">{product.name}</p>
                      {product.short_description && (
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">{product.short_description}</p>
                      )}
                      {product.category && (
                        <p className="text-xs text-muted-foreground">{product.category}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.source === "manual" ? "outline" : "secondary"} className="text-xs whitespace-nowrap">
                      {product.source === "manual" ? "Manual" : `Dropi · ${product.dropi_product_id}`}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">{formatCOP(product.base_price)}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm font-medium">{formatCOP(product.sale_price)}</span>
                  </TableCell>
                  <TableCell>
                    {hasCampaign ? (
                      <div className="flex flex-col gap-0.5">
                        <span className={`font-mono text-xs font-medium ${product.promo_active ? "text-green-600" : "text-muted-foreground"}`}>
                          {formatCOP(product.price_promo!)}
                        </span>
                        <span className="font-mono text-xs text-muted-foreground line-through">
                          {formatCOP(product.price_regular!)}
                        </span>
                        <Badge variant={product.promo_active ? "default" : "outline"} className="text-[10px] w-fit px-1">
                          {product.promo_active ? "ON" : "OFF"}
                        </Badge>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.is_active ? "default" : "secondary"} className="text-xs">
                      {product.is_active ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(product)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      {product.source === "manual" && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => setDeletingId(product.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Edit / Create Sheet */}
      <Sheet open={sheetOpen} onOpenChange={(open) => !open && closeSheet()}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-base">
              {isCreating ? "Nuevo producto" : `Editar — ${editingProduct?.name}`}
            </SheetTitle>
            {editingProduct && (
              <p className="text-xs text-muted-foreground">
                {editingProduct.source === "manual"
                  ? "Producto manual"
                  : `Dropi ID: ${editingProduct.dropi_product_id}`}
              </p>
            )}
          </SheetHeader>

          <ProductForm form={form} onChange={setForm} />

          <SheetFooter className="pt-2">
            <Button variant="outline" onClick={closeSheet}>Cancelar</Button>
            <Button onClick={save} disabled={loading || !form.name.trim()}>
              {loading ? "Guardando..." : isCreating ? "Crear producto" : "Guardar cambios"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Delete confirmation */}
      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El producto se eliminará permanentemente junto con sus anuncios y segmentos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deletingId && deleteProduct(deletingId)}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
