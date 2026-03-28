import { createClient } from "@/lib/supabase/server";
import { query } from "@/lib/database/client";
import { siteConfig } from "@/lib/site-config";
import { notFound } from "next/navigation";
import { ProductDetail } from "./product-detail";
import type { Metadata } from "next";

// Force dynamic rendering since we query database
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ sku: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sku } = await params;
  const products = await query(
    `SELECT name as product_name, description as product_description FROM products WHERE sku = $1`,
    [sku],
  );

  const data = products[0];

  return {
    title: data?.product_name ?? "Product",
    description: data?.product_description ?? siteConfig.description,
  };
}

export default async function ProductPage({ params }: Props) {
  const { sku } = await params;

  // Fetch product from VPS PostgreSQL
  const products = await query(
    `
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
    WHERE sku = $1
    `,
    [sku],
  );

  const product = products[0];
  if (!product) notFound();

  // Fetch inventory from Supabase (for now)
  const supabase = await createClient();
  const [{ data: regionInventory }, { data: pickupInventory }] =
    await Promise.all([
      supabase.from("region_inventory").select("*").eq("sku", sku),
      supabase.from("pickup_inventory").select("*").eq("sku", sku),
    ]);

  // Get related products from the same category (VPS PostgreSQL)
  let related = [];
  try {
    related = await query(
      `
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
      WHERE category = $1 AND sku != $2
      LIMIT 4
      `,
      [product.category, sku],
    );
  } catch (error) {
    console.error("Failed to fetch related products:", error);
  }

  return (
    <ProductDetail
      product={product}
      regionInventory={regionInventory ?? []}
      pickupInventory={pickupInventory ?? []}
      relatedProducts={related ?? []}
    />
  );
}
