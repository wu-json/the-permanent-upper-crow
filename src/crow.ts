export type CrowVariant = 'player' | 'golden' | 'background';

// Front-facing reaper-crow silhouette inspired by Death's Door:
// rounded head, small right-pointing beak, eye is a true hole
// (fill-rule="evenodd"), pear-shaped body, tail-feather notches
// at the hem, two stubby legs.
const CROW_SVG = `<svg viewBox="0 0 100 144" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g fill="currentColor"><path fill-rule="evenodd" d="M50 8C62 8 70 18 70 28L94 33L70 38C78 50 86 80 86 112L86 124L80 130L76 124L70 130L66 124L60 130L56 124L50 130L46 124L40 130L36 124L30 130L26 124L20 130L14 124L14 112C14 80 22 50 30 38C30 18 38 8 50 8ZM38 28a8 8 0 1 0 16 0a8 8 0 1 0-16 0Z"/><rect x="40" y="130" width="3" height="10"/><rect x="57" y="130" width="3" height="10"/></g></svg>`;

export function createCrow(variant: CrowVariant): HTMLElement {
  const el = document.createElement('div');
  el.classList.add('crow', `crow-${variant}`);
  if (variant === 'player') el.classList.add('crow-glow-player');
  if (variant === 'golden') el.classList.add('crow-glow-golden');
  el.innerHTML = CROW_SVG;
  return el;
}
