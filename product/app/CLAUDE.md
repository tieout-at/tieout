# Schlusswerk: Project rules

Internal review tool for Austrian HVAC/plumbing (HKLS) and electrical subcontractors: before the final invoice (Schlussrechnung) to the general contractor (GU), it reconciles the bill of quantities (LV), measurement records (Aufmaß), time-and-materials work (Regie), interim invoices (Abschlagsrechnungen), plans, mails and photos. First with synthetic data (MVP), then with real project folders (v1). No customer access.

The client is Maxi S. (not a developer): German, result first, plain language, translate technical terms the first time they are used. The rules in `../../CLAUDE.md` (repo root) apply in addition.

## Where things are
- Strategy: `../../docs/dossier-v3.md`, section 3 (product), 12 (rejected), 15 (build). Team status: `../../_STATUS.md`.
- Product documents in `../docs/`:
  - `Plan_MVP.md`, `Umfang_v1.md` (incl. not-list and decisions), `Inspiration_Muster.md`, `Pruefberichte_UI.md`.
  - `Demo_Faelle.md`: solution list of the built-in cases. **Authoritative for amounts.** Do not change it in code, report deviations; changes to the list only with a go-ahead from Maxi S.
- UI: only from `../ui-fundament/` (design system, `LIESMICH.md`).
- `src/domain/typen.ts`: data model company → client (Auftraggeber) → project (`Firmendaten`, `Datensatz` = project twin). Project status (in progress, preparing final invoice, submitted, closed); only the first two are reconciled. Evidence (Belege) arrives via a channel (folder, WhatsApp, later integration); field reports (`Zuruf`) are separate evidence alongside the folder documents, sources point to a document or a field report. Every field from a document is `Feld<T>` with a source (file, page, location, rectangle) and a review status (machine / confirmed / blocked). Approval is two-stage (accepted M, approved I) as a separate type outside the dataset.
- `src/engine/`: calculation core, pure functions. `pruefeFirma(firmendaten)` (`firma.ts`) returns the project list with traffic light, date and totals; `pruefe(datensatz)` (`pruefe.ts`) per project returns import status, ledger, findings (Befunde) (three lists plus the notice „braucht Anwalt“ (needs lawyer)), pre-check from the GU's perspective (Vorprüfung), notices, review cascade (Prüfkaskade).
  - `befunde.ts`: additional quantity or „erbracht, nicht verrechnet“ (performed, not billed), Regie, Regie from field report, price adjustment (ÖNORM B 2111), notifications (Anmeldungen), schedule/hindrance notices. Without a draft (in progress) only work before the last interim invoice (AR) counts (`kontext.ts`, `grenze`).
  - `belegquelle.ts`: source of the evidence (file, paper, mail, photo, WhatsApp), share „nur außerhalb ERP“ (only outside the ERP).
  - `vorpruefung.ts`: deduction risks with fixed reasons (`Kuerzungsgrund`), notices „Mengenänderung über 20 %“ (quantity change over 20 %).
  - `kaskade.ts`: total value of work → discount → deductions → retentions → payments → remaining amount due, comparison with the contract.
  - `geld.ts`: cent arithmetic, rounding, formatting.
