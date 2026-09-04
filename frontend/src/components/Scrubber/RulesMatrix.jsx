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
      {/* Top Scrubbing Summary Card */}
      <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xs uppercase font-bold tracking-wider text-slate-200">
                Clearinghouse Pre-Submission Scrubbing Matrix
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                Rule Base v2.4.1
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Deterministic clinical, coverage, and coding edits applied before 837 generation.
            </p>
          </div>
        </div>

        {/* Clean Claim Score & Stats */}
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Clean Claim Score</span>
            <span className={`text-xl font-extrabold font-mono ${clean_claim_score >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {clean_claim_score}%
            </span>
          </div>

          <div className="flex items-center space-x-1.5 text-xs font-mono">
            <span className="px-2 py-1 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              {passed} Pass
            </span>
            {warnings > 0 && (
              <span className="px-2 py-1 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                {warnings} Warn
              </span>
            )}
            {failed > 0 && (
              <span className="px-2 py-1 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30">
                {failed} Fail
              </span>
            )}
          </div>

          <button
            onClick={runScrub}
            disabled={loading}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            title="Re-run Scrubber"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Rules Matrix List */}
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
              className={`p-3.5 rounded-xl border transition-colors flex items-start justify-between gap-3 text-xs ${
                rule.status === 'FAIL'
                  ? 'bg-rose-950/20 border-rose-500/30'
                  : rule.status === 'WARN'
                  ? 'bg-amber-950/20 border-amber-500/30'
                  : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900/90'
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
