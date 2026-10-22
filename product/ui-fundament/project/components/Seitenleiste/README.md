# Seitenleiste

Navigation through a Check in a fixed order, with counters; steps not yet built are visible but disabled.

**Reference:** Attio navigation (light, icon + word), Linear (active entry as a gray area, counter on the right, 28 px entries), reebuild (project switcher at the top).

**Usage**
- Order = flow: Übersicht (overview), Ordner (folder), Ledger, Befunde (findings), Vorprüfung aus GU-Sicht (pre-check from the GU's perspective), Schlussbesprechung (final meeting), Export.
- Entries are real links (`<a href>`) so that keyboard and focus work. Active: `aria-current="page"`. Not yet available: `aria-disabled="true"` with a tooltip.
- Only the wordmark „Schlusswerk“ until there is a logo. Light/dark toggle at the bottom with `sun-moon`.
