# Produkt

Der Zwilling: Datenmodell Firma → Projekt → Objekte (mit Quelle, Verlauf, Status), Einlesen, Ledger, Abschluss-Lauf, Ausgaben. Stufen und Demo-Skript stehen in `docs/dossier-v3.md`, Abschnitt 15.

Prinzipien: Die KI liefert Fakten mit Quelle, der Mensch bestätigt, die Rechnung ist deterministischer Code. Jede Zahl führt per Klick zum Original. Nur synthetische Daten.

**In Arbeit.** Verantwortlich bisher: Maxi S. In den Produktdateien meint „Maxi“ Maxi S.

## Stand (22.10.2026, abends)

| Teil | Stand |
|---|---|
| Plan und Umfang | `docs/Plan_MVP.md`, `docs/Umfang_v1.md`, an Dossier v3 angepasst, freigegeben von Maxi S. (22.10.) |
| Lösungsliste | `docs/Demo_Faelle.md` v2: Firma mit 8 Projekten, W21 voll ausgearbeitet (Liste 1 27.410,00 €, Liste 2 11.282,30 €), 6 Zurufe, GU-Historie, Fragen an den Insider. **Maßgeblich für alle Beträge** |
| Datenmodell und Rechenkern | `app/src/domain`, `app/src/engine`: Firma → Auftraggeber → Projekt, Zurufe, 7 kleine Projekte. Tests treffen Lösungsliste v2 cent-genau (W21 und Firma), unabhängig geprüft (PR #4) |
| App | Firmenübersicht, Projekt-Übersicht, Befunde, Befund-Seite mit Original (aus dem Datensatz gezeichnet, A4), Beweiskette und zweistufiger Freigabe (Verlauf im Browser, Rückgängig, Demo zurücksetzen). Seitenleiste einklappbar. Drei unabhängige Prüfungen (Code, Design gegen Linear/Attio/reebuild, Schlussprüfung), Befunde eingearbeitet (PR #5) |
| UI-Fundament | In der App (`app/src/ui`, Regeln in `app/src/ui/README.md`), **die App ist die Quelle**; das Artifact bleibt Referenz v2. Weißer Grund, keine Kästen, wenig Text. Gate 2 (annehmen) durch Maxi S. an der laufenden App offen. `fundament.test.ts` sperrt freie Farben, Stile, Trennpunkte, verbotene Wörter |
| Prüfungen | GitHub Actions bei jedem PR: Typen, Lint, Tests, Build. Schutz von main braucht einen bezahlten GitHub-Plan (offen). Screenshots: `app/scripts/qa/screens.mjs` |
| Online | vorbereitet: statischer Export, Cloudflare-Konfiguration. Einrichten offen, siehe „Online (Cloudflare)“ |

Nächste Ziele: v0.9 Sa 31.10. (#glaubandich), v1.0 KW 45, Stufe-0-Freeze So 6.12.

## Nächste Schritte (Reihenfolge)

1. Gate 2 mit Maxi S. an der laufenden App.
2. Bildschirme bis v0.9: Ledger (380 Positionen), Ordner mit Belegmatrix, Zeitachse, WhatsApp-Szene. Echte PDFs für Belege (pdf.js mit Markierung aus den Quell-Koordinaten).
3. Online stellen (eigener Strang, Kosten mit Maxi S.): Die App ist komplett statisch und braucht für die Demo keine Datenbank.
4. Offene Befunde der Prüfer: Vorprüfung/Kaskade nur bei W21 zeigen, Dokument-Kennungen firmenweit eindeutig, gelegte Schlussrechnung und kumulierte AR im Datenmodell, Schlüssel der Kürzungsgründe im Korrekturblatt, Prüfstand je Wert im Rechenweg.
5. Phase 3 bis v1.0 (KW 45): Vorprüfung, Schlussbesprechungs-Blatt, Entwurf der Schlussrechnung, Excel-Export, GU-Historie.

## Aufbau

| Pfad | Inhalt |
|---|---|
| `docs/` | Plan, Umfang, Lösungsliste, Muster aus reebuild und Kuro, UI-Messblatt, Prüfberichte |
| `app/` | Code: Next.js 16, TypeScript, Vitest. Regeln für Agenten in `app/CLAUDE.md` |
| `app/src/app/` | Bildschirme (Routen): `/` Firmenübersicht, `/projekte/[projekt]`, `/projekte/[projekt]/befunde`, `/projekte/[projekt]/befunde/[befund]` |
| `app/src/zustand/` | Freigabe als Verlauf (reine Logik mit Tests) und Speicher im Browser; später Datenbank |
| `app/src/ui/` | Bauteile aus dem UI-Fundament (React) und Stile (`styles/tokens.css`, `bauteile.css`, `anordnung.css`) |
| `app/src/daten/` | Datenzugriff der Bildschirme; heute der synthetische Firmenzwilling, später die Datenbank pro Firma |
| `ui-fundament/` | Design-System v2 als Referenz und die Skripte, die es erzeugt haben (`LIESMICH.md`) |

## Starten

```bash
cd product/app
npm ci
npm test
npm run build
npm run start
```

Danach http://localhost:3000 öffnen. `npm run build` legt die fertigen Seiten als Dateien in `app/out/` ab (statischer Export), `npm run start` liefert genau diese Dateien aus. `npm run generate` schreibt die synthetischen Datensätze nach `app/data/generated/` (nicht im Repository). Vor jedem Pull Request: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`.

## Online (Cloudflare)

Die Demo liegt bei Cloudflare als Worker mit statischen Dateien (Workers Builds, Gratis-Plan) und ist durch Cloudflare Access geschützt: Wer die Adresse öffnet, gibt seine E-Mail-Adresse ein und bekommt einen Code. Nur freigeschaltete Adressen kommen hinein.

| Was | Wo |
|---|---|
| Demo (Stand von `main`) | [[PLATZHALTER: Adresse nach dem Einrichten]] |
| Vorschau je Branch und Pull Request | Cloudflare schreibt die Adresse als Kommentar in den Pull Request |
| Einstellungen | Cloudflare-Dashboard, Workers & Pages, `schlusswerk-demo` |
| Konfiguration im Repository | `app/wrangler.jsonc` |

So läuft es:
- Jeder Merge auf `main` baut die Demo neu und stellt sie online (2 bis 3 Minuten). Jeder andere Branch bekommt eine eigene Vorschau-Adresse, ebenfalls geschützt.
- Cloudflare baut selbst aus dem Repository (Stammverzeichnis `product/app`, Build `npm run build`, Deploy `npx wrangler deploy`, Vorschau `npx wrangler preview`). Die GitHub-Prüfungen (`.github/workflows/produkt-app.yml`) laufen unabhängig davon weiter.
- Zugang: Cloudflare-Dashboard, Zero Trust, Access, Policies. Dort E-Mail-Adressen hinzufügen oder entfernen. Gratis bis 50 Personen.
- Freigaben in der Demo liegen weiter nur im Browser des Nutzers (localStorage), es gibt online keine Datenbank. Nur synthetische Daten.

Lokal unter Windows meldet die Browser-Konsole beim Vorladen einige 404 für Dateien `__next.*.txt`. Das ist ein Fehler im Export von Next.js unter Windows (falsche Pfadtrenner), die Seiten laden trotzdem. Cloudflare baut unter Linux, dort tritt er nicht auf.

## Regeln

- UI nur aus dem UI-Fundament, keine eigenen Farben oder Abstände.
- Alle Beträge aus dem Rechenkern. Die Lösungsliste ändert sich nur mit Go, der Code richtet sich nach ihr.
- Vor jedem Pull Request: typecheck, lint, Tests, Build grün; Bildschirme im echten Browser geprüft (hell, dunkel, 1440 und 390 px) und von einem unabhängigen Prüfer angesehen.
