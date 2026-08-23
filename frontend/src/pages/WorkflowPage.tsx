import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  RotateCcw,
  CheckCircle2,
  Cpu,
  Layers,
  Shield,
  Navigation,
  Newspaper,
  AlertTriangle,
  FileCheck2,
  Terminal,
  Zap,
  Activity,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  MapPin,
  RefreshCw,
  Clock,
  Compass
} from 'lucide-react';
import { GLOBAL_POPULAR_PLACES } from '../lib/mockData';

export type NodeStatus = 'idle' | 'running' | 'success';

interface WorkflowNode {
  id: string;
  name: string;
  category: 'trigger' | 'ingestion' | 'ai_nlp' | 'math' | 'decision' | 'action';
  icon: React.ComponentType<{ className?: string }>;
  x: number;
  y: number;
  description: string;
  status: NodeStatus;
  executionTime: number;
  inputs: Record<string, any>;
  outputs: Record<string, any>;
  logicInfo: string;
  color: string;
}

interface Connection {
  from: string;
  to: string;
}

export const WorkflowPage: React.FC = () => {
  // Read active query from localStorage or default
  const savedQuery = useMemo(() => {
    try {
      const data = localStorage.getItem('safe_route_active_query');
      if (data) return JSON.parse(data);
    } catch {}
    return null;
  }, []);

  const [originName, setOriginName] = useState<string>(
    savedQuery?.origin?.name || 'Connaught Place, New Delhi'
  );
  const [destName, setDestName] = useState<string>(
    savedQuery?.destination?.name || 'Cyber City, Gurugram'
  );
  const [originCoords, setOriginCoords] = useState<{ lat: number; lng: number }>(
    savedQuery?.origin || { lat: 28.6315, lng: 77.2167 }
  );
  const [destCoords, setDestCoords] = useState<{ lat: number; lng: number }>(
    savedQuery?.destination || { lat: 28.4950, lng: 77.0895 }
  );

  const [selectedNodeId, setSelectedNodeId] = useState<string>('node-trigger');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [nodeStatuses, setNodeStatuses] = useState<Record<string, NodeStatus>>({});

  // Dynamic calculation based on selected coordinates
  const distanceKm = useMemo(() => {
    const dLat = destCoords.lat - originCoords.lat;
    const dLng = destCoords.lng - originCoords.lng;
    return Math.max(4.2, Math.round(Math.sqrt(dLat * dLat + dLng * dLng) * 111 * 10) / 10);
  }, [originCoords, destCoords]);

  const durationMin = useMemo(() => Math.round((distanceKm / 28) * 60), [distanceKm]);

  // Construct dynamic nodes
  const nodes: WorkflowNode[] = useMemo(() => {
    return [
      {
        id: 'node-trigger',
        name: 'User Route Request',
        category: 'trigger',
        icon: Navigation,
        x: 40,
        y: 200,
        description: `Origin: ${originName} → Destination: ${destName}`,
        status: nodeStatuses['node-trigger'] || 'idle',
        executionTime: 4,
        inputs: {
          origin: { name: originName, ...originCoords },
          destination: { name: destName, ...destCoords },
          distanceEstKm: distanceKm,
          travelMode: 'Safety First',
        },
        outputs: {
          dispatchedTo: ['OSRM Routing Engine', 'Ingestion Pipeline', 'News Radar'],
          status: 'ready',
        },
        logicInfo: 'Parses origin & destination coordinates, calculates bounding corridor, and dispatches parallel queries.',
        color: '#38BDF8',
      },
      {
        id: 'node-osrm',
        name: 'OSRM Route Engine',
        category: 'math',
        icon: Layers,
        x: 320,
        y: 80,
        description: `Generates dynamic candidate paths (~${distanceKm} km, ~${durationMin} min)`,
        status: nodeStatuses['node-osrm'] || 'idle',
        executionTime: 38,
        inputs: {
          originCoords: [originCoords.lat, originCoords.lng],
          destCoords: [destCoords.lat, destCoords.lng],
          alternatives: 'Dynamic Multi-Path',
        },
        outputs: {
          candidateRoutesGenerated: 3,
          route1: { name: 'Arterial Safe Corridor', distKm: Math.round(distanceKm * 1.15 * 10) / 10, timeMin: durationMin + 4 },
          route2: { name: 'Direct Express Link', distKm: distanceKm, timeMin: durationMin },
          route3: { name: 'Transit Ring Boulevard', distKm: Math.round(distanceKm * 1.25 * 10) / 10, timeMin: durationMin + 7 },
        },
        logicInfo: 'Queries road network graphs to compute diverse corridor polylines and waypoints.',
        color: '#60A5FA',
      },
      {
        id: 'node-ingestion',
        name: 'Ingestion Agent',
        category: 'ingestion',
        icon: Shield,
        x: 320,
        y: 290,
        description: 'Validates NCR coordinates & deduplicates within 300m',
        status: nodeStatuses['node-ingestion'] || 'idle',
        executionTime: 16,
        inputs: {
          corridorRadiusKm: 2.5,
          ncrBoundingBox: '28.2N - 28.95N, 76.7E - 77.55E',
        },
        outputs: {
          reportsEvaluated: 14,
          validWithinNCR: 14,
          duplicatesMerged: 3,
        },
        logicInfo: 'Filters coordinate validity, cleans text, and performs spatial proximity deduplication.',
        color: '#34D399',
      },
      {
        id: 'node-news',
        name: 'News Analysis Agent',
        category: 'ai_nlp',
        icon: Newspaper,
        x: 320,
        y: 490,
        description: 'GPT-4o-mini extracts safety & crime entities from feeds',
        status: nodeStatuses['node-news'] || 'idle',
        executionTime: 115,
        inputs: {
          model: 'gpt-4o-mini',
          sources: ['Delhi Police Desk', 'Traffic Advisory Feed'],
        },
        outputs: {
          extractedIncidents: [
            { type: 'unlit_road', severity: 'medium', confidence: 0.94 },
            { type: 'snatching_hotspot', severity: 'high', confidence: 0.91 },
          ],
        },
        logicInfo: 'NLP entity extraction with structured JSON schemas & rule-based validation.',
        color: '#FBBF24',
      },
      {
        id: 'node-verification',
        name: 'Verification Agent',
        category: 'ai_nlp',
        icon: FileCheck2,
        x: 610,
        y: 370,
        description: 'Corroboration NLP scoring (Auto-verifies if confidence ≥ 0.85)',
        status: nodeStatuses['node-verification'] || 'idle',
        executionTime: 55,
        inputs: {
          formula: 'Score = 0.70 * RuleEvidence + 0.30 * LLMPlausibility',
        },
        outputs: {
          verifiedIncidents: 4,
          averageConfidence: 0.92,
          promotedToRadar: true,
        },
        logicInfo: 'Cross-verifies witness statements with nearby police records and community signals.',
        color: '#A78BFA',
      },
      {
        id: 'node-orchestrator',
        name: 'Orchestrator Agent',
        category: 'decision',
        icon: Cpu,
        x: 610,
        y: 190,
        description: 'Aggregates verified records into Live Spatial Incident Radar',
        status: nodeStatuses['node-orchestrator'] || 'idle',
        executionTime: 22,
        inputs: {
          activeIncidents: 32,
          spatialGrid: 'Delhi NCR PostGIS R-Tree',
        },
        outputs: {
          radarRefreshed: true,
          corridorThreatIndex: 'Moderate at night',
        },
        logicInfo: 'Central pipeline coordinator maintaining real-time spatial safety map.',
        color: '#F472B6',
      },
      {
        id: 'node-risk-scoring',
        name: 'Risk Scoring Agent',
        category: 'math',
        icon: Activity,
        x: 900,
        y: 100,
        description: 'Spatial decay math along candidate route corridors',
        status: nodeStatuses['node-risk-scoring'] || 'idle',
        executionTime: 32,
        inputs: {
          decayRadiusMeters: 500,
          nightRiskMultiplier: 1.35,
        },
        outputs: {
          safeCorridorScore: 93,
          directLinkScore: 46,
          transitRingScore: 81,
        },
        logicInfo: 'Iterates route waypoints and applies inverse-distance decay on active threat data.',
        color: '#F87171',
      },
      {
        id: 'node-route-planning',
        name: 'Route Planning Agent',
        category: 'decision',
        icon: Zap,
        x: 900,
        y: 290,
        description: 'Multi-objective formula: 50% Safety + 30% Time + 20% Distance',
        status: nodeStatuses['node-route-planning'] || 'idle',
        executionTime: 25,
        inputs: {
          weights: { safety: 0.50, time: 0.30, distance: 0.20 },
        },
        outputs: {
          recommended: 'Arterial Safe Corridor',
          tradeoff: `+4 min for +47% Safety Gain`,
          safetyScore: '93 / 100',
        },
        logicInfo: 'Evaluates Pareto-optimal frontier balancing personal safety against travel duration.',
        color: '#34D399',
      },
      {
        id: 'node-alert',
        name: 'Alert Agent (In-Transit)',
        category: 'action',
        icon: AlertTriangle,
        x: 1190,
        y: 190,
        description: 'Proactive 500m geofence monitor during active transit',
        status: nodeStatuses['node-alert'] || 'idle',
        executionTime: 12,
        inputs: {
          activeGeofence: '500m forward corridor',
        },
        outputs: {
          monitoring: 'Active',
          rerouteTrigger: 'Ready on threat detection',
        },
        logicInfo: 'Real-time GPS proximity watcher triggering dynamic warning & rerouting.',
        color: '#FB923C',
      },
    ];
  }, [originName, destName, originCoords, destCoords, distanceKm, durationMin, nodeStatuses]);

  const connections: Connection[] = useMemo(() => [
    { from: 'node-trigger', to: 'node-osrm' },
    { from: 'node-trigger', to: 'node-ingestion' },
    { from: 'node-trigger', to: 'node-news' },
    { from: 'node-ingestion', to: 'node-verification' },
    { from: 'node-news', to: 'node-orchestrator' },
    { from: 'node-verification', to: 'node-orchestrator' },
    { from: 'node-osrm', to: 'node-risk-scoring' },
    { from: 'node-orchestrator', to: 'node-risk-scoring' },
    { from: 'node-risk-scoring', to: 'node-route-planning' },
    { from: 'node-osrm', to: 'node-route-planning' },
    { from: 'node-route-planning', to: 'node-alert' },
  ], []);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];

  const executionSequence = [
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

  const handleReset = () => {
    setIsRunning(false);
    setNodeStatuses({});
  };

  const runPipeline = async () => {
    handleReset();
    setIsRunning(true);

    for (let i = 0; i < executionSequence.length; i++) {
      const targetId = executionSequence[i];
      setSelectedNodeId(targetId);

      setNodeStatuses((prev) => ({ ...prev, [targetId]: 'running' }));
      const delay = 650 / speedMultiplier;
      await new Promise((r) => setTimeout(r, delay));
      setNodeStatuses((prev) => ({ ...prev, [targetId]: 'success' }));
    }

    setIsRunning(false);
  };

  const handleQuickPreset = (orig: string, dest: string, oC: { lat: number; lng: number }, dC: { lat: number; lng: number }) => {
    setOriginName(orig);
    setDestName(dest);
    setOriginCoords(oC);
    setDestCoords(dC);
    handleReset();
  };

  return (
    <div className="w-screen h-screen bg-[#07090E] text-slate-200 flex flex-col overflow-hidden font-sans select-none">
      {/* Minimal Sleek Header Bar */}
      <header className="h-16 px-6 border-b border-white/[0.08] bg-[#0C1017]/90 backdrop-blur-xl flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-4">
          <a
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-medium text-slate-300 transition-all hover:text-white"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Map</span>
          </a>

          <div className="h-5 w-px bg-white/[0.08]" />

          {/* Active Route Pill (Dynamic, not hardcoded) */}
          <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.08] px-3 py-1.5 rounded-xl text-xs">
            <div className="flex items-center gap-1.5 text-slate-300 font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span className="max-w-[130px] truncate">{originName}</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            <div className="flex items-center gap-1.5 text-slate-300 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="max-w-[130px] truncate">{destName}</span>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="hidden lg:flex items-center gap-1.5 text-[11px]">
            <span className="text-slate-500 font-mono">Preset:</span>
            {[
              { o: 'Connaught Place', d: 'Cyber City', oC: { lat: 28.6315, lng: 77.2167 }, dC: { lat: 28.4950, lng: 77.0895 } },
              { o: 'Saket Metro', d: 'Noida Sec 18', oC: { lat: 28.5200, lng: 77.2100 }, dC: { lat: 28.5700, lng: 77.3200 } },
              { o: 'Karol Bagh', d: 'Dwarka Sec 21', oC: { lat: 28.6500, lng: 77.1900 }, dC: { lat: 28.5500, lng: 77.0500 } },
            ].map((p, i) => (
              <button
                key={i}
                onClick={() => handleQuickPreset(p.o, p.d, p.oC, p.dC)}
                className="px-2 py-1 rounded-md bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-slate-400 hover:text-white transition-colors"
              >
                {p.o.split(' ')[0]} ➔ {p.d.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white/[0.04] p-1 rounded-lg border border-white/[0.08] text-xs font-mono">
            <button
              onClick={() => setSpeedMultiplier(1)}
              className={`px-2 py-0.5 rounded text-[11px] ${
                speedMultiplier === 1 ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              1x
            </button>
            <button
              onClick={() => setSpeedMultiplier(2)}
              className={`px-2 py-0.5 rounded text-[11px] ${
                speedMultiplier === 2 ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              2x Turbo
            </button>
          </div>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-medium text-slate-300 transition-colors"
          >
            <RotateCcw className="w-3 h-3 text-slate-400" />
            <span>Reset</span>
          </button>

          <button
            disabled={isRunning}
            onClick={runPipeline}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-bold text-white shadow-[0_0_20px_rgba(168,85,247,0.35)] transition-all active:scale-95 disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isRunning ? 'Running Pipeline...' : '▶ Simulate Pipeline'}</span>
          </button>
        </div>
      </header>

      {/* Main Canvas & Inspector Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Visual Graph Canvas */}
        <div className="flex-1 relative overflow-auto bg-[#07090E] p-8 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px]">
          {/* Glowing Wires */}
          <svg className="absolute inset-0 w-[1480px] h-[680px] pointer-events-none z-0">
            <defs>
              <filter id="glow-wire" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {connections.map((conn, idx) => {
              const fromNode = nodes.find((n) => n.id === conn.from)!;
              const toNode = nodes.find((n) => n.id === conn.to)!;
              if (!fromNode || !toNode) return null;

              const startX = fromNode.x + 224;
              const startY = fromNode.y + 42;
              const endX = toNode.x;
              const endY = toNode.y + 42;

              const deltaX = Math.abs(endX - startX) * 0.5;
              const pathD = `M ${startX} ${startY} C ${startX + deltaX} ${startY}, ${endX - deltaX} ${endY}, ${endX} ${endY}`;

              const isActive =
                (fromNode.status === 'success' || fromNode.status === 'running') &&
                (toNode.status === 'running' || toNode.status === 'success');

              return (
                <g key={`conn-${idx}`}>
                  <path
                    d={pathD}
                    fill="none"
                    stroke={isActive ? '#38BDF8' : '#1E293B'}
                    strokeWidth={isActive ? '2.5' : '1.5'}
                    strokeDasharray={isActive ? 'none' : '3 3'}
                    opacity={isActive ? 0.9 : 0.4}
                    className="transition-all duration-300"
                  />

                  {isActive && (
                    <circle r="4" fill="#A855F7" filter="url(#glow-wire)">
                      <animateMotion
                        path={pathD}
                        dur={`${1.3 / speedMultiplier}s`}
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Node Cards */}
          <div className="relative w-[1480px] h-[680px]">
            {nodes.map((node) => {
              const isSelected = node.id === selectedNodeId;
              const Icon = node.icon;

              return (
                <motion.div
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  style={{ left: `${node.x}px`, top: `${node.y}px` }}
                  className={`absolute w-56 rounded-xl border transition-all duration-200 cursor-pointer backdrop-blur-xl z-10 ${
                    isSelected
                      ? 'border-purple-400/80 bg-[#111622] ring-2 ring-purple-500/30 shadow-[0_8px_30px_rgba(168,85,247,0.2)] scale-[1.03]'
                      : 'border-white/[0.08] bg-[#0E131D]/90 hover:border-white/[0.2] hover:bg-[#131A28]'
                  }`}
                >
                  {/* Card Header */}
                  <div className="px-3 py-2 flex items-center justify-between border-b border-white/[0.06]">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-md flex items-center justify-center text-white shrink-0 shadow-sm"
                        style={{ backgroundColor: node.color }}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-semibold text-xs text-white tracking-tight truncate">
                        {node.name}
                      </span>
                    </div>

                    {node.status === 'running' && (
                      <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    )}
                    {node.status === 'success' && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                    {node.status === 'idle' && (
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-3 text-[11px] text-slate-300">
                    <p className="line-clamp-2 leading-relaxed text-slate-400 font-sans">
                      {node.description}
                    </p>

                    <div className="mt-2 pt-2 border-t border-white/[0.05] flex items-center justify-between font-mono text-[10px] text-slate-500">
                      <span>~{node.executionTime}ms</span>
                      <span
                        className={`font-semibold uppercase tracking-wider ${
                          node.status === 'running'
                            ? 'text-amber-400'
                            : node.status === 'success'
                            ? 'text-emerald-400'
                            : 'text-slate-600'
                        }`}
                      >
                        {node.status}
                      </span>
                    </div>
                  </div>

                  {/* Ports */}
                  <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#07090E] border-2 border-slate-500" />
                  <div
                    className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#07090E] border-2"
                    style={{ borderColor: node.color }}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
