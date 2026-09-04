import React, { useState } from 'react';
import EdiInspector from './EdiInspector';
import RulesMatrix from '../Scrubber/RulesMatrix';
import { SAMPLE_PRESETS } from '../../data/samplePresets';
import { Terminal, ShieldAlert, Cpu, Zap, CheckCircle2 } from 'lucide-react';
import { cyberAudio } from '../../utils/audio';

export default function EdiFullPage({ onToast }) {
  const [selectedPreset, setSelectedPreset] = useState(SAMPLE_PRESETS[0]);
  const [activeTab, setActiveTab] = useState('edi'); // 'edi' | 'rules'

  const handleSelectPreset = (preset) => {
    cyberAudio.playChirp();
    setSelectedPreset(preset);
  };

  return (
    <div className="space-y-6 animate-page-enter">
      {/* 1. Header Banner */}
      <div className="hud-card p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/40 text-cyan-400">
            <Terminal className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-extrabold uppercase tracking-wider text-slate-100">
                Clearinghouse EDI 837P Cyber Terminal
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                ANSI ASC X12N 005010X222A1
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Live electronic claim transaction decomposition, loop syntax validation, and clearinghouse edit matrix.
            </p>
          </div>
        </div>

        {/* Sub-view switcher */}
        <div className="flex items-center space-x-2 bg-cyber-bg/80 p-1 rounded-xl border border-cyber-border">
          <button
            onClick={() => {
              cyberAudio.playChirp();
              setActiveTab('edi');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'edi'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Raw 837P Stream
          </button>
          <button
            onClick={() => {
              cyberAudio.playChirp();
              setActiveTab('rules');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'rules'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Rules Scrubbing Matrix
          </button>
        </div>
      </div>

      {/* 2. Scenario Presets Selector */}
      <div className="hud-card p-4 rounded-2xl space-y-2">
        <span className="text-[11px] uppercase tracking-wider font-mono text-slate-400 block font-bold">
          Active Test Encounter Selection:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {SAMPLE_PRESETS.map((preset) => {
            const isSelected = selectedPreset.id === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`p-2.5 rounded-xl text-left text-xs transition-all border font-mono ${
                  isSelected
                    ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-500/10'
                    : 'bg-cyber-card/60 hover:bg-slate-800 border-cyber-border/70 text-slate-300'
                }`}
              >
                <div className="font-bold truncate">{preset.label}</div>
                <div className="text-[10px] text-slate-500 truncate mt-1">
                  {preset.data.claim_id} • CPT {preset.data.cpt_codes.join(',')}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Main Display Body */}
      {activeTab === 'edi' ? (
        <EdiInspector claimData={selectedPreset.data} onToast={onToast} />
      ) : (
        <RulesMatrix claimData={selectedPreset.data} onToast={onToast} />
      )}
    </div>
  );
}
