// Dvojjazyčný obsah pravidel pro Černého Petra.

import type { Lng } from '@/i18n';
import type { RulesSection, TutorialStep } from '@/games/types';

export const cernyPetrRules: Record<Lng, RulesSection[]> = {
  cs: [
    {
      heading: 'Cíl hry',
      body: [
        'Zbavit se všech karet a hlavně NEZŮSTAT s Černým Petrem. Kdo na konci drží osamělého spodka, prohrál.',
      ],
    },
    {
      heading: 'Příprava',
      body: [
        'Hraje se s upraveným balíčkem 29 karet: z 32 sedláckých se vyhodí tři spodci, jeden (žaludový) zůstává jako Černý Petr.',
        'Všechny karty se rozdají mezi hráče (jeden dostane o jednu víc).',
        'Každý si hned odhodí všechny páry — dvě karty stejné hodnoty (např. dvě desítky).',
      ],
    },
    {
      heading: 'Průběh',
      body: [
        'Hráči se střídají. Kdo je na tahu, vytáhne soupeři jednu kartu naslepo (soupeř ji drží lícem k sobě).',
        'Pokud tažená karta utvoří pár s kartou v ruce, hráč pár ihned odhodí.',
        'Pokud pár neutvoří, karta mu zůstane v ruce a je na tahu soupeř.',
      ],
    },
    {
      heading: 'Konec hry',
      body: [
        'Hra končí, když jeden hráč odhodí všechny karty — ten je v bezpečí a vyhrává.',
        'Druhému zbude v ruce trčet jediná karta, kterou nešlo spárovat — Černý Petr. Ten prohrál.',
      ],
    },
    {
      heading: 'Obtížnost soupeře',
      body: [
        'Černý Petr je z velké části hra náhody. Lehký počítač tahá nazdařbůh.',
        'Těžký počítač má dokonalý přehled a Černému Petrovi se vyhýbá — porazit ho je pořádná výzva.',
      ],
    },
  ],
  en: [
    {
      heading: 'Goal',
      body: [
        'Get rid of all your cards and, above all, do NOT be left with the Black Peter. Whoever holds the lone jack at the end loses.',
      ],
    },
    {
      heading: 'Setup',
      body: [
        'Played with a modified 29-card deck: from the 32-card Czech deck three jacks (Unders) are removed; one (acorns) stays as the Black Peter.',
        'All cards are dealt to the players (one gets one more).',
        'Everyone immediately discards all pairs — two cards of the same rank (e.g. two tens).',
      ],
    },
    {
      heading: 'Play',
      body: [
        'Players take turns. On your turn you blindly draw one card from your opponent (they hold their cards facing themselves).',
        'If the drawn card forms a pair with a card in your hand, discard the pair immediately.',
        'If it does not pair, the card stays in your hand and it is the opponent’s turn.',
      ],
    },
    {
      heading: 'End of the game',
      body: [
        'The game ends when one player discards all their cards — they are safe and win.',
        'The other is left holding a single card that could never be paired — the Black Peter. They lose.',
      ],
    },
    {
      heading: 'Opponent difficulty',
      body: [
        'Black Peter is largely a game of luck. The easy computer draws at random.',
        'The hard computer has perfect information and avoids the Black Peter — beating it is a real challenge.',
      ],
    },
  ],
};

export const cernyPetrTutorial: Record<Lng, TutorialStep[]> = {
  cs: [
    {
      title: 'Vítej u Černého Petra',
      text: 'Klasická dětská hra. Cílem je zbavit se karet a nezůstat s osamělým spodkem.',
    },
    {
      title: 'Páry se odhazují',
      text: 'Dvě karty stejné hodnoty tvoří pár a hned je odhodíš. Tady dvě desítky.',
      demo: 'pair',
    },
    {
      title: 'Černý Petr',
      text: 'Jeden spodek nemá svůj pár — to je Černý Petr. Nikdy ho nespáruješ, tak ať ti nezůstane!',
      demo: 'petr',
    },
    {
      title: 'Tahání karet',
      text: 'Střídavě taháš soupeři kartu naslepo. Když utvoří pár, odhodíš ho. Když ne, zůstane ti v ruce.',
    },
    {
      title: 'Hotovo!',
      text: 'Zkus to proti počítači. Na těžké obtížnosti se ti soupeř Černému Petrovi šikovně vyhýbá.',
    },
  ],
  en: [
    {
      title: 'Welcome to Black Peter',
      text: 'A classic children’s game. The goal is to get rid of your cards and not be left with the lone jack.',
    },
    {
      title: 'Pairs are discarded',
      text: 'Two cards of the same rank form a pair and you discard it at once. Here, two tens.',
      demo: 'pair',
    },
    {
      title: 'The Black Peter',
      text: 'One jack has no pair — that is the Black Peter. You can never pair it, so don’t get stuck with it!',
      demo: 'petr',
    },
    {
      title: 'Drawing cards',
      text: 'You take turns blindly drawing a card from the opponent. If it pairs, discard it. If not, it stays in your hand.',
    },
    {
      title: 'Done!',
      text: 'Try it against the computer. On hard, the opponent cleverly avoids the Black Peter.',
    },
  ],
};
