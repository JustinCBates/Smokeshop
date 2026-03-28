"use client";

import Link from "next/link";
import { ShoppingCart, Truck, Store, Package } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useLocation } from "@/lib/location-context";
import { formatCurrency } from "@/lib/utils";

interface Product {
  sku: string;
  product_name: string;
  product_description: string | null;
  image_url: string | null;
  category: string;
  price_in_cents: number;
  delivery_eligible: boolean;
  featured: boolean;
}

interface StockInfo {
  deliveryQty: number;
  pickupQty: number;
}

export function ProductCard({
  product,
  stock,
}: {
  product: Product;
  stock?: StockInfo;
}) {
  const { addItem } = useCart();
  const { fulfillmentType, isLocationSet } = useLocation();

  const isInStock = isLocationSet
    ? fulfillmentType === "delivery"
      ? (stock?.deliveryQty ?? 0) > 0 && product.delivery_eligible
      : (stock?.pickupQty ?? 0) > 0
    : true;

  const stockLabel = isLocationSet
    ? fulfillmentType === "delivery"
      ? !product.delivery_eligible
        ? "Pickup Only"
        : (stock?.deliveryQty ?? 0) > 0
          ? `${stock?.deliveryQty} in stock`
          : "Out of Stock"
      : (stock?.pickupQty ?? 0) > 0
        ? `${stock?.pickupQty} in stock`
        : "Out of Stock"
    : null;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
      <Link
        href={`/shop/${product.sku}`}
        className="relative aspect-square overflow-hidden bg-muted"
      >
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.product_name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/images/products/placeholder.svg";
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-12 w-12 text-muted-foreground/40" />
          </div>
        )}
        {product.featured && (
          <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">
            Featured
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link href={`/shop/${product.sku}`}>
          <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {product.product_name}
          </h3>
        </Link>
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
          {product.product_description}
        </p>

        <div className="mt-auto flex items-center justify-between pt-3">
          <div>
            <p className="text-lg font-bold text-primary">
              {formatCurrency(product.price_in_cents)}
            </p>
            {stockLabel && (
              <div className="mt-0.5 flex items-center gap-1 text-xs">
                {fulfillmentType === "delivery" ? (
                  <Truck className="h-3 w-3" />
                ) : (
                  <Store className="h-3 w-3" />
                )}
                <span
                  className={
                    isInStock ? "text-green-500" : "text-muted-foreground"
                  }
                >
                  {stockLabel}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={(e) => {
              e.preventDefault();
              if (!isInStock) return;
              addItem({
                sku: product.sku,
                product_name: product.product_name,
                price_in_cents: product.price_in_cents,
                image_url: product.image_url,
                category: product.category,
                delivery_eligible: product.delivery_eligible,
              });
            }}
            disabled={!isInStock && isLocationSet}
            className="rounded-lg bg-primary p-2.5 text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={`Add ${product.product_name} to cart`}
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
