import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProductsManager } from "@/components/products-manager";
import type { Product } from "@/lib/types";

export default async function ProductsPage() {
  const supabase = await createClient();
  const { data: raw } = await supabase
    .from("products")
    .select("*")
    .order("source")
    .order("name");
  const products = (raw ?? []) as unknown as Product[];

  const active = products.filter((p) => p.is_active).length;
  const manual = products.filter((p) => p.source === "manual").length;

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold">Productos</h1>
          <p className="text-sm text-muted-foreground">Catálogo activo para el agente AI</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="default" className="text-xs">{active} activos</Badge>
          <Badge variant="outline" className="text-xs">{manual} manuales</Badge>
          <Badge variant="secondary" className="text-xs">{products.length - manual} Dropi</Badge>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <ProductsManager products={products} />
        </CardContent>
      </Card>
    </div>
  );
}
