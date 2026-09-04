import React from 'react';
import { ShieldCheck, AlertTriangle, XCircle, ShieldAlert, CheckCircle, HelpCircle, ArrowRight, Zap } from 'lucide-react';
import { ROUTING_CONFIG, CARC_TAXONOMY } from '../utils/constants';
import { formatPercentage } from '../utils/formatters';

export default function PredictionCard({ prediction, onOpenWhatIf }) {
  if (!prediction) return null;

  const decisionKey = prediction.routing_decision || "RELEASE";
  const config = ROUTING_CONFIG[decisionKey] || ROUTING_CONFIG.RELEASE;
  const carcMeta = prediction.predicted_reason_code ? CARC_TAXONOMY[prediction.predicted_reason_code] : null;

  const riskPercent = (prediction.risk_score || 0) * 100;

  // Gauge bar color based on risk score
  const getMeterColor = (score) => {
    if (score < 0.30) return "from-emerald-500 to-teal-400";
    if (score <= 0.70) return "from-amber-500 to-yellow-400";
    return "from-rose-600 to-red-500";
  };

  return (
    <div className={`rounded-2xl border ${config.bgCard} p-5 shadow-2xl transition-all`}>
      {/* Top Banner: Routing Disposition */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-700/60">
        <div>
          <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Pre-Submission Disposition</div>
          <div className="flex items-center gap-2.5 mt-1">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-black tracking-wide border uppercase ${config.badgeClass}`}>
              {decisionKey === "RELEASE" && <ShieldCheck className="w-4 h-4" />}
              {decisionKey === "REVIEW" && <AlertTriangle className="w-4 h-4" />}
              {decisionKey === "HOLD_FOR_CORRECTION" && <ShieldAlert className="w-4 h-4" />}
              {decisionKey === "BLOCK_UNTIL_VALID" && <XCircle className="w-4 h-4" />}
              {config.label}
            </span>
            <span className="text-xs font-mono text-slate-400">Claim: {prediction.claim_id}</span>
          </div>
        </div>

        {/* What-If Simulation Trigger Button */}
        {onOpenWhatIf && decisionKey !== "RELEASE" && (
          <button
            onClick={onOpenWhatIf}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold text-sky-200 bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 transition shadow-sm"
          >
            <Zap className="w-3.5 h-3.5 text-sky-400" />
            Launch What-If Remediation
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Main Stats: Denial Risk Meter & CARC Reason */}
      <div className="flex flex-col gap-4 mt-4">
        {/* Denial Risk Probability Meter */}
        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Predicted Denial Risk</span>
              <span className={`text-3xl font-black font-mono ${config.textClass}`}>
                {prediction.risk_score !== undefined ? `${(prediction.risk_score * 100).toFixed(1)}%` : "0.0%"}
              </span>
            </div>

            {/* Visual Meter Bar */}
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden mt-3 relative">
              {/* Threshold markers */}
              <div className="absolute left-[30%] top-0 bottom-0 w-0.5 bg-slate-600 z-10" title="Low / Review boundary (30%)" />
              <div className="absolute left-[70%] top-0 bottom-0 w-0.5 bg-slate-600 z-10" title="Review / Hold boundary (70%)" />
              <div
                className={`h-full bg-gradient-to-r ${getMeterColor(prediction.risk_score)} transition-all duration-700`}
                style={{ width: `${Math.min(100, Math.max(4, riskPercent))}%` }}
              />
            </div>

            <div className="flex justify-between text-[10px] text-slate-400 mt-1.5 font-mono">
              <span>0% (Clean)</span>
              <span className="text-slate-400">30% (Review)</span>
              <span className="text-slate-400">70% (Hold)</span>
              <span>100%</span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-xs text-slate-400">
            <span className="text-slate-300 font-medium">Routing Policy: </span>
            {prediction.routing_reason}
          </div>
        </div>

        {/* Predicted CARC Reason */}
        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400">Predicted Denial Code (CARC)</span>
              {prediction.reason_confidence !== null && prediction.reason_confidence !== undefined && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  Confidence: {formatPercentage(prediction.reason_confidence)}
                </span>
              )}
            </div>

            {prediction.predicted_reason_code ? (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded font-mono font-bold text-sm border ${carcMeta?.badgeColor || 'bg-slate-800 text-slate-200 border-slate-700'}`}>
                    {prediction.predicted_reason_code}
                  </span>
                  <span className="text-sm font-semibold text-white">
                    {carcMeta?.category || "Adjudication Adjustment"}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {prediction.reason_description || carcMeta?.plain_language}
                </p>
              </div>
            ) : (
              <div className="py-3 flex items-center gap-2 text-emerald-400">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">No CARC denial risk identified. Clean claim structure.</span>
              </div>
            )}
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Model: {prediction.model_version || "demo-v1"}</span>
            <span>Policy: {prediction.policy_version || "routing-v1"}</span>
          </div>
        </div>
      </div>

      {/* Validation Warnings (Non-Reference Codes & Soft Warnings) */}
      {prediction.validation_warnings && prediction.validation_warnings.length > 0 && (
        <div
          role="alert"
          data-testid="validation-warnings"
          className="mt-4 p-4 bg-amber-500/15 border-2 border-amber-500/40 rounded-xl space-y-2 shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold text-amber-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Validation Warnings — Non-Reference Codes & Pre-Submission Alerts ({prediction.validation_warnings.length})</span>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Non-blocking: Analysis Allowed
            </span>
          </div>
          <p className="text-xs text-amber-200/80">
            Unknown demo codes and non-reference parameters generate validation warnings while still allowing pre-submission risk scoring:
          </p>
          <ul className="text-xs text-amber-200/90 list-disc list-inside space-y-1 pt-1">
            {prediction.validation_warnings.map((w, idx) => (
              <li key={idx} className="leading-relaxed">
                <span className="font-mono font-bold text-amber-300">{w.code}:</span> {w.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
