import Link from "next/link"
import { siteConfig } from "@/lib/site-config"

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <span className="text-lg font-bold text-primary">
              {siteConfig.name}
            </span>
            <p className="text-sm text-muted-foreground">
              {siteConfig.description}
            </p>
          </div>

          {/* Shop */}
          <div className="flex flex-col gap-3">
            <span className="text-sm font-semibold text-foreground">Shop</span>
            {siteConfig.categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/shop?category=${cat.slug}`}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {cat.name}
              </Link>
            ))}
          </div>

          {/* Company */}
          <div className="flex flex-col gap-3">
            <span className="text-sm font-semibold text-foreground">
              Company
            </span>
            <Link
              href="/about"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              About Us
            </Link>
            <Link
              href="/contact"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Contact
            </Link>
            <Link
              href="/faq"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              FAQ
            </Link>
            <Link
              href="/track-order"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Track Order
            </Link>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-3">
            <span className="text-sm font-semibold text-foreground">
              Contact
            </span>
            <p className="text-sm text-muted-foreground">
              {siteConfig.contact.address}
            </p>
            <a
              href={`tel:${siteConfig.contact.phone}`}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {siteConfig.contact.phone}
            </a>
            <a
              href={`mailto:${siteConfig.contact.email}`}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {siteConfig.contact.email}
            </a>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} {siteConfig.name}. All rights
            reserved. Must be 21+ to purchase.
          </p>
        </div>
      </div>
    </footer>
  )
}
