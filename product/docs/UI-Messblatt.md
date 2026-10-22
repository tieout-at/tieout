# UI measurement sheet: values from professional software

As of: 22.10.2026. **Measured ourselves** with `getComputedStyle` on the live pages (frequency across all visible text elements) or by pixel analysis of the product images. Raw data: `UI-Referenzen/messung_roh.md`. Patterns and sources: `Inspiration_Muster.md`, `../research_notes/UI_Referenzen.md`. Screenshots: `UI-Referenzen/Referenz-Board.html` (local only, copyright).

Caution: what was measured is mostly the **websites**. Product interfaces are embedded there as an image or replica. Where the product interface itself was measurable, "Product" is noted.

## Measured values

| Reference | Font | Most frequent sizes | Weights | Radius | Text / muted | Surfaces | Primary button | Accent |
|---|---|---|---|---|---|---|---|---|
| **reebuild** | Inter (also loads Geist, Geist Mono) | 14 (51×), 16, 20, 12; h1 40/44 w600 | 400 / 500 / 600 | 6 px almost everywhere | #000d14 / #5c5a54, #7e7c75 (warm) | Web #fff, #fafafa, #f2f2f2. **Product:** app background #f4f4f8, cards #fff, lines ~#d4d4dc | #000d14, white, 14 px w500, r 6, height 44 | Petrol #01615b (scale #e6efef … #002b29), amber #f9bc60 |
| **Kuro** | Untitled Sans (Klim, commercial) | fluid 15 / 20 / 22 / 28 / 39 / 50; labels 15 px +0,3 px tracking | 500 dominant, 400 | 0 (square) | #000 / black 50 % | Beige #d7cbc2, white, black; lines black 10 % | – | Signal orange #ff4d00 |
| **Stratos** | Space Grotesk 400 | 14, 16, 13, 12, 24; −0,25 px tracking | 400 | Pills 100 px, cards 10–20 px | #fff on #000 / #6e7781, #b5b5b5 | #000, #f5f7fa, #d9d9d9 | Pill #ff5a2f, 14 px, height 42 | Orange #ff5a2f |
| **Linear** | Inter Variable, Berkeley Mono | **13 (64×)**, 12, 15, 14; heading 24 w510 | 400 / 510 / 590 | 8, 6, 4; pills | #f7f8f8 / #d0d6e0 / #8a8f98 / #62666d (cool) | Product dark #08090a, #0f1011; lines white 5–8 % | light on dark | Indigo #6d78d5 (sparing) |
| **Attio** | Inter + Inter Display (titles) + JetBrains Mono; Tiempos (quotes) | 14, 12, 16, 32 | **500 dominant**, 400, 600 | 8, 4, 6, 2,5 | #242629, #101112 / bluish grey | #fff, ~#fafafa, ~#f4f5f7 | #242629 dark | Blue #266df0 |
| **Harvey** | own serif (titles, large figures) + own sans | 14, 16, 28, 20; h1 48 serif w400 | 500 / 400 | 4, 8 | #0f0e0d / #33312c, #706d66, #8f8b85 (warm) | #fafaf9; sidebar dark #0f0e0d | #0f0e0d, white | Yellow #f6f202 (advertising only) |
| **Ramp** | Lausanne (commercial) | 14, 15, 12, 16 | 400 only | 12, 6, 16, 8 | almost black / black 60 % | #fff, warm light grey | dark; signal yellow-green | Yellow-green |

## What matches (consensus)

| Topic | Consensus | Evidenced by |
|---|---|---|
| Font | **Inter** (free, OFL) is the common font of the tool league; titles optionally in a display or serif font | reebuild, Linear, Attio (Inter); Harvey (serif for titles and figures) |
| Base size in the tool | **13–14 px**, tables 13 px | Linear 13, reebuild/Attio/Ramp/Harvey 14 |
| Weights | 400 text, **500** controls, 600 titles; no bold (700) | all |
| Tracking | slightly negative from 13 px (−0,5 to −1 %), uppercase labels positive | Linear, Attio, Stratos, Kuro |
| Radius | **6 px** controls, **8 px** cards, 4 px small marks | reebuild, Linear, Attio, Harvey |
| Primary button | **Ink (almost black)**, not the brand colour | reebuild, Attio, Harvey, Ramp |
| Text | almost black with a slight colour tint, never #000 | reebuild #000d14, Attio #101112, Harvey #0f0e0d |
| Surfaces | app background slightly tinted, content white, lines instead of shadows | reebuild product, Attio, Harvey |
| Accent | **one** colour, used sparingly; the league uses no gradients | all |
| Dark mode | Linear values as template (background #08090a/#0f1011, lines white 5–8 %) | Linear |

## Taken colours (do not use)

- Petrol/dark green: reebuild (direct competitor).
- Orange: Kuro and Stratos.
- Yellow-green: Ramp.

## Decisions for gate 1

1. **Reference set:** lead references reebuild, Kuro, Stratos; benchmarks Linear, Attio, Harvey, Ramp, Rossum; patterns without screenshot: BuildPass, Textura, Siteline, Payapps, Trunk Tools, Document Crunch.
2. **Font:** (a) Inter + Inter Display (recommendation, consensus), (b) Geist, (c) Inter + serif font for titles and figures (Harvey pattern).
3. **Base tone:** (a) cool-neutral like the reebuild product (recommendation), (b) warm like Harvey.
4. **Accent:** primary button in ink (consensus). Accent colour from the brand, so to be agreed with the website team. Until then, a neutral placeholder.
