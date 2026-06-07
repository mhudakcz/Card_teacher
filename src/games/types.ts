// Sdílené typy pro „zásuvné" hry. Každá hra dodá definici (GameDefinition),
// kterou registr (registry.ts) zpřístupní obrazovkám Rules / Tutorial / Play.

import type { ComponentType, ReactNode } from 'react';
import type { Lng } from '@/i18n';

export interface RulesSection {
  heading: string;
  body: string[];
}

export interface TutorialStep {
  title: string;
  text: string;
  /** Volitelný klíč názorné ukázky; renderuje ji konkrétní hra (renderDemo). */
  demo?: string;
}

export interface GameDefinition {
  /** Stabilní identifikátor hry (shodný s klíčem v registru i i18n `games.<id>`). */
  id: string;
  /** Pravidla má každá hra — to je minimum pro zařazení do registru. */
  rules: Record<Lng, RulesSection[]>;
  /** Interaktivní tutoriál (volitelný — doplňuje se postupně). */
  tutorial?: Record<Lng, TutorialStep[]>;
  /** Vykreslí názornou ukázku pro daný `demo` klíč z tutoriálu. */
  renderDemo?: (demo: string) => ReactNode;
  /** Herní deska (hra proti počítači). Bez ní je hra zatím „jen pravidla". */
  Board?: ComponentType;
}

/** Které sekce má daná hra k dispozici (pro navigaci a rozcestník). */
export function availableViews(def: GameDefinition): ('rules' | 'tutorial' | 'play')[] {
  const views: ('rules' | 'tutorial' | 'play')[] = ['rules'];
  if (def.tutorial) views.push('tutorial');
  if (def.Board) views.push('play');
  return views;
}
