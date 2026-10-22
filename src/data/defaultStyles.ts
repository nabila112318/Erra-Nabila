import { GarmentStyle } from '../types/pe';

export const INITIAL_GARMENT_STYLES: GarmentStyle[] = [
  {
    id: 'style-xl-kmjl-02',
    code: 'XL-KMJL-BRU-02',
    name: 'Style XL KMJL BRU 02',
    buyer: 'PT XL Axiata / Executive Apparel',
    category: 'Kemeja',
    version: 'Rev 2.1 (Production Release)',
    updatedAt: '2026-10-21T08:30:00Z',
    targetDailyPcs: 850,
    effectiveHours: 8.0, // 28,800 sec -> Takt Time = 33.88 sec
    targetManpower: 24,
    processes: [
      { id: 'xl-1', opNo: 1, name: 'Gosok / Press Interlining Kerah', machine: 'Iron / Press', stdCycleTimeSec: 22, smv: 0.40, manpower: 1 },
      { id: 'xl-2', opNo: 2, name: 'Jahit Round Kerah Atas & Bawah', machine: 'SNLS', stdCycleTimeSec: 28, smv: 0.51, manpower: 1 },
      { id: 'xl-3', opNo: 3, name: 'Trim & Balik Kerah + Topstitch', machine: 'SNLS', stdCycleTimeSec: 32, smv: 0.58, manpower: 1,
        timeStudy: { cycles: [31, 33, 30, 32, 34], ratingFactor: 100, allowancePercent: 12, actualCycleTimeSec: 32, actualSMV: 0.58, measuredAt: '2026-10-20T10:00:00Z' }
      },
      { id: 'xl-4', opNo: 4, name: 'Pasang Krah ke Collar Band (Stick Band)', machine: 'SNLS', stdCycleTimeSec: 36, smv: 0.65, manpower: 1,
        timeStudy: { cycles: [38, 41, 39, 42, 40], ratingFactor: 105, allowancePercent: 12, actualCycleTimeSec: 40, actualSMV: 0.78, measuredAt: '2026-10-20T10:30:00Z' }
      },
      { id: 'xl-5', opNo: 5, name: 'Lipat & Jahit Placket Depan (Box Pleat)', machine: 'DNLS', stdCycleTimeSec: 29, smv: 0.53, manpower: 1 },
      { id: 'xl-6', opNo: 6, name: 'Jahit Saku Depan + Pasang Flap', machine: 'SNLS', stdCycleTimeSec: 34, smv: 0.62, manpower: 1,
        timeStudy: { cycles: [35, 33, 36, 34, 35], ratingFactor: 100, allowancePercent: 12, actualCycleTimeSec: 34.6, actualSMV: 0.63, measuredAt: '2026-10-20T11:00:00Z' }
      },
      { id: 'xl-7', opNo: 7, name: 'Jahit Pasang Label Brand di Yoke Belakang', machine: 'SNLS', stdCycleTimeSec: 18, smv: 0.33, manpower: 1 },
      { id: 'xl-8', opNo: 8, name: 'Sambung Bahu Depan & Belakang (Attach Yoke)', machine: 'SNLS', stdCycleTimeSec: 26, smv: 0.47, manpower: 1 },
      { id: 'xl-9', opNo: 9, name: 'Pasang Kerah Jadi ke Badan Kemeja', machine: 'SNLS', stdCycleTimeSec: 42, smv: 0.76, manpower: 1,
        timeStudy: { cycles: [46, 44, 48, 45, 47], ratingFactor: 105, allowancePercent: 14, actualCycleTimeSec: 46.0, actualSMV: 0.92, measuredAt: '2026-10-20T11:45:00Z' }
      },
      { id: 'xl-10', opNo: 10, name: 'Tutup Kerah Dalam (Topstitch Collar)', machine: 'SNLS', stdCycleTimeSec: 30, smv: 0.55, manpower: 1 },
      { id: 'xl-11', opNo: 11, name: 'Pasang Belahan Manset (Sleeve Placket)', machine: 'SNLS', stdCycleTimeSec: 35, smv: 0.64, manpower: 1 },
      { id: 'xl-12', opNo: 12, name: 'Pasang Lengan ke Badan (Set Sleeve)', machine: 'SNLS', stdCycleTimeSec: 38, smv: 0.69, manpower: 1,
        timeStudy: { cycles: [39, 41, 40, 42, 38], ratingFactor: 100, allowancePercent: 12, actualCycleTimeSec: 40.0, actualSMV: 0.75, measuredAt: '2026-10-20T13:30:00Z' }
      },
      { id: 'xl-13', opNo: 13, name: 'Tutup Samping & Lengan (Side Seam Armhole)', machine: 'Overlock 5T', stdCycleTimeSec: 28, smv: 0.51, manpower: 1 },
      { id: 'xl-14', opNo: 14, name: 'Pasang Manset Tangan (Attach Cuff)', machine: 'SNLS', stdCycleTimeSec: 31, smv: 0.56, manpower: 1 },
      { id: 'xl-15', opNo: 15, name: 'Kelim Bawah Kemeja (Hem Bottom)', machine: 'SNLS', stdCycleTimeSec: 24, smv: 0.44, manpower: 1 },
      { id: 'xl-16', opNo: 16, name: 'Buat Lubang Kancing Kerah & Placket (7 hole)', machine: 'Button Hole', stdCycleTimeSec: 27, smv: 0.49, manpower: 1 },
      { id: 'xl-17', opNo: 17, name: 'Pasang Kancing Depan & Manset (8 pcs)', machine: 'Button Attach', stdCycleTimeSec: 25, smv: 0.45, manpower: 1 },
      { id: 'xl-18', opNo: 18, name: 'Final Trimming Benang, QC & Ironing', machine: 'Manual / QC', stdCycleTimeSec: 33, smv: 0.60, manpower: 1 },
    ],
    history: [
      {
        id: 'hist-xl-1',
        date: '2026-10-18T10:00:00Z',
        version: 'Rev 1.0 (Initial BP)',
        notes: 'Initial production trial line set up with 20 operators.',
        totalSMV: 9.85,
        lineEfficiency: 58.2,
        bottleneckProcess: 'Pasang Kerah Jadi ke Badan Kemeja',
        bottleneckCycleSec: 48.0,
      },
      {
        id: 'hist-xl-2',
        date: '2026-10-20T16:00:00Z',
        version: 'Rev 2.1 (Kaizen Post-Balancing)',
        notes: 'Added pre-creasing jig on collar band and optimized side seam feed.',
        totalSMV: 9.92,
        lineEfficiency: 68.5,
        bottleneckProcess: 'Pasang Kerah Jadi ke Badan Kemeja',
        bottleneckCycleSec: 46.0,
      }
    ]
  },
  {
    id: 'style-bca-rok-pendek',
    code: 'BCA-ROK-PDK-01',
    name: 'Style BCA Rok Pendek',
    buyer: 'Bank BCA Uniform Division',
    category: 'Rok',
    version: 'Rev 1.4',
    updatedAt: '2026-10-21T09:15:00Z',
    targetDailyPcs: 960,
    effectiveHours: 8.0, // 28,800 sec -> Takt Time = 30.0 sec
    targetManpower: 16,
    processes: [
      { id: 'bca-p-1', opNo: 1, name: 'Obras Keliling Panel Depan & Belakang', machine: 'Overlock 3T', stdCycleTimeSec: 18, smv: 0.33, manpower: 1 },
      { id: 'bca-p-2', opNo: 2, name: 'Jahit Kupnat Depan (2x) & Belakang (2x)', machine: 'SNLS', stdCycleTimeSec: 24, smv: 0.44, manpower: 1,
        timeStudy: { cycles: [23, 25, 24, 26, 24], ratingFactor: 100, allowancePercent: 12, actualCycleTimeSec: 24.4, actualSMV: 0.45, measuredAt: '2026-10-19T09:00:00Z' }
      },
      { id: 'bca-p-3', opNo: 3, name: 'Pasang Resleting Jepang Belakang (Invisible Zipper)', machine: 'SNLS', stdCycleTimeSec: 36, smv: 0.65, manpower: 1,
        timeStudy: { cycles: [37, 39, 36, 40, 38], ratingFactor: 105, allowancePercent: 14, actualCycleTimeSec: 38.0, actualSMV: 0.74, measuredAt: '2026-10-19T09:30:00Z' }
      },
      { id: 'bca-p-4', opNo: 4, name: 'Sambung Tengah Belakang & Belahan Span (Vent)', machine: 'SNLS', stdCycleTimeSec: 26, smv: 0.47, manpower: 1 },
      { id: 'bca-p-5', opNo: 5, name: 'Bartack Penguat Belahan Span Bawah', machine: 'Bartack', stdCycleTimeSec: 14, smv: 0.25, manpower: 1 },
      { id: 'bca-p-6', opNo: 6, name: 'Jahit Kantong Samping Kanan & Kiri', machine: 'SNLS', stdCycleTimeSec: 32, smv: 0.58, manpower: 1,
        timeStudy: { cycles: [31, 33, 32, 34, 30], ratingFactor: 100, allowancePercent: 12, actualCycleTimeSec: 32.0, actualSMV: 0.59, measuredAt: '2026-10-19T10:15:00Z' }
      },
      { id: 'bca-p-7', opNo: 7, name: 'Sambung Sisi Rok Kanan & Kiri (Side Seam)', machine: 'SNLS', stdCycleTimeSec: 25, smv: 0.45, manpower: 1 },
      { id: 'bca-p-8', opNo: 8, name: 'Press & Pasang Ban Pinggang (Attach Waistband)', machine: 'SNLS', stdCycleTimeSec: 34, smv: 0.62, manpower: 1,
        timeStudy: { cycles: [33, 35, 36, 34, 35], ratingFactor: 100, allowancePercent: 12, actualCycleTimeSec: 34.6, actualSMV: 0.64, measuredAt: '2026-10-19T11:00:00Z' }
      },
      { id: 'bca-p-9', opNo: 9, name: 'Tutup Ujung Ban Pinggang & Pasang Hak/Kancing', machine: 'Manual / QC', stdCycleTimeSec: 22, smv: 0.40, manpower: 1 },
      { id: 'bca-p-10', opNo: 10, name: 'Kelim Bawah Rok (Blind Hemstitch)', machine: 'Kansai / Flatlock', stdCycleTimeSec: 20, smv: 0.36, manpower: 1 },
      { id: 'bca-p-11', opNo: 11, name: 'Pressing Steam Finishing & Lipatan', machine: 'Iron / Press', stdCycleTimeSec: 28, smv: 0.51, manpower: 1 },
      { id: 'bca-p-12', opNo: 12, name: 'Inspeksi Kualitas QC Akhir & Packaging', machine: 'Manual / QC', stdCycleTimeSec: 24, smv: 0.44, manpower: 1 },
    ],
    history: [
      {
        id: 'hist-bca-p-1',
        date: '2026-10-15T08:00:00Z',
        version: 'Rev 1.0 (Pilot Run)',
        notes: 'Initial run on Line 4. Zipper attachment caused minor pile up.',
        totalSMV: 5.50,
        lineEfficiency: 63.8,
        bottleneckProcess: 'Pasang Resleting Jepang Belakang (Invisible Zipper)',
        bottleneckCycleSec: 42.0,
      }
    ]
  },
  {
    id: 'style-bca-rok-panjang',
    code: 'BCA-ROK-PJG-02',
    name: 'Style BCA Rok Panjang',
    buyer: 'Bank BCA Uniform Division',
    category: 'Rok',
    version: 'Rev 1.1',
    updatedAt: '2026-10-21T07:45:00Z',
    targetDailyPcs: 720,
    effectiveHours: 8.0, // 28,800 sec -> Takt Time = 40.0 sec
    targetManpower: 18,
    processes: [
      { id: 'bca-pj-1', opNo: 1, name: 'Obras 4 Panel Rok Panjang A-Line', machine: 'Overlock 3T', stdCycleTimeSec: 28, smv: 0.51, manpower: 1 },
      { id: 'bca-pj-2', opNo: 2, name: 'Jahit Kupnat Badan Depan & Belakang', machine: 'SNLS', stdCycleTimeSec: 25, smv: 0.45, manpower: 1 },
      { id: 'bca-pj-3', opNo: 3, name: 'Pasang Kantong Sembunyi Sisi Kanan', machine: 'SNLS', stdCycleTimeSec: 33, smv: 0.60, manpower: 1 },
      { id: 'bca-pj-4', opNo: 4, name: 'Pasang Resleting Sembunyi Sisi Kiri', machine: 'SNLS', stdCycleTimeSec: 38, smv: 0.69, manpower: 1 },
      { id: 'bca-pj-5', opNo: 5, name: 'Sambung Panel Depan & Belakang A-Line', machine: 'SNLS', stdCycleTimeSec: 44, smv: 0.80, manpower: 1 },
      { id: 'bca-pj-6', opNo: 6, name: 'Gosok Buka Kampuh Sisi & Belakang', machine: 'Iron / Press', stdCycleTimeSec: 30, smv: 0.55, manpower: 1 },
      { id: 'bca-pj-7', opNo: 7, name: 'Pasang Karet Elastis Pinggang Kiri-Kanan', machine: 'SNLS', stdCycleTimeSec: 35, smv: 0.64, manpower: 1 },
      { id: 'bca-pj-8', opNo: 8, name: 'Pasang Ban Pinggang Rok Panjang', machine: 'SNLS', stdCycleTimeSec: 42, smv: 0.76, manpower: 1 },
      { id: 'bca-pj-9', opNo: 9, name: 'Topstitch Ban Pinggang Keliling', machine: 'SNLS', stdCycleTimeSec: 34, smv: 0.62, manpower: 1 },
      { id: 'bca-pj-10', opNo: 10, name: 'Pasang Kancing Pengait (Hook & Eye)', machine: 'Manual / QC', stdCycleTimeSec: 22, smv: 0.40, manpower: 1 },
      { id: 'bca-pj-11', opNo: 11, name: 'Kelim Bawah Rok A-Line (Lingkar Lebar)', machine: 'Kansai / Flatlock', stdCycleTimeSec: 48, smv: 0.87, manpower: 1 },
      { id: 'bca-pj-12', opNo: 12, name: 'Gosok & Setrika Lipatan Rok Panjang', machine: 'Iron / Press', stdCycleTimeSec: 36, smv: 0.65, manpower: 1 },
      { id: 'bca-pj-13', opNo: 13, name: 'Trimming Sisa Benang & Labeling', machine: 'Manual / QC', stdCycleTimeSec: 26, smv: 0.47, manpower: 1 },
      { id: 'bca-pj-14', opNo: 14, name: 'QC Akhir & Folding Packing', machine: 'Manual / QC', stdCycleTimeSec: 28, smv: 0.51, manpower: 1 },
    ]
  },
  {
    id: 'style-trakindo-kemeja',
    code: 'TRAK-KMJ-TAC-01',
    name: 'Style Trakindo Kemeja',
    buyer: 'PT Trakindo Utama (Heavy Equipment)',
    category: 'Kemeja',
    version: 'Rev 3.0 (Tactical Workwear)',
    updatedAt: '2026-10-21T06:20:00Z',
    targetDailyPcs: 650,
    effectiveHours: 8.0, // 28,800 sec -> Takt Time = 44.3 sec
    targetManpower: 28,
    processes: [
      { id: 'tr-k-1', opNo: 1, name: 'Jahit Flap Kantong Tactical Kanan/Kiri (2x)', machine: 'SNLS', stdCycleTimeSec: 34, smv: 0.62, manpower: 1 },
      { id: 'tr-k-2', opNo: 2, name: 'Pasang Velcro Patch Badge Logo Trakindo', machine: 'SNLS', stdCycleTimeSec: 24, smv: 0.44, manpower: 1 },
      { id: 'tr-k-3', opNo: 3, name: 'Jahit Kantong Berlipat (Pleated Pocket) + Pen Holder', machine: 'SNLS', stdCycleTimeSec: 48, smv: 0.87, manpower: 1,
        timeStudy: { cycles: [50, 48, 52, 49, 51], ratingFactor: 105, allowancePercent: 14, actualCycleTimeSec: 50.0, actualSMV: 1.00, measuredAt: '2026-10-20T08:30:00Z' }
      },
      { id: 'tr-k-4', opNo: 4, name: 'Pasang Kantong ke Panel Depan', machine: 'DNLS', stdCycleTimeSec: 42, smv: 0.76, manpower: 1 },
      { id: 'tr-k-5', opNo: 5, name: 'Bartack Sudut Kantong Tactical (8 titik)', machine: 'Bartack', stdCycleTimeSec: 28, smv: 0.51, manpower: 1 },
      { id: 'tr-k-6', opNo: 6, name: 'Pasang Ventilasi Jaring Punggung (Air-mesh Back)', machine: 'SNLS', stdCycleTimeSec: 36, smv: 0.65, manpower: 1 },
      { id: 'tr-k-7', opNo: 7, name: 'Sambung Yoke Belakang Double Stitch', machine: 'DNLS', stdCycleTimeSec: 32, smv: 0.58, manpower: 1 },
      { id: 'tr-k-8', opNo: 8, name: 'Jahit Reflektif 3M Safety Strip Belakang', machine: 'SNLS', stdCycleTimeSec: 30, smv: 0.55, manpower: 1 },
      { id: 'tr-k-9', opNo: 9, name: 'Jahit & Balik Kerah Safari Stand-Up', machine: 'SNLS', stdCycleTimeSec: 35, smv: 0.64, manpower: 1 },
      { id: 'tr-k-10', opNo: 10, name: 'Pasang Kerah Safari ke Badan Kemeja', machine: 'SNLS', stdCycleTimeSec: 52, smv: 0.95, manpower: 1,
        timeStudy: { cycles: [54, 52, 56, 53, 55], ratingFactor: 105, allowancePercent: 14, actualCycleTimeSec: 54.0, actualSMV: 1.08, measuredAt: '2026-10-20T09:40:00Z' }
      },
      { id: 'tr-k-11', opNo: 11, name: 'Pasang Placket Resleting + Flap Kancing', machine: 'SNLS', stdCycleTimeSec: 46, smv: 0.84, manpower: 1 },
      { id: 'tr-k-12', opNo: 12, name: 'Pasang Lidah Pundak (Epaulette Shoulder)', machine: 'SNLS', stdCycleTimeSec: 28, smv: 0.51, manpower: 1 },
      { id: 'tr-k-13', opNo: 13, name: 'Pasang Lengan & Sambung Bahu Heavy Duty', machine: 'DNLS', stdCycleTimeSec: 45, smv: 0.82, manpower: 1 },
      { id: 'tr-k-14', opNo: 14, name: 'Obras Sambung Sisi & Lengan', machine: 'Overlock 5T', stdCycleTimeSec: 34, smv: 0.62, manpower: 1 },
      { id: 'tr-k-15', opNo: 15, name: 'Pasang Tali Penggulung Lengan (Roll-up Tab)', machine: 'SNLS', stdCycleTimeSec: 26, smv: 0.47, manpower: 1 },
      { id: 'tr-k-16', opNo: 16, name: 'Pasang Manset Heavy Duty Workwear', machine: 'SNLS', stdCycleTimeSec: 38, smv: 0.69, manpower: 1 },
      { id: 'tr-k-17', opNo: 17, name: 'Kelim Bawah Kemeja Tactical', machine: 'SNLS', stdCycleTimeSec: 30, smv: 0.55, manpower: 1 },
      { id: 'tr-k-18', opNo: 18, name: 'Buat Lubang Kancing + Pasang Snap Button', machine: 'Button Hole', stdCycleTimeSec: 32, smv: 0.58, manpower: 1 },
      { id: 'tr-k-19', opNo: 19, name: 'Bartack Semua Titik Stress Point', machine: 'Bartack', stdCycleTimeSec: 25, smv: 0.45, manpower: 1 },
      { id: 'tr-k-20', opNo: 20, name: 'Quality Inspection & Steam Pressing Workwear', machine: 'Manual / QC', stdCycleTimeSec: 40, smv: 0.73, manpower: 1 },
    ]
  },
  {
    id: 'style-trakindo-celana',
    code: 'TRAK-CLN-CRG-02',
    name: 'Style Trakindo Celana Panjang',
    buyer: 'PT Trakindo Utama (Heavy Equipment)',
    category: 'Celana',
    version: 'Rev 2.0 (Cargo Pants)',
    updatedAt: '2026-10-21T05:50:00Z',
    targetDailyPcs: 600,
    effectiveHours: 8.0, // 28,800 sec -> Takt Time = 48.0 sec
    targetManpower: 32,
    processes: [
      { id: 'tr-c-1', opNo: 1, name: 'Obras Seluruh Potongan Panel Celana (6 pcs)', machine: 'Overlock 3T', stdCycleTimeSec: 36, smv: 0.65, manpower: 1 },
      { id: 'tr-c-2', opNo: 2, name: 'Jahit Dart / Kupnat Belakang Celana', machine: 'SNLS', stdCycleTimeSec: 22, smv: 0.40, manpower: 1 },
      { id: 'tr-c-3', opNo: 3, name: 'Jahit Kantong Samping Depan (Slanted Pocket)', machine: 'SNLS', stdCycleTimeSec: 38, smv: 0.69, manpower: 1 },
      { id: 'tr-c-4', opNo: 4, name: 'Jahit Kantong Bobok Belakang (Welting Pocket)', machine: 'DNLS', stdCycleTimeSec: 44, smv: 0.80, manpower: 1 },
      { id: 'tr-c-5', opNo: 5, name: 'Pasang Flap Kantong Belakang + Kancing', machine: 'SNLS', stdCycleTimeSec: 30, smv: 0.55, manpower: 1 },
      { id: 'tr-c-6', opNo: 6, name: 'Buat Box Kantong Cargo Samping (Bellow Pocket)', machine: 'SNLS', stdCycleTimeSec: 52, smv: 0.95, manpower: 1 },
      { id: 'tr-c-7', opNo: 7, name: 'Pasang Kantong Cargo ke Paha Kiri & Kanan', machine: 'DNLS', stdCycleTimeSec: 58, smv: 1.05, manpower: 1,
        timeStudy: { cycles: [59, 62, 58, 64, 60], ratingFactor: 105, allowancePercent: 14, actualCycleTimeSec: 60.6, actualSMV: 1.21, measuredAt: '2026-10-18T14:00:00Z' }
      },
      { id: 'tr-c-8', opNo: 8, name: 'Bartack Sudut Kantong Cargo (12 titik)', machine: 'Bartack', stdCycleTimeSec: 32, smv: 0.58, manpower: 1 },
      { id: 'tr-c-9', opNo: 9, name: 'Jahit Pelindung Lutut Ganda (Double Knee Patch)', machine: 'DNLS', stdCycleTimeSec: 40, smv: 0.73, manpower: 1 },
      { id: 'tr-c-10', opNo: 10, name: 'Pasang Resleting Metal YKK Fly Front', machine: 'SNLS', stdCycleTimeSec: 42, smv: 0.76, manpower: 1 },
      { id: 'tr-c-11', opNo: 11, name: 'Jahit Golbi / J-Stitch Fly Front', machine: 'DNLS', stdCycleTimeSec: 28, smv: 0.51, manpower: 1 },
      { id: 'tr-c-12', opNo: 12, name: 'Sambung Pesak Depan (Front Crotch)', machine: 'SNLS', stdCycleTimeSec: 24, smv: 0.44, manpower: 1 },
      { id: 'tr-c-13', opNo: 13, name: 'Sambung Sisi Luar Celana (Outseam)', machine: 'Overlock 5T', stdCycleTimeSec: 45, smv: 0.82, manpower: 1 },
      { id: 'tr-c-14', opNo: 14, name: 'Topstitch Jahitan Sisi Luar Celana', machine: 'DNLS', stdCycleTimeSec: 40, smv: 0.73, manpower: 1 },
      { id: 'tr-c-15', opNo: 15, name: 'Sambung Selangkangan Dalam (Inseam)', machine: 'Overlock 5T', stdCycleTimeSec: 42, smv: 0.76, manpower: 1 },
      { id: 'tr-c-16', opNo: 16, name: 'Sambung Pesak Belakang (Back Crotch Triple Stitch)', machine: 'DNLS', stdCycleTimeSec: 36, smv: 0.65, manpower: 1 },
      { id: 'tr-c-17', opNo: 17, name: 'Pasang Ban Pinggang Celana Kerja (Waistband)', machine: 'Kansai / Flatlock', stdCycleTimeSec: 46, smv: 0.84, manpower: 1 },
      { id: 'tr-c-18', opNo: 18, name: 'Buat & Pasang Tali Gesper / Belt Loops (7 pcs)', machine: 'Bartack', stdCycleTimeSec: 34, smv: 0.62, manpower: 1 },
      { id: 'tr-c-19', opNo: 19, name: 'Pasang Kancing Logam Jeans / Rivet', machine: 'Button Attach', stdCycleTimeSec: 20, smv: 0.36, manpower: 1 },
      { id: 'tr-c-20', opNo: 20, name: 'Kelim Bawah Celana (Hem Bottom Cuff)', machine: 'SNLS', stdCycleTimeSec: 32, smv: 0.58, manpower: 1 },
      { id: 'tr-c-21', opNo: 21, name: 'Final Pressing & Setrika Lipatan Celana', machine: 'Iron / Press', stdCycleTimeSec: 48, smv: 0.87, manpower: 1 },
      { id: 'tr-c-22', opNo: 22, name: 'QC Akhir, Cek Dimensi Toleransi & Packing', machine: 'Manual / QC', stdCycleTimeSec: 36, smv: 0.65, manpower: 1 },
    ]
  }
];
