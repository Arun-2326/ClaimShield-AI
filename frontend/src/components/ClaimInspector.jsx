import React, { useState } from 'react';
import { Play, Sparkles, AlertCircle, CheckCircle2, RotateCcw, Stethoscope, Clock, ShieldAlert, AlertTriangle } from 'lucide-react';
import { DEMO_PRESETS, REFERENCE_CPT_CODES, REFERENCE_ICD_CODES } from '../utils/constants';

const PAYER_OPTIONS = [
  { id: "PAYER_001", name: "Blue Cross Blue Shield Demo (Strict Prior Auth)" },
  { id: "PAYER_002", name: "Medicare Part B Sim (365d Filing Limit)" },
  { id: "PAYER_003", name: "Aetna Health Demo (90d Timely Filing)" },
  { id: "PAYER_004", name: "UnitedHealthcare Sim (High Denial Friction)" },
  { id: "PAYER_005", name: "Cigna HealthCare Demo (120d Filing Limit)" },
  { id: "PAYER_006", name: "Humana Advantage Sim (180d Filing Limit)" }
];

const SPECIALTY_OPTIONS = [
  "Family Medicine", "Internal Medicine", "Cardiology",
  "Orthopedic Surgery", "Gastroenterology", "Physical Therapy", "Radiology"
];

