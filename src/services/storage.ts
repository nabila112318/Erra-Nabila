import { GarmentStyle, ProductionLine } from '../types/pe';
import { INITIAL_GARMENT_STYLES } from '../data/defaultStyles';
import { INITIAL_PRODUCTION_LINES } from '../data/defaultLines';

const STYLES_KEY = 'garment_pe_styles_v2';
const LINES_KEY = 'garment_pe_lines_v2';
const ACTIVE_LINE_KEY = 'garment_pe_active_line_v2';

type StorageListener = () => void;
const listeners = new Set<StorageListener>();

export function subscribeStorage(listener: StorageListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyChange() {
  listeners.forEach(fn => fn());
}

export function loadStoredStyles(): GarmentStyle[] {
  try {
    const raw = localStorage.getItem(STYLES_KEY);
    if (!raw) {
      localStorage.setItem(STYLES_KEY, JSON.stringify(INITIAL_GARMENT_STYLES));
      return INITIAL_GARMENT_STYLES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (e) {
    console.error('Failed to parse stored styles', e);
  }
  return INITIAL_GARMENT_STYLES;
}

export function saveStoredStyles(styles: GarmentStyle[]): void {
  try {
    localStorage.setItem(STYLES_KEY, JSON.stringify(styles));
    notifyChange();
  } catch (e) {
    console.error('Failed to save styles to storage', e);
  }
}

export function loadStoredLines(): ProductionLine[] {
  try {
    const raw = localStorage.getItem(LINES_KEY);
    if (!raw) {
      localStorage.setItem(LINES_KEY, JSON.stringify(INITIAL_PRODUCTION_LINES));
      return INITIAL_PRODUCTION_LINES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (e) {
    console.error('Failed to parse stored lines', e);
  }
  return INITIAL_PRODUCTION_LINES;
}

export function saveStoredLines(lines: ProductionLine[]): void {
  try {
    localStorage.setItem(LINES_KEY, JSON.stringify(lines));
    notifyChange();
  } catch (e) {
    console.error('Failed to save lines to storage', e);
  }
}

export function loadActiveLineId(): string {
  try {
    const raw = localStorage.getItem(ACTIVE_LINE_KEY);
    if (raw) return raw;
  } catch {}
  return 'line-4'; // Line 4 default as per prompt example
}

export function saveActiveLineId(lineId: string): void {
  try {
    localStorage.setItem(ACTIVE_LINE_KEY, lineId);
    notifyChange();
  } catch {}
}

export function resetAllDataToDefault(): void {
  localStorage.setItem(STYLES_KEY, JSON.stringify(INITIAL_GARMENT_STYLES));
  localStorage.setItem(LINES_KEY, JSON.stringify(INITIAL_PRODUCTION_LINES));
  localStorage.setItem(ACTIVE_LINE_KEY, 'line-4');
  notifyChange();
}
