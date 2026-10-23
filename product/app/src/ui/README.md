# App components

Since 22.10.2026 the app is the source of the UI foundation. Rules, terms and the reference for every component from v2 are in `../../../ui-fundament/project/README.md`; new or changed components are listed here, each with its reference.

| Component | File | Reference |
|---|---|---|
| Brand Tieout (23.10.): logo mark and wordmark at the top of the sidebar, below it the company as workspace; collapsed shows only the logo mark | `Logo.tsx` | Website header (`website/components/ui/Logo.tsx`), Linear (brand at the top, workspace below) |
| Settings (23.10.): sections with rows, label on the left, value on the right, lines instead of boxes; profile and members only with sign-in | `Einstellungen.tsx`, `konto.css` | Linear "Settings", Attio "Workspace settings" |
| Sign-in page (23.10., switched off): paper with plan grid, square buttons in ultramarine like the website, one narrow column | `Anmelden.tsx`, `konto.css` | Website tieout, Linear sign-in |
| Frame (23.10.): sidebar and content, sign-in page without frame | `Rahmen.tsx` | Linear, Attio |
| Sidebar (24.10.): company as a workspace tile with menu, search (Ctrl K), projects in two groups with a building glyph each, expandable, one counter (open items), "Beispieldaten" in the footer; collapsed rail with glyphs; drawer on the phone | `Seitenleiste.tsx`, `Bauglyphe.tsx`, `Suche.tsx`, `styles/seitenleiste.css` | Linear (workspace at the top, "Your teams" as a tree, Cmd K), Attio (group label), website blueprint grid and ultramarine |
| Page header | `Seitenkopf.tsx` | Linear header, Attio |
| Key figure | `Kennzahl.tsx` | reebuild project overview R-C, Stripe overview. Since 23.10. without lines and dividers, spacing only; on the phone horizontally scrollable with an edge fade |
| Panel | `Panel.tsx` | Linear, Attio (border instead of shadow) |
| Status marker | `Statusmarke.tsx` | Linear labels |
| Status | `Stand.tsx` | Linear status column, reebuild approval |
| Step bar (flow, new 22.10.) | `Schrittleiste.tsx`, `ablauf.css` | Linear project "Milestones" (columns with a number), Stripe payment timeline (marker on a line), reebuild R-E (fixed, numbered steps). Chosen over the Stripe setup checklist (vertical, too much height and text) and reebuild pills (status only, no number). Every step shows the number from the calculation core and is a link as a whole (Belege, Belege, LV-Positionen, Posten). Step 4: one stroke per item in a fixed order, colored by status (instead of a progress ring without content) |
| Item table (Posten) | `PostenTabelle.tsx` | Linear "Group by", reebuild R-B, Ramp (notice on the row) |
| Row navigation | `Zeilennavigation.tsx` | Linear (click, Enter, j/k) |
| Timeline | `Zeitachse.tsx` | Linear activity (icon on the line), Attio timeline (month headers), filters as tabs with counters |
| WhatsApp scene (mock) | `WhatsAppSzene.tsx` | Messenger chat, neutral without a third-party brand; paper colors like evidence (Belege) |
| LV-Positionen | `PositionenTabelle.tsx` | reebuild R-B, Linear "Group by", Attio search above the table. Row 36 px, header 32 px without fill, fixed columns (`.tab-liste`); on the phone the right edge fades out while more columns follow (`.tw`, `.positionen-rahmen`, controlled by scrolling); column „Nächste AR“ (next interim invoice) shows the quantity from the calculation core, no marker per row |
| Evidence matrix and document list (Belege) | `Belege.tsx` | Hebbia Matrix, Harvey Review Table, Kuro K-B. Single line, an empty cell means no evidence (no word), a row with an item (Posten) opens it via click, Enter, j/k |
| **Dashboard** (24.10., UI round 1 step 2, option A): one big number „Jetzt verrechenbar“ on the plan grid with a bar per project (ultramarine in four steps, grows on load), „Als Nächstes“ by deadline (calendar sheet, accent button to the first open item, items with deduction risk first via `zuEntscheiden` in `daten/demo.ts`), side figures, project cards with building glyph, traffic light word, both lists and approval strokes, closed projects as quiet rows | `../app/page.tsx`, `styles/dashboard.css` | Stripe overview (one number), Linear „My issues“ (next steps), Attio cards, website plan grid |

## Project list with traffic light

Since 24.10. the start page is the dashboard (cards instead of this table); the traffic light words and rules below still apply to the cards.


- One row per project, single line (36 px): short code (muted, fixed width) and name, client (Auftraggeber) as a separate muted column, traffic light as a word, date, contract, the two lists separately.
- Phone (up to 640 px): header with „Projekt“ (project) and „Jetzt verrechenbar“ (billable now); per project name and amount at the top, traffic light and date below (Linear mobile: title with meta line).
- Groups: „Im Abgleich“ (in reconciliation) with amounts per project, „Schlussrechnung gelegt oder abgeschlossen“ (final invoice submitted or closed) without amounts, group header with counter only. Last row: totals of all projects from the calculation core.
- **Traffic light as a word without a dot**, color only as text color for „Bald legen“ and „Beträge offen“ (since the polish on 22.10., `marken.css`). Rule in the calculation core (`engine/firma.ts`), fixed words:

| Traffic light | Word | Token | Meaning |
|---|---|---|---|
| red | Bald legen (submit soon) | `neg` | deadline to submit the final invoice (Schlussrechnung) at most 21 days after the reference date, and amounts open |
| yellow | Beträge offen (amounts open) | `warn` | billable now or notified and open above 0 |
| green | Nichts offen (nothing open) | `pos` | both lists 0 |
| gray | Kein Abgleich (no reconciliation) | neutral | final invoice submitted or closed |

`neg` and `pos` take on an additional meaning here (otherwise: blocked/calculation error and confirmed respectively). The word carries the meaning; the color is only reinforcement.
- No countdown, only the date. Unknown values stay empty, never „–“.

## Text in the interface

Little text: no introductory sentences, no explanatory sentences, no separator dots „·“, no dashes as punctuation. One piece of information per cell; meaning comes from the column header, group header and tooltip. `fundament.test.ts` checks this.
