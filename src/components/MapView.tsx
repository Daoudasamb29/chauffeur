import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapViewProps {
  latitude: number;
  longitude: number;
  pickupLat?: number | null;
  pickupLng?: number | null;
  destLat?: number | null;
  destLng?: number | null;
  height?: string;
}

export default function MapView({
  latitude,
  longitude,
  pickupLat,
  pickupLng,
  destLat,
  destLng,
  height = "50vh",
}: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const driverMarkerRef = useRef<L.Marker | null>(null);
  const pickupMarkerRef = useRef<L.Marker | null>(null);
  const destMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current).setView([latitude, longitude], 15);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
        maxZoom: 19,
      }).addTo(mapRef.current);
    }

    const map = mapRef.current;
    map.setView([latitude, longitude], 15);

    // Driver marker
    const driverIcon = L.divIcon({
      className: "custom-driver-marker",
      html: `<div style="background:#22c55e;width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4);"></div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });

    if (driverMarkerRef.current) {
      driverMarkerRef.current.setLatLng([latitude, longitude]);
    } else {
      driverMarkerRef.current = L.marker([latitude, longitude], { icon: driverIcon }).addTo(map);
    }

    // Pickup marker
    if (pickupLat && pickupLng) {
      const pickupIcon = L.divIcon({
        className: "custom-pickup-marker",
        html: `<div style="background:#3b82f6;width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
      if (pickupMarkerRef.current) {
        pickupMarkerRef.current.setLatLng([pickupLat, pickupLng]);
      } else {
        pickupMarkerRef.current = L.marker([pickupLat, pickupLng], { icon: pickupIcon }).addTo(map);
      }
    } else if (pickupMarkerRef.current) {
      map.removeLayer(pickupMarkerRef.current);
      pickupMarkerRef.current = null;
    }

    // Destination marker
    if (destLat && destLng) {
      const destIcon = L.divIcon({
        className: "custom-dest-marker",
        html: `<div style="background:#ef4444;width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
      if (destMarkerRef.current) {
        destMarkerRef.current.setLatLng([destLat, destLng]);
      } else {
        destMarkerRef.current = L.marker([destLat, destLng], { icon: destIcon }).addTo(map);
      }
    } else if (destMarkerRef.current) {
      map.removeLayer(destMarkerRef.current);
      destMarkerRef.current = null;
    }

    // Route line
    if (pickupLat && pickupLng && destLat && destLng) {
      if (routeLineRef.current) {
        routeLineRef.current.setLatLngs([
          [pickupLat, pickupLng],
          [destLat, destLng],
        ]);
      } else {
        routeLineRef.current = L.polyline(
          [
            [pickupLat, pickupLng],
            [destLat, destLng],
          ],
          { color: "#3b82f6", weight: 4, opacity: 0.7, dashArray: "8,6" }
        ).addTo(map);
      }
      map.fitBounds(
        [
          [pickupLat, pickupLng],
          [destLat, destLng],
        ],
        { padding: [40, 40] }
      );
    } else if (routeLineRef.current) {
      map.removeLayer(routeLineRef.current);
      routeLineRef.current = null;
    }

    return () => {
      // Cleanup only on unmount
    };
  }, [latitude, longitude, pickupLat, pickupLng, destLat, destLng]);

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        driverMarkerRef.current = null;
        pickupMarkerRef.current = null;
        destMarkerRef.current = null;
        routeLineRef.current = null;
      }
    };
  }, []);

  return <div ref={containerRef} style={{ height, width: "100%" }} />;
}
