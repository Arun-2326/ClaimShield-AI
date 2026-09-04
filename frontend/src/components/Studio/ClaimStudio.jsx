import React, { useState } from 'react';
import ClaimForm from './ClaimForm';
import RiskGauge from './RiskGauge';
import PredictionCard from './PredictionCard';
import RiskFactorsChart from './RiskFactorsChart';
import WhatIfSimulator from './WhatIfSimulator';
import EdiInspector from '../EDI/EdiInspector';
import RulesMatrix from '../Scrubber/RulesMatrix';
import { SAMPLE_PRESETS } from '../../data/samplePresets';
import { predictClaim, applyRemediation } from '../../api/client';
import { Shield, Sparkles, AlertCircle, FileCode2, CheckCircle2, Zap, ArrowRight, Layers, Sliders } from 'lucide-react';

export default function ClaimStudio({ payers, reference, onClaimAnalyzed, onToast }) {
  // Preset 1 (High Risk Auth) by default
  const [claimData, setClaimData] = useState(SAMPLE_PRESETS[0].data);
  const [loading, setLoading] = useState(false);
  const [remediating, setRemediating] = useState(false);
  const [error, setError] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [studioSubTab, setStudioSubTab] = useState('scoring'); // 'scoring' | 'edi' | 'scrub'

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await predictClaim(claimData, true);
      setPrediction(res);
      if (onClaimAnalyzed) onClaimAnalyzed(res);
      if (onToast) onToast(`Scored claim ${claimData.claim_id}: ${res.routing_decision}`, 'info');
    } catch (err) {
      setError(err.message || 'Failed to analyze claim.');
      if (onToast) onToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handle1ClickFix = async (actionType, label) => {
    setRemediating(true);
    try {
      const res = await applyRemediation(claimData, actionType, "AUTH9988210");
      setClaimData(res.remediated_claim);
      setPrediction(res.new_prediction);
      if (onToast) {
        onToast(
          `1-Click Fix Applied: ${label}! Risk dropped from ${(res.original_risk_score * 100).toFixed(0)}% to ${(res.remediated_risk_score * 100).toFixed(0)}% (${res.new_prediction.routing_decision})`,
          'success'
        );
      }
    } catch (err) {
      console.error(err);
      if (onToast) onToast('Failed to apply remediation', 'error');
    } finally {
      setRemediating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Visual Hierarchy Telemetry Bar */}
      <div className="flex flex-wrap items-center justify-between px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] font-mono">
        <div className="flex items-center space-x-3">
          <span className="text-slate-400 font-bold uppercase tracking-wider">Visual Hierarchy Matrix:</span>
          <span className="badge-major text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping inline-block" />
            ◈ Main Command Level: Neon Cyan
          </span>
          <span className="badge-sub text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block" />
            ◇ Sub-System Detail: Steel Amethyst
          </span>
        </div>
        <span className="text-[10px] text-slate-500 hidden md:inline">
          Active Encounter: <strong className="text-cyan-400">{claimData.claim_id}</strong>
        </span>
      </div>

      {/* 1. Sub-Tab Switcher for Studio Views */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800/80 pb-3 gap-3">
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setStudioSubTab('scoring')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              studioSubTab === 'scoring'
                ? 'hud-card-major text-cyan-300 shadow-cyan-500/20 animate-main-pulse'
                : 'hud-card-sub text-slate-400 hover:text-indigo-200'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${studioSubTab === 'scoring' ? 'text-cyan-400 animate-pulse' : 'text-slate-400'}`} />
            <span>Pre-Submission Risk Scoring</span>
            {studioSubTab === 'scoring' && (
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                ACTIVE
              </span>
            )}
          </button>

          <button
            onClick={() => setStudioSubTab('edi')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              studioSubTab === 'edi'
                ? 'hud-card-major text-cyan-300 shadow-cyan-500/20 animate-main-pulse'
                : 'hud-card-sub text-slate-400 hover:text-indigo-200'
            }`}
          >
            <FileCode2 className={`w-3.5 h-3.5 ${studioSubTab === 'edi' ? 'text-cyan-400 animate-pulse' : 'text-slate-400'}`} />
            <span>EDI 837P Inspector</span>
            {studioSubTab === 'edi' && (
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                ACTIVE
              </span>
            )}
          </button>

          <button
            onClick={() => setStudioSubTab('scrub')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              studioSubTab === 'scrub'
                ? 'hud-card-major text-cyan-300 shadow-cyan-500/20 animate-main-pulse'
                : 'hud-card-sub text-slate-400 hover:text-indigo-200'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${studioSubTab === 'scrub' ? 'text-cyan-400 animate-pulse' : 'text-slate-400'}`} />
            <span>Clearinghouse Rules Matrix</span>
            {studioSubTab === 'scrub' && (
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                ACTIVE
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 2. Primary Layout */}
      {studioSubTab === 'scoring' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form & Presets (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <ClaimForm
              claimData={claimData}
              setClaimData={setClaimData}
              onSubmit={handleSubmit}
              loading={loading}
              payers={payers}
              reference={reference}
            />
          </div>

          {/* Right Column: Dynamic Analysis Output (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            {loading && (
              <div className="hud-card-major p-12 rounded-2xl flex flex-col items-center justify-center space-y-3 text-center animate-main-glow">
                <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin shadow-lg shadow-cyan-400/30" />
                <p className="text-sm font-bold text-cyan-300 tracking-wide uppercase">
                  Running Neural Pre-Submission Inference...
                </p>
                <p className="text-xs text-slate-300 max-w-xs font-mono">
                  Executing deterministic scrubbing, feature extraction, and dual-stage denial scoring.
                </p>
                <span className="badge-major text-[9px] mt-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping inline-block" />
                  ANALYZING 12 FEATURE VECTORS
                </span>
              </div>
            )}

            {error && (
              <div className="hud-card-major p-5 rounded-2xl border-rose-500/60 bg-rose-950/40 space-y-3">
                <div className="flex items-center space-x-2 text-rose-300 font-bold text-sm">
                  <AlertCircle className="w-5 h-5 text-rose-400 animate-pulse" />
                  <span>Pre-Submission Analysis Exception</span>
                </div>
                <p className="text-xs text-rose-200 leading-relaxed font-mono">
                  {error}
                </p>
                <button
                  onClick={handleSubmit}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/30"
                >
                  Retry Analysis
                </button>
              </div>
            )}

            {!loading && !error && !prediction && (
              <div className="hud-card-major p-8 rounded-2xl text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400 shadow-lg shadow-cyan-500/20">
                  <Shield className="w-7 h-7 text-cyan-400 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <span className="badge-major text-[10px]">
                    ◈ Level 1: Executive Audit Ready
                  </span>
                  <h3 className="text-base font-bold text-slate-100 tracking-tight">
                    Awaiting Pre-Submission Claim Submission
                  </h3>
                </div>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Select a test scenario on the left or customize claim fields, then click <strong className="text-cyan-300">"Analyze Before Submission"</strong> to predict denial probability and execute remediation.
                </p>
              </div>
            )}

            {!loading && !error && prediction && (
              <div className="space-y-4 animate-fade-in">
                {/* 1-Click Auto-Remediation Banner (If high/medium risk) */}
                {prediction.risk_score > 0.30 && (
                  <div className="hud-card-major p-4 rounded-2xl border-amber-400/50 bg-gradient-to-r from-amber-950/40 via-cyan-950/30 to-slate-900/90 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-amber-300 flex items-center space-x-2">
                        <Zap className="w-4 h-4 text-amber-400 animate-bounce" />
                        <span className="tracking-wide uppercase">◈ Main Action: 1-Click Auto-Remediation Cockpit</span>
                      </span>
                      <span className="badge-major text-[9px] bg-amber-500/20 text-amber-300 border-amber-500/40">
                        INSTANT RE-SCORE
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {!claimData.prior_auth_flag && (
                        <button
                          onClick={() => handle1ClickFix('ATTACH_AUTH', 'Obtain & Inject Prior Auth Number')}
                          disabled={remediating}
                          className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/30 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-200" />
                          <span>Auto-Inject Prior Auth (Box 23)</span>
                        </button>
                      )}

                      {(!claimData.eligibility_verified || (claimData.days_since_eligibility_check ?? 0) > 45) && (
                        <button
                          onClick={() => handle1ClickFix('REFRESH_ELIGIBILITY', 'Re-verify 270/271 Real-Time Eligibility')}
                          disabled={remediating}
                          className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                          <span>Execute 270/271 Re-Check</span>
                        </button>
                      )}

                      {claimData.duplicate_candidate && (
                        <button
                          onClick={() => handle1ClickFix('CLEAR_DUPLICATE', 'Suppress Duplicate Candidate Flag')}
                          disabled={remediating}
                          className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-200" />
                          <span>Clear Duplicate ICN Flag</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Risk Gauge */}
                <RiskGauge
                  score={prediction.risk_score}
                  tier={prediction.risk_tier}
                  confidence={prediction.reason_confidence}
                />

                {/* Prediction & Routing Decision Card */}
                <PredictionCard prediction={prediction} />

                {/* Top Factors Chart */}
                <RiskFactorsChart factors={prediction.top_3_risk_factors} />

                {/* What-If Counterfactual Simulator */}
                <WhatIfSimulator
                  currentClaim={claimData}
                  basePrediction={prediction}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sub-Tab: EDI Inspector */}
      {studioSubTab === 'edi' && (
        <EdiInspector claimData={claimData} onToast={onToast} />
      )}

      {/* Sub-Tab: Clearinghouse Rules Matrix */}
      {studioSubTab === 'scrub' && (
        <RulesMatrix claimData={claimData} onToast={onToast} />
      )}
    </div>
  );
}
