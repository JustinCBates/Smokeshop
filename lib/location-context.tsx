"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";

export type FulfillmentType = "delivery" | "pickup";

export interface Region {
  id: string;
  region_name: string;
  state: string;
  boundary: object;
  center_lat: number;
  center_lng: number;
}

export interface PickupLocation {
  id: string;
  location_name: string;
  address: string;
  state: string;
  lat: number;
  lng: number;
}

interface LocationState {
  fulfillmentType: FulfillmentType;
  region: Region | null;
  pickupLocation: PickupLocation | null;
  customerLat: number | null;
  customerLng: number | null;
  customerAddress: string;
  isLocationSet: boolean;
}

interface LocationContextValue extends LocationState {
  setFulfillmentType: (type: FulfillmentType) => void;
  setRegion: (region: Region | null) => void;
  setPickupLocation: (location: PickupLocation | null) => void;
  setCustomerCoords: (lat: number, lng: number, address: string) => void;
  clearLocation: () => void;
}

const LocationContext = createContext<LocationContextValue | null>(null);

const STORAGE_KEY = "smokeshop_location";

function loadFromStorage(): Partial<LocationState> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveToStorage(state: LocationState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const defaultState: LocationState = {
  fulfillmentType: "delivery",
  region: null,
  pickupLocation: null,
  customerLat: null,
  customerLng: null,
  customerAddress: "",
  isLocationSet: false,
};

export function LocationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LocationState>(defaultState);

  useEffect(() => {
    const stored = loadFromStorage();
    if (stored && (stored.region || stored.pickupLocation)) {
      setState({
        ...defaultState,
        ...stored,
        isLocationSet: true,
      });
    }
  }, []);

  const setFulfillmentType = useCallback((type: FulfillmentType) => {
    setState((prev) => {
      const next = { ...prev, fulfillmentType: type };
      saveToStorage(next);
      return next;
    });
  }, []);

  const setRegion = useCallback((region: Region | null) => {
    setState((prev) => {
      const next = { ...prev, region, isLocationSet: !!region || !!prev.pickupLocation };
      saveToStorage(next);
      return next;
    });
  }, []);

  const setPickupLocation = useCallback((location: PickupLocation | null) => {
    setState((prev) => {
      const next = { ...prev, pickupLocation: location, isLocationSet: !!location || !!prev.region };
      saveToStorage(next);
      return next;
    });
  }, []);

  const setCustomerCoords = useCallback(
    (lat: number, lng: number, address: string) => {
      setState((prev) => {
        const next = { ...prev, customerLat: lat, customerLng: lng, customerAddress: address };
        saveToStorage(next);
        return next;
      });
    },
    []
  );

  const clearLocation = useCallback(() => {
    setState(defaultState);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return (
    <LocationContext.Provider
      value={{
        ...state,
        setFulfillmentType,
        setRegion,
        setPickupLocation,
        setCustomerCoords,
        clearLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useLocation must be used within LocationProvider");
  return ctx;
}
