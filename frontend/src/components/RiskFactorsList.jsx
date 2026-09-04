import React from 'react';
import { AlertCircle, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { formatPercentage } from '../utils/formatters';

export default function RiskFactorsList({ factors }) {
  if (!factors || factors.length === 0) return null;

  return (
    <div className="bg-slate-800/70 border border-slate-700/70 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
        <div className="flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 text-sky-400" />
          <h3 className="text-base font-black text-white uppercase tracking-wider">
            Top Risk Contributors & Billing Explanations
          </h3>
        </div>
        <span className="text-xs sm:text-sm font-semibold text-slate-300">Clinical & Billing Logic</span>
      </div>

      <div className="mt-4 space-y-3.5">
        {factors.map((factor, idx) => {
          const isRisk = factor.impact === 'increases_risk';
          const contribPercent = Math.min(100, Math.round((factor.contribution || 0.2) * 100));

          return (
            <div
              key={idx}
              className={`p-4 rounded-xl border transition-all ${
                isRisk
                  ? 'bg-slate-900/80 border-rose-500/20 hover:border-rose-500/40'
                  : 'bg-slate-900/80 border-emerald-500/20 hover:border-emerald-500/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-mono font-bold text-slate-400">#{idx + 1}</span>
                  <span className="text-base font-bold text-white">{factor.display_name}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs sm:text-sm font-bold border ${
                      isRisk
                        ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                        : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                    }`}
                  >
                    {isRisk ? (
                      <>
                        <TrendingUp className="w-3.5 h-3.5" />
                        Increases Risk (+{contribPercent}%)
                      </>
                    ) : (
                      <>
                        <TrendingDown className="w-3.5 h-3.5" />
                        Mitigates Risk (-{contribPercent}%)
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Contribution visual bar */}
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden my-2.5">
                <div
                  className={`h-full ${isRisk ? 'bg-rose-500' : 'bg-emerald-500'}`}
                  style={{ width: `${contribPercent}%` }}
                />
              </div>

              {/* Plain-language explanation */}
              <p className="text-sm text-slate-200 leading-relaxed font-normal">
                {factor.explanation}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
