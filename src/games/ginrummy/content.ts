// Dvojjazyčný obsah pravidel a tutoriálu pro Gin Rummy.

import type { Lng } from '@/i18n';
import type { RulesSection, TutorialStep } from '@/games/types';

export const ginRummyRules: Record<Lng, RulesSection[]> = {
  cs: [
    {
      heading: 'Cíl hry',
      body: [
        'Poskládat karty v ruce do sestav a snížit hodnotu „zbytku" (deadwoodu) co nejvíc.',
        'Sestavy jsou dvojího druhu: trojice/čtveřice stejné hodnoty (set) a postupky tří a více karet téže barvy (run).',
      ],
    },
    {
      heading: 'Příprava',
      body: [
        'Hraje se s 52 kartami. Každý dostane 10 karet, jedna se otočí lícem nahoru jako vrch odhazováku, zbytek je dobírací balíček.',
      ],
    },
    {
      heading: 'Tah',
      body: [
        'Na tahu si nejdřív lízneš jednu kartu — buď z balíčku (naslepo), nebo vrchní z odhazováku (vidíš ji).',
        'Pak jednu kartu odhodíš na odhazovák. Vždy tak v ruce držíš 10 karet.',
      ],
    },
    {
      heading: 'Hodnoty a deadwood',
      body: [
        'Eso = 1 bod, číselné karty dle čísla, desítka a obrázky (J, Q, K) = 10 bodů.',
        'Deadwood je součet hodnot karet, které nejsou v žádné sestavě.',
      ],
    },
    {
      heading: 'Klepnutí a gin',
      body: [
        'Když máš po odhození deadwood nejvýš 10, můžeš „klepnout" a kolo ukončit.',
        'Gin = nulový deadwood (všech 10 karet je v sestavách) — to je nejlepší. Za gin je bonus 25 bodů.',
        'Při klepnutí (ne ginu) smí soupeř přiložit svůj deadwood k tvým sestavám a tím si snížit body.',
      ],
    },
    {
      heading: 'Bodování',
      body: [
        'Klepač boduje rozdíl deadwoodů (soupeřův minus vlastní).',
        'Pokud má ale soupeř po přiložení deadwood stejný nebo nižší než klepač, jde o „undercut": boduje soupeř a navíc dostává 25 bodů bonus.',
      ],
    },
    {
      heading: 'Obtížnost soupeře',
      body: [
        'Lehký počítač hraje převážně náhodně a klepe jen na gin.',
        'Střední bere z odhazováku jen když to pomůže a klepe od deadwoodu 5. Těžký klepe hned, jakmile smí (deadwood ≤ 10).',
      ],
    },
  ],
  en: [
    {
      heading: 'Goal',
      body: [
        'Arrange your hand into melds and reduce the value of the leftover cards (deadwood) as much as possible.',
        'There are two kinds of meld: three/four of the same rank (a set) and runs of three or more cards in the same suit.',
      ],
    },
    {
      heading: 'Setup',
      body: [
        'Played with 52 cards. Each player gets 10 cards, one is turned face up as the top of the discard pile, the rest is the stock.',
      ],
    },
    {
      heading: 'Turn',
      body: [
        'On your turn you first draw one card — either blindly from the stock, or the visible top of the discard pile.',
        'Then you discard one card to the discard pile. You always hold 10 cards.',
      ],
    },
    {
      heading: 'Values and deadwood',
      body: [
        'Ace = 1 point, number cards their face value, ten and the court cards (J, Q, K) = 10 points.',
        'Deadwood is the total value of cards that are not in any meld.',
      ],
    },
    {
      heading: 'Knocking and gin',
      body: [
        'When your deadwood after discarding is at most 10, you may “knock” to end the round.',
        'Gin = zero deadwood (all 10 cards in melds) — the best outcome. Gin earns a 25-point bonus.',
        'When you knock (not gin), the opponent may lay off their deadwood onto your melds to lower their score.',
      ],
    },
    {
      heading: 'Scoring',
      body: [
        'The knocker scores the difference of deadwood (opponent minus their own).',
        'But if the opponent ends with deadwood equal to or lower than the knocker, it is an “undercut”: the opponent scores plus a 25-point bonus.',
      ],
    },
    {
      heading: 'Opponent difficulty',
      body: [
        'The easy computer plays mostly at random and only knocks on gin.',
        'Medium takes from the discard only when it helps and knocks from deadwood 5. Hard knocks as soon as allowed (deadwood ≤ 10).',
      ],
    },
  ],
};

export const ginRummyTutorial: Record<Lng, TutorialStep[]> = {
  cs: [
    {
      title: 'Vítej u Gin Rummy',
      text: 'Skládáš karty do sestav a snažíš se mít co nejméně nesložených karet (deadwoodu).',
    },
    {
      title: 'Set — stejná hodnota',
      text: 'Tři nebo čtyři karty stejné hodnoty tvoří set. Tady tři sedmičky.',
      demo: 'set',
    },
    {
      title: 'Run — postupka v barvě',
      text: 'Tři a více po sobě jdoucích karet téže barvy tvoří postupku. Tady 5-6-7 srdcí.',
      demo: 'run',
    },
    {
      title: 'Líznout a odhodit',
      text: 'Každý tah: lízni z balíčku nebo z odhazováku a jednu kartu odhoď. Pořád držíš 10 karet.',
    },
    {
      title: 'Klepni!',
      text: 'Až máš deadwood ≤ 10, můžeš klepnout. Nula = gin a bonus 25. Zkus to proti počítači.',
    },
  ],
  en: [
    {
      title: 'Welcome to Gin Rummy',
      text: 'You arrange cards into melds and try to keep as little unmatched deadwood as possible.',
    },
    {
      title: 'Set — same rank',
      text: 'Three or four cards of the same rank form a set. Here, three sevens.',
      demo: 'set',
    },
    {
      title: 'Run — a run in one suit',
      text: 'Three or more consecutive cards of the same suit form a run. Here, 5-6-7 of hearts.',
      demo: 'run',
    },
    {
      title: 'Draw and discard',
      text: 'Each turn: draw from the stock or the discard, then discard one card. You always hold 10 cards.',
    },
    {
      title: 'Knock!',
      text: 'Once your deadwood is ≤ 10 you may knock. Zero = gin and a 25 bonus. Try it against the computer.',
    },
  ],
};
