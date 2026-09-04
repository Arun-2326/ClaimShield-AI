import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CommandBar from './components/CommandBar';
import Sidebar from './components/Sidebar';
import ClaimStudio from './components/Studio/ClaimStudio';
import EdiFullPage from './components/EDI/EdiFullPage';
import ClaimQueue from './components/Queue/ClaimQueue';
import MetricsDashboard from './components/Intelligence/MetricsDashboard';
import BatchAnalysis from './components/Batch/BatchAnalysis';
import PolicyNetwork from './components/Network/PolicyNetwork';
import Toast from './components/Toast';
import { checkHealth, fetchReferenceTaxonomy } from './api/client';

export default function App() {
  const [activePage, setActivePage] = useState('studio');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [systemHealth, setSystemHealth] = useState(null);
  const [payers, setPayers] = useState([]);
  const [reference, setReference] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    checkHealth().then(setSystemHealth);
    fetchReferenceTaxonomy()
      .then((data) => {
        setReference(data);
        if (data.payers) setPayers(data.payers);
      })
      .catch((err) => console.error('Failed to load taxonomy:', err));
  }, []);

  return (
    <div className="min-h-screen cyber-grid-bg text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* 1. Futuristic Header */}
      <Header
        systemHealth={systemHealth}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* 2. Facility Context & Real-Time Telemetry Bar */}
      <CommandBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* 3. Main Cockpit Layout: Left Sidebar + Right Dedicated Page Viewport */}
      <div className="flex-1 flex overflow-hidden">
        {/* Futuristic Collapsible Sidebar */}
        <Sidebar
          activePage={activePage}
          setActivePage={setActivePage}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
          systemHealth={systemHealth}
        />

        {/* Right Dynamic Page Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {/* Page 1: Quantum Studio */}
            {activePage === 'studio' && (
              <div key="studio" className="animate-page-enter">
                <ClaimStudio
                  payers={payers}
                  reference={reference}
                  onClaimAnalyzed={() => {}}
                  onToast={showToast}
                />
              </div>
            )}

            {/* Page 2: Dedicated EDI 837P Terminal & Scrubber */}
            {activePage === 'edi' && (
              <div key="edi" className="animate-page-enter">
                <EdiFullPage onToast={showToast} />
              </div>
            )}

            {/* Page 3: Defense Worklist Queue */}
            {activePage === 'queue' && (
              <div key="queue" className="animate-page-enter">
                <ClaimQueue onToast={showToast} />
              </div>
            )}

            {/* Page 4: Neural Intelligence & ROI Model */}
            {activePage === 'intelligence' && (
              <div key="intelligence" className="animate-page-enter">
                <MetricsDashboard />
              </div>
            )}

            {/* Page 5: High-Throughput Batch Screener */}
            {activePage === 'batch' && (
              <div key="batch" className="animate-page-enter">
                <BatchAnalysis onToast={showToast} />
              </div>
            )}

            {/* Page 6: Payer Policy Network */}
            {activePage === 'network' && (
              <div key="network" className="animate-page-enter">
                <PolicyNetwork />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* 4. Cyber Footer */}
      <footer className="border-t border-cyber-border/80 bg-cyber-dark/90 py-3 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-1.5 text-slate-400">
            <span className="font-bold text-slate-200 uppercase tracking-wider">ClaimShield AI 2050 Cockpit</span>
            <span>—</span>
            <span>Microsoft Innovation Club (VIT Chennai)</span>
          </div>
          <div className="text-[11px] font-mono text-slate-500">
            100% Offline Local Architecture • Synthetic Claims Only • No Real PHI Used
          </div>
        </div>
      </footer>

      {/* 5. Active Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
