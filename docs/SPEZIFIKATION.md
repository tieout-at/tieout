# tieout v2: specification

**As of:** 23 October 2026, step 0b, third version: decisions E1 to E16 taken (section 10). Examples switched to solution list v3 in step 0c (Wohnpark Mooshaim). Written by Claude for Maxi S. **Status:** decided.
**Yardstick:** the website section 03 "Lösung" (`website/messages/de.json`, key `solution`), live at https://tieout-at.pages.dev. All amounts come from `docs/Demo_Faelle.md` (synthetic, solution list v3); this file changes none of them, and `node docs/demo_faelle_check.mjs` fails if sections 0 to 11 contain an amount that is not in the list. The app never shows an amount that is not in `kern/` or the solution list.
**Language:** this document is English; every word the app shows is German and appears in quotation marks or in the vocabulary (section 6).

## 0. tieout on one page

**What it does:** tieout reads everything an HKLS or electrical contractor has about a project, compares per position what was ordered, done and invoiced, and checks the final invoice the way the Auftraggeber will check it. What was done also gets invoiced, and every line has its evidence.

**The benefit in one sentence:** before the Schlussrechnung goes out, tieout shows what is missing from it, with the evidence for every line, and where the Auftraggeber is likely to cut.

The app shows exactly the three steps of the website, in this order and with these words:

| Step | What the user sees | Wohnpark Mooshaim (synthetic) |
|---|---|---|
| **Ihre Daten** | every document, e-mail and WhatsApp message of the project, readable, with the original one click away | 77 "Belege" from the project folder (4 duplicates), 4 "WhatsApp-Meldungen" |
| **Digitaler Zwilling** | Ebene 1: the business with its "Auftraggeber", "Verträge", "Preisbasis" and "Projekte". Ebene 2: every position of the project as "beauftragt", "erbracht", "verrechnet", "offen" | 286 positions in the Leistungsverzeichnis, contract sum 746.820,00 € |
| **Ergebnis** | what is missing from the own Schlussrechnung, what the Auftraggeber would cut, every line with its evidence | **"zusätzlich verrechenbar" 14.620,15 €**: done, proven, not yet invoiced, "davon mit Kürzungsrisiko" 6.843,00 €. Separately: "in Klärung" 8.073,59 € (signature or Nachtrag still missing), "Vorprüfung" 8.619,00 € (positions the Auftraggeber is likely to cut or already cut, partly overlapping) |

The most important amount is "zusätzlich verrechenbar". The "Restforderung" of 89.274,41 € is not something tieout found: it is what the Auftraggeber still owes on the whole Schlussrechnung after his deductions and the payments so far (section 3.4).

**Who does the work:** in the first phase tieout runs the process for the customer from the files the business sends, and a construction professional is planned to review every result before delivery. The business decides every line; tieout never sends anything to the Auftraggeber.

**Rules that hold everywhere:** the AI reads and proposes facts with a source, a human decides every line, and every amount comes from deterministic code (`kern/`). Every number leads to its original with one click. Nothing is overwritten; every change is a new entry in the "Verlauf". Every business has its own data silo.

**tieout never:** contacts the Auftraggeber; gives legal assessments or statements on deadlines and preclusion; evaluates employees; lets the WhatsApp agent decide what is billable; replaces the ERP or the AVA; collects debts; pools prices between businesses; shows a feature that does not work.

## 1. Ihre Daten

### 1.1 How data comes in (stage 0)

One project folder is imported ("Ordner importieren"). The business sends what it has: exports from ERP and AVA, scans of Regieberichte and Aufmaßblätter, e-mails saved from Outlook (.msg or .eml), plans, photos. In the first phase tieout builds the folder from these files; how many hours this costs the business is measured with the first real projects and not claimed before.

Every file becomes a "Beleg" with type, date and source. tieout detects duplicates and plan versions (index chain) and reads the fields; every read field has the review state "maschinell gelesen" until a human confirms or corrects it. WhatsApp-Meldungen come from the agent (synthetic only until the legal clearance and the works council allow real data) or, for an existing project, from a WhatsApp chat export in the folder; on import, names and phone numbers are reduced to roles. Nothing is connected to a live system in stage 0: the app shows "aus Ordner importiert", never "verbunden".

### 1.2 What becomes what

The groups and items are the website's; rows marked "more than the website" are needed for the Ergebnis.

| Group | Item (website) | Becomes object | Comes in as | What the user sees |
|---|---|---|---|---|
| Systeme | ERP: Rechnungen | "Abschlagsrechnung" with lines per position; "Zahlung" with each deduction | ERP export (PDF or Excel), "Zahlungsavis" as PDF | Abschlagsrechnung 1 to 3 with amounts; per payment the deductions and the paid amount |
| Systeme | AVA: Preise | "Position" with Einheitspreis and quantity; "Preisbasis" (K7 per position, Mittellohnpreis) | ÖNORM A 2063 export or PDF Leistungsverzeichnis; K7 sheets | the position table (Ebene 2); the Preisbasis on the business page (Ebene 1) |
| Dokumente | Pläne mit Index | "Plan" with its index chain and what changed per index | PDF per index | "Plan H-201: Index C → D", with the note "14 Wohnungen Typ C: Wohnküche geteilt, je 1 Heizkörper mehr" |
| Dokumente | Leistungsverzeichnis (PDF) | "Position" (same object as AVA prices; whichever is in the folder) | PDF | position number, short text, unit, Einheitspreis, beauftragt |
| Dokumente | Aufmaß (Excel) | "Aufmaßblatt" with lines per position, countersigned or not | Excel or PDF | "Aufmaßblatt 12", date, quantities, "gegengezeichnet: nein" |
| Dokumente | Stundenzettel (Scan) | "Regiebericht" (signed by the Auftraggeber or not) and "Stundenzettel" (internal hours per crew and week) | scan | "Regiebericht 9", date, hours fitter and helper, material, "unterschrieben: ja" |
| Dokumente | more than the website | "Vertrag"; "Korrekturblatt" and "Abzugsschreiben" of the Auftraggeber; own "Entwurf" of the Schlussrechnung | PDF | contract items as fields with their item number; the Auftraggeber's cuts per position |
| Kommunikation | E-Mail: Anweisungen | "E-Mail" with category ("Anweisung", "Anmeldung", "Termin", "Sonstiges") | .msg or .eml from the folder; never a mailbox, never sent | sender role, date, the sentence that matters highlighted ("bitte gleich mitmachen") |
| Kommunikation | WhatsApp: Zurufe | "WhatsApp-Meldung" with sender role, time, project, place, what was done, who instructed it and why, hours per crew, transcript, photo, confirmation by the sender | WhatsApp agent or chat export | "08.09.2026, 14:30, Monteur, Trupp 1: Heizkörper Top 9 versetzt", photo, transcript, linked find |
| Kommunikation | Fotos, Sprachnachrichten | "Foto" (time from EXIF in the folder, from the message for WhatsApp); "Sprachnachricht" with "Transkript" as part of a WhatsApp-Meldung | file or WhatsApp | photo with time and project; audio with transcript |

### 1.3 The fitters' side of WhatsApp

The agent's own rules live in `agent/`; for the product they are:

1. A message is one photo and one voice message. The agent sends back what it understood (project, place, what was done, who instructed it, hours) and asks at most one question, usually "Wer hat das angeordnet?". The sender confirms with one tap.
2. The crew leader reports for the crew. Hours are recorded per crew ("2 Mann, je 6 Stunden"), never per person.
3. Employees appear only as a role ("Monteur, Trupp 1"). tieout does not claim this is anonymous; it guarantees that nothing is evaluated per person: no ranking, no tracking, no comparison of a person's hours.
4. Internal Stundenzettel are read only as a sum per crew and week, and only to check a Regiebericht against it (Vorprüfung reason "Stunden weichen ab").
5. A message that needs a Regiebericht immediately becomes a task for the Bauleitung ("Regiebericht schreiben und vom Polier unterschreiben lassen"), while the foreman is still on site.
6. Languages other than German: to be tested; voice messages in dialect and site jargon are an open quality question.
7. Participation is voluntary; a way without WhatsApp is provided. Before the first real message the works council gets these rules in writing.

### 1.4 Data and trust

Data is stored per business, hosted in the EU, and deleted at the end of the contract. Before any real data a data processing agreement is signed. The Preisbasis (K3, K7) is visible only to the business and to the reviewing construction professional, who is bound to confidentiality. Synthetic data only until the legal clearance is complete.

### 1.5 Wohnpark Mooshaim in numbers (from `Demo_Faelle.md`)

