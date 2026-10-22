# Schlusswerk: Projektregeln

Internes Prüfwerkzeug für österreichische HKLS- und Elektro-Subunternehmer: Vor der Schlussrechnung an den GU gleicht es LV, Aufmaß, Regie, Abschlagsrechnungen, Pläne, Mails und Fotos ab. Erst mit synthetischen Daten (MVP), dann mit echten Projektordnern (v1). Kein Kundenzugang.

Auftraggeber ist Maxi S. (kein Entwickler): Deutsch, Ergebnis zuerst, einfache Sprache, Fachbegriffe beim ersten Mal übersetzen. Die Regeln in `../../CLAUDE.md` (Repo-Wurzel) gelten zusätzlich.

## Wo was steht
- Strategie: `../../docs/dossier-v3.md`, Abschnitt 3 (Produkt), 12 (Verworfen), 15 (Bau). Teamstand: `../../_STATUS.md`.
- Produkt-Dokumente in `../docs/`:
  - `Plan_MVP.md`, `Umfang_v1.md` (inkl. Nicht-Liste und Entscheidungen), `Inspiration_Muster.md`, `Pruefberichte_UI.md`.
  - `Demo_Faelle.md`: Lösungsliste der eingebauten Fälle. **Maßgeblich für Beträge.** Nicht im Code ändern, Abweichungen melden; Änderungen an der Liste nur mit Go von Maxi S.
- UI: nur aus `../ui-fundament/` (Design-System, `LIESMICH.md`).
- `src/domain/typen.ts`: Datenmodell Firma → Auftraggeber → Projekt (`Firmendaten`, `Datensatz` = Projektzwilling). Projektstatus (in Ausführung, Schlussrechnung vorbereiten, gelegt, abgeschlossen); nur die ersten beiden werden abgeglichen. Belege kommen über einen Kanal (Ordner, WhatsApp, später Anbindung); Zurufe (`Zuruf`) sind eigene Belege neben den Ordner-Dokumenten, Quellen zeigen auf Dokument oder Zuruf. Jedes Feld aus einem Dokument ist `Feld<T>` mit Quelle (Datei, Seite, Stelle, Rechteck) und Prüfstand (maschinell / bestätigt / blockiert). Freigabe zweistufig (übernommen M, freigegeben I) als eigener Typ außerhalb des Datensatzes.
- `src/engine/`: Rechenkern, reine Funktionen. `pruefeFirma(firmendaten)` (`firma.ts`) liefert Projektliste mit Ampel, Datum und Summen; `pruefe(datensatz)` (`pruefe.ts`) je Projekt Import-Stand, Ledger, Befunde (drei Listen plus Hinweis „braucht Anwalt“), Vorprüfung aus GU-Sicht, Hinweise, Prüfkaskade.
  - `befunde.ts`: Mehrmenge bzw. „erbracht, nicht verrechnet“, Regie, Regie aus Zuruf, Preisumrechnung (ÖNORM B 2111), Anmeldungen, Termin-/Behinderungs-Hinweise. Ohne Entwurf (in Ausführung) zählt nur Leistung vor der letzten AR (`kontext.ts`, `grenze`).
  - `belegquelle.ts`: Quelle des Belegs (Datei, Papier, Mail, Foto, WhatsApp), Anteil „nur außerhalb ERP“.
  - `vorpruefung.ts`: Kürzungsrisiken mit festen Gründen (`Kuerzungsgrund`), Hinweise „Mengenänderung über 20 %“.
  - `kaskade.ts`: Leistungssumme → Nachlass → Abzüge → Einbehalte → Zahlungen → Restforderung, Abgleich mit dem Vertrag.
  - `geld.ts`: Cent-Rechnung, Rundung, Formatierung.