- `src/demo/w21/`: synthetic dataset „Wohnhausanlage Wien 21, HKLS-Los“ (`erzeuge.ts`, deterministic, with 6 field reports), catalog of the 380 LV items, solution list for tests (`loesung.ts`).
- `src/demo/firma/`: company twin Haustechnik Beispiel GmbH: 4 clients, W21 plus 7 small projects (`erzeuge.ts`, build helper `bauen.ts`), solution list for tests (`loesung.ts`).
- `src/app/`: screens (Next.js App Router, everything statically precomputed). `/` company overview, `/projekte/[projekt]/…` project and application.
- `src/ui/`: components as React components (Seitenleiste, Seitenkopf, Kennzahl, Panel, Statusmarke, row navigation) and styles in `styles/`: `tokens.css` (the only place for colors, spacing, sizes), `bauteile.css` (components with reference), layout per area: `rahmen.css` (page, sidebar, header, columns), `marken.css` (status as a word), `ablauf.css` (Schrittleiste, project overview), `tabellen.css` (all tables), `befund.css`, `beleg.css` (viewer, evidence pages), `zeitachse.css` (with scene). Since 22.10. the app is the source of the UI foundation; the Artifact remains reference v2. No Tailwind in the screens: classes from `bauteile.css` and the area files, inline styles only for column widths. `fundament.test.ts` blocks free colors, styles and forbidden words.
- `src/zustand/`: two-stage approval as history (`freigabe.ts`, pure functions, tests), storage in the browser (`speicher.ts`, reads fresh on every access so that multiple tabs do not overwrite each other).
- `src/zuruf/`: integration of the field report agent (`../zuruf/`) behind the switch `ZURUF_ECHT` in the Worker (default off; the page queries `/api/zuruf/status` at runtime, `schalter.ts`, otherwise simulated scene): company for the agent (`firma.ts`), mapping work event → `Zuruf` (`abbildung.ts`). New field reports are stored in the browser (`src/zustand/zurufe.ts`, interface `ZurufAblage`), without an amount, never in the calculation core. Browser code imports only types from `../zuruf/`; the Worker (`worker/index.ts`) mounts the route `/api/zuruf/…` (`postinstall` also installs `../zuruf`).
- `src/ui/thema-skript.ts`: script in the `<head>` (theme, collapsed sidebar); the matching client logic is in `thema.ts`. Server files must not import client hooks.
- `src/daten/`: the only data access for the screens (`server-only`). Today generator + calculation core, later a database per company.
- `scripts/generate/`: writes `data/generated/firma.json` and `w21.json` (also runs before `build`).

## Rules
- **The AI delivers facts with a source, the calculation is code.** The calculation core reads only the dataset, never the solution list.
- Amounts are whole cents, quantities hundredths of the unit, rates basis points (3,8 % = 380). Commercial rounding per row (`rundeHalbAuf`). No decimal numbers in totals.
- Every finding carries its calculation and evidence with a source. The human approves every row.
- Never the word „Claim“, never „Forcierung“ (acceleration), no statements on preclusion (Präklusion) and no legal assessment. Schedule and hindrance cases are notices without an amount for the law firm.
- Always label synthetic data as synthetic; companies are fictitious (Haustechnik Beispiel GmbH, Hochbau Beispiel GmbH).
- Never put real customer data in the repo (`data/real/` is ignored). Never put the repo in OneDrive.

## Way of working
- `npm run typecheck`, `npm run lint`, `npm test` green before every commit.
- New rule = positive test and counter-check in `regeln.test.ts`. Changes to the dataset: `pruefung.test.ts` must still match the solution list exactly.
- Work on a separate branch, into `main` only via pull request. Claude may create and merge pull requests itself if there are no conflicts; review briefly beforehand (diff, typecheck, lint, tests) and report to Maxi S. (permission 22.10.2026). Afterwards update `../README.md` (section "Status").

## Domain assumptions (to be checked with the insider)
- Additional quantity: billed is the measured quantity at the unit price (EP) per LV; K7 serves only as a plausibility check. Average wage rate (Mittellohnpreis) 56,80 €/h from our own calculation (K3).
- ÖNORM B 2110: a quantity change over 20 % can trigger a new unit price; we only show a neutral notice but calculate with the LV unit price.
- Price adjustment: labor share 40 % of the measured work from the reference date; work „ab Stichtag“ (from the reference date) = measurement sheets whose performance period begins on or after the reference date; labor index base is the month of the offer. No de minimis threshold, Regie not adjusted.
- Total value of work in the cascade = the project manager's draft final invoice + list 1. Deductions from the GU's deduction letter are calculated on the total after discount, retentions on the amount before retentions; the security retention (Deckungsrücklass) applies only to interim payments.
- Deduction risk „Aufmaß nicht gegengezeichnet“ (measurement not countersigned) only for the quantity above the LV quantity.
- Deduction risk „Stunden weichen ab“ (hours differ) only if the time-and-materials report (Regiebericht) shows more hours than the timesheet for the same week.
- „Bezahlt“ (paid) in the ledger = included in paid interim invoices minus the GU's deductions (before discount and retentions).
- Fields with review status „blockiert“ (blocked) are not yet excluded by the calculation core (open for v1).
