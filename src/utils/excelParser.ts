import * as XLSX from 'xlsx';
import { GarmentStyle, MachineType, ProcessItem } from '../types/pe';

// Helper to normalize machine type strings
export function normalizeMachineType(raw: string): MachineType {
  const text = (raw || '').trim().toUpperCase();
  if (text.includes('DNLS') || text.includes('DOUBLE')) return 'DNLS';
  if (text.includes('3T') || text.includes('3 BENANG') || text.includes('3 THREAD')) return 'Overlock 3T';
  if (text.includes('4T') || text.includes('4 BENANG') || text.includes('4 THREAD')) return 'Overlock 4T';
  if (text.includes('5T') || text.includes('5 BENANG') || text.includes('SAFETY')) return 'Overlock 5T';
  if (text.includes('KANSAI') || text.includes('FLATLOCK') || text.includes('HEM')) return 'Kansai / Flatlock';
  if (text.includes('BARTACK') || text.includes('BAR TACK')) return 'Bartack';
  if (text.includes('HOLE') || text.includes('LUBANG')) return 'Button Hole';
  if (text.includes('BUTTON') || text.includes('PASANG KANCING')) return 'Button Attach';
  if (text.includes('IRON') || text.includes('PRESS') || text.includes('GOSOK') || text.includes('SETRIKA')) return 'Iron / Press';
  if (text.includes('MANUAL') || text.includes('QC') || text.includes('TRIM') || text.includes('CHECK')) return 'Manual / QC';
  return 'SNLS'; // default single needle
}

export interface ParsedExcelResult {
  styleName: string;
  styleCode: string;
  buyer: string;
  category: 'Kemeja' | 'Rok' | 'Celana' | 'Jaket' | 'Kaos';
  version: string;
  targetDailyPcs: number;
  effectiveHours: number;
  targetManpower: number;
  processes: ProcessItem[];
}

