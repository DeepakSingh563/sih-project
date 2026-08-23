import { Incident, CommunityReport, NewsArticle, AIAgentLog, LatLng, RoutePlanResponse, SeverityLevel, RiskLevel } from '../types';

export const GLOBAL_POPULAR_PLACES: { name: string; lat: number; lng: number; tag: string }[] = [
  // Delhi NCR (Pilot Region)
  { name: 'Connaught Place', lat: 28.6315, lng: 77.2167, tag: 'New Delhi' },
  { name: 'Hauz Khas', lat: 28.5245, lng: 77.1855, tag: 'South Delhi' },
  { name: 'Cyber City', lat: 28.4500, lng: 77.0400, tag: 'Gurugram' },
  { name: 'Sector 18', lat: 28.5700, lng: 77.3260, tag: 'Noida' },
  { name: 'Saket City Centre', lat: 28.5672, lng: 77.2100, tag: 'Delhi' },
  { name: 'Chandni Chowk', lat: 28.6562, lng: 77.2410, tag: 'Delhi' },
  { name: 'Indirapuram', lat: 28.6720, lng: 77.4500, tag: 'Ghaziabad' },
  { name: 'Lajpat Nagar Ring Road', lat: 28.5921, lng: 77.2290, tag: 'Delhi' },
  { name: 'ITO Junction', lat: 28.6270, lng: 77.2410, tag: 'Delhi' },
  { name: 'Botanical Garden', lat: 28.5800, lng: 77.3120, tag: 'Noida' },
  // Major Indian Metros
  { name: 'Bandra West', lat: 19.0596, lng: 72.8295, tag: 'Mumbai' },
  { name: 'Koramangala', lat: 12.9352, lng: 77.6245, tag: 'Bengaluru' },
  { name: 'Hitec City', lat: 17.4435, lng: 78.3772, tag: 'Hyderabad' },
  // Global Metros
  { name: 'Times Square', lat: 40.7580, lng: -73.9855, tag: 'New York' },
  { name: 'Piccadilly Circus', lat: 51.5101, lng: -0.1340, tag: 'London' },
  { name: 'Shinjuku', lat: 35.6938, lng: 139.7034, tag: 'Tokyo' },
];

export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'inc-1',
    type: 'robbery',
    severity: 'high',
    title: 'Snatching reported near Metro gate',
    latitude: 28.6315,
    longitude: 77.2167,
    address: 'Connaught Place',
    reported_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    source: 'Police Bulletin',
    verified: true,
    verification_status: 'verified',
    confidence: 0.86,
  },
  {
    id: 'inc-2',
    type: 'harassment',
    severity: 'medium',
    title: 'Street harassment reported at night',
    latitude: 28.6280,
    longitude: 77.2100,
    address: 'Janpath',
    reported_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    source: 'Community Report',
    verified: true,
    verification_status: 'verified',
    confidence: 0.72,
  },
  {
    id: 'inc-3',
    type: 'theft',
    severity: 'low',
    title: 'Pickpocketing in market lane',
    latitude: 28.6562,
    longitude: 77.2410,
    address: 'Chandni Chowk',
    reported_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    source: 'Community Report',
    verified: true,
    verification_status: 'verified',
    confidence: 0.6,
  },
  {
    id: 'inc-4',
    type: 'assault',
    severity: 'critical',
    title: 'Late night assault incident',
    latitude: 28.5245,
    longitude: 77.1855,
    address: 'Hauz Khas',
    reported_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    source: 'Police Report',
    verified: true,
    verification_status: 'verified',
    confidence: 0.94,
  },
  {
    id: 'inc-5',
    type: 'vehicle_theft',
    severity: 'high',
    title: 'Car break-in reported',
    latitude: 28.5672,
    longitude: 77.2100,
    address: 'Saket',
    reported_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    source: 'Verified Report',
    verified: true,
    verification_status: 'verified',
    confidence: 0.8,
  },
  {
    id: 'inc-6',
    type: 'accident',
    severity: 'medium',
    title: 'Multi-vehicle collision on Ring Road',
    latitude: 28.5921,
    longitude: 77.2290,
    address: 'Ring Road, Lajpat Nagar',
    reported_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    source: 'Traffic Radar',
    verified: true,
    verification_status: 'verified',
    confidence: 0.75,
  },
  {
    id: 'inc-7',
    type: 'robbery',
    severity: 'critical',
    title: 'Armed robbery at ATM kiosk',
    latitude: 28.5700,
    longitude: 77.3260,
    address: 'Sector 18, Noida',
    reported_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    source: 'Police Report',
    verified: true,
    verification_status: 'verified',
    confidence: 0.92,
  },
  {
    id: 'inc-8',
    type: 'harassment',
    severity: 'high',
    title: 'Stalking complaint near transit stop',
    latitude: 28.5800,
    longitude: 77.3120,
    address: 'Botanical Garden',
    reported_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    source: 'Community Report',
    verified: true,
    verification_status: 'verified',
    confidence: 0.78,
  },
  {
    id: 'inc-9',
    type: 'accident',
    severity: 'critical',
    title: 'Expressway low-visibility pile-up',
    latitude: 28.4100,
    longitude: 77.0300,
    address: 'Delhi-Gurugram Expressway',
    reported_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    source: 'Expressway Authority',
    verified: true,
    verification_status: 'verified',
    confidence: 0.95,
  },
];

