import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { User, Package, MapPin, ShieldCheck, LogOut } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Account",
};

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold text-foreground">My Account</h1>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {/* Profile */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">
                {profile?.first_name && profile?.last_name
                  ? `${profile.first_name} ${profile.last_name}`
                  : "Customer"}
              </h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Role</span>
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground capitalize">
                {profile?.role ?? "customer"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Age Verified</span>
              <span
                className={`text-xs font-medium ${profile?.age_verified ? "text-green-500" : "text-muted-foreground"}`}
              >
                {profile?.age_verified ? "Verified" : "Not verified"}
              </span>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="space-y-3">
          <Link
            href="/account/orders"
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
          >
            <Package className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium text-foreground">Order History</p>
              <p className="text-sm text-muted-foreground">
                View your past orders
              </p>
            </div>
          </Link>
          <Link
            href="/shop"
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
          >
            <MapPin className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium text-foreground">Browse Shop</p>
              <p className="text-sm text-muted-foreground">
                Continue shopping
              </p>
            </div>
          </Link>
          <form action="/auth/signout" method="POST">
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-destructive/40"
            >
              <LogOut className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">Sign Out</p>
                <p className="text-sm text-muted-foreground">
                  Log out of your account
                </p>
              </div>
            </button>
          </form>
        </div>
      </div>

      {/* Recent orders */}
      {orders && orders.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-xl font-bold text-foreground">
            Recent Orders
          </h2>
          <div className="space-y-3">
            {orders.map((order: any) => (
              <div
                key={order.id}
                className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
              >
                <div>
                  <p className="font-mono text-sm font-medium text-foreground">
                    {order.id.slice(0, 8)}...
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString()} &middot;{" "}
                    {order.fulfillment_type === "delivery"
                      ? "Delivery"
                      : "Pickup"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary">
                    ${(order.total_cents / 100).toFixed(2)}
                  </p>
                  <span
                    className={`text-xs font-medium capitalize ${
                      order.status === "completed"
                        ? "text-green-500"
                        : order.status === "pending"
                          ? "text-yellow-500"
                          : "text-muted-foreground"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/account/orders"
            className="mt-4 inline-flex text-sm text-primary hover:text-primary/80"
          >
            View all orders
          </Link>
        </section>
      )}
    </div>
  );
}
