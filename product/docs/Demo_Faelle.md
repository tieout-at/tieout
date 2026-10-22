# Demo-Datensatz: eingebaute Fälle (Lösungsliste v2)

Stand: 22.10.2026, **v2** nach Dossier v3 (Firma mit 8 Projekten, Zurufe, GU-Historie; Änderungen unten in „Änderungen gegenüber v1“). v1 kam aus der Prüferrunde (Befunde 1–40, „Änderungen gegenüber v0“). **Alles synthetisch und fiktiv.** Diese Liste ist das Ziel für den Generator: Der Rechenkern muss genau diese Fälle finden, mit genau diesen Beträgen und ohne Fehlalarme. Alle Zahlen sind per Skript cent-genau nachgerechnet. Fachlich noch nicht von einem Bau-Menschen geprüft: Annahmen sind mit **(Annahme)** markiert.

**Demo-Stichtag:** Donnerstag, 22.10.2026. Die Demo rechnet immer mit diesem „heute“, damit Ampel und Status gleich bleiben.

## Firma

- **Haustechnik Beispiel GmbH (fiktiv)**, HKLS, Sitz Wien. 8 Projekte im Zwilling, Auftragssummen zusammen 6.560.000,00 €.
- Auftraggeber (alle fiktiv): **Hochbau Beispiel GmbH** (GU, 4 Projekte), **Generalbau Beispiel AG** (GU, 2 Projekte), **Gemeinde Beispielstadt** (öffentlicher AG, 1 Projekt), **Wohnbau Beispiel GmbH** (Bauträger, 1 Projekt).
- Mitarbeiter erscheinen nur als Rolle (z. B. „Monteur, Trupp 2“), nie mit Namen.
- Annahme für die Demo: LV, Aufmaß, Abschlagsrechnungen und Verträge liegen im ERP der Firma; Regieberichte auf Papier (Scan), Mails im Postfach, Zurufe per WhatsApp. Gebraucht für die Spalte „Belegquelle“.

## Projekt W21 (voll ausgearbeitet)

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
- **Zurufe: 6** per WhatsApp (Kanal WhatsApp, nicht im Ordner; die 165 Dokumente bleiben). Je Zuruf: Sprachnachricht mit Transkript, bei 5 ein Foto, Zeitpunkt aus dem Nachrichtenzeitstempel (Annahme: WhatsApp entfernt EXIF, laut Dossier unbelegt, testen), Absender als Rolle, vom Absender bestätigt. 4 stützen vorhandene Posten, 2 haben keinen Regiebericht (O4, O5).

| # | Zeitpunkt | Absender | Inhalt (Transkript, gekürzt) | Foto | Bezug |
|---|---|---|---|---|---|
| Z1 | 12.05.2026, 15:20 | Monteur, Trupp 1 | „Stiege 2, Top 7 bis 13: die zusätzlichen Heizkörper nach Plan D sind montiert.“ | ja | Beleg für J1 |
| Z2 | 03.06.2026, 09:05 | Monteur, Trupp 2 | „Steigleitung Stiege 2 kollidiert mit der Lüftung, wir legen um, Bauleitung GU weiß Bescheid.“ | ja | Beleg für J3 (RB-11) |
| Z3 | 24.06.2026, 13:40 | Monteur, Trupp 2 | „Heizung Stiege 1 nochmal entleert, der Polier vom GU hat es angeschafft.“ | nein | Beleg für O1 (RB-12) |
| Z4 | 21.07.2026, 07:55 | Monteur, Trupp 1 | „Wasserschaden im Keller vom Fremdgewerk, wir haben notabgesperrt.“ | ja | Beleg für J4 (RB-14) |
| Z5 | 19.08.2026, 16:10 | Monteur, Trupp 3 | „Top 4 und 5: Waschtischanschlüsse höher gesetzt, Bauleitung GU wollte das. Ein Mann, acht Stunden.“ | ja | **neuer Posten O5** |
| Z6 | 08.09.2026, 14:30 | Monteur, Trupp 1 | „Stiege 2, Top 9: Heizkörper im Wohnzimmer versetzt, die Küche wurde anders geplant, der Polier vom GU hat es angeschafft. Zwei Mann, sechs Stunden.“ | ja | **neuer Posten O4**, Szene der Demo |

