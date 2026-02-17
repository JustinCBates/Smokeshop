import Link from "next/link"
import { siteConfig } from "@/lib/site-config"
import { ArrowRight, Truck, MapPin, ShieldCheck } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-4 py-24 text-center lg:py-32">
        <h1 className="max-w-3xl text-balance text-4xl font-bold tracking-tight text-foreground md:text-6xl">
          Premium Smoke &{" "}
          <span className="text-primary">Wellness Products</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-lg text-muted-foreground">
          {siteConfig.description} Delivery and pickup available across Missouri.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/shop"
            className="flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Shop Now
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/shop?category=glass-pipes-bongs"
            className="rounded-md border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            Browse Glass
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
            <h3 className="font-semibold text-foreground">Local Delivery</h3>
            <p className="text-sm text-muted-foreground">
              Same-day and next-day delivery to Kansas City, St. Louis,
              Springfield, and Columbia areas.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">In-Store Pickup</h3>
            <p className="text-sm text-muted-foreground">
              Order online and pick up at any of our locations. Full product
              selection including cannabis flower.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Age Verified</h3>
            <p className="text-sm text-muted-foreground">
              Secure age verification process. Two-step verification for
              cannabis and Delta products.
            </p>
          </div>
        </div>
      </section>

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
  )
}
