Schlusswerk is an internal review tool for Austrian HVAC/plumbing (HKLS) and electrical subcontractors: before the final invoice (Schlussrechnung), it reconciles the bill of quantities (LV), measurement records (Aufmaß), time-and-materials work (Regie), invoices, plans and mails and shows every euro with its evidence (Beleg). This UI foundation is **not invented but derived from professional software**. Every value and every component names its reference.

## Where the values come from

- **Lead references:** reebuild (construction back office, product views), Kuro (source locations with the original, upload history), Stratos (digital twin as a layered picture).
- **Benchmarks:** Linear (density, dark mode, triage), Attio (light tool look, record history), Harvey (cells with quote and lock), Ramp (reconciliation on the row), Rossum (review status yellow/green/red).
- **Patterns without screenshots:** BuildPass and Oracle Textura (deduction reason from a fixed list), Siteline (input vs. calculated), Payapps (history per change order (Nachtrag)), Trunk Tools (plan comparison), Document Crunch („fehlt im Vertrag“, missing from the contract).
- Measured on 22.10.2026 with `getComputedStyle` and pixel analysis. Decisions from Gate 1 (Maxi, 22.10.): typeface Inter, cool-neutral base tone, primary button in ink, accent as a placeholder until aligned with the brand.

## Language and content