export function parseExcelFile(arrayBuffer: ArrayBuffer): ParsedExcelResult {
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  let buyer = 'PT Garment Indah Pratama';
  let styleName = 'New Uploaded Style';
  let styleCode = `STYLE-${Date.now().toString().slice(-4)}`;
  let category: ParsedExcelResult['category'] = 'Kemeja';
  let version = 'Rev 1.0';
  let targetDailyPcs = 800;
  let effectiveHours = 8.0;
  let targetManpower = 20;

  // Search for header metadata in top 15 rows
  for (let i = 0; i < Math.min(15, rows.length); i++) {
    const row = rows[i] || [];
    const rowStr = row.join(' ').toLowerCase();

    if (rowStr.includes('buyer') || rowStr.includes('customer')) {
      const idx = row.findIndex((c: any) => String(c).toLowerCase().includes('buyer') || String(c).toLowerCase().includes('customer'));
      if (idx !== -1 && row[idx + 1]) buyer = String(row[idx + 1]).trim();
    }
    if (rowStr.includes('style name') || rowStr.includes('nama style')) {
      const idx = row.findIndex((c: any) => String(c).toLowerCase().includes('style name') || String(c).toLowerCase().includes('nama style'));
      if (idx !== -1 && row[idx + 1]) styleName = String(row[idx + 1]).trim();
    }
    if (rowStr.includes('style code') || rowStr.includes('kode style') || rowStr.includes('style no')) {
      const idx = row.findIndex((c: any) => String(c).toLowerCase().includes('code') || String(c).toLowerCase().includes('kode') || String(c).toLowerCase().includes('no'));
      if (idx !== -1 && row[idx + 1]) styleCode = String(row[idx + 1]).trim();
    }
    if (rowStr.includes('target') && !rowStr.includes('process')) {
      const foundNum = row.find((c: any) => typeof c === 'number' && c > 50 && c < 5000);
      if (foundNum) targetDailyPcs = Number(foundNum);
    }
    if (rowStr.includes('manpower') || rowStr.includes('operator')) {
      const foundMp = row.find((c: any) => typeof c === 'number' && c > 3 && c < 150);
      if (foundMp) targetManpower = Number(foundMp);
    }
  }

  // Detect category from styleName
  const lowerStyle = styleName.toLowerCase();
  if (lowerStyle.includes('rok') || lowerStyle.includes('skirt')) category = 'Rok';
  else if (lowerStyle.includes('celana') || lowerStyle.includes('pant')) category = 'Celana';
  else if (lowerStyle.includes('jaket') || lowerStyle.includes('jacket')) category = 'Jaket';
  else if (lowerStyle.includes('kaos') || lowerStyle.includes('t-shirt') || lowerStyle.includes('polo')) category = 'Kaos';

  // Find table header row (contains 'process', 'proses', 'operasi', 'operation', or 'smv')
  let headerRowIndex = -1;
  let colProcessName = -1;
  let colMachine = -1;
  let colCycleSec = -1;
  let colSMV = -1;
  let colOpNo = -1;

  for (let r = 0; r < Math.min(25, rows.length); r++) {
    const row = rows[r] || [];
    for (let c = 0; c < row.length; c++) {
      const val = String(row[c] || '').toLowerCase().trim();
      if (val.includes('proses') || val.includes('process') || val.includes('operasi') || val.includes('operation')) {
        colProcessName = c;
        headerRowIndex = r;
      }
      if (val.includes('mesin') || val.includes('machine')) {
        colMachine = c;
      }
      if (val.includes('cycle') || val.includes('ct (s') || val.includes('detik') || val.includes('sec')) {
        colCycleSec = c;
      }
      if (val.includes('smv') || val.includes('sam')) {
        colSMV = c;
      }
      if (val === 'no' || val === '#' || val === 'op no' || val.includes('urutan')) {
        colOpNo = c;
      }
    }
    if (headerRowIndex !== -1 && (colProcessName !== -1 || colSMV !== -1)) {
      break;
    }
  }

  // Fallbacks if columns not identified precisely
  if (colProcessName === -1) colProcessName = 1;
  if (colMachine === -1) colMachine = 2;
  if (colCycleSec === -1) colCycleSec = 3;
  if (colSMV === -1) colSMV = 4;
  if (headerRowIndex === -1) headerRowIndex = 4;

  const processes: ProcessItem[] = [];
  let seq = 1;

  for (let r = headerRowIndex + 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.length === 0) continue;

    const rawName = row[colProcessName];
    if (!rawName || String(rawName).trim() === '') continue;

    const name = String(rawName).trim();
    // Skip if it looks like a footer/total row
    if (name.toLowerCase().includes('total') || name.toLowerCase().includes('grand total')) continue;

    const rawMachine = row[colMachine] ? String(row[colMachine]) : 'SNLS';
    const machine = normalizeMachineType(rawMachine);

    let cycleSec = 0;
    let smv = 0;

    if (row[colCycleSec] !== undefined && !isNaN(Number(row[colCycleSec]))) {
      cycleSec = Number(row[colCycleSec]);
    }
    if (row[colSMV] !== undefined && !isNaN(Number(row[colSMV]))) {
      smv = Number(row[colSMV]);
    }

    // If SMV is present but not cycle time: cycleTime = SMV * 60
    if (cycleSec <= 0 && smv > 0) {
      cycleSec = Number((smv * 60).toFixed(1));
    }
    // If cycle time is present but not SMV: smv = cycleTime / 60
    if (smv <= 0 && cycleSec > 0) {
      smv = Number((cycleSec / 60).toFixed(3));
    }

    if (cycleSec <= 0 && smv <= 0) {
      cycleSec = 30;
      smv = 0.50;
    }

    const opNumber = row[colOpNo] && !isNaN(Number(row[colOpNo])) ? Number(row[colOpNo]) : seq;

    processes.push({
      id: `proc-up-${Date.now()}-${seq}`,
      opNo: opNumber,
      name,
      machine,
      stdCycleTimeSec: cycleSec,
      smv,
      manpower: 1,
    });
    seq++;
  }

  // If style name wasn't found in header, set a default
  if (!styleName || styleName === 'New Uploaded Style') {
    styleName = `Style Import ${new Date().toLocaleDateString('id-ID')}`;
  }

  return {
    styleName,
    styleCode,
    buyer,
    category,
    version,
    targetDailyPcs,
    effectiveHours,
    targetManpower: Math.max(targetManpower, processes.length > 0 ? Math.round(processes.length * 0.9) : 20),
    processes,
  };
}

