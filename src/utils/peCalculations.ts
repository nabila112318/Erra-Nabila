import { GarmentStyle, ProcessAnalysisItem, StyleAnalysisResult, ProcessItem } from '../types/pe';

/**
 * Calculate Takt Time in seconds per garment unit.
 * Takt Time = (Available Working Hours * 3600) / Target Daily Output
 */
export function calculateTaktTime(effectiveHours: number, targetDailyPcs: number): number {
  if (targetDailyPcs <= 0 || effectiveHours <= 0) return 0;
  return Number(((effectiveHours * 3600) / targetDailyPcs).toFixed(1));
}

/**
 * Calculate Pitch Time (balanced cycle time target per workstation):
 * Pitch Time = (Total Workload in Seconds) / Number of Operators
 */
export function calculatePitchTime(totalCycleTimeSec: number, totalManpower: number): number {
  if (totalManpower <= 0) return 0;
  return Number((totalCycleTimeSec / totalManpower).toFixed(1));
}

/**
 * Calculate Time Study Actual SMV from cycles, rating factor, and allowance:
 * Avg Cycle = sum(cycles) / n
 * Basic Time = Avg Cycle * (ratingFactor / 100)
 * Standard Time (sec) = Basic Time * (1 + allowancePercent / 100)
 * Actual SMV (min) = Standard Time / 60
 */
export function calculateTimeStudySMV(
  cycles: number[],
  ratingFactorPercent = 100,
  allowancePercent = 12
): { avgCycleSec: number; basicTimeSec: number; stdTimeSec: number; smv: number } {
  const validCycles = cycles.filter(c => typeof c === 'number' && c > 0);
  if (validCycles.length === 0) {
    return { avgCycleSec: 0, basicTimeSec: 0, stdTimeSec: 0, smv: 0 };
  }
  const sum = validCycles.reduce((acc, curr) => acc + curr, 0);
  const avgCycleSec = Number((sum / validCycles.length).toFixed(1));
  const basicTimeSec = Number((avgCycleSec * (ratingFactorPercent / 100)).toFixed(1));
  const stdTimeSec = Number((basicTimeSec * (1 + allowancePercent / 100)).toFixed(1));
  const smv = Number((stdTimeSec / 60).toFixed(3));
  return { avgCycleSec, basicTimeSec, stdTimeSec, smv };
}

/**
 * Complete reactive Process Engineering analysis for a given Garment Style.
 */
