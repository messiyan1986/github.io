import type { MetronomeConfig } from '../types';

const STORAGE_KEY = 'count-me-in:last-session';

export function saveToLocalStorage(config: Partial<MetronomeConfig>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // 忽略存储错误
  }
}

export function loadFromLocalStorage(): Partial<MetronomeConfig> | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}
