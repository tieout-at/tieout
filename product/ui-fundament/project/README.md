Schlusswerk ist ein internes Prüfwerkzeug für österreichische HKLS- und Elektro-Subunternehmer: Vor der Schlussrechnung gleicht es LV, Aufmaß, Regie, Rechnungen, Pläne und Mails ab und zeigt jeden Euro mit Beleg. Dieses UI-Fundament ist **nicht erfunden, sondern aus professioneller Software abgeleitet**. Jeder Wert und jedes Bauteil nennt seine Vorlage.

## Woher die Werte kommen

- **Leitreferenzen:** reebuild (Bau-Backoffice, Produktansichten), Kuro (Fundstellen mit Original, Uploadverlauf), Stratos (Digital Twin als Schichtenbild).
- **Benchmarks:** Linear (Dichte, Dunkelmodus, Triage), Attio (heller Werkzeug-Look, Datensatz-Verlauf), Harvey (Zellen mit Zitat und Sperre), Ramp (Abgleich an der Zeile), Rossum (Prüfstand gelb/grün/rot).
- **Muster ohne Screenshot:** BuildPass und Oracle Textura (Kürzungsgrund aus fester Liste), Siteline (Eingabe vs. gerechnet), Payapps (Verlauf je Nachtrag), Trunk Tools (Planvergleich), Document Crunch („fehlt im Vertrag“).
- Gemessen am 22.10.2026 mit `getComputedStyle` und Pixelanalyse. Entscheidungen aus Gate 1 (Maxi, 22.10.): Schrift Inter, Grundton kühl-neutral, Primärknopf in Tinte, Akzent als Platzhalter bis zur Abstimmung mit der Marke.

## Sprache und Inhalt

- Deutsch (Österreich), kurz, sachlich, ohne Ausrufezeichen. Kein Erklärtext unter Überschriften; Leerzustand: „Keine Treffer.“
- Jede Ansicht beginnt mit **einem Satz mit Zahlen**: „12 Posten aus 165 Dokumenten. 27.410,00 € jetzt verrechenbar.“ (Kuro, Linear).
- Beträge: `27.410,00 €`, Minus als `−`, Tabellenziffern. Mengen mit Einheit: `14 Stk`, `172 m`. Datum `18.09.2026`, mit Uhrzeit `22.10.2026, 14:12`.
- **Feste Begriffe** (immer genau so): Jetzt verrechenbar · Angemeldet und offen · Verloren · Braucht Anwalt · Vorprüfung aus GU-Sicht · Kürzungsrisiko · Übernommen · Freigegeben · Schlussrechnung legen bis · Preisumrechnung (ÖNORM B 2111) · Mehrmenge · Regie.
- **Nie:** das Wort „Claim“; Aussagen, ob eine Frist präklusiv ist; rechtliche Einordnungen wie „Forcierung“; Countdowns. Behinderung und strittige Klauseln bekommen nur „Braucht Anwalt“.
- Status immer als **Punkt plus Wort**, nie nur Farbe.
- Synthetische Daten tragen in jeder Kopfzeile die Marke „Synthetisch“ und auf jeder Belegseite die Marke „Synthetisch“ (`doc-muted`, ≥ 4,5:1).
- Was es noch nicht gibt, ist deaktiviert mit Tooltip („folgt in Phase 2/3“). Nichts darf bedienbar aussehen und nichts tun.

## Farben

- Flächen: `bg` (App-Grund) → `surface` (Panels, Tabellen) → `surface-subtle` (Seitenleiste, Tabellenkopf) → `surface-hover` → `surface-selected` (gewählt, aktiv).
- **Linien statt Schatten** (Linear, Attio; reebuild nutzt weiche Schatten, das übernehmen wir nicht): `line` zwischen Zeilen, `line-strong` für Panel-Rahmen, Kopfzeile und Zwischensummen. Schatten nur `shadow-overlay` (Toast, Menü) und `shadow-page` (Dokumentseite).
- Text: `text` für Inhalt und Zahlen, `text-secondary` für Unterzeilen, `text-muted` für Labels und Zeiten, `text-disabled` nur für Deaktiviertes. Alle Textfarben erfüllen 4,5:1 auf allen Flächen in hell und dunkel (gemessen, 70 Paare).
- **Primärknopf in Tinte:** `action` mit `on-action`. Die Liga (reebuild, Attio, Harvey, Ramp) färbt Primärknöpfe nicht in der Markenfarbe.
- `accent` ist ein **Platzhalter** (Attio-Blau) für Fokusring, Links und gewählte Belege, nie für Status. Wird nach Abstimmung mit der Marke getauscht.
- Semantik nach Rossum und reebuild: `pos` bestätigt / laut Vertrag / jetzt verrechenbar; `warn` maschinell / Abweichung / offen / Kürzungsrisiko; `neg` blockiert / Rechenfehler; `law` nur „Braucht Anwalt“. Auf Marken immer mit dem passenden `-soft`-Grund.
- Belege: Papier `doc-paper` bleibt in beiden Themen weiß; Fundstelle `doc-mark` mit Unterstrich `doc-mark-line`.
- Besetzt und nicht verwenden: Petrol (reebuild), Orange (Kuro, Stratos), Gelbgrün (Ramp).