77 Belege, 4 of them duplicates: 1 Vertrag, 1 Leistungsverzeichnis (286 positions), 1 Preisbasis (K3 and K7), 13 Aufmaßblätter, 15 Regieberichte (12 invoiced, 2 signed and not invoiced, 1 not signed), 1 Stundenzettel (KW 23), 3 Abschlagsrechnungen, 3 Zahlungsavisos, 1 Korrekturblatt, 1 Abzugsschreiben, 1 own Entwurf (752.314,80 €), 3 Großhändlerrechnungen, 16 E-Mails (2 duplicates), 10 Fotos (2 duplicates), 1 Fotodokumentation Brandschutz, 6 Pläne (H-101, H-201, L-310, S-150 with their index chains). 18 fields corrected by hand. Plus 4 WhatsApp-Meldungen outside the folder. A real project has far more e-mails and photos; how tieout keeps them readable (the Zeitstrahl shows only what belongs to a find by default) is tested with the first real folder.

## 2. Digitaler Zwilling

### 2.1 Rules for every object

- Every value that comes from a document is a field with **source** (Beleg, page, place), **review state** ("maschinell gelesen", "bestätigt", "korrigiert") and **Verlauf** (who, when, old value). A correction never overwrites; the old value stays visible ("korrigiert, vorher 98 Stk").
- Amounts are integer cents, rates are basis points, rounding is commercial and per line (as in v1). All amounts are net.

### 2.2 Ebene 1: Ihr Betrieb

The website calls this level "Firmenwissen".

| Object | Fields | Source | Example (solution list v3) |
|---|---|---|---|
| "Betrieb" | name, trade, location, members with role ("Abrechnung", "Geschäftsführung", "Bauleitung") | set up once | Kronfeld Haustechnik, HKLS, Wien |
| "Auftraggeber" | name, kind ("Generalunternehmer", "öffentlicher Auftraggeber", "Bauträger"), contact persons by role, projects, history: cuts per reason, deductions without contract item, Nachträge accepted and rejected, days until final payment | contracts, Korrekturblätter, Zahlungsavisos of all projects | Hornfeld Bau: 3 projects; cuts 4.431,20 €; deductions without contract item 6.628,41 €; 90 days until final payment (Wohnhof Erlenhain) |
| "Vertrag" | date, contract sum, kind (Einheitspreisvertrag), ÖNORM B 2110, rates with item number (Nachlass, Skonto, Umlagen, Deckungsrücklass, Haftrücklass and whether a bank guarantee replaces it), Regiesätze, Regiematerial surcharge, Festpreise or Preisumrechnung with index and base, Pauschalen, "Schlussrechnung legen bis" | Bauvertrag | Wohnpark Mooshaim: 12.11.2025, 746.820,00 €; Nachlass 3 % (Punkt 5.1), Skonto not named, Baustrom und Bauwasser 0,6 % (4.6), Deckungsrücklass 5 % on Abschlagsrechnungen, released with the Schlussrechnung (9.1), Haftrücklass 3 %, replaceable by bank guarantee (9.2), Baustelleneinrichtung pauschal (4.3), Festpreise bis Bauende (7.1); Monteur 64,80 €/h, Helfer 54,20 €/h, Regiematerial at Einstandspreis plus 15 % (6.4); legen bis 30.10.2026 |
| "Preisbasis" | Mittellohnkosten and Mittellohnpreis (K3), K7 per position (labour time, other costs), later Einheitspreise from earlier Leistungsverzeichnisse | own calculation | Mittellohnkosten 45,80 €/h, Mittellohnpreis 58,60 €/h (assumption); 22.04.12B: 1,10 h labour, 221,94 € other costs |
| "Projekt" | name, Auftraggeber, Vertrag, stage ("in Ausführung", "Schlussrechnung vorbereiten", "Schlussrechnung gelegt", "abgeschlossen"), date, "zusätzlich verrechenbar", "in Klärung", status colour | all of the above | 5 projects, 3.487.720,00 € contract sum; 3 open projects with 22.632,96 € "zusätzlich verrechenbar" |

Status colour (fixed rule, never an accent colour): red = Schlussrechnung to be submitted within 21 days of the demo date (22.10.2026) and something open; yellow = something open; green = nothing open; grey = Schlussrechnung submitted or project closed. The date is shown, never a countdown.

### 2.3 Ebene 2: Projekt

**"Position"** is the row of the website table "Leistungen: beauftragt, gebaut, verrechnet". One row per position of the Leistungsverzeichnis, plus one row for every service without a position (a Regiebericht, hours from a WhatsApp-Meldung, a notified change, the Preisumrechnung).

| Column | Meaning | Source |
|---|---|---|
| "Position" | number and short text ("22.04.12B Plattenheizkörper Typ 22 VK, 600/1000") or the service ("Regiebericht 9, Steigleitung umgelegt") | Leistungsverzeichnis, Regiebericht |
| "Beauftragt" | quantity in the Leistungsverzeichnis; "–" without a position | Leistungsverzeichnis |
| "Erbracht" | measured quantity (Aufmaßblätter); for hours "8 h Monteur" or "12 h Monteur, 12 h Helfer" | Aufmaß, Regiebericht, WhatsApp-Meldung |
| "Verrechnet" | quantity in the own Entwurf; without an Entwurf, the latest state of the Abschlagsrechnungen (cumulative ones are read as cumulative, never added up) | Rechnungen |
| "Offen" | the amount not yet invoiced: quantity × Einheitspreis, or hours × Regiesatz plus material, or the Preisumrechnung amount; with its "Belegstand" | calculated in `kern/` |

The footer shows "Zusätzlich verrechenbar" and "In Klärung" separately, never one total. Examples from Wohnpark Mooshaim: 22.04.12B beauftragt 86 Stk, erbracht 100 Stk, verrechnet 86 Stk, offen 4.009,60 €; Regiebericht 9 beauftragt –, erbracht 12 h Monteur, 12 h Helfer, verrechnet 0 h, offen 1.787,49 € (777,60 € Monteur, 650,40 € Helfer, 359,49 € material with the 15 % surcharge).

**Further project objects**, each with source, review state and Verlauf:

| Object | Key fields |
|---|---|
| "Aufmaßblatt" | number, date, lines (position, quantity), countersigned yes or no |
| "Regiebericht" | number, date, what was done, instructed by (role), hours fitter and helper, material, signed yes or no, in which Abschlagsrechnung |
| "Stundenzettel" | week, crew, hours as a sum |
| "WhatsApp-Meldung" | time, sender role, place, what, instructed by, why, hours per crew, photo, transcript, confirmed |
| "Plan" | number, index, date, what changed |
| "E-Mail" | date, sender role, category, the relevant sentence |
| "Foto" | time, project, place |
| "Abschlagsrechnung" | number, date, lines, amount |
| "Zahlung" | date, amount paid, each deduction with its rate |
| "Korrekturblatt", "Abzugsschreiben" | the Auftraggeber's cuts and deductions with reason |
| "Entwurf" | own draft of the Schlussrechnung with lines and total |

## 3. Ergebnis

### 3.1 The Schlussrechnung: the website's checks and what is behind them

| Website check | Rule in `kern/` | Wohnpark Mooshaim |
|---|---|---|
| "Vergessene Stunden gefunden" | signed Regieberichte in no Abschlagsrechnung; unsigned ones and hours named only in a WhatsApp-Meldung go to "in Klärung" | F2 and F3 "zusätzlich verrechenbar"; F6 and F7 together 1.119,99 € "Beleg fehlt" |
| "Mehrmengen erkannt" | Aufmaß above what is invoiced. Above the quantity in the Leistungsverzeichnis it is a "Mehrmenge"; below it "erbracht, nicht verrechnet". A note without amount when the quantity changes by more than 20 % | F4 and F5; note "Hornfeld Bau kann hier einen neuen Einheitspreis prüfen." (F4, +26,3 %); in Bürohaus Kiefernau P2-F3 is "erbracht, nicht verrechnet" |
| "Planänderungen eingerechnet" | plan index changes as evidence for Mehrmengen | F1: Plan H-201 Index C → D, 14 Heizkörper with Thermostatkopf, Anschlussarmatur and Anbindeleitung, 6.648,60 € |
| added: "Preisumrechnung eingerechnet" | labour share of the work from the start date in the contract × the change of the labour index | no case: Wohnpark Mooshaim has Festpreise (Vertragspunkt 7.1); the check runs and finds nothing |
| added: "Änderungen bewertet" | changes notified by e-mail and never priced, estimated on the Preisbasis of the Vertrag | F8: 6.953,60 € "Nachtrag nicht gelegt" |
| "Vorab geprüft wie vom Auftraggeber" | the checks a Generalunternehmer's checking software runs, on the own draft: Aufmaß not countersigned, hours differ, calculation error, outside the Leistungsverzeichnis, invoiced above the Aufmaß; every rate of the Auftraggeber against the Vertrag | 3 positions, 8.619,00 €: 1 already cut in Abschlagsrechnung 3 (G3, 1.776,00 €, still in the Entwurf), 2 at risk (G1, G2, 6.843,00 €); Bauschadensumlage 3.719,63 € "Abzug ohne Vertragspunkt" |
| "Zu jeder Position ein Beleg" | every find carries its calculation and its Belege; every line of the result leads to its source | F1: 6 Belege and 1 WhatsApp-Meldung (Leistungsverzeichnis, Plan C and D, E-Mail 07.04., Foto, Aufmaßblatt 12, WhatsApp-Meldung 12.05.) |
| "zusätzlich verrechenbar" | sum of the finds with "belegt" that nobody decided not to invoice | 14.620,15 € |

