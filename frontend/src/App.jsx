import React, { useState, useEffect } from 'react';
import { FileSearch, Play, Sparkles, ShieldCheck } from 'lucide-react';
import Navbar from './components/Navbar';
import KpiRibbon from './components/KpiRibbon';
import ClaimInspector from './components/ClaimInspector';
import PredictionCard from './components/PredictionCard';
import RiskFactorsList from './components/RiskFactorsList';
import RecommendationBox from './components/RecommendationBox';
import WhatIfPlayground from './components/WhatIfPlayground';
import ClaimQueue from './components/ClaimQueue';
import ModelAnalyticsModal from './components/ModelAnalyticsModal';
import BatchUploadModal from './components/BatchUploadModal';
import { DEMO_PRESETS, BLANK_CLAIM } from './utils/constants';
import api from './api/client';

export default function App() {
  const [activeTab, setActiveTab] = useState('inspector');
  const [currentClaim, setCurrentClaim] = useState({ ...BLANK_CLAIM });
  const [currentPrediction, setCurrentPrediction] = useState(null);
  const [claimsQueue, setClaimsQueue] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [health, setHealth] = useState(null);

  const [loading, setLoading] = useState(false);
  const [queueLoading, setQueueLoading] = useState(false);

  // Modals
  const [isWhatIfOpen, setIsWhatIfOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Initial load - loads metrics and queue without auto-triggering prediction to maintain empty dashboard state
  useEffect(() => {
    loadSystemHealth();
    loadMetrics();
    loadClaims();
  }, []);

  const loadSystemHealth = async () => {
    try {
      const data = await api.getHealth();
      setHealth(data);
    } catch (err) {
      console.warn("Backend health check failed:", err);
    }
  };

  const loadMetrics = async () => {
    try {
      const data = await api.getMetrics();
      setMetrics(data);
    } catch (err) {
      console.warn("Could not load metrics:", err);
    }
  };

  const loadClaims = async () => {
    setQueueLoading(true);
    try {
      const data = await api.getClaimsQueue({ limit: 100 });
      setClaimsQueue(data.items || []);
    } catch (err) {
      console.warn("Could not load claims queue:", err);
    } finally {
      setQueueLoading(false);
    }
  };

  const handleAnalyze = async (claimToAnalyze) => {
    setLoading(true);
    try {
      const pred = await api.predictClaim(claimToAnalyze);
      setCurrentPrediction(pred);
      // Reload queue & metrics to reflect newly scored claim
      loadMetrics();
      loadClaims();
    } catch (err) {
      console.error("Prediction failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFromQueue = (claim) => {
    setCurrentClaim({
      claim_id: claim.claim_id,
      patient_id: claim.patient_id,
      payer_id: claim.payer_id,
      cpt_codes: claim.cpt_codes,
      icd_codes: claim.icd_codes,
      claim_amount: claim.claim_amount,
      service_date: claim.service_date,
      submission_date: claim.submission_date,
      prior_auth_flag: claim.prior_auth_flag,
      eligibility_verified: claim.eligibility_verified,
      days_since_eligibility_check: claim.days_since_eligibility_check,
      provider_specialty: claim.provider_specialty,
      documentation_complete: claim.documentation_complete ?? true,
      duplicate_candidate: claim.duplicate_candidate ?? false,
      timely_filing_risk: claim.timely_filing_risk ?? false
    });
    setActiveTab('inspector');
    handleAnalyze(claim);
  };

  const handleApplyFix = (fixedClaim) => {
    setCurrentClaim(fixedClaim);
    handleAnalyze(fixedClaim);
  };

  const handleReset = () => {
    setCurrentPrediction(null);
    setCurrentClaim({ ...BLANK_CLAIM });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        health={health}
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
        onOpenUpload={() => setIsUploadOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* KPI Ribbon */}
        <KpiRibbon metrics={metrics} loading={!metrics} />

        {/* Tab 1: Live Claim Inspector */}
        {activeTab === 'inspector' && (
          <div className="space-y-5 animate-fadeIn">
            {/* Top: Intake Form & Preset Picker */}
            <ClaimInspector
              onAnalyze={handleAnalyze}
              onReset={handleReset}
              loading={loading}
              currentClaim={currentClaim}
              setCurrentClaim={setCurrentClaim}
            />

            {/* Loading State during analysis */}
            {loading && (
              <div
                role="status"
                data-testid="analysis-loading-state"
                className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-12 text-center shadow-lg animate-pulse"
              >
                <div className="w-10 h-10 border-3 border-sky-500/30 border-t-sky-400 rounded-full animate-spin mx-auto mb-3" />
                <h3 className="text-base font-bold text-white">Analyzing Pre-Submission Claim...</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Evaluating deterministic rules, calculating dual-stage denial risk, and mapping CARC root causes
                </p>
              </div>
            )}

            {/* Empty Dashboard State (Shown before any claim is analyzed) */}
            {!currentPrediction && !loading && (
              <div
                role="region"
                aria-label="Empty Dashboard State"
                data-testid="empty-dashboard-state"
                className="bg-slate-800/40 border-2 border-slate-700/50 border-dashed rounded-2xl p-10 text-center shadow-lg animate-fadeIn"
              >
                <div className="max-w-lg mx-auto space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center mx-auto text-sky-400 shadow-inner">
                    <FileSearch className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Empty Dashboard State — Ready for Claim Analysis
                    </h3>
                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                      The dashboard presents a clean, empty state ready for submission analysis.
                      Select one of the 1-click presets above or enter custom claim parameters, then click{' '}
                      <strong className="text-sky-300">Start New Claim Analysis</strong>.
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      data-testid="start-analysis-btn"
                      onClick={() => {
                        const claimToAnalyze = (currentClaim.claim_id && currentClaim.cpt_codes && currentClaim.cpt_codes.length > 0)
                          ? currentClaim
                          : { ...DEMO_PRESETS[0].data };
                        if (!currentClaim.claim_id) {
                          setCurrentClaim(claimToAnalyze);
                        }
                        handleAnalyze(claimToAnalyze);
                      }}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-sky-500/30 transition-all cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      Start New Claim Analysis
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-800 text-[11px] text-slate-400">
                    <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-800/80">
                      <span className="block font-semibold text-sky-300">Deterministic</span>
                      <span>Hard check guardrails</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-800/80">
                      <span className="block font-semibold text-indigo-300">Dual-Stage ML</span>
                      <span>Calibrated risk score</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-800/80">
                      <span className="block font-semibold text-amber-300">CARC Attribution</span>
                      <span>Root cause explanation</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom: Prediction, Explanations, and Recommendation */}
            {currentPrediction && !loading && (
              <div className="space-y-5">
                {/* Disposition & Risk Gauge Card */}
                <PredictionCard
                  prediction={currentPrediction}
                  onOpenWhatIf={() => setIsWhatIfOpen(true)}
                />

                {/* 2-Column Grid: Billing Risk Factors & Prescriptive Recommendations */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <RiskFactorsList factors={currentPrediction.top_3_risk_factors} />
                  <RecommendationBox
                    action={currentPrediction.recommended_action}
                    routingDecision={currentPrediction.routing_decision}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Claims Queue */}
        {activeTab === 'queue' && (
          <div className="animate-fadeIn">
            <ClaimQueue
              claims={claimsQueue}
              loading={queueLoading}
              onSelectClaim={handleSelectFromQueue}
              onRefresh={loadClaims}
            />
          </div>
        )}

        {/* Tab 3: Model Analytics (Direct Tab or Modal) */}
        {activeTab === 'analytics' && (
          <div className="animate-fadeIn">
            <ModelAnalyticsModal
              metrics={metrics}
              onClose={() => setActiveTab('inspector')}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span className="font-bold text-slate-300">ClaimShield AI</span> — Pre-Submission RCM Denial Prevention Engine
          </div>
          <div className="font-mono text-[11px] text-amber-400">
            SIMULATED / DEMO DATA ONLY — Not clinically validated or payer certified
          </div>
          <div>
            Microsoft Innovation Club (VIT Chennai)
          </div>
        </div>
      </footer>

      {/* What-If Modal */}
      {isWhatIfOpen && currentClaim && (
        <WhatIfPlayground
          claim={currentClaim}
          onApplyFix={handleApplyFix}
          onClose={() => setIsWhatIfOpen(false)}
        />
      )}

      {/* Analytics Modal */}
      {isAnalyticsOpen && (
        <ModelAnalyticsModal
          metrics={metrics}
          onClose={() => setIsAnalyticsOpen(false)}
        />
      )}

      {/* Batch Upload Modal */}
      {isUploadOpen && (
        <BatchUploadModal
          onClose={() => setIsUploadOpen(false)}
          onSuccess={() => {
            loadClaims();
            loadMetrics();
          }}
        />
      )}
    </div>
  );
}
