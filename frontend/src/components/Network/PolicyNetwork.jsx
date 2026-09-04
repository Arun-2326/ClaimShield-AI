import React, { useState } from 'react';
import { Network, ShieldCheck, Clock, FileCheck2, ChevronRight, AlertTriangle, ExternalLink } from 'lucide-react';
import { cyberAudio } from '../../utils/audio';

const PAYER_POLICIES = [
  {
    id: 'PAYER_001',
    name: 'Blue Cross Blue Shield (BCBS)',
    type: 'Commercial Payer',
    timelyFiling: 180,
    authRequiredCpts: ['29881', '43239', '70450'],
    benchmarkDenialRate: '14.5%',
    primaryCarcRisk: 'CO-197 (Pre-Auth Missing)',
    gatewayStatus: 'EDI 270/271 ONLINE',
    color: 'border-sky-500/40 text-sky-400 bg-sky-950/20',
    guideline: 'Mandates prior certification for all elective outpatient orthopedic surgeries and advanced diagnostic CT/MRI studies.'
  },
  {
    id: 'PAYER_002',
    name: 'Medicare (Part B / Novitas Solutions MAC)',
    type: 'Government CMS',
    timelyFiling: 365,
    authRequiredCpts: ['29881'],
    benchmarkDenialRate: '11.8%',
    primaryCarcRisk: 'CO-50 (Medical Necessity LCD)',
    gatewayStatus: 'EDI 270/271 ONLINE',
    color: 'border-emerald-500/40 text-emerald-400 bg-emerald-950/20',
    guideline: 'Strict Local Coverage Determination (LCD L33942). Diagnosis must indicate documented mechanical knee symptoms prior to arthroscopic meniscectomy.'
  },
  {
    id: 'PAYER_003',
    name: 'UnitedHealthcare (UHC)',
    type: 'Commercial / Medicare Advantage',
    timelyFiling: 90,
    authRequiredCpts: ['29881', '43239', '70450'],
    benchmarkDenialRate: '16.2%',
    primaryCarcRisk: 'CO-29 (Timely Filing Cutoff)',
    gatewayStatus: 'EDI 270/271 ONLINE',
    color: 'border-indigo-500/40 text-indigo-400 bg-indigo-950/20',
    guideline: 'Aggressive 90-day contractual timely filing window. Unbundled E&M visits alongside minor procedures require distinct modifier -25 justification.'
  },
  {
    id: 'PAYER_004',
    name: 'Aetna Health Plan',
    type: 'Commercial Health Plan',
    timelyFiling: 120,
    authRequiredCpts: ['29881', '43239'],
    benchmarkDenialRate: '15.0%',
    primaryCarcRisk: 'CO-197 / CO-27 (Eligibility)',
    gatewayStatus: 'EDI 270/271 ONLINE',
    color: 'border-purple-500/40 text-purple-400 bg-purple-950/20',
    guideline: 'Real-time 270/271 eligibility verification within 30 days of encounter mandatory. Requires documentation attachment (PWK segment) for complex visits.'
  },
  {
    id: 'PAYER_005',
    name: 'Cigna Healthcare',
    type: 'Commercial / Employer Group',
    timelyFiling: 180,
    authRequiredCpts: ['29881', '70450'],
    benchmarkDenialRate: '13.9%',
    primaryCarcRisk: 'CO-97 (NCCI Bundling)',
    gatewayStatus: 'EDI 270/271 ONLINE',
    color: 'border-amber-500/40 text-amber-400 bg-amber-950/20',
    guideline: 'Strict adherence to CMS NCCI Procedure-to-Procedure edits. Mutually exclusive surgical line items must be supported by operative notes.'
  }
];

