"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { useLocation } from "@/lib/location-context";
import { formatCurrency } from "@/lib/utils";
import {
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  Package,
  ArrowRight,
  ChevronLeft,
} from "lucide-react";

export default function CartPage() {
  const { items, removeItem, updateQuantity, itemCount, subtotalCents, clearCart } =
    useCart();
  const { isLocationSet, fulfillmentType, region, pickupLocation } = useLocation();

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center justify-center px-4 py-24 text-center">
        <ShoppingCart className="h-20 w-20 text-muted-foreground/30" />
        <h1 className="mt-6 text-2xl font-bold text-foreground">
          Your cart is empty
        </h1>
        <p className="mt-2 text-muted-foreground">
          Browse our shop to find something you love.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Continue Shopping
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/shop"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        <ChevronLeft className="h-4 w-4" />
        Continue shopping
      </Link>

      <h1 className="text-3xl font-bold text-foreground">
        Your Cart ({itemCount})
      </h1>

      <div className="mt-6 space-y-4">
        {items.map((item) => (
          <div
            key={item.sku}
            className="flex items-center gap-4 rounded-xl border border-border bg-card p-4"
          >
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.product_name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/images/products/placeholder.svg";
                  }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Package className="h-8 w-8 text-muted-foreground/30" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <Link
                href={`/shop/${item.sku}`}
                className="font-semibold text-foreground hover:text-primary"
              >
                {item.product_name}
              </Link>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(item.price_in_cents)} each
              </p>
            </div>

            <div className="flex items-center rounded-lg border border-border">
              <button
                onClick={() => updateQuantity(item.sku, item.quantity - 1)}
                className="px-2.5 py-1.5 text-muted-foreground hover:text-foreground"
                aria-label="Decrease"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="min-w-[2.5rem] text-center text-sm font-medium text-foreground">
                {item.quantity}
              </span>
              <button
                onClick={() => updateQuantity(item.sku, item.quantity + 1)}
                className="px-2.5 py-1.5 text-muted-foreground hover:text-foreground"
                aria-label="Increase"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            <p className="w-24 text-right font-semibold text-foreground">
              {formatCurrency(item.price_in_cents * item.quantity)}
            </p>

            <button
              onClick={() => removeItem(item.sku)}
              className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              aria-label="Remove"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-8 rounded-xl border border-border bg-card p-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium text-foreground">
              {formatCurrency(subtotalCents)}
            </span>
          </div>
          {isLocationSet && fulfillmentType === "delivery" && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Delivery</span>
              <span className="text-muted-foreground">
                Calculated at checkout
              </span>
            </div>
          )}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Tax</span>
            <span className="text-muted-foreground">
              Calculated at checkout
            </span>
          </div>
          <div className="border-t border-border pt-3">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-foreground">
                Estimated Total
              </span>
              <span className="text-lg font-bold text-primary">
                {formatCurrency(subtotalCents)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/checkout"
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Proceed to Checkout
            <ArrowRight className="h-4 w-4" />
          </Link>
          <button
            onClick={clearCart}
            className="rounded-lg border border-border px-6 py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
          >
            Clear Cart
          </button>
        </div>
      </div>
    </div>
  );
}
