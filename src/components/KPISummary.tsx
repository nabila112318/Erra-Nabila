import React from 'react';
import { 
  Zap, 
  Target, 
  Users, 
  Clock, 
  AlertTriangle, 
  Gauge, 
  Activity, 
  CheckCircle, 
  TrendingUp,
  Cpu
} from 'lucide-react';
import { StyleAnalysisResult, GarmentStyle } from '../types/pe';

interface KPISummaryProps {
  style: GarmentStyle;
  analysis: StyleAnalysisResult;
  onUpdateParams: (params: { targetDailyPcs?: number; targetManpower?: number; effectiveHours?: number }) => void;
}

export const KPISummary: React.FC<KPISummaryProps> = ({
  style,
  analysis,
  onUpdateParams,
}) => {
  const isLbeGood = analysis.lineBalancingEfficiency >= 75;
  const isLbeOptimal = analysis.lineBalancingEfficiency >= 85;
  const isBottleneckSevere = analysis.bottleneckProcess?.bottleneckGapSec > 5;

  return (
    <div className="space-y-4">
      {/* Top Banner: Active Style Information & Data Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {style.category}
            </span>
            <h1 className="text-xl font-bold text-white tracking-tight">
              {style.name}
            </h1>
            <span className="text-xs text-slate-400 font-mono">
              ({style.code})
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
            <span>Buyer: <strong className="text-slate-200 font-semibold">{style.buyer}</strong></span>
            <span>•</span>
            <span>Jumlah Proses: <strong className="text-slate-200 font-semibold">{style.processes.length} operasi</strong></span>
            <span>•</span>
            <span>Diperbarui: {new Date(style.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </p>
        </div>

        {/* Data Status Indicator */}
        <div className="flex items-center gap-2">
          {analysis.hasActualTimeStudy ? (
            <div className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-800/50 rounded-lg px-3 py-1.5 text-xs text-emerald-300">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="font-semibold block">Time Study Aktual Aktif</span>
                <span className="text-[10px] text-emerald-400/80">Kalkulasi berbasis observasi langsung</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-amber-950/40 border border-amber-800/50 rounded-lg px-3 py-1.5 text-xs text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <div>
                <span className="font-semibold block">Analisis Sementara (Estimasi)</span>
                <span className="text-[10px] text-amber-300/80">Belum ada Time Study aktual, menggunakan Std Cycle Time</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        
        {/* 1. Takt Time */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Takt Time</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-white font-mono">
              {analysis.taktTimeSec} <span className="text-xs font-normal text-slate-400">detik/pc</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Pitch Time: <span className="text-slate-200 font-mono font-medium">{analysis.pitchTimeSec}s</span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800/80 text-[10px] text-slate-500">
            {style.effectiveHours}h × 3600s / {style.targetDailyPcs} pcs
          </div>
        </div>

        {/* 2. Total SMV */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total SMV</span>
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-white font-mono">
              {analysis.totalActualSMV} <span className="text-xs font-normal text-slate-400">menit</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Std SMV: <span className="text-slate-300 font-mono">{analysis.totalStdSMV} min</span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800/80 text-[10px] text-slate-500">
            Workload: {(analysis.totalActualSMV * 60).toFixed(0)}s total
          </div>
        </div>

        {/* 3. Line Balancing Efficiency (LBE) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Efisiensi LBE</span>
            <Gauge className={`w-4 h-4 ${isLbeOptimal ? 'text-emerald-400' : isLbeGood ? 'text-amber-400' : 'text-rose-400'}`} />
          </div>
          <div className="mt-2">
            <div className={`text-2xl font-extrabold font-mono ${isLbeOptimal ? 'text-emerald-400' : isLbeGood ? 'text-amber-400' : 'text-rose-400'}`}>
              {analysis.lineBalancingEfficiency}%
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Balance Delay: <span className="text-slate-300 font-mono">{analysis.balanceDelayPercent}%</span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800/80 text-[10px]">
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${isLbeOptimal ? 'bg-emerald-500/20 text-emerald-300' : isLbeGood ? 'bg-amber-500/20 text-amber-300' : 'bg-rose-500/20 text-rose-300'}`}>
              {isLbeOptimal ? 'Lini Sangat Seimbang' : isLbeGood ? 'Lini Cukup Stabil' : 'Perlu Re-balancing'}
            </span>
          </div>
        </div>

        {/* 4. Bottleneck Process */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-700 transition-colors col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-300">Bottleneck Utama</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2">
            <div className="text-sm font-bold text-rose-300 truncate" title={analysis.bottleneckProcess?.name}>
              {analysis.bottleneckProcess?.name || 'Tidak Terdeteksi'}
            </div>
            <div className="text-xs text-slate-300 font-mono mt-1 flex items-center gap-1.5">
              <span>{analysis.bottleneckProcess?.stationWorkloadSec}s</span>
              <span className="text-rose-400 font-semibold">(+{analysis.bottleneckProcess?.bottleneckGapSec}s vs Takt)</span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Mesin: {analysis.bottleneckProcess?.machine}</span>
            <span className="font-mono">Rank #{analysis.bottleneckProcess?.rank}</span>
          </div>
        </div>

        {/* 5. Output Capacity vs Target */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Kapasitas Output</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-white font-mono">
              {analysis.dailyCapacityPcs} <span className="text-xs font-normal text-slate-400">pcs/hari</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Laju: <span className="text-slate-300 font-mono">{analysis.actualHourlyCapacity} pcs/jam</span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Ketercapaian:</span>
            <span className={`font-bold font-mono ${analysis.targetAttainabilityPercent >= 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {analysis.targetAttainabilityPercent}%
            </span>
          </div>
        </div>

        {/* 6. Reactive Parameters Controller */}
        <div className="bg-indigo-950/30 border border-indigo-900/50 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-indigo-300">
            <span className="text-xs font-bold uppercase tracking-wider">Parameter Lini</span>
            <Cpu className="w-4 h-4 text-indigo-400" />
          </div>
          
          <div className="space-y-1.5 mt-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">Target:</span>
              <input
                type="number"
                value={style.targetDailyPcs}
                onChange={(e) => onUpdateParams({ targetDailyPcs: Number(e.target.value) })}
                className="w-16 bg-slate-900 text-right px-1.5 py-0.5 rounded border border-slate-700 text-xs text-white font-mono focus:border-indigo-500 focus:outline-none"
                step="50"
                min="50"
                aria-label="Target Daily Pcs"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">Manpower:</span>
              <input
                type="number"
                value={style.targetManpower}
                onChange={(e) => onUpdateParams({ targetManpower: Number(e.target.value) })}
                className="w-16 bg-slate-900 text-right px-1.5 py-0.5 rounded border border-slate-700 text-xs text-white font-mono focus:border-indigo-500 focus:outline-none"
                step="1"
                min="1"
                aria-label="Target Manpower"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">Jam Kerja:</span>
              <input
                type="number"
                value={style.effectiveHours}
                onChange={(e) => onUpdateParams({ effectiveHours: Number(e.target.value) })}
                className="w-16 bg-slate-900 text-right px-1.5 py-0.5 rounded border border-slate-700 text-xs text-white font-mono focus:border-indigo-500 focus:outline-none"
                step="0.5"
                min="1"
                max="12"
                aria-label="Effective Working Hours"
              />
            </div>
          </div>
          <div className="text-[10px] text-indigo-400/80 text-right mt-1 font-medium">
            ⚡ Hitung Otomatis
          </div>
        </div>

      </div>
    </div>
  );
};
