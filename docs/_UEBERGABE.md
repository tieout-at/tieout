# Handover: step 8, Berichte and the third customer test

**As of:** Sunday, 25 October 2026, after step 7. Written by Claude for Maxi S.
**Folder:** open `C:\Users\maxis\dev\tieout` as the project in Claude Code. Strategy next to it in `../tieout-intern` (read only).
**Precondition:** pull request #113 of step 7 (branch `schritt-7-aufgaben-start`, CI green, preview https://schritt-7-aufgaben-start-app-neu.tieout.workers.dev) is merged with Maxi S.'s go, CI `App`, `Kern` and `Lösungsliste` are green on `main`, and app-neu shows on Start "zusätzlich verrechenbar" 22.632,96 € and "Als Nächstes" F1 Wohnpark Mooshaim prüfen. If it is still open, ask for his go and merge it first (`gh pr merge 113 --merge`, as the earlier steps), then check app-neu online.

## Goal

"Berichte" as Attio's Reports with the figures `kern/` already has (`SPEZIFIKATION.md` 4.2 "Reports" and 4.4 point 6): "zusätzlich verrechenbar" per project, Belegstand per project, unsigned Regieberichte, cuts and deductions without contract item per Auftraggeber, and "nur außerhalb ERP" explained (E15, only here, never on Start). Decide with Maxi S. whether "Belegabdeckung" (candidate B of 4.4) belongs here. Then the third customer test: all three roles play the main project from the folder to the invoice and print the evidence package (`_STATUS.md`, "Customer tests by subagents": all three "genutzt", at least two "würde zahlen"). Check first what the test needs that is not built yet (Beweispaket print view, Änderungsliste, "Ausgaben"), and agree with Maxi S. what goes into step 8 and what the test may skip.

## Read first

1. `CLAUDE.md`, `docs/_STATUS.md`, this file.
2. `docs/DESIGN.md` (tables, record pages, "Tasks and Start (step 7)"), `docs/SPEZIFIKATION.md` 3.3 (outputs), 4.2, 4.3, 4.4, 5.1, 7.2.
3. Customer tests 1 and 2 in `../tieout-intern/docs/kundentests/`.
4. Code: `app/src/lib/kern-data.ts` (builders over the core's result, `startView()` as the newest example), `app/src/lib/live.ts` and `kern-live.ts` (every figure that follows decisions goes through there), `app/src/app/berichte/`.

## Good to know from the design review (end of step 7)

- An independent review (Linear, Attio, Ramp as the bar) kept the ultramarine `#1D3BFF` of the brand but only for the one primary action of a screen, focus, a chosen source and the trace on "Übersicht". Internal links are `link-quiet` (ink, faint underline); a find is named by its number chip. New screens follow `docs/DESIGN.md` "Links" and "Phones": no blue text, no 44 px blocks on phones (32 px with an invisible 44 px tap), text colours at AA contrast (`fg-muted` 58 %, `state-red-edge` for red text).
- Numbers of positions and Belege use `font-mono`, the brand's IBM Plex Mono (self-hosted, `@fontsource/ibm-plex-mono` 5.3.0).
- Left from the review, not done: the greeting "Guten Abend, Kronfeld Haustechnik." greets a company, not a person; change it to the first name with sign-in (step 10). `npm install` reports audit warnings in the app's dependencies; not looked at, check them once before step 12.

## Good to know from step 7

- **Tasks:** `Task` and `TaskCheck` in `lib/decisions.ts` (append only, three keys in the browser), the pure rules in `lib/tasks.ts` (groups by due date, latest tick counts, `targetOf()`), the hook `useTasks()` and `checkTask()` in `lib/use-tasks.ts`. The one modal is `components/aufgaben/task-dialog.tsx`; it appends the task itself, every page hears it through `onStorageChange`.
- **Start:** `startView(b)` in `kern-data.ts`, built with the page and in the browser (`live().startView()`); the test in `kern-live.test.ts` holds the amounts.
- **Screens:** `scripts/screens.mjs` seeds five tasks around the day the pictures are taken (`tasks: true`), screens "aufgaben-gefuellt", "aufgaben-erledigt", "aufgaben-neu", "start-gefuellt", "fundseite-aufgabe", "projekt-funde-board-aufgabe"; `compare.mjs` pairs them with `tasks.jpg` and `home.jpg`. The in-app browser pane often does not draw; the Edge screens and `get_page_text` work.
- **Amount check against `main`:** build `main` and the branch, then compare the euro amounts of every exported page (step 7: 72 pages, only Start differed, by the four new figures from `kern/`).
- **Shell:** no Python on this machine; patch files with the editor tool or `node -`. Do not run Prettier on the app.

## Done when

- Typecheck, lint, tests, build of `app/` and `kern/` green; CI green; `node docs/demo_faelle_check.mjs` green; amounts on every page unchanged against `main` unless Maxi S. gave a go.
- "Berichte" with real figures, screens at 1440 and 390 px next to Attio's Reports shown to Maxi S.; third customer test run and every finding re-measured.
- `_STATUS.md` updated, this file rewritten for step 9 (Abläufe), pull request merged with his go.

## Start prompt for the next chat (copy into a new chat in `C:\Users\maxis\dev\tieout`)

> Ich bin Maxi S. Schritt 8, Berichte und dritter Kundentest. Lies `CLAUDE.md` und `docs/_UEBERGABE.md` und mach Schritt 8: Berichte mit den Zahlen aus `kern/` und danach der dritte Kundentest vom Ordner bis zur Rechnung. Alle Beträge aus `kern/`, kein Betrag ändert sich ohne mein Go. Sag mir vor jedem Teil in zwei Sätzen, was passiert, zeig mir die Screens neben Attio und hol dir mein Go vor dem Push und vor dem Merge. Deutsch, einfach, Ergebnis zuerst.
