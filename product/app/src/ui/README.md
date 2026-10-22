# Bauteile der App

Seit 22.10.2026 ist die App die Quelle des UI-Fundaments. Regeln, Begriffe und die Vorlage jedes Bauteils aus v2 stehen in `../../../ui-fundament/project/README.md`; neue oder geänderte Bauteile stehen hier, jeweils mit Vorlage.

| Bauteil | Datei | Vorlage |
|---|---|---|
| Seitenleiste: Firma oben, Projekte als Baum ohne Ampelpunkt (Ampel-Wort im Tooltip), aktives Projekt aufgeklappt | `Seitenleiste.tsx` | Linear (Arbeitsbereich oben, „Your teams“ als Baum, aktiver Eintrag als Fläche, Zähler rechts), Attio (Gruppen-Label) |
| Seitenkopf | `Seitenkopf.tsx` | Linear-Kopfzeile, Attio |
| Kennzahl | `Kennzahl.tsx` | reebuild-Projektübersicht R-C |
| Panel | `Panel.tsx` | Linear, Attio (Rand statt Schatten) |
| Statusmarke | `Statusmarke.tsx` | Linear-Labels |
| Stand | `Stand.tsx` | Linear-Statusspalte, reebuild-Freigabe |
| Schrittleiste (Ablauf, 22.10. neu) | `Schrittleiste.tsx`, `ablauf.css` | Linear-Projekt „Milestones“ (Spalten mit Zahl), Stripe-Zahlungszeitleiste (Marke auf einer Linie), reebuild R-E (feste, nummerierte Schritte). Gewählt gegen Stripe-Setup-Checkliste (senkrecht, zu viel Höhe und Text) und reebuild-Pillen (nur Status, keine Zahl). Jeder Schritt zeigt die Zahl aus dem Rechenkern und ist als Ganzes ein Link (Ordner, Ordner, Ledger, Befunde). Schritt 4: ein Strich je Posten in fester Reihenfolge, gefärbt nach Stand (statt Prozentring ohne Inhalt) |
| Befundtabelle | `BefundTabelle.tsx` | Linear „Group by“, reebuild R-B, Ramp (Hinweis an der Zeile) |
| Zeilennavigation | `Zeilennavigation.tsx` | Linear (Klick, Enter, j/k) |
| Zeitachse | `Zeitachse.tsx` | Linear-Aktivität (Symbol auf der Linie), Attio-Zeitleiste (Monatsköpfe), Filter als Reiter mit Zähler |
| Zuruf-Szene (Mock) | `ZurufSzene.tsx` | Chat eines Messengers, neutral ohne fremde Marke; Papierfarben wie Belege |
| Ledger | `LedgerTabelle.tsx` | reebuild R-B, Linear „Group by“, Attio-Suche über der Tabelle. Zeile 36 px, Kopf 32 px ohne Fläche, feste Spalten (`.tab-liste`); Spalte „Nächste AR“ zeigt die Menge aus dem Rechenkern, keine Marke je Zeile |
| Belegmatrix und Dokumentliste | `Ordner.tsx` | Hebbia Matrix, Harvey Review Table, Kuro K-B. Einzeilig, leere Zelle heißt kein Beleg (kein Wort), Zeile mit Befund öffnet ihn per Klick, Enter, j/k |
| **Projektliste mit Ampel** (neu) | `../app/page.tsx` | Linear-Projektliste (Gruppen nach Zustand, Zähler im Gruppenkopf), reebuild R-B (Beträge rechtsbündig, Summen), Statusmarke für die Ampel |

## Projektliste mit Ampel

- Eine Zeile pro Projekt, einzeilig (36 px): Kurzzeichen (gedämpft, feste Breite) und Name, Auftraggeber als eigene gedämpfte Spalte, Ampel als Wort, Datum, Auftrag, die zwei Listen getrennt.
- Gruppen: „Im Abgleich“ mit Beträgen je Projekt, „Schlussrechnung gelegt oder abgeschlossen“ ohne Beträge, Gruppenkopf nur mit Zähler. Letzte Zeile: Summen aller Projekte aus dem Rechenkern.
- **Ampel als Wort ohne Punkt**, Farbe nur als Schriftfarbe bei „Bald legen“ und „Beträge offen“ (seit Politur 22.10., `marken.css`). Regel im Rechenkern (`engine/firma.ts`), Wörter fest:

| Ampel | Wort | Token | Bedeutung |
|---|---|---|---|
| rot | Bald legen | `neg` | Schlussrechnung legen bis höchstens 21 Tage nach dem Stichtag und Beträge offen |
| gelb | Beträge offen | `warn` | jetzt verrechenbar oder angemeldet und offen über 0 |
| grün | Nichts offen | `pos` | beide Listen 0 |
| grau | Kein Abgleich | neutral | Schlussrechnung gelegt oder abgeschlossen |

`neg` und `pos` bekommen hier eine zusätzliche Bedeutung (sonst: blockiert/Rechenfehler bzw. bestätigt). Das Wort trägt die Bedeutung; die Farbe ist nur Verstärkung.
- Kein Countdown, nur das Datum. Unbekannte Werte bleiben leer, nie „–“.

## Text in der Oberfläche

Wenig Text: keine Einleitungssätze, keine Erklärsätze, keine Trennpunkte „·“, keine Gedankenstriche. Eine Information pro Zelle; Bedeutung über Spaltenkopf, Gruppenkopf und Tooltip. `fundament.test.ts` prüft das.
