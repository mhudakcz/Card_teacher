import { create } from 'zustand';

export type GameId = string;
export type View = 'rules' | 'tutorial' | 'play';

export type Mode = 'day' | 'night';
export type Scheme = 'emerald' | 'sapphire' | 'crimson' | 'royal' | 'graphite';

export const SCHEMES: { id: Scheme; label: string; swatch: string }[] = [
  { id: 'emerald', label: 'Smaragd', swatch: '#10b981' },
  { id: 'sapphire', label: 'Safír', swatch: '#3b82f6' },
  { id: 'crimson', label: 'Karmín', swatch: '#f43f5e' },
  { id: 'royal', label: 'Královská', swatch: '#a855f7' },
  { id: 'graphite', label: 'Grafit', swatch: '#f59e0b' },
];

interface ThemeState {
  mode: Mode;
  scheme: Scheme;
  setMode: (mode: Mode) => void;
  toggleMode: () => void;
  setScheme: (scheme: Scheme) => void;
}

function applyTheme(mode: Mode, scheme: Scheme) {
  const el = document.documentElement;
  el.dataset.mode = mode;
  el.dataset.scheme = scheme;
}

const storedMode = (localStorage.getItem('mode') as Mode) || 'night';
const storedScheme = (localStorage.getItem('scheme') as Scheme) || 'emerald';
applyTheme(storedMode, storedScheme);

export const useTheme = create<ThemeState>((set, get) => ({
  mode: storedMode,
  scheme: storedScheme,
  setMode: (mode) => {
    localStorage.setItem('mode', mode);
    applyTheme(mode, get().scheme);
    set({ mode });
  },
  toggleMode: () => get().setMode(get().mode === 'night' ? 'day' : 'night'),
  setScheme: (scheme) => {
    localStorage.setItem('scheme', scheme);
    applyTheme(get().mode, scheme);
    set({ scheme });
  },
}));

interface NavState {
  game: GameId | null;
  view: View;
  printing: boolean;
  openGame: (game: GameId, view?: View) => void;
  setView: (view: View) => void;
  goHome: () => void;
  setPrinting: (printing: boolean) => void;
}

export const useNav = create<NavState>((set) => ({
  game: null,
  view: 'rules',
  printing: false,
  openGame: (game, view = 'rules') => set({ game, view, printing: false }),
  setView: (view) => set({ view }),
  goHome: () => set({ game: null, printing: false }),
  setPrinting: (printing) => set({ printing }),
}));
