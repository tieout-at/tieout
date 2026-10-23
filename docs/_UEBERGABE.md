# Handover: step 0c, Demo-Daten neu

**As of:** Friday, 23 October 2026, night, after step 0b. Written by Claude for Maxi S.
**Folder:** open `C:\Users\maxis\dev\tieout` as the project in Claude Code. Strategy next to it in `../tieout-intern` (read only).

## Goal

A new solution list `docs/Demo_Faelle.md` (v3) that follows `docs/SPEZIFIKATION.md` section 7.1: short professional names, fewer things, realistic amounts, the same story as the website. Then the examples in the specification are switched to it, and the website change is prepared. No app code in this step. The list is the yardstick for the core (step 2), so every cent is recomputed and independently checked before Maxi S. gives the go.

## Read first

1. `CLAUDE.md`, `docs/_STATUS.md`, this file.
2. `docs/SPEZIFIKATION.md`: 7.1 (rules for the new data), 3 (Ergebnis and its rules), 5.2 (Abläufe, "Lauf je Abschlagsrechnung"), 9 (questions for the insider), 10 (decisions), 12 (customer test).
3. `docs/Demo_Faelle.md` (v2): keep its structure (lists, Vorprüfung, Rechnungsabschluss with payments per Abschlagsrechnung, Schlussbesprechungs-Blatt, evidence source, other projects, Auftraggeber history, WhatsApp scene, insider questions), replace names and amounts.
4. `website/messages/de.json`, keys `solution.timeline` and `solution.flow.projectData`: the six events and the Ebene 2 table the main project must match.
5. `../tieout-intern/docs/kundentests/2026-10-23_kundentest-1_spezifikation.md`: what the test customers found unrealistic (radiator accessories, hours for relocating a radiator, floor rule, one-sided Aufmaß).
6. v1 generator under tag `v1-archiv` (`product/app/src/demo`), only to see which inputs the core needs per project.

## Steps

1. **Names.** Propose three options each for the business, the Auftraggeber and the five projects (with a two-word short name), check each against the Austrian company register and the web, and let Maxi S. pick. An Auftraggeber must never resemble a real company.
2. **Main project.** Contract sum, Leistungsverzeichnis, the six website events in HKLS (4 not invoiced, 2 invoiced), at most 8 finds and 1 Rechtsfrage, 2 to 3 Vorprüfung positions (one already cut), one "Abzug ohne Vertragspunkt", Rechnungsabschluss with payments, "davon mit Kürzungsrisiko" (E13), "Restforderung laut Vertrag" (E14), Schlussbesprechungs-Blatt with the floor from the Mittellohnkosten. "Zusätzlich verrechenbar" between 1,5 % and 2,5 % of the contract sum.
3. **Other projects.** Two ongoing (one shows "Lauf je Abschlagsrechnung": a WhatsApp-Meldung that becomes a signed Regiebericht within days), two closed ones that feed the Auftraggeber history.
4. **Check.** Every amount by script in integer cents with the check written into the file; then one independent checker, claim by claim; re-measure its findings; Maxi S. gives the go.
5. **Follow-up.** Switch the examples in `SPEZIFIKATION.md` (sections 0, 1.5, 2, 3, 7) to the new list, with the amount audit (every amount in the specification is in the list). Prepare the website texts (`website/messages/de.json` and `en.json`) on their own branch; nothing goes live without a go.

## Done when

- `Demo_Faelle.md` v3 recomputed, independently checked, accepted by Maxi S.
- `SPEZIFIKATION.md` uses the new names and amounts; amount audit clean.
- Website change prepared as its own pull request, not deployed.
- `_STATUS.md` updated (new protected amounts), this file rewritten for step 1 (Hülle; the step 1 brief written after step 0b is in commit `a055666`), pull request merged with Maxi S.'s go.

## Start prompt for the next chat (copy into a new chat in `C:\Users\maxis\dev\tieout`)

> Ich bin Maxi S. Schritt 0c, Demo-Daten neu. Lies `CLAUDE.md` und `docs/_UEBERGABE.md` und mach Schritt 0c: neue Lösungsliste `docs/Demo_Faelle.md` nach `SPEZIFIKATION.md` Abschnitt 7.1, mit kurzen professionellen Namen (zeig mir je drei Vorschläge), weniger Funden, realistischen Beträgen und derselben Geschichte wie die Website. Jeder Cent per Skript und von einem unabhängigen Prüfer geprüft. Sag mir vor jedem Teil in zwei Sätzen, was passiert, und hol dir mein Go vor dem Push und bevor die Website etwas Neues zeigt. Deutsch, einfach, Ergebnis zuerst.
