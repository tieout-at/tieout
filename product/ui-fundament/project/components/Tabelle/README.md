# Tabelle

Dichte Arbeitstabelle, nach Liste gruppiert mit Zwischensumme; eine Zeile pro Posten, Herkunft klein am Wert.

**Vorlage:** Linear (13 px, „Group by“ mit Gruppenkopf, j/k-Navigation, keine Kästen), reebuild „Ausgelesene Positionen“ (Pos.-Nr., Bezeichnung), Hebbia (Herkunft direkt am Wert), Siteline (Gerechnetes in `text-secondary`), Ramp (Hinweis direkt an der Zeile).

**Verwenden**
- Feste Spaltenbreiten (`table-layout: fixed`), damit nichts überläuft; lange Texte kürzen mit „…“.
- Zeilenhöhe über den Innenabstand: einzeilig `row-h` (36), mit Unterzeile `row-h-2` (48).
- Positionsnummer in `mono`, gedämpft, vor dem Titel (wie Linear „DRV-8852“).
- Kürzungsrisiko als kleines Warnsymbol am Betrag, nicht als zusätzliche Marke.
- Jede Zeile ist fokussierbar (`tabindex="0"`), Enter öffnet, j/k wechselt.
