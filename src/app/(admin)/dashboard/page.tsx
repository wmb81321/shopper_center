import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, MessageSquare, DollarSign, TrendingUp, Clock } from "lucide-react";
import type { OrderStatus } from "@/lib/types";

type RecentOrder = {
  id: string;
  total_price: number;
  status: OrderStatus;
  created_at: string;
  customers: { name: string | null; phone: string | null } | null;
};

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
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

const formatTime = (date: string) =>
  new Intl.DateTimeFormat("es-CO", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" }).format(new Date(date));

export default async function DashboardPage() {
  const supabase = await createClient();

  const { count: totalOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true });

  const { count: pendingDropi } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending_dropi");

  const { count: activeConversations } = await supabase
    .from("conversations")
    .select("*", { count: "exact", head: true })
    .eq("status", "ai_active");

  const { count: humanConversations } = await supabase
    .from("conversations")
    .select("*", { count: "exact", head: true })
    .eq("status", "human_active");

  const { data: recentOrdersRaw } = await supabase
    .from("orders")
    .select("id, total_price, status, created_at, customers(name, phone)")
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: paymentsToday } = await supabase
    .from("payments")
    .select("amount")
    .eq("status", "approved")
    .gte("created_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString());

  const recentOrders = (recentOrdersRaw ?? []) as unknown as RecentOrder[];
  const revenueToday = (paymentsToday ?? []).reduce((sum, p) => sum + ((p as { amount: number }).amount ?? 0), 0);

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Resumen de operaciones</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ventas hoy</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCOP(revenueToday)}</p>
            <p className="text-xs text-muted-foreground mt-1">Pagos aprobados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total órdenes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalOrders ?? 0}</p>
            <p className="text-xs text-muted-foreground mt-1">Acumuladas</p>
          </CardContent>
        </Card>

        <Card className={pendingDropi && pendingDropi > 0 ? "border-destructive/50" : ""}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pendientes Dropi</CardTitle>
            <Clock className={`h-4 w-4 ${pendingDropi && pendingDropi > 0 ? "text-destructive" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${pendingDropi && pendingDropi > 0 ? "text-destructive" : ""}`}>
              {pendingDropi ?? 0}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Crear manualmente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Conversaciones</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{activeConversations ?? 0}</p>
            <div className="flex items-center gap-1 mt-1">
              {humanConversations && humanConversations > 0 && (
                <Badge variant="destructive" className="text-xs px-1.5 py-0">
                  {humanConversations} manual
                </Badge>
              )}
              <p className="text-xs text-muted-foreground">con agente AI</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Últimas órdenes</CardTitle>
          <a href="/orders" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Ver todas →
          </a>
        </CardHeader>
        <CardContent className="p-0">
          {recentOrders.length === 0 ? (
            <div className="flex items-center justify-center h-24 text-sm text-muted-foreground">
              No hay órdenes todavía
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentOrders.map((order) => {
                const customer = order.customers;
                const cfg = statusLabels[order.status] ?? { label: order.status, variant: "secondary" as const };
                return (
                  <div key={order.id} className="flex items-center justify-between px-6 py-3">
                    <div>
                      <p className="text-sm font-medium">
                        {customer?.name ?? customer?.phone ?? "Cliente"}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatTime(order.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={cfg.variant} className="text-xs">{cfg.label}</Badge>
                      <span className="text-sm font-mono font-medium">{formatCOP(order.total_price)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Dropi alert */}
      {pendingDropi && pendingDropi > 0 && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-center gap-3 py-4">
            <ShoppingBag className="h-5 w-5 text-destructive shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">
                {pendingDropi} {pendingDropi === 1 ? "orden pendiente" : "órdenes pendientes"} de crear en Dropi
              </p>
              <p className="text-xs text-muted-foreground">El cliente ya pagó — acción requerida</p>
            </div>
            <a href="/orders?status=pending_dropi" className="text-xs font-medium text-destructive hover:underline shrink-0">
              Ver órdenes →
            </a>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