/**
 * Generate a downloadable Blank Sample Excel Template for user
 */
export function generateSampleExcelTemplate(): void {
  const wb = XLSX.utils.book_new();

  const data = [
    ['GARMENT BREAKDOWN PROCESS (BP) & LINE BALANCING SPECIFICATION'],
    ['Buyer:', 'PT Garment Retail Internasional', 'Style Name:', 'Kemeja Polos Formal Pria'],
    ['Style Code:', 'GRI-KMJ-009', 'Category:', 'Kemeja'],
    ['Target Output / Hari (pcs):', 800, 'Jam Kerja Efektif (jam):', 8.0],
    ['Target Manpower (orang):', 22, 'Versi BP:', 'Rev 1.0'],
    [],
    ['No', 'Nama Proses Operasi', 'Jenis Mesin', 'Cycle Time Std (detik)', 'SMV (menit)', 'Manpower (orang)', 'Keterangan'],
    [1, 'Gosok Interlining Kerah', 'Iron / Press', 20, 0.33, 1, 'Heat press machine'],
    [2, 'Jahit Kerah Round', 'SNLS', 28, 0.47, 1, 'Needle size 11'],
    [3, 'Trim & Balik Kerah', 'SNLS', 30, 0.50, 1, 'Manual point turner'],
    [4, 'Stick Collar Band', 'SNLS', 34, 0.57, 1, 'Standard guide'],
    [5, 'Lipat Placket Kancing', 'DNLS', 26, 0.43, 1, 'Folder attachment'],
    [6, 'Pasang Kantong Depan', 'SNLS', 35, 0.58, 1, 'Pattern template'],
    [7, 'Sambung Bahu (Yoke)', 'SNLS', 25, 0.42, 1, 'Chainstitch / SNLS'],
    [8, 'Pasang Kerah ke Badan', 'SNLS', 42, 0.70, 1, 'Critical operation'],
    [9, 'Pasang Lengan ke Badan', 'SNLS', 38, 0.63, 1, 'Feed off the arm'],
    [10, 'Obras Sisi & Lengan', 'Overlock 5T', 28, 0.47, 1, 'Differential feed'],
    [11, 'Pasang Manset Lengan', 'SNLS', 32, 0.53, 1, 'Double stitch'],
    [12, 'Kelim Bawah Kemeja', 'SNLS', 24, 0.40, 1, 'Hemmer foot'],
    [13, 'Buat Lubang Kancing', 'Button Hole', 26, 0.43, 1, 'Electronic buttonholer'],
    [14, 'Pasang Kancing Depan', 'Button Attach', 24, 0.40, 1, 'Button clamp feeder'],
    [15, 'Trimming Benang & QC', 'Manual / QC', 30, 0.50, 1, 'Visual inspection'],
    [16, 'Final Steam Pressing', 'Iron / Press', 28, 0.47, 1, 'Vacuum table'],
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [
    { wch: 6 },
    { wch: 38 },
    { wch: 18 },
    { wch: 22 },
    { wch: 16 },
    { wch: 18 },
    { wch: 25 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Breakdown Process');
  XLSX.writeFile(wb, 'Template_Breakdown_Process_Garment_PE.xlsx');
}

/**
 * Export full Process Engineering Analysis to Excel
 */
export function exportAnalysisToExcel(style: GarmentStyle, analysis: any): void {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Summary & KPIs
  const summaryData = [
    ['GARMENT PROCESS ENGINEERING ANALYSIS REPORT'],
    ['Generated at:', new Date().toLocaleString('id-ID')],
    [],
    ['INFORMASI STYLE'],
    ['Buyer / Brand', style.buyer],
    ['Style Name', style.name],
    ['Style Code', style.code],
    ['Category', style.category],
    ['Breakdown Process Version', style.version],
    ['Status Data', analysis.hasActualTimeStudy ? 'Terverifikasi Time Study Aktual' : 'Estimasi Cycle Time Standar'],
    [],
    ['KEY PERFORMANCE INDICATORS (KPI)'],
    ['Target Output Harian', `${style.targetDailyPcs} pcs / hari`],
    ['Jam Kerja Efektif', `${style.effectiveHours} jam / shift`],
    ['Total Manpower', `${style.targetManpower} operator`],
    ['Takt Time Terhitung', `${analysis.taktTimeSec} detik / pcs`],
    ['Pitch Time Standar', `${analysis.pitchTimeSec} detik / operator`],
    ['Total SMV Standar', `${analysis.totalStdSMV} menit`],
    ['Total SMV Aktual', `${analysis.totalActualSMV} menit`],
    ['Line Balancing Efficiency (LBE)', `${analysis.lineBalancingEfficiency}%`],
    ['Balance Delay', `${analysis.balanceDelayPercent}%`],
    ['Proses Bottleneck Utama', analysis.bottleneckProcess?.name || '-'],
    ['Cycle Time Bottleneck', `${analysis.bottleneckProcess?.stationWorkloadSec || 0} detik`],
    ['Gap vs Takt Time', `${analysis.bottleneckProcess?.bottleneckGapSec || 0} detik`],
    ['Kapasitas Output Aktual', `${analysis.actualHourlyCapacity} pcs / jam (${analysis.dailyCapacityPcs} pcs / hari)`],
    ['Kapasitas Teoretis (Perfect Balance)', `${analysis.theoreticalHourlyCapacity} pcs / jam`],
    ['Tingkat Ketercapaian Target', `${analysis.targetAttainabilityPercent}%`],
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  wsSummary['!cols'] = [{ wch: 30 }, { wch: 45 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'KPI Summary');

  // Sheet 2: Breakdown Process Detail
  const bpHeader = [
    'No',
    'Nama Proses',
    'Jenis Mesin',
    'Std Cycle Time (s)',
    'Std SMV (m)',
    'Actual Cycle Time (s)',
    'Actual SMV (m)',
    'Status Time Study',
    'Manpower',
    'Workload (s)',
    'Status Lini',
    'Gap vs Takt (s)',
    'Pareto Rank',
    'Pareto Cum %',
  ];

  const bpRows = analysis.analyzedProcesses.map((p: any) => [
    p.opNo,
    p.name,
    p.machine,
    p.stdCycleTimeSec,
    p.smv,
    p.timeStudy ? p.timeStudy.actualCycleTimeSec : '-',
    p.timeStudy ? p.timeStudy.actualSMV : '-',
    p.isEstimate ? 'Estimasi Std' : 'Aktual Ukur',
    p.manpower,
    p.stationWorkloadSec,
    p.status,
    p.bottleneckGapSec,
    p.rank,
    `${p.cumPercentage}%`,
  ]);

  const wsBP = XLSX.utils.aoa_to_sheet([bpHeader, ...bpRows]);
  wsBP['!cols'] = [
    { wch: 6 },
    { wch: 38 },
    { wch: 18 },
    { wch: 16 },
    { wch: 14 },
    { wch: 18 },
    { wch: 14 },
    { wch: 16 },
    { wch: 10 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 12 },
    { wch: 14 },
  ];
  XLSX.utils.book_append_sheet(wb, wsBP, 'Breakdown Process');

  const cleanCode = style.code.replace(/[^a-zA-Z0-9_-]/g, '_');
  XLSX.writeFile(wb, `PE_Report_${cleanCode}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
