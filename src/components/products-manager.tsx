"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/types";
import { Pencil, Power } from "lucide-react";

const formatCOP = (amount: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(amount);

export function ProductsManager({ products }: { products: Product[] }) {
  const [editing, setEditing] = useState<Product | null>(null);
  const [salePrice, setSalePrice] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  function openEdit(product: Product) {
    setEditing(product);
    setSalePrice(String(product.sale_price));
  }

  async function savePrice() {
    if (!editing) return;
    setLoading(true);
    await supabase
      .from("products")
      .update({ sale_price: Number(salePrice) })
      .eq("id", editing.id);
    setLoading(false);
    setEditing(null);
    router.refresh();
  }

  async function toggleActive(product: Product) {
    await supabase
      .from("products")
      .update({ active: !product.active })
      .eq("id", product.id);
    router.refresh();
  }

  const margin = (product: Product) => {
    const m = product.sale_price - product.base_price;
    const pct = ((m / product.base_price) * 100).toFixed(0);
    return { amount: m, pct };
  };

  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
        No hay productos en el catálogo
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Producto</TableHead>
            <TableHead>ID Dropi</TableHead>
            <TableHead>Costo</TableHead>
            <TableHead>Venta</TableHead>
            <TableHead>Margen</TableHead>
            <TableHead>Variantes</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="w-[80px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const m = margin(product);
            const variantCount = Array.isArray(product.variants) ? product.variants.length : 0;

            return (
              <TableRow key={product.id} className={!product.active ? "opacity-50" : ""}>
                <TableCell>
                  <p className="text-sm font-medium max-w-[200px] leading-tight">{product.name}</p>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-xs text-muted-foreground">{product.dropi_product_id}</span>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-sm">{formatCOP(product.base_price)}</span>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-sm font-medium">{formatCOP(product.sale_price)}</span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-xs font-mono text-green-500">+{formatCOP(m.amount)}</span>
                    <span className="text-xs text-muted-foreground">{m.pct}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  {variantCount > 0 ? (
                    <Badge variant="outline" className="text-xs">{variantCount} variantes</Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">Sin variantes</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={product.active ? "default" : "secondary"} className="text-xs">
                    {product.active ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => openEdit(product)}
                      title="Editar precio"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => toggleActive(product)}
                      title={product.active ? "Desactivar" : "Activar"}
                    >
                      <Power className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Edit Price Sheet */}
      <Sheet open={!!editing} onOpenChange={() => setEditing(null)}>
        <SheetContent className="sm:max-w-sm">
          <SheetHeader>
            <SheetTitle className="text-base">Editar precio</SheetTitle>
          </SheetHeader>

          {editing && (
            <div className="py-6 space-y-5">
              <div>
                <p className="text-sm font-medium">{editing.name}</p>
                <p className="text-xs text-muted-foreground font-mono">ID Dropi: {editing.dropi_product_id}</p>
              </div>

              <Separator />

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Costo (Dropi)</span>
                  <span className="font-mono">{formatCOP(editing.base_price)}</span>
                </div>
                {editing.suggested_price && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sugerido Dropi</span>
                    <span className="font-mono">{formatCOP(editing.suggested_price)}</span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-1.5">
                <Label htmlFor="sale-price">Precio de venta al cliente (COP)</Label>
                <Input
                  id="sale-price"
                  type="number"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  placeholder="Ej: 120000"
                />
                {salePrice && Number(salePrice) > editing.base_price && (
                  <p className="text-xs text-green-500">
                    Margen: {formatCOP(Number(salePrice) - editing.base_price)} ({((( Number(salePrice) - editing.base_price) / editing.base_price) * 100).toFixed(0)}%)
                  </p>
                )}
              </div>
            </div>
          )}

          <SheetFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
            <Button onClick={savePrice} disabled={loading || !salePrice}>
              {loading ? "Guardando..." : "Guardar precio"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
