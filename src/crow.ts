export type CrowVariant = 'player' | 'golden' | 'background';

// Reaper-crow silhouette inspired by Death's Door: rounded head,
// triangular beak (right), tail-feather notches at the hem, two
// stubby legs integrated into the path itself (the notch tips at
// x=60 and x=40 extend down as flat rectangular pegs) so the
// silhouette is one continuous fill — no overlap alpha-stacking
// on the translucent background variant. Eye is a hole punched
// via fill-rule="evenodd".
const CROW_SVG = `<svg viewBox="0 0 100 144" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="M50 8C62 8 70 17 70 26L100 34L70 42C78 52 86 82 86 112L86 124L80 130L76 124L70 130L66 124L62 130L62 140L58 140L58 130L56 124L50 130L46 124L42 130L42 140L38 140L38 130L36 124L30 130L26 124L20 130L14 124L14 112C14 82 22 52 30 42C30 17 38 8 50 8ZM38 28a8 8 0 1 0 16 0a8 8 0 1 0-16 0Z"/></svg>`;

export function createCrow(variant: CrowVariant): HTMLElement {
  const el = document.createElement('div');
  el.classList.add('crow', `crow-${variant}`);
  if (variant === 'player') el.classList.add('crow-glow-player');
  if (variant === 'golden') el.classList.add('crow-glow-golden');
  el.innerHTML = CROW_SVG;
  return el;
}
