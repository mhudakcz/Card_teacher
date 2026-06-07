// Dvojjazyčný obsah pravidel pro Taroky.

import type { Lng } from '@/i18n';
import type { RulesSection, TutorialStep } from '@/games/types';

export const tarokyRules: Record<Lng, RulesSection[]> = {
  cs: [
    {
      heading: 'Cíl hry',
      body: [
        'Taroky se hrají se zvláštním balíčkem 54 karet a mocnými trumfy. Cílem je uhrát ve štyších víc bodů než soupeři a splnit přihlášené závazky. Nejčastěji hrají tři hráči.',
      ],
    },
    {
      heading: 'Balíček',
      body: [
        'Čtyři barvy (kule, listy, srdce, žaludy) mají po osmi kartách.',
        'K tomu 22 trumfů — taroky I až XXI a Škýz. Trumfy přebíjejí všechny barevné karty.',
        'Tři nejdůležitější trumfy (honéry): I (pagát), XXI (mond) a Škýz.',
      ],
    },
    {
      heading: 'Štychy',
      body: [
        'Musíš ctít vynesenou barvu; když ji nemáš, musíš přidat trumf.',
        'Štych bere nejvyšší trumf, jinak nejvyšší karta vynesené barvy.',
        'Vítěz štychu vynáší další.',
      ],
    },
    {
      heading: 'Bodování karet',
      body: [
        'Karty se počítají po skupinkách. Honéry a krále mají nejvyšší hodnotu, řadové karty malou.',
        'Honéry (pagát, mond, škýz) přinášejí body navíc, pokud je udržíš.',
      ],
    },
    {
      heading: 'Závazky a prémie',
      body: [
        'Před hrou se licituje typ hry a přihlašují se prémie.',
        'Trula = držení všech tří honérů. Pagát ultimo = uhrání posledního štychu pagátem.',
        'Splněné prémie body přidávají, nesplněné odebírají.',
      ],
    },
  ],
  en: [
    {
      heading: 'Goal',
      body: [
        'Tarock is played with a special 54-card deck and powerful trumps. The aim is to take more points in tricks than your opponents and fulfil announced contracts. Most often three players.',
      ],
    },
    {
      heading: 'The deck',
      body: [
        'Four suits (bells, leaves, hearts, acorns) of eight cards each.',
        'Plus 22 trumps — tarocks I to XXI and the Sküs. Trumps beat all suit cards.',
        'The three key trumps (honours): I (Pagat), XXI (Mond) and the Sküs.',
      ],
    },
    {
      heading: 'Tricks',
      body: [
        'You must follow the led suit; if you cannot, you must play a trump.',
        'The highest trump wins the trick, otherwise the highest card of the led suit.',
        'The trick winner leads next.',
      ],
    },
    {
      heading: 'Card values',
      body: [
        'Cards are counted in small groups. Honours and kings are worth the most, plain cards little.',
        'The honours (Pagat, Mond, Sküs) give bonus points if you keep them.',
      ],
    },
    {
      heading: 'Contracts and bonuses',
      body: [
        'Before play, the type of game is bid and bonuses are announced.',
        'Trull = holding all three honours. Pagat ultimo = winning the last trick with the Pagat.',
        'Fulfilled bonuses add points; failed ones subtract.',
      ],
    },
  ],
};

export const tarokyTutorial: Record<Lng, TutorialStep[]> = {
  cs: [
    {
      title: 'Trumfy (taroky)',
      text: 'Vedle čtyř barev je 22 trumfů: I (pagát) až XXI (mond) a Škýz. Trumf přebíjí každou barevnou kartu. Mezi trumfy bere vyšší číslo, Škýz je úplně nejvyšší.',
      demo: 'trumps',
    },
    {
      title: 'Štychy',
      text: 'Musíš ctít vynesenou barvu. Když ji nemáš, musíš přidat trumf. Štych bere nejvyšší trumf, jinak nejvyšší karta vynesené barvy. Vítěz vynáší další.',
      demo: 'beat',
    },
    {
      title: 'Honéry a body',
      text: 'Tři honéry — pagát (I), mond (XXI) a Škýz — mají po 5 bodech, stejně jako králové. Svršek 4, spodek 3, ostatní 0.',
      demo: 'honours',
    },
    {
      title: 'Pagát ultimo',
      text: 'Když uhraješ úplně poslední štych pagátem (taroka I), získáš bonus 10 bodů. Je to risk — pagát je nejslabší trumf, takže ho musíš dobře načasovat.',
    },
  ],
  en: [
    {
      title: 'Trumps (tarocks)',
      text: 'Besides the four suits there are 22 trumps: I (Pagat) to XXI (Mond) and the Sküs. A trump beats any suit card. Among trumps the higher number wins, and the Sküs is the very highest.',
      demo: 'trumps',
    },
    {
      title: 'Tricks',
      text: 'You must follow the led suit. If you cannot, you must play a trump. The highest trump wins, otherwise the highest card of the led suit. The winner leads next.',
      demo: 'beat',
    },
    {
      title: 'Honours and points',
      text: 'The three honours — Pagat (I), Mond (XXI) and the Sküs — are worth 5 points each, like kings. Over 4, under 3, the rest 0.',
      demo: 'honours',
    },
    {
      title: 'Pagat ultimo',
      text: 'Win the very last trick with the Pagat (tarock I) and you earn a 10-point bonus. It is a gamble — the Pagat is the weakest trump, so you must time it well.',
    },
  ],
};