export function analyzeGarmentStyle(
  style: GarmentStyle,
  overrideTargetPcs?: number,
  overrideManpower?: number,
  overrideHours?: number
): StyleAnalysisResult {
  const targetDailyPcs = overrideTargetPcs !== undefined && overrideTargetPcs > 0 ? overrideTargetPcs : style.targetDailyPcs;
  const effectiveHours = overrideHours !== undefined && overrideHours > 0 ? overrideHours : style.effectiveHours;
  const totalManpower = overrideManpower !== undefined && overrideManpower > 0 ? overrideManpower : style.targetManpower;

  const taktTimeSec = calculateTaktTime(effectiveHours, targetDailyPcs);

  const processes = style.processes || [];
  let totalStdSMV = 0;
  let totalActualSMV = 0;
  let hasActualTimeStudy = false;

  // Process analysis items
  const analyzed: Omit<ProcessAnalysisItem, 'rank' | 'cumPercentage' | 'impactPercent'>[] = processes.map((p) => {
    totalStdSMV += p.smv || 0;
    const isEstimate = !p.timeStudy || typeof p.timeStudy.actualCycleTimeSec !== 'number' || p.timeStudy.actualCycleTimeSec <= 0;
    
    if (!isEstimate && p.timeStudy) {
      hasActualTimeStudy = true;
      totalActualSMV += p.timeStudy.actualSMV || (p.timeStudy.actualCycleTimeSec / 60);
    } else {
      totalActualSMV += p.smv;
    }

    const effectiveCycleTimeSec = !isEstimate && p.timeStudy
      ? p.timeStudy.actualCycleTimeSec
      : p.stdCycleTimeSec;

    const manpower = p.manpower > 0 ? p.manpower : 1;
    const stationWorkloadSec = Number((effectiveCycleTimeSec / manpower).toFixed(1));
    const bottleneckGapSec = Number((stationWorkloadSec - taktTimeSec).toFixed(1));
    const stationEfficiency = taktTimeSec > 0 ? Number(((taktTimeSec / stationWorkloadSec) * 100).toFixed(1)) : 100;

    let status: ProcessAnalysisItem['status'] = 'Balanced';
    if (stationWorkloadSec > taktTimeSec) {
      status = 'Bottleneck';
    } else if (stationWorkloadSec >= taktTimeSec * 0.9) {
      status = 'Critical';
    } else if (stationWorkloadSec < taktTimeSec * 0.65) {
      status = 'Underloaded';
    }

    return {
      ...p,
      effectiveCycleTimeSec,
      isEstimate,
      status,
      bottleneckGapSec,
      stationWorkloadSec,
      stationEfficiency,
    };
  });

  // Calculate sum of station workloads
  const totalStationWorkloadSec = analyzed.reduce((sum, p) => sum + p.stationWorkloadSec, 0);
  const totalWorkstations = analyzed.reduce((sum, p) => sum + (p.manpower > 0 ? p.manpower : 1), 0);

  // Sort descending by stationWorkloadSec for Pareto and ranking
  const sortedByWorkload = [...analyzed].sort((a, b) => b.stationWorkloadSec - a.stationWorkloadSec);

  let runningCumulative = 0;
  const paretoDataMap = new Map<string, { rank: number; cumPercentage: number; impactPercent: number }>();

  sortedByWorkload.forEach((p, index) => {
    const impactPercent = totalStationWorkloadSec > 0 
      ? Number(((p.stationWorkloadSec / totalStationWorkloadSec) * 100).toFixed(1))
      : 0;
    runningCumulative += impactPercent;
    paretoDataMap.set(p.id, {
      rank: index + 1,
      cumPercentage: Number(Math.min(100, runningCumulative).toFixed(1)),
      impactPercent,
    });
  });

  const fullAnalyzedProcesses: ProcessAnalysisItem[] = analyzed.map(p => {
    const meta = paretoDataMap.get(p.id) || { rank: 1, cumPercentage: 0, impactPercent: 0 };
    return {
      ...p,
      rank: meta.rank,
      cumPercentage: meta.cumPercentage,
      impactPercent: meta.impactPercent,
    };
  });

  // Bottleneck process is rank 1
  const bottleneckProcess = fullAnalyzedProcesses.find(p => p.rank === 1) || fullAnalyzedProcesses[0] || ({} as ProcessAnalysisItem);
  const maxCycleTimeSec = bottleneckProcess.stationWorkloadSec || 1;

  // Pitch time
  const pitchTimeSec = calculatePitchTime(totalStationWorkloadSec, totalManpower || totalWorkstations);

  // Line Balancing Efficiency (LBE)
  // LBE (%) = Total Station Workloads / (Total Workstations * Max Cycle Time) * 100
  const lbe = maxCycleTimeSec > 0 && totalWorkstations > 0
    ? Number(((totalStationWorkloadSec / (totalWorkstations * maxCycleTimeSec)) * 100).toFixed(1))
    : 0;
  const balanceDelayPercent = Number((100 - lbe).toFixed(1));

  // Capacities
  // Hourly bottleneck capacity = 3600 / maxCycleTimeSec
  const actualHourlyCapacity = maxCycleTimeSec > 0 ? Math.floor(3600 / maxCycleTimeSec) : 0;
  // Theoretical capacity if perfectly balanced = (totalManpower * 3600) / (totalStationWorkloadSec)
  const theoreticalHourlyCapacity = totalStationWorkloadSec > 0 && totalWorkstations > 0
    ? Math.floor((totalWorkstations * 3600) / totalStationWorkloadSec)
    : 0;
  const dailyCapacityPcs = Math.floor(actualHourlyCapacity * effectiveHours);
  const targetAttainabilityPercent = targetDailyPcs > 0
    ? Number(((dailyCapacityPcs / targetDailyPcs) * 100).toFixed(1))
    : 0;

  // Critical processes: all items with stationWorkloadSec > taktTimeSec OR top 3
  const criticalProcesses = fullAnalyzedProcesses
    .filter(p => p.stationWorkloadSec >= taktTimeSec * 0.95 || p.rank <= 3)
    .sort((a, b) => b.stationWorkloadSec - a.stationWorkloadSec);

  // Pareto chart list
  const paretoData = sortedByWorkload.map(p => {
    const meta = paretoDataMap.get(p.id)!;
    return {
      processName: p.name,
      machine: p.machine,
      cycleTimeSec: p.stationWorkloadSec,
      impactPercent: meta.impactPercent,
      cumPercentage: meta.cumPercentage,
      isBottleneck: p.stationWorkloadSec > taktTimeSec,
    };
  });

  return {
    taktTimeSec,
    pitchTimeSec,
    totalStdSMV: Number(totalStdSMV.toFixed(2)),
    totalActualSMV: Number(totalActualSMV.toFixed(2)),
    bottleneckProcess,
    criticalProcesses,
    lineBalancingEfficiency: lbe,
    balanceDelayPercent,
    theoreticalHourlyCapacity,
    actualHourlyCapacity,
    dailyCapacityPcs,
    targetAttainabilityPercent,
    analyzedProcesses: fullAnalyzedProcesses,
    hasActualTimeStudy,
    paretoData,
  };
}

