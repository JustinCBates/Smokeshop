/**
 * TEMPLATE CONFIG
 * When deploying for a new state/store, only this file (and logo/images) needs to change.
 */
export const siteConfig = {
  /** Store branding */
  name: "Botanical Wellness Co",
  tagline: "Natural Wellness Products",
  description:
    "Premium botanical products and wellness essentials delivered to your door. Serving Colorado communities.",

  /** Contact info */
  contact: {
    address: "Denver, CO 80202",
    phone: "(555) 123-4567",
    email: "hello@neutraldevelopment.com",
  },

  /** Social links */
  social: {
    instagram: "https://instagram.com/botanicalwellness",
    facebook: "https://facebook.com/botanicalwellness",
    twitter: "https://twitter.com/botanicalwellness",
  },

  /** Branding assets */
  logo: "/images/logo.png",

  /** State identifier for region filtering */
  state: "CO",

  /** Product categories (display order) */
  categories: [
    {
      slug: "glass-pipes-bongs",
      name: "Premium Glassware",
      description: "Artisan glass pieces, water filtration systems",
    },
    {
      slug: "vapes-e-cigarettes",
      name: "Vaporizers",
      description: "Premium vaporizer devices and accessories",
    },
    {
      slug: "rolling-papers-wraps",
      name: "Rolling Essentials",
      description: "Premium papers, wraps, and accessories",
    },
    {
      slug: "accessories",
      name: "Accessories",
      description: "Storage solutions, tools, and essentials",
    },
    {
      slug: "cbd-delta-products",
      name: "Botanical Wellness",
      description: "Natural botanical products and supplements",
    },
    {
      slug: "cannabis-flower",
      name: "Premium Botanicals",
      description: "Curated botanical selections (21+ only)",
    },
  ],
} as const;

export type Category = (typeof siteConfig.categories)[number];
