# UI round 1 (brief from Maxi S., 23.10.2026)

The first big polish round of the app. Maxi S. is **not yet satisfied**: "das geht deutlich besser". Goal: a product that looks like a well-funded startup built it. Professional level like Linear, Attio, reebuild. Every chat that works on this round reads this file first and updates the status table at the end.

Inspiration: our website https://tieout-at.pages.dev/ (CI Planraster, ultramarine #1D3BFF), https://dryft.ai/, https://www.reebuild.com/, https://kuro.technology/.

## How we work in this round

- **Options before building.** For bigger changes, first show Maxi S. a choice (artifact or local prototype), then build the chosen option. Where he asks for options, give three.
- **Visual self-control.** Check every change in a real browser (built-in browser and Claude in Chrome): light, dark, 1440 px, narrow. Click through, measure via JavaScript where useful. At the end of each step an independent check against the live app.
- **Spend tokens on quality.** Subagents and parallel sessions where it clearly helps (rules in `_UEBERGABE.md` section 4).
- **More of our blue**, but sparingly and professional.
- Rules unchanged: little text, no "·", no dashes, amounts only from the calculation core, solution list only with Maxi S.'s go, costs only with his go, merge only with green CI, check live after every merge.

## The points (as given by Maxi S.)

### A. Sidebar
1. Must become much better, rethought from scratch. The company block "Haustechnik Beispiel GmbH" looks bad.
2. "Projekte" as a nav item with an empty page makes no sense.
3. Projects should be expandable (collapsible tree).
4. Every project needs a marker in front of it so projects are easy to tell apart. Not the classic small coloured dot. Be creative, take inspiration from the website, maybe something interactive or shimmering. **Three options.**
5. Challenge collapse and expand of the sidebar.
6. Challenge whether "Einstellungen" alone at the bottom is enough.
7. Is the content of the sidebar professional enough?

### B. Demo data
1. Shorten the hundreds of data rows. There is almost too much, which makes every improvement slow. It should be understandable and clean, not huge.
2. Challenge all numbers and dummy data with an independent challenger; update and optimise where needed. Any change to amounts changes `Demo_Faelle.md` and needs Maxi S.'s go.

### C. Dashboard
1. There is no dashboard, although the product is built for one customer (one company).
2. It must look outstanding: little text, understandable, modern, not monotonous, a real wow effect ("a serious techie built this"), still intuitive. **Options.**

### D. Project overview (screenshot 1, `/projekte/w21/`)
1. The flow of the 4 steps looks too weak: more modern, more techie, creative, symmetric, less text. Details on click. Maybe interactive or shimmering. **Three options.**
2. The right column (Regieberichte, Zurufe) squeezes the table and looks unnatural. Find something better.
3. Generally more of our blue in the UI, professional.

### E. Detail pages (findings, rows in tables)
1. When a finding or a document is opened from a table, there must be a way to close it and to go back (small back icon). Decide the best pattern.
2. "Synthetisch" at the top right: put something useful there (a button or similar), otherwise remove for now.

### F. Subpages (screenshot 2, `/projekte/w21/zeitachse/`)
1. Timeline: the content should fill the width, why is there a gap on the right?
2. Challenge all subpages (folder, ledger, timeline, findings) and make them more intuitive. With proposals.

### G. Content challenge
1. Does the product make sense like this? Read the newest documents (README, dossier, product docs) and the website.
2. Maxi S. does not intuitively understand what the tool does. Maybe we are building something useless. Answer honestly.

## Order (recommendation by Claude, 23.10.)

| Step | What | Why in this place | Chat |
|---|---|---|---|
| 0 | **G content challenge** plus analysis for **B data** (proposal only) | Decides what the dashboard and overview must say and how much data stays. Building screens first would mean building them twice | this chat |
| 1 | **A sidebar, E header and back/close** (app frame) | Shared files (`Seitenleiste.tsx`, `layout.tsx`, `rahmen.css`); every page sits inside. Must be stable before parallel work on screens | this chat |
| 2 | **C dashboard** | New start page; needs step 0 (message) and step 1 (place in navigation) | new chat |
| 3 | **D project overview** | Same visual language as the dashboard | same chat as 2 |
| 3b | **Final invoice screen** (proposed by Claude after step 0, needs go): draft plus accepted items, cascade down to the remaining claim, pre-check G1 to G4. All amounts already exist in the calculation core | The result the whole app is about; the demo script (1:30 to 2:35) needs it | same chat as 2 |
| 4 | **F subpages** | Can run in parallel sessions, one per page, once the frame is fixed | new chat |
| B | **Data trimming** after Maxi S.'s go | Touches only `src/demo`, `src/engine` tests, `Demo_Faelle.md`; can run as its own session parallel to steps 1 to 3 | own session |

