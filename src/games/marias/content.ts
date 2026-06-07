// Dvojjazyčný obsah pravidel pro Mariáš (volený mariáš).

import type { Lng } from '@/i18n';
import type { RulesSection, TutorialStep } from '@/games/types';

export const mariasRules: Record<Lng, RulesSection[]> = {
  cs: [
    {
      heading: 'Cíl hry',
      body: [
        'Volený mariáš hrají tři hráči: „volící" hráč proti dvojici protihráčů. Volící se snaží uhrát víc než polovinu bodů; soupeři mu v tom brání. Hraje se s 32 sedláckými kartami.',
      ],
    },
    {
      heading: 'Hodnoty a štychy',
      body: [
        'Bodují jen esa a desítky — každá 10 bodů. Poslední štych přidává 10 bodů. Celkem 90.',
        'Síla karet ve štychu: eso, desítka, král, svršek, spodek, 9, 8, 7.',
        'Musíš ctít barvu, jít výš, a když barvu nemáš, trumfovat. Jinak přiznáš (přidáš libovolnou).',
      ],
    },
    {
      heading: 'Volba trumfů',
      body: [
        'Volící dostane sedm karet, vybere trumfovou barvu a jednu kartu té barvy odloží do talonu.',
        'Trumfy přebíjejí všechny ostatní barvy.',
      ],
    },
    {
      heading: 'Hlášky (mariáš)',
      body: [
        'Král a svršek stejné barvy v ruce = „hláška": 20 bodů v obyčejné barvě, 40 bodů v trumfech.',
        'Hláška se počítá, když jednu z dvojice vyneseš do štychu.',
      ],
    },
    {
      heading: 'Druhy her',
      body: [
        'Hra: volící chce uhrát víc než polovinu bodů.',
        'Sedma: navíc slibuje uhrát poslední štych trumfovou sedmou.',
        'Betl: volící slibuje neudělat ani jeden štych (bez trumfů).',
        'Durch: volící slibuje udělat všechny štychy.',
      ],
    },
  ],
  en: [
    {
      heading: 'Goal',
      body: [
        'Selection Mariáš is played by three players: the "declarer" against the other two. The declarer tries to take more than half the points; the opponents try to stop them. Played with a 32-card Czech deck.',
      ],
    },
    {
      heading: 'Values and tricks',
      body: [
        'Only aces and tens score — 10 points each. The last trick adds 10 points. 90 in total.',
        'Card strength in a trick: ace, ten, king, over, under, 9, 8, 7.',
        'You must follow suit, play higher, and trump if you cannot follow. Otherwise discard any card.',
      ],
    },
    {
      heading: 'Choosing trumps',
      body: [
        'The declarer receives seven cards, picks the trump suit and puts one card of that suit into the talon.',
        'Trumps beat all other suits.',
      ],
    },
    {
      heading: 'Marriages',
      body: [
        'A king and over of the same suit in hand form a "marriage": 20 points in a plain suit, 40 in trumps.',
        'It scores when you lead one of the pair into a trick.',
      ],
    },
    {
      heading: 'Types of game',
      body: [
        'Game: the declarer wants more than half the points.',
        'Seven: additionally promises to win the last trick with the trump seven.',
        'Betl: the declarer promises to take no trick at all (no trumps).',
        'Durch: the declarer promises to take every trick.',
      ],
    },
  ],
};

export const mariasTutorial: Record<Lng, TutorialStep[]> = {
  cs: [
    {
      title: 'Síla karet',
      text: 'Ve štychu přebíjí silnější karta. Pořadí od nejsilnější: eso, desítka, král, svršek, spodek, 9, 8, 7. Bodují jen esa a desítky (10 b.).',
      demo: 'order',
    },
    {
      title: 'Trumfy',
      text: 'Jedna barva je trumfová a přebíjí všechny ostatní. Musíš ctít barvu a přebíjet; když barvu nemáš, musíš trumfovat.',
      demo: 'trump',
    },
    {
      title: 'Hláška',
      text: 'Král a svršek téže barvy v ruce tvoří „hlášku" — 20 bodů v obyčejné barvě, 40 v trumfech. Boduje, když jednu z dvojice vyneseš.',
      demo: 'marriage',
    },
    {
      title: 'Konec a body',
      text: 'Ve zdejší verzi hraješ heads-up s 10 kartami. Sčítají se body za esa a desítky, hlášky a 10 bodů za poslední štych. Víc bodů vyhrává.',
    },
  ],
  en: [
    {
      title: 'Card strength',
      text: 'The stronger card wins the trick. From strongest: ace, ten, king, over, under, 9, 8, 7. Only aces and tens score (10 pts).',
      demo: 'order',
    },
    {
      title: 'Trumps',
      text: 'One suit is trump and beats all others. You must follow suit and beat; if you have no card of the suit, you must trump.',
      demo: 'trump',
    },
    {
      title: 'Marriage',
      text: 'A king and over of the same suit in hand form a "marriage" — 20 points in a plain suit, 40 in trumps. It scores when you lead one of the pair.',
      demo: 'marriage',
    },
    {
      title: 'End and scoring',
      text: 'In this version you play heads-up with 10 cards. Points add up from aces and tens, marriages, and 10 points for the last trick. More points wins.',
    },
  ],
};
