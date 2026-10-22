import React, { useState, useEffect, useRef } from 'react';
import { GarmentStyle, ProcessAnalysisItem } from '../types/pe';
import { calculateTimeStudySMV } from '../utils/peCalculations';
import { 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  Sliders, 
  User, 
  Activity,
  Calculator
} from 'lucide-react';

interface TimeStudyModalProps {
  style: GarmentStyle;
  processes: ProcessAnalysisItem[];
  initialProcessId?: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveTimeStudy: (processId: string, timeStudyData: NonNullable<GarmentStyle['processes'][0]['timeStudy']>) => void;
}

export const TimeStudyModal: React.FC<TimeStudyModalProps> = ({
  style,
  processes,
  initialProcessId,
  isOpen,
  onClose,
  onSaveTimeStudy,
}) => {
  const [selectedProcessId, setSelectedProcessId] = useState<string>(
    initialProcessId || (processes[0]?.id ?? '')
  );

  // Sync when initialProcessId changes
  useEffect(() => {
    if (initialProcessId) {
      setSelectedProcessId(initialProcessId);
    } else if (processes.length > 0 && !selectedProcessId) {
      setSelectedProcessId(processes[0].id);
    }
  }, [initialProcessId, processes]);

  const activeProcess = processes.find(p => p.id === selectedProcessId) || processes[0];

  // Cycles array state (e.g. 5 readings)
  const [cycles, setCycles] = useState<number[]>([30, 32, 29, 31, 33]);
  const [ratingFactor, setRatingFactor] = useState<number>(100);
  const [allowancePercent, setAllowancePercent] = useState<number>(12);
  const [operatorName, setOperatorName] = useState<string>('Operator Line 4');

  // Load existing time study if already present
  useEffect(() => {
    if (activeProcess?.timeStudy) {
      setCycles(activeProcess.timeStudy.cycles.length > 0 ? activeProcess.timeStudy.cycles : [activeProcess.stdCycleTimeSec]);
      setRatingFactor(activeProcess.timeStudy.ratingFactor || 100);
      setAllowancePercent(activeProcess.timeStudy.allowancePercent || 12);
      if (activeProcess.timeStudy.operatorName) {
        setOperatorName(activeProcess.timeStudy.operatorName);
      }
    } else if (activeProcess) {
      // Default to 5 cycles around standard cycle time
      const base = activeProcess.stdCycleTimeSec || 30;
      setCycles([base, base + 2, base - 1, base + 1, base]);
      setRatingFactor(100);
      setAllowancePercent(12);
    }
  }, [selectedProcessId, activeProcess]);

  // Built-in stopwatch states
  const [stopwatchRunning, setStopwatchRunning] = useState(false);
  const [stopwatchTimeMs, setStopwatchTimeMs] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (stopwatchRunning) {
      timerRef.current = setInterval(() => {
        setStopwatchTimeMs(prev => prev + 100);
      }, 100);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stopwatchRunning]);

  const handleLapCycle = () => {
    const recordedSec = Number((stopwatchTimeMs / 1000).toFixed(1));
    if (recordedSec > 0) {
      setCycles(prev => [...prev, recordedSec]);
      setStopwatchTimeMs(0);
    }
  };

  const handleResetStopwatch = () => {
    setStopwatchRunning(false);
    setStopwatchTimeMs(0);
  };

  // Live calculation results
  const calc = calculateTimeStudySMV(cycles, ratingFactor, allowancePercent);

  const handleCycleChange = (index: number, val: number) => {
    const updated = [...cycles];
    updated[index] = val;
    setCycles(updated);
  };

  const handleAddCycleRow = () => {
    const last = cycles[cycles.length - 1] || 30;
    setCycles([...cycles, last]);
  };

  const handleRemoveCycleRow = (index: number) => {
    if (cycles.length <= 1) return;
    setCycles(cycles.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!activeProcess) return;
    onSaveTimeStudy(activeProcess.id, {
      cycles,
      ratingFactor,
      allowancePercent,
      actualCycleTimeSec: calc.stdTimeSec,
      actualSMV: calc.smv,
      measuredAt: new Date().toISOString(),
      operatorName,
    });
    onClose();
  };

  if (!isOpen || !activeProcess) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Observasi Time Study Stopwatch
              </h3>
              <p className="text-xs text-slate-400">
                Style: <span className="text-white font-medium">{style.name}</span>
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

        {/* Body content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Target Process Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Pilih Operasi Proses yang Diukur:
            </label>
            <select
              value={selectedProcessId}
              onChange={(e) => setSelectedProcessId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-medium focus:border-indigo-500 focus:outline-none"
            >
              {processes.map((p) => (
                <option key={p.id} value={p.id}>
                  Op #{p.opNo}. {p.name} ({p.machine}) - Std: {p.stdCycleTimeSec}s
                </option>
              ))}
            </select>
          </div>

          {/* Interactive Stopwatch Widget */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">
                Digital IE Stopwatch
              </span>
              <div className="text-3xl sm:text-4xl font-extrabold text-cyan-400 font-mono tracking-wider mt-0.5">
                {(stopwatchTimeMs / 1000).toFixed(1)} <span className="text-sm font-normal text-slate-400">detik</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setStopwatchRunning(!stopwatchRunning)}
                className={`px-3 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 transition-colors ${
                  stopwatchRunning
                    ? 'bg-amber-600 hover:bg-amber-500'
                    : 'bg-emerald-600 hover:bg-emerald-500'
                }`}
              >
                {stopwatchRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{stopwatchRunning ? 'Jeda' : 'Mulai Ukur'}</span>
              </button>

              <button
                onClick={handleLapCycle}
                disabled={stopwatchTimeMs === 0}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white flex items-center gap-1.5 transition-colors"
                title="Catat waktu ini sebagai siklus baru"
              >
                <Plus className="w-4 h-4" />
                <span>Catat Siklus</span>
              </button>

              <button
                onClick={handleResetStopwatch}
                className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                title="Reset Stopwatch"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Cycles Grid Readings */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                Hasil Siklus Observasi ({cycles.length} Sampel):
              </label>
              <button
                onClick={handleAddCycleRow}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Siklus Manual</span>
              </button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {cycles.map((val, idx) => (
                <div key={idx} className="relative group">
                  <div className="flex items-center bg-slate-950 border border-slate-700 rounded-lg overflow-hidden focus-within:border-indigo-500">
                    <span className="text-[10px] text-slate-500 font-mono pl-2">
                      #{idx + 1}
                    </span>
                    <input
                      type="number"
                      value={val}
                      onChange={(e) => handleCycleChange(idx, Number(e.target.value))}
                      className="w-full bg-transparent text-right pr-2 py-1.5 text-xs text-white font-mono font-bold focus:outline-none"
                      step="0.5"
                      min="1"
                    />
                  </div>
                  {cycles.length > 1 && (
                    <button
                      onClick={() => handleRemoveCycleRow(idx)}
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] hidden group-hover:flex items-center justify-center shadow"
                      title="Hapus siklus ini"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Rating Factor & Allowance Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/60 border border-slate-800 rounded-xl p-4">
            {/* Rating Factor */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Performance Rating (Westinghouse):</span>
                <span className="text-indigo-400 font-mono font-bold">{ratingFactor}%</span>
              </div>
              <input
                type="range"
                min="80"
                max="130"
                step="5"
                value={ratingFactor}
                onChange={(e) => setRatingFactor(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>Lambat (80%)</span>
                <span>Normal (100%)</span>
                <span>Cepat (130%)</span>
              </div>
            </div>

            {/* Allowance Factor */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Kelonggaran / Allowance (PF&D):</span>
                <span className="text-indigo-400 font-mono font-bold">{allowancePercent}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="25"
                step="1"
                value={allowancePercent}
                onChange={(e) => setAllowancePercent(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>Rendah (5%)</span>
                <span>Standar Garmen (12%)</span>
                <span>Tinggi (25%)</span>
              </div>
            </div>
          </div>

          {/* Operator Name */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Nama Operator / NIK:
            </label>
            <input
              type="text"
              value={operatorName}
              onChange={(e) => setOperatorName(e.target.value)}
              placeholder="Contoh: Siti Aisyah - Line 4"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Calculation Summary Card */}
          <div className="bg-indigo-950/40 border border-indigo-500/40 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <Calculator className="w-4 h-4" />
              <span>Hasil Perhitungan Standar Industri (SMV)</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Rata-rata Siklus:</span>
                <span className="text-base font-bold font-mono text-white">{calc.avgCycleSec}s</span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Basic Time:</span>
                <span className="text-base font-bold font-mono text-cyan-300">{calc.basicTimeSec}s</span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Standard Time:</span>
                <span className="text-base font-bold font-mono text-amber-300">{calc.stdTimeSec}s</span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Actual SMV:</span>
                <span className="text-base font-extrabold font-mono text-emerald-400">{calc.smv} min</span>
              </div>
            </div>
            
            <p className="text-[11px] text-slate-400 pt-1">
              Nilai Standard Time ({calc.stdTimeSec}s) akan langsung menggantikan cycle time standar dalam analisis bottleneck & Pareto stasiun ini.
            </p>
          </div>

        </div>

        {/* Footer actions */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Batal
          </button>

          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Simpan & Perbarui Analisis</span>
          </button>
        </div>

      </div>
    </div>
  );
};
