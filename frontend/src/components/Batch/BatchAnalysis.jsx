import React, { useState } from 'react';
import { SAMPLE_PRESETS } from '../../data/samplePresets';
import { batchPredictClaims } from '../../api/client';
import { UploadCloud, Play, CheckCircle2, AlertTriangle, XCircle, Ban, DollarSign, Download } from 'lucide-react';

export default function BatchAnalysis() {
  const [loading, setLoading] = useState(false);
  const [batchResult, setBatchResult] = useState(null);

  const handleRunSampleBatch = async () => {
    setLoading(true);
    try {
      // Build a demo batch of 10 claims by combining presets and variants
      const sampleClaims = [
        ...SAMPLE_PRESETS.map((p) => p.data),
        {
          claim_id: 'CLM_BATCH_006',
          patient_id: 'PAT_99206',
          payer_id: 'PAYER_005',
          cpt_codes: ['80053'],
          icd_codes: ['Z00.00'],
          claim_amount: 195.0,
          service_date: '2026-08-20',
          prior_auth_flag: false,
          eligibility_verified: true,
          days_since_eligibility_check: 12,
          provider_specialty: 'Internal Medicine',
          documentation_complete: true,
          duplicate_candidate: false
        },
        {
          claim_id: 'CLM_BATCH_007',
          patient_id: 'PAT_99207',
          payer_id: 'PAYER_002',
          cpt_codes: ['93000'],
          icd_codes: ['R07.9'],
          claim_amount: 240.0,
          service_date: '2026-08-24',
          prior_auth_flag: false,
          eligibility_verified: true,
          days_since_eligibility_check: 2,
          provider_specialty: 'Cardiology',
          documentation_complete: true,
          duplicate_candidate: false
        }
      ];

      const res = await batchPredictClaims(sampleClaims, false);
      setBatchResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exportResultsJSON = () => {
    if (!batchResult) return;
    const blob = new Blob([JSON.stringify(batchResult, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'claimshield_batch_audit_results.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Batch Header & Action */}
      <div className="p-5 bg-slate-900/60 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-200">
            Pre-Submission Batch Claim Screening
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit entire 837 claim files before transmission to detect systemic denial risks.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleRunSampleBatch}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold text-xs shadow hover:from-sky-400 hover:to-indigo-500 disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Screening Batch...' : 'Screen Sample 837 Batch (7 Claims)'}</span>
          </button>

          {batchResult && (
            <button
              onClick={exportResultsJSON}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold text-xs border border-slate-700"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Audit</span>
            </button>
          )}
        </div>
      </div>

      {/* Batch Summary Results */}
      {batchResult && (
        <div className="space-y-4 animate-fade-in">
          {/* Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Total Claims</span>
              <span className="text-xl font-bold font-mono text-slate-200">
                {batchResult.total_claims}
              </span>
            </div>

            <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Total Billed Volume</span>
              <span className="text-xl font-bold font-mono text-emerald-400">
                ${batchResult.total_billed_amount.toLocaleString()}
              </span>
            </div>

            <div className="p-3.5 bg-slate-900/60 rounded-xl border border-rose-500/30">
              <span className="text-slate-400 block text-[11px]">At-Risk Dollars Held</span>
              <span className="text-xl font-bold font-mono text-rose-400">
                ${batchResult.at_risk_amount.toLocaleString()}
              </span>
            </div>

            <div className="p-3.5 bg-slate-900/60 rounded-xl border border-sky-500/30">
              <span className="text-slate-400 block text-[11px]">Estimated Rework Saved</span>
              <span className="text-xl font-bold font-mono text-sky-400">
                ${batchResult.prevented_rework_savings.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Table of Batch Items */}
          <div className="bg-slate-900/60 rounded-xl border border-slate-800 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Claim ID</th>
                    <th className="py-3 px-4 text-center">Denial Probability</th>
                    <th className="py-3 px-4 text-center">Predicted CARC</th>
                    <th className="py-3 px-4 text-center">Routing Decision</th>
                    <th className="py-3 px-4">Remedial Prevention Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {batchResult.results.map((r) => (
                    <tr key={r.claim_id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono font-bold text-sky-400 whitespace-nowrap">
                        {r.claim_id}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span
                          className={`font-mono font-bold ${
                            r.risk_score < 0.3
                              ? 'text-emerald-400'
                              : r.risk_score <= 0.7
                              ? 'text-amber-400'
                              : 'text-rose-400'
                          }`}
                        >
                          {(r.risk_score * 100).toFixed(0)}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {r.predicted_reason_code ? (
                          <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 font-mono font-bold">
                            {r.predicted_reason_code}
                          </span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            r.routing_decision === 'RELEASE'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : r.routing_decision === 'REVIEW'
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              : r.routing_decision === 'HOLD_FOR_CORRECTION'
                              ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                              : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                          }`}
                        >
                          {r.routing_decision}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300 max-w-md truncate">
                        {r.recommended_action}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
