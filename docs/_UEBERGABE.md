# Handover: step 7, Aufgaben, Notizen, Start

**As of:** Sunday, 25 October 2026, after steps 6 and 6b. Written by Claude for Maxi S.
**Folder:** open `C:\Users\maxis\dev\tieout` as the project in Claude Code. Strategy next to it in `../tieout-intern` (read only).
**Precondition:** step 6 is merged (#111). The pull request of step 6b (branch `schritt-6b-kern-im-browser`) is pushed and merged with Maxi S.'s go, CI `App`, `Kern` and `Lösungsliste` are green on `main`, and app-neu shows, after F1 is set to "Nicht verrechnen" on its find page, 7.971,55 € on the project Wohnpark Mooshaim and on the project board. If it is still open, push and merge it first with his go.

## Goal

Tasks that close the gaps, and a start page that says what to do next (`SPEZIFIKATION.md` 4.2: "Tasks, Create task modal", "Home", "Home: meetings", "Notes"): "Aufgaben" as Attio's Tasks (open and done, due date, find, person in charge, filter by role), the "Aufgabe anlegen" modal also from the page "Aufgaben" and from a card on the board, ticking off a task (append only), and "Start" with the money, the next deadline and "Als Nächstes" with a jump to the first open find. Notes only if they carry a real use in stage 0 (the specification says "later, not in the sidebar until used"); decide with Maxi S.

## Read first

1. `CLAUDE.md`, `docs/_STATUS.md`, this file.
2. `docs/DESIGN.md`, sections "Board and phone list (step 6)", "Find page (step 5)", "Behaviour".
3. `docs/SPEZIFIKATION.md` 4.2 (Tasks, Home, Notes), 5.1 (who confirms what; "Bitte bestätigen" for the Bauleitung on the phone), 6 (words).
4. Customer test 2: `../tieout-intern/docs/kundentests/2026-10-24_kundentest-2_fund-f1.md` (finding a task again, ticking off and filtering tasks).
5. Code: `app/src/lib/decisions.ts` (decisions and tasks, append only in the browser), `app/src/app/aufgaben/`, `app/src/app/start-client.tsx`, `app/src/components/fund/decision-bar.tsx`, `app/src/app/funde/finds-board.tsx`.

## Good to know from step 6b

- **Core in the browser:** `useLive()` (`app/src/lib/live.ts`) returns null while this browser holds no decision (then the built props hold) and otherwise the core's result over the decisions (`kern-live.ts`: `findRows()`, `findCalculations()`, `projectRows()`, `projectCalculations()`, `projectHighlights(id)`, `findHighlights(slug)`, `twinView(slug)`). Start's money and "Als Nächstes" (step 7) should come from there too, with a new builder in `kern-data.ts` that takes the core's result, so the built page and the browser use one code path. `appendDecision` and `appendTask` tell the page itself (`onStorageChange` hears them), so a new task can update Start and the find page at once.
- **Sums by decision:** `jeEntscheidung` in `kern/` per project and for the business; `findCalculations()` adds them after the totals.
- **Screens:** the last six screens of `scripts/screens.mjs` ("entschieden-…") seed four decisions into the browser first.

## Good to know from step 6

- **Board:** a view of kind `"board"` in `DataTable` (`lib/table.ts` `View.kind`), drawn by `FindsBoard`; the rules of a move are `moves()` and `refusal()` in `lib/decisions.ts`, the confirmation is shared with the decision bar (`components/fund/decision-confirm.tsx`). Sums under a column: `columnSums()`; where `kern/` has no sum for exactly these finds the label says "nicht gerechnet" (Maxi S., 25.10.2026: no sums of the app). Empty "In der Schlussrechnung" and "Nicht verrechnen" fold to a strip; on phones the board is a list grouped by Entscheidung (`PhoneRow` in `finds-board.tsx`).
- **Phone list:** `DataTable` takes `phoneRow`; below 768 px the rows become a list with the counter and the fixed sums at the bottom. Other tables (Projekte, Belege, Auftraggeber) still use the wide grid on phones; give them a `phoneRow` when a test shows the need.
- **Sums of the find tables:** `findCalculations()` always works over every find; passing the rows of one project made the business sum match them (bug fixed in step 6).
- **Screens:** `npm run build`, start `.claude/launch.json` "app-build" (port 3103), `node scripts/screens.mjs http://localhost:3103 qa-shots [name-prefix]` (the board screens come last, because the browser then remembers the board), `node scripts/compare.mjs`. Attio references in `app/qa-shots/attio/` (local only); `deals-board.jpg` was taken at a window of 844 × 818, so put it next to a tieout picture of the same size rather than the 1912 one. Take the Tasks reference from `tasks.jpg`.
- **Attio workspace:** creating records works through the claude-in-chrome `form_input` tool (typing into Attio's fields does not register). Two sample deals are still there; Maxi S. deletes them.
- **Shell:** no Python on this machine; patch files with the editor tool or `node -`. Do not run Prettier on the app, the project does not use it.

## Done when

- Typecheck, lint, tests, build of `app/` and `kern/` green; CI green; `node docs/demo_faelle_check.mjs` green; without decisions the built pages show the same amounts as before (compare the HTML with `main`, as in step 6b).
- A task made on F1, found on "Aufgaben", ticked off, visible in the Verlauf of F1; Start shows the next step; screens at 1440 and 390 px next to Attio shown to Maxi S.
- `_STATUS.md` updated, this file rewritten for step 8 (Berichte and the third customer test), pull request merged with his go.

## Start prompt for the next chat (copy into a new chat in `C:\Users\maxis\dev\tieout`)

> Ich bin Maxi S. Schritt 7, Aufgaben, Notizen, Start. Lies `CLAUDE.md` und `docs/_UEBERGABE.md` und mach Schritt 7: Aufgaben anlegen, finden und abhaken, und Start mit dem nächsten Schritt. Alle Beträge aus `kern/`, kein Betrag ändert sich ohne mein Go. Sag mir vor jedem Teil in zwei Sätzen, was passiert, zeig mir die Screens neben Attio und hol dir mein Go vor dem Push und vor dem Merge. Deutsch, einfach, Ergebnis zuerst.
