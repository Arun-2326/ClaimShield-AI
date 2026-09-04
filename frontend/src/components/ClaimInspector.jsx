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
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleSelectPreset = (preset) => {
    setActivePresetId(preset.id);
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentClaim({ ...preset.data });
      setIsTransitioning(false);
    }, 150);
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

  // Dynamic Intelligent Presync Ambient Perimeter Aura
  const getPresyncAura = () => {
    if (!currentClaim.claim_id && !currentClaim.claim_amount) {
      return "border-slate-800/90 shadow-2xl";
    }

    const isHighRisk = (
      currentClaim.prior_auth_flag === false && ["PAYER_001", "PAYER_006"].includes(currentClaim.payer_id)
    ) || currentClaim.timely_filing_risk || activePresetId === "preset_2" || activePresetId === "preset_3";

    if (isHighRisk) {
      return "border-rose-500/50 glow-crimson ring-1 ring-rose-500/30";
    }

    const isReview = (
      currentClaim.eligibility_verified === false ||
      (currentClaim.days_since_eligibility_check && Number(currentClaim.days_since_eligibility_check) > 30) ||
      activePresetId === "preset_4" || activePresetId === "preset_5" || activePresetId === "preset_6"
    );

    if (isReview) {
      return "border-amber-500/50 glow-amber ring-1 ring-amber-500/30";
    }

    return "border-emerald-500/50 glow-emerald ring-1 ring-emerald-500/30";
  };

  return (
    <div className={`bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 shadow-2xl transition-all duration-500 relative overflow-hidden ${getPresyncAura()}`}>
      {/* Subtle top surface ambient glow */}
      <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-sky-500/30 to-transparent pointer-events-none" />

      {/* Header & Simulated Presets Panel */}
      <div className="space-y-5 pb-6 border-b border-slate-800/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Pre-Submission Claim Studio</h2>
                <p className="text-sm text-slate-300 font-medium mt-0.5">Enterprise intake validation, probabilistic denial scoring & CARC attribution</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-slate-200">
              EDI 837 v5010A1
            </span>
          </div>
        </div>

        {/* Segmented Simulated Presets Panel */}
        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Simulated Presets Panel (One-Click Scenarios)
            </span>
            <span className="text-xs font-mono font-semibold text-slate-400">Live Hackathon Benchmark Scenarios</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {DEMO_PRESETS.map((p) => {
              const isSelected = activePresetId === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className={`relative p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-gradient-to-b from-indigo-950/60 to-slate-900 border-indigo-500/60 shadow-lg shadow-indigo-950/50 ring-1 ring-indigo-500/30'
                      : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/50'
                  }`}
                  title={p.subtitle}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-mono font-bold text-slate-300">
                      #{p.id.replace('preset_', '')}
                    </span>
                    {isSelected && (
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse shadow-[0_0_8px_rgba(129,140,248,0.8)]" />
                    )}
                  </div>
                  <div className="text-sm font-black text-white line-clamp-1">
                    {p.title.split(':')[0]}
                  </div>
                  <div className="text-xs font-medium text-slate-300 truncate mt-1">
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
        className={`mt-6 space-y-6 transition-opacity duration-200 ${isTransitioning ? 'opacity-30' : 'opacity-100'}`}
      >
        {/* Modular Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT PANEL: Administrative & Identity Data */}
          <div className="bg-slate-950/50 rounded-xl border border-slate-800/90 p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                  <Hash className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-white">Demographics & Payer Routing</h3>
                  <p className="text-xs text-slate-300 mt-0.5">Patient identity pseudonym & destination payer</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                Segment 1
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Claim ID */}
              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-slate-400" />
                  Claim ID
                </label>
                <input
                  type="text"
                  value={currentClaim.claim_id ?? ""}
                  onChange={(e) => handleInputChange("claim_id", e.target.value)}
                  placeholder="e.g. CLM_1001"
                  className="w-full bg-transparent border-0 border-b border-slate-700/80 focus:border-indigo-400 py-2 text-base text-white font-mono focus:ring-0 focus:outline-none transition-colors placeholder:text-slate-600 font-semibold"
                />
              </div>

              {/* Patient ID */}
              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-400" />
                  Patient ID (Opaque)
                </label>
                <input
                  type="text"
                  value={currentClaim.patient_id ?? ""}
                  onChange={(e) => handleInputChange("patient_id", e.target.value)}
                  placeholder="e.g. PAT_2001"
                  className="w-full bg-transparent border-0 border-b border-slate-700/80 focus:border-indigo-400 py-2 text-base text-white font-mono focus:ring-0 focus:outline-none transition-colors placeholder:text-slate-600 font-semibold"
                />
              </div>
            </div>

            {/* Destination Payer */}
            <div className="space-y-1.5">
              <label className="block text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                Destination Clearinghouse Payer
              </label>
              <select
                value={currentClaim.payer_id || "PAYER_001"}
                onChange={(e) => handleInputChange("payer_id", e.target.value)}
                className="w-full bg-slate-950 border-0 border-b border-slate-700/80 focus:border-indigo-400 py-2 text-base text-white font-medium focus:ring-0 focus:outline-none transition-colors"
              >
                {PAYER_OPTIONS.map((p) => (
                  <option key={p.id} value={p.id}>{p.id} — {p.name}</option>
                ))}
              </select>
            </div>

            {/* Provider Specialty */}
            <div className="space-y-1.5">
              <label className="block text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
                Rendering Provider Specialty
              </label>
              <select
                value={currentClaim.provider_specialty || "Family Medicine"}
                onChange={(e) => handleInputChange("provider_specialty", e.target.value)}
                className="w-full bg-slate-950 border-0 border-b border-slate-700/80 focus:border-indigo-400 py-2 text-base text-white font-medium focus:ring-0 focus:outline-none transition-colors"
              >
                {SPECIALTY_OPTIONS.map((spec) => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>
          </div>

          {/* RIGHT PANEL: Clinical Coding & Valuation Data */}
          <div className="bg-slate-950/50 rounded-xl border border-slate-800/90 p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <FileCode2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-white">Clinical Coding & Valuation</h3>
                  <p className="text-xs text-slate-300 mt-0.5">CPT/HCPCS procedures, ICD-10 diagnoses & charges</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                Segment 2
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* CPT Codes */}
              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                  <FileCode2 className="w-3.5 h-3.5 text-slate-400" />
                  CPT / HCPCS Procedures
                </label>
                <input
                  type="text"
                  value={(currentClaim.cpt_codes || []).join(", ")}
                  onChange={(e) => handleCptChange(e.target.value)}
                  placeholder="e.g. 29881, 99214"
                  className="w-full bg-transparent border-0 border-b border-slate-700/80 focus:border-indigo-400 py-2 text-base text-white font-mono focus:ring-0 focus:outline-none transition-colors placeholder:text-slate-600 font-semibold"
                />
              </div>

              {/* ICD Codes */}
              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-slate-400" />
                  ICD-10 Diagnoses
                </label>
                <input
                  type="text"
                  value={(currentClaim.icd_codes || []).join(", ")}
                  onChange={(e) => handleIcdChange(e.target.value)}
                  placeholder="e.g. M17.11, I10"
                  className="w-full bg-transparent border-0 border-b border-slate-700/80 focus:border-indigo-400 py-2 text-base text-white font-mono focus:ring-0 focus:outline-none transition-colors placeholder:text-slate-600 font-semibold"
                />
              </div>

              {/* Billed Amount */}
              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                  Billed Amount ($ USD)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-1 flex items-center pointer-events-none text-slate-400 font-mono text-base font-bold">
                    $
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={currentClaim.claim_amount !== undefined && currentClaim.claim_amount !== null ? currentClaim.claim_amount : ""}
                    onChange={(e) => handleInputChange("claim_amount", e.target.value === "" ? "" : parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full bg-transparent border-0 border-b border-slate-700/80 focus:border-indigo-400 pl-6 pr-1 py-2 text-base text-white font-mono focus:ring-0 focus:outline-none transition-colors placeholder:text-slate-600 font-semibold"
                  />
                </div>
              </div>

              {/* Service Date */}
              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Date of Service
                </label>
                <input
                  type="date"
                  value={currentClaim.service_date || ""}
                  onChange={(e) => handleInputChange("service_date", e.target.value)}
                  className="w-full bg-transparent border-0 border-b border-slate-700/80 focus:border-indigo-400 py-2 text-base text-white font-medium focus:ring-0 focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* What-If Operational Toggles & Eligibility Slider */}
        <div className="bg-slate-950/60 rounded-xl border border-slate-800/80 p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800/80 gap-2">
            <div className="flex items-center gap-2.5">
              <Sliders className="w-5 h-5 text-emerald-400" />
              <span className="text-sm sm:text-base font-black uppercase tracking-wider text-white">
                Operational Compliance & Dynamic Verification Controls
              </span>
            </div>
            <span className="text-xs text-slate-300 font-mono font-semibold">Interactive Pre-Submission Toggles</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Custom Sliding Toggle 1: Prior Auth */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 transition">
              <div className="space-y-1">
                <span className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Prior Auth on File
                </span>
                <p className="text-xs text-slate-300 font-medium">Precertification obtained</p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={Boolean(currentClaim.prior_auth_flag)}
                  onChange={(e) => handleInputChange("prior_auth_flag", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 border border-slate-700 shadow-inner" />
              </label>
            </div>

            {/* Custom Sliding Toggle 2: Eligibility Verified */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 transition">
              <div className="space-y-1">
                <span className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <Check className="w-4 h-4 text-sky-400" />
                  Eligibility Verified
                </span>
                <p className="text-xs text-slate-300 font-medium">Active member coverage</p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={Boolean(currentClaim.eligibility_verified)}
                  onChange={(e) => handleInputChange("eligibility_verified", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500 border border-slate-700 shadow-inner" />
              </label>
            </div>

            {/* Custom Sliding Toggle 3: Documentation Complete */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 transition">
              <div className="space-y-1">
                <span className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-indigo-400" />
                  Documentation Attached
                </span>
                <p className="text-xs text-slate-300 font-medium">Clinical chart & signature</p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={Boolean(currentClaim.documentation_complete)}
                  onChange={(e) => handleInputChange("documentation_complete", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500 border border-slate-700 shadow-inner" />
              </label>
            </div>
          </div>

          {/* Interactive Numerical Slider: Days Since 270 Check */}
          <div className="bg-slate-900/90 p-4 sm:p-5 rounded-xl border border-slate-800/80 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                Days Since Last Eligibility (270) Inquiry
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs sm:text-sm font-mono font-extrabold transition-all self-start sm:self-auto ${
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
                className="flex-1 h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500 focus:outline-none"
              />
              <input
                type="number"
                min="0"
                max="365"
                value={currentClaim.days_since_eligibility_check !== undefined && currentClaim.days_since_eligibility_check !== null ? currentClaim.days_since_eligibility_check : ""}
                onChange={(e) => handleInputChange("days_since_eligibility_check", e.target.value === "" ? "" : parseInt(e.target.value) || 0)}
                placeholder="0"
                className="w-20 bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-1.5 text-sm text-center text-white font-mono font-bold focus:border-sky-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Live Non-Reference Code Warning Banner */}
        {allNonRef.length > 0 && (
          <div
            role="alert"
            data-testid="validation-warnings"
            className="p-4 sm:p-5 bg-amber-500/15 border-2 border-amber-500/50 rounded-xl space-y-2 animate-fadeIn"
          >
            <div className="text-sm sm:text-base font-black text-amber-300 flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <span>Validation Warnings: Non-Reference Codes Detected ({allNonRef.length})</span>
            </div>
            <p className="text-sm text-amber-100 font-medium leading-relaxed">
              Non-reference code(s) detected: <strong className="font-mono text-amber-200">{allNonRef.map(c => `"${c}"`).join(', ')}</strong>. Unknown demo codes generate validation warnings while still allowing claim analysis to proceed.
            </p>
          </div>
        )}

        {/* Submit Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3">
          <div className="text-sm text-slate-300 font-medium flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-white">Dual-Stage Random Forest Engine Ready</span>
            <span className="text-slate-400">| Calibrated ROC-AUC 84.1%</span>
          </div>

          <div className="flex items-center gap-3.5 self-end sm:self-auto">
            {onReset && (
              <button
                type="button"
                data-testid="reset-claim-btn"
                aria-label="Reset the claim intake form to an empty state"
                onClick={() => {
                  setActivePresetId(null);
                  onReset();
                }}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 text-sm font-extrabold transition-all duration-200 cursor-pointer shadow-sm hover:border-slate-600"
                title="Reset the claim intake form to an empty state"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Form
              </button>
            )}

            <button
              type="submit"
              data-testid="analyze-claim-btn"
              disabled={loading}
              className="flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-600 to-indigo-700 hover:from-sky-400 hover:via-indigo-500 hover:to-indigo-600 text-white font-black text-sm sm:text-base shadow-xl shadow-indigo-600/30 hover:shadow-indigo-500/40 disabled:opacity-50 transition-all duration-200 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
