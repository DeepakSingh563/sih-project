import React from 'react';
import { RiskLevel } from '../types';
import { ShieldCheck, ShieldAlert, AlertTriangle, ShieldX } from 'lucide-react';

interface SafetyBadgeProps {
  score: number;
  level?: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const SafetyBadge: React.FC<SafetyBadgeProps> = ({
  score,
  level,
  size = 'md',
  showLabel = true,
}) => {
  let colorClass = 'text-emerald-700 bg-emerald-50 border-emerald-200';
  let badgeLabel = 'Safe Route';
  let Icon = ShieldCheck;

  if (score >= 80) {
    colorClass = 'text-emerald-700 bg-emerald-50 border-emerald-200';
    badgeLabel = 'Safe Route';
    Icon = ShieldCheck;
  } else if (score >= 60) {
    colorClass = 'text-amber-800 bg-amber-50 border-amber-200';
    badgeLabel = 'Moderate Risk';
    Icon = ShieldAlert;
  } else if (score >= 40) {
    colorClass = 'text-orange-800 bg-orange-50 border-orange-200';
    badgeLabel = 'Elevated Risk';
    Icon = AlertTriangle;
  } else {
    colorClass = 'text-rose-700 bg-rose-50 border-rose-200';
    badgeLabel = 'High Risk';
    Icon = ShieldX;
  }

  if (size === 'sm') {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${colorClass}`}>
        <Icon className="w-3 h-3 shrink-0" />
        <span className="font-semibold">{score}</span>
        {showLabel && <span className="text-[11px] opacity-80">· {badgeLabel}</span>}
      </span>
    );
  }

  if (size === 'lg') {
    return (
      <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${colorClass}`}>
        <div className="p-2 rounded-lg bg-white shadow-sm border border-slate-100">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold tracking-tight">{score}</span>
            <span className="text-xs text-slate-500 font-medium">/ 100</span>
          </div>
          {showLabel && (
            <span className="text-xs font-semibold uppercase tracking-wider block opacity-90">
              {badgeLabel}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${colorClass}`}>
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span className="font-bold">{score}/100</span>
      {showLabel && <span className="opacity-90">{badgeLabel}</span>}
    </span>
  );
};
