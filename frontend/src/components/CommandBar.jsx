import React from 'react';
import { Building2, Activity, Zap, Search, Server, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function CommandBar({ searchQuery, setSearchQuery }) {
  return (
    <div className="bg-slate-900/90 border-b border-slate-800 text-xs text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Active Facility Context */}
        <div className="flex items-center space-x-2.5">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-800/90 border border-slate-700/80 text-slate-200">
            <Building2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="font-semibold truncate max-w-[220px] sm:max-w-xs">
              Memorial Hermann Health System
            </span>
            <span className="text-[10px] text-slate-400 font-mono hidden md:inline">
              (NPI: 1982001402)
            </span>
          </div>

          <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hidden lg:inline-flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Clearinghouse 270/271 Active</span>
          </span>
        </div>

        {/* Center: Search / Filter input */}
        <div className="relative flex-1 max-w-xs hidden sm:block">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
          <input
            type="text"
            placeholder="Search claims, CPT, CARC code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-12 py-1 bg-slate-950/80 border border-slate-700/80 rounded-md text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-sky-500 font-sans"
          />
          <span className="absolute right-2 top-1.5 text-[9px] font-mono text-slate-500 border border-slate-700 px-1 rounded">
            Ctrl+K
          </span>
        </div>

        {/* Right: Live Telemetry Metrics */}
        <div className="flex items-center space-x-3 text-[11px] font-mono text-slate-400">
          <div className="flex items-center space-x-1">
            <Activity className="w-3 h-3 text-sky-400" />
            <span>Latency: <strong className="text-slate-200">14ms</strong></span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center space-x-1 hidden sm:flex">
            <Zap className="w-3 h-3 text-amber-400" />
            <span>Scrubber: <strong className="text-slate-200">v2.4.1</strong></span>
          </div>
          <span className="text-slate-700 hidden sm:inline">|</span>
          <div className="flex items-center space-x-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>First-Pass Yield: <strong className="text-emerald-400">91.4%</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
