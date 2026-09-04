import React, { useState } from 'react';
import {
  Play, Sparkles, RotateCcw, Stethoscope, Clock, ShieldAlert,
  AlertTriangle, Building2, Hash, FileCode2, Activity,
  DollarSign, Calendar, Sliders, ShieldCheck, FileCheck, Check
} from 'lucide-react';
import { DEMO_PRESETS, REFERENCE_CPT_CODES, REFERENCE_ICD_CODES } from '../utils/constants';

const PAYER_OPTIONS = [
  { id: "PAYER_001", name: "Blue Cross Blue Shield (Strict Prior Auth Required)", short: "BCBS Demo" },
  { id: "PAYER_002", name: "Medicare Part B (365d Timely Filing Standard)", short: "Medicare Sim" },
  { id: "PAYER_003", name: "Aetna Health (90d Expedited Filing Limit)", short: "Aetna Demo" },
  { id: "PAYER_004", name: "UnitedHealthcare (Commercial Clinical Review)", short: "UHC Sim" },
  { id: "PAYER_005", name: "Cigna HealthCare (120d Filing Window)", short: "Cigna Demo" },
  { id: "PAYER_006", name: "Humana Advantage (180d Prior Auth Mandate)", short: "Humana Sim" }
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

  // Check for non-reference codes live
  const nonRefCpts = (currentClaim.cpt_codes || []).filter(c => !REFERENCE_CPT_CODES.includes(c));
  const nonRefIcds = (currentClaim.icd_codes || []).filter(c => !REFERENCE_ICD_CODES.includes(c));
  const allNonRef = [...nonRefCpts, ...nonRefIcds];

  const daysVal = currentClaim.days_since_eligibility_check !== undefined &&
                  currentClaim.days_since_eligibility_check !== null &&
                  currentClaim.days_since_eligibility_check !== ""
                  ? Number(currentClaim.days_since_eligibility_check)
                  : "";

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-6 shadow-2xl shadow-black/40 relative overflow-hidden">
      {/* Subtle top surface ambient glow */}
      <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-sky-500/30 to-transparent pointer-events-none" />

      {/* Header & Simulated Presets Panel */}
      <div className="space-y-4 pb-5 border-b border-slate-800/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <Stethoscope className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">Pre-Submission Claim Studio</h2>
                <p className="text-xs text-slate-400">Enterprise intake validation, probabilistic denial scoring & CARC attribution</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-[11px] font-mono text-slate-300">
              EDI 837 v5010A1
            </span>
          </div>
        </div>

        {/* Segmented Simulated Presets Panel */}
        <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Simulated Presets Panel (One-Click Scenarios)
            </span>
            <span className="text-[10px] font-mono text-slate-500">Live Hackathon Benchmark Scenarios</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {DEMO_PRESETS.map((p) => {
              const isSelected = activePresetId === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className={`relative p-2.5 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-gradient-to-b from-indigo-950/60 to-slate-900 border-indigo-500/60 shadow-lg shadow-indigo-950/50 ring-1 ring-indigo-500/30'
                      : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/50'
                  }`}
                  title={p.subtitle}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      #{p.id.replace('preset_', '')}
                    </span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse shadow-[0_0_8px_rgba(129,140,248,0.8)]" />
                    )}
                  </div>
                  <div className="text-xs font-bold text-white line-clamp-1">
                    {p.title.split(':')[0]}
                  </div>
                  <div className="text-[10px] font-medium text-slate-400 truncate mt-0.5">
                    {p.expectedOutcome}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Intake Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onAnalyze(currentClaim);
        }}
        onReset={(e) => {
          e.preventDefault();
          setActivePresetId(null);
          if (onReset) onReset();
        }}
        className="mt-5 space-y-5"
      >
        {/* Modular Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* LEFT PANEL: Administrative & Identity Data */}
          <div className="bg-slate-950/50 rounded-xl border border-slate-800/90 p-4 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                  <Hash className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Demographics & Payer Routing</h3>
                  <p className="text-[11px] text-slate-400">Patient identity pseudonym & destination payer</p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                Segment 1
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Claim ID */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <Hash className="w-3 h-3 text-slate-400" />
                  Claim ID
                </label>
                <input
                  type="text"
                  value={currentClaim.claim_id ?? ""}
                  onChange={(e) => handleInputChange("claim_id", e.target.value)}
                  placeholder="e.g. CLM_1001"
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 focus:outline-none transition-all placeholder:text-slate-600"
                />
              </div>

              {/* Patient ID */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  Patient ID (Opaque)
                </label>
                <input
                  type="text"
                  value={currentClaim.patient_id ?? ""}
                  onChange={(e) => handleInputChange("patient_id", e.target.value)}
                  placeholder="e.g. PAT_2001"
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 focus:outline-none transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* Destination Payer */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3 h-3 text-slate-400" />
                Destination Clearinghouse Payer
              </label>
              <select
                value={currentClaim.payer_id || "PAYER_001"}
                onChange={(e) => handleInputChange("payer_id", e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 focus:outline-none transition-all"
              >
                {PAYER_OPTIONS.map((p) => (
                  <option key={p.id} value={p.id}>{p.id} — {p.name}</option>
                ))}
              </select>
            </div>

            {/* Provider Specialty */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Stethoscope className="w-3 h-3 text-slate-400" />
                Rendering Provider Specialty
              </label>
              <select
                value={currentClaim.provider_specialty || "Family Medicine"}
                onChange={(e) => handleInputChange("provider_specialty", e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 focus:outline-none transition-all"
              >
                {SPECIALTY_OPTIONS.map((spec) => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>
          </div>

          {/* RIGHT PANEL: Clinical Coding & Valuation Data */}
          <div className="bg-slate-950/50 rounded-xl border border-slate-800/90 p-4 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <FileCode2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Clinical Coding & Valuation</h3>
                  <p className="text-[11px] text-slate-400">CPT/HCPCS procedures, ICD-10 diagnoses & charges</p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                Segment 2
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* CPT Codes */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <FileCode2 className="w-3 h-3 text-slate-400" />
                  CPT / HCPCS Procedures
                </label>
                <input
                  type="text"
                  value={(currentClaim.cpt_codes || []).join(", ")}
                  onChange={(e) => handleCptChange(e.target.value)}
                  placeholder="e.g. 29881, 99214"
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 focus:outline-none transition-all placeholder:text-slate-600"
                />
              </div>

              {/* ICD Codes */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <Activity className="w-3 h-3 text-slate-400" />
                  ICD-10 Diagnoses
                </label>
                <input
                  type="text"
                  value={(currentClaim.icd_codes || []).join(", ")}
                  onChange={(e) => handleIcdChange(e.target.value)}
                  placeholder="e.g. M17.11, I10"
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 focus:outline-none transition-all placeholder:text-slate-600"
                />
              </div>

              {/* Billed Amount */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <DollarSign className="w-3 h-3 text-slate-400" />
                  Billed Amount ($ USD)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-mono text-sm">
                    $
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={currentClaim.claim_amount !== undefined && currentClaim.claim_amount !== null ? currentClaim.claim_amount : ""}
                    onChange={(e) => handleInputChange("claim_amount", e.target.value === "" ? "" : parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-8 pr-3.5 py-2.5 text-sm text-white font-mono focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 focus:outline-none transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>

              {/* Service Date */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  Date of Service
                </label>
                <input
                  type="date"
                  value={currentClaim.service_date || ""}
                  onChange={(e) => handleInputChange("service_date", e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* What-If Operational Toggles & Eligibility Slider */}
        <div className="bg-slate-950/60 rounded-xl border border-slate-800/80 p-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Operational Compliance & Dynamic Verification Controls
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Interactive Pre-Submission Toggles</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Custom Sliding Toggle 1: Prior Auth */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Prior Auth on File
                </span>
                <p className="text-[11px] text-slate-400">Precertification obtained</p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={Boolean(currentClaim.prior_auth_flag)}
                  onChange={(e) => handleInputChange("prior_auth_flag", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 border border-slate-700 shadow-inner" />
              </label>
            </div>

            {/* Custom Sliding Toggle 2: Eligibility Verified */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-sky-400" />
                  Eligibility Verified
                </span>
                <p className="text-[11px] text-slate-400">Active member coverage</p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={Boolean(currentClaim.eligibility_verified)}
                  onChange={(e) => handleInputChange("eligibility_verified", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500 border border-slate-700 shadow-inner" />
              </label>
            </div>

            {/* Custom Sliding Toggle 3: Documentation Complete */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-indigo-400" />
                  Documentation Attached
                </span>
                <p className="text-[11px] text-slate-400">Clinical chart & signature</p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={Boolean(currentClaim.documentation_complete)}
                  onChange={(e) => handleInputChange("documentation_complete", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500 border border-slate-700 shadow-inner" />
              </label>
            </div>
          </div>

          {/* Interactive Numerical Slider: Days Since 270 Check */}
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Days Since Last Eligibility (270) Inquiry
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold transition-all ${
                  daysVal > 30
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm shadow-rose-500/10'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                {daysVal === "" ? "0 days" : `${daysVal} days old`}
                {daysVal > 30 && " — Stale (>30d Threshold)"}
              </span>
            </div>

            <div className="flex items-center gap-4 pt-1">
              <input
                type="range"
                min="0"
                max="90"
                step="1"
                value={daysVal === "" ? 0 : daysVal}
                onChange={(e) => handleInputChange("days_since_eligibility_check", parseInt(e.target.value) || 0)}
                className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500 focus:outline-none"
              />
              <input
                type="number"
                min="0"
                max="365"
                value={currentClaim.days_since_eligibility_check !== undefined && currentClaim.days_since_eligibility_check !== null ? currentClaim.days_since_eligibility_check : ""}
                onChange={(e) => handleInputChange("days_since_eligibility_check", e.target.value === "" ? "" : parseInt(e.target.value) || 0)}
                placeholder="0"
                className="w-16 bg-slate-950 border border-slate-700/80 rounded-lg px-2 py-1 text-xs text-center text-white font-mono focus:border-sky-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Live Non-Reference Code Warning Banner */}
        {allNonRef.length > 0 && (
          <div
            role="alert"
            data-testid="validation-warnings"
            className="p-3.5 bg-amber-500/10 border border-amber-500/40 rounded-xl space-y-1.5 animate-fadeIn"
          >
            <div className="text-xs font-bold text-amber-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Validation Warnings: Non-Reference Codes Detected ({allNonRef.length})</span>
            </div>
            <p className="text-xs text-amber-200/90 leading-relaxed">
              Non-reference code(s) detected: {allNonRef.map(c => `"${c}"`).join(', ')}. Unknown demo codes generate validation warnings while still allowing claim analysis to proceed.
            </p>
          </div>
        )}

        {/* Submit Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium text-slate-300">Dual-Stage Random Forest Engine Ready</span>
            <span className="text-slate-500">| Calibrated ROC-AUC 84.1%</span>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {onReset && (
              <button
                type="button"
                data-testid="reset-claim-btn"
                aria-label="Reset the claim intake form to an empty state"
                onClick={() => {
                  setActivePresetId(null);
                  onReset();
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-bold transition-all duration-200 cursor-pointer shadow-sm hover:border-slate-600"
                title="Reset the claim intake form to an empty state"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Form
              </button>
            )}

            <button
              type="submit"
              data-testid="analyze-claim-btn"
              disabled={loading}
              className="flex items-center gap-2.5 px-7 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-600 to-indigo-700 hover:from-sky-400 hover:via-indigo-500 hover:to-indigo-600 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 hover:shadow-indigo-500/40 disabled:opacity-50 transition-all duration-200 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Evaluating Pre-Submission...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Analyze Before Submission</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
