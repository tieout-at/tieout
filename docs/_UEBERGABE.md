# Handover: step 0b, Inhalt neu

**As of:** Friday, 23 October 2026, late evening, after step 0. Written by Claude for Maxi S.
**Folder:** open `C:\Users\maxis\dev\tieout` as the project in Claude Code. Strategy next to it in `../tieout-intern` (read only).

## Goal

`docs/SPEZIFIKATION.md`, written from zero: what v2 shows and calculates, built strictly along the three steps of the website section 03, **Ihre Daten → Digitaler Zwilling → Ergebnis**, with these words and in this order. Then a first customer test on the specification with three subagents. No app code in this step, no change to amounts.

## Read first

1. `CLAUDE.md`, `docs/_STATUS.md`, this file.
2. `../tieout-intern/docs/Plan_Neustart.md`: Attio inventory and measurements, the Attio to tieout translation table, the customer tests (with the price points for "würde zahlen").
3. `../tieout-intern/docs/dossier-v3.md`, sections 0, 3, 12 and 15.
4. The yardstick: `website/messages/de.json`, key `solution` (section 02 Problem and section 03 Lösung with the three steps, their groups and items); live at https://tieout-at.pages.dev. Section 02 shows the site timeline (WhatsApp, Stunden, E-Mail, Plan, Foto) against the final invoice with "fehlt" and "verrechnet".
5. `docs/Demo_Faelle.md`: solution list and all demo amounts.
6. v1 as reference, not as template: https://app.tieout.workers.dev, code under the tag `v1-archiv` (`product/app/src/engine`, `product/app/src/domain`).
7. Attio: screen recording `../_vorlagen/Attio.mp4` (318 MB) and Maxi S.'s Attio workspace (logged in in his Edge, readable with Claude in Chrome; link in the plan).

## What the specification contains

1. **Ihre Daten.** Systeme (ERP-Rechnungen, AVA-Preise), Dokumente (Pläne mit Index, Leistungsverzeichnis, Aufmaß, Stundenzettel), Kommunikation (E-Mail-Anweisungen, WhatsApp-Meldungen, Fotos, Sprachnachrichten). For each: which object it becomes, how it comes in (stage 0: a project folder is imported), what the user sees of it.
2. **Digitaler Zwilling.** Ebene 1 Betrieb (Auftraggeber, Verträge, Preisbasis, Projekte) and Ebene 2 Projekt (Leistungen je Position: beauftragt, gebaut, verrechnet, offen). Objects with their fields, source, review state and history, described in words, not code.
3. **Ergebnis.** The Schlussrechnung: vergessene Stunden gefunden, Mehrmengen erkannt, Planänderungen eingerechnet, vorab geprüft wie vom Auftraggeber, zu jeder Position ein Beleg, zusätzlich verrechenbar. Plus the outputs of dossier v3 section 3.6 that survive the challenge.
4. **Screens.** One line per Attio element of the translation table: what it contributes to Daten, Zwilling or Ergebnis. Nothing contributed: out (for example Sequences). Missing: added (position table beauftragt, gebaut, verrechnet, offen; timeline; Schlussrechnung with fehlt and verrechnet). Never less understandable than the website.
5. **Abschluss-Lauf.** Ordner lesen → Abgleich → Vorprüfung → Entwurf → Ausgaben, each with input, output and who confirms.
6. **Vocabulary.** One table: German UI word, meaning, words we never use instead. Known gap: `docs/Demo_Faelle.md` still calls the amount on the final meeting sheet "claim" (section "Final meeting sheet"); replace it with the agreed German term, wording only, amounts unchanged.
7. **Demo case Wien 21.** Which screen shows which amount from `Demo_Faelle.md`; the three-minute click path.
8. **v1 calculation core.** Per module of `product/app/src/engine` (tag `v1-archiv`): port, rewrite or drop, with the reason. The amounts in `_STATUS.md` stay unless Maxi S. gives a go.
9. **Open questions for the construction insider,** marked as such (no `PLATZHALTER` in this public file).

Mocks are optional (low fidelity, for example one board per screen) and only if Maxi S. wants them; the first customer test runs on the text.

## First customer test

Three fresh subagents, started separately, without our context. Each gets only `README.md`, `docs/SPEZIFIKATION.md` and the task: "Lies die Spezifikation. Würdest du das kaufen? Was ist unverständlich?"

- **Abrechnerin:** writes the final invoice, 20 years of experience, distrusts software.
- **Geschäftsführer:** pays, wants to see the benefit in five minutes.
- **Bauleiter:** knows the site, checks whether the Posten are right and whether he can explain them to his fitters.

Verdicts with evidence (what was read, where they got stuck): **verstanden** (in their own words: what tieout does, what the amount is), **würde zahlen** (price points from the plan in `../tieout-intern`), **Gamechanger oder nicht** (what is missing, concretely). "Genutzt" starts with the clickable app after step 5. **Passed when** all three understand the three steps and name the benefit in one sentence. The main chat re-checks every finding against the specification before acting on it. The full report with price verdicts goes to `../tieout-intern/docs/kundentests/`; findings without prices go into a section "Kundentest" in `SPEZIFIKATION.md`.

## Done when

- `docs/SPEZIFIKATION.md` covers points 1 to 9 and was accepted by Maxi S.
- Customer test run, passed, findings worked in or listed as open.
- `_STATUS.md` updated, this file rewritten for step 1 (Hülle), pull request merged with Maxi S.'s go.

## Start prompt for the next chat (copy into a new chat in `C:\Users\maxis\dev\tieout`)

> Ich bin Maxi S. Schritt 0b, Inhalt neu. Lies `CLAUDE.md` und `docs/_UEBERGABE.md` und mach Schritt 0b: `docs/SPEZIFIKATION.md` von null entlang der drei Stufen der Website-Sektion 03 (Ihre Daten, Digitaler Zwilling, Ergebnis), jedes Attio-Element daran gemessen, Entscheidung zum alten Rechenkern, danach der erste Kundentest mit drei Subagenten (Abrechnerin, Geschäftsführer, Bauleiter). Widersprich mir, wo der Inhalt schwach ist. Sag mir vor jedem Teil in zwei Sätzen, was passiert, und hol dir mein Go vor dem Push. Deutsch, einfach, Ergebnis zuerst.
