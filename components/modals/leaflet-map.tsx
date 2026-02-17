"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Region {
  id: string;
  region_name: string;
  boundary: { type: string; coordinates: number[][][] };
  center_lat: number;
  center_lng: number;
}

interface PickupLoc {
  id: string;
  location_name: string;
  lat: number;
  lng: number;
}

interface Props {
  regions: Region[];
  pickupLocations: PickupLoc[];
  markerPos: { lat: number; lng: number } | null;
  center: [number, number];
  zoom: number;
}

export default function LeafletMap({
  regions,
  pickupLocations,
  markerPos,
  center,
  zoom,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center,
      zoom,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Draw region polygons
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const layers: L.Layer[] = [];
    regions.forEach((r) => {
      if (r.boundary?.coordinates) {
        const coords = r.boundary.coordinates[0].map(
          (c: number[]) => [c[1], c[0]] as L.LatLngTuple
        );
        const poly = L.polygon(coords, {
          color: "#d4a843",
          fillColor: "#d4a843",
          fillOpacity: 0.15,
          weight: 2,
        })
          .bindTooltip(r.region_name, {
            permanent: false,
            className: "leaflet-tooltip-dark",
          })
          .addTo(map);
        layers.push(poly);
      }
    });

    return () => {
      layers.forEach((l) => map.removeLayer(l));
    };
  }, [regions]);

  // Draw pickup location markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const markers: L.Marker[] = [];
    const storeIcon = L.divIcon({
      html: '<div style="background:#d4a843;width:12px;height:12px;border-radius:50%;border:2px solid #fff;"></div>',
      iconSize: [12, 12],
      className: "",
    });

    pickupLocations.forEach((pl) => {
      const m = L.marker([pl.lat, pl.lng], { icon: storeIcon })
        .bindTooltip(pl.location_name, { permanent: false })
        .addTo(map);
      markers.push(m);
    });

    return () => {
      markers.forEach((m) => map.removeLayer(m));
    };
  }, [pickupLocations]);

  // Customer marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (markerRef.current) {
      map.removeLayer(markerRef.current);
      markerRef.current = null;
    }

    if (markerPos) {
      const customerIcon = L.divIcon({
        html: '<div style="background:#ef4444;width:14px;height:14px;border-radius:50%;border:2px solid #fff;"></div>',
        iconSize: [14, 14],
        className: "",
      });
      markerRef.current = L.marker([markerPos.lat, markerPos.lng], {
        icon: customerIcon,
      }).addTo(map);
      map.setView([markerPos.lat, markerPos.lng], 11);
    }
  }, [markerPos]);

  return <div ref={containerRef} className="h-full w-full" />;
}
