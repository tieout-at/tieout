# Schlusswerk: Umfang MVP und v1

Stand: 22.10.2026, angepasst an Dossier v3 am 22.10.2026 (Go von Maxi offen). Grundlage: **Dossier v3**, Abschnitte 3, 12, 13, 15 (vorher v2). Spätere Entscheidungen gehen vor und werden hier mit Datum eingetragen.

## Ziel

Ein internes Prüfwerkzeug, das man wirklich bedienen kann. Erst mit synthetischen Daten (MVP), dann mit echten Projektordnern (v1 = **Stufe 0** in v3). Ein Code für beide. Kein Kundenzugang: Der Kunde bekommt Bericht, Excel und Exportdatei. **[neu 22.10., v3]** Aufbau in drei Ebenen: Firma → Projekt → Anwendung. Die erste und einzige Anwendung bis R5 ist die Schlussrechnung.

| Stufe | Termin | Wofür |
|---|---|---|
| MVP v0.9 | Sa 31.10.2026 | #glaubandich, erste Vorführungen |
| MVP v1.0 | KW 45 (bis 8.11.) | Kaffeetermine mit Insider-Kandidaten: Kandidat streicht Fehler an; Hackathon |
| v1 (Stufe 0) | Freeze So 6.12.2026 | echte Checks durch M und I |
| v1.1 | 6.1.2027 | Vorprüfung auf echten Daten, Entwurf der Schlussrechnung auf echten Daten, ÖNORM-Export, BMD geprüft, Planindex-Diff |

## MVP: was drin ist

**[neu 22.10., v3] Firmenebene**

0. **Firmenübersicht:** fiktive Haustechnik Beispiel GmbH mit 8 Projekten: Status (Ampel), Auftragssumme, offen verrechenbar, nächste Frist (als Datum); Summe „offen verrechenbar“ über alle Projekte, vom Rechenkern gerechnet. Klick führt ins Projekt. Ab v1.0: **GU-Historie** pro Auftraggeber (Kürzungen, akzeptierte Nachträge, Zahlungsverhalten) aus den synthetischen früheren Projekten.

**Projektebene** (Wohnhausanlage Wien 21, voll ausgearbeitet; die 7 anderen Projekte haben nur Übersicht und Ledger)

1. **Projekt-Übersicht** (bisher „Cockpit“): Projekt, Auftragssumme, „Schlussrechnung legen bis“ (Datum, kein Countdown), drei Zahlen (jetzt verrechenbar / angemeldet und offen / verloren), Fortschritt der Freigabe, Schrittleiste Einlesen → Datensätze → Abgleich → Prüfen und Freigeben.
2. **Ordner:** Dokumente als Datensätze; Typ, Version (Planindex), Duplikate; Belegmatrix. Import-Moment optional (nicht mehr im Demo-Skript).
3. **Ledger:** alle LV-Positionen mit LV-Menge, erbracht (Aufmaß), verrechnet, bezahlt, Differenz, Ampel; Filter, Suche.
4. **[neu 22.10., v3] Zeitachse:** alle Ereignisse in Reihenfolge: Mail, Regie, Foto, Zuruf, Planindex, Rechnung, Zahlung. Jeder Eintrag öffnet seine Quelle.
5. **[neu 22.10., v3] WhatsApp-Szene (Mock):** Ein Monteur schickt Foto und Sprachnachricht, der Agent antwortet mit einer Zusammenfassung, ein Tipp auf „Ja“, der Eintrag erscheint in der Zeitachse. Vorgespielt, kein echter Agent, keine echte Nummer. Beispiel muss HKLS sein (siehe Entscheidungen).

**Anwendung Schlussrechnung**

6. **Befunde und Beleg-Panel:** Beweiskette pro Posten, Original mit markierter Stelle, Rechenweg; Freigabe zweistufig: übernehmen (M) / freigeben (I) / verwerfen / braucht Anwalt. **[neu 22.10., v3]** Jeder Befund zeigt die Quelle seines Belegs (Datei, Mail, Papier, Foto, Zuruf).
7. **Vorprüfung aus GU-Sicht** (v1.0): Positionen, die der GU kürzen würde, mit fehlendem Beleg; Abgleich mit dem fiktiven GU-Korrekturblatt.
8. **Schlussbesprechungs-Blatt** (v1.0): Posten mit Untergrenze, druckfertig.
9. **[neu 22.10., v3] Entwurf der Schlussrechnung** (v1.0): alle Positionen mit Menge, Preis, Zuschlägen, Preisumrechnung, Abzügen, Abschlägen, Einbehalten und Zahlbetrag; jede Zeile mit Beleg. Baut auf der vorhandenen Prüfkaskade auf. Klar als Entwurf gekennzeichnet: Freigabe durch den Abrechner, Versand durch die Firma (Rechtsfrage R4).
10. **Export** (v1.0): Excel (echt); Bericht, Blatt und Entwurf als Druckseite.
11. Hinweis „Synthetische Daten · fiktiver GU“ auf jeder Seite.

Freigaben werden im MVP im Browser gespeichert, mit „Demo zurücksetzen“.

## v1 (Stufe 0): was dazukommt (KW 45–49, Dossier v3 15.4)

