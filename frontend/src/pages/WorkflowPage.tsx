import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Cpu,
  Layers,
  Shield,
  Navigation,
  Newspaper,
  AlertTriangle,
  FileCheck2,
  Zap,
  Activity,
  ArrowLeft,
  ArrowRight,
  Globe,
  Smartphone,
  Database,
  Radio
} from 'lucide-react';

export type NodeStatus = 'idle' | 'running' | 'success';

interface WorkflowNode {
  id: string;
  name: string;
  category: 'source' | 'trigger' | 'ingestion' | 'ai_nlp' | 'math' | 'decision' | 'action';
  icon: React.ComponentType<{ className?: string }>;
  x: number;
  y: number;
  description: string;
  executionTime: number;
  color: string;
  isSource?: boolean;
}

interface Connection {
  id: string;
  from: string;
  to: string;
  type: 'routing' | 'citizen' | 'news' | 'threat_db' | 'decision';
  baseColor: string;
}

export const WorkflowPage: React.FC = () => {
  // Read active query dynamically from localStorage (set when user hits 'Get Directions' in map)
  const savedQuery = useMemo(() => {
    try {
      const data = localStorage.getItem('safe_route_active_query');
      if (data) return JSON.parse(data);
    } catch {}
    return null;
  }, []);

  const [originName, setOriginName] = useState<string>(
    savedQuery?.origin?.name || 'Selected Origin'
  );
  const [destName, setDestName] = useState<string>(
    savedQuery?.destination?.name || 'Selected Destination'
  );
  const [originCoords, setOriginCoords] = useState<{ lat: number; lng: number }>(
    savedQuery?.origin || { lat: 28.6315, lng: 77.2167 }
  );
  const [destCoords, setDestCoords] = useState<{ lat: number; lng: number }>(
    savedQuery?.destination || { lat: 28.4950, lng: 77.0895 }
  );

  const [selectedNodeId, setSelectedNodeId] = useState<string>('node-trigger');
  const [nodeStatuses, setNodeStatuses] = useState<Record<string, NodeStatus>>({});

  // Recalculate distance from actual user coordinates
  const distanceKm = useMemo(() => {
    const dLat = destCoords.lat - originCoords.lat;
    const dLng = destCoords.lng - originCoords.lng;
    return Math.max(2.5, Math.round(Math.sqrt(dLat * dLat + dLng * dLng) * 111 * 10) / 10);
  }, [originCoords, destCoords]);

  // Clean structured 5-Tier layout with aligned horizontal bus channels
  const nodes: WorkflowNode[] = useMemo(() => [
    // --- COL 1: SOURCES & USER REQUEST (x: 25) ---
    {
      id: 'api-osm',
      name: 'OSM Road Graph API',
      category: 'source',
      icon: Database,
      x: 25,
      y: 45,
      description: 'OpenStreetMap Delhi NCR network',
      executionTime: 18,
      color: '#38BDF8',
      isSource: true,
    },
    {
      id: 'node-trigger',
      name: 'User Route Request',
      category: 'trigger',
      icon: Navigation,
      x: 25,
      y: 165,
      description: `${originName} ➔ ${destName} (${distanceKm} km)`,
      executionTime: 4,
      color: '#60A5FA',
    },
    {
      id: 'api-citizen',
      name: 'Citizen Reports Feed',
      category: 'source',
      icon: Smartphone,
      x: 25,
      y: 285,
      description: 'Live mobile crowd hazard submissions',
      executionTime: 14,
      color: '#34D399',
      isSource: true,
    },
    {
      id: 'api-news',
      name: 'newsind.org & Police Feed',
      category: 'source',
      icon: Globe,
      x: 25,
      y: 405,
      description: 'newsind.org, TOI & PCR alerts',
      executionTime: 35,
      color: '#FBBF24',
      isSource: true,
    },

    // --- COL 2: EXTRACTION & ROUTING ENGINES (x: 275) ---
    {
      id: 'node-osrm',
      name: 'OSRM Route Engine',
      category: 'math',
      icon: Layers,
      x: 275,
      y: 75,
      description: `Computes candidate paths for ${originName.split(',')[0]} ➔ ${destName.split(',')[0]}`,
      executionTime: 38,
      color: '#38BDF8',
    },
    {
      id: 'node-ingestion',
      name: 'Ingestion Agent',
      category: 'ingestion',
      icon: Shield,
      x: 275,
      y: 285,
      description: 'Validates NCR bounds & deduplicates',
      executionTime: 16,
      color: '#34D399',
    },
    {
      id: 'node-news',
      name: 'News Analysis Agent',
      category: 'ai_nlp',
      icon: Newspaper,
      x: 275,
      y: 405,
      description: 'GPT-4o-mini extracts safety entities',
      executionTime: 115,
      color: '#FBBF24',
    },

    // --- COL 3: VERIFICATION & ORCHESTRATOR HUB (x: 525) ---
    {
      id: 'node-orchestrator',
      name: 'Orchestrator Agent',
      category: 'decision',
      icon: Cpu,
      x: 525,
      y: 195,
      description: 'Maintains Live Spatial Incident Radar',
      executionTime: 24,
      color: '#E879F9',
    },
    {
      id: 'node-verification',
      name: 'Verification Agent',
      category: 'ai_nlp',
      icon: FileCheck2,
      x: 525,
      y: 345,
      description: 'Cross-validates evidence & confidence',
      executionTime: 55,
      color: '#A78BFA',
    },

    // --- COL 4: SCORING & DECISION (x: 775) ---
    {
      id: 'node-risk-scoring',
      name: 'Risk Scoring Agent',
      category: 'math',
      icon: Activity,
      x: 775,
      y: 75,
      description: 'Corridor spatial decay math scoring',
      executionTime: 32,
      color: '#F87171',
    },
    {
      id: 'node-route-planning',
      name: 'Route Planning Agent',
      category: 'decision',
      icon: Zap,
      x: 775,
      y: 235,
      description: '50% Safety + 30% Time + 20% Dist',
      executionTime: 25,
      color: '#34D399',
    },

    // --- COL 5: ACTIVE PROTECTION (x: 1025) ---
    {
      id: 'node-alert',
      name: 'Alert Agent (In-Transit)',
      category: 'action',
      icon: AlertTriangle,
      x: 1025,
      y: 155,
      description: 'Real-time 500m geofence monitor',
      executionTime: 12,
      color: '#FB923C',
    },
  ], [originName, destName, distanceKm]);

  // Structured connections with distinct semantic stream colors
  const connections: Connection[] = useMemo(() => [
    // 🔵 ROUTING STREAM (Blue/Cyan: #38BDF8)
    { id: 'c-osm-osrm', from: 'api-osm', to: 'node-osrm', type: 'routing', baseColor: '#38BDF8' },
    { id: 'c-trig-osrm', from: 'node-trigger', to: 'node-osrm', type: 'routing', baseColor: '#60A5FA' },
    { id: 'c-osrm-risk', from: 'node-osrm', to: 'node-risk-scoring', type: 'routing', baseColor: '#38BDF8' },
    { id: 'c-osrm-plan', from: 'node-osrm', to: 'node-route-planning', type: 'routing', baseColor: '#38BDF8' },

    // 🟢 CITIZEN PIPELINE (Emerald: #34D399)
    { id: 'c-cit-ingest', from: 'api-citizen', to: 'node-ingestion', type: 'citizen', baseColor: '#34D399' },
    { id: 'c-ingest-verif', from: 'node-ingestion', to: 'node-verification', type: 'citizen', baseColor: '#34D399' },
    { id: 'c-verif-orch', from: 'node-verification', to: 'node-orchestrator', type: 'citizen', baseColor: '#A78BFA' },

    // 🟠 NEWS & MEDIA STREAM (Amber: #FBBF24)
    { id: 'c-news-agent', from: 'api-news', to: 'node-news', type: 'news', baseColor: '#FBBF24' },
    { id: 'c-news-orch', from: 'node-news', to: 'node-orchestrator', type: 'news', baseColor: '#FBBF24' },

    // 🟣 SPATIAL THREAT RADAR FEED (Fuchsia: #E879F9)
    { id: 'c-orch-risk', from: 'node-orchestrator', to: 'node-risk-scoring', type: 'threat_db', baseColor: '#E879F9' },
    { id: 'c-orch-alert', from: 'node-orchestrator', to: 'node-alert', type: 'threat_db', baseColor: '#E879F9' },

    // 🔴 MULTI-OBJECTIVE DECISION & ACTION (Green/Orange: #34D399 / #FB923C)
    { id: 'c-risk-plan', from: 'node-risk-scoring', to: 'node-route-planning', type: 'decision', baseColor: '#F87171' },
    { id: 'c-plan-alert', from: 'node-route-planning', to: 'node-alert', type: 'decision', baseColor: '#FB923C' },
  ], []);

  const executionSequence = [
    'api-osm',
    'api-citizen',
    'api-news',
    'node-trigger',
    'node-osrm',
    'node-ingestion',
    'node-news',
    'node-verification',
    'node-orchestrator',
    'node-risk-scoring',
    'node-route-planning',
    'node-alert',
  ];

  // Auto-start animated pipeline execution immediately when loaded / when query changes
  useEffect(() => {
    let isCancelled = false;

    const runAutoPipeline = async () => {
      setNodeStatuses({});

      for (let i = 0; i < executionSequence.length; i++) {
        if (isCancelled) return;
        const targetId = executionSequence[i];
        setSelectedNodeId(targetId);

        setNodeStatuses((prev) => ({ ...prev, [targetId]: 'running' }));
        await new Promise((r) => setTimeout(r, 450));
        if (isCancelled) return;
        setNodeStatuses((prev) => ({ ...prev, [targetId]: 'success' }));
      }
    };

    runAutoPipeline();

    return () => {
      isCancelled = true;
    };
  }, [originName, destName, originCoords, destCoords]);

  // Keep state in sync if localStorage updates from map
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const data = localStorage.getItem('safe_route_active_query');
        if (data) {
          const parsed = JSON.parse(data);
          if (parsed.origin?.name) setOriginName(parsed.origin.name);
          if (parsed.destination?.name) setDestName(parsed.destination.name);
          if (parsed.origin) setOriginCoords(parsed.origin);
          if (parsed.destination) setDestCoords(parsed.destination);
        }
      } catch {}
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <div className="w-screen h-screen bg-[#07090E] text-slate-200 flex flex-col overflow-hidden font-sans select-none">
      {/* Sleek Minimal Header Bar (Zero Speed/Reset/Start Buttons) */}
      <header className="h-14 px-6 border-b border-white/[0.08] bg-[#0C1017]/90 backdrop-blur-xl flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-medium text-slate-300 transition-all hover:text-white"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Map</span>
          </a>

          <div className="h-4 w-px bg-white/[0.08]" />

          {/* Dynamic User Input Address Display */}
          <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.08] px-3.5 py-1.5 rounded-xl text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
              <input
                type="text"
                placeholder="Enter origin location..."
                value={originName}
                onChange={(e) => setOriginName(e.target.value)}
                className="bg-transparent border-none outline-none text-white text-xs font-semibold placeholder-slate-500 w-40 sm:w-52 truncate"
              />
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <input
                type="text"
                placeholder="Enter destination..."
                value={destName}
                onChange={(e) => setDestName(e.target.value)}
                className="bg-transparent border-none outline-none text-white text-xs font-semibold placeholder-slate-500 w-40 sm:w-52 truncate"
              />
            </div>
          </div>
        </div>

        {/* Live Automatic Status Badge & Legend */}
        <div className="flex items-center gap-4">
          {/* Stream Legend */}
          <div className="hidden lg:flex items-center gap-2.5 text-[10px] font-mono text-slate-400 border-r border-white/[0.08] pr-3">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />Routing</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />Citizen</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#FBBF24]" />News AI</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#E879F9]" />Threat Radar</span>
          </div>

          {/* Automatic Live Pulse Status */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Agent Pipeline Live & Active</span>
          </div>
        </div>
      </header>

      {/* Main Single-Page Canvas (100% Fit with Zero Scrollbars) */}
      <main className="flex-1 relative overflow-hidden bg-[#07090E] flex items-center justify-center p-2 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px]">
        <div className="relative w-[1240px] h-[495px] max-w-full max-h-full">
          {/* Animated Structured SVG Connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <defs>
              <filter id="glow-wire" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {connections.map((conn) => {
              const fromNode = nodes.find((n) => n.id === conn.from)!;
              const toNode = nodes.find((n) => n.id === conn.to)!;
              if (!fromNode || !toNode) return null;

              const cardWidth = 195;
              const cardHeight = 66;

              const startX = fromNode.x + cardWidth;
              const startY = fromNode.y + cardHeight / 2;
              const endX = toNode.x;
              const endY = toNode.y + cardHeight / 2;

              const deltaX = Math.abs(endX - startX) * 0.45;
              const pathD = `M ${startX} ${startY} C ${startX + deltaX} ${startY}, ${endX - deltaX} ${endY}, ${endX} ${endY}`;

              const isFromActive = nodeStatuses[fromNode.id] === 'success' || nodeStatuses[fromNode.id] === 'running';
              const isToActive = nodeStatuses[toNode.id] === 'running' || nodeStatuses[toNode.id] === 'success';
              const isActive = isFromActive && isToActive;

              const isIncomingSelected = toNode.id === selectedNodeId;
              const isOutgoingSelected = fromNode.id === selectedNodeId;

              const strokeColor = isIncomingSelected
                ? '#38BDF8'
                : isOutgoingSelected
                ? '#A855F7'
                : isActive
                ? conn.baseColor
                : conn.baseColor;

              const strokeOpacity = isIncomingSelected || isOutgoingSelected
                ? 1.0
                : isActive
                ? 0.95
                : 0.28;

              const strokeWidth = isIncomingSelected || isOutgoingSelected
                ? '2.8'
                : isActive
                ? '2.4'
                : '1.4';

              return (
                <g key={conn.id}>
                  {/* Clean Wire Path */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={isActive || isIncomingSelected || isOutgoingSelected ? 'none' : '3 3'}
                    opacity={strokeOpacity}
                    className="transition-all duration-300"
                  />

                  {/* Flowing Glowing Particle */}
                  <circle r="4.2" fill={conn.baseColor} filter="url(#glow-wire)">
                    <animateMotion
                      path={pathD}
                      dur="1.3s"
                      repeatCount="indefinite"
                    />
                  </circle>
                </g>
              );
            })}
          </svg>

          {/* Node Cards */}
          {nodes.map((node) => {
            const status = nodeStatuses[node.id] || 'idle';
            const isSelected = selectedNodeId === node.id;
            const Icon = node.icon;

            return (
              <motion.div
                key={node.id}
                onClick={() => setSelectedNodeId(node.id)}
                style={{ left: `${node.x}px`, top: `${node.y}px` }}
                className={`absolute w-[195px] h-[66px] rounded-xl border transition-all duration-200 cursor-pointer backdrop-blur-xl z-10 flex flex-col justify-between p-2.5 ${
                  node.isSource
                    ? 'border-cyan-500/30 bg-[#0A1220]/90 hover:border-cyan-400/60'
                    : isSelected
                    ? 'border-purple-400 bg-[#111622] ring-2 ring-purple-500/30 shadow-[0_6px_20px_rgba(168,85,247,0.25)] scale-[1.02]'
                    : 'border-white/[0.08] bg-[#0E131D]/95 hover:border-white/[0.2] hover:bg-[#131A28]'
                }`}
              >
                {/* Top Row: Icon + Name + Status */}
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div
                      className="w-5 h-5 rounded-md flex items-center justify-center text-white shrink-0 shadow-sm"
                      style={{ backgroundColor: node.color }}
                    >
                      <Icon className="w-3 h-3" />
                    </div>
                    <span className="font-bold text-[10.5px] text-white tracking-tight truncate">
                      {node.name}
                    </span>
                  </div>

                  {status === 'running' && (
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
                  )}
                  {status === 'success' && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  )}
                  {status === 'idle' && (
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-600 shrink-0" />
                  )}
                </div>

                {/* Bottom Row: Dynamic Description + Tag */}
                <div className="flex items-center justify-between text-[9.5px] text-slate-400 gap-1 mt-1">
                  <span className="truncate flex-1 font-sans text-slate-300">
                    {node.description}
                  </span>
                  <span className="font-mono text-[9px] text-slate-500 shrink-0">
                    {node.isSource ? 'Feed' : `~${node.executionTime}ms`}
                  </span>
                </div>

                {/* Left Incoming Port */}
                {!node.isSource && (
                  <div
                    className={`absolute -left-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#07090E] border-2 transition-colors ${
                      isSelected ? 'border-cyan-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]' : 'border-slate-500'
                    }`}
                  />
                )}

                {/* Right Outgoing Port */}
                <div
                  className={`absolute -right-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#07090E] border-2 transition-colors ${
                    isSelected ? 'border-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]' : ''
                  }`}
                  style={{ borderColor: isSelected ? '#A855F7' : node.color }}
                />
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
};
