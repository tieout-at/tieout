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
| 4 | **F subpages** | Can run in parallel sessions, one per page, once the frame is fixed | new chat |
| B | **Data trimming** after Maxi S.'s go | Touches only `src/demo`, `src/engine` tests, `Demo_Faelle.md`; can run as its own session parallel to steps 1 to 3 | own session |

After round 1: API key and voice note agent online (`_UEBERGABE.md` section 2.2), then plan the launch video.

## Status

| Step | Status | Result |
|---|---|---|
| 0 | in progress | |
| 1 | open | |
| 2 | open | |
| 3 | open | |
| 4 | open | |
| B | open | |