Regeln: „Zwei Mann“ = 1 Monteur + 1 Helfer (Annahme). Zurufe Z1 bis Z4 nennen bewusst keine Stunden, damit G2 (Stundenliste gegen Regiebericht) unverändert bleibt; Z5 (KW 34) und Z6 (KW 37) liegen in Wochen ohne Stundenliste. Der Agent bewertet nichts; ob ein Zuruf abrechenbar ist, entscheidet der Mensch. Wer laut Zuruf angewiesen hat, wird nur erfasst, nicht gewürdigt.

**Für den Bau (Datenmodell und Tests):** Zurufe sind eigene Objekte im Projektzwilling (Kanal WhatsApp) mit eigener Kennung, nicht Teil der 165 Ordner-Dokumente. Die Regel „jeder Beleg zeigt auf ein vorhandenes Dokument“ gilt für Ordner-Dokumente **oder** Zurufe. Zuruf-Belege hängen sich an die Befunde J1, J3, J4 und O1 (J1 hat dann 7 statt 6 Belege). O4 und O5 sind keine Regieberichte und zählen nicht in die Regie-Statistik (bleibt 16 / 11 / 3 / 2).

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

## Liste 2: angemeldet und offen, 5 Posten, 11.282,30 €

| # | Art | Inhalt | Rechenweg | Betrag |
|---|---|---|---|---|
| O1 | Regie | RB-12 zusätzliche Entleerungen Heizung Stiege 1, **nicht unterschrieben** (dazu Zuruf Z3) | 10 h × 62,50 € + 6 h × 52,00 € + Material 84,50 € | 1.021,50 € |
| O2 | Regie | RB-15 Nachrüstung Strangregulierventile, **nicht unterschrieben** | 8 h × 62,50 € + Material 221,00 € | 721,00 € |
| O3 | Änderung | Umplanung Technikraum Keller, angemeldet per Mail 14.03., nie bepreist | Untergrenze aus eigener Kalkulation: 96 h × 56,80 € (Mittellohnpreis) + Material 2.900,00 € | 8.352,80 € |
| O4 | Regie aus Zuruf | Z6: Heizkörper Stiege 2, Top 9 versetzt, angewiesen vom Polier GU; **kein Regiebericht, keine Unterschrift** | 6 h Monteur × 62,50 € + 6 h Helfer × 52,00 € | 687,00 € |
| O5 | Regie aus Zuruf | Z5: Waschtischanschlüsse Top 4 und 5 höher gesetzt, angewiesen von der Bauleitung GU; **kein Regiebericht, keine Unterschrift** | 8 h Monteur × 62,50 € | 500,00 € |

Summe: 1.021,50 + 721,00 + 8.352,80 + 687,00 + 500,00 = **11.282,30 €**

O4 und O5 ohne Material: Der Zuruf nennt keins, Preise erfindet das Werkzeug nicht. Bepreist mit den Regiesätzen des Vertrags wie O1 und O2 (Annahme). Die Alternative wäre eine Untergrenze aus dem Mittellohnpreis wie bei O3: O4 12 h × 56,80 € = 681,60 €, O5 8 h × 56,80 € = 454,40 €. Frage an den Insider (siehe unten). Abhilfe im Werkzeug: „Regiebericht nachträglich ausstellen und vom GU unterschreiben lassen.“

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
| Bauschadensumlage | 0,50 % | GU-Abzugsschreiben | **Abzug ohne Vertragspunkt** | −6.043,34 € |
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

## Belegquelle je Posten (W21, für Kodierbogen und Leithypothese)

Quelle des Belegs nach Dossier v3, 15.5. „Beleg“ heißt hier Nachweis der **Leistung**, nicht des Preises (Regiesätze und Einheitspreise kommen immer aus Vertrag und LV). „Nur außerhalb ERP“ heißt: kein Leistungsnachweis aus LV, Aufmaß, Rechnung oder Vertrag (Annahme oben unter „Firma“).

| Posten | Belegquellen | Nur außerhalb ERP |
|---|---|---|
| J1 | Datei (LV, Plan C/D, Aufmaß AB-12), Mail, Foto, WhatsApp (Z1) | nein |
| J2 | Papier (RB-07) | ja |
| J3 | Papier (RB-11), WhatsApp (Z2) | ja |
| J4 | Papier (RB-14), WhatsApp (Z4) | ja |
| J5, J6 | Datei (Aufmaß) | nein |
| J7 | Datei (Aufmaß, Plan L-310 E) | nein |
| J8 | Datei (Vertrag, Indexblatt) | nein |
| O1 | Papier (RB-12), WhatsApp (Z3) | ja |
| O2 | Papier (RB-15) | ja |
| O3 | Mail | ja |
| O4, O5 | nur WhatsApp (Z6, Z5) | ja |

