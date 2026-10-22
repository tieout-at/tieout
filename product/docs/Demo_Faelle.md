# Demo-Datensatz: eingebaute Fälle (Lösungsliste v1)

Stand: 22.10.2026, v1 nach der Prüferrunde (Befunde 1–40, Korrekturen unten in „Änderungen gegenüber v0“). **Alles synthetisch und fiktiv.** Diese Liste ist das Ziel für den Generator: Der Rechenkern muss genau diese Fälle finden, mit genau diesen Beträgen und ohne Fehlalarme. Alle Zahlen sind per Skript cent-genau nachgerechnet. Fachlich noch nicht von einem Bau-Menschen geprüft: Annahmen sind mit **(Annahme)** markiert.

## Projekt

- **Wohnhausanlage Wien 21, Bauplatz B, HKLS-Los** (Heizung, Klima, Lüftung, Sanitär)
- Auftragnehmer: **Haustechnik Beispiel GmbH (fiktiv)**; GU: **Hochbau Beispiel GmbH (fiktiv)**. Namen bewusst ohne Ähnlichkeit zu echten Firmen.
- Bauvertrag vom 14.11.2025; Auftragssumme 1.240.000,00 € netto; ÖNORM B 2110; Einheitspreisvertrag; veränderliche Preise (Preisumrechnung Lohn nach ÖNORM B 2111, Vertrag Pkt. 7.2)
- **Schlussrechnung legen bis 31.10.2026** (reines Datum, keine Fristbewertung)
- Regiesätze laut Vertrag: Monteur 62,50 €/h, Helfer 52,00 €/h
- Mittellohnpreis laut eigener Kalkulation (K3): 56,80 €/h (Annahme)
- Vertrag: Nachlass 3 % (Pkt. 5.1); Baustrom und Bauwasser 0,8 % (Pkt. 4.6); Deckungsrücklass 5 % auf Abschlagsrechnungen, aufgelöst mit der Schlussrechnung (Pkt. 9.1); Haftrücklass 3 % auf die Schlussrechnung, durch Bankgarantie ablösbar (Pkt. 9.2); Baustelleneinrichtung pauschal (Pkt. 4.3). **Keine** Bauschadensumlage im Vertrag.
- Abschlagsrechnungen: AR1 31.03.2026 312.400,00 €; AR2 30.06.2026 418.900,00 €; AR3 30.09.2026 356.200,00 €; kumuliert 1.087.500,00 €
- Ordner: 165 Dokumente, davon 12 Duplikate. Im Repo umgesetzt mit 57 Mails statt 60, dafür Stundenliste KW 23 (für G2), Indexblatt (für J8) und Schlussrechnungs-Entwurf (1.218.640,00 €) als eigene Dokumente. Sonst: 1 Vertrag, 1 LV, 1 K7, 14 Aufmaßblätter, 16 Regieberichte, 3 AR, 3 Zahlungsavisos, 40 Fotos, 24 Pläne (Index C/D/E), 1 GU-Abzugsschreiben, 1 GU-Korrekturblatt AR3. Beim Einlesen 31 Felder von Hand korrigiert.
- LV: 380 Positionen (LG 22 Heizung 124, LG 24 Sanitär 138, LG 26 Lüftung 82, LG 28 MSR 36).
- Regieberichte: 16, davon 11 verrechnet, 3 unterschrieben und nicht verrechnet (J2–J4), 2 nicht unterschrieben (O1, O2).
- Plan H-201: Index C 1 Heizkörper je Top 7–13 (7 Stk), Index D 3 je Top (21 Stk, +14).

## Liste 1: jetzt verrechenbar, 8 Posten, 27.410,00 €

