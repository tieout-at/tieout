# Demo dataset: built-in cases (solution list v3)

**As of:** 23.10.2026, **v3**, step 0c. Replaces v2 (Wien 21, 8 projects, 14 finds and 1 note in the main project). Built along `SPEZIFIKATION.md` section 7.1: short names, 5 projects, at most 8 finds and 1 Rechtsfrage in the main project, realistic amounts, and six events of the kinds the website timeline shows. **Everything is synthetic and fictitious.**
**Use:** this list is the yardstick for the generator and for `kern/` (step 2): the core must find exactly these cases, with exactly these amounts, and nothing else.
**Check:** every amount is recomputed in integer cents by `docs/demo_faelle_check.mjs` (run `node docs/demo_faelle_check.mjs` from the repository root); the script also fails if this file contains a euro amount it does not compute. Independent check on 23.10.2026 by a separate reviewer with its own calculation: no arithmetic error (182 of 182); its notes are worked in (see "Changes compared to v2"). Not yet reviewed by someone from construction: assumptions are marked **(Annahme)**.
**Demo date (Demo-Stichtag):** Thursday, 22.10.2026. The demo always calculates with this "today", so status colours stay the same.

## Names

Checked on 23.10.2026 against the WKO company search (every trade business in Austria is listed there), OpenStreetMap (no place of that name in Austria; the places of the five projects also not in Germany, Switzerland or South Tyrol, except Erlenhain, a locality in Göttingen) and a web search (no company of that name). Rejected on the way, among others: Veldmann (close to a real Austrian builder), Hollauf (a real electrical company), Gerstberg (a village in Lower Austria), Ulmbach (a place in Hesse), Lindbrunn (one letter from Lindabrunn, part of a real Marktgemeinde with a Volksschule; found by the independent check). Close but kept: Mooshaim (Moosham is a castle and two hamlets; P1 is a project, not an Auftraggeber).

| Role | Name | Short name in the UI |
|---|---|---|
| Betrieb | Kronfeld Haustechnik GmbH | Kronfeld Haustechnik |
| Auftraggeber, Generalunternehmer | Hornfeld Bau GmbH | Hornfeld Bau |
| Auftraggeber, Generalunternehmer | Pfeilberg Bau GmbH | Pfeilberg Bau |
| Auftraggeber, öffentlicher Auftraggeber | Marktgemeinde Ahornbrunn | Marktgemeinde Ahornbrunn |
| P1, main project | Wohnpark Mooshaim, 32 Wohnungen und Tiefgarage, HKLS | Wohnpark Mooshaim |
| P2 | Bürohaus Kiefernau, Neubau, HKLS | Bürohaus Kiefernau |
| P3 | Volksschule Ahornbrunn, Zubau und Sanierung, HKLS | Volksschule Ahornbrunn |
| P4 | Wohnhof Erlenhain, 24 Wohnungen, HKLS | Wohnhof Erlenhain |
| P5 | Pflegeheim Eibenau, Zubau, HKLS | Pflegeheim Eibenau |

## Company

- **Kronfeld Haustechnik**, heating, air conditioning, ventilation and plumbing (HKLS), Vienna, 64 employees (Annahme). Members by role: "Abrechnung", "Geschäftsführung", "Bauleitung".
- 5 projects in the twin, contract sums 3.487.720,00 €; 3 open projects with 1.897.820,00 €.
- Auftraggeber: **Hornfeld Bau** (Generalunternehmer, P1, P2, P4), **Pfeilberg Bau** (Generalunternehmer, P5), **Marktgemeinde Ahornbrunn** (öffentlicher Auftraggeber, P3).
- Employees appear only as a role ("Monteur, Trupp 1"), hours only per crew.
- Assumption for the evidence source (Annahme): Leistungsverzeichnis, entered Aufmaß, Abschlagsrechnungen and Verträge are in the company's ERP and AVA; Regieberichte on paper (scan), e-mails saved from Outlook, WhatsApp-Meldungen via the agent. An Aufmaß that was never entered (only an Excel file, or not countersigned) counts as outside the ERP.
- Assumption on how the own Entwurf is made (Annahme): it is printed from the AVA, so it contains the Aufmaß entered up to that day. The Abrechnung enters only countersigned Aufmaßblätter.

## P1 Wohnpark Mooshaim (fully worked out)

### Contract and price basis

- Auftraggeber **Hornfeld Bau**. Bauvertrag of 12.11.2025, contract sum **746.820,00 €** net, Einheitspreisvertrag, ÖNORM B 2110, **Festpreise bis Bauende** (Vertragspunkt 7.1), so no Preisumrechnung.
- Nachlass 3 % (Vertragspunkt 5.1). Baustrom und Bauwasser 0,6 % (4.6). Deckungsrücklass 5 % on every Abschlagsrechnung, released with the Schlussrechnung (9.1). Haftrücklass 3 % on the Schlussrechnung, replaceable by a bank guarantee (9.2). Baustelleneinrichtung as a lump sum (4.3). **No** Bauschadensumlage in the Vertrag, no Skonto.
- Regiesätze (6.3): Monteur 64,80 €/h, Helfer 54,20 €/h. Regiematerial at Einstandspreis plus 15 % (6.4). For comparison: the official Regie rates 2026 for work outside a tender are 70,66 €/h (Monteur) and 60,96 €/h (Hilfsmonteur), source wko.at/wirinstallateure; contracts with a Generalunternehmer are usually below.
- **Schlussrechnung legen bis 30.10.2026** (plain date, no statement on deadlines).
- Abschlagsrechnungen after progress, at most once a quarter (Vertragspunkt 8.1, Annahme: monthly is more usual with a Generalunternehmer; quarterly keeps the demo small). Payment within 30 days (8.2).
- Preisbasis, own calculation K3 (Annahme): Mittellohnkosten 45,80 €/h (Mittellohn plus Lohnnebenkosten), Mittellohnpreis 58,60 €/h (plus Gesamtzuschlag). Surcharge on material in the own calculation 12 % (Annahme). K7 of 22.04.12B: 1,10 h labour, 221,94 € other costs.
- Work on site 02.02.2026 to 09.10.2026 (Übernahme 09.10.2026). Two Stiegen, 32 Wohnungen, Tiefgarage.
- Abschlagsrechnungen (each for its period, not cumulative): Abschlagsrechnung 1 of 31.03.2026 168.400,00 €, paid 30.04.2026; Abschlagsrechnung 2 of 30.06.2026 276.900,00 €, paid 30.07.2026; Abschlagsrechnung 3 of 30.09.2026 241.600,00 €, paid 21.10.2026 after the Korrekturblatt; together 686.900,00 €.
- Own Entwurf of the Schlussrechnung of 19.10.2026: **752.314,80 €** (without the finds below; Z-01 Kernbohrungen still in it, see G3).
- Hornfeld Bau's Abzugsschreiben of 16.02.2026 announces 0,6 % Baustrom und Bauwasser and 0,5 % Bauschadensumlage on every Abschlagsrechnung and on the Schlussrechnung. Korrekturblatt to Abschlagsrechnung 3 of 14.10.2026: Z-01 Kernbohrungen struck (G3).

### Folder and WhatsApp-Meldungen

