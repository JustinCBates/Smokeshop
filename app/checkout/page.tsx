"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { useLocation } from "@/lib/location-context";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";
import LocationSelector from "@/components/modals/location-selector";
import {
  MapPin,
  Truck,
  Store,
  CreditCard,
  Loader2,
  ShieldCheck,
  ChevronLeft,
  Clock,
} from "lucide-react";
import Link from "next/link";

interface DeliveryFeeTier {
  id: string;
  region_id: string;
  tier_name: string;
  description: string;
  fee_cents: number;
  estimated_minutes_min: number;
  estimated_minutes_max: number;
  sort_order: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotalCents, clearCart } = useCart();
  const location = useLocation();
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [feeTiers, setFeeTiers] = useState<DeliveryFeeTier[]>([]);
  const [selectedTier, setSelectedTier] = useState<DeliveryFeeTier | null>(null);
  const [loading, setLoading] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [error, setError] = useState("");

  const taxRate = 0.0823; // MO avg sales tax
  const deliveryFee = location.fulfillmentType === "delivery" && selectedTier
    ? selectedTier.fee_cents
    : 0;
  const taxCents = Math.round(subtotalCents * taxRate);
  const totalCents = subtotalCents + deliveryFee + taxCents;

  useEffect(() => {
    if (location.region && location.fulfillmentType === "delivery") {
      const supabase = createClient();
      supabase
        .from("delivery_fee_tiers")
        .select("*")
        .eq("region_id", location.region.id)
        .eq("is_active", true)
        .order("sort_order")
        .then(({ data }) => {
          if (data && data.length > 0) {
            setFeeTiers(data);
            setSelectedTier(data[data.length - 1]); // Default to cheapest
          }
        });
    }
  }, [location.region, location.fulfillmentType]);

  const handleCheckout = async () => {
    if (!ageConfirmed) {
      setError("You must confirm you are 21+ to proceed.");
      return;
    }
    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }
    if (!location.isLocationSet) {
      setError("Please set your location first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            sku: i.sku,
            product_name: i.product_name,
            price_in_cents: i.price_in_cents,
            quantity: i.quantity,
          })),
          fulfillment_type: location.fulfillmentType,
          region_id: location.region?.id ?? null,
          pickup_location_id: location.pickupLocation?.id ?? null,
          delivery_address: location.customerAddress || null,
          delivery_fee_tier_id: selectedTier?.id ?? null,
          delivery_fee_cents: deliveryFee,
          tax_cents: taxCents,
          age_verified: ageConfirmed,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center justify-center px-4 py-24 text-center">
        <CreditCard className="h-20 w-20 text-muted-foreground/30" />
        <h1 className="mt-6 text-2xl font-bold text-foreground">
          Nothing to checkout
        </h1>
        <p className="mt-2 text-muted-foreground">
          Add items to your cart before checking out.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground"
        >
          Browse Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/cart"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to cart
      </Link>

      <h1 className="text-3xl font-bold text-foreground">Checkout</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Left: Details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Location */}
          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">
              Fulfillment
            </h2>
            <div className="mt-4">
              {location.isLocationSet ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {location.fulfillmentType === "delivery" ? (
                      <Truck className="h-5 w-5 text-primary" />
                    ) : (
                      <Store className="h-5 w-5 text-primary" />
                    )}
                    <div>
                      <p className="font-medium text-foreground">
                        {location.fulfillmentType === "delivery"
                          ? `Delivery to ${location.region?.region_name}`
                          : `Pickup at ${location.pickupLocation?.location_name}`}
                      </p>
                      {location.customerAddress && (
                        <p className="text-sm text-muted-foreground">
                          {location.customerAddress}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowLocationModal(true)}
                    className="text-sm text-primary hover:text-primary/80"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowLocationModal(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border py-4 text-sm text-muted-foreground hover:border-primary hover:text-primary"
                >
                  <MapPin className="h-4 w-4" />
                  Set your delivery or pickup location
                </button>
              )}
            </div>

            {/* Delivery fee tier selection */}
            {location.fulfillmentType === "delivery" &&
              feeTiers.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    Delivery Speed
                  </p>
                  {feeTiers.map((tier) => (
                    <label
                      key={tier.id}
                      className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors ${
                        selectedTier?.id === tier.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="delivery-tier"
                          checked={selectedTier?.id === tier.id}
                          onChange={() => setSelectedTier(tier)}
                          className="accent-primary"
                        />
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {tier.tier_name}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {tier.description}
                          </div>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-primary">
                        {formatCurrency(tier.fee_cents)}
                      </span>
                    </label>
                  ))}
                </div>
              )}
          </section>

          {/* Age verification */}
          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">
              Age Verification
            </h2>
            <label className="mt-4 flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={ageConfirmed}
                onChange={(e) => setAgeConfirmed(e.target.checked)}
                className="mt-0.5 accent-primary"
              />
              <div>
                <p className="text-sm font-medium text-foreground">
                  I confirm I am 21 years of age or older
                </p>
                <p className="text-xs text-muted-foreground">
                  You may be asked to present a valid ID upon delivery or pickup.
                </p>
              </div>
            </label>
          </section>

          {/* Order items */}
          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">
              Order Items ({items.length})
            </h2>
            <div className="mt-4 space-y-3">
              {items.map((item) => (
                <div
                  key={item.sku}
                  className="flex items-center justify-between text-sm"
                >
                  <div>
                    <span className="text-foreground">{item.product_name}</span>
                    <span className="text-muted-foreground">
                      {" "}
                      x{item.quantity}
                    </span>
                  </div>
                  <span className="font-medium text-foreground">
                    {formatCurrency(item.price_in_cents * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right: Order summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">
              Order Summary
            </h2>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">
                  {formatCurrency(subtotalCents)}
                </span>
              </div>
              {location.fulfillmentType === "delivery" && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Delivery ({selectedTier?.tier_name ?? "..."})
                  </span>
                  <span className="text-foreground">
                    {formatCurrency(deliveryFee)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span className="text-foreground">
                  {formatCurrency(taxCents)}
                </span>
              </div>
              <div className="border-t border-border pt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-bold text-foreground">
                    Total
                  </span>
                  <span className="text-lg font-bold text-primary">
                    {formatCurrency(totalCents)}
                  </span>
                </div>
              </div>
            </div>

            {error && (
              <p className="mt-4 text-sm text-destructive">{error}</p>
            )}

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3.5 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <CreditCard className="h-5 w-5" />
              )}
              {loading ? "Processing..." : "Pay with Stripe"}
            </button>

            <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" />
              Secure checkout powered by Stripe
            </div>
          </div>
        </div>
      </div>

      <LocationSelector
        open={showLocationModal}
        onClose={() => setShowLocationModal(false)}
      />
    </div>
  );
}
