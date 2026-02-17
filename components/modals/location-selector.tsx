"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocation } from "@/lib/location-context";
import { isPointInRegion, geocodeAddress, type GeoJSONPolygon } from "@/lib/geo-utils";
import { createClient } from "@/lib/supabase/client";
import dynamic from "next/dynamic";
import { MapPin, Truck, Store, Search, X, Loader2 } from "lucide-react";

const LeafletMap = dynamic(() => import("./leaflet-map"), { ssr: false });

interface Region {
  id: string;
  region_name: string;
  state: string;
  boundary: GeoJSONPolygon;
  center_lat: number;
  center_lng: number;
}

interface PickupLoc {
  id: string;
  location_name: string;
  address: string;
  state: string;
  lat: number;
  lng: number;
}

export default function LocationSelector({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const location = useLocation();
  const [regions, setRegions] = useState<Region[]>([]);
  const [pickupLocations, setPickupLocations] = useState<PickupLoc[]>([]);
  const [address, setAddress] = useState("");
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"delivery" | "pickup">(location.fulfillmentType);
  const [geocoded, setGeocoded] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      const [{ data: r }, { data: p }] = await Promise.all([
        supabase.from("regions").select("*").eq("is_active", true),
        supabase.from("pickup_locations").select("*").eq("is_active", true),
      ]);
      if (r) setRegions(r);
      if (p) setPickupLocations(p);
    }
    load();
  }, []);

  const handleSearch = useCallback(async () => {
    if (!address.trim()) return;
    setSearching(true);
    setError("");
    try {
      const result = await geocodeAddress(address);
      if (!result) {
        setError("Address not found. Please try a more specific address.");
        setSearching(false);
        return;
      }
      setGeocoded({ lat: result.lat, lng: result.lng });

      if (tab === "delivery") {
        const matched = regions.find((r) =>
          isPointInRegion(result.lat, result.lng, r.boundary as GeoJSONPolygon)
        );
        if (matched) {
          location.setCustomerCoords(result.lat, result.lng, result.display);
          location.setRegion(matched);
          location.setFulfillmentType("delivery");
          onClose();
        } else {
          setError(
            "Sorry, delivery is not available in your area yet. Try pickup instead."
          );
        }
      }
    } catch {
      setError("Failed to look up address. Please try again.");
    }
    setSearching(false);
  }, [address, tab, regions, location, onClose]);

  const handlePickupSelect = useCallback(
    (pl: PickupLoc) => {
      location.setPickupLocation(pl);
      location.setFulfillmentType("pickup");
      location.setCustomerCoords(pl.lat, pl.lng, pl.address);
      onClose();
    },
    [location, onClose]
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="relative w-full max-w-2xl rounded-xl border border-border bg-card shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6">
          <h2 className="text-xl font-bold text-foreground">
            Set Your Location
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose delivery or pickup to see available products in your area.
          </p>

          {/* Tabs */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setTab("delivery")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                tab === "delivery"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <Truck className="h-4 w-4" />
              Delivery
            </button>
            <button
              onClick={() => setTab("pickup")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                tab === "pickup"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <Store className="h-4 w-4" />
              Pickup
            </button>
          </div>

          {tab === "delivery" ? (
            <div className="mt-4 space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Enter your delivery address..."
                    className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={searching}
                  className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {searching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  Search
                </button>
              </div>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <div className="h-64 overflow-hidden rounded-lg border border-border">
                <LeafletMap
                  regions={regions}
                  pickupLocations={[]}
                  markerPos={geocoded}
                  center={[38.6, -92.6]}
                  zoom={6}
                />
              </div>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <p className="text-sm text-muted-foreground">
                Select a pickup location:
              </p>
              {pickupLocations.map((pl) => (
                <button
                  key={pl.id}
                  onClick={() => handlePickupSelect(pl)}
                  className="flex w-full items-start gap-3 rounded-lg border border-border bg-background p-4 text-left transition-colors hover:border-primary hover:bg-muted"
                >
                  <Store className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">
                      {pl.location_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {pl.address}
                    </p>
                  </div>
                </button>
              ))}
              <div className="h-48 overflow-hidden rounded-lg border border-border">
                <LeafletMap
                  regions={[]}
                  pickupLocations={pickupLocations}
                  markerPos={null}
                  center={[38.6, -92.6]}
                  zoom={6}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
