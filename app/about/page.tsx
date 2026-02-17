import { siteConfig } from "@/lib/site-config";
import { ShieldCheck, Users, Leaf, Award } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: `Learn about ${siteConfig.name} and our mission to provide premium smoke and wellness products.`,
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground text-balance">
          About {siteConfig.name}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
          We are a premium smoke shop serving Missouri with the highest quality
          glass, vapes, accessories, CBD, and cannabis products. Our mission is
          to provide a safe, legal, and welcoming experience for all adult
          customers.
        </p>
      </div>

      <div className="mt-16 grid gap-8 md:grid-cols-2">
        <div className="flex gap-4 rounded-xl border border-border bg-card p-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Compliance First</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              We operate in full compliance with Missouri state laws. Every
              customer goes through our two-step age verification process to
              ensure responsible sales.
            </p>
          </div>
        </div>

        <div className="flex gap-4 rounded-xl border border-border bg-card p-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Leaf className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Quality Products</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              We carefully curate our inventory from trusted brands and
              suppliers. All CBD and Delta products are lab-tested for purity
              and potency.
            </p>
          </div>
        </div>

        <div className="flex gap-4 rounded-xl border border-border bg-card p-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Community Focused</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              We partner with local communities across Missouri to bring
              convenient delivery and pickup options to our customers, creating
              jobs and supporting local economies.
            </p>
          </div>
        </div>

        <div className="flex gap-4 rounded-xl border border-border bg-card p-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Award className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              Scalable Platform
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Our technology platform is designed to scale. We are building a
              network of regional partners who can serve their local communities
              with the same high-quality experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
