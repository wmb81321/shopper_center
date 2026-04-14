"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import { useRouter } from "next/navigation";
import type { Category } from "@/lib/types";
import {
  Pencil, Trash2, Plus, X, Upload,
  Loader2, GripVertical, Image as ImageIcon,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const BUCKET = "product-images";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

function pathFromUrl(url: string): string {
  const prefix = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`;
  return url.startsWith(prefix) ? url.slice(prefix.length) : url;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// ─── Form state ───────────────────────────────────────────────────────────────

type FormState = {
  slug: string;
  name: string;
  description: string;
  image_url: string;
  sort_order: string;
  is_active: boolean;
};

const emptyForm = (): FormState => ({
  slug: "",
  name: "",
  description: "",
  image_url: "",
  sort_order: "0",
  is_active: true,
});

const categoryToForm = (c: Category): FormState => ({
  slug: c.slug,
  name: c.name,
  description: c.description ?? "",
  image_url: c.image_url ?? "",
  sort_order: String(c.sort_order),
  is_active: c.is_active,
});

// ─── Single-image uploader ────────────────────────────────────────────────────

function CategoryImageUpload({
  imageUrl,
  onChange,
}: {
  imageUrl: string;
  onChange: (url: string) => void;
}) {
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(file: File) {
    setUploading(true);
    setError(null);

    // Remove old image if exists
    if (imageUrl) {
      const oldPath = pathFromUrl(imageUrl);
      await supabase.storage.from(BUCKET).remove([oldPath]);
    }

    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `categories/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { upsert: false });

    if (uploadError) {
      setError(`Error: ${uploadError.message}`);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    onChange(data.publicUrl);
    setUploading(false);
  }

  async function handleRemove() {
    if (!imageUrl) return;
    setDeleting(true);
    const path = pathFromUrl(imageUrl);
    await supabase.storage.from(BUCKET).remove([path]);
    onChange("");
    setDeleting(false);
  }

  return (
    <div className="space-y-3">
      <Label className="text-xs">Imagen de la categoría</Label>

      {imageUrl ? (
        <div className="relative rounded-xl overflow-hidden border bg-muted aspect-video">
          <img
            src={imageUrl}
            alt="Imagen categoría"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/40 text-white text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <Upload className="h-3.5 w-3.5" />
              Cambiar
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={deleting}
              className="px-3 py-1.5 rounded-lg bg-destructive/80 hover:bg-destructive text-white text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              {deleting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <X className="h-3.5 w-3.5" />
              )}
              Eliminar
            </button>
          </div>
        </div>
      ) : (
        <div
          className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file) handleUpload(file);
          }}
        >
          {uploading ? (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Subiendo imagen...
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <ImageIcon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  Arrastra o{" "}
                  <span className="text-primary">haz clic para seleccionar</span>
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  JPG, PNG, WebP · Recomendado 1200×800px
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
      />

      {uploading && imageUrl && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Subiendo imagen...
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2">
          <p className="text-xs text-destructive">{error}</p>
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function CategoriesManager({
  categories,
}: {
  categories: Category[];
}) {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [slugManual, setSlugManual] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const isOpen = !!editingCategory || isCreating;
  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));

  function openEdit(cat: Category) {
    setEditingCategory(cat);
    setForm(categoryToForm(cat));
    setSlugManual(true);
    setIsCreating(false);
  }

  function openCreate() {
    setEditingCategory(null);
    setForm(emptyForm());
    setSlugManual(false);
    setIsCreating(true);
  }

  function closeDialog() {
    setEditingCategory(null);
    setIsCreating(false);
  }

  function handleNameChange(name: string) {
    set({
      name,
      slug: slugManual ? form.slug : slugify(name),
    });
  }

  function buildPayload(f: FormState) {
    return {
      slug: f.slug.trim(),
      name: f.name.trim(),
      description: f.description.trim() || null,
      image_url: f.image_url || null,
      sort_order: Number(f.sort_order) || 0,
      is_active: f.is_active,
    };
  }

  async function save() {
    if (!form.name.trim() || !form.slug.trim()) return;
    setLoading(true);
    if (editingCategory) {
      await supabase
        .from("categories")
        .update(buildPayload(form))
        .eq("id", editingCategory.id);
    } else {
      await supabase.from("categories").insert(buildPayload(form));
    }
    setLoading(false);
    closeDialog();
    router.refresh();
  }

  async function deleteCategory(id: string) {
    await supabase.from("categories").delete().eq("id", id);
    setDeletingId(null);
    router.refresh();
  }

  async function toggleActive(cat: Category) {
    setTogglingId(cat.id);
    await supabase
      .from("categories")
      .update({ is_active: !cat.is_active })
      .eq("id", cat.id);
    setTogglingId(null);
    router.refresh();
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <p className="text-sm font-medium text-muted-foreground">
          {categories.length} categoría{categories.length !== 1 ? "s" : ""}
        </p>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1.5" />
          Nueva categoría
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[56px]">Imagen</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="w-[80px]">Orden</TableHead>
              <TableHead>Activa</TableHead>
              <TableHead className="w-[72px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground text-sm py-10"
                >
                  No hay categorías. Crea la primera.
                </TableCell>
              </TableRow>
            ) : (
              categories.map((cat) => (
                <TableRow
                  key={cat.id}
                  className={!cat.is_active ? "opacity-50" : ""}
                >
                  <TableCell>
                    <div className="h-10 w-16 rounded-md overflow-hidden bg-muted flex items-center justify-center shrink-0">
                      {cat.image_url ? (
                        <img
                          src={cat.image_url}
                          alt={cat.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-medium">{cat.name}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs font-mono">
                      {cat.slug}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                      {cat.description ?? "—"}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <GripVertical className="h-3.5 w-3.5" />
                      <span className="text-sm">{cat.sort_order}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={cat.is_active}
                      disabled={togglingId === cat.id}
                      onCheckedChange={() => toggleActive(cat)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => openEdit(cat)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => setDeletingId(cat.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit / Create Dialog */}
      <Dialog open={isOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent
          className="sm:max-w-lg p-0 gap-0 flex flex-col overflow-hidden max-h-[92vh]"
          showCloseButton={false}
        >
          {/* Header */}
          <div className="px-6 pt-5 pb-4 border-b shrink-0 flex items-start justify-between">
            <div>
              <h2 className="font-heading text-base font-semibold">
                {isCreating
                  ? "Nueva categoría"
                  : `Editar — ${editingCategory?.name}`}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isCreating
                  ? "Completa la información de la nueva categoría"
                  : `Slug: /${editingCategory?.slug}`}
              </p>
            </div>
            <button
              onClick={closeDialog}
              className="rounded-md p-1 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Form */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {/* Image */}
            <CategoryImageUpload
              imageUrl={form.image_url}
              onChange={(url) => set({ image_url: url })}
            />

            {/* Name + Slug */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Nombre *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ej: Ropa, Hogar, Mascotas..."
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">
                  Slug (URL){" "}
                  <span className="text-muted-foreground font-normal">
                    — /categoria/<strong>{form.slug || "..."}</strong>
                  </span>
                </Label>
                <Input
                  value={form.slug}
                  onChange={(e) => {
                    setSlugManual(true);
                    set({ slug: e.target.value });
                  }}
                  placeholder="ropa, cuidado-personal..."
                  className="font-mono text-sm"
                />
                <p className="text-[11px] text-muted-foreground">
                  Solo letras minúsculas, números y guiones. Se genera
                  automáticamente del nombre.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Descripción (opcional)</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => set({ description: e.target.value })}
                  placeholder="Descripción corta que se muestra en la tienda..."
                  rows={2}
                  className="text-sm"
                />
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Orden de aparición</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.sort_order}
                  onChange={(e) => set({ sort_order: e.target.value })}
                  className="w-24"
                />
                <p className="text-[11px] text-muted-foreground">
                  Número menor aparece primero.
                </p>
              </div>

              <div className="rounded-xl border px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Categoría activa</p>
                  <p className="text-xs text-muted-foreground">
                    Visible en la tienda
                  </p>
                </div>
                <Switch
                  checked={form.is_active}
                  onCheckedChange={(v) => set({ is_active: v })}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="shrink-0 border-t px-6 py-4 flex items-center justify-end gap-2">
            <Button variant="outline" onClick={closeDialog}>
              Cancelar
            </Button>
            <Button
              onClick={save}
              disabled={loading || !form.name.trim() || !form.slug.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  Guardando...
                </>
              ) : isCreating ? (
                "Crear categoría"
              ) : (
                "Guardar cambios"
              )}
            </Button>
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
            <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
            <AlertDialogDescription>
              Los productos con esta categoría no se eliminarán, pero dejarán
              de aparecer en esta sección de la tienda.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deletingId && deleteCategory(deletingId)}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
