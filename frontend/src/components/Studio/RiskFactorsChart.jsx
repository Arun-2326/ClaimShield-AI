import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function RiskFactorsChart({ factors = [] }) {
  if (!factors || factors.length === 0) {
    return (
      <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 text-center text-slate-400 text-xs">
        No major risk factors detected. Claim satisfies baseline clean claim rules.
      </div>
    );
  }

  return (
    <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-400">
          Top Risk Drivers (Feature Importance)
        </h3>
        <span className="text-[11px] text-slate-500 font-mono">
          Pre-Submission Impact
        </span>
      </div>

      <div className="space-y-3">
        {factors.map((item, idx) => {
          const isRisk = item.impact === 'increases_risk';
          const absVal = Math.min(Math.abs(item.contribution), 1.0);
          const barWidth = `${Math.round(absVal * 100)}%`;

          return (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1.5 truncate max-w-[80%]">
                  {isRisk ? (
                    <TrendingUp className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  )}
                  <span className="font-medium text-slate-200 truncate">
                    {item.display_name}
                  </span>
                </div>
                <span
                  className={`font-mono text-[11px] font-semibold ${
                    isRisk ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {item.contribution > 0 ? `+${(item.contribution * 100).toFixed(0)}%` : `${(item.contribution * 100).toFixed(0)}%`}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden flex">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    isRisk
                      ? 'bg-gradient-to-r from-rose-500 to-red-400'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  }`}
                  style={{ width: barWidth }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
