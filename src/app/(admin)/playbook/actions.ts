"use server";

import { createClient } from "@/lib/supabase/server";

const KEY = "playbook_selected_product";

export async function setPlaybookProduct(productId: string) {
  const supabase = await createClient();
  await supabase
    .from("agent_config")
    .upsert({ key: KEY, value: productId }, { onConflict: "key" });
}
