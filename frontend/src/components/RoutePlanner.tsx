import React, { useState, useEffect, useRef } from 'react';
import { LatLng, RoutePlanResponse } from '../types';
import { GLOBAL_POPULAR_PLACES, resolveDelhiLocation } from '../lib/mockData';
import { SafetyBadge } from './SafetyBadge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpDown,
  ArrowRight,
  Crosshair,
  MapPin,
  Search,
  Check,
  Sparkles
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
  onLocateMe,
}) => {
  const [originSearch, setOriginSearch] = useState<string>('');
  const [destSearch, setDestSearch] = useState<string>('');
  const [isSearchingOrigin, setIsSearchingOrigin] = useState<boolean>(false);
  const [isSearchingDest, setIsSearchingDest] = useState<boolean>(false);
  const [liveDestSuggestions, setLiveDestSuggestions] = useState<Array<{ name: string; tag: string; lat: number; lng: number }>>([]);
  const [liveOrigSuggestions, setLiveOrigSuggestions] = useState<Array<{ name: string; tag: string; lat: number; lng: number }>>([]);

  const debounceTimer = useRef<any>(null);

  // Live Delhi Geocoding search via Nominatim
  const searchDelhiLive = async (query: string, isOrigin: boolean) => {
    if (!query || query.trim().length < 2) {
      if (isOrigin) setLiveOrigSuggestions([]);
      else setLiveDestSuggestions([]);
      return;
    }

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query + ', Delhi, India'
      )}&viewbox=76.80,28.90,77.55,28.30&bounded=0&limit=6`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'en' }, signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const data = await res.json();
        const results = data.map((item: any) => ({
          name: item.display_name.split(',')[0],
          tag: item.display_name.split(',').slice(1, 3).join(', ').trim() || 'Delhi NCR',
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
        }));
        if (isOrigin) setLiveOrigSuggestions(results);
        else setLiveDestSuggestions(results);
      }
    } catch {
      // Fallback to local places
    }
  };

  const handleOriginChange = (val: string) => {
    setOriginSearch(val);
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => searchDelhiLive(val, true), 300);
  };

  const handleDestChange = (val: string) => {
    setDestSearch(val);
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => searchDelhiLive(val, false), 300);
  };

  const handleSwap = () => {
    if (origin && destination) {
      const temp = { ...origin };
      setOrigin({ ...destination });
      setDestination(temp);
      const tempSearch = originSearch || getOriginLabel();
      setOriginSearch(destSearch || getDestLabel());
      setDestSearch(tempSearch);
    }
  };

  const getOriginLabel = () => {
    if (originSearch) return originSearch;
    if (!origin) return '';
    if ((origin as any).name) return (origin as any).name;
    const match = GLOBAL_POPULAR_PLACES.find(
      (p) => Math.abs(p.lat - origin.lat) < 0.005 && Math.abs(p.lng - origin.lng) < 0.005
    );
    return match ? match.name : `${origin.lat.toFixed(4)}, ${origin.lng.toFixed(4)}`;
  };

  const getDestLabel = () => {
    if (destSearch) return destSearch;
    if (!destination) return '';
    if ((destination as any).name) return (destination as any).name;
    const match = GLOBAL_POPULAR_PLACES.find(
      (p) => Math.abs(p.lat - destination.lat) < 0.005 && Math.abs(p.lng - destination.lng) < 0.005
    );
    return match ? match.name : `${destination.lat.toFixed(4)}, ${destination.lng.toFixed(4)}`;
  };

  const filterLocalPlaces = (query: string) => {
    if (!query) return GLOBAL_POPULAR_PLACES.slice(0, 6);
    return GLOBAL_POPULAR_PLACES.filter(
      (p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.tag.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 6);
  };

  const executePlan = () => {
    let activeOrig = origin;
    let activeDest = destination;

    if (originSearch.trim()) {
      const res = resolveDelhiLocation(originSearch);
      activeOrig = { lat: res.lat, lng: res.lng, name: res.name } as any;
      setOrigin(activeOrig!);
    }
    if (destSearch.trim()) {
      const res = resolveDelhiLocation(destSearch);
      activeDest = { lat: res.lat, lng: res.lng, name: res.name } as any;
      setDestination(activeDest!);
    }
    setIsSearchingOrigin(false);
    setIsSearchingDest(false);
    onPlanRoute();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -18, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white rounded-2xl shadow-google border border-slate-200 w-full max-w-sm sm:max-w-md overflow-hidden font-sans"
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
                  if (!originSearch && origin) setOriginSearch(getOriginLabel());
                }}
                onBlur={() => setTimeout(() => setIsSearchingOrigin(false), 250)}
                onChange={(e) => handleOriginChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') executePlan();
                }}
                placeholder="Starting location in Delhi NCR..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 pr-8 truncate transition-all"
              />
              {onLocateMe && (
                <button
                  type="button"
                  onClick={onLocateMe}
                  className="absolute right-2 top-2 text-slate-400 hover:text-blue-600 transition-colors"
                  title="Use My Current GPS Location"
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
                    className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-google z-50 max-h-52 overflow-y-auto py-1"
                  >
                    {/* Combined Suggestions */}
                    {[...liveOrigSuggestions, ...filterLocalPlaces(originSearch)].slice(0, 7).map((p, i) => (
                      <button
                        key={`orig-${p.name}-${i}`}
                        type="button"
                        onMouseDown={() => {
                          setOrigin({ lat: p.lat, lng: p.lng, name: p.name } as any);
                          setOriginSearch(p.name);
                          setIsSearchingOrigin(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-slate-50 text-xs flex items-center justify-between transition-colors border-b border-slate-50 last:border-none"
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
                          <span className="font-semibold text-slate-800 truncate">{p.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">{p.tag}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Destination Input (Any location in Delhi NCR) */}
            <div className="relative">
              <input
                type="text"
                value={isSearchingDest ? destSearch : getDestLabel()}
                onFocus={() => {
                  setIsSearchingDest(true);
                  if (!destSearch && destination) setDestSearch(getDestLabel());
                }}
                onBlur={() => setTimeout(() => setIsSearchingDest(false), 250)}
                onChange={(e) => handleDestChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') executePlan();
                }}
                placeholder="Type ANY destination in Delhi (e.g. Rohini, Saket, Hauz Khas)..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 truncate transition-all"
              />

              <AnimatePresence>
                {isSearchingDest && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.97 }}
                    className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-google z-50 max-h-52 overflow-y-auto py-1"
                  >
                    {[...liveDestSuggestions, ...filterLocalPlaces(destSearch)].slice(0, 7).map((p, i) => (
                      <button
                        key={`dest-${p.name}-${i}`}
                        type="button"
                        onMouseDown={() => {
                          setDestination({ lat: p.lat, lng: p.lng, name: p.name } as any);
                          setDestSearch(p.name);
                          setIsSearchingDest(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-slate-50 text-xs flex items-center justify-between transition-colors border-b border-slate-50 last:border-none"
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                          <span className="font-semibold text-slate-800 truncate">{p.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">{p.tag}</span>
                      </button>
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
            title="Swap Origin & Destination"
          >
            <ArrowUpDown className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Action Button */}
        <motion.button
          onClick={executePlan}
          disabled={loading || (!origin && !originSearch.trim()) || (!destination && !destSearch.trim())}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 font-semibold text-xs text-white shadow-sm flex items-center justify-center gap-1.5 transition-colors"
        >
          {loading ? (
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              Calculating safest corridors...
            </motion.span>
          ) : (
            <>
              <span>Get Directions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </motion.button>
      </div>

      {/* Suggested Routes List & AI Recommendation Banner */}
      <AnimatePresence>
        {routePlan && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.25 }}
            className="border-t border-slate-200 bg-slate-50/70 p-3.5 space-y-3 max-h-[52vh] overflow-y-auto"
          >
            {/* AI Top Recommendation Summary Banner */}
            <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/90 shadow-sm">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-900 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>AI Recommendation: {routePlan.tradeoff || 'Optimal Safe Route'}</span>
              </div>
              <p className="text-[11px] text-emerald-800/90 leading-snug">
                {routePlan.reason || 'Safest corridor with high nighttime visibility, CCTV and verified PCR checkpoints.'}
              </p>
            </div>

            {/* Candidate Corridors List Header */}
            <div className="flex items-center justify-between pt-0.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                {routePlan.options.length} Evaluated Corridors
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Click any path to select on map
              </span>
            </div>

            {/* Route Cards */}
            <div className="space-y-2">
              {routePlan.options.map((opt, idx) => {
                const isSelected = selectedRouteIndex === opt.routeIndex;
                const isRecommended = idx === routePlan.recommendedIndex;
                const distKm = (opt.distanceMeters / 1000).toFixed(1);
                const durMin = Math.round(opt.durationSeconds / 60);

                return (
                  <motion.div
                    key={`route-opt-${opt.routeIndex}`}
                    onClick={() => setSelectedRouteIndex(opt.routeIndex)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                        : 'bg-white/90 border-slate-200 hover:border-slate-300 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'}`}>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <span className="font-bold text-xs text-slate-900 truncate">
                            {opt.name || `Route ${idx + 1}`}
                          </span>
                          {isRecommended && (
                            <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 text-[9.5px] font-extrabold font-mono shrink-0">
                              RECOMMENDED
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-600 font-mono">
                          <span className="font-extrabold text-slate-900 text-sm">{durMin} min</span>
                          <span>{distKm} km</span>
                        </div>

                        {/* POI indicators if available */}
                        {opt.pois && opt.pois.length > 0 && (
                          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500">
                            <span className="flex items-center gap-1 font-medium text-slate-600">
                              <span>⛽ Fuel</span>
                              <span>•</span>
                              <span>🏥 Hospital</span>
                              {opt.pois.some((p) => p.type === 'toll_plaza') && (
                                <>
                                  <span>•</span>
                                  <span>🛑 Toll</span>
                                </>
                              )}
                              <span>•</span>
                              <span>🚓 Police</span>
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="shrink-0 mt-0.5">
                        <SafetyBadge score={opt.safety.score} level={opt.safety.level} />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
