# Demo dataset: built-in cases (solution list v2)

As of: 22.10.2026, **v2** following Dossier v3 (company with 8 projects, WhatsApp messages (WhatsApp-Meldungen), GC history; changes below under "Changes compared to v1"). v1 came from the reviewer round (findings 1–40, "Changes compared to v0"). **Everything is synthetic and fictitious.** This list is the target for the generator: the calculation core must find exactly these cases, with exactly these amounts and without false alarms. All figures have been recalculated to the cent by script. Not yet reviewed professionally by someone from construction: assumptions are marked with **(Annahme)** (assumption).

**Demo reference date (Demo-Stichtag):** Thursday, 22.10.2026. The demo always calculates with this "today" so that traffic light and status stay the same.

## Company

- **Haustechnik Beispiel GmbH (fiktiv)**, HVAC and plumbing (HKLS), based in Vienna. 8 projects in the twin, contract sums totalling 6.560.000,00 €.
- Clients (all fictitious): **Hochbau Beispiel GmbH** (general contractor (GU), 4 projects), **Generalbau Beispiel AG** (GU, 2 projects), **Gemeinde Beispielstadt** (public client (öffentlicher AG), 1 project), **Wohnbau Beispiel GmbH** (property developer (Bauträger), 1 project).
- Employees appear only as a role (e.g. "Monteur, Trupp 2" (fitter, crew 2)), never by name.
- Assumption for the demo: bill of quantities (LV), measurements (Aufmaß), interim invoices (Abschlagsrechnungen) and contracts are in the company's ERP; daywork reports (Regieberichte) on paper (scan), mails in the mailbox, WhatsApp messages (WhatsApp-Meldungen) via WhatsApp. Needed for the column "Belegquelle" (evidence source).

## Project W21 (fully worked out)

- **Wohnhausanlage Wien 21, Bauplatz B, HKLS-Los** (residential complex Vienna 21, building plot B, HVAC and plumbing lot: heating, air conditioning, ventilation, sanitary)
- Contractor: **Haustechnik Beispiel GmbH (fiktiv)**; GU: **Hochbau Beispiel GmbH (fiktiv)**. Names deliberately chosen without resemblance to real companies.
- Construction contract (Bauvertrag) dated 14.11.2025; contract sum 1.240.000,00 € net; ÖNORM B 2110; unit price contract (Einheitspreisvertrag); variable prices (price adjustment of labour (Preisumrechnung Lohn) according to ÖNORM B 2111, contract item 7.2)
- **Submit final invoice (Schlussrechnung) by 31.10.2026** (plain date, no assessment of deadlines)
- Daywork rates (Regiesätze) per contract: fitter (Monteur) 62,50 €/h, helper (Helfer) 52,00 €/h
- Average wage price (Mittellohnpreis) according to own calculation (K3): 56,80 €/h (Annahme)
- Contract: discount (Nachlass) 3 % (item 5.1); site power and site water (Baustrom und Bauwasser) 0,8 % (item 4.6); performance retention (Deckungsrücklass) 5 % on interim invoices, released with the final invoice (item 9.1); warranty retention (Haftrücklass) 3 % on the final invoice, replaceable by bank guarantee (item 9.2); site setup (Baustelleneinrichtung) as a lump sum (item 4.3). **No** construction damage levy (Bauschadensumlage) in the contract.
- Interim invoices (AR): AR1 31.03.2026 312.400,00 €; AR2 30.06.2026 418.900,00 €; AR3 30.09.2026 356.200,00 €; cumulative 1.087.500,00 €
- Folder: 81 documents, of which 4 duplicates: 1 contract, 1 LV, 1 K7, 14 measurement sheets (Aufmaßblätter), 16 daywork reports, 1 timesheet for calendar week (KW) 23 (for G2), 3 AR, 3 payment advices (Zahlungsavisos), 1 index sheet (Indexblatt, for J8), 1 final invoice draft (1.218.640,00 €), 1 GU deduction letter (GU-Abzugsschreiben), 1 GU correction sheet AR3 (GU-Korrekturblatt), 18 mails (16 originals, 2 duplicates), 10 photos (8 originals, 2 duplicates), 9 plans (H-101, H-201, L-310, each index C/D/E). During import, 25 fields corrected by hand (12 measured quantities, 10 daywork hours, 2 mail dates, 1 photo date).
- LV: 380 positions (LG 22 heating 124, LG 24 sanitary 138, LG 26 ventilation 82, LG 28 MSR (measurement, control and regulation) 36).
- Daywork reports: 16, of which 11 invoiced, 3 signed and not invoiced (J2–J4), 2 not signed (O1, O2).
- Plan H-201: index C 1 radiator per unit (Top) 7–13 (7 pcs), index D 3 per unit (21 pcs, +14).
- **WhatsApp messages (WhatsApp-Meldungen): 6** via WhatsApp (channel WhatsApp, not in the folder; the 81 documents remain). Per field report: voice message with transcript, a photo in 5 cases, time taken from the message timestamp (Annahme: WhatsApp removes EXIF, unverified according to the dossier, to be tested), sender as a role, confirmed by the sender. 4 support existing items, 2 have no daywork report (O4, O5).

