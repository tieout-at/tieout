# Status

**As of:** Saturday, 24 October 2026, evening. Step 1 (Hülle) merged (#103), online at https://app-neu.tieout.workers.dev. Step 2 (Kern) merged (#104). Step 3 (Tabellen) built on the branch `schritt-3-tabellen`, pull request #105: `kern/` linked into `app/`, the tables "Projekte" and "Funde" in Attio's layout with every amount from `kern/`, no amount changed; merge waits for Maxi S.'s go. Next: step 4 (Datensätze).
**Maintenance:** every chat ends by updating this file and `_UEBERGABE.md`. Team status, gates and strategy: `../tieout-intern/_STATUS.md`.

## Where we stand

- **Rebuild from zero (v2), decided 23.10.2026.** UI reference: Attio (app.attio.com) for layout, behaviour and spacing; brand, icons, illustrations and texts are our own (icons from Lucide). Content is rethought from zero along the three steps of the website section 03: **Ihre Daten → Digitaler Zwilling → Ergebnis**.
- **v1 stays live and frozen** at https://app.tieout.workers.dev. Cloudflare worker `app`, automatic builds (production and preview) switched off on 23.10. so that pushes to `main` do not change it; checked after merging #98. Live version 4f4d1872 = PR #97 = tag `v1-archiv`. Code of v1: tag `v1-archiv` and branch `v1`.
- **v2 is online at a second address:** https://app-neu.tieout.workers.dev, Cloudflare worker `app-neu` (created 24.10.), static files only. Workers Builds from `tieout-at/tieout`, root directory `/app`, build `npm run build`, deploy `npx wrangler deploy`, production branch `main`, a preview per branch (`npx wrangler preview`). Before the merge of #103 the production branch was set to `schritt-1-huelle` for one build so that the shell could be checked online, then set back to `main`. At the switch-over (step 12) the worker `app` gets the new app.
- **v2 app (`app/`):** Next.js 16.4.2 (static export), React 19.3.1, Tailwind 4.3.3, shadcn components on Base UI 1.9.0, Lucide, Inter self-hosted, cmdk. `npm run check` runs typecheck, lint, tests and build; the build ends with a word check (`scripts/check-words.mjs`). CI workflow `App` per pull request. Screens are photographed with the local Edge (`npm run screens`) and put next to Attio references (`scripts/compare.mjs`; the Attio pictures stay local in `app/qa-shots/`, never in the repository).
- **v2 core (`kern/`):** own TypeScript package (Vitest, typecheck, lint, CI workflow `Kern`), no runtime dependencies. Data model with source, review state and Verlauf per field; the run steps "Ordner lesen", "Abgleich", "Vorprüfung", "Entwurf" (Rechnungsabschluss) and the Schlussbesprechungs-Blatt; business level with status colours, Auftraggeber history and the settlement of the closed projects. Sample data: Kronfeld Haustechnik with the five projects of solution list v3 (`kern/src/beispiel`), only inputs set by hand. `kern/test/betraege.test.ts` checks every amount of the section "Amounts that must not change" against `kern/`. `app/` links it as `@tieout/kern` (`file:../kern`, built in step 3, `kern/README.md`) and computes the table rows from it while the pages are built.
- **Repository:** one working folder (`tieout`, this repository, public), strategy next to it (`tieout-intern`, private). New structure and clean-up log: `_BEREINIGUNG.md`.

## Steps (one chat each)

| No. | Step | Result | Check-in | Status |
|---|---|---|---|---|
| 0 | Neuordnung | tag and branch v1, worker `app` frozen, new folder and structure, `intern` as `tieout-intern`, old folders removed | public link (`app.tieout.workers.dev`) still shows v1, structure and log accepted | done 23.10. |
| 0b | Inhalt neu | `SPEZIFIKATION.md` from zero along Ihre Daten, Zwilling, Ergebnis: objects, screens, Abschluss-Lauf, vocabulary, demo case; every Attio element measured against the three steps; decision what to port from the v1 core; first customer test | specification and customer test accepted | done 23.10.: `SPEZIFIKATION.md`, customer test 1 passed, decisions E1 to E16 taken (delegated by Maxi S. to Claude) |
| 0c | Demo-Daten neu | solution list v3 per `SPEZIFIKATION.md` 7.1: short professional names, 5 projects, at most 8 finds in the main project, realistic amounts, figures for E13 and E14, floor with Mittellohnkosten; spec examples switched | list recomputed by script and by an independent checker, go by Maxi S. | done 23.10.: `Demo_Faelle.md` v3 and `demo_faelle_check.mjs` (every amount, every date, amount audit of the specification); checker found no arithmetic error, 28 notes worked in; go by Maxi S. |
| 1 | Hülle | app created, tokens as `DESIGN.md`, sidebar with the sections "Ihre Daten", "Digitaler Zwilling", "Ergebnis" (specification 4.1), header, Strg K, all navigation points with empty states as in Attio; online at `app-neu` | screenshot next to Attio | built 24.10.: online at `app-neu`, 16 screens shown next to Attio, independent review (13 findings, all fixed), CI green; PR #103 waits for the merge go |
| 2 | Kern | calculation per specification (ported or new), tests against the solution list, amount audit | tests green, amounts unchanged or changed with a go | built 24.10.: `kern/` with 124 tests, every listed amount from `kern/` to the cent, no amount changed, independent review (5 bugs on other data, 7 risks, all re-measured and fixed, see `kern/README.md`); branch `schritt-2-kern`, push and PR wait for the go |
| 3 | Tabellen | view bar, table, sort, filter, columns, footer; projects and Funde with sample data from `kern/` | tables | built 24.10.: "Projekte" (5 projects, sums 22.632,96 € and 8.319,19 € apart) and "Funde" (14 finds, footer "davon mit Kürzungsrisiko" 6.843,00 €), table measured on Attio's "Companies", screens at 1440 and 390 px shown next to Attio; PR #105 waits for the merge go. "Belege" and "Auftraggeber" tables moved to step 4 |
| 4 | Datensätze | project and Auftraggeber: attributes, highlights, tabs, activity, history; decide the draft "making the twin visible" (`SPEZIFIKATION.md` 4.4) | project Wohnpark Mooshaim | open |
| 5 | Funde | calculation path, documents, original on the right, decision, history; second customer test | radiator find F1 played through, test passed | open |
| 6 | Board und Listen | kanban by stage, lists | board Wohnpark Mooshaim | open |
| 7 | Aufgaben, Notizen, Start | tasks from gaps, modal, notes, start page | start page | open |
| 8 | Berichte | figures as reports; third customer test from folder to invoice | report page, test passed | open |
| 9 | Abläufe | canvas one to one as in Attio with triggers, run steps, checks and tasks; "Abschluss-Lauf", "Lauf je Abschlagsrechnung", "Meldung zu Regiebericht"; runs (`SPEZIFIKATION.md` 5.2) | run for the main project, live | open |
| 10 | Backend | sign-in on, company, files, decisions, demo access | two accounts, one file, one approval | open |
| 11 | Frag tieout | only after a team go | optional | open |
| 12 | Umschalten | fourth customer test, worker `app` on the new app, live check | the public link `app.tieout.workers.dev` shows the new app | open |

Phase: the hackathon has ended. tieout is now in product development without a deadline; the goal is a product that is ready for customers and investors. The steps keep their order, and quality comes before speed.

## Customer tests by subagents

Three roles, each a fresh agent without our prior knowledge, given only README, address and one task: **Abrechnerin** (writes the final invoice, 20 years of experience, distrusts software), **Geschäftsführer** (pays, wants to see the benefit in five minutes), **Bauleiter** (knows the site, checks whether the finds are right and whether he can explain them to his fitters). Every test ends with four verdicts and evidence (what was seen, clicked, where it got stuck): **verstanden**, **genutzt** (clicks and time), **würde zahlen** (price points in `../tieout-intern`), **Gamechanger oder nicht** (what is missing). The main chat re-measures every finding. Subagents are no real customers: they find what is unclear, illogical or too many clicks, not real willingness to pay.

| When | Task | Passed when |
|---|---|---|
| after 0b | read the specification, say whether they would buy and what is unclear | all three understand the three steps and name the benefit in one sentence. **Passed 23.10.**, findings in `SPEZIFIKATION.md` section 12, full report with price verdicts in `../tieout-intern/docs/kundentests/` |
| after 5 | find the radiator find, explain the amount, name the gap, decide | all three in under three minutes without help |
| after 8 | play the main project from folder to invoice, print the evidence package | all three "genutzt", at least two "würde zahlen" |
| before the switch-over | full run and comparison with v1 | no verdict worse than v1 |

## Amounts that must not change

Solution list v3, accepted by Maxi S. on 23.10.2026; changes only with his go (all synthetic, from `Demo_Faelle.md`, recomputed by `node docs/demo_faelle_check.mjs`):

- Company: "zusätzlich verrechenbar" 22.632,96 €, "in Klärung" 8.319,19 €.
- Wohnpark Mooshaim: "zusätzlich verrechenbar" 14.620,15 € (davon mit Kürzungsrisiko 6.843,00 €), "in Klärung" 8.073,59 €, Vorprüfung 8.619,00 €, Restforderung 89.274,41 €, Restforderung laut Vertrag 92.882,45 €, Schlussbesprechungs-Blatt Forderung 22.693,74 € and Untergrenze 20.723,80 €.
- Bürohaus Kiefernau 4.852,73 €; Volksschule Ahornbrunn 3.160,08 € and 245,60 € in Klärung.

## Open points

- `kern/` in `app/`: built in step 3 (`file:../kern`, `transpilePackages`, `turbopack.root`). Checked locally (build, tests, word check); `npm ci` on Linux by CI `App` and the Cloudflare preview build of `schritt-3-tabellen` are checked on PR #105 before the merge. Fallback: an npm workspace at the repository root.
- Table rules decided in step 3 (Claude, to be confirmed by Maxi S.): status words "Frist nah, offen", "offen", "nichts offen", "abgeschlossen"; project pages for all five projects; a footer shows only sums `kern/` computes and says "keine feste Summe" when a filter splits a group.
- Delete the old folder `C:\Users\maxis\dev\schlusswerk-team` once the step 0 chat is closed (go given; it was locked while that chat ran in it).
- Cloudflare, measured 24.10.: the GitHub connection itself works (Cloudflare lists `tieout-at/tieout`; no reinstall was needed for `app-neu`). Only the worker `app` still stores the old name `schlusswerk/schlusswerk` and asks to re-authenticate; its builds stay off and it was not touched. Fix it at the switch-over (step 12), when `app` gets the new app.
- Remote branches: the Cloudflare branch list shows many old branches in `tieout-at/tieout` (for example `claude/…`, `engine/…`, `feat/…`, `docs/uebergabe`). Clean up with a go from Maxi S.
- `app/qa-shots/` (local, ignored) holds the Attio reference pictures from Maxi S.'s workspace (since step 3 also `attio/companies.jpg`, the filled table); they must never be committed or published.
- The agent moved from `product/zuruf/` to `agent/`, code unchanged, 54 tests green. Paths inside `agent/` still name `product/zuruf` and `../app`; `npm run app-server` needs the generated data of the v1 app and only works on the branch `v1`.
- Questions for the construction insider: `SPEZIFIKATION.md` section 9 (17 questions, among them the floor rule with the Mittellohnkosten, Festpreise and the Fotodokumentation as Aufmaß) and the 12 questions in `Demo_Faelle.md`.
- Website: stays as Maxi D. built it (Wien 21, electrical, 5.546 €); decided by Maxi S. on 23.10.2026 after a side by side comparison. App demo data do not need to match it. Two word proposals for Maxi D. (his decision): "Erbracht" instead of "Gebaut", and "zusätzlich verrechenbar" also in the Ebene 2 table, where it now says "Offen verrechenbar" for the same amount as the result card. The discarded attempt is on the local branch `website-demo-v3` (never pushed); delete it with a go.
- `agent/` docs (`GESTALTUNG.md`, `PLAN.md`) still use Wien 21 as an example; to be switched when the agent is touched.
- Names: "Mooshaim" is close to the real Moosham (a castle and two hamlets); kept by Maxi S. on 23.10.2026 because it is a project, not an Auftraggeber.
- Private repository: report of customer test 1 in `../tieout-intern/docs/kundentests/`, commit there with a go.
- Draft, not decided: making the twin visible (input Maxi D., 23.10.2026), `SPEZIFIKATION.md` 4.4. Recommendation: "Zwilling-Übersicht" (the website picture with real counts) in step 4, "Belegabdeckung" in step 5 or 8, no free graph view, not on the Abläufe canvas. Maxi S. decides at step 4.
