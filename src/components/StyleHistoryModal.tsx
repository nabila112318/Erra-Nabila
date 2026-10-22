import React from 'react';
import { GarmentStyle, StyleAnalysisResult } from '../types/pe';
import { History, X, GitBranch, Calendar, CheckCircle2, TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react';

interface StyleHistoryModalProps {
  style: GarmentStyle;
  currentAnalysis: StyleAnalysisResult;
  isOpen: boolean;
  onClose: () => void;
}

export const StyleHistoryModal: React.FC<StyleHistoryModalProps> = ({
  style,
  currentAnalysis,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const history = style.history || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Riwayat Analisis & Versi Breakdown Process (BP)
              </h3>
              <p className="text-xs text-slate-400">
                Style: <span className="text-white font-medium">{style.name}</span> ({style.code})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Current Active Release Card */}
          <div className="bg-indigo-950/30 border border-indigo-500/40 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                  Versi Aktif Saat Ini
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {style.version}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1 font-mono">
              <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 font-sans block">Total SMV:</span>
                <span className="font-bold text-white">{currentAnalysis.totalActualSMV} min</span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 font-sans block">Efisiensi LBE:</span>
                <span className="font-bold text-emerald-400">{currentAnalysis.lineBalancingEfficiency}%</span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 font-sans block">Cycle Bottleneck:</span>
                <span className="font-bold text-rose-300">{currentAnalysis.bottleneckProcess.stationWorkloadSec}s</span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 font-sans block">Output / Hari:</span>
                <span className="font-bold text-amber-300">{currentAnalysis.dailyCapacityPcs} pcs</span>
              </div>
            </div>
            
            <p className="text-[11px] text-slate-400 font-sans pt-1">
              Bottleneck utama: <strong>{currentAnalysis.bottleneckProcess.name}</strong> ({currentAnalysis.bottleneckProcess.machine})
            </p>
          </div>

          {/* Timeline of Past Versions */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Riwayat Perubahan & Revisi Sebelumnya:
            </h4>

            {history.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800">
                Belum ada rekaman riwayat untuk style ini. Setiap kali Anda menerapkan simulasi Kaizen atau mengupload revisi baru, snapshot versi akan otomatis tercatat di sini.
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((entry) => (
                  <div
                    key={entry.id}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs space-y-2 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="font-bold text-white font-mono">{entry.version}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {new Date(entry.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-slate-300 leading-relaxed text-xs">
                      {entry.notes}
                    </p>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 font-mono text-[11px]">
                      <div>
                        <span className="text-slate-500 text-[10px] block">Total SMV:</span>
                        <span className="text-slate-300">{entry.totalSMV} min</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block">Efisiensi LBE:</span>
                        <span className="text-emerald-400">{entry.lineEfficiency}%</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block">Bottleneck:</span>
                        <span className="text-rose-300 truncate block">{entry.bottleneckProcess} ({entry.bottleneckCycleSec}s)</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-white hover:bg-slate-700"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
