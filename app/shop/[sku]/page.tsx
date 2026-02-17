import { createClient } from "@/lib/supabase/server";
import { siteConfig } from "@/lib/site-config";
import { notFound } from "next/navigation";
import { ProductDetail } from "./product-detail";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ sku: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sku } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("product_name, product_description")
    .eq("sku", sku)
    .single();

  return {
    title: data?.product_name ?? "Product",
    description: data?.product_description ?? siteConfig.description,
  };
}

export default async function ProductPage({ params }: Props) {
  const { sku } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("sku", sku)
    .single();

  if (!product) notFound();

  const [{ data: regionInventory }, { data: pickupInventory }] =
    await Promise.all([
      supabase.from("region_inventory").select("*").eq("sku", sku),
      supabase.from("pickup_inventory").select("*").eq("sku", sku),
    ]);

  // Get related products from the same category
  const { data: related } = await supabase
    .from("products")
    .select("*")
    .eq("category", product.category)
    .neq("sku", sku)
    .limit(4);

  return (
    <ProductDetail
      product={product}
      regionInventory={regionInventory ?? []}
      pickupInventory={pickupInventory ?? []}
      relatedProducts={related ?? []}
    />
  );
}
