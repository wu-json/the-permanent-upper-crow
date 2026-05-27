import './index.css';

const app = document.getElementById('app');
if (!app) throw new Error('#app not found');

const title = document.createElement('h1');
title.textContent = 'permanent upper-crow';
title.className =
  'absolute inset-0 m-auto flex items-center justify-center text-center tracking-wide';
title.style.fontFamily = 'var(--font-pixel)';
title.style.fontSize = 'clamp(1.5rem, 6vw, 2.5rem)';
title.style.color = 'var(--color-ink)';
title.style.textShadow = '0 0 8px var(--color-glow-soft)';

app.appendChild(title);
