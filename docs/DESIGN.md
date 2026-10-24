# tieout v2: design

**As of:** 24 October 2026, step 1 (Hülle). Written by Claude for Maxi S.
**Rule:** layout, behaviour, sizes and spacing follow Attio (app.attio.com); brand, colours, icons, illustrations and words are tieout's own. The tokens live in `app/src/app/globals.css` (`@theme`); this file explains each value and where it comes from. Light only; a dark theme is not planned before the switch-over.

**Sources:** *measured* means read from the computed styles of app.attio.com in Maxi S.'s workspace (23.10.2026, `../tieout-intern/docs/Plan_Neustart.md` "Gemessene Vorlage", and again on 23.10.2026 at night for this file); *brand* means `brand/README.md` and `website/app/globals.css`; *ours* means decided in this step, with the reason.

## Typeface

Inter (variable, self-hosted from `@fontsource-variable/inter`, no request to Google). Attio sets every piece of UI text in weight 500 and tightens the larger sizes.

| Token | Size / line | Weight | Letter spacing | Used for | Source |
|---|---|---|---|---|---|
| `text-2xs` | 11 / 11 px | 400, upper case | +0.02 em | key caps ("STRG", "K") | measured |
| `text-xs` | 12 / 16 px | 500 | 0 | section headings in the sidebar, secondary lines, hints | measured |
| `text-sm` (body) | 14 / 20 px | 500 | −0.005 em | all UI text | measured |
| `text-base` | 16 / 20 px | 600 | −0.01 em | business name in the sidebar | measured |
| `text-base` | 16 / 20 px | 500 | −0.01 em | search input | measured |
| `text-lg` | 18 / 24 px | 600 | −0.02 em | name on a record page (project, business) | measured |
| `text-xl` | 20 / 24 px | 600 | −0.02 em | greeting on Start, title of an empty state | measured |

## Colours

Ink and ultramarine come from the brand; the greys are Attio's alphas, applied to our ink. Colour carries meaning only (state, the one accent); everything else is ink and grey.

| Token | Value | Used for | Source |
|---|---|---|---|
| `fg` | `#0a1020` | text | brand ink (Attio: `#101112`) |
| `fg-secondary` | ink at 63 % | secondary text, icons, section headings | measured alpha |
| `fg-help` | ink at 55 % | "Hilfe" in the header | measured alpha |
| `fg-muted` | ink at 50 % | hints, key caps, counters | measured alpha |
| `fg-faint` | ink at 30 % | separators in text, open status circles | ours |
| `surface` | `#ffffff` | page, buttons, popups | measured |
| `sidebar` | `#fbfbfb` | sidebar; the open tab | measured |
| `line` | `#eeeff1` | every 1 px line and ring | measured |
| `fill-hover` | black at 4 % | hover and the active sidebar entry | measured |
| `fill-subtle` | black at 2 % | quiet chips | measured |
| `fill-selected` | `#f6f7f7` | highlighted row in the search | measured |
| `count` | `#505155` | numbers in small counters | measured |
| `accent` | `#1d3bff` | primary button, focus ring, the square in pictures | brand ultramarine (Attio: `#266df0`); used sparingly ("less blue") |
| `grid` | `#e8ecf2` | plan grid in empty-state pictures | brand grid minor |

## Sizes and spacing