| # | Time | Sender | Content (transcript, shortened) | Photo | Reference |
|---|---|---|---|---|---|
| Z1 | 12.05.2026, 15:20 | Monteur, Trupp 1 (fitter, crew 1) | "Staircase 2, units 7 to 13: the additional radiators according to plan D are installed." | yes | Evidence for J1 |
| Z2 | 03.06.2026, 09:05 | Monteur, Trupp 2 (fitter, crew 2) | "Riser in staircase 2 collides with the ventilation, we are rerouting, the GU site management knows." | yes | Evidence for J3 (RB-11) |
| Z3 | 24.06.2026, 13:40 | Monteur, Trupp 2 (fitter, crew 2) | "Drained the heating in staircase 1 again, the GU's foreman (Polier) ordered it." | no | Evidence for O1 (RB-12) |
| Z4 | 21.07.2026, 07:55 | Monteur, Trupp 1 (fitter, crew 1) | "Water damage in the basement caused by another trade, we did an emergency shut-off." | yes | Evidence for J4 (RB-14) |
| Z5 | 19.08.2026, 16:10 | Monteur, Trupp 3 (fitter, crew 3) | "Units 4 and 5: washbasin connections set higher, the GU site management wanted that. One man, eight hours." | yes | **new item O5** |
| Z6 | 08.09.2026, 14:30 | Monteur, Trupp 1 (fitter, crew 1) | "Staircase 2, unit 9: radiator in the living room relocated, the kitchen was planned differently, the GU's foreman ordered it. Two men, six hours." | yes | **new item O4**, demo scene |

Rules: "Two men" = 1 fitter + 1 helper (Annahme). Field reports Z1 to Z4 deliberately name no hours, so that G2 (timesheet against daywork report) stays unchanged; Z5 (KW 34) and Z6 (KW 37) fall in weeks without a timesheet. The agent assesses nothing; whether a field report is billable is decided by the human. Who gave the instruction according to the field report is only recorded, not assessed.

**For the build (data model and tests):** Field reports are separate objects in the project twin (channel WhatsApp) with their own identifier, not part of the 81 folder documents. The rule "every piece of evidence points to an existing document" applies to folder documents **or** field reports. Field report evidence attaches to findings J1, J3, J4 and O1 (J1 then has 7 instead of 6 pieces of evidence). O4 and O5 are not daywork reports and do not count in the daywork statistics (stays 16 / 11 / 3 / 2).

## List 1: billable now, 8 items, 27.410,00 €

| # | Type | Position | Calculation | Amount | Evidence |
|---|---|---|---|---|---|
| J1 | Additional quantity from plan change | 22.04.12B Panel radiator type 22, 600/1000, incl. valve bottom section | LV 86 pcs, measurement 100, invoiced 86 → (100 − 86) × 456,00 € (unit price (EP) per LV) | 6.384,00 € | LV pos. 22.04.12B (quantity and EP); plan H-201 index C (12.02.: 1 radiator per unit 7–13) → index D (03.04.: rooms divided, +2 radiators per unit, 7 units = 14 pcs); mail from GU site management 07.04. "bitte gleich mitmachen" (please do it right away); photo IMG_2291 (14.05.); measurement sheet AB-12 (18.09., 100 pcs). Plausibility check K7: 1,30 h × 56,80 € = 73,84 € labour + 382,16 € other = 456,00 € |
| J2 | Daywork (Regie) | RB-07 Relocate temporary site water supply | 18 h fitter × 62,50 € = 1.125,00 € + material 186,40 € | 1.311,40 € | RB-07 signed, in no AR |
| J3 | Daywork | RB-11 Reroute riser (collision with ventilation) | 24 h fitter × 62,50 € = 1.500,00 € + 16 h helper × 52,00 € = 832,00 € + material 642,80 € | 2.974,80 € | RB-11 signed, in no AR |
| J4 | Daywork | RB-14 Emergency shut-off after water damage by another trade | 8 h fitter × 62,50 € = 500,00 € + material 96,20 € | 596,20 € | RB-14 signed, in no AR |
| J5 | Additional quantity (Mehrmenge) | 24.02.05A Multilayer composite pipe 20 × 2,0 incl. fittings | LV 640 m, measurement 812, invoiced 640 → 172 m × 18,40 € | 3.164,80 € | Measurement sheets AB-04, AB-09 |
| J6 | Additional quantity | 22.06.03C Pipe insulation 13 mm for 15 mm pipe | LV 900 m, measurement 1.140, invoiced 900 → 240 m × 9,85 € | 2.364,00 € | Measurement sheet AB-10 |
| J7 | Additional quantity | 26.03.04A Spiral seam duct DN 200 incl. fittings | LV 210 m, measurement 286, invoiced 210 → 76 m × 44,30 € | 3.366,80 € | Measurement sheet AB-13; plan L-310 index E |
| J8 | Price adjustment (Preisumrechnung) | Labour share of work from 01.05.2026 (ÖNORM B 2111) | 190.736,84 € × 3,8 % (labour index per contract item 7.2) | 7.248,00 € | Contract item 7.2; index sheet |

