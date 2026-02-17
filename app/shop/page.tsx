import { createClient } from "@/lib/supabase/server";
import { siteConfig } from "@/lib/site-config";
import { ShopContent } from "./shop-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop",
  description: `Browse our full catalog of premium products at ${siteConfig.name}.`,
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("products").select("*").order("product_name");

  if (params.category) {
    query = query.eq("category", params.category);
  }

  if (params.q) {
    query = query.ilike("product_name", `%${params.q}%`);
  }

  const { data: products } = await query;

  // Fetch all regions and pickup locations for client filtering
  const [{ data: regions }, { data: pickupLocations }, { data: regionInventory }, { data: pickupInventory }] =
    await Promise.all([
      supabase.from("regions").select("*").eq("is_active", true),
      supabase.from("pickup_locations").select("*").eq("is_active", true),
      supabase.from("region_inventory").select("*"),
      supabase.from("pickup_inventory").select("*"),
    ]);

  return (
    <ShopContent
      products={products ?? []}
      regions={regions ?? []}
      pickupLocations={pickupLocations ?? []}
      regionInventory={regionInventory ?? []}
      pickupInventory={pickupInventory ?? []}
      initialCategory={params.category ?? ""}
      initialSearch={params.q ?? ""}
    />
  );
}
