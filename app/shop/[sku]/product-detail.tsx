"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { useLocation } from "@/lib/location-context";
import { formatCurrency } from "@/lib/utils";
import { ProductCard } from "@/components/shop/product-card";
import LocationSelector from "@/components/modals/location-selector";
import {
  ShoppingCart,
  Truck,
  Store,
  MapPin,
  Package,
  Minus,
  Plus,
  ChevronLeft,
  Tag,
} from "lucide-react";

interface Product {
  sku: string;
  product_name: string;
  product_description: string | null;
  image_url: string | null;
  category: string;
  price_in_cents: number;
  delivery_eligible: boolean;
  featured: boolean;
  tags: string[] | null;
}

interface RegionInventory {
  sku: string;
  region_id: string;
  quantity: number;
}

interface PickupInventory {
  sku: string;
  pickup_location_id: string;
  quantity: number;
}

interface Props {
  product: Product;
  regionInventory: RegionInventory[];
  pickupInventory: PickupInventory[];
  relatedProducts: Product[];
}

export function ProductDetail({
  product,
  regionInventory,
  pickupInventory,
  relatedProducts,
}: Props) {
  const { addItem } = useCart();
  const location = useLocation();
  const [qty, setQty] = useState(1);
  const [showLocationModal, setShowLocationModal] = useState(false);

  const deliveryQty = location.region
    ? regionInventory
        .filter((ri) => ri.region_id === location.region!.id)
        .reduce((sum, ri) => sum + ri.quantity, 0)
    : 0;

  const pickupQty = location.pickupLocation
    ? pickupInventory
        .filter(
          (pi) => pi.pickup_location_id === location.pickupLocation!.id
        )
        .reduce((sum, pi) => sum + pi.quantity, 0)
    : 0;

  const isInStock = location.isLocationSet
    ? location.fulfillmentType === "delivery"
      ? deliveryQty > 0 && product.delivery_eligible
      : pickupQty > 0
    : true;

  const handleAddToCart = () => {
    addItem(
      {
        sku: product.sku,
        product_name: product.product_name,
        price_in_cents: product.price_in_cents,
        image_url: product.image_url,
        category: product.category,
        delivery_eligible: product.delivery_eligible,
      },
      qty
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Breadcrumb */}
      <Link
        href="/shop"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to shop
      </Link>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Product Image */}
        <div className="aspect-square overflow-hidden rounded-xl border border-border bg-muted">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.product_name}
              className="h-full w-full object-cover"
              crossOrigin="anonymous"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Package className="h-24 w-24 text-muted-foreground/30" />
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          {product.featured && (
            <span className="mb-2 w-fit rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
              Featured
            </span>
          )}
          <h1 className="text-3xl font-bold text-foreground text-balance">
            {product.product_name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground uppercase tracking-wide">
            SKU: {product.sku}
          </p>

          <p className="mt-4 text-4xl font-bold text-primary">
            {formatCurrency(product.price_in_cents)}
          </p>

          <p className="mt-4 leading-relaxed text-muted-foreground">
            {product.product_description}
          </p>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
                >
                  <Tag className="h-3 w-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Stock & fulfillment */}
          <div className="mt-6 space-y-3 rounded-lg border border-border bg-muted/50 p-4">
            {location.isLocationSet ? (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Truck className="h-4 w-4 text-primary" />
                    <span className="text-foreground">Delivery</span>
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      deliveryQty > 0 && product.delivery_eligible
                        ? "text-green-500"
                        : "text-muted-foreground"
                    }`}
                  >
                    {!product.delivery_eligible
                      ? "Not eligible"
                      : deliveryQty > 0
                        ? `${deliveryQty} available`
                        : "Out of stock"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Store className="h-4 w-4 text-primary" />
                    <span className="text-foreground">Pickup</span>
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      pickupQty > 0 ? "text-green-500" : "text-muted-foreground"
                    }`}
                  >
                    {pickupQty > 0
                      ? `${pickupQty} available`
                      : "Out of stock"}
                  </span>
                </div>
              </>
            ) : (
              <button
                onClick={() => setShowLocationModal(true)}
                className="flex w-full items-center justify-center gap-2 text-sm text-primary hover:text-primary/80"
              >
                <MapPin className="h-4 w-4" />
                Set location to check availability
              </button>
            )}
          </div>

          {/* Add to cart */}
          <div className="mt-6 flex items-center gap-3">
            <div className="flex items-center rounded-lg border border-border">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="px-3 py-2.5 text-muted-foreground hover:text-foreground"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-[3rem] text-center text-sm font-medium text-foreground">
                {qty}
              </span>
              <button
                onClick={() => setQty(qty + 1)}
                className="px-3 py-2.5 text-muted-foreground hover:text-foreground"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!isInStock && location.isLocationSet}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ShoppingCart className="h-5 w-5" />
              {isInStock || !location.isLocationSet
                ? "Add to Cart"
                : "Out of Stock"}
            </button>
          </div>
        </div>
      </div>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-bold text-foreground">
            Related Products
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            {relatedProducts.map((rp) => (
              <ProductCard key={rp.sku} product={rp} />
            ))}
          </div>
        </section>
      )}

      <LocationSelector
        open={showLocationModal}
        onClose={() => setShowLocationModal(false)}
      />
    </div>
  );
}