Composition: 4 additional quantities (J1, J5, J6, J7), 3 daywork (J2–J4), 1 price adjustment (J8).
Total: 6.384,00 + 1.311,40 + 2.974,80 + 596,20 + 3.164,80 + 2.364,00 + 3.366,80 + 7.248,00 = **27.410,00 €**

## List 2: notified and open, 5 items, 11.282,30 €

| # | Type | Content | Calculation | Amount |
|---|---|---|---|---|
| O1 | Daywork | RB-12 additional draining of heating in staircase 1, **not signed** (plus field report Z3) | 10 h × 62,50 € + 6 h × 52,00 € + material 84,50 € | 1.021,50 € |
| O2 | Daywork | RB-15 retrofitting of balancing valves (Strangregulierventile), **not signed** | 8 h × 62,50 € + material 221,00 € | 721,00 € |
| O3 | Change | Redesign of basement plant room, notified by mail 14.03., never priced | Lower bound from own calculation: 96 h × 56,80 € (average wage price) + material 2.900,00 € | 8.352,80 € |
| O4 | Daywork from field report | Z6: radiator in staircase 2, unit 9 relocated, instructed by the GU foreman; **no daywork report, no signature** | 6 h fitter × 62,50 € + 6 h helper × 52,00 € | 687,00 € |
| O5 | Daywork from field report | Z5: washbasin connections in units 4 and 5 set higher, instructed by the GU site management; **no daywork report, no signature** | 8 h fitter × 62,50 € | 500,00 € |

Total: 1.021,50 + 721,00 + 8.352,80 + 687,00 + 500,00 = **11.282,30 €**

O4 and O5 without material: the field report names none, and the tool does not invent prices. Priced with the contract's daywork rates like O1 and O2 (Annahme). The alternative would be a lower bound from the average wage price as for O3: O4 12 h × 56,80 € = 681,60 €, O5 8 h × 56,80 € = 454,40 €. Question for the insider (see below). Remedy in the tool: "Regiebericht nachträglich ausstellen und vom GU unterschreiben lassen." (Issue the daywork report retroactively and have the GU sign it.)

Plus a **note without amount**: A1 "Terminänderung (Mail GU 02.07.: Fertigstellung Stiege 2 drei Wochen vorziehen)" (schedule change (GU mail 02.07.: bring forward completion of staircase 2 by three weeks)) → **"Braucht Anwalt"** (needs a lawyer). No legal classification of our own (no word "Forcierung" (acceleration) in the product).

## List 3: lost, 1 item, 1.180,00 €

| # | Content | Reason | Calculation | Amount |
|---|---|---|---|---|
| V1 | Site setup container relocated twice | included in the lump sum per contract item 4.3 | 16 h × 56,80 € (average wage price) + crane 271,20 € = 1.180,00 € | 1.180,00 € |

## Pre-check from the GU perspective (Vorprüfung aus GU-Sicht): 4 positions at risk of deduction, 8.767,50 €

| # | Position | What the GU would cut | Reason (fixed list) | Remedy | Amount |
|---|---|---|---|---|---|
| G1 | 22.04.12B (J1) | Additional quantity 14 pcs | Measurement not countersigned | Attach plan D and mail 07.04., arrange a joint measurement | 6.384,00 € |
| G2 | RB-11 (J3) | 3 h fitter | Hours differ (report 24 h, timesheet KW 23: 21 h) | Correct the hours or submit the timesheet | 187,50 € |
| G3 | 24.05.02A | Calculation error from AR3 (48 pcs × 112,60 € = 5.404,80 €, invoiced 5.440,80 €) | Calculation error | Correct the error, otherwise it will be carried over into the final invoice | 36,00 € |
| G4 | Z-01 Core drilling DN 100, 12 pcs | entire position | outside the LV, no change order found | Look for the instruction or remove it | 2.160,00 € |

Total: **8.767,50 €**. Of which **already cut in AR3**: G3 and G4, together **2.196,00 €** (fictitious GU correction sheet AR3). The pre-check detects both (2 of 2) and finds 2 more (G1, G2). The pre-check **overlaps** with list 1 (G1 = J1, G2 ⊂ J3); never add them up.

**Notes without amount** (neutral, no legal assessment): quantity change over 20 % for J5 (+26,9 %), J6 (+26,7 %), J7 (+36,2 %): "Der GU kann hier einen neuen Einheitspreis prüfen." (The GU may examine a new unit price here.) (Annahme regarding the ÖNORM B 2110 rule, to be confirmed with the insider.)

## Final invoice (draft) with review cascade (pattern reebuild R-A)

| Line | Rate | Source | Check | Amount |
|---|---|---|---|---|
| Total work value per draft, **incl. list 1 (27.410,00 €)** | | own draft | | 1.246.050,00 € |
| Discount (Nachlass) | 3,00 % | Contract item 5.1 | per contract | −37.381,50 € |
| Total after discount | | | | 1.208.668,50 € |
| Site power and site water | 0,80 % | GU deduction letter | per contract item 4.6 | −9.669,35 € |
| Construction damage levy (Bauschadensumlage) | 0,50 % | GU deduction letter | **deduction without contract item** | −6.043,34 € |
| Amount before retentions | | | | 1.192.955,81 € |
| Warranty retention (Haftrücklass, replaceable by bank guarantee) | 3,00 % | Contract item 9.2 | per contract | −35.788,67 € |
| Final invoice amount before deduction of payments | | | | 1.157.167,14 € |
| Payments on AR1–AR3 | | Payment advices | | −987.106,25 € |
| **Remaining balance (Restforderung)** | | | | **170.060,89 €** |