| # | Art | Position | Rechenweg | Betrag | Belege |
|---|---|---|---|---|---|
| J1 | Mehrmenge aus Planänderung | 22.04.12B Plattenheizkörper Typ 22, 600/1000, inkl. Ventilunterteil | LV 86 Stk, Aufmaß 100, verrechnet 86 → (100 − 86) × 456,00 € (EP laut LV) | 6.384,00 € | LV Pos. 22.04.12B (Menge und EP); Plan H-201 Index C (12.02.: 1 Heizkörper je Top 7–13) → Index D (03.04.: Räume geteilt, je Top +2 Heizkörper, 7 Tops = 14 Stk); Mail GU-Bauleitung 07.04. „bitte gleich mitmachen“; Foto IMG_2291 (14.05.); Aufmaßblatt AB-12 (18.09., 100 Stk). Plausibilität K7: 1,30 h × 56,80 € = 73,84 € Lohn + 382,16 € Sonstiges = 456,00 € |
| J2 | Regie | RB-07 Provisorische Bauwasserversorgung umlegen | 18 h Monteur × 62,50 € = 1.125,00 € + Material 186,40 € | 1.311,40 € | RB-07 unterschrieben, in keiner AR |
| J3 | Regie | RB-11 Steigleitung umlegen (Kollision Lüftung) | 24 h Monteur × 62,50 € = 1.500,00 € + 16 h Helfer × 52,00 € = 832,00 € + Material 642,80 € | 2.974,80 € | RB-11 unterschrieben, in keiner AR |
| J4 | Regie | RB-14 Notabsperrung nach Wasserschaden Fremdgewerk | 8 h Monteur × 62,50 € = 500,00 € + Material 96,20 € | 596,20 € | RB-14 unterschrieben, in keiner AR |
| J5 | Mehrmenge | 24.02.05A Mehrschicht-Verbundrohr 20 × 2,0 inkl. Formteile | LV 640 m, Aufmaß 812, verrechnet 640 → 172 m × 18,40 € | 3.164,80 € | Aufmaßblätter AB-04, AB-09 |
| J6 | Mehrmenge | 22.06.03C Rohrdämmung 13 mm für Rohr 15 mm | LV 900 m, Aufmaß 1.140, verrechnet 900 → 240 m × 9,85 € | 2.364,00 € | Aufmaßblatt AB-10 |
| J7 | Mehrmenge | 26.03.04A Wickelfalzrohr DN 200 inkl. Formteile | LV 210 m, Aufmaß 286, verrechnet 210 → 76 m × 44,30 € | 3.366,80 € | Aufmaßblatt AB-13; Plan L-310 Index E |
| J8 | Preisumrechnung | Lohnanteil der Leistungen ab 01.05.2026 (ÖNORM B 2111) | 190.736,84 € × 3,8 % (Index Lohn laut Vertrag Pkt. 7.2) | 7.248,00 € | Vertrag Pkt. 7.2; Indexblatt |

Zusammensetzung: 4 Mehrmengen (J1, J5, J6, J7), 3 Regie (J2–J4), 1 Preisumrechnung (J8).
Summe: 6.384,00 + 1.311,40 + 2.974,80 + 596,20 + 3.164,80 + 2.364,00 + 3.366,80 + 7.248,00 = **27.410,00 €**

## Liste 2: angemeldet und offen, 3 Posten, 10.095,30 €

| # | Art | Inhalt | Rechenweg | Betrag |
|---|---|---|---|---|
| O1 | Regie | RB-12 zusätzliche Entleerungen Heizung Stiege 1, **nicht unterschrieben** | 10 h × 62,50 € + 6 h × 52,00 € + Material 84,50 € | 1.021,50 € |
| O2 | Regie | RB-15 Nachrüstung Strangregulierventile, **nicht unterschrieben** | 8 h × 62,50 € + Material 221,00 € | 721,00 € |
| O3 | Änderung | Umplanung Technikraum Keller, angemeldet per Mail 14.03., nie bepreist | Untergrenze aus eigener Kalkulation: 96 h × 56,80 € (Mittellohnpreis) + Material 2.900,00 € | 8.352,80 € |

Summe: 1.021,50 + 721,00 + 8.352,80 = **10.095,30 €**

Dazu ein **Hinweis ohne Betrag**: A1 „Terminänderung (Mail GU 02.07.: Fertigstellung Stiege 2 drei Wochen vorziehen)“ → **Braucht Anwalt**. Keine eigene rechtliche Einordnung (kein Wort „Forcierung“ im Produkt).

## Liste 3: verloren, 1 Posten, 1.180,00 €

| # | Inhalt | Grund | Betrag |
|---|---|---|---|
| V1 | Container der Baustelleneinrichtung zweimal versetzt | laut Vertrag Pkt. 4.3 pauschal enthalten | 1.180,00 € |

## Vorprüfung aus GU-Sicht: 4 Positionen mit Kürzungsrisiko, 8.767,50 €

| # | Position | Was der GU kürzen würde | Grund (feste Liste) | Abhilfe | Betrag |
|---|---|---|---|---|---|
| G1 | 22.04.12B (J1) | Mehrmenge 14 Stk | Aufmaß nicht gegengezeichnet | Plan D und Mail 07.04. beilegen, gemeinsames Aufmaß nachholen | 6.384,00 € |
| G2 | RB-11 (J3) | 3 h Monteur | Stunden weichen ab (Bericht 24 h, Stundenliste KW 23: 21 h) | Stunden korrigieren oder Stundenliste nachreichen | 187,50 € |
| G3 | 24.05.02A | Rechenfehler aus AR3 (48 Stk × 112,60 € = 5.404,80 €, verrechnet 5.440,80 €) | Rechenfehler | Fehler korrigieren, sonst wird er in die Schlussrechnung übernommen | 36,00 € |
| G4 | Z-01 Kernbohrungen DN 100, 12 Stk | ganze Position | außerhalb des LV, kein Nachtrag gefunden | Anweisung suchen oder herausnehmen | 2.160,00 € |

