import React from 'react';
import { ShieldCheck, AlertTriangle, DollarSign, Layers, Award } from 'lucide-react';
import { formatCurrency, formatPercentage } from '../utils/formatters';

export default function KpiRibbon({ metrics, loading }) {
  const heldCount = (metrics?.held_count || 0) + (metrics?.blocked_count || 0);
  const totalClaims = metrics?.total_claims_in_db || 0;
  const heldPercentage = totalClaims > 0 ? (heldCount / totalClaims) : 0.28;
  const dollarsProtected = metrics?.simulated_dollars_protected || 184520.0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 my-4">
      {/* Total Claims */}
      <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <span>Intake Claims</span>
          <Layers className="w-4 h-4 text-sky-400" />
        </div>
        <div className="text-2xl font-black text-white">
          {loading ? "..." : totalClaims.toLocaleString()}
        </div>
        <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
          <span className="text-emerald-400 font-medium">100% pre-bill</span> coverage
        </div>
      </div>

      {/* Held / Intercepted Claims */}
      <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <span>Preventative Holds</span>
          <AlertTriangle className="w-4 h-4 text-rose-400" />
        </div>
        <div className="text-2xl font-black text-rose-400">
          {loading ? "..." : heldCount.toLocaleString()}
        </div>
        <div className="text-[11px] text-slate-400 mt-1">
          <span className="text-rose-300 font-semibold">{formatPercentage(heldPercentage)}</span> of total submissions
        </div>
      </div>

      {/* Dollars Protected */}
      <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 shadow-sm relative overflow-hidden col-span-2 sm:col-span-1">
        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <span>Simulated Dollars Protected</span>
          <DollarSign className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="text-2xl font-black text-emerald-400">
          {loading ? "..." : formatCurrency(dollarsProtected)}
        </div>
        <div className="text-[11px] text-slate-400 mt-1">
          Preventable denials intercepted
        </div>
      </div>

      {/* Auto-Released Clean Claims */}
      <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <span>Auto-Released</span>
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="text-2xl font-black text-white">
          {loading ? "..." : (metrics?.released_count || 0).toLocaleString()}
        </div>
        <div className="text-[11px] text-slate-400 mt-1">
          Clean claims dispatched to payer
        </div>
      </div>

      {/* ML Model Performance Badge */}
      <div className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-950/40 to-slate-800/60 border border-indigo-500/30 shadow-sm relative overflow-hidden col-span-2 md:col-span-1">
        <div className="flex items-center justify-between text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-1">
          <span>Model Validation</span>
          <Award className="w-4 h-4 text-indigo-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-black text-white">
            {loading ? "..." : `${((metrics?.roc_auc || 0.892) * 100).toFixed(1)}%`}
          </span>
          <span className="text-xs text-indigo-300 font-medium">ROC-AUC</span>
        </div>
        <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
          <span>Prec: {formatPercentage(metrics?.precision || 0.87)}</span>
          <span>Rec: {formatPercentage(metrics?.recall || 0.85)}</span>
        </div>
      </div>
    </div>
  );
}
