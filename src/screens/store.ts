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

// The rich crow rotates per loop — each iteration of the cycle
// brings a new "founder" pitching the same scheme. Cast is
// indexed by (loop - 1) modulo the list length.
interface RichCast {
  name: string;
  company: string;
}
const RICH_CASTS: readonly RichCast[] = [
  { name: 'Benjamin Peck', company: 'Crow Automation Systems' },
  { name: 'Margaret Caw', company: 'Caw Labs' },
  { name: 'Edgar Crowford', company: 'Crowford Ventures' },
  { name: 'Olivia Beakerson', company: 'Beaknet' },
  { name: 'Marcus Talon', company: 'Talonchain' },
  { name: 'Felicity Plume', company: 'Plume Capital' },
];

function getRichCast(loop: number): RichCast {
  return RICH_CASTS[(loop - 1) % RICH_CASTS.length];
}

// Benjamin Peck and his successors all deliver the same template
// pitch in proper sentence case — the stilted-formal grammar is
// the marker of corporate persona; every other voice in the game
// stays lowercase.
function makeRichDialogue({ name, company }: RichCast): readonly string[] {
  return [
    `Why hello there! I'm ${name}, Founder and CEO of ${company}.`,
    "It seems you're having... some trouble with that purchase.",
    'What if I told you you could earn generational wealth with just a few years of hard work?',
    `At ${company}, we produce the Robo-Crow. It is an autonomous robot that automates all labor in the e-kaw-nomy.`,
    'You must decide soon. We are running out of time before you become stuck with the under-crows.',
    'Equity in our venerable operation is anything but abundant.',
  ];
}

const STREAM_MS_PER_CHAR = 28;

// First-person internal monologue surfaced when the player taps
// [ decline ]. Each tap cycles to the next reminder of why the
// player can't actually walk away. List sticks at the last line.
const DECLINE_THOUGHTS: readonly string[] = [
  'rent is due next month.',
  'the perch payments are three months behind.',
  'groceries. just groceries.',
  'the under-crow loan shark is calling again.',
  'my fledgling cousin needs braces.',
  'my egg insurance lapsed last week.',
  "the nest down payment isn't going to save itself.",
  'mama crow is in the hospital remember.',
  'i told my sister i would help pay for her kaw school fees.',
  'the chickadee i borrowed from is calling. again.',
];

// Subtext that appears under INSUFFICIENT FUNDS once the player
// has tapped the hat enough times to count as bargaining. Indexed
// by (clickCount - HAT_CLICK_SUBTEXT_AT). Once the list is
// exhausted, the last line sticks.
const HAT_CLICK_SUBTEXT_AT = 6;
const HAT_CLICK_SUBTEXT: readonly string[] = [
  "you've already maxed out your crow card.",
  'tapping it harder will not lower the price.',
  'you are cuckoo to keep trying.',
  'have you considered that you simply cannot afford this hat?',
  'the hat does not feel sorry for you.',
  'this is not a wishlist.',
  'you cannot wing this purchase.',
  'you could buy 0.1 of this hat. that is a brim.',
  'even the table is judging you now.',
  "try marrying into the rich crow's family.",
  'stream your tapping on twitch. ask for tips.',
  'the fledgling support program is for actual fledglings.',
  "you've been pecking at this for too long.",
  "ruffled feathers won't budge the price.",
  'no one is impressed by your persistence.',
  'no girlfriend to even split the cost with.',
  'your broke ass gets no finches.',
  'have you considered onlybirds?',
];

