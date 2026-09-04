import React from 'react';
import { Sparkles, Send, RotateCcw, AlertCircle, ArrowUpRight, Zap } from 'lucide-react';
import { SAMPLE_PRESETS } from '../../data/samplePresets';

export default function ClaimForm({
  claimData,
  setClaimData,
  onSubmit,
  loading,
  payers = [],
  reference = null
}) {
  const handlePresetSelect = (preset) => {
    setClaimData({ ...preset.data });
  };

  const handleInputChange = (field, value) => {
    setClaimData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="p-5 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 shadow-xl space-y-5 animate-fade-in">
      {/* 1. Quick Scenario Presets */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs uppercase tracking-wider font-bold text-slate-300 flex items-center space-x-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Interactive Scenario Presets (1-Click Test Cases)</span>
          </span>
          <span className="text-[11px] text-sky-400 font-mono">
            Click to auto-populate
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {SAMPLE_PRESETS.map((preset) => {
            const isSelected = claimData.claim_id === preset.data.claim_id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePresetSelect(preset)}
                className={`p-3 rounded-xl text-left transition-all duration-300 transform active:scale-95 group flex flex-col justify-between border ${
                  isSelected
                    ? 'bg-sky-950/60 border-sky-500/70 shadow-lg shadow-sky-500/10 scale-[1.01]'
                    : 'bg-slate-800/60 hover:bg-slate-800 border-slate-750 hover:border-sky-500/50 hover:-translate-y-0.5'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className={`text-xs font-bold leading-snug line-clamp-1 transition-colors ${isSelected ? 'text-sky-300' : 'text-slate-200 group-hover:text-sky-300'}`}>
                    {preset.label}
                  </span>
                  <ArrowUpRight className="w-3 h-3 text-slate-500 group-hover:text-sky-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>
                <div className="flex items-center justify-between mt-2 text-[10px]">
                  <span className="text-slate-400 font-medium">{preset.category}</span>
                  <span className={`px-2 py-0.5 rounded-full font-mono font-semibold border ${preset.badgeColor}`}>
                    {preset.expectedOutcome.split(' ')[0]}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-slate-800/80" />

      {/* 2. Main Claim Intake Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="space-y-4 text-xs"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Claim ID */}
          <div>
            <label className="block text-slate-400 font-medium mb-1">
              Claim Identifier
            </label>
            <input
              type="text"
              value={claimData.claim_id}
              onChange={(e) => handleInputChange('claim_id', e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-slate-200 font-mono transition-all duration-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          {/* Patient ID */}
          <div>
            <label className="block text-slate-400 font-medium mb-1">
              Patient ID (Opaque)
            </label>
            <input
              type="text"
              value={claimData.patient_id}
              onChange={(e) => handleInputChange('patient_id', e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-slate-200 font-mono transition-all duration-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          {/* Payer */}
          <div>
            <label className="block text-slate-400 font-medium mb-1">
              Health Plan / Payer
            </label>
            <select
              value={claimData.payer_id}
              onChange={(e) => handleInputChange('payer_id', e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-slate-200 transition-all duration-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none"
            >
              {payers.map((p) => (
                <option key={p.payer_id} value={p.payer_id}>
                  {p.name} ({p.payer_id})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Primary Procedure CPT */}
          <div>
            <label className="block text-slate-400 font-medium mb-1">
              Primary Procedure (CPT)
            </label>
            <select
              value={claimData.cpt_codes[0] || '99213'}
              onChange={(e) => handleInputChange('cpt_codes', [e.target.value])}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-slate-200 font-mono transition-all duration-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none"
            >
              {reference && reference.cpt_codes ? (
                Object.entries(reference.cpt_codes).map(([code, desc]) => (
                  <option key={code} value={code}>
                    {code} — {desc.substring(0, 32)}...
                  </option>
                ))
              ) : (
                <option value="99213">99213 (Office Visit)</option>
              )}
            </select>
          </div>

          {/* Primary Diagnosis ICD */}
          <div>
            <label className="block text-slate-400 font-medium mb-1">
              Primary Diagnosis (ICD-10)
            </label>
            <select
              value={claimData.icd_codes[0] || 'J06.9'}
              onChange={(e) => handleInputChange('icd_codes', [e.target.value])}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-slate-200 font-mono transition-all duration-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none"
            >
              {reference && reference.icd_codes ? (
                Object.entries(reference.icd_codes).map(([code, desc]) => (
                  <option key={code} value={code}>
                    {code} — {desc.substring(0, 32)}...
                  </option>
                ))
              ) : (
                <option value="J06.9">J06.9 (Upper Resp)</option>
              )}
            </select>
          </div>

          {/* Billed Amount */}
          <div>
            <label className="block text-slate-400 font-medium mb-1">
              Billed Dollar Amount ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={claimData.claim_amount}
              onChange={(e) => handleInputChange('claim_amount', parseFloat(e.target.value) || 0)}
              required
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-slate-200 font-mono transition-all duration-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Service Date */}
          <div>
            <label className="block text-slate-400 font-medium mb-1">
              Date of Service
            </label>
            <input
              type="date"
              value={claimData.service_date}
              onChange={(e) => handleInputChange('service_date', e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-slate-200 transition-all duration-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          {/* Specialty */}
          <div>
            <label className="block text-slate-400 font-medium mb-1">
              Provider Specialty
            </label>
            <select
              value={claimData.provider_specialty}
              onChange={(e) => handleInputChange('provider_specialty', e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-slate-200 transition-all duration-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none"
            >
              <option value="Family Medicine">Family Medicine</option>
              <option value="Internal Medicine">Internal Medicine</option>
              <option value="Orthopedic Surgery">Orthopedic Surgery</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Emergency Medicine">Emergency Medicine</option>
              <option value="Radiology">Radiology</option>
              <option value="Gastroenterology">Gastroenterology</option>
            </select>
          </div>

          {/* Days Since Eligibility Check */}
          <div>
            <label className="block text-slate-400 font-medium mb-1">
              Eligibility Age (Days)
            </label>
            <input
              type="number"
              min="0"
              value={claimData.days_since_eligibility_check ?? 0}
              onChange={(e) => handleInputChange('days_since_eligibility_check', parseInt(e.target.value, 10) || 0)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-slate-200 font-mono transition-all duration-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Animated Interactive Toggle Switches */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
          {/* Prior Auth Toggle */}
          <div
            onClick={() => handleInputChange('prior_auth_flag', !claimData.prior_auth_flag)}
            className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all duration-200 select-none group"
          >
            <span className="text-slate-300 font-medium group-hover:text-slate-100">
              Prior Auth Attached
            </span>
            <div
              className={`w-9 h-5 rounded-full transition-colors duration-300 p-0.5 relative ${
                claimData.prior_auth_flag ? 'bg-sky-500 shadow-md shadow-sky-500/40' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 transform ${
                  claimData.prior_auth_flag ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </div>
          </div>

          {/* Active Eligibility Toggle */}
          <div
            onClick={() => handleInputChange('eligibility_verified', !claimData.eligibility_verified)}
            className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all duration-200 select-none group"
          >
            <span className="text-slate-300 font-medium group-hover:text-slate-100">
              Active Coverage Verified
            </span>
            <div
              className={`w-9 h-5 rounded-full transition-colors duration-300 p-0.5 relative ${
                claimData.eligibility_verified ? 'bg-emerald-500 shadow-md shadow-emerald-500/40' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 transform ${
                  claimData.eligibility_verified ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </div>
          </div>

          {/* Clinical Records Toggle */}
          <div
            onClick={() => handleInputChange('documentation_complete', !claimData.documentation_complete)}
            className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all duration-200 select-none group"
          >
            <span className="text-slate-300 font-medium group-hover:text-slate-100">
              Complete Records PWK
            </span>
            <div
              className={`w-9 h-5 rounded-full transition-colors duration-300 p-0.5 relative ${
                claimData.documentation_complete ? 'bg-indigo-500 shadow-md shadow-indigo-500/40' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 transform ${
                  claimData.documentation_complete ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </div>
          </div>

          {/* Duplicate Candidate Toggle */}
          <div
            onClick={() => handleInputChange('duplicate_candidate', !claimData.duplicate_candidate)}
            className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all duration-200 select-none group"
          >
            <span className="text-slate-300 font-medium group-hover:text-slate-100">
              Duplicate Candidate Flag
            </span>
            <div
              className={`w-9 h-5 rounded-full transition-colors duration-300 p-0.5 relative ${
                claimData.duplicate_candidate ? 'bg-rose-500 shadow-md shadow-rose-500/40' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 transform ${
                  claimData.duplicate_candidate ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Primary Animated Action Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full relative overflow-hidden flex items-center justify-center space-x-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-600 to-sky-500 bg-[length:200%_auto] hover:bg-right transition-all duration-500 text-white font-bold text-sm shadow-xl shadow-sky-500/25 hover:shadow-sky-500/40 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : 'animate-bounce'}`} />
            <span>{loading ? 'Evaluating Pre-Submission Denial Risk...' : 'Analyze Before Submission'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
