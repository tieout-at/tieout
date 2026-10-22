# Seitenleiste

Navigation durch einen Check in fester Reihenfolge, mit Zählern; noch nicht gebaute Schritte sind sichtbar, aber deaktiviert.

**Vorlage:** Attio-Navigation (hell, Symbol + Wort), Linear (aktiver Eintrag als graue Fläche, Zähler rechts, 28 px Einträge), reebuild (Projekt-Umschalter oben).

**Verwenden**
- Reihenfolge = Ablauf: Übersicht, Ordner, Ledger, Befunde, Vorprüfung aus GU-Sicht, Schlussbesprechung, Export.
- Einträge sind echte Links (`<a href>`), damit Tastatur und Fokus funktionieren. Aktiv: `aria-current="page"`. Noch nicht verfügbar: `aria-disabled="true"` mit Tooltip.
- Nur die Wortmarke „Schlusswerk“, bis es ein Logo gibt. Hell/Dunkel-Schalter unten mit `sun-moon`.
