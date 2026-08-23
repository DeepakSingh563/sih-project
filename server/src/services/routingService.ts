import { env } from "../config/env";

export interface LatLng {
  lat: number;
  lng: number;
}

export interface RouteOption {
  index: number;
  distanceMeters: number;
  durationSeconds: number;
  geometry: GeoJSON.LineString;
  isFallback: boolean;
}

/**
 * Calls OSRM's public route service. Never fabricates distance/duration on a
 * real success. On failure (network, non-200, malformed body) it throws a
 * tagged error so the caller can decide whether to use the seeded demo
 * fallback — see generateFallbackRoutes().
 */
export async function fetchRoutes(
  origin: LatLng,
  destination: LatLng
): Promise<RouteOption[]> {
  const url =
    `${env.OSRM_BASE_URL}/route/v1/driving/` +
    `${origin.lng},${origin.lat};${destination.lng},${destination.lat}` +
    `?alternatives=true&steps=true&geometries=geojson&overview=full`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      throw new Error(`OSRM responded ${res.status}`);
    }
    const body = (await res.json()) as any;
    if (body.code !== "Ok" || !Array.isArray(body.routes) || !body.routes.length) {
      throw new Error(`OSRM returned no routes (code=${body.code})`);
    }
    return body.routes.map((r: any, i: number) => ({
      index: i,
      distanceMeters: r.distance,
      durationSeconds: r.duration,
      geometry: r.geometry,
      isFallback: false,
    }));
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * DEMO_MODE-only fallback used when OSRM is unreachable (offline dev,
 * rate-limited public server, blocked network). Produces two plausible
 * routes between the two points so the UI still has something to render.
 * Clearly flagged isFallback=true — the frontend must show this to the user,
 * never present it as a real routed path.
 */
export function generateFallbackRoutes(
  origin: LatLng,
  destination: LatLng
): RouteOption[] {
  const straightLineKm = haversineKm(origin, destination);
  const baseDuration = (straightLineKm / 30) * 3600; // ~30km/h assumed urban speed

  const routeA = buildJitteredLine(origin, destination, 0.15);
  const routeB = buildJitteredLine(origin, destination, -0.25);

  return [
    {
      index: 0,
      distanceMeters: straightLineKm * 1000 * 1.25,
      durationSeconds: baseDuration * 1.0,
      geometry: routeA,
      isFallback: true,
    },
    {
      index: 1,
      distanceMeters: straightLineKm * 1000 * 1.4,
      durationSeconds: baseDuration * 1.15,
      geometry: routeB,
      isFallback: true,
    },
  ];
}

function buildJitteredLine(
  origin: LatLng,
  destination: LatLng,
  jitter: number
): GeoJSON.LineString {
  const steps = 6;
  const coords: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const lat = origin.lat + (destination.lat - origin.lat) * t;
    const lng = origin.lng + (destination.lng - origin.lng) * t;
    const wobble = Math.sin(t * Math.PI) * jitter * 0.01;
    coords.push([lng + wobble, lat - wobble]);
  }
  return { type: "LineString", coordinates: coords };
}

export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(s));
}

/** Evenly-spaced sample points along a route geometry, used by the safety
 *  scoring service so it doesn't need to check every single coordinate. */
export function sampleRoutePoints(
  geometry: GeoJSON.LineString,
  maxPoints = 25
): LatLng[] {
  const coords = geometry.coordinates;
  if (coords.length <= maxPoints) {
    return coords.map(([lng, lat]: number[]) => ({ lat, lng }));
  }
  const step = coords.length / maxPoints;
  const points: LatLng[] = [];
  for (let i = 0; i < maxPoints; i++) {
    const [lng, lat] = coords[Math.floor(i * step)];
    points.push({ lat, lng });
  }
  return points;
}
