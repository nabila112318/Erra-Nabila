import { ProductionLine } from '../types/pe';

export const INITIAL_PRODUCTION_LINES: ProductionLine[] = [
  {
    id: 'line-1',
    name: 'Line 1 (Workwear Section)',
    activeStyleId: 'style-trakindo-kemeja',
    supervisor: 'Bambang Sudirgo (SPV)',
    status: 'Running',
  },
  {
    id: 'line-2',
    name: 'Line 2 (Pants Section)',
    activeStyleId: 'style-trakindo-celana',
    supervisor: 'Siti Rahmawati (SPV)',
    status: 'Running',
  },
  {
    id: 'line-3',
    name: 'Line 3 (Uniform Skirt A)',
    activeStyleId: 'style-bca-rok-panjang',
    supervisor: 'Dewi Lestari (SPV)',
    status: 'Running',
  },
  {
    id: 'line-4',
    name: 'Line 4 (Uniform Skirt B)',
    activeStyleId: 'style-bca-rok-pendek',
    supervisor: 'Agus Purnomo (SPV)',
    status: 'Running',
  },
  {
    id: 'line-5',
    name: 'Line 5 (Executive Shirt A)',
    activeStyleId: 'style-xl-kmjl-02',
    supervisor: 'Rudi Hermawan (SPV)',
    status: 'Running',
  },
  {
    id: 'line-6',
    name: 'Line 6 (Executive Shirt B)',
    activeStyleId: 'style-xl-kmjl-02',
    supervisor: 'Ahmad Fauzi (SPV)',
    status: 'Running',
  },
];
