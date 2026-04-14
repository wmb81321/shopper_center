"use client";

import { useState, useRef } from "react";
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
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";
import type { Product, ProductSize } from "@/lib/types";
import {
  Pencil, Trash2, Plus, X, Upload,
  ChevronLeft, ChevronRight, Loader2,
  Images, Info, DollarSign, Bot,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = ["hogar", "mascotas", "cuidado personal", "ropa"] as const;
const STANDARD_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const BUCKET = "product-images";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

const formatCOP = (amount: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(amount);

function pathFromUrl(url: string): string {
  const prefix = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`;
  return url.startsWith(prefix) ? url.slice(prefix.length) : url;
}

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
  images: string[];
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
  images: [],
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
  images: p.images ?? [],
});

// ─── ImageManager ─────────────────────────────────────────────────────────────

function ImageManager({
  folderId,
  images,
  onChange,
}: {
  folderId: string;
  images: string[];
  onChange: (urls: string[]) => void;
}) {
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(files: FileList) {
    setUploading(true);
    setError(null);
    const newUrls: string[] = [];

    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${folderId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: false });

      if (uploadError) {
        setError(`Error subiendo ${file.name}: ${uploadError.message}`);
        continue;
      }

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      newUrls.push(data.publicUrl);
    }

    onChange([...images, ...newUrls]);
    setUploading(false);
  }

  async function handleDelete(url: string) {
    setDeletingUrl(url);
    const path = pathFromUrl(url);
    await supabase.storage.from(BUCKET).remove([path]);
    onChange(images.filter((u) => u !== url));
    setDeletingUrl(null);
  }

  function move(index: number, dir: -1 | 1) {
    const next = [...images];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div className="space-y-4">
      {/* Upload area */}
      <div
        className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const files = e.dataTransfer.files;
          if (files.length) handleUpload(files);
        }}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleUpload(e.target.files)}
        />
        {uploading ? (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Subiendo imágenes...
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <Upload className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">
                Arrastra imágenes aquí o{" "}
                <span className="text-primary">haz clic para seleccionar</span>
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                JPG, PNG, WebP · máx. 5 MB por imagen
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2">
          <p className="text-xs text-destructive">{error}</p>
        </div>
      )}

      {/* Image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {images.map((url, i) => (
            <div
              key={url}
              className="relative group rounded-xl overflow-hidden border bg-muted aspect-square"
            >
              <img
                src={url}
                alt={`Imagen ${i + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Position badge */}
              <div className="absolute top-1.5 left-1.5 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                {i === 0 ? "Principal" : `#${i + 1}`}
              </div>

              {/* Controls on hover */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className="p-1.5 rounded-lg bg-white/20 hover:bg-white/40 disabled:opacity-30 transition-colors"
                  title="Mover izquierda"
                >
                  <ChevronLeft className="h-3.5 w-3.5 text-white" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(url)}
                  disabled={deletingUrl === url}
                  className="p-1.5 rounded-lg bg-destructive/80 hover:bg-destructive transition-colors"
                  title="Eliminar imagen"
                >
                  {deletingUrl === url ? (
                    <Loader2 className="h-3.5 w-3.5 text-white animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5 text-white" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === images.length - 1}
                  className="p-1.5 rounded-lg bg-white/20 hover:bg-white/40 disabled:opacity-30 transition-colors"
                  title="Mover derecha"
                >
                  <ChevronRight className="h-3.5 w-3.5 text-white" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && !uploading && (
        <p className="text-xs text-muted-foreground text-center">
          Sin imágenes. La primera que subas será la portada.
        </p>
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TagInput({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
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
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 px-2"
          onClick={add}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

function SizeManager({
  sizes,
  onChange,
}: {
  sizes: ProductSize[];
  onChange: (s: ProductSize[]) => void;
}) {
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
    onChange(sizes.map((s) => (s.size === size ? { ...s, stock } : s)));
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

      {sizes.length > 0 && (
        <div className="space-y-2 rounded-lg border p-3 bg-muted/20">
          <p className="text-xs text-muted-foreground font-medium">
            Stock por talla
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {sizes.map((s) => (
              <div key={s.size} className="flex items-center gap-2">
                <span className="text-xs font-semibold w-8 shrink-0">
                  {s.size}
                </span>
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

      <div className="flex gap-2">
        <Input
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={(e) =>
            e.key === "Enter" && (e.preventDefault(), addCustom())
          }
          placeholder="Talla personalizada (ej: 32, XS/S)..."
          className="h-8 text-sm"
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 px-2"
          onClick={addCustom}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ─── Section heading helper ───────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
      {children}
    </p>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

function generateId() {
  return crypto.randomUUID();
}

export function ProductsManager({ products }: { products: Product[] }) {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [folderId, setFolderId] = useState<string>("");
  const [activeTab, setActiveTab] = useState("images");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const isOpen = !!editingProduct || isCreating;
  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));
  const isRopa = form.category === "ropa";

  function openEdit(product: Product) {
    setEditingProduct(product);
    setForm(productToForm(product));
    setFolderId(product.id);
    setIsCreating(false);
    setActiveTab("images");
  }

  function openCreate() {
    setEditingProduct(null);
    setForm(emptyForm());
    setFolderId(generateId());
    setIsCreating(true);
    setActiveTab("images");
  }

  function closeDialog() {
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
      images: f.images.length ? f.images : null,
    };
  }

  async function save() {
    if (!form.name.trim()) return;
    setLoading(true);
    if (editingProduct) {
      await supabase
        .from("products")
        .update(buildPayload(form))
        .eq("id", editingProduct.id);
    } else {
      await supabase
        .from("products")
        .insert({ ...buildPayload(form), source: "manual" });
    }
    setLoading(false);
    closeDialog();
    router.refresh();
  }

  async function deleteProduct(id: string) {
    await supabase.from("products").delete().eq("id", id);
    setDeletingId(null);
    router.refresh();
  }

  async function toggleActive(product: Product) {
    setTogglingId(product.id);
    await supabase
      .from("products")
      .update({ is_active: !product.is_active })
      .eq("id", product.id);
    setTogglingId(null);
    router.refresh();
  }

  return (
    <>
      {/* Header row */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <p className="text-sm font-medium text-muted-foreground">
          {products.length} producto{products.length !== 1 ? "s" : ""}
        </p>
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
              <TableHead className="w-[56px]">Foto</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Costo</TableHead>
              <TableHead>Venta</TableHead>
              <TableHead>Tallas</TableHead>
              <TableHead>Activo</TableHead>
              <TableHead className="w-[72px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center text-muted-foreground text-sm py-10"
                >
                  No hay productos. Crea el primero.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => {
                const sizeSummary =
                  product.sizes && product.sizes.length > 0
                    ? product.sizes.map((s) => s.size).join(" · ")
                    : null;
                const thumb = product.images?.[0] ?? null;

                return (
                  <TableRow
                    key={product.id}
                    className={!product.is_active ? "opacity-50" : ""}
                  >
                    <TableCell>
                      <div className="h-10 w-10 rounded-md overflow-hidden bg-muted flex items-center justify-center shrink-0">
                        {thumb ? (
                          <img
                            src={thumb}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-muted-foreground text-[10px]">
                            sin foto
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div>
                        <p className="text-sm font-medium leading-tight">
                          {product.name}
                        </p>
                        {product.short_description && (
                          <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                            {product.short_description}
                          </p>
                        )}
                        {product.dropi_product_id && (
                          <p className="text-[10px] text-muted-foreground font-mono">
                            Dropi #{product.dropi_product_id}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs capitalize">
                        {product.category ?? "—"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">
                        {formatCOP(product.base_price)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {product.price_promo && product.promo_active ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="font-mono text-sm font-medium text-green-600">
                            {formatCOP(product.price_promo)}
                          </span>
                          <span className="font-mono text-xs text-muted-foreground line-through">
                            {formatCOP(product.price_regular!)}
                          </span>
                        </div>
                      ) : (
                        <span className="font-mono text-sm font-medium">
                          {formatCOP(product.sale_price)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {sizeSummary ? (
                        <span className="text-xs text-muted-foreground">
                          {sizeSummary}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    <TableCell>
                      <Switch
                        checked={product.is_active}
                        disabled={togglingId === product.id}
                        onCheckedChange={() => toggleActive(product)}
                        aria-label={
                          product.is_active
                            ? "Desactivar producto"
                            : "Activar producto"
                        }
                      />
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => openEdit(product)}
                        >
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
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* ─── Edit / Create Dialog ───────────────────────────────────────────── */}
      <Dialog
        open={isOpen}
        onOpenChange={(open) => !open && closeDialog()}
      >
        <DialogContent
          className="sm:max-w-3xl max-h-[92vh] p-0 gap-0 flex flex-col overflow-hidden"
          showCloseButton={false}
        >
          {/* Header */}
          <div className="px-6 pt-5 pb-4 border-b shrink-0 flex items-start justify-between">
            <div>
              <h2 className="font-heading text-base font-semibold">
                {isCreating ? "Nuevo producto" : editingProduct?.name ?? "Editar producto"}
              </h2>
              {editingProduct?.dropi_product_id && (
                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                  Dropi #{editingProduct.dropi_product_id}
                </p>
              )}
              {isCreating && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Completa la información del nuevo producto
                </p>
              )}
            </div>
            <button
              onClick={closeDialog}
              className="rounded-md p-1 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col min-h-0"
          >
            {/* Tab navigation */}
            <div className="px-6 pt-3 pb-0 border-b shrink-0">
              <TabsList className="h-9 gap-1">
                <TabsTrigger value="images" className="gap-1.5 px-3">
                  <Images className="h-3.5 w-3.5" />
                  <span>Imágenes</span>
                  {form.images.length > 0 && (
                    <Badge variant="secondary" className="h-4 px-1 text-[10px] ml-0.5">
                      {form.images.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="details" className="gap-1.5 px-3">
                  <Info className="h-3.5 w-3.5" />
                  <span>Detalles</span>
                </TabsTrigger>
                <TabsTrigger value="prices" className="gap-1.5 px-3">
                  <DollarSign className="h-3.5 w-3.5" />
                  <span>Precios</span>
                </TabsTrigger>
                <TabsTrigger value="ai" className="gap-1.5 px-3">
                  <Bot className="h-3.5 w-3.5" />
                  <span>Agente AI</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Scrollable content area */}
            <div className="flex-1 overflow-y-auto">

              {/* ── Imágenes ─────────────────────────────────────────────── */}
              <TabsContent value="images" className="px-6 py-5 space-y-6">
                <ImageManager
                  folderId={folderId}
                  images={form.images}
                  onChange={(urls) => set({ images: urls })}
                />

                {/* Product status inside images tab */}
                <div className="rounded-xl border px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Producto activo</p>
                    <p className="text-xs text-muted-foreground">
                      Visible en la tienda y para el agente AI
                    </p>
                  </div>
                  <Switch
                    checked={form.is_active}
                    onCheckedChange={(v) => set({ is_active: v })}
                  />
                </div>
              </TabsContent>

              {/* ── Detalles ─────────────────────────────────────────────── */}
              <TabsContent value="details" className="px-6 py-5 space-y-6">

                {/* Basic info */}
                <div className="space-y-3">
                  <SectionHeading>Información básica</SectionHeading>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Nombre *</Label>
                    <Input
                      value={form.name}
                      onChange={(e) => set({ name: e.target.value })}
                      placeholder="Nombre del producto"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Descripción corta</Label>
                    <Input
                      value={form.short_description}
                      onChange={(e) => set({ short_description: e.target.value })}
                      placeholder="Una línea para el catálogo"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Descripción completa</Label>
                    <Textarea
                      value={form.description}
                      onChange={(e) => set({ description: e.target.value })}
                      rows={4}
                      className="text-sm"
                      placeholder="Descripción detallada del producto..."
                    />
                  </div>
                </div>

                {/* Classification */}
                <div className="space-y-3">
                  <SectionHeading>Clasificación</SectionHeading>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Categoría</Label>
                      <select
                        value={form.category}
                        onChange={(e) => set({ category: e.target.value })}
                        className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm capitalize"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c} className="capitalize">
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Tipo de producto</Label>
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
                      <TagInput
                        label="Items del combo"
                        values={form.combo_items}
                        onChange={(v) => set({ combo_items: v })}
                      />
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

                {/* Sizes — only for ropa */}
                {isRopa && (
                  <div className="space-y-3">
                    <SectionHeading>Tallas</SectionHeading>
                    <SizeManager
                      sizes={form.sizes}
                      onChange={(v) => set({ sizes: v })}
                    />
                    <div className="space-y-1.5">
                      <Label className="text-xs">Nota sobre tallas (texto libre)</Label>
                      <Input
                        placeholder="Ej: Talla única — expande XS hasta L"
                        value={form.size_info}
                        onChange={(e) => set({ size_info: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {/* Features */}
                <div className="space-y-3">
                  <SectionHeading>Características</SectionHeading>
                  <TagInput
                    label="Puntos destacados del producto"
                    values={form.features}
                    onChange={(v) => set({ features: v })}
                    placeholder="Ej: Envío gratis, Contraentrega..."
                  />
                </div>
              </TabsContent>

              {/* ── Precios ──────────────────────────────────────────────── */}
              <TabsContent value="prices" className="px-6 py-5 space-y-6">

                {/* Base prices */}
                <div className="space-y-3">
                  <SectionHeading>Precios base</SectionHeading>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Costo / precio base (COP)</Label>
                      <Input
                        type="number"
                        value={form.base_price}
                        onChange={(e) => set({ base_price: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Precio de venta (COP)</Label>
                      <Input
                        type="number"
                        value={form.sale_price}
                        onChange={(e) => set({ sale_price: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  {form.base_price && form.sale_price && Number(form.base_price) > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Margen:{" "}
                      <span className="font-medium text-foreground">
                        {Math.round(((Number(form.sale_price) - Number(form.base_price)) / Number(form.base_price)) * 100)}%
                      </span>
                      {" "}· Utilidad:{" "}
                      <span className="font-medium text-foreground">
                        {formatCOP(Number(form.sale_price) - Number(form.base_price))}
                      </span>
                    </p>
                  )}
                </div>

                {/* Campaign prices */}
                <div className="space-y-3">
                  <SectionHeading>Precios de campaña (opcional)</SectionHeading>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Precio regular (tachado)</Label>
                      <Input
                        type="number"
                        placeholder="Precio antes del descuento"
                        value={form.price_regular}
                        onChange={(e) => set({ price_regular: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Precio promo (destacado)</Label>
                      <Input
                        type="number"
                        placeholder="Precio con descuento"
                        value={form.price_promo}
                        onChange={(e) => set({ price_promo: e.target.value })}
                      />
                    </div>
                  </div>

                  {form.price_regular && form.price_promo && (
                    <p className="text-xs text-muted-foreground">
                      Descuento:{" "}
                      <span className="font-medium text-green-600">
                        {Math.round(((Number(form.price_regular) - Number(form.price_promo)) / Number(form.price_regular)) * 100)}% off
                      </span>
                      {" "}·{" "}
                      <span className="font-medium text-foreground">
                        {formatCOP(Number(form.price_regular) - Number(form.price_promo))} de descuento
                      </span>
                    </p>
                  )}

                  <div className="rounded-xl border px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Mostrar precio promo</p>
                      <p className="text-xs text-muted-foreground">
                        Activar la oferta de campaña al cliente
                      </p>
                    </div>
                    <Switch
                      checked={form.promo_active}
                      onCheckedChange={(v) => set({ promo_active: v })}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* ── Agente AI ────────────────────────────────────────────── */}
              <TabsContent value="ai" className="px-6 py-5 space-y-6">

                <div className="space-y-3">
                  <SectionHeading>Contexto para el agente de ventas</SectionHeading>
                  <p className="text-xs text-muted-foreground -mt-1">
                    Esta información la usa el agente AI para vender por WhatsApp.
                    Cuanto más detallada, mejor será la conversación.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Puntos de venta clave</Label>
                  <Textarea
                    placeholder="Qué destacar al vender este producto — beneficios, diferenciadores, casos de uso ideales..."
                    value={form.ai_selling_points}
                    onChange={(e) => set({ ai_selling_points: e.target.value })}
                    rows={4}
                    className="text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Manejo de objeciones</Label>
                  <Textarea
                    placeholder="Cómo responder cuando dicen que es caro, que no confían, que lo pensarán, etc..."
                    value={form.ai_objection_handling}
                    onChange={(e) => set({ ai_objection_handling: e.target.value })}
                    rows={4}
                    className="text-sm"
                  />
                </div>

                <TagInput
                  label="Keywords de búsqueda"
                  values={form.ai_keywords}
                  onChange={(v) => set({ ai_keywords: v })}
                  placeholder="Palabras clave para que el agente encuentre este producto..."
                />
              </TabsContent>

            </div>
          </Tabs>

          {/* Footer */}
          <div className="shrink-0 border-t px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {!form.name.trim() && (
                <span className="text-destructive">* El nombre es requerido</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={closeDialog}>
                Cancelar
              </Button>
              <Button
                onClick={save}
                disabled={loading || !form.name.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                    Guardando...
                  </>
                ) : isCreating ? (
                  "Crear producto"
                ) : (
                  "Guardar cambios"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminarán también los
              anuncios y segmentos asociados.
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