The website lists five checks; the app shows seven, because notified changes carry real money and a Vertrag with variable prices needs the Preisumrechnung.

"Invoiced above the Aufmaß" (reason "Menge ohne Aufmaß-Nachweis" in the fixed list) has one case in the Auftraggeber history (Pflegeheim Eibenau, 1.640,00 €) and none in Wohnpark Mooshaim (counter-check in `Demo_Faelle.md`).

### 3.2 "Fund"

A find is something tieout found that may go into the Schlussrechnung. Wohnpark Mooshaim has 8 finds and 1 note without amount ("Rechtsfrage": schedule change by e-mail; tieout gives no legal reading of it).

| Attribute | Values | Set by |
|---|---|---|
| "Art" | "Mehrmenge", "Mehrmenge aus Planänderung", "erbracht, nicht verrechnet", "Regie", "Stunden ohne Regiebericht", "Preisumrechnung", "Änderung angemeldet", "Pauschale laut Vertrag" | `kern/` |
| "Belegstand" | "belegt", "Beleg fehlt", "Nachtrag nicht gelegt"; none for "Pauschale laut Vertrag" | `kern/` from the Belege |
| "Entscheidung" | "Gefunden" → "Geprüft" → "Freigegeben" → "In der Schlussrechnung"; or "Nicht verrechnen" with a reason | humans (section 5) |
| "Betrag", "Rechenweg" | each step of the calculation with its source | `kern/` |
| "Kürzungsrisiko" | reason from the fixed list and the remedy ("Abhilfe"), when the Vorprüfung flags the find | `kern/` |
| "Belegquelle" | "Datei", "Papier", "E-Mail", "Foto", "WhatsApp" | `kern/` |

A find with the Art "Pauschale laut Vertrag" (none in solution list v3) shows the fact, for example "Vertragspunkt 4.3 nennt die Baustelleneinrichtung als Pauschale", and whether an instruction exists, with no proposal of its own. It counts in no sum until a human decides. A find with "Beleg fehlt" is not in the draft by default; the billing clerk may add it, and the Vorprüfung then flags it ("Regie nicht unterschrieben").

F1 is both "zusätzlich verrechenbar" and the largest Vorprüfung line (G1, Aufmaßblatt 12 not countersigned). The find page shows this on the find itself, with the remedy, and the headline shows it too: under "zusätzlich verrechenbar" the line "davon mit Kürzungsrisiko" (E13) sums the Vorprüfung amounts in state "droht" that lie inside "zusätzlich verrechenbar", not the full flagged finds: G1 6.648,60 € + G2 194,40 € = 6.843,00 €.

### 3.3 Outputs (dossier section 3.6 after the challenge)

| Output | Verdict | Content |
|---|---|---|
| Position table per project | stays (Ebene 2) | section 2.3 |
| Three lists | become states of the finds | "Belegstand" and "Entscheidung" instead of three separate pages |
| "Änderungsliste" to the own Entwurf | new, main output | every new or changed line with quantity, price and its Beweispaket, to enter into the business's own invoicing system; tieout does not write a second invoice |
| "Beweispaket" per find | stays | print view: calculation, every Beleg with the marked place in the original |
| "Vorprüfung" | stays | positions with "Kürzungsrisiko", reason, remedy; "schon gekürzt" shown apart from "droht"; overlaps "zusätzlich verrechenbar", never added |
| "Rechnungsabschluss" of the Schlussrechnung | stays, as a check | section 3.4 |
| "Schlussbesprechungs-Blatt" | stays, after the Schlussrechnung | per find "Forderung" and "Untergrenze", grouped by Belegstand (Wohnpark Mooshaim: 22.693,74 € and 20.723,80 €, "Spielraum" 1.969,94 €; the Untergrenze uses the Mittellohnkosten). This sheet is the one place where "zusätzlich verrechenbar" and "in Klärung" appear in one total, because it lists everything that can be raised in the final meeting. The floor rule is a question for the insider (question 9) |
| Export | Excel and PDF now; ÖNORM A 2063 data carrier as soon as a real customer needs it (often required by public clients); BMD later | no button before it works |
| Coding sheet (a) to (d) | out of the app | internal measurement, not a customer output |

Whether tieout may hand out a draft for real customers is part of the pending legal clearance.

### 3.4 Rechnungsabschluss

The Rechnungsabschluss shows how the Auftraggeber will settle the Schlussrechnung: own work value including the finds → Nachlass → deductions announced by the Auftraggeber, each checked against the Vertrag → Haftrücklass → payments received → "Restforderung". All amounts are net; the tax treatment (reverse charge for a GU, VAT for a public client) comes from the business's own invoice.

"Payments" are the amounts actually paid per Zahlungsavis, after the Deckungsrücklass and the cuts. A deduction without contract item (Wohnpark Mooshaim: Bauschadensumlage 0,5 %, 3.719,63 €) stays visible as the Auftraggeber's announced deduction and is marked "Abzug ohne Vertragspunkt"; whether to object is the business's decision. Next to it the app shows "Restforderung laut Vertrag": the same calculation without deductions that have no contract item; what was already withheld on the Abschlagsrechnungen is included, because the calculation subtracts only what was actually paid (E14: 92.882,45 € next to the Restforderung of 89.274,41 €).

The Rechnungsabschluss takes the own Entwurf as it stands. A line the Auftraggeber already struck once (Wohnpark Mooshaim: Z-01 Kernbohrungen, G3) stays in it until the Abrechnung removes it; the Vorprüfung shows it as "schon gekürzt".

## 4. Screens

### 4.1 Navigation

Sidebar (Attio layout): business switcher, "Suche" (Strg K), "Start", "Aufgaben", "Berichte", "Abläufe"; then the three sections.

| Section | Entries |
|---|---|
| "Ihre Daten" | "Belege", "E-Mails", "WhatsApp-Meldungen" |
| "Digitaler Zwilling" | "Übersicht" (4.4), "Betrieb" (Verträge, Preisbasis, members), "Auftraggeber", "Projekte" |
| "Ergebnis" | "Funde", "Schlussrechnungen" |

Bottom: "Erste Schritte", "Mitglieder einladen", "Beispieldaten".

