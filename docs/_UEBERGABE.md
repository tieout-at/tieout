# Handover: step 8e, Export

**As of:** Monday, 26 October 2026, night, after step 8d. Written by Claude for Maxi S.
**Folder:** open `C:\Users\maxis\dev\tieout` as the project in Claude Code. Strategy next to it in `../tieout-intern` (read only).
**Precondition:** the pull request of `schritt-8d-kompakt` is merged with the go of Maxi S., https://app.tieout.workers.dev shows the 8d pages (Start shows "Geld je Projekt" as a bar chart; the project page "Wo im Gebäude"), CI `App`, `Kern` and `Lösungsliste` green on `main`. If not, ask Maxi S. first.

## Goal

The one thing v1 had and v2 lacks (comparison test of 8c, named by the Abrechnerin and the Geschäftsführer): an export to the invoicing program. A file the business can open or import, made from the Änderungsliste of the Schlussrechnung, marked "Entwurf, nicht freigegeben" until every find is decided. No button before it works (SPEZIFIKATION.md 3.3).

## Read first

1. `CLAUDE.md`, `docs/_STATUS.md` (row 8d and its open points), this file.
2. `docs/SPEZIFIKATION.md` 3.3 (outputs: Excel and PDF now, ÖNORM A 2063 data carrier when a real customer needs it, BMD later) and `docs/DESIGN.md` (section "Compact and visual (step 8d)").
3. v1's export for comparison: branch `v1`, `product/app` (an Excel file with five sheets: Schlussrechnung, Posten, Schlussbesprechung, Vorprüfung, Belege).

## Steps

1. **Start with the short customer test of 8d** that was not run: the three roles (Abrechnerin, Geschäftsführer, Bauleiter) on the new pages, desktop and phone, the same four verdicts as before; every finding re-measured. Fix what is clearly wrong before the export.
2. **Decide with Maxi S.** (two sentences each, his go): what the file holds (proposal: Änderungsliste with position, quantity, Einheitspreis, amount and the Beweispaket reference; Rechnungsabschluss; Vorprüfung; Schlussbesprechungs-Blatt marked internal) and the format (proposal: one .xlsx built in the browser from the core's figures, no server).
3. Build it on the tab Schlussrechnung next to "Drucken", amounts only from `kern/` (the amount audit must stay green), words as in the app, internal sheets marked; test the file by opening it.
4. Review and status as usual.

## Decisions waiting for Maxi S. (from 8d)

- Project status colours: red "Frist nah" and yellow "offen" still mark deadlines; the council wants red only for Kürzungsrisiko and yellow only for Beleg fehlt (proposal: deadline neutral with a clock icon, the word stays).
- The red mark at the Bauschadensumlage "Abzug ohne Vertragspunkt" on the Schlussrechnung (keep red as a risk, or neutral).
- The Übersicht keeps its thin bars under the money figures (his word: it stays as it is); the council asks him to confirm.
- The dates of the Nachträge N1 to N3 (in the core's sample data, not in the solution list): add to the solution list or leave unshown.

## Good to know

- **Tools:** `npm run screens` (app served from `out/` with `node scripts/serve-out.mjs 3103`) photographs 61 screens at five widths and reports anything wider than its column. The amount audit of 8d builds `main` in a folder of its own (git archive of `app`, `kern`, `docs`; `app/node_modules` as junctions to the repository's packages except `@tieout/kern`, which points to the copy's `kern`; `turbopack.root` set to `C:/Users/maxis`) and compares every euro amount of every exported page against `docs/Demo_Faelle.md`. Write the scripts again in the session's scratchpad if needed; pass URL paths with `MSYS_NO_PATHCONV=1` on Git Bash.
- A `next dev` of another process may hold port 3100 and does not pick up new exports from client files; check pages in the build (`npm run build`, then the server on 3103).
- `app/qa-shots/board/` holds the board of drafts (`index.html`) and the result board (`ergebnis.html`) of 8d; git-ignored, never publish them (Attio and Linear pictures).

## Done when

- Customer test of 8d run and its findings handled; the export decided with Maxi S., built, opened and checked; amounts unchanged; check and amount audit green; checked live after the merge go.
- `_STATUS.md` updated, this file rewritten for step 9 (Abläufe).

## Start prompt for the next chat (copy into a new chat in `C:\Users\maxis\dev\tieout`)

> Ich bin Maxi S. Schritt 8e, Export. Lies `CLAUDE.md` und `docs/_UEBERGABE.md`. Zuerst der kurze Kundentest der drei Rollen auf den neuen Seiten von 8d, dann der Export ins Rechnungsprogramm: schlag mir Inhalt und Format vor, bevor du baust. Sag mir vor jedem Teil in zwei Sätzen, was passiert, und hol dir mein Go vor allem, was nach außen geht (Push, Merge, Cloudflare). Beträge nur aus dem Kern. Deutsch, einfach, Ergebnis zuerst.
