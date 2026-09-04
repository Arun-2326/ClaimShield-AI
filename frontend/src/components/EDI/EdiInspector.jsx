import React, { useState, useEffect } from 'react';
import { fetchClaimEdi837 } from '../../api/client';
import { FileCode2, Copy, Check, Download, AlertTriangle, Info, Terminal, ChevronRight } from 'lucide-react';

export default function EdiInspector({ claimData, onToast }) {
  const [ediData, setEdiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [copied, setCopied] = useState(false);

  const loadEdi = async () => {
    if (!claimData) return;
    setLoading(true);
    try {
      const res = await fetchClaimEdi837(claimData);
      setEdiData(res);
      // Select the first interesting or warning segment
      const warningSeg = res.segments?.find((s) => s.is_warning);
      setSelectedSegment(warningSeg || res.segments?.[15] || res.segments?.[0]);
    } catch (err) {
      console.error('Failed to load EDI:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEdi();
  }, [claimData]);

  const handleCopy = () => {
    if (!ediData?.full_edi_stream) return;
    navigator.clipboard.writeText(ediData.full_edi_stream);
    setCopied(true);
    if (onToast) onToast('ANSI ASC X12 837P EDI stream copied to clipboard', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!ediData?.full_edi_stream) return;
    const blob = new Blob([ediData.full_edi_stream], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${claimData.claim_id}_837P_professional.edi`;
    a.click();
    URL.revokeObjectURL(url);
    if (onToast) onToast(`Exported ${claimData.claim_id} 837P file`, 'success');
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs flex items-center justify-center space-x-2">
        <div className="w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
        <span>Compiling ANSI ASC X12N 837P Transaction Set...</span>
      </div>
    );
  }

  if (!ediData) return null;

  return (
    <div className="space-y-4">
      {/* Top Toolbar */}
      <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2.5">
          <Terminal className="w-4 h-4 text-sky-400" />
          <span className="font-bold text-slate-200 uppercase tracking-wider">
            ANSI ASC X12N 837P EDI Electronic Claim Stream
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px] border border-slate-700">
            005010X222A1
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {ediData.has_validation_warning && (
            <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 font-semibold text-[11px]">
              <AlertTriangle className="w-3 h-3" />
              <span>Missing Segment Violation</span>
            </span>
          )}

          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-medium transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copied ? 'Copied' : 'Copy EDI'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .EDI</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column EDI Terminal & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Raw EDI Line Terminal (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-950 rounded-xl border border-slate-800 p-3 font-mono text-[11px] overflow-hidden shadow-inner flex flex-col h-[420px]">
          <div className="text-[10px] text-slate-500 pb-2 border-b border-slate-800/80 flex justify-between uppercase">
            <span>Segment Stream (Click line to inspect)</span>
            <span>{ediData.segments?.length} Segments</span>
          </div>

          <div className="overflow-y-auto space-y-0.5 pt-2 pr-1 custom-scrollbar flex-1 font-mono">
            {ediData.segments?.map((seg, idx) => {
              const isSelected = selectedSegment?.raw === seg.raw;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedSegment(seg)}
                  className={`px-2 py-1 rounded cursor-pointer transition-colors flex items-center justify-between text-xs ${
                    isSelected
                      ? 'bg-sky-950/80 border border-sky-500/60 text-sky-200 font-bold'
                      : seg.is_warning
                      ? 'bg-rose-950/40 border border-rose-500/40 text-rose-300 hover:bg-rose-900/40'
                      : 'hover:bg-slate-900 text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <span className="text-slate-600 select-none w-6 text-right text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="text-amber-400 font-bold select-none">{seg.tag}</span>
                    <span className="truncate">
                      {seg.raw.substring(seg.tag.length)}
                    </span>
                  </div>

                  {seg.is_warning && (
                    <span className="px-1.5 py-0.2 rounded bg-rose-500/30 text-rose-300 text-[10px] font-semibold uppercase">
                      MISSING
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Segment Breakdown Inspector (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900/60 rounded-xl border border-slate-800 p-4 space-y-4 text-xs h-[420px] overflow-y-auto flex flex-col justify-between">
          {selectedSegment ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div>
                  <span className="text-[10px] uppercase font-bold text-sky-400 font-mono block">
                    {selectedSegment.loop}
                  </span>
                  <h4 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                    <span className="font-mono text-amber-400">{selectedSegment.tag}</span>
                    <span>—</span>
                    <span className="truncate">{selectedSegment.description}</span>
                  </h4>
                </div>
              </div>

              {selectedSegment.is_warning && (
                <div className="p-3 bg-rose-950/50 border border-rose-500/50 rounded-lg text-rose-200 space-y-1">
                  <div className="flex items-center space-x-1.5 font-bold text-xs">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    <span>Clearinghouse Pre-Submission Error</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    {selectedSegment.warning_note}
                  </p>
                </div>
              )}

              {/* Raw representation */}
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                  Raw Segment Data String:
                </span>
                <div className="p-2 rounded bg-slate-950 border border-slate-800 font-mono text-[11px] text-sky-300 break-all">
                  {selectedSegment.raw}
                </div>
              </div>

              {/* Data Elements decomposition */}
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1.5">
                  Parsed Data Elements ({selectedSegment.elements?.length}):
                </span>
                <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                  {selectedSegment.elements?.map((el, i) => (
                    <div key={i} className="flex items-center justify-between p-1.5 rounded bg-slate-800/60 text-[11px]">
                      <span className="font-mono text-slate-400">
                        {selectedSegment.tag}{String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="font-mono font-semibold text-slate-200 break-all text-right max-w-[70%]">
                        {el || '<empty>'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-400 py-12">
              Select any segment on the left to inspect EDI loop details.
            </div>
          )}

          <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 text-center">
            Standard ANSI ASC X12N Health Care Claim Professional (837P) Format
          </div>
        </div>
      </div>
    </div>
  );
}
