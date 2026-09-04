import React, { useState } from 'react';
import { Sparkles, Send, RotateCcw, AlertCircle, ArrowUpRight, Zap, Building2, Stethoscope, HeartPulse, ChevronDown, CheckCircle2 } from 'lucide-react';
import { SAMPLE_PRESETS } from '../../data/samplePresets';
import PayerSelectModal from './PayerSelectModal';
import CptSelectModal from './CptSelectModal';
import IcdSelectModal from './IcdSelectModal';

export default function ClaimForm({
  claimData,
  setClaimData,
  onSubmit,
  loading,
  payers = [],
  reference = null
}) {
  const [payerModalOpen, setPayerModalOpen] = useState(false);
  const [cptModalOpen, setCptModalOpen] = useState(false);
  const [icdModalOpen, setIcdModalOpen] = useState(false);

  const handlePresetSelect = (preset) => {
    setClaimData({ ...preset.data });
  };

  const handleInputChange = (field, value) => {
    setClaimData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  // Helper metadata lookups for active selections
  const currentPayer = payers.find((p) => p.payer_id === claimData.payer_id) || {
    payer_id: claimData.payer_id,
    name: claimData.payer_id === 'PAYER_001' ? 'Aetna Health Plan' : claimData.payer_id === 'PAYER_002' ? 'Blue Cross Blue Shield' : claimData.payer_id === 'PAYER_003' ? 'UnitedHealthcare' : claimData.payer_id === 'PAYER_004' ? 'Cigna Healthcare' : 'Medicare Advantage',
    timely_filing_days: 180,
    avg_denial_rate: 0.14
  };

  const currentCpt = claimData.cpt_codes[0] || '29881';
  const currentIcd = claimData.icd_codes[0] || 'M23.22';

  return (
    <div className="hud-card-major p-6 rounded-2xl shadow-2xl space-y-5 animate-fade-in relative overflow-hidden">
      {/* Top Holographic Scanline */}
      <div className="scanline-beam animate-scanline-sweep opacity-50" />

      {/* 1. Quick Scenario Presets */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs uppercase tracking-wider font-bold text-slate-200 flex items-center space-x-2">
            <Zap className="w-4 h-4 text-amber-400 animate-bounce" />
            <span>Interactive Scenario Presets (1-Click Test Cases)</span>
          </span>
          <span className="badge-sub text-[10px]">
            ◇ CLICK TO LOAD SCENARIO
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
                className={`p-3.5 rounded-xl text-left transition-all duration-300 transform active:scale-95 group flex flex-col justify-between ${
                  isSelected
                    ? 'hud-card-major border-cyan-400 bg-cyan-950/80 shadow-lg shadow-cyan-500/25 scale-[1.02] animate-main-pulse'
                    : 'hud-card-sub hover:border-indigo-400/50 hover:bg-slate-900/90'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-mono text-slate-400 block">
                      {isSelected ? '◈ ACTIVE PRESET' : '◇ TEST SCENARIO'}
                    </span>
                    <span className={`text-xs font-bold leading-snug line-clamp-1 transition-colors ${isSelected ? 'text-cyan-200' : 'text-slate-200 group-hover:text-indigo-200'}`}>
                      {preset.label}
                    </span>
                  </div>
                  <ArrowUpRight className={`w-3.5 h-3.5 shrink-0 transition-opacity ${isSelected ? 'text-cyan-400 opacity-100' : 'text-slate-500 group-hover:text-indigo-300 opacity-0 group-hover:opacity-100'}`} />
                </div>
                <div className="flex items-center justify-between mt-2.5 text-[10px]">
                  <span className="text-slate-400 font-medium">{preset.category}</span>
                  <span className={isSelected ? 'badge-major text-[9px]' : 'badge-sub text-[9px]'}>
                    {preset.expectedOutcome.split(' ')[0]}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-slate-800" />

      {/* 2. Main Claim Intake Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="space-y-4 text-xs"
      >
        {/* Identifiers Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-slate-200 font-mono transition-all duration-200 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none"
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
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-slate-200 font-mono transition-all duration-200 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Professional Rich Selector: Health Plan / Payer */}
        <div>
          <label className="block text-slate-400 font-medium mb-1.5 flex items-center justify-between">
            <span className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              <span>Health Plan / Payer Destination</span>
            </span>
            <span className="badge-sub text-[9px]">
              ◇ SUB-SELECTOR (CLICK TO CHANGE)
            </span>
          </label>
          <div
            onClick={() => setPayerModalOpen(true)}
            className="hud-card-sub p-3.5 rounded-xl cursor-pointer group flex items-center justify-between shadow-inner"
          >
            <div className="flex items-center space-x-3 truncate">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center justify-center font-mono font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                {currentPayer.payer_id?.replace('PAYER_', 'P') || 'P1'}
              </div>
              <div className="truncate text-left">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-100 group-hover:text-indigo-200 transition-colors">
                    {currentPayer.name}
                  </span>
                  <span className="badge-sub text-[9px]">
                    {currentPayer.payer_id}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Filing Deadline: {currentPayer.timely_filing_days || 180}d • 270/271 Gateway Online
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0 pl-2">
              <span className="px-2.5 py-1 rounded-lg bg-slate-800/90 group-hover:bg-indigo-500/20 text-slate-300 group-hover:text-indigo-200 font-medium text-[10px] transition-colors border border-slate-700/80">
                Change Payer
              </span>
              <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-indigo-300 transition-colors" />
            </div>
          </div>
        </div>

        {/* Clinical Code Selectors: CPT Procedure & ICD-10 Diagnosis */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Rich CPT Selector */}
          <div>
            <label className="block text-slate-400 font-medium mb-1.5 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                <span>Primary Procedure (CPT)</span>
              </span>
              <span className="badge-sub text-[9px]">
                ◇ SUB-SELECTOR
              </span>
            </label>
            <div
              onClick={() => setCptModalOpen(true)}
              className="hud-card-sub p-3.5 rounded-xl cursor-pointer group flex items-center justify-between shadow-inner"
            >
              <div className="flex items-center space-x-2.5 truncate text-left">
                <div className="p-2 rounded-lg bg-sky-500/20 text-sky-300 shrink-0 group-hover:scale-105 transition-transform">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-mono font-bold text-sky-400">{currentCpt}</span>
                    <span className="font-bold text-slate-200 group-hover:text-indigo-200 truncate">
                      {reference?.cpt_codes?.[currentCpt]?.substring(0, 24) || currentCpt}...
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {['29881', '43239', '70450'].includes(currentCpt) ? 'Pre-Auth Required' : 'Standard Procedure'}
                  </div>
                </div>
              </div>

              <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-indigo-300 shrink-0 ml-1" />
            </div>
          </div>

          {/* Rich ICD-10 Selector */}
          <div>
            <label className="block text-slate-400 font-medium mb-1.5 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                <span>Primary Diagnosis (ICD-10)</span>
              </span>
              <span className="badge-sub text-[9px]">
                ◇ SUB-SELECTOR
              </span>
            </label>
            <div
              onClick={() => setIcdModalOpen(true)}
              className="hud-card-sub p-3.5 rounded-xl cursor-pointer group flex items-center justify-between shadow-inner"
            >
              <div className="flex items-center space-x-2.5 truncate text-left">
                <div className="p-2 rounded-lg bg-purple-500/20 text-purple-300 shrink-0 group-hover:scale-105 transition-transform">
                  <HeartPulse className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-mono font-bold text-purple-400">{currentIcd}</span>
                    <span className="font-bold text-slate-200 group-hover:text-indigo-200 truncate">
                      {reference?.icd_codes?.[currentIcd]?.substring(0, 24) || currentIcd}...
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Clinical Indication Verified
                  </div>
                </div>
              </div>

              <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-indigo-300 shrink-0 ml-1" />
            </div>
          </div>
        </div>

        {/* Claim Amount & Service Date */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-slate-200 font-mono transition-all duration-200 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none"
            />
          </div>

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
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-slate-200 transition-all duration-200 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none"
            />
          </div>

          {/* Provider Specialty */}
          <div>
            <label className="block text-slate-400 font-medium mb-1">
              Provider Specialty
            </label>
            <select
              value={claimData.provider_specialty}
              onChange={(e) => handleInputChange('provider_specialty', e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-slate-200 transition-all duration-200 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none"
            >
              <option value="Orthopedic Surgery">Orthopedic Surgery</option>
              <option value="Family Medicine">Family Medicine</option>
              <option value="Internal Medicine">Internal Medicine</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Emergency Medicine">Emergency Medicine</option>
              <option value="Radiology">Radiology</option>
              <option value="Gastroenterology">Gastroenterology</option>
            </select>
          </div>
        </div>

        {/* Animated Interactive Toggle Switches */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-slate-400 font-medium text-[11px]">Encounter Validation Flags:</span>
            <span className="badge-sub text-[9px]">◇ SUB-CONTROLS</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {/* Prior Auth Toggle */}
            <div
              onClick={() => handleInputChange('prior_auth_flag', !claimData.prior_auth_flag)}
              className="hud-card-sub flex items-center justify-between p-3 rounded-xl cursor-pointer select-none group"
            >
              <span className="text-slate-300 font-medium group-hover:text-indigo-200">
                Prior Auth
              </span>
              <div
                className={`w-9 h-5 rounded-full transition-colors duration-300 p-0.5 relative ${
                  claimData.prior_auth_flag ? 'bg-cyan-400 shadow-md shadow-cyan-400/40' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-slate-950 transition-transform duration-300 transform ${
                    claimData.prior_auth_flag ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </div>
            </div>

            {/* Active Eligibility Toggle */}
            <div
              onClick={() => handleInputChange('eligibility_verified', !claimData.eligibility_verified)}
              className="hud-card-sub flex items-center justify-between p-3 rounded-xl cursor-pointer select-none group"
            >
              <span className="text-slate-300 font-medium group-hover:text-indigo-200">
                Coverage
              </span>
              <div
                className={`w-9 h-5 rounded-full transition-colors duration-300 p-0.5 relative ${
                  claimData.eligibility_verified ? 'bg-emerald-400 shadow-md shadow-emerald-400/40' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-slate-950 transition-transform duration-300 transform ${
                    claimData.eligibility_verified ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </div>
            </div>

            {/* Clinical Records Toggle */}
            <div
              onClick={() => handleInputChange('documentation_complete', !claimData.documentation_complete)}
              className="hud-card-sub flex items-center justify-between p-3 rounded-xl cursor-pointer select-none group"
            >
              <span className="text-slate-300 font-medium group-hover:text-indigo-200">
                PWK Docs
              </span>
              <div
                className={`w-9 h-5 rounded-full transition-colors duration-300 p-0.5 relative ${
                  claimData.documentation_complete ? 'bg-purple-400 shadow-md shadow-purple-400/40' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-slate-950 transition-transform duration-300 transform ${
                    claimData.documentation_complete ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </div>
            </div>

            {/* Duplicate Candidate Toggle */}
            <div
              onClick={() => handleInputChange('duplicate_candidate', !claimData.duplicate_candidate)}
              className="hud-card-sub flex items-center justify-between p-3 rounded-xl cursor-pointer select-none group"
            >
              <span className="text-slate-300 font-medium group-hover:text-indigo-200">
                Duplicate
              </span>
              <div
                className={`w-9 h-5 rounded-full transition-colors duration-300 p-0.5 relative ${
                  claimData.duplicate_candidate ? 'bg-rose-500 shadow-md shadow-rose-500/40' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-slate-950 transition-transform duration-300 transform ${
                    claimData.duplicate_candidate ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Primary Action Button (MAIN COMMAND) */}
        <div className="pt-3">
          <button
            type="submit"
            disabled={loading}
            className="w-full relative overflow-hidden flex items-center justify-center space-x-3 py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-500 to-cyan-300 bg-[length:200%_auto] text-slate-950 font-black text-sm uppercase tracking-wider shadow-xl shadow-cyan-500/30 hover:shadow-cyan-400/50 transform hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] transition-all duration-300 animate-main-shimmer disabled:opacity-50 group border border-cyan-300/80"
          >
            <Sparkles className={`w-5 h-5 text-slate-950 ${loading ? 'animate-spin' : 'animate-bounce'}`} />
            <span className="tracking-widest">
              {loading ? 'Evaluating Pre-Submission Denial Risk...' : '◈ Execute Pre-Submission Neural Audit'}
            </span>
          </button>
        </div>
      </form>

      {/* Interactive Selection Modals */}
      <PayerSelectModal
        isOpen={payerModalOpen}
        onClose={() => setPayerModalOpen(false)}
        selectedPayerId={claimData.payer_id}
        onSelectPayer={(payerId) => handleInputChange('payer_id', payerId)}
      />

      <CptSelectModal
        isOpen={cptModalOpen}
        onClose={() => setCptModalOpen(false)}
        selectedCpt={claimData.cpt_codes[0]}
        onSelectCpt={(cptCode) => handleInputChange('cpt_codes', [cptCode])}
      />

      <IcdSelectModal
        isOpen={icdModalOpen}
        onClose={() => setIcdModalOpen(false)}
        selectedIcd={claimData.icd_codes[0]}
        onSelectIcd={(icdCode) => handleInputChange('icd_codes', [icdCode])}
      />
    </div>
  );
}
