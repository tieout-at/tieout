# Plan: Schlusswerk MVP

Stand: 22.10.2026, angepasst an Dossier v3 am 22.10.2026 (Go von Maxi offen). Umfang und Nicht-Liste: `Umfang_v1.md`. Muster: `Inspiration_Muster.md`. Fälle und Beträge: `Demo_Faelle.md`.

## Ergebnis

Ein internes Prüfwerkzeug, das man wirklich bedienen kann, auf synthetischen Daten. **[geändert 22.10., v3]** Es zeigt den Weg **Firma → Projekt → Anwendung**: Man startet in der Firmenübersicht der fiktiven Haustechnik Beispiel GmbH (8 Projekte), geht in ein Projekt (Wohnhausanlage Wien 21, HKLS-Los, 1,24 Mio. €, fiktiver GU) und dort in die erste Anwendung, die Schlussrechnung. Alle Beträge kommen aus echtem Rechen-Code, und jede Zahl führt zur markierten Stelle im Original. Derselbe Code wird ab KW 46 zu Stufe 0 (v1) mit echten Ordnern.

Ziele (Termine unverändert): v0.9 bis Sa 31.10.2026 (#glaubandich), v1.0 in KW 45 (Insider-Kandidaten streichen Fehler an, Hackathon), Stufe-0-Freeze So 6.12.2026, v1.1 bis 6.1.2027.

**[neu 22.10., v3] Was in welche Version gehört (Dossier v3, 14 und 15.3):**

| Version | Inhalt |
|---|---|
| v0.9 (Sa 31.10.) | Firmenübersicht, Projekt-Übersicht, Ledger, Beleg-Panel, drei Listen, Zeitachse, WhatsApp-Szene als Mock; vorberechnet |
| v1.0 (KW 45) | dazu Schlussbesprechungs-Blatt, Vorprüfung aus GU-Sicht, Entwurf der Schlussrechnung, Excel-Export, GU-Historie auf Firmenebene |

## Design-Richtung

- Muster von reebuild, Kuro und Stratos, nicht ihre Optik (Details in `Inspiration_Muster.md`). **[neu 22.10., v3]** Stratos ist das Vorbild für die Navigation Firma → Detail.
- UI nur aus dem UI-Fundament (Gate 1 entschieden, Gate 2 offen). Hell und dunkel gleichwertig, Desktop zuerst, Handy 390 px lesbar.
- **[geändert 22.10., v3]** Zwei Wow-Momente laut Demo-Skript v3: der Zuruf (Sprachnachricht wird Eintrag in der Zeitachse) und der Klick auf einen Betrag, der die markierte Stelle im Original öffnet. Der Import-Moment („Ordner wird Ledger“) steht nicht mehr im Skript und rückt nach hinten (optional, Phase 4).
- **[neu 22.10., v3]** Das Wort „Zwilling“ steht vorerst nicht in der Navigation, weil ungeprüft ist, ob es bei Inhabern trägt (Dossier v3, offene Frage 13). Navigation heißt schlicht „Projekte“, „Auftraggeber“, Projektname. Im Vortrag darf man „Zwilling“ sagen. Später leicht austauschbar.

## Technik

| Teil | Wahl |
|---|---|
| App | Next.js 16, TypeScript, Tailwind v4, shadcn (Base UI) |
| Rechenkern | eigenes TypeScript-Modul, Beträge in Cent, Tests mit Vitest |
| Daten | Generator-Skript (reproduzierbar): PDFs, Aufmaß-Excel, Mails (.eml), Fotos mit EXIF, Lösungsliste. **[neu 22.10., v3]** dazu: Firma mit 8 Projekten und Auftraggebern, 6 Zurufe (Foto, Sprachnachricht als Text-Transkript, Zeitstempel) |
| Datenmodell | **[neu 22.10., v3]** Ebenen Firma → Auftraggeber (GU) → Projekt → Objekte. Jedes Objekt mit Quelle, Zeitpunkt, Kanal (Ordner, WhatsApp, später Anbindung), Status und bestätigt-von; nichts wird überschrieben (Verlauf). Mitarbeiter nur als Rolle, nie mit Namen oder Leistungsdaten (§ 96a ArbVG) |
| Dokumentansicht | pdf.js mit Markierung aus den Generator-Koordinaten |
| Zustand MVP | Freigaben im Browser, „Demo zurücksetzen“; v1: EU-Datenbank pro Firma (ab KW 46) |
| Hosting | Demo mit synthetischen Daten: Vercel Frankfurt. Echte Daten nur in einer EU-Umgebung, getrennt pro Firma (Wahl offen, Dossier v3 Abschnitt 14). Code in `product/app/` des Team-Repos github.com/schlusswerk/schlusswerk (privat), Änderungen über Branch und Pull Request |
| KI | Phase 5: Claude liest die synthetischen PDFs, Ergebnis gespeichert, Genauigkeit gegen die Lösungsliste gemessen |

## Reihenfolge

**[geändert 22.10., v3]** Phasen neu geschnitten: Firmenebene, Zurufe und Zeitachse kommen dazu, Vorprüfung und Schlussbesprechung wandern in v1.0.

| Phase | Inhalt | Schätzung | Ziel |
|---|---|---|---|
| 0 | UI-Fundament; **Gate 2** mit Maxi. Vorher drei fehlende Bauteile aus Referenzen ergänzen: Projektliste mit Ampel, Zeitachse, Zuruf-Ansicht (WhatsApp-Szene) | ½ Tag | erledigt bis auf Gate 2 und die drei Bauteile |
| 1a | Rechenkern mit Tests (W21) | erledigt | 58/58 Tests |
| 1b | Lösungsliste v2 (`Demo_Faelle.md`: Firma, 7 weitere Projekte, 6 Zurufe; Go von Maxi). Datenmodell um Firma, Auftraggeber, Zuruf und Kanal erweitern, ohne die 58 Tests zu brechen. Generator: 7 kleine Projekte, die der Rechenkern rechnet; Zurufe; echte PDFs für alle Dokumente, die in einer Beweiskette vorkommen | 1½ Tage | |
| 2 | App: Firmenübersicht, Projekt-Übersicht, Ordner mit Belegmatrix, Ledger (380 Positionen), Befunde, Beleg-Panel, zweistufige Freigabe, Zeitachse, WhatsApp-Szene (Mock) | 2½ Tage | **v0.9 Sa 31.10.** |
| 3 | Anwendung Schlussrechnung vollständig: Vorprüfung aus GU-Sicht, Schlussbesprechungs-Blatt, Entwurf der Schlussrechnung, Excel-Export; GU-Historie auf Firmenebene | 1½ Tage | **v1.0 KW 45** |
| 4 | Feinschliff, Handy, Deployment; optional Import-Moment; restliche PDFs | 1 Tag | |
| 5 | Echte KI-Extraktion plus Genauigkeitsmessung | 1 Tag | nach v1.0 |

Danach Stufe 0 nach Dossier v3, 15.4 (Datenmodell KW 45–46, Ordner-Import, LV-Parser, Regie, Bepreisung, Mails, Prüfkatalog, Ausgaben inkl. Kodierbogen mit Quelle des Belegs), Freeze 6.12.

**Zeitbudget (Annahme):** Maxi baut laut v3 höchstens die Hälfte seiner Zeit, solange R1 offen ist. Bis 31.10. sind das etwa 4 Arbeitstage für Phase 0 bis 2 (geschätzt 4½). Wenn es knapp wird, fällt zuerst die WhatsApp-Szene auf eine einfache Bildfolge zurück, nicht die Firmenübersicht.

**Bau-Aufteilung:** Laut v3 macht Co-Founder A die synthetischen Demo-Daten (Firma mit mehreren Projekten, Zurufe). Vorschlag für die Sonntagsrunde 25.10.: A schreibt die Inhalte (Projektnamen, Zuruf-Texte, GU-Historie, Plausibilität), die Zahlen entstehen im Generator im Repo. Sonst entstehen zwei Datensätze.

## Prüfen

1. Rechenkern automatisch: alle eingebauten Fälle gefunden, 0 Fehlalarme, jeder Euro cent-genau. **[neu 22.10., v3]** Gilt auch für die 7 weiteren Projekte und die Firmensumme.
2. Zahlen überall gleich (Firmenübersicht, Projekt, Listen, Blatt, Entwurf, Excel), automatisch.
3. Typprüfung, Lint, Build.
4. Echter Browser: 3-Minuten-Skript (**[geändert 22.10.]** Dossier v3, 15.3) mit Stoppuhr, hell/dunkel, 1280/1440 px, 390 px.
5. Fachliche Plausibilität: Prüfer-Agent als HKLS-Abrechner, danach echte Bau-Menschen (KW 45).
6. Unabhängiger UI- und Code-Prüfer pro Phase, Befunde selbst nachmessen, vorher/nachher an Maxi.
7. **[neu 22.10., v3]** Keine Personaldaten: Zurufe und Freigaben zeigen beim Kunden nur Rollen, keine Auswertung pro Person.

## Stand

| Datum | Was |
|---|---|
| 22.10. | Plan freigegeben; Muster-Katalog, Umfang, Demo-Fälle (nachgerechnet, alle OK) geschrieben; Boards gebaut |
| 22.10. | Phase 0: Boards A/B/C verworfen (eigener Stil). Neuer Weg: Referenzen messen → Gate 1 (Inter, kühl-neutral, Tinte) → UI-Fundament v1 → Prüfer („Liga nicht erreicht“) → v2 mit allen System-Befunden behoben. Gate 2 offen |
| 22.10. | Phase 1a fertig: Rechenkern im Repo, 58/58 Tests, alle Fälle cent-genau. Offen: Phase 1b (PDFs), Phase 2 (App) |
| 22.10. | Dossier v3 eingearbeitet: Firma → Projekt → Anwendung, Firmenübersicht mit 8 Projekten, Zurufe und WhatsApp-Szene, Zeitachse, Entwurf der Schlussrechnung in v1.0, Phasen neu geschnitten. Go von Maxi offen |
