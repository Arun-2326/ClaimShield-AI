import React from 'react';
import { Lightbulb, ArrowRightCircle, CheckSquare } from 'lucide-react';

export default function RecommendationBox({ action, routingDecision }) {
  if (!action) return null;

  const isClean = routingDecision === "RELEASE";

  return (
    <div className={`rounded-2xl border p-5 shadow-xl transition-all ${
      isClean
        ? 'bg-emerald-950/20 border-emerald-500/30'
        : 'bg-gradient-to-br from-slate-800/90 to-sky-950/30 border-sky-500/30'
    }`}>
      <div className="flex items-center gap-2 pb-3 border-b border-slate-700/60">
        <div className={`p-1.5 rounded-lg ${isClean ? 'bg-emerald-500/20 text-emerald-300' : 'bg-sky-500/20 text-sky-300'}`}>
          {isClean ? <CheckSquare className="w-5 h-5" /> : <Lightbulb className="w-5 h-5" />}
        </div>
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            {isClean ? "Clearance Verdict" : "Recommended Corrective Action"}
          </h3>
          <p className="text-xs text-slate-400">Prescriptive RCM guidance before releasing claim</p>
        </div>
      </div>

      <div className="mt-3.5 flex items-start gap-3">
        <ArrowRightCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isClean ? 'text-emerald-400' : 'text-sky-400'}`} />
        <p className="text-sm text-slate-200 font-medium leading-relaxed">
          {action}
        </p>
      </div>
    </div>
  );
}
