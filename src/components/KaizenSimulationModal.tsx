import React, { useState } from 'react';
import { GarmentStyle, StyleAnalysisResult, ProcessItem } from '../types/pe';
import { analyzeGarmentStyle, generateKaizenRecommendations } from '../utils/peCalculations';
import { 
  Sliders, 
  X, 
  ArrowRight, 
  TrendingUp, 
  CheckCircle2, 
  Zap, 
  Wrench, 
  Sparkles,
  RotateCcw,
  Save
} from 'lucide-react';

interface KaizenSimulationModalProps {
  style: GarmentStyle;
  currentAnalysis: StyleAnalysisResult;
  isOpen: boolean;
  onClose: () => void;
  onApplyKaizenToStyle: (updatedStyle: GarmentStyle, revisionNote: string) => void;
}

export const KaizenSimulationModal: React.FC<KaizenSimulationModalProps> = ({
  style,
  currentAnalysis,
  isOpen,
  onClose,
  onApplyKaizenToStyle,
}) => {
  // Local simulated copy of processes
  const [simProcesses, setSimProcesses] = useState<ProcessItem[]>(() => 
    JSON.parse(JSON.stringify(style.processes))
  );
  const [revisionNote, setRevisionNote] = useState<string>('Hasil Kaizen Line Balancing: Optimasi Bottleneck');

  // Reset when modal opens with fresh data
  React.useEffect(() => {
    if (isOpen) {
      setSimProcesses(JSON.parse(JSON.stringify(style.processes)));
    }
  }, [isOpen, style]);

  // Compute simulated analysis
  const simStyle: GarmentStyle = {
    ...style,
    processes: simProcesses,
  };
  const simAnalysis = analyzeGarmentStyle(simStyle);

  // Recommendations
  const recommendations = generateKaizenRecommendations(currentAnalysis);

  const handleApplyRecommendation = (type: string) => {
    const updated = JSON.parse(JSON.stringify(simProcesses)) as ProcessItem[];
    const bottleneck = currentAnalysis.bottleneckProcess;
    if (!bottleneck) return;

    if (type === 'SPLIT_PROCESS') {
      const target = updated.find(p => p.id === bottleneck.id);
      if (target) {
        target.manpower = (target.manpower || 1) + 1;
      }
      setRevisionNote(`Kaizen: Split proses '${bottleneck.name}' dengan menambah 1 operator`);
    } else if (type === 'ATTACHMENT') {
      const target = updated.find(p => p.id === bottleneck.id);
      if (target) {
        // 18% reduction
        target.stdCycleTimeSec = Number((target.stdCycleTimeSec * 0.82).toFixed(1));
        if (target.timeStudy?.actualCycleTimeSec) {
          target.timeStudy.actualCycleTimeSec = Number((target.timeStudy.actualCycleTimeSec * 0.82).toFixed(1));
          target.timeStudy.actualSMV = Number((target.timeStudy.actualSMV * 0.82).toFixed(3));
        }
      }
      setRevisionNote(`Kaizen: Pemasangan folder attachment pada '${bottleneck.name}'`);
    } else if (type === 'WORK_SHARING') {
      const target = updated.find(p => p.id === bottleneck.id);
      const underloaded = simAnalysis.analyzedProcesses.find(p => p.status === 'Underloaded');
      if (target && underloaded) {
        const transferSec = 6;
        target.stdCycleTimeSec = Math.max(10, target.stdCycleTimeSec - transferSec);
        if (target.timeStudy?.actualCycleTimeSec) {
          target.timeStudy.actualCycleTimeSec = Math.max(10, target.timeStudy.actualCycleTimeSec - transferSec);
        }
        const underP = updated.find(p => p.id === underloaded.id);
        if (underP) {
          underP.stdCycleTimeSec += transferSec;
        }
      }
      setRevisionNote(`Kaizen: Work-sharing elemen kerja '${bottleneck.name}' ke stasiun ringan`);
    }
    setSimProcesses(updated);
  };

  const handleReset = () => {
    setSimProcesses(JSON.parse(JSON.stringify(style.processes)));
  };

  const handleCommit = () => {
    const nextRevNumber = (style.history?.length || 1) + 1;
    const committedStyle: GarmentStyle = {
      ...style,
      version: `Rev ${nextRevNumber}.0 (Kaizen After)`,
      updatedAt: new Date().toISOString(),
      processes: simProcesses,
    };
    onApplyKaizenToStyle(committedStyle, revisionNote);
    onClose();
  };

  if (!isOpen) return null;

  const lbeDelta = Number((simAnalysis.lineBalancingEfficiency - currentAnalysis.lineBalancingEfficiency).toFixed(1));
  const outputDelta = simAnalysis.dailyCapacityPcs - currentAnalysis.dailyCapacityPcs;
  const cycleDelta = Number((currentAnalysis.bottleneckProcess.stationWorkloadSec - simAnalysis.bottleneckProcess.stationWorkloadSec).toFixed(1));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Simulasi Perbaikan Kaizen & Komparasi Before vs After
              </h3>
              <p className="text-xs text-slate-400">
                Uji skenario perbaikan line balancing sebelum diterapkan ke lantai produksi riil
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Quick Recommendation Presets */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Rekomendasi Tindakan Lean IE Otomatis:
              </span>
              <button
                onClick={handleReset}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Simulasi</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-3 flex flex-col justify-between transition-colors text-xs"
                >
                  <div>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase block w-fit mb-1.5">
                      {rec.type.replace('_', ' ')}
                    </span>
                    <h5 className="font-bold text-white text-xs mb-1">{rec.title}</h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{rec.description}</p>
                  </div>
                  <button
                    onClick={() => handleApplyRecommendation(rec.type)}
                    className="mt-3 w-full py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white text-xs font-semibold border border-indigo-500/40 transition-colors"
                  >
                    Simulasikan Skenario Ini
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Before vs After KPI Comparison Matrix */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Hasil Komparasi Before vs After:
            </h4>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              
              {/* LBE */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs">
                <span className="text-slate-400 block mb-1">Line Balancing (LBE):</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-mono text-sm">{currentAnalysis.lineBalancingEfficiency}%</span>
                  <ArrowRight className="w-3 h-3 text-slate-500" />
                  <span className="text-emerald-400 font-mono font-bold text-lg">{simAnalysis.lineBalancingEfficiency}%</span>
                </div>
                <div className="text-[10px] text-emerald-400 font-semibold mt-1">
                  {lbeDelta >= 0 ? `+${lbeDelta}% Efisiensi` : `${lbeDelta}%`}
                </div>
              </div>

              {/* Bottleneck Cycle Time */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs">
                <span className="text-slate-400 block mb-1">Cycle Bottleneck:</span>
                <div className="flex items-center gap-2">
                  <span className="text-rose-400 font-mono text-sm">{currentAnalysis.bottleneckProcess.stationWorkloadSec}s</span>
                  <ArrowRight className="w-3 h-3 text-slate-500" />
                  <span className="text-white font-mono font-bold text-lg">{simAnalysis.bottleneckProcess.stationWorkloadSec}s</span>
                </div>
                <div className="text-[10px] text-emerald-400 font-semibold mt-1">
                  {cycleDelta > 0 ? `-${cycleDelta}s Lebih Cepat` : 'Tidak Berubah'}
                </div>
              </div>

              {/* Hourly Output */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs">
                <span className="text-slate-400 block mb-1">Kapasitas per Jam:</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-mono text-sm">{currentAnalysis.actualHourlyCapacity}</span>
                  <ArrowRight className="w-3 h-3 text-slate-500" />
                  <span className="text-cyan-400 font-mono font-bold text-lg">{simAnalysis.actualHourlyCapacity} pcs</span>
                </div>
                <div className="text-[10px] text-cyan-400 font-semibold mt-1">
                  +{simAnalysis.actualHourlyCapacity - currentAnalysis.actualHourlyCapacity} pcs/jam
                </div>
              </div>

              {/* Daily Output */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs">
                <span className="text-slate-400 block mb-1">Output per Hari:</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-mono text-sm">{currentAnalysis.dailyCapacityPcs}</span>
                  <ArrowRight className="w-3 h-3 text-slate-500" />
                  <span className="text-amber-400 font-mono font-bold text-lg">{simAnalysis.dailyCapacityPcs} pcs</span>
                </div>
                <div className="text-[10px] text-amber-400 font-semibold mt-1">
                  {outputDelta >= 0 ? `+${outputDelta} pcs / hari` : `${outputDelta} pcs`}
                </div>
              </div>

            </div>
          </div>

          {/* Interactive Simulated Process Adjuster */}
          <div>
            <span className="text-xs font-semibold text-slate-300 block mb-1.5">
              Penyesuaian Manual Manpower & Cycle Time Simulasi:
            </span>
            <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-800">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] sticky top-0">
                  <tr>
                    <th className="py-2 px-3">#</th>
                    <th className="py-2 px-3">Nama Operasi</th>
                    <th className="py-2 px-3">Mesin</th>
                    <th className="py-2 px-3 text-center">Manpower</th>
                    <th className="py-2 px-3 text-right">Cycle Simulasi (s)</th>
                    <th className="py-2 px-3 text-right">Workload Stasiun</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {simProcesses.map((p, idx) => {
                    const workload = Number((p.stdCycleTimeSec / (p.manpower || 1)).toFixed(1));
                    const isBottleneck = simAnalysis.bottleneckProcess?.id === p.id;
                    return (
                      <tr key={p.id} className="hover:bg-slate-800/40">
                        <td className="py-1.5 px-3 text-slate-500">{p.opNo}</td>
                        <td className="py-1.5 px-3 font-sans text-white font-medium">{p.name}</td>
                        <td className="py-1.5 px-3 font-sans text-slate-400">{p.machine}</td>
                        <td className="py-1.5 px-3 text-center">
                          <input
                            type="number"
                            value={p.manpower}
                            min="1"
                            max="5"
                            onChange={(e) => {
                              const updated = [...simProcesses];
                              updated[idx].manpower = Number(e.target.value) || 1;
                              setSimProcesses(updated);
                            }}
                            className="w-12 bg-slate-950 text-center rounded border border-slate-700 py-0.5 text-white"
                          />
                        </td>
                        <td className="py-1.5 px-3 text-right">
                          <input
                            type="number"
                            value={p.stdCycleTimeSec}
                            onChange={(e) => {
                              const updated = [...simProcesses];
                              const sec = Number(e.target.value) || 10;
                              updated[idx].stdCycleTimeSec = sec;
                              updated[idx].smv = Number((sec / 60).toFixed(3));
                              setSimProcesses(updated);
                            }}
                            className="w-16 bg-slate-950 text-right rounded border border-slate-700 py-0.5 px-1 text-white"
                          />
                        </td>
                        <td className="py-1.5 px-3 text-right font-bold">
                          <span className={isBottleneck ? 'text-rose-400' : 'text-slate-300'}>
                            {workload}s
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Revision Note Input */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Catatan Revisi Perubahan (Audit Trail):
            </label>
            <input
              type="text"
              value={revisionNote}
              onChange={(e) => setRevisionNote(e.target.value)}
              placeholder="Jelaskan ringkasan perbaikan metode kerja / penambahan alat bantu"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
          >
            Batal
          </button>

          <button
            onClick={handleCommit}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-1.5 shadow-lg shadow-amber-600/30 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Terapkan Perbaikan ke Database Style</span>
          </button>
        </div>

      </div>
    </div>
  );
};
