import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Database,
  Sliders,
  BarChart3,
  FileSpreadsheet,
  Shield,
  X
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
  health,
  onOpenWhatIf,
  onOpenUpload
}) {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      onClick: () => {
        setActiveTab('dashboard');
        if (onClose) onClose();
      },
      isActive: activeTab === 'dashboard'
    },
    {
      id: 'inspector',
      label: 'Claims Intake',
      icon: FileText,
      onClick: () => {
        setActiveTab('inspector');
        if (onClose) onClose();
      },
      isActive: activeTab === 'inspector'
    },
    {
      id: 'queue',
      label: 'Work Queue',
      icon: Database,
      onClick: () => {
        setActiveTab('queue');
        if (onClose) onClose();
      },
      isActive: activeTab === 'queue'
    },
    {
      id: 'whatif',
      label: 'What-If Remediation',
      icon: Sliders,
      onClick: () => {
        if (onOpenWhatIf) onOpenWhatIf();
        if (onClose) onClose();
      },
      isActive: false
    },
    {
      id: 'analytics',
      label: 'ML Transparency',
      icon: BarChart3,
      onClick: () => {
        setActiveTab('analytics');
        if (onClose) onClose();
      },
      isActive: activeTab === 'analytics'
    },
    {
      id: 'batch',
      label: 'Batch CSV',
      icon: FileSpreadsheet,
      onClick: () => {
        if (onOpenUpload) onOpenUpload();
        if (onClose) onClose();
      },
      isActive: false
    }
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300 select-none">
      {/* Brand Header */}
      <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-sm shadow-sky-500/20">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold tracking-tight text-white">ClaimShield</span>
              <span className="px-1 py-0.2 rounded text-[10px] font-extrabold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Fraud & Denial Prevention</p>
          </div>
        </div>

        {/* Mobile close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={item.onClick}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                item.isActive
                  ? 'bg-sky-500/15 text-sky-300 font-semibold border-r-2 border-sky-400 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${item.isActive ? 'text-sky-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer / Profile & Engine Health */}
      <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-900/80">
        {/* User / Adjudicator Card */}
        <div className="flex items-center gap-3 px-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center shrink-0 text-xs font-bold text-white shadow-sm">
            CS
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate text-white">RCM Adjudicator</p>
            <p className="text-[10px] text-slate-400 truncate">adjudicator@claimshield.ai</p>
          </div>
        </div>

        {/* Engine Status Badge */}
        <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800 text-[10px]">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                health?.model_loaded ? 'bg-emerald-400' : 'bg-rose-400'
              }`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                health?.model_loaded ? 'bg-emerald-500' : 'bg-rose-500'
              }`} />
            </span>
            <span className="font-mono text-slate-300">
              {health?.model_loaded ? (health.model_version || 'rf-calibrated-v1.0') : 'Model Offline'}
            </span>
          </div>
          <span className="font-semibold uppercase tracking-wider text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
            Active
          </span>
        </div>

        {/* Attribution */}
        <div className="text-[10px] text-slate-500 text-center font-medium">
          Microsoft Innovation Club • VIT Chennai
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-slate-800 shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-over Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />
          <div className="fixed inset-y-0 left-0 w-64 max-w-[80vw] shadow-2xl z-50">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}