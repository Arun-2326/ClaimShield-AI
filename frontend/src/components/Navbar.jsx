import React from 'react';
import { Shield, ShieldAlert, Activity, FileSpreadsheet, BarChart3, Database } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, health, onOpenAnalytics, onOpenUpload }) {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40">
      {/* Persistent Disclaimer Banner */}
      <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-1.5 text-center text-sm font-medium text-amber-300 flex items-center justify-center gap-2.5">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-black bg-amber-500/25 text-amber-200 border border-amber-500/50 uppercase tracking-wide">
          Simulated / Demo Data
        </span>
        <span className="text-xs sm:text-sm font-medium text-amber-200/90">
          Microsoft Innovation Club (VIT Chennai) — Internal prototype on synthetic data. No real PHI or payer connectivity.
        </span>
      </div>

      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 shadow-lg shadow-sky-500/25 text-white">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-white">ClaimShield</span>
                <span className="px-2 py-0.5 rounded-md text-xs font-extrabold bg-sky-500/20 text-sky-400 border border-sky-500/30">AI</span>
                <span className="text-sm text-slate-300 font-semibold hidden md:inline">| Pre-Submission Prevention</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 font-medium">Preventing RCM Denials Before EDI 837 Transmission</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/60">
            <button
              onClick={() => setActiveTab('inspector')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm sm:text-base font-bold transition-all ${
                activeTab === 'inspector'
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Activity className="w-4 h-4" />
              Live Inspector
            </button>
            <button
              onClick={() => setActiveTab('queue')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm sm:text-base font-bold transition-all ${
                activeTab === 'queue'
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Database className="w-4 h-4" />
              Work Queue
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm sm:text-base font-bold transition-all ${
                activeTab === 'analytics'
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              ML Transparency
            </button>
          </nav>

          {/* Quick Actions & Status */}
          <div className="flex items-center gap-3.5">
            <button
              onClick={onOpenUpload}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 transition shadow-sm"
              title="Upload synthetic CSV for batch pre-submission scoring"
            >
              <FileSpreadsheet className="w-4 h-4 text-sky-400" />
              <span className="hidden sm:inline">Batch CSV</span>
            </button>

            {/* Health pill */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-slate-700 text-xs font-semibold text-slate-200 shadow-sm">
              <div className={`w-2.5 h-2.5 rounded-full ${health?.model_loaded ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
              <span className="font-mono text-xs font-bold text-slate-300">
                {health?.model_loaded ? (health.model_version || 'v1.0') : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
