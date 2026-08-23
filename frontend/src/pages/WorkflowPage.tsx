import React, { useState, useEffect } from 'react';
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
  Radio,
  FileCheck2,
  Terminal,
  Zap,
  Activity,
  ExternalLink,
  ArrowLeft,
  Sparkles,
  Info
} from 'lucide-react';

export type NodeStatus = 'idle' | 'running' | 'success' | 'error';

interface WorkflowNode {
  id: string;
  name: string;
  category: 'trigger' | 'ingestion' | 'ai_nlp' | 'math' | 'decision' | 'action';
  icon: React.ComponentType<{ className?: string }>;
  x: number;
  y: number;
  description: string;
  status: NodeStatus;
  executionTime?: number;
  inputs: Record<string, any>;
  outputs: Record<string, any>;
  logicInfo: string;
  color: string;
}

interface Connection {
  from: string;
  to: string;
  label?: string;
}

const INITIAL_NODES: WorkflowNode[] = [
  {
    id: 'node-trigger',
    name: '1. User Route Request',
    category: 'trigger',
    icon: Navigation,
    x: 40,
    y: 220,
    description: 'User enters Origin (Connaught Place) & Destination (Cyber City)',
    status: 'idle',
    executionTime: 5,
    inputs: {
      origin: { name: 'Connaught Place, Delhi', lat: 28.6315, lng: 77.2167 },
      destination: { name: 'Cyber City, Gurugram', lat: 28.4950, lng: 77.0895 },
      travelAt: '2026-08-24T03:30:00Z',
    },
    outputs: {
      status: 'dispatched',
      coordinates: '28.6315,77.2167 -> 28.4950,77.0895',
      timeSlot: 'Night (Risk Penalty Multiplier 1.4x)',
    },
    logicInfo: 'Triggers parallel OSRM route generation and spatial hazard query.',
    color: '#06B6D4',
  },
  {
    id: 'node-osrm',
    name: '2. OSRM Route Engine',
    category: 'math',
    icon: Layers,
    x: 320,
    y: 90,
    description: 'Calculates candidate road network polylines (Fast vs Alternate)',
    status: 'idle',
    executionTime: 42,
    inputs: {
      origin: [28.6315, 77.2167],
      destination: [28.4950, 77.0895],
      alternatives: true,
    },
    outputs: {
      routesFound: 2,
      routeA: { name: 'Direct Corridor (MG Road)', distanceKm: 24.2, durationMin: 28 },
      routeB: { name: 'Expressway Bypass (NH-48)', distanceKm: 25.8, durationMin: 32 },
    },
    logicInfo: 'Generates GeoJSON LineString coordinates for corridor risk evaluation.',
    color: '#3B82F6',
  },
  {
    id: 'node-ingestion',
    name: '3. Ingestion Agent',
    category: 'ingestion',
    icon: Shield,
    x: 320,
    y: 310,
    description: 'Cleans crowd reports, verifies NCR bounds & deduplicates within 300m',
    status: 'idle',
    executionTime: 18,
    inputs: {
      newReports: 4,
      ncrBounds: { minLat: 28.2, maxLat: 28.95, minLng: 76.7, maxLng: 77.55 },
      timeWindowHours: 6,
    },
    outputs: {
      validated: 3,
      droppedOutOfBounds: 1,
      duplicateMergedId: 'rep-8841-corroborated',
    },
    logicInfo: 'Rule-based spatial validation & Haversine distance deduplication.',
    color: '#10B981',
  },
  {
    id: 'node-news',
    name: '4. News Analysis Agent',
    category: 'ai_nlp',
    icon: Newspaper,
    x: 320,
    y: 510,
    description: 'GPT-4o-mini scans Delhi news feeds & extracts crime/hazard entities',
    status: 'idle',
    executionTime: 125,
    inputs: {
      sources: ['Delhi Police Scanners', 'NCR Traffic Alert Feed', 'TOI Crime Desk'],
      promptTemplate: 'Extract (type, severity, lat/lng, summary) from safety news',
    },
    outputs: {
      extractedIncidents: [
        { type: 'snatching', severity: 'high', location: 'Mahipalpur Underpass', confidence: 0.92 },
        { type: 'road_closure', severity: 'medium', location: 'DND Flyway Repair', confidence: 0.88 },
      ],
    },
    logicInfo: 'OpenAI GPT-4o-mini structured JSON extraction with deterministic rule fallbacks.',
    color: '#F59E0B',
  },
  {
    id: 'node-verification',
    name: '5. Verification Agent',
    category: 'ai_nlp',
    icon: FileCheck2,
    x: 620,
    y: 380,
    description: 'Corroboration NLP scoring (Auto-verifies if confidence >= 0.85)',
    status: 'idle',
    executionTime: 65,
    inputs: {
      candidateReports: 3,
      formula: 'Confidence = 0.70 * RuleSignals + 0.30 * LLMPlausibility',
    },
    outputs: {
      verified: 2,
      flaggedForAdmin: 1,
      topConfidenceScore: 0.91,
    },
    logicInfo: 'Evaluates witness keywords, corroborating nearby reports, and plausibility.',
    color: '#8B5CF6',
  },
  {
    id: 'node-orchestrator',
    name: '6. Orchestrator Agent',
    category: 'decision',
    icon: Cpu,
    x: 620,
    y: 200,
    description: 'Synchronizes verified reports + news into live Spatial Incident Radar',
    status: 'idle',
    executionTime: 24,
    inputs: {
      verifiedReports: 2,
      newsExtracted: 2,
      activeIncidentRadar: 32,
    },
    outputs: {
      updatedIncidentsTable: true,
      hotspotsIndexed: ['South Delhi Unlit Zone', 'Mahipalpur Junction'],
      spatialIndex: 'PostGIS R-Tree refreshed',
    },
    logicInfo: 'Coordinates data pipelines and commits verified incidents to PostgreSQL.',
    color: '#EC4899',
  },
  {
    id: 'node-risk-scoring',
    name: '7. Risk Scoring Agent',
    category: 'math',
    icon: Activity,
    x: 910,
    y: 110,
    description: 'Corridor spatial decay math scoring along candidate paths',
    status: 'idle',
    executionTime: 36,
    inputs: {
      routeA_Points: 142,
      routeB_Points: 168,
      decayRadiusMeters: 500,
      nightMultiplier: 1.4,
    },
    outputs: {
      routeA_SafetyScore: 38.4,
      routeA_RiskLevel: 'HIGH_RISK (3 critical incidents within 200m)',
      routeB_SafetyScore: 92.1,
      routeB_RiskLevel: 'SAFE (Well-lit, 0 active hazards)',
    },
    logicInfo: 'Iterates route waypoints, applies inverse-distance decay on active incidents.',
    color: '#EF4444',
  },
  {
    id: 'node-route-planning',
    name: '8. Route Planning Agent',
    category: 'decision',
    icon: Zap,
    x: 910,
    y: 310,
    description: 'Multi-objective composite optimizer: 50% Safety + 30% Time + 20% Distance',
    status: 'idle',
    executionTime: 28,
    inputs: {
      weights: { safety: 0.50, time: 0.30, distance: 0.20 },
      options: ['Route A (Fast)', 'Route B (Safe)'],
    },
    outputs: {
      recommendedRoute: 'Route B',
      compositeScoreA: 54.2,
      compositeScoreB: 84.6,
      tradeoff: '+4 mins (+14%) for +54% Safety Gain',
      recommendationReason: 'Bypasses high-theft corridor on MG Road at night',
    },
    logicInfo: 'Multi-attribute utility optimization prioritizing user personal safety.',
    color: '#10B981',
  },
  {
    id: 'node-alert',
    name: '9. Alert Agent (In-Transit)',
    category: 'action',
    icon: AlertTriangle,
    x: 1200,
    y: 200,
    description: 'Real-time 500m geofenced hazard monitor during active navigation',
    status: 'idle',
    executionTime: 15,
    inputs: {
      vehicleNavCoord: [28.5355, 77.1650],
      activeGeofenceRadius: '500m',
      routeId: 'route_rec_b88',
    },
    outputs: {
      hazardDetected: true,
      alertPushed: '⚠️ Road blockage 400m ahead on slip road',
      actionTriggered: '1-Click Dynamic Safe Reroute Prompt',
    },
    logicInfo: 'Continuous spatial proximity polling during turn-by-turn navigation.',
    color: '#F97316',
  },
];

