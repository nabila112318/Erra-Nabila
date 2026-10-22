import React, { useState, useRef } from 'react';
import { GarmentStyle } from '../types/pe';
import { parseExcelFile, generateSampleExcelTemplate, ParsedExcelResult } from '../utils/excelParser';
import { 
  Upload, 
  FileSpreadsheet, 
  Check, 
  AlertCircle, 
  X, 
  Download, 
  Layers, 
  RefreshCw,
  GitCommit
} from 'lucide-react';

interface UploadStyleModalProps {
  existingStyles: GarmentStyle[];
  isOpen: boolean;
  onClose: () => void;
  onSaveNewStyle: (style: GarmentStyle) => void;
}

export const UploadStyleModal: React.FC<UploadStyleModalProps> = ({
  existingStyles,
  isOpen,
  onClose,
  onSaveNewStyle,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedExcelResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [conflictAction, setConflictAction] = useState<'update' | 'revision'>('revision');
  const [preserveTimeStudies, setPreserveTimeStudies] = useState(true);

  // Check if parsed style already exists
  const existingConflict = parsedData
    ? existingStyles.find(
        (s) => s.code.toLowerCase() === parsedData.styleCode.toLowerCase() ||
               s.name.toLowerCase() === parsedData.styleName.toLowerCase()
      )
    : null;

  const handleFile = async (file: File) => {
    try {
      setErrorMsg(null);
      const buffer = await file.arrayBuffer();
      const result = parseExcelFile(buffer);
      if (result.processes.length === 0) {
        setErrorMsg('Tidak ditemukan baris operasi breakdown process dalam file Excel ini. Pastikan format tabel sesuai template.');
        return;
      }
      setParsedData(result);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`Gagal membaca file Excel: ${err?.message || 'Format tidak valid'}`);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleConfirmSave = () => {
    if (!parsedData) return;

    if (existingConflict && conflictAction === 'update') {
      // Merge: keep old time studies if requested
      const updatedProcesses = parsedData.processes.map((newP) => {
        if (preserveTimeStudies) {
          const oldP = existingConflict.processes.find(
            (op) => op.name.toLowerCase() === newP.name.toLowerCase() || op.opNo === newP.opNo
          );
          if (oldP && oldP.timeStudy) {
            return {
              ...newP,
              timeStudy: oldP.timeStudy,
            };
          }
        }
        return newP;
      });

      const updatedStyle: GarmentStyle = {
        ...existingConflict,
        name: parsedData.styleName,
        buyer: parsedData.buyer,
        targetDailyPcs: parsedData.targetDailyPcs,
        targetManpower: parsedData.targetManpower,
        effectiveHours: parsedData.effectiveHours,
        processes: updatedProcesses,
        updatedAt: new Date().toISOString(),
        version: `${existingConflict.version} (Updated)`,
      };

      onSaveNewStyle(updatedStyle);
    } else {
      // Save as brand new style or new revision
      const newVersion = existingConflict
        ? `Rev ${(existingConflict.history?.length || 1) + 1}.0`
        : parsedData.version || 'Rev 1.0';

      const newStyle: GarmentStyle = {
        id: `style-${Date.now()}`,
        code: existingConflict ? `${parsedData.styleCode}-R2` : parsedData.styleCode,
        name: existingConflict ? `${parsedData.styleName} (${newVersion})` : parsedData.styleName,
        buyer: parsedData.buyer,
        category: parsedData.category,
        version: newVersion,
        updatedAt: new Date().toISOString(),
        targetDailyPcs: parsedData.targetDailyPcs,
        effectiveHours: parsedData.effectiveHours,
        targetManpower: parsedData.targetManpower,
        processes: parsedData.processes,
        history: existingConflict ? existingConflict.history : [],
      };

      onSaveNewStyle(newStyle);
    }

    setParsedData(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Upload New Style (Breakdown Process Excel)
              </h3>
              <p className="text-xs text-slate-400">
                Import file .xlsx / .csv untuk otomatisasi analisa Process Engineering
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

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Dropzone */}
          {!parsedData ? (
            <div className="space-y-4">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  dragActive
                    ? 'border-emerald-500 bg-emerald-950/20'
                    : 'border-slate-700 hover:border-slate-600 bg-slate-950/60'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mx-auto flex items-center justify-center mb-3">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">
                  Tarik & Lepaskan File Excel Breakdown Process ke Sini
                </h4>
                <p className="text-xs text-slate-400 mb-3">
                  Mendukung format .xlsx, .xls, atau .csv (Sistem akan otomatis mendeteksi buyer, style, mesin, dan cycle time)
                </p>
                <span className="inline-block px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors">
                  Pilih File dari Komputer
                </span>
              </div>

              {/* Template Download Banner */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <Download className="w-4 h-4 text-indigo-400" />
                  <span>Belum memiliki file? Unduh format standar template BP Garment:</span>
                </div>
                <button
                  type="button"
                  onClick={generateSampleExcelTemplate}
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 transition-colors"
                >
                  Download Template .xlsx
                </button>
              </div>

              {errorMsg && (
                <div className="bg-rose-950/50 border border-rose-800/60 text-rose-300 p-3 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>
          ) : (
            /* Parsed Preview and Conflict Settings */
            <div className="space-y-4">
              <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-300 text-xs">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Berhasil mengenali format Excel: <strong>{parsedData.processes.length} operasi proses</strong></span>
                </div>
                <button
                  onClick={() => setParsedData(null)}
                  className="text-xs text-slate-400 hover:text-white underline"
                >
                  Ganti File Lain
                </button>
              </div>

              {/* Metadata Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">Nama Style:</span>
                  <strong className="text-white text-sm">{parsedData.styleName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Kode Style:</span>
                  <strong className="text-indigo-300 font-mono">{parsedData.styleCode}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Buyer / Merk:</span>
                  <strong className="text-slate-200">{parsedData.buyer}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Kategori:</span>
                  <strong className="text-slate-300">{parsedData.category}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Target Harian:</span>
                  <strong className="text-white font-mono">{parsedData.targetDailyPcs} pcs</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Manpower Standar:</span>
                  <strong className="text-white font-mono">{parsedData.targetManpower} OP</strong>
                </div>
              </div>

              {/* Conflict handling if style already exists */}
              {existingConflict && (
                <div className="bg-amber-950/30 border border-amber-800/50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <span>Style dengan kode '{existingConflict.code}' sudah ada di database!</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <label className="flex items-center gap-2 text-slate-200 cursor-pointer">
                      <input
                        type="radio"
                        name="conflictAction"
                        checked={conflictAction === 'revision'}
                        onChange={() => setConflictAction('revision')}
                        className="accent-indigo-500"
                      />
                      <span>Simpan sebagai Revisi Baru (Contoh: {existingConflict.name} Rev 2)</span>
                    </label>
                    <label className="flex items-center gap-2 text-slate-200 cursor-pointer">
                      <input
                        type="radio"
                        name="conflictAction"
                        checked={conflictAction === 'update'}
                        onChange={() => setConflictAction('update')}
                        className="accent-indigo-500"
                      />
                      <span>Perbarui Data Style yang Ada (Update Breakdown Process)</span>
                    </label>
                  </div>

                  {conflictAction === 'update' && (
                    <div className="pt-2 border-t border-amber-900/40 text-xs">
                      <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preserveTimeStudies}
                          onChange={(e) => setPreserveTimeStudies(e.target.checked)}
                          className="accent-indigo-500 rounded"
                        />
                        <span>Pertahankan data Time Study aktual yang sudah diukur sebelumnya (Direkomendasikan)</span>
                      </label>
                    </div>
                  )}
                </div>
              )}

              {/* Sample Process Preview Table */}
              <div>
                <span className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Pratinjau Operasi Pertama (5 dari {parsedData.processes.length}):
                </span>
                <div className="overflow-x-auto rounded-lg border border-slate-800">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-950 text-slate-400 font-semibold text-[10px] uppercase">
                      <tr>
                        <th className="py-2 px-3">#</th>
                        <th className="py-2 px-3">Operasi</th>
                        <th className="py-2 px-3">Mesin</th>
                        <th className="py-2 px-3 text-right">Cycle (s)</th>
                        <th className="py-2 px-3 text-right">SMV</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {parsedData.processes.slice(0, 5).map((p) => (
                        <tr key={p.id} className="text-slate-300">
                          <td className="py-1.5 px-3 text-slate-500">{p.opNo}</td>
                          <td className="py-1.5 px-3 font-sans text-white font-medium">{p.name}</td>
                          <td className="py-1.5 px-3 font-sans">{p.machine}</td>
                          <td className="py-1.5 px-3 text-right">{p.stdCycleTimeSec}s</td>
                          <td className="py-1.5 px-3 text-right">{p.smv.toFixed(2)}m</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Batal
          </button>

          {parsedData && (
            <button
              onClick={handleConfirmSave}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Aktifkan Style & Perbarui Analisis</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
