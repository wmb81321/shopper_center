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
    .order("name");
  const products = (raw ?? []) as unknown as Product[];

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Productos</h1>
          <p className="text-sm text-muted-foreground">Catálogo activo para el agente AI</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="default" className="text-xs">
            {products?.filter((p) => p.active).length ?? 0} activos
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {products?.filter((p) => !p.active).length ?? 0} inactivos
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{products?.length ?? 0} productos en catálogo</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ProductsManager products={products ?? []} />
        </CardContent>
      </Card>
    </div>
  );
}
