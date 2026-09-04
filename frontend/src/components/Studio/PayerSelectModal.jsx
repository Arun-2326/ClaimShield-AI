import React, { useState, useEffect } from 'react';
import { Search, X, Check, ShieldCheck, Clock, AlertTriangle, Building2, CheckCircle2 } from 'lucide-react';
import { cyberAudio } from '../../utils/audio';

const PAYER_PROFILES = [
  {
    payer_id: 'PAYER_001',
    name: 'Aetna Health (Simulated)',
    category: 'Commercial Health Plan',
    timely_filing_days: 180,
    avg_denial_rate: 0.14,
    requires_prior_auth_codes: ['70450', '29881', '43239'],
    color: 'from-sky-500/20 to-indigo-500/20 border-sky-500/40 text-sky-400',
    avatarBg: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    gateway: '270/271 Real-Time Online',
    notes: 'Prior authorization required for outpatient surgical and advanced diagnostic imaging.'
  },
  {
    payer_id: 'PAYER_002',
    name: 'Blue Cross Blue Shield (Simulated)',
    category: 'Commercial / Regional',
    timely_filing_days: 365,
    avg_denial_rate: 0.11,
    requires_prior_auth_codes: ['70450', '29881'],
    color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/40 text-blue-400',
    avatarBg: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    gateway: '270/271 Real-Time Online',
    notes: 'Extended 365-day timely filing deadline. Strict medical necessity audit on high-acuity CPTs.'
  },
  {
    payer_id: 'PAYER_003',
    name: 'UnitedHealthcare (Simulated)',
    category: 'Commercial / Advantage',
    timely_filing_days: 90,
    avg_denial_rate: 0.18,
    requires_prior_auth_codes: ['70450', '29881', '43239', '99283'],
    color: 'from-indigo-500/20 to-purple-500/20 border-indigo-500/40 text-indigo-400',
    avatarBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    gateway: '270/271 Real-Time Online',
    notes: 'Aggressive 90-day timely filing window. Automated NCCI bundling review applied on all multi-line claims.'
  },
  {
    payer_id: 'PAYER_004',
    name: 'Cigna Healthcare (Simulated)',
    category: 'Commercial Employer Plan',
    timely_filing_days: 180,
    avg_denial_rate: 0.13,
    requires_prior_auth_codes: ['70450', '29881'],
    color: 'from-amber-500/20 to-orange-500/20 border-amber-500/40 text-amber-400',
    avatarBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    gateway: '270/271 Real-Time Online',
    notes: 'Requires active eligibility verification within 30 days of encounter to prevent CO-27 rejections.'
  },
  {
    payer_id: 'PAYER_005',
    name: 'Medicare Advantage (Simulated)',
    category: 'Government CMS Managed Care',
    timely_filing_days: 120,
    avg_denial_rate: 0.22,
    requires_prior_auth_codes: ['70450', '29881', '43239', '80053'],
    color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/40 text-emerald-400',
    avatarBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    gateway: 'CMS HETS 270/271 Active',
    notes: 'Strict Local Coverage Determination (LCD L33942) rules enforce exact diagnosis-to-procedure indications.'
  }
];

export default function PayerSelectModal({ isOpen, onClose, selectedPayerId, onSelectPayer }) {
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

  const filteredPayers = PAYER_PROFILES.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.payer_id.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (payer) => {
    cyberAudio.playShield();
    onSelectPayer(payer.payer_id);
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
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-100">
                Select Health Plan / Payer Destination
              </h3>
              <p className="text-[11px] text-slate-400">
                Choose an insurance carrier to calibrate adjudication rules, timely filing limits, and pre-auth policies.
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

        {/* Search & Filter Bar */}
        <div className="p-4 bg-cyber-bg/90 border-b border-cyber-border/60">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by payer name, ID (e.g. PAYER_001), or plan category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-sans"
            />
          </div>
        </div>

        {/* Rich Payer Cards Grid */}
        <div className="p-4 overflow-y-auto space-y-3 custom-scrollbar flex-1">
          {filteredPayers.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No health plans match "{search}".
            </div>
          ) : (
            filteredPayers.map((payer) => {
              const isSelected = selectedPayerId === payer.payer_id;
              return (
                <div
                  key={payer.payer_id}
                  onClick={() => handleSelect(payer)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-950/70 to-indigo-950/60 border-cyan-400 shadow-lg shadow-cyan-500/10 scale-[1.005]'
                      : 'bg-cyber-card/60 hover:bg-cyber-card border-cyber-border/70 hover:border-cyan-500/50'
                  }`}
                >
                  {/* Left: Avatar & Identity */}
                  <div className="flex items-start space-x-3.5">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-xs font-mono border shrink-0 ${payer.avatarBg}`}>
                      {payer.payer_id.replace('PAYER_', 'P')}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                          {payer.name}
                        </h4>
                        <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {payer.payer_id}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {payer.category} • <span className="text-emerald-400 font-medium">{payer.gateway}</span>
                      </p>
                      <p className="text-[11px] text-slate-300/90 mt-1.5 line-clamp-1">
                        {payer.notes}
                      </p>
                    </div>
                  </div>

                  {/* Right: Metrics & Badges */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1.5 text-xs shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {payer.timely_filing_days}d limit
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 font-semibold">
                        {(payer.avg_denial_rate * 100).toFixed(0)}% avg denial
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-400 font-mono">
                      Pre-Auth CPTs: <strong className="text-slate-200">{payer.requires_prior_auth_codes.join(', ')}</strong>
                    </div>

                    {isSelected && (
                      <span className="flex items-center space-x-1 text-[11px] font-bold text-cyan-400 font-mono mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>ACTIVE PLAN</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-cyber-panel/60 border-t border-cyber-border/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>Click any health plan to load its specific adjudication rules and auth gates.</span>
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
