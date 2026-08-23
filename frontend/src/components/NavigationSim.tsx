import React, { useState, useEffect } from 'react';
import { LatLng, RouteOption, Incident } from '../types';
import { haversineMeters } from '../lib/mockData';
import {
  Navigation,
  Play,
  Pause,
  RotateCcw,
  ShieldAlert,
  Zap,
  X,
  Compass,
  AlertOctagon,
  CheckCircle2,
} from 'lucide-react';

interface NavigationSimProps {
  route: RouteOption;
  incidents: Incident[];
  onUpdateNavPosition: (pos: LatLng | null) => void;
  onExitNavigation: () => void;
  onTriggerReroute: () => void;
  onOpenSOS: () => void;
}

export const NavigationSim: React.FC<NavigationSimProps> = ({
  route,
  incidents,
  onUpdateNavPosition,
  onExitNavigation,
  onTriggerReroute,
  onOpenSOS,
}) => {
  const coordinates = route.geometry.coordinates; // [lng, lat]
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [detectedAlert, setDetectedAlert] = useState<{
    incident: Incident;
    distanceMeters: number;
  } | null>(null);
  const [rerouted, setRerouted] = useState(false);

  const totalSteps = coordinates.length;
  const progressPercent = Math.min(100, Math.round((currentStep / (totalSteps - 1)) * 100));

  const currentLng = coordinates[currentStep]?.[0] ?? coordinates[0][0];
  const currentLat = coordinates[currentStep]?.[1] ?? coordinates[0][1];
  const currentPos: LatLng = { lat: currentLat, lng: currentLng };

  useEffect(() => {
    onUpdateNavPosition(currentPos);

    if (!isPlaying || currentStep >= totalSteps - 1) return;

    const intervalTime = Math.max(200, 1200 / speedMultiplier);
    const timer = setTimeout(() => {
      setCurrentStep((prev) => (prev + 1 < totalSteps ? prev + 1 : prev));
    }, intervalTime);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, speedMultiplier, totalSteps]);

  // Proximity scanner
  useEffect(() => {
    let nearestThreat: { incident: Incident; distanceMeters: number } | null = null;

    for (const inc of incidents) {
      if (inc.severity === 'critical' || inc.severity === 'high') {
        const dist = haversineMeters(currentPos, { lat: inc.latitude, lng: inc.longitude });
        if (dist <= 650) {
          if (!nearestThreat || dist < nearestThreat.distanceMeters) {
            nearestThreat = { incident: inc, distanceMeters: Math.round(dist) };
          }
        }
      }
    }

    if (nearestThreat && !rerouted) {
      setDetectedAlert(nearestThreat);
    }
  }, [currentStep, incidents, rerouted]);

  const handleReroute = () => {
    setRerouted(true);
    setDetectedAlert(null);
    onTriggerReroute();
  };

  const minutesRemaining = Math.max(
    1,
    Math.round(((1 - progressPercent / 100) * route.durationSeconds) / 60)
  );
  const kmRemaining = (
    ((1 - progressPercent / 100) * route.distanceMeters) /
    1000
  ).toFixed(1);

  return (
    <>
      {/* Top Google Maps Navigation Header */}
      <div className="bg-emerald-700 text-white p-4 rounded-2xl shadow-google border border-emerald-600 w-full max-w-sm sm:max-w-md animate-in slide-in-from-top-4 duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-800/80 flex items-center justify-center">
              <Navigation className="w-6 h-6 rotate-45" />
            </div>
            <div>
              <div className="text-sm font-bold leading-tight">
                {currentStep < totalSteps - 1 ? 'In 300m continue on corridor' : 'Arriving at destination'}
              </div>
              <div className="text-xs text-emerald-100 mt-0.5">
                {currentStep < totalSteps - 1
                  ? 'Safe monitored corridor · CCTV active'
                  : 'Trip complete'}
              </div>
            </div>
          </div>
          <button
            onClick={onExitNavigation}
            className="p-1.5 rounded-full hover:bg-emerald-800 text-emerald-100 hover:text-white transition-colors"
            title="Exit Navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Floating Bottom Card: ETA, Speed & Hazard Alerts */}
      <div className="bg-white rounded-2xl p-4 shadow-google border border-slate-200 w-full max-w-sm sm:max-w-md space-y-3">
        {/* Dynamic Hazard Detection Alert */}
        {detectedAlert && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-xs">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Hazard Detected ({detectedAlert.distanceMeters}m ahead)</span>
            </div>
            <p className="text-xs text-slate-700 leading-snug">
              {detectedAlert.incident.title}
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleReroute}
                className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm flex items-center justify-center gap-1"
              >
                <Zap className="w-3.5 h-3.5 fill-white" />
                <span>Reroute to Safe Corridor</span>
              </button>
              <button
                onClick={() => setDetectedAlert(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {rerouted && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Safely rerouted away from identified risk zone.</span>
          </div>
        )}

        {/* ETA & Metrics */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <div className="text-2xl font-bold text-slate-900">{minutesRemaining} min</div>
            <div className="text-xs text-slate-500 font-medium">
              {kmRemaining} km remaining · Safety score: {route.safety.score}/100
            </div>
          </div>
          <button
            onClick={onExitNavigation}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
          >
            End
          </button>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <span className="text-xs font-medium text-slate-600">
              {isPlaying ? 'Navigating...' : 'Paused'}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {[1, 2, 5].map((spd) => (
              <button
                key={`spd-${spd}`}
                onClick={() => setSpeedMultiplier(spd)}
                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  speedMultiplier === spd
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
