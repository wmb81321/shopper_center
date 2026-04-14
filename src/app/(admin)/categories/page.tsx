import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { CategoriesManager } from "@/components/categories-manager";
import type { Category } from "@/lib/types";

export default async function CategoriesPage() {
  const supabase = await createClient();
  const { data: raw } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order")
    .order("name");
  const categories = (raw ?? []) as Category[];

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Categorías</h1>
        <p className="text-sm text-muted-foreground">
          Gestiona las categorías de la tienda y sus imágenes
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <CategoriesManager categories={categories} />
        </CardContent>
      </Card>
    </div>
  );
}
