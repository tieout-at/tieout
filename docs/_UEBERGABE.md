# Handover: step 8b, Ihre Daten and the twin complete

**As of:** Sunday, 25 October 2026, after step 8. Written by Claude for Maxi S.
**Folder:** open `C:\Users\maxis\dev\tieout` as the project in Claude Code. Strategy next to it in `../tieout-intern` (read only).
**Precondition:** the branch `schritt-8-berichte-schlussrechnung` is pushed, its pull request merged with Maxi S.'s go, CI `App`, `Kern` and `Lösungsliste` green on `main`, and app-neu shows "Berichte" (three dashboards) and the tab "Schlussrechnung" of Wohnpark Mooshaim with the Restforderung 89.274,41 €. If the pull request is still open, ask for his go and merge it first (`gh pr merge <nr> --merge`), then check app-neu online.

## Goal

The parts of "Ihre Daten" and "Digitaler Zwilling" that are still empty, decided with Maxi S. in step 8 (the third customer test skipped them, all three testers named the empty pages):

1. Project tab **"Positionen"** (`SPEZIFIKATION.md` 2.3 and 4.3): every position of the Leistungsverzeichnis as "beauftragt", "erbracht", "verrechnet", "offen", with the rows of `SPEZIFIKATION.md` 7.2 (22.04.12B 4.009,60 € and the others); `kern/` already has `positionstabelle()`. Explain the 182 Thermostatköpfe at 100 Heizkörper (customer test 2).
2. **Belegabdeckung** (candidate B of 4.4) with the positions: which kinds of evidence prove each position. Needs `kern/` to know which Beleg proves which position (today only the last Aufmaßblatt of a position is named); decide with Maxi S. how far to go.
3. Project tab **"Zeitstrahl"** (`SPEZIFIKATION.md` 4.3 and 7.3 at 0:20): lane "Baustelle" against lane "Schlussrechnung", "verrechnet" or "fehlt", a missing one with "gefunden" and its find.
4. Pages **"WhatsApp-Meldungen"** and **"E-Mails"** (Attio's Calls and Emails, references in `app/qa-shots/attio/`): read only, each linked to its finds; the search finds a message by its date.

## Read first

1. `CLAUDE.md`, `docs/_STATUS.md` (open points of step 8), this file.
2. `docs/DESIGN.md` (tables, record pages, step 8), `docs/SPEZIFIKATION.md` 2.3, 4.3, 4.4, 7.2, 7.3.
3. Customer test 3 in `../tieout-intern/docs/kundentests/2026-10-25_kundentest-3_ordner-bis-rechnung.md`.
4. Code: `app/src/lib/invoice.ts` and `reports.ts` (the newest builders over the core's result, live through `kern-live.ts`), `kern/src/positionen.ts`.

## Good to know from step 8

- **Berichte:** `lib/reports.ts` (`DASHBOARDS`, `reportsView()`), cards in `app/berichte/report-cards.tsx`. Bars are pictures only, every figure stands in letters; Belegstand is counted in finds, never a sum of both money words.
- **Schlussrechnung:** `lib/invoice.ts` (`invoiceView()`, `invoiceList()`), view in `components/schlussrechnung/invoice-view.tsx`. "In der Schlussrechnung" is set only there (`takeIntoInvoice()` in `lib/decisions.ts`), for released finds.
- **Beweispaket:** `components/fund/evidence-package.tsx` is what goes to the Auftraggeber: no Kürzungsrisiko, Abhilfe, Gegenprobe, decision, and no pages of the Entwurf, the Preisbasis or the Stundenzettel (customer test 3). Keep it that way for anything new that could land in it.
- **Print:** sidebar, header, step bar and buttons carry `print:hidden`; check a print with `page.emulateMedia({ media: "print" })` in Playwright (no PDF renderer on this machine).
- **Amount check against `main`:** build `main` and the branch, compare the euro amounts of every exported page (a small script did it in step 8: 72 pages, 70 equal, the 2 others were empty before).
- **Dev server:** after building `main` in the same folder, restart the dev server, or it reports a hydration mismatch that is not in the code.
- **Customer testers** cannot write files in their folder with the editor tool; they return the report as text.

## Done when

- Typecheck, lint, tests, build of `app/` and `kern/` green; CI green; `node docs/demo_faelle_check.mjs` green; amounts on every page unchanged against `main` unless Maxi S. gave a go.
- Positionen, Zeitstrahl, WhatsApp-Meldungen and E-Mails with real data, screens at 1440 and 390 px next to Attio shown to Maxi S.
- `_STATUS.md` updated, this file rewritten for step 9 (Abläufe, with "Nachtrag legen" and the signature sheet from customer test 3 as candidates), pull request merged with his go.

## Start prompt for the next chat (copy into a new chat in `C:\Users\maxis\dev\tieout`)

> Ich bin Maxi S. Schritt 8b, Positionen, Zeitstrahl, WhatsApp-Meldungen und E-Mails. Lies `CLAUDE.md` und `docs/_UEBERGABE.md` und mach Schritt 8b. Alle Beträge aus `kern/`, kein Betrag ändert sich ohne mein Go. Sag mir vor jedem Teil in zwei Sätzen, was passiert, zeig mir die Screens neben Attio und hol dir mein Go vor dem Push und vor dem Merge. Deutsch, einfach, Ergebnis zuerst.