Payments (calculation rule per AR, percentages each applied to the subtotal, commercially rounded to the cent): (AR − cut per correction sheet) − 3 % discount − 0,8 % site power − 0,5 % construction damage − 5 % performance retention.

| AR | Amount | Cut | Discount | Site power | Construction damage | Performance retention | Payment |
|---|---|---|---|---|---|---|---|
| AR1 | 312.400,00 | 0,00 | 9.372,00 | 2.424,22 | 1.515,14 | 14.954,43 | 284.134,21 |
| AR2 | 418.900,00 | 0,00 | 12.567,00 | 3.250,66 | 2.031,67 | 20.052,53 | 380.998,14 |
| AR3 | 356.200,00 | 2.196,00 | 10.620,12 | 2.747,07 | 1.716,92 | 16.945,99 | 321.973,90 |
| Total | | | | | | | **987.106,25** |

## Final meeting sheet (Schlussbesprechungs-Blatt), W21: claim and floor per item

Approved by Maxi S. 23.10.2026 (synthetic). The floor (Untergrenze) is the lowest amount per item below which the company gives up its own costs. **Rule:** daywork and daywork from a WhatsApp message = hours × average wage price 56,80 € (K3) + material, as for O3 (fitter and helper hours alike); additional quantities and the price adjustment = contract price (unit price per LV, contract item 7.2), no floor below it; O3 is already a lower bound from the own calculation. Grouped like the dashboard: belegt (list 1), Beleg fehlt (list 2, daywork not signed or only from a WhatsApp message), angemeldet (list 2, notified, never priced). Not on the sheet: A1 (needs a lawyer) and V1 (lost, contract item 4.3).

| Group | Item | Claim | Floor calculation | Floor |
|---|---|---|---|---|
| belegt | J1 | 6.384,00 € | contract price | 6.384,00 € |
| belegt | J2 | 1.311,40 € | 18 h × 56,80 € + material 186,40 € | 1.208,80 € |
| belegt | J3 | 2.974,80 € | 40 h × 56,80 € + material 642,80 € | 2.914,80 € |
| belegt | J4 | 596,20 € | 8 h × 56,80 € + material 96,20 € | 550,60 € |
| belegt | J5 | 3.164,80 € | contract price | 3.164,80 € |
| belegt | J6 | 2.364,00 € | contract price | 2.364,00 € |
| belegt | J7 | 3.366,80 € | contract price | 3.366,80 € |
| belegt | J8 | 7.248,00 € | contract price | 7.248,00 € |
| Beleg fehlt | O1 | 1.021,50 € | 16 h × 56,80 € + material 84,50 € | 993,30 € |
| Beleg fehlt | O2 | 721,00 € | 8 h × 56,80 € + material 221,00 € | 675,40 € |
| Beleg fehlt | O4 | 687,00 € | 12 h × 56,80 € | 681,60 € |
| Beleg fehlt | O5 | 500,00 € | 8 h × 56,80 € | 454,40 € |
| angemeldet | O3 | 8.352,80 € | lower bound from own calculation | 8.352,80 € |

| Group | Items | Claim | Floor |
|---|---|---|---|
| belegt | 8 | 27.410,00 € | **27.201,80 €** |
| Beleg fehlt | 4 | 2.929,50 € | **2.804,70 €** |
| angemeldet | 1 | 8.352,80 € | 8.352,80 € |
| **Total** | 13 | **38.692,30 €** | **38.359,30 €** |

Room between claim and floor: **333,00 €**. Check: 6.384,00 + 1.208,80 + 2.914,80 + 550,60 + 3.164,80 + 2.364,00 + 3.366,80 + 7.248,00 = 27.201,80; 993,30 + 675,40 + 681,60 + 454,40 = 2.804,70; 27.201,80 + 2.804,70 + 8.352,80 = 38.359,30; 38.692,30 − 38.359,30 = 333,00 €. O4 and O5 floors equal the alternative named in list 2 (681,60 / 454,40 €). (Annahme: own cost without overhead and profit as the floor; question for the insider.)

## Evidence source per item (W21, for coding sheet and lead hypothesis)

Source of the evidence according to Dossier v3, 15.5. "Evidence" here means proof of the **work performed**, not of the price (daywork rates and unit prices always come from contract and LV). "Only outside ERP" means: no proof of work from LV, measurement, invoice or contract (assumption above under "Company").

| Item | Evidence sources | Only outside ERP |
|---|---|---|
| J1 | File (LV, plan C/D, measurement AB-12), mail, photo, WhatsApp (Z1) | no |
| J2 | Paper (RB-07) | yes |
| J3 | Paper (RB-11), WhatsApp (Z2) | yes |
| J4 | Paper (RB-14), WhatsApp (Z4) | yes |
| J5, J6 | File (measurement) | no |
| J7 | File (measurement, plan L-310 E) | no |
| J8 | File (contract, index sheet) | no |
| O1 | Paper (RB-12), WhatsApp (Z3) | yes |
| O2 | Paper (RB-15) | yes |
| O3 | Mail | yes |
| O4, O5 | WhatsApp only (Z6, Z5) | yes |

