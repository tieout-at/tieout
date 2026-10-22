# Produkt

Der Zwilling: Datenmodell Firma → Projekt → Objekte (mit Quelle, Verlauf, Status), Einlesen, Ledger, Abschluss-Lauf, Ausgaben. Stufen und Demo-Skript stehen in `docs/dossier-v3.md`, Abschnitt 15.

Prinzipien: Die KI liefert Fakten mit Quelle, der Mensch bestätigt, die Rechnung ist deterministischer Code. Jede Zahl führt per Klick zum Original. Nur synthetische Daten.

**In Arbeit.** Verantwortlich bisher: Maxi S. In den Produktdateien meint „Maxi“ Maxi S.

## Stand (22.10.2026)

| Teil | Stand |
|---|---|
| Plan und Umfang | `docs/Plan_MVP.md`, `docs/Umfang_v1.md`, an Dossier v3 angepasst, freigegeben von Maxi S. (22.10.) |
| Lösungsliste | `docs/Demo_Faelle.md` v2: Firma mit 8 Projekten, W21 voll ausgearbeitet (Liste 1 27.410,00 €, Liste 2 11.282,30 €), 6 Zurufe, GU-Historie, Fragen an den Insider. Per Skript nachgerechnet, unabhängig geprüft. **Maßgeblich für alle Beträge** |
| Rechenkern | `app/`: Datenmodell, synthetischer Datensatz W21 (380 LV-Positionen, 165 Dokumente), Rechenkern. 58 Tests grün gegen Lösungsliste **v1** (W21 ohne Zurufe). Firmenebene, Zurufe, 7 kleine Projekte und GU-Historie folgen in Phase 1b |
| UI-Fundament | `ui-fundament/`: Design-System v2 (18 Bauteile, Tokens hell und dunkel) aus gemessenen Referenzen (reebuild, Kuro, Stratos, Linear, Attio, Harvey, Ramp, Rossum), Schlüsselbildschirme. Es fehlen 3 Bauteile (Projektliste mit Ampel, Zeitachse, Zuruf-Ansicht). Gate 2 (annehmen) offen |
| App (Bildschirme) | noch nicht begonnen. Nächster Schritt nach Gate 2 |

Nächste Ziele: v0.9 Sa 31.10. (#glaubandich), v1.0 KW 45, Stufe-0-Freeze So 6.12.

## Nächste Schritte (Reihenfolge)

1. UI-Fundament um 3 Bauteile ergänzen (aus Referenzen messen, nicht erfinden), Begriffe angleichen („Übersicht“ statt „Cockpit“, „Abzug ohne Vertragspunkt“), dann **Gate 2** mit Maxi S.
2. Phase 1b: Datenmodell Firma → Auftraggeber → Projekt, Zurufe als eigene Objekte, Generator für die 7 kleinen Projekte, Lösungsdatei und Tests auf v2, echte PDFs für alle Belege.
3. Phase 2: Next.js-App bis v0.9 (Firmenübersicht, Projekt, Ledger, Befunde mit Beleg-Panel, Freigabe, Zeitachse, WhatsApp-Szene). Pflichtpunkte aus `docs/Pruefberichte_UI.md`.
4. Phase 3 bis v1.0 (KW 45): Vorprüfung, Schlussbesprechungs-Blatt, Entwurf der Schlussrechnung, Excel-Export, GU-Historie.

## Aufbau

| Pfad | Inhalt |
|---|---|
| `docs/` | Plan, Umfang, Lösungsliste, Muster aus reebuild und Kuro, UI-Messblatt, Prüfberichte |
| `app/` | Code: Next.js 16, TypeScript, Tailwind v4, Vitest. Regeln für Agenten in `app/CLAUDE.md` |
| `ui-fundament/` | Design-System und Skripte, die es erzeugen (`LIESMICH.md`) |

## Starten (Rechenkern)

```bash
cd product/app
npm ci
npm run typecheck
npm run lint
npm test
npm run generate
```

`npm run generate` schreibt den synthetischen Datensatz nach `app/data/generated/w21.json` (nicht im Repository, wird erzeugt).

## Regeln

- UI nur aus dem UI-Fundament, keine eigenen Farben oder Abstände.
- Alle Beträge aus dem Rechenkern. Die Lösungsliste ändert sich nur mit Go, der Code richtet sich nach ihr.
- Vor jedem Pull Request: typecheck, lint, Tests grün.
