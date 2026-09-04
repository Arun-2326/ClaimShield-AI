import React, { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, X, ShieldCheck } from 'lucide-react';
import { api } from '../api/client';

export default function BatchUploadModal({ onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);
    try {
      const res = await api.uploadBatchCSV(file);
      setResult(res);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to process CSV file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5 pb-4 border-b border-slate-800">
          <div className="p-3 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
            <FileSpreadsheet className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Batch Synthetic Claims Intake</h2>
            <p className="text-sm text-slate-300 mt-0.5 font-medium">Upload CSV for pre-submission intelligence scoring</p>
          </div>
        </div>

        {error && (
          <div className="my-3.5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-sm text-rose-300 flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        {result ? (
          <div className="my-5 p-5 bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-3.5">
            <div className="flex items-center gap-2.5 text-emerald-400 font-black text-base">
              <CheckCircle2 className="w-5 h-5" />
              Batch Ingestion & Scoring Successful
            </div>
            <div className="grid grid-cols-3 gap-3 text-center text-sm pt-2">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <div className="text-xs uppercase font-bold text-slate-400">Processed</div>
                <div className="text-xl font-black text-white font-mono mt-1">{result.processed_count}</div>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <div className="text-xs uppercase font-bold text-emerald-400">Released</div>
                <div className="text-xl font-black text-emerald-400 font-mono mt-1">{result.released_count}</div>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <div className="text-xs uppercase font-bold text-rose-400">Held for Fix</div>
                <div className="text-xl font-black text-rose-400 font-mono mt-1">{result.held_for_correction}</div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-full mt-3 py-2.5 bg-emerald-500 text-slate-950 font-black text-sm rounded-xl hover:bg-emerald-400 transition cursor-pointer"
            >
              Done & View Queue
            </button>
          </div>
        ) : (
          <form onSubmit={handleUpload} className="mt-5 space-y-4">
            <div className="border-2 border-dashed border-slate-700 hover:border-sky-500/60 rounded-xl p-8 text-center cursor-pointer transition">
              <Upload className="w-10 h-10 text-sky-400 mx-auto mb-3" />
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setFile(e.target.files[0])}
                className="hidden"
                id="csvUploadInput"
              />
              <label htmlFor="csvUploadInput" className="cursor-pointer">
                <span className="text-sm text-slate-200 font-bold block">
                  {file ? file.name : "Click to select synthetic CSV file"}
                </span>
                <span className="text-xs text-slate-400 mt-1.5 block font-medium">
                  Accepts standard synthetic claim columns (EDI 837 mapped)
                </span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!file || loading}
                className="px-6 py-2.5 rounded-xl text-sm font-black text-white bg-sky-500 hover:bg-sky-400 disabled:opacity-50 transition cursor-pointer"
              >
                {loading ? "Processing..." : "Score & Ingest Claims"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
