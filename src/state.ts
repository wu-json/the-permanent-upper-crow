const STORAGE_KEY = 'puc:loop';

const BASE_BALANCE = 12;
const BASE_POST_LAUNCH_BALANCE = 41_200;
const BASE_BREAD_PRICE = 47;

export type ScreenIndex = 0 | 1 | 2 | 3 | 4;

export interface GameState {
  screen: ScreenIndex;
  loop: number;
  balance: number;
  breadPrice: number;
}

export interface LoopValues {
  balance: number;
  postLaunchBalance: number;
  breadPrice: number;
}

export function deriveLoopValues(loop: number): LoopValues {
  const factor = 10 ** Math.max(0, loop - 1);
  return {
    balance: BASE_BALANCE * factor,
    postLaunchBalance: BASE_POST_LAUNCH_BALANCE * factor,
    breadPrice: BASE_BREAD_PRICE * factor,
  };
}

export function loadLoop(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const n = raw ? Number.parseInt(raw, 10) : 1;
    return Number.isFinite(n) && n >= 1 ? n : 1;
  } catch {
    return 1;
  }
}

export function saveLoop(loop: number): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(loop));
  } catch {
    /* localStorage unavailable (private mode, quota) — non-fatal */
  }
}
