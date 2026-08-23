import React from 'react';
import { Shield } from 'lucide-react';

interface NavbarProps {
  onLogoClick?: () => void;
  backendOnline?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onLogoClick }) => {
  return (
    <header className="h-14 border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-5 flex items-center justify-between sticky top-0 z-40 shadow-sm">
      {/* Only Logo as a Clickable Button */}
      <button
        onClick={onLogoClick || (() => window.location.href = '/')}
        className="flex items-center gap-2.5 group focus:outline-none transition-transform active:scale-95"
        title="SafeRoute AI - Return to Map"
      >
        <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm group-hover:bg-emerald-700 transition-colors">
          <Shield className="w-4 h-4" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="font-extrabold text-base tracking-tight text-slate-900 font-sans group-hover:text-emerald-700 transition-colors">
            SafeRoute
          </span>
          <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
            AI
          </span>
        </div>
      </button>

      {/* Subtle Live Badge */}
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-600">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="font-semibold text-slate-700">Delhi NCR Pilot</span>
      </div>
    </header>
  );
};