Only outside ERP: J2 + J3 + J4 + list 2 = 1.311,40 + 2.974,80 + 596,20 + 11.282,30 = **16.164,70 €**. By amount, that is 41,8 % of lists 1 and 2 (38.692,30 €), by count 8 of 13 items (61,5 %). **Synthetic, no evidence for the lead hypothesis.** The real figure is only measured with real companies.

## The 7 other projects

Small, but real datasets: the calculation core calculates their amounts as for W21. No sums set by hand.

**Rule for ongoing projects (without final invoice draft):** work performed against interim invoices. A finding arises only for work whose measurement sheet or daywork report is dated **before the date of the last interim invoice** and is in no AR. This applies to both lists. Newer work is normal and goes into the next AR, it is not a finding (Annahme, to be checked with the insider). Signed daywork → list 1, unsigned → list 2, as for W21. New finding type "performed, not invoiced" (erbracht, nicht verrechnet) for quantities that stay below the LV quantity.

**What the tool shows for P2 to P5:** overview, LV-Positionen and items (Posten). Pre-check and cascade only for W21 (Annahme for the demo). P2 to P8 have all measurement sheets countersigned and no correction sheets for open ARs.

| # | Project | Client | Contract sum | Status | Date | Billable now | Notified and open | Traffic light |
|---|---|---|---|---|---|---|---|---|
| W21 | Wohnhausanlage Wien 21, Bauplatz B, HKLS-Los | Hochbau Beispiel | 1.240.000,00 € | Preparing final invoice | submit by 31.10.2026 | 27.410,00 € | 11.282,30 € | red |
| P2 | Wohnhausanlage Wien 22, Bauteil 3, HKLS | Hochbau Beispiel | 860.000,00 € | in execution | last AR 30.09.2026 | 3.100,70 € | 250,00 € | yellow |
| P3 | Bürogebäude Wien 3, Umbau 4. bis 6. OG, HKLS | Generalbau Beispiel | 410.000,00 € | Preparing final invoice | submit by 04.12.2026 | 3.063,00 € | 0,00 € | yellow |
| P4 | Volksschule Beispielstadt, Zubau, HKLS | Gemeinde Beispielstadt | 690.000,00 € | in execution | last AR 30.09.2026 | 694,40 € | 0,00 € | yellow |
| P5 | Pflegewohnhaus Beispielstadt, Sanierung Trakt B | Wohnbau Beispiel | 520.000,00 € | in execution | last AR 30.09.2026 | 0,00 € | 0,00 € | green |
| P6 | Reihenhausanlage Wien 23, HKLS | Hochbau Beispiel | 340.000,00 € | Final invoice submitted | submitted 15.09.2026 | – | – | grey |
| P7 | Wohnhausanlage Wien 10, Bauplatz A, HKLS | Hochbau Beispiel | 1.020.000,00 € | completed | final payment 18.02.2026 | – | – | grey |
| P8 | Hotel Wien 2, Haustechnik Neubau | Generalbau Beispiel | 1.480.000,00 € | completed | final payment 12.09.2025 | – | – | grey |
| | **Total open projects** (W21 to P5, 5 projects) | | 3.720.000,00 € | | | **34.268,10 €** | **11.532,30 €** | |
| | **Total all projects** (8) | | 6.560.000,00 € | | | | | |

The company overview shows **"jetzt verrechenbar" (billable now, 34.268,10 €) as the main figure** and "angemeldet und offen" (notified and open, 11.532,30 €) separately next to it, never added together. The dossier calls this "offen verrechenbar" (open billable); in the tool, the two list terms from the project are kept so that company and project use the same words.

**Company figures for the dashboard (approved by Maxi S. 23.10.2026, synthetic):**

| Figure | Amount | Items | Rule |
|---|---|---|---|
| Only outside ERP | **20.975,90 €** | 13 of 20 | items of lists 1 and 2 in the open projects without proof of work from a file (assumption: file = ERP) |
| of which W21 | 16.164,70 € | 8 of 13 | unchanged, see "Evidence source per item" |
| Lists 1 and 2, open projects | 45.800,40 € | 20 | 34.268,10 + 11.532,30 |
| belegt (evidenced) | 34.268,10 € | 14 | list 1 |
| Beleg fehlt noch (evidence still missing) | **3.179,50 €** | 5 | list 2, daywork not signed or only from a WhatsApp message: O1, O2, O4, O5, P2-O1 |
| angemeldet (notified) | **8.352,80 €** | 1 | list 2, notified but never priced: O3 |

Only outside ERP by amount 45,8 %, by count 65,0 %. Check: 16.164,70 + 1.588,30 + 413,90 + 250,00 + 1.864,60 + 694,40 = 20.975,90 €; 1.021,50 + 721,00 + 687,00 + 500,00 + 250,00 = 3.179,50 €; 34.268,10 + 3.179,50 + 8.352,80 = 45.800,40 €. The three parts are shown side by side, never as one total. **Synthetic, no evidence for the lead hypothesis.**

