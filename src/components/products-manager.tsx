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
import type { Product, ProductSize } from "@/lib/types";
import { Pencil, Trash2, Plus, X } from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = ["hogar", "mascotas", "cuidado personal", "ropa"] as const;
const STANDARD_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

const formatCOP = (amount: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(amount);

// ─── Form state ───────────────────────────────────────────────────────────────

type FormState = {
  dropi_ref: string;
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
  sizes: ProductSize[];
  ai_selling_points: string;
  ai_objection_handling: string;
  ai_keywords: string[];
  is_active: boolean;
};

const emptyForm = (): FormState => ({
  dropi_ref: "",
  name: "",
  short_description: "",
  description: "",
  category: "ropa",
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
  sizes: [],
  ai_selling_points: "",
  ai_objection_handling: "",
  ai_keywords: [],
  is_active: true,
});

const productToForm = (p: Product): FormState => ({
  dropi_ref: p.dropi_product_id != null ? String(p.dropi_product_id) : "",
  name: p.name,
  short_description: p.short_description ?? "",
  description: p.description ?? "",
  category: p.category ?? "ropa",
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
  sizes: p.sizes ?? [],
  ai_selling_points: p.ai_selling_points ?? "",
  ai_objection_handling: p.ai_objection_handling ?? "",
  ai_keywords: p.ai_keywords ?? [],
  is_active: p.is_active,
});

// ─── Sub-components ───────────────────────────────────────────────────────────

function TagInput({ label, values, onChange, placeholder }: {
  label: string; values: string[]; onChange: (v: string[]) => void; placeholder?: string;
}) {
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
          placeholder={placeholder ?? "Escribir y Enter..."}
          className="h-8 text-sm"
        />
        <Button type="button" size="sm" variant="outline" className="h-8 px-2" onClick={add}>
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

function SizeManager({ sizes, onChange }: { sizes: ProductSize[]; onChange: (s: ProductSize[]) => void }) {
  const [customInput, setCustomInput] = useState("");

  function toggleSize(size: string) {
    const exists = sizes.find((s) => s.size === size);
    if (exists) {
      onChange(sizes.filter((s) => s.size !== size));
    } else {
      onChange([...sizes, { size, stock: 0 }]);
    }
  }

  function setStock(size: string, stock: number) {
    onChange(sizes.map((s) => s.size === size ? { ...s, stock } : s));
  }

  function addCustom() {
    const val = customInput.trim().toUpperCase();
    if (val && !sizes.find((s) => s.size === val)) {
      onChange([...sizes, { size: val, stock: 0 }]);
    }
    setCustomInput("");
  }

  const activeSet = new Set(sizes.map((s) => s.size));

  return (
    <div className="space-y-3">
      <Label className="text-xs">Tallas disponibles</Label>

      {/* Standard size toggles */}
      <div className="flex flex-wrap gap-2">
        {STANDARD_SIZES.map((size) => {
          const active = activeSet.has(size);
          return (
            <button
              key={size}
              type="button"
              onClick={() => toggleSize(size)}
              className={`h-9 min-w-[40px] px-3 rounded-md border text-sm font-medium transition-colors ${
                active
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-foreground/40"
              }`}
            >
              {size}
            </button>
          );
        })}
      </div>

      {/* Stock per selected size */}
      {sizes.length > 0 && (
        <div className="space-y-2 rounded-md border p-3 bg-muted/20">
          <p className="text-xs text-muted-foreground font-medium">Stock por talla</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {sizes.map((s) => (
              <div key={s.size} className="flex items-center gap-2">
                <span className="text-xs font-semibold w-8 shrink-0">{s.size}</span>
                <Input
                  type="number"
                  min={0}
                  value={s.stock}
                  onChange={(e) => setStock(s.size, Number(e.target.value))}
                  className="h-7 text-sm"
                />
                <button
                  type="button"
                  onClick={() => onChange(sizes.filter((x) => x.size !== s.size))}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom size */}
      <div className="flex gap-2">
        <Input
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustom())}
          placeholder="Talla personalizada (ej: 32, XS/S)..."
          className="h-8 text-sm"
        />
        <Button type="button" size="sm" variant="outline" className="h-8 px-2" onClick={addCustom}>
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

function ProductForm({ form, onChange }: { form: FormState; onChange: (f: FormState) => void }) {
  const set = (patch: Partial<FormState>) => onChange({ ...form, ...patch });
  const isRopa = form.category === "ropa";

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
              <select
                value={form.category}
                onChange={(e) => set({ category: e.target.value })}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm capitalize"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="capitalize">{c}</option>
                ))}
              </select>
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
            <Label className="text-xs">Referencia Dropi (opcional)</Label>
            <Input
              type="number"
              placeholder="ID numérico de Dropi si aplica"
              value={form.dropi_ref}
              onChange={(e) => set({ dropi_ref: e.target.value })}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Sizes — only for ropa */}
      {isRopa && (
        <>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Tallas</p>
            <div className="space-y-3">
              <SizeManager sizes={form.sizes} onChange={(v) => set({ sizes: v })} />
              <div className="space-y-1.5">
                <Label className="text-xs">Nota sobre tallas (texto libre)</Label>
                <Input
                  placeholder="Ej: Talla única — expande XS hasta L"
                  value={form.size_info}
                  onChange={(e) => set({ size_info: e.target.value })}
                />
              </div>
            </div>
          </div>
          <Separator />
        </>
      )}

      {/* Features */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Características</p>
        <TagInput
          label="Features / Puntos destacados"
          values={form.features}
          onChange={(v) => set({ features: v })}
          placeholder="Ej: Envío gratis, Contraentrega..."
        />
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
              <p className="text-xs text-muted-foreground">Mostrar precio promo al cliente</p>
            </div>
            <Switch checked={form.promo_active} onCheckedChange={(v) => set({ promo_active: v })} />
          </div>
        </div>
      </div>

      <Separator />

      {/* AI context */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Contexto para agente AI</p>
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
          <TagInput label="Keywords de búsqueda" values={form.ai_keywords} onChange={(v) => set({ ai_keywords: v })} />
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

// ─── Main component ───────────────────────────────────────────────────────────

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
      dropi_product_id: f.dropi_ref ? Number(f.dropi_ref) : null,
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
      sizes: f.category === "ropa" ? f.sizes : [],
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

  return (
    <>
      {/* Header row */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <p className="text-sm font-medium text-muted-foreground">{products.length} producto{products.length !== 1 ? "s" : ""}</p>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1.5" />
          Nuevo producto
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Costo</TableHead>
              <TableHead>Venta</TableHead>
              <TableHead>Tallas</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-[72px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground text-sm py-10">
                  No hay productos. Crea el primero.
                </TableCell>
              </TableRow>
            ) : products.map((product) => {
              const sizeSummary = product.sizes && product.sizes.length > 0
                ? product.sizes.map((s) => s.size).join(" · ")
                : null;

              return (
                <TableRow key={product.id} className={!product.is_active ? "opacity-50" : ""}>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium leading-tight">{product.name}</p>
                      {product.short_description && (
                        <p className="text-xs text-muted-foreground truncate max-w-[180px]">{product.short_description}</p>
                      )}
                      {product.dropi_product_id && (
                        <p className="text-[10px] text-muted-foreground font-mono">Dropi #{product.dropi_product_id}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs capitalize">
                      {product.category ?? "—"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">{formatCOP(product.base_price)}</span>
                  </TableCell>
                  <TableCell>
                    {product.price_promo && product.promo_active ? (
                      <div className="flex flex-col gap-0.5">
                        <span className="font-mono text-sm font-medium text-green-600">{formatCOP(product.price_promo)}</span>
                        <span className="font-mono text-xs text-muted-foreground line-through">{formatCOP(product.price_regular!)}</span>
                      </div>
                    ) : (
                      <span className="font-mono text-sm font-medium">{formatCOP(product.sale_price)}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {sizeSummary ? (
                      <span className="text-xs text-muted-foreground">{sizeSummary}</span>
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
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => setDeletingId(product.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Edit / Create Sheet */}
      <Sheet open={!!editingProduct || isCreating} onOpenChange={(open) => !open && closeSheet()}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-base">
              {isCreating ? "Nuevo producto" : `Editar — ${editingProduct?.name}`}
            </SheetTitle>
            {editingProduct?.dropi_product_id && (
              <p className="text-xs text-muted-foreground font-mono">Dropi #{editingProduct.dropi_product_id}</p>
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
              Esta acción no se puede deshacer. Se eliminarán también los anuncios y segmentos asociados.
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
