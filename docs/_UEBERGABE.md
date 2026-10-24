# Handover: step 5, Funde

**As of:** Saturday, 24 October 2026, night, after step 4. Written by Claude for Maxi S.
**Folder:** open `C:\Users\maxis\dev\tieout` as the project in Claude Code. Strategy next to it in `../tieout-intern` (read only).
**Precondition:** the pull request of step 4 (branch `schritt-4-datensaetze`) is pushed and merged with Maxi S.'s go, CI `App` and `Kern` are green on `main`, and app-neu shows "Übersicht", the record pages and the new tables. If it is still open, push and merge it first with his go.

## Goal

The find page: one finding (F1, the radiator find, first) with its Rechenweg step by step, its Belege with the original on the right (Attio's chat panel becomes the original viewer, `SPEZIFIKATION.md` 4.2), the decision bar ("Prüfen", "Nicht verrechnen", "Aufgabe anlegen"), Kürzungsrisiko and Verlauf; then the second customer test (three roles find the radiator find, explain the amount, name the gap, decide, each in under three minutes).

## Read first

1. `CLAUDE.md`, `docs/_STATUS.md`, this file.
2. `docs/DESIGN.md`, sections "Record pages (step 4)" and "Übersicht" (both are the patterns this step builds on).
3. `docs/SPEZIFIKATION.md` 3.1, 3.2 (Fund), 4.2 (record page, chat panel becomes the original), 4.3 ("Rechenweg", "Beweispaket"), 7.2 (Fund F1: 4 positions, 6.648,60 €; K7 check 1,10 h × 58,60 € = 64,46 € + 221,94 € = 286,40 €), 7.3 (click path 1:10).
4. `app/README.md`, `kern/README.md`; the code of step 4: `app/src/lib/records.ts`, `app/src/lib/twin.ts`, `app/src/components/record/`, `app/src/components/zwilling/`.

## What to build

1. **Find page** `/funde/[fund]/` (and from the project tab "Funde"): record head with number, title, amount; highlights "Betrag", "Belegstand", "Kürzungsrisiko", "Entscheidung" (4.2); the Rechenweg from `Fund.rechenweg` (every step with its sources); the Belege from `Fund.nachweise`; Verlauf. Every amount from `kern/`.
2. **Original viewer** on the right: the Beleg with the marked place (`Quelle.seite`, `stelle`, `bbox`). The sample data have no PDFs: decide with Maxi S. how the synthetic originals look (generated pages with the marked line are honest; a picture of a real document is not allowed).
3. **Decision bar**: decisions are append only (`Entscheidung` in `kern/`); in stage 0 they live in the browser only, marked as such, until the backend (step 10).
4. **Links in**: every finding row of "Funde", of the project tab and of "Übersicht" (the trace already shows the Belege) leads to its find page; the Übersicht's card of a Beleg could open the original viewer.
5. **Customer test 2** with three fresh agents (Abrechnerin, Geschäftsführer, Bauleiter), as in `_STATUS.md` "Customer tests by subagents".

## Good to know from step 4

- **Data flow:** server pages call `projectRecord()`, `clientRecord()` (`lib/records.ts`), `twinView()` (`lib/twin.ts`), `belegRows()`, `clientRows()` (`lib/kern-data.ts`); client components import only types. `kern/src/belege.ts` gives the Belege list (title, group, review state, copies, finds) and every correction (`korrekturen`).
- **Übersicht:** `components/zwilling/` has pure layout functions with tests (`layout.test.ts`, fixtures real, small, large, long, empty), one config object (`config.ts`), imperative SVG only in `use-trace-lines.ts`. A Beleg proves money, it does not contain it: evidence lines have equal weight. The own Entwurf shows what was invoiced and is never counted as proof. Open, low: about 68 words at rest, the trace readout below the fold at 1024 × 768, entrance about 1 s before the money shows.
- **Not yet in `kern/`:** which positions a single Beleg proves (the lines run over the positions of its finding); a short name per finding (`twin.ts` derives it from the title).
- **To decide with Maxi S.:** the status word "Frist nah, offen" in headers (step 3 rule) or the plain date only (domain reviewer).
- **Screens:** `npm run build`, serve `out/` on port 3101 (`.claude/launch.json` "app-build"; it stops when `out/` is rebuilt), `node scripts/screens.mjs http://localhost:3101 qa-shots`, `node scripts/compare.mjs`. The Übersicht's entrance takes about 2 s: wait before a screenshot.
- **Word check:** "Zeile", "Dokument" (except "Dokumente"), "verbunden" and amounts in `app/src` strings fail the build.
- **Windows:** no Python; Node for scripts. Shell heredocs break on apostrophes; write files with the editor tool.

## Done when

- Typecheck, lint, tests, build of `app/` and `kern/` green; CI green; `node docs/demo_faelle_check.mjs` green.
- F1 played through: Rechenweg 6.648,60 € with every source, original on the right, decision recorded; screens at 1440 and 390 px next to Attio shown to Maxi S.; customer test 2 passed.
- `_STATUS.md` updated, this file rewritten for step 6 (Board und Listen), pull request merged with his go.

## Start prompt for the next chat (copy into a new chat in `C:\Users\maxis\dev\tieout`)

> Ich bin Maxi S. Schritt 5, Funde. Lies `CLAUDE.md` und `docs/_UEBERGABE.md` und mach Schritt 5: die Fundseite mit Rechenweg, Belegen und dem Original rechts, die Entscheidung und den Verlauf, zuerst für den Heizkörper-Fund F1, danach Kundentest 2. Alle Beträge aus `kern/`, kein Betrag ändert sich ohne mein Go. Sag mir vor jedem Teil in zwei Sätzen, was passiert, zeig mir die Screens neben Attio und hol dir mein Go vor dem Push und vor dem Merge. Deutsch, einfach, Ergebnis zuerst.
