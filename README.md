# Schlusswerk (Arbeitstitel)

Der digitale Zwilling eines österreichischen Elektro- oder HKLS-Subunternehmerbetriebs. Die erste Anwendung darauf ist die Schlussrechnung: Wir finden Geld, das erbracht, aber nicht verrechnet wurde, und belegen jede Position.

Name, CI und Hosting sind noch offen. Dieses Repository ist **privat**: Es enthält Strategie, Preise und Rechtsfragen.

## Einstieg

1. [`CLAUDE.md`](CLAUDE.md): Regeln für die Arbeit, auch für KI Coding Agenten
2. [`_STATUS.md`](_STATUS.md): aktueller Stand, Gates, nächste Schritte
3. [`docs/dossier-v3.md`](docs/dossier-v3.md): gültiger Stand zu Produkt, Recht, Preisen, Markt, Plan und Bau

## Aufbau

| Ordner | Inhalt |
|---|---|
| `docs/` | Dossier, Recherche (`research_notes/`), Archiv (`archiv/`) |
| `business/` | 1-Pager, Problem-Solution Statement, Business Plan, Pitch |
| `product/` | das Produkt: Datenmodell, Backend, Frontend, synthetische Demo-Daten |
| `website/` | die öffentliche Website |
| `video/` | Skript, Storyboard und Quellen für das Produktvideo (keine großen Videodateien) |

## Regeln in Kürze

- Nur synthetische Daten. Keine echten Kundendaten in dieses Repository, bis Gate R4 (Recht) und der Betriebsrat geklärt sind.
- Keine Secrets committen. API Keys gehören in `.env` (steht in `.gitignore`).
- Deutsch, direkt, ohne Floskeln. Kein Wort „Claim“ in Kundenmaterial.
- Jede Änderung an `main` über einen Branch und Pull Request, sobald Code dazukommt.

## Team

Maximilian Dieringer ([@MaximilianDieringer](https://github.com/MaximilianDieringer)), Maximilian Seipl ([@maxi589](https://github.com/maxi589)), Santino Schrader ([@Snoft](https://github.com/Snoft)), Simon Fuhrbach ([@simonfuhrbach-source](https://github.com/simonfuhrbach-source)). Alle gleichberechtigt als Owner der Organisation [schlusswerk](https://github.com/schlusswerk).
