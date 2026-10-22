import React, { useState } from 'react';
import { ProcessAnalysisItem, GarmentStyle, MachineType } from '../types/pe';
import { 
  Search, 
  Filter, 
  Plus, 
  Clock, 
  Users, 
  Trash2, 
  Edit3, 
  Check, 
  X,
  FileSpreadsheet
} from 'lucide-react';

interface BreakdownProcessTableProps {
  style: GarmentStyle;
  processes: ProcessAnalysisItem[];
  taktTimeSec: number;
  onSelectTimeStudy: (processId: string) => void;
  onUpdateProcess: (updated: ProcessAnalysisItem) => void;
  onAddProcess: (newProcess: Omit<ProcessAnalysisItem, 'id' | 'effectiveCycleTimeSec' | 'isEstimate' | 'status' | 'bottleneckGapSec' | 'stationWorkloadSec' | 'stationEfficiency' | 'rank' | 'cumPercentage' | 'impactPercent'>) => void;
  onDeleteProcess: (processId: string) => void;
}

const MACHINE_OPTIONS: MachineType[] = [
  'SNLS',
  'DNLS',
  'Overlock 3T',
  'Overlock 4T',
  'Overlock 5T',
  'Kansai / Flatlock',
  'Bartack',
  'Button Hole',
  'Button Attach',
  'Iron / Press',
  'Manual / QC',
];

