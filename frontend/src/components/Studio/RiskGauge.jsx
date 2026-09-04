import React from 'react';
import { Crosshair, AlertTriangle, ShieldCheck, Radio } from 'lucide-react';

export default function RiskGauge({ score = 0, tier = 'low', confidence = 0.8 }) {
  const pct = Math.min(Math.max(Math.round(score * 100), 0), 100);

  let strokeColor = '#10B981'; // Green
  let textColor = 'text-emerald-400';
  let badgeBg = 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300';
  let radarGlow = 'rgba(16, 185, 129, 0.5)';
  let hudStatus = 'CLEARED FOR SUBMISSION';

  if (tier === 'medium') {
    strokeColor = '#F59E0B'; // Amber
    textColor = 'text-amber-400';
    badgeBg = 'bg-amber-500/20 border-amber-500/40 text-amber-300';
    radarGlow = 'rgba(245, 158, 11, 0.5)';
    hudStatus = 'MANUAL SCRUB REQUIRED';
  } else if (tier === 'high') {
    strokeColor = '#EF4444'; // Red
    textColor = 'text-rose-400';
    badgeBg = 'bg-rose-500/20 border-rose-500/50 text-rose-300';
    radarGlow = 'rgba(239, 68, 68, 0.6)';
    hudStatus = 'PRE-SUBMISSION HAZARD INTERCEPTED';
  } else if (tier === 'error') {
    strokeColor = '#E11D48'; // Crimson
    textColor = 'text-rose-500';
    badgeBg = 'bg-rose-950/80 border-rose-500/60 text-rose-300';
    radarGlow = 'rgba(225, 29, 72, 0.7)';
    hudStatus = 'DETERMINISTIC VALIDATION BLOCKED';
  }

  const radius = 68;
  const circumference = 2 * Math.PI * radius; // 427.25
  // Fill circle proportionally to probability
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="hud-card-major p-6 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group animate-main-glow">
      {/* Background Holographic Scanline */}
      <div className="scanline-beam animate-scanline-sweep" />

      {/* Top HUD Telemetry Header */}
      <div className="w-full flex items-center justify-between text-[10px] font-mono text-slate-400 pb-2.5 border-b border-cyber-border/80 mb-2">
        <span className="badge-major text-[9px]">
          <Radio className="w-3 h-3 animate-pulse text-cyan-400" />
          <span>◈ Level 1: Neural Radar Scope</span>
        </span>
        <span className="badge-sub text-[9px]">RANGE: 0.0 - 1.0</span>
      </div>

      {/* Massive 360-Degree Animated Radar Scanner */}
      <div className="relative w-56 h-56 flex items-center justify-center my-2">
        {/* Concentric HUD Reticles */}
        <div className="absolute inset-0 rounded-full border border-cyber-border/50" />
        <div className="absolute inset-6 rounded-full border border-dashed border-cyber-border/40 animate-spin-slow" />
        <div className="absolute inset-14 rounded-full border border-cyber-border/30" />

        {/* Crosshair Laser Lines */}
        <div className="absolute inset-x-0 top-1/2 h-[1px] bg-cyber-border/60" />
        <div className="absolute inset-y-0 left-1/2 w-[1px] bg-cyber-border/60" />

        {/* Degree Markers */}
        <span className="absolute top-1 text-[9px] font-mono text-slate-500">000°</span>
        <span className="absolute bottom-1 text-[9px] font-mono text-slate-500">180°</span>
        <span className="absolute left-1 text-[9px] font-mono text-slate-500">270°</span>
        <span className="absolute right-1 text-[9px] font-mono text-slate-500">090°</span>

        {/* 360° Rotating Holographic Radar Beam */}
        <div className="absolute inset-2 rounded-full overflow-hidden pointer-events-none animate-radar-sweep">
          <div
            className="w-1/2 h-1/2 origin-bottom-right"
            style={{
              background: `conic-gradient(from 0deg at 100% 100%, ${radarGlow} 0deg, transparent 60deg)`
            }}
          />
        </div>

        {/* SVG Probability Progress Arc */}
        <svg className="w-48 h-48 -rotate-90 relative z-10" viewBox="0 0 160 160">
          <defs>
            <filter id="cyberGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor={strokeColor} floodOpacity="0.8" />
            </filter>
          </defs>

          {/* Background Track */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="#0B1528"
            strokeWidth="10"
          />

          {/* Active Glowing Probability Ring */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            filter="url(#cyberGlow)"
            style={{
              transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.4s ease'
            }}
          />
        </svg>

        {/* Center Digital Score & Target Lock */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 select-none">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-semibold">
            DENIAL PROB
          </span>
          <span className={`text-4xl font-black font-mono tracking-tighter transition-colors duration-500 ${textColor}`}>
            {pct}%
          </span>
          <div className="flex items-center space-x-1 mt-0.5">
            <span className={`w-1.5 h-1.5 rounded-full ${pct > 60 ? 'bg-rose-500 animate-ping' : 'bg-emerald-400'}`} />
            <span className="text-[9px] font-mono text-slate-400 uppercase">
              {pct > 60 ? 'LOCK DETECTED' : 'NOMINAL'}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Status Ribbon */}
      <div className="w-full mt-2 space-y-2">
        <div className={`w-full py-1.5 px-3 rounded-xl border text-center font-mono font-bold text-xs tracking-wider uppercase transition-all shadow-lg ${badgeBg}`}>
          {hudStatus}
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 px-1">
          <span>AI TIER: <strong className="text-slate-200">{tier.toUpperCase()}</strong></span>
          <span>RELIABILITY: <strong className="text-cyan-400">{(confidence * 100).toFixed(0)}%</strong></span>
        </div>
      </div>
    </div>
  );
}
