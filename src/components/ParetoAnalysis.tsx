import React from 'react';
import { StyleAnalysisResult } from '../types/pe';
import { AlertOctagon, TrendingUp, CheckCircle2, ArrowRight } from 'lucide-react';

interface ParetoAnalysisProps {
  analysis: StyleAnalysisResult;
  onSelectProcessForTimeStudy: (processId: string) => void;
}

export const ParetoAnalysis: React.FC<ParetoAnalysisProps> = ({
  analysis,
  onSelectProcessForTimeStudy,
}) => {
  const { paretoData, taktTimeSec, criticalProcesses } = analysis;

  const maxCycleTime = Math.max(...paretoData.map((d) => d.cycleTimeSec), 40);

  // Identify processes contributing to the first 80% cumulative time
  const top80Processes = paretoData.filter(d => d.cumPercentage <= 80 || (paretoData.indexOf(d) === 0));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-4">
      {/* Title & Pareto Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>Grafik Pareto & Critical Process Ranking</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Prinsip 80/20 Kaizen
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            Urutan proses dengan waktu siklus tertinggi. Fokus perbaikan pada {top80Processes.length} proses teratas (area &le; 80%) memberikan dampak terbesar pada output lini.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-1 text-xs">
          <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400">Takt Time Acuan:</span>
          <span className="font-mono font-bold text-white">{taktTimeSec} detik</span>
        </div>
      </div>

      {/* Dynamic Pareto Chart Graphic */}
      <div className="relative pt-6 pb-2">
        {/* 80% Cumulative Line marker */}
        <div 
          className="absolute left-0 right-0 z-10 flex items-center pointer-events-none"
          style={{ bottom: '144px' }} // 80% height of 180px bar area
        >
          <div className="w-full border-b border-dashed border-amber-400 shadow-sm shadow-amber-400/30"></div>
          <div className="absolute right-2 -top-2.5 bg-amber-950 text-amber-300 border border-amber-800 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
            Ambang Batas 80% Kumulatif
          </div>
        </div>

        {/* Bars and Cumulative SVG line overlay */}
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[700px] h-56 flex items-end justify-between gap-2 relative border-b border-slate-700/80 px-2">
            
            {/* Background SVG Polyline for Cumulative Percentage */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 1000 100" preserveAspectRatio="none">
              {paretoData.length > 1 && (
                <polyline
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={paretoData.map((d, idx) => {
                    const x = Number((((idx + 0.5) / paretoData.length) * 1000).toFixed(1));
                    // Invert y because SVG 0 is top
                    const y = Number((100 - (d.cumPercentage / 100) * 80 - 10).toFixed(1));
                    return `${x},${y}`;
                  }).join(' ')}
                />
              )}
            </svg>

            {/* Individual Pareto Bars */}
            {paretoData.map((item, idx) => {
              const heightPercent = Math.min(100, Math.max(8, (item.cycleTimeSec / maxCycleTime) * 100));
              const isOverTakt = item.cycleTimeSec > taktTimeSec;
              const isTop20 = item.cumPercentage <= 80;

              return (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center justify-end h-full group relative z-20 cursor-default"
                  title={`${item.processName} - ${item.cycleTimeSec}s | Kontribusi: ${item.impactPercent}% | Kumulatif: ${item.cumPercentage}%`}
                >
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 bg-slate-950 border border-slate-700 text-white text-[10px] p-1.5 rounded shadow-xl pointer-events-none whitespace-nowrap z-30">
                    <div className="font-bold">{item.processName}</div>
                    <div className="text-slate-300">Waktu: {item.cycleTimeSec}s | Kumulatif: {item.cumPercentage}%</div>
                  </div>

                  {/* Value on top of bar */}
                  <span className={`text-[9px] font-mono font-bold mb-1 ${
                    isOverTakt ? 'text-rose-400 font-extrabold' : 'text-slate-400'
                  }`}>
                    {item.cycleTimeSec}s
                  </span>

                  {/* The bar */}
                  <div
                    className={`w-full max-w-[32px] rounded-t transition-all ${
                      isOverTakt
                        ? 'bg-rose-500 shadow-md shadow-rose-500/20'
                        : isTop20
                        ? 'bg-indigo-500'
                        : 'bg-slate-700'
                    }`}
                    style={{ height: `${heightPercent * 0.75}%` }}
                  ></div>

                  {/* Rank & Process Code */}
                  <div className="mt-2 text-center w-full">
                    <span className={`text-[9px] font-bold block ${
                      idx === 0 ? 'text-rose-400' : 'text-slate-400'
                    }`}>
                      #{idx + 1}
                    </span>
                    <span className="text-[8px] text-slate-500 truncate block max-w-[32px]">
                      {item.cumPercentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Critical Process Ranking Table */}
      <div className="space-y-2 pt-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
          <span>Daftar Prioritas Perbaikan (Critical Processes)</span>
          <span className="text-[11px] text-slate-400 normal-case font-normal">
            Menampilkan proses dengan dampak bottleneck tertinggi
          </span>
        </h4>

        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Rank</th>
                <th className="py-2.5 px-3">Nama Operasi</th>
                <th className="py-2.5 px-3">Mesin</th>
                <th className="py-2.5 px-3 text-right">Cycle Time</th>
                <th className="py-2.5 px-3 text-right">Gap vs Takt</th>
                <th className="py-2.5 px-3 text-right">Kontribusi</th>
                <th className="py-2.5 px-3 text-right">Kumulatif</th>
                <th className="py-2.5 px-3 text-center">Tindakan IE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {criticalProcesses.slice(0, 5).map((proc, idx) => {
                const isOver = proc.stationWorkloadSec > taktTimeSec;
                return (
                  <tr key={proc.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2 px-3">
                      <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${
                        idx === 0
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : idx === 1
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        {proc.rank}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-sans font-semibold text-white">
                      {proc.name}
                    </td>
                    <td className="py-2 px-3 font-sans text-slate-400">
                      <span className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px] text-slate-300">
                        {proc.machine}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right text-slate-200 font-bold">
                      {proc.stationWorkloadSec}s
                    </td>
                    <td className="py-2 px-3 text-right">
                      <span className={`font-bold ${isOver ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {proc.bottleneckGapSec > 0 ? `+${proc.bottleneckGapSec}s` : `${proc.bottleneckGapSec}s`}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right text-slate-300">
                      {proc.impactPercent}%
                    </td>
                    <td className="py-2 px-3 text-right text-cyan-400 font-bold">
                      {proc.cumPercentage}%
                    </td>
                    <td className="py-2 px-3 text-center font-sans">
                      <button
                        onClick={() => onSelectProcessForTimeStudy(proc.id)}
                        className="px-2 py-1 rounded bg-indigo-900/60 hover:bg-indigo-800/80 text-indigo-200 text-[10px] font-medium border border-indigo-700/50 transition-colors"
                      >
                        Time Study / Split
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