- German (Austria), short, factual, without exclamation marks. No explanatory text below headings; empty state: „Keine Treffer.“ (no matches).
- Every view starts with **one sentence with figures**: „12 Posten aus 165 Dokumenten. 27.410,00 € jetzt verrechenbar.“ (12 items from 165 documents, 27.410,00 € billable now) (Kuro, Linear).
- Amounts: `27.410,00 €`, minus as `−`, tabular figures. Quantities with unit: `14 Stk`, `172 m`. Date `18.09.2026`, with time `22.10.2026, 14:12`.
- **Fixed terms** (always exactly like this): Jetzt verrechenbar · Angemeldet und offen · Verloren · Braucht Anwalt · Vorprüfung aus GU-Sicht · Kürzungsrisiko · Übernommen · Freigegeben · Schlussrechnung legen bis · Preisumrechnung (ÖNORM B 2111) · Mehrmenge · Regie. (Billable now, notified and open, lost, needs lawyer, pre-check from the general contractor's (GU) perspective, deduction risk, accepted, approved, submit final invoice by, price adjustment, additional quantity, time-and-materials work.)
- **Never:** the word „Claim“; statements on whether a deadline is preclusive; legal classifications such as „Forcierung“ (acceleration); countdowns. Hindrance and disputed clauses only get „Braucht Anwalt“ (needs lawyer).
- Status always as **dot plus word**, never color alone.
- Synthetic data carries the mark „Synthetisch“ (synthetic) in every header and the mark „Synthetisch“ on every evidence page (`doc-muted`, ≥ 4.5:1).
- Anything that does not exist yet is disabled with a tooltip („folgt in Phase 2/3“, follows in phase 2/3). Nothing may look usable and do nothing.

## Colors

- Surfaces: `bg` (app background) → `surface` (panels, tables) → `surface-subtle` (sidebar, table header) → `surface-hover` → `surface-selected` (selected, active).
- **Lines instead of shadows** (Linear, Attio; reebuild uses soft shadows, we do not adopt that): `line` between rows, `line-strong` for panel borders, header and subtotals. Shadows only `shadow-overlay` (toast, menu) and `shadow-page` (document page).
- Text: `text` for content and numbers, `text-secondary` for sublines, `text-muted` for labels and times, `text-disabled` only for disabled elements. All text colors meet 4.5:1 on all surfaces in light and dark (measured, 70 pairs).
- **Primary button in ink:** `action` with `on-action`. The league (reebuild, Attio, Harvey, Ramp) does not color primary buttons in the brand color.
- `accent` is a **placeholder** (Attio blue) for focus ring, links and selected evidence, never for status. It will be replaced after alignment with the brand.
- Semantics following Rossum and reebuild: `pos` confirmed / per contract / billable now; `warn` machine / deviation / open / deduction risk; `neg` blocked / calculation error; `law` only „Braucht Anwalt“. On markers always with the matching `-soft` background.
- Evidence: paper `doc-paper` stays white in both themes; source location `doc-mark` with underline `doc-mark-line`.
- Taken and not to be used: petrol (reebuild), orange (Kuro, Stratos), yellow-green (Ramp).

## Typography

- **Inter** for everything, **JetBrains Mono** for item numbers, file names and page references.
- Levels: `kpi` 28/32 (amounts in key figures), `page-title` 20/28, `section-title` 15/22, `body` 14/21 (sentences), `ui` 13/20 (tables, lists; base size in the tool like Linear), `ui-strong` 13/20 w500 (buttons, row titles), `meta` 12/18, `label` 11/16 w500 in capitals with letter spacing, `mono` 12/18.
- Weights only 400, 500, 600. Slightly negative letter spacing from 13 px (−1 %), positive for labels (+6 %).

## Spacing, radii, sizes

- 4-point grid: `space-1` 4 to `space-8` 32. Panel padding `space-4`, between panels `space-5`, page margin `space-6`.
- Radii: `radius-sm` 4 (markers, chips), `radius-md` 6 (buttons, fields, navigation), `radius-lg` 8 (panels, cards). Consensus of reebuild, Linear, Attio.
- `control-h` 32 for buttons and fields, `row-h` 40 for table rows with a subline, `sidebar-w` 232.
- Focus: 2 px `accent`, 2 px offset, on every interactive element.

## Components and their references

| Component | Reference | Purpose |
|---|---|---|
| AppShell, Seitenleiste | Attio, Linear, reebuild product | Frame and navigation in flow order |
| Seitenkopf | reebuild project header, Linear | Title, facts, one primary action |
| „Synthetisch“ label (in the Seitenkopf) | Mandatory per the scope; shaped like a Linear label | Mark demo data on every page |
| Stand | Linear status column, reebuild approval | Prüfen → Übernommen → Freigegeben (review, accepted, approved) |
| Belegmatrix | Hebbia matrix, Harvey Review Table, Stratos idea „Digital Twin“ | Project twin as a table: item × evidence type |
| Knopf | reebuild, Attio, Linear triage | Actions with keyboard shortcut |
| Statusmarke | Linear labels | List and processing status |
| Prüfstand | Rossum, Harvey | machine / confirmed / blocked on every value |
| Kennzahl | reebuild R-C | the three lists as amounts |
| Schrittleiste | reebuild flow, Kuro „x von y“ (x of y) | Status of the Check |
| Tabelle | reebuild R-B, Linear, Hebbia, Siteline, Ramp | Ledger and findings (Befunde) lists |
| Beleg-Chip | Kuro source locations, Hebbia | Reference to file and page |
| Dokumentbetrachter | Kuro K-A, Rossum | Original with highlighted source location |
| Beweiskette | Linear activity, Payapps | Evidence for an item in chronological order |
| Freigabeleiste | Linear triage, reebuild approval | accept (M) → approve (I) |
| Prüfkaskade | reebuild R-A, BuildPass, Document Crunch | Final invoice from the GU's perspective down to the remaining amount due |
| Upload-Verlauf | Kuro K-B, PlanRadar | new documents, versions, duplicates |
| Toast | Linear, playbook | Confirmation with undo |

Not built yet: final meeting sheet (Schlussbesprechungs-Blatt, print), ledger with all 380 items, plan comparison as an overlay (Trunk Tools), Excel export.

Size tokens: `head-h` 48 (header), `panel-head-h` 44 (every panel header the same), `row-h` 36 / `row-h-2` 48 (table rows via padding), `chip-h` 22, `tab-h` 28, `control-h` 32.

## Icons

Lucide (ISC license), 16 px, stroke 1.75, in `text-muted`; active in `text`. The same family as `lucide-react` in the app code. Evidence types: plan `map`, mail `mail`, measurement record `ruler`, photo `image`, other `file-text`; lawyer `scale`; review status `bot`, `user-check`, `lock`. No emojis.

## Do not use

Gradients, glass or glow effects, colored left card borders, emojis, shadows on panels, more than one accent color, AI chat as the entry point (Kuro pattern deliberately not adopted), real-time cost curves (live operation has been rejected).
