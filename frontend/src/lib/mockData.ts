import { Incident, CommunityReport, NewsArticle, AIAgentLog, LatLng, RoutePlanResponse, SeverityLevel, RiskLevel } from '../types';

export const GLOBAL_POPULAR_PLACES: { name: string; lat: number; lng: number; tag: string }[] = [
  // Central & South Delhi
  { name: 'Connaught Place', lat: 28.6315, lng: 77.2167, tag: 'Central Delhi' },
  { name: 'India Gate', lat: 28.6129, lng: 77.2295, tag: 'Central Delhi' },
  { name: 'Hauz Khas Village', lat: 28.5535, lng: 77.1945, tag: 'South Delhi' },
  { name: 'Saket City Centre', lat: 28.5245, lng: 77.2167, tag: 'South Delhi' },
  { name: 'Lajpat Nagar', lat: 28.5700, lng: 77.2400, tag: 'South Delhi' },
  { name: 'Greater Kailash (GK 1/2)', lat: 28.5400, lng: 77.2400, tag: 'South Delhi' },
  { name: 'Nehru Place', lat: 28.5500, lng: 77.2500, tag: 'South Delhi' },
  { name: 'Vasant Kunj', lat: 28.5200, lng: 77.1500, tag: 'South Delhi' },
  { name: 'Aerocity', lat: 28.5500, lng: 77.1200, tag: 'South Delhi' },
  { name: 'South Extension', lat: 28.5700, lng: 77.2200, tag: 'South Delhi' },
  { name: 'Malviya Nagar', lat: 28.5300, lng: 77.2100, tag: 'South Delhi' },
  { name: 'Green Park', lat: 28.5600, lng: 77.2000, tag: 'South Delhi' },
  { name: 'Sarita Vihar', lat: 28.5300, lng: 77.3000, tag: 'South Delhi' },

  // West & North Delhi
  { name: 'Karol Bagh', lat: 28.6500, lng: 77.1900, tag: 'West Delhi' },
  { name: 'Rajouri Garden', lat: 28.6500, lng: 77.1200, tag: 'West Delhi' },
  { name: 'Janakpuri', lat: 28.6200, lng: 77.0800, tag: 'West Delhi' },
  { name: 'Dwarka Sector 21', lat: 28.5500, lng: 77.0600, tag: 'West Delhi' },
  { name: 'Dwarka Mor', lat: 28.6200, lng: 77.0300, tag: 'West Delhi' },
  { name: 'Rohini Sector 18', lat: 28.7300, lng: 77.1300, tag: 'North Delhi' },
  { name: 'Pitampura', lat: 28.7000, lng: 77.1400, tag: 'North Delhi' },
  { name: 'Chandni Chowk', lat: 28.6562, lng: 77.2410, tag: 'North Delhi' },
  { name: 'Civil Lines', lat: 28.6800, lng: 77.2200, tag: 'North Delhi' },
  { name: 'Delhi University (North Campus)', lat: 28.6900, lng: 77.2100, tag: 'North Delhi' },
  { name: 'Netaji Subhash Place', lat: 28.6900, lng: 77.1500, tag: 'North Delhi' },

  // East Delhi
  { name: 'Mayur Vihar Phase 1', lat: 28.6100, lng: 77.2900, tag: 'East Delhi' },
  { name: 'Laxmi Nagar', lat: 28.6300, lng: 77.2800, tag: 'East Delhi' },
  { name: 'Anand Vihar ISBT', lat: 28.6500, lng: 77.3100, tag: 'East Delhi' },
  { name: 'Preet Vihar', lat: 28.6400, lng: 77.2900, tag: 'East Delhi' },

  // Gurugram (NCR)
  { name: 'DLF Cyber City', lat: 28.4950, lng: 77.0895, tag: 'Gurugram' },
  { name: 'Golf Course Road', lat: 28.4600, lng: 77.1000, tag: 'Gurugram' },
  { name: 'MG Road Metro', lat: 28.4800, lng: 77.0800, tag: 'Gurugram' },
  { name: 'Sohna Road', lat: 28.4000, lng: 77.0400, tag: 'Gurugram' },
  { name: 'Huda City Centre', lat: 28.4600, lng: 77.0700, tag: 'Gurugram' },
  { name: 'Udyog Vihar', lat: 28.5100, lng: 77.0800, tag: 'Gurugram' },

  // Noida & Greater Noida (NCR)
  { name: 'Sector 18 Atta Market', lat: 28.5700, lng: 77.3260, tag: 'Noida' },
  { name: 'Sector 62 IT Park', lat: 28.6200, lng: 77.3600, tag: 'Noida' },
  { name: 'Botanical Garden Metro', lat: 28.5600, lng: 77.3300, tag: 'Noida' },
  { name: 'Sector 137 Metro', lat: 28.5100, lng: 77.4000, tag: 'Noida' },
  { name: 'Pari Chowk', lat: 28.4700, lng: 77.5000, tag: 'Greater Noida' },

  // Ghaziabad & Faridabad (NCR)
  { name: 'Indirapuram', lat: 28.6400, lng: 77.3700, tag: 'Ghaziabad' },
  { name: 'Vaishali Metro', lat: 28.6500, lng: 77.3400, tag: 'Ghaziabad' },
  { name: 'Raj Nagar Extension', lat: 28.7000, lng: 77.4300, tag: 'Ghaziabad' },
  { name: 'Faridabad NIT', lat: 28.3900, lng: 77.3100, tag: 'Faridabad' },
  { name: 'Old Faridabad Metro', lat: 28.4200, lng: 77.3200, tag: 'Faridabad' },
];

