import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdsManager } from "@/components/ads-manager";
import type { Ad } from "@/lib/types";

export default async function AdsPage() {
  const supabase = await createClient();
  const { data: raw } = await supabase
    .from("ads")
    .select("*, products(id, name, product_type, combo_type, price_regular, price_promo, promo_active, is_active)")
    .order("product_id")
    .order("ad_number");

  const ads = (raw ?? []) as unknown as Ad[];

  const activeCount = ads.filter((a) => a.status === "active").length;
  const pausedCount = ads.filter((a) => a.status === "paused").length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Anuncios</h1>
          <p className="text-sm text-muted-foreground">Gestión de anuncios por producto</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="default" className="text-xs">{activeCount} activos</Badge>
          <Badge variant="secondary" className="text-xs">{pausedCount} pausados</Badge>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{ads.length} anuncios en total</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <AdsManager ads={ads} />
        </CardContent>
      </Card>
    </div>
  );
}
