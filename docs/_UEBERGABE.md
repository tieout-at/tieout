# Handover: step 6, Board und Listen

**As of:** Saturday, 24 October 2026, late night, after step 5. Written by Claude for Maxi S.
**Folder:** open `C:\Users\maxis\dev\tieout` as the project in Claude Code. Strategy next to it in `../tieout-intern` (read only).
**Precondition:** the pull request of step 5 (branch `schritt-5-funde`) is pushed and merged with Maxi S.'s go, CI `App` and `Kern` are green on `main`, and app-neu shows the find pages (`/funde/wohnpark-mooshaim-f1/`). If it is still open, push and merge it first with his go.

## Goal

The finds as a board and the lists that make them workable (`SPEZIFIKATION.md` 4.2, "Deals kanban" and "Lists"): "Funde" as a board by "Entscheidung" (Gefunden, Geprüft, Freigegeben, In der Schlussrechnung; "Nicht verrechnen" apart), a card per find with its amount, Belegstand and Kürzungsrisiko, opening the find page; the board for Wohnpark Mooshaim; and the finding list made readable at phone width (customer test 2).

## Read first

1. `CLAUDE.md`, `docs/_STATUS.md`, this file.
2. `docs/DESIGN.md`, sections "Table", "Record pages", "Find page (step 5)".
3. `docs/SPEZIFIKATION.md` 3.2 (Entscheidung), 4.2 (Deals kanban, table checkboxes: never a bulk release), 5 (who checks, who releases).
4. Customer test 2: `../tieout-intern/docs/kundentests/2026-10-24_kundentest-2_fund-f1.md` (the open points of the find list).
5. Code of step 5: `app/src/lib/finds.ts`, `app/src/lib/decisions.ts`, `app/src/components/fund/`, `app/src/app/funde/finds-table.tsx`.

## What to build

1. **Board** `Funde` (view switcher next to "Alle Funde", Attio's "Pipeline"): columns by Entscheidung, the decision from the browser (`lib/decisions.ts`) over the core's "Gefunden"; column heads with count and the fixed sum `kern/` gives (none where the browser changed a decision: "keine feste Summe"). Moving a card is a decision: it opens the same confirmation as the decision bar, one find at a time, never in bulk. Reference: Attio's "Deals" board (`qa-shots/attio/deals.jpg`, only the empty board; take a filled one from Maxi S.'s workspace).
2. **Project board** for Wohnpark Mooshaim (project tab "Funde", view switcher).
3. **Phone width:** the finding list and the board readable at 390 px (customer test 2: the first column showed four letters); at least the number, a short name with the word that matters ("Heizkörper") and the amount.
4. **Lists** only if they carry a real use in stage 0 (SPEZIFIKATION.md 4.2 says "later"); decide with Maxi S.

## Good to know from step 5

- **Find page:** `/funde/<projekt>-f1/`, built for all 14 finds from `findRecord()`; the name of a plan find is what changed ("14 Wohnungen Typ C: Wohnküche geteilt, je 1 Heizkörper mehr"), others the title up to the first colon. `findSearchEntries()` feeds Strg K.
- **Decisions and tasks:** append only in `localStorage` (`tieout.entscheidungen.v1`, `tieout.aufgaben.v1`), shape of the core's `Entscheidung` with the business key (`p1/plan:H-201:D`). The list "Funde" and the page "Aufgaben" read them after the first paint. The sums of `kern/` do not count a browser decision; that needs the backend (step 10) or the core in the browser.
- **Originals:** `lib/originals.ts` draws a page from `kern/` `gelesen()`; `markOf()` finds the marked part; a page lists a value outside its layout only where a source points. Every source of every find has a visible mark (test).
- **Open from customer test 2:** a reason per correction of a field (proposal for `kern/`, step 10). Maxi S. asked to keep pages simple: each fact once, details folded or left out (24.10.2026).
- **Screens:** `npm run build`, start `.claude/launch.json` "app-build" (since step 5 `app/scripts/serve-out.mjs` on port 3103; `serve` died under load with EMFILE; a rebuild needs no restart), `node scripts/screens.mjs http://localhost:3103 qa-shots [name-prefix]`, `node scripts/compare.mjs`. Attio reference of the side panel: `qa-shots/attio/record-panel.jpg` (local only).
- **Customer tests:** fresh agents need only the README, the address and Playwright with Edge (`file:///C:/Users/maxis/dev/tieout/app/node_modules/playwright-core/index.mjs`, `channel: "msedge"`, a persistent profile so that decisions survive between scripts).
- **Word check:** "Zeile" also fails inside a string in `app/src` (use a regular expression for place names); write patch scripts with the editor tool, shell heredocs break on apostrophes.

## Done when

- Typecheck, lint, tests, build of `app/` and `kern/` green; CI green; `node docs/demo_faelle_check.mjs` green.
- Board for Wohnpark Mooshaim played through (a find moved with its confirmation, the decision visible on the find page and in the list); screens at 1440 and 390 px next to Attio shown to Maxi S.
- `_STATUS.md` updated, this file rewritten for step 7 (Aufgaben, Notizen, Start), pull request merged with his go.

## Start prompt for the next chat (copy into a new chat in `C:\Users\maxis\dev\tieout`)

> Ich bin Maxi S. Schritt 6, Board und Listen. Lies `CLAUDE.md` und `docs/_UEBERGABE.md` und mach Schritt 6: die Funde als Board nach Entscheidung, das Board für Wohnpark Mooshaim und die Fundliste am Handy lesbar. Alle Beträge aus `kern/`, kein Betrag ändert sich ohne mein Go. Sag mir vor jedem Teil in zwei Sätzen, was passiert, zeig mir die Screens neben Attio und hol dir mein Go vor dem Push und vor dem Merge. Deutsch, einfach, Ergebnis zuerst.