Nur außerhalb ERP: J2 + J3 + J4 + Liste 2 = 1.311,40 + 2.974,80 + 596,20 + 11.282,30 = **16.164,70 €**. Nach Betrag sind das 41,8 % von Liste 1 und 2 (38.692,30 €), nach Anzahl 8 von 13 Posten (61,5 %). **Synthetisch, kein Beleg für die Leithypothese.** Die echte Zahl misst erst R3.

## Die 7 weiteren Projekte

Klein, aber echte Datensätze: Der Rechenkern rechnet ihre Beträge wie bei W21. Keine von Hand gesetzten Summen.

**Regel für laufende Projekte (ohne Schlussrechnungs-Entwurf):** erbracht gegen Abschlagsrechnungen. Ein Befund entsteht nur für Leistung, deren Aufmaßblatt oder Regiebericht **vor dem Datum der letzten Abschlagsrechnung** liegt und in keiner AR steht. Das gilt für beide Listen. Neuere Leistung ist normal und kommt in die nächste AR, sie ist kein Befund (Annahme, mit dem Insider prüfen). Unterschriebene Regie → Liste 1, nicht unterschriebene → Liste 2, wie bei W21. Neue Befundart „erbracht, nicht verrechnet“ für Mengen, die unter der LV-Menge bleiben.

**Was das Werkzeug für P2 bis P5 zeigt:** Übersicht, Ledger und Befunde. Vorprüfung und Kaskade nur bei W21 (Annahme für die Demo). P2 bis P8 haben alle Aufmaßblätter gegengezeichnet und keine Korrekturblätter zu offenen AR.

| # | Projekt | Auftraggeber | Auftragssumme | Status | Datum | Jetzt verrechenbar | Angemeldet und offen | Ampel |
|---|---|---|---|---|---|---|---|---|
| W21 | Wohnhausanlage Wien 21, Bauplatz B, HKLS-Los | Hochbau Beispiel | 1.240.000,00 € | Schlussrechnung vorbereiten | legen bis 31.10.2026 | 27.410,00 € | 11.282,30 € | rot |
| P2 | Wohnhausanlage Wien 22, Bauteil 3, HKLS | Hochbau Beispiel | 860.000,00 € | in Ausführung | letzte AR 30.09.2026 | 3.100,70 € | 250,00 € | gelb |
| P3 | Bürogebäude Wien 3, Umbau 4. bis 6. OG, HKLS | Generalbau Beispiel | 410.000,00 € | Schlussrechnung vorbereiten | legen bis 04.12.2026 | 3.063,00 € | 0,00 € | gelb |
| P4 | Volksschule Beispielstadt, Zubau, HKLS | Gemeinde Beispielstadt | 690.000,00 € | in Ausführung | letzte AR 30.09.2026 | 694,40 € | 0,00 € | gelb |
| P5 | Pflegewohnhaus Beispielstadt, Sanierung Trakt B | Wohnbau Beispiel | 520.000,00 € | in Ausführung | letzte AR 30.09.2026 | 0,00 € | 0,00 € | grün |
| P6 | Reihenhausanlage Wien 23, HKLS | Hochbau Beispiel | 340.000,00 € | Schlussrechnung gelegt | gelegt 15.09.2026 | – | – | grau |
| P7 | Wohnhausanlage Wien 10, Bauplatz A, HKLS | Hochbau Beispiel | 1.020.000,00 € | abgeschlossen | Schlusszahlung 18.02.2026 | – | – | grau |
| P8 | Hotel Wien 2, Haustechnik Neubau | Generalbau Beispiel | 1.480.000,00 € | abgeschlossen | Schlusszahlung 12.09.2025 | – | – | grau |
| | **Summe offene Projekte** (W21 bis P5, 5 Projekte) | | 3.720.000,00 € | | | **34.268,10 €** | **11.532,30 €** | |
| | **Summe alle Projekte** (8) | | 6.560.000,00 € | | | | | |

Die Firmenübersicht zeigt **„jetzt verrechenbar“ (34.268,10 €) als Hauptzahl** und „angemeldet und offen“ (11.532,30 €) getrennt daneben, nie zusammengezählt. Das Dossier sagt dazu „offen verrechenbar“; im Werkzeug bleiben die beiden Listenbegriffe aus dem Projekt, damit Firma und Projekt dieselben Wörter haben.

