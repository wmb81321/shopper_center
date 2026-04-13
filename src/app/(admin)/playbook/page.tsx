import { createClient } from "@/lib/supabase/server";
import { PlaybookVentas } from "@/components/playbook-ventas";
import type { Product } from "@/lib/types";

export default async function PlaybookPage() {
  const supabase = await createClient();

  const [{ data: productsRaw }, { data: configRaw }] = await Promise.all([
    supabase.from("products").select("*").eq("is_active", true).order("name"),
    supabase.from("agent_config").select("value").eq("key", "playbook_selected_product").maybeSingle(),
  ]);

  const products = (productsRaw ?? []) as unknown as Product[];
  const initialProductId = (configRaw as { value: string } | null)?.value ?? products[0]?.id ?? "";

  return <PlaybookVentas products={products} initialProductId={initialProductId} />;
}