After round 1: API key and voice note agent online (`_UEBERGABE.md` section 2.2), then plan the launch video.

## Result of step 0 (23.10., two independent reviewers, key claims re-measured by the main chat)

**Verdict: not a useless product, but the app hides it.** The website says it clearly ("Schlussrechnungen, die nichts liegen lassen", built vs billed). The app shows the machine room instead of the result: pipeline counts (165 documents, 12 duplicates, 31 fields corrected), internal words (Ledger, Befunde, Zuruf, Abgleich), five overlapping money pots. And the result itself is missing: there is no final invoice screen, no pre-check from the GU's perspective, no export (routes do not exist; `Seitenleiste.tsx` marks them "folgt in v1.0"). The strongest moment (evidence chain on a finding page) is two correct clicks deep.

Findings with origin:
- "Zwilling" appears on the website, not once in the app (measured on all fetched pages).
- Website and app tell two different "Wien 21": website electrical (socket, 5,546 €), app HKLS (radiator, 27,410.00 €) (seen). Team topic with Maxi D., website is not ours to change.
- 82 % of "jetzt verrechenbar" (22,527.60 of 27,410.00 €) comes from measured quantity above billed and from the contractual price adjustment; the informal sources (voice notes Z5, Z6) are 1,187.00 € and sit in "angemeldet und offen" (calculated from the app's amounts). Whether an AVA already finds the first kind is an assumption; question for the insider interviews. For the story this means: lead with **defending** money (evidence package, pre-check, the GU checks with software) as much as with finding it.
- "Digital twin" with owners is unchecked (dossier v3, section 9, line 494). Show the twin (company level, GU history) rather than name it.
- Countdowns stay out (dossier v3, section 12).
- Speed: the app itself is not slow (measured by the data reviewer: generator 0.16 s, 127 tests 1.3 s, build 24 s, ledger page 26 KB gzip). What slows work is the target-sum solver in the generator and 2.7 MB of generated JSON that agents read.

Data (B), ranked by the data reviewer, the first three re-measured or read by the main chat:
1. P2 to P5: a lump-sum item (`99.01.01A`, `firma/bauen.ts:99`) of 70 to 82 % of the contract is never measured or billed; P3 "SR vorbereiten" with draft 50,598.50 € on a 410,000 € contract.
2. P2 to P5: payments equal partial invoices, no contract rates (`saetze: []`), unlike W21 with the same GU.
3. W21: AR1 dated 31.03.2026 bills 316 items, first measurement sheet is dated 02.04.2026 (measured). Partial invoices are built from percentages, not from measurements.
4. Number of flats inconsistent across LV items (43 to 47, measured by the reviewer only).
5. GU history has no data (P7, P8 only 2 documents each). The script scene at 2:35 has no basis.
6. V1 container: "plus Kran" in the mail vs "Material" in the calculation, wording "Pauschale" vs contract 4.3, slug `anmeldung-…`; "verloren" from a clause reading is close to a legal assessment (rule 5).
7. 44 filler mails carry a calendar week one too low; photo numbers not chronological.
8. Filler: 44 of 50 mails have no content, 34 of 35 photos are "Foto Stiege n", 159 timeline entries of which 32 carry a finding.

Two variants: **A** cut filler only (about 95 documents, 75 timeline entries, 220 pages; all money amounts unchanged; only folder counts in `Demo_Faelle.md` change; about half a day). **B** in addition fix 1 to 5 (fixed number of flats, LV about 150 items, partial invoices from measurements, contract rates everywhere, history for P7 and P8; headline amounts reachable but the solver may fail; 2 to 3 days). LV should not go below about 150 items, otherwise the "needle in the haystack" is gone.

Dashboard content (input for step 2): one sentence with result and next deadline; one big number split into "belegt" / "Beleg fehlt noch" / "angemeldet"; list "Als Nächstes" by deadline with a direct jump to the first open item; share of money that is evidenced only outside ERP (mail, WhatsApp, paper) from the calculation core; GU card once history data exists. Not on it: sum of contract volumes as the main number, document and duplicate counts, the empty traffic-light column.

## Status

| Step | Status | Result |
|---|---|---|
| 0 | done 23.10. | Result above. Open decisions for Maxi S.: guiding line "money and evidence first", final invoice screen in this round (step 3b), terms (Befunde, Ledger, Ordner, Synthetisch), data variant A or B |
| 1 | open | |
| 2 | open | |
| 3 | open | |
| 4 | open | |
| B | open | |
