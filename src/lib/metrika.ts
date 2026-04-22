export const METRIKA_ID = 108713848;

declare global {
  interface Window {
    ym?: (id: number, method: string, ...args: unknown[]) => void;
  }
}

export function reachGoal(target: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  if (!window.ym) return;
  window.ym(METRIKA_ID, 'reachGoal', target, params);
}