# Schlusswerk: scope of MVP and v1

As of: 22.10.2026, adapted to Dossier v3 on 22.10.2026 (go from Maxi S. on 22.10.2026). Basis: **Dossier v3**, sections 3, 12, 13, 15 (previously v2). Later decisions take precedence and are entered here with their date.

## Goal

An internal review tool that can actually be operated. First with synthetic data (MVP), then with real project folders (v1 = **stage 0** (Stufe 0) in v3). One codebase for both. No customer access: the customer receives report, Excel and export file. **[new 22.10., v3]** Structure in three levels: company → project → application. The first and only application until R5 is the final invoice (Schlussrechnung).

| Stage | Date | Purpose |
|---|---|---|
| MVP v0.9 | Sat 31.10.2026 | #glaubandich, first demonstrations |
| MVP v1.0 | KW 45 (until 8.11.) | Coffee meetings with insider candidates: candidate marks errors; hackathon |
| v1 (stage 0) | Freeze Sun 6.12.2026 | real checks by M and I |
| v1.1 | 6.1.2027 | Pre-check on real data, final invoice draft on real data, ÖNORM export, BMD verified, plan index diff |

## MVP: what is included

**[new 22.10., v3] Company level**

0. **Company overview:** fictitious Haustechnik Beispiel GmbH with 8 projects: status (traffic light), contract sum, open billable, next deadline (as a date); total "offen verrechenbar" (open billable) across all projects, calculated by the calculation core. A click leads into the project. From v1.0: **GC history (GU-Historie)** per client (cuts, accepted change orders, payment behaviour) from the synthetic earlier projects.

**Project level** (Wohnhausanlage Wien 21, fully worked out; the 7 other projects have only overview and ledger)

1. **Project overview** (previously "Cockpit"): project, contract sum, "Schlussrechnung legen bis" (submit final invoice by; date, no countdown), three figures (billable now / notified and open / lost), approval progress, step bar import → records → reconciliation → review and approve.
2. **Folder:** documents as records; type, version (plan index), duplicates; evidence matrix. Import moment optional (no longer in the demo script).
3. **Ledger:** all bill of quantities (LV) positions with LV quantity, performed (measurement (Aufmaß)), invoiced, paid, difference, traffic light; filter, search.
4. **[new 22.10., v3] Timeline:** all events in order: mail, daywork (Regie), photo, field report (Zuruf), plan index, invoice, payment. Every entry opens its source.
5. **[new 22.10., v3] WhatsApp scene (mock):** a fitter sends a photo and a voice message, the agent replies with a summary, a tap on "Ja" (yes), the entry appears in the timeline. Acted out, no real agent, no real number. The example must be HVAC and plumbing (HKLS) (see decisions).

**Final invoice application**

6. **Findings and evidence panel:** chain of evidence per item, original with highlighted passage, calculation; two-stage approval: accept (M) / approve (I) / discard / needs a lawyer. **[new 22.10., v3]** Every finding shows the source of its evidence (file, mail, paper, photo, field report).
7. **Pre-check from the general contractor (GU) perspective (Vorprüfung aus GU-Sicht)** (v1.0): positions the GU would cut, with the missing evidence; comparison with the fictitious GU correction sheet.
8. **Final meeting sheet (Schlussbesprechungs-Blatt)** (v1.0): items with lower bound, print-ready.
9. **[new 22.10., v3] Final invoice draft** (v1.0): all positions with quantity, price, surcharges, price adjustment (Preisumrechnung), deductions, interim payments, retentions and payment amount; every line with evidence. Builds on the existing review cascade. Clearly marked as a draft: approval by the invoicing specialist, sending by the company (legal question R4).
10. **Export** (v1.0): Excel (real); report, sheet and draft as print page.
11. Notice "Synthetische Daten · fiktiver GU" (synthetic data · fictitious GU) on every page.

In the MVP, approvals are stored in the browser, with "Demo zurücksetzen" (reset demo).

## v1 (stage 0): what is added (KW 45–49, Dossier v3 15.4)

