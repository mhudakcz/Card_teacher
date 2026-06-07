// Dvojjazyčný obsah pravidel a tutoriálu pro Oko bere (české 21).

import type { Lng } from '@/i18n';
import type { RulesSection, TutorialStep } from '@/games/types';

export const okoRules: Record<Lng, RulesSection[]> = {
  cs: [
    {
      heading: 'Cíl hry',
      body: [
        'Dostaň součet svých karet co nejblíž k 21 („oko"), ale nepřetáhni se. Hraje se proti krupiérovi (počítači) s 32 sedláckými kartami.',
      ],
    },
    {
      heading: 'Hodnoty karet',
      body: [
        'Eso (A) = 11 nebo 1 (podle toho, co se hodí). Desítka = 10.',
        'Král (K) = 4, svršek (O) = 3, spodek (U) = 2.',
        'Devítka, osmička a sedmička platí podle svého čísla (9, 8, 7).',
      ],
    },
    {
      heading: 'Průběh',
      body: [
        'Na začátku dostaneš dvě karty, krupiér také.',
        'Pak se rozhoduješ: „Beru" (líznout další kartu) nebo „Stojím" (ukončit tah).',
        'Přetáhneš-li se přes 21, okamžitě prohráváš.',
      ],
    },
    {
      heading: 'Tah krupiéra',
      body: [
        'Když dohraješ, dobírá krupiér. Podle obtížnosti hraje opatrněji nebo agresivněji.',
        'Vyšší součet do 21 vyhrává. Stejný součet je remíza.',
      ],
    },
  ],
  en: [
    {
      heading: 'Goal',
      body: [
        'Get your card total as close to 21 ("the eye") as possible without going over. You play against the dealer (computer) with a 32-card Czech deck.',
      ],
    },
    {
      heading: 'Card values',
      body: [
        'Ace (A) = 11 or 1 (whichever helps). Ten = 10.',
        'King (K) = 4, Over (O) = 3, Under (U) = 2.',
        'Nine, eight and seven are worth their face value (9, 8, 7).',
      ],
    },
    {
      heading: 'Flow',
      body: [
        'You and the dealer each get two cards to start.',
        'Then you choose: "Hit" (draw another card) or "Stand" (end your turn).',
        'If you go over 21, you lose immediately.',
      ],
    },
    {
      heading: "Dealer's turn",
      body: [
        'After you finish, the dealer draws. Depending on difficulty it plays more cautiously or aggressively.',
        'The higher total up to 21 wins. An equal total is a draw.',
      ],
    },
  ],
};

export const okoTutorial: Record<Lng, TutorialStep[]> = {
  cs: [
    {
      title: 'Vítej u Oko bere',
      text: 'Je to české „jednadvacet". Naučíme tě ho ve čtyřech krocích.',
    },
    {
      title: 'Počítej do 21',
      text: 'Sečti hodnoty svých karet. Eso je 11, desítka 10. Tady máš eso a desítku — přesně 21, nejlepší možný výsledek!',
      demo: 'value',
    },
    {
      title: 'Eso je chytré',
      text: 'Když by tě eso za 11 přetáhlo, počítá se jako 1. Eso, král a deset je tedy 1 + 4 + 10 = 15, ne 25.',
      demo: 'soft',
    },
    {
      title: 'Nepřetáhni se',
      text: 'Součet přes 21 znamená okamžitou prohru. Při vysokém součtu radši „stůj".',
      demo: 'bust',
    },
    {
      title: 'Hotovo!',
      text: 'Teď si zahraj proti krupiérovi — zvol obtížnost a zkus dát 21.',
    },
  ],
  en: [
    {
      title: 'Welcome to Oko bere',
      text: 'It is the Czech version of twenty-one. We will teach you in four steps.',
    },
    {
      title: 'Count to 21',
      text: 'Add up your card values. An ace is 11, a ten is 10. Here you have an ace and a ten — exactly 21, the best possible result!',
      demo: 'value',
    },
    {
      title: 'The ace is smart',
      text: 'If counting an ace as 11 would bust you, it counts as 1 instead. So ace, king and ten is 1 + 4 + 10 = 15, not 25.',
      demo: 'soft',
    },
    {
      title: 'Do not bust',
      text: 'A total over 21 means an instant loss. With a high total, it is safer to stand.',
      demo: 'bust',
    },
    {
      title: 'Done!',
      text: 'Now play against the dealer — pick a difficulty and try to hit 21.',
    },
  ],
};
