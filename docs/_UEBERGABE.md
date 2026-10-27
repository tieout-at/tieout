# Handover: step 9, Abläufe

**As of:** Tuesday, 27 October 2026, after step 8e. Written by Claude for Maxi S.
**Folder:** open `C:\Users\maxis\dev\tieout` as the project in Claude Code. Strategy next to it in `../tieout-intern` (read only).
**Precondition:** the review of 8d (#124) and the Excel export (#125) are merged and live at https://app.tieout.workers.dev (checked 27.10.2026: 86 of 86 pages with the same amounts as the local build, the export opened in Excel); CI `App`, `Kern` and `Lösungsliste` green on `main`. If something differs, ask Maxi S. first.

## Goal

The page "Abläufe" as `docs/SPEZIFIKATION.md` 5.2 describes it: Attio's Workflows canvas one to one in layout and behaviour (dotted grid, blocks of about 200 × 60 px, configuration panel on the right, toolbar at the bottom, the list "Läufe"), with our own content: how the business checks its invoices. Three Abläufe come ready: "Abschluss-Lauf", "Lauf je Abschlagsrechnung" and "Meldung zu Regiebericht". A run lights the blocks one after the other and shows their results; a click on a block opens what it produced. A block never computes an amount, never sends anything to the Auftraggeber.

## Read first

1. `CLAUDE.md`, `docs/_STATUS.md` (rows 8d and 8e, open points), this file.
2. `docs/SPEZIFIKATION.md` 5.1 (the five steps of the Abschluss-Lauf) and 5.2 (blocks, panel, the three Abläufe), `docs/DESIGN.md` "Principles for every new page".
3. Attio's Workflows in Maxi S.'s workspace as the reference for measurements (with his OK, through his browser session; never commit the pictures, `app/qa-shots/` is ignored).

## Steps

1. Measure Attio's canvas (grid, block, panel, toolbar, run list, states while a run goes) and propose the page to Maxi S. with a picture before building (two sentences each, his go).
2. Build the canvas with the three Abläufe from the core's results (`kern/`: what each step read, found and checked; counts only, amounts stay where they are).
3. Runs: a list "Läufe" per project; playing a run lights the blocks; every result leads to its find, Beleg or task.
4. Customer test of the three roles on "Abläufe" (does a business see how its invoices are checked, would it switch a check on or off), then review (bug, security, speed) and status as usual.

## Decisions waiting for Maxi S.

- From 8e: a figure "sicher verrechenbar" (the core does not give it; it would go into the solution list) and a hint "davon noch nicht freigegeben" at the Restforderung.
- From 8d: project status colours (red and yellow for deadlines), the red mark at the Bauschadensumlage, the thin bars on the Übersicht, the dates of the Nachträge N1 to N3.
- Committing the report of customer test 5 in `../tieout-intern` (local file, see `_STATUS.md`).

## Good to know

- **Tools:** `npm run screens` (app served from `out/` with `node scripts/serve-out.mjs 3103`) photographs 61 screens at five widths. The amount audit compares every euro amount of every exported page against the live app and `docs/Demo_Faelle.md`; write it again in the session's scratchpad if needed (fetch each page, take every amount like `1.234,56 €` from the text without scripts, compare sorted lists).
- **Checking an export:** Excel is installed; PowerShell COM (`New-Object -ComObject Excel.Application`) opens a file read only, reads cell values and can render a used range as a picture (`CopyPicture`, paste into a chart, `Chart.Export`). Always `Quit()`.
- A `next dev` of another process may hold port 3100; check pages in the build (`npm run build`, then the server on 3103).
- The export (`app/src/lib/invoice-export.ts`) takes the same view as the tab Schlussrechnung; a new figure on that tab belongs in the file too.

## Done when

- The canvas built and accepted by Maxi S. next to the Attio reference; the three Abläufe run for Wohnpark Mooshaim; amounts unchanged; check and amount audit green; customer test run; checked live after the merge go.
- `_STATUS.md` updated, this file rewritten for step 10 (Backend).

## Start prompt for the next chat (copy into a new chat in `C:\Users\maxis\dev\tieout`)

> Ich bin Maxi S. Schritt 9, Abläufe. Lies `CLAUDE.md` und `docs/_UEBERGABE.md`. Miss zuerst Attios Workflows aus und zeig mir einen Vorschlag mit Bild, bevor du baust. Sag mir vor jedem Teil in zwei Sätzen, was passiert, und hol dir mein Go vor allem, was nach außen geht (Push, Merge, Cloudflare). Beträge nur aus dem Kern. Deutsch, einfach, Ergebnis zuerst.
