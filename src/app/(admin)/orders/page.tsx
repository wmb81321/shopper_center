import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrdersTable } from "@/components/orders-table";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("orders")
    .select("*, customers(name, phone, city, address), products(name, dropi_product_id)")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data: orders } = await query;

  const { count: pendingCount } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending_dropi");

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Órdenes</h1>
          <p className="text-sm text-muted-foreground">Gestión de pedidos y estado Dropi</p>
        </div>
        {pendingCount && pendingCount > 0 && (
          <Badge variant="destructive" className="text-sm px-3 py-1">
            {pendingCount} pendientes Dropi
          </Badge>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { value: undefined, label: "Todas" },
          { value: "pending_dropi", label: "Crear en Dropi" },
          { value: "paid", label: "Pagadas" },
          { value: "pending_payment", label: "Pago pendiente" },
          { value: "shipped", label: "Enviadas" },
          { value: "delivered", label: "Entregadas" },
        ].map((f) => (
          <a
            key={f.value ?? "all"}
            href={f.value ? `/orders?status=${f.value}` : "/orders"}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              status === f.value || (!status && !f.value)
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
            }`}
          >
            {f.label}
          </a>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {orders?.length ?? 0} orden{(orders?.length ?? 0) !== 1 ? "es" : ""}
            {status && ` · ${status.replace("_", " ")}`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <OrdersTable orders={orders ?? []} />
        </CardContent>
      </Card>
    </div>
  );
}
