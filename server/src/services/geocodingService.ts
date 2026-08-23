import { env } from "../config/env";
import { LatLng } from "./routingService";

export interface GeocodeResult {
  address: string;
  lat: number;
  lng: number;
  provider: "mapbox" | "google" | "internal";
}

// Simple in-memory cache (process lifetime only). A real deployment would
// back this with Redis or a Supabase table — noted in TASKS.md.
const forwardCache = new Map<string, GeocodeResult>();
const reverseCache = new Map<string, GeocodeResult>();

function resolveProvider(): "mapbox" | "google" | "internal" {
  if (env.GEOCODING_PROVIDER === "mapbox" && env.MAPBOX_ACCESS_TOKEN) return "mapbox";
  if (env.GEOCODING_PROVIDER === "google" && env.GOOGLE_MAPS_API_KEY) return "google";
  if (env.MAPBOX_ACCESS_TOKEN) return "mapbox";
  if (env.GOOGLE_MAPS_API_KEY) return "google";
  return "internal";
}

export async function geocodeAddress(query: string): Promise<GeocodeResult> {
  const cacheKey = query.trim().toLowerCase();
  const cached = forwardCache.get(cacheKey);
  if (cached) return cached;

  const provider = resolveProvider();
  let result: GeocodeResult;

  if (provider === "mapbox") {
    result = await geocodeMapbox(query);
  } else if (provider === "google") {
    result = await geocodeGoogle(query);
  } else {
    // No real geocoding key configured. Per SPEC.md we must NOT hit public
    // Nominatim for autocomplete-style traffic. Instead we require the
    // frontend to send coordinates directly (e.g. from a map click / the
    // seeded landmark list) and this just no-ops with a clear error.
    const err: any = new Error(
      "No geocoding provider configured (set MAPBOX_ACCESS_TOKEN or GOOGLE_MAPS_API_KEY)"
    );
    err.status = 501;
    err.publicMessage =
      "Address search isn't configured yet — pick a point on the map instead.";
    throw err;
  }

  forwardCache.set(cacheKey, result);
  return result;
}

export async function reverseGeocode(point: LatLng): Promise<GeocodeResult> {
  const cacheKey = `${point.lat.toFixed(5)},${point.lng.toFixed(5)}`;
  const cached = reverseCache.get(cacheKey);
  if (cached) return cached;

  const provider = resolveProvider();
  let result: GeocodeResult;

  if (provider === "mapbox") {
    result = await reverseMapbox(point);
  } else if (provider === "google") {
    result = await reverseGoogle(point);
  } else {
    result = {
      address: `${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}`,
      lat: point.lat,
      lng: point.lng,
      provider: "internal",
    };
  }

  reverseCache.set(cacheKey, result);
  return result;
}

async function geocodeMapbox(query: string): Promise<GeocodeResult> {
  const url =
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json` +
    `?access_token=${env.MAPBOX_ACCESS_TOKEN}&limit=1&proximity=${env.PILOT_LNG},${env.PILOT_LAT}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Mapbox geocoding failed: ${res.status}`);
  const body: any = await res.json();
  const feature = body.features?.[0];
  if (!feature) throw new Error("No geocoding results");
  return {
    address: feature.place_name,
    lat: feature.center[1],
    lng: feature.center[0],
    provider: "mapbox",
  };
}

async function reverseMapbox(point: LatLng): Promise<GeocodeResult> {
  const url =
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${point.lng},${point.lat}.json` +
    `?access_token=${env.MAPBOX_ACCESS_TOKEN}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Mapbox reverse geocoding failed: ${res.status}`);
  const body: any = await res.json();
  const feature = body.features?.[0];
  return {
    address: feature?.place_name || `${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}`,
    lat: point.lat,
    lng: point.lng,
    provider: "mapbox",
  };
}

async function geocodeGoogle(query: string): Promise<GeocodeResult> {
  const url =
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}` +
    `&key=${env.GOOGLE_MAPS_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Google geocoding failed: ${res.status}`);
  const body: any = await res.json();
  const result = body.results?.[0];
  if (!result) throw new Error("No geocoding results");
  return {
    address: result.formatted_address,
    lat: result.geometry.location.lat,
    lng: result.geometry.location.lng,
    provider: "google",
  };
}

async function reverseGoogle(point: LatLng): Promise<GeocodeResult> {
  const url =
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${point.lat},${point.lng}` +
    `&key=${env.GOOGLE_MAPS_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Google reverse geocoding failed: ${res.status}`);
  const body: any = await res.json();
  const result = body.results?.[0];
  return {
    address: result?.formatted_address || `${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}`,
    lat: point.lat,
    lng: point.lng,
    provider: "google",
  };
}
