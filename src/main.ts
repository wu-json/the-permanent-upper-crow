import './index.css';
import { createCrow } from './crow';
import { createHud, createPrimaryButton, createSkipButton } from './ui';
import { deriveLoopValues, loadLoop } from './state';

// Throwaway kitchen-sink page for PR 2 — replaced by the real game in PR 3.

const app = document.getElementById('app');
if (!app) throw new Error('#app not found');

const loop = loadLoop();
const { balance } = deriveLoopValues(loop);

const root = document.createElement('div');
Object.assign(root.style, {
  minHeight: '100%',
  padding: '1.25rem',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
});

const hudWrap = document.createElement('div');
Object.assign(hudWrap.style, { width: '100%', maxWidth: '420px', margin: '0 auto' });
hudWrap.appendChild(createHud({ balance, loop }));

const title = document.createElement('h1');
title.textContent = 'kitchen sink — pr 2';
Object.assign(title.style, {
  margin: '0',
  textAlign: 'center',
  fontFamily: 'var(--font-pixel)',
  fontSize: '1rem',
  letterSpacing: '0.1em',
  color: 'var(--color-ink-muted)',
});

const crows = document.createElement('div');
Object.assign(crows.style, {
  display: 'flex',
  gap: '1.5rem',
  alignItems: 'center',
  justifyContent: 'center',
  flexWrap: 'wrap',
  flex: '1',
});
crows.append(
  createCrow('background'),
  createCrow('player'),
  createCrow('golden'),
);

const buttons = document.createElement('div');
Object.assign(buttons.style, {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.5rem',
});
buttons.append(
  createPrimaryButton('accept', () => console.log('accept tapped')),
  createSkipButton(() => console.log('skip tapped')),
);

root.append(hudWrap, title, crows, buttons);
app.appendChild(root);