Summe: **8.767,50 €**. Davon **bereits in AR3 gekürzt**: G3 und G4, zusammen **2.196,00 €** (fiktives GU-Korrekturblatt AR3). Die Vorprüfung erkennt beide (2 von 2) und findet 2 weitere (G1, G2). Die Vorprüfung **überschneidet sich** mit Liste 1 (G1 = J1, G2 ⊂ J3); nie addieren.

**Hinweise ohne Betrag** (neutral, keine rechtliche Bewertung): Mengenänderung über 20 % bei J5 (+26,9 %), J6 (+26,7 %), J7 (+36,2 %): „Der GU kann hier einen neuen Einheitspreis prüfen.“ (Annahme zur ÖNORM-B-2110-Regel, mit Insider bestätigen.)

## Schlussrechnung (Entwurf) mit Prüfkaskade (Muster reebuild R-A)

| Zeile | Satz | Quelle | Prüfung | Betrag |
|---|---|---|---|---|
| Leistungssumme laut Entwurf, **inkl. Liste 1 (27.410,00 €)** | | eigener Entwurf | | 1.246.050,00 € |
| Nachlass | 3,00 % | Vertrag Pkt. 5.1 | laut Vertrag | −37.381,50 € |
| Summe nach Nachlass | | | | 1.208.668,50 € |
| Baustrom und Bauwasser | 0,80 % | GU-Abzugsschreiben | laut Vertrag Pkt. 4.6 | −9.669,35 € |
| Bauschadensumlage | 0,50 % | GU-Abzugsschreiben | **kein Vertragspunkt gefunden** | −6.043,34 € |
| Betrag vor Einbehalten | | | | 1.192.955,81 € |
| Haftrücklass (durch Bankgarantie ablösbar) | 3,00 % | Vertrag Pkt. 9.2 | laut Vertrag | −35.788,67 € |
| Schlussrechnungsbetrag vor Abzug der Zahlungen | | | | 1.157.167,14 € |
| Zahlungen auf AR1–AR3 | | Zahlungsavisos | | −987.106,25 € |
| **Restforderung** | | | | **170.060,89 €** |

Zahlungen (Rechenregel je AR, Prozente jeweils auf die Zwischensumme, kaufmännisch auf Cent gerundet): (AR − Kürzung laut Korrekturblatt) − 3 % Nachlass − 0,8 % Baustrom − 0,5 % Bauschaden − 5 % Deckungsrücklass.

| AR | Betrag | Kürzung | Nachlass | Baustrom | Bauschaden | Deckungsrücklass | Zahlung |
|---|---|---|---|---|---|---|---|
| AR1 | 312.400,00 | 0,00 | 9.372,00 | 2.424,22 | 1.515,14 | 14.954,43 | 284.134,21 |
| AR2 | 418.900,00 | 0,00 | 12.567,00 | 3.250,66 | 2.031,67 | 20.052,53 | 380.998,14 |
| AR3 | 356.200,00 | 2.196,00 | 10.620,12 | 2.747,07 | 1.716,92 | 16.945,99 | 321.973,90 |
| Summe | | | | | | | **987.106,25** |

## Änderungen gegenüber v0 (Prüferrunde 22.10.)

- Firmennamen neu (alt „Strabel Bau“ klang nach STRABAG).
- Einheitspreis J1 mit Quelle LV; K7 nur Plausibilität mit eigenem Mittellohnpreis 56,80 €/h und 1,30 h Montage statt 2,40 h. O3 neu bepreist mit dem Mittellohnpreis: 8.900,00 → 8.352,80 €, Liste 2: 10.642,50 → **10.095,30 €**.
- J1 als „Mehrmenge aus Planänderung“, Plan C belegt nur Top 7–13 (die 86 Stk belegt das LV).
- „Preisgleitung“ → „Preisumrechnung (ÖNORM B 2111)“; Verbundrohr 20 × 2,0 statt DN 20.
- „Schlussrechnung fällig“ → „Schlussrechnung legen bis“.
- A1 ohne „Forcierung“, als „Terminänderung (Mail GU)“.
- Kaskade: Abzüge mit Quelle GU-Abzugsschreiben, Zahlungen und Restforderung ergänzt, Leistungssumme inkl. Liste 1 ausdrücklich.
- Vorprüfung: „mit Kürzungsrisiko“, davon 2 bereits in AR3 gekürzt; Hinweise „Mengenänderung über 20 %“ ohne Betrag.
- Ergänzt: Vertragsdatum 14.11.2025, 31 von Hand korrigierte Felder, Deckungsrücklass 5 %.
