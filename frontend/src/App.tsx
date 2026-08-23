import React, { useState, useEffect, useRef } from 'react';
import { LatLng, RoutePlanResponse, Incident, CommunityReport, NewsArticle, AIAgentLog, SeverityLevel } from './types';
import { api, checkBackendHealth } from './lib/api';
import { INITIAL_INCIDENTS, INITIAL_REPORTS, INITIAL_NEWS, INITIAL_AGENT_LOGS } from './lib/mockData';
import { Navbar } from './components/Navbar';
import { MapView } from './components/MapView';
import { RoutePlanner } from './components/RoutePlanner';
import { NavigationSim } from './components/NavigationSim';
import { ReportModal } from './components/ReportModal';
import { SOSModal, EMERGENCY_PHONE_DISPLAY } from './components/SOSModal';
import { NewsFeed } from './components/NewsFeed';
import { AdminDashboard } from './components/AdminDashboard';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import {
  AlertOctagon,
  Crosshair,
} from 'lucide-react';

export function App() {
  const [backendOnline, setBackendOnline] = useState<boolean>(false);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [reportModalOpen, setReportModalOpen] = useState<boolean>(false);
  const [sosModalOpen, setSosModalOpen] = useState<boolean>(false);
  const [newsModalOpen, setNewsModalOpen] = useState<boolean>(false);
  const [adminModalOpen, setAdminModalOpen] = useState<boolean>(false);

  const [origin, setOrigin] = useState<LatLng | null>(null);
  const [destination, setDestination] = useState<LatLng | null>(null);
  const [routePlan, setRoutePlan] = useState<RoutePlanResponse | null>(null);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number>(0);
  const [userNavPos, setUserNavPos] = useState<LatLng | null>(null);
  const [planningLoading, setPlanningLoading] = useState<boolean>(false);

  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [reports, setReports] = useState<CommunityReport[]>(INITIAL_REPORTS);
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>(INITIAL_NEWS);
  const [agentLogs, setAgentLogs] = useState<AIAgentLog[]>(INITIAL_AGENT_LOGS);
  const [incidentFilter, setIncidentFilter] = useState<SeverityLevel | 'all'>('all');

  const sosButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    async function initData() {
      const isUp = await checkBackendHealth();
      setBackendOnline(isUp);

      const incList = await api.getIncidents();
      setIncidents(incList);

      const repList = await api.getReports();
      setReports(repList);

      const newsList = await api.getNews();
      setNewsArticles(newsList);
    }
    initData();
  }, []);

  useEffect(() => {
    if (origin && destination && !routePlan) {
      handlePlanRoute();
    }
  }, []);

  const handlePlanRoute = async () => {
    if (!origin || !destination) return;
    setPlanningLoading(true);
    try {
      const plan = await api.planRoute(origin, destination);
      setRoutePlan(plan);
      setSelectedRouteIndex(plan.recommendedIndex);
      localStorage.setItem(
        'safe_route_active_query',
        JSON.stringify({
          origin,
          destination,
          routePlan: plan,
          timestamp: Date.now(),
        })
      );
    } catch (err) {
      console.error('Route error:', err);
    } finally {
      setPlanningLoading(false);
    }
  };

  const handleLocateMe = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setOrigin({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.warn('Geolocation error:', err),
        { enableHighAccuracy: true }
      );
    }
  };

  const handleStartNavigation = () => {
    if (!routePlan || !routePlan.options[selectedRouteIndex]) return;
    setIsNavigating(true);
  };

  const handleExitNavigation = () => {
    setIsNavigating(false);
    setUserNavPos(null);
  };

  const handleTriggerReroute = async () => {
    if (!origin || !destination) return;
    const plan = await api.planRoute(origin, destination);
    setRoutePlan(plan);
  };

  const handleSubmitReport = async (payload: any) => {
    const res = await api.submitReport(payload);
    setReports(await api.getReports());
    setIncidents(await api.getIncidents());
    return res;
  };

  const handleVerifyReport = async (id: string) => {
    await api.updateReportStatus(id, 'verified');
    setReports(await api.getReports());
    setIncidents(await api.getIncidents());
  };

  const handleRejectReport = async (id: string) => {
    await api.updateReportStatus(id, 'rejected');
    setReports(await api.getReports());
  };

  const handleTriggerSOS = async (lat: number, lng: number) => api.triggerSOS(lat, lng);
  const handleCancelSOS = async (id: string) => api.cancelSOS(id);
  const handleSOSClick = () => setSosModalOpen(true);

  const activeRouteOption = routePlan?.options[selectedRouteIndex] || null;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-100 font-sans flex flex-col">
      {/* Top Modern Light-Themed Navbar with Logo & Icon Buttons */}
      <Navbar
        onOpenWorkflow={() => window.open('/workflow', '_blank')}
        onOpenReport={() => setReportModalOpen(true)}
        onOpenNews={() => setNewsModalOpen(true)}
        onOpenSOS={() => setSosModalOpen(true)}
      />

      {/* Main Map & Route Section */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        {/* Fullscreen Map */}
        <div className="absolute inset-0 z-0">
          <MapView
            incidents={incidents}
            origin={origin}
            destination={destination}
            routeOptions={routePlan?.options}
            selectedRouteIndex={selectedRouteIndex}
            onSelectRoute={setSelectedRouteIndex}
            userNavPos={userNavPos}
            onMapClick={(latlng) => {
              if (!origin) setOrigin(latlng);
              else setDestination(latlng);
            }}
            showIncidentFilter={incidentFilter}
            alertRadiusMeters={600}
          />
        </div>

        {/* Floating Route Planner */}
        <div className="absolute top-4 left-4 z-20 pointer-events-none w-full sm:w-auto">
          <div className="pointer-events-auto max-w-sm sm:max-w-md">
            <AnimatePresence mode="wait">
              {isNavigating && activeRouteOption ? (
                <NavigationSim
                  key="nav-sim"
                  route={activeRouteOption}
                  incidents={incidents}
                  onUpdateNavPosition={setUserNavPos}
                  onExitNavigation={handleExitNavigation}
                  onTriggerReroute={handleTriggerReroute}
                  onOpenSOS={() => setSosModalOpen(true)}
                />
              ) : (
                <RoutePlanner
                  key="route-planner"
                  origin={origin}
                  destination={destination}
                  setOrigin={setOrigin}
                  setDestination={setDestination}
                  routePlan={routePlan}
                  selectedRouteIndex={selectedRouteIndex}
                  setSelectedRouteIndex={setSelectedRouteIndex}
                  onPlanRoute={handlePlanRoute}
                  loading={planningLoading}
                  onStartNavigation={handleStartNavigation}
                  onLocateMe={handleLocateMe}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* GPS Locate Floating Button */}
      <motion.div
        className="absolute bottom-6 left-6 z-20 pointer-events-auto"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, type: 'spring', stiffness: 280, damping: 20 }}
      >
        <motion.button
          onClick={handleLocateMe}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-3 bg-white/95 hover:bg-slate-50 backdrop-blur-md rounded-full shadow-google border border-slate-200 text-slate-700 transition-colors flex items-center justify-center"
          title="Your location"
        >
          <Crosshair className="w-5 h-5 text-blue-600" />
        </motion.button>
      </motion.div>

      {/* Severity Radar Filter */}
      <motion.div
        className="absolute bottom-6 right-6 z-20 pointer-events-auto bg-white/95 backdrop-blur-md px-2 py-1.5 rounded-2xl shadow-google border border-slate-200 text-xs flex items-center gap-1"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, type: 'spring', stiffness: 260, damping: 22 }}
      >
        {(['all', 'critical', 'high', 'medium', 'low'] as const).map((sev) => (
          <motion.button
            key={`flt-${sev}`}
            onClick={() => setIncidentFilter(sev)}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize transition-colors ${
              incidentFilter === sev
                ? 'bg-blue-600 text-white font-semibold shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {sev}
          </motion.button>
        ))}
      </motion.div>

      {/* ========= GIANT FIXED SOS BUTTON — BOTTOM CENTER ========= */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30 pointer-events-auto flex flex-col items-center gap-1">
        <motion.button
          ref={sosButtonRef}
          onClick={handleSOSClick}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 280, damping: 18 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-20 h-20 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex flex-col items-center justify-center shadow-2xl border-4 border-white ring-4 ring-rose-400 transition-colors"
          style={{ boxShadow: '0 8px 32px rgba(220,38,38,0.55)' }}
          title={`Emergency SOS (${EMERGENCY_PHONE_DISPLAY})`}
        >
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <AlertOctagon className="w-8 h-8" />
          </motion.div>
          <span className="text-xs font-black tracking-widest mt-0.5">SOS</span>
        </motion.button>
        <span className="text-[10px] font-bold text-white bg-rose-600/90 px-2 py-0.5 rounded-full shadow backdrop-blur-sm">Emergency</span>
      </div>

      {/* Modals */}
      <ReportModal isOpen={reportModalOpen} onClose={() => setReportModalOpen(false)} onSubmit={handleSubmitReport} />
      <SOSModal isOpen={sosModalOpen} onClose={() => setSosModalOpen(false)} userPosition={userNavPos || origin} onTriggerSOS={handleTriggerSOS} onCancelSOS={handleCancelSOS} />
      <NewsFeed isOpen={newsModalOpen} onClose={() => setNewsModalOpen(false)} articles={newsArticles} />
      <AdminDashboard isOpen={adminModalOpen} onClose={() => setAdminModalOpen(false)} reports={reports} agentLogs={agentLogs} incidents={incidents} onVerifyReport={handleVerifyReport} onRejectReport={handleRejectReport} />
    </div>
  );
}