**Ampel (feste Regel, nur Status, nie Akzentfarbe):** rot = Schlussrechnung legen bis höchstens 21 Tage nach dem Demo-Stichtag **und** jetzt + offen > 0; gelb = jetzt + offen > 0; grün = nichts offen; grau = Schlussrechnung gelegt oder abgeschlossen. Angezeigt wird das Datum, kein Countdown.

**Fälle je Projekt:**

| Projekt | # | Art | Inhalt | Rechenweg | Betrag | Liste |
|---|---|---|---|---|---|---|
| P2 | P2-J1 | Regie | RB-03 Provisorische Heizung Stiege A, 11.06.2026, unterschrieben, in keiner AR | 12 h × 62,50 € + 12 h × 52,00 € + Material 214,30 € | 1.588,30 € | jetzt |
| P2 | P2-J2 | Regie | RB-05 Leitungen umgelegt wegen Fremdgewerk, 27.08.2026, unterschrieben, in keiner AR | 6 h × 62,50 € + Material 38,90 € | 413,90 € | jetzt |
| P2 | P2-J3 | erbracht, nicht verrechnet | 24.02.04A Mehrschicht-Verbundrohr 16 × 2,0: LV 600 m, Aufmaß bis AB-04 (31.08.) 520 m, in AR1 bis AR3 (31.03., 30.06., 30.09.) zusammen 455 m | 65 m × 16,90 € | 1.098,50 € | jetzt |
| P2 | P2-O1 | Regie | RB-06 Spülung Heizkreis Stiege B, 10.09.2026, **nicht unterschrieben** | 4 h × 62,50 € | 250,00 € | offen |
| P3 | P3-J1 | Mehrmenge | 22.03.06A Kupferrohr 22 × 1,0: LV 180 m, Aufmaß 236 m, Entwurf 180 m | 56 m × 21,40 € | 1.198,40 € | jetzt |
| P3 | P3-J2 | Regie | RB-02 Demontage Altanlage 5. OG, 18.08.2026, unterschrieben, nicht im Entwurf | 16 h × 64,00 € + 8 h × 53,50 € + Material 412,60 € | 1.864,60 € | jetzt |
| P4 | P4-J1 | Regie | RB-04 Provisorische Wasserversorgung Container, 15.07.2026, unterschrieben, in keiner AR | 10 h × 59,80 € + Material 96,40 € | 694,40 € | jetzt |

Regiesätze laut Vertrag: Hochbau Beispiel 62,50 / 52,00 €/h (wie W21), Generalbau Beispiel 64,00 / 53,50 €/h, Gemeinde Beispielstadt 59,80 / 49,90 €/h, Wohnbau Beispiel 61,00 / 51,00 €/h (Monteur / Helfer).

**Hinweis ohne Betrag:** P3-J1 Mengenänderung +31,1 % (56 von 180 m): „Der GU kann hier einen neuen Einheitspreis prüfen.“ (gleiche Regel wie J5 bis J7).

**Gegenproben (dürfen nichts finden):** P2: Aufmaßblatt AB-05 vom 15.10.2026 (nach der letzten AR) nicht in einer AR; RB-01, RB-02, RB-04 in AR verrechnet. P3: RB-01 in AR1. P4: RB-05 vom 08.10.2026, unterschrieben, nach der letzten AR, nicht verrechnet. P5: alles erbrachte vor dem 30.09. in AR1 bis AR3. P6 bis P8: kein Abgleich (Schlussrechnung gelegt bzw. abgeschlossen).

Kontrolle: P2 1.588,30 + 413,90 + 1.098,50 = 3.100,70 €; P3 1.198,40 + 1.864,60 = 3.063,00 €; Firma 27.410,00 + 3.100,70 + 3.063,00 + 694,40 = 34.268,10 €; offen 11.282,30 + 250,00 = 11.532,30 €.

## GU-Historie (Firmenebene, ab v1.0)

Aus den abgeschlossenen Projekten, den Korrekturblättern und den Zahlungen. Nur Fakten, keine Bewertung des Auftraggebers. Getrennt nach **Kürzungen** (der GU streicht Positionen) und **Abzügen ohne Vertragspunkt** (der GU zieht einen Satz ab, den der Vertrag nicht nennt).

