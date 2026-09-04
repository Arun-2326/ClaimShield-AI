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
      {/* 1. Sub-Tab Switcher for Studio Views */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setStudioSubTab('scoring')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              studioSubTab === 'scoring'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pre-Submission Risk Scoring</span>
          </button>

          <button
            onClick={() => setStudioSubTab('edi')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              studioSubTab === 'edi'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>Interactive EDI 837P Inspector</span>
          </button>

          <button
            onClick={() => setStudioSubTab('scrub')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              studioSubTab === 'scrub'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Clearinghouse Rules Matrix</span>
          </button>
        </div>

        <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
          Active Encounter: <strong className="text-sky-400 font-bold">{claimData.claim_id}</strong>
        </span>
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
              <div className="p-12 bg-slate-900/60 rounded-xl border border-slate-800 flex flex-col items-center justify-center space-y-3 text-center">
                <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-semibold text-slate-200">
                  Running Pre-Submission Inference...
                </p>
                <p className="text-xs text-slate-400 max-w-xs">
                  Executing deterministic validation, feature transformation, and dual-stage denial scoring.
                </p>
              </div>
            )}

            {error && (
              <div className="p-5 bg-rose-950/40 rounded-xl border border-rose-500/50 space-y-3">
                <div className="flex items-center space-x-2 text-rose-300 font-bold text-sm">
                  <AlertCircle className="w-5 h-5" />
                  <span>Pre-Submission Analysis Error</span>
                </div>
                <p className="text-xs text-rose-200 leading-relaxed font-mono">
                  {error}
                </p>
                <button
                  onClick={handleSubmit}
                  className="px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
                >
                  Retry Analysis
                </button>
              </div>
            )}

            {!loading && !error && !prediction && (
              <div className="p-8 bg-slate-900/60 rounded-xl border border-slate-800 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                  <Shield className="w-6 h-6 text-sky-400" />
                </div>
                <h3 className="text-sm font-bold text-slate-200">
                  Ready for Pre-Submission Audit
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Select a preset scenario on the left or customize claim details, then click <strong>"Analyze Before Submission"</strong> to predict denial probability and recommended remedies.
                </p>
              </div>
            )}

            {!loading && !error && prediction && (
              <div className="space-y-4 animate-fade-in">
                {/* 1-Click Auto-Remediation Banner (If high/medium risk) */}
                {prediction.risk_score > 0.30 && (
                  <div className="p-3.5 bg-gradient-to-r from-sky-950/70 to-indigo-950/70 border border-sky-500/40 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-sky-300 flex items-center space-x-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        <span>1-Click Auto-Remediation Workflow</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">Instant Re-Score</span>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {!claimData.prior_auth_flag && (
                        <button
                          onClick={() => handle1ClickFix('ATTACH_AUTH', 'Obtain & Inject Prior Auth Number')}
                          disabled={remediating}
                          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow transition-all disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-sky-200" />
                          <span>Auto-Inject Prior Auth (Box 23)</span>
                        </button>
                      )}

                      {(!claimData.eligibility_verified || (claimData.days_since_eligibility_check ?? 0) > 45) && (
                        <button
                          onClick={() => handle1ClickFix('REFRESH_ELIGIBILITY', 'Re-verify 270/271 Real-Time Eligibility')}
                          disabled={remediating}
                          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold shadow transition-all disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                          <span>Execute 270/271 Re-Check</span>
                        </button>
                      )}

                      {claimData.duplicate_candidate && (
                        <button
                          onClick={() => handle1ClickFix('CLEAR_DUPLICATE', 'Suppress Duplicate Candidate Flag')}
                          disabled={remediating}
                          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-700 hover:bg-indigo-600 text-white text-xs font-semibold shadow transition-all disabled:opacity-50"
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
