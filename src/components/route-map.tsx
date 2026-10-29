import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Polyline, TileLayer } from "leaflet";
import "leaflet/dist/leaflet.css";
import { RouteSketch } from "@/components/route-sketch";

type LatLng = [number, number];

// District-centre coordinates: demo trips don't contain exact pickup GPS points.
const DISTRICTS: Record<string, LatLng> = {
  boukhalef: [35.73377, -5.88313],
  "centre-ville": [35.77732, -5.80367],
  mesnana: [35.75643, -5.8583],
  iberia: [35.78257, -5.8209],
  malabata: [35.77352, -5.79053],
  "route de rabat": [35.72962, -5.8803],
  "val fleuri": [35.7695, -5.8359],
  dradeb: [35.78648, -5.8308],
};
const ENSA: LatLng = [35.73703, -5.89515];

function districtPoint(name: string): LatLng | undefined {
  const key = name.toLocaleLowerCase("fr");
  if (/ensa|campus|école/.test(key)) return ENSA;
  if (/marjane/.test(key)) return [35.74603, -5.84278];
  if (/nations/.test(key)) return [35.77732, -5.80367];
  if (/malabata|corniche/.test(key)) return DISTRICTS["malabata"];
  if (/dradeb/.test(key)) return DISTRICTS["dradeb"];
  if (/mesnana|ibn batouta/.test(key)) return DISTRICTS["mesnana"];
  if (/val fleuri/.test(key)) return DISTRICTS["val fleuri"];
  if (/gare|mohammed vi/.test(key)) return [35.77153, -5.78622];
  if (/shell/.test(key)) return [35.73104, -5.87628];
  if (/boukhalef|résidence al andalous/.test(key)) return DISTRICTS["boukhalef"];
  return undefined;
}

function routeWaypoints(from: string, stops: string[], evening: boolean) {
  const origin = DISTRICTS[from.toLocaleLowerCase("fr")] ?? ENSA;
  const destination = ENSA;
  const start = evening ? destination : origin;
  const end = evening ? origin : destination;
  const orderedStops = evening ? [...stops].reverse() : stops;
  const seen = new Map<string, number>();
  const intermediate = orderedStops
    .map((name) => {
      const point = districtPoint(name) ?? origin;
      const key = point.join(",");
      const duplicate = seen.get(key) ?? 0;
      seen.set(key, duplicate + 1);
      // Fan out duplicate/unknown pickup pins slightly so every label remains tappable.
      const offset = duplicate * 0.00022;
      const adjusted: LatLng = [point[0] - offset, point[1] + offset];
      return { point: adjusted, label: name };
    })
    .filter(({ point }) => {
      const near = (other: LatLng) => Math.hypot(point[0] - other[0], point[1] - other[1]) < 0.001;
      return !near(start) && !near(end);
    });
  return [
    { point: start, label: evening ? "ENSA Tanger" : from },
    ...intermediate,
    { point: end, label: evening ? from : "ENSA Tanger" },
  ];
}

