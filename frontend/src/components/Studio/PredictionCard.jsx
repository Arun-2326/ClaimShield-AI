import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Ban, 
  HelpCircle, 
  Lightbulb, 
  FileText,
  AlertCircle
} from 'lucide-react';

export default function PredictionCard({ prediction }) {
  if (!prediction) return null;

  const {
    routing_decision,
    routing_reason,
    risk_tier,
    predicted_reason_code,
    reason_description,
    reason_confidence,
    recommended_action,
    validation_warnings = []
  } = prediction;

  let decisionBadge = {
    bg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-emerald-500/10',
    title: 'RELEASE FOR SUBMISSION',
    icon: CheckCircle2,
    sub: 'Clean Claim — Cleared for electronic transmission'
  };

  if (routing_decision === 'REVIEW') {
    decisionBadge = {
      bg: 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-amber-500/10',
      title: 'MANUAL REVIEW REQUIRED',
      icon: AlertTriangle,
      sub: 'Moderate denial probability or low confidence threshold'
    };
  } else if (routing_decision === 'HOLD_FOR_CORRECTION') {
    decisionBadge = {
      bg: 'bg-red-500/15 border-red-500/40 text-red-300 shadow-red-500/10',
      title: 'HOLD FOR CORRECTION',
      icon: XCircle,
      sub: 'High denial risk — Prevent pre-submission rework'
    };
  } else if (routing_decision === 'BLOCK_UNTIL_VALID') {
    decisionBadge = {
      bg: 'bg-rose-950/80 border-rose-500/60 text-rose-300 shadow-rose-500/10',
      title: 'BLOCK UNTIL VALID',
      icon: Ban,
      sub: 'Deterministic validation failure or confirmed duplicate'
    };
  }

  const DecisionIcon = decisionBadge.icon;

  return (
    <div className="space-y-4 animate-scale-in">
      {/* 1. Main Routing Decision Banner */}
      <div className={`p-4 rounded-2xl border ${decisionBadge.bg} flex items-start space-x-3.5 shadow-xl transition-all duration-300 card-hover-glow`}>
        <div className="p-2.5 rounded-xl bg-black/30 shrink-0 mt-0.5">
          <DecisionIcon className="w-6 h-6 animate-pulse" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider font-bold">
              Routing Decision
            </span>
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-black/40 border border-white/10 font-bold">
              Tier: {risk_tier.toUpperCase()}
            </span>
          </div>
          <h2 className="text-xl font-black tracking-tight mt-0.5">
            {decisionBadge.title}
          </h2>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            {routing_reason}
          </p>
        </div>
      </div>

      {/* 2. Predicted CARC Reason (if indicated) */}
      {predicted_reason_code && (
        <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 shadow-lg animate-fade-in card-hover-glow">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-lg bg-sky-500/20 text-sky-300 font-mono font-bold text-xs border border-sky-500/30">
                {predicted_reason_code}
              </span>
              <span className="text-xs font-bold text-slate-200">
                Most Likely Denial Reason (CARC)
              </span>
            </div>
            {reason_confidence && (
              <span className="text-[11px] font-mono text-slate-400">
                Confidence: {(reason_confidence * 100).toFixed(0)}%
              </span>
            )}
          </div>
          <p className="text-xs text-slate-300 leading-relaxed pl-1">
            {reason_description}
          </p>
        </div>
      )}

      {/* 3. Recommended Remedial Action */}
      <div className="p-4 bg-sky-950/40 rounded-2xl border border-sky-800/40 shadow-lg animate-fade-in card-hover-glow">
        <div className="flex items-center space-x-2 mb-2 text-sky-400">
          <Lightbulb className="w-4 h-4 text-amber-400 animate-pulse" />
          <h3 className="text-xs uppercase tracking-wider font-bold">
            Recommended Preventive Action
          </h3>
        </div>
        <p className="text-xs text-slate-200 leading-relaxed pl-1 font-medium">
          {recommended_action}
        </p>
      </div>

      {/* 4. Non-blocking Validation Warnings */}
      {validation_warnings.length > 0 && (
        <div className="p-3.5 bg-amber-950/30 rounded-2xl border border-amber-500/40 animate-fade-in">
          <div className="flex items-center space-x-1.5 text-amber-400 text-xs font-semibold mb-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Pre-Submission Non-Blocking Warnings ({validation_warnings.length})</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {validation_warnings.map((w, i) => (
              <li key={i} className="flex items-start space-x-2">
                <span className="font-mono text-[10px] text-amber-400/90 shrink-0 mt-0.5">[{w.code}]</span>
                <span className="text-slate-300">{w.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
