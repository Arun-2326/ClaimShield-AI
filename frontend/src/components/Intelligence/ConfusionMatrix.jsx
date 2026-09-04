import React from 'react';

export default function ConfusionMatrix({ matrix }) {
  if (!matrix) return null;

  const { true_negative, false_positive, false_negative, true_positive } = matrix;
  const total = true_negative + false_positive + false_negative + true_positive;

  return (
    <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Held-Out Test Confusion Matrix (N = {total})
        </h4>
        <span className="text-[11px] font-mono text-slate-400">
          Simulated Validation
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        {/* True Negative */}
        <div className="p-3 bg-slate-800/80 rounded-lg border border-emerald-500/30">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-[11px]">True Negative (Clean Paid)</span>
            <span className="font-mono font-bold text-emerald-400">{true_negative}</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            {((true_negative / total) * 100).toFixed(1)}% of validation set
          </span>
        </div>

        {/* False Positive */}
        <div className="p-3 bg-slate-800/80 rounded-lg border border-amber-500/30">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-[11px]">False Positive (Unneeded Hold)</span>
            <span className="font-mono font-bold text-amber-400">{false_positive}</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            {((false_positive / total) * 100).toFixed(1)}% of validation set
          </span>
        </div>

        {/* False Negative */}
        <div className="p-3 bg-slate-800/80 rounded-lg border border-rose-500/30">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-[11px]">False Negative (Missed Denial)</span>
            <span className="font-mono font-bold text-rose-400">{false_negative}</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            {((false_negative / total) * 100).toFixed(1)}% of validation set
          </span>
        </div>

        {/* True Positive */}
        <div className="p-3 bg-slate-800/80 rounded-lg border border-sky-500/30">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-[11px]">True Positive (Prevented Denial)</span>
            <span className="font-mono font-bold text-sky-400">{true_positive}</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            {((true_positive / total) * 100).toFixed(1)}% of validation set
          </span>
        </div>
      </div>
    </div>
  );
}
