// Dvojjazyčný obsah pravidel pro Sedmu.

import type { Lng } from '@/i18n';
import type { RulesSection, TutorialStep } from '@/games/types';

export const sedmaRules: Record<Lng, RulesSection[]> = {
  cs: [
    {
      heading: 'Cíl hry',
      body: [
        'Získej víc bodů než soupeř. Body dávají jen desítky a esa (každá karta 10 bodů) a navíc poslední štych (10 bodů). Dohromady je ve hře 90 bodů — vyhrává, kdo má víc než 45.',
      ],
    },
    {
      heading: 'Příprava',
      body: [
        'Hraje se s 32 sedláckými kartami, nejčastěji 2 hráči (nebo 2 proti 2).',
        'Každý dostane 4 karty, zbytek tvoří dobírací balíček (talon).',
      ],
    },
    {
      heading: 'Průběh štychu',
      body: [
        'Hráč na tahu vynese libovolnou kartu. Soupeř ji buď „přebije", nebo se jí vzdá.',
        'Přebít lze kartou STEJNÉ hodnoty (např. desítku desítkou) NEBO jakoukoli sedmičkou.',
        'Pokud soupeř nepřebije (nebo nechce), přiloží libovolnou kartu a štych bere ten, kdo vynášel.',
        'Vítěz štychu si sebere obě karty a vynáší další.',
      ],
    },
    {
      heading: 'Sedmička je trumf',
      body: [
        'Sedmička přebije jakoukoli kartu a dá se zahrát kdykoli. Je to nejsilnější karta hry.',
        'I sedmičku ale může přebít jiná sedmička — pak bere ten, kdo ji přiložil jako poslední.',
      ],
    },
    {
      heading: 'Dobírání a konec',
      body: [
        'Po každém štychu si oba hráči doberou z talonu zpět na 4 karty (nejdřív vítěz štychu).',
        'Když dojde talon, dohrají se zbylé karty z ruky.',
        'Nakonec se sečtou desítky, esa a bod za poslední štych. Kdo má víc než 45 bodů, vyhrává.',
      ],
    },
  ],
  en: [
    {
      heading: 'Goal',
      body: [
        'Score more points than your opponent. Only tens and aces count (10 points each), plus 10 points for the last trick. There are 90 points in play — whoever scores more than 45 wins.',
      ],
    },
    {
      heading: 'Setup',
      body: [
        'Played with a 32-card Czech deck, usually 2 players (or 2 vs 2).',
        'Each player is dealt 4 cards; the rest forms the draw pile (talon).',
      ],
    },
    {
      heading: 'Playing a trick',
      body: [
        'The player on turn leads any card. The opponent either "beats" it or gives it up.',
        'You beat it with a card of the SAME RANK (a ten with a ten) OR with any seven.',
        'If the opponent does not beat it, they add any card and the leader takes the trick.',
        'The trick winner collects both cards and leads next.',
      ],
    },
    {
      heading: 'The seven is the trump',
      body: [
        'A seven beats any card and can be played at any time — it is the strongest card.',
        'A seven can only be beaten by another seven; then the last one played wins.',
      ],
    },
    {
      heading: 'Drawing and the end',
      body: [
        'After each trick both players draw back up to 4 cards from the talon (the winner first).',
        'When the talon is empty, the remaining hand cards are played out.',
        'Finally count tens, aces and the last-trick point. More than 45 points wins.',
      ],
    },
  ],
};

export const sedmaTutorial: Record<Lng, TutorialStep[]> = {
  cs: [
    {
      title: 'Vítej u Sedmy',
      text: 'Naučíme tě ji v pár krocích. Sbíráš body z desítek, es a posledního štychu.',
    },
    {
      title: 'Přebíjení',
      text: 'Soupeř vynese kartu. Bereš štych, když přiložíš kartu STEJNÉ hodnoty — třeba krále na krále.',
      demo: 'beat',
    },
    {
      title: 'Sedmička vládne',
      text: 'Sedmička přebije cokoli, i eso. Je to tvoje nejsilnější karta — schovávej si ji na bodované štychy.',
      demo: 'seven',
    },
    {
      title: 'Co boduje',
      text: 'Body dávají jen desítky a esa (každá 10) a poslední štych (10). Krále a nižší karty ber klidně jako „výplň".',
      demo: 'points',
    },
    {
      title: 'Hotovo!',
      text: 'Teď to zkus proti počítači — ber bodované štychy a sedmičky nech na pravou chvíli.',
    },
  ],
  en: [
    {
      title: 'Welcome to Sedma',
      text: 'We will teach you in a few steps. You score from tens, aces and the last trick.',
    },
    {
      title: 'Beating',
      text: 'The opponent leads a card. You take the trick by adding a card of the SAME RANK — a king on a king.',
      demo: 'beat',
    },
    {
      title: 'The seven rules',
      text: 'A seven beats anything, even an ace. It is your strongest card — save it for tricks with points.',
      demo: 'seven',
    },
    {
      title: 'What scores',
      text: 'Only tens and aces score (10 each) plus the last trick (10). Kings and lower cards are just "filler".',
      demo: 'points',
    },
    {
      title: 'Done!',
      text: 'Now try it against the computer — take the scoring tricks and keep sevens for the right moment.',
    },
  ],
};
