# Handover: step 8a, calmer screens

**As of:** Monday, 26 October 2026, after step 8. Written by Claude for Maxi S.
**Folder:** open `C:\Users\maxis\dev\tieout` as the project in Claude Code. Strategy next to it in `../tieout-intern` (read only).
**Branch:** `schritt-8a-ruhige-seiten` already exists locally with the plan update for step 8c (one commit, not pushed); continue on it.
**Precondition:** the pull request of `schritt-8-berichte-schlussrechnung` is merged, CI `App`, `Kern` and `Lösungsliste` are green on `main`, and app-neu shows "Berichte" as three tabs and the tab "Schlussrechnung" of Wohnpark Mooshaim with "Kann die Rechnung raus? 0 von 8 entschieden". If not, ask Maxi S. first.

## Goal

Step 8 found the screens crammed and fixed two of them (Berichte, Schlussrechnung) after a design round. Step 8a brings the same design language to every other page. It was decided with Maxi S. on 26.10.2026 to do this as its own step before 8b (Zeitstrahl, Positionen, WhatsApp-Meldungen, E-Mails). Right after 8b comes 8c, the switch-over of the jury link app.tieout.workers.dev to the new app (moved forward from step 12, see `_STATUS.md`): keep that in mind, every screen of 8a is what the jury will see.

**The design language (DESIGN.md, step 8):** one question per surface, one big figure with its reference, one statement written from the core's figures; part of a whole as one thin bar; the rule behind a figure behind an info icon (`components/ui/info-tip.tsx`); progress as "x von y"; long lists folded; a state named only when it is an exception; amounts only from `kern/`.

## What the review of 26.10.2026 found (re-measured by the main chat)

Independent design and text reviews of every page not rebuilt in step 8 (screens at 1440 and 390 px). Scores are overview / calm, 1 to 10.

| Page | Score | Main finding |
|---|---|---|
| Projekt Überblick | 4 / 4 | six equally loud cards, the deadline three times, 17 contract fields; the money does not win |
| Belege | 2 / 4 | "maschinell gelesen" on 102 of 124 rows, column Art repeats the name, column Funde far right |
| Projekt Belege | 3 / 4 | 835 words, same table problems |
| Übersicht | 4 / 3 | 286 cells and lines; no entry for the eye (a page Maxi S. chose after two design rounds: show drafts first) |
| Funde | 5 / 6 | "Gefunden" 14 times, titles cut, column Kürzungsrisiko at the right edge |
| Funde, board | 4 / 6 | all 14 finds in the first column |
| Auftraggeber Hornfeld Bau | 5 / 5 | "Gleicher Grund", the strongest statement, comes second and repeats itself |
| Fund F1 | 6 / 5 | the Kürzungsrisiko twice (card and section), 6.648,60 € three times, "6 Belege, 1 WhatsApp-Meldung" against "Belege 7" |
| Aufgaben, Betrieb | empty | although there are gaps with an Abhilfe and five Verträge |
| Start, Projekte, Vertrag, Schlussrechnungen | 6 to 9 | fine |

Fix once, in the shared components: project head in one row of tabs grouped by step, without the empty "offen" chips of the run steps; at most three highlight cards, one big; tables hide a column whose value is the same in every row and mark only exceptions; Verlauf summarised and folded ("5 Korrekturen am 19.10. durch Abrechnung"); finds named with their project where several projects show. Words a craftsman stumbles over: "Ausgaben" (reads as costs), "Prüfstand", "EXIF", "Kopf" (of an e-mail), "Kopie" (use "doppelt"), "Preisbasis", "nie erfasst". Phone: tables "Projekte", "Belege" and the Auftraggeber page cut names to a few letters.

## Read first

1. `CLAUDE.md`, `docs/_STATUS.md`, this file.
2. `docs/DESIGN.md`, section "Berichte, Schlussrechnung and Beweispaket (step 8)", and the record pages, tables and find page sections.
3. The rebuilt code as the example: `app/src/app/berichte/report-cards.tsx`, `app/src/components/schlussrechnung/invoice-view.tsx`, `app/src/lib/reports.ts` (`says`).

## Good to know

- **Working method of step 8 that Maxi S. liked:** say in two sentences what happens, let independent subagents review (layout and text separately), measure every finding yourself, for a page with real design choices build three drafts with the core's figures (a data pack as JSON, standalone HTML, screenshots at 1165 and 390 px), let an independent judge score them, show the options side by side as a board, build what Maxi S. chooses.
- **Checks:** `npm run check` in `app/` and `kern/`, `node docs/demo_faelle_check.mjs`; compare the euro amounts of every exported page with `main` (build both, compare); every amount on a changed page must be one of the core's.
- **Screens:** `npm run screens` (app served on 3103 by the launch configuration `app-build`, or the dev server on 3100); restart the dev server after building another branch in the same folder.
- **Open from step 8 for Maxi S.:** should the release dialog say that a find "Beleg fehlt" stays out of the Änderungsliste? Keep "Zusammen, mit in Klärung" on the Schlussbesprechungs-Blatt? A "realistic" payment expectation next to the Restforderung would need a figure `kern/` does not have.

## Done when

- Every page above scores at least 7 / 7 in a second independent review; word counts lower without losing a fact; no amount changed against `main`; checks and CI green; screens at 1440 and 390 px shown to Maxi S.
- `_STATUS.md` updated, this file rewritten for step 8b (with 8c, the switch-over, as the step after it), pull request merged with his go.

## Start prompt for the next chat (copy into a new chat in `C:\Users\maxis\dev\tieout`)

> Ich bin Maxi S. Schritt 8a, ruhige Seiten. Lies `CLAUDE.md` und `docs/_UEBERGABE.md` und mach Schritt 8a: die Designsprache aus Schritt 8 auf alle übrigen Seiten, zuerst die gemeinsamen Bausteine, für die Übersicht erst Entwürfe. Kein Betrag ändert sich ohne mein Go. Sag mir vor jedem Teil in zwei Sätzen, was passiert, zeig mir die Screens neben Attio und hol dir mein Go vor dem Push und vor dem Merge. Deutsch, einfach, Ergebnis zuerst.