export default function PolicyNetwork() {
  const [selectedPayer, setSelectedPayer] = useState(PAYER_POLICIES[0]);

  const handleSelectPayer = (payer) => {
    cyberAudio.playChirp();
    setSelectedPayer(payer);
  };

  return (
    <div className="space-y-6 animate-page-enter">
      {/* 1. Header Banner */}
      <div className="hud-card p-5 rounded-2xl flex items-center space-x-3.5">
        <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/40 text-purple-400">
          <Network className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-extrabold uppercase tracking-wider text-slate-100">
            Payer Policy & Clearinghouse Rule Network
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time knowledge graph mapping commercial and government health plans to contracted timely filing deadlines, pre-auth gates, and CARC denial patterns.
          </p>
        </div>
      </div>

      {/* 2. Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Payer Nodes (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-[11px] uppercase tracking-wider font-mono text-slate-400 block font-bold">
            Configured Health Plan Destinations:
          </span>

          {PAYER_POLICIES.map((p) => {
            const isSelected = selectedPayer.id === p.id;
            return (
              <div
                key={p.id}
                onClick={() => handleSelectPayer(p)}
                className={`hud-card p-4 rounded-xl cursor-pointer transition-all border flex items-center justify-between text-xs ${
                  isSelected
                    ? 'border-cyan-500/80 bg-cyan-950/30 shadow-lg shadow-cyan-500/10 scale-[1.01]'
                    : 'hover:border-slate-700'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-cyan-400 font-bold">{p.id}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                      {p.type}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-200 text-sm">{p.name}</h4>
                  <div className="text-[11px] text-slate-400 flex items-center space-x-3 pt-1 font-mono">
                    <span>Deadline: <strong>{p.timelyFiling}d</strong></span>
                    <span>•</span>
                    <span>Benchmark: <strong>{p.benchmarkDenialRate}</strong></span>
                  </div>
                </div>

                <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-cyan-400 translate-x-1' : 'text-slate-600'}`} />
              </div>
            );
          })}
        </div>

        {/* Right Column: Selected Payer Deep Dive Policy Blueprint (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <span className="text-[11px] uppercase tracking-wider font-mono text-slate-400 block font-bold">
            Active Payer Adjudication Profile:
          </span>

          <div className="hud-card p-6 rounded-2xl space-y-5">
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-cyber-border/80 pb-4">
              <div>
                <span className="text-xs font-mono text-cyan-400 font-bold uppercase block">
                  {selectedPayer.id} • {selectedPayer.type}
                </span>
                <h3 className="text-lg font-black text-slate-100 mt-0.5">
                  {selectedPayer.name}
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 border border-emerald-500/40 text-emerald-300">
                {selectedPayer.gatewayStatus}
              </span>
            </div>

            {/* Core Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-cyber-bg/80 rounded-xl border border-cyber-border/80">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Timely Filing Limit</span>
                <span className="text-base font-black font-mono text-amber-400 mt-0.5 block">
                  {selectedPayer.timelyFiling} Days
                </span>
              </div>

              <div className="p-3 bg-cyber-bg/80 rounded-xl border border-cyber-border/80">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Expected Denial Rate</span>
                <span className="text-base font-black font-mono text-rose-400 mt-0.5 block">
                  {selectedPayer.benchmarkDenialRate}
                </span>
              </div>

              <div className="p-3 bg-cyber-bg/80 rounded-xl border border-cyber-border/80 sm:col-span-1 col-span-2">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Dominant CARC Risk</span>
                <span className="text-xs font-bold font-mono text-cyan-300 mt-1 block truncate">
                  {selectedPayer.primaryCarcRisk}
                </span>
              </div>
            </div>

            {/* Mandatory Prior Auth Procedures */}
            <div>
              <span className="text-xs uppercase tracking-wider font-mono font-bold text-slate-300 block mb-2">
                Mandatory Pre-Certification CPT Procedures:
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedPayer.authRequiredCpts.map((cpt) => (
                  <span
                    key={cpt}
                    className="px-3 py-1.5 rounded-xl bg-cyan-950/40 border border-cyan-500/40 font-mono text-xs text-cyan-300 font-bold"
                  >
                    CPT {cpt}
                  </span>
                ))}
              </div>
            </div>

            {/* Clinical Guideline Narrative */}
            <div className="p-4 bg-cyber-bg/60 rounded-xl border border-cyber-border/80 text-xs space-y-1.5">
              <span className="text-[10px] text-slate-400 uppercase font-mono font-bold flex items-center space-x-1.5">
                <FileCheck2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Pre-Submission Billing Policy Directive</span>
              </span>
              <p className="text-slate-300 leading-relaxed">
                {selectedPayer.guideline}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
