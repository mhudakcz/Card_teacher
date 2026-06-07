// Dvojjazyčný obsah pravidel a tutoriálu pro Durak.

import type { Lng } from '@/i18n';
import type { RulesSection, TutorialStep } from '@/games/types';

export const durakRules: Record<Lng, RulesSection[]> = {
  cs: [
    {
      heading: 'Cíl hry',
      body: [
        'Durak (rusky „blázen") je hra, kde nejde vyhrát, ale neprohrát. Poslední hráč, kterému zbudou karty v ruce, je „durak" — blázen.',
        'Cílem je zbavit se všech karet dřív než soupeř.',
      ],
    },
    {
      heading: 'Příprava',
      body: [
        'Hraje se s 36 kartami (6, 7, 8, 9, 10, J, Q, K, A ve čtyřech barvách).',
        'Každý dostane 6 karet. Zbytek tvoří dobírací balíček a jeho spodní karta se otočí — její barva je po celou hru trumf.',
        'První útočí ten, kdo má nejnižší trumf.',
      ],
    },
    {
      heading: 'Útok a obrana',
      body: [
        'Útočník položí kartu. Obránce ji musí přebít vyšší kartou téže barvy, nebo libovolným trumfem (trumf přebíjí každou netrumfovou kartu).',
        'Když obránce přebije, útočník smí přihrát další kartu — ale jen takové hodnoty, jaká už na stole leží.',
        'Maximálně se v jednom kole útočí 6 kartami.',
      ],
    },
    {
      heading: 'Beru, nebo bito',
      body: [
        'Pokud obránce nějakou kartu přebít nedokáže (nebo nechce), bere všechny karty ze stolu do ruky a o kolo přijde — útočí znovu tentýž hráč.',
        'Když útočník už nechce přihrávat a vše je přebité, řekne „bito": karty jdou do odpadu a role se prohodí — z obránce je útočník.',
      ],
    },
    {
      heading: 'Dobírání a konec',
      body: [
        'Po každém kole si oba doplní ruku na 6 karet (nejdřív útočník) z dobíracího balíčku.',
        'Když je balíček prázdný a někomu dojdou karty, je ze hry venku. Kdo zůstane s kartami jako poslední, je durak.',
      ],
    },
    {
      heading: 'Obtížnost soupeře',
      body: [
        'Lehký počítač hraje nazdařbůh. Střední šetří trumfy a brání nejnižší možnou kartou.',
        'Těžký počítač navíc nepřihrává zbytečně vysoké karty a raději bere, než by obětoval cenný trumf na nízkou kartu.',
      ],
    },
  ],
  en: [
    {
      heading: 'Goal',
      body: [
        'Durak (Russian for “fool”) is a game you cannot win, only avoid losing. The last player left holding cards is the durak — the fool.',
        'The goal is to get rid of all your cards before your opponent.',
      ],
    },
    {
      heading: 'Setup',
      body: [
        'Played with 36 cards (6, 7, 8, 9, 10, J, Q, K, A in four suits).',
        'Each player gets 6 cards. The rest forms the stock; its bottom card is turned face up — its suit is the trump for the whole game.',
        'The player with the lowest trump attacks first.',
      ],
    },
    {
      heading: 'Attack and defence',
      body: [
        'The attacker plays a card. The defender must beat it with a higher card of the same suit, or with any trump (a trump beats any non-trump card).',
        'After a successful defence the attacker may add another card — but only of a rank already on the table.',
        'A bout uses at most 6 attacking cards.',
      ],
    },
    {
      heading: 'Take, or “done”',
      body: [
        'If the defender cannot (or will not) beat a card, they pick up all the table cards and lose the bout — the same player attacks again.',
        'When the attacker stops adding cards and everything is beaten, they say “done”: the cards go to the discard and roles swap — the defender becomes the attacker.',
      ],
    },
    {
      heading: 'Drawing and the end',
      body: [
        'After each bout both players refill to 6 cards (attacker first) from the stock.',
        'Once the stock is empty and a player runs out of cards, they are out. Whoever is last left holding cards is the durak.',
      ],
    },
    {
      heading: 'Opponent difficulty',
      body: [
        'The easy computer plays at random. Medium saves trumps and defends with the lowest possible card.',
        'The hard computer additionally avoids throwing high cards and would rather take than waste a valuable trump on a low card.',
      ],
    },
  ],
};

export const durakTutorial: Record<Lng, TutorialStep[]> = {
  cs: [
    {
      title: 'Vítej u Duraku',
      text: 'Ruská klasika. Nehraje se o výhru, ale o to nezůstat poslední s kartami v ruce.',
    },
    {
      title: 'Trumf',
      text: 'Spodní karta balíčku určuje trumf. Trumfová karta přebije jakoukoli netrumfovou — tady srdcová šestka bije pikové eso.',
      demo: 'trump',
    },
    {
      title: 'Přebíjení',
      text: 'Obránce přebíjí vyšší kartou stejné barvy. Pikový král bije pikovou desítku.',
      demo: 'beat',
    },
    {
      title: 'Beru, nebo bito',
      text: 'Když nemáš čím přebít, bereš karty ze stolu. Když je vše přebité, útočník řekne „bito" a role se prohodí.',
    },
    {
      title: 'Hotovo!',
      text: 'Zkus to proti počítači. Na těžké obtížnosti šetří trumfy a nedá ti nic zadarmo.',
    },
  ],
  en: [
    {
      title: 'Welcome to Durak',
      text: 'A Russian classic. You don’t play to win — you play not to be last holding cards.',
    },
    {
      title: 'Trump',
      text: 'The bottom card of the stock sets the trump. A trump beats any non-trump — here the six of hearts beats the ace of spades.',
      demo: 'trump',
    },
    {
      title: 'Beating',
      text: 'The defender beats with a higher card of the same suit. The king of spades beats the ten of spades.',
      demo: 'beat',
    },
    {
      title: 'Take, or done',
      text: 'If you can’t beat a card, you take the table cards. When everything is beaten, the attacker says “done” and roles swap.',
    },
    {
      title: 'Done!',
      text: 'Try it against the computer. On hard it saves its trumps and gives you nothing for free.',
    },
  ],
};
