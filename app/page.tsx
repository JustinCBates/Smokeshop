import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import { query } from "@/lib/database/client";
import { ArrowRight, Truck, MapPin, ShieldCheck, Package } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
// Force dynamic rendering since we query database
export const dynamic = "force-dynamic";
export default async function HomePage() {
  // Fetch featured products from VPS PostgreSQL
  // Since we don't have a featured column yet, show first 4 products
  let featuredProducts = [];

  try {
    featuredProducts = await query(`
      SELECT 
        sku,
        name as product_name,
        description as product_description,
        ('/api/product-image/' || sku) as image_url,
        (price * 100)::integer as price_in_cents,
        category
      FROM products
      ORDER BY created_at DESC
      LIMIT 4
    `);
  } catch (error) {
    console.error("Failed to fetch featured products:", error);
    // Continue with empty array - page will still render
  }

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-4 py-24 text-center lg:py-32">
        <h1 className="max-w-3xl text-balance text-4xl font-bold tracking-tight text-foreground md:text-6xl">
          Natural Wellness &{" "}
          <span className="text-primary">Botanical Products</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-lg text-muted-foreground">
          {siteConfig.description}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/shop"
            className="flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Explore Products
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/shop?category=glass-pipes-bongs"
            className="rounded-md border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            Premium Glassware
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-card px-4 py-16">
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Truck className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Fast Delivery</h3>
            <p className="text-sm text-muted-foreground">
              Same-day and next-day delivery available. Convenient scheduling to
              fit your lifestyle.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Pickup Available</h3>
            <p className="text-sm text-muted-foreground">
              Order online and pick up at your convenience. Multiple locations
              throughout Colorado.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Age Verified</h3>
            <p className="text-sm text-muted-foreground">
              Secure verification process ensures responsible access. Must be
              21+ to purchase.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts && featuredProducts.length > 0 && (
        <section className="px-4 py-16">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-8 text-center text-2xl font-bold text-foreground">
              Featured Products
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((product) => (
                <Link
                  key={product.sku}
                  href={`/shop/${product.sku}`}
                  className="group overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
                >
                  <div className="aspect-square overflow-hidden bg-muted">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.product_name}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src =
                            "/images/products/placeholder.svg";
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-12 w-12 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground group-hover:text-primary line-clamp-1">
                      {product.product_name}
                    </h3>
                    <p className="mt-1 text-lg font-bold text-primary">
                      {formatCurrency(product.price_in_cents)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80"
              >
                View all products
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-8 text-center text-2xl font-bold text-foreground">
            Shop by Category
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {siteConfig.categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/shop?category=${cat.slug}`}
                className="group flex flex-col gap-2 rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/50"
              >
                <h3 className="font-semibold text-foreground group-hover:text-primary">
                  {cat.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {cat.description}
                </p>
                <span className="mt-auto flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  Browse <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
