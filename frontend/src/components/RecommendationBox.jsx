import React from 'react';
import { Lightbulb, ArrowRightCircle, CheckSquare } from 'lucide-react';

export default function RecommendationBox({ action, routingDecision }) {
  if (!action) return null;

  const isClean = routingDecision === "RELEASE";

  return (
    <div className={`rounded-2xl border p-6 shadow-xl transition-all ${
      isClean
        ? 'bg-emerald-950/20 border-emerald-500/30'
        : 'bg-gradient-to-br from-slate-800/90 to-sky-950/30 border-sky-500/30'
    }`}>
      <div className="flex items-center gap-3 pb-3 border-b border-slate-700/60">
        <div className={`p-2 rounded-xl ${isClean ? 'bg-emerald-500/20 text-emerald-300' : 'bg-sky-500/20 text-sky-300'}`}>
          {isClean ? <CheckSquare className="w-6 h-6" /> : <Lightbulb className="w-6 h-6" />}
        </div>
        <div>
          <h3 className="text-base font-black text-white uppercase tracking-wider">
            {isClean ? "Clearance Verdict" : "Recommended Corrective Action"}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 font-medium">Prescriptive RCM guidance before releasing claim</p>
        </div>
      </div>

      <div className="mt-4 flex items-start gap-3.5">
        <ArrowRightCircle className={`w-6 h-6 flex-shrink-0 mt-0.5 ${isClean ? 'text-emerald-400' : 'text-sky-400'}`} />
        <p className="text-base font-bold text-white leading-relaxed">
          {action}
        </p>
      </div>
    </div>
  );
}
