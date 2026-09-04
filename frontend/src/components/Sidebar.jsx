import React, { useState } from 'react';
import { 
  Sparkles, 
  Terminal, 
  Layers, 
  BarChart3, 
  UploadCloud, 
  Network, 
  ChevronLeft, 
  ChevronRight, 
  Volume2, 
  VolumeX, 
  Activity, 
  ShieldCheck, 
  Cpu
} from 'lucide-react';
import { cyberAudio } from '../utils/audio';

export default function Sidebar({ activePage, setActivePage, isCollapsed, setIsCollapsed, systemHealth }) {
  const [muted, setMuted] = useState(cyberAudio.isMuted());

  const navItems = [
    {
      id: 'studio',
      label: 'Quantum Studio',
      sublabel: 'Live Pre-Submission HUD',
      icon: Sparkles,
      badge: 'LIVE'
    },
    {
      id: 'edi',
      label: 'EDI 837P Cyber Terminal',
      sublabel: 'X12 Stream & Scrubber',
      icon: Terminal,
      badge: 'EDI 5010'
    },
    {
      id: 'queue',
      label: 'Defense Worklist',
      sublabel: 'SLA Queue & Adjudication',
      icon: Layers,
      badge: null
    },
    {
      id: 'intelligence',
      label: 'Neural Intelligence',
      sublabel: 'Confusion Matrix & ROI',
      icon: BarChart3,
      badge: '76.0%'
    },
    {
      id: 'batch',
      label: 'Batch Screener',
      sublabel: 'High-Throughput Audit',
      icon: UploadCloud,
      badge: null
    },
    {
      id: 'network',
      label: 'Payer Policy Network',
      sublabel: 'Rules Graph & CARC Taxonomy',
      icon: Network,
      badge: 'Graph'
    }
  ];

  const handleNavClick = (id) => {
    cyberAudio.playChirp();
    setActivePage(id);
  };

  const handleToggleMute = () => {
    const isNowMuted = cyberAudio.toggleMute();
    setMuted(isNowMuted);
    if (!isNowMuted) {
      cyberAudio.playChirp();
    }
  };

  return (
    <aside
      className={`bg-cyber-dark/95 border-r border-cyber-border/80 backdrop-blur-2xl transition-all duration-300 flex flex-col justify-between z-40 select-none ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* 1. Brand / Core Logo Area */}
      <div>
        <div className="p-4 border-b border-cyber-border/80 flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            {/* Animated Neural Core Icon */}
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 via-indigo-600 to-cyan-400 p-0.5 shadow-lg shadow-cyan-500/20 shrink-0 group">
              <div className="w-full h-full bg-cyber-bg rounded-[10px] flex items-center justify-center relative overflow-hidden">
                <ShieldCheck className="w-5 h-5 text-cyan-400 animate-pulse" />
                <span className="absolute inset-0 border border-cyan-400/40 rounded-[10px] animate-ping opacity-20 pointer-events-none" />
              </div>
            </div>

            {!isCollapsed && (
              <div className="truncate">
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-sm tracking-wider text-slate-100 uppercase">
                    Claim<span className="text-cyan-400">Shield</span>
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    AI 2050
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">
                  Pre-Submission Neural Engine
                </p>
              </div>
            )}
          </div>

          {/* Collapse / Expand Toggle */}
          <button
            onClick={() => {
              cyberAudio.playChirp();
              setIsCollapsed(!isCollapsed);
            }}
            className="p-1.5 rounded-lg bg-cyber-card/80 hover:bg-slate-800 text-slate-400 hover:text-cyan-400 border border-cyber-border/80 transition-colors"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* 2. Navigation Items List */}
        <nav className="p-3 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center rounded-xl transition-all duration-200 group relative ${
                  isCollapsed ? 'justify-center p-3' : 'justify-between px-3.5 py-3'
                } ${
                  isActive
                    ? 'hud-card-major bg-gradient-to-r from-cyan-950/60 to-indigo-950/40 border-cyan-400 text-cyan-200 shadow-xl shadow-cyan-500/20 animate-main-pulse'
                    : 'hud-card-sub text-slate-400 hover:text-indigo-200 hover:bg-slate-900/80 hover:translate-x-1'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <div className="flex items-center space-x-3 truncate">
                  <div className={`p-2 rounded-lg transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40' : 'bg-slate-800/80 text-slate-400 border border-slate-700/60'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  {!isCollapsed && (
                    <div className="text-left truncate">
                      <div className="flex items-center space-x-1.5">
                        <span className={`text-xs font-bold leading-tight ${isActive ? 'text-cyan-200' : 'text-slate-200 group-hover:text-indigo-200'}`}>
                          {item.label}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium truncate">
                        {item.sublabel}
                      </div>
                    </div>
                  )}
                </div>

                {!isCollapsed && item.badge && (
                  <span className={isActive ? 'badge-major text-[9px]' : 'badge-sub text-[9px]'}>
                    {item.badge}
                  </span>
                )}

                {/* Glowing Active Left Edge Notch */}
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-cyan-400 rounded-r shadow-md shadow-cyan-400" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* 3. Bottom Telemetry & Audio Control */}
      <div className="p-3 border-t border-cyber-border/80 space-y-2.5">
        {/* Telemetry Status Widget */}
        {!isCollapsed && (
          <div className="p-2.5 bg-cyber-bg/80 rounded-xl border border-cyber-border/80 text-[10px] font-mono space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center space-x-1">
                <Activity className="w-3 h-3 text-cyan-400" />
                <span>Clearinghouse EDI Link</span>
              </span>
              <span className="text-emerald-400 font-bold">ONLINE</span>
            </div>
            <div className="flex items-center justify-between text-slate-500">
              <span>Engine Spec</span>
              <span className="text-slate-300">FastAPI • Scikit 3.14</span>
            </div>
          </div>
        )}

        {/* Audio Mute & Info Strip */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} text-xs text-slate-400`}>
          <button
            onClick={handleToggleMute}
            className="flex items-center space-x-1.5 p-2 rounded-lg bg-cyber-card/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 border border-cyber-border/80 transition-colors"
            title={muted ? 'Unmute Cyber Audio' : 'Mute Cyber Audio'}
          >
            {muted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
            {!isCollapsed && <span>{muted ? 'Audio Muted' : 'Cyber FX Active'}</span>}
          </button>

          {!isCollapsed && (
            <span className="text-[10px] font-mono text-slate-500">
              v2.4-PRO
            </span>
          )}
        </div>
      </div>
    </aside>
  );
}
