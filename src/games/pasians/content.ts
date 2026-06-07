// Dvojjazyčný obsah pravidel pro Pasiáns (Klondike).

import type { Lng } from '@/i18n';
import type { RulesSection, TutorialStep } from '@/games/types';

export const pasiansRules: Record<Lng, RulesSection[]> = {
  cs: [
    {
      heading: 'Cíl hry',
      body: [
        'Přemístit všech 52 karet na čtyři cíle. Každý cíl patří jedné barvě a skládá se vzestupně od esa po krále (A, 2, 3 … K).',
      ],
    },
    {
      heading: 'Rozložení',
      body: [
        'Sedm sloupců: první má 1 kartu, druhý 2 … sedmý 7. Vždy je odkrytá jen vrchní karta sloupce.',
        'Zbylé karty tvoří dobírací balíček; vyložené z něj jdou na odhazovák.',
        'Nahoře jsou čtyři prázdné cíle (jeden pro každou barvu).',
      ],
    },
    {
      heading: 'Tahy',
      body: [
        'Ve sloupcích skládáš karty sestupně a se střídáním barev (červená na černou a naopak).',
        'Můžeš přesouvat i celé sledy karet najednou.',
        'Do prázdného sloupce smí jen král (nebo sled začínající králem).',
        'Odkrytou kartu nebo vrch odhazováku můžeš poslat na cíl, jakmile sedí.',
      ],
    },
    {
      heading: 'Balíček',
      body: [
        'Klikni na balíček a lízni si. Když dojde, otoč odhazovák zpět (recyklace).',
        'Odkrytím poslední zakryté karty ve sloupci se karta automaticky otočí lícem nahoru.',
      ],
    },
    {
      heading: 'Obtížnost',
      body: [
        'Lehká: líznutí po 1 kartě a neomezené průchody balíčkem.',
        'Střední: líznutí po 3 kartách.',
        'Těžká: líznutí po 3 kartách a jen omezený počet průchodů balíčkem.',
      ],
    },
  ],
  en: [
    {
      heading: 'Goal',
      body: [
        'Move all 52 cards onto the four foundations. Each foundation is one suit and is built up from ace to king (A, 2, 3 … K).',
      ],
    },
    {
      heading: 'Layout',
      body: [
        'Seven columns: the first has 1 card, the second 2 … the seventh 7. Only the top card of each column is face up.',
        'The remaining cards form the stock; cards drawn from it go to the waste pile.',
        'Above are four empty foundations (one per suit).',
      ],
    },
    {
      heading: 'Moves',
      body: [
        'In the columns you build cards down and in alternating colors (red on black and vice versa).',
        'You may move whole runs of cards at once.',
        'Only a king (or a run starting with a king) may go to an empty column.',
        'A face-up card or the top of the waste can go to a foundation as soon as it fits.',
      ],
    },
    {
      heading: 'The stock',
      body: [
        'Click the stock to draw. When it runs out, turn the waste back over (recycle).',
        'When the last face-down card in a column is exposed, it flips face up automatically.',
      ],
    },
    {
      heading: 'Difficulty',
      body: [
        'Easy: draw 1 card and unlimited passes through the stock.',
        'Medium: draw 3 cards.',
        'Hard: draw 3 cards and only a limited number of passes through the stock.',
      ],
    },
  ],
};

export const pasiansTutorial: Record<Lng, TutorialStep[]> = {
  cs: [
    {
      title: 'Vítej u Pasiánsu',
      text: 'Klasický solitér. Cílem je poskládat všechny karty na čtyři cíle od esa po krále.',
    },
    {
      title: 'Cíle: po barvě nahoru',
      text: 'Každý cíl sbírá jednu barvu vzestupně: A, 2, 3 … až K. Začíná se vždy esem.',
      demo: 'foundation',
    },
    {
      title: 'Sloupce: dolů a střídavě',
      text: 'Ve sloupcích skládáš sestupně a střídáš barvy — červená sedmička jde na černou osmičku.',
      demo: 'tableau',
    },
    {
      title: 'Hotovo!',
      text: 'Klikni na kartu a hra ji zkusí umístit. Klikni na balíček pro líznutí. Hodně štěstí!',
    },
  ],
  en: [
    {
      title: 'Welcome to Solitaire',
      text: 'The classic Klondike. The goal is to build all cards onto the four foundations from ace to king.',
    },
    {
      title: 'Foundations: up by suit',
      text: 'Each foundation collects one suit ascending: A, 2, 3 … up to K. You always start with an ace.',
      demo: 'foundation',
    },
    {
      title: 'Columns: down and alternating',
      text: 'In the columns you build down and alternate colors — a red seven goes on a black eight.',
      demo: 'tableau',
    },
    {
      title: 'Done!',
      text: 'Click a card and the game tries to place it. Click the stock to draw. Good luck!',
    },
  ],
};