**Traffic light (fixed rule, status only, never accent colour):** red = final invoice to be submitted no later than 21 days after the demo reference date **and** now + open > 0; yellow = now + open > 0; green = nothing open; grey = final invoice submitted or completed. The date is displayed, not a countdown.

**Cases per project:**

| Project | # | Type | Content | Calculation | Amount | List |
|---|---|---|---|---|---|---|
| P2 | P2-J1 | Daywork | RB-03 Temporary heating staircase A, 11.06.2026, signed, in no AR | 12 h × 62,50 € + 12 h × 52,00 € + material 214,30 € | 1.588,30 € | now |
| P2 | P2-J2 | Daywork | RB-05 Pipes rerouted because of another trade, 27.08.2026, signed, in no AR | 6 h × 62,50 € + material 38,90 € | 413,90 € | now |
| P2 | P2-J3 | performed, not invoiced | 24.02.04A Multilayer composite pipe 16 × 2,0: LV 600 m, measurement up to AB-04 (31.08.) 520 m, in AR1 to AR3 (31.03., 30.06., 30.09.) together 455 m | 65 m × 16,90 € | 1.098,50 € | now |
| P2 | P2-O1 | Daywork | RB-06 Flushing heating circuit staircase B, 10.09.2026, **not signed** | 4 h × 62,50 € | 250,00 € | open |
| P3 | P3-J1 | Additional quantity | 22.03.06A Copper pipe 22 × 1,0: LV 180 m, measurement 236 m, draft 180 m | 56 m × 21,40 € | 1.198,40 € | now |
| P3 | P3-J2 | Daywork | RB-02 Dismantling of old system 5th floor, 18.08.2026, signed, not in the draft | 16 h × 64,00 € + 8 h × 53,50 € + material 412,60 € | 1.864,60 € | now |
| P4 | P4-J1 | Daywork | RB-04 Temporary water supply for container, 15.07.2026, signed, in no AR | 10 h × 59,80 € + material 96,40 € | 694,40 € | now |

Daywork rates per contract: Hochbau Beispiel 62,50 / 52,00 €/h (as W21), Generalbau Beispiel 64,00 / 53,50 €/h, Gemeinde Beispielstadt 59,80 / 49,90 €/h, Wohnbau Beispiel 61,00 / 51,00 €/h (fitter / helper).

**Note without amount:** P3-J1 quantity change +31,1 % (56 of 180 m): "Der GU kann hier einen neuen Einheitspreis prüfen." (The GU may examine a new unit price here.) (same rule as J5 to J7).

**Counter-checks (must find nothing):** P2: measurement sheet AB-05 dated 15.10.2026 (after the last AR) not in an AR; RB-01, RB-02, RB-04 invoiced in an AR. P3: RB-01 in AR1. P4: RB-05 dated 08.10.2026, signed, after the last AR, not invoiced. P5: all work performed before 30.09. in AR1 to AR3. P6 to P8: no reconciliation (final invoice submitted or completed).

Check: P2 1.588,30 + 413,90 + 1.098,50 = 3.100,70 €; P3 1.198,40 + 1.864,60 = 3.063,00 €; company 27.410,00 + 3.100,70 + 3.063,00 + 694,40 = 34.268,10 €; open 11.282,30 + 250,00 = 11.532,30 €.

## GC history (GU-Historie, company level, from v1.0)

From the completed projects, the correction sheets and the payments. Facts only, no assessment of the client. Separated into **cuts** (Kürzungen: the GU strikes positions) and **deductions without contract item** (Abzüge ohne Vertragspunkt: the GU deducts a rate that the contract does not mention).

**Fixed list of reasons** (extended compared to v1; key in the code, same wording in pre-check, cascade and history): measurement not countersigned (Aufmaß nicht gegengezeichnet) · hours differ (Stunden weichen ab) · calculation error (Rechenfehler) · outside the LV, no change order found (außerhalb des LV, kein Nachtrag gefunden) · **new:** daywork not signed (Regie nicht unterschrieben) · quantity without measurement proof (Menge ohne Aufmaß-Nachweis) · deduction without contract item (Abzug ohne Vertragspunkt). For the construction damage levy, the cascade will in future also show "Abzug ohne Vertragspunkt" (deduction without contract item) instead of "kein Vertragspunkt gefunden" (no contract item found).

**Cuts:**

| Client | Project | Invoice | Position | Reason | Amount |
|---|---|---|---|---|---|
| Hochbau Beispiel | P7 | Final invoice 20.11.2025 | 22.04.10A Panel radiator type 11, 12 pcs × 351,00 € | Measurement not countersigned | 4.212,00 € |
| Hochbau Beispiel | P7 | Final invoice 20.11.2025 | 24.05.03A | Calculation error | 118,40 € |
| Hochbau Beispiel | W21 | AR3 30.09.2026 | 24.05.02A | Calculation error | 36,00 € |
| Hochbau Beispiel | W21 | AR3 30.09.2026 | Z-01 Core drilling | outside the LV, no change order found | 2.160,00 € |
| Generalbau Beispiel | P8 | Final invoice 30.06.2025 | RB-09 | Daywork not signed | 2.310,00 € |
| Generalbau Beispiel | P8 | Final invoice 30.06.2025 | 26.02.03A | Quantity without measurement proof | 1.640,50 € |

