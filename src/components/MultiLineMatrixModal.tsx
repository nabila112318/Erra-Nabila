import React from 'react';
import { ProductionLine, GarmentStyle } from '../types/pe';
import { analyzeGarmentStyle } from '../utils/peCalculations';
import { 
  Factory, 
  Layers, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Users, 
  Gauge, 
  Clock,
  Sparkles
} from 'lucide-react';

interface MultiLineMatrixModalProps {
  lines: ProductionLine[];
  styles: GarmentStyle[];
  activeLineId: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectLine: (lineId: string) => void;
  onAssignStyleToLine: (lineId: string, styleId: string) => void;
}

export const MultiLineMatrixModal: React.FC<MultiLineMatrixModalProps> = ({
  lines,
  styles,
  activeLineId,
  isOpen,
  onClose,
  onSelectLine,
  onAssignStyleToLine,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Multi-Line Process Engineering Monitoring Matrix
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {lines.length} Lini Terhubung
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Monitoring independen setiap lini produksi. Pergantian style pada satu lini tidak mengganggu data lini lainnya.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lines Matrix Grid */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lines.map((line) => {
              const assignedStyle = styles.find((s) => s.id === line.activeStyleId) || styles[0];
              const analysis = analyzeGarmentStyle(assignedStyle);
              const isCurrent = line.id === activeLineId;
              const isBottleneckSevere = analysis.bottleneckProcess?.bottleneckGapSec > 5;
              const isOptimal = analysis.lineBalancingEfficiency >= 80;

              return (
                <div
                  key={line.id}
                  className={`bg-slate-950/70 border rounded-xl p-4 flex flex-col justify-between transition-all ${
                    isCurrent
                      ? 'border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg shadow-indigo-500/10'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Line Header */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <Factory className="w-4 h-4 text-indigo-400" />
                        <h4 className="font-bold text-white text-sm">
                          {line.name}
                        </h4>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {line.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 mb-3">
                      SPV: <span className="text-slate-300 font-medium">{line.supervisor || 'Staff PE'}</span>
                    </div>

                    {/* Style Switcher for this Line */}
                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 mb-3">
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Style Aktif di Lini Ini:
                      </label>
                      <select
                        value={line.activeStyleId}
                        onChange={(e) => onAssignStyleToLine(line.id, e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white font-semibold focus:border-indigo-500 focus:outline-none cursor-pointer"
                        aria-label={`Pilih style untuk ${line.name}`}
                      >
                        {styles.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.code})
                          </option>
                        ))}
                      </select>
                      <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                        <span>Buyer: {assignedStyle.buyer}</span>
                        <span className="font-mono text-cyan-400">{assignedStyle.version}</span>
                      </div>
                    </div>

                    {/* KPI mini-grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs mb-3 font-mono">
                      <div className="bg-slate-900/60 p-2 rounded border border-slate-800/80">
                        <span className="text-[10px] font-sans text-slate-400 block">Takt Time:</span>
                        <span className="font-bold text-white">{analysis.taktTimeSec}s</span>
                      </div>
                      <div className="bg-slate-900/60 p-2 rounded border border-slate-800/80">
                        <span className="text-[10px] font-sans text-slate-400 block">Efisiensi LBE:</span>
                        <span className={`font-bold ${isOptimal ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {analysis.lineBalancingEfficiency}%
                        </span>
                      </div>
                      <div className="bg-slate-900/60 p-2 rounded border border-slate-800/80">
                        <span className="text-[10px] font-sans text-slate-400 block">Target / Hari:</span>
                        <span className="font-bold text-slate-200">{assignedStyle.targetDailyPcs} pcs</span>
                      </div>
                      <div className="bg-slate-900/60 p-2 rounded border border-slate-800/80">
                        <span className="text-[10px] font-sans text-slate-400 block">Kapasitas Output:</span>
                        <span className="font-bold text-emerald-400">{analysis.dailyCapacityPcs} pcs</span>
                      </div>
                    </div>

                    {/* Bottleneck Alert */}
                    <div className="bg-rose-950/30 border border-rose-900/40 rounded-lg p-2 text-xs mb-3">
                      <div className="flex items-center gap-1.5 text-rose-300 font-bold text-[11px] mb-0.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                        <span>Bottleneck:</span>
                      </div>
                      <div className="text-slate-300 truncate font-sans text-[11px]" title={analysis.bottleneckProcess?.name}>
                        {analysis.bottleneckProcess?.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Cycle: {analysis.bottleneckProcess?.stationWorkloadSec}s (Gap: +{analysis.bottleneckProcess?.bottleneckGapSec}s)
                      </div>
                    </div>
                  </div>

                  {/* Open Line Button */}
                  <button
                    onClick={() => {
                      onSelectLine(line.id);
                      onClose();
                    }}
                    className={`w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                      isCurrent
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    <span>{isCurrent ? 'Lini Sedang Dibuka' : 'Buka Dashboard Lini Ini'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Tip: Anda dapat mengganti style untuk Line 4 tanpa mempengaruhi Line 6 atau lini lainnya.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-white hover:bg-slate-700"
          >
            Tutup Matrix
          </button>
        </div>

      </div>
    </div>
  );
};
