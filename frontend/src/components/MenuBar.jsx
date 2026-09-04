import React, { useState, useRef, useEffect } from 'react';
import { 
  Building2, 
  CreditCard, 
  BookOpen, 
  Scale, 
  Download, 
  ChevronDown, 
  ShieldCheck, 
  Check, 
  ExternalLink,
  SlidersHorizontal,
  FileCode2,
  FileSpreadsheet,
  Zap
} from 'lucide-react';
import { cyberAudio } from '../utils/audio';

const FACILITIES = [
  { id: 'FAC_01', name: 'Memorial Hermann Main Medical Center', npi: '1982001402', type: 'Level 1 Trauma & Inpatient' },
  { id: 'FAC_02', name: 'Memorial Hermann Orthopedic & Spine Center', npi: '1982001403', type: 'Specialty Surgical Pavilion' },
  { id: 'FAC_03', name: 'Memorial Hermann Ambulatory Surgery Center', npi: '1982001404', type: 'Outpatient Same-Day Center' }
];

export default function MenuBar({ 
  onOpenPayerModal, 
  onOpenCptModal, 
  onOpenIcdModal, 
  onNavigatePage,
  onToast 
}) {
  const [activeDropdown, setActiveDropdown] = useState(null); // 'facility' | 'payer' | 'codebook' | 'rules' | 'export'
  const [selectedFacility, setSelectedFacility] = useState(FACILITIES[0]);
  const barRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (barRef.current && !barRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (name) => {
    cyberAudio.playChirp();
    setActiveDropdown((prev) => (prev === name ? null : name));
  };

  const handleSelectFacility = (fac) => {
    cyberAudio.playShield();
    setSelectedFacility(fac);
    setActiveDropdown(null);
    if (onToast) onToast(`Switched active billing facility to: ${fac.name}`, 'info');
  };

  return (
    <div ref={barRef} className="bg-cyber-dark border-b border-cyber-border/70 text-xs text-slate-300 relative z-30">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-1.5 flex flex-wrap items-center justify-between gap-2">
        {/* Left: Enterprise Multi-Dropdown Menus */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* 1. Facility Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('facility')}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border transition-all ${
                activeDropdown === 'facility'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60'
                  : 'bg-cyber-panel/60 hover:bg-cyber-panel border-cyber-border/80 text-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="font-semibold max-w-[180px] sm:max-w-xs truncate text-[11px]">
                {selectedFacility.name}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-500 shrink-0" />
            </button>

            {activeDropdown === 'facility' && (
              <div className="absolute left-0 mt-1.5 w-80 bg-cyber-dark/95 border border-cyber-border rounded-xl shadow-2xl p-2 space-y-1 animate-scale-in">
                <span className="text-[10px] uppercase font-mono text-slate-400 font-bold px-2 py-1 block">
                  Select Active Billing Entity:
                </span>
                {FACILITIES.map((fac) => {
                  const isSel = selectedFacility.id === fac.id;
                  return (
                    <div
                      key={fac.id}
                      onClick={() => handleSelectFacility(fac)}
                      className={`p-2 rounded-lg cursor-pointer transition-colors flex items-center justify-between text-xs ${
                        isSel ? 'bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 font-bold' : 'hover:bg-slate-800/80 text-slate-300'
                      }`}
                    >
                      <div>
                        <div className="leading-tight">{fac.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          NPI: {fac.npi} • {fac.type}
                        </div>
                      </div>
                      {isSel && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. Health Plans & Payer Directory */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('payer')}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border transition-all ${
                activeDropdown === 'payer'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60'
                  : 'bg-cyber-panel/60 hover:bg-cyber-panel border-cyber-border/80 text-slate-300'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="font-semibold text-[11px] hidden sm:inline">Health Plans</span>
              <ChevronDown className="w-3 h-3 text-slate-500 shrink-0" />
            </button>

            {activeDropdown === 'payer' && (
              <div className="absolute left-0 mt-1.5 w-72 bg-cyber-dark/95 border border-cyber-border rounded-xl shadow-2xl p-2.5 space-y-2 animate-scale-in">
                <div className="flex items-center justify-between pb-1.5 border-b border-cyber-border/60">
                  <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">
                    Payer Adjudication Directory
                  </span>
                  <span className="text-[9px] font-mono text-slate-400">5 Carriers</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="p-2 rounded bg-slate-900/60 hover:bg-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-200 block">Aetna Health Plan</span>
                      <span className="text-[10px] text-slate-400 font-mono">180d Limit • Auth Gates Active</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400">270/271 Live</span>
                  </div>

                  <div className="p-2 rounded bg-slate-900/60 hover:bg-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-200 block">Blue Cross Blue Shield</span>
                      <span className="text-[10px] text-slate-400 font-mono">365d Limit • High Acuity Review</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400">270/271 Live</span>
                  </div>

                  <div className="p-2 rounded bg-slate-900/60 hover:bg-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-200 block">UnitedHealthcare</span>
                      <span className="text-[10px] text-slate-400 font-mono">90d Strict Window • NCCI Edits</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400">270/271 Live</span>
                  </div>
                </div>

                <div className="pt-1.5 border-t border-cyber-border/60">
                  <button
                    onClick={() => {
                      setActiveDropdown(null);
                      if (onOpenPayerModal) onOpenPayerModal();
                    }}
                    className="w-full py-1.5 px-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-black font-bold text-xs flex items-center justify-center space-x-1.5 shadow"
                  >
                    <span>Browse Full Payer Directory Modal</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 3. Clinical Codebook (CPT & ICD) */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('codebook')}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border transition-all ${
                activeDropdown === 'codebook'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60'
                  : 'bg-cyber-panel/60 hover:bg-cyber-panel border-cyber-border/80 text-slate-300'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="font-semibold text-[11px] hidden sm:inline">Codebook</span>
              <ChevronDown className="w-3 h-3 text-slate-500 shrink-0" />
            </button>

            {activeDropdown === 'codebook' && (
              <div className="absolute left-0 mt-1.5 w-64 bg-cyber-dark/95 border border-cyber-border rounded-xl shadow-2xl p-2.5 space-y-2 animate-scale-in">
                <span className="text-[10px] font-mono text-purple-400 font-bold uppercase block pb-1 border-b border-cyber-border/60">
                  Clinical Classification Master
                </span>
                <div className="space-y-1.5 text-xs">
                  <button
                    onClick={() => {
                      setActiveDropdown(null);
                      if (onOpenCptModal) onOpenCptModal();
                    }}
                    className="w-full text-left p-2 rounded-lg bg-cyber-panel/80 hover:bg-slate-800 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-slate-200 block">CPT / HCPCS Procedures</span>
                      <span className="text-[10px] text-slate-400">8 Surgical & E&M Benchmarks</span>
                    </div>
                    <ChevronDown className="w-3 h-3 text-cyan-400 -rotate-90" />
                  </button>

                  <button
                    onClick={() => {
                      setActiveDropdown(null);
                      if (onOpenIcdModal) onOpenIcdModal();
                    }}
                    className="w-full text-left p-2 rounded-lg bg-cyber-panel/80 hover:bg-slate-800 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-slate-200 block">ICD-10-CM Diagnoses</span>
                      <span className="text-[10px] text-slate-400">LCD Medical Necessity Rules</span>
                    </div>
                    <ChevronDown className="w-3 h-3 text-cyan-400 -rotate-90" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 4. Clearinghouse Rules Engine Overview */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('rules')}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border transition-all ${
                activeDropdown === 'rules'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60'
                  : 'bg-cyber-panel/60 hover:bg-cyber-panel border-cyber-border/80 text-slate-300'
              }`}
            >
              <Scale className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="font-semibold text-[11px] hidden md:inline">Scrubbing Rules</span>
              <ChevronDown className="w-3 h-3 text-slate-500 shrink-0" />
            </button>

            {activeDropdown === 'rules' && (
              <div className="absolute left-0 mt-1.5 w-80 bg-cyber-dark/95 border border-cyber-border rounded-xl shadow-2xl p-3 space-y-2 animate-scale-in">
                <div className="flex items-center justify-between pb-1 border-b border-cyber-border/60">
                  <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">
                    Clearinghouse Rule Matrix
                  </span>
                  <span className="text-[9px] font-mono text-slate-400">7 Active Edits</span>
                </div>
                <div className="space-y-1 text-[11px] text-slate-300">
                  <div className="flex items-center space-x-2 py-1 border-b border-slate-800/60">
                    <span className="font-mono text-cyan-400 font-bold">RULE_AUTH_01</span>
                    <span>Payer Prior Authorization Mandate</span>
                  </div>
                  <div className="flex items-center space-x-2 py-1 border-b border-slate-800/60">
                    <span className="font-mono text-cyan-400 font-bold">RULE_ELIG_02</span>
                    <span>270/271 Real-Time Coverage Freshness</span>
                  </div>
                  <div className="flex items-center space-x-2 py-1 border-b border-slate-800/60">
                    <span className="font-mono text-cyan-400 font-bold">RULE_TIME_03</span>
                    <span>Timely Filing Contract Deadline</span>
                  </div>
                  <div className="flex items-center space-x-2 py-1">
                    <span className="font-mono text-cyan-400 font-bold">RULE_NCCI_04</span>
                    <span>CMS NCCI Procedure-to-Procedure (PTP)</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-cyber-border/60">
                  <button
                    onClick={() => {
                      setActiveDropdown(null);
                      if (onNavigatePage) onNavigatePage('edi');
                    }}
                    className="w-full py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-cyan-300 text-xs font-bold flex items-center justify-center space-x-1"
                  >
                    <span>View Live Clearinghouse Scrubber Page</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Quick Action Exports */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              cyberAudio.playShield();
              if (onToast) onToast('Exported ANSI ASC X12 837P electronic batch file', 'success');
            }}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-cyber-panel/60 hover:bg-slate-800 border border-cyber-border/80 text-slate-300 text-[11px] transition-colors"
          >
            <FileCode2 className="w-3 h-3 text-cyan-400" />
            <span className="hidden sm:inline">Export 837P Batch</span>
          </button>

          <span className="text-[11px] font-mono text-slate-400 px-2 py-0.5 rounded bg-cyber-panel/60 border border-cyber-border/60 hidden lg:inline">
            Environment: <strong className="text-emerald-400 font-bold">Simulated Sandbox</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
