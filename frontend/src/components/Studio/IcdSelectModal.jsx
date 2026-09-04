import React, { useState, useEffect } from 'react';
import { Search, X, Check, HeartPulse, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { cyberAudio } from '../../utils/audio';

const ICD_DIRECTORY = [
  {
    code: 'M23.22',
    name: 'Meniscus Derangement / Tear (Right Knee)',
    category: 'Musculoskeletal & Orthopedic',
    description: 'Derangement of meniscus due to old tear or injury, right knee.',
    lcdIndication: 'Primary indication supporting CPT 29881 under CMS LCD L33942.'
  },
  {
    code: 'M54.5',
    name: 'Low Back Pain / Lumbar Strain',
    category: 'Musculoskeletal & Spine',
    description: 'Low back pain, unspecified etiology.',
    lcdIndication: 'Supports physical therapy and non-invasive lumbar management.'
  },
  {
    code: 'I10',
    name: 'Essential (Primary) Hypertension',
    category: 'Circulatory & Cardiovascular',
    description: 'High blood pressure requiring routine pharmacological management.',
    lcdIndication: 'Standard chronic condition diagnosis supporting primary care E&M codes (99213, 99214).'
  },
  {
    code: 'R07.9',
    name: 'Chest Pain, Unspecified',
    category: 'Cardiovascular & Emergency',
    description: 'Chest pain, unspecified clinical presentation.',
    lcdIndication: 'Supports emergency triage (99283), 12-lead ECG (93000), and cardiac panels.'
  },
  {
    code: 'E11.9',
    name: 'Type 2 Diabetes Mellitus',
    category: 'Endocrine, Nutritional & Metabolic',
    description: 'Type 2 diabetes mellitus without acute metabolic complications.',
    lcdIndication: 'Indication for routine metabolic panels (80053) and regular chronic care monitoring.'
  },
  {
    code: 'K21.9',
    name: 'Gastro-Esophageal Reflux Disease (GERD)',
    category: 'Digestive & Gastroenterology',
    description: 'Gastro-esophageal reflux disease without esophagitis.',
    lcdIndication: 'Supports diagnostic upper endoscopy (43239) when unresponsive to PPI therapy.'
  },
  {
    code: 'J06.9',
    name: 'Acute Upper Respiratory Infection',
    category: 'Respiratory System',
    description: 'Acute upper respiratory infection, unspecified viral etiology.',
    lcdIndication: 'Supports outpatient evaluation (99213) with low audit risk.'
  },
  {
    code: 'Z00.00',
    name: 'General Adult Medical Examination',
    category: 'Preventive & Routine Encounters',
    description: 'Encounter for general adult medical examination without abnormal findings.',
    lcdIndication: 'Annual wellness exam benefit. Mutually exclusive with acute symptom-based procedures.'
  }
];

export default function IcdSelectModal({ isOpen, onClose, selectedIcd, onSelectIcd }) {
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

  const filteredIcds = ICD_DIRECTORY.filter((d) =>
    d.code.toLowerCase().includes(search.toLowerCase()) ||
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.category.toLowerCase().includes(search.toLowerCase()) ||
    d.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (icd) => {
    cyberAudio.playShield();
    onSelectIcd(icd.code);
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
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-100">
                Select Primary Diagnosis (ICD-10-CM)
              </h3>
              <p className="text-[11px] text-slate-400">
                Official clinical diagnostic indications verified for LCD/NCD medical necessity matching.
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
              placeholder="Search by ICD-10 code (e.g. M23.22) or clinical disease condition..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-sans"
            />
          </div>
        </div>

        {/* ICD List */}
        <div className="p-4 overflow-y-auto space-y-3 custom-scrollbar flex-1">
          {filteredIcds.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No diagnoses match "{search}".
            </div>
          ) : (
            filteredIcds.map((icd) => {
              const isSelected = selectedIcd === icd.code;
              return (
                <div
                  key={icd.code}
                  onClick={() => handleSelect(icd)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-950/70 to-indigo-950/60 border-cyan-400 shadow-lg shadow-cyan-500/10 scale-[1.005]'
                      : 'bg-cyber-card/60 hover:bg-cyber-card border-cyber-border/70 hover:border-cyan-500/50'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm font-black text-cyan-400">
                        {icd.code}
                      </span>
                      <span className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                        {icd.name}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                        {icd.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {icd.description}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono pt-1">
                      {icd.lcdIndication}
                    </p>
                  </div>

                  {isSelected && (
                    <div className="flex items-center space-x-1 text-[11px] font-bold text-cyan-400 font-mono shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>SELECTED</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="p-3 bg-cyber-panel/60 border-t border-cyber-border/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>Click any diagnosis code to attach to the pre-submission claim.</span>
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
