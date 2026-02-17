"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/shop/product-card";
import LocationSelector from "@/components/modals/location-selector";
import { useLocation } from "@/lib/location-context";
import { siteConfig } from "@/lib/site-config";
import { MapPin, Search, SlidersHorizontal, Truck, Store } from "lucide-react";

interface Product {
  sku: string;
  product_name: string;
  product_description: string | null;
  image_url: string | null;
  category: string;
  price_in_cents: number;
  delivery_eligible: boolean;
  featured: boolean;
}

interface RegionInventory {
  sku: string;
  region_id: string;
  quantity: number;
}

interface PickupInventory {
  sku: string;
  pickup_location_id: string;
  quantity: number;
}

interface Props {
  products: Product[];
  regions: any[];
  pickupLocations: any[];
  regionInventory: RegionInventory[];
  pickupInventory: PickupInventory[];
  initialCategory: string;
  initialSearch: string;
}

export function ShopContent({
  products,
  regionInventory,
  pickupInventory,
  initialCategory,
  initialSearch,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const location = useLocation();
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [search, setSearch] = useState(initialSearch);
  const [activeCategory, setActiveCategory] = useState(initialCategory);

  const handleCategoryClick = (slug: string) => {
    const next = activeCategory === slug ? "" : slug;
    setActiveCategory(next);
    const params = new URLSearchParams(searchParams.toString());
    if (next) params.set("category", next);
    else params.delete("category");
    router.push(`/shop?${params.toString()}`);
  };

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (search) params.set("q", search);
    else params.delete("q");
    router.push(`/shop?${params.toString()}`);
  };

  const stockMap = useMemo(() => {
    const map: Record<string, { deliveryQty: number; pickupQty: number }> = {};

    products.forEach((p) => {
      const deliveryQty = location.region
        ? regionInventory
            .filter(
              (ri) => ri.sku === p.sku && ri.region_id === location.region!.id
            )
            .reduce((sum, ri) => sum + ri.quantity, 0)
        : 0;

      const pickupQty = location.pickupLocation
        ? pickupInventory
            .filter(
              (pi) =>
                pi.sku === p.sku &&
                pi.pickup_location_id === location.pickupLocation!.id
            )
            .reduce((sum, pi) => sum + pi.quantity, 0)
        : 0;

      map[p.sku] = { deliveryQty, pickupQty };
    });
    return map;
  }, [products, regionInventory, pickupInventory, location.region, location.pickupLocation]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (activeCategory && p.category !== activeCategory) return false;
      if (search && !p.product_name.toLowerCase().includes(search.toLowerCase()))
        return false;
      return true;
    });
  }, [products, activeCategory, search]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Location bar */}
      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-4">
        <button
          onClick={() => setShowLocationModal(true)}
          className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm transition-colors hover:border-primary"
        >
          <MapPin className="h-4 w-4 text-primary" />
          {location.isLocationSet ? (
            <span className="text-foreground">
              {location.fulfillmentType === "delivery"
                ? location.region?.region_name
                : location.pickupLocation?.location_name}
            </span>
          ) : (
            <span className="text-muted-foreground">Set your location</span>
          )}
        </button>

        {location.isLocationSet && (
          <div className="flex items-center gap-1.5 rounded-lg bg-muted px-3 py-2 text-sm">
            {location.fulfillmentType === "delivery" ? (
              <>
                <Truck className="h-3.5 w-3.5 text-primary" />
                <span className="text-foreground">Delivery</span>
              </>
            ) : (
              <>
                <Store className="h-3.5 w-3.5 text-primary" />
                <span className="text-foreground">Pickup</span>
              </>
            )}
          </div>
        )}

        <div className="ml-auto flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search products..."
              className="w-48 rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary md:w-64"
            />
          </div>
        </div>
      </div>

      {/* Category filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => handleCategoryClick("")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            !activeCategory
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          All Products
        </button>
        {siteConfig.categories.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => handleCategoryClick(cat.slug)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              activeCategory === cat.slug
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Results count */}
      <div className="mb-4 flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Showing {filteredProducts.length} product
          {filteredProducts.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Product grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.sku}
              product={product}
              stock={stockMap[product.sku]}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Package className="h-16 w-16 text-muted-foreground/40" />
          <h3 className="mt-4 text-lg font-medium text-foreground">
            No products found
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your filters or search term.
          </p>
        </div>
      )}

      <LocationSelector
        open={showLocationModal}
        onClose={() => setShowLocationModal(false)}
      />
    </div>
  );
}

function Package(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M16.5 9.4 7.55 4.24" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.29 7 12 12 20.71 7" />
      <line x1="12" x2="12" y1="22" y2="12" />
    </svg>
  );
}
