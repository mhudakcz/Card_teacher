// Dvojjazyčný obsah pravidel pro Kanastu.

import type { Lng } from '@/i18n';
import type { RulesSection, TutorialStep } from '@/games/types';

export const kanastaRules: Record<Lng, RulesSection[]> = {
  cs: [
    {
      heading: 'Cíl hry',
      body: [
        'Sbírej body skládáním sestav (meldů) stejných hodnot a hlavně tvorbou kanast — sestav o sedmi a více kartách. Hraje se obvykle ve dvou dvojicích na 5000 bodů.',
      ],
    },
    {
      heading: 'Karty a rozdání',
      body: [
        'Dva balíčky po 52 kartách + 4 žolíci. Čtyři hráči ve dvou týmech sedí proti sobě.',
        'Každý dostane 11 karet. Vznikne dobírací balíček a odhazovací hromádka.',
      ],
    },
    {
      heading: 'Sestavy (meldy)',
      body: [
        'Meld je trojice a více karet STEJNÉ hodnoty (postupky se nehrají).',
        'Žolíci a dvojky jsou divoké a mohou kartu nahradit — meld ale musí mít aspoň dvě „přirozené" karty a nejvýš tři divoké.',
        'Sestavy patří celému týmu a dají se rozšiřovat.',
      ],
    },
    {
      heading: 'Kanasta a červené trojky',
      body: [
        'Kanasta je meld o 7+ kartách. Čistá (bez divokých) = 500 bodů, smíšená = 300 bodů.',
        'Červené trojky jsou bonusové — odkládají se stranou, každá 100 bodů.',
        'Vyložit se („jít ven") smí jen ten, jehož tým má aspoň jednu kanastu.',
      ],
    },
    {
      heading: 'Bodování karet',
      body: [
        'Žolík 50, eso a dvojka 20, král až osma 10, sedma až čtyřka a černá trojka 5.',
        'Body za karty v sestavách se přičítají, za karty zbylé v ruce odečítají.',
      ],
    },
  ],
  en: [
    {
      heading: 'Goal',
      body: [
        'Score points by building melds of equal ranks and especially by forming canastas — melds of seven or more cards. Usually played in two partnerships to 5000 points.',
      ],
    },
    {
      heading: 'Cards and the deal',
      body: [
        'Two 52-card decks + 4 jokers. Four players in two teams sit opposite each other.',
        'Each player gets 11 cards. A draw pile and a discard pile are formed.',
      ],
    },
    {
      heading: 'Melds',
      body: [
        'A meld is three or more cards of the SAME RANK (no runs).',
        'Jokers and deuces are wild and can substitute — but a meld needs at least two natural cards and at most three wild ones.',
        'Melds belong to the whole team and can be extended.',
      ],
    },
    {
      heading: 'Canasta and red threes',
      body: [
        'A canasta is a meld of 7+ cards. Pure (no wilds) = 500 points, mixed = 300 points.',
        'Red threes are bonus cards — set aside, each worth 100 points.',
        'A team may "go out" only once it has at least one canasta.',
      ],
    },
    {
      heading: 'Card values',
      body: [
        'Joker 50, ace and deuce 20, king to eight 10, seven to four and black three 5.',
        'Cards in melds add to your score; cards left in hand are subtracted.',
      ],
    },
  ],
};

export const kanastaTutorial: Record<Lng, TutorialStep[]> = {
  cs: [
    {
      title: 'Sestavy (meldy)',
      text: 'Sestava jsou tři a více karet STEJNÉ hodnoty. Tady tři krále. Postupky se v kanastě nehrají.',
      demo: 'meld',
    },
    {
      title: 'Divoké karty',
      text: 'Žolík a každá dvojka jsou „divoké" a zastoupí libovolnou kartu. Sestava ale musí mít aspoň dvě přirozené karty a nejvýš tři divoké.',
      demo: 'wild',
    },
    {
      title: 'Kanasta',
      text: 'Sestava o sedmi a více kartách je kanasta — čistá (bez divokých) má 500 b., smíšená 300 b. „Jít ven" (vyložit celou ruku) smíš až když máš aspoň jednu kanastu.',
      demo: 'canasta',
    },
    {
      title: 'Tah a body',
      text: 'Ve zdejší verzi hraješ heads-up: líznout → volitelně vyložit/rozšířit → odhodit. Body sčítáš za karty v sestavách, kanasty a červené trojky (100 b.); karty v ruce se odečítají.',
    },
  ],
  en: [
    {
      title: 'Melds',
      text: 'A meld is three or more cards of the SAME RANK — here three kings. Runs are not used in canasta.',
      demo: 'meld',
    },
    {
      title: 'Wild cards',
      text: 'Jokers and every deuce are "wild" and substitute for any card. But a meld needs at least two natural cards and at most three wilds.',
      demo: 'wild',
    },
    {
      title: 'Canasta',
      text: 'A meld of seven or more cards is a canasta — pure (no wilds) is worth 500, mixed 300. You may "go out" (empty your hand) only once you have at least one canasta.',
      demo: 'canasta',
    },
    {
      title: 'Turn and scoring',
      text: 'In this heads-up version: draw → optionally meld/extend → discard. You score for cards in melds, canastas and red threes (100 each); cards left in hand are subtracted.',
    },
  ],
};
