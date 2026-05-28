import type { Screen } from './types';

export const placeholderScreen: Screen = {
  mount(host) {
    const root = document.createElement('div');
    root.classList.add('screen', 'screen-placeholder');
    root.innerHTML = `
      <p class="placeholder-title">screen 4 — coming soon</p>
      <p class="placeholder-sub">the rich crow is loading the rocket.</p>
    `;
    host.appendChild(root);
    return () => {
      root.remove();
    };
  },
};
