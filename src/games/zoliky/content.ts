// Dvojjazyčný obsah pravidel pro Žolíky (rummy).

import type { Lng } from '@/i18n';
import type { RulesSection, TutorialStep } from '@/games/types';

export const zolikyRules: Record<Lng, RulesSection[]> = {
  cs: [
    {
      heading: 'Cíl hry',
      body: [
        'Zbav se všech karet tím, že je poskládáš do platných sestav — postupek a skupin. Kdo se první vyloží, vyhrává kolo; ostatním se sčítají trestné body za karty v ruce.',
      ],
    },
    {
      heading: 'Karty a rozdání',
      body: [
        'Hraje se se dvěma balíčky po 52 kartách plus žolíci (2–4). Obvykle 2–4 hráči.',
        'Každý dostane 13 karet. Zbytek je dobírací balíček, vedle vzniká odhazovací hromádka.',
      ],
    },
    {
      heading: 'Platné sestavy',
      body: [
        'Skupina: tři nebo čtyři karty STEJNÉ hodnoty v různých barvách (např. tři krále).',
        'Postupka: tři a více karet STEJNÉ barvy jdoucích po sobě (např. 5–6–7 srdcí).',
        'Žolík (nebo dvojka jako žolík) nahradí jakoukoli chybějící kartu v sestavě.',
      ],
    },
    {
      heading: 'Tah hráče',
      body: [
        'Líznu si kartu — z balíčku, nebo vrchní z odhazovací hromádky.',
        'Mohu vyložit nové sestavy nebo přidat karty k už vyloženým.',
        'První vyložení často vyžaduje minimální počet bodů (např. 40).',
        'Tah končím odhozením jedné karty.',
      ],
    },
    {
      heading: 'Konec a body',
      body: [
        'Kolo končí, jakmile se někdo zbaví všech karet.',
        'Ostatní si počítají trest za karty v ruce: obrázky 10, eso 1 nebo 11, žolík 20–25.',
        'Hraje se na předem dohodnutý počet kol nebo bodový limit.',
      ],
    },
  ],
  en: [
    {
      heading: 'Goal',
      body: [
        'Get rid of all your cards by arranging them into valid combinations — runs and sets. The first to lay everything down wins the round; others get penalty points for cards left in hand.',
      ],
    },
    {
      heading: 'Cards and the deal',
      body: [
        'Played with two 52-card decks plus jokers (2–4). Usually 2–4 players.',
        'Each player gets 13 cards. The rest is the draw pile, next to a discard pile.',
      ],
    },
    {
      heading: 'Valid combinations',
      body: [
        'Set: three or four cards of the SAME RANK in different suits (e.g. three kings).',
        'Run: three or more cards of the SAME SUIT in sequence (e.g. 5–6–7 of hearts).',
        'A joker (or a deuce used as a joker) replaces any missing card in a combination.',
      ],
    },
    {
      heading: "Player's turn",
      body: [
        'Draw a card — from the stock or the top of the discard pile.',
        'You may lay down new combinations or add cards to existing ones.',
        'The first lay-down often requires a minimum value (e.g. 40 points).',
        'End your turn by discarding one card.',
      ],
    },
    {
      heading: 'End and scoring',
      body: [
        'The round ends as soon as someone gets rid of all their cards.',
        'Others count penalties for cards in hand: face cards 10, ace 1 or 11, joker 20–25.',
        'Play to an agreed number of rounds or a points limit.',
      ],
    },
  ],
};

export const zolikyTutorial: Record<Lng, TutorialStep[]> = {
  cs: [
    {
      title: 'Skupina (set)',
      text: 'Tři nebo čtyři karty STEJNÉ hodnoty v různých barvách. Například tři sedmičky různých barev.',
      demo: 'set',
    },
    {
      title: 'Postupka (run)',
      text: 'Tři a více karet STEJNÉ barvy jdoucích po sobě, třeba 5–6–7 srdcí. Eso může být nízké (A-2-3) i vysoké (Q-K-A).',
      demo: 'run',
    },
    {
      title: 'Žolík',
      text: 'Žolík nahradí jakoukoli chybějící kartu v sestavě. Šetři si ho na dokončení těžkých sestav.',
      demo: 'joker',
    },
    {
      title: 'Tah a výhra',
      text: 'Líznu si kartu (z balíčku nebo z odhazováku) a jednu odhodím. Ve zdejší rychlé verzi hraješ s 9 kartami — vyhraješ, když po odhození složíš celou ruku do sestav.',
    },
  ],
  en: [
    {
      title: 'Set',
      text: 'Three or four cards of the SAME RANK in different suits — for example three sevens of different suits.',
      demo: 'set',
    },
    {
      title: 'Run',
      text: 'Three or more cards of the SAME SUIT in sequence, e.g. 5–6–7 of hearts. The ace can be low (A-2-3) or high (Q-K-A).',
      demo: 'run',
    },
    {
      title: 'Joker',
      text: 'A joker replaces any missing card in a combination. Save it to complete the hardest combinations.',
      demo: 'joker',
    },
    {
      title: 'Turn and winning',
      text: 'Draw a card (from the stock or the discard pile) and discard one. In this quick version you play with 9 cards — you win when, after discarding, your whole hand forms valid combinations.',
    },
  ],
};
