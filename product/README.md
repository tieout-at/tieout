# Produkt

**Name: tieout** (klein, ohne Punkt, wie Website v7 vom 22.10.2026; vorher Tieout). Intern heißen Repository, Paket und Worker vorerst weiter `schlusswerk`.

Der Zwilling: Datenmodell Firma → Projekt → Objekte (mit Quelle, Verlauf, Status), Einlesen, Ledger, Abschluss-Lauf, Ausgaben. Stufen und Demo-Skript stehen in `docs/dossier-v3.md`, Abschnitt 15.

Prinzipien: Die KI liefert Fakten mit Quelle, der Mensch bestätigt, die Rechnung ist deterministischer Code. Jede Zahl führt per Klick zum Original. Nur synthetische Daten.

**In Arbeit.** Verantwortlich bisher: Maxi S. In den Produktdateien meint „Maxi“ Maxi S.

## Stand (22.10.2026, spät)

| Teil | Stand |
|---|---|
| Plan und Umfang | `docs/Plan_MVP.md`, `docs/Umfang_v1.md`, an Dossier v3 angepasst, freigegeben von Maxi S. (22.10.) |
| Lösungsliste | `docs/Demo_Faelle.md` v2: Firma mit 8 Projekten, W21 voll ausgearbeitet (Liste 1 27.410,00 €, Liste 2 11.282,30 €), 6 Zurufe, GU-Historie, Fragen an den Insider. **Maßgeblich für alle Beträge** |
| Datenmodell und Rechenkern | `app/src/domain`, `app/src/engine`: Firma → Auftraggeber → Projekt, Zurufe, 7 kleine Projekte. Tests treffen Lösungsliste v2 cent-genau (W21 und Firma), unabhängig geprüft (PR #4) |
| App | Firmenübersicht, Projekt-Übersicht, Befunde, Befund-Seite mit Original (aus dem Datensatz gezeichnet, A4), Beweiskette und zweistufiger Freigabe (Verlauf im Browser, Rückgängig, Demo zurücksetzen). Seitenleiste einklappbar. Drei unabhängige Prüfungen (Code, Design gegen Linear/Attio/reebuild, Schlussprüfung), Befunde eingearbeitet (PR #5) |
| Bildschirme v0.9 (Maxi S., 22.10. nachts) | Seitenleiste neu (Firma oben, Projekte als Baum mit Ampelpunkt), Zeitachse mit Filtern, WhatsApp-Szene (vorgespielt: Sprachnachricht wird Eintrag in der Zeitachse), Ledger mit allen LV-Positionen, Ordner mit Belegmatrix (Position × Belegart) und Dokumentliste, Beleg im Original je Dokument und Zuruf (`/projekte/[projekt]/ordner/[beleg]`). PR #14, #15, #16, #18 und dieser |
| Politur v0.10 (Maxi S. mit Claude, 22.10. spät) | Ablauf 1 bis 4 auf der Projektübersicht mit Zahlen und Links, keine Ampelpunkte und Farbflächen, Status als Wort, alle Tabellen 36 px mit festen Spalten (nichts verschiebt sich), Tokens für Schriftgrößen. PRs #24, #27, #28, #29, #33, #35, unabhängig geprüft. Nächste Schritte: `../_UEBERGABE.md` (Rebranding Tieout., UI an die Website, Tempo, Zuruf-Agent) |
| Marke Tieout (23.10.) | Logo und Wortmarke oben in der Seitenleiste (`app/src/ui/Logo.tsx`, gleiche Geometrie wie die Website), Seitentitel „Tieout“, Akzent Ultramarin #1D3BFF statt Blau. Grautöne, Grund und Dunkelmodus bewusst unverändert (Entscheidung Maxi S.). Seit v7 der Website klein und ohne Punkt: „tieout“ in Wortmarke, Seitentitel und Beschreibung. |
| Restliste Prüfbericht (23.10.) | Handy: Firmenliste mit Kopf, Ampel und Datum; breite Tabellen blenden rechts aus, solange Spalten folgen. Rechenweg als Liste wie die übrigen Tabellen (Kopf, 36 px, Beträge rechts). Kennzahlen ohne Linien. Ein Seitentitel für Projekt, Befund und Beleg. „Zu entscheiden“ zählt wie „x von y freigegeben“ ohne „Braucht Anwalt“ |
| Einstellungen und Anmeldung (23.10.) | Seite Einstellungen (Thema, Freigaben zurücksetzen) statt „Demo zurücksetzen“ in der Seitenleiste. Anmeldung mit Supabase (Projekt `tieout-app`, Frankfurt, nur auf Einladung, Einladen per Anmeldelink, Prüfskript `app/worker/index.ts`) ist fertig, aber per Schalter `ANMELDUNG_EIN` aus: Juroren und Investoren öffnen die App per Link |
| UI-Fundament | In der App (`app/src/ui`, Regeln in `app/src/ui/README.md`), **die App ist die Quelle**; das Artifact bleibt Referenz v2. Weißer Grund, keine Kästen, wenig Text. Gate 2 (annehmen) durch Maxi S. an der laufenden App offen. `fundament.test.ts` sperrt freie Farben, Stile, Trennpunkte, verbotene Wörter |
| Prüfungen | GitHub Actions bei jedem PR: Typen, Lint, Tests, Build. Schutz von main braucht einen bezahlten GitHub-Plan (offen). Screenshots: `app/scripts/qa/screens.mjs` |
| Online | https://app.tieout.workers.dev, geschützt per E-Mail-Code, neu gebaut bei jedem Merge auf main (seit 22.10.). Siehe „Online (Cloudflare)“ |

Nächste Ziele: v0.9 Sa 31.10. (#glaubandich), v1.0 KW 45, Stufe-0-Freeze So 6.12.

## Nächste Schritte (Reihenfolge)

1. Gate 2 mit Maxi S. an der laufenden App.
2. Bildschirme bis v0.9: gebaut (22.10.). Offen: unabhängige Prüfung, echte PDFs für Belege (pdf.js mit Markierung aus den Quell-Koordinaten).
3. Team-Adressen in die Zugangsregel eintragen (siehe „Online (Cloudflare)“).
4. Offene Befunde der Prüfer: Vorprüfung/Kaskade nur bei W21 zeigen, Dokument-Kennungen firmenweit eindeutig, gelegte Schlussrechnung und kumulierte AR im Datenmodell, Schlüssel der Kürzungsgründe im Korrekturblatt, Prüfstand je Wert im Rechenweg.
5. Phase 3 bis v1.0 (KW 45): Vorprüfung, Schlussbesprechungs-Blatt, Entwurf der Schlussrechnung, Excel-Export, GU-Historie.

## Aufbau

| Pfad | Inhalt |
|---|---|
| `docs/` | Plan, Umfang, Lösungsliste, Muster aus reebuild und Kuro, UI-Messblatt, Prüfberichte |
| `app/` | Code: Next.js 16, TypeScript, Vitest. Regeln für Agenten in `app/CLAUDE.md` |
| `app/src/app/` | Bildschirme (Routen): `/` Firmenübersicht, `/projekte/[projekt]`, `…/befunde`, `…/befunde/[befund]`, `…/ledger`, `…/zeitachse`, `…/ordner`, `…/ordner/[beleg]` |
| `app/src/zustand/` | Freigabe als Verlauf (reine Logik mit Tests) und Speicher im Browser; später Datenbank |
| `app/src/ui/` | Bauteile aus dem UI-Fundament (React) und Stile (`styles/tokens.css`, `bauteile.css`, Layout je Bereich wie `rahmen.css`, `tabellen.css`) |
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
| Demo (Stand von `main`) | https://app.tieout.workers.dev |
| Vorschau je Branch und Pull Request | Cloudflare schreibt die Adresse als Kommentar in den Pull Request |
| Einstellungen | Cloudflare-Dashboard (Konto von Maxi S.), Workers & Pages, `app` (vorher `schlusswerk-demo`) |
| Konfiguration im Repository | `app/wrangler.jsonc` |

So läuft es:
- Jeder Merge auf `main` baut die Demo neu und stellt sie online (2 bis 3 Minuten). Jeder andere Branch bekommt eine eigene Vorschau-Adresse, ebenfalls geschützt.
- Cloudflare baut selbst aus dem Repository (Stammverzeichnis `product/app`, Build `npm run build`, Deploy `npx wrangler deploy`, Vorschau `npx wrangler preview`). Die GitHub-Prüfungen (`.github/workflows/produkt-app.yml`) laufen unabhängig davon weiter.
- Anmelden: Adresse öffnen, E-Mail eingeben, Code aus der Mail eintippen. Die Anmeldung hält 24 Stunden.
- Zugang verwalten: Cloudflare-Dashboard, Zero Trust, Access controls, Policies, Regel „Team Schlusswerk (E-Mail-Code)“. Dort E-Mail-Adressen hinzufügen oder entfernen und speichern, wirkt sofort. Die zweite Regel „Cloudflare account members“ lässt Mitglieder des Cloudflare-Kontos über „Cloudflare“ hinein. Zero Trust Free: 0 $, bis 50 Personen.
- Freigaben in der Demo liegen weiter nur im Browser des Nutzers (localStorage), es gibt online keine Datenbank. Nur synthetische Daten.

Lokal unter Windows meldet die Browser-Konsole beim Vorladen einige 404 für Dateien `__next.*.txt`. Das ist ein Fehler im Export von Next.js unter Windows (falsche Pfadtrenner), die Seiten laden trotzdem. Cloudflare baut unter Linux, dort tritt er nicht auf.

## Regeln

- UI nur aus dem UI-Fundament, keine eigenen Farben oder Abstände.
- Alle Beträge aus dem Rechenkern. Die Lösungsliste ändert sich nur mit Go, der Code richtet sich nach ihr.
- Vor jedem Pull Request: typecheck, lint, Tests, Build grün; Bildschirme im echten Browser geprüft (hell, dunkel, 1440 und 390 px) und von einem unabhängigen Prüfer angesehen.