**Deductions without contract item:**

| Client | Project | Invoice | Deduction | Amount |
|---|---|---|---|---|
| Hochbau Beispiel | P7 | Final invoice 20.11.2025 | Construction damage levy 0,5 % on 1.046.300,00 € | 5.231,50 € |
| Hochbau Beispiel | W21 | Payments on AR1 to AR3 | Construction damage levy 0,5 %: 1.515,14 + 2.031,67 + 1.716,92 € | 5.263,73 € |

**Per client:**

| Client | Projects (completed) | Cuts | Deductions without contract item | Change orders accepted | Days until final payment |
|---|---|---|---|---|---|
| Hochbau Beispiel | 4 (1) | 6.526,40 € in 4 rows, 2 projects | 10.495,23 € in 2 projects | 2 of 3, 11.760,00 of 14.240,00 € (82,6 %) | 90 (P7: submitted 20.11.2025, paid 18.02.2026) |
| Generalbau Beispiel | 2 (1) | 3.950,50 € in 2 rows, 1 project | – | 2 of 2, 18.260,00 € | 74 (P8: submitted 30.06.2025, paid 12.09.2025) |
| Gemeinde Beispielstadt | 1 (0) | – | – | – | – |
| Wohnbau Beispiel | 1 (0) | – | – | – | – |

Change orders (Nachträge): Hochbau P7 N1 additional heating circuit manifolds 8.640,00 € (accepted), N2 rerouting of underground drainage pipe (Grundleitung) 3.120,00 € (accepted), N3 additional winter construction costs 2.480,00 € (rejected); Generalbau P8 N1 additional cooling for server room 12.400,00 €, N2 additional sanitary quantities for wellness area 5.860,00 € (both accepted).

**Inputs for P7 and P8 (approved by Maxi S. 23.10.2026, synthetic, for step 3c).** The amounts above stay unchanged; these are the documents the generator needs to produce them. Calculation rule as for W21: (final invoice − cuts) − discount, then the other rates on the amount after discount, then warranty retention, then the payments already made.

| | P7 Hochbau Beispiel | P8 Generalbau Beispiel |
|---|---|---|
| Contract rates | discount 3 % (item 5.1), site power and water 0,8 % (item 4.6), warranty retention 3 % (item 9.2); **no** construction damage levy | discount 2 % (item 5.1), warranty retention 3 % (item 9.2); nothing else |
| Daywork rates | 62,50 / 52,00 €/h | 64,00 / 53,50 €/h |
| Final invoice | 20.11.2025, 1.082.990,19 € | 30.06.2025, 1.506.940,00 € |
| Cut 1 | 22.04.10A, 12 pcs on measurement sheet AB-09, not countersigned, 12 × 351,00 = 4.212,00 € | RB-09 "Leitungen wegen Fremdgewerk umgelegt, Ebene 3", 12.05.2025, not signed: 20 h × 64,00 + 16 h × 53,50 + material 174,00 = 2.310,00 € |
| Cut 2 | 24.05.03A, line printed 59.446,40 € instead of 144 × 412,00 = 59.328,00 €: 118,40 € | new LV item 26.02.03A "Wickelfalzrohr DN 125 inkl. Formteile", 32,81 €/m, LV 400 m, invoiced 450 m, measured 400 m: 50 m × 32,81 = 1.640,50 € |
| After cuts | 1.078.659,79 € | 1.502.989,50 € |
| Discount | 32.359,79 € | 30.059,79 € |
| After discount | 1.046.300,00 € | 1.472.929,71 € |
| Site power and water | 8.370,40 € | – |
| Construction damage levy (deduction without contract item) | 5.231,50 € | – |
| Warranty retention 3 % | 30.980,94 € | 44.187,89 € |
| Remaining | 1.001.717,16 € | 1.428.741,82 € |
| Paid on interim invoices (Annahme, no AR details) | 905.000,00 € | 1.320.000,00 € |
| Final payment | 18.02.2026, 96.717,16 € (90 days) | 12.09.2025, 108.741,82 € (74 days) |

Check P7: 1.082.990,19 − 4.330,40 = 1.078.659,79; × 3 % = 32.359,79; 1.078.659,79 − 32.359,79 = 1.046.300,00; × 0,8 % = 8.370,40; × 0,5 % = 5.231,50; 1.046.300,00 − 8.370,40 − 5.231,50 = 1.032.698,10; × 3 % = 30.980,94; 1.032.698,10 − 30.980,94 = 1.001.717,16; − 905.000,00 = 96.717,16 €. Check P8: 1.506.940,00 − 3.950,50 = 1.502.989,50; × 2 % = 30.059,79; 1.472.929,71; × 3 % = 44.187,89; 1.428.741,82; − 1.320.000,00 = 108.741,82 €.

**Bridge to the demo (script 2:35):** For W21, the pre-check shows G1 "measurement not countersigned" (6.384,00 €) and the cascade shows the construction damage levy "deduction without contract item" (6.043,34 €). Hochbau Beispiel already cut or deducted both in P7. Matching via the key of the reason, not via the text. Note in the tool, neutral: "Gleicher Grund bei diesem Auftraggeber schon in P7." (Same reason with this client already in P7.)

