# Handover: step 2, Kern

**As of:** Saturday, 24 October 2026, morning, after step 1. Written by Claude for Maxi S.
**Folder:** open `C:\Users\maxis\dev\tieout` as the project in Claude Code. Strategy next to it in `../tieout-intern` (read only).
**Precondition:** pull request #103 (step 1, Hülle) is merged with Maxi S.'s go, and https://app-neu.tieout.workers.dev shows the shell built from `main`. If #103 is still open, merge it first with his go.

## Goal

The calculation core in `kern/`: data model and rules of SPEZIFIKATION.md, tested to the cent against solution list v3 (`docs/Demo_Faelle.md`). No new screens in this step; the app keeps its empty states until step 3 (Tabellen) reads from `kern/`. No amount changes without a go from Maxi S.

## Read first

1. `CLAUDE.md`, `docs/_STATUS.md` (section "Amounts that must not change"), this file.
2. `docs/SPEZIFIKATION.md`: sections 2 (objects, Ebene 1 and 2), 3 (Ergebnis, Fund, Rechnungsabschluss), 5.1 (run steps), 8 (port, rewrite or drop, with the order).
3. `docs/Demo_Faelle.md` v3; `node docs/demo_faelle_check.mjs` recomputes it.
4. The v1 core under the tag `v1-archiv`: `product/app/src/engine` (15 files, 7 test files), `product/app/src/domain/typen.ts`, `product/app/src/demo` (read with `git show v1-archiv:<path>`).

## What to build

1. **`kern/` as its own TypeScript package** with Vitest, typecheck and lint, and a CI workflow `Kern` per pull request. Decide at the start how `app/` will import it in step 3 (path alias with transpiling, or an npm workspace) and write the decision down.
2. **Port in the order of section 8**, each part with its tests before the next: money (`geld.ts`, unchanged), data model (rewrite: Beleg, Position, Fund, WhatsApp-Meldung, Verlauf; every field with source, review state and history), rules, position table, Vorprüfung, Rechnungsabschluss, business level.
3. **Sample data:** the synthetic company Kronfeld Haustechnik with the five projects of solution list v3 as input data of `kern/` (port the mechanics of the v1 demo generator, rewrite the data).
4. **Tests take their expected values from `Demo_Faelle.md`**, never from the check script. Every amount listed in `_STATUS.md` under "Amounts that must not change" must come out of `kern/` to the cent.

## Done when

- Typecheck, lint and tests of `kern/` green; CI green on the pull request; `node docs/demo_faelle_check.mjs` green.
- Every listed amount recomputed by `kern/`; no amount changed, or changed with a go from Maxi S.
- `_STATUS.md` updated, this file rewritten for step 3 (Tabellen), pull request merged with his go.

## Already known for step 2

- New in v3 against the v1 core: a find may cover several positions (F1), Regie material carries the surcharge of the Vertrag, the rule for ongoing projects uses the work date, "davon mit Kürzungsrisiko" (E13), "Restforderung laut Vertrag" (E14), the Untergrenze uses the Mittellohnkosten, "nur außerhalb ERP" per money word.
- Amounts are integer cents, rates basis points, rounding commercial and per line, everything net (SPEZIFIKATION.md 2.1).

## From step 1, good to know

- **App map:** design rules and every measured value in `docs/DESIGN.md`; navigation in `app/src/lib/navigation.ts`; the sample names in `app/src/lib/example.ts` (no amounts; step 3 replaces them with data from `kern/`).
- **Word check:** `app/scripts/check-words.mjs` runs after every app build and fails on any amount in the pages and in `app/src`. That is right until step 3; when the app starts showing amounts from `kern/`, keep the check on source strings (no typed amounts) and drop it for the built pages.
- **Cloudflare:** worker `app-neu`, production branch `main`, a preview per branch. The preview addresses only work after a production deploy that carries `"preview_urls": true` (the merge of #103 does that). Worker `app` (v1) untouched, builds off.
- **Windows pitfalls measured in step 1:** a lock file written on Windows missed two packages that Linux needs (`@emnapi/core`, `@emnapi/runtime`, now pinned in `app/`); check `npm ci` in CI after every dependency change. The static export on Windows writes prefetch files in folders, `app/scripts/flatten-prefetch.mjs` fixes that locally (on Linux nothing to do). The local static server (`serve`) can crash with "too many open files" under the screenshot script; restart it.
- **Screens:** `npm run screens` in `app/` photographs every screen with the local Edge in five widths; `node scripts/compare.mjs` puts them next to the Attio references in `app/qa-shots/` (local only, never committed).

## Start prompt for the next chat (copy into a new chat in `C:\Users\maxis\dev\tieout`)

> Ich bin Maxi S. Schritt 2, Kern. Lies `CLAUDE.md` und `docs/_UEBERGABE.md` und mach Schritt 2: den Rechenkern in `kern/` nach Spezifikation Abschnitt 8, Teil für Teil mit Tests gegen die Lösungsliste v3, bis jeder Betrag aus `_STATUS.md` auf den Cent aus `kern/` kommt. Kein Betrag ändert sich ohne mein Go. Sag mir vor jedem Teil in zwei Sätzen, was passiert, und hol dir mein Go vor dem Push und vor dem Merge. Deutsch, einfach, Ergebnis zuerst.
