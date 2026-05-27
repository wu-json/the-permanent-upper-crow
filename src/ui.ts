export interface HudOptions {
  balance: number;
}

export function formatMoney(n: number): string {
  return `$ ${n.toLocaleString('en-US')}`;
}

// The loop count is intentionally not shown — the player should
// realize the game is looping from the climbing prices alone.
export function createHud({ balance }: HudOptions): HTMLElement {
  const hud = document.createElement('div');
  hud.classList.add('hud');

  const balanceEl = document.createElement('span');
  balanceEl.classList.add('hud-balance');
  balanceEl.textContent = formatMoney(balance);

  hud.append(balanceEl);
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
