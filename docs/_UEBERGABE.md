# Handover: step 3, Tabellen

**As of:** Saturday, 24 October 2026, afternoon, after step 2. Written by Claude for Maxi S.
**Folder:** open `C:\Users\maxis\dev\tieout` as the project in Claude Code. Strategy next to it in `../tieout-intern` (read only).
**Precondition:** the pull request of step 2 (branch `schritt-2-kern`, the core in `kern/`) is merged with Maxi S.'s go and CI `Kern` is green on `main`. If it is still open, merge it first with his go.

## Goal

The tables of the app in the Attio layout (view bar, table, sort, filter, columns, footer) with real data from `kern/`: "Projekte" and "Funde" first, then the other lists the sidebar has ("Belege", "E-Mails", "WhatsApp-Meldungen", "Auftraggeber") as far as the step allows. Every amount on screen comes from `kern/`; no amount is typed into `app/`. No amount changes without a go from Maxi S.

## Read first

1. `CLAUDE.md`, `docs/_STATUS.md`, this file.
2. `kern/README.md`: what is where, the entry points, the import decision, the assumptions.
3. `docs/DESIGN.md` (measured Attio values) and `docs/SPEZIFIKATION.md` 4.2 (view bar, sort, filter, add column, footer counter, "Add calculation" only as fixed sums from `kern/`, never "zusätzlich verrechenbar" plus "in Klärung"; table checkboxes, never a bulk release).
4. `docs/SPEZIFIKATION.md` 7.2: which screen shows which amount.

## What to build

1. **Import `kern/` into `app/`** as decided in `kern/README.md`: `"@tieout/kern": "file:../kern"`, `transpilePackages`, `turbopack.root` at the repository root. Check `npm ci` on Linux in CI (the Windows lock file missed packages in step 1), a local static build, and a Cloudflare preview build of the branch before relying on it. CI workflow `App` must also run on `kern/**`. Fallback if the build cannot read outside `app/`: an npm workspace at the repository root.
2. **Word check:** `app/scripts/check-words.mjs` now fails on any amount in the built pages. Keep it on the source (`app/src` must not contain a typed amount) and drop it for the built pages, as planned in step 1.
3. **"Projekte":** one row per project from `pruefeFirma(beispielFirma())`: name, Auftraggeber, stage, date ("Schlussrechnung legen bis", last Abschlagsrechnung, final payment), "zusätzlich verrechenbar", "in Klärung", status colour as a tag; footer counter and the two fixed sums apart.
4. **"Funde":** one row per find over the open projects: number, project, Art, Belegstand, Betrag, Entscheidung, Kürzungsrisiko from the Vorprüfung; filter by Belegstand and project; sort by amount; footer "8 Funde" style counter.
5. Whatever else the step allows in the same pattern ("Belege" from `ordnerLesen`, "Auftraggeber" from `historie`), without detail pages (step 4).
6. Screens at 1440 px and 390 px next to the Attio references (`npm run screens`, `node scripts/compare.mjs`), shown to Maxi S.

## Good to know from step 2

- **Entry points:** `pruefeFirma(firmendaten, entscheidungen)` gives `projekte` (rows with status colour), `ergebnisse[projektId]` (per project: `ordner`, `abgleich` with `funde` and `hinweise`, `positionen` with ready cell texts, `vorpruefung`, `rechnungsabschluss`, `schlussbesprechung`, `belegquellen`, `ausserhalbErp`), `summen`, `geld`, `davonMitKuerzungsrisiko`, `historie`, `gleicherGrund`, `abrechnungen`. `beispielFirma()` comes from `@tieout/kern/beispiel`. Everything is synchronous and fast enough to run at build time for the static export.
- **Keys and numbers:** a find has a stable key (`plan:H-201:D`, `regie:9`, `meldung:W4`, `mehrmenge:24.02.05A`, `anmeldung:mail-0316`) and a number `F1` … per project in the order of the result. Decisions are an append-only list; at business level their key carries the project id (`p1/regie:9`). Vorprüfung risks are `G1` … with keys `vp:<reason>:<bezug>`.
- **Money words:** every type has German label maps (`FUND_ART_TEXT`, `BELEGSTAND_TEXT`, `ENTSCHEIDUNG_TEXT`, `KUERZUNGSGRUND_TEXT`, `ABZUG_TEXT`, `PROJEKTSTUFE_TEXT`, `BELEGQUELLE_TEXT`); use them instead of new words. `euro()` and `menge()` format amounts and quantities.
- **Every number leads to its original:** each find carries `nachweise` with `quelle` (Beleg id, page, place) and each calculation step `quellen`; the original viewer comes in step 5, but the table rows can already carry the link target.
- **Verlauf of a find:** `zumStichtag(datensatz, tag)` replays the twin on an earlier day; Bürohaus Kiefernau on 30.09.2026 shows P2-F1 as "Stunden ohne Regiebericht", 595,00 €, "Beleg fehlt".
- **Assumptions** of the solution list are listed in `kern/README.md`; they stay until the construction insider answers (`SPEZIFIKATION.md` section 9).
- **Windows:** no Python on this machine; use Node for scripts. Heredocs with quotes inside can break in the shell tool; write files with the editor tool.

## Done when

- Typecheck, lint, tests and build of `app/` and `kern/` green; CI green on the pull request; `node docs/demo_faelle_check.mjs` green.
- The tables show the amounts of `docs/SPEZIFIKATION.md` 7.2 from `kern/`, screenshots next to Attio at 1440 px and 390 px shown to Maxi S.
- `_STATUS.md` updated, this file rewritten for step 4 (Datensätze), pull request merged with his go.

## Start prompt for the next chat (copy into a new chat in `C:\Users\maxis\dev\tieout`)

> Ich bin Maxi S. Schritt 3, Tabellen. Lies `CLAUDE.md` und `docs/_UEBERGABE.md` und mach Schritt 3: `kern/` in die App einbinden und die Tabellen im Attio-Layout bauen, zuerst „Projekte“ und „Funde“, mit den Beträgen aus `kern/`. Kein Betrag ändert sich ohne mein Go. Sag mir vor jedem Teil in zwei Sätzen, was passiert, zeig mir die Screens neben Attio und hol dir mein Go vor dem Push und vor dem Merge. Deutsch, einfach, Ergebnis zuerst.
