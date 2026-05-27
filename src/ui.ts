export interface HudOptions {
  balance: number;
  loop: number;
}

export function formatMoney(n: number): string {
  return `$ ${n.toLocaleString('en-US')}`;
}

export function createHud({ balance, loop }: HudOptions): HTMLElement {
  const hud = document.createElement('div');
  hud.classList.add('hud');

  const balanceEl = document.createElement('span');
  balanceEl.classList.add('hud-balance');
  balanceEl.textContent = formatMoney(balance);

  const loopEl = document.createElement('span');
  loopEl.classList.add('hud-loop');
  loopEl.textContent = `loop ${loop} / ∞`;

  hud.append(balanceEl, loopEl);
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
