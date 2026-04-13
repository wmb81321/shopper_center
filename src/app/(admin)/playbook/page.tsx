import { createClient } from "@/lib/supabase/server";
import { PlaybookVentas } from "@/components/playbook-ventas";
import type { Product } from "@/lib/types";

export default async function PlaybookPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("name");
  const products = (data ?? []) as unknown as Product[];
  return <PlaybookVentas products={products} />;
}
