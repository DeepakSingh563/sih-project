import { Incident, CommunityReport, NewsArticle, AIAgentLog, LatLng, RoutePlanResponse, SOSEvent, Alert, DashboardStats } from '../types';
import { generateLocalRoutePlan, INITIAL_INCIDENTS, INITIAL_REPORTS, INITIAL_NEWS, INITIAL_AGENT_LOGS } from './mockData';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// In-memory local stores for offline/instant mode
let localIncidents: Incident[] = [...INITIAL_INCIDENTS];
let localReports: CommunityReport[] = [...INITIAL_REPORTS];
let localNews: NewsArticle[] = [...INITIAL_NEWS];
let localLogs: AIAgentLog[] = [...INITIAL_AGENT_LOGS];
let localSOS: SOSEvent[] = [];
let localAlerts: Alert[] = [];

// Helper to check backend health
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch('http://localhost:5000/health', { method: 'GET', signal: AbortSignal.timeout(1500) });
    return res.ok;
  } catch {
    return false;
  }
}

export const api = {
  // Plan route with safety comparison
  async planRoute(origin: LatLng, destination: LatLng, travelAt?: string): Promise<RoutePlanResponse> {
    try {
      const res = await fetch(`${API_BASE}/routes/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin, destination, travelAt }),
        signal: AbortSignal.timeout(3500),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend unavailable, generating deterministic local route plan:', e);
    }
    // Fallback: local heuristic calculation
    return generateLocalRoutePlan(origin, destination, localIncidents);
  },

  // Fetch incidents for map overlays
  async getIncidents(): Promise<Incident[]> {
    try {
      const res = await fetch(`${API_BASE}/incidents`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const data = await res.json();
        if (data.incidents?.length > 0) return data.incidents;
      }
    } catch {}
    return localIncidents;
  },

  // Submit community report
  async submitReport(payload: {
    incidentType: string;
    description: string;
    severity: string;
    latitude: number;
    longitude: number;
    address?: string;
  }): Promise<{ report: CommunityReport; verification: any }> {
    const simVerification = {
      suggestedStatus: payload.severity === 'critical' || payload.severity === 'high' ? 'pending' : 'verified',
      confidence: payload.severity === 'critical' ? 0.88 : payload.severity === 'high' ? 0.79 : 0.65,
      reasons: ['Heuristic proximity evaluation passed', 'No contradictory reports in corridor'],
    };

    const newReport: CommunityReport = {
      id: `rep-${Date.now()}`,
      incident_type: payload.incidentType,
      description: payload.description,
      severity: payload.severity as any,
      latitude: payload.latitude,
      longitude: payload.longitude,
      address: payload.address || 'User Specified Location',
      status: simVerification.suggestedStatus as any,
      confidence: simVerification.confidence,
      is_demo: true,
      created_at: new Date().toISOString(),
    };

    localReports.unshift(newReport);

    // If auto-verified, add to incidents immediately
    if (newReport.status === 'verified') {
      const newInc: Incident = {
        id: `inc-${Date.now()}`,
        type: payload.incidentType,
        severity: payload.severity as any,
        title: `Community Report: ${payload.incidentType.replace('_', ' ').toUpperCase()}`,
        description: payload.description,
        latitude: payload.latitude,
        longitude: payload.longitude,
        address: payload.address,
        reported_at: new Date().toISOString(),
        source: 'Community Report (Auto-Verified)',
        verified: true,
        verification_status: 'verified',
        confidence: simVerification.confidence,
        is_demo: true,
      };
      localIncidents.unshift(newInc);
    }

    // Log the agent run
    localLogs.unshift({
      id: `log-${Date.now()}`,
      agent_name: 'verificationAgent',
      operation: 'INGEST_COMMUNITY_REPORT',
      execution_time_ms: Math.floor(Math.random() * 120 + 80),
      status: 'success',
      input_summary: { incidentType: payload.incidentType, severity: payload.severity },
      output_summary: { status: simVerification.suggestedStatus, confidence: simVerification.confidence },
      created_at: new Date().toISOString(),
    });

    try {
      const res = await fetch(`${API_BASE}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(2500),
      });
      if (res.ok) return await res.json();
    } catch {}

    return { report: newReport, verification: simVerification };
  },

  // Get reports
  async getReports(): Promise<CommunityReport[]> {
    try {
      const res = await fetch(`${API_BASE}/reports/mine`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const data = await res.json();
        if (data.reports) return data.reports;
      }
    } catch {}
    return localReports;
  },

  // Verify/Reject report (Admin)
  async updateReportStatus(reportId: string, status: 'verified' | 'rejected'): Promise<CommunityReport> {
    const report = localReports.find(r => r.id === reportId);
    if (report) {
      report.status = status;
      if (status === 'verified') {
        localIncidents.unshift({
          id: `inc-${Date.now()}`,
          type: report.incident_type,
          severity: report.severity,
          title: `Admin Verified: ${report.incident_type}`,
          description: report.description,
          latitude: report.latitude,
          longitude: report.longitude,
          address: report.address,
          reported_at: new Date().toISOString(),
          source: 'Community Report (Admin Approved)',
          verified: true,
          verification_status: 'verified',
          confidence: 0.95,
          is_demo: true,
        });
      }
    }
    return report || ({} as CommunityReport);
  },

  // Trigger SOS simulation (SPEC #20)
  async triggerSOS(latitude: number, longitude: number): Promise<SOSEvent> {
    const event: SOSEvent = {
      id: `sos-${Date.now()}`,
      latitude,
      longitude,
      status: 'active',
      activated_at: new Date().toISOString(),
    };
    localSOS.unshift(event);
    return event;
  },

  // Cancel SOS
  async cancelSOS(id: string): Promise<SOSEvent> {
    const event = localSOS.find(s => s.id === id);
    if (event) {
      event.status = 'cancelled';
      event.cancelled_at = new Date().toISOString();
    }
    return event || { id, latitude: 0, longitude: 0, status: 'cancelled', activated_at: '' };
  },

  // News feed
  async getNews(): Promise<NewsArticle[]> {
    try {
      const res = await fetch(`${API_BASE}/news`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const data = await res.json();
        if (data.articles) return data.articles;
      }
    } catch {}
    return localNews;
  },

  // AI agent logs & admin stats
  async getDashboardStats(): Promise<DashboardStats> {
    return {
      totalIncidents: localIncidents.length,
      pendingReports: localReports.filter(r => r.status === 'pending').length,
      activeSOSEvents: localSOS.filter(s => s.status === 'active').length,
      recentAgentRuns: localLogs,
    };
  }
};
