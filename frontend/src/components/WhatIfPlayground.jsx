import React, { useState } from 'react';
import { Sliders, Zap, ArrowRight, CheckCircle2, ShieldCheck, DollarSign, X } from 'lucide-react';
import { api } from '../api/client';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import { ROUTING_CONFIG } from '../utils/constants';

export default function WhatIfPlayground({ claim, onApplyFix, onClose }) {
  const [modifiedClaim, setModifiedClaim] = useState({ ...claim });
  const [loading, setLoading] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);

  const handleToggle = (field) => {
    setModifiedClaim(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleRunSimulation = async () => {
    setLoading(true);
    try {
      const res = await api.simulateWhatIf(claim, modifiedClaim);
      setSimulationResult(res);
    } catch (err) {
      console.error("Simulation error:", err);
    } finally {
      setLoading(false);
    }
  };

  const origRouting = simulationResult ? ROUTING_CONFIG[simulationResult.original.routing_decision] : null;
  const modRouting = simulationResult ? ROUTING_CONFIG[simulationResult.modified.routing_decision] : null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-sky-500/40 rounded-2xl w-full max-w-4xl shadow-2xl p-6 relative my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              What-If Remediation Playground
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30 font-mono">
                Claim: {claim.claim_id}
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Simulate the immediate ROI and risk drop by testing pre-submission corrective actions
            </p>
          </div>
        </div>

        {/* Interactive Toggles & Controls */}
        <div className="mt-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-sky-400" />
            Remediation Controls (Test Proposed Fixes)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {/* Toggle Prior Auth */}
            <div
              onClick={() => handleToggle('prior_auth_flag')}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                modifiedClaim.prior_auth_flag
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-white'
                  : 'bg-slate-800/60 border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">Obtain Prior Auth</span>
                <input
                  type="checkbox"
                  checked={Boolean(modifiedClaim.prior_auth_flag)}
                  readOnly
                  className="rounded text-emerald-500 bg-slate-800 border-slate-600 pointer-events-none"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Simulates valid authorization number on file</p>
            </div>

            {/* Toggle Eligibility Verification */}
            <div
              onClick={() => {
                setModifiedClaim(prev => ({
                  ...prev,
                  eligibility_verified: true,
                  days_since_eligibility_check: 0
                }));
              }}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                modifiedClaim.eligibility_verified && modifiedClaim.days_since_eligibility_check === 0
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-white'
                  : 'bg-slate-800/60 border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">Re-run 270/271 Check</span>
                <input
                  type="checkbox"
                  checked={modifiedClaim.eligibility_verified && modifiedClaim.days_since_eligibility_check === 0}
                  readOnly
                  className="rounded text-emerald-500 bg-slate-800 border-slate-600 pointer-events-none"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Re-verifies active member coverage today (0 days)</p>
            </div>

            {/* Toggle Documentation Complete */}
            <div
              onClick={() => handleToggle('documentation_complete')}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                modifiedClaim.documentation_complete
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-white'
                  : 'bg-slate-800/60 border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">Attach Clinical Notes</span>
                <input
                  type="checkbox"
                  checked={Boolean(modifiedClaim.documentation_complete)}
                  readOnly
                  className="rounded text-emerald-500 bg-slate-800 border-slate-600 pointer-events-none"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Attaches signed operative & clinical notes</p>
            </div>

            {/* Toggle Timely Proof */}
            <div
              onClick={() => handleToggle('timely_filing_risk')}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                !modifiedClaim.timely_filing_risk
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-white'
                  : 'bg-slate-800/60 border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">Attach Timely Proof</span>
                <input
                  type="checkbox"
                  checked={!modifiedClaim.timely_filing_risk}
                  readOnly
                  className="rounded text-emerald-500 bg-slate-800 border-slate-600 pointer-events-none"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Provides proof of timely filing window compliance</p>
            </div>

            {/* Toggle Duplicate Conflict */}
            <div
              onClick={() => handleToggle('duplicate_candidate')}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                !modifiedClaim.duplicate_candidate
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-white'
                  : 'bg-slate-800/60 border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">Append Modifier -76</span>
                <input
                  type="checkbox"
                  checked={!modifiedClaim.duplicate_candidate}
                  readOnly
                  className="rounded text-emerald-500 bg-slate-800 border-slate-600 pointer-events-none"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Clarifies distinct repeat service vs duplicate</p>
            </div>

            {/* Run Action Button */}
            <div className="flex items-center justify-center p-2">
              <button
                type="button"
                onClick={handleRunSimulation}
                disabled={loading}
                className="w-full h-full min-h-[50px] flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-sky-500/25 transition"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-white" />
                    Calculate Risk Delta
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Simulation Output: Side-by-Side Comparison */}
        {simulationResult && (
          <div className="mt-6 pt-5 border-t border-slate-800 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Before */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-xs font-semibold text-slate-400 uppercase">Original Pre-Submission State</div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-black font-mono text-rose-400">
                    {formatPercentage(simulationResult.original.risk_score)}
                  </span>
                  <span className="text-xs text-slate-400">Denial Probability</span>
                </div>
                <div className="mt-2">
                  <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${origRouting?.badgeClass}`}>
                    {simulationResult.original.routing_decision}
                  </span>
                </div>
                {simulationResult.original.predicted_reason_code && (
                  <div className="mt-2 text-xs font-mono text-slate-400">
                    Flagged Code: <span className="text-rose-300 font-bold">{simulationResult.original.predicted_reason_code}</span>
                  </div>
                )}
              </div>

              {/* After (Remediated) */}
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/40 relative overflow-hidden">
                <div className="text-xs font-semibold text-emerald-400 uppercase">Remediated State (After Proposed Fix)</div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-black font-mono text-emerald-400">
                    {formatPercentage(simulationResult.modified.risk_score)}
                  </span>
                  <span className="text-xs text-emerald-300">Denial Probability</span>
                </div>
                <div className="mt-2">
                  <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${modRouting?.badgeClass}`}>
                    {simulationResult.modified.routing_decision}
                  </span>
                </div>
                <div className="mt-2 text-xs text-emerald-300 font-medium">
                  {simulationResult.modified.recommended_action}
                </div>
              </div>
            </div>

            {/* Impact Banner */}
            <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 to-sky-950/40 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Predicted Risk Reduction:</span>
                    <span className="text-emerald-400 font-mono font-black">
                      {(simulationResult.risk_score_diff * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5">
                    Protected Claim Value: <span className="font-bold text-emerald-400">{formatCurrency(simulationResult.dollars_protected)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  onApplyFix(modifiedClaim);
                  onClose();
                }}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/25 transition cursor-pointer"
              >
                Apply Fix to Active Claim
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
