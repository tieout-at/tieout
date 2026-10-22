# Prüfberichte UI (22.10.2026): was erledigt ist, was offen bleibt

Zwei unabhängige Prüferrunden: (1) erste Boards A/B/C, (2) UI-Fundament v1 und Schlüsselbildschirme. Urteil Runde 2: **„Liga noch nicht erreicht“**. Die Zahlen stimmten überall, aber Dichte, Bedienung und Projektzwilling fielen ab. Die Messwerte habe ich selbst nachgemessen, alle bestätigt. Danach v2 gebaut und veröffentlicht.

## Erledigt in v2 (selbst gemessen bei 1280 und 1440 px)

| Befund | vorher | nachher |
|---|---|---|
| Tabelle läuft über | 825 px Tabelle in 619 px Panel | kein Überlauf in allen 5 Ansichten (feste Spalten, gruppiert nach Liste) |
| Kopfzone zu hoch | 131–144 px Kopf + 37 px gelbe Leiste | 48 px Kopfzeile, Marke „Synthetisch“ darin, Fakten nur auf der Übersicht |
| Panel-Köpfe ungleich | 43 / 47 / 53 px | überall 44 px (`panel-head-h`) |
| Grautöne kaum getrennt | text-secondary/muted 1,26:1 | 1,77:1 (hell), 2,09:1 (dunkel) |
| „SYNTHETISCH“ unlesbar | 2,69:1 | 5,9:1 (`doc-muted`, mit Rahmen) |
| Panel-Ränder zu schwach | `line` 1,13:1 | `line-strong` für Panels; Beleg-Chips mit `field-border` (≥ 3:1) |
| Plan D falsch | 2 je Top gezeichnet (+7) | 3 je Top, die 14 neuen markiert, Text „3 statt 1 (+14 Stk)“ |
| Freigabe einstufig | nur „Übernehmen“ | Übernehmen (M) → „Freigeben als Insider“ (I), Person + echte Uhrzeit, Verwerfen fragt Grund aus fester Liste, Verlauf mit mehrstufigem Rückgängig |
| Projektzwilling = Infografik | Hub-and-Spoke, 0 klickbare Elemente | Belegmatrix (Hebbia/Harvey): Position × Belegart, jede Zelle öffnet das Original; Upload-Verlauf (Kuro K-B) |
| Tote Bedienelemente | 11 von 12 Zeilen ohne Funktion, Reiter ohne Filter | alle 13 Posten öffnen einen Befund mit eigenen Belegen; Reiter filtern; Fehlendes deaktiviert mit Tooltip |
| Tastatur | Nav und Zeilen nicht fokussierbar, Strg+1 löste aus | echte Links, Zeilen mit Enter und j/k, Kurztasten ignorieren Strg/Alt/Cmd und gehaltene Tasten |
| Kaskade unvollständig | ohne Zwischensummen, Haftrücklass unter falscher Gruppe | Aufbau nach reebuild R-A: Abzüge / Einbehalte / Zahlungen mit Summen und Bezugsgröße, Zahlungen aufklappbar |
| Feste Werte | 17 feste Farben, 6/10 px | Dokumentfarben als Token (`doc-*`), Abstände nur 4/8/12/16/20/24/32; Größen als Token |
| Schriftskala | 9,5/10,5/12,5/17 px | nur Stufen aus `tokens.json`; Positionsnummer einheitlich mono gedämpft vor dem Titel |
| Vorlagen-Verweise falsch | „Linien statt Schatten: reebuild“, „Hinweisleiste: Attio“ | korrigiert (Linear/Attio); Hinweisleiste entfernt |
| Leerzeichen vor € | normales Leerzeichen | geschütztes Leerzeichen überall |
| Begriffe | „An den Anwalt markiert“ | „Braucht Anwalt: …“ |
| Logo | „S“-Quadrat w700 | nur Wortmarke w600 |

## Offen für Phase 2 (in der echten App lösen)

1. Alle Zahlen aus dem Rechenkern statt aus `content.js` (heute: gleiche Werte, aber von Hand).
2. Ledger mit allen 380 Positionen, Prüfstand an jeder Zelle, Sperre nach Freigabe (Harvey).
3. Echte PDFs aus dem Generator (Phase 1b) mit Markierung aus den Quell-Koordinaten; echte Seitenminiaturen und Blättern innerhalb eines Dokuments.
4. Freigabe-Verlauf je Posten dauerhaft speichern (Attio-Aktivität); Personen aus einer Liste statt fest.
5. Schlussbesprechungs-Blatt, Excel-Export, Bericht (Phase 3).
6. Unter 900 px: Navigation als Leiste ist gebaut, aber noch nicht auf echtem Handy geprüft.
7. Akzentfarbe: Platzhalter (Attio-Blau) bis zur Abstimmung mit dem Website-Team.
8. Begriffe „Check“, „Ledger“ bleiben (stehen so im Dossier); falls Dossier v3 andere Begriffe festlegt, angleichen.
9. Fachlich nur von KI geprüft: Montagezeit, Mittellohnpreis, 20-%-Regel, Positions-Kurztexte. Insider-Kandidaten prüfen in KW 45.

## Nicht übernommen (begründet)

- „Fakten aus der Kopfzeile in den Projekt-Umschalter“: Fakten stehen jetzt auf der Übersicht. Im Umschalter wäre zu wenig Platz.
- „Akzent nie für Status“: gilt jetzt; „Prüfen“ ist neutral.
