# Handover: step 4, Datensätze

**As of:** Saturday, 24 October 2026, evening, after step 3. Written by Claude for Maxi S.
**Folder:** open `C:\Users\maxis\dev\tieout` as the project in Claude Code. Strategy next to it in `../tieout-intern` (read only).
**Precondition:** the pull request of step 3 (#105, branch `schritt-3-tabellen`) is merged with Maxi S.'s go, CI `App` and `Kern` are green on `main`, and app-neu shows the tables. If it is still open, merge it first with his go.

## Goal

The record pages in Attio's layout: project (Wohnpark Mooshaim first) and Auftraggeber (Hornfeld Bau) with attributes on the left, highlights, tabs, activity and history, every amount from `kern/`. Plus the two lists step 3 left: "Belege" and "Auftraggeber" as tables with the same table component. Decide with Maxi S. the draft "making the twin visible" (`SPEZIFIKATION.md` 4.4).

## Read first

1. `CLAUDE.md`, `docs/_STATUS.md`, this file.
2. `docs/DESIGN.md` (record head, tabs, tables) and `../tieout-intern/docs/Plan_Neustart.md` "Gemessene Vorlage" (record page: left column 374 px, attribute rows 40 px, highlights as a 3-column card grid, activity with "View all").
3. `docs/SPEZIFIKATION.md` 2.2 (Auftraggeber, Vertrag, Projekt), 4.1 (project page and tabs), 4.2 (record page rows), 4.4 (draft to decide), 7.2 (which screen shows which amount: project page, Auftraggeber Hornfeld Bau).
4. `app/README.md` and `kern/README.md`.

## What to build

1. **Decide 4.4 with Maxi S.** before building: the recommendation is candidate A ("Zwilling-Übersicht" with real counts, every box a link) in this step, candidate B later. Show it as a picture with real data, not as a list.
2. **Project page Wohnpark Mooshaim:** attributes from `kern/` (Auftraggeber, Vertrag with contract sum and "Schlussrechnung legen bis", stage, status colour), highlights "zusätzlich verrechenbar" 14.620,15 € with "davon mit Kürzungsrisiko" 6.843,00 €, "in Klärung" 8.073,59 € (1.119,99 € and 6.953,60 €), Vorprüfung 8.619,00 €. The tab "Funde" can reuse the find table filtered to the project. Activity and Verlauf from the decisions list and the fields' Verlauf; `zumStichtag` replays a day.
3. **Auftraggeber page Hornfeld Bau:** history from `historie` (Wohnhof Erlenhain: "Aufmaß nicht gegengezeichnet" 2.575,20 €, Bauschadensumlage 3.305,55 €), "gleicher Grund" notes, projects as a small table.
4. **Tables "Auftraggeber" and "Belege"** with `DataTable` (`app/src/components/table/data-table.tsx`): rows from `business().historie` and `ergebnisse[p].ordner` in `app/src/lib/kern-data.ts`; footer sums only if `kern/` delivers them.
5. Screens at 1440 px and 390 px next to Attio's record page (`qa-shots/attio/record.jpg`; take a filled one from Maxi S.'s Attio with Claude in Chrome if needed, local only).

## Good to know from step 3

- **Data flow:** pages are server components; they call `projectRows()`, `findRows()` and the `…Calculations()` of `app/src/lib/kern-data.ts`, which run `pruefeFirma(beispielFirma())` once per build. Client components import only types from there, so the core stays out of the browser. `app/src/lib/example.ts` keeps names only; `kern-data.test.ts` checks them against `kern/`.
- **Table:** `DataTable` takes rows (`id`, `groups`), columns (cell, sort value, filter value, fixed calculations) and views. A footer sum is a `Calculation` with one `Sum` per scope (all, per project); `footerSum` shows it only when the visible rows of its group are exactly its ids. Never compute a sum in the app.
- **Word check:** amounts are forbidden in `app/src` (strings and JSX) but allowed in built pages. Column ids and string keys are checked too ("evidence" failed); use German keys where an English word is on the list.
- **Measured Attio table** ("Companies", 24.10.2026): bars 48 px, header 40 px, rows 36 px, first column 250 px fixed, checkbox 16 px radius 6, footer 36 px with counter right in the first column. Details in `docs/DESIGN.md`.
- **Screens:** `npm run build`, then serve `out/` on a port (`.claude/launch.json` "app-build", port 3101; the server stops when `out/` is rebuilt, start it again) and run `node scripts/screens.mjs http://localhost:3101 qa-shots` and `node scripts/compare.mjs`.
- **Decided by Claude in step 3, to be confirmed by Maxi S.:** status words "Frist nah, offen", "offen", "nichts offen", "abgeschlossen"; pages for all five projects (empty tabs for now).
- **Windows:** no Python; Node for scripts. Heredocs break on apostrophes ("Attio's"); write files with the editor tool.

## Done when

- Typecheck, lint, tests, build of `app/` and `kern/` green; CI green; `node docs/demo_faelle_check.mjs` green.
- Project and Auftraggeber pages show the amounts of `SPEZIFIKATION.md` 7.2 from `kern/`; screens at 1440 and 390 px next to Attio shown to Maxi S.
- `_STATUS.md` updated, this file rewritten for step 5 (Funde), pull request merged with his go.

## Start prompt for the next chat (copy into a new chat in `C:\Users\maxis\dev\tieout`)

> Ich bin Maxi S. Schritt 4, Datensätze. Lies `CLAUDE.md` und `docs/_UEBERGABE.md` und mach Schritt 4: zuerst mit mir den Entwurf „Zwilling sichtbar machen“ entscheiden, dann die Seiten für Projekt und Auftraggeber im Attio-Layout und die Tabellen „Belege“ und „Auftraggeber“, alles mit Beträgen aus `kern/`. Kein Betrag ändert sich ohne mein Go. Sag mir vor jedem Teil in zwei Sätzen, was passiert, zeig mir die Screens neben Attio und hol dir mein Go vor dem Push und vor dem Merge. Deutsch, einfach, Ergebnis zuerst.