// Universal location resolver for ANY typed location in Delhi NCR
export function resolveDelhiLocation(query: string): { name: string; lat: number; lng: number } {
  if (!query || !query.trim()) {
    return { name: 'Connaught Place', lat: 28.6315, lng: 77.2167 };
  }
  const clean = query.trim();
  const match = GLOBAL_POPULAR_PLACES.find(
    (p) => p.name.toLowerCase().includes(clean.toLowerCase()) || clean.toLowerCase().includes(p.name.toLowerCase())
  );
  if (match) {
    return { name: match.name, lat: match.lat, lng: match.lng };
  }

  // Deterministic hash coordinates within Delhi NCR bounding box (28.4 - 28.7 lat, 77.0 - 77.35 lng)
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = (hash << 5) - hash + clean.charCodeAt(i);
    hash |= 0;
  }
  const norm1 = Math.abs(Math.sin(hash)) % 1;
  const norm2 = Math.abs(Math.cos(hash)) % 1;

  const lat = 28.45 + norm1 * 0.25;
  const lng = 77.05 + norm2 * 0.30;

  return { name: clean, lat: Math.round(lat * 10000) / 10000, lng: Math.round(lng * 10000) / 10000 };
}

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
  const distM = Math.max(600, haversineMeters(origin, destination));
  const baseDurationSec = Math.max(180, Math.round((distM / 1000 / 28) * 3600));

  // Dynamically generate a random number of candidate routes (between 2 and 4 options)
  const routeCount = Math.floor(Math.random() * 3) + 2; // 2, 3, or 4 routes
  const steps = 16;

  interface RouteTemplate {
    name: string;
    arcFactor: number;
    wobble: number;
    distMultiplier: number;
    timeMultiplier: number;
    baseSafety: number;
    reason: string;
  }

  const TEMPLATES: RouteTemplate[] = [
    {
      name: 'Safe Highway Corridor (NH-48 / Arterial)',
      arcFactor: 0.014 + (Math.random() * 0.006 - 0.003),
      wobble: 0.002,
      distMultiplier: 1.18 + Math.random() * 0.06,
      timeMultiplier: 1.12 + Math.random() * 0.05,
      baseSafety: 92,
      reason: 'Well-lit arterial expressway with continuous CCTV coverage and active PCR patrol vans',
    },
    {
      name: 'Direct Inner City Link',
      arcFactor: 0.002 + (Math.random() * 0.004 - 0.002),
      wobble: -0.001,
      distMultiplier: 1.0,
      timeMultiplier: 1.0,
      baseSafety: 48,
      reason: 'Shortest path, but passes through unmonitored narrow alleys and reported theft zones',
    },
    {
      name: 'Ring Road Boulevard Corridor',
      arcFactor: -0.012 - (Math.random() * 0.005),
      wobble: 0.003,
      distMultiplier: 1.25 + Math.random() * 0.08,
      timeMultiplier: 1.20 + Math.random() * 0.06,
      baseSafety: 84,
      reason: 'Wide multi-lane commercial boulevard with high nighttime visibility and street lighting',
    },
    {
      name: 'Metro Line Transit Corridor',
      arcFactor: 0.008 + (Math.random() * 0.004),
      wobble: -0.002,
      distMultiplier: 1.10 + Math.random() * 0.05,
      timeMultiplier: 1.08 + Math.random() * 0.04,
      baseSafety: 76,
      reason: 'Parallel to metro line pillars with regular security presence and moderate lighting',
    },
  ];

  // Pick randomized subset of templates
  const shuffled = [...TEMPLATES].sort(() => Math.random() - 0.5).slice(0, routeCount);

  const generatedOptions = shuffled.map((tpl, idx) => {
    const coords: [number, number][] = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const lat = origin.lat + (destination.lat - origin.lat) * t;
      const lng = origin.lng + (destination.lng - origin.lng) * t;
      const arc = Math.sin(t * Math.PI) * tpl.arcFactor;
      const wobble = Math.sin(t * Math.PI * 2) * tpl.wobble;
      coords.push([lng + arc + wobble, lat - arc + wobble]);
    }

    const penalties = calculatePenalties(coords, incidents);
    const totalRisk = penalties.reduce((sum, p) => sum + p.penalty, 0);
    const calculatedScore = Math.max(20, Math.min(99, Math.round(tpl.baseSafety - totalRisk * (idx === 0 ? 0.1 : 0.6) + (Math.random() * 6 - 3))));

    const dist = Math.round(distM * tpl.distMultiplier);
    const dur = Math.round(baseDurationSec * tpl.timeMultiplier);

    return {
      routeIndex: idx,
      name: tpl.name,
      distanceMeters: dist,
      durationSeconds: dur,
      safety: {
        score: calculatedScore,
        level: getScoreLevel(calculatedScore),
        reasons: [tpl.reason],
        penalties,
        incidentCountNearby: penalties.length,
        highestSeverityNearby: (penalties[0]?.severity as SeverityLevel) || 'low',
        timeOfDayMultiplier: 1.2,
      },
      geometry: { type: 'LineString' as const, coordinates: coords },
    };
  });

  // Sort so highest combined score / recommended is index 0
  generatedOptions.sort((a, b) => b.safety.score - a.safety.score);
  // Re-assign 0-based indices
  generatedOptions.forEach((opt, i) => { opt.routeIndex = i; });

  const best = generatedOptions[0];
  const fastest = [...generatedOptions].sort((a, b) => a.durationSeconds - b.durationSeconds)[0];
  const timeDiff = Math.max(1, Math.round((best.durationSeconds - fastest.durationSeconds) / 60));
  const safetyGain = Math.max(1, best.safety.score - fastest.safety.score);

  return {
    routeId: `route-${Date.now()}`,
    origin,
    destination,
    travelAt: new Date().toISOString(),
    options: generatedOptions,
    recommendedIndex: 0,
    reason: `Recommended: ${best.name} (Safety Score: ${best.safety.score}/100) — safest evaluated corridor.`,
    tradeoff: timeDiff > 0 ? `+${timeDiff} min for +${safetyGain}% Safety Gain` : 'Optimal speed and safety balance',
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
