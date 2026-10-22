# UI-Messblatt: Werte aus professioneller Software

Stand: 22.10.2026. **Selbst gemessen** mit `getComputedStyle` auf den Live-Seiten (Häufigkeit über alle sichtbaren Textelemente) bzw. per Pixelanalyse der Produktbilder. Rohdaten: `UI-Referenzen/messung_roh.md`. Muster und Quellen: `Inspiration_Muster.md`, `../research_notes/UI_Referenzen.md`. Screenshots: `UI-Referenzen/Referenz-Board.html` (nur lokal, Urheberrecht).

Achtung: Gemessen sind meist die **Websites**. Produktoberflächen sind dort als Bild oder Nachbau eingebettet. Wo die Produktoberfläche selbst messbar war, steht „Produkt“ dabei.

## Messwerte

| Referenz | Schrift | Häufigste Größen | Gewichte | Radius | Text / gedämpft | Flächen | Primärknopf | Akzent |
|---|---|---|---|---|---|---|---|---|
| **reebuild** | Inter (lädt auch Geist, Geist Mono) | 14 (51×), 16, 20, 12; h1 40/44 w600 | 400 / 500 / 600 | 6 px fast überall | #000d14 / #5c5a54, #7e7c75 (warm) | Web #fff, #fafafa, #f2f2f2. **Produkt:** App-Grund #f4f4f8, Karten #fff, Linien ~#d4d4dc | #000d14, weiß, 14 px w500, r 6, Höhe 44 | Petrol #01615b (Skala #e6efef … #002b29), Amber #f9bc60 |
| **Kuro** | Untitled Sans (Klim, kommerziell) | fluid 15 / 20 / 22 / 28 / 39 / 50; Labels 15 px +0,3 px Sperrung | 500 dominant, 400 | 0 (eckig) | #000 / Schwarz 50 % | Beige #d7cbc2, Weiß, Schwarz; Linien Schwarz 10 % | – | Signal-Orange #ff4d00 |
| **Stratos** | Space Grotesk 400 | 14, 16, 13, 12, 24; −0,25 px Sperrung | 400 | Pillen 100 px, Karten 10–20 px | #fff auf #000 / #6e7781, #b5b5b5 | #000, #f5f7fa, #d9d9d9 | Pille #ff5a2f, 14 px, Höhe 42 | Orange #ff5a2f |
| **Linear** | Inter Variable, Berkeley Mono | **13 (64×)**, 12, 15, 14; Überschrift 24 w510 | 400 / 510 / 590 | 8, 6, 4; Pillen | #f7f8f8 / #d0d6e0 / #8a8f98 / #62666d (kühl) | Produkt dunkel #08090a, #0f1011; Linien Weiß 5–8 % | hell auf dunkel | Indigo #6d78d5 (sparsam) |
| **Attio** | Inter + Inter Display (Titel) + JetBrains Mono; Tiempos (Zitate) | 14, 12, 16, 32 | **500 dominant**, 400, 600 | 8, 4, 6, 2,5 | #242629, #101112 / bläuliches Grau | #fff, ~#fafafa, ~#f4f5f7 | #242629 dunkel | Blau #266df0 |
| **Harvey** | eigene Serif (Titel, große Zahlen) + eigene Sans | 14, 16, 28, 20; h1 48 Serif w400 | 500 / 400 | 4, 8 | #0f0e0d / #33312c, #706d66, #8f8b85 (warm) | #fafaf9; Seitenleiste dunkel #0f0e0d | #0f0e0d, weiß | Gelb #f6f202 (nur Werbung) |
| **Ramp** | Lausanne (kommerziell) | 14, 15, 12, 16 | nur 400 | 12, 6, 16, 8 | fast schwarz / schwarz 60 % | #fff, warmes Hellgrau | dunkel; Signal-Gelbgrün | Gelbgrün |

## Was übereinstimmt (Konsens)

| Thema | Konsens | Belegt durch |
|---|---|---|
| Schrift | **Inter** (frei, OFL) ist die gemeinsame Schrift der Werkzeug-Liga; Titel optional in einer Display- oder Serifenschrift | reebuild, Linear, Attio (Inter); Harvey (Serif für Titel und Zahlen) |
| Grundgröße im Werkzeug | **13–14 px**, Tabellen 13 px | Linear 13, reebuild/Attio/Ramp/Harvey 14 |
| Gewichte | 400 Text, **500** Bedienelemente, 600 Titel; kein Fett (700) | alle |
| Sperrung | leicht negativ ab 13 px (−0,5 bis −1 %), Großbuchstaben-Labels positiv | Linear, Attio, Stratos, Kuro |
| Radius | **6 px** Bedienelemente, **8 px** Karten, 4 px kleine Marken | reebuild, Linear, Attio, Harvey |
| Primärknopf | **Tinte (fast schwarz)**, nicht die Markenfarbe | reebuild, Attio, Harvey, Ramp |
| Text | fast schwarz mit leichtem Farbstich, nie #000 | reebuild #000d14, Attio #101112, Harvey #0f0e0d |
| Flächen | App-Grund leicht getönt, Inhalt weiß, Linien statt Schatten | reebuild-Produkt, Attio, Harvey |
| Akzent | **eine** Farbe, sparsam; die Liga trägt keine Verläufe | alle |
| Dunkelmodus | Linear-Werte als Vorlage (Grund #08090a/#0f1011, Linien Weiß 5–8 %) | Linear |

## Besetzte Farben (nicht nehmen)

- Petrol/Dunkelgrün: reebuild (direkter Wettbewerber).
- Orange: Kuro und Stratos.
- Gelbgrün: Ramp.

## Entscheidungen für Gate 1

1. **Referenz-Set:** Leitreferenzen reebuild, Kuro, Stratos; Benchmarks Linear, Attio, Harvey, Ramp, Rossum; Muster ohne Screenshot: BuildPass, Textura, Siteline, Payapps, Trunk Tools, Document Crunch.
2. **Schrift:** (a) Inter + Inter Display (Empfehlung, Konsens), (b) Geist, (c) Inter + Serifenschrift für Titel und Zahlen (Harvey-Muster).
3. **Grundton:** (a) kühl-neutral wie reebuild-Produkt (Empfehlung), (b) warm wie Harvey.
4. **Akzent:** Primärknopf in Tinte (Konsens). Akzentfarbe aus der Marke, also mit dem Website-Team abstimmen. Bis dahin ein neutraler Platzhalter.
