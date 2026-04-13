import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BenefitsEditor } from "@/components/benefits-editor";
import type { Benefit } from "@/lib/types";

export default async function BenefitsPage() {
  const supabase = await createClient();
  const { data: raw } = await supabase
    .from("benefits")
    .select("*")
    .single();

  const benefit = raw as unknown as Benefit | null;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Beneficios</h1>
        <p className="text-sm text-muted-foreground">Condiciones de entrega y datos del Mundial</p>
      </div>

      {benefit ? (
        <div className="max-w-2xl">
          <BenefitsEditor benefit={benefit} />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sin configuración</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No se encontró configuración de beneficios.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
