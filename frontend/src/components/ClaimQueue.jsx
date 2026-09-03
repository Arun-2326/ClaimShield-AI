import React, { useState } from 'react';
import { Search, Filter, RefreshCw, Eye, CheckCircle2, XCircle, ShieldAlert, ArrowUpDown } from 'lucide-react';
import { ROUTING_CONFIG, CARC_TAXONOMY } from '../utils/constants';
import { formatCurrency, formatPercentage, formatDate } from '../utils/formatters';

export default function ClaimQueue({ claims, loading, onSelectClaim, onRefresh, onLogOutcome }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDisposition, setSelectedDisposition] = useState('ALL');
  const [selectedPayer, setSelectedPayer] = useState('ALL');

  const filteredClaims = (claims || []).filter(c => {
    if (selectedDisposition !== 'ALL' && c.routing_decision !== selectedDisposition) return false;
    if (selectedPayer !== 'ALL' && c.payer_id !== selectedPayer) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchId = (c.claim_id || '').toLowerCase().includes(term);
      const matchPatient = (c.patient_id || '').toLowerCase().includes(term);
      const matchSpecialty = (c.provider_specialty || '').toLowerCase().includes(term);
      if (!matchId && !matchPatient && !matchSpecialty) return false;
    }
    return true;
  });

  return (
    <div className="bg-slate-800/70 border border-slate-700/70 rounded-2xl p-5 shadow-xl">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-700/60">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            Pre-Submission Claims Work Queue
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 font-mono">
              {filteredClaims.length} records
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Operational worklist for billing specialists prior to 837 batch release
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search ID, Patient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:border-sky-500 focus:outline-none w-48"
            />
          </div>

          {/* Disposition Filter */}
          <select
            value={selectedDisposition}
            onChange={(e) => setSelectedDisposition(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-sky-500 focus:outline-none"
          >
            <option value="ALL">All Dispositions</option>
            <option value="RELEASE">RELEASE (Clean)</option>
            <option value="REVIEW">REVIEW (Manual)</option>
            <option value="HOLD_FOR_CORRECTION">HOLD (High Risk)</option>
            <option value="BLOCK_UNTIL_VALID">BLOCK (Invalid)</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Refresh queue"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-700/60">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-700/60">
              <th className="py-3 px-3.5">Claim ID</th>
              <th className="py-3 px-3.5">Payer</th>
              <th className="py-3 px-3.5">Charge</th>
              <th className="py-3 px-3.5">Service Date</th>
              <th className="py-3 px-3.5">Predicted Risk</th>
              <th className="py-3 px-3.5">Routing Decision</th>
              <th className="py-3 px-3.5">Flagged Reason</th>
              <th className="py-3 px-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/40">
            {filteredClaims.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-8 text-center text-slate-400">
                  No claims match the active filter criteria.
                </td>
              </tr>
            ) : (
              filteredClaims.map((claim) => {
                const decisionKey = claim.routing_decision || "RELEASE";
                const config = ROUTING_CONFIG[decisionKey] || ROUTING_CONFIG.RELEASE;
                const carcMeta = claim.predicted_reason_code ? CARC_TAXONOMY[claim.predicted_reason_code] : null;

                return (
                  <tr key={claim.claim_id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="py-2.5 px-3.5 font-mono font-bold text-white">
                      {claim.claim_id}
                    </td>
                    <td className="py-2.5 px-3.5 font-medium text-slate-300">
                      {claim.payer_id}
                    </td>
                    <td className="py-2.5 px-3.5 font-mono text-slate-200">
                      {formatCurrency(claim.claim_amount)}
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-400">
                      {formatDate(claim.service_date)}
                    </td>
                    <td className="py-2.5 px-3.5 font-mono font-semibold">
                      <span className={config.textClass}>
                        {formatPercentage(claim.risk_score)}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${config.badgeClass}`}>
                        {config.label}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5">
                      {claim.predicted_reason_code ? (
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded font-mono text-[10px] font-bold border ${carcMeta?.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                          {claim.predicted_reason_code}
                        </span>
                      ) : (
                        <span className="text-slate-500 font-mono text-[11px]">—</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3.5 text-right">
                      <button
                        onClick={() => onSelectClaim(claim)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 font-semibold transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