Project page: header with name, Auftraggeber, "Schlussrechnung legen bis 30.10.2026" and the step bar "Ihre Daten → Digitaler Zwilling → Ergebnis" with the five run steps below it (section 5). Tabs in the same order, after "Überblick" (the record itself, as Attio's "Overview": Angaben with their source, Vertrag, highlights, Verlauf; added in step 4): "Zeitstrahl", "Belege" | "Positionen", "Vertrag" | "Funde", "Schlussrechnung".

Search also finds the abbreviations people type ("LV", "AR 3", "RB 11", "AB 12") and shows the full words.

### 4.2 Every Attio element measured against the three steps

| Attio element | tieout | Step | Contribution | Verdict |
|---|---|---|---|---|
| Workspace switcher | "Betrieb" | Zwilling, Ebene 1 | the box "Ihr Betrieb" of the website | keep |
| Search (Strg K) | "Suche" for numbers and names | all | jumps straight to the source | keep |
| Home | "Start" | Ergebnis | money, next deadline, "Als Nächstes" with a jump to the first open find | keep (E3) |
| Home: greeting | short greeting with the business name | none | small | keep, one line |
| Home: input field | none | none | it is the AI chat | out |
| Home: meetings | deadlines ("Schlussrechnung legen bis") | Ergebnis | when the money must be out | adapt |
| Notifications | new WhatsApp-Meldung, task due | Ihre Daten | only useful with live messages | later |
| Tasks, "Create task" modal | "Aufgaben" from gaps, with deadline, find and person in charge | Ergebnis | closes "Beleg fehlt" ("Regiebericht 12 vom Polier unterschreiben lassen") | keep |
| Notes | "Notizen" for the final meeting | Ergebnis | small | later, not in the sidebar until used; not built in step 7 (Maxi S., 25.10.2026: no real use in stage 0, the final meeting gets the Schlussbesprechungs-Blatt in step 8) |
| Emails | "E-Mails" from the folder, read and assign, never send | Ihre Daten | the instructions | keep, read only |
| Calls | "WhatsApp-Meldungen" with transcript and photo | Ihre Daten | site knowledge with time and sender role | keep |
| Reports | "Berichte" | Ergebnis (business) | "zusätzlich verrechenbar" per project, Auftraggeber history, "nur außerhalb ERP" (E15) | keep |
| Sequences | none | none | tieout sends no mail series (no cold outreach, § 174 TKG) and never contacts the Auftraggeber | out |
| Workflows: canvas, block palette, configuration panel, runs | "Abläufe": canvas one to one as in Attio, blocks for triggers, run steps, checks and tasks (section 5.2) | all | shows and sets how the business checks its invoices; the step bar on the project page shows the same run | keep (E4) |
| Workflows: chat that builds the workflow | none | none | it is the AI chat | out |
| Companies | "Auftraggeber" | Zwilling, Ebene 1 | contracts and history | keep |
| People | contact persons inside the Auftraggeber; own staff only as role | Zwilling, Ebene 1 | small | no own sidebar entry |
| Deals | "Funde" | Ergebnis | the centre of the app | keep |
| Deals kanban | "Funde" board by "Entscheidung" | Ergebnis | the decision flow | keep |
| Record page: attributes ("Record Details"), highlights, tabs, activity | pages for Projekt, Auftraggeber, find, Position, Beleg | all | detail with source | keep |
| Record page: section "Lists" | none | none | lists come later | later |
| Record page: action bar | decision bar on the find ("Prüfen", "Nicht verrechnen", "Aufgabe anlegen") | Ergebnis | one decision per find | keep |
| Highlights grid | on a find: "Betrag", "Belegstand", "Kürzungsrisiko", "Entscheidung" | Ergebnis | the decision at a glance | keep |
| Activity, "View all" | "Verlauf", append only | Zwilling | the twin's memory | keep |
| Lists | "Listen" across projects | none in stage 0 | grouping for a meeting | later |
| Favorites | none | none | nothing | out |
| View bar, view settings, sort, filter, add column | same | all tables | showing the finds that matter | keep |
| Table checkboxes | selection for tasks and export | all tables | bulk work | keep; never a bulk release, every find is decided on its own |
| Table footer: counter | "8 Funde" | all tables | how many | keep |
| "Add calculation" (column sums) | fixed sums from `kern/` only | Ergebnis | totals that are allowed | adapt: no free sums, never "zusätzlich verrechenbar" plus "in Klärung" |
| Tags (coloured pills) | "Belegstand", stage, status colour | all | state at a glance | keep |
| Import / Export | "Ordner importieren"; export Excel and PDF | Ihre Daten / Ergebnis | the way in and out | keep |
| Chat panel on the right | the original of the Beleg with the marked place | Ihre Daten | "every number leads to its original" | adapt (most important change) |
| Chat "Thinking" step list | none | none | belongs to the AI chat | out |
| Full-screen chat with templates, "Ask Attio" | "Frag tieout" | none | AI chat is not a core function | out, later only after a team go |
| Getting started, invite members | "Erste Schritte" (Ordner importieren, ersten Fund prüfen, Änderungsliste drucken), "Mitglieder einladen" | all | first run | keep |
| Onboarding flow | none for the sample company | none | nothing for the demo | later |
| Header: share | none | none | sharing outside the business is outward facing | out |
| Header: help | "Hilfe" | all | small | keep |

### 4.3 Missing in Attio, added

| Screen | Step | Content |
|---|---|---|
| "Projekte" and project page | Zwilling | the plan's new object: Vertrag, deadline, amounts; tabs as in 4.1 |
| "Belege" and the original viewer | Ihre Daten | every document of the folder with type, date, review state, linked finds; PDF or image with the place marked, in the right panel and as a full page |
| Position table | Zwilling, Ebene 2 | section 2.3: the website table with three changes: "Beauftragt" instead of "LV", "Erbracht" instead of "Gebaut", and two separate totals instead of one |
| "Zeitstrahl" | Ihre Daten | the website section 02 for the real project: lane "Baustelle" (WhatsApp, Stunden, E-Mail, Plan, Foto) against lane "Schlussrechnung", where each event is "verrechnet" or "fehlt", and a missing one carries "gefunden" with its find; by default only events that belong to a find |
| Plan index chain | Ihre Daten | C → D → E with what changed and the finds it supports |
| "Rechenweg" on the find | Ergebnis | each calculation step with its source |
| "Schlussrechnung" | Ergebnis | Änderungsliste, Rechnungsabschluss with every tieout line marked with its decision, Vorprüfung, "Ausgaben" |
| "Beweispaket" print view | Ergebnis | per find |
| "Schlussbesprechungs-Blatt" | Ergebnis | section 3.3 |

Never less understandable than the website: the three step names, the Ebene 1 box (Auftraggeber, Verträge, Preisbasis, Projekte), the Ebene 2 table, the Ergebnis card with its checks and the words "fehlt" and "verrechnet" must appear in the app with the website's words.

### 4.4 Making the twin visible (decided 24.10.2026)

**Decision (Maxi S., step 4):** candidate A, built as the page "Übersicht" at the top of "Digitaler Zwilling": per open project the flow Ihre Daten → Digitaler Zwilling → Ergebnis with the real data, where pointing at a finding or an amount lights exactly the Belege that prove it. The middle shows what the twin is: the knowledge of the business (Auftraggeber with its history, Vertrag, Preisbasis) and the Abgleich of the project, beauftragt, erbracht, verrechnet per position. Reached after two rounds with three, then four drafts, research of references and independent design, domain and code reviews; design in `DESIGN.md`. Candidate B (Belegabdeckung) was not built in step 8 (decided 25.10.2026): it needs to know which Beleg proves which position, which `kern/` does not hold yet, so it comes with the tab "Positionen". The draft text below is kept as the reasoning.

#### Draft (23.10.2026)

**Input (Maxi D., 23.10.2026):** it would be good to show the twin's data visually as well; what matters most is the complete, aggregated database on which the Schlussrechnung is built. Visualising such a database gives first insights even before the analytics on top of it exist.

**Assessment (Claude, to be decided by Maxi S. at step 4):**

1. The core stays the database: every object with source, review state and Verlauf (section 2). A view earns its place only if it shows completeness or a gap that leads to a decision or a task.
2. **Not a free graph of all objects** (nodes and lines, as on many "digital twin" marketing pictures): it impresses in a pitch, but the Abrechnung decides in tables and lists, and Attio has no such view either (section 4.2). Kept as a website picture, which section 03 already is.
3. **Not the "Abläufe" canvas** (E4): the canvas shows how invoices are checked (a process); the twin is the data. Putting data on the canvas makes step 9 bigger without giving the user a new decision.
4. **Candidate A, "Zwilling-Übersicht":** the website's section 03 picture (Ihre Daten → Digitaler Zwilling → Ergebnis) as the first page of "Digitaler Zwilling", with real counts (Wohnpark Mooshaim: 77 Belege with 4 duplicates, 4 WhatsApp-Meldungen, 286 positions, 8 Funde) and every box a link to its list. Website and app then share one picture, and the user sees at a glance that the folder is complete. Small once `kern/` and the tables exist (step 4).
5. **Candidate B, "Belegabdeckung" per project:** positions as rows, kinds of evidence (Leistungsverzeichnis, Plan, Aufmaß, Regiebericht, E-Mail, Foto, WhatsApp) as columns, each cell coloured by Belegstand; an empty cell becomes a task. It answers "Ist alles belegt?" before the Schlussrechnung. Medium effort (step 5 or 8).
6. **First insights from the data alone** belong in "Berichte" (step 8): Belegstand per project, unsigned Regieberichte, cuts per Auftraggeber, deductions without contract item. They work before any Schlussrechnung is checked.

Until decided, nothing here changes the order of the steps.

## 5. Abschluss-Lauf and Abläufe

### 5.1 The five steps

| Step (website step) | Input | Output | Who confirms |
|---|---|---|---|
| "Ordner lesen" (Ihre Daten) | project folder; WhatsApp-Meldungen | Belege with read fields, duplicates, plan index chains, Meldungen assigned to the project | Abrechnung confirms or corrects uncertain fields (Wohnpark Mooshaim: 18 corrected) |
| "Abgleich" (Digitaler Zwilling) | positions, Aufmaß, Regie, Meldungen, Abschlagsrechnungen, own Entwurf, Vertrag | position table, finds with calculation and Belege, note "Rechtsfrage" | nobody confirms arithmetic; every find goes to "Prüfung" |
| "Vorprüfung" (Ergebnis) | Entwurf with the finds, Vertrag, Auftraggeber history | positions with "Kürzungsrisiko", reason and remedy; every rate against the Vertrag | Abrechnung decides the remedy (task) |
| "Entwurf" (Ergebnis) | own Entwurf, finds, Vertrag, payments | Änderungsliste and Rechnungsabschluss down to the Restforderung | "Prüfung" by Abrechnung per find, then "Freigabe" by Geschäftsführung; the Bauleitung confirms site facts through a task ("Bitte bestätigen", on the phone) |
| "Ausgaben" (Ergebnis) | released finds | Änderungsliste as PDF and Excel, Beweispakete, Schlussbesprechungs-Blatt | the business enters and sends its invoice itself; tieout never contacts the Auftraggeber |

**What counts before anyone decided:** the Rechnungsabschluss always includes every "belegt" find that nobody set to "Nicht verrechnen", each marked with its decision state. So a fresh demo (nothing decided) shows 89.274,41 €, and a "Nicht verrechnen" removes the line. "Ausgaben" is final only once every find is decided; before that, exports carry the mark "Entwurf, nicht freigegeben".

**When it runs:** before the Schlussrechnung, and for projects "in Ausführung" at every Abschlagsrechnung (the rule for ongoing projects in `Demo_Faelle.md` covers Bürohaus Kiefernau and Volksschule Ahornbrunn; it compares the work date with the date of the last Abschlagsrechnung). Gaps then become tasks while the foreman is still on site (E16). Bürohaus Kiefernau shows it: a WhatsApp-Meldung of 24.09.2026, a find at Abschlagsrechnung 2 on 30.09.2026, the Regiebericht signed by the Polier on 02.10.2026.

In the first phase tieout runs the Abschluss-Lauf for the customer; a construction professional is planned to review every result before delivery.

### 5.2 "Abläufe" on the canvas

The canvas is built one to one as in Attio's Workflows: dotted grid, blocks of about 200 × 60 px (icon chip, title, subtitle, connection points), configuration panel on the right (400 px), toolbar at the bottom (zoom, hand, pointer, "Block hinzufügen"), and the list "Läufe" with every past run. What is ours is the content: the canvas shows how the business checks its invoices, and the business can see and change it.

| Block kind | Blocks | Configuration panel shows |
|---|---|---|
| Trigger | "Ordner importiert", "Abschlagsrechnung gelegt", "WhatsApp-Meldung eingegangen", "Schlussrechnung legen bis in 21 Tagen" | project, when it fired last |
| Run step | "Ordner lesen", "Abgleich", "Vorprüfung", "Entwurf", "Ausgaben" (section 5.1) | input, output, who confirms |
| Check | one block per rule of the check catalogue: "Aufmaß nicht gegengezeichnet", "Regie nicht unterschrieben", "Stunden weichen ab", "Rechenfehler", "Außerhalb des Leistungsverzeichnisses", "Menge ohne Aufmaß-Nachweis", "Abzug ohne Vertragspunkt", "Mengenänderung über 20 %" | on or off, its threshold, how often it hit, the finds it produced |
| Task | "Aufgabe an Bauleitung", "Aufgabe an Abrechnung", "Freigabe anfordern" | role, deadline, text |

Three Abläufe come ready:

1. **"Abschluss-Lauf":** "Ordner importiert" → the five run steps with their checks → "Freigabe anfordern".
2. **"Lauf je Abschlagsrechnung"** (E16): "Abschlagsrechnung gelegt" → "Abgleich" and "Vorprüfung" → for every gap a task to the Bauleitung while the foreman is still on site.
3. **"Meldung zu Regiebericht":** "WhatsApp-Meldung eingegangen" without a Regiebericht → "Aufgabe an Bauleitung: Regiebericht schreiben und vom Polier unterschreiben lassen".

During a run the blocks light up one after the other and show their result ("77 Belege gelesen", "8 Funde", "3 Kürzungsrisiken"); a click on a block opens what it produced. The block palette is the check catalogue: every rule a construction professional adds becomes a block the business can switch on. Limits: a block never calculates an amount (`kern/` does), never sends anything to the Auftraggeber, and is never built by an AI chat.

**As built in step 9 (decided by Maxi S., 27.10.2026):** the blocks run top to bottom (not left to right as in Attio today), so 7 steps and the 8 checks fit next to the panel; "Freigabe anfordern" stands before "Ausgaben", since the Ausgaben are final only once every find is decided; the eight checks are one card on the "Vorprüfung" (they are the reasons of the Vorprüfung plus the quantity change above 20 %); the triggers read "Neue Abschlagsrechnung" and "Neue WhatsApp-Meldung" on the blocks; switching a check or an Ablauf off is shown but locked until sign-in (it would remove finds and change amounts); the list "Läufe" shows the runs today's data allows (per project the run at its Entwurf, at its last Abschlagsrechnung, one per WhatsApp-Meldung), earlier Abschlagsrechnungen need the core at a past date. The "Lauf je Abschlagsrechnung" shows its "Vorprüfung" as not run, because the Vorprüfung needs an own Entwurf. Counts per block: `ablaeufe()` in `kern/src/ablaeufe.ts`.

## 6. Vocabulary

| German UI word | Meaning | Never instead |
|---|---|---|
| "Ihre Daten", "Digitaler Zwilling", "Ergebnis" | the three steps | Input, Twin, Output |
| "Betrieb" | the contractor's business | Workspace, Mandant |
| "Auftraggeber" (always by name: "Hornfeld Bau") | the client | AG, Kunde; "GU" only as kind "Generalunternehmer" |
| "Projekt" | one construction project | Baustelle as object name |
| "Vertrag", "Vertragspunkt 4.3" | construction contract and its items | Klausel |
| "Preisbasis" | own calculation: Mittellohnkosten, Mittellohnpreis, K7 | Kalkül |
| "Leistungsverzeichnis" | bill of quantities | LV in running text, Leistungskatalog |
| "Position" | one row of the Leistungsverzeichnis or a service without one | Zeile, Item, LV-Pos. |
| "Einheitspreis" | unit price per Leistungsverzeichnis | EP |
| "beauftragt", "erbracht", "verrechnet", "offen" | the four columns of Ebene 2 (E10; the website still says "gebaut") | gebaut, Soll, Ist, Delta, Differenz |
| "Aufmaßblatt 12" | measurement sheet | AB-12 |
| "Regiebericht 11" | daywork report for the Auftraggeber's signature | RB-11, Regiezettel |
| "Stundenzettel" | internal hours per crew and week | Timesheet |
| "Abschlagsrechnung 3" | interim invoice | AR3, Teilrechnung |
| "Beleg" | any document or message that proves something | Dokument, Evidence |
| "WhatsApp-Meldung" | message from the site through the agent | Zuruf (website, E7), Call-in |
| "E-Mail" | e-mail from the project folder | Mail |
| "Fund", plural "Funde" | something tieout found that may go into the Schlussrechnung (E12) | Posten (v1, sounds like Position), Befund, Finding, "Claim" |
| "zusätzlich verrechenbar" | finds done, proven, not invoiced | jetzt verrechenbar (v1), offen verrechenbar (website) |
| "in Klärung" with "Beleg fehlt" and "Nachtrag nicht gelegt" | finds that need a signature, a report or a priced Nachtrag first | angemeldet und offen, angemeldet, Beleg fehlt noch (v1) |
| "Stunden ohne Regiebericht" | hours known only from a WhatsApp-Meldung | Regie aus WhatsApp-Meldung (v1) |
| "Pauschale laut Vertrag" | a find a contract item may cover; a human decides | verloren |
| "Nicht verrechnen" | human decision with reason | verloren |
| "Rechtsfrage" | note without amount, for the Geschäftsführung (E11) | Braucht Anwalt (v1), Forcierung, Behinderung as our verdict, verfristet, präkludiert |
| "Vorprüfung", "Kürzungsrisiko", "schon gekürzt", "Abhilfe" | the check like the Auftraggeber's | Audit, GU-Check |
| "Abzug ohne Vertragspunkt" | a deduction the Vertrag does not name | unzulässig, rechtswidrig |
| "Rechnungsabschluss", "Restforderung" | from work value to the amount still owed (E11) | Prüfkaskade, Saldo |
| "Änderungsliste" | new and changed lines for the own invoicing system | zweite Rechnung |
| "Beweispaket" | calculation and Belege per find | Akte, Dossier |
| "Schlussbesprechungs-Blatt", "Forderung", "Untergrenze", "Spielraum" | the sheet for the final meeting | "Claim", Verhandlungsmasse |
| "Prüfung", "Freigabe" | the two release steps | Approval |
| "maschinell gelesen", "bestätigt", "korrigiert" | review state of a field | KI-Vorschlag, Confidence |
| "Verlauf" | append-only history | Log |
| "Abschluss-Lauf", "Ordner lesen", "Abgleich", "Vorprüfung", "Entwurf", "Ausgaben" | the run and its steps | Pipeline, Workflow |
| "Abläufe", "Lauf", "Läufe", "Block" | the canvas and its runs (section 5.2) | Automation, Workflow |
| "aus Ordner importiert" | where a system's data came from in stage 0 | verbunden, synchronisiert |
| "Schlussrechnung legen bis" | deadline as a plain date | fällig, Countdown, Frist läuft ab |
| "Beispieldaten" | synthetic marker | Demo, Fake |

Known gap closed in this step: `docs/Demo_Faelle.md` called the amount on the final meeting sheet by the forbidden word; it now says "Forderung" (wording only, amounts unchanged).

## 7. Demo case

### 7.1 New demo data (step 0c)

The demo data of solution list v2 are rebuilt before the core is ported (step 0c, its own chat). **Done on 23.10.2026:** solution list v3 in `Demo_Faelle.md` follows these rules, recomputed by `docs/demo_faelle_check.mjs`, independently checked, accepted by Maxi S. Rules:

1. **Names:** short, professional, clearly fictitious. The business gets a short name (two or three words, no "(fiktiv)" in the name; the marker "Beispieldaten" carries that). Projects are named by building type and a fictitious place, with a two-word short name for the UI; no district numbers. Every name is checked against the Austrian company register and the web; an Auftraggeber must never resemble a real company, because the demo shows it cutting invoices.
2. **Fewer things:** 5 projects instead of 8 (the main project, two ongoing ones, two closed ones that feed the Auftraggeber history), at most 8 finds and 1 Rechtsfrage in the main project, 2 to 3 Vorprüfung positions, one "Abzug ohne Vertragspunkt". The main project has one event of each kind the website timeline shows (WhatsApp, Stunden, E-Mail, Stunden ohne Unterschrift, Plan, Foto), in HKLS.
3. **Realistic amounts:** every single amount as a construction professional would expect it (rates, unit prices, hours, accessories such as valves and thermostats with a radiator). "Zusätzlich verrechenbar" in the main project lies between 1,5 % and 2,5 % of its contract sum; a find below what a Check costs makes the demo argue against buying.
4. **Rules from the customer test:** the Untergrenze uses the Mittellohnkosten, not the Mittellohnpreis (assumption until the insider confirms); the new figures "davon mit Kürzungsrisiko" (E13) and "Restforderung laut Vertrag" (E14) are part of the list; one ongoing project shows the "Lauf je Abschlagsrechnung" with a WhatsApp-Meldung that becomes a signed Regiebericht within days.
5. **Website:** decided by Maxi S. on 23.10.2026 after a side by side comparison: the website keeps its own example (Wien 21, electrical, by Maxi D.), and the app's demo data do not need to match it. The website is consistent in itself and easier to read for a lay audience. Word proposals for Maxi D. are in `Demo_Faelle.md`, section "Website".
6. **Check:** every amount recomputed by script and by an independent checker, claim by claim; the list changes only with a go from Maxi S.

### 7.2 Which screen shows which amount (solution list v3)

| Screen | Amount | Source in `Demo_Faelle.md` |
|---|---|---|
| Start | "zusätzlich verrechenbar" 22.632,96 €, below it "davon mit Kürzungsrisiko" 6.843,00 €; "in Klärung" 8.319,19 € (Beleg fehlt 1.365,59 €, Nachtrag nicht gelegt 6.953,60 €) | company figures |
| Projekte | per project "zusätzlich verrechenbar" and "in Klärung": Wohnpark Mooshaim 14.620,15 € and 8.073,59 €, Bürohaus Kiefernau 4.852,73 € and 0,00 €, Volksschule Ahornbrunn 3.160,08 € and 245,60 €; Wohnhof Erlenhain and Pflegeheim Eibenau closed; status colours | the other four projects |
| Projekt Wohnpark Mooshaim | 14.620,15 € (davon mit Kürzungsrisiko 6.843,00 €); 8.073,59 € (1.119,99 € and 6.953,60 €); Vorprüfung 8.619,00 € | "zusätzlich verrechenbar", "in Klärung", Vorprüfung |
| Positionen | 22.04.12B 4.009,60 €, 22.05.03A 347,20 €, 22.05.06A 540,40 €, 22.03.02A 1.751,40 €, 24.02.05A 3.326,40 €, 24.08.02A 2.032,80 €, rows for Regiebericht 9 and 15; the rows of F6 to F8 with their Belegstand | position table extract |
| Fund F1 | 4 positions, 6.648,60 €; K7 check 1,10 h × 58,60 € = 64,46 € + 221,94 € = 286,40 € | "zusätzlich verrechenbar" |
| WhatsApp-Meldung 08.09. | F7 476,00 € (4 h × 64,80 € + 4 h × 54,20 €) | "in Klärung" |
| Vorprüfung | G1 6.648,60 €, G2 194,40 € (droht); G3 1.776,00 € (schon gekürzt); total 8.619,00 € | Vorprüfung |
| Schlussrechnung | 766.934,95 € → Nachlass 23.008,05 € → Baustrom und Bauwasser 4.463,56 € → Bauschadensumlage 3.719,63 € ("Abzug ohne Vertragspunkt") → Haftrücklass 22.072,31 € → Zahlungen 624.396,99 € → Restforderung 89.274,41 €; Restforderung laut Vertrag 92.882,45 € | Rechnungsabschluss |
| Schlussbesprechungs-Blatt | Forderung 22.693,74 €, Untergrenze 20.723,80 €, Spielraum 1.969,94 € | Schlussbesprechungs-Blatt |
| Auftraggeber Hornfeld Bau | Wohnhof Erlenhain: "Aufmaß nicht gegengezeichnet" 2.575,20 €, Bauschadensumlage 3.305,55 € | Auftraggeber history |
| Bürohaus Kiefernau | P2-F1 809,13 €: WhatsApp-Meldung of 24.09.2026, Regiebericht 6 signed 02.10.2026 ("Lauf je Abschlagsrechnung") | P2 |
| Berichte | "nur außerhalb ERP" 15.507,36 € of "zusätzlich verrechenbar" (7 of 10 finds) and all of "in Klärung" (4 of 4) | company figures |

### 7.3 The three-minute click path (solution list v3)

| Time | Step | Screen and click | What the viewer understands |
|---|---|---|---|
| 0:00 | Ergebnis first | "Start": 22.632,96 € zusätzlich verrechenbar; Wohnpark Mooshaim red, "Schlussrechnung legen bis 30.10.2026"; click Wohnpark Mooshaim | money is open, and the deadline is close |
| 0:20 | Ihre Daten | step bar, tab "Zeitstrahl": WhatsApp-Meldung 08.09.2026, 14:30, Heizkörper Top 9 versetzt, instructed by the Polier of Hornfeld Bau, photo and transcript; lane "Schlussrechnung": "fehlt", "gefunden", F7 476,00 €, "Beleg fehlt", task "Regiebericht schreiben und vom Polier unterschreiben lassen" | what was said on site is now in the twin |
| 0:50 | Digitaler Zwilling | tab "Positionen": 22.04.12B beauftragt 86, erbracht 100, verrechnet 86, offen 4.009,60 €; click the row | ordered, done and invoiced side by side, per position |
| 1:10 | Ergebnis | Fund F1: Rechenweg over 4 positions, 6.648,60 €; Belege Plan H-201 Index C → D, E-Mail "bitte gleich mitmachen", Foto, Aufmaßblatt 12, WhatsApp-Meldung; original on the right; highlight "Kürzungsrisiko: Aufmaß nicht gegengezeichnet" | every number leads to its original, and the weak spot is named |
| 1:40 | Ergebnis | "Vorprüfung": 3 positions, 8.619,00 €, of which 1.776,00 € already cut; G1 remedy "Plan H-201 Index D und die E-Mail vom 07.04. beilegen, gemeinsames Aufmaß vereinbaren" | the Auftraggeber checks with software; check first |
| 2:05 | Ergebnis | "Schlussrechnung": Änderungsliste, Rechnungsabschluss to 89.274,41 €, next to it "Restforderung laut Vertrag" 92.882,45 €; Bauschadensumlage 3.719,63 € "Abzug ohne Vertragspunkt"; note "Rechtsfrage" | a complete, checked result; a human releases every line |
| 2:35 | Digitaler Zwilling, Ebene 1 | "Auftraggeber" Hornfeld Bau: "Gleicher Grund bei diesem Auftraggeber schon im Wohnhof Erlenhain"; Excel export of the Änderungsliste, marked "Entwurf, nicht freigegeben" | the twin remembers every project |

## 8. v1 calculation core: port, rewrite or drop

Measured in tag `v1-archiv`: 15 files in `product/app/src/engine` (1.945 lines without tests, of which 93 lines test data), 7 test files with 114 test blocks, 4 of them parametrised (the plan speaks of 135 tests against the solution list; the tests were not run in this step), data model `product/app/src/domain/typen.ts` (469 lines), demo generator `product/app/src/demo` (2.169 lines).

**Decision: port the calculation, rewrite the cut.** The rules are the only part checked to the cent against the solution list; the object names and entry points follow the objects of this specification.

| Module | What it does | Decision | Reason |
|---|---|---|---|
| `geld.ts` | cents, basis points, commercial rounding per line, formatting | port unchanged | uses only type aliases from the data model (`Cent`, `Bp`, `Einheit`), tested |
| `domain/typen.ts` | data model with field, source and review state | rewrite | new objects (Beleg, Position, Fund, WhatsApp-Meldung, Verlauf); keep the field with source; a correction must keep the old value |
| `kontext.ts` | lookup tables (Aufmaß, invoiced per position, boundary of the last Abschlagsrechnung) | port, adapt | pure helpers |
| `befunde.ts` | rules: Mehrmengen and "erbracht, nicht verrechnet", Regie, hours from messages, Preisumrechnung, notified changes, notes for a lawyer | port, rename Befund → find | produces lists 1 and 2 of solution list v2, tested; a find may now cover several positions (F1), and Regie material carries the surcharge of the Vertrag |
| `ledger.ts` | one row per position (`baueLedger`) and the import state: duplicates, plan indices, corrected fields (`importStand`) | rewrite `baueLedger` as the position table; port `importStand` to "Ordner lesen" | the table needs rows without a position, "offen" in € and the Belegstand; the import state feeds section 1.5 |
| `vorpruefung.ts` | pre-check and 20 % notes | port, add "invoiced above the Aufmaß" | tested against solution list v2 |
| `kaskade.ts` | cascade down to the Restforderung | port, change the input to the finds that are not set to "Nicht verrechnen", add "Restforderung laut Vertrag" | section 5; tested against solution list v2 |
| `schlussbesprechung.ts` | Forderung and Untergrenze per find | port | tested |
| `belegquelle.ts` | source of the evidence, "nur außerhalb ERP" | port, report per money word | tested directly against the solution list |
| `firma.ts` | status colour, money split, company totals | port, rename the money words (E1), add "davon mit Kürzungsrisiko" (E13) | tested against solution list v2 |
| `historie.ts` | Auftraggeber history, "same reason already in" a closed project | port | tested; in v3 the bridge is "schon im Wohnhof Erlenhain" |
| `abrechnung.ts` | settlement of paid final invoices (v2: two closed projects) | port | feeds the settlement view of Wohnhof Erlenhain and Pflegeheim Eibenau |
| `pruefe.ts`, `index.ts`, engine `typen.ts` | entry points and result types | rewrite | one function per object of this specification |
| `testdaten.ts` and the 7 test files | small fixtures and the tests against the solution list | port with their modules | the solution list stays the yardstick |
| demo generator | synthetic company and Wien 21 with target sums | port the mechanics, rewrite the data for solution list v3 | the tests depend on it; the v1 data review found filler and inconsistencies (lump-sum items, Abschlagsrechnung 1 before the first Aufmaß), which v3 avoids |

All tests are rewritten against solution list v3; the amounts in `_STATUS.md` stay unless Maxi S. gives a go. Build step 2 ports in this order: money, data model, rules, position table, pre-check, cascade, business level; each with its tests before the next.

## 9. Open questions for the construction insider

1. F7 (hours only from a WhatsApp-Meldung): Regiesatz (476,00 €) or a floor from the Mittellohnkosten (366,40 €)?
2. Relocating a radiator, two men for four hours with draining and refilling: realistic? (Customer test 1 called six hours an upper bound.)
3. Is "der Polier von Hornfeld hat es angeschafft" enough to have a Regiebericht signed afterwards, and does the Polier have the authority to instruct?
4. Ongoing projects: is "work date before the last Abschlagsrechnung" the right boundary for "forgotten"?
5. Einheitspreis and installation time of 22.04.12B (286,40 €, 1,10 h), the K3 split (Mittellohnkosten 45,80 €/h, Mittellohnpreis 58,60 €/h), the 20 % rule, short texts of the positions; solution list v3 gives the radiators their own Thermostatkopf, Anschlussarmatur and Anbindeleitung positions: is that how a Leistungsverzeichnis does it?
6. "Erbracht" replaces the website's "gebaut" (E10): do the Abrechnung and the Bauleitung use it for quantities and hours alike?
7. In a business of 40 to 100 people, who gives the second release: Geschäftsführung, Bauleitung or the head of Abrechnung?
8. Which output does the Abrechnung need first: Änderungsliste as Excel, ÖNORM A 2063 data carrier, PDF? Which ERP and AVA do they use?
9. **Untergrenze:** solution list v3 computes it with the Mittellohnkosten and material at Einstandspreis, as customer test 1 proposed (the Mittellohnpreis already contains the overall surcharge). Is that right, and is the floor how businesses prepare the final meeting at all?
10. Does an AVA or ERP already flag Aufmaß above what was invoiced? (Customer test: yes, once the Aufmaß is entered; the gap is the Excel Aufmaß that is never entered.)
11. Do owners understand "Digitaler Zwilling" (website, also "Firmenwissen"), or is "Abgleich je Position" or "Wissen des Betriebs" clearer?
12. Nachträge: solution list v3 prices a notified change on the Preisbasis of the Vertrag (F8: Mittellohnpreis plus the material surcharge of the own calculation). Is that right?
13. Does the Nachlass of the Vertrag also apply to Regie and to the Preisumrechnung?
14. Which cut reasons does the Vorprüfung miss most? Candidates from the customer test: Regie for work already in the Leistungsverzeichnis, instruction by someone without authority, Regiebericht submitted too late.
15. Is a one-sided Aufmaß (not countersigned) "belegt" or "Beleg fehlt"? Today an unsigned Regiebericht is "Beleg fehlt" while F1 with an uncountersigned Aufmaßblatt is "belegt" with Kürzungsrisiko (E13).
16. Festpreise for an eight-month HKLS lot with a Generalunternehmer, Regiematerial at Einstandspreis plus 15 %, Abschlagsrechnungen once a quarter: usual?
17. Does a Generalunternehmer accept the Fotodokumentation Brandschutz as the basis of an Aufmaß (F5)?

## 10. Decisions

Taken on 23.10.2026: Maxi S. delegated the decisions to Claude with the guideline "what is best and strongest at the end, do not think small". The canvas (E4) follows his own call.

| # | Decision | Taken | Why |
|---|---|---|---|
| E1 | Money words | One word per amount: "zusätzlich verrechenbar" (list 1), "in Klärung" (list 2) with "Beleg fehlt" and "Nachtrag nicht gelegt", "Vorprüfung" with "schon gekürzt" and "droht". Replaces "jetzt verrechenbar", "angemeldet und offen", "angemeldet", "Beleg fehlt noch" (v1) and "offen verrechenbar" (website). The note "Der GU kann hier einen neuen Einheitspreis prüfen." names the Auftraggeber in the new data ("Hornfeld Bau kann hier einen neuen Einheitspreis prüfen.") | v1 and the website used three words for one amount; the website's 5.546 € total even mixes signed and unsigned work. "Angemeldet" was wrong for hours known only from a WhatsApp-Meldung, which have no Regiebericht. "Offen" is already a column |
| E2 | Navigation | Sidebar sections named exactly "Ihre Daten", "Digitaler Zwilling", "Ergebnis"; the project page shows the same three steps as its header bar | the app shows the three steps in this order and with these words on every screen |
| E3 | Start page | "Start" leads with the Ergebnis (money, next deadline, "Als Nächstes"), although the sidebar follows the website order | the billing clerk's day starts with what is open |
| E4 | Canvas | "Abläufe" as a canvas one to one as in Attio, with triggers, run steps, checks and tasks (section 5.2); no AI chat that builds workflows. Build step 9 stays full size | the business sees and sets how its invoices are checked, the check catalogue becomes visible, and "Lauf je Abschlagsrechnung" (E16) needs a place to live |
| E5 | Decisions and the result | The Rechnungsabschluss includes every "belegt" find not set to "Nicht verrechnen"; final outputs only once every find is decided | a human decides every line, and the solution list stays the reference |
| E6 | Release roles | "Prüfung" (Abrechnung), "Freigabe" (Geschäftsführung); the Bauleitung confirms site facts through a task on the phone | one clear job per customer role |
| E7 | WhatsApp word | "WhatsApp-Meldung" in the app; the website keeps its own words (section 7.1) | one word everywhere in the app |
| E8 | Demo access | The sample company opens without sign-in, marked "Beispieldaten"; sign-in only for real companies (build step 10) | customers and investors see the product in one click |
| E9 | Not in the app | Coding sheet (a) to (d), "Frag tieout", mail series, own photo app; ÖNORM and BMD export not before a real customer needs them | nothing for the three steps, internal measurement, or shown before it works |
| E10 | Column word | "Erbracht" instead of "gebaut" in the app; proposed to Maxi D. for the website | all three test customers stumbled ("Stunden baut man nicht"); the trade says "erbracht" for quantities and hours |
| E11 | Trade words | "Rechnungsabschluss" instead of "Prüfkaskade"; "Rechtsfrage" instead of "Braucht Anwalt" | the billing clerk did not know "Prüfkaskade" and would not show "Braucht Anwalt" to her boss |
| E12 | Central object | "Fund", plural "Funde", instead of "Posten" | all three confused "Posten" with "Position"; two of three said "Fund" on their own |
| E13 | Cut risk in the headline | Under "zusätzlich verrechenbar" the line "davon mit Kürzungsrisiko": the "droht" amounts of the Vorprüfung inside it (Wohnpark Mooshaim 6.843,00 €) | all three found that the largest find was also the largest cut risk; showing it builds trust instead of hiding it |
| E14 | Restforderung laut Vertrag | A second figure without deductions that have no contract item, next to the Restforderung after the Auftraggeber's deductions (Wohnpark Mooshaim 92.882,45 € next to 89.274,41 €) | the billing clerk deducts in her own invoice only what the Vertrag names |
| E15 | "nur außerhalb ERP" | Only in "Berichte", explained, not on "Start" | it measures a hypothesis rather than helping a decision |
| E16 | During construction | The run also starts at every Abschlagsrechnung for projects "in Ausführung", and every gap becomes a task for the Bauleitung at once ("Lauf je Abschlagsrechnung", section 5.2) | all three customers: the money is lost during construction, while the foreman is still on site to sign |

## 11. Content challenge (where the content is weak)

1. **Website and app show different examples.** Website: Wien 21, electrical (Steckdose, Leuchten), 5.546 € open; app: Wohnpark Mooshaim, HKLS. Decided on 23.10.2026: that is fine, both are marked as examples, and the website stays as Maxi D. built it (section 7.1). Wohnpark Mooshaim has one event of each kind the website shows, so the click path tells the same kind of story.
2. **Messages mostly prove, they rarely find.** In Wohnpark Mooshaim a message alone produces only F7 (476,00 €, "in Klärung"); the three other messages are evidence for F1, F2 and F3. F1, F4 and F5 come from comparing the Aufmaß with the Entwurf, and all three were missed because the Aufmaß was not in the AVA (Excel only, not countersigned, entered too late). For the product this means: "Kommunikation" makes finds hold up against the Auftraggeber's check more than it adds new ones, and the strongest messages are those that turn into a signed Regiebericht during construction (Bürohaus Kiefernau, P2-F1, 809,13 €). The forgotten Regie (F2 and F3) is the kind of find customer test 1 believed most.
3. **The Preisumrechnung was the largest line of v2 and is gone.** The billing clerk in the test warned that it normally runs with every Abschlagsrechnung. Wohnpark Mooshaim has Festpreise; the check stays in the catalogue for contracts with variable prices.
4. **Systems are files in stage 0.** "ERP" and "AVA" on the website are exports in the project folder, not connections. The app never shows "verbunden" for a system that is not connected.
5. **"Digitaler Zwilling" was not understood** by any of the three test customers (two thought of a 3D building model). Kept as the name of the middle step because the website uses it; inside the step the app speaks of "Betrieb", "Projekt", "Position", and one line under the step name says what it is: "Ihr Betrieb und jedes Projekt, Position für Position" (question 11).
6. **The Schlussbesprechungs-Blatt left almost no Spielraum in v2.** Solution list v3 computes the floor with the Mittellohnkosten and material at Einstandspreis: Spielraum 1.969,94 € on 22.693,74 €. Mehrmengen still have no floor below the contract price (question 9). The sheet stays an output after the Schlussrechnung, never the first screen.
7. **After the Schlussrechnung.** The billing clerk said most money is lost when the Auftraggeber's check comes back. Answering cuts is outside this specification (tieout gives no legal assessments); the signal is recorded, not proposed.

## 12. Kundentest

**This test ran on solution list v2 (Wien 21); the amounts and IDs in this section are those of v2 and are kept as the record of the test.**

**Setup (23.10.2026).** Three fresh subagents, each given only `README.md` and the first version of this file and the task "Lies die Spezifikation. Würdest du das kaufen? Was ist unverständlich?": an Abrechnerin (20 years, distrusts software), a Geschäftsführer (pays, five minutes) and a Bauleiter (knows the site, explains it to his fitters). In parallel an independent fact checker compared every claim with the sources. Subagents are not real customers: they find what is unclear, illogical or wrong, not real willingness to pay. The willingness-to-pay verdicts are in the internal report.

**Result: passed.** All three described the three steps correctly in their own words, named "zusätzlich verrechenbar" 27.410,00 € as the main amount and its parts, and gave the benefit in one sentence. None called it a gamechanger yet.

| Role | Benefit in one sentence (shortened) | Gamechanger | Stuck most at |
|---|---|---|---|
| Abrechnerin | compares Aufmaß and Regie against our draft and says where the GU will cut | not yet: needs proof on real data and help during construction | rules that do not survive her recalculation (Mehrmengen, Untergrenze, deduction in the own invoice) |
| Geschäftsführer | goes through the whole project folder before the final invoice and tells us what we forgot and what the GU will cut | not yet: needs proof against his own AVA and a result inside his ERP | internal language at the start; Restforderung read as the find |
| Bauleiter | send a photo and a voice message when the foreman orders extra work, then it gets paid | not yet: money is lost during construction; the fitters' side is missing | "Digitaler Zwilling", "gebaut" for hours, monitoring of fitters |

**Findings, re-measured against this file and the sources, and what happened:**

| Finding | From | Re-measured | Action |
|---|---|---|---|
| Restforderung read as tieout's find | GF, BL | yes, first table of section 0 | section 0: main amount named, Restforderung explained |
| Benefit and who does the work only at the end | GF | yes | section 0: benefit sentence, who does the work, "tieout never" |
| Mehrmengen rule required Aufmaß above the Leistungsverzeichnis | AR | yes; `Demo_Faelle.md` also has "erbracht, nicht verrechnet" (P2-J3) | fixed in 3.1, Art added |
| No check for invoiced above the Aufmaß | AR, BL | yes; the fixed reason list already has "Menge ohne Aufmaß-Nachweis" | added to the Vorprüfung, data check in build step 2 |
| Bauschadensumlage deducted in the own Restforderung | AR, GF, BL | yes, cascade in `Demo_Faelle.md` | 3.4 explains it as the Auftraggeber's announced deduction; E14 |
| J1 is both the largest find and the largest cut risk | AR, GF, BL | yes, G1 = J1 | shown on the find; E13; question 15 |
| "schon gekürzt" mixed into the risk | AR | yes, G3 and G4 already cut in Abschlagsrechnung 3 | split in 3.1, 3.3, 7.1 |
| Untergrenze uses the Mittellohnpreis, Spielraum 333,00 € | AR, BL, GF | yes, rule in `Demo_Faelle.md` | question 9, content challenge 6; amounts unchanged |
| Forderung adds list 1 and list 2 against the rule | BL, fact check | yes | 3.3: named as the one exception |
| Regie row "18 h, 1.311,40 €" not traceable | AR, BL | yes, 186,40 € material | 2.3 shows hours by role and material |
| Payments, Deckungsrücklass, Haftrücklass guarantee, Skonto, tax missing | AR | partly: payments are after Deckungsrücklass in the source; guarantee in the source; no Skonto in the demo Vertrag | 2.2 Vertrag fields, 3.4 |
| Preisumrechnung "× index" | AR | yes, it is × the index change (3,8 %) | fixed in 3.1 |
| Output should be a change list, not a second invoice | AR, GF | yes, matches "tieout never replaces the ERP" | "Änderungsliste" as main output (3.3) |
| Who builds the folder, effort, data location, who sees the K7 | all three | yes, not in the first version | 1.1, 1.4; effort measured with the first real projects |
| Fitters' side missing; hours per person; Stundenzettel as control | BL | yes | 1.3 |
| WhatsApp-Meldung lacks who instructed it and why | BL | yes; the agent already asks "Who instructed this?" (dossier) | fields in 1.2, 2.3 |
| V1 "Nicht verrechnen" is a contract reading against the business | AR, fact check | yes | 3.2: fact only, no proposal |
| Money lost during construction, not at the end | all three | yes; the ongoing-project rule already exists | 5 and E16 |
| "Posten" and "Position" confused; "Digitaler Zwilling" and "gebaut" not understood | all three | yes | E10, E12, question 11 |
| "Prüfkaskade" unknown, "Braucht Anwalt" not presentable | AR | yes | E11 |
| "nur außerhalb ERP" unclear on Start | AR, GF | yes | E15 |
| Search must accept "LV", "AR 3", "RB 11" | AR | yes | 4.1 |
| Fact check: 32 points (wrong section references, "six" checks, largest line, v1 module reasons for `abrechnung.ts`, `ledger.ts`, `geld.ts`, `belegquelle.ts`, missing Attio elements, missing "fehlt", demo default state, quote of the 20 % note, strategy wording) | fact check | each re-measured against the source or the v1 code | all fixed in this version; the quote is restored and the wording change is part of E1 |
| Help after the Schlussrechnung (answering the Auftraggeber's cuts) | AR | yes | recorded in 11.7, not proposed (decided earlier) |
| README calls it a hackathon project | GF | yes | README changed on 23.10.2026: the hackathon has ended, the product is in development |

The full report with all three answers is kept in the private repository.
