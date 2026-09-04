import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertTriangle, XCircle, Ban, Clock, DollarSign, FileText } from 'lucide-react';
import { recordOutcome } from '../../api/client';

export default function ClaimDetailModal({ claimDetail, onClose, onOutcomeRecorded }) {
  if (!claimDetail) return null;

  const { claim, latest_prediction, actual_outcome } = claimDetail;
  const [outcomeStatus, setOutcomeStatus] = useState('PAID');
  const [outcomeReason, setOutcomeReason] = useState('CO-197');
  const [remittanceAmount, setRemittanceAmount] = useState(claim.claim_amount || 0);
  const [submittingOutcome, setSubmittingOutcome] = useState(false);
  const [outcomeSuccess, setOutcomeSuccess] = useState(null);
  const [isClosing, setIsClosing] = useState(false);

  // Handle ESC key to close with animation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') triggerClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const triggerClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 200); // match animation duration
  };

  const handleLogOutcome = async (e) => {
    e.preventDefault();
    setSubmittingOutcome(true);
    try {
      const res = await recordOutcome({
        claim_id: claim.claim_id,
        actual_status: outcomeStatus,
        actual_reason_code: outcomeStatus === 'DENIED' ? outcomeReason : null,
        remittance_amount: outcomeStatus === 'PAID' ? parseFloat(remittanceAmount) : 0.0
      });
      setOutcomeSuccess('Simulated payer adjudication outcome successfully logged!');
      if (onOutcomeRecorded) onOutcomeRecorded(res);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingOutcome(false);
    }
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
        className={`w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col transition-all duration-200 transform ${
          isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100 animate-scale-in'
        }`}
      >
        {/* Modal Header */}
        <div className="p-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className="font-mono font-bold text-sm text-sky-400">
              {claim.claim_id}
            </span>
            <span className="text-xs text-slate-400">| Patient: {claim.patient_id}</span>
          </div>
          <button
            onClick={triggerClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all transform hover:rotate-90 duration-200 active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* Claim Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-950/70 rounded-xl border border-slate-800">
            <div>
              <span className="text-[11px] text-slate-400 block">Payer</span>
              <span className="font-semibold text-slate-200">{claim.payer_name || claim.payer_id}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Billed Amount</span>
              <span className="font-mono font-bold text-emerald-400">${claim.claim_amount.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Service Date</span>
              <span className="font-mono text-slate-200">{claim.service_date}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">CPT Codes</span>
              <span className="font-mono text-slate-200">{claim.cpt_codes.join(', ')}</span>
            </div>
          </div>

          {/* Latest Prediction Section */}
          {latest_prediction && (
            <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-750 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-slate-400">
                  Pre-Submission Model Evaluation
                </span>
                <span className="font-mono text-[11px] text-sky-400">
                  Denial Risk: {(latest_prediction.risk_score * 100).toFixed(0)}%
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-200 font-bold font-mono">
                  {latest_prediction.routing_decision}
                </span>
                {latest_prediction.predicted_reason_code && (
                  <span className="px-2 py-1 rounded-md bg-sky-500/20 text-sky-300 font-mono font-bold border border-sky-500/30">
                    {latest_prediction.predicted_reason_code}
                  </span>
                )}
              </div>

              <p className="text-slate-300 leading-relaxed">
                {latest_prediction.recommended_action}
              </p>
            </div>
          )}

          {/* Outcome Logging Form (Simulated Closed Loop) */}
          <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-slate-200 uppercase tracking-wider">
                Simulate Payer Adjudication Outcome (ERA 835 Feedback)
              </h4>
              <span className="text-[10px] text-amber-400 font-mono">
                Model Monitoring
              </span>
            </div>

            {actual_outcome ? (
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-700 text-xs space-y-1">
                <span className="text-slate-400 block">Recorded Adjudication Status:</span>
                <span className="font-mono font-bold text-slate-200">
                  {actual_outcome.actual_status}
                  {actual_outcome.actual_reason_code ? ` (${actual_outcome.actual_reason_code})` : ''}
                </span>
              </div>
            ) : outcomeSuccess ? (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-lg">
                {outcomeSuccess}
              </div>
            ) : (
              <form onSubmit={handleLogOutcome} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Simulated Status</label>
                    <select
                      value={outcomeStatus}
                      onChange={(e) => setOutcomeStatus(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded text-slate-200"
                    >
                      <option value="PAID">PAID in Full</option>
                      <option value="DENIED">DENIED by Payer</option>
                    </select>
                  </div>

                  {outcomeStatus === 'DENIED' && (
                    <div>
                      <label className="block text-slate-400 mb-1">Actual CARC Code</label>
                      <select
                        value={outcomeReason}
                        onChange={(e) => setOutcomeReason(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded text-slate-200 font-mono"
                      >
                        <option value="CO-197">CO-197 (Pre-Auth)</option>
                        <option value="CO-27">CO-27 (Eligibility)</option>
                        <option value="CO-29">CO-29 (Timely Filing)</option>
                        <option value="CO-50">CO-50 (Med Necessity)</option>
                        <option value="CO-16">CO-16 (Documentation)</option>
                        <option value="CO-96">CO-96 (Non-Covered)</option>
                        <option value="CO-97">CO-97 (Bundling)</option>
                        <option value="CO-18">CO-18 (Duplicate)</option>
                      </select>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submittingOutcome}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-semibold text-xs transition-all transform hover:-translate-y-0.5 active:scale-95 shadow-md shadow-sky-500/20"
                >
                  {submittingOutcome ? 'Recording...' : 'Log Simulated Outcome to Feedback Loop'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-850 border-t border-slate-800 flex justify-end">
          <button
            onClick={triggerClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors active:scale-95"
          >
            Close Inspection
          </button>
        </div>
      </div>
    </div>
  );
}