export const BreakdownProcessTable: React.FC<BreakdownProcessTableProps> = ({
  style,
  processes,
  taktTimeSec,
  onSelectTimeStudy,
  onUpdateProcess,
  onAddProcess,
  onDeleteProcess,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMachineFilter, setSelectedMachineFilter] = useState<string>('ALL');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<ProcessAnalysisItem>>({});
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newFormData, setNewFormData] = useState({
    name: '',
    machine: 'SNLS' as MachineType,
    stdCycleTimeSec: 30,
    smv: 0.5,
    manpower: 1,
  });

  const filtered = processes.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.machine.toLowerCase().includes(searchTerm.toLowerCase());
    const matchMachine = selectedMachineFilter === 'ALL' || p.machine === selectedMachineFilter;
    return matchSearch && matchMachine;
  });

  const handleStartEdit = (p: ProcessAnalysisItem) => {
    setEditingId(p.id);
    setEditFormData({
      name: p.name,
      machine: p.machine,
      stdCycleTimeSec: p.stdCycleTimeSec,
      smv: p.smv,
      manpower: p.manpower,
    });
  };

  const handleSaveEdit = (original: ProcessAnalysisItem) => {
    const stdCycle = Number(editFormData.stdCycleTimeSec) || original.stdCycleTimeSec;
    const smv = Number(editFormData.smv) || Number((stdCycle / 60).toFixed(3));
    const manpower = Number(editFormData.manpower) || 1;
    
    onUpdateProcess({
      ...original,
      name: editFormData.name || original.name,
      machine: (editFormData.machine as MachineType) || original.machine,
      stdCycleTimeSec: stdCycle,
      smv,
      manpower,
    });
    setEditingId(null);
  };

  const handleCreateNew = () => {
    if (!newFormData.name.trim()) return;
    const smv = Number(newFormData.smv) || Number((newFormData.stdCycleTimeSec / 60).toFixed(3));
    onAddProcess({
      opNo: processes.length + 1,
      name: newFormData.name.trim(),
      machine: newFormData.machine,
      stdCycleTimeSec: Number(newFormData.stdCycleTimeSec) || 30,
      smv,
      manpower: Number(newFormData.manpower) || 1,
    });
    setNewFormData({
      name: '',
      machine: 'SNLS',
      stdCycleTimeSec: 30,
      smv: 0.5,
      manpower: 1,
    });
    setIsAddingNew(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-4">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
            <span>Tabel Breakdown Process (BP) & Standard Minute Value</span>
          </h3>
          <p className="text-xs text-slate-400">
            Daftar urutan operasi kerja garment dengan alokasi mesin, SMV standar, dan hasil pengukuran time study aktual.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari operasi / mesin..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-40 sm:w-52"
            />
          </div>

          {/* Machine filter */}
          <select
            value={selectedMachineFilter}
            onChange={(e) => setSelectedMachineFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="ALL">Semua Mesin</option>
            {MACHINE_OPTIONS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          {/* Add process button */}
          <button
            onClick={() => setIsAddingNew(true)}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Operasi</span>
          </button>
        </div>
      </div>

      {/* Add new process inline modal/box */}
      {isAddingNew && (
        <div className="bg-slate-950 border border-indigo-500/40 rounded-xl p-3.5 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-white border-b border-slate-800 pb-2">
            <span>Tambah Operasi Breakdown Process Baru</span>
            <button onClick={() => setIsAddingNew(false)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
            <div className="sm:col-span-2">
              <label className="text-[11px] text-slate-400 block mb-1">Nama Operasi Proses:</label>
              <input
                type="text"
                placeholder="Contoh: Jahit Flap Saku Depan"
                value={newFormData.name}
                onChange={(e) => setNewFormData({ ...newFormData, name: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Jenis Mesin:</label>
              <select
                value={newFormData.machine}
                onChange={(e) => setNewFormData({ ...newFormData, machine: e.target.value as MachineType })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
              >
                {MACHINE_OPTIONS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Std Cycle Time (s):</label>
              <input
                type="number"
                value={newFormData.stdCycleTimeSec}
                onChange={(e) => {
                  const sec = Number(e.target.value);
                  setNewFormData({
                    ...newFormData,
                    stdCycleTimeSec: sec,
                    smv: Number((sec / 60).toFixed(3)),
                  });
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white font-mono focus:outline-none"
                step="1"
                min="5"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Manpower (OP):</label>
              <input
                type="number"
                value={newFormData.manpower}
                onChange={(e) => setNewFormData({ ...newFormData, manpower: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white font-mono focus:outline-none"
                step="1"
                min="1"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={() => setIsAddingNew(false)}
              className="px-3 py-1 rounded-lg text-xs text-slate-400 hover:text-white"
            >
              Batal
            </button>
            <button
              onClick={handleCreateNew}
              className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              Simpan ke BP
            </button>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-800">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-2.5 px-3 w-10 text-center">#</th>
              <th className="py-2.5 px-3 min-w-[200px]">Nama Operasi Proses</th>
              <th className="py-2.5 px-3 min-w-[120px]">Jenis Mesin</th>
              <th className="py-2.5 px-3 text-right">Std Cycle (s)</th>
              <th className="py-2.5 px-3 text-right">Std SMV (m)</th>
              <th className="py-2.5 px-3 text-right min-w-[110px]">Aktual Time Study</th>
              <th className="py-2.5 px-3 text-center">Manpower</th>
              <th className="py-2.5 px-3 text-right">Workload (s)</th>
              <th className="py-2.5 px-3 text-center">Status Lini</th>
              <th className="py-2.5 px-3 text-center w-28">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {filtered.map((proc) => {
              const isEditing = editingId === proc.id;
              const hasTimeStudy = Boolean(proc.timeStudy && proc.timeStudy.actualCycleTimeSec > 0);
              const isBottleneck = proc.status === 'Bottleneck';
              const isCritical = proc.status === 'Critical';

              return (
                <tr 
                  key={proc.id} 
                  className={`hover:bg-slate-800/40 transition-colors ${
                    isBottleneck ? 'bg-rose-950/15' : isCritical ? 'bg-amber-950/10' : ''
                  }`}
                >
                  {/* Op No */}
                  <td className="py-2.5 px-3 text-center text-slate-400 font-bold">
                    {proc.opNo}
                  </td>

                  {/* Name */}
                  <td className="py-2.5 px-3 font-sans font-semibold text-white">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editFormData.name ?? proc.name}
                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                        className="w-full bg-slate-950 border border-indigo-500 rounded px-2 py-1 text-xs text-white font-sans"
                      />
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span>{proc.name}</span>
                        {isBottleneck && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            BOTTLENECK
                          </span>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Machine */}
                  <td className="py-2.5 px-3 font-sans">
                    {isEditing ? (
                      <select
                        value={editFormData.machine ?? proc.machine}
                        onChange={(e) => setEditFormData({ ...editFormData, machine: e.target.value as MachineType })}
                        className="bg-slate-950 border border-indigo-500 rounded px-2 py-1 text-xs text-white"
                      >
                        {MACHINE_OPTIONS.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                        {proc.machine}
                      </span>
                    )}
                  </td>

                  {/* Std Cycle Time */}
                  <td className="py-2.5 px-3 text-right text-slate-300">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editFormData.stdCycleTimeSec ?? proc.stdCycleTimeSec}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setEditFormData({
                            ...editFormData,
                            stdCycleTimeSec: val,
                            smv: Number((val / 60).toFixed(3)),
                          });
                        }}
                        className="w-16 bg-slate-950 border border-indigo-500 rounded px-1.5 py-0.5 text-xs text-right text-white font-mono"
                      />
                    ) : (
                      `${proc.stdCycleTimeSec}s`
                    )}
                  </td>

                  {/* Std SMV */}
                  <td className="py-2.5 px-3 text-right text-slate-400">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editFormData.smv ?? proc.smv}
                        onChange={(e) => setEditFormData({ ...editFormData, smv: Number(e.target.value) })}
                        className="w-16 bg-slate-950 border border-indigo-500 rounded px-1.5 py-0.5 text-xs text-right text-white font-mono"
                        step="0.01"
                      />
                    ) : (
                      `${proc.smv.toFixed(2)}m`
                    )}
                  </td>

                  {/* Actual Time Study */}
                  <td className="py-2.5 px-3 text-right">
                    {hasTimeStudy && proc.timeStudy ? (
                      <div>
                        <span className="font-bold text-white">
                          {proc.timeStudy.actualCycleTimeSec}s
                        </span>
                        <span className="text-[10px] text-emerald-400 block">
                          ({proc.timeStudy.actualSMV.toFixed(2)}m • {proc.timeStudy.cycles.length} cyc)
                        </span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-slate-400">{proc.stdCycleTimeSec}s</span>
                        <span className="text-[9px] text-amber-400/90 block">
                          Estimasi Std
                        </span>
                      </div>
                    )}
                  </td>

                  {/* Manpower */}
                  <td className="py-2.5 px-3 text-center">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editFormData.manpower ?? proc.manpower}
                        onChange={(e) => setEditFormData({ ...editFormData, manpower: Number(e.target.value) })}
                        className="w-12 bg-slate-950 border border-indigo-500 rounded px-1 py-0.5 text-xs text-center text-white font-mono"
                        min="1"
                      />
                    ) : (
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        proc.manpower > 1 ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' : 'text-slate-300'
                      }`}>
                        {proc.manpower} OP
                      </span>
                    )}
                  </td>

                  {/* Workload */}
                  <td className="py-2.5 px-3 text-right font-bold">
                    <span className={isBottleneck ? 'text-rose-400 text-sm' : 'text-slate-200'}>
                      {proc.stationWorkloadSec}s
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="py-2.5 px-3 text-center font-sans">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      isBottleneck
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : isCritical
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : proc.status === 'Balanced'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    }`}>
                      {proc.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-2.5 px-3 text-center font-sans">
                    <div className="flex items-center justify-center gap-1">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => handleSaveEdit(proc)}
                            className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-500"
                            title="Simpan Perubahan"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white"
                            title="Batal"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => onSelectTimeStudy(proc.id)}
                            className="p-1 rounded bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-800/60 transition-colors"
                            title="Input / Update Time Study Operasi Ini"
                          >
                            <Clock className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleStartEdit(proc)}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                            title="Edit Data Operasi"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteProcess(proc.id)}
                            className="p-1 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 transition-colors"
                            title="Hapus Operasi"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
