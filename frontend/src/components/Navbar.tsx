import React from 'react';
import { Shield, Sparkles, Plus, Newspaper, AlertOctagon } from 'lucide-react';

interface NavbarProps {
  onOpenWorkflow?: () => void;
  onOpenReport: () => void;
  onOpenNews: () => void;
  onOpenSOS?: () => void;
  onLogoClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenReport,
  onOpenNews,
  onOpenSOS,
  onLogoClick,
}) => {
  return (
    <header className="h-14 border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 shadow-sm">
      {/* Brand Logo Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={onLogoClick || (() => (window.location.href = '/'))}
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

        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-mono text-slate-600">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Delhi NCR Pilot</span>
        </div>
      </div>

      {/* Clean Icon-Only Action Buttons (No Text / Logos Only) */}
      <div className="flex items-center gap-2">
        {/* 1. n8n Workflow Logo Button (Native Anchor Link: Immune to popup blockers & 404s) */}
        <a
          href="?page=workflow"
          target="_blank"
          rel="noopener noreferrer"
          className="w-9 h-9 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 shadow-sm flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
          title="Open n8n Agent Workflow (New Tab)"
          aria-label="n8n Agent Workflow"
        >
          <Sparkles className="w-4 h-4 text-purple-600" />
        </a>

        {/* 2. Report Hazard Logo Button */}
        <button
          onClick={onOpenReport}
          className="w-9 h-9 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 shadow-sm flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          title="Report Hazard / Incident"
          aria-label="Report Hazard"
        >
          <Plus className="w-4 h-4 text-blue-600" />
        </button>

        {/* 3. Crime & Safety News Logo Button */}
        <button
          onClick={onOpenNews}
          className="w-9 h-9 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 shadow-sm flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          title="Crime & Safety News Feed"
          aria-label="Crime News"
        >
          <Newspaper className="w-4 h-4 text-amber-600" />
        </button>

        {/* 4. SOS Emergency Logo Button */}
        {onOpenSOS && (
          <button
            onClick={onOpenSOS}
            className="w-9 h-9 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 shadow-sm flex items-center justify-center transition-all hover:scale-105 active:scale-95"
            title="Emergency SOS Simulator"
            aria-label="Emergency SOS"
          >
            <AlertOctagon className="w-4 h-4 text-rose-600 animate-pulse" />
          </button>
        )}
      </div>
    </header>
  );
};