/**
 * Generate smart Engineering / Lean Kaizen recommendations based on bottleneck & balancing profile.
 */
export function generateKaizenRecommendations(analysis: StyleAnalysisResult): {
  id: string;
  type: 'SPLIT_PROCESS' | 'ATTACHMENT' | 'WORK_SHARING' | 'TRAINING';
  title: string;
  targetProcess: string;
  description: string;
  estimatedGainPercent: number;
  estimatedNewOutput: number;
}[] {
  const recommendations: ReturnType<typeof generateKaizenRecommendations> = [];
  const bottleneck = analysis.bottleneckProcess;
  if (!bottleneck || !bottleneck.name) return recommendations;

  const gap = bottleneck.stationWorkloadSec - analysis.taktTimeSec;
  
  if (gap > 0) {
    // 1. Process splitting / Add helper
    recommendations.push({
      id: 'rec-split',
      type: 'SPLIT_PROCESS',
      title: `Alokasikan 2 Operator pada '${bottleneck.name}'`,
      targetProcess: bottleneck.name,
      description: `Waktu kerja stasiun (${bottleneck.stationWorkloadSec}s) melebihi Takt Time (${analysis.taktTimeSec}s) sebesar ${gap.toFixed(1)}s. Menambah 1 manpower atau membagi sub-proses akan memotong cycle time stasiun menjadi ${(bottleneck.stationWorkloadSec / 2).toFixed(1)}s.`,
      estimatedGainPercent: 24,
      estimatedNewOutput: Math.floor(analysis.actualHourlyCapacity * 1.24 * 8),
    });

    // 2. Machine Attachment / Folder / Jig
    if (bottleneck.machine.includes('SNLS') || bottleneck.machine.includes('DNLS') || bottleneck.machine.includes('Overlock')) {
      recommendations.push({
        id: 'rec-attachment',
        type: 'ATTACHMENT',
        title: `Pasang Folder / Pneumatic Guide pada Mesin ${bottleneck.machine}`,
        targetProcess: bottleneck.name,
        description: `Penggunaan sewing folder atau suction device dapat mengeliminasi waktu manual handling dan alignment bahan hingga 15-20%, menurunkan waktu siklus menjadi ${(bottleneck.stationWorkloadSec * 0.82).toFixed(1)}s.`,
        estimatedGainPercent: 15,
        estimatedNewOutput: Math.floor(analysis.actualHourlyCapacity * 1.15 * 8),
      });
    }

    // 3. Work-sharing with underloaded neighbor
    const underloaded = analysis.analyzedProcesses.find(p => p.status === 'Underloaded');
    if (underloaded) {
      recommendations.push({
        id: 'rec-workshare',
        type: 'WORK_SHARING',
        title: `Work-Sharing Elemen Kerja dengan Stasiun '${underloaded.name}'`,
        targetProcess: bottleneck.name,
        description: `Stasiun '${underloaded.name}' memiliki utilisasi rendah (${underloaded.stationWorkloadSec}s vs Takt Time ${analysis.taktTimeSec}s). Alihkan elemen trimming benang atau marking ke stasiun ini untuk menyeimbangkan lini.`,
        estimatedGainPercent: 12,
        estimatedNewOutput: Math.floor(analysis.actualHourlyCapacity * 1.12 * 8),
      });
    }
  } else {
    recommendations.push({
      id: 'rec-standardized',
      type: 'TRAINING',
      title: 'Lini Sudah Seimbang (Takt Time Terpenuhi)',
      targetProcess: bottleneck.name,
      description: `Seluruh proses berada di bawah Takt Time (${analysis.taktTimeSec}s). Pertahankan standar kerja dengan SOP visual dan pelatihan 5S di area lini.`,
      estimatedGainPercent: 5,
      estimatedNewOutput: analysis.dailyCapacityPcs,
    });
  }

  return recommendations;
}