**[geändert 22.10., v3]** Datenmodell Firma → Auftraggeber → Projekt → Objekte mit Quelle, Verlauf und Status (KW 45–46). Echter Ordner-Import, Datensatz pro Dokument mit Quelle und Korrektur, LV (ÖNORM A 2063, PDF), Aufmaß-Excel, Regie (OCR, Unterschrift), Rechnungen und Zahlungen, Bepreisung LV × K7, Mail-Extraktion, WhatsApp-Export als Datei, Prüfkatalog v0, Beweispaket-PDF, Kodierbogen (a)–(d) **plus Quelle des Belegs**, Datenbank in der EU, getrennt pro Firma. Die Firmenebene bleibt in Stufe 0 schmal: Firma, Auftraggeber, Projektliste.

## Nicht drin (weder MVP noch v1)

**[geändert 22.10., v3]** Einige Punkte sind nicht mehr „nie“, sondern „später“ (Stufe in Klammern, Dossier v3 15.2).

- Kundenlogin (Lese-Ansicht frühestens Stufe 2)
- KI-Chat; „Frag den Zwilling“ nur als späterer Kandidat
- Echter WhatsApp-Agent (Stufe 2, nur nach R4 und Klärung mit dem Betriebsrat; im MVP nur als Szene)
- Anbindung an ERP, AVA, CRM, Postfach, Calls (Stufe 3; in v1 nur Dateien)
- Firmen-Anwendungen als echte Funktion (Portfolio, GU-Historie über echte Daten; im MVP nur synthetisch)
- Plan-Ansicht mit Pins, BIM, DWG (Stufe 3)
- Echtzeit-Budget, Lager, ESG
- Eigene Foto-App
- Fristen-Countdown, automatischer Fristenkalender, § 1170b-Tracker
- Kalkül (Bepreisung neuer Angebote)
- Bonusabrechnung
- GAEB, Deutschland
- Personaldaten, Auswertung pro Mitarbeiter, Scoring
- Kontakt zum GU, rechtliche Würdigung, das Wort „Claim“

## Regeln für das Produkt

- Die KI liefert Fakten mit Quelle, die Rechnung ist Code (Beträge in Cent).
- Jede Zahl ist anklickbar und führt zum Original.
- Der Mensch gibt jede Zeile frei.
- Schlusswerk sagt nie, ob eine Frist präklusiv ist. Behinderung, Forcierung und strittige Klauseln: „braucht Anwalt“.
- Synthetische Funde werden nie als echte Funde ausgegeben.
- **[neu 22.10., v3]** Nichts wird überschrieben: Jede Änderung ist eine neue Version mit Zeitpunkt, Herkunft und Status.
- **[neu 22.10., v3]** Mitarbeiter erscheinen nur als Absender und Rolle (z. B. „Monteur, Trupp 2“), nie mit Namen, Lohn- oder Leistungsdaten.
- **[neu 22.10., v3]** Der Agent erfasst, er entscheidet nie über Abrechenbarkeit und spricht nie mit dem GU.

## Entscheidungen

| Datum | Entscheidung |
|---|---|
| 22.10.2026 | Plan freigegeben (Chat 22.10.). Kein fester Wettbewerb, Ziele wie in der Tabelle oben |
| 22.10.2026 | Muster aus reebuild und Kuro laut `Inspiration_Muster.md` |
| 22.10.2026 | UI nicht im eigenen Stil, sondern aus professionellen Referenzen abgeleitet (Maxi). Vorgehen: Referenz-Set → Messblatt → Gate 1 → Bauteil-Liste → Design-System → Schlüsselbildschirme → Gate 2 |
| 22.10.2026 | **Gate 1 (Maxi):** Liga = reebuild, Kuro, Stratos + Linear, Attio, Harvey, Ramp, Rossum. Schrift Inter. Grundton kühl-neutral (reebuild-Produkt, Attio), Dunkelmodus nach Linear. Primärknopf Tinte. Akzent = neutraler Platzhalter, später mit Website-Team abstimmen |
| 22.10.2026 | Boards A/B/C überholt; Richtung C und das Wort „Forcierung“ verworfen |
| 22.10.2026 | **Dossier v3 maßgeblich** (Maxi D.). Umfang erweitert um Firmenebene, Zeitachse, WhatsApp-Szene, Entwurf der Schlussrechnung, Quelle des Belegs. Begriffe „Check“ und „Ledger“ bleiben. Go von Maxi offen |
| 22.10.2026 | **Offen, Vorschlag:** Die 7 weiteren Projekte bekommen kleine eigene Datensätze, ihre Beträge rechnet der Rechenkern (keine von Hand gesetzten Summen) |
| 22.10.2026 | **Offen, Vorschlag:** Die 6 Zurufe sind zusätzliche Belege für vorhandene Posten; die 2 Zurufe ohne Regiebericht werden 2 neue Posten in „angemeldet und offen“. Liste 1 bleibt 27.410,00 €, Liste 2 wächst. Neue Lösungsliste v2 vor dem Bau |
| 22.10.2026 | **Offen, Vorschlag:** Beispiel in der WhatsApp-Szene HKLS statt Elektro (v3 nennt „Steckdose versetzt“, das Projekt ist ein HKLS-Los) |
