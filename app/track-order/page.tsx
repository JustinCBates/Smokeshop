"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { Search, Package, Loader2 } from "lucide-react";
import Link from "next/link";

export default function GuestOrderLookupPage() {
  const [email, setEmail] = useState("");
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [error, setError] = useState("");

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setOrder(null);
    setOrderItems([]);

    if (!email || !orderId) {
      setError("Please provide both email and order ID");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      // Lookup order by ID and guest email
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .eq("guest_email", email)
        .single();

      if (orderError || !orderData) {
        setError("Order not found. Please check your email and order ID.");
        return;
      }

      setOrder(orderData);

      // Get order items
      const { data: items } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", orderId);

      setOrderItems(items || []);
    } catch (err: any) {
      setError("Failed to lookup order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="text-center mb-8">
        <Package className="h-12 w-12 text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-foreground">Track Your Order</h1>
        <p className="mt-2 text-muted-foreground">
          Enter your email and order ID to view your order status
        </p>
      </div>

      <form onSubmit={handleLookup} className="space-y-4 mb-8">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Order ID
          </label>
          <input
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            required
          />
          <p className="mt-1 text-xs text-muted-foreground">
            You received this in your order confirmation email
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Search className="h-5 w-5" />
          )}
          {loading ? "Searching..." : "Look Up Order"}
        </button>
      </form>

      {order && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Order Details
            </h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Order ID:</dt>
                <dd className="font-medium text-foreground font-mono text-xs">
                  {order.id.slice(0, 8)}...
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Status:</dt>
                <dd className="font-medium text-foreground capitalize">
                  {order.status}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Name:</dt>
                <dd className="font-medium text-foreground">{order.guest_name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Email:</dt>
                <dd className="font-medium text-foreground">{order.guest_email}</dd>
              </div>
              {order.guest_phone && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Phone:</dt>
                  <dd className="font-medium text-foreground">{order.guest_phone}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Fulfillment:</dt>
                <dd className="font-medium text-foreground capitalize">
                  {order.fulfillment_type}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Total:</dt>
                <dd className="font-bold text-primary">
                  {formatCurrency(order.total_cents)}
                </dd>
              </div>
            </dl>
          </div>

          {orderItems.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Items ({orderItems.length})
              </h2>
              <div className="space-y-3">
                {orderItems.map((item) => (
                  <div
                    key={item.sku}
                    className="flex items-center justify-between text-sm"
                  >
                    <div>
                      <span className="text-foreground">{item.product_name}</span>
                      <span className="text-muted-foreground"> x{item.quantity}</span>
                    </div>
                    <span className="font-medium text-foreground">
                      {formatCurrency(item.price_in_cents * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Have an account?{" "}
        <Link href="/account/orders" className="text-primary hover:underline">
          View your orders
        </Link>
      </p>
    </div>
  );
}