## Schrift

- **Inter** für alles, **JetBrains Mono** für Positionsnummern, Dateinamen und Seitenangaben.
- Stufen: `kpi` 28/32 (Beträge in Kennzahlen), `page-title` 20/28, `section-title` 15/22, `body` 14/21 (Sätze), `ui` 13/20 (Tabellen, Listen; Grundgröße im Werkzeug wie Linear), `ui-strong` 13/20 w500 (Knöpfe, Zeilentitel), `meta` 12/18, `label` 11/16 w500 in Großbuchstaben mit Sperrung, `mono` 12/18.
- Gewichte nur 400, 500, 600. Leicht negative Sperrung ab 13 px (−1 %), positive bei Labels (+6 %).

## Abstände, Radien, Größen

- 4er-Raster: `space-1` 4 bis `space-8` 32. Panels innen `space-4`, zwischen Panels `space-5`, Seitenrand `space-6`.
- Radien: `radius-sm` 4 (Marken, Chips), `radius-md` 6 (Knöpfe, Felder, Navigation), `radius-lg` 8 (Panels, Karten). Konsens aus reebuild, Linear, Attio.
- `control-h` 32 für Knöpfe und Felder, `row-h` 40 für Tabellenzeilen mit Unterzeile, `sidebar-w` 232.
- Fokus: 2 px `accent`, 2 px Abstand, auf jedem bedienbaren Element.

## Bauteile und ihre Vorlagen

| Bauteil | Vorlage | Wofür |
|---|---|---|
| AppShell, Seitenleiste | Attio, Linear, reebuild-Produkt | Rahmen und Navigation in Ablauf-Reihenfolge |
| Seitenkopf | reebuild-Projektkopf, Linear | Titel, Fakten, eine Primäraktion |
| Kennzeichnung „Synthetisch“ (im Seitenkopf) | Pflicht aus dem Umfang; Form wie eine Linear-Marke | Demo-Daten auf jeder Seite kennzeichnen |
| Stand | Linear-Statusspalte, reebuild-Freigabe | Prüfen → Übernommen → Freigegeben |
| Belegmatrix | Hebbia-Matrix, Harvey Review Table, Stratos-Idee „Digital Twin“ | Projektzwilling als Tabelle: Position × Belegart |
| Knopf | reebuild, Attio, Linear-Triage | Aktionen mit Tastenkürzel |
| Statusmarke | Linear-Labels | Liste und Bearbeitungsstand |
| Prüfstand | Rossum, Harvey | maschinell / bestätigt / blockiert an jedem Wert |
| Kennzahl | reebuild R-C | die drei Listen als Beträge |
| Schrittleiste | reebuild-Ablauf, Kuro „x von y“ | Stand des Checks |
| Tabelle | reebuild R-B, Linear, Hebbia, Siteline, Ramp | Ledger und Befundlisten |
| Beleg-Chip | Kuro-Fundstellen, Hebbia | Verweis auf Datei und Seite |
| Dokumentbetrachter | Kuro K-A, Rossum | Original mit markierter Fundstelle |
| Beweiskette | Linear-Aktivität, Payapps | Belege eines Postens in Zeitfolge |
| Freigabeleiste | Linear-Triage, reebuild-Freigabe | übernehmen (M) → freigeben (I) |
| Prüfkaskade | reebuild R-A, BuildPass, Document Crunch | Schlussrechnung aus GU-Sicht bis zur Restforderung |
| Upload-Verlauf | Kuro K-B, PlanRadar | neue Dokumente, Versionen, Duplikate |
| Toast | Linear, Playbook | Bestätigung mit Rückgängig |

Noch nicht gebaut: Schlussbesprechungs-Blatt (Druck), Ledger mit allen 380 Positionen, Planvergleich als Überlagerung (Trunk Tools), Excel-Export.

Größen-Token: `head-h` 48 (Kopfzeile), `panel-head-h` 44 (jeder Panel-Kopf gleich), `row-h` 36 / `row-h-2` 48 (Tabellenzeilen über Innenabstand), `chip-h` 22, `tab-h` 28, `control-h` 32.

## Symbole

Lucide (ISC-Lizenz), 16 px, Strich 1,75, in `text-muted`; aktiv in `text`. Dieselbe Familie wie `lucide-react` im App-Code. Belegtypen: Plan `map`, Mail `mail`, Aufmaß `ruler`, Foto `image`, sonstiges `file-text`; Anwalt `scale`; Prüfstand `bot`, `user-check`, `lock`. Keine Emojis.

## Nicht verwenden

Verläufe, Glas- oder Glow-Effekte, farbige Karten-Ränder links, Emojis, Schatten auf Panels, mehr als eine Akzentfarbe, KI-Chat als Einstieg (Kuro-Muster bewusst nicht übernommen), Echtzeit-Kostenkurven (Live-Betrieb ist verworfen).
