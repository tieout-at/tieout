# Zuruf-Agent: Regeln für Claude Code

Der Zuruf-Agent ist der dritte Weg in den Zwilling (Dossier v3, Abschnitt 3.4): Ein Monteur oder Polier schickt Foto oder Sprachnachricht per WhatsApp, der Agent ordnet zu, fasst zusammen, der Absender bestätigt mit einem Tipp, im Projektzwilling entsteht ein Leistungsereignis mit Quelle.

Die Regeln in `../../CLAUDE.md` (Repo-Wurzel) und `../app/CLAUDE.md` gelten zusätzlich.

## Lesereihenfolge bei jedem Start

1. `UEBERGABE.md`: Wo stehen wir, was ist der nächste Schritt. **Immer zuerst.**
2. `PLAN.md`: Ziel, Phasen, Abnahme, Entscheidungen.
3. `GESTALTUNG.md`: Wie der Agent mit Menschen spricht. Gilt für jeden Prompt, jede Antwort, jeden Test.
4. `LERNEN.md`: Fehler, die schon passiert sind, und die Regeln daraus. Nicht wiederholen.

## Abgrenzung zum MVP

- Im MVP (`../app/`, `../docs/Umfang_v1.md`) ist die WhatsApp-Szene ein Mock. Der echte Agent steht dort auf „nicht drin“. Dieser Ordner baut ihn parallel, ohne den MVP zu stören.
- Nichts in `../app/` oder `../docs/` ändern ohne Go von Maxi S. Integration läuft über einen Vorschlag in `PLAN.md` (Abschnitt Integration) und einen eigenen Pull Request.
- Beträge nie im Agenten. Der Agent erfasst Fakten (Projekt, Ort, Leistung, Menge, Aufwand, Anweiser). Bepreisen tut der Rechenkern, entscheiden tut der Mensch.

## Harte Regeln

- **Nur synthetische Daten.** Erfundene Firma (Haustechnik Beispiel GmbH), erfundene Baustellen, erfundene Personen. Echte Telefonnummern nur die eigenen Testhandys des Teams, keine echten Baustelleninhalte. Echte Kundendaten erst nach R4 und Betriebsrat.
- Der Agent spricht nur mit Mitarbeitern der Kundenfirma, nie mit dem GU. Er entscheidet nie über Abrechenbarkeit, würdigt nichts rechtlich, sagt nichts zu Fristen oder Präklusion.
- Keine Auswertung pro Mitarbeiter (§ 96a ArbVG): keine Zählungen, Ranglisten, Erinnerungen an Einzelne. Der Absender ist nur Herkunft des Eintrags.
- Der Agent schreibt nie zuerst. Er antwortet nur in einem Gespräch, das der Mitarbeiter begonnen hat (§ 174 TKG ungeklärt, Dossier v3 Abschnitt 4).
- Nichts wird überschrieben. Korrekturen sind neue Versionen mit Verweis auf die alte.
- Keine inoffiziellen WhatsApp-Bibliotheken (Baileys, whatsapp-web.js). Nur die offizielle Cloud API von Meta.
- Secrets nur in `.env` (ist ignoriert). `.env.example` zeigt die Namen ohne Werte.
- Wort „Claim“ nie, auch nicht in Prompts oder Testdaten.

## Arbeitsweise

- Branch pro Arbeitspaket (`zuruf/...`), nach `main` nur über Pull Request.
- Vor Code mit der Claude API den Skill `claude-api` laden (Modellnamen, Parameter, Caching).
- Jede Änderung am Verhalten des Agenten: erst ein Szenario in `szenarien/`, das den Fehler zeigt, dann die Änderung, dann die Lernschleife laufen lassen (Ablauf in `PLAN.md`, Abschnitt Lernschleife).
- Jeder gefundene Fehler kommt nach `LERNEN.md`, mit Ursache, Regel und dem Szenario, das ihn künftig abfängt.
- Subagents für Arbeit, die parallel laufen kann: Szenarien schreiben, als Persona testen, Gespräche bewerten, Fakten recherchieren. Den Subagents immer `GESTALTUNG.md` und das Szenario mitgeben, nicht die eigene Vermutung.
- Fakten über Meta, Preise, Recht: mit Quelle und Datum. Ohne Quelle „(unbelegt)“.

## Ende jeder Sitzung (Account-Wechsel jederzeit möglich)

1. `UEBERGABE.md` aktualisieren: Stand, letzter Schritt, nächster Schritt, offene Fragen, laufende Experimente.
2. Neue Fehler in `LERNEN.md`.
3. Commit auf den Arbeitsbranch und Push (nach Go des Menschen), damit ein anderer Account auf einem anderen Rechner weiterarbeiten kann.
