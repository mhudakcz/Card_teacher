# Card Teacher — Projektová specifikace

> Webová (později mobilní) aplikace pro výuku karetních her.
> Dvojjazyčná (CZ/EN). U každé hry: **pravidla → interaktivní tutoriál → hra proti počítači (3 obtížnosti)**.

---

## 1. Cíl projektu

Naučit hráče populární karetní hry od nuly. Pro každou hru tři vrstvy učení:

1. **Pravidla** — přehledný, čitelný výklad (text, obrázky karet, příklady, kvíz).
2. **Interaktivní tutoriál** — krok za krokem na simulovaných kartách (rozdání, ukázkové tahy, vysvětlivky).
3. **Trénink / hra proti počítači** — plně hratelné s AI soupeřem ve 3 úrovních obtížnosti.

Multiplayer (hra více lidí online) je **mimo rozsah první verze**, ale architektura na něj nesmí zavírat dveře.

---

## 2. Hry

Řazeno podle obtížnosti učení = doporučená „učební cesta".

| # | Hra | EN název | Hráčů | Obtížnost | Priorita |
|---|-----|----------|-------|-----------|----------|
| 1 | Prší | Czech Mau-Mau | 2–6 | ★ | **MVP (vzor)** |
| 2 | Oko bere (21) | Twenty-One | 2+ | ★ | vysoká |
| 3 | Sedma | Sedma | 2–4 | ★★ | vysoká |
| 4 | Žolíky | Rummy | 2–4 | ★★ | střední |
| 5 | Kanasta | Canasta | 4 | ★★★ | střední |
| 6 | Mariáš | Mariáš | 2–3 | ★★★★ | střední |
| 7 | Taroky | Tarock | 4 | ★★★★ | nízká |
| 8 | Texas Hold'em Poker | Poker | 2+ | ★★★ | nízká |

**Kandidáti na rozšíření:** Ferbl/Cvik, Šnopsa/66, Tisíc, Durak, Bridž, Gin Rummy, Pasiáns, Černý Petr.

---

## 3. Architektura

Klíčový princip: **herní logika je oddělená od UI**. Každá hra = čistý TypeScript „engine", který nezná React. To umožňuje testování, znovupoužití a později i serverovou validaci pro multiplayer.

```
┌─────────────────────────────────────────────┐
│  UI vrstva (React + Tailwind)                 │
│  - obrazovky: výběr hry, pravidla, tutoriál,  │
│    herní stůl                                  │
│  - komponenty: karta, ruka, stůl, skóre        │
├─────────────────────────────────────────────┤
│  Herní engine (čisté TS, per hra)             │
│  - stav hry, validace tahů, vyhodnocení        │
│  - GameState, Move, applyMove(), legalMoves()  │
├─────────────────────────────────────────────┤
│  AI vrstva (per hra, 3 obtížnosti)            │
│  - easy: náhodný legální tah                   │
│  - medium: heuristika (pravidla palce)         │
│  - hard: výhled dopředu / minimax / MCTS       │
├─────────────────────────────────────────────┤
│  Sdílené jádro                                 │
│  - balíček karet, míchání, typy karet          │
│  - i18n (cs/en), obsah pravidel, tutoriály     │
└─────────────────────────────────────────────┘
```

### Společné rozhraní enginu (návrh)

```ts
interface CardGameEngine<S, M> {
  init(opts): S;                 // rozdá, připraví stav
  legalMoves(state: S): M[];     // legální tahy aktuálního hráče
  applyMove(state: S, move: M): S; // vrátí nový stav
  isTerminal(state: S): boolean; // konec hry?
  score(state: S): Record<PlayerId, number>;
}

interface CardAI<S, M> {
  chooseMove(state: S, level: 'easy'|'medium'|'hard'): M;
}
```

---

## 4. Technologický stack

| Vrstva | Volba |
|--------|-------|
| Build/Framework | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS |
| State management | Zustand |
| i18n | i18next + react-i18next (cs, en) |
| Testy | Vitest (jednotkové testy enginů a AI) |
| Mobil | PWA (manifest + service worker) → později Capacitor pro nativní obal |
| Hosting | statický web (Netlify / Vercel / GitHub Pages) |
| Backend | žádný v MVP; přidá se až pro multiplayer/účty |

---

## 5. Struktura repozitáře (plán)

```
Card_teacher/
├─ PROJECT_SPEC.md          # tento dokument
├─ docs/
│  └─ rules/                # tištitelná pravidla (Word/PDF) per hra
├─ src/
│  ├─ core/                 # balíček karet, míchání, sdílené typy
│  ├─ games/
│  │  └─ prsi/
│  │     ├─ engine.ts       # herní logika
│  │     ├─ ai.ts           # AI 3 obtížnosti
│  │     ├─ engine.test.ts
│  │     └─ content.cs.ts   # texty pravidel + tutoriál
│  ├─ ui/
│  │  ├─ components/        # Card, Hand, Table, ScoreBoard
│  │  └─ screens/           # GameList, Rules, Tutorial, Play
│  ├─ i18n/                 # cs.json, en.json
│  └─ app.tsx
└─ public/
   └─ cards/                # obrázky / SVG karet
```

---

## 6. Postup (roadmap)

**Fáze 0 — Základ**
- Scaffold Vite + React + TS + Tailwind + i18next + Zustand
- Sdílené jádro: typy karet, balíčky (32 mariášových, 54 žolíkových, 78 tarokových), míchání
- SVG/obrázky karet, komponenta `Card`

**Fáze 1 — Vertikální řez: Prší (vzor)**
- Engine + testy
- AI (3 obtížnosti)
- Obrazovky: pravidla, tutoriál, hra
- Ověřit kompletní šablonu „pravidla → tutoriál → hra"

**Fáze 2 — Rozšiřování her**
- Oko bere → Sedma → Žolíky → Kanasta → Mariáš → Taroky → Poker
- Každá hra opakuje stejnou šablonu

**Fáze 3 — Dokončení**
- PWA (instalace na mobil), offline
- Tištitelná pravidla (Word/PDF) per hra
- Leštění UI, animace, kvízy

**Fáze 4 (volitelně)** — Capacitor obal, multiplayer, účty, statistiky.

---

## 7. Otevřené otázky

- Vizuální styl karet — klasické české („sedlácké") karty pro mariáš/sedmu vs. francouzské pro poker/žolíky? (pravděpodobně oboje podle hry)
- Hlasové/animační efekty — ano/ne v MVP
- Ukládání postupu hráče — localStorage stačí pro MVP
