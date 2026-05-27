import './index.css';
import { deriveLoopValues, loadLoop, type GameState } from './state';
import type { GameContext, Screen } from './screens/types';
import { storeScreen } from './screens/store';
import { placeholderScreen } from './screens/placeholder';

const app = document.getElementById('app');
if (!app) throw new Error('#app not found');

const loop = loadLoop();
const state: GameState = {
  screen: 0,
  loop,
  ...deriveLoopValues(loop),
};

// Screens are mounted in order. Placeholder stands in for Screen 2
// until PR 4 replaces it with the factory.
const screens: Screen[] = [storeScreen, placeholderScreen];

let cleanup: (() => void) | null = null;
let currentIdx = 0;

function mount(idx: number): void {
  const next = screens[Math.min(idx, screens.length - 1)];
  if (cleanup) cleanup();
  app!.innerHTML = '';
  currentIdx = idx;
  const ctx: GameContext = {
    state,
    advance: () => mount(currentIdx + 1),
  };
  cleanup = next.mount(app!, ctx);
}

mount(0);
