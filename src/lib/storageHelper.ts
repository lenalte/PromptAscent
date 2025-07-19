// lib/storageHelper.ts
import "client-only";

/**
 * Liest einen String aus dem localStorage.
 * - Gibt defaultValue zurück, wenn nichts (oder "undefined") gespeichert ist.
 * - Versucht JSON.parse; fällt das fehl, wird der rohe String zurückgegeben.
 */
export function getLocalStorage<T = any>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  const stored = window.localStorage.getItem(key);
  if (stored === null || stored === "undefined") {
    return defaultValue;
  }
  try {
    return JSON.parse(stored) as T;
  } catch {
    return (stored as unknown) as T;
  }
}

/**
 * Speichert value:
 * - Ist value ein String, wird er direkt abgelegt.
 * - Sonst per JSON.stringify.
 */
export function setLocalStorage(key: string, value: any): void {
  if (typeof window === "undefined") return;
  const toStore = typeof value === "string" ? value : JSON.stringify(value);
  window.localStorage.setItem(key, toStore);
}
