# Handover: step 8b, Ihre Daten und Zwilling vollständig

**As of:** Monday, 26 October 2026, after step 8a. Written by Claude for Maxi S.
**Folder:** open `C:\Users\maxis\dev\tieout` as the project in Claude Code. Strategy next to it in `../tieout-intern` (read only).
**Precondition:** the pull requests of `schritt-8a-ruhige-seiten` (#115) and `schritt-8a-nacharbeit` are merged, CI `App`, `Kern` and `Lösungsliste` are green on `main`, and app-neu shows the project Wohnpark Mooshaim with one row of tabs and three figures led by 14.620,15 €, and "Übersicht" with "Was bringt der Abgleich?". If not, ask Maxi S. first. Create the branch `schritt-8b-daten-zwilling` from `main`.

## Goal

Build the pages v1 has and v2 still lacks, so that the switch-over (step 8c, right after this step) shows no page worse than v1: the project tabs "Zeitstrahl" and "Positionen", the pages "WhatsApp-Meldungen" and "E-Mails", and the Belegabdeckung with the positions (which Beleg proves which position; `kern/` does not hold it yet, see `_STATUS.md`, open points). Every screen in the design language of steps 8 and 8a, since the jury will see it.

## Read first

1. `CLAUDE.md`, `docs/_STATUS.md`, this file.
2. `docs/DESIGN.md`: "Berichte, Schlussrechnung and Beweispaket (step 8)", "Calmer pages (step 8a)" and the new "Übersicht".
3. `docs/SPEZIFIKATION.md`: the tabs Zeitstrahl and Positionen (4.1 to 4.4), the vocabulary (section 6).
4. The v1 pages as the content to beat: tag `v1-archiv`, live at https://app.tieout.workers.dev (Positionen, Zeitachse, WhatsApp).

## Good to know

- **The shared parts of 8a to use:** `Highlights` (at most three figures, the first big, `part` for the thin bar, `info` for the rule), `MiniTable` (phone blocks, `phoneTop`), `DataTable` (hides a column that is the same in every row, `phoneRow` for a list on phones), `Activity` (groups by kind, day and role), `InfoTip`, `StepBar`. A state is named only when it is an exception; a zero is "nichts"; an amount never breaks before its euro sign.
- **Working method that Maxi S. liked (steps 8 and 8a):** two sentences before each part; for a page with real design choices three drafts with the core's figures (data pack from `kern/` as JSON, standalone HTML with the images embedded in the board, screenshots at 1165 and 390 px), an independent judge, a board side by side, build what Maxi S. chooses; an independent reviewer scores every page (overview / calm, 1 to 10, at 1440 and 390 px) until each is at least 7; every finding re-measured, findings that break a product rule are named and not taken.
- **Amount audit across pages:** build `main` and the branch in folders of their own (a copy with `node_modules` as a junction, `turbopack.root` set to a common parent folder) and compare the amounts of every exported page; every amount on a page must be the core's. The script of 8a was in the session's scratchpad; write it again, about 20 lines.
- **Screens:** `npm run screens` (dev server on 3100); `node scripts/compare.mjs <dir>` with the Attio pictures copied into `<dir>/attio` (they stay local).
- **Open from 8a for Maxi S.:** keep the yellow dot for the project status "offen" (yellow means "Beleg fehlt" elsewhere)? Open from step 8: keep "Zusammen, mit in Klärung" on the Schlussbesprechungs-Blatt; a "realistic" payment expectation next to the Restforderung would need a figure `kern/` does not have.

## Done when

- Zeitstrahl and Positionen of Wohnpark Mooshaim, WhatsApp-Meldungen and E-Mails built from `kern/`, Belegabdeckung with the positions (with tests in `kern/`); every new page at least 7 / 7 in an independent review; no amount changed against `main`; checks and CI green; screens at 1440 and 390 px shown to Maxi S. next to Attio and v1.
- `_STATUS.md` updated, this file rewritten for step 8c (the switch-over), pull request merged with his go.

## Start prompt for the next chat (copy into a new chat in `C:\Users\maxis\dev\tieout`)

> Ich bin Maxi S. Schritt 8b, Ihre Daten und Zwilling vollständig. Lies `CLAUDE.md` und `docs/_UEBERGABE.md` und mach Schritt 8b: Zeitstrahl, Positionen, WhatsApp-Meldungen, E-Mails und die Belegabdeckung, in der Designsprache aus 8 und 8a. Kein Betrag ändert sich ohne mein Go. Sag mir vor jedem Teil in zwei Sätzen, was passiert, zeig mir die Screens neben Attio und v1 und hol dir mein Go vor dem Push und vor dem Merge. Deutsch, einfach, Ergebnis zuerst.
