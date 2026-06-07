// Dvojjazyčný obsah pravidel a tutoriálu pro Prší.
// Tentýž text se používá v aplikaci i v tištitelném dokumentu (docs/rules).

import type { Lng } from '@/i18n';

export interface RulesSection {
  heading: string;
  body: string[];
}

export interface TutorialStep {
  title: string;
  text: string;
  /** Volitelná konfigurace stavu pro názornou ukázku. */
  demo?: 'sevens' | 'ace' | 'over' | 'match';
}

export const prsiRules: Record<Lng, RulesSection[]> = {
  cs: [
    {
      heading: 'Cíl hry',
      body: ['Zbav se jako první všech karet z ruky. Hraje se s 32 sedláckými kartami pro 2 až 6 hráčů.'],
    },
    {
      heading: 'Příprava',
      body: [
        'Každý hráč dostane 4 karty. Zbytek tvoří dobírací balíček.',
        'Vrchní karta balíčku se otočí a založí odhazovák. (Pokud je to speciální karta, vezme se jiná.)',
      ],
    },
    {
      heading: 'Základní tah',
      body: [
        'Na vrchní kartu smíš přiložit kartu stejné barvy NEBO stejné hodnoty.',
        'Pokud nemáš co hrát (nebo nechceš), líznеš si jednu kartu z balíčku a tah končí.',
      ],
    },
    {
      heading: 'Speciální karty',
      body: [
        'Sedmička (7): následující hráč si musí líznout 2 karty. Sedmičky se sčítají — kdo přiloží další sedmu, posílá dál 4, 6, … Kdo nemá sedmu, lízne celý trest.',
        'Eso (A): následující hráč „stojí" (přijde o tah). Esa lze také přebíjet vlastním esem.',
        'Svršek (O): lze přiložit na jakoukoli kartu. Hráč, který ho zahraje, určí novou barvu, kterou se pokračuje.',
      ],
    },
    {
      heading: 'Konec hry',
      body: [
        'Vyhrává hráč, který se první zbaví všech karet.',
        'Když dojde dobírací balíček, zamíchá se odhazovák (kromě vrchní karty) a hraje se dál.',
      ],
    },
  ],
  en: [
    {
      heading: 'Goal',
      body: ['Be the first to get rid of all your cards. Played with a 32-card Czech deck, 2 to 6 players.'],
    },
    {
      heading: 'Setup',
      body: [
        'Each player is dealt 4 cards. The rest forms the draw pile.',
        'The top card is flipped to start the discard pile. (If it is a special card, another is drawn.)',
      ],
    },
    {
      heading: 'Basic turn',
      body: [
        'You may play a card matching the suit OR the rank of the top card.',
        'If you cannot (or do not want to) play, draw one card and your turn ends.',
      ],
    },
    {
      heading: 'Special cards',
      body: [
        'Seven (7): the next player must draw 2 cards. Sevens stack — playing another seven passes on 4, 6, … Whoever lacks a seven draws the whole penalty.',
        'Ace (A): the next player is skipped. Aces can be countered with another ace.',
        'Over (O): can be played on any card. The player who plays it chooses the new suit to continue with.',
      ],
    },
    {
      heading: 'End of game',
      body: [
        'The first player to discard all cards wins.',
        'When the draw pile is empty, the discard pile (except the top card) is reshuffled.',
      ],
    },
  ],
};

export const prsiTutorial: Record<Lng, TutorialStep[]> = {
  cs: [
    {
      title: 'Vítej u Prší',
      text: 'Naučíme tě hru ve 4 krocích. Cílem je zbavit se všech karet z ruky dřív než soupeř.',
    },
    {
      title: 'Přikládání karet',
      text: 'Na vrchní kartu přiložíš kartu STEJNÉ barvy nebo STEJNÉ hodnoty. Tady na červenou osmičku můžeš dát červenou kartu nebo jinou osmičku.',
      demo: 'match',
    },
    {
      title: 'Sedmička = ber dvě',
      text: 'Když někdo zahraje sedmičku, ty si musíš líznout 2 karty — ledaže přiložíš vlastní sedmičku a pošleš trest dál (pak je to 4).',
      demo: 'sevens',
    },
    {
      title: 'Eso = stojíš',
      text: 'Po esu přicházíš o tah. Bránit se můžeš jen vlastním esem.',
      demo: 'ace',
    },
    {
      title: 'Svršek mění barvu',
      text: 'Svršek (O) můžeš přiložit na cokoli a sám určíš, jakou barvou se bude pokračovat. Je to tvoje žolíková karta.',
      demo: 'over',
    },
    {
      title: 'Hotovo!',
      text: 'To je vše. Teď si zahraj proti počítači — zvol si obtížnost a vyzkoušej, co ses naučil.',
    },
  ],
  en: [
    {
      title: 'Welcome to Prší',
      text: "We'll teach you in 4 steps. The goal is to get rid of all your cards before your opponent.",
    },
    {
      title: 'Playing cards',
      text: 'Play a card matching the SUIT or RANK of the top card. On a red eight you can play any red card or any other eight.',
      demo: 'match',
    },
    {
      title: 'Seven = draw two',
      text: 'When someone plays a seven, you must draw 2 cards — unless you play your own seven and pass it on (then it becomes 4).',
      demo: 'sevens',
    },
    {
      title: 'Ace = skip',
      text: 'After an ace you lose your turn. You can only defend with another ace.',
      demo: 'ace',
    },
    {
      title: 'Over changes the suit',
      text: 'The Over (O) can be played on anything and you choose the suit to continue with. It is your wild card.',
      demo: 'over',
    },
    {
      title: 'Done!',
      text: 'That is it. Now play against the computer — pick a difficulty and try what you learned.',
    },
  ],
};
