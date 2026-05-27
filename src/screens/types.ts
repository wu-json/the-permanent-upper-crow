import type { GameState } from '../state';

export interface GameContext {
  state: GameState;
  advance(): void;
}

export interface Screen {
  mount(host: HTMLElement, ctx: GameContext): () => void;
}
