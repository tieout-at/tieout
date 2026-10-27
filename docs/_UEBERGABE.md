# Handover: step 10, Backend

**As of:** Tuesday, 27 October 2026, after step 9. Written by Claude for Maxi S.
**Folder:** open `C:\Users\maxis\dev\tieout` as the project in Claude Code. Strategy next to it in `../tieout-intern` (read only).
**Precondition:** step 9 (Abläufe, branch `ablaeufe-9`) is merged and live at https://app.tieout.workers.dev/ablaeufe/ (check: the three Abläufe open, "Lauf abspielen" runs, 86 + 3 pages, the 1.037 amounts of the other pages unchanged); CI `App`, `Kern` and `Lösungsliste` green on `main`. If step 9 is not merged yet, finish that first (push, pull request, merge, live check, each with the go of Maxi S.).

## Goal

Step 10 of `docs/_STATUS.md`: sign-in on, a company per account, files, decisions and tasks stored on the server instead of one browser, demo access for the jury and for customers. Check-in: two accounts, one file, one approval. Everything that so far says "kommt mit der Anmeldung" waits for this step: persons and roles (who checked, who released), shared decisions and tasks, switching checks and Abläufe on and off, real scans.

## Read first

1. `CLAUDE.md`, `docs/_STATUS.md` (row 9, open points of 9, 8e, 8c "for step 10"), this file.
2. `docs/SPEZIFIKATION.md` 1.4 (data and trust), 2.1 (rules for every object: source, review state, Verlauf append only), 3.3 (outputs), section 10 (decisions); `../tieout-intern` for hosting, price and gate constraints (read only, never copy into this repository).
3. `app/src/lib/decisions.ts` and `live.ts` (how decisions and tasks live in the browser today), `kern/src/modell.ts` (Entscheidung, Feld with Verlauf).

## Steps

1. Propose the backend to Maxi S. before building (hosting next to the Cloudflare worker, sign-in, data silo per company, what moves from the browser to the server, cost): two sentences each, a picture of the data flow, his go. Rules that stay: synthetic data only until the legal clearance and the works council say otherwise; data silo per company; history append only; no secrets in the repository.
2. Build sign-in and the company, then decisions and tasks on the server (the browser keeps working without sign-in as the demo), then one file upload with its source.
3. Persons and roles: "Prüfung" by the Abrechnung, "Freigabe" by the Geschäftsführung; a reason per correction.
4. Security review with access per company and input validation, bug and speed review, customer test, status as usual.

## Decisions waiting for Maxi S.

- From 8e: a figure "sicher verrechenbar" and a hint "davon noch nicht freigegeben" at the Restforderung.
- From 8d: project status colours, the red mark at the Bauschadensumlage, the thin bars on the Übersicht, the dates of the Nachträge N1 to N3.
- Committing the report of customer test 5 in `../tieout-intern` (local file, see `_STATUS.md`).

## Good to know

- **Abläufe (step 9):** counts per block from `ablaeufe()` in `kern/src/ablaeufe.ts`, page data in `app/src/lib/flows.ts`, canvas in `app/src/components/ablauf/`. The canvas must not import the core (only types and `flow-catalogue.ts`), or the page loads the core and its sample data on first paint. Task blocks create tasks in this browser with the block's Zuständig and Frist; settings (`Setting` in `app/src/lib/decisions.ts`) and tasks move to the server in this step, per company.
- **Tools:** `npm run screens` (app served from `out/` with `node scripts/serve-out.mjs 3103`, launch name `app-build`) photographs 64 screens at five widths. The amount audit compares every euro amount of every exported page against the live app and `docs/Demo_Faelle.md`; write it again in the session's scratchpad if needed (fetch each page, take every amount like `1.234,56 €` from the text without scripts, compare sorted lists). In Git Bash set `MSYS_NO_PATHCONV=1` before passing paths like `/ablaeufe/` to node.
- **Attio:** measured through Claude in Chrome in Maxi S.'s Edge (his session); pictures only in `app/qa-shots/` (ignored), never committed.
- A `next dev` of another process may hold port 3100; check pages in the build (`npm run build`, then the server on 3103).

## Done when

- Two accounts of two companies see only their own data; one file uploaded with its source; one find checked by the Abrechnung and released by the Geschäftsführung, visible to both; the demo without sign-in still works; amounts unchanged; check and amount audit green; security review with access per company passed; checked live after the merge go.
- `_STATUS.md` updated, this file rewritten for the next step.

## Start prompt for the next chat (copy into a new chat in `C:\Users\maxis\dev\tieout`)

> Ich bin Maxi S. Schritt 10, Backend. Lies `CLAUDE.md` und `docs/_UEBERGABE.md`. Prüf zuerst, ob Schritt 9 gemergt und live ist. Dann zeig mir einen Vorschlag mit Bild für das Backend (Anmeldung, Betrieb, Dateien, Entscheidungen, Kosten), bevor du baust. Sag mir vor jedem Teil in zwei Sätzen, was passiert, und hol dir mein Go vor allem, was nach außen geht (Push, Merge, Cloudflare, neue Dienste). Beträge nur aus dem Kern. Deutsch, einfach, Ergebnis zuerst.
