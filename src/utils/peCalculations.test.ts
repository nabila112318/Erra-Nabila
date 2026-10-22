import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateTaktTime,
  calculatePitchTime,
  calculateTimeStudySMV,
  analyzeGarmentStyle,
} from './peCalculations';
import { GarmentStyle } from '../types/pe';

test('calculateTaktTime computes correct seconds per unit', () => {
  // 8 hours = 28,800 seconds. Target 800 pcs.
  // 28,800 / 800 = 36.0 seconds.
  const takt = calculateTaktTime(8, 800);
  assert.equal(takt, 36);

  // Edge cases
  assert.equal(calculateTaktTime(0, 800), 0);
  assert.equal(calculateTaktTime(8, 0), 0);
});

test('calculatePitchTime computes average workstation workload', () => {
  // Total 360 seconds divided by 10 operators = 36.0s
  const pitch = calculatePitchTime(360, 10);
  assert.equal(pitch, 36);
  assert.equal(calculatePitchTime(360, 0), 0);
});

test('calculateTimeStudySMV calculates average, rating, allowance and SMV correctly', () => {
  // cycles: [30, 30, 30, 30, 30] -> avg = 30s
  // rating: 100% -> basic = 30s
  // allowance: 10% -> stdTime = 30 * 1.1 = 33s
  // smv = 33 / 60 = 0.55 min
  const result = calculateTimeStudySMV([30, 30, 30, 30, 30], 100, 10);
  assert.equal(result.avgCycleSec, 30);
  assert.equal(result.basicTimeSec, 30);
  assert.equal(result.stdTimeSec, 33);
  assert.equal(result.smv, 0.55);
});

test('analyzeGarmentStyle accurately detects bottleneck and Line Balancing Efficiency', () => {
  const dummyStyle: GarmentStyle = {
    id: 'test-style-1',
    code: 'TEST-01',
    name: 'Test Style Shirt',
    buyer: 'Test Buyer',
    category: 'Kemeja',
    version: 'Rev 1.0',
    updatedAt: new Date().toISOString(),
    targetDailyPcs: 800, // Takt = (8 * 3600) / 800 = 36s
    effectiveHours: 8,
    targetManpower: 4,
    processes: [
      {
        id: 'p1',
        opNo: 1,
        name: 'Jahit Kerah',
        machine: 'SNLS',
        stdCycleTimeSec: 25,
        smv: 0.45,
        manpower: 1,
      },
      {
        id: 'p2',
        opNo: 2,
        name: 'Pasang Manset',
        machine: 'SNLS',
        stdCycleTimeSec: 45, // Bottleneck: 45s > 36s Takt
        smv: 0.80,
        manpower: 1,
      },
      {
        id: 'p3',
        opNo: 3,
        name: 'Obras Samping',
        machine: 'Overlock 4T',
        stdCycleTimeSec: 20,
        smv: 0.35,
        manpower: 1,
      },
      {
        id: 'p4',
        opNo: 4,
        name: 'Pasang Kancing',
        machine: 'Button Attach',
        stdCycleTimeSec: 30,
        smv: 0.55,
        manpower: 1,
      },
    ],
  };

  const analysis = analyzeGarmentStyle(dummyStyle);
  assert.equal(analysis.taktTimeSec, 36);
  assert.equal(analysis.bottleneckProcess.name, 'Pasang Manset');
  assert.equal(analysis.bottleneckProcess.stationWorkloadSec, 45);
  assert.equal(analysis.bottleneckProcess.status, 'Bottleneck');
  assert.equal(analysis.bottleneckProcess.bottleneckGapSec, 9); // 45 - 36 = 9

  // Total cycle time = 25 + 45 + 20 + 30 = 120s
  // 4 workstations * max cycle time (45s) = 180s
  // LBE = 120 / 180 * 100 = 66.7%
  assert.equal(analysis.lineBalancingEfficiency, 66.7);
  assert.equal(analysis.balanceDelayPercent, 33.3);

  // Hourly bottleneck capacity = Math.floor(3600 / 45) = 80 pcs/hr
  assert.equal(analysis.actualHourlyCapacity, 80);
  // Daily capacity = 80 * 8 = 640 pcs/day
  assert.equal(analysis.dailyCapacityPcs, 640);

  // Pareto verification: rank 1 is Pasang Manset (45s)
  assert.equal(analysis.paretoData[0].processName, 'Pasang Manset');
  assert.equal(analysis.paretoData[0].cycleTimeSec, 45);
  assert.equal(analysis.paretoData[0].isBottleneck, true);
});

test('analyzeGarmentStyle uses actual time study when present over standard cycle time', () => {
  const dummyStyle: GarmentStyle = {
    id: 'test-style-2',
    code: 'TEST-02',
    name: 'Time Study Test',
    buyer: 'Test Buyer',
    category: 'Rok',
    version: 'Rev 1.0',
    updatedAt: new Date().toISOString(),
    targetDailyPcs: 600,
    effectiveHours: 8,
    targetManpower: 2,
    processes: [
      {
        id: 'p1',
        opNo: 1,
        name: 'Jahit Resleting',
        machine: 'SNLS',
        stdCycleTimeSec: 30, // standard is 30s
        smv: 0.5,
        manpower: 1,
        timeStudy: {
          cycles: [40, 42, 38, 40],
          ratingFactor: 100,
          allowancePercent: 10,
          actualCycleTimeSec: 44, // actual measured is 44s
          actualSMV: 0.73,
          measuredAt: new Date().toISOString(),
        },
      },
    ],
  };

  const analysis = analyzeGarmentStyle(dummyStyle);
  assert.equal(analysis.hasActualTimeStudy, true);
  assert.equal(analysis.analyzedProcesses[0].effectiveCycleTimeSec, 44);
  assert.equal(analysis.analyzedProcesses[0].isEstimate, false);
});
