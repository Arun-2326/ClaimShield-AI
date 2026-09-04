import React, { useState, useEffect } from 'react';
import { auditClaimRules } from '../../api/client';
import { CheckCircle2, AlertTriangle, XCircle, RefreshCw, ShieldCheck, Zap } from 'lucide-react';

export default function RulesMatrix({ claimData, onToast }) {
  const [scrubResult, setScrubResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const runScrub = async () => {
    if (!claimData) return;
    setLoading(true);
    try {
      const res = await auditClaimRules(claimData);
      setScrubResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runScrub();
  }, [claimData]);

  if (loading && !scrubResult) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs flex items-center justify-center space-x-2">
        <div className="w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
        <span>Executing Clearinghouse Pre-Submission Rules Engine...</span>
      </div>
    );
  }

  if (!scrubResult) return null;

  const { clean_claim_score, total_rules, passed, warnings, failed, rules = [] } = scrubResult;

  return (
    <div className="space-y-4">
      {/* Top Scrubbing Summary Card (LEVEL 1: MAIN COMMAND) */}
      <div className="hud-card-major p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4 animate-main-pulse">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 shadow-md shadow-cyan-500/20">
            <Zap className="w-6 h-6 text-cyan-400 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="badge-major text-[9px]">
                ◈ Level 1: Clearinghouse Scrubbing Engine
              </span>
              <span className="badge-sub text-[9px]">
                Rule Base v2.4.1
              </span>
            </div>
            <h3 className="text-sm uppercase font-bold tracking-wider text-slate-100 mt-1">
              Deterministic Clearinghouse Pre-Submission Matrix
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Clinical edits, CMS timely filing limits, LCD medical necessity, and NCCI PTP bundling rules.
            </p>
          </div>
        </div>

        {/* Clean Claim Score & Stats */}
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Clean Claim Score</span>
            <span className={`text-2xl font-black font-mono tracking-tight ${clean_claim_score >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {clean_claim_score}%
            </span>
          </div>

          <div className="flex items-center space-x-1.5 text-xs font-mono">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold text-[11px]">
              {passed} Pass
            </span>
            {warnings > 0 && (
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold text-[11px]">
                {warnings} Warn
              </span>
            )}
            {failed > 0 && (
              <span className="px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-300 border border-rose-500/30 font-bold text-[11px]">
                {failed} Block
              </span>
            )}
          </div>

          <button
            onClick={runScrub}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-800/90 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/40 transition-colors"
            title="Re-run Scrubber"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Rules Matrix List (LEVEL 2: SUB-ITEMS) */}
      <div className="space-y-2.5">
        {rules.map((rule) => {
          let statusBadge = {
            bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
            icon: CheckCircle2,
            label: 'PASSED'
          };
          if (rule.status === 'WARN') {
            statusBadge = {
              bg: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
              icon: AlertTriangle,
              label: 'WARNING'
            };
          } else if (rule.status === 'FAIL') {
            statusBadge = {
              bg: 'bg-rose-500/15 border-rose-500/40 text-rose-300',
              icon: XCircle,
              label: 'BLOCKED'
            };
          }

          const StatusIcon = statusBadge.icon;

          return (
            <div
              key={rule.rule_id}
              className={`hud-card-sub p-4 rounded-xl flex items-start justify-between gap-3 text-xs ${
                rule.status === 'FAIL'
                  ? 'border-l-rose-500/90 bg-rose-950/20'
                  : rule.status === 'WARN'
                  ? 'border-l-amber-500/90 bg-amber-950/20'
                  : ''
              }`}
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-[10px] text-sky-400 font-bold">
                    {rule.rule_id}
                  </span>
                  <span className="font-semibold text-slate-200">
                    {rule.rule_name}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono px-1.5 rounded bg-slate-800">
                    {rule.category}
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  {rule.message}
                </p>
                {rule.remediation && (
                  <div className="pt-1 text-[11px] text-amber-300/90 font-medium flex items-center space-x-1.5">
                    <span>Remedy:</span>
                    <span>{rule.remediation}</span>
                  </div>
                )}
              </div>

              <div className={`px-2.5 py-1 rounded-full border flex items-center space-x-1 font-mono font-bold text-[10px] shrink-0 ${statusBadge.bg}`}>
                <StatusIcon className="w-3 h-3" />
                <span>{statusBadge.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
