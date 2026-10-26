# Handover: step 8c, Umschalten

**As of:** Monday, 26 October 2026, night, after step 8b. Written by Claude for Maxi S.
**Folder:** open `C:\Users\maxis\dev\tieout` as the project in Claude Code. Strategy next to it in `../tieout-intern` (read only).
**Precondition:** the pull requests of `schritt-8b-daten-zwilling` (step 8b) and `uebersicht-zurueck` (the step 4 Übersicht back) are merged with the go of Maxi S., CI `App`, `Kern` and `Lösungsliste` are green on `main`, and app-neu shows the tabs Zeitstrahl and Positionen of Wohnpark Mooshaim, the pages WhatsApp-Meldungen and E-Mails, and the Übersicht with the three columns and the lines from Beleg to euro. If not, ask Maxi S. first.

## Goal

The public link `app.tieout.workers.dev` shows the new app; v1 stays reachable at an archive address of its own. Moved forward from step 12 (Maxi S., 26.10.2026): v2 now has every page v1 had (Positionen, Zeitachse as Zeitstrahl, WhatsApp) and the jury needs no sign-in.

## Read first

1. `CLAUDE.md`, `docs/_STATUS.md` (row 8c, open points), this file.
2. `docs/DESIGN.md`: "Zeitstrahl, Positionen, Belegabdeckung, messages (step 8b)" and the "Übersicht".
3. `_STATUS.md` "Where we stand" on the Cloudflare workers `app` (v1, frozen, builds off, stores the old repository name) and `app-neu` (v2).

## Steps

1. **Comparison test** v1 against v2 with the three roles (Abrechnerin, Geschäftsführer, Bauleiter; fresh agents, README, address, one task each). Passed when no verdict is worse than v1. Report into `../tieout-intern/docs/kundentests/`.
2. **v1 to its archive address:** a worker of its own (for example `app-v1`) built from the tag `v1-archiv` or the branch `v1`; check it live.
3. **`app` builds the new app:** renew the GitHub connection of the worker `app` in Cloudflare (it still names `schlusswerk/schlusswerk`), root `/app`, build `npm run build`, deploy `npx wrangler deploy`, production branch `main`. Reversible: `app` can build from branch `v1` again.
4. **README** of the repository points to the new app; the small correction named in `_STATUS.md` (open points) with it.
5. **Live check** of every page at 1440 and 390 px on the public link, amounts as the solution list.

Every outward step (Cloudflare, README, push) only with a go of Maxi S.

## Good to know

- **Taste of Maxi S. (26.10.2026), for every page from now on:** compact, clear at a glance, refined, visual (diagrams), interactive like Linear and Attio (a click gives the details); no page that reads like a book, no long scrolling, no small text walls. He chose draft A (the picture) over the reviewer's calmer list twice in step 8b and wanted the step 4 Übersicht back. A reviewer's score for "Ruhe" is not his bar on its own.
- **Step 8d "Kompakt und klar"** follows 8c (row in `_STATUS.md`): rethink the sample data (smaller first customers), the core and the solution list with them, and every page; many tokens, an advisor, a board of all pages; amounts change only with his go.
- **Tools from step 8b (in the session's scratchpad, write them again if needed):** the amount audit builds `main` in a folder of its own (git archive of `app`, `kern`, `docs`; `app/node_modules` as junctions to the repository's packages except `@tieout/kern`, which points to the copy's `kern`; `turbopack.root` set to `C:/Users/maxis`) and compares every euro amount of every exported page; on Git Bash pass URL paths with `MSYS_NO_PATHCONV=1`.
- **Open from 8b:** one date per Beleg everywhere (the Belege list uses the file date); position texts cut at 1440 px in Positionen.

## Done when

- The public link shows v2, v1 is at its archive address, no role's verdict is worse than v1, README updated, checked live.
- `_STATUS.md` updated, this file rewritten for step 8d.

## Start prompt for the next chat (copy into a new chat in `C:\Users\maxis\dev\tieout`)

> Ich bin Maxi S. Schritt 8c, Umschalten. Lies `CLAUDE.md` und `docs/_UEBERGABE.md` und mach Schritt 8c: Vergleichstest v1 gegen v2 mit den drei Rollen, v1 auf eine eigene Archivadresse, der öffentliche Link zeigt die neue App. Sag mir vor jedem Teil in zwei Sätzen, was passiert, und hol dir mein Go vor allem, was nach außen geht (Cloudflare, README, Push, Merge). Deutsch, einfach, Ergebnis zuerst.
