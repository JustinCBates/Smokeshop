import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Package, ChevronLeft } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order History",
};

export default async function OrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: orders } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/account"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to account
      </Link>

      <h1 className="text-3xl font-bold text-foreground">Order History</h1>

      {!orders || orders.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <Package className="h-16 w-16 text-muted-foreground/30" />
          <h2 className="mt-4 text-lg font-medium text-foreground">
            No orders yet
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Your order history will appear here.
          </p>
          <Link
            href="/shop"
            className="mt-6 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((order: any) => (
            <div
              key={order.id}
              className="rounded-xl border border-border bg-card p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-sm font-medium text-foreground">
                    Order #{order.id.slice(0, 8)}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                      order.status === "completed"
                        ? "bg-green-500/10 text-green-500"
                        : order.status === "pending"
                          ? "bg-yellow-500/10 text-yellow-500"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-2 border-t border-border pt-4">
                {order.order_items?.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-foreground">
                      {item.product_name}{" "}
                      <span className="text-muted-foreground">
                        x{item.quantity}
                      </span>
                    </span>
                    <span className="text-foreground">
                      ${((item.price_in_cents * item.quantity) / 100).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <span className="text-sm text-muted-foreground capitalize">
                  {order.fulfillment_type}
                </span>
                <span className="text-lg font-bold text-primary">
                  ${(order.total_cents / 100).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
