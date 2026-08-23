export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';
export type RiskLevel = 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface Incident {
  id: string;
  type: string;
  severity: SeverityLevel;
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  address?: string;
  occurred_at?: string;
  reported_at: string;
  source: string;
  source_url?: string | null;
  verified: boolean;
  verification_status: VerificationStatus;
  confidence: number;
  is_demo?: boolean;
}

export interface CommunityReport {
  id: string;
  user_id?: string | null;
  incident_type: string;
  description: string;
  severity: SeverityLevel;
  latitude: number;
  longitude: number;
  address?: string;
  image_url?: string | null;
  status: VerificationStatus;
  confidence: number;
  duplicate_of?: string | null;
  is_demo?: boolean;
  created_at: string;
}

export interface RiskPenalty {
  incidentId: string;
  incidentType: string;
  severity: SeverityLevel;
  distanceMeters: number;
  penalty: number;
  reason: string;
}

export interface SafetyScoreResult {
  score: number; // 0 - 100
  level: RiskLevel;
  reasons: string[];
  penalties: RiskPenalty[];
  incidentCountNearby: number;
  highestSeverityNearby: SeverityLevel | null;
  timeOfDayMultiplier: number;
}

export interface RouteOption {
  routeIndex: number;
  distanceMeters: number;
  durationSeconds: number;
  safety: SafetyScoreResult;
  geometry: {
    type: 'LineString';
    coordinates: [number, number][]; // [lng, lat]
  };
  isFallback?: boolean;
}

export interface RoutePlanResponse {
  routeId: string | null;
  origin: LatLng;
  destination: LatLng;
  travelAt: string;
  options: RouteOption[];
  recommendedIndex: number;
  reason: string;
  tradeoff: string;
  demoFallbackUsed: boolean;
}

export interface Alert {
  id: string;
  user_id?: string;
  incident_id?: string;
  route_id?: string;
  title: string;
  message: string;
  severity: SeverityLevel;
  latitude: number;
  longitude: number;
  distance_from_user?: number;
  is_read: boolean;
  created_at: string;
}

export interface SOSEvent {
  id: string;
  user_id?: string;
  latitude: number;
  longitude: number;
  status: 'active' | 'cancelled' | 'resolved';
  activated_at: string;
  cancelled_at?: string | null;
}

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  published_at: string;
  content?: string;
  processed: boolean;
  is_demo?: boolean;
  ai_analysis?: {
    incidentType?: string;
    location?: string;
    severity?: SeverityLevel;
    confidence?: number;
    riskKeywords?: string[];
  } | null;
}

export interface AIAgentLog {
  id: string;
  agent_name: string;
  operation: string;
  execution_time_ms: number;
  status: 'success' | 'fallback' | 'error';
  input_summary?: any;
  output_summary?: any;
  created_at: string;
}

export interface DashboardStats {
  totalIncidents: number;
  pendingReports: number;
  activeSOSEvents: number;
  recentAgentRuns: AIAgentLog[];
}
