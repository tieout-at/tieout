# UI review reports (22.10.2026): what is done, what remains open

Two independent reviewer rounds: (1) first boards A/B/C, (2) UI foundation v1 and key screens. Verdict of round 2: **"Liga noch nicht erreicht"** (league not yet reached). The figures were correct everywhere, but density, operation and project twin fell short. I measured the values again myself, all confirmed. After that, v2 was built and published.

## Done in v2 (measured myself at 1280 and 1440 px)

| Finding | before | after |
|---|---|---|
| Table overflows | 825 px table in 619 px panel | no overflow in all 5 views (fixed columns, grouped by list) |
| Header zone too tall | 131–144 px header + 37 px yellow bar | 48 px header row, "Synthetisch" (synthetic) mark inside it, facts only on the overview |
| Panel headers uneven | 43 / 47 / 53 px | 44 px everywhere (`panel-head-h`) |
| Grey tones barely distinguishable | text-secondary/muted 1,26:1 | 1,77:1 (light), 2,09:1 (dark) |
| "SYNTHETISCH" unreadable | 2,69:1 | 5,9:1 (`doc-muted`, with border) |
| Panel borders too weak | `line` 1,13:1 | `line-strong` for panels; evidence chips with `field-border` (≥ 3:1) |
| Plan D wrong | 2 per unit (Top) drawn (+7) | 3 per unit, the 14 new ones highlighted, text "3 statt 1 (+14 Stk)" (3 instead of 1 (+14 pcs)) |
| Approval single-stage | only "Übernehmen" (accept) | "Übernehmen" (M) → "Freigeben als Insider" (approve as insider, I), person + real time, "Verwerfen" (discard) asks for a reason from a fixed list, history with multi-level undo |
| Project twin = infographic | hub-and-spoke, 0 clickable elements | evidence matrix (Hebbia/Harvey): position × evidence type, each cell opens the original; upload history (Kuro K-B) |
| Dead controls | 11 of 12 rows without function, tabs without filter | all 13 items open a finding with its own evidence; tabs filter; missing items disabled with tooltip |
| Keyboard | nav and rows not focusable, Ctrl+1 triggered | real links, rows with Enter and j/k, shortcuts ignore Ctrl/Alt/Cmd and held keys |
| Cascade incomplete | without subtotals, warranty retention (Haftrücklass) under the wrong group | structure following reebuild R-A: deductions / retentions / payments with totals and reference base, payments expandable |
| Fixed values | 17 fixed colours, 6/10 px | document colours as tokens (`doc-*`), spacing only 4/8/12/16/20/24/32; sizes as tokens |
| Type scale | 9,5/10,5/12,5/17 px | only steps from `tokens.json`; position number uniformly mono, muted, before the title |
| Template references wrong | "Linien statt Schatten: reebuild" (lines instead of shadows: reebuild), "Hinweisleiste: Attio" (notice bar: Attio) | corrected (Linear/Attio); notice bar removed |
| Space before € | normal space | non-breaking space everywhere |
| Terms | "An den Anwalt markiert" (marked for the lawyer) | "Braucht Anwalt: …" (needs a lawyer: …) |
| Logo | "S" square w700 | word mark only, w600 |

## Open for phase 2 (to be solved in the real app)

1. All figures from the calculation core instead of from `content.js` (today: same values, but set by hand).
2. Ledger with all 380 positions, review status on every cell, lock after approval (Harvey).
3. Real PDFs from the generator (phase 1b) with highlighting from the source coordinates; real page thumbnails and paging within a document.
4. Store the approval history per item permanently (Attio activity); persons from a list instead of fixed.
5. Final meeting sheet (Schlussbesprechungs-Blatt), Excel export, report (phase 3).
6. Below 900 px: navigation as a bar is built, but not yet checked on a real phone.
7. Accent colour: placeholder (Attio blue) until agreed with the website team.
8. The terms "Check" and "Ledger" stay (they appear like this in the dossier); if Dossier v3 defines other terms, align.
9. Professionally reviewed only by AI: installation time, average wage price (Mittellohnpreis), 20 % rule, short texts of positions. Insider candidates review in KW 45.

## Not adopted (with reasons)

- "Fakten aus der Kopfzeile in den Projekt-Umschalter" (move facts from the header into the project switcher): facts are now on the overview. There would be too little space in the switcher.
- "Akzent nie für Status" (never use accent for status): applies now; "Prüfen" (review) is neutral.
