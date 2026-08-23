import React, { useState } from 'react';
import { LatLng, RoutePlanResponse } from '../types';
import { GLOBAL_POPULAR_PLACES } from '../lib/mockData';
import { SafetyBadge } from './SafetyBadge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpDown,
  Play,
  ArrowRight,
  Crosshair,
} from 'lucide-react';

interface RoutePlannerProps {
  origin: LatLng | null;
  destination: LatLng | null;
  setOrigin: (pos: LatLng) => void;
  setDestination: (pos: LatLng) => void;
  routePlan: RoutePlanResponse | null;
  selectedRouteIndex: number;
  setSelectedRouteIndex: (idx: number) => void;
  onPlanRoute: () => void;
  loading: boolean;
  onStartNavigation: () => void;
  onLocateMe?: () => void;
}

export const RoutePlanner: React.FC<RoutePlannerProps> = ({
  origin,
  destination,
  setOrigin,
  setDestination,
  routePlan,
  selectedRouteIndex,
  setSelectedRouteIndex,
  onPlanRoute,
  loading,
  onStartNavigation,
  onLocateMe,
}) => {
  const [originSearch, setOriginSearch] = useState('');
  const [destSearch, setDestSearch] = useState('');
  const [isSearchingOrigin, setIsSearchingOrigin] = useState(false);
  const [isSearchingDest, setIsSearchingDest] = useState(false);

  const handleSwap = () => {
    if (origin && destination) {
      const temp = { ...origin };
      setOrigin({ ...destination });
      setDestination(temp);
    }
  };

  const getOriginLabel = () => {
    if (!origin) return '';
    const match = GLOBAL_POPULAR_PLACES.find(
      (p) => Math.abs(p.lat - origin.lat) < 0.005 && Math.abs(p.lng - origin.lng) < 0.005
    );
    return match ? match.name : `${origin.lat.toFixed(4)}, ${origin.lng.toFixed(4)}`;
  };

  const getDestLabel = () => {
    if (!destination) return '';
    const match = GLOBAL_POPULAR_PLACES.find(
      (p) => Math.abs(p.lat - destination.lat) < 0.005 && Math.abs(p.lng - destination.lng) < 0.005
    );
    return match ? match.name : `${destination.lat.toFixed(4)}, ${destination.lng.toFixed(4)}`;
  };

  const filterPlaces = (query: string) => {
    if (!query) return GLOBAL_POPULAR_PLACES.slice(0, 5);
    return GLOBAL_POPULAR_PLACES.filter(
      (p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.tag.toLowerCase().includes(query.toLowerCase())
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -18, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white rounded-2xl shadow-google border border-slate-200 w-full max-w-sm sm:max-w-md overflow-hidden"
    >
      {/* Search & Origin/Destination Inputs */}
      <div className="p-3.5 space-y-2.5">
        <div className="flex items-center gap-2">
          {/* Pins Track */}
          <div className="flex flex-col items-center gap-1 py-1">
            <div className="w-2.5 h-2.5 rounded-full border-2 border-blue-600 bg-white" />
            <div className="w-0.5 h-6 bg-slate-300 rounded-full" />
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
          </div>

          {/* Text Inputs with Auto-Suggest Dropdown */}
          <div className="flex-1 space-y-2 relative">
            {/* Origin Input */}
            <div className="relative">
              <input
                type="text"
                value={isSearchingOrigin ? originSearch : getOriginLabel()}
                onFocus={() => {
                  setIsSearchingOrigin(true);
                  setOriginSearch('');
                }}
                onBlur={() => setTimeout(() => setIsSearchingOrigin(false), 200)}
                onChange={(e) => setOriginSearch(e.target.value)}
                placeholder="Choose starting point..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 pr-8 truncate transition-all"
              />
              {onLocateMe && (
                <button
                  type="button"
                  onClick={onLocateMe}
                  className="absolute right-2 top-2 text-slate-400 hover:text-blue-600 transition-colors"
                  title="Your location"
                >
                  <Crosshair className="w-3.5 h-3.5" />
                </button>
              )}

              <AnimatePresence>
                {isSearchingOrigin && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.97 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-google z-50 max-h-48 overflow-y-auto py-1"
                  >
                    {filterPlaces(originSearch).map((p, i) => (
                      <motion.button
                        key={`orig-${p.name}`}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        onMouseDown={() => {
                          setOrigin({ lat: p.lat, lng: p.lng });
                          setIsSearchingOrigin(false);
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-xs flex items-center justify-between transition-colors"
                      >
                        <span className="font-medium text-slate-800">{p.name}</span>
                        <span className="text-[10px] text-slate-400">{p.tag}</span>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Destination Input */}
            <div className="relative">
              <input
                type="text"
                value={isSearchingDest ? destSearch : getDestLabel()}
                onFocus={() => {
                  setIsSearchingDest(true);
                  setDestSearch('');
                }}
                onBlur={() => setTimeout(() => setIsSearchingDest(false), 200)}
                onChange={(e) => setDestSearch(e.target.value)}
                placeholder="Choose destination..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 truncate transition-all"
              />

              <AnimatePresence>
                {isSearchingDest && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.97 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-google z-50 max-h-48 overflow-y-auto py-1"
                  >
                    {filterPlaces(destSearch).map((p, i) => (
                      <motion.button
                        key={`dest-${p.name}`}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        onMouseDown={() => {
                          setDestination({ lat: p.lat, lng: p.lng });
                          setIsSearchingDest(false);
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-xs flex items-center justify-between transition-colors"
                      >
                        <span className="font-medium text-slate-800">{p.name}</span>
                        <span className="text-[10px] text-slate-400">{p.tag}</span>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Swap Button */}
          <motion.button
            onClick={handleSwap}
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18 }}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            title="Swap"
          >
            <ArrowUpDown className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Action Button */}
        <motion.button
          onClick={onPlanRoute}
          disabled={loading || !origin || !destination}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 font-semibold text-xs text-white shadow-sm flex items-center justify-center gap-1.5 transition-colors"
        >
          {loading ? (
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              Calculating routes...
            </motion.span>
          ) : (
            <>
              <span>Get Directions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </motion.button>
      </div>

      {/* Suggested Routes List */}
      <AnimatePresence>
        {routePlan && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="border-t border-slate-100 p-3 space-y-2 bg-slate-50/50 max-h-[40vh] overflow-y-auto"
          >
            {routePlan.options.map((option, idx) => {
              const isSelected = selectedRouteIndex === option.routeIndex;
              const isRecommended = option.safety.score >= 75;
              const minutes = Math.round(option.durationSeconds / 60);
              const km = (option.distanceMeters / 1000).toFixed(1);

              return (
                <motion.div
                  key={`route-card-${idx}`}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.08, duration: 0.25, ease: 'easeOut' }}
                  onClick={() => setSelectedRouteIndex(option.routeIndex)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? isRecommended
                        ? 'bg-emerald-50/80 border-emerald-400 shadow-sm'
                        : 'bg-blue-50/80 border-blue-400 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base font-bold text-slate-900">{minutes} min</span>
                        <span className="text-xs text-slate-500">({km} km)</span>
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5">
                        {isRecommended ? 'Safe Corridor' : 'Direct Route'}
                      </div>
                    </div>
                    <SafetyBadge score={option.safety.score} size="sm" />
                  </div>
                </motion.div>
              );
            })}

            {/* Start Navigation */}
            <motion.button
              onClick={onStartNavigation}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.25 }}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition-colors mt-1"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Start Navigation</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
