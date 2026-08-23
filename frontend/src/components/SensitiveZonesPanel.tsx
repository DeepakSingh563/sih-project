import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  MapPin,
  Clock,
  ShieldAlert,
  Info,
  X,
  Navigation,
  ExternalLink
} from 'lucide-react';
import { LatLng } from '../types';

export interface SensitiveZone {
  id: string;
  name: string;
  location: string;
  riskLevel: 'CRITICAL' | 'HIGH';
  incidentCount: number;
  advisoryDays: number;
  instruction: string;
  timeWindow: string;
  coordinates: LatLng;
}

export const SENSITIVE_ZONES_DATA: SensitiveZone[] = [
  {
    id: 'sz-1',
    name: 'Kashmere Gate ISBT & Underpass',
    location: 'North Delhi Corridor',
    riskLevel: 'CRITICAL',
    incidentCount: 9,
    advisoryDays: 4,
    instruction: 'Avoid unlit underpass & rear service lanes. Multiple night robbery & snatching incidents reported.',
    timeWindow: 'Avoid 20:00 - 05:30',
    coordinates: { lat: 28.6675, lng: 77.2285 },
  },
  {
    id: 'sz-2',
    name: 'Seelampur - Jaffrabad Belt',
    location: 'North-East Delhi',
    riskLevel: 'HIGH',
    incidentCount: 7,
    advisoryDays: 3,
    instruction: 'Elevated tension & crowd advisory. Use GT Road arterial bypass instead of inner market streets.',
    timeWindow: 'Caution 18:00 - 06:00',
    coordinates: { lat: 28.6720, lng: 77.2750 },
  },
  {
    id: 'sz-3',
    name: 'Mukarba Chowk Outer Bypass',
    location: 'GT Karnal Road Junction',
    riskLevel: 'HIGH',
    incidentCount: 6,
    advisoryDays: 3,
    instruction: 'Frequent vehicle puncture scam & dark stretch. Stay strictly on elevated main carriageway.',
    timeWindow: 'Avoid Night Transit',
    coordinates: { lat: 28.7400, lng: 77.1500 },
  },
  {
    id: 'sz-4',
    name: 'Noida Sec 63 - Chhijarsi Border',
    location: 'Noida - Ghaziabad Border',
    riskLevel: 'HIGH',
    incidentCount: 5,
    advisoryDays: 2,
    instruction: 'Poor illumination & deserted service roads. Route via NH-24 / Delhi-Meerut Expressway.',
    timeWindow: 'Avoid 21:00 - 05:00',
    coordinates: { lat: 28.6290, lng: 77.3820 },
  },
];

interface SensitiveZonesPanelProps {
  onSelectZone?: (coords: LatLng) => void;
}

export const SensitiveZonesPanel: React.FC<SensitiveZonesPanelProps> = ({ onSelectZone }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [dismissed, setDismissed] = useState<boolean>(false);
  const [activeZoneId, setActiveZoneId] = useState<string | null>(null);

  if (dismissed) {
    return (
      <motion.button
        onClick={() => setDismissed(false)}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed top-18 right-4 z-30 flex items-center gap-2 px-3 py-2 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-xl border-2 border-white transition-all hover:scale-105"
        title="Show Critical Safety Advisory"
      >
        <AlertTriangle className="w-4 h-4 animate-bounce" />
        <span>4 Sensitive Zones</span>
      </motion.button>
    );
  }

  return (
    <motion.aside
      aria-label="Critical Safety Advisory"
      initial={{ opacity: 0, x: 20, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      className="fixed top-18 right-4 z-30 w-80 sm:w-88 rounded-2xl bg-white/95 backdrop-blur-xl border border-rose-200/90 shadow-[0_12px_36px_rgba(225,29,72,0.15)] overflow-hidden font-sans"
    >
      {/* Header */}
      <div className="p-3 bg-gradient-to-r from-rose-50 via-white to-amber-50 border-b border-rose-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-rose-600 flex items-center justify-center text-white shadow-sm shrink-0">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-extrabold text-xs text-rose-900 tracking-tight">
                Sensitive Threat Zones
              </span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-rose-600 text-white animate-pulse">
                ACTIVE
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium">
              Avoid transiting these corridors
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            title="Minimize to badge"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expandable Body */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="p-3 space-y-2.5 max-h-[360px] overflow-y-auto"
          >
            {/* Instruction Banner */}
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200/80 text-[11px] text-rose-900 leading-snug flex items-start gap-2">
              <Info className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <b className="font-bold">AI Advisory Directive:</b> Multiple crime & safety clusters detected. Please <b>avoid passing through these sectors for the next 2-4 days</b>.
              </div>
            </div>

            {/* List of High-Risk Zones */}
            <div className="space-y-2">
              {SENSITIVE_ZONES_DATA.map((zone) => {
                const isSelected = activeZoneId === zone.id;

                return (
                  <div
                    key={zone.id}
                    onClick={() => {
                      setActiveZoneId(zone.id);
                      if (onSelectZone) onSelectZone(zone.coordinates);
                    }}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-rose-50/90 border-rose-300 ring-2 ring-rose-400/20 shadow-sm'
                        : 'bg-white hover:bg-slate-50 border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    {/* Zone Title & Badge */}
                    <div className="flex items-center justify-between gap-1.5 mb-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0 animate-ping" />
                        <span className="font-bold text-xs text-slate-900 truncate">
                          {zone.name}
                        </span>
                      </div>
                      <span className="text-[9.5px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 shrink-0">
                        Avoid {zone.advisoryDays} Days
                      </span>
                    </div>

                    {/* Location & Time */}
                    <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono mb-1.5">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {zone.location}
                      </span>
                      <span className="flex items-center gap-1 text-rose-700 font-medium">
                        <Clock className="w-3 h-3" />
                        {zone.timeWindow}
                      </span>
                    </div>

                    {/* Specific Instruction */}
                    <p className="text-[11px] text-slate-600 leading-tight">
                      {zone.instruction}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Footer sync info */}
            <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>Updated: Orchestrator AI</span>
              <span className="text-emerald-600 font-semibold">● Realtime Sync</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
};
