/**
 * Generic data loading utility for test automation.
 */

export function loadJson<T>(data: unknown): T {
  return data as T;
}

export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)] ?? arr[0];
}