- `src/demo/w21/`: synthetischer Datensatz „Wohnhausanlage Wien 21, HKLS-Los“ (`erzeuge.ts`, deterministisch, mit 6 Zurufen), Katalog der 380 LV-Positionen, Lösungsliste für Tests (`loesung.ts`).
- `src/demo/firma/`: Firmenzwilling Haustechnik Beispiel GmbH: 4 Auftraggeber, W21 plus 7 kleine Projekte (`erzeuge.ts`, Bauhelfer `bauen.ts`), Lösungsliste für Tests (`loesung.ts`).
- `src/app/`: Bildschirme (Next.js App Router, alles statisch vorberechnet). `/` Firmenübersicht, `/projekte/[projekt]/…` Projekt und Anwendung.
- `src/ui/`: Bauteile als React-Komponenten (Seitenleiste, Seitenkopf, Kennzahl, Panel, Statusmarke, Zeilennavigation) und Stile in `styles/`: `tokens.css` (einzige Stelle für Farben, Abstände, Größen), `bauteile.css` (Bauteile mit Vorlage), `anordnung.css` (Layout). Die App ist seit 22.10. die Quelle des UI-Fundaments; das Artifact bleibt Referenz v2. Kein Tailwind in den Bildschirmen: Klassen aus `bauteile.css`/`anordnung.css`, Inline-Stile nur für Spaltenbreiten. `fundament.test.ts` sperrt freie Farben, Stile und verbotene Wörter.
- `src/zustand/`: Freigabe zweistufig als Verlauf (`freigabe.ts`, reine Funktionen, Tests), Speicher im Browser (`speicher.ts`, liest bei jedem Zugriff frisch, damit mehrere Tabs sich nichts überschreiben).
- `src/ui/thema-skript.ts`: Skript im `<head>` (Thema, eingeklappte Seitenleiste); Client-Logik dazu in `thema.ts`. Server-Dateien dürfen keine Client-Hooks importieren.
- `src/daten/`: einziger Datenzugriff der Bildschirme (`server-only`). Heute Generator + Rechenkern, später Datenbank pro Firma.
- `scripts/generate/`: schreibt `data/generated/firma.json` und `w21.json` (läuft auch vor `build`).

## Regeln
- **Die KI liefert Fakten mit Quelle, die Rechnung ist Code.** Der Rechenkern liest nur den Datensatz, nie die Lösungsliste.
- Beträge sind ganze Cent, Mengen Hundertstel der Einheit, Sätze Basispunkte (3,8 % = 380). Rundung kaufmännisch pro Zeile (`rundeHalbAuf`). Keine Kommazahlen in Summen.
- Jeder Befund trägt Rechenweg und Belege mit Quelle. Der Mensch gibt jede Zeile frei.
- Nie das Wort „Claim“, nie „Forcierung“, keine Aussagen zur Präklusion oder rechtliche Würdigung. Termin- und Behinderungsfälle sind Hinweise ohne Betrag für die Kanzlei.
- Synthetische Daten immer als synthetisch kennzeichnen; Firmen sind fiktiv (Haustechnik Beispiel GmbH, Hochbau Beispiel GmbH).
- Echte Kundendaten nie ins Repo (`data/real/` ist ignoriert). Repo nie in OneDrive.

## Arbeitsweise
- `npm run typecheck`, `npm run lint`, `npm test` vor jedem Commit grün.
- Neue Regel = positiver Test und Gegenprobe in `regeln.test.ts`. Änderungen am Datensatz: `pruefung.test.ts` muss weiter genau die Lösungsliste treffen.
- Arbeit auf einem eigenen Branch, nach `main` nur über Pull Request. Pull Requests darf Claude selbst erstellen und mergen, wenn es keine Konflikte gibt; vorher kurz reviewen (Diff, typecheck, lint, Tests) und Maxi S. berichten (Erlaubnis 22.10.2026). Danach `../README.md` (Abschnitt „Stand“) nachziehen.

## Fachliche Annahmen (mit dem Insider prüfen)
- Mehrmenge: abgerechnet wird die Aufmaßmenge zum EP laut LV; K7 dient nur der Plausibilität. Mittellohnpreis 56,80 €/h aus der eigenen Kalkulation (K3).
- ÖNORM B 2110: Mengenänderung über 20 % kann einen neuen Einheitspreis auslösen; wir zeigen nur einen neutralen Hinweis, rechnen aber mit dem LV-EP.
- Preisumrechnung: Lohnanteil 40 % der aufgemessenen Leistung ab Stichtag; Leistung „ab Stichtag“ = Aufmaßblätter, deren Leistungszeitraum am oder nach dem Stichtag beginnt; Index Lohn Basis Angebotsmonat. Keine Bagatellgrenze, Regie nicht umgerechnet.
- Leistungssumme der Kaskade = Schlussrechnungs-Entwurf des Projektleiters + Liste 1. Abzüge des GU-Abzugsschreibens werden auf die Summe nach Nachlass gerechnet, Einbehalte auf den Betrag vor Einbehalten; der Deckungsrücklass gilt nur für Abschläge.
- Kürzungsrisiko „Aufmaß nicht gegengezeichnet“ nur für die Menge über der LV-Menge.
- Kürzungsrisiko „Stunden weichen ab“ nur, wenn der Regiebericht mehr Stunden zeigt als die Stundenliste derselben Woche.
- „Bezahlt“ im Ledger = in bezahlten AR enthalten minus Kürzungen des GU (vor Nachlass und Rücklässen).
- Felder mit Prüfstand „blockiert“ werden vom Rechenkern noch nicht ausgeklammert (offen für v1).
