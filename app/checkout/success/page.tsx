import Link from "next/link";
import { CheckCircle2, Package, ArrowRight, Search } from "lucide-react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Order Confirmed",
};

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <div className="rounded-full bg-green-500/10 p-4">
        <CheckCircle2 className="h-16 w-16 text-green-500" />
      </div>

      <h1 className="mt-6 text-3xl font-bold text-foreground">
        Order Confirmed!
      </h1>
      <p className="mt-3 leading-relaxed text-muted-foreground">
        Thank you for your order. We are preparing it now and will notify you
        when it is ready.
      </p>

      {params.order_id && (
        <div className="mt-6 rounded-lg border border-border bg-card px-6 py-4">
          <p className="text-sm text-muted-foreground">Order ID</p>
          <p className="mt-1 font-mono text-sm font-medium text-foreground">
            {params.order_id}
          </p>
        </div>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        {user ? (
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Package className="h-4 w-4" />
            View Orders
          </Link>
        ) : (
          <Link
            href="/track-order"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Search className="h-4 w-4" />
            Track Order
          </Link>
        )}
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
        >
          Continue Shopping
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
