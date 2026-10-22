# Inspiration: product patterns from reebuild and Kuro

As of: 22.10.2026. **Viewed ourselves** in the browser (product images on the websites, no demo access). Adopt patterns only, not colours, logos or texts. The images are not stored in the project (copyright); the links below lead to the pages.

## reebuild (general contractor (GU) / property developer (Bauträger) side, Vienna)

| # | View | What you see | Source |
|---|---|---|---|
| R-A | **Content review** of a subcontractor (NU) invoice | Cascade from top to bottom: invoiced work value → reviewed work value → discount (Nachlass) → work-reducing deductions (site power + water, construction damage) → retentions (performance retention (Deckungsrücklass), delay) → amount to be paid out → early payment discount (Skonto). Every line with % rate, amount and contract comparison: green "laut Vertrag 4,00 %" (per contract 4,00 %) or orange "Abweichung – laut Vertrag: nicht vorhanden" (deviation, per contract: not present) | [reebuild.com/projektentwickler](https://www.reebuild.com/projektentwickler) (image "Nachunternehmer") |
| R-B | **Invoice review** | On the left, preview of the original PDF with document selection (current document, contract documents: construction contract, earlier partial invoices). On the right, assignment (order, document type) and "Ausgelesene Positionen" (extracted positions): pos. no. (e.g. 07.02.01.H), description, assignment with tick, "8 Einträge" (8 entries) | reebuild.com/projektentwickler (image "Rechnungsprüfung") |
| R-C | **Project overview** | Project switcher at the top, tabs Overview / Information / Documents / Orders. Three KPI cards with a small uppercase label, large amount, one context line ("20 % über Projektkosten Soll" (20 % above target project costs) with a red bar). Below it a step line actual versus target (dashed) | reebuild.com/projektentwickler (hero) |
| R-D | **AI data reconciliation** (inbox) | Tabs with counters: All assignments 1 / My departments 1 / For me 1. Table "Analyse läuft" (analysis running) with date received, due date, document type, number | [reebuild.com/bauunternehmen](https://www.reebuild.com/bauunternehmen) (hero) |
| R-E | **Approval workflow** | Numbered steps (technical review → contractual review → management → accounting) with responsible person, pill "in Freigabe" (in approval); "Freigabe Bauleiter: von X freigegeben" (site manager approval: approved by X) with tick | reebuild.com/projektentwickler, [reebuild.com](https://www.reebuild.com) |

**Look:** white cards on light grey, dark green accent, rounded corners, lots of white space, sans-serif font.

## Kuro (GU side, Berlin)

| # | View | What you see | Source |
|---|---|---|---|
| K-A | **References with original** ("Risiken erkennen", detect risks) | On the left, the answer: "3 Fundstellen in 2 Dokumenten, 1 Widerspruch erkannt" (3 references in 2 documents, 1 contradiction detected), every statement with a chip "Leistungsbeschreibung_GU.pdf, S. 14" and the mark "Widerspruch" (contradiction). On the right, the document viewer: file name, "S. 14 / 86" (p. 14 / 86), highlighted text passage, sidebar with thumbnails, active page outlined | [kuro.technology/platform](https://www.kuro.technology/platform), tab "Risiken erkennen" |
| K-B | **Upload history** ("Änderungen verstehen", understand changes) | "Upload vom 06. Sep. 2026, 14:18: 832 neue und 102 aktualisierte Dokumente, 164 Duplikate bereinigt" (upload of 06 Sep 2026, 14:18: 832 new and 102 updated documents, 164 duplicates removed). Two columns "Bestehender Stand" (existing state) and "Neuer Upload" (new upload), lines connect old and new version. Status chips: Approved, Being assigned, Review, New, Duplicate removed. Under each file name, revision and page count. Timeline of all uploads | kuro.technology/platform, tab "Änderungen verstehen" |
| K-C | **Keyword search** | "990 Treffer in 361 Dokumenten" (990 hits in 361 documents), filter chips, hit list with document type marks and hit count, viewer on the right | Tab "Dokumente durchsuchen" |
| K-D | **Room book** | "224 Komponenten erkannt" (224 components detected), categories with progress "2 von 7" (2 of 7), plan with highlighted room | Tab "Schnellere Arbeitsergebnisse" |

**Look:** almost only black, white, warm grey, plus a signal orange for "look here". Small uppercase labels, square corners. The product interface itself is plain white.

## What Schlusswerk makes of it

| Pattern | Our version | Screen |
|---|---|---|
| K-A References with original | **Evidence panel:** finding on the left with chain of evidence (plan, mail, measurement (Aufmaß), photo, calculation), each line a chip "File, p. x". On the right, the original with highlighted passage and sidebar | Finding detail |
| R-A Review cascade with contract comparison | **Pre-check from the GU perspective (Vorprüfung aus GU-Sicht):** the same cascade on our own final invoice (Schlussrechnung). Every deduction "laut Vertrag" (per contract) or "nicht im Vertrag gefunden" (not found in contract). Plus the positions the GU would cut, with the missing evidence | Pre-check |
| K-B Upload history | **Folder import:** "165 Dokumente, 3 Planindizes, 12 Duplikate bereinigt" (165 documents, 3 plan indices, 12 duplicates removed); versions C → D → E connected; status per document | Folder |
| R-C KPI cards | **Cockpit:** three cards billable now / notified and open / lost, each with number of items | Cockpit |
| R-B Extracted positions | **Ledger:** bill of quantities (LV) position, LV quantity, measurement, invoiced, paid, difference, assignment | Ledger |
| K-D "x of y" | Progress per work group (Leistungsgruppe) and "9 von 14 Posten freigegeben" (9 of 14 items approved) | Cockpit, Ledger |
| R-E Approval | Every item: accept / discard / needs a lawyer. Approval by the human, with name and time | Finding detail |
| Summary sentence (K-A, K-B) | Every view begins with a sentence with figures: "12 Posten aus 165 Dokumenten" (12 items from 165 documents) | everywhere |

**Do not adopt:**
- AI chat as the entry point (K-A is built as a chat; for us, the finding is the entry point, not a question). Dossier 8.4.
- Real-time cost history (R-C): live operation has been rejected (Dossier 12).
- Kuro orange and reebuild green: we need our own recognisability.
