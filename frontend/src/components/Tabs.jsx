import React from 'react';
import { Sparkles, Layers, BarChart3, UploadCloud } from 'lucide-react';

export default function Tabs({ activeTab, setActiveTab }) {
  const tabs = [
    {
      id: 'studio',
      label: 'Live Prevention Studio',
      icon: Sparkles,
      badge: 'Live Demo'
    },
    {
      id: 'queue',
      label: 'Pre-Submission Queue',
      icon: Layers,
      badge: null
    },
    {
      id: 'intelligence',
      label: 'Model Transparency & ROI',
      icon: BarChart3,
      badge: 'Metrics'
    },
    {
      id: 'batch',
      label: 'Batch Analysis',
      icon: UploadCloud,
      badge: 'CSV'
    }
  ];

  return (
    <div className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-16 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-2 sm:space-x-3 overflow-x-auto py-2.5 no-scrollbar" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 transform active:scale-95 whitespace-nowrap group ${
                  isActive
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50 shadow-lg shadow-sky-500/10'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70 border border-transparent hover:-translate-y-0.5'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-transform duration-300 ${
                    isActive
                      ? 'text-sky-400 scale-110'
                      : 'text-slate-500 group-hover:text-slate-300 group-hover:scale-105'
                  }`}
                />
                <span className="tracking-wide">{tab.label}</span>

                {tab.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono transition-colors duration-300 ${
                      isActive
                        ? 'bg-sky-400/30 text-sky-200 border border-sky-400/40 shadow-sm'
                        : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}

                {/* Animated active underline dot */}
                {isActive && (
                  <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full shadow-md shadow-sky-500/50 animate-fade-in" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
