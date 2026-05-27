import { getRichCast } from '../cast';
import { createCrow } from '../crow';
import { createDialogue } from '../dialogue';
import { deriveLoopValues } from '../state';
import { createHud, createPrimaryButton } from '../ui';
import type { Screen } from './types';

const FACTORY_DIALOGUE: readonly string[] = [
  'KAWKAWKAKAWKAWKAKAW',
  'We are so back.',
  'I can smell our investors gawking at these profits.',
  'Our next quarter will crush those damn Eagles.',
  "Great work. I'm looking forward to enjoying my— I mean our fortune very soon in our public offering.",
];

// Number of Robo-Crow slots per conveyor copy. The strip
// duplicates this row so a translateX from -50% → 0 keyframe
// loops seamlessly (the two halves render identically at the
// loop point).
const CONVEYOR_SLOTS = 5;

export const factoryScreen: Screen = {
  mount(host, ctx) {
    const { balance } = deriveLoopValues(ctx.state.loop);
    const cast = getRichCast(ctx.state.loop);

    const root = document.createElement('div');
    root.classList.add('screen', 'screen-factory');

    // HUD
    const hudWrap = document.createElement('div');
    hudWrap.classList.add('hud-wrap');
    hudWrap.appendChild(createHud({ balance }));

    // Scene: player crow (left) · conveyor (middle) · rich crow (right)
    const scene = document.createElement('div');
    scene.classList.add('factory-scene');

    const playerCol = document.createElement('div');
    playerCol.classList.add('factory-col', 'factory-col-player');
    playerCol.appendChild(createCrow('player'));

    const conveyor = document.createElement('div');
    conveyor.classList.add('factory-conveyor');
    const strip = document.createElement('div');
    strip.classList.add('factory-strip');
    for (let copy = 0; copy < 2; copy += 1) {
      for (let i = 0; i < CONVEYOR_SLOTS; i += 1) {
        const robo = createCrow('robo');
        robo.classList.add('factory-robo');
        strip.appendChild(robo);
      }
    }
    conveyor.appendChild(strip);

    const richCol = document.createElement('div');
    richCol.classList.add('factory-col', 'factory-col-rich');
    const richCrow = createCrow('rich');
    richCrow.classList.add('crow-mirrored');
    richCol.appendChild(richCrow);

    scene.append(playerCol, conveyor, richCol);

    // Dialogue box (initially hidden; revealed on ship)
    const dialogue = createDialogue({ speaker: cast.name.toUpperCase() });

    // CTA: [ ship it ], hidden after press
    const cta = document.createElement('div');
    cta.classList.add('cta-wrap');
    const shipBtn = createPrimaryButton('ship it', () => onShipIt());
    cta.append(shipBtn);

    root.append(hudWrap, scene, dialogue.el, cta);
    host.appendChild(root);

    let shipped = false;
    let startDelayTimer: number | null = null;

    dialogue.onAdvance(() => {
      if (!shipped) return;
      ctx.advance();
    });

    const onShipIt = () => {
      if (shipped) return;
      shipped = true;
      // Start the conveyor and fade out the button. Dialogue box
      // fades in; rich crow's first line streams after a short
      // delay so the conveyor read happens before he speaks.
      conveyor.classList.add('running');
      shipBtn.classList.add('hidden');
      dialogue.el.classList.add('shown');
      startDelayTimer = window.setTimeout(() => {
        startDelayTimer = null;
        dialogue.play(FACTORY_DIALOGUE);
      }, 700);
    };

    return () => {
      if (startDelayTimer !== null) window.clearTimeout(startDelayTimer);
      dialogue.cleanup();
      root.remove();
    };
  },
};
