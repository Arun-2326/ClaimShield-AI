import React, { useState, useEffect } from 'react';
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
import { DEMO_PRESETS } from './utils/constants';
import api from './api/client';

export default function App() {
  const [activeTab, setActiveTab] = useState('inspector');
  const [currentClaim, setCurrentClaim] = useState({ ...DEMO_PRESETS[0].data });
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

  // Initial load
  useEffect(() => {
    loadSystemHealth();
    loadMetrics();
    loadClaims();
    // Run initial analysis on first preset for instant judge preview
    handleAnalyze(DEMO_PRESETS[0].data);
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
              loading={loading}
              currentClaim={currentClaim}
              setCurrentClaim={setCurrentClaim}
            />

            {/* Bottom: Prediction, Explanations, and Recommendation */}
            {currentPrediction && (
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
