# Bauteile der App

Seit 22.10.2026 ist die App die Quelle des UI-Fundaments. Regeln, Begriffe und die Vorlage jedes Bauteils aus v2 stehen in `../../../ui-fundament/project/README.md`; neue oder geänderte Bauteile stehen hier, jeweils mit Vorlage.

| Bauteil | Datei | Vorlage |
|---|---|---|
| Seitenleiste mit Abschnitten Firma und Projekt | `Seitenleiste.tsx` | Attio-Navigation mit Gruppen-Label, Linear (aktiver Eintrag als Fläche, Zähler rechts), Stratos (Firma → Detail) |
| Seitenkopf | `Seitenkopf.tsx` | Linear-Kopfzeile, Attio |
| Kennzahl | `Kennzahl.tsx` | reebuild-Projektübersicht R-C |
| Panel | `Panel.tsx` | Linear, Attio (Rand statt Schatten) |
| Statusmarke | `Statusmarke.tsx` | Linear-Labels |
| Stand | `Stand.tsx` | Linear-Statusspalte, reebuild-Freigabe |
| Schrittleiste | `Schrittleiste.tsx` | reebuild-Ablauf, Kuro „x von y“ |
| Befundtabelle | `BefundTabelle.tsx` | Linear „Group by“, reebuild R-B, Ramp (Hinweis an der Zeile) |
| Zeilennavigation | `Zeilennavigation.tsx` | Linear (Klick, Enter, j/k) |
| **Projektliste mit Ampel** (neu) | `../app/page.tsx` | Linear-Projektliste (Gruppen nach Zustand, Zähler im Gruppenkopf), reebuild R-B (Beträge rechtsbündig, Summen), Statusmarke für die Ampel |

## Projektliste mit Ampel

- Eine Zeile pro Projekt: Kurzzeichen (mono, gedämpft) und Name, darunter der Auftraggeber. Ampel, Datum mit Bedeutung darunter, Auftrag, die zwei Listen getrennt.
- Gruppen: „Im Abgleich“ mit Summen, „Schlussrechnung gelegt oder abgeschlossen“ ohne Beträge. Darunter die Summe aller Aufträge.
- **Ampel als Punkt plus eigenes Wort**, nie nur Farbe. Regel im Rechenkern (`engine/firma.ts`), Wörter fest:

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
