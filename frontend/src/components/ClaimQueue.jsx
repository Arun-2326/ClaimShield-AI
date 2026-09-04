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
    <div className="bg-slate-800/70 border border-slate-700/70 rounded-2xl p-6 shadow-xl">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-700/60">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2.5">
            Pre-Submission Claims Work Queue
            <span className="text-sm px-3 py-1 rounded-full bg-slate-700 text-slate-200 font-mono font-bold">
              {filteredClaims.length} records
            </span>
          </h2>
          <p className="text-sm text-slate-300 mt-1">
            Operational worklist for billing specialists prior to 837 batch release
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search ID, Patient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2 text-sm text-white focus:border-sky-500 focus:outline-none w-56 font-medium"
            />
          </div>

          {/* Disposition Filter */}
          <select
            value={selectedDisposition}
            onChange={(e) => setSelectedDisposition(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:border-sky-500 focus:outline-none font-medium cursor-pointer"
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
            className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="Refresh queue"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="mt-5 overflow-x-auto rounded-xl border border-slate-700/60">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-900/90 text-slate-300 font-bold uppercase tracking-wider text-xs border-b border-slate-700/60">
              <th className="py-3.5 px-4">Claim ID</th>
              <th className="py-3.5 px-4">Payer</th>
              <th className="py-3.5 px-4">Charge</th>
              <th className="py-3.5 px-4">Service Date</th>
              <th className="py-3.5 px-4">Predicted Risk</th>
              <th className="py-3.5 px-4">Routing Decision</th>
              <th className="py-3.5 px-4">Flagged Reason</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/40">
            {filteredClaims.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-10 text-center text-sm font-medium text-slate-400">
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
                    <td className="py-3 px-4 font-mono font-bold text-white text-sm">
                      {claim.claim_id}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-200">
                      {claim.payer_id}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-100">
                      {formatCurrency(claim.claim_amount)}
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-medium">
                      {formatDate(claim.service_date)}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-sm">
                      <span className={config.textClass}>
                        {formatPercentage(claim.risk_score)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-black border uppercase ${config.badgeClass}`}>
                        {config.label}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {claim.predicted_reason_code ? (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded font-mono text-xs font-bold border ${carcMeta?.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                          {claim.predicted_reason_code}
                        </span>
                      ) : (
                        <span className="text-slate-500 font-mono text-sm">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onSelectClaim(claim)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 text-xs sm:text-sm font-bold transition cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
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