## WhatsApp scene (mock, script 0:25 to 0:55)

Acted out, no real number, no real agent. Based on field report Z6. The chat visibly shows the date 08.09.2026 ("this is how the field report came in"), so that chat, timeline and demo reference date match.

Spoken sentence in the script (0:25, HVAC and plumbing version instead of "Steckdose" (power socket)): "Radiator in unit 9 relocated because the foreman wanted it. Twenty seconds, no daywork report later."

1. Fitter, crew 1 sends a photo (radiator in the new place) and a voice message (transcript as Z6).
2. Agent replies: "Thanks. This is how I understood it: Wohnhausanlage Wien 21, staircase 2, unit 9. Radiator in the living room relocated, no LV position. 6 h fitter, 6 h helper. Instructed by the GU foreman. Daywork report: none. Is that correct?" Buttons: "Ja" (Yes), "Ändern" (Change).
3. Tap on "Ja". Agent: "Gespeichert." (Saved.)
4. The timeline shows the entry "08.09.2026, 14:30 · WhatsApp-Meldung · Heizkörper Top 9 versetzt" (field report · radiator unit 9 relocated) with photo and transcript, and list 2 shows item O4 (687,00 €).

The agent names no amount and does not say whether something is billable. The amount is only shown by the tool, from the calculation core.

## Questions for the insider (KW 45)

1. Field report daywork without a report (O4, O5): with the daywork rate (687,00 / 500,00 €) or as a lower bound from the average wage price (681,60 / 454,40 €)?
2. Relocating a radiator, 2 men × 6 h: realistic or an upper bound? (Reviewer: defensible if the connection pipe is rerouted, the riser drained and refilled, pressure test; otherwise rather 4 to 8 man-hours.)
3. Is "der Polier vom GU hat es angeschafft" (the GU's foreman ordered it) a sufficient basis for having a daywork report signed retroactively?
4. Ongoing projects: is "only work before the last AR" the right boundary for "forgotten"?
5. Still open from v1: installation time J1, average wage price 56,80 €/h, 20 % rule, short texts of positions.

## Changes compared to v1 (Dossier v3, 22.10.)

- New: company with 8 projects and 4 clients, demo reference date 22.10.2026, traffic light rule. Company overview shows "jetzt verrechenbar" (billable now) and "angemeldet und offen" (notified and open) separately.
- New: 6 field reports in W21; 4 as additional evidence (J1, J3, J4, O1), 2 as new items O4 (687,00 €) and O5 (500,00 €). **List 2: 10.095,30 → 11.282,30 €; W21 has 15 instead of 13 findings.** Amounts of list 1 (27.410,00 €), list 3, pre-check (8.767,50 €) and cascade (remaining balance 170.060,89 €) stay the same. The evidence list of J1, J3, J4 and O1 grows by the field report (J1: 7 instead of 6 pieces of evidence).
- New: 7 small projects with 7 cases, one note (P3 +31,1 %) and counter-checks; rule for ongoing projects (only work before the last AR, for both lists).
- New: GC history, separated into cuts and deductions without contract item, with change orders and days until final payment. Fixed list of reasons extended by 3; the cascade now calls the construction damage levy "Abzug ohne Vertragspunkt" (deduction without contract item).
- New: evidence source per item (coding "Quelle des Belegs" (source of the evidence)), share by amount and by count.
- New: text of the WhatsApp scene and script sentence, HVAC and plumbing instead of "Steckdose" (Dossier v3 named an electrical example).
- New: questions for the insider.
- For the build (phase 1b): solution file and tests in the code are still on v1 (`loesung.ts`: open 10.095,30 €, 13 findings) and will be brought to v2 together with data model and generator.
- Independently reviewed on 22.10.: all figures confirmed, 15 notes on rules and terms incorporated.

## Changes compared to v0 (reviewer round 22.10.)

- New company names (old "Strabel Bau" sounded like STRABAG).
- Unit price J1 with source LV; K7 only as a plausibility check with own average wage price 56,80 €/h and 1,30 h installation instead of 2,40 h. O3 newly priced with the average wage price: 8.900,00 → 8.352,80 €, list 2: 10.642,50 → **10.095,30 €**.
- J1 as "additional quantity from plan change", plan C only evidences units 7–13 (the 86 pcs are evidenced by the LV).
- "Preisgleitung" (price escalation) → "Preisumrechnung (ÖNORM B 2111)" (price adjustment); composite pipe 20 × 2,0 instead of DN 20.
- "Schlussrechnung fällig" (final invoice due) → "Schlussrechnung legen bis" (submit final invoice by).
- A1 without "Forcierung" (acceleration), as "Terminänderung (Mail GU)" (schedule change (GU mail)).
- Cascade: deductions with source GU deduction letter, payments and remaining balance added, total work value explicitly incl. list 1.
- Pre-check: "mit Kürzungsrisiko" (at risk of deduction), of which 2 already cut in AR3; notes "Mengenänderung über 20 %" (quantity change over 20 %) without amount.
- Added: contract date 14.11.2025, 31 fields corrected by hand, performance retention 5 %.