**Feste Liste der Gründe** (erweitert gegenüber v1; Schlüssel im Code, gleicher Wortlaut in Vorprüfung, Kaskade und Historie): Aufmaß nicht gegengezeichnet · Stunden weichen ab · Rechenfehler · außerhalb des LV, kein Nachtrag gefunden · **neu:** Regie nicht unterschrieben · Menge ohne Aufmaß-Nachweis · Abzug ohne Vertragspunkt. Die Kaskade zeigt bei der Bauschadensumlage künftig ebenfalls „Abzug ohne Vertragspunkt“ statt „kein Vertragspunkt gefunden“.

**Kürzungen:**

| Auftraggeber | Projekt | Rechnung | Position | Grund | Betrag |
|---|---|---|---|---|---|
| Hochbau Beispiel | P7 | Schlussrechnung 20.11.2025 | 22.04.10A Plattenheizkörper Typ 11, 12 Stk × 351,00 € | Aufmaß nicht gegengezeichnet | 4.212,00 € |
| Hochbau Beispiel | P7 | Schlussrechnung 20.11.2025 | 24.05.03A | Rechenfehler | 118,40 € |
| Hochbau Beispiel | W21 | AR3 30.09.2026 | 24.05.02A | Rechenfehler | 36,00 € |
| Hochbau Beispiel | W21 | AR3 30.09.2026 | Z-01 Kernbohrungen | außerhalb des LV, kein Nachtrag gefunden | 2.160,00 € |
| Generalbau Beispiel | P8 | Schlussrechnung 30.06.2025 | RB-09 | Regie nicht unterschrieben | 2.310,00 € |
| Generalbau Beispiel | P8 | Schlussrechnung 30.06.2025 | 26.02.03A | Menge ohne Aufmaß-Nachweis | 1.640,50 € |

**Abzüge ohne Vertragspunkt:**

| Auftraggeber | Projekt | Rechnung | Abzug | Betrag |
|---|---|---|---|---|
| Hochbau Beispiel | P7 | Schlussrechnung 20.11.2025 | Bauschadensumlage 0,5 % auf 1.046.300,00 € | 5.231,50 € |
| Hochbau Beispiel | W21 | Zahlungen auf AR1 bis AR3 | Bauschadensumlage 0,5 %: 1.515,14 + 2.031,67 + 1.716,92 € | 5.263,73 € |

**Je Auftraggeber:**

| Auftraggeber | Projekte (abgeschlossen) | Kürzungen | Abzüge ohne Vertragspunkt | Nachträge akzeptiert | Tage bis Schlusszahlung |
|---|---|---|---|---|---|
| Hochbau Beispiel | 4 (1) | 6.526,40 € in 4 Zeilen, 2 Projekten | 10.495,23 € in 2 Projekten | 2 von 3, 11.760,00 von 14.240,00 € (82,6 %) | 90 (P7: gelegt 20.11.2025, bezahlt 18.02.2026) |
| Generalbau Beispiel | 2 (1) | 3.950,50 € in 2 Zeilen, 1 Projekt | – | 2 von 2, 18.260,00 € | 74 (P8: gelegt 30.06.2025, bezahlt 12.09.2025) |
| Gemeinde Beispielstadt | 1 (0) | – | – | – | – |
| Wohnbau Beispiel | 1 (0) | – | – | – | – |

Nachträge: Hochbau P7 N1 zusätzliche Heizkreisverteiler 8.640,00 € (akzeptiert), N2 Umlegung Grundleitung 3.120,00 € (akzeptiert), N3 Mehraufwand Winterbau 2.480,00 € (abgelehnt); Generalbau P8 N1 Zusatzkühlung Serverraum 12.400,00 €, N2 Mehrmengen Sanitär Wellness 5.860,00 € (beide akzeptiert).

**Brücke zur Demo (Skript 2:35):** Bei W21 zeigt die Vorprüfung G1 „Aufmaß nicht gegengezeichnet“ (6.384,00 €) und die Kaskade die Bauschadensumlage „Abzug ohne Vertragspunkt“ (6.043,34 €). Beides hat Hochbau Beispiel in P7 schon gekürzt bzw. abgezogen. Abgleich über den Schlüssel des Grundes, nicht über den Text. Hinweis im Werkzeug, neutral: „Gleicher Grund bei diesem Auftraggeber schon in P7.“

## WhatsApp-Szene (Mock, Skript 0:25 bis 0:55)

Vorgespielt, keine echte Nummer, kein echter Agent. Grundlage ist Zuruf Z6. Der Chat zeigt sichtbar das Datum 08.09.2026 („so kam der Zuruf herein“), damit Chat, Zeitachse und Demo-Stichtag zusammenpassen.