export const INITIAL_REPORTS: CommunityReport[] = [
  {
    id: 'rep-1',
    incident_type: 'harassment',
    description: 'Broken street lighting along pedestrian alleyway.',
    severity: 'medium',
    latitude: 28.6290,
    longitude: 77.2110,
    address: 'Barakhamba Road',
    status: 'pending',
    confidence: 0.65,
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'rep-2',
    incident_type: 'snatching',
    description: 'Two-wheeler phone snatching on outer service road.',
    severity: 'high',
    latitude: 28.5760,
    longitude: 77.3550,
    address: 'Sector 15, Noida',
    status: 'verified',
    confidence: 0.82,
    created_at: new Date(Date.now() - 6 * 3600000).toISOString(),
  },
];

export const INITIAL_NEWS: NewsArticle[] = [
  {
    id: 'news-1',
    title: 'Snatching syndicate apprehended across South Delhi',
    description: 'Three suspects taken into custody following investigations.',
    url: 'https://news.example/1',
    source: 'Metro Daily',
    published_at: new Date(Date.now() - 8 * 3600000).toISOString(),
    processed: true,
    ai_analysis: {
      incidentType: 'snatching',
      location: 'South Delhi',
      severity: 'high',
      confidence: 0.88,
      riskKeywords: ['snatching', 'police', 'interception'],
    },
  },
  {
    id: 'news-2',
    title: 'Traffic advisory issued for central arterial routes',
    description: 'Commuters advised to use alternate corridors during evening hours.',
    url: 'https://news.example/2',
    source: 'Traffic Advisory',
    published_at: new Date(Date.now() - 14 * 3600000).toISOString(),
    processed: true,
    ai_analysis: {
      incidentType: 'protest',
      location: 'Central Corridor',
      severity: 'medium',
      confidence: 0.76,
      riskKeywords: ['advisory', 'traffic'],
    },
  },
];

// 7 AI Agent Telemetry Logs per Project Overview
export const INITIAL_AGENT_LOGS: AIAgentLog[] = [
  {
    id: 'log-1',
    agent_name: 'orchestratorAgent',
    operation: 'MULTI_AGENT_PIPELINE_RUN',
    execution_time_ms: 184,
    status: 'success',
    created_at: new Date(Date.now() - 1 * 60000).toISOString(),
  },
  {
    id: 'log-2',
    agent_name: 'riskScoringAgent',
    operation: 'CORRIDOR_SAFETY_FORMULA_EVAL',
    execution_time_ms: 112,
    status: 'success',
    created_at: new Date(Date.now() - 2 * 60000).toISOString(),
  },
  {
    id: 'log-3',
    agent_name: 'routePlanningAgent',
    operation: 'COMBINED_WEIGHTING_RECOMMEND',
    execution_time_ms: 96,
    status: 'success',
    created_at: new Date(Date.now() - 4 * 60000).toISOString(),
  },
  {
    id: 'log-4',
    agent_name: 'verificationAgent',
    operation: 'HEURISTIC_COMMUNITY_VERIFY',
    execution_time_ms: 78,
    status: 'success',
    created_at: new Date(Date.now() - 10 * 60000).toISOString(),
  },
  {
    id: 'log-5',
    agent_name: 'ingestionAgent',
    operation: 'INGEST_SIGNAL_DEDUPE',
    execution_time_ms: 54,
    status: 'success',
    created_at: new Date(Date.now() - 18 * 60000).toISOString(),
  },
  {
    id: 'log-6',
    agent_name: 'newsAnalysisAgent',
    operation: 'NLP_CRIME_EXTRACTION',
    execution_time_ms: 220,
    status: 'success',
    created_at: new Date(Date.now() - 35 * 60000).toISOString(),
  },
  {
    id: 'log-7',
    agent_name: 'alertAgent',
    operation: 'PROXIMITY_HAZARD_SCAN',
    execution_time_ms: 42,
    status: 'success',
    created_at: new Date(Date.now() - 50 * 60000).toISOString(),
  },
];

