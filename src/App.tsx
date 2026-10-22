import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { GarmentStyle, ProductionLine, ProcessAnalysisItem } from './types/pe';
import { 
  loadStoredStyles, 
  saveStoredStyles, 
  loadStoredLines, 
  saveStoredLines, 
  loadActiveLineId, 
  saveActiveLineId,
  resetAllDataToDefault 
} from './services/storage';
import { analyzeGarmentStyle } from './utils/peCalculations';
import { exportAnalysisToExcel } from './utils/excelParser';

import { HeaderBar } from './components/HeaderBar';
import { KPISummary } from './components/KPISummary';
import { LineBalancingYamazumi } from './components/LineBalancingYamazumi';
import { ParetoAnalysis } from './components/ParetoAnalysis';
import { BreakdownProcessTable } from './components/BreakdownProcessTable';
import { TimeStudyModal } from './components/TimeStudyModal';
import { UploadStyleModal } from './components/UploadStyleModal';
import { MultiLineMatrixModal } from './components/MultiLineMatrixModal';
import { KaizenSimulationModal } from './components/KaizenSimulationModal';
import { StyleHistoryModal } from './components/StyleHistoryModal';
import { ToastNotification, ToastMessage } from './components/ToastNotification';

export default function App() {
  // State
  const [styles, setStyles] = useState<GarmentStyle[]>(() => loadStoredStyles());
  const [lines, setLines] = useState<ProductionLine[]>(() => loadStoredLines());
  const [activeLineId, setActiveLineId] = useState<string>(() => loadActiveLineId());
  
  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isTimeStudyOpen, setIsTimeStudyOpen] = useState(false);
  const [timeStudyTargetProcessId, setTimeStudyTargetProcessId] = useState<string | null>(null);
  const [isKaizenOpen, setIsKaizenOpen] = useState(false);
  const [isMultiLineOpen, setIsMultiLineOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [lastSavedAt, setLastSavedAt] = useState<string>(() => 
    new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  );

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Find active line and assigned style
  const activeLine = useMemo(() => {
    return lines.find(l => l.id === activeLineId) || lines[0];
  }, [lines, activeLineId]);

  const activeStyle = useMemo(() => {
    return styles.find(s => s.id === activeLine.activeStyleId) || styles[0];
  }, [styles, activeLine]);

  // Reactive calculation: analyzeGarmentStyle automatically recomputes when style or parameters change
  const analysis = useMemo(() => {
    return analyzeGarmentStyle(
      activeStyle,
      activeLine.customTargetPcs,
      activeLine.customManpower,
      activeLine.customEffectiveHours
    );
  }, [activeStyle, activeLine]);

  // Handle switching style on current line
  const handleSelectStyle = (styleId: string) => {
    const target = styles.find(s => s.id === styleId);
    if (!target) return;

    // Update active line's assigned style
    const updatedLines = lines.map(l => {
      if (l.id === activeLine.id) {
        return {
          ...l,
          activeStyleId: styleId,
          // Reset custom overrides so style defaults take effect
          customTargetPcs: undefined,
          customManpower: undefined,
          customEffectiveHours: undefined,
        };
      }
      return l;
    });

    setLines(updatedLines);
    saveStoredLines(updatedLines);
    setLastSavedAt(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));

    addToast({
      type: 'success',
      title: 'Style Berhasil Diganti!',
      message: `${activeLine.name} kini mengerjakan '${target.name}'. Seluruh breakdown process, SMV, Pareto, dan bottleneck telah diperbarui otomatis.`,
    });
  };

  // Handle switching active line view
  const handleSelectLine = (lineId: string) => {
    setActiveLineId(lineId);
    saveActiveLineId(lineId);
    const lineObj = lines.find(l => l.id === lineId);
    if (lineObj) {
      const assigned = styles.find(s => s.id === lineObj.activeStyleId);
      addToast({
        type: 'info',
        title: `Beralih ke ${lineObj.name}`,
        message: `Memuat data analisa style aktif: '${assigned?.name || 'Style'}'.`,
      });
    }
  };

  // Handle assigning style to a specific line in Multi-Line matrix
  const handleAssignStyleToLine = (lineId: string, styleId: string) => {
    const updatedLines = lines.map(l => {
      if (l.id === lineId) {
        return { ...l, activeStyleId: styleId };
      }
      return l;
    });
    setLines(updatedLines);
    saveStoredLines(updatedLines);
    setLastSavedAt(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));

    const targetStyle = styles.find(s => s.id === styleId);
    const targetLine = lines.find(l => l.id === lineId);
    addToast({
      type: 'success',
      title: 'Style Lini Diperbarui',
      message: `${targetLine?.name} dialokasikan ke '${targetStyle?.name}'.`,
    });
  };

  // Handle live parameter update (Target Pcs, Manpower, Hours)
  const handleUpdateParams = (params: { targetDailyPcs?: number; targetManpower?: number; effectiveHours?: number }) => {
    const updatedStyle: GarmentStyle = {
      ...activeStyle,
      targetDailyPcs: params.targetDailyPcs !== undefined && params.targetDailyPcs > 0 ? params.targetDailyPcs : activeStyle.targetDailyPcs,
      targetManpower: params.targetManpower !== undefined && params.targetManpower > 0 ? params.targetManpower : activeStyle.targetManpower,
      effectiveHours: params.effectiveHours !== undefined && params.effectiveHours > 0 ? params.effectiveHours : activeStyle.effectiveHours,
      updatedAt: new Date().toISOString(),
    };

    const updatedStyles = styles.map(s => s.id === activeStyle.id ? updatedStyle : s);
    setStyles(updatedStyles);
    saveStoredStyles(updatedStyles);
    setLastSavedAt(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
  };

  // Handle adjusting manpower on a single operation
  const handleAdjustManpower = (processId: string, delta: number) => {
    const updatedProcesses = activeStyle.processes.map(p => {
      if (p.id === processId) {
        const nextMp = Math.max(1, (p.manpower || 1) + delta);
        return { ...p, manpower: nextMp };
      }
      return p;
    });

    const updatedStyle: GarmentStyle = {
      ...activeStyle,
      processes: updatedProcesses,
      updatedAt: new Date().toISOString(),
    };

    const updatedStyles = styles.map(s => s.id === activeStyle.id ? updatedStyle : s);
    setStyles(updatedStyles);
    saveStoredStyles(updatedStyles);
    setLastSavedAt(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
  };

  // Handle saving time study observation
  const handleSaveTimeStudy = (processId: string, timeStudyData: NonNullable<GarmentStyle['processes'][0]['timeStudy']>) => {
    const updatedProcesses = activeStyle.processes.map(p => {
      if (p.id === processId) {
        return {
          ...p,
          timeStudy: timeStudyData,
        };
      }
      return p;
    });

    const updatedStyle: GarmentStyle = {
      ...activeStyle,
      processes: updatedProcesses,
      updatedAt: new Date().toISOString(),
    };

    const updatedStyles = styles.map(s => s.id === activeStyle.id ? updatedStyle : s);
    setStyles(updatedStyles);
    saveStoredStyles(updatedStyles);
    setLastSavedAt(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));

    const pObj = activeStyle.processes.find(p => p.id === processId);
    addToast({
      type: 'success',
      title: 'Time Study Tersimpan!',
      message: `Data aktual untuk '${pObj?.name}' (${timeStudyData.actualCycleTimeSec}s, SMV ${timeStudyData.actualSMV.toFixed(2)}m) berhasil diperbarui.`,
    });
  };

  // Handle saving new / uploaded style
  const handleSaveNewStyle = (newOrUpdatedStyle: GarmentStyle) => {
    const exists = styles.some(s => s.id === newOrUpdatedStyle.id);
    let updatedStyles: GarmentStyle[];

    if (exists) {
      updatedStyles = styles.map(s => s.id === newOrUpdatedStyle.id ? newOrUpdatedStyle : s);
    } else {
      updatedStyles = [newOrUpdatedStyle, ...styles];
    }

    setStyles(updatedStyles);
    saveStoredStyles(updatedStyles);

    // Automatically switch active line to this uploaded style
    const updatedLines = lines.map(l => {
      if (l.id === activeLine.id) {
        return { ...l, activeStyleId: newOrUpdatedStyle.id };
      }
      return l;
    });
    setLines(updatedLines);
    saveStoredLines(updatedLines);
    setLastSavedAt(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));

    addToast({
      type: 'success',
      title: 'Style Baru Berhasil Dimuat!',
      message: `Style '${newOrUpdatedStyle.name}' aktif di ${activeLine.name}. Seluruh perhitungan & grafik langsung diperbarui.`,
    });
  };

  // Update single process in BP table
  const handleUpdateProcess = (updatedItem: ProcessAnalysisItem) => {
    const updatedProcesses = activeStyle.processes.map(p => {
      if (p.id === updatedItem.id) {
        return {
          ...p,
          name: updatedItem.name,
          machine: updatedItem.machine,
          stdCycleTimeSec: updatedItem.stdCycleTimeSec,
          smv: updatedItem.smv,
          manpower: updatedItem.manpower,
        };
      }
      return p;
    });

    const updatedStyle: GarmentStyle = {
      ...activeStyle,
      processes: updatedProcesses,
      updatedAt: new Date().toISOString(),
    };

    const updatedStyles = styles.map(s => s.id === activeStyle.id ? updatedStyle : s);
    setStyles(updatedStyles);
    saveStoredStyles(updatedStyles);
    setLastSavedAt(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
  };

  // Add process to BP
  const handleAddProcess = (newProcessData: any) => {
    const newProcess = {
      ...newProcessData,
      id: `proc-custom-${Date.now()}`,
    };

    const updatedProcesses = [...activeStyle.processes, newProcess];
    const updatedStyle: GarmentStyle = {
      ...activeStyle,
      processes: updatedProcesses,
      updatedAt: new Date().toISOString(),
    };

    const updatedStyles = styles.map(s => s.id === activeStyle.id ? updatedStyle : s);
    setStyles(updatedStyles);
    saveStoredStyles(updatedStyles);
    setLastSavedAt(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));

    addToast({
      type: 'info',
      title: 'Operasi Ditambahkan',
      message: `'${newProcess.name}' berhasil ditambahkan ke Breakdown Process ${activeStyle.name}.`,
    });
  };

  // Delete process from BP
  const handleDeleteProcess = (processId: string) => {
    const updatedProcesses = activeStyle.processes.filter(p => p.id !== processId);
    const updatedStyle: GarmentStyle = {
      ...activeStyle,
      processes: updatedProcesses,
      updatedAt: new Date().toISOString(),
    };

    const updatedStyles = styles.map(s => s.id === activeStyle.id ? updatedStyle : s);
    setStyles(updatedStyles);
    saveStoredStyles(updatedStyles);
    setLastSavedAt(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
  };

  // Apply Kaizen Simulation into actual active style
  const handleApplyKaizenToStyle = (updatedStyle: GarmentStyle, revisionNote: string) => {
    const historyEntry = {
      id: `hist-${Date.now()}`,
      date: new Date().toISOString(),
      version: updatedStyle.version,
      notes: revisionNote,
      totalSMV: analysis.totalActualSMV,
      lineEfficiency: analysis.lineBalancingEfficiency,
      bottleneckProcess: analysis.bottleneckProcess.name,
      bottleneckCycleSec: analysis.bottleneckProcess.stationWorkloadSec,
    };

    const styleWithHistory: GarmentStyle = {
      ...updatedStyle,
      history: [historyEntry, ...(updatedStyle.history || [])],
    };

    const updatedStyles = styles.map(s => s.id === activeStyle.id ? styleWithHistory : s);
    setStyles(updatedStyles);
    saveStoredStyles(updatedStyles);
    setLastSavedAt(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));

    addToast({
      type: 'success',
      title: 'Hasil Kaizen Diterapkan!',
      message: `Versi style dinaikkan ke '${styleWithHistory.version}'. Riwayat audit trail tersimpan.`,
    });
  };

  // Trigger Time Study modal for specific process
  const handleOpenTimeStudyForProcess = (processId: string) => {
    setTimeStudyTargetProcessId(processId);
    setIsTimeStudyOpen(true);
  };

  // Reset all data to factory demo default
  const handleResetAllData = () => {
    if (window.confirm('Reset seluruh database style dan line ke data awal demo industri garmen?')) {
      resetAllDataToDefault();
      setStyles(loadStoredStyles());
      setLines(loadStoredLines());
      setActiveLineId('line-4');
      addToast({
        type: 'info',
        title: 'Database Direset',
        message: 'Seluruh data style (XL KMJL, BCA Rok, Trakindo) telah dikembalikan ke standar awal.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* 1. Header Navigation Bar */}
      <HeaderBar
        lines={lines}
        activeLine={activeLine}
        onSelectLine={handleSelectLine}
        styles={styles}
        activeStyle={activeStyle}
        onSelectStyle={handleSelectStyle}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenTimeStudy={() => {
          setTimeStudyTargetProcessId(analysis.bottleneckProcess?.id || null);
          setIsTimeStudyOpen(true);
        }}
        onOpenKaizen={() => setIsKaizenOpen(true)}
        onOpenMultiLine={() => setIsMultiLineOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onExportExcel={() => exportAnalysisToExcel(activeStyle, analysis)}
        lastSavedAt={lastSavedAt}
      />

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* 2. Key Performance Indicators (KPI) & Live Controllers */}
        <KPISummary
          style={activeStyle}
          analysis={analysis}
          onUpdateParams={handleUpdateParams}
        />

        {/* 3. Line Balancing Yamazumi Workstation Chart */}
        <LineBalancingYamazumi
          analysis={analysis}
          onSelectProcessForTimeStudy={handleOpenTimeStudyForProcess}
          onAdjustManpower={handleAdjustManpower}
        />

        {/* 4. Pareto Analysis & Critical Bottleneck Ranking */}
        <ParetoAnalysis
          analysis={analysis}
          onSelectProcessForTimeStudy={handleOpenTimeStudyForProcess}
        />

        {/* 5. Breakdown Process (BP) & SMV Full Table */}
        <BreakdownProcessTable
          style={activeStyle}
          processes={analysis.analyzedProcesses}
          taktTimeSec={analysis.taktTimeSec}
          onSelectTimeStudy={handleOpenTimeStudyForProcess}
          onUpdateProcess={handleUpdateProcess}
          onAddProcess={handleAddProcess}
          onDeleteProcess={handleDeleteProcess}
        />

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/90 py-4 px-6 text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">Garment Process Engineering Analysis Dashboard</span>
            <span>•</span>
            <span>Independent Multi-Line Architecture</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleResetAllData}
              className="text-slate-500 hover:text-slate-300 transition-colors underline"
            >
              Reset Data Contoh (Default)
            </button>
            <span>Standard Industrial Engineering &copy; 2026</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <UploadStyleModal
        existingStyles={styles}
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSaveNewStyle={handleSaveNewStyle}
      />

      <TimeStudyModal
        style={activeStyle}
        processes={analysis.analyzedProcesses}
        initialProcessId={timeStudyTargetProcessId}
        isOpen={isTimeStudyOpen}
        onClose={() => {
          setIsTimeStudyOpen(false);
          setTimeStudyTargetProcessId(null);
        }}
        onSaveTimeStudy={handleSaveTimeStudy}
      />

      <MultiLineMatrixModal
        lines={lines}
        styles={styles}
        activeLineId={activeLine.id}
        isOpen={isMultiLineOpen}
        onClose={() => setIsMultiLineOpen(false)}
        onSelectLine={handleSelectLine}
        onAssignStyleToLine={handleAssignStyleToLine}
      />

      <KaizenSimulationModal
        style={activeStyle}
        currentAnalysis={analysis}
        isOpen={isKaizenOpen}
        onClose={() => setIsKaizenOpen(false)}
        onApplyKaizenToStyle={handleApplyKaizenToStyle}
      />

      <StyleHistoryModal
        style={activeStyle}
        currentAnalysis={analysis}
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />

      {/* Floating Toast Notifications */}
      <ToastNotification
        toasts={toasts}
        onDismiss={dismissToast}
      />

    </div>
  );
}