function numberedIcon(L: typeof import("leaflet"), n: number, isStart = false, isEnd = false) {
  return L.divIcon({
    className: "rkeb-map-marker",
    html: `<span>${isEnd ? "E" : isStart ? "D" : n}</span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

export function RouteMap({
  from,
  stops,
  evening,
}: {
  from: string;
  stops: string[];
  evening: boolean;
}) {
  const element = useRef<HTMLDivElement>(null);
  const [offline, setOffline] = useState(false);
  const [failed, setFailed] = useState(false);
  const [approximate, setApproximate] = useState(false);

  useEffect(() => {
    let disposed = false;
    let map: LeafletMap | undefined;
    let tileLayer: TileLayer | undefined;
    let routeLine: Polyline | undefined;
    const controller = new AbortController();
    const requestSignal = AbortSignal.any([controller.signal, AbortSignal.timeout(8000)]);
    const waypoints = routeWaypoints(from, stops, evening);
    setOffline(false);
    setFailed(false);
    setApproximate(false);

    const load = async () => {
      try {
        const L = await import("leaflet");
        const probe = await fetch("https://tile.openstreetmap.org/0/0/0.png", {
          mode: "cors",
          cache: "no-store",
          signal: requestSignal,
        });
        if (!probe.ok) throw new Error("Map network unavailable");
        if (disposed || !element.current) return;
        setOffline(false);
        setFailed(false);
        map = L.map(element.current, {
          zoomControl: true,
          scrollWheelZoom: false,
          attributionControl: true,
        });
        tileLayer = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);
        let gotTile = false;
        tileLayer.on("tileload", () => {
          gotTile = true;
        });
        tileLayer.on("tileerror", () => {
          if (!disposed && !gotTile) {
            setOffline(true);
            setFailed(true);
            map?.remove();
          }
        });
        map.fitBounds(L.latLngBounds(waypoints.map(({ point }) => point)), { padding: [28, 28] });

        // Approximate road route between district centres; individual demo pickups have no GPS coordinates.
        const coords = waypoints.map(({ point: [lat, lon] }) => `${lon},${lat}`).join(";");
        let latlngs = waypoints.map(({ point }) => point);
        let hasRoadRoute = false;
        try {
          const response = await fetch(
            `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson&steps=false`,
            { mode: "cors", cache: "no-store", signal: requestSignal },
          );
          if (!response.ok) throw new Error("Routing unavailable");
          const result = (await response.json()) as {
            routes?: { geometry?: { coordinates?: [number, number][] } }[];
          };
          const line = result.routes?.[0]?.geometry?.coordinates;
          if (!line?.length) throw new Error("No route available");
          latlngs = line.map(([lon, lat]) => [lat, lon]);
          hasRoadRoute = true;
        } catch {
          if (disposed || !map) return;
          setApproximate(true);
        }
        if (disposed || !map) return;
        routeLine = L.polyline(latlngs, {
          color: "#a4482a",
          weight: 6,
          opacity: 0.88,
          dashArray: hasRoadRoute ? undefined : "8 8",
          lineCap: "round",
          lineJoin: "round",
        }).addTo(map);

        waypoints.forEach(({ point, label }, i) => {
          const isEnd = i === waypoints.length - 1;
          const marker = L.marker(point, { icon: numberedIcon(L, i, i === 0, isEnd) }).addTo(map!);
          const tooltip = L.tooltip({
            permanent: true,
            direction: "top",
            offset: [0, -8],
            className: "rkeb-map-tooltip",
          });
          const labelNode = document.createElement("span");
          labelNode.textContent = label;
          marker.bindTooltip(tooltip.setContent(labelNode));
        });
        map.fitBounds(routeLine.getBounds(), { padding: [42, 42], maxZoom: 14 });
        window.setTimeout(() => map?.invalidateSize(), 100);
      } catch {
        if (disposed) return;
        routeLine?.remove();
        tileLayer?.remove();
        map?.remove();
        setOffline(true);
        setFailed(true);
      }
    };

    void load();
    return () => {
      disposed = true;
      controller.abort();
      routeLine?.remove();
      tileLayer?.remove();
      map?.remove();
    };
  }, [from, evening, stops]);

  if (offline || failed) {
    return (
      <div>
        {offline && (
          <p className="mb-2 font-mono text-[10px] font-bold uppercase text-muted-foreground">
            Carte en ligne indisponible · croquis hors ligne
          </p>
        )}
        <RouteSketch from={from} stops={stops} evening={evening} />
      </div>
    );
  }

  return (
    <figure className="route-map overflow-hidden rounded-lg border-2 border-ink bg-card">
      <div
        ref={element}
        className="h-64 w-full md:h-80"
        role="region"
        aria-label={`Carte du trajet ${evening ? `ENSA vers ${from}` : `${from} vers ENSA`}`}
      />
      <figcaption className="border-t border-ink/20 px-3 py-2 font-mono text-[10px] uppercase text-muted-foreground">
        OpenStreetMap · {approximate ? "liaisons directes indicatives" : "trajet routier OSRM"} ·
        pickups approximés au quartier · pas un GPS live
      </figcaption>
    </figure>
  );
}
