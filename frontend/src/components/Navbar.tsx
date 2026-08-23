import React from 'react';
import { Navigation, Radio, Newspaper, FileText, Cpu, AlertOctagon, PlusCircle, Shield, ExternalLink } from 'lucide-react';

export type ActiveTab = 'planner' | 'radar' | 'news' | 'reports' | 'admin';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenReport: () => void;
  onOpenSOS: () => void;
  backendOnline: boolean;
  incidentCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenReport,
  onOpenSOS,
  backendOnline,
  incidentCount,
}) => {
  return (
    <header className="h-14 border-b border-border-subtle bg-surface-300/95 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-40">
      {/* Brand & City Indicator */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-600/50 flex items-center justify-center text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-bold text-sm tracking-tight text-white font-sans">SafeRoute</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-surface-100 text-slate-400 border border-border-muted">
                AI
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block"></span>
              DELHI NCR PILOT
            </span>
          </div>
        </div>

        {/* Backend Connectivity Status */}
        <div className="hidden lg:flex items-center gap-1.5 ml-4 px-2 py-0.5 rounded-full bg-surface-200 border border-border-subtle text-[11px] font-mono text-slate-400">
          <span className={`w-1.5 h-1.5 rounded-full ${backendOnline ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          <span>{backendOnline ? 'API Connected' : 'Demo Mode (Seeded DB)'}</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex items-center gap-1 bg-surface-200/80 p-1 rounded-lg border border-border-subtle">
        <button
          onClick={() => setActiveTab('planner')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === 'planner'
              ? 'bg-surface-50 text-white shadow-sm border border-border-muted'
              : 'text-slate-400 hover:text-slate-200 hover:bg-surface-100'
            }`}
        >
          <Navigation className="w-3.5 h-3.5 text-emerald-400" />
          <span>Route Planner</span>
        </button>

        <button
          onClick={() => setActiveTab('radar')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === 'radar'
              ? 'bg-surface-50 text-white shadow-sm border border-border-muted'
              : 'text-slate-400 hover:text-slate-200 hover:bg-surface-100'
            }`}
        >
          <Radio className="w-3.5 h-3.5 text-blue-400" />
          <span>Live Radar</span>
          <span className="text-[10px] font-mono px-1 rounded bg-surface-300 text-slate-400">
            {incidentCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('news')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === 'news'
              ? 'bg-surface-50 text-white shadow-sm border border-border-muted'
              : 'text-slate-400 hover:text-slate-200 hover:bg-surface-100'
            }`}
        >
          <Newspaper className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">News Intel</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === 'reports'
              ? 'bg-surface-50 text-white shadow-sm border border-border-muted'
              : 'text-slate-400 hover:text-slate-200 hover:bg-surface-100'
            }`}
        >
          <FileText className="w-3.5 h-3.5 text-slate-300" />
          <span className="hidden sm:inline">Community</span>
        </button>

        <button
          onClick={() => setActiveTab('admin')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === 'admin'
              ? 'bg-surface-50 text-white shadow-sm border border-border-muted'
              : 'text-slate-400 hover:text-slate-200 hover:bg-surface-100'
            }`}
        >
          <Cpu className="w-3.5 h-3.5 text-purple-400" />
          <span>AI Ops & Admin</span>
        </button>
      </nav>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Mini n8n-style Workflow button that opens in new tab */}
        <a
          href="/workflow"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-950/80 hover:bg-purple-900 border border-purple-600/70 text-[11px] font-semibold text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.25)] transition-all hover:scale-105 active:scale-95"
          title="Open n8n-style agent workflow in a new tab"
        >
          <Cpu className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
          <span>n8n Workflow</span>
          <ExternalLink className="w-3 h-3 text-purple-400 opacity-70" />
        </a>

        <button
          onClick={onOpenReport}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface-100 hover:bg-surface-50 border border-border-muted text-xs font-medium text-slate-200 transition-colors"
        >
          <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span>Report Incident</span>
        </button>

        {/* SOS Emergency Simulator Button */}
        <button
          onClick={onOpenSOS}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-rose-950/80 hover:bg-rose-900 border border-rose-600/70 text-xs font-mono font-bold text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.3)] transition-all hover:scale-105 active:scale-95"
          title="Simulate Emergency SOS dispatch"
        >
          <AlertOctagon className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          <span>SOS SIM</span>
        </button>
      </div>
    </header>
  );
};
