import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { point, polygon } from "@turf/helpers";

export interface GeoJSONPolygon {
  type: "Polygon";
  coordinates: number[][][];
}

/**
 * Check if a lat/lng point falls within a GeoJSON polygon boundary.
 */
export function isPointInRegion(
  lat: number,
  lng: number,
  boundary: GeoJSONPolygon
): boolean {
  const pt = point([lng, lat]);
  const poly = polygon(boundary.coordinates);
  return booleanPointInPolygon(pt, poly);
}

/**
 * Calculate the distance in km between two lat/lng points using the Haversine formula.
 */
export function distanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Geocode an address using the free Nominatim API.
 * Returns null if no result found.
 */
export async function geocodeAddress(
  address: string
): Promise<{ lat: number; lng: number; display: string } | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
  const res = await fetch(url, {
    headers: { "User-Agent": "GenericSmokeshop/1.0" },
  });
  const data = await res.json();
  if (!data || data.length === 0) return null;
  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lng),
    display: data[0].display_name,
  };
}