Gesprochener Satz im Skript (0:25, HKLS-Fassung statt „Steckdose“): „Heizkörper in Top 9 versetzt, weil der Polier es wollte. Zwanzig Sekunden, kein Regiebericht später.“

1. Monteur, Trupp 1 schickt ein Foto (Heizkörper an der neuen Stelle) und eine Sprachnachricht (Transkript wie Z6).
2. Agent antwortet: „Danke. So habe ich es verstanden: Wohnhausanlage Wien 21, Stiege 2, Top 9. Heizkörper im Wohnzimmer versetzt, keine LV-Position. 6 h Monteur, 6 h Helfer. Angewiesen vom Polier GU. Regiebericht: keiner. Stimmt das?“ Knöpfe: „Ja“, „Ändern“.
3. Tipp auf „Ja“. Agent: „Gespeichert.“
4. In der Zeitachse erscheint der Eintrag „08.09.2026, 14:30 · Zuruf · Heizkörper Top 9 versetzt“ mit Foto und Transkript, in Liste 2 der Posten O4 (687,00 €).

Der Agent nennt keinen Betrag und sagt nicht, ob etwas abrechenbar ist. Den Betrag zeigt erst das Werkzeug, aus dem Rechenkern.

## Fragen an den Insider (KW 45)

1. Zuruf-Regie ohne Bericht (O4, O5): mit Regiesatz (687,00 / 500,00 €) oder als Untergrenze aus dem Mittellohnpreis (681,60 / 454,40 €)?
2. Heizkörper versetzen, 2 Mann × 6 h: realistisch oder Obergrenze? (Prüfer: haltbar, wenn Anbindeleitung umgelegt, Strang entleert und gefüllt, Druckprobe; sonst eher 4 bis 8 Mannstunden.)
3. Taugt „der Polier vom GU hat es angeschafft“ als Grundlage, um einen Regiebericht nachträglich unterschreiben zu lassen?
4. Laufende Projekte: Ist „nur Leistung vor der letzten AR“ die richtige Grenze für „vergessen“?
5. Aus v1 weiter offen: Montagezeit J1, Mittellohnpreis 56,80 €/h, 20-%-Regel, Positions-Kurztexte.

## Änderungen gegenüber v1 (Dossier v3, 22.10.)

- Neu: Firma mit 8 Projekten und 4 Auftraggebern, Demo-Stichtag 22.10.2026, Ampel-Regel. Firmenübersicht zeigt „jetzt verrechenbar“ und „angemeldet und offen“ getrennt.
- Neu: 6 Zurufe in W21; 4 als zusätzliche Belege (J1, J3, J4, O1), 2 als neue Posten O4 (687,00 €) und O5 (500,00 €). **Liste 2: 10.095,30 → 11.282,30 €; W21 hat 15 statt 13 Befunde.** Beträge von Liste 1 (27.410,00 €), Liste 3, Vorprüfung (8.767,50 €) und Kaskade (Restforderung 170.060,89 €) bleiben gleich. Die Belegliste von J1, J3, J4 und O1 wächst um den Zuruf (J1: 7 statt 6 Belege).
- Neu: 7 kleine Projekte mit 7 Fällen, einem Hinweis (P3 +31,1 %) und Gegenproben; Regel für laufende Projekte (nur Leistung vor der letzten AR, für beide Listen).
- Neu: GU-Historie, getrennt nach Kürzungen und Abzügen ohne Vertragspunkt, mit Nachträgen und Tagen bis zur Schlusszahlung. Feste Liste der Gründe um 3 erweitert; die Kaskade nennt die Bauschadensumlage jetzt „Abzug ohne Vertragspunkt“.
- Neu: Belegquelle je Posten (Kodierung „Quelle des Belegs“), Anteil nach Betrag und nach Anzahl.
- Neu: Text der WhatsApp-Szene und Skript-Satz, HKLS statt „Steckdose“ (Dossier v3 nannte ein Elektro-Beispiel).
- Neu: Fragen an den Insider.
- Für den Bau (Phase 1b): Lösungsdatei und Tests im Code stehen noch auf v1 (`loesung.ts`: offen 10.095,30 €, 13 Befunde) und werden mit Datenmodell und Generator auf v2 gezogen.
- Unabhängig geprüft am 22.10.: alle Zahlen bestätigt, 15 Hinweise zu Regeln und Begriffen eingearbeitet.

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
