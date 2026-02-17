"use client";

import { LocationProvider } from "@/lib/location-context";
import { CartProvider } from "@/lib/cart-context";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <LocationProvider>
      <CartProvider>{children}</CartProvider>
    </LocationProvider>
  );
}
