import React from 'react';
import { ChevronRight, Eye, AlertTriangle, ShieldCheck, Clock, ShieldAlert } from 'lucide-react';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import { ROUTING_CONFIG, CARC_TAXONOMY } from '../utils/constants';

export default function RecentClaimsCard({ claims, loading, onSelectClaim, onViewAll }) {
  const displayClaims = (claims || []).slice(0, 5);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
      {/* Header matching claimsai.work */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
        <div>
          <h2 className="text-sm font-bold text-white">Recent Claims Triage</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Operational claims evaluated across pre-submission guardrails
          </p>
        </div>
        <button
          onClick={onViewAll}
          className="text-xs text-sky-400 font-semibold hover:text-sky-300 flex items-center gap-1 transition"
        >
          View all in Work Queue <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="px-6 py-10 text-center text-slate-400">
          <div className="w-6 h-6 border-2 border-sky-500/30 border-t-sky-400 rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs">Loading operational worklist...</p>
        </div>
      ) : displayClaims.length === 0 ? (
        <div className="px-6 py-10 text-center text-slate-400">
          <p className="text-xs">No recent claims in queue.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-800/80">
          {displayClaims.map((claim) => {
            const decisionKey = claim.routing_decision || "RELEASE";
            const config = ROUTING_CONFIG[decisionKey] || ROUTING_CONFIG.RELEASE;
            const carcMeta = claim.predicted_reason_code ? CARC_TAXONOMY[claim.predicted_reason_code] : null;

            return (
              <div
                key={claim.claim_id}
                onClick={() => onSelectClaim && onSelectClaim(claim)}
                className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-800/40 transition-colors gap-3 cursor-pointer group"
              >
                {/* Left: Claim ID, Patient, Specialty, Amount */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-white group-hover:text-sky-400 transition-colors">
                      {claim.claim_id}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      • {claim.patient_id}
                    </span>
                    {claim.predicted_reason_code && (
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold border ${carcMeta?.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                        {claim.predicted_reason_code}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {claim.provider_specialty || 'General Practice'} • <span className="font-mono text-slate-300">{formatCurrency(claim.claim_amount)}</span> • {claim.payer_id}
                  </p>
                </div>

                {/* Right: Score pill, Status badge, Inspect */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right hidden sm:block">
                    <span className={`text-xs font-mono font-bold ${config.textClass}`}>
                      {formatPercentage(claim.risk_score || 0.05)}
                    </span>
                    <span className="block text-[10px] text-slate-500 uppercase">Risk</span>
                  </div>

                  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${config.badgeClass}`}>
                    {config.label}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onSelectClaim) onSelectClaim(claim);
                    }}
                    className="p-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 transition"
                    title="Inspect Claim"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}