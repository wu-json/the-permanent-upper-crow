// All audio is synthesized on the fly via the Web Audio API —
// no bundled sound assets, no extra requests, no extra bytes
// in the asset graph. The two effects this module ships:
//
//   blip()     a short triangle-wave tick used per character
//              while the dialogue streams (Animal-Crossing-style
//              voice effect). Pitch is jittered per call so the
//              stream doesn't read as one sustained tone.
//   advance()  a slightly brighter, longer chirp emitted when
//              the dialogue moves to the next line (or fires the
//              advance callback that takes us to the next screen).
//
// Browsers gate AudioContext behind a user gesture, so we lazy-
// create the context and `unlockAudio()` resumes it on the first
// click/tap/key. Mute state is persisted in localStorage under
// `puc:muted` so the player's choice survives reloads.

const STORAGE_KEY = 'puc:muted';

let ctx: AudioContext | null = null;
let muted = loadMuted();
const listeners = new Set<(muted: boolean) => void>();

function loadMuted(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function saveMuted(value: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, value ? '1' : '0');
  } catch {
    /* localStorage unavailable (private mode, quota) — non-fatal */
  }
}

interface WindowWithWebkitAudio extends Window {
  webkitAudioContext?: typeof AudioContext;
}

function ensureContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const w = window as WindowWithWebkitAudio;
    const Ctor = window.AudioContext ?? w.webkitAudioContext;
    if (!Ctor) return null;
    try {
      ctx = new Ctor();
    } catch {
      return null;
    }
  }
  if (ctx.state === 'suspended') {
    void ctx.resume();
  }
  return ctx;
}

export function isMuted(): boolean {
  return muted;
}

export function setMuted(value: boolean): void {
  if (muted === value) return;
  muted = value;
  saveMuted(value);
  listeners.forEach((cb) => cb(muted));
}

export function toggleMute(): void {
  setMuted(!muted);
}

export function onMuteChange(cb: (muted: boolean) => void): void {
  listeners.add(cb);
}

// Resume the audio context on first interaction. Browsers will
// otherwise leave it suspended and the first blip you try to
// schedule never sounds.
export function unlockAudio(): void {
  ensureContext();
}

// Low square-wave bleep in the Undertale voice palette — short,
// bit-crunchy, lives around 180–220 Hz so the dialogue reads as
// chunky text rather than a music-box jingle. Small pitch jitter
// keeps repeats from fusing into a sustained tone.
export function playBlip(): void {
  if (muted) return;
  const c = ensureContext();
  if (!c) return;
  const now = c.currentTime;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'square';
  osc.frequency.value = 180 + Math.random() * 40;
  // Square waves are loud per dB — keep the peak gain low.
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.04, now + 0.003);
  gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.04);
  osc.connect(gain).connect(c.destination);
  osc.start(now);
  osc.stop(now + 0.05);
}

// Three-note ascending square-wave arpeggio for the post-sign
// flourish. Stays in the low/mid register so it matches the rest
// of the audio palette — not a music-box jingle, just a short
// chunky "you did it (you did not)" tag.
export function playCelebrate(): void {
  if (muted) return;
  const c = ensureContext();
  if (!c) return;
  const now = c.currentTime;
  // Roughly G3 → B3 → D4 — a major arpeggio. Notes overlap
  // slightly so the run reads as one flourish.
  const notes = [196, 247, 330];
  notes.forEach((freq, i) => {
    const t = now + i * 0.09;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'square';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.055, t + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0008, t + 0.16);
    osc.connect(gain).connect(c.destination);
    osc.start(t);
    osc.stop(t + 0.18);
  });
}

// "Denied" thud — a single low square-wave note with a clear
// downward bend. Used when the player taps the top hat and the
// INSUFFICIENT FUNDS flash fires. Lower and longer than the
// advance boop so it reads as rejection rather than progression.
export function playDenied(): void {
  if (muted) return;
  const c = ensureContext();
  if (!c) return;
  const now = c.currentTime;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(110, now);
  osc.frequency.linearRampToValueAtTime(80, now + 0.12);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.07, now + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.18);
  osc.connect(gain).connect(c.destination);
  osc.start(now);
  osc.stop(now + 0.2);
}

// Low "boop" on advance — a single square-wave note with a small
// downward bend. No upward chirp on purpose; the rising tone read
// too jingly against the rest of the audio.
export function playAdvance(): void {
  if (muted) return;
  const c = ensureContext();
  if (!c) return;
  const now = c.currentTime;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(170, now);
  osc.frequency.linearRampToValueAtTime(130, now + 0.08);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.06, now + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.1);
  osc.connect(gain).connect(c.destination);
  osc.start(now);
  osc.stop(now + 0.12);
}