**[changed 22.10., v3]** Data model company → client → project → objects with source, history and status (KW 45–46). Real folder import, record per document with source and correction, LV (ÖNORM A 2063, PDF), measurement Excel, daywork (OCR, signature), invoices and payments, pricing LV × K7, mail extraction, WhatsApp export as a file, review catalogue v0, evidence package (Beweispaket) PDF, coding sheet (a)–(d) **plus source of the evidence**, database in the EU, separated per company. The company level stays narrow in stage 0: company, client, project list.

## Not included (neither MVP nor v1)

**[changed 22.10., v3]** Some items are no longer "never" but "later" (stage in parentheses, Dossier v3 15.2).

- Customer login (read-only view at the earliest in stage 2)
- AI chat; "Frag den Zwilling" (ask the twin) only as a later candidate
- Real WhatsApp agent (stage 2, only after R4 and clarification with the works council; in the MVP only as a scene)
- Integration with ERP, AVA, CRM, mailbox, calls (stage 3; in v1 only files)
- Company applications as a real function (portfolio, GC history over real data; in the MVP synthetic only)
- Plan view with pins, BIM, DWG (stage 3)
- Real-time budget, warehouse, ESG
- Own photo app
- Deadline countdown, automatic deadline calendar, § 1170b tracker
- Estimating (Kalkül, pricing of new offers)
- Bonus settlement
- GAEB, Germany
- Personnel data, evaluation per employee, scoring
- Contact with the GU, legal assessment, the word "Claim"

## Rules for the product

- The AI delivers facts with sources, the calculation is code (amounts in cents).
- Every figure is clickable and leads to the original.
- The human approves every line.
- Schlusswerk never says whether a deadline is preclusive. Obstruction (Behinderung), acceleration (Forcierung) and disputed clauses: "braucht Anwalt" (needs a lawyer).
- Synthetic findings are never output as real findings.
- **[new 22.10., v3]** Nothing is overwritten: every change is a new version with time, origin and status.
- **[new 22.10., v3]** Employees appear only as sender and role (e.g. "Monteur, Trupp 2" (fitter, crew 2)), never with names, wage or performance data.
- **[new 22.10., v3]** The agent records, it never decides on billability and never talks to the GU.

## Decisions

| Date | Decision |
|---|---|
| 22.10.2026 | Plan approved (chat 22.10.). No fixed competition, targets as in the table above |
| 22.10.2026 | Patterns from reebuild and Kuro according to `Inspiration_Muster.md` |
| 22.10.2026 | UI not in our own style, but derived from professional references (Maxi). Approach: reference set → measurement sheet → gate 1 → component list → design system → key screens → gate 2 |
| 22.10.2026 | **Gate 1 (Maxi):** league = reebuild, Kuro, Stratos + Linear, Attio, Harvey, Ramp, Rossum. Font Inter. Base tone cool-neutral (reebuild product, Attio), dark mode following Linear. Primary button ink. Accent = neutral placeholder, to be agreed later with the website team |
| 22.10.2026 | Boards A/B/C outdated; direction C and the word "Forcierung" rejected |
| 22.10.2026 | **Dossier v3 authoritative** (Maxi D.). Scope extended by company level, timeline, WhatsApp scene, final invoice draft, source of the evidence. The terms "Check" and "Ledger" stay. Go from Maxi S. |
| 22.10.2026 | **Decided (go Maxi S.):** The 7 other projects get small datasets of their own, their amounts are calculated by the calculation core (no sums set by hand) |
| 22.10.2026 | **Decided (go Maxi S.):** The 6 field reports are additional evidence for existing items; the 2 field reports without a daywork report become 2 new items in "angemeldet und offen" (notified and open). List 1 stays 27.410,00 €, list 2 grows. Implemented in `Demo_Faelle.md` v2 (list 2: 11.282,30 €) |
| 22.10.2026 | **Decided (go Maxi S.):** Example in the WhatsApp scene HVAC and plumbing instead of electrical (v3 names "Steckdose versetzt" (socket relocated), the project is an HVAC and plumbing lot) |
