# Plan: Schlusswerk MVP

As of: 22.10.2026, adapted to Dossier v3 on 22.10.2026 (go from Maxi S. on 22.10.2026). Scope and exclusion list: `Umfang_v1.md`. Patterns: `Inspiration_Muster.md`. Cases and amounts: `Demo_Faelle.md`.

## Result

An internal review tool that can actually be operated, on synthetic data. **[changed 22.10., v3]** It shows the path **company → project → application**: you start in the company overview of the fictitious Haustechnik Beispiel GmbH (8 projects), go into a project (Wohnhausanlage Wien 21, HVAC and plumbing lot (HKLS-Los), 1,24 Mio. €, fictitious general contractor (GU)) and there into the first application, the final invoice (Schlussrechnung). All amounts come from real calculation code, and every figure leads to the highlighted passage in the original. From KW 46 the same code becomes stage 0 (Stufe 0, v1) with real folders.

Targets (dates unchanged): v0.9 by Sat 31.10.2026 (#glaubandich), v1.0 in KW 45 (insider candidates mark errors, hackathon), stage 0 freeze Sun 6.12.2026, v1.1 by 6.1.2027.

**[new 22.10., v3] What belongs in which version (Dossier v3, 14 and 15.3):**

| Version | Content |
|---|---|
| v0.9 (Sat 31.10.) | Company overview, project overview, ledger, evidence panel, three lists, timeline, WhatsApp scene as mock; precalculated |
| v1.0 (KW 45) | plus final meeting sheet (Schlussbesprechungs-Blatt), pre-check from the GU perspective (Vorprüfung aus GU-Sicht), final invoice draft, Excel export, GC history at company level |

## Design direction

- Patterns from reebuild, Kuro and Stratos, not their look (details in `Inspiration_Muster.md`). **[new 22.10., v3]** Stratos is the model for the navigation company → detail.
- UI only from the UI foundation (gate 1 decided, gate 2 open). Light and dark equally valued, desktop first, phone 390 px readable.
- **[changed 22.10., v3]** Two wow moments according to demo script v3: the field report (Zuruf: a voice message becomes an entry in the timeline) and the click on an amount that opens the highlighted passage in the original. The import moment ("Ordner wird Ledger", folder becomes ledger) is no longer in the script and moves back (optional, phase 4).
- **[new 22.10., v3]** For now, the word "Zwilling" (twin) does not appear in the navigation, because it is unverified whether it resonates with owners (Dossier v3, open question 13). Navigation is simply called "Projekte" (projects), "Auftraggeber" (clients), project name. In the pitch, "twin" may be said. Easy to swap later.

## Technology

| Part | Choice |
|---|---|
| App | Next.js 16, TypeScript, Tailwind v4, shadcn (Base UI) |
| Calculation core | own TypeScript module, amounts in cents, tests with Vitest |
| Data | Generator script (reproducible): PDFs, measurement (Aufmaß) Excel, mails (.eml), photos with EXIF, solution list. **[new 22.10., v3]** plus: company with 8 projects and clients, 6 field reports (photo, voice message as text transcript, timestamp) |
| Data model | **[new 22.10., v3]** Levels company → client (GU) → project → objects. Every object with source, time, channel (folder, WhatsApp, later integration), status and confirmed-by; nothing is overwritten (history). Employees only as a role, never with names or performance data (§ 96a ArbVG) |
| Document view | pdf.js with highlighting from the generator coordinates |
| MVP state | Approvals in the browser, "Demo zurücksetzen" (reset demo); v1: EU database per company (from KW 46) |
| Hosting | Demo with synthetic data: Vercel Frankfurt. Real data only in an EU environment, separated per company (choice open, Dossier v3 section 14). Code in `product/app/` of the team repo github.com/schlusswerk/schlusswerk (private), changes via branch and pull request |
| AI | Phase 5: Claude reads the synthetic PDFs, result stored, accuracy measured against the solution list |

## Sequence

**[changed 22.10., v3]** Phases recut: company level, field reports and timeline are added, pre-check and final meeting move to v1.0.

| Phase | Content | Estimate | Target |
|---|---|---|---|
| 0 | UI foundation; **gate 2** with Maxi. Before that, add three missing components from references: project list with traffic light, timeline, field report view (WhatsApp scene) | ½ day | done except gate 2 and the three components |
| 1a | Calculation core with tests (W21) | done | 58/58 tests |
| 1b | Solution list v2 (`Demo_Faelle.md`: company, 7 other projects, 6 field reports; **done 22.10.**). Extend the data model with company, client, field report and channel without breaking the 58 tests. Generator: 7 small projects calculated by the calculation core; field reports; real PDFs for all documents that appear in a chain of evidence | 1½ days | |
| 2 | App: company overview, project overview, folder with evidence matrix, ledger (380 positions), findings, evidence panel, two-stage approval, timeline, WhatsApp scene (mock) | 2½ days | **v0.9 Sat 31.10.** |
| 3 | Final invoice application complete: pre-check from the GU perspective, final meeting sheet, final invoice draft, Excel export; GC history at company level | 1½ days | **v1.0 KW 45** |
| 4 | Polish, phone, deployment; optional import moment; remaining PDFs | 1 day | |
| 5 | Real AI extraction plus accuracy measurement | 1 day | after v1.0 |

After that, stage 0 according to Dossier v3, 15.4 (data model KW 45–46, folder import, bill of quantities (LV) parser, daywork (Regie), pricing, mails, review catalogue, outputs incl. coding sheet with source of the evidence), freeze 6.12.

**Time budget (Annahme, assumption):** According to v3, Maxi builds at most half of his time while R1 is open. Until 31.10. that is about 4 working days for phases 0 to 2 (estimated 4½). If it gets tight, the WhatsApp scene falls back to a simple image sequence first, not the company overview.

**Build split:** According to v3, co-founder A creates the synthetic demo data (company with several projects, field reports). Proposal for the Sunday round 25.10.: A writes the content (project names, field report texts, GC history, plausibility), the figures are produced in the generator in the repo. Otherwise two datasets come into existence.

## Checks

1. Calculation core automatically: all built-in cases found, 0 false alarms, every euro correct to the cent. **[new 22.10., v3]** Also applies to the 7 other projects and the company total.
2. Figures identical everywhere (company overview, project, lists, sheet, draft, Excel), automatically.
3. Type check, lint, build.
4. Real browser: 3-minute script (**[changed 22.10.]** Dossier v3, 15.3) with stopwatch, light/dark, 1280/1440 px, 390 px.
5. Professional plausibility: reviewer agent as HVAC and plumbing invoicing specialist (HKLS-Abrechner), then real construction people (KW 45).
6. Independent UI and code reviewer per phase, measure findings ourselves, before/after to Maxi.
7. **[new 22.10., v3]** No personnel data: field reports and approvals show only roles to the customer, no evaluation per person.

## Status

| Date | What |
|---|---|
| 22.10. | Plan approved; pattern catalogue, scope, demo cases (recalculated, all OK) written; boards built |
| 22.10. | Phase 0: boards A/B/C rejected (own style). New approach: measure references → gate 1 (Inter, cool-neutral, ink) → UI foundation v1 → reviewer ("Liga nicht erreicht", league not reached) → v2 with all system findings fixed. Gate 2 open |
| 22.10. | Phase 1a finished: calculation core in the repo, 58/58 tests, all cases correct to the cent. Open: phase 1b (PDFs), phase 2 (app) |
| 22.10. | Dossier v3 incorporated: company → project → application, company overview with 8 projects, field reports and WhatsApp scene, timeline, final invoice draft in v1.0, phases recut. Go from Maxi S. |
| 22.10. | Solution list v2 written (company, 7 projects, 6 field reports, GC history), recalculated by script, independently reviewed. Next step: three UI components, gate 2 |