export default function ClaimInspector({ onAnalyze, onReset, loading, currentClaim, setCurrentClaim }) {
  const [activePresetId, setActivePresetId] = useState(null);

  const handleSelectPreset = (preset) => {
    setActivePresetId(preset.id);
    setCurrentClaim({ ...preset.data });
  };

  const handleInputChange = (field, value) => {
    setCurrentClaim(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCptChange = (text) => {
    const codes = text.split(',').map(s => s.trim()).filter(Boolean);
    setCurrentClaim(prev => ({ ...prev, cpt_codes: codes }));
  };

  const handleIcdChange = (text) => {
    const codes = text.split(',').map(s => s.trim()).filter(Boolean);
    setCurrentClaim(prev => ({ ...prev, icd_codes: codes }));
  };

  return (
    <div className="bg-slate-800/70 border border-slate-700/70 rounded-2xl p-5 shadow-xl">
      {/* Header & Preset Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-700/70">
        <div>
          <div className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-sky-400" />
            <h2 className="text-lg font-bold text-white">Pre-Submission Claim Intake</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Test real-time deterministic checks, denial risk scoring, and CARC attribution
          </p>
        </div>

        {/* 1-Click Demo Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-400 font-semibold mr-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Presets:
          </span>
          {DEMO_PRESETS.map((p) => {
            const isSelected = activePresetId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                  isSelected
                    ? 'bg-sky-500 text-white border-sky-400 shadow-sm shadow-sky-500/30'
                    : 'bg-slate-900/60 text-slate-300 border-slate-700 hover:border-slate-500 hover:bg-slate-700/50'
                }`}
                title={p.subtitle}
              >
                {p.title.split(':')[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Form Fields */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onAnalyze(currentClaim);
        }}
        className="mt-4 space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Claim ID */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Claim ID</label>
            <input
              type="text"
              value={currentClaim.claim_id || ""}
              onChange={(e) => handleInputChange("claim_id", e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-sky-500 focus:outline-none"
              required
            />
          </div>

          {/* Patient ID */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Patient ID (Opaque)</label>
            <input
              type="text"
              value={currentClaim.patient_id || ""}
              onChange={(e) => handleInputChange("patient_id", e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-sky-500 focus:outline-none"
              required
            />
          </div>

          {/* Payer */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-400 mb-1">Destination Payer</label>
            <select
              value={currentClaim.payer_id || "PAYER_001"}
              onChange={(e) => handleInputChange("payer_id", e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-sky-500 focus:outline-none"
            >
              {PAYER_OPTIONS.map((p) => (
                <option key={p.id} value={p.id}>{p.id} — {p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Clinical Codes & Amounts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* CPT Codes */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">CPT / HCPCS (comma separated)</label>
            <input
              type="text"
              value={(currentClaim.cpt_codes || []).join(", ")}
              onChange={(e) => handleCptChange(e.target.value)}
              placeholder="e.g. 29881, 99214"
              className="w-full bg-slate-900/90 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-sky-500 focus:outline-none"
              required
            />
          </div>

          {/* ICD Codes */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">ICD-10 Diagnoses</label>
            <input
              type="text"
              value={(currentClaim.icd_codes || []).join(", ")}
              onChange={(e) => handleIcdChange(e.target.value)}
              placeholder="e.g. M17.11, I10"
              className="w-full bg-slate-900/90 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-sky-500 focus:outline-none"
              required
            />
          </div>

          {/* Claim Amount */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Billed Amount ($ USD)</label>
            <input
              type="number"
              step="0.01"
              value={currentClaim.claim_amount !== undefined ? currentClaim.claim_amount : 150}
              onChange={(e) => handleInputChange("claim_amount", parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-900/90 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-sky-500 focus:outline-none"
              required
            />
          </div>

          {/* Service Date */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Date of Service</label>
            <input
              type="date"
              value={currentClaim.service_date || ""}
              onChange={(e) => handleInputChange("service_date", e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-sky-500 focus:outline-none"
              required
            />
          </div>
        </div>

        {/* Operational Indicators & Toggles */}
        <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-700/60 grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Prior Auth on file */}
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(currentClaim.prior_auth_flag)}
              onChange={(e) => handleInputChange("prior_auth_flag", e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 text-sky-500 focus:ring-sky-400 focus:ring-offset-slate-900 bg-slate-800"
            />
            <span className="text-xs text-slate-300 font-medium">Prior Auth on File</span>
          </label>

          {/* Eligibility Verified */}
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(currentClaim.eligibility_verified)}
              onChange={(e) => handleInputChange("eligibility_verified", e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 text-sky-500 focus:ring-sky-400 focus:ring-offset-slate-900 bg-slate-800"
            />
            <span className="text-xs text-slate-300 font-medium">Eligibility Verified</span>
          </label>

          {/* Days Since Eligibility */}
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="number"
              min="0"
              value={currentClaim.days_since_eligibility_check ?? 0}
              onChange={(e) => handleInputChange("days_since_eligibility_check", parseInt(e.target.value) || 0)}
              className="w-16 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white text-center font-mono focus:outline-none"
            />
            <span className="text-xs text-slate-400">days since 270 check</span>
          </div>

          {/* Documentation Complete */}
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(currentClaim.documentation_complete)}
              onChange={(e) => handleInputChange("documentation_complete", e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 text-sky-500 focus:ring-sky-400 focus:ring-offset-slate-900 bg-slate-800"
            />
            <span className="text-xs text-slate-300 font-medium">Documentation Attached</span>
          </label>
        </div>

        {/* Live Non-Reference Code Warning Banner */}
        {(() => {
          const nonRefCpts = (currentClaim.cpt_codes || []).filter(c => !REFERENCE_CPT_CODES.includes(c));
          const nonRefIcds = (currentClaim.icd_codes || []).filter(c => !REFERENCE_ICD_CODES.includes(c));
          const allNonRef = [...nonRefCpts, ...nonRefIcds];
          if (allNonRef.length === 0) return null;
          return (
            <div
              role="alert"
              data-testid="validation-warnings"
              className="p-3 bg-amber-500/15 border border-amber-500/40 rounded-xl space-y-1 animate-fadeIn"
            >
              <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Validation Warnings: Non-Reference Codes Detected ({allNonRef.length})</span>
              </div>
              <p className="text-xs text-amber-200/90 leading-relaxed">
                Non-reference code(s) detected: {allNonRef.map(c => `"${c}"`).join(', ')}. Unknown demo codes generate validation warnings while still allowing claim analysis to proceed.
              </p>
            </div>
          );
        })()}

        {/* Submit Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
            Deterministic validation + Dual-stage ML prediction pipeline
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {onReset && (
              <button
                type="button"
                data-testid="reset-claim-btn"
                onClick={() => {
                  setActivePresetId(null);
                  onReset();
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
                title="Reset form to empty dashboard state"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                New / Empty State
              </button>
            )}

            <button
              type="submit"
              data-testid="analyze-claim-btn"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-sky-500/25 disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing Pre-Submission...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  Analyze Before Submission
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
