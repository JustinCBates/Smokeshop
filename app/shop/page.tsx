import { createClient } from "@/lib/supabase/server";
import { query } from "@/lib/database/client";
import { siteConfig } from "@/lib/site-config";
import { ShopContent } from "./shop-content";
import type { Metadata } from "next";

// Force dynamic rendering since we query database
export const dynamic = "force-dynamic";

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

  // Build PostgreSQL query for products (from VPS database)
  let productQuery = `
    SELECT 
      sku,
      name as product_name,
      description as product_description,
      ('/api/product-image/' || sku) as image_url,
      category,
      (price * 100)::integer as price_in_cents,
      in_stock,
      true as delivery_eligible,
      false as featured
    FROM products
    WHERE 1=1
  `;
  const queryParams: any[] = [];
  let paramIndex = 1;

  if (params.category) {
    productQuery += ` AND category = $${paramIndex}`;
    queryParams.push(params.category);
    paramIndex++;
  }

  if (params.q) {
    productQuery += ` AND name ILIKE $${paramIndex}`;
    queryParams.push(`%${params.q}%`);
    paramIndex++;
  }

  productQuery += ` ORDER BY name`;

  // Fetch products from VPS PostgreSQL with error handling
  let products = [];
  try {
    products = await query(productQuery, queryParams);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    // Continue with empty array
  }

  // Fetch regions, locations, and inventory from Supabase (for now)
  // TODO: Migrate these to VPS PostgreSQL once regions/inventory data is populated
  const supabase = await createClient();
  const [
    { data: regions },
    { data: pickupLocations },
    { data: regionInventory },
    { data: pickupInventory },
  ] = await Promise.all([
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
