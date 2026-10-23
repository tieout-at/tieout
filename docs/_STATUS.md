# Status

**As of:** Friday, 23 October 2026, night. Step 0c (Demo-Daten neu) done: solution list v3 (Wohnpark Mooshaim), recomputed by script, independently checked, accepted by Maxi S.; specification switched to it. The website keeps Maxi D.'s version; the app's demo data do not need to match it (Maxi S., 23.10.). Next: step 1 (Hülle).
**Maintenance:** every chat ends by updating this file and `_UEBERGABE.md`. Team status, gates and strategy: `../tieout-intern/_STATUS.md`.

## Where we stand

- **Rebuild from zero (v2), decided 23.10.2026.** UI reference: Attio (app.attio.com) for layout, behaviour and spacing; brand, icons, illustrations and texts are our own (icons from Lucide). Content is rethought from zero along the three steps of the website section 03: **Ihre Daten → Digitaler Zwilling → Ergebnis**.
- **v1 stays live and frozen** at https://app.tieout.workers.dev. Cloudflare worker `app`, automatic builds (production and preview) switched off on 23.10. so that pushes to `main` do not change it; checked after merging #98. Live version 4f4d1872 = PR #97 = tag `v1-archiv`. Code of v1: tag `v1-archiv` and branch `v1`.
- **v2 goes online at a second address** (`app-neu`) from step 1; at the switch-over (step 12) the worker `app` gets the new app.
- **Repository:** one working folder (`tieout`, this repository, public), strategy next to it (`tieout-intern`, private). New structure and clean-up log: `_BEREINIGUNG.md`.

## Steps (one chat each)

| No. | Step | Result | Check-in | Status |
|---|---|---|---|---|
| 0 | Neuordnung | tag and branch v1, worker `app` frozen, new folder and structure, `intern` as `tieout-intern`, old folders removed | public link (`app.tieout.workers.dev`) still shows v1, structure and log accepted | done 23.10. |
| 0b | Inhalt neu | `SPEZIFIKATION.md` from zero along Ihre Daten, Zwilling, Ergebnis: objects, screens, Abschluss-Lauf, vocabulary, demo case; every Attio element measured against the three steps; decision what to port from the v1 core; first customer test | specification and customer test accepted | done 23.10.: `SPEZIFIKATION.md`, customer test 1 passed, decisions E1 to E16 taken (delegated by Maxi S. to Claude) |
| 0c | Demo-Daten neu | solution list v3 per `SPEZIFIKATION.md` 7.1: short professional names, 5 projects, at most 8 finds in the main project, realistic amounts, figures for E13 and E14, floor with Mittellohnkosten; spec examples switched | list recomputed by script and by an independent checker, go by Maxi S. | done 23.10.: `Demo_Faelle.md` v3 and `demo_faelle_check.mjs` (every amount, every date, amount audit of the specification); checker found no arithmetic error, 28 notes worked in; go by Maxi S. |
| 1 | Hülle | app created, tokens as `DESIGN.md`, sidebar with the sections "Ihre Daten", "Digitaler Zwilling", "Ergebnis" (specification 4.1), header, Strg K, all navigation points with empty states as in Attio; online at `app-neu` | screenshot next to Attio | next |
| 2 | Kern | calculation per specification (ported or new), tests against the solution list, amount audit | tests green, amounts unchanged or changed with a go | open |
| 3 | Tabellen | view bar, table, sort, filter, columns, footer; projects and Funde with sample data | tables | open |
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

- Delete the old folder `C:\Users\maxis\dev\schlusswerk-team` once the step 0 chat is closed (go given; it was locked while that chat ran in it).
- Cloudflare: the Git connection of the worker `app` still shows the old name `schlusswerk/schlusswerk` and asks to re-authenticate. Repair it in step 1, when `app-neu` needs a Git connection (Cloudflare docs: reinstall the GitHub app "Cloudflare Workers and Pages"; check the website first, it deploys by `npm run deploy` and does not depend on it).
- The agent moved from `product/zuruf/` to `agent/`, code unchanged, 54 tests green. Paths inside `agent/` still name `product/zuruf` and `../app`; `npm run app-server` needs the generated data of the v1 app and only works on the branch `v1`.
- Questions for the construction insider: `SPEZIFIKATION.md` section 9 (17 questions, among them the floor rule with the Mittellohnkosten, Festpreise and the Fotodokumentation as Aufmaß) and the 12 questions in `Demo_Faelle.md`.
- Website: stays as Maxi D. built it (Wien 21, electrical, 5.546 €); decided by Maxi S. on 23.10.2026 after a side by side comparison. App demo data do not need to match it. Two word proposals for Maxi D. (his decision): "Erbracht" instead of "Gebaut", and "zusätzlich verrechenbar" also in the Ebene 2 table, where it now says "Offen verrechenbar" for the same amount as the result card. The discarded attempt is on the local branch `website-demo-v3` (never pushed); delete it with a go.
- `agent/` docs (`GESTALTUNG.md`, `PLAN.md`) still use Wien 21 as an example; to be switched when the agent is touched.
- Names: "Mooshaim" is close to the real Moosham (a castle and two hamlets); kept by Maxi S. on 23.10.2026 because it is a project, not an Auftraggeber.
- Private repository: report of customer test 1 in `../tieout-intern/docs/kundentests/`, commit there with a go.
- Draft, not decided: making the twin visible (input Maxi D., 23.10.2026), `SPEZIFIKATION.md` 4.4. Recommendation: "Zwilling-Übersicht" (the website picture with real counts) in step 4, "Belegabdeckung" in step 5 or 8, no free graph view, not on the Abläufe canvas. Maxi S. decides at step 4.
