export type MachineType = 
  | 'SNLS' // Single Needle Lockstitch
  | 'DNLS' // Double Needle Lockstitch
  | 'Overlock 3T'
  | 'Overlock 4T'
  | 'Overlock 5T'
  | 'Kansai / Flatlock'
  | 'Bartack'
  | 'Button Hole'
  | 'Button Attach'
  | 'Iron / Press'
  | 'Manual / QC';

export interface ProcessItem {
  id: string;
  opNo: number; // Operation sequence number (e.g. 1, 2, 3...)
  name: string;
  machine: MachineType;
  stdCycleTimeSec: number; // Standard cycle time in seconds
  smv: number; // Standard Minute Value (usually stdCycleTimeSec / 60 * allowance factor)
  manpower: number; // Operators allocated (default 1)
  timeStudy?: {
    cycles: number[]; // e.g. [32, 34, 31, 33, 35] in seconds
    ratingFactor: number; // e.g. 100% or 105%
    allowancePercent: number; // e.g. 12% or 15%
    actualCycleTimeSec: number; // calculated average or basic cycle time
    actualSMV: number;
    measuredAt: string; // ISO date
    operatorName?: string;
  };
  notes?: string;
}

export interface GarmentStyle {
  id: string;
  code: string; // e.g. "XL-KMJL-BRU-02"
  name: string; // e.g. "XL KMJL BRU 02"
  buyer: string; // e.g. "XL Apparel"
  category: 'Kemeja' | 'Rok' | 'Celana' | 'Jaket' | 'Kaos';
  version: string; // e.g. "Rev 1.2"
  updatedAt: string;
  targetDailyPcs: number; // e.g. 800
  effectiveHours: number; // e.g. 8.0 hours
  targetManpower: number; // e.g. 24 operators
  processes: ProcessItem[];
  history?: StyleHistoryEntry[];
}

export interface StyleHistoryEntry {
  id: string;
  date: string;
  version: string;
  notes: string;
  totalSMV: number;
  lineEfficiency: number;
  bottleneckProcess: string;
  bottleneckCycleSec: number;
}

export interface ProductionLine {
  id: string;
  name: string; // e.g. "Line 1", "Line 4", "Line 6"
  activeStyleId: string;
  customTargetPcs?: number;
  customManpower?: number;
  customEffectiveHours?: number;
  supervisor?: string;
  status: 'Running' | 'Style Changeover' | 'Idle';
}

export interface ProcessAnalysisItem extends ProcessItem {
  effectiveCycleTimeSec: number; // actual if measured, else standard
  isEstimate: boolean; // true if using standard (no time study)
  status: 'Bottleneck' | 'Critical' | 'Balanced' | 'Underloaded';
  bottleneckGapSec: number; // effectiveCycleTimeSec - taktTimeSec
  stationWorkloadSec: number; // effectiveCycleTimeSec / manpower
  stationEfficiency: number; // percentage vs takt time
  rank: number; // 1 = highest cycle time
  cumPercentage: number; // for Pareto (0-100%)
  impactPercent: number; // individual % of total cycle time
}

export interface StyleAnalysisResult {
  taktTimeSec: number;
  pitchTimeSec: number;
  totalStdSMV: number;
  totalActualSMV: number;
  bottleneckProcess: ProcessAnalysisItem;
  criticalProcesses: ProcessAnalysisItem[]; // top 3 or all > takt time
  lineBalancingEfficiency: number; // LBE in %
  balanceDelayPercent: number; // 100 - LBE
  theoreticalHourlyCapacity: number; // pcs/hour
  actualHourlyCapacity: number; // pcs/hour constrained by bottleneck
  dailyCapacityPcs: number; // pcs/day
  targetAttainabilityPercent: number; // actual daily capacity / target
  analyzedProcesses: ProcessAnalysisItem[];
  hasActualTimeStudy: boolean;
  paretoData: {
    processName: string;
    machine: string;
    cycleTimeSec: number;
    impactPercent: number;
    cumPercentage: number;
    isBottleneck: boolean;
  }[];
}
