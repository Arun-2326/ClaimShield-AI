import React, { useState } from 'react';
import { Sliders, RefreshCw, ArrowRight, CheckCircle2, TrendingDown } from 'lucide-react';
import { predictClaim } from '../../api/client';

export default function WhatIfSimulator({ currentClaim, basePrediction }) {
  const [simClaim, setSimClaim] = useState({ ...currentClaim });
  const [simPrediction, setSimPrediction] = useState(null);
  const [simulating, setSimulating] = useState(false);

  // Sync if parent claim changes
  React.useEffect(() => {
    setSimClaim({ ...currentClaim });
    setSimPrediction(null);
  }, [currentClaim]);

  const handleSimToggle = (field) => {
    setSimClaim((prev) => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const runSimulation = async () => {
    setSimulating(true);
    try {
      // Do not save simulation to queue
      const res = await predictClaim(simClaim, false);
      setSimPrediction(res);
    } catch (err) {
      console.error(err);
    } finally {
      setSimulating(false);
    }
  };

  const riskDelta = simPrediction && basePrediction
    ? basePrediction.risk_score - simPrediction.risk_score
    : null;

  return (
    <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 shadow-xl space-y-4 animate-fade-in">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-sky-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Interactive "What-If" Counterfactual Remediation Simulator
          </h3>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">
          Simulate pre-submission fixes
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
        {/* Prior Auth Toggle */}
        <div
          onClick={() => handleSimToggle('prior_auth_flag')}
          className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 cursor-pointer select-none transition-all duration-200 group"
        >
          <span className="text-slate-300 font-medium group-hover:text-slate-100">
            Prior Auth Attached
          </span>
          <div
            className={`w-9 h-5 rounded-full transition-colors duration-300 p-0.5 relative ${
              simClaim.prior_auth_flag ? 'bg-sky-500 shadow-md shadow-sky-500/40' : 'bg-slate-800'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 transform ${
                simClaim.prior_auth_flag ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </div>
        </div>

        {/* Eligibility Verified Toggle */}
        <div
          onClick={() => handleSimToggle('eligibility_verified')}
          className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 cursor-pointer select-none transition-all duration-200 group"
        >
          <span className="text-slate-300 font-medium group-hover:text-slate-100">
            Active Coverage Verified
          </span>
          <div
            className={`w-9 h-5 rounded-full transition-colors duration-300 p-0.5 relative ${
              simClaim.eligibility_verified ? 'bg-emerald-500 shadow-md shadow-emerald-500/40' : 'bg-slate-800'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 transform ${
                simClaim.eligibility_verified ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </div>
        </div>

        {/* Documentation Complete Toggle */}
        <div
          onClick={() => handleSimToggle('documentation_complete')}
          className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 cursor-pointer select-none transition-all duration-200 group"
        >
          <span className="text-slate-300 font-medium group-hover:text-slate-100">
            Complete Clinical Documentation
          </span>
          <div
            className={`w-9 h-5 rounded-full transition-colors duration-300 p-0.5 relative ${
              simClaim.documentation_complete ? 'bg-indigo-500 shadow-md shadow-indigo-500/40' : 'bg-slate-800'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 transform ${
                simClaim.documentation_complete ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </div>
        </div>

        {/* Duplicate Candidate Toggle */}
        <div
          onClick={() => handleSimToggle('duplicate_candidate')}
          className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 cursor-pointer select-none transition-all duration-200 group"
        >
          <span className="text-slate-300 font-medium group-hover:text-slate-100">
            Duplicate Candidate Flag
          </span>
          <div
            className={`w-9 h-5 rounded-full transition-colors duration-300 p-0.5 relative ${
              simClaim.duplicate_candidate ? 'bg-rose-500 shadow-md shadow-rose-500/40' : 'bg-slate-800'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 transform ${
                simClaim.duplicate_candidate ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={runSimulation}
        disabled={simulating}
        className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-sky-300 hover:text-sky-200 font-bold text-xs border border-slate-700/80 hover:border-sky-500/50 flex items-center justify-center space-x-2 transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 shadow-md shadow-slate-950/50"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${simulating ? 'animate-spin' : ''}`} />
        <span>Recalculate Impact of Remediation</span>
      </button>

      {/* Comparison Delta Display */}
      {simPrediction && basePrediction && (
        <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs animate-scale-in">
          <div>
            <span className="text-slate-400 block text-[11px]">Before Remediation</span>
            <span className="font-mono font-bold text-slate-200 text-sm">
              {(basePrediction.risk_score * 100).toFixed(0)}% ({basePrediction.routing_decision})
            </span>
          </div>

          <ArrowRight className="w-4 h-4 text-sky-400 animate-pulse" />

          <div>
            <span className="text-slate-400 block text-[11px]">After Remediation</span>
            <span className="font-mono font-bold text-emerald-400 text-sm">
              {(simPrediction.risk_score * 100).toFixed(0)}% ({simPrediction.routing_decision})
            </span>
          </div>

          {riskDelta !== null && (
            <div className="text-right pl-2 border-l border-slate-800">
              <span className="text-slate-400 block text-[10px]">Net Risk Delta</span>
              <span className="font-mono font-bold text-emerald-400 flex items-center space-x-0.5">
                <TrendingDown className="w-3.5 h-3.5 inline" />
                <span>-{(riskDelta * 100).toFixed(0)}%</span>
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
