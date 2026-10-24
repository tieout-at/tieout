# kern

Calculation and data model of tieout v2: deterministic code, amounts in whole cents, rates in basis points, quantities and hours in hundredths, rounding commercial and per line, everything net. Built in step 2 along [`SPEZIFIKATION.md`](../docs/SPEZIFIKATION.md) section 8 and tested to the cent against solution list v3 ([`docs/Demo_Faelle.md`](../docs/Demo_Faelle.md)).

```bash
npm ci
npm run check
```

`npm run check` runs typecheck, lint and the tests. CI workflow `Kern` runs the same on every pull request that touches `kern/` or the solution list.

## What is where

| File | Run step or object | From v1 |
|---|---|---|
| `src/geld.ts` | cents, basis points, commercial rounding, formatting | ported unchanged (plus `centAus`) |
| `src/modell.ts` | data model: Feld with source, review state and Verlauf; Beleg, Position, Aufmaßblatt, Regiebericht, WhatsApp-Meldung, Vertrag, Preisbasis, decisions | rewritten |
| `src/ordner.ts` | "Ordner lesen": files, duplicates, plan index chains, corrected fields | ported (`importStand`) |
| `src/kontext.ts` | lookup tables, boundary of the last Abschlagsrechnung | ported |
| `src/regeln.ts` | "Abgleich": finds and notes, sums "zusätzlich verrechenbar" and "in Klärung" | ported (`befunde.ts`), finds over several positions, material surcharge, work date |
| `src/positionen.ts` | position table of Ebene 2 | rewritten (`baueLedger`) |
| `src/vorpruefung.ts` | "Vorprüfung", "davon mit Kürzungsrisiko", every rate against the Vertrag | ported, plus "Menge ohne Aufmaß-Nachweis" and "Regie nicht unterschrieben" |
| `src/stufen.ts`, `src/rechnungsabschluss.ts` | settlement steps; "Rechnungsabschluss", "Restforderung laut Vertrag", payments per Abschlagsrechnung | ported (`kaskade.ts`), plus E14 |
| `src/schlussbesprechung.ts` | "Schlussbesprechungs-Blatt", floor with the Mittellohnkosten | ported, floor rule of v3 |
| `src/belegquelle.ts` | "Belegquelle", "nur außerhalb ERP" per money word | ported, split by money word |
| `src/historie.ts` | Auftraggeber history, "gleicher Grund", settlement of closed projects | ported (`historie.ts`, `abrechnung.ts`) |
| `src/projekt.ts`, `src/firma.ts` | one project through the run; business level with status colours | rewritten (`pruefe.ts`), ported (`firma.ts`) |
| `src/stand.ts` | the twin as known on a given day (Verlauf of a find, replay of a run) | new |
| `src/beispiel/` | synthetic sample company Kronfeld Haustechnik with the five projects of solution list v3 | mechanics of the v1 generator, data rewritten |

Entry points: `pruefeFirma(firmendaten, entscheidungen)` for the business, `pruefeProjekt(datensatz, optionen)` for one project; `beispielFirma()` from `@tieout/kern/beispiel` gives the sample data. Decisions on finds are an append-only list; at business level their key carries the project id (`p1/regie:9`).

Identifiers follow the German vocabulary of the specification (section 6), as the v1 core did; comments and docs are English.

## Rules for changes

- **Amounts** change only with a go from Maxi S. `test/betraege.test.ts` reads the section "Amounts that must not change" of `docs/_STATUS.md` and fails if any of them does not come out of `kern/` to the cent.
- **Expected values** in tests come from `docs/Demo_Faelle.md` through `ausListe("14.620,15 €")`, which fails if the list does not contain the amount; never from `docs/demo_faelle_check.mjs`.
- **The sample data** set inputs only (contract sum, Entwurf, Abschlagsrechnungen, Regieberichte, Aufmaßblätter, e-mails, photos, plans, messages). To write the Zahlungsavisos it plays the Auftraggeber with the same settlement rule the core uses (`abrechnen`); the payments are then checked against the amounts of the list.
- No decimal numbers in `kern/` (a lint rule enforces it).

## How `app/` imports the core (decided in step 2, to be built and checked in step 3)

`app/package.json` gets `"@tieout/kern": "file:../kern"` (npm links the folder; `kern/` has no runtime dependencies and exports its TypeScript source), `next.config.ts` gets `transpilePackages: ["@tieout/kern"]` and `turbopack.root` set to the repository root, so that the build may read files outside `app/`. The Cloudflare build clones the whole repository and builds in `/app`, so `../kern` is there. The CI workflow `App` then also runs on changes in `kern/`. Not yet tried: step 3 checks it with `npm ci` on Linux and a Cloudflare preview build before relying on it; the fallback is an npm workspace at the repository root.

## Assumptions carried from the solution list

The rules follow the solution list where it marks an **Annahme** and the questions for the construction insider (`SPEZIFIKATION.md` section 9): the floor uses the Mittellohnkosten; a notified change is priced on the Mittellohnpreis plus the material surcharge of the own calculation; for an ongoing project only work up to the last Abschlagsrechnung (work date, including that day) counts as forgotten; hours from a WhatsApp-Meldung are priced with the Regiesätze and no material; an entered Aufmaßblatt counts as "in the ERP"; lump-sum positions are not measured, so "Menge ohne Aufmaß-Nachweis" skips them (a lump sum that is on an Aufmaßblatt and missing from the Entwurf is still a find); hours in a WhatsApp-Meldung that names positions of the Leistungsverzeichnis are paid through the Einheitspreis and give no Regie find; a Regiebericht counts as invoiced once a Regie line names it, whatever hours that line has.

## Independent review (24.10.2026)

One reviewer checked the core against the specification and the solution list with its own experiments. It found no hard-coded amount and no circular test, and confirmed every rule on the sample data. It found five rules that would go wrong on other data (a Regiebericht invoiced in an Abschlagsrechnung but left out of the Entwurf, a position above the Leistungsverzeichnis but invoiced below it, a Regiebericht over two weeks against the Stundenzettel, unsigned quantities within the Leistungsverzeichnis, find keys across projects), seven risks and some small points. Each was re-measured with a failing test first (`test/randfaelle.test.ts`) and fixed; no amount of the solution list changed. Left as they are, with the reason: Vertragspunkt and phase of a rate and the sender side of an e-mail are plain values (the rate itself and the sender are fields with source); a Regie line invoiced with fewer hours than the report counts as invoiced.
