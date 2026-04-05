"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import type { Order } from "@/lib/types";

type OrderWithRelations = Order & {
  customers?: { name?: string; phone?: string; city?: string; address?: string } | null;
  products?: { name?: string; dropi_product_id?: string } | null;
};

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending_payment: { label: "Pago pendiente", variant: "secondary" },
  paid: { label: "Pagado", variant: "default" },
  pending_dropi: { label: "Crear en Dropi", variant: "destructive" },
  created_dropi: { label: "En Dropi", variant: "outline" },
  shipped: { label: "Enviado", variant: "outline" },
  delivered: { label: "Entregado", variant: "default" },
  cancelled: { label: "Cancelado", variant: "destructive" },
};

const formatCOP = (amount: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(amount);

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("es-CO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(date));

export function OrdersTable({ orders }: { orders: OrderWithRelations[] }) {
  const [selectedOrder, setSelectedOrder] = useState<OrderWithRelations | null>(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  function openDropiModal(order: OrderWithRelations) {
    setSelectedOrder(order);
    setTrackingNumber(order.tracking_number ?? "");
  }

  async function markCreatedInDropi() {
    if (!selectedOrder) return;
    setLoading(true);

    await supabase
      .from("orders")
      .update({
        status: "created_dropi",
        tracking_number: trackingNumber || null,
      })
      .eq("id", selectedOrder.id);

    setLoading(false);
    setSelectedOrder(null);
    router.refresh();
  }

  if (orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
        No hay órdenes con este filtro
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Producto</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead className="w-[120px]">Acción</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            const customer = Array.isArray(order.customers) ? order.customers[0] : order.customers;
            const product = Array.isArray(order.products) ? order.products[0] : order.products;
            const statusCfg = statusConfig[order.status] ?? { label: order.status, variant: "secondary" as const };

            return (
              <TableRow key={order.id}>
                <TableCell>
                  <div>
                    <p className="text-sm font-medium">{customer?.name ?? "—"}</p>
                    <p className="text-xs text-muted-foreground font-mono">{customer?.phone}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm">{product?.name ?? "—"}</p>
                    {product?.dropi_product_id && (
                      <p className="text-xs text-muted-foreground font-mono">ID: {product.dropi_product_id}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-sm font-medium">{formatCOP(order.total_price)}</span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {order.is_cod ? "Con recaudo" : "Prepago"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={statusCfg.variant} className="text-xs">
                    {statusCfg.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-muted-foreground">{formatDate(order.created_at)}</span>
                </TableCell>
                <TableCell>
                  {order.status === "pending_dropi" && (
                    <Button
                      size="sm"
                      variant="destructive"
                      className="text-xs h-7"
                      onClick={() => openDropiModal(order)}
                    >
                      Crear en Dropi
                    </Button>
                  )}
                  {order.status === "created_dropi" && order.tracking_number && (
                    <span className="text-xs font-mono text-muted-foreground">{order.tracking_number}</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Dropi Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marcar creada en Dropi</DialogTitle>
            <DialogDescription>
              Confirma que ya creaste esta orden manualmente en app.dropi.co
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border p-4 space-y-2 text-sm">
                {(() => {
                  const c = Array.isArray(selectedOrder.customers) ? selectedOrder.customers[0] : selectedOrder.customers;
                  const p = Array.isArray(selectedOrder.products) ? selectedOrder.products[0] : selectedOrder.products;
                  return (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cliente</span>
                        <span className="font-medium">{c?.name ?? "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">WhatsApp</span>
                        <span className="font-mono">{c?.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Dirección</span>
                        <span className="text-right max-w-[200px]">{c?.address ?? "—"}, {c?.city ?? "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Producto</span>
                        <span>{p?.name ?? "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ID Dropi</span>
                        <span className="font-mono">{p?.dropi_product_id ?? "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total</span>
                        <span className="font-medium">{formatCOP(selectedOrder.total_price)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tipo</span>
                        <Badge variant="outline" className="text-xs">
                          {selectedOrder.is_cod ? "Con recaudo" : "Prepago"}
                        </Badge>
                      </div>
                    </>
                  );
                })()}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tracking">Número de guía (opcional)</Label>
                <Input
                  id="tracking"
                  placeholder="Ej: VEL123456789"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedOrder(null)}>
              Cancelar
            </Button>
            <Button onClick={markCreatedInDropi} disabled={loading}>
              {loading ? "Guardando..." : "Marcar como creada"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
