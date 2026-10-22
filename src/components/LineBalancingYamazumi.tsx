import React, { useState } from 'react';
import { StyleAnalysisResult, ProcessAnalysisItem } from '../types/pe';
import { Info, AlertCircle, CheckCircle2, ChevronRight, Users, Plus, Minus } from 'lucide-react';

interface LineBalancingYamazumiProps {
  analysis: StyleAnalysisResult;
  onSelectProcessForTimeStudy: (processId: string) => void;
  onAdjustManpower: (processId: string, delta: number) => void;
}

export const LineBalancingYamazumi: React.FC<LineBalancingYamazumiProps> = ({
  analysis,
  onSelectProcessForTimeStudy,
  onAdjustManpower,
}) => {
  const [selectedProcessId, setSelectedProcessId] = useState<string | null>(null);

  const { taktTimeSec, pitchTimeSec, analyzedProcesses } = analysis;
  
  // Calculate maximum cycle time for chart Y scale (at least 1.25x the max process or takt time)
  const maxVal = Math.max(
    taktTimeSec * 1.25,
    ...analyzedProcesses.map((p) => p.stationWorkloadSec),
    60
  );

  const selectedProcess = analyzedProcesses.find((p) => p.id === selectedProcessId) || analyzedProcesses[0];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-4">
      {/* Header & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>Grafik Line Balancing (Yamazumi Workload)</span>
            <span className="text-xs font-mono font-medium text-slate-400">
              ({analyzedProcesses.length} Stasiun Kerja)
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Visualisasi distribusi beban kerja vs Garis Takt Time ({taktTimeSec}s). Proses di atas garis merah adalah bottleneck lini.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-rose-500"></span>
            <span className="text-slate-300">Bottleneck (&gt; Takt)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-500"></span>
            <span className="text-slate-300">Kritis (90-100%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500"></span>
            <span className="text-slate-300">Optimal (70-90%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-indigo-500"></span>
            <span className="text-slate-300">Underloaded (&lt;70%)</span>
          </div>
        </div>
      </div>

      {/* Main Yamazumi Chart SVG / Flex Canvas */}
      <div className="relative pt-6 pb-2">
        {/* Takt Time Indicator Line */}
        {taktTimeSec > 0 && (
          <div 
            className="absolute left-0 right-0 z-10 flex items-center pointer-events-none transition-all duration-300"
            style={{
              bottom: `${Math.min(95, (taktTimeSec / maxVal) * 220 + 32)}px`,
            }}
          >
            <div className="w-full border-b-2 border-dashed border-rose-500 shadow-sm shadow-rose-500/30"></div>
            <div className="absolute right-2 -top-3.5 bg-rose-600 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded shadow">
              TAKT TIME: {taktTimeSec}s
            </div>
          </div>
        )}

        {/* Pitch Time Line (Average station pace) */}
        {pitchTimeSec > 0 && pitchTimeSec !== taktTimeSec && (
          <div 
            className="absolute left-0 right-0 z-10 flex items-center pointer-events-none transition-all duration-300"
            style={{
              bottom: `${Math.min(95, (pitchTimeSec / maxVal) * 220 + 32)}px`,
            }}
          >
            <div className="w-full border-b border-dotted border-cyan-400/80"></div>
            <div className="absolute left-2 -top-3 bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono text-[9px] px-1.5 py-0.2 rounded">
              Pitch: {pitchTimeSec}s
            </div>
          </div>
        )}

        {/* Workstation Bars Container (Scrollable horizontally if many processes) */}
        <div className="overflow-x-auto pb-4 pt-2">
          <div className="min-w-[800px] flex items-end justify-between gap-1.5 sm:gap-2 h-64 border-b border-slate-700/80 px-2">
            {analyzedProcesses.map((proc) => {
              const heightPercent = Math.min(100, Math.max(6, (proc.stationWorkloadSec / maxVal) * 100));
              const isBottleneck = proc.status === 'Bottleneck';
              const isCritical = proc.status === 'Critical';
              const isOptimal = proc.status === 'Balanced';
              const isUnder = proc.status === 'Underloaded';
              const isSelected = selectedProcess?.id === proc.id;

              let barColor = 'bg-emerald-500 hover:bg-emerald-400';
              if (isBottleneck) barColor = 'bg-rose-500 hover:bg-rose-400 shadow-lg shadow-rose-500/20';
              else if (isCritical) barColor = 'bg-amber-500 hover:bg-amber-400';
              else if (isUnder) barColor = 'bg-indigo-500 hover:bg-indigo-400';

              return (
                <div
                  key={proc.id}
                  onClick={() => setSelectedProcessId(proc.id)}
                  className={`flex-1 flex flex-col items-center justify-end h-full group cursor-pointer transition-all ${
                    isSelected ? 'scale-105' : 'opacity-90 hover:opacity-100'
                  }`}
                  title={`${proc.opNo}. ${proc.name} - ${proc.stationWorkloadSec}s (${proc.machine})`}
                >
                  {/* Top value badge */}
                  <span className={`text-[10px] font-mono font-bold mb-1 transition-transform ${
                    isBottleneck ? 'text-rose-400 scale-110' : 'text-slate-300'
                  }`}>
                    {proc.stationWorkloadSec}s
                  </span>

                  {/* Workstation Bar */}
                  <div
                    className={`w-full max-w-[36px] rounded-t-md transition-all duration-300 relative ${barColor} ${
                      isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  >
                    {/* Multi-operator badge if manpower > 1 */}
                    {proc.manpower > 1 && (
                      <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-black/60 text-white text-[9px] px-1 rounded font-bold">
                        {proc.manpower}P
                      </div>
                    )}
                  </div>

                  {/* Operation Sequence Label */}
                  <div className="mt-2 text-center">
                    <span className={`text-[10px] font-mono font-semibold block ${
                      isSelected ? 'text-white' : 'text-slate-400'
                    }`}>
                      #{proc.opNo}
                    </span>
                    <span className="text-[8px] text-slate-500 uppercase truncate max-w-[36px] block">
                      {proc.machine.split(' ')[0]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Process Detail & Line Balancing Quick Action Card */}
      {selectedProcess && (
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded text-[11px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Op #{selectedProcess.opNo}
              </span>
              <h4 className="font-bold text-white text-sm">
                {selectedProcess.name}
              </h4>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                {selectedProcess.machine}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                selectedProcess.status === 'Bottleneck' 
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : selectedProcess.status === 'Critical'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {selectedProcess.status}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-400 text-xs pt-1">
              <span>Std Cycle: <strong className="text-slate-200">{selectedProcess.stdCycleTimeSec}s</strong></span>
              <span>SMV: <strong className="text-slate-200">{selectedProcess.smv} min</strong></span>
              <span>Waktu Kerja Stasiun: <strong className="text-white font-mono">{selectedProcess.stationWorkloadSec}s</strong></span>
              <span>Gap vs Takt: <strong className={selectedProcess.bottleneckGapSec > 0 ? 'text-rose-400' : 'text-emerald-400'}>
                {selectedProcess.bottleneckGapSec > 0 ? `+${selectedProcess.bottleneckGapSec}s` : `${selectedProcess.bottleneckGapSec}s`}
              </strong></span>
              <span>Sumber Data: <span className="text-slate-300">{selectedProcess.isEstimate ? 'Estimasi Std' : 'Time Study Aktual'}</span></span>
            </div>
          </div>

          {/* Quick Manpower / Time Study Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-lg p-1">
              <span className="text-[11px] text-slate-400 px-1.5 flex items-center gap-1">
                <Users className="w-3 h-3 text-indigo-400" />
                Manpower:
              </span>
              <button
                onClick={() => onAdjustManpower(selectedProcess.id, -1)}
                disabled={selectedProcess.manpower <= 1}
                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white flex items-center justify-center font-bold"
                title="Kurangi operator stasiun ini"
                aria-label="Kurangi Operator"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-6 text-center font-bold text-white font-mono">
                {selectedProcess.manpower}
              </span>
              <button
                onClick={() => onAdjustManpower(selectedProcess.id, 1)}
                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold"
                title="Tambah operator (split workload stasiun)"
                aria-label="Tambah Operator"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            <button
              onClick={() => onSelectProcessForTimeStudy(selectedProcess.id)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors flex items-center gap-1 shadow-sm shadow-indigo-600/30"
            >
              <span>Ukur Time Study</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
