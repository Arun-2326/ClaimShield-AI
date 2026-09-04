import React, { useState } from 'react';
import { DollarSign, Clock, TrendingUp, ShieldCheck } from 'lucide-react';

export default function RoiCalculator() {
  const [monthlyVolume, setMonthlyVolume] = useState(12000);
  const [denialRatePct, setDenialRatePct] = useState(14);
  const [captureRatePct, setCaptureRatePct] = useState(60);
  const reworkCostPerClaim = 25.0; // Industry standard average
  const avgClaimDollar = 450.0;

  // Monthly Calculations
  const monthlyDenials = (monthlyVolume * denialRatePct) / 100;
  const monthlyPrevented = (monthlyDenials * captureRatePct) / 100;
  const annualPrevented = monthlyPrevented * 12;

  // Annual Financial Impact
  const annualReworkSavings = annualPrevented * reworkCostPerClaim;
  const annualAcceleratedCashFlow = annualPrevented * avgClaimDollar;
  const annualHoursSaved = (annualPrevented * 18) / 60; // 18 minutes average per denial appeal

  return (
    <div className="p-5 bg-slate-900/60 rounded-xl border border-slate-800 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-xs uppercase font-bold tracking-wider text-slate-200">
            Projected RCM Financial ROI Calculator
          </h3>
          <p className="text-[11px] text-slate-400">
            Illustrative projection model based on stated administrative assumptions
          </p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
          Illustrative Projection
        </span>
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div>
          <div className="flex justify-between mb-1 text-slate-300">
            <span>Monthly Claims</span>
            <span className="font-mono font-bold text-sky-400">{monthlyVolume.toLocaleString()}</span>
          </div>
          <input
            type="range"
            min="1000"
            max="50000"
            step="1000"
            value={monthlyVolume}
            onChange={(e) => setMonthlyVolume(parseInt(e.target.value, 10))}
            className="w-full accent-sky-500"
          />
        </div>

        <div>
          <div className="flex justify-between mb-1 text-slate-300">
            <span>Baseline Denial Rate</span>
            <span className="font-mono font-bold text-amber-400">{denialRatePct}%</span>
          </div>
          <input
            type="range"
            min="5"
            max="30"
            step="1"
            value={denialRatePct}
            onChange={(e) => setDenialRatePct(parseInt(e.target.value, 10))}
            className="w-full accent-amber-500"
          />
        </div>

        <div>
          <div className="flex justify-between mb-1 text-slate-300">
            <span>Preventable Capture Rate</span>
            <span className="font-mono font-bold text-emerald-400">{captureRatePct}%</span>
          </div>
          <input
            type="range"
            min="20"
            max="80"
            step="5"
            value={captureRatePct}
            onChange={(e) => setCaptureRatePct(parseInt(e.target.value, 10))}
            className="w-full accent-emerald-500"
          />
        </div>
      </div>

      {/* Output KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        {/* Rework Savings */}
        <div className="p-3.5 bg-slate-800/80 rounded-xl border border-emerald-500/30">
          <div className="flex items-center space-x-2 text-slate-400 text-xs mb-1">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Annual Rework Savings</span>
          </div>
          <div className="text-xl font-extrabold text-emerald-400 font-mono">
            ${Math.round(annualReworkSavings).toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            @ $25.00 avg admin cost / denial appeal
          </span>
        </div>

        {/* Accelerated Cash Flow */}
        <div className="p-3.5 bg-slate-800/80 rounded-xl border border-sky-500/30">
          <div className="flex items-center space-x-2 text-slate-400 text-xs mb-1">
            <TrendingUp className="w-4 h-4 text-sky-400" />
            <span>Accelerated Cash Flow</span>
          </div>
          <div className="text-xl font-extrabold text-sky-400 font-mono">
            ${Math.round(annualAcceleratedCashFlow).toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            ~32 days faster first-pass reimbursement
          </span>
        </div>

        {/* Biller Hours Saved */}
        <div className="p-3.5 bg-slate-800/80 rounded-xl border border-indigo-500/30">
          <div className="flex items-center space-x-2 text-slate-400 text-xs mb-1">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>Biller Hours Saved</span>
          </div>
          <div className="text-xl font-extrabold text-indigo-300 font-mono">
            {Math.round(annualHoursSaved).toLocaleString()} hrs
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Equivalent to ~{((annualHoursSaved / 2000)).toFixed(1)} full-time RCM specialists
          </span>
        </div>
      </div>
    </div>
  );
}
