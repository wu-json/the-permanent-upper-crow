import { isMuted, onMuteChange, toggleMute } from './audio';

export interface HudOptions {
  balance: number;
}

export function formatMoney(n: number): string {
  return `$ ${n.toLocaleString('en-US')}`;
}

// The loop count is intentionally not shown — the player should
// realize the game is looping from the climbing prices alone.
export function createHud({ balance }: HudOptions): HTMLElement {
  const hud = document.createElement('div');
  hud.classList.add('hud');

  const labelEl = document.createElement('span');
  labelEl.classList.add('hud-label');
  labelEl.textContent = 'NEST WORTH:';

  const balanceEl = document.createElement('span');
  balanceEl.classList.add('hud-balance');
  balanceEl.textContent = formatMoney(balance);

  hud.append(labelEl, balanceEl);
  return hud;
}

export function createPrimaryButton(
  label: string,
  onClick: () => void,
): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.classList.add('btn-primary');
  btn.textContent = `[ ${label} ]`;
  btn.addEventListener('click', onClick);
  return btn;
}

export function createSkipButton(onClick: () => void): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.classList.add('btn-skip');
  btn.textContent = '[ skip ]';
  btn.addEventListener('click', onClick);
  return btn;
}

// Persistent reset chip. Pinned to the top-left of the viewport
// (safe-area-aware) and mounted to document.body by main.ts so
// screen swaps don't tear it down. Tapping it warps the player
// back to loop 1, screen 0 — the only escape from the recursion
// the game otherwise refuses to offer.
// Counter-clockwise circular arrow — the universal "reset /
// restart" mark. Inline SVG so it inherits `currentColor` from
// the button and stays in the same monochrome palette as the
// speaker icon on the opposite corner.
const ICON_RESET = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-7.7L3 8"/><path d="M3 3v5h5"/></svg>`;

export function createResetButton(onReset: () => void): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.classList.add('btn-corner', 'btn-reset');
  btn.innerHTML = ICON_RESET;
  btn.setAttribute('aria-label', 'reset to the beginning');
  btn.addEventListener('click', onReset);
  return btn;
}

// Lucide-style speaker silhouette + two arcs ("Volume2") and
// the muted variant with an X to the right ("VolumeX"). Both
// drawn into a 24×24 viewBox so they share the same aspect
// ratio as the reset icon and the buttons can be one size.
const ICON_SOUND_ON = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M11 5L6 9H2v6h4l5 4z"/><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`;

const ICON_MUTED = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M11 5L6 9H2v6h4l5 4z"/><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M22 9L16 15M16 9L22 15"/></svg>`;

// Pinned to the top-right of the viewport (safe-area-aware) and
// shared across all screens — mounted to document.body by main.ts
// so screen swaps don't tear it down. On desktop it's a small
// bordered chip; on mobile it sits just below the notch.
export function createMuteButton(): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.classList.add('btn-corner', 'btn-mute');

  const render = () => {
    const m = isMuted();
    btn.innerHTML = m ? ICON_MUTED : ICON_SOUND_ON;
    btn.setAttribute('aria-pressed', m ? 'true' : 'false');
    btn.setAttribute('aria-label', m ? 'unmute' : 'mute');
    btn.classList.toggle('is-muted', m);
  };

  render();
  onMuteChange(render);
  btn.addEventListener('click', toggleMute);
  return btn;
}
