# Tabelle

Dense working table, grouped by list with subtotals; one row per item, provenance shown small at the value.

**Reference:** Linear (13 px, „Group by“ with group header, j/k navigation, no boxes), reebuild „Ausgelesene Positionen“ (extracted items; item no., description), Hebbia (provenance directly at the value), Siteline (calculated values in `text-secondary`), Ramp (notice directly on the row).

**Usage**
- Fixed column widths (`table-layout: fixed`) so nothing overflows; truncate long texts with „…“.
- Row height via padding: single line `row-h` (36), with subline `row-h-2` (48).
- Item number in `mono`, muted, before the title (like Linear „DRV-8852“).
- Deduction risk as a small warning icon at the amount, not as an additional marker.
- Every row is focusable (`tabindex="0"`), Enter opens, j/k moves between rows.
