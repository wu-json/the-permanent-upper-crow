import { createCrow } from '../crow';
import { deriveLoopValues } from '../state';
import { createHud, createPrimaryButton, formatMoney } from '../ui';
import type { Screen } from './types';

// Standalone top hat. Crown 14 wide × 20 tall, flat brim 24 wide
// × 4 tall. No brim curl — earlier versions had quadratic curl
// at the tips that read as horns at small scale.
const HAT_SVG = `<svg viewBox="0 0 30 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M8 0L22 0L22 20L27 20L27 24L3 24L3 20L8 20Z"/></svg>`;

// Display table: flat top with two front legs reaching the
// viewBox bottom so the table aligns to the same ground line
// as the crow's feet. One continuous silhouette.
const TABLE_SVG = `<svg viewBox="0 0 70 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M5 0L65 0L65 6L60 6L60 32L56 32L56 6L14 6L14 32L10 32L10 6L5 6Z"/></svg>`;

const DIALOGUE = `"the window is closing. AI is coming for all of it. you have one shot to lock in generational wealth before the under-crows lose their last leverage. work with me. we automate crow-work. we call it Robo-Crow."`;

export const storeScreen: Screen = {
  mount(host, ctx) {
    const { balance, hatPrice } = deriveLoopValues(ctx.state.loop);

    const root = document.createElement('div');
    root.classList.add('screen', 'screen-store');

    // HUD
    const hudWrap = document.createElement('div');
    hudWrap.classList.add('hud-wrap');
    hudWrap.appendChild(createHud({ balance }));

    // Stage: display + crows + flash
    const stage = document.createElement('div');
    stage.classList.add('store-stage');

    const playerCol = document.createElement('div');
    playerCol.classList.add('store-col', 'store-col-player');
    playerCol.appendChild(createCrow('player'));

    const displayCol = document.createElement('div');
    displayCol.classList.add('store-col', 'store-col-display');

    const display = document.createElement('button');
    display.type = 'button';
    display.classList.add('store-display');
    display.setAttribute(
      'aria-label',
      `top hat for sale, ${formatMoney(hatPrice)}`,
    );
    display.innerHTML = `
      <span class="store-hat">${HAT_SVG}</span>
      <span class="store-table">${TABLE_SVG}</span>
    `;

    const sign = document.createElement('div');
    sign.classList.add('store-sign');
    sign.textContent = `TOP HAT FOR SALE: ${formatMoney(hatPrice)}`;

    displayCol.append(sign, display);

    const richCol = document.createElement('div');
    richCol.classList.add('store-col', 'store-col-rich');
    richCol.appendChild(createCrow('rich'));

    const flash = document.createElement('div');
    flash.classList.add('insufficient-flash');
    flash.setAttribute('aria-live', 'polite');
    flash.textContent = 'INSUFFICIENT FUNDS.';

    stage.append(playerCol, displayCol, richCol, flash);

    // Dialogue + accept (hidden until first hat tap)
    const dialogue = document.createElement('p');
    dialogue.classList.add('dialogue', 'reveal');
    dialogue.textContent = DIALOGUE;

    const accept = createPrimaryButton('accept', () => ctx.advance());
    accept.classList.add('reveal');

    const acceptWrap = document.createElement('div');
    acceptWrap.classList.add('accept-wrap');
    acceptWrap.appendChild(accept);

    root.append(hudWrap, stage, dialogue, acceptWrap);
    host.appendChild(root);

    // Tap-gated cascade
    let revealed = false;
    let flashTimer: number | null = null;
    const onTapHat = () => {
      // Restart the flash animation cleanly on repeat taps.
      flash.classList.remove('show');
      // Force reflow so the animation restarts.
      void flash.offsetWidth;
      flash.classList.add('show');
      if (flashTimer !== null) window.clearTimeout(flashTimer);
      flashTimer = window.setTimeout(() => {
        flash.classList.remove('show');
        flashTimer = null;
      }, 900);

      if (!revealed) {
        revealed = true;
        stage.classList.add('rich-entered');
        dialogue.classList.add('shown');
        accept.classList.add('shown');
      }
    };
    display.addEventListener('click', onTapHat);

    return () => {
      if (flashTimer !== null) window.clearTimeout(flashTimer);
      display.removeEventListener('click', onTapHat);
      root.remove();
    };
  },
};
