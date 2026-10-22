# Knopf

Primär in Tinte, sonst mit Rand; ein Tastenhinweis zeigt die Kurztaste.

**Vorlage:** reebuild (Radius 6, Gewicht 500, Primärknopf fast schwarz), Attio (Primärknopf `#242629`), Linear-Triage (Tasten 1/2/3/H).

**Verwenden**
- `sw-btn--primary` höchstens einmal pro Bereich. Verb zuerst: „Übernehmen“, „Freigeben als Insider“.
- Größen: `control-h` (32) im Inhalt, `sw-btn--sm` (`tab-h`, 28) in Kopfzeilen und Panel-Köpfen.
- Rand `field-border` (≥ 3:1). Deaktiviert: `aria-disabled="true"` und Tooltip mit Grund.
- Kurztasten reagieren nicht mit Strg, Alt oder Cmd und nicht auf gehaltene Tasten.
