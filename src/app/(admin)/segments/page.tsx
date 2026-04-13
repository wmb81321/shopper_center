import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SegmentsViewer } from "@/components/segments-viewer";
import type { Segment } from "@/lib/types";

export default async function SegmentsPage() {
  const supabase = await createClient();
  const { data: raw } = await supabase
    .from("segments")
    .select("*, products(id, name, product_type, combo_type, price_regular, price_promo, promo_active, is_active)")
    .order("created_at");

  const segments = (raw ?? []) as unknown as Segment[];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Segmentación</h1>
        <p className="text-sm text-muted-foreground">Configuración de targeting Meta Ads por producto</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{segments.length} segmentos configurados</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <SegmentsViewer segments={segments} />
        </CardContent>
      </Card>
    </div>
  );
}
