# Inspiration: Produktmuster von reebuild und Kuro

Stand: 22.10.2026. **Selbst angesehen** im Browser (Produktbilder auf den Websites, keine Demo-Zugänge). Nur Muster übernehmen, nicht Farben, Logos oder Texte. Die Bilder liegen nicht im Projekt (Urheberrecht); Links unten führen zu den Seiten.

## reebuild (GU-/Bauträger-Seite, Wien)

| # | Ansicht | Was man sieht | Quelle |
|---|---|---|---|
| R-A | **Inhaltliche Prüfung** einer NU-Rechnung | Kaskade von oben nach unten: ausgestellte Leistungssumme → geprüfte Leistungssumme → Nachlass → leistungsmindernde Abzüge (Baustrom + Wasser, Bauschäden) → Einbehalte (Deckungsrücklass, Verzug) → auszuzahlender Betrag → Skonto. Jede Zeile mit %-Satz, Betrag und Vertragsabgleich: grün „laut Vertrag 4,00 %“ oder orange „Abweichung – laut Vertrag: nicht vorhanden“ | [reebuild.com/projektentwickler](https://www.reebuild.com/projektentwickler) (Bild „Nachunternehmer“) |
| R-B | **Rechnungsprüfung** | Links Vorschau des Original-PDFs mit Dokumentwahl (aktuelles Dokument, Auftragsdokumente: Bauvertrag, frühere Teilrechnungen). Rechts Zuweisung (Auftrag, Dokumenttyp) und „Ausgelesene Positionen“: Pos.-Nr. (z. B. 07.02.01.H), Bezeichnung, Zuordnung mit Häkchen, „8 Einträge“ | reebuild.com/projektentwickler (Bild „Rechnungsprüfung“) |
| R-C | **Projektübersicht** | Projekt-Umschalter oben, Reiter Übersicht / Informationen / Dokumente / Aufträge. Drei Kennzahlenkarten mit kleinem Großbuchstaben-Label, großem Betrag, einer Kontextzeile („20 % über Projektkosten Soll“ mit rotem Balken). Darunter Stufenlinie Ist gegen Soll (gestrichelt) | reebuild.com/projektentwickler (Hero) |
| R-D | **KI-Datenabgleich** (Eingang) | Reiter mit Zählern: Alle Zuweisungen 1 / Meine Abteilungen 1 / Für mich 1. Tabelle „Analyse läuft“ mit Eingangsdatum, Fälligkeit, Dokumenttyp, Nummer | [reebuild.com/bauunternehmen](https://www.reebuild.com/bauunternehmen) (Hero) |
| R-E | **Freigabe-Workflow** | Nummerierte Schritte (technische Prüfung → vertragliche Prüfung → Geschäftsführung → Buchhaltung) mit zuständiger Person, Pille „in Freigabe“; „Freigabe Bauleiter: von X freigegeben“ mit Häkchen | reebuild.com/projektentwickler, [reebuild.com](https://www.reebuild.com) |

**Optik:** weiße Karten auf hellgrau, dunkelgrüner Akzent, runde Ecken, viel Luft, serifenlose Schrift.

## Kuro (GU-Seite, Berlin)

| # | Ansicht | Was man sieht | Quelle |
|---|---|---|---|
| K-A | **Fundstellen mit Original** („Risiken erkennen“) | Links die Antwort: „3 Fundstellen in 2 Dokumenten, 1 Widerspruch erkannt“, jede Aussage mit Chip „Leistungsbeschreibung_GU.pdf, S. 14“ und Marke „Widerspruch“. Rechts der Dokumentbetrachter: Dateiname, „S. 14 / 86“, markierte Textstelle, Seitenleiste mit Miniaturen, aktive Seite umrandet | [kuro.technology/platform](https://www.kuro.technology/platform), Reiter „Risiken erkennen“ |
| K-B | **Uploadverlauf** („Änderungen verstehen“) | „Upload vom 06. Sep. 2026, 14:18: 832 neue und 102 aktualisierte Dokumente, 164 Duplikate bereinigt“. Zwei Spalten „Bestehender Stand“ und „Neuer Upload“, Linien verbinden alte und neue Version. Status-Chips: Genehmigt, Wird zugeordnet, Prüfen, Neu, Duplikat entfernt. Unter jedem Dateinamen Revision und Seitenzahl. Zeitleiste aller Uploads | kuro.technology/platform, Reiter „Änderungen verstehen“ |
| K-C | **Stichwortsuche** | „990 Treffer in 361 Dokumenten“, Filter-Chips, Trefferliste mit Dokumenttyp-Marken und Trefferzahl, Betrachter rechts | Reiter „Dokumente durchsuchen“ |
| K-D | **Raumbuch** | „224 Komponenten erkannt“, Kategorien mit Fortschritt „2 von 7“, Plan mit markiertem Raum | Reiter „Schnellere Arbeitsergebnisse“ |

**Optik:** fast nur Schwarz, Weiß, warmes Grau, dazu ein Signal-Orange für „hier hinschauen“. Kleine Großbuchstaben-Labels, eckig. Die Produktoberfläche selbst ist schlicht weiß.

## Was Schlusswerk daraus macht

| Muster | Bei uns | Bildschirm |
|---|---|---|
| K-A Fundstellen mit Original | **Beleg-Panel:** Befund links mit Beweiskette (Plan, Mail, Aufmaß, Foto, Rechenweg), jede Zeile ein Chip „Datei, S. x“. Rechts das Original mit markierter Stelle und Seitenleiste | Befund-Detail |
| R-A Prüfkaskade mit Vertragsabgleich | **Vorprüfung aus GU-Sicht:** dieselbe Kaskade auf der eigenen Schlussrechnung. Jeder Abzug „laut Vertrag“ oder „nicht im Vertrag gefunden“. Dazu die Positionen, die der GU kürzen würde, mit fehlendem Beleg | Vorprüfung |
| K-B Uploadverlauf | **Ordner-Import:** „165 Dokumente, 3 Planindizes, 12 Duplikate bereinigt“; Versionen C → D → E verbunden; Status pro Dokument | Ordner |
| R-C Kennzahlenkarten | **Cockpit:** drei Karten jetzt verrechenbar / angemeldet und offen / verloren, je mit Anzahl Posten | Cockpit |
| R-B Ausgelesene Positionen | **Ledger:** LV-Position, LV-Menge, Aufmaß, verrechnet, bezahlt, Differenz, Zuordnung | Ledger |
| K-D „x von y“ | Fortschritt pro Leistungsgruppe und „9 von 14 Posten freigegeben“ | Cockpit, Ledger |
| R-E Freigabe | Jeder Posten: übernehmen / verwerfen / braucht Anwalt. Freigabe durch den Menschen, mit Name und Zeit | Befund-Detail |
| Zusammenfassungssatz (K-A, K-B) | Jede Ansicht beginnt mit einem Satz mit Zahlen: „12 Posten aus 165 Dokumenten“ | überall |

**Nicht übernehmen:**
- KI-Chat als Einstieg (K-A ist als Chat gebaut; bei uns ist der Befund der Einstieg, nicht eine Frage). Dossier 8.4.
- Echtzeit-Kostenverlauf (R-C): Live-Betrieb ist verworfen (Dossier 12).
- Kuro-Orange und reebuild-Grün: Wir brauchen eine eigene Erkennbarkeit.
