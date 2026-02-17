/**
 * TEMPLATE CONFIG
 * When deploying for a new state/store, only this file (and logo/images) needs to change.
 */
export const siteConfig = {
  /** Store branding */
  name: "Generic Smokeshop",
  tagline: "Premium Smoke & Wellness",
  description:
    "Your trusted source for premium glass, vapes, accessories, CBD, and cannabis products.",

  /** Contact info */
  contact: {
    address: "123 Main Street, Kansas City, MO 64101",
    phone: "(555) 420-0000",
    email: "info@genericsmokeshop.com",
  },

  /** Social links */
  social: {
    instagram: "https://instagram.com/genericsmokeshop",
    facebook: "https://facebook.com/genericsmokeshop",
    twitter: "https://twitter.com/genericsmokeshop",
  },

  /** Branding assets */
  logo: "/images/logo.png",

  /** State identifier for region filtering */
  state: "MO",

  /** Product categories (display order) */
  categories: [
    {
      slug: "glass-pipes-bongs",
      name: "Glass Pipes & Bongs",
      description: "Water pipes, hand pipes, bubblers, dab rigs",
    },
    {
      slug: "vapes-e-cigarettes",
      name: "Vapes & E-Cigarettes",
      description: "Vape pens, cartridges, mods, e-liquids",
    },
    {
      slug: "rolling-papers-wraps",
      name: "Rolling Papers & Wraps",
      description: "Papers, blunt wraps, cones, rolling trays",
    },
    {
      slug: "accessories",
      name: "Accessories",
      description: "Grinders, lighters, torches, ashtrays, storage",
    },
    {
      slug: "cbd-delta",
      name: "CBD / Delta Products",
      description: "CBD flower, edibles, tinctures, delta-8",
    },
    {
      slug: "cannabis-flower",
      name: "Cannabis Flower",
      description: "Strains (indica, sativa, hybrid), pre-rolls",
    },
  ],
} as const;

export type Category = (typeof siteConfig.categories)[number];
