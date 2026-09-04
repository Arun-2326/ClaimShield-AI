import React, { useState, useEffect } from 'react';
import { fetchClaimsQueue, fetchClaimDetail } from '../../api/client';
import ClaimDetailModal from './ClaimDetailModal';
import { Search, Filter, RefreshCw, ChevronLeft, ChevronRight, Eye, ShieldAlert, CheckCircle2, AlertTriangle, XCircle, Ban, Download, Clock } from 'lucide-react';

export default function ClaimQueue({ onToast }) {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [tierFilter, setTierFilter] = useState('');
  const [decisionFilter, setDecisionFilter] = useState('');
  const [selectedClaimDetail, setSelectedClaimDetail] = useState(null);
  const [inspecting, setInspecting] = useState(false);

  const loadClaims = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (tierFilter) params.tier = tierFilter;
      if (decisionFilter) params.routing_decision = decisionFilter;
      const res = await fetchClaimsQueue(params);
      setClaims(res.claims || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error('Failed to load queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClaims();
  }, [page, tierFilter, decisionFilter]);

  const handleInspect = async (claimId) => {
    setInspecting(true);
    try {
      const detail = await fetchClaimDetail(claimId);
      setSelectedClaimDetail(detail);
    } catch (err) {
      console.error(err);
      if (onToast) onToast('Failed to fetch claim detail', 'error');
    } finally {
      setInspecting(false);
    }
  };

  const exportQueueCSV = () => {
    if (claims.length === 0) return;
    const headers = ['Claim_ID', 'Patient_ID', 'Payer', 'CPT_Codes', 'Amount', 'Service_Date', 'Denial_Risk', 'CARC', 'Routing_Decision'];
    const rows = claims.map((c) => [
      c.claim_id,
      c.patient_id,
      c.payer_name || c.payer_id,
      `"${c.cpt_codes.join(';')}"`,
      c.claim_amount,
      c.service_date,
      c.risk_score !== null ? (c.risk_score * 100).toFixed(1) + '%' : 'N/A',
      c.predicted_reason_code || 'None',
      c.routing_decision
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `claimshield_worklist_page_${page}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    if (onToast) onToast(`Exported ${claims.length} claims to CSV`, 'success');
  };

  const getDecisionBadge = (decision) => {
    switch (decision) {
      case 'RELEASE':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            <span>RELEASE</span>
          </span>
        );
      case 'REVIEW':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3" />
            <span>REVIEW</span>
          </span>
        );
      case 'HOLD_FOR_CORRECTION':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-500/15 text-red-400 border border-red-500/30">
            <XCircle className="w-3 h-3" />
            <span>HOLD</span>
          </span>
        );
      case 'BLOCK_UNTIL_VALID':
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-950/80 text-rose-300 border border-rose-500/50">
            <Ban className="w-3 h-3" />
            <span>BLOCK</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Filter & Bulk Toolbar */}
      <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-semibold flex items-center space-x-1">
            <Filter className="w-3.5 h-3.5 text-sky-400" />
            <span>Worklist Filter:</span>
          </span>
          {['', 'high', 'medium', 'low', 'error'].map((tier) => (
            <button
              key={tier}
              onClick={() => {
                setTierFilter(tier);
                setPage(1);
              }}
              className={`px-3 py-1 rounded-md capitalize font-medium transition-all text-xs ${
                tierFilter === tier
                  ? 'bg-sky-600 text-white font-bold shadow-sm'
                  : 'bg-slate-800/90 text-slate-300 hover:bg-slate-750 border border-slate-700/60'
              }`}
            >
              {tier || 'All Risk Tiers'}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={exportQueueCSV}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium border border-slate-700"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={loadClaims}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium border border-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* High-Density Claims Queue Table */}
      <div className="bg-slate-900/60 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-700/80 text-[10px]">
              <tr>
                <th className="py-3 px-4">Claim ID</th>
                <th className="py-3 px-4">Payer Destination</th>
                <th className="py-3 px-4">Billed CPT</th>
                <th className="py-3 px-4 text-right">Billed Amount</th>
                <th className="py-3 px-4 text-center">Service Date</th>
                <th className="py-3 px-4 text-center">Denial Probability</th>
                <th className="py-3 px-4 text-center">Predicted CARC</th>
                <th className="py-3 px-4 text-center">Routing Decision</th>
                <th className="py-3 px-4 text-right">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading && claims.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                      <span>Loading claims worklist...</span>
                    </div>
                  </td>
                </tr>
              ) : claims.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No claims match the active filter criteria.
                  </td>
                </tr>
              ) : (
                claims.map((claim) => (
                  <tr key={claim.claim_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-sky-400 whitespace-nowrap">
                      {claim.claim_id}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-200">
                      {claim.payer_name || claim.payer_id}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300 whitespace-nowrap">
                      {claim.cpt_codes.join(', ')}
                    </td>
                    <td className="py-3 px-4 font-mono text-right text-emerald-400 font-semibold whitespace-nowrap">
                      ${claim.claim_amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap font-mono text-slate-400 text-[11px]">
                      {claim.service_date}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {claim.risk_score !== null && claim.risk_score !== undefined ? (
                        <span
                          className={`font-mono font-bold ${
                            claim.risk_score < 0.3
                              ? 'text-emerald-400'
                              : claim.risk_score <= 0.7
                              ? 'text-amber-400'
                              : 'text-rose-400'
                          }`}
                        >
                          {(claim.risk_score * 100).toFixed(0)}%
                        </span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {claim.predicted_reason_code ? (
                        <span className="px-2 py-0.5 rounded bg-sky-500/15 text-sky-300 border border-sky-500/30 font-mono font-bold">
                          {claim.predicted_reason_code}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">None</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {getDecisionBadge(claim.routing_decision)}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleInspect(claim.claim_id)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-medium transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-sky-400" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3 bg-slate-800/40 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>
            Showing <strong>{claims.length}</strong> of <strong>{total}</strong> claims staged
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-750 border border-slate-750 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-xs">Page {page}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={claims.length < 10}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-750 border border-slate-750 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Inspect Modal */}
      {selectedClaimDetail && (
        <ClaimDetailModal
          claimDetail={selectedClaimDetail}
          onClose={() => setSelectedClaimDetail(null)}
          onOutcomeRecorded={() => {
            loadClaims();
            setSelectedClaimDetail(null);
            if (onToast) onToast('Simulated ERA 835 remittance outcome logged successfully!', 'success');
          }}
        />
      )}
    </div>
  );
}