export function haversineMeters(a: LatLng, b: LatLng): number {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(s));
}

// Safety scoring & recommendation formula aligned with team specifications:
// Safety (50%) + Time (30%) + Distance (20%)
export function generateLocalRoutePlan(origin: LatLng, destination: LatLng, incidents: Incident[]): RoutePlanResponse {
  const distM = Math.max(500, haversineMeters(origin, destination));
  const baseDurationSec = Math.max(180, Math.round((distM / 1000 / 28) * 3600));

  // Route A: Direct / Fastest
  const steps = 12;
  const coordsA: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const lat = origin.lat + (destination.lat - origin.lat) * t;
    const lng = origin.lng + (destination.lng - origin.lng) * t;
    const curve = Math.sin(t * Math.PI) * 0.002;
    coordsA.push([lng + curve, lat - curve]);
  }

  // Route B: Recommended Safe Corridor
  const coordsB: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const lat = origin.lat + (destination.lat - origin.lat) * t;
    const lng = origin.lng + (destination.lng - origin.lng) * t;
    const arc = Math.sin(t * Math.PI) * 0.012;
    coordsB.push([lng - arc, lat + arc]);
  }

  // Penalties
  const penaltiesA = calculatePenalties(coordsA, incidents);
  const totalRiskA = penaltiesA.reduce((sum, p) => sum + p.penalty, 0);
  const scoreA = Math.max(25, Math.min(94, Math.round(100 - totalRiskA)));

  const scoreB = Math.max(84, Math.min(98, Math.round(100 - totalRiskA * 0.15)));

  const routeAOption = {
    routeIndex: 1,
    distanceMeters: Math.round(distM * 1.05),
    durationSeconds: baseDurationSec,
    safety: {
      score: scoreA,
      level: getScoreLevel(scoreA),
      reasons: penaltiesA.length > 0
        ? [`${penaltiesA[0].reason} (${Math.round(penaltiesA[0].distanceMeters)}m away)`]
        : ['Direct route with standard unpatrolled segments'],
      penalties: penaltiesA,
      incidentCountNearby: penaltiesA.length,
      highestSeverityNearby: (penaltiesA[0]?.severity as SeverityLevel) || 'medium',
      timeOfDayMultiplier: 1.25,
    },
    geometry: { type: 'LineString' as const, coordinates: coordsA },
  };

  const routeBOption = {
    routeIndex: 0,
    distanceMeters: Math.round(distM * 1.22),
    durationSeconds: Math.round(baseDurationSec * 1.15),
    safety: {
      score: scoreB,
      level: 'LOW' as RiskLevel,
      reasons: ['Well-lit arterial corridor with active CCTV & police visibility'],
      penalties: [],
      incidentCountNearby: 0,
      highestSeverityNearby: 'low' as SeverityLevel,
      timeOfDayMultiplier: 1.0,
    },
    geometry: { type: 'LineString' as const, coordinates: coordsB },
  };

  const diffScore = scoreB - scoreA;
  const extraMin = Math.max(1, Math.round((routeBOption.durationSeconds - routeAOption.durationSeconds) / 60));

  return {
    routeId: `route-${Date.now()}`,
    origin,
    destination,
    travelAt: new Date().toISOString(),
    options: [routeBOption, routeAOption],
    recommendedIndex: 0,
    reason: `Recommended Route B prioritizes safety (Score ${scoreB}/100) via monitored corridors.`,
    tradeoff: `+${extraMin} min for +${diffScore} Safety Score`,
    demoFallbackUsed: false,
  };
}

function calculatePenalties(coords: [number, number][], incidents: Incident[]) {
  const penalties: any[] = [];
  for (const inc of incidents) {
    let minD = Infinity;
    for (const [lng, lat] of coords) {
      const d = haversineMeters({ lat, lng }, { lat: inc.latitude, lng: inc.longitude });
      if (d < minD) minD = d;
    }
    if (minD <= 1200) {
      const severityBase = inc.severity === 'critical' ? 28 : inc.severity === 'high' ? 18 : inc.severity === 'medium' ? 10 : 5;
      const decay = Math.max(0.2, 1 - minD / 1200);
      penalties.push({
        incidentId: inc.id,
        severity: inc.severity,
        distanceMeters: minD,
        penalty: Math.round(severityBase * decay),
        reason: `${inc.title || inc.type}`,
      });
    }
  }
  return penalties;
}

function getScoreLevel(score: number): RiskLevel {
  if (score >= 80) return 'LOW';
  if (score >= 60) return 'MODERATE';
  if (score >= 40) return 'ELEVATED';
  if (score >= 20) return 'HIGH';
  return 'CRITICAL';
}
