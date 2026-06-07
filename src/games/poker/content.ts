// Dvojjazyčný obsah pravidel pro Poker (Texas Hold'em).

import type { Lng } from '@/i18n';
import type { RulesSection, TutorialStep } from '@/games/types';

export const pokerRules: Record<Lng, RulesSection[]> = {
  cs: [
    {
      heading: 'Cíl hry',
      body: [
        'Vyhraj bank — buď nejlepší pětikartovou kombinací při „showdownu", nebo tím, že soupeře přiměješ složit karty. Texas Hold\'em se hraje s 52 francouzskými kartami.',
      ],
    },
    {
      heading: 'Karty a sázky',
      body: [
        'Každý hráč dostane 2 vlastní karty (hole cards). Postupně přibude 5 společných karet na stůl.',
        'Před rozdáním vkládají dva hráči povinné sázky (malý a velký blind).',
        'Svou nejlepší pětici skládáš z libovolné kombinace svých dvou a pěti společných karet.',
      ],
    },
    {
      heading: 'Sázecí kola',
      body: [
        'Preflop: sázky po obdržení vlastních karet.',
        'Flop: otočí se 3 společné karty, následuje sázka.',
        'Turn: čtvrtá společná karta a sázka.',
        'River: pátá společná karta a poslední sázka, pak showdown.',
      ],
    },
    {
      heading: 'Možnosti tahu',
      body: [
        'Check (čekat) — pokud nikdo nesázel. Bet (vsadit) — vložit žetony.',
        'Call (dorovnat) — přidat tolik co soupeř. Raise (navýšit) — zvednout sázku.',
        'Fold (složit) — vzdát se kola a přijít o dosavadní vklad.',
      ],
    },
    {
      heading: 'Pořadí kombinací',
      body: [
        'Od nejsilnější: postupka v barvě (royal/straight flush), čtveřice, full house, barva (flush), postupka, trojice, dvě dvojice, jedna dvojice, vysoká karta.',
        'Při shodě rozhoduje výše karet v kombinaci, případně „kicker".',
      ],
    },
  ],
  en: [
    {
      heading: 'Goal',
      body: [
        'Win the pot — either with the best five-card hand at showdown, or by making opponents fold. Texas Hold\'em is played with a 52-card French deck.',
      ],
    },
    {
      heading: 'Cards and bets',
      body: [
        'Each player gets 2 private cards (hole cards). Then 5 community cards appear on the table.',
        'Before the deal two players post forced bets (small and big blind).',
        'Your best five-card hand is made from any mix of your two cards and the five community cards.',
      ],
    },
    {
      heading: 'Betting rounds',
      body: [
        'Pre-flop: betting after receiving hole cards.',
        'Flop: 3 community cards are turned, then a betting round.',
        'Turn: the fourth community card and a bet.',
        'River: the fifth community card and a final bet, then showdown.',
      ],
    },
    {
      heading: 'Action options',
      body: [
        'Check — if nobody has bet. Bet — put chips in.',
        'Call — match the opponent. Raise — increase the bet.',
        'Fold — give up the round and lose what you put in.',
      ],
    },
    {
      heading: 'Hand ranking',
      body: [
        'From strongest: straight/royal flush, four of a kind, full house, flush, straight, three of a kind, two pair, one pair, high card.',
        'Ties are broken by the highest cards in the hand, then by the "kicker".',
      ],
    },
  ],
};

export const pokerTutorial: Record<Lng, TutorialStep[]> = {
  cs: [
    {
      title: 'Tvé dvě karty',
      text: 'Na začátku dostaneš 2 vlastní (hole) karty, které vidíš jen ty. Podle nich se rozhoduješ, zda do hry vstoupíš.',
      demo: 'hole',
    },
    {
      title: 'Společné karty',
      text: 'Na stůl postupně přibude 5 společných karet (flop 3, turn 1, river 1). Nejlepší pětici skládáš z jakékoli kombinace svých dvou a pěti společných karet.',
      demo: 'community',
    },
    {
      title: 'Pořadí kombinací',
      text: 'Silnější kombinace bere bank. Od nejsilnější: postupka v barvě, čtveřice, full house, barva, postupka, trojice, dvě dvojice, dvojice, vysoká karta.',
      demo: 'ranking',
    },
    {
      title: 'Sázení a blafování',
      text: 'V každém kole můžeš checknout, vsadit/navýšit, dorovnat, nebo složit. Vyhraješ i bez nejlepších karet, když soupeře přiměješ složit.',
    },
  ],
  en: [
    {
      title: 'Your two cards',
      text: 'You start with 2 private (hole) cards that only you can see. Use them to decide whether to enter the hand.',
      demo: 'hole',
    },
    {
      title: 'Community cards',
      text: 'Five shared cards appear on the table (flop 3, turn 1, river 1). Your best five-card hand is any mix of your two and the five community cards.',
      demo: 'community',
    },
    {
      title: 'Hand ranking',
      text: 'The stronger hand wins the pot. From strongest: straight flush, four of a kind, full house, flush, straight, three of a kind, two pair, pair, high card.',
      demo: 'ranking',
    },
    {
      title: 'Betting and bluffing',
      text: 'Each round you can check, bet/raise, call, or fold. You can win without the best cards by making your opponent fold.',
    },
  ],
};
