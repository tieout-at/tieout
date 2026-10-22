# Übergabe

Diese Datei ist das Gedächtnis zwischen Sitzungen und Claude-Accounts. Am Ende jeder Sitzung überschreiben, nicht anhängen.

**Stand:** 22.10.2026, abends
**Branch:** `zuruf/plan`
**Phase:** 1 Kern und Simulator (läuft)

## Erledigt

- Phase 0: Ordner, Regeln, Gestaltung, Plan. Anthropic API Key liegt in `product/zuruf/.env` (ignoriert), Test erfolgreich.
- Paket `product/zuruf/` (TypeScript, Node 22, Vitest, `@anthropic-ai/sdk`, `zod`).
- `src/typen.ts` Datenmodell (Nachricht, Angabe mit Zitat, Eintrag, Leistungsereignis mit Version).
- `src/firma.ts` kleiner synthetischer Firmen-Zwilling (5 Projekte, Wien 21 und Wien 10 absichtlich verwechselbar, Tulln abgeschlossen).
- `src/belege.ts` Belegprüfung: Angabe ohne wörtliches Zitat wird verworfen. Tests in `belege.test.ts`.
- `src/verstehen.ts` KI liest Absicht und Angaben (Claude Opus 5.5, Aufwand low, strukturierte Ausgabe, Fallback „default“).
- `src/agent.ts` Gesprächsführung als fester Code (Einwilligung, Stopp, höchstens 2 Rückfragen, Projekt per Knopf, Anweiser nur bei Zusatzarbeit, Zusammenfassung, Korrektur als neue Version, Tagesabschluss legt Offenes unbestätigt ab). Tests in `agent.test.ts` (11 Fälle, KI durch feste Antworten ersetzt).
- `src/texte.ts` alle Sätze des Agenten als fester Text.
- `src/lernschleife.ts` + `scripts/lauf.ts`: Persona spielt Absender, Prüfungen im Code, Bewerter-Note 1 bis 5, Bericht in `laeufe/` (ignoriert).
- Szenarien: 30 sichtbare in `szenarien/`, 10 zurückgehaltene in `szenarien/zurueck/` (nicht lesen, nur `npm run lauf -- --zurueck` bei Abnahme).
- `sim/` Simulator: `npm run sim`, dann http://localhost:4321. Chat links, Büro-Ansicht mit Zitaten rechts.

## Befehle

```powershell
cd product/zuruf
npm ci
npm run typecheck
npm test
npm run szenarien:pruefen
npm run lauf -- --ohne-bewerter
npm run lauf
npm run sim
```

## Stand der Lernschleife

| Lauf | Bestanden | Note Median / Min | Erfunden | Felder richtig | Kosten |
|---|---|---|---|---|---|
| 1 sichtbar | 28/30 | 4 / 1 | 1 | 99 % | 1,64 USD |
| 2 sichtbar | 25/30 | 4 / 2 | 0 | 97 % | 1,62 USD |
| 3 sichtbar | 30/30 | 5 / 3 | 0 | 100 % | 1,45 USD |
| Abnahme 1 zurückgehalten | 6/10 | 3,5 / 2 | 1 | 95 % | 0,84 USD |
| 4 sichtbar (abgebrochen) | 30/32 | 5 / 3 | 1 | 100 % | 2,04 USD |

Lauf 4 brach nach 32 von 50 Szenarien ab: API-Guthaben aufgebraucht. Bisher ca. 9 USD API-Kosten insgesamt.

Abnahme 1 fand den schwersten Fehler bisher: Datenverlust bei Nachtrag plus Korrektur (LERNEN.md A1, A2). Behoben, mit Tests. Altes Holdout ist verbraucht und liegt jetzt sichtbar als `szenarien/z-*.json`. Frisches Holdout: `szenarien/zurueck/h2-*.json` (nicht lesen).

29 Lernpunkte in `LERNEN.md`. 40 Unit-Tests grün (`agent.test.ts`, `belege.test.ts`, `abnahme1.test.ts`). 60 Szenarien (50 sichtbar, 10 zurückgehalten).

## KI über Abo oder API

In `product/zuruf/.env` steht `ZURUF_KI=abo`: Agent, Persona und Bewerter laufen über Claude Code mit dem Claude-Abo (`claude` muss angemeldet sein, `claude auth status`). Kostet kein API-Guthaben, zählt aber gegen das Abo-Limit und ist langsamer (ca. 5 bis 16 s pro Antwort statt 2,5 s). Ein Lauf über 4 Szenarien dauerte 1:13 min, über 50 Szenarien also grob 15 bis 20 min und ca. 200 Aufrufe. Mit `ZURUF_KI=api` läuft alles wieder über den API-Key (Guthaben war am 22.10. aufgebraucht). Auf einem anderen Account: dort `claude` anmelden, dann gilt dessen Abo.

## Nächster Schritt

1. `npm run lauf` über alle 50 sichtbaren Szenarien vollständig (über das Abo), Fehler nach `LERNEN.md`.
2. Abnahme 2: `npm run lauf -- --zurueck`. Bei Fehlern wieder nur abstrakt auswerten lassen (Subagent mit `--mit-protokoll`, Hauptsitzung liest das Protokoll nicht), danach frisches Holdout.
3. Offen aus A10: Sammelfenster im WhatsApp-Kanal (Phase 3).
4. Danach Phase 2 (Sprache und Foto) oder Phase 3 (echte Nummer), Entscheidung beim Team.

## Offene Fragen

- Antwortzeit: erster Probelauf 9,5 Sekunden pro Nachricht. Für WhatsApp eher zu lang (Annahme). Prüfen: Aufwand, Prompt kürzen, schnelleres Modell nur mit Go des Menschen.
- Bau-Aufteilung und Zeitbudget neben dem MVP v0.9 (Sonntagsrunde 25.10.).
- Fragen aus `GESTALTUNG.md`, Abschnitt Offen.

## Für eine neue Sitzung oder einen neuen Account

1. Branch holen. Windows PowerShell 5.1 kennt `&&` nicht, deshalb Befehle einzeln oder mit `;` und `if ($?)`:

   ```powershell
   git fetch origin; if ($?) { git checkout zuruf/plan }
   ```

   Auf einem Rechner ohne Repo zuerst `git clone https://github.com/schlusswerk/schlusswerk.git`, dann `cd schlusswerk`. In Git Bash, auf Mac und Linux geht auch `git fetch origin && git checkout zuruf/plan`.

2. Claude Code im Repo starten und schreiben: „Lies `product/zuruf/CLAUDE.md` und `product/zuruf/UEBERGABE.md` und mach beim nächsten Schritt weiter.“

3. Auf einem neuen Rechner braucht es `product/zuruf/.env` mit `ANTHROPIC_API_KEY=` (Vorlage `.env.example`). Den Key nie committen.
