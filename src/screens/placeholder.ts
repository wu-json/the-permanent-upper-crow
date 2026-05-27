import type { Screen } from './types';

export const placeholderScreen: Screen = {
  mount(host) {
    const root = document.createElement('div');
    root.classList.add('screen', 'screen-placeholder');
    root.innerHTML = `
      <p class="placeholder-title">screen 2 — coming soon</p>
      <p class="placeholder-sub">you accepted. Robo-Crow is on the conveyor.</p>
    `;
    host.appendChild(root);
    return () => {
      root.remove();
    };
  },
};
