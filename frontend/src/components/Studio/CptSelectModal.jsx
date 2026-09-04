import React, { useState, useEffect } from 'react';
import { Search, X, Check, Stethoscope, AlertCircle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { cyberAudio } from '../../utils/audio';

const CPT_DIRECTORY = [
  {
    code: '29881',
    name: 'Knee Arthroscopy w/ Meniscectomy',
    category: 'Surgical & Musculoskeletal',
    description: 'Arthroscopy, knee, surgical; with meniscectomy (medial OR lateral compartment).',
    typicalFee: '$3,200.00',
    requiresAuth: true,
    authNote: 'Mandatory prior authorization for elective surgery under most health plans.'
  },
  {
    code: '43239',
    name: 'Upper Endoscopy (EGD) w/ Biopsy',
    category: 'Surgical & Gastroenterology',
    description: 'Esophagogastroduodenoscopy, flexible, transoral; with biopsy, single or multiple.',
    typicalFee: '$2,100.00',
    requiresAuth: true,
    authNote: 'Requires medical necessity justification and pre-auth for non-emergent procedures.'
  },
  {
    code: '70450',
    name: 'Computed Tomography (CT) Head/Brain',
    category: 'Diagnostic Radiology',
    description: 'Computed tomography, head or brain; without contrast material.',
    typicalFee: '$1,400.00',
    requiresAuth: true,
    authNote: 'Advanced imaging rules mandate clinical indication screening prior to scan.'
  },
  {
    code: '93000',
    name: 'Electrocardiogram (ECG) 12-Lead',
    category: 'Diagnostic Cardiology',
    description: 'Electrocardiogram, routine ECG with at least 12 leads; tracing and interpretation report.',
    typicalFee: '$120.00',
    requiresAuth: false,
    authNote: 'No prior auth needed. Subject to CMS NCCI unbundling edits when billed with E&M.'
  },
  {
    code: '80053',
    name: 'Comprehensive Metabolic Panel (CMP)',
    category: 'Clinical Pathology & Lab',
    description: 'Comprehensive metabolic panel (14 individual automated clinical chemistry tests).',
    typicalFee: '$85.00',
    requiresAuth: false,
    authNote: 'Standard diagnostic blood panel. Clean claim first-pass yield > 95%.'
  },
  {
    code: '99213',
    name: 'Office/Outpatient Visit (Level 3)',
    category: 'Evaluation & Management (E&M)',
    description: 'Office or outpatient visit for the evaluation and management of an established patient (20-29 mins).',
    typicalFee: '$140.00',
    requiresAuth: false,
    authNote: 'Standard primary care follow-up visit. Low audit risk.'
  },
  {
    code: '99214',
    name: 'Office/Outpatient Visit (Level 4)',
    category: 'Evaluation & Management (E&M)',
    description: 'Office or outpatient visit for established patient with moderate medical decision making (30-39 mins).',
    typicalFee: '$210.00',
    requiresAuth: false,
    authNote: 'Requires documented moderate medical decision making or time-based chart audit.'
  },
  {
    code: '99283',
    name: 'Emergency Department Visit (Level 3)',
    category: 'Emergency Medicine',
    description: 'Emergency department visit for evaluation and management of patient, moderate severity.',
    typicalFee: '$750.00',
    requiresAuth: false,
    authNote: 'Subject to prudent layperson emergency coverage standards.'
  }
];

export default function CptSelectModal({ isOpen, onClose, selectedCpt, onSelectCpt }) {
  const [search, setSearch] = useState('');
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') triggerClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const triggerClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  };

  const filteredCpts = CPT_DIRECTORY.filter((c) =>
    c.code.includes(search) ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (cpt) => {
    cyberAudio.playShield();
    onSelectCpt(cpt.code);
    triggerClose();
  };

  return (
    <div
      onClick={triggerClose}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity duration-200 ${
        isClosing ? 'opacity-0' : 'opacity-100 animate-fade-in'
      }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-3xl bg-cyber-dark/95 border border-cyber-border/90 rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col transition-all duration-200 transform ${
          isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100 animate-scale-in'
        }`}
      >
        {/* Modal Header */}
        <div className="p-4 bg-cyber-panel/80 border-b border-cyber-border/80 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-100">
                Select Procedure Code (CPT / HCPCS)
              </h3>
              <p className="text-[11px] text-slate-400">
                Official clinical procedure fee schedule with pre-authorization gates and unbundling rules.
              </p>
            </div>
          </div>

          <button
            onClick={triggerClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 bg-cyber-bg/90 border-b border-cyber-border/60">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by 5-digit CPT code (e.g. 29881) or procedure name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-sans"
            />
          </div>
        </div>

        {/* CPT List */}
        <div className="p-4 overflow-y-auto space-y-3 custom-scrollbar flex-1">
          {filteredCpts.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No procedures match "{search}".
            </div>
          ) : (
            filteredCpts.map((cpt) => {
              const isSelected = selectedCpt === cpt.code;
              return (
                <div
                  key={cpt.code}
                  onClick={() => handleSelect(cpt)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-950/70 to-indigo-950/60 border-cyan-400 shadow-lg shadow-cyan-500/10 scale-[1.005]'
                      : 'bg-cyber-card/60 hover:bg-cyber-card border-cyber-border/70 hover:border-cyan-500/50'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm font-black text-cyan-400">
                        {cpt.code}
                      </span>
                      <span className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                        {cpt.name}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                        {cpt.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {cpt.description}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono pt-1">
                      {cpt.authNote}
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      Fee: {cpt.typicalFee}
                    </span>

                    {cpt.requiresAuth ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/15 border border-rose-500/30 text-rose-300">
                        PRE-AUTH MANDATORY
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                        NO AUTH NEEDED
                      </span>
                    )}

                    {isSelected && (
                      <span className="flex items-center space-x-1 text-[11px] font-bold text-cyan-400 font-mono mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>SELECTED</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-3 bg-cyber-panel/60 border-t border-cyber-border/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>Click any procedure to update CPT line item and recalculate pre-submission risk.</span>
          <button
            onClick={triggerClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
