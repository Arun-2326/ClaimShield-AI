import React from 'react';
import { ShieldAlert, ShieldCheck, Activity, Cpu, Menu, Sparkles, Radio } from 'lucide-react';
import { cyberAudio } from '../utils/audio';

export default function Header({ systemHealth, isCollapsed, setIsCollapsed }) {
  return (
    <header className="border-b border-cyber-border/80 bg-cyber-bg/90 backdrop-blur-2xl sticky top-0 z-30">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Mobile Toggle & Breadcrumb */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              cyberAudio.playChirp();
              setIsCollapsed(!isCollapsed);
            }}
            className="p-2 rounded-xl bg-cyber-card/80 border border-cyber-border/80 text-slate-300 hover:text-cyan-400 md:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>DEFENSE COCKPIT</span>
            </span>
            <span className="text-slate-600 hidden sm:inline">/</span>
            <span className="text-xs text-slate-300 font-medium hidden sm:inline">
              Memorial Hermann Health System (NPI: 1982001402)
            </span>
          </div>
        </div>

        {/* Right: Hackathon Tag, Simulated Data Badge & Neural Model Status */}
        <div className="flex items-center space-x-2.5">
          {/* Hackathon Badge */}
          <span className="hidden md:inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 shadow-sm shadow-cyan-500/10">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>MIC VIT CHENNAI 2026</span>
          </span>

          {/* Mandatory Simulated Data Disclaimer Badge */}
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold shadow-md shadow-amber-500/10">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400 animate-pulse shrink-0" />
            <span className="tracking-wide">SIMULATED / DEMO DATA</span>
          </div>

          {/* Neural Model Status */}
          <div className="hidden lg:flex items-center space-x-2 text-xs px-3 py-1 rounded-xl bg-cyber-card/80 border border-cyber-border/80 text-slate-300 font-mono">
            <div className={`w-2 h-2 rounded-full ${systemHealth?.model_loaded ? 'bg-cyan-400 shadow-md shadow-cyan-400' : 'bg-rose-500'}`} />
            <span className="text-[11px]">
              {systemHealth?.model_loaded ? `Neural Core: ${systemHealth.model_version}` : 'Calibrating...'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
