# Card Teacher 🃏

**Výuka karetních her** — pravidla, interaktivní tutoriály a hra proti počítači. Webová aplikace v češtině i angličtině, instalovatelná jako PWA a připravená na mobil.

🔗 **Živá ukázka:** https://mhudakcz.github.io/Card_teacher/

---

## Hry

Aplikace pokrývá osm karetních her. U každé najdeš **pravidla**, většinou **interaktivní tutoriál** a **hru proti počítači** se třemi obtížnostmi (lehká / střední / těžká).

| Hra | Balíček | Popis |
| --- | --- | --- |
| **Prší** | český (32) | Česká klasika typu Mau-Mau pro 2–6 hráčů |
| **Oko bere** | francouzský | České jednadvacet proti krupiérovi |
| **Sedma** | český (32) | Štychová klasika — sedma přebíjí vše |
| **Mariáš** | český (32) | Trumfy, hlášky a štychy |
| **Taroky** | tarokový (54) | 54 tarokových karet a mocné trumfy |
| **Žolíky** | francouzský + žolíci | Skládání postupek a trojic se žolíkem |
| **Kanasta** | 2× francouzský + žolíci | Tvorba sestav a kanast |
| **Poker** | francouzský (52) | Texas Hold'em — sázej, blafuj a slož nejlepší kombinaci |

---

## Funkce

- 🇨🇿 / 🇬🇧 **Dvojjazyčné** rozhraní (čeština / angličtina), přepínání za běhu.
- 🤖 **Hra proti počítači** se třemi úrovněmi obtížnosti.
- 📚 **Pravidla + interaktivní tutoriály** s názornými ukázkami.
- 🖨 **Tisknutelný souhrn pravidel** všech her (tlačítko na úvodní obrazovce).
- 🎨 **Denní / noční režim** a pět barevných schémat (smaragd, safír, karmín, královská, grafit).
- 📱 **PWA** — instalovatelná, funguje i offline.
- ⚡ Postavené na čistých TypeScript herních enginech (oddělených od UI) s jednotkovými testy.

---

## Technologie

- [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite 5](https://vitejs.dev/) (build a dev server)
- [Tailwind CSS 3](https://tailwindcss.com/) (styly)
- [Zustand](https://github.com/pmndrs/zustand) (stav aplikace)
- [i18next](https://www.i18next.com/) / react-i18next (lokalizace)
- [Vitest](https://vitest.dev/) (testy)

### Architektura

- **Herní enginy** (`src/games/<hra>/engine.ts`) jsou čisté TypeScript funkce (`init*`, `legalMoves`, `applyMove`, `isTerminal`) — neznají React a jsou testovatelné samostatně.
- **AI** (`src/games/<hra>/ai.ts`) přes `chooseMove(state, level)`.
- **Registr her** (`src/games/registry.ts`): každá hra dodá `GameDefinition` (pravidla, volitelný tutoriál, volitelná deska). Navigace bez routeru — řízená přes Zustand.
- **Sdílené jádro karet** (`src/core/cards.ts`): české (32), francouzské (52/54 + žolíci) i tarokové (54) balíčky, míchání se seedovatelným RNG.

---

## Vývoj

Požadavky: Node.js 20+.

```bash
npm install      # instalace závislostí
npm run dev      # dev server (http://localhost:5173)
npm test         # jednotkové testy (Vitest)
npm run build    # produkční build do dist/
npm run preview  # náhled produkčního buildu
```

---

## Nasazení

Projekt se automaticky nasazuje na **GitHub Pages** přes GitHub Actions (`.github/workflows/deploy.yml`) při každém pushi do větve `main`. Build běží s `base: '/Card_teacher/'` (viz `vite.config.ts`).

Pro vlastní fork stačí v nastavení repozitáře zapnout **Settings → Pages → Source: GitHub Actions** a případně upravit `base` ve `vite.config.ts` podle názvu svého repozitáře.

---

## Licence

Soukromý výukový projekt.
