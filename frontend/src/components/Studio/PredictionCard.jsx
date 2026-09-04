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
      {/* 1. Main Routing Decision Banner (LEVEL 1: MAIN COMMAND) */}
      <div className={`hud-card-major p-5 rounded-2xl border ${decisionBadge.bg} flex items-start space-x-4 shadow-2xl transition-all duration-300 animate-main-pulse`}>
        <div className="p-3 rounded-xl bg-black/40 shrink-0 mt-0.5 shadow-inner">
          <DecisionIcon className="w-7 h-7 animate-bounce" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="badge-major text-[9px]">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping inline-block" />
              ◈ Level 1: Primary Routing Decision
            </span>
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-black/50 border border-white/20 font-bold">
              AI TIER: {risk_tier.toUpperCase()}
            </span>
          </div>
          <h2 className="text-xl font-black tracking-tight mt-1.5 text-white drop-shadow-md">
            {decisionBadge.title}
          </h2>
          <p className="text-xs text-slate-200 mt-1 leading-relaxed font-medium">
            {routing_reason}
          </p>
        </div>
      </div>

      {/* 2. Predicted CARC Reason (LEVEL 2: SUB-DIAGNOSTIC) */}
      {predicted_reason_code && (
        <div className="hud-card-sub p-4 rounded-xl shadow-md animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="badge-sub text-[10px] bg-indigo-500/20 text-indigo-300 border-indigo-500/40 font-mono font-bold">
                {predicted_reason_code}
              </span>
              <span className="text-xs font-bold text-slate-200">
                Most Likely Denial Reason (CARC)
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="badge-sub text-[9px]">◇ SUB-DIAGNOSTIC</span>
              {reason_confidence && (
                <span className="text-[11px] font-mono text-slate-400">
                  Confidence: {(reason_confidence * 100).toFixed(0)}%
                </span>
              )}
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed pl-1 font-mono">
            {reason_description}
          </p>
        </div>
      )}

      {/* 3. Recommended Remedial Action (LEVEL 2: SUB-ACTION) */}
      <div className="hud-card-sub p-4 rounded-xl shadow-md animate-fade-in">
        <div className="flex items-center justify-between mb-2 text-indigo-400">
          <div className="flex items-center space-x-2">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs uppercase tracking-wider font-bold text-slate-200">
              Recommended Preventive Action
            </h3>
          </div>
          <span className="badge-sub text-[9px]">◇ SUB-ACTION</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed pl-1">
          {recommended_action}
        </p>
      </div>

      {/* 4. Non-blocking Validation Warnings (LEVEL 2: SUB-WARNINGS) */}
      {validation_warnings.length > 0 && (
        <div className="hud-card-sub p-3.5 rounded-xl border-l-amber-500/80 animate-fade-in">
          <div className="flex items-center justify-between text-amber-400 text-xs font-semibold mb-2">
            <div className="flex items-center space-x-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Pre-Submission Non-Blocking Warnings ({validation_warnings.length})</span>
            </div>
            <span className="badge-sub text-[9px]">◇ SUB-WARNING</span>
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