| Element | Values | Source |
|---|---|---|
| Sidebar | 275 px wide, `#fbfbfb`, 1 px line right | measured |
| Business row | 48 px, chip 20 px + name 16/600, chevron; button "Seitenleiste ausblenden" 28 px at the right | measured |
| Search row | padding 10 12 11; button 28 px, radius 8, padding 4 4 4 6, gap 6, white with `shadow-button`; key caps right | measured |
| Sidebar entry | 28 px, radius 9, padding 0 4 0 8, gap 6, icon 16 px; active and hover `fill-hover`; 1 px between entries; list padding 0 8 | measured |
| Section heading ("Ihre Daten") | 28 px, radius 6, padding 4 4 4 8, chevron 16 px, 12/16 secondary; 12 px above, 4 px to its list | measured |
| Bottom rows | "Erste Schritte" pill 28 px centred; "Mitglieder einladen" and "Beispieldaten" 28 px rows, each with a 1 px line above | measured layout, our rows |
| Header | 48 px, padding 10 12, 1 px line below; title with its 16 px icon left, "Hilfe" right (28 px, radius 8, padding 4 8 4 6) | measured |
| Buttons | 28 px, radius 8, padding 4 8 4 6, gap 6. Secondary: white with `shadow-button`. Primary: `accent`, white text, `shadow-primary`. Large (empty states): 32 px, radius 9, padding 6 10 6 8 | measured |
| Key caps | 20 px high, min 20 px wide, radius 6, padding 0 4, 1 px inner ring | measured |
| Popups (menus, popovers) | radius 12, padding 4, items 32 px with radius 8, `shadow-popup` | measured radius and ring, our shadow |
| Search (Strg K) | 740 px wide, 14 % from the top, radius 12, nothing dimmed behind it; input row 52 px (16 px text, padding 4 16); group heading 12 px with padding 16 6 8; items 36 px, radius 12, padding 6 12 6 6, highlighted `fill-selected`; icon chip 24 px; footer 44 px with a line above, arrows left, primary "Öffnen" right | measured |
| Empty state | column 380 px, centred; picture 215 × 140; 24 px to the text; title 20/24/600 (the name of the page, as Attio's "Notes"); one line 14/20 secondary, 8 px below the title; action 16 px below | measured |
| Section empty state (Start) | title 14 px secondary, one line 12 px muted, 2 px apart, centred | measured ("Meetings" on Home) |
| Record head | object chip 28 px, name 18/24/600, one line of facts below; padding 20 24 16 | measured name, our padding |
| Tabs | 28 px, radius 8, padding 4 8; the open tab on `sidebar` with a 1 px `line` ring | measured |
| Step bar (project page) | from 1024 px three columns 1 : 1 : 1.35 with 16 px gap, below that one step per row; per step: number in a 20 px chip, step name, a line to the next step; run steps as 24 px chips; the step's tabs below | ours, built from the measured chips and tabs |

## Icons and pictures

- **Icons:** Lucide, stroke 2, in `fg-secondary` (the active sidebar entry in `fg`). 16 px in entries, buttons and titles; 18 px for the buttons that open or hide the sidebar, the menu and the search on phones (as Attio's sidebar button, measured); 14 px inside the 24 px chips of the search. No colour chips per object as in Attio's "Records": colour stays reserved for meaning.
- **Empty-state pictures:** Attio's frame (215 × 140, a grid that fades out to the edges) drawn in tieout's own language from the brand: plan grid, a dimension line, the Lucide icon of the page at 32 px with stroke 1.25 on a white card, and the ultramarine square of the logo at its corner. No Attio illustration is copied.
- **Business chip:** 20 px, radius 6, ink with the white initial "K".

## Behaviour

- **Strg K** (⌘ K on a Mac) opens and closes the search everywhere; Escape closes it. The search understands "LV", "AR 3", "RB 11", "AB 12", "EP", "AG", "SR" and shows the full words; lower case counts as an abbreviation only with a number ("rb 11"), so "ab" still finds "Abläufe". Umlauts may be typed or left out (`app/src/lib/search.ts`, with tests).
- **Sidebar sections** fold open and closed like Attio's "Records". The sidebar itself can be hidden with the button next to the business name; the choice is remembered in the browser.
- **Below 768 px** the sidebar becomes a panel from the left that scrolls as a whole, opened with the menu button in the header; the header also gets a search button. Tap targets are at least 44 px there (entries, tabs, buttons, menu and search rows), inputs use 16 px text, and no page scrolls sideways.
- **No button before it works** (SPEZIFIKATION.md 3.3): empty states only offer actions that exist ("Wohnpark Mooshaim öffnen"). "Erste Schritte" lists its three steps marked "folgt" instead of linking to empty pages; the members page says that inviting comes with sign-in. "Ordner importieren", inviting and exports come with the steps that build them.
- **One truth on every screen:** what the sample company already has in the shell (the project, its Auftraggeber, its deadline) appears the same everywhere; Start shows the deadline of Wohnpark Mooshaim as a plain date.
- **Words:** German, full words, vocabulary of SPEZIFIKATION.md section 6. `app/scripts/check-words.mjs` runs after every build and fails on a forbidden word, an abbreviation, a dash used as punctuation, an amount or an open placeholder, in the exported pages (text and read-out attributes) and in every string of `app/src/` (text that only appears after a click).

## Not taken from Attio

Chat panel and "Ask Attio", the AI input on Home, Sequences, Favorites, notifications inbox, share button, the trial row, colour chips per object, dark mode. Each verdict is in SPEZIFIKATION.md 4.2.

## Checking a screen

`npm run screens` in `app/` (with the app served on port 3100) photographs every screen with the locally installed Edge at 1440 × 900, 1024 × 768, 820 × 1180, 390 × 844 and 1912 × 930 (the viewport of the Attio references) into `app/qa-shots/`, and reports console errors and anything wider than its column. `node scripts/compare.mjs` then puts each screen next to its Attio reference (`qa-shots/vergleich/`). Attio reference pictures are taken from Maxi S.'s workspace and never kept in this public repository.
