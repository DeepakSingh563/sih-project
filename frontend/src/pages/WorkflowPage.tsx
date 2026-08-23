import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
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
  Zap,
  Activity,
  ArrowLeft,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export type NodeStatus = 'idle' | 'running' | 'success';

interface WorkflowNode {
  id: string;
  name: string;
  category: 'trigger' | 'ingestion' | 'ai_nlp' | 'math' | 'decision' | 'action';
  icon: React.ComponentType<{ className?: string }>;
  x: number;
  y: number;
  description: string;
  executionTime: number;
  color: string;
}

interface Connection {
  from: string;
  to: string;
}

export const WorkflowPage: React.FC = () => {
  const savedQuery = useMemo(() => {
    try {
      const data = localStorage.getItem('safe_route_active_query');
      if (data) return JSON.parse(data);
    } catch {}
    return null;
  }, []);

  const [originName, setOriginName] = useState<string>(
    savedQuery?.origin?.name || 'Connaught Place'
  );
  const [destName, setDestName] = useState<string>(
    savedQuery?.destination?.name || 'Cyber City'
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

  const distanceKm = useMemo(() => {
    const dLat = destCoords.lat - originCoords.lat;
    const dLng = destCoords.lng - originCoords.lng;
    return Math.max(4.2, Math.round(Math.sqrt(dLat * dLat + dLng * dLng) * 111 * 10) / 10);
  }, [originCoords, destCoords]);

  const durationMin = useMemo(() => Math.round((distanceKm / 28) * 60), [distanceKm]);

  // Perfectly spaced coordinates to fit in a single 100vh non-scrolling screen
  const nodes: WorkflowNode[] = useMemo(() => [
    {
      id: 'node-trigger',
      name: 'User Route Request',
      category: 'trigger',
      icon: Navigation,
      x: 30,
      y: 220,
      description: `${originName} ➔ ${destName} (~${distanceKm} km)`,
      executionTime: 4,
      color: '#38BDF8',
    },
    {
      id: 'node-osrm',
      name: 'OSRM Route Engine',
      category: 'math',
      icon: Layers,
      x: 270,
      y: 70,
      description: 'Generates dynamic candidate corridor paths',
      executionTime: 38,
      color: '#60A5FA',
    },
    {
      id: 'node-ingestion',
      name: 'Ingestion Agent',
      category: 'ingestion',
      icon: Shield,
      x: 270,
      y: 220,
      description: 'Validates NCR bounds & 300m deduplication',
      executionTime: 16,
      color: '#34D399',
    },
    {
      id: 'node-news',
      name: 'News Analysis Agent',
      category: 'ai_nlp',
      icon: Newspaper,
      x: 270,
      y: 370,
      description: 'GPT-4o-mini extracts crime & safety entities',
      executionTime: 115,
      color: '#FBBF24',
    },
    {
      id: 'node-verification',
      name: 'Verification Agent',
      category: 'ai_nlp',
      icon: FileCheck2,
      x: 520,
      y: 320,
      description: 'Corroboration NLP confidence scoring',
      executionTime: 55,
      color: '#A78BFA',
    },
    {
      id: 'node-orchestrator',
      name: 'Orchestrator Agent',
      category: 'decision',
      icon: Cpu,
      x: 520,
      y: 170,
      description: 'Synchronizes live Spatial Incident Radar',
      executionTime: 22,
      color: '#F472B6',
    },
    {
      id: 'node-risk-scoring',
      name: 'Risk Scoring Agent',
      category: 'math',
      icon: Activity,
      x: 770,
      y: 90,
      description: 'Corridor spatial decay math & threat index',
      executionTime: 32,
      color: '#F87171',
    },
    {
      id: 'node-route-planning',
      name: 'Route Planning Agent',
      category: 'decision',
      icon: Zap,
      x: 770,
      y: 260,
      description: 'Composite optimizer: 50% Safety + 30% Time + 20% Dist',
      executionTime: 25,
      color: '#34D399',
    },
    {
      id: 'node-alert',
      name: 'Alert Agent (In-Transit)',
      category: 'action',
      icon: AlertTriangle,
      x: 1020,
      y: 175,
      description: 'Real-time 500m geofenced hazard monitor',
      executionTime: 12,
      color: '#FB923C',
    },
  ], [originName, destName, distanceKm]);

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
      const delay = 600 / speedMultiplier;
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
      {/* Sleek Top Navigation Bar */}
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

          {/* Active Route Pill */}
          <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.08] px-3 py-1 rounded-lg text-xs">
            <div className="flex items-center gap-1.5 text-slate-300 font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span className="max-w-[120px] truncate">{originName}</span>
            </div>
            <ArrowRight className="w-3 h-3 text-slate-500" />
            <div className="flex items-center gap-1.5 text-slate-300 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="max-w-[120px] truncate">{destName}</span>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="hidden md:flex items-center gap-1.5 text-[11px]">
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
        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-white/[0.04] p-0.5 rounded-lg border border-white/[0.08] text-xs font-mono">
            <button
              onClick={() => setSpeedMultiplier(1)}
              className={`px-2 py-0.5 rounded text-[10px] ${
                speedMultiplier === 1 ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              1x
            </button>
            <button
              onClick={() => setSpeedMultiplier(2)}
              className={`px-2 py-0.5 rounded text-[10px] ${
                speedMultiplier === 2 ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              2x
            </button>
          </div>

          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-medium text-slate-300 transition-colors"
          >
            <RotateCcw className="w-3 h-3 text-slate-400" />
            <span>Reset</span>
          </button>

          <button
            disabled={isRunning}
            onClick={runPipeline}
            className="flex items-center gap-1.5 px-3.5 py-1 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-bold text-white shadow-[0_0_15px_rgba(168,85,247,0.35)] transition-all active:scale-95 disabled:opacity-50"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>{isRunning ? 'Running...' : '▶ Run Agent Pipeline'}</span>
          </button>
        </div>
      </header>

      {/* Main Graph Canvas — Fits 100% in One Page (Zero Scrollbars) */}
      <main className="flex-1 relative overflow-hidden bg-[#07090E] flex items-center justify-center p-2 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px]">
        {/* Scaling Viewport to guarantee 100% fit on any screen */}
        <div className="relative w-[1260px] h-[520px] max-w-full max-h-full">
          {/* Animated SVG Connections */}
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

            {connections.map((conn, idx) => {
              const fromNode = nodes.find((n) => n.id === conn.from)!;
              const toNode = nodes.find((n) => n.id === conn.to)!;
              if (!fromNode || !toNode) return null;

              const cardWidth = 205;
              const cardHeight = 72;

              const startX = fromNode.x + cardWidth;
              const startY = fromNode.y + cardHeight / 2;
              const endX = toNode.x;
              const endY = toNode.y + cardHeight / 2;

              const deltaX = Math.abs(endX - startX) * 0.48;
              const pathD = `M ${startX} ${startY} C ${startX + deltaX} ${startY}, ${endX - deltaX} ${endY}, ${endX} ${endY}`;

              const isActive =
                (nodeStatuses[fromNode.id] === 'success' || nodeStatuses[fromNode.id] === 'running') &&
                (nodeStatuses[toNode.id] === 'running' || nodeStatuses[toNode.id] === 'success');

              return (
                <g key={`conn-${idx}`}>
                  <path
                    d={pathD}
                    fill="none"
                    stroke={isActive ? '#38BDF8' : '#1E293B'}
                    strokeWidth={isActive ? '2.5' : '1.2'}
                    strokeDasharray={isActive ? 'none' : '3 3'}
                    opacity={isActive ? 0.95 : 0.35}
                    className="transition-all duration-300"
                  />

                  {isActive && (
                    <circle r="4" fill="#A855F7" filter="url(#glow-wire)">
                      <animateMotion
                        path={pathD}
                        dur={`${1.2 / speedMultiplier}s`}
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Compact, Ultra-Clean Node Cards */}
          {nodes.map((node) => {
            const status = nodeStatuses[node.id] || 'idle';
            const isSelected = selectedNodeId === node.id;
            const Icon = node.icon;

            return (
              <motion.div
                key={node.id}
                onClick={() => setSelectedNodeId(node.id)}
                style={{ left: `${node.x}px`, top: `${node.y}px` }}
                className={`absolute w-[205px] h-[74px] rounded-xl border transition-all duration-200 cursor-pointer backdrop-blur-xl z-10 flex flex-col justify-between p-2.5 ${
                  isSelected
                    ? 'border-purple-400 bg-[#111622] ring-2 ring-purple-500/30 shadow-[0_6px_24px_rgba(168,85,247,0.25)] scale-[1.03]'
                    : 'border-white/[0.08] bg-[#0E131D]/95 hover:border-white/[0.2] hover:bg-[#131A28]'
                }`}
              >
                {/* Top Row: Icon + Title + Status */}
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div
                      className="w-5 h-5 rounded-md flex items-center justify-center text-white shrink-0 shadow-sm"
                      style={{ backgroundColor: node.color }}
                    >
                      <Icon className="w-3 h-3" />
                    </div>
                    <span className="font-bold text-[11px] text-white tracking-tight truncate">
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

                {/* Bottom Row: Description + Latency */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 gap-1 mt-1">
                  <span className="truncate flex-1 font-sans text-slate-300">
                    {node.description}
                  </span>
                  <span className="font-mono text-[9px] text-slate-500 shrink-0">
                    ~{node.executionTime}ms
                  </span>
                </div>

                {/* Left Input Port */}
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#07090E] border-2 border-slate-500" />
                {/* Right Output Port */}
                <div
                  className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#07090E] border-2"
                  style={{ borderColor: node.color }}
                />
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
};
