import React from 'react';
import { 
  Shirt, 
  Layers, 
  Upload, 
  Clock, 
  Sliders, 
  History, 
  Download, 
  CheckCircle2, 
  RefreshCw,
  GitBranch,
  Factory
} from 'lucide-react';
import { GarmentStyle, ProductionLine } from '../types/pe';

interface HeaderBarProps {
  lines: ProductionLine[];
  activeLine: ProductionLine;
  onSelectLine: (lineId: string) => void;
  styles: GarmentStyle[];
  activeStyle: GarmentStyle;
  onSelectStyle: (styleId: string) => void;
  onOpenUpload: () => void;
  onOpenTimeStudy: () => void;
  onOpenKaizen: () => void;
  onOpenMultiLine: () => void;
  onOpenHistory: () => void;
  onExportExcel: () => void;
  lastSavedAt: string;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  lines,
  activeLine,
  onSelectLine,
  styles,
  activeStyle,
  onSelectStyle,
  onOpenUpload,
  onOpenTimeStudy,
  onOpenKaizen,
  onOpenMultiLine,
  onOpenHistory,
  onExportExcel,
  lastSavedAt,
}) => {
  // Extract unique buyers
  const buyers = Array.from(new Set(styles.map(s => s.buyer)));

  const handleBuyerChange = (buyer: string) => {
    const firstStyleOfBuyer = styles.find(s => s.buyer === buyer);
    if (firstStyleOfBuyer) {
      onSelectStyle(firstStyleOfBuyer.id);
    }
  };

  return (
    <header className="bg-slate-900/95 border-b border-slate-800 sticky top-0 z-30 backdrop-blur-md px-4 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        
        {/* Brand & Line Selector */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Factory className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white tracking-tight text-base sm:text-lg">
                Garment PE Studio
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                PRO IE v3.4
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Industrial & Process Engineering Real-Time Balancing
            </p>
          </div>

          <div className="h-6 w-px bg-slate-800 mx-1 hidden sm:block" />

          {/* Active Production Line Selector */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 rounded-lg p-1 border border-slate-700/60">
            <span className="text-[11px] font-medium text-slate-400 px-1.5 hidden md:inline">Lini:</span>
            <select
              value={activeLine.id}
              onChange={(e) => onSelectLine(e.target.value)}
              className="bg-slate-900 text-xs font-semibold text-white px-2 py-1 rounded border border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              aria-label="Pilih Lini Produksi"
            >
              {lines.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
            <button
              onClick={onOpenMultiLine}
              className="px-2 py-1 text-[11px] font-medium text-indigo-300 hover:text-white bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-800/50 rounded transition-colors flex items-center gap-1"
              title="Lihat status seluruh lini produksi sekaligus"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Matrix Lini</span>
            </button>
          </div>
        </div>

        {/* Style Selection Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Buyer Selector */}
          <div className="flex items-center gap-1 bg-slate-950/70 border border-slate-800 rounded-lg px-2 py-1">
            <span className="text-[11px] text-slate-400 font-medium">Buyer:</span>
            <select
              value={activeStyle.buyer}
              onChange={(e) => handleBuyerChange(e.target.value)}
              className="bg-transparent text-xs text-slate-200 font-semibold focus:outline-none cursor-pointer max-w-[130px] truncate"
              aria-label="Pilih Buyer"
            >
              {buyers.map((b) => (
                <option key={b} value={b} className="bg-slate-900 text-white">
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Style Selector */}
          <div className="flex items-center gap-1 bg-indigo-950/40 border border-indigo-600/40 rounded-lg px-2.5 py-1">
            <Shirt className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[11px] text-indigo-300 font-medium">Style:</span>
            <select
              value={activeStyle.id}
              onChange={(e) => onSelectStyle(e.target.value)}
              className="bg-transparent text-xs text-white font-bold focus:outline-none cursor-pointer max-w-[180px] sm:max-w-[210px] truncate"
              aria-label="Pilih Style Produk"
            >
              {styles.map((s) => (
                <option key={s.id} value={s.id} className="bg-slate-900 text-white font-normal">
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          {/* Version badge */}
          <div 
            onClick={onOpenHistory}
            className="flex items-center gap-1 text-[11px] text-slate-300 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-md px-2 py-1 cursor-pointer transition-colors"
            title="Klik untuk riwayat versi BP"
          >
            <GitBranch className="w-3 h-3 text-cyan-400" />
            <span className="font-mono">{activeStyle.version}</span>
          </div>

          {/* Auto-Save & Sync status */}
          <div className="hidden xl:flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-950/30 border border-emerald-800/40 rounded-md px-2 py-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Auto-Saved {lastSavedAt}</span>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={onOpenUpload}
            className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-700/20 flex items-center gap-1.5 transition-all"
            title="Import Breakdown Process dari Excel (.xlsx / .csv)"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Style</span>
          </button>

          <button
            onClick={onOpenTimeStudy}
            className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-700/20 flex items-center gap-1.5 transition-all"
            title="Input observasi stop watch Time Study"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Input Time Study</span>
          </button>

          <button
            onClick={onOpenKaizen}
            className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
            title="Simulasi Perbaikan Kaizen Before vs After"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Simulasi Kaizen</span>
          </button>

          <button
            onClick={onExportExcel}
            className="p-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Export Laporan PE ke Excel"
            aria-label="Export Excel"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </header>
  );
};
