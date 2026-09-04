import React from 'react';
import { Shield, ShieldAlert, Activity, FileSpreadsheet, BarChart3, Database } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, health, onOpenAnalytics, onOpenUpload }) {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 shadow-lg shadow-sky-500/20 text-white">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-white">ClaimShield</span>
                <span className="px-1.5 py-0.5 rounded text-[11px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">AI</span>
                <span className="text-xs text-slate-400 hidden md:inline">| Pre-Submission Prevention</span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Preventing RCM Denials Before EDI 837 Transmission</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <button
              onClick={() => setActiveTab('inspector')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'inspector'
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              <Activity className="w-4 h-4" />
              Live Inspector
            </button>
            <button
              onClick={() => setActiveTab('queue')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'queue'
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              <Database className="w-4 h-4" />
              Work Queue
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'analytics'
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              ML Transparency
            </button>
          </nav>

          {/* Quick Actions & Status */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenUpload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 transition"
              title="Upload synthetic CSV for batch pre-submission scoring"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Batch CSV</span>
            </button>

            {/* Health pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
              <div className={`w-2 h-2 rounded-full ${health?.model_loaded ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
              <span className="font-mono text-[11px] text-slate-400">
                {health?.model_loaded ? (health.model_version || 'v1.0') : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
