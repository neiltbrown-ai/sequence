import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PortfolioTabs from "@/components/portal/portfolio-tabs";
import type { AssetInventoryItem, AssetInventoryAnalysis } from "@/types/inventory";
import { getAllStructures } from "@/lib/content";

export default async function InventoryRoute() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: items } = await supabase
    .from("asset_inventory_items")
    .select("*")
    .eq("user_id", user.id)
    .order("sort_order", { ascending: true });

  const { data: latestAnalysis } = await supabase
    .from("asset_inventory_analyses")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Build structure number → slug/title map for deep linking
  const structures = getAllStructures();
  const structureSlugMap: Record<number, { slug: string; title: string }> = {};
  for (const s of structures) {
    structureSlugMap[s.number] = { slug: s.slug, title: s.title };
  }

  return (
    <PortfolioTabs
      initialItems={(items as AssetInventoryItem[]) || []}
      initialAnalysis={(latestAnalysis as AssetInventoryAnalysis) || null}
      structureSlugMap={structureSlugMap}
    />
  );
}