- **77 Belege**, 4 of them duplicates: 1 Vertrag, 1 Leistungsverzeichnis, 1 Preisbasis (K3 and K7), 13 Aufmaßblätter, 15 Regieberichte, 1 Stundenzettel (KW 23, Trupp 2, for G2), 3 Abschlagsrechnungen, 3 Zahlungsavisos, 1 Korrekturblatt (Abschlagsrechnung 3), 1 Abzugsschreiben, 1 Entwurf, 3 Großhändlerrechnungen (material of Regiebericht 9, 12 and 15), 16 E-Mails (14 originals, 2 duplicates), 10 Fotos (8 originals, 2 duplicates), 1 Fotodokumentation Brandschutz (PDF, 142 Abschottungen DN 110 with label), 6 Pläne (H-101 Index C; H-201 Index C and D; L-310 Index D and E; S-150 Index C). 18 fields corrected by hand on import (8 measured quantities, 7 Regie hours, 2 e-mail dates, 1 photo date).
- Leistungsverzeichnis: 286 positions (LG 22 Heizung 98, LG 24 Sanitär 116, LG 26 Lüftung 54, LG 28 MSR 18).
- Aufmaßblätter: 13, all countersigned except Aufmaßblatt 12, and all entered into the AVA except: Aufmaßblatt 11 (an Excel file on the Bauleitung's laptop with a countersigned printout, never passed on), Aufmaßblatt 12 (not countersigned, so not entered) and Aufmaßblatt 13 (countersigned 08.10.2026, entered 20.10.2026, one day after the Entwurf was printed). Aufmaßblatt 10 carries Z-01 (12 Kernbohrungen).
- Regieberichte: 15; 12 invoiced, 2 signed and not invoiced (Regiebericht 9 and 15), 1 not signed (Regiebericht 12).
- Plan H-201: Index C (12.02.2026) one Wohnküche with one radiator per flat of Wohnungstyp C; Index D (03.04.2026) Wohnküche divided, one room with one radiator more in each of the 14 flats of Wohnungstyp C.
- **4 WhatsApp-Meldungen** through the agent (not in the folder; the 77 Belege stay). Each one voice message with transcript and one photo, time from the message, sender as a role, confirmed by the sender.

| # | Time | Sender | Content (transcript, shortened) | Reference |
|---|---|---|---|---|
| W1 | 12.05.2026, 15:20 | Monteur, Trupp 1 | "Wohnungstyp C: die zusätzlichen Heizkörper laut Plan D sind montiert." | evidence for F1 |
| W2 | 03.06.2026, 09:05 | Monteur, Trupp 2 | "Steigleitung Stiege 2 geht nicht durch, da ist ein Unterzug, der im Plan nicht drin ist. Wir legen um, die Bauleitung von Hornfeld weiß Bescheid." | evidence for F2 |
| W3 | 14.07.2026, 07:55 | Monteur, Trupp 1 | "Wasserschaden im Keller, der Trockenbau hat eine Leitung angebohrt, wir haben abgesperrt." | evidence for F3 |
| W4 | 08.09.2026, 14:30 | Monteur, Trupp 1 | "Top 9: Heizkörper im Wohnzimmer versetzt, die Küche wurde anders geplant, der Polier von Hornfeld hat es angeschafft. Zwei Mann, je vier Stunden." | **new find F7**, demo scene |

Rules: "Zwei Mann" is 1 Monteur and 1 Helfer (Annahme). W1 to W3 name no hours, so that G2 (Regiebericht against Stundenzettel) stays as it is; W4 falls in KW 37, a week without a Stundenzettel. The agent assesses nothing; who instructed the work is recorded, not assessed.

**For the build:** WhatsApp-Meldungen are objects of their own in the project (channel WhatsApp), not part of the 77 Belege. "Every piece of evidence points to an existing Beleg" applies to Belege **or** WhatsApp-Meldungen. W4 is no Regiebericht and does not count in the Regie statistics (stays 15, 12, 2, 1).

### Six events of the kinds the website shows

The website's section 02 shows six kinds of events, four not invoiced, two invoiced. P1 has one of each kind, in HKLS. The website keeps its own example (section "Website"); the two do not need to match.

| KW | Kind (as on the website) | Event in P1 | Amount | In the Schlussrechnung |
|---|---|---|---|---|
| 11 | Stunden | Regiebericht 3 of 12.03.2026, Baustellenwasser umgelegt, 8 h Monteur, signed: 8 h × 64,80 € = 518,40 € + material 84,00 € + 15 % (12,60 €) = 96,60 € | 615,00 € | verrechnet (Abschlagsrechnung 1) |
| 15 | E-Mail | Bauleitung Hornfeld Bau, 07.04.2026: "Wohnungstyp C: je ein Heizkörper zusätzlich laut Plan D, bitte gleich mitmachen." | 6.648,60 € | fehlt, gefunden as F1 |
| 20 | Plan | Plan L-310 Index E of 13.05.2026: Lüftungsleitung in der Tiefgarage umgeführt, 26.03.05A Wickelfalzrohr DN 250, 38 m × 52,40 € (Aufmaßblatt 7 of 26.06.2026, countersigned) | 1.991,20 € | verrechnet (Abschlagsrechnung 2) |
| 26 | Stunden ohne Unterschrift | Regiebericht 12 of 24.06.2026, Heizkörper Stiege 1 für den Maler abgenommen und wieder montiert, not signed | 643,99 € | fehlt, gefunden as F6 |
| 33 | Foto | Fotodokumentation Brandschutz of 13.08.2026: 142 Brandschutzmanschetten, 22 more than invoiced | 2.032,80 € | fehlt, gefunden as F5 |
| 37 | WhatsApp | W4, 08.09.2026: Polier of Hornfeld Bau has the radiator in Top 9 moved | 476,00 € | fehlt, gefunden as F7 |

Counter-check: the two invoiced events produce no find (no false alarm). The 20 % rule does not apply to Plan L-310 (220 m in the Leistungsverzeichnis, 258 m measured, +17,3 %).

### "Zusätzlich verrechenbar": 5 finds, 14.620,15 €

Done, proven and not in the own Entwurf. **14.620,15 € is 1,96 % of the contract sum** (rule: 1,5 % to 2,5 %).

| # | Art | What | Calculation | Amount | Belege |
|---|---|---|---|---|---|
| F1 | "Mehrmenge aus Planänderung" | 14 radiators with accessories in Wohnungstyp C, 4 positions (table below) | 14 × 286,40 € + 14 × 24,80 € + 14 × 38,60 € + 126 m × 13,90 € | 6.648,60 € | Leistungsverzeichnis (quantities and Einheitspreise); Plan H-201 Index C and Index D; E-Mail Bauleitung Hornfeld Bau 07.04.2026 "bitte gleich mitmachen"; Foto 15.05.2026; Aufmaßblatt 12 of 18.09.2026, **not countersigned**, so never entered. 6 Belege and W1 |
| F2 | "Regie" | Regiebericht 9 of 05.06.2026 (work on 03.06. and 05.06.2026), Heizungssteigleitung Stiege 2 umgelegt (Unterzug not in the plan), signed, in no Abschlagsrechnung | 12 h × 64,80 € = 777,60 € + 12 h × 54,20 € = 650,40 € + material 312,60 € + 15 % (46,89 €) = 359,49 € | 1.787,49 € | Regiebericht 9 (paper), W2, Großhändlerrechnung |
| F3 | "Regie" | Regiebericht 15 of 14.07.2026, Leitung im Keller nach Beschädigung durch den Trockenbau abgesperrt, repariert, druckgeprüft; signed, in no Abschlagsrechnung | 6 h × 64,80 € = 388,80 € + 6 h × 54,20 € = 325,20 € + material 96,40 € + 15 % (14,46 €) = 110,86 € | 824,86 € | Regiebericht 15 (paper), W3, Großhändlerrechnung |
| F4 | "Mehrmenge" | 24.02.05A Mehrschichtverbundrohr 20 × 2,25 inkl. Formteile und Dämmung, Trinkwasser: beauftragt 640 m, erbracht 808 m (Aufmaßblatt 11 of 28.08.2026), verrechnet 640 m | 168 m × 19,80 € | 3.326,40 € | Aufmaßblatt 11 (Excel and countersigned printout, never entered) |
| F5 | "Mehrmenge" | 24.08.02A Brandschutzmanschette für Kunststoffrohr DN 110, Deckendurchführung EI 90, inkl. Kennzeichnung: beauftragt 120 Stk, erbracht 142 Stk (Aufmaßblatt 13 from the Fotodokumentation), verrechnet 120 Stk | 22 Stk × 92,40 € | 2.032,80 € | Fotodokumentation Brandschutz 13.08.2026; Aufmaßblatt 13 of 24.09.2026, countersigned 08.10.2026, entered after the Entwurf |

F1 in detail (all four positions measured on Aufmaßblatt 12):

| Position | Short text | Beauftragt | Erbracht | Verrechnet | Offen |
|---|---|---|---|---|---|
| 22.04.12B | Plattenheizkörper Typ 22 VK, 600/1000 | 86 Stk | 100 Stk | 86 Stk | 14 × 286,40 € = 4.009,60 € |
| 22.05.03A | Thermostatkopf mit eingebautem Fühler | 168 Stk | 182 Stk | 168 Stk | 14 × 24,80 € = 347,20 € |
| 22.05.06A | Heizkörper-Anschlussarmatur, absperrbar | 168 Stk | 182 Stk | 168 Stk | 14 × 38,60 € = 540,40 € |
| 22.03.02A | Anbindeleitung Mehrschichtverbundrohr 16 × 2,0 inkl. Formteile | 1.512 m | 1.638 m | 1.512 m | 126 m × 13,90 € = 1.751,40 € |

9 m of connection pipe per radiator (flow and return to the flat's distributor, Annahme). K7 plausibility of 22.04.12B: 1,10 h × 58,60 € = 64,46 € labour + 221,94 € other costs = 286,40 €.

Composition: 1 Mehrmenge aus Planänderung (F1), 2 Regie (F2, F3), 2 Mehrmengen (F4, F5).
Total: 6.648,60 + 1.787,49 + 824,86 + 3.326,40 + 2.032,80 = **14.620,15 €**.

**"Davon mit Kürzungsrisiko" (E13): 6.843,00 €**, 46,8 % of 14.620,15 €. Definition: the sum of the Vorprüfung amounts in state "droht" that lie inside "zusätzlich verrechenbar" (G1 6.648,60 € + G2 194,40 €), not the full amount of the flagged finds. Shown under the headline amount on the project and on "Start", never subtracted from it.

**Note without amount:** F4 changes the quantity by +26,3 % (168 of 640 m): "Hornfeld Bau kann hier einen neuen Einheitspreis prüfen." (Annahme on the ÖNORM B 2110 rule, question for the insider.) F1 (+16,3 % at 22.04.12B) and F5 (+18,3 %) stay below 20 %.

### "In Klärung": 3 finds, 8.073,59 €

| # | Art | Belegstand | What | Calculation | Amount |
|---|---|---|---|---|---|
| F6 | "Regie" | "Beleg fehlt" | Regiebericht 12 of 24.06.2026, Heizkörper Stiege 1 für den Maler abgenommen und wieder montiert, Strang entleert und befüllt (no position in the Leistungsverzeichnis), instructed by the Polier, **not signed** | 5 h × 64,80 € = 324,00 € + 5 h × 54,20 € = 271,00 € + material 42,60 € + 15 % (6,39 €) = 48,99 € | 643,99 € |
| F7 | "Stunden ohne Regiebericht" | "Beleg fehlt" | W4: radiator in Top 9 moved, instructed by the Polier of Hornfeld Bau; **no Regiebericht, no signature** | 4 h × 64,80 € = 259,20 € + 4 h × 54,20 € = 216,80 € | 476,00 € |
| F8 | "Änderung angemeldet" | "Nachtrag nicht gelegt" | Technikraum umgeplant (second buffer tank, distributor moved): instructed by e-mail of Hornfeld Bau 12.03.2026, Mehrkosten announced by e-mail of Kronfeld Haustechnik 16.03.2026, never priced | estimate on the Preisbasis of the Vertrag: 64 h × 58,60 € (Mittellohnpreis) = 3.750,40 € + material 2.860,00 € + 12 % (343,20 €) = 3.203,20 € | 6.953,60 € |

Total: 643,99 + 476,00 + 6.953,60 = **8.073,59 €**; of which "Beleg fehlt" 1.119,99 €, "Nachtrag nicht gelegt" 6.953,60 €.

F7 without material: the message names none, and tieout does not invent prices. Priced with the Regiesätze of the Vertrag like F6 (Annahme; the alternative, a floor from the Mittellohnkosten, is on the Schlussbesprechungs-Blatt). Remedy in the app ("Abhilfe"), the same text as the task: F7 "Regiebericht schreiben und vom Polier unterschreiben lassen", F6 "Regiebericht vom Polier unterschreiben lassen", F8 "Nachtrag mit Preis legen".

### Rechtsfrage (note without amount)

R1: E-Mail of Hornfeld Bau 02.07.2026, "Fertigstellung Stiege 2 drei Wochen vorziehen" (schedule change). Shown as "Rechtsfrage" for the Geschäftsführung; tieout gives no legal reading and uses no word like "Forcierung".

### Vorprüfung: 3 positions, 8.619,00 €

The checks a Generalunternehmer's software runs, applied to the Entwurf with the finds.

| # | Position | What Hornfeld Bau would cut | Reason (fixed list) | Abhilfe | Amount | State |
|---|---|---|---|---|---|---|
| G1 | F1 (4 positions) | Mehrmenge, 14 radiators with accessories | "Aufmaß nicht gegengezeichnet" (Aufmaßblatt 12) | "Plan H-201 Index D und die E-Mail vom 07.04. beilegen, gemeinsames Aufmaß vereinbaren" | 6.648,60 € | "droht" |
| G2 | Regiebericht 9 (F2) | 3 h Monteur | "Stunden weichen ab": Regiebericht 9 says 12 h Monteur and 12 h Helfer; the own Stundenzettel KW 23, Trupp 2, books 9 h Monteur and 12 h Helfer to Regiebericht 9 | clarify the 3 h with the Bauleitung before the Schlussrechnung goes out | 3 h × 64,80 € = 194,40 € | "droht" |
| G3 | Z-01 Kernbohrungen DN 100, 12 Stk | the whole position, invoiced in Abschlagsrechnung 3 and still in the Entwurf | "Außerhalb des Leistungsverzeichnisses, kein Nachtrag gefunden" | find the instruction or strike the position | 12 × 148,00 € = 1.776,00 € | "schon gekürzt" (Korrekturblatt Abschlagsrechnung 3) |

Total **8.619,00 €**: "droht" 6.843,00 €, "schon gekürzt" 1.776,00 €. The Vorprüfung finds the one cut already made (1 of 1) and two more (G1, G2). It **overlaps** "zusätzlich verrechenbar" (G1 = F1, G2 is part of F2); never add them up.

G2 is an internal check: Hornfeld Bau does not see the Stundenzettel, but checks Regie hours against its own Bautagesbericht, so a Regiebericht that the own records do not support is weak. The Stundenzettel is read only as hours per crew and week booked to a Regiebericht (specification 1.3); it is never handed out.

Counter-check: "Menge ohne Aufmaß-Nachweis" finds nothing in P1 (every invoiced quantity is covered by an Aufmaßblatt, Z-01 by Aufmaßblatt 10); "Rechenfehler" finds nothing.

### Rechnungsabschluss of the Schlussrechnung

How Hornfeld Bau will settle the Schlussrechnung as it stands: the own Entwurf plus the finds. All amounts net. Before anyone decided, every "belegt" find counts (section 5.1 of the specification). The Entwurf still contains Z-01 (1.776,00 €), which Hornfeld Bau already struck once (G3); the Rechnungsabschluss does not anticipate that cut, the Vorprüfung shows it. If the Abrechnung strikes Z-01, `kern/` recomputes the Rechnungsabschluss from the changed Entwurf.

| Line | Rate | Source | Check | Amount |
|---|---|---|---|---|
| Gesamtleistung: Entwurf 752.314,80 € + "zusätzlich verrechenbar" 14.620,15 € | | own Entwurf, finds | | 766.934,95 € |
| Nachlass | 3,00 % | Vertragspunkt 5.1 | laut Vertrag | −23.008,05 € |
| After Nachlass | | | | 743.926,90 € |
| Baustrom und Bauwasser | 0,60 % | Abzugsschreiben | laut Vertragspunkt 4.6 | −4.463,56 € |
| Bauschadensumlage | 0,50 % | Abzugsschreiben | **"Abzug ohne Vertragspunkt"** | −3.719,63 € |
| Before Haftrücklass | | | | 735.743,71 € |
| Haftrücklass (replaceable by bank guarantee) | 3,00 % | Vertragspunkt 9.2 | laut Vertrag | −22.072,31 € |
| Amount of the Schlussrechnung before payments | | | | 713.671,40 € |
| Payments on Abschlagsrechnung 1 to 3 | | Zahlungsavisos | | −624.396,99 € |
| **"Restforderung"** | | | | **89.274,41 €** |

**"Restforderung laut Vertrag" (E14): 92.882,45 €.** The same calculation without the Bauschadensumlage: before Haftrücklass 739.463,34 €, Haftrücklass 22.183,90 €, amount 717.279,44 €, minus payments 624.396,99 €. The difference of 3.608,04 € is the Bauschadensumlage of the Schlussrechnung (3.719,63 €) less the Haftrücklass on it (111,59 €). The 3.322,86 € Bauschadensumlage already withheld on the Abschlagsrechnungen are part of it, not on top: the Schlussrechnung charges the levy on the whole work and then subtracts what was actually paid.

Payments per Abschlagsrechnung (each rate on the base named here, commercially rounded to the cent): 3 % Nachlass on (Abschlagsrechnung − cut per Korrekturblatt); 0,6 % Baustrom und Bauwasser and 0,5 % Bauschadensumlage both on the amount after Nachlass; 5 % Deckungsrücklass on what is left after those two.

| Abschlagsrechnung | Amount | Cut | Nachlass | Baustrom und Bauwasser | Bauschadensumlage | Deckungsrücklass | Payment |
|---|---|---|---|---|---|---|---|
| 1, 31.03.2026 | 168.400,00 € | 0,00 € | 5.052,00 € | 980,09 € | 816,74 € | 8.077,56 € | 153.473,61 € |
| 2, 30.06.2026 | 276.900,00 € | 0,00 € | 8.307,00 € | 1.611,56 € | 1.342,97 € | 13.281,92 € | 252.356,55 € |
| 3, 30.09.2026 | 241.600,00 € | 1.776,00 € | 7.194,72 € | 1.395,78 € | 1.163,15 € | 11.503,52 € | 218.566,83 € |
| Total | 686.900,00 € | 1.776,00 € | 20.553,72 € | 3.987,43 € | 3.322,86 € | 32.863,00 € | **624.396,99 €** |

Check Abschlagsrechnung 3: 241.600,00 − 1.776,00 = 239.824,00; × 3 % = 7.194,72; 239.824,00 − 7.194,72 = 232.629,28; × 0,6 % = 1.395,78; × 0,5 % = 1.163,15; 232.629,28 − 1.395,78 − 1.163,15 = 230.070,35; × 5 % = 11.503,52; 230.070,35 − 11.503,52 = 218.566,83.

### Schlussbesprechungs-Blatt: Forderung and Untergrenze per find

For the final meeting after the Schlussrechnung. The only place where "zusätzlich verrechenbar" and "in Klärung" appear in one total, because it lists everything that can be raised. **Rule (Annahme, question for the insider):** the Untergrenze is the own cost: hours × **Mittellohnkosten** 45,80 €/h (Monteur and Helfer alike) + material at Einstandspreis, without the Regie surcharge. Mehrmengen keep the Einheitspreis of the Vertrag, no floor below it. F8 is priced on the Preisbasis of the Vertrag; its floor is hours × Mittellohnkosten + material at Einstandspreis. Not on the sheet: R1.

| Group | Find | Forderung | Floor calculation | Untergrenze |
|---|---|---|---|---|
| belegt | F1 | 6.648,60 € | Einheitspreis | 6.648,60 € |
| belegt | F2 | 1.787,49 € | 24 h × 45,80 € = 1.099,20 € + material 312,60 € | 1.411,80 € |
| belegt | F3 | 824,86 € | 12 h × 45,80 € = 549,60 € + material 96,40 € | 646,00 € |
| belegt | F4 | 3.326,40 € | Einheitspreis | 3.326,40 € |
| belegt | F5 | 2.032,80 € | Einheitspreis | 2.032,80 € |
| Beleg fehlt | F6 | 643,99 € | 10 h × 45,80 € = 458,00 € + material 42,60 € | 500,60 € |
| Beleg fehlt | F7 | 476,00 € | 8 h × 45,80 € | 366,40 € |
| Nachtrag nicht gelegt | F8 | 6.953,60 € | 64 h × 45,80 € = 2.931,20 € + material 2.860,00 € | 5.791,20 € |

| Group | Finds | Forderung | Untergrenze | Spielraum |
|---|---|---|---|---|
| belegt | 5 | 14.620,15 € | 14.065,60 € | 554,55 € |
| Beleg fehlt | 2 | 1.119,99 € | 867,00 € | 252,99 € |
| Nachtrag nicht gelegt | 1 | 6.953,60 € | 5.791,20 € | 1.162,40 € |
| **Total** | 8 | **22.693,74 €** | **20.723,80 €** | **1.969,94 €** |

Spielraum 1.969,94 € = 8,7 % of the Forderung (v2 used the Mittellohnpreis and left almost no Spielraum).

### Evidence source per find

"Evidence" means proof of the **work done**, not of the price (rates and Einheitspreise come from Vertrag and Leistungsverzeichnis). "Nur außerhalb ERP" means no proof of work in the ERP (assumption under "Company"). Shown only in "Berichte" (E15).

| Find | Evidence sources ("Belegquelle") | Nur außerhalb ERP |
|---|---|---|
| F1 | Datei (Plan C and D, Aufmaßblatt 12, not entered), E-Mail, Foto, WhatsApp | yes |
| F2, F3 | Papier (Regiebericht), WhatsApp | yes |
| F4 | Datei (Aufmaßblatt 11, Excel, never entered) | yes |
| F5 | Datei (Aufmaßblatt 13, entered after the Entwurf), Foto (Fotodokumentation) | no |
| F6 | Papier (Regiebericht 12) | yes |
| F7 | WhatsApp only | yes |
| F8 | E-Mail | yes |

Reported per money word, never as one total (specification 3.3):

| | Nur außerhalb ERP | Share | Finds |
|---|---|---|---|
| "Zusätzlich verrechenbar" | F1 + F2 + F3 + F4 = 6.648,60 + 1.787,49 + 824,86 + 3.326,40 = 12.587,35 € of 14.620,15 € | 86,1 % | 4 of 5 |
| "In Klärung" | 8.073,59 € of 8.073,59 € | 100,0 % | 3 of 3 |

**Synthetic, no evidence for any hypothesis.** By construction, a Mehrmenge whose Aufmaß is in the AVA is rarely forgotten; that is why almost every find here lies outside the ERP.

### Position table extract ("Positionen", Ebene 2)

Every row with something open; the footer shows "Zusätzlich verrechenbar" 14.620,15 € and "In Klärung" 8.073,59 € separately.

| Position | Beauftragt | Erbracht | Verrechnet | Offen | Belegstand |
|---|---|---|---|---|---|
| 22.04.12B Plattenheizkörper Typ 22 VK, 600/1000 | 86 Stk | 100 Stk | 86 Stk | 4.009,60 € | belegt |
| 22.05.03A Thermostatkopf | 168 Stk | 182 Stk | 168 Stk | 347,20 € | belegt |
| 22.05.06A Heizkörper-Anschlussarmatur | 168 Stk | 182 Stk | 168 Stk | 540,40 € | belegt |
| 22.03.02A Anbindeleitung 16 × 2,0 | 1.512 m | 1.638 m | 1.512 m | 1.751,40 € | belegt |
| 24.02.05A Mehrschichtverbundrohr 20 × 2,25 | 640 m | 808 m | 640 m | 3.326,40 € | belegt |
| 24.08.02A Brandschutzmanschette DN 110 | 120 Stk | 142 Stk | 120 Stk | 2.032,80 € | belegt |
| Regiebericht 9, Steigleitung Stiege 2 umgelegt (Unterzug) | – | 12 h Monteur, 12 h Helfer | 0 h | 1.787,49 € | belegt |
| Regiebericht 15, Leitung im Keller repariert | – | 6 h Monteur, 6 h Helfer | 0 h | 824,86 € | belegt |
| Regiebericht 12, Heizkörper für den Maler abgenommen | – | 5 h Monteur, 5 h Helfer | 0 h | 643,99 € | Beleg fehlt |
| WhatsApp-Meldung 08.09.2026, Heizkörper Top 9 versetzt | – | 4 h Monteur, 4 h Helfer | 0 h | 476,00 € | Beleg fehlt |
| Änderung Technikraum (E-Mail 16.03.2026) | – | – | – | 6.953,60 € | Nachtrag nicht gelegt |

## The other four projects

Small but complete datasets: `kern/` calculates their amounts as for P1; no sum is set by hand.

**Rule for ongoing projects ("Lauf je Abschlagsrechnung", E16):** without an Entwurf, the work done is compared with the Abschlagsrechnungen. A find arises only for work whose **work date** (Aufmaß date, date of the work in the Regiebericht or the WhatsApp-Meldung) lies **before the date of the last Abschlagsrechnung** and that is in no Abschlagsrechnung. Later work goes into the next Abschlagsrechnung and is no find (Annahme, question for the insider). Signed Regie is "belegt", unsigned Regie and hours only from a WhatsApp-Meldung are "Beleg fehlt". Quantities above the invoiced amount but below the Leistungsverzeichnis are "erbracht, nicht verrechnet".

**What the app shows for P2 and P3:** project, "Positionen" and "Funde"; Vorprüfung and Rechnungsabschluss only for P1 (Annahme for the demo). All Aufmaßblätter of P2 and P3 are countersigned; in P4 Aufmaßblatt 9 was not (the cut in the Auftraggeber history). There are no Korrekturblätter for open Abschlagsrechnungen.

| # | Project | Auftraggeber | Contract sum | Stage | Date | Zusätzlich verrechenbar | In Klärung | Status |
|---|---|---|---|---|---|---|---|---|
| P1 | Wohnpark Mooshaim | Hornfeld Bau | 746.820,00 € | "Schlussrechnung vorbereiten" | legen bis 30.10.2026 | 14.620,15 € | 8.073,59 € | red |
| P2 | Bürohaus Kiefernau | Hornfeld Bau | 612.400,00 € | "in Ausführung" | last Abschlagsrechnung 30.09.2026 | 4.852,73 € | 0,00 € | yellow |
| P3 | Volksschule Ahornbrunn | Marktgemeinde Ahornbrunn | 538.600,00 € | "in Ausführung" | last Abschlagsrechnung 30.09.2026 | 3.160,08 € | 245,60 € | yellow |
| P4 | Wohnhof Erlenhain | Hornfeld Bau | 668.400,00 € | "abgeschlossen" | final payment 18.02.2026 | – | – | grey |
| P5 | Pflegeheim Eibenau | Pfeilberg Bau | 921.500,00 € | "abgeschlossen" | final payment 12.09.2025 | – | – | grey |
| | **Open projects** (P1 to P3) | | 1.897.820,00 € | | | **22.632,96 €** | **8.319,19 €** | |
| | **All projects** | | 3.487.720,00 € | | | | | |

Status colour (fixed rule, status only): red = Schlussrechnung to be submitted within 21 days of the demo date **and** something open; yellow = something open; green = nothing open; grey = Schlussrechnung submitted or project closed. The date is shown, never a countdown.

### P2 Bürohaus Kiefernau (Hornfeld Bau, in Ausführung)

Bauvertrag of 18.03.2026, contract sum 612.400,00 €, same contract template as P1 (Regiesätze 64,80 / 54,20 €/h, Regiematerial at Einstandspreis plus 15 %). Abschlagsrechnung 1 of 31.07.2026 148.300,00 €, Abschlagsrechnung 2 of 30.09.2026 196.800,00 €, both written from the Bauleitung's estimate of progress, not from the AVA (Annahme). Belege: Aufmaßblätter 1 to 4 invoiced in Abschlagsrechnung 1 and 2, Aufmaßblatt 5 in part (P2-F3), Aufmaßblatt 6 after the last Abschlagsrechnung; Regieberichte 1 to 3 and 5 invoiced, 4 and 6 are finds, 7 after the last Abschlagsrechnung.

| # | Art | Content | Calculation | Amount | Belegstand |
|---|---|---|---|---|---|
| P2-F1 | "Regie" | Regiebericht 6, work date 24.09.2026: Teeküche 2. OG, Spüle und Geschirrspüleranschluss verlegt, instructed by the Bauleitung of Hornfeld Bau; from WhatsApp-Meldung P2-W1, Regiebericht written 01.10.2026, signed by the Polier 02.10.2026 | 5 h × 64,80 € = 324,00 € + 5 h × 54,20 € = 271,00 € + material 186,20 € + 15 % (27,93 €) = 214,13 € | 809,13 € | belegt |
| P2-F2 | "Regie" | Regiebericht 4 of 27.08.2026, provisorische Wasserversorgung für den Estrichleger, signed, in no Abschlagsrechnung | 8 h × 64,80 € = 518,40 € + material 248,00 € + 15 % (37,20 €) = 285,20 € | 803,60 € | belegt |
| P2-F3 | "erbracht, nicht verrechnet" | 22.03.08A Mehrschichtverbundrohr 26 × 3,0 inkl. Formteile, Heizung: Leistungsverzeichnis 880 m, measured up to Aufmaßblatt 5 (28.08.2026) 760 m, in Abschlagsrechnung 1 and 2 together 610 m | 150 m × 21,60 € | 3.240,00 € | belegt |

Total P2: 809,13 + 803,60 + 3.240,00 = **4.852,73 €**.

**The "Lauf je Abschlagsrechnung" in P2 (demo of E16), as the "Verlauf" of P2-F1 shows it:**

1. 24.09.2026, 10:40: WhatsApp-Meldung P2-W1, Monteur, Trupp 3: "Teeküche zweiter Stock: Spüle und Geschirrspüler auf die andere Seite verlegt, die Bauleitung von Hornfeld hat es angeordnet. Zwei Mann, je fünf Stunden." Ablauf "Meldung zu Regiebericht": task to the Bauleitung "Regiebericht schreiben und vom Polier unterschreiben lassen".
2. 30.09.2026: Abschlagsrechnung 2 goes out without the hours; the task is still open. Ablauf "Lauf je Abschlagsrechnung": "Abgleich" finds hours with a work date before the Abschlagsrechnung and in no Abschlagsrechnung: find P2-F1, Art "Stunden ohne Regiebericht", "Beleg fehlt", 595,00 € (hours only, no material named), linked to the open task.
3. 01.10.2026: the Bauleitung writes Regiebericht 6 (work date 24.09.2026, material 186,20 € at Einstandspreis).
4. 02.10.2026: the Polier of Hornfeld Bau signs. The find becomes Art "Regie", "belegt", 809,13 €, for Abschlagsrechnung 3. The task is closed.

The first amount (5 h × 64,80 € + 5 h × 54,20 € = 595,00 €) is only in the "Verlauf"; the find today is 809,13 €.

### P3 Volksschule Ahornbrunn (Marktgemeinde Ahornbrunn, in Ausführung)

Awarded under the Bundesvergabegesetz; Bauvertrag of 09.04.2026, contract sum 538.600,00 €; Regiesätze 61,40 €/h Monteur, 51,20 €/h Helfer; Regiematerial at Einstandspreis plus 10 %. Regieberichte are signed by the örtliche Bauaufsicht of the Marktgemeinde. Abschlagsrechnung 1 of 30.06.2026 121.400,00 €, Abschlagsrechnung 2 of 30.09.2026 163.900,00 €. Belege: Aufmaßblatt 1 invoiced in Abschlagsrechnung 1, Aufmaßblatt 2 in Abschlagsrechnung 2, Aufmaßblatt 3 entered, but Abschlagsrechnung 2 invoiced 22.07.04A as complete at the quantity of the Leistungsverzeichnis (P3-F2); Regieberichte 1, 2 and 4 invoiced, 3 and 5 are finds, 6 after the last Abschlagsrechnung.

| # | Art | Content | Calculation | Amount | Belegstand |
|---|---|---|---|---|---|
| P3-F1 | "Regie" | Regiebericht 3 of 22.07.2026, Trinkwasser im Altbau während der Ferien abgesperrt, Provisorium für den Hort, signed, in no Abschlagsrechnung | 10 h × 61,40 € = 614,00 € + 10 h × 51,20 € = 512,00 € + material 164,80 € + 10 % (16,48 €) = 181,28 € | 1.307,28 € | belegt |
| P3-F2 | "Mehrmenge" | 22.07.04A Fußbodenheizung Noppensystemplatte inkl. Heizrohr: Leistungsverzeichnis 420 m², measured 468 m² (Aufmaßblatt 3 of 04.09.2026), invoiced 420 m² | 48 m² × 38,60 € | 1.852,80 € | belegt |
| P3-F3 | "Regie" | Regiebericht 5 of 09.09.2026, Trinkwasserleitungen im Altbau nach Hygienebefund gespült, **not signed** | 4 h × 61,40 € | 245,60 € | Beleg fehlt |

Total P3: "zusätzlich verrechenbar" 1.307,28 + 1.852,80 = **3.160,08 €**; "in Klärung" **245,60 €**. P3-F2 changes the quantity by +11,4 %, no note.

### Counter-checks (must find nothing)

- P2: Aufmaßblatt 6 of 12.10.2026 (after the last Abschlagsrechnung) in no Abschlagsrechnung; Regiebericht 7, work date 08.10.2026, signed, not invoiced (after the last Abschlagsrechnung; its document date is not what counts, as Regiebericht 6 shows the other way round); Regieberichte 1 to 3 and 5 invoiced.
- P3: Regiebericht 6, work date 07.10.2026, signed, not invoiced; Aufmaßblatt 2 invoiced in Abschlagsrechnung 2.
- P4 and P5: no Abgleich (closed).

### Company figures ("Start" and "Berichte")

| Figure | Amount | Finds | Rule |
|---|---|---|---|
| "Zusätzlich verrechenbar" | **22.632,96 €** | 10 | P1 14.620,15 + P2 4.852,73 + P3 3.160,08 |
| "In Klärung" | **8.319,19 €** | 4 | P1 8.073,59 + P3 245,60 |
| of which "Beleg fehlt" | 1.365,59 € | 3 | F6, F7, P3-F3 |
| of which "Nachtrag nicht gelegt" | 6.953,60 € | 1 | F8 |
| "Davon mit Kürzungsrisiko" under "zusätzlich verrechenbar" | 6.843,00 € | 2 | G1, G2 (P1 only; P2 and P3 have no Vorprüfung) |
| "Nur außerhalb ERP" of "zusätzlich verrechenbar" (only in "Berichte") | 15.507,36 € | 7 of 10 | P1 12.587,35 + P2 1.612,73 (P2-F1, P2-F2) + P3 1.307,28 (P3-F1) |
| "Nur außerhalb ERP" of "in Klärung" (only in "Berichte") | 8.319,19 € | 4 of 4 | all of them |

"Start" shows "zusätzlich verrechenbar" as the main figure with "davon mit Kürzungsrisiko" below it and "in Klärung" next to it, never added. "Nur außerhalb ERP" is 68,5 % of "zusätzlich verrechenbar" and 100,0 % of "in Klärung". **Synthetic, no evidence for any hypothesis.**

Check: 14.620,15 + 4.852,73 + 3.160,08 = 22.632,96; 8.073,59 + 245,60 = 8.319,19; 1.119,99 + 245,60 = 1.365,59; 12.587,35 + 1.612,73 + 1.307,28 = 15.507,36.

## Auftraggeber history (company level)

From the closed projects, the Korrekturblätter and the payments. Facts only, no assessment of the Auftraggeber. Separated into **cuts** (the Auftraggeber strikes positions) and **deductions without contract item** (the Auftraggeber deducts a rate the Vertrag does not name).

**Fixed list of reasons** (key in the code, same wording in Vorprüfung, Rechnungsabschluss and history): "Aufmaß nicht gegengezeichnet" · "Stunden weichen ab" · "Rechenfehler" · "Außerhalb des Leistungsverzeichnisses, kein Nachtrag gefunden" · "Regie nicht unterschrieben" · "Menge ohne Aufmaß-Nachweis" · "Abzug ohne Vertragspunkt".

**Cuts:**

| Auftraggeber | Project | Invoice | Position | Reason | Amount |
|---|---|---|---|---|---|
| Hornfeld Bau | P4 Wohnhof Erlenhain | Schlussrechnung 20.11.2025 | 22.04.10A Plattenheizkörper Typ 22 VK, 500/800, 12 Stk × 214,60 € on Aufmaßblatt 9 | "Aufmaß nicht gegengezeichnet" | 2.575,20 € |
| Hornfeld Bau | P4 Wohnhof Erlenhain | Schlussrechnung 20.11.2025 | 24.05.03A, line printed 18.646,40 € instead of 96 × 193,40 € = 18.566,40 € | "Rechenfehler" | 80,00 € |
| Hornfeld Bau | P1 Wohnpark Mooshaim | Abschlagsrechnung 3 of 30.09.2026 | Z-01 Kernbohrungen DN 100 | "Außerhalb des Leistungsverzeichnisses, kein Nachtrag gefunden" | 1.776,00 € |
| Pfeilberg Bau | P5 Pflegeheim Eibenau | Schlussrechnung 30.06.2025 | Regiebericht 9 of 12.05.2025, Leitungen wegen Fremdgewerk umgelegt, 3. OG: 14 h × 63,60 € = 890,40 € + 10 h × 53,40 € = 534,00 € + material 152,00 € + 15 % (22,80 €) = 174,80 € | "Regie nicht unterschrieben" | 1.599,20 € |
| Pfeilberg Bau | P5 Pflegeheim Eibenau | Schlussrechnung 30.06.2025 | 26.02.03A Wickelfalzrohr DN 125 inkl. Formteile, invoiced 450 m, measured 400 m: 50 m × 32,80 € | "Menge ohne Aufmaß-Nachweis" | 1.640,00 € |

**Deductions without contract item:**

| Auftraggeber | Project | Invoice | Deduction | Amount |
|---|---|---|---|---|
| Hornfeld Bau | P4 Wohnhof Erlenhain | Schlussrechnung 20.11.2025 | Bauschadensumlage 0,5 % on 661.110,48 € | 3.305,55 € |
| Hornfeld Bau | P1 Wohnpark Mooshaim | payments on Abschlagsrechnung 1 to 3 | Bauschadensumlage 0,5 %: 816,74 + 1.342,97 + 1.163,15 € | 3.322,86 € |

**Per Auftraggeber:**

| Auftraggeber | Projects (closed) | Cuts | Deductions without contract item | Nachträge accepted | Days until final payment |
|---|---|---|---|---|---|
| Hornfeld Bau | 3 (1) | 4.431,20 € in 3 rows, 2 projects | 6.628,41 € in 2 projects | 2 of 3, 8.820,00 € of 10.680,00 € (82,6 %) | 90 (P4: submitted 20.11.2025, paid 18.02.2026) |
| Pfeilberg Bau | 1 (1) | 3.239,20 € in 2 rows, 1 project | – | 2 of 2, 14.100,00 € | 74 (P5: submitted 30.06.2025, paid 12.09.2025) |
| Marktgemeinde Ahornbrunn | 1 (0) | – | – | – | – |

Nachträge: P4 N1 additional Heizkreisverteiler 6.480,00 € (accepted), N2 Grundleitung umgelegt 2.340,00 € (accepted), N3 Winterbaumaßnahmen 1.860,00 € (rejected); P5 N1 Zusatzkühlung Serverraum 9.840,00 €, N2 Pflegebad-Ausstattung 4.260,00 € (both accepted).

Check: 2.575,20 + 80,00 + 1.776,00 = 4.431,20; 3.305,55 + 3.322,86 = 6.628,41; 6.480,00 + 2.340,00 = 8.820,00 of 10.680,00; 1.599,20 + 1.640,00 = 3.239,20; 9.840,00 + 4.260,00 = 14.100,00.

### Inputs for the closed projects

Calculation rule as for the payments in P1: (Schlussrechnung − cuts) − Nachlass, the other rates on the amount after Nachlass, then the Haftrücklass, then the payments already made.

| | P4 Wohnhof Erlenhain (Hornfeld Bau) | P5 Pflegeheim Eibenau (Pfeilberg Bau) |
|---|---|---|
| Bauvertrag | 23.09.2024, 668.400,00 € | 14.05.2024, 921.500,00 € |
| Rates of the Vertrag | Nachlass 3 % (5.1), Baustrom und Bauwasser 0,6 % (4.6), Haftrücklass 3 % (9.2); **no** Bauschadensumlage | Nachlass 2 % (5.1), Haftrücklass 3 % (9.2); nothing else |
| Regiesätze | 62,40 / 52,10 €/h | 63,60 / 53,40 €/h, Regiematerial plus 15 % |
| Schlussrechnung | 20.11.2025, 684.212,40 € | 30.06.2025, 948.360,00 € |
| Cuts | 2.655,20 € | 3.239,20 € |
| After cuts | 681.557,20 € | 945.120,80 € |
| Nachlass | 20.446,72 € | 18.902,42 € |
| After Nachlass | 661.110,48 € | 926.218,38 € |
| Baustrom und Bauwasser | 3.966,66 € | – |
| Bauschadensumlage ("Abzug ohne Vertragspunkt") | 3.305,55 € | – |
| Haftrücklass 3 % | 19.615,15 € | 27.786,55 € |
| Remaining | 634.223,12 € | 898.431,83 € |
| Paid on Abschlagsrechnungen (Annahme, no details) | 548.000,00 € | 842.000,00 € |
| Final payment | 18.02.2026, 86.223,12 € (90 days) | 12.09.2025, 56.431,83 € (74 days) |

Check P4: 684.212,40 − 2.655,20 = 681.557,20; × 3 % = 20.446,72; 681.557,20 − 20.446,72 = 661.110,48; × 0,6 % = 3.966,66; × 0,5 % = 3.305,55; 661.110,48 − 3.966,66 − 3.305,55 = 653.838,27; × 3 % = 19.615,15; 653.838,27 − 19.615,15 = 634.223,12; − 548.000,00 = 86.223,12. Check P5: 948.360,00 − 3.239,20 = 945.120,80; × 2 % = 18.902,42; 945.120,80 − 18.902,42 = 926.218,38; × 3 % = 27.786,55; 926.218,38 − 27.786,55 = 898.431,83; − 842.000,00 = 56.431,83.

### Bridge to the demo

In P1 the Vorprüfung shows G1 "Aufmaß nicht gegengezeichnet" (6.648,60 €), and the Rechnungsabschluss shows the Bauschadensumlage as "Abzug ohne Vertragspunkt" (3.719,63 €). Hornfeld Bau already did both in P4. Matched by the key of the reason, not by the text. Note in the app, neutral: "Gleicher Grund bei diesem Auftraggeber schon im Wohnhof Erlenhain."

## Website

The website keeps its own example (Wien 21, electrical, 5.546 €, by Maxi D.): decided by Maxi S. on 23.10.2026 after a side by side comparison. The website is consistent in itself (hero cards, timeline and Ebene 2 table tell one story) and easier to read for a lay audience; the app's demo data do not need to match it. Two word proposals for Maxi D., his decision: "Erbracht" instead of "Gebaut" (customer test 1), and one money word for the same amount in the Ebene 2 table and the result card ("zusätzlich verrechenbar"; the table says "Offen verrechenbar").

## WhatsApp scene (mock, demo script 0:20)

Acted, no real number, no real agent. Based on W4. The chat visibly shows the date 08.09.2026, so that chat, timeline and demo date match.

Spoken sentence in the script: "Heizkörper in Top 9 versetzt, weil der Polier es wollte. Zwanzig Sekunden auf der Baustelle, und die Stunden gehen nicht verloren."

1. Monteur, Trupp 1, sends a photo (radiator in the new place) and a voice message (transcript as W4).
2. Agent: "Danke. So habe ich es verstanden: Wohnpark Mooshaim, Top 9. Heizkörper im Wohnzimmer versetzt. Zwei Mann, je vier Stunden. Angeordnet vom Polier von Hornfeld Bau. Regiebericht: keiner. Stimmt das?" Buttons "Ja", "Ändern".
3. Tap on "Ja". Agent: "Gespeichert."
4. The Zeitstrahl shows "08.09.2026, 14:30 · WhatsApp-Meldung · Heizkörper Top 9 versetzt" with photo and transcript; "In Klärung" shows F7 (476,00 €) with the task "Regiebericht schreiben und vom Polier unterschreiben lassen".

The agent names no amount and does not say whether something is billable; the amount comes from `kern/`.

## Questions for the insider

1. F7 (hours only from a WhatsApp-Meldung): Regiesatz (476,00 €) or a floor from the Mittellohnkosten (366,40 €)?
2. Moving a radiator, two men for four hours with draining and refilling: realistic?
3. Is "der Polier von Hornfeld hat es angeschafft" enough to have a Regiebericht signed afterwards, and does a Polier have the authority to instruct?
4. Ongoing projects: is "work date before the last Abschlagsrechnung" the right boundary for "forgotten"?
5. Einheitspreise and accessories: are Thermostatkopf, Anschlussarmatur and Anbindeleitung their own positions in a typical Leistungsverzeichnis, and are 286,40 € for a Typ 22 600/1000 with 1,10 h labour realistic?
6. Untergrenze with Mittellohnkosten 45,80 €/h and material at Einstandspreis: is that how a business prepares the final meeting, and is the K3 split (45,80 € / 58,60 €) realistic?
7. F8: is a notified change priced on the Preisbasis of the Vertrag (Mittellohnpreis, material surcharge of the own calculation)?
8. Does the Nachlass of the Vertrag also apply to Regie?
9. Is a one-sided Aufmaß (Aufmaßblatt 12, not countersigned) "belegt" with Kürzungsrisiko, or "Beleg fehlt"?
10. Festpreise for an eight-month HKLS lot with a Generalunternehmer: usual? Regiematerial at Einstandspreis plus 15 %: usual?
11. Does a Generalunternehmer accept the Fotodokumentation Brandschutz as the basis of an Aufmaß (F5)?
12. The 20 % rule: is "Hornfeld Bau kann hier einen neuen Einheitspreis prüfen." right for F4?

## Changes compared to v2

- New names: Kronfeld Haustechnik, Hornfeld Bau, Pfeilberg Bau, Marktgemeinde Ahornbrunn; projects by building type and a fictitious place, no district numbers. "(fiktiv)" is gone from the names; the marker "Beispieldaten" carries it.
- 5 projects instead of 8 (P1, two ongoing, two closed). Main project Wohnpark Mooshaim instead of Wien 21: contract sum 746.820,00 € instead of 1.240.000,00 €, 8 finds and 1 Rechtsfrage instead of 14 finds and 1 note, 3 Vorprüfung positions instead of 4.
- "Zusätzlich verrechenbar" 14.620,15 € (1,96 %) instead of 27.410,00 € (2,2 %). The Preisumrechnung (v2: 7.248,00 €) is gone: P1 has Festpreise, because the customer test called a forgotten Preisumrechnung implausible. "Pauschale laut Vertrag" (v2: V1) is gone to stay at 8 finds.
- Realistic amounts: radiators with Thermostatkopf, Anschlussarmatur and Anbindeleitung; Regiesätze checked against the official rates 2026; moving a radiator two men for four hours instead of six; Regiematerial at Einstandspreis plus the surcharge of the Vertrag.
- New figures: "davon mit Kürzungsrisiko" (E13), "Restforderung laut Vertrag" (E14). Untergrenze with the Mittellohnkosten; Spielraum 1.969,94 € instead of 333,00 €. The Nachtrag (F8) is priced on the Preisbasis of the Vertrag instead of as a lower bound.
- P1 has one event of each kind the website timeline shows; the website keeps its own example (decided 23.10.2026). P2 shows the "Lauf je Abschlagsrechnung": a WhatsApp-Meldung becomes a signed Regiebericht eight days after the message, two days after Abschlagsrechnung 2.
- The rule for ongoing projects uses the work date, not the document date.
- "Nur außerhalb ERP" is reported per money word, never on the sum of "zusätzlich verrechenbar" and "in Klärung".
- Every amount recomputed by `docs/demo_faelle_check.mjs`, which also audits this file and the amounts in `SPEZIFIKATION.md`, and checks that every date is a working day.
- Independent check on 23.10.2026: 182 of 182 calculations confirmed; 28 notes on consistency, dates, plausibility and wording, each re-measured and worked in (among them: Lindbrunn renamed, four dates on a weekend or holiday moved, the cause of F2 and F6 made realistic, G2 no longer hands out the Stundenzettel, "nur außerhalb ERP" split by money word).
