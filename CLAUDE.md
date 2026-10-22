# Schlusswerk (Arbeitstitel): Projektkontext für Claude Code

Dieses Repository ist der Arbeitsordner für das WU Hackathon Projekt (privat auf GitHub unter github.com/schlusswerk/schlusswerk, alles Technische und alle Projektdokumente an einem Ort). Lies diese Datei zuerst, danach `_STATUS.md`, danach `docs/dossier-v3.md`.

## Worum es geht

Schlusswerk ist der digitale Zwilling eines österreichischen Elektro- oder HKLS-Subunternehmerbetriebs (30 bis 150 Leute). Der Firmen-Zwilling führt das Wissen über das ganze Geschäft zusammen: Kunden und GUs, Verträge, Regelwerk und Historie pro GU, Preisbasis (K7), LV-Archiv und alle Projekte. In jedem Projekt steckt ein Projektzwilling (LV, Aufmaß, Regie, Pläne, Mails, Calls, Fotos, Zurufe, Rechnungen, Zahlungen). Auf dem Zwilling laufen Anwendungen. Die erste Anwendung ist die Schlussrechnung: Abschluss-Lauf, Vorprüfung aus GU-Sicht, Entwurf der Schlussrechnung, Beweispaket, Schlussbesprechungs-Blatt.

Drei Wege in den Zwilling: Anbinden (ERP, CRM, AVA, Mails, Calls), Einspielen (Dateien, Pläne), Zurufen (WhatsApp mit Foto und Sprache an einen Agenten, Bestätigung durch den Absender).

Drei Angebote: Check (ein Projekt rückwirkend), Desk bzw. Jahresdesk (alle schließenden Projekte, der Zwilling wächst), Live (laufend, ab Jahr 2).

## Wer arbeitet hier

Maxi (Maximilian Dieringer, WU Wien, Wirtschaftsinformatik) ist einer von drei Gründern. Er baut die Website und das Produkt mit KI Coding Agenten. Später kommen CI, endgültiger Name und Hosting dazu. Die beiden Co-Founder haben keinen Bauhintergrund. Auf GitHub arbeiten mit: @MaximilianDieringer, @Snoft, @maxi589, alle gleichberechtigt. Ein Bau-Insider ist Pflicht (Gate R1).

## Aufbau des Repositorys

| Pfad | Zweck |
|---|---|
| `_STATUS.md` | Laufender Stand: Gates, Termine, nächste Schritte. Nach jeder Sonntags-Runde aktualisieren |
| `docs/dossier-v3.md` | **Gültiger Stand.** Kernprodukt, Recht, Preise, Markt, Konkurrenz, Gates, Plan, Bau, Startprompt |
| `docs/research_notes/` | Recherche, z. B. `Kuro_reebuild_Fakten.md` (Steckbriefe, GU-Seite-Abwägung, Investorenstory, Quellen aus v2) |
| `docs/archiv/` | Überholte Stände, z. B. Dossier v2. Nur noch als Quelle für Links zu Recht und Markt |
| `business/` | 1-Pager, Problem-Solution Statement, Business Plan, Pitch (Markdown) |
| `product/` | Produkt: Datenmodell, Backend, Frontend, synthetische Demo-Daten |
| `website/` | Öffentliche Website |
| `video/` | Skript und Storyboard für das Produktvideo. Videodateien nicht ins Repository |

Neue Recherche nach `docs/research_notes/`, Überholtes nach `docs/archiv/`. Keine Secrets committen (`.env`). Das Repository liegt nicht in OneDrive.

Wo v2 und v3 abweichen, gilt v3.

## Regeln für die Arbeit

1. **Sprache:** Deutsch, direkt, ohne Floskeln, ohne Emojis, ohne Gedankenstriche als Satzzeichen.
2. **Belege:** Jede Aussage über die Welt braucht eine Quelle. Alles mit „(unbelegt)“ oder „(Annahme)“ im Dossier ist ungeprüft und wird nicht als Tatsache weitergegeben.
3. **Verworfenes:** Abschnitt 12 im Dossier v3 ist entschieden. Nichts daraus wieder vorschlagen, außer mit neuer Evidenz, und das ausdrücklich sagen.
4. **Wortwahl:** Das Wort „Claim“ steht in keinem Kundenmaterial. Wir sagen Schlussrechnung, verrechenbar, Beweispaket.
5. **Nie tun:** Kontakt zum GU aufnehmen, rechtlich würdigen oder Aussagen zur Präklusion machen, Mitarbeiter bewerten (§ 96a ArbVG), Preise zwischen Firmen poolen, Inkasso.
6. **Vertrieb:** Keine Kaltmails, keine Kaltanrufe (§ 174 TKG). Persönlich, Brief, Events, Partner, Webformular mit Einwilligung.
7. **Produktprinzipien:** Die KI liefert Fakten mit Quelle, der Mensch bestätigt, die Rechnung ist deterministischer Code. Jede Zahl führt per Klick zum Original. Der Zwilling hat Historie, nichts wird überschrieben. Datensilo pro Firma.
8. **Daten:** Bis zur schriftlichen Rechtsklärung (Gate R4) und zur Klärung mit dem Betriebsrat nur synthetische Daten. Keine echten Kundendaten in dieses Repository.
9. **Preise nach außen:** Nur der Einstiegspreis („Check ab 1.500 €, fix“). Das Jahresdesk gibt es im Gespräch.

## Wenn es um die Website geht

Die Website muss das Kernprodukt in einem Satz erklären können: der digitale Zwilling des Betriebs, erste Anwendung Schlussrechnung. Positionierung, Zielgruppen (Inhaber, Abrechner, Projektleiter), Vertrauensleiste (EU-Hosting, AVV, Datensilo, „wir reden nie mit eurem GU“) und CTA („Check anfragen“ mit Einwilligungs-Häkchen) stehen in Dossier v3 Abschnitt 9. Offen und bewusst noch nicht festgelegt: Name, CI, Hosting. Der Name „Schlusswerk“ passt zur ersten Anwendung, nicht automatisch zum Kernprodukt.

## Wenn es um den Bau geht

Stufen 0 bis 4 und Demo-Skript (3 Minuten) stehen in Dossier v3 Abschnitt 15. Stufe 0 (Einspielen) reicht für die Gates R2, R3 und R5. Der WhatsApp Prototyp ist optional. Das Git Repository gehört nicht in OneDrive.

Produktstand, Plan und Regeln für den Code: `product/README.md`, `product/app/CLAUDE.md`. Beträge der Demo nur aus `product/docs/Demo_Faelle.md` und dem Rechenkern.

## Gates (Termine unverändert)

R1 Insider (Term Sheet Fr 20.11.2026, hart Fr 4.12.), R4 Recht (Fr 4.12.), R2 Ordner (Fr 11.12.), R3 Geld (Fr 22.1.2027), R5 Zahlung (Fr 29.1.2027), Endentscheid So 31.1.2027. Details in Dossier v3 Abschnitt 13.