const CONNECTIONS: Connection[] = [
  { from: 'node-trigger', to: 'node-osrm', label: 'Waypoints' },
  { from: 'node-trigger', to: 'node-ingestion', label: 'Query NCR' },
  { from: 'node-trigger', to: 'node-news', label: 'Fetch Intel' },
  { from: 'node-ingestion', to: 'node-verification', label: 'Clean Reports' },
  { from: 'node-news', to: 'node-orchestrator', label: 'Extracted News' },
  { from: 'node-verification', to: 'node-orchestrator', label: 'Verified Reports' },
  { from: 'node-osrm', to: 'node-risk-scoring', label: 'Route Polylines' },
  { from: 'node-orchestrator', to: 'node-risk-scoring', label: 'Live Incident DB' },
  { from: 'node-risk-scoring', to: 'node-route-planning', label: 'Safety Scores' },
  { from: 'node-osrm', to: 'node-route-planning', label: 'Time / Dist' },
  { from: 'node-route-planning', to: 'node-alert', label: 'Recommended Route' },
];

export const WorkflowPage: React.FC = () => {
  const [nodes, setNodes] = useState<WorkflowNode[]>(INITIAL_NODES);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('node-trigger');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);

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
    setNodes((prev) => prev.map((n) => ({ ...n, status: 'idle' })));
  };

  const runPipeline = async () => {
    handleReset();
    setIsRunning(true);

    for (let i = 0; i < executionSequence.length; i++) {
      const targetId = executionSequence[i];
      setSelectedNodeId(targetId);

      setNodes((prev) =>
        prev.map((n) => (n.id === targetId ? { ...n, status: 'running' } : n))
      );

      const delay = (750 / speedMultiplier);
      await new Promise((r) => setTimeout(r, delay));

      setNodes((prev) =>
        prev.map((n) => (n.id === targetId ? { ...n, status: 'success' } : n))
      );
    }

    setIsRunning(false);
  };

  return (
    <div className="w-screen h-screen bg-[#090d13] text-slate-200 flex flex-col overflow-hidden font-sans select-none">
      {/* Top Header Bar */}
      <header className="h-16 px-6 border-b border-border-subtle bg-[#161b22] flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-4">
          <a
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-100 hover:bg-surface-50 border border-border-muted text-xs font-medium text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400" />
            <span>Back to Map</span>
          </a>

          <div className="h-6 w-px bg-border-subtle" />

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-950/80 border border-purple-500/50 flex items-center justify-center text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.3)]">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-sm text-white tracking-tight">
                  SafeRoute AI — Agent Workflow Pipeline
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-950/80 text-purple-300 border border-purple-700">
                  n8n Architecture Simulator
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Live autonomous agent execution graph for Delhi NCR safety route calculation
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#0d1117] p-1 rounded-lg border border-border-subtle text-xs font-mono">
            <button
              onClick={() => setSpeedMultiplier(1)}
              className={`px-2.5 py-1 rounded ${
                speedMultiplier === 1 ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              1x Speed
            </button>
            <button
              onClick={() => setSpeedMultiplier(2)}
              className={`px-2.5 py-1 rounded ${
                speedMultiplier === 2 ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              2x Turbo
            </button>
          </div>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-100 hover:bg-surface-50 border border-border-muted text-xs font-medium text-slate-300 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset</span>
          </button>

          <button
            disabled={isRunning}
            onClick={runPipeline}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-bold text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all active:scale-95 disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isRunning ? 'Agents Executing...' : '▶ Run Agent Pipeline'}</span>
          </button>
        </div>
      </header>

      {/* Main Canvas & Inspector View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Canvas Area with n8n Grid */}
        <div className="flex-1 relative overflow-auto bg-[#090d13] p-8 bg-[radial-gradient(#1e293b_1.2px,transparent_1.2px)] [background-size:22px_22px]">
          {/* SVG Wires & Flowing Packets */}
          <svg className="absolute inset-0 w-[1500px] h-[720px] pointer-events-none z-0">
            <defs>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {CONNECTIONS.map((conn, idx) => {
              const fromNode = nodes.find((n) => n.id === conn.from)!;
              const toNode = nodes.find((n) => n.id === conn.to)!;
              if (!fromNode || !toNode) return null;

              const startX = fromNode.x + 230;
              const startY = fromNode.y + 45;
              const endX = toNode.x;
              const endY = toNode.y + 45;

              const deltaX = Math.abs(endX - startX) * 0.5;
              const pathD = `M ${startX} ${startY} C ${startX + deltaX} ${startY}, ${endX - deltaX} ${endY}, ${endX} ${endY}`;

              const isActive =
                (fromNode.status === 'success' || fromNode.status === 'running') &&
                (toNode.status === 'running' || toNode.status === 'success');

              return (
                <g key={`conn-${idx}`}>
                  {/* Base Wire */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={isActive ? '#38bdf8' : '#334155'}
                    strokeWidth={isActive ? '3' : '1.5'}
                    strokeDasharray={isActive ? 'none' : '4 4'}
                    opacity={isActive ? 0.95 : 0.35}
                    className="transition-all duration-300"
                  />

                  {/* Flowing Glowing Particle */}
                  {isActive && (
                    <circle r="5" fill="#a855f7" filter="url(#glow)">
                      <animateMotion
                        path={pathD}
                        dur={`${1.4 / speedMultiplier}s`}
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Nodes Container */}
          <div className="relative w-[1500px] h-[720px]">
            {nodes.map((node) => {
              const isSelected = node.id === selectedNodeId;
              const Icon = node.icon;

              return (
                <motion.div
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  style={{ left: `${node.x}px`, top: `${node.y}px` }}
                  className={`absolute w-56 rounded-xl border transition-all duration-200 cursor-pointer shadow-2xl z-10 ${
                    isSelected
                      ? 'border-purple-400 ring-2 ring-purple-500/40 bg-[#161b22] scale-105'
                      : 'border-border-muted bg-[#161b22]/90 hover:border-slate-500 hover:bg-[#1a202c]'
                  }`}
                >
                  {/* Node Header */}
                  <div
                    className="px-3 py-2 rounded-t-xl flex items-center justify-between border-b border-border-subtle"
                    style={{ backgroundColor: `${node.color}15` }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-white shrink-0"
                        style={{ backgroundColor: node.color }}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-xs text-white tracking-tight truncate">
                        {node.name}
                      </span>
                    </div>

                    {/* Status Pill */}
                    {node.status === 'running' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                    )}
                    {node.status === 'success' && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                    {node.status === 'idle' && (
                      <div className="w-2 h-2 rounded-full bg-slate-600" />
                    )}
                  </div>

                  {/* Node Body */}
                  <div className="p-3 text-[11px] text-slate-300">
                    <p className="line-clamp-2 leading-relaxed text-slate-400">
                      {node.description}
                    </p>

                    <div className="mt-2.5 pt-2 border-t border-border-subtle flex items-center justify-between font-mono text-[10px] text-slate-500">
                      <span>Latency: ~{node.executionTime}ms</span>
                      <span
                        className={`font-semibold uppercase ${
                          node.status === 'running'
                            ? 'text-amber-400'
                            : node.status === 'success'
                            ? 'text-emerald-400'
                            : 'text-slate-500'
                        }`}
                      >
                        {node.status}
                      </span>
                    </div>
                  </div>

                  {/* Input Port (Left) */}
                  <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#0d1117] border-2 border-slate-400" />

                  {/* Output Port (Right) */}
                  <div
                    className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#0d1117] border-2"
                    style={{ borderColor: node.color }}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right Inspector Drawer (n8n Node Inspector) */}
        <div className="w-96 border-l border-border-subtle bg-[#161b22] flex flex-col overflow-hidden shrink-0">
          <div className="p-4 border-b border-border-subtle bg-[#1c2128] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-purple-400" />
              <span className="font-bold text-xs uppercase tracking-wider text-slate-300 font-mono">
                Node Inspector
              </span>
            </div>
            <span
              className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase"
              style={{ backgroundColor: `${selectedNode.color}25`, color: selectedNode.color }}
            >
              {selectedNode.category}
            </span>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
            <div>
              <h3 className="text-sm font-bold text-white">{selectedNode.name}</h3>
              <p className="text-xs text-slate-400 mt-1">{selectedNode.description}</p>
            </div>

            {/* Core Logic / Prompt */}
            <div className="p-3 rounded-lg bg-[#0d1117] border border-border-subtle">
              <span className="text-[10px] font-mono uppercase text-purple-400 font-bold block mb-1">
                Core Logic & Agent Rules:
              </span>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">{selectedNode.logicInfo}</p>
            </div>

            {/* Inputs */}
            <div>
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                📥 Input Parameters
              </span>
              <pre className="p-3 rounded-lg bg-[#0d1117] border border-border-subtle text-[11px] font-mono text-emerald-300 overflow-x-auto">
                {JSON.stringify(selectedNode.inputs, null, 2)}
              </pre>
            </div>

            {/* Outputs */}
            <div>
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                📤 Output Payload
              </span>
              <pre className="p-3 rounded-lg bg-[#0d1117] border border-border-subtle text-[11px] font-mono text-blue-300 overflow-x-auto">
                {JSON.stringify(selectedNode.outputs, null, 2)}
              </pre>
            </div>
          </div>

          {/* Bottom Footer info */}
          <div className="p-3 border-t border-border-subtle bg-[#1c2128] flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Status: <b className="text-white">{selectedNode.status.toUpperCase()}</b></span>
            <span>Avg Latency: ~{selectedNode.executionTime}ms</span>
          </div>
        </div>
      </div>
    </div>
  );
};