export const storeScreen: Screen = {
  mount(host, ctx) {
    const { balance, hatPrice } = deriveLoopValues(ctx.state.loop);
    const cast = getRichCast(ctx.state.loop);
    const richLines = makeRichDialogue(cast);

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
    sign.innerHTML = `
      <span class="store-sign-main">TOP HAT FOR SALE: ${formatMoney(hatPrice)}</span>
      <span class="store-sign-hint">↓ <span class="hint-action"></span> to buy</span>
    `;

    displayCol.append(sign, display);

    const richCol = document.createElement('div');
    richCol.classList.add('store-col', 'store-col-rich');
    richCol.appendChild(createCrow('rich'));

    const flash = document.createElement('div');
    flash.classList.add('insufficient-flash');
    flash.setAttribute('aria-live', 'polite');
    flash.innerHTML = `
      <div class="insufficient-main">INSUFFICIENT FUNDS.</div>
      <div class="insufficient-sub"></div>
    `;
    const flashSub = flash.querySelector<HTMLDivElement>('.insufficient-sub')!;

    stage.append(playerCol, displayCol, richCol, flash);

    // Dialogue box — Animal-Crossing-style with speaker label,
    // streaming text, and a bobbing ▼ continue indicator. Built
    // inline here; promote to src/dialogue.ts when a second
    // screen needs it.
    const dialogueBox = document.createElement('div');
    dialogueBox.classList.add('dialogue-box', 'reveal');

    const dlgSpeaker = document.createElement('div');
    dlgSpeaker.classList.add('dialogue-speaker');
    dlgSpeaker.textContent = cast.name.toUpperCase();

    const dlgBody = document.createElement('div');
    dlgBody.classList.add('dialogue-body');

    const dlgText = document.createElement('span');
    dlgText.classList.add('dialogue-text');

    const dlgIndicator = document.createElement('span');
    dlgIndicator.classList.add('dialogue-indicator');
    dlgIndicator.setAttribute('aria-hidden', 'true');
    dlgIndicator.textContent = '▼';

    dlgBody.append(dlgText, dlgIndicator);
    dialogueBox.append(dlgSpeaker, dlgBody);

    // CTA wrap only holds [ continue ] now — decline/accept moved
    // into the contract popup that appears after the dialogue.
    const cta = document.createElement('div');
    cta.classList.add('cta-wrap');

    const continueBtn = createPrimaryButton('continue', () => onTapContinue());
    continueBtn.classList.add('reveal');

    cta.append(continueBtn);

    // Contract popup — modal overlay revealed after Benjamin
    // Peck's last line. Decline / accept live inside the card,
    // and the decline-thought subtext sits below the buttons.
    const contract = document.createElement('div');
    contract.classList.add('contract-overlay', 'reveal');
    contract.setAttribute('role', 'dialog');
    contract.setAttribute('aria-modal', 'true');
    contract.setAttribute('aria-labelledby', 'contract-title');
    contract.innerHTML = `
      <div class="contract-card">
        <div class="contract-header">
          <div class="contract-eyebrow">EMPLOYMENT AGREEMENT</div>
          <div class="contract-title" id="contract-title">${cast.company}</div>
        </div>
        <div class="contract-body">
          <p>The undersigned ("Employee") agrees to the following terms with ${cast.company} (the "Company"):</p>
          <ol class="contract-terms">
            <li>Dedicate all labor, judgment, and waking hours to the development of Robo-Crow.</li>
            <li>Maintain a 12/12/7 in-office presence at our San Franchickso headquarters.</li>
            <li>Receive complimentary lunch and dinner on premises (mandatory).</li>
            <li>Acknowledge that the window is closing.</li>
            <li>Accept 1% equity in the Company, which the Company affirms is anything but abundant.</li>
            <li>Forfeit the right to wonder if there was another way.</li>
          </ol>
          <div class="contract-signatures">
            <div class="contract-sig">
              <div class="contract-sig-line"></div>
              <div class="contract-sig-label">Employee</div>
            </div>
            <div class="contract-sig">
              <div class="contract-sig-line"></div>
              <div class="contract-sig-label">${cast.name}, Founder &amp; CEO</div>
            </div>
          </div>
        </div>
      </div>
    `;

    const contractCard = contract.querySelector<HTMLDivElement>('.contract-card')!;

    const contractActions = document.createElement('div');
    contractActions.classList.add('contract-actions');
    const decline = createPrimaryButton('decline', () => onTapDecline());
    const accept = createPrimaryButton('sign', () => ctx.advance());
    contractActions.append(decline, accept);

    const contractThought = document.createElement('div');
    contractThought.classList.add('contract-thought');
    contractThought.setAttribute('aria-live', 'polite');

    contractCard.append(contractActions, contractThought);

    root.append(hudWrap, stage, dialogueBox, cta, contract);
    host.appendChild(root);

    // Cascade
    //   beat 0 → 1: tap hat → flash + dim hat + show [ continue ]
    //   beat 1 → 2: tap continue → rich crow slides in, dialogue
    //               box fades in and starts streaming
    //   beat 2 → 3: last dialogue line finishes → contract popup
    //               fades in with [ decline ] / [ accept ] inside;
    //               dialogue stops accepting taps
    let beat: 0 | 1 | 2 | 3 = 0;
    let hatClicks = 0;
    let declineClicks = 0;

    const onTapDecline = () => {
      declineClicks += 1;
      const idx = Math.min(declineClicks - 1, DECLINE_THOUGHTS.length - 1);
      contractThought.textContent = DECLINE_THOUGHTS[idx];
      contractThought.classList.add('shown');
    };

    const onTapHat = () => {
      hatClicks += 1;

      // Replay the entrance pulse on every tap; flash stays
      // visible once shown.
      flash.classList.remove('show');
      void flash.offsetWidth;
      flash.classList.add('show');

      if (hatClicks >= HAT_CLICK_SUBTEXT_AT) {
        const idx = Math.min(
          hatClicks - HAT_CLICK_SUBTEXT_AT,
          HAT_CLICK_SUBTEXT.length - 1,
        );
        flashSub.textContent = HAT_CLICK_SUBTEXT[idx];
        flashSub.classList.add('shown');
      }

      if (beat === 0) {
        beat = 1;
        sign.classList.add('hint-consumed');
        displayCol.classList.add('revealed');
        continueBtn.classList.add('shown');
      }
    };

    // Streaming dialogue state
    let dlgLineIdx = 0;
    let dlgCharIdx = 0;
    let streamTimer: number | null = null;
    let streaming = false;
    let startDelayTimer: number | null = null;

    const onLineComplete = () => {
      streaming = false;
      streamTimer = null;
      if (dlgLineIdx < richLines.length - 1) {
        dlgIndicator.classList.add('shown');
      } else {
        // Final line — dialogue is done. Hide indicator, reveal
        // the contract popup, stop accepting dialogue taps.
        beat = 3;
        dialogueBox.classList.add('done');
        dlgIndicator.classList.remove('shown');
        contract.classList.add('shown');
      }
    };

    const streamLine = () => {
      streaming = true;
      dlgIndicator.classList.remove('shown');
      dlgText.textContent = '';
      dlgCharIdx = 0;
      const line = richLines[dlgLineIdx];

      const tick = () => {
        if (dlgCharIdx >= line.length) {
          onLineComplete();
          return;
        }
        dlgText.textContent = line.slice(0, dlgCharIdx + 1);
        dlgCharIdx += 1;
        streamTimer = window.setTimeout(tick, STREAM_MS_PER_CHAR);
      };
      tick();
    };

    const finishLine = () => {
      if (streamTimer !== null) {
        window.clearTimeout(streamTimer);
        streamTimer = null;
      }
      dlgText.textContent = richLines[dlgLineIdx];
      dlgCharIdx = richLines[dlgLineIdx].length;
      onLineComplete();
    };

    const onTapDialogue = () => {
      if (beat !== 2) return;
      if (streaming) {
        finishLine();
      } else if (dlgLineIdx < richLines.length - 1) {
        dlgLineIdx += 1;
        streamLine();
      }
    };

    const onTapContinue = () => {
      if (beat !== 1) return;
      beat = 2;
      stage.classList.add('rich-entered');
      continueBtn.classList.remove('shown');
      dialogueBox.classList.add('shown');
      // Let the rich crow get partway into his entrance before
      // he starts talking — feels less like he's already standing
      // there mid-sentence.
      startDelayTimer = window.setTimeout(() => {
        startDelayTimer = null;
        streamLine();
      }, 600);
    };

    display.addEventListener('click', onTapHat);
    dialogueBox.addEventListener('click', onTapDialogue);

    return () => {
      if (streamTimer !== null) window.clearTimeout(streamTimer);
      if (startDelayTimer !== null) window.clearTimeout(startDelayTimer);
      display.removeEventListener('click', onTapHat);
      dialogueBox.removeEventListener('click', onTapDialogue);
      root.remove();
    };
  },
};
