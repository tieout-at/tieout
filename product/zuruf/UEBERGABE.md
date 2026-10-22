# Übergabe

Diese Datei ist das Gedächtnis zwischen Sitzungen und Claude-Accounts. Am Ende jeder Sitzung überschreiben, nicht anhängen.

**Stand:** 22.10.2026
**Branch:** `zuruf/plan`
**Phase:** 0 Grundlagen

## Erledigt

- Ordner `product/zuruf/` mit `CLAUDE.md`, `PLAN.md`, `GESTALTUNG.md`, `LERNEN.md`, dieser Datei.
- Entscheidungen vom 22.10. in `PLAN.md` (Simulator zuerst, Meta Cloud API, noch keine Testleute vom Bau, noch keine Zugänge).
- Fakten zur WhatsApp Cloud API recherchiert, mit Quellen in `PLAN.md`.

## Nächster Schritt

1. Team liest `GESTALTUNG.md` und `PLAN.md`, Go oder Änderungen (Sonntagsrunde 25.10.).
2. Anthropic API Key anlegen (Anleitung in `PLAN.md`, Abschnitt Zugänge).
3. Dann Phase 1: `package.json`, Datenmodell Zuruf, kleiner Firmen-Zwilling, erste 30 Szenarien.

## Offene Fragen

- Bau-Aufteilung und Zeitbudget neben dem MVP v0.9 (Sonntagsrunde 25.10.).
- Fragen aus `GESTALTUNG.md`, Abschnitt Offen.

## Laufende Experimente

(keine)

## Für eine neue Sitzung oder einen neuen Account

1. Branch holen. Windows PowerShell 5.1 kennt `&&` nicht, deshalb Befehle einzeln oder mit `;` und `if ($?)`:

   ```powershell
   git fetch origin; if ($?) { git checkout zuruf/plan }
   ```

   Auf einem Rechner ohne Repo zuerst `git clone https://github.com/schlusswerk/schlusswerk.git`, dann `cd schlusswerk`. In Git Bash, auf Mac und Linux geht auch `git fetch origin && git checkout zuruf/plan`.

2. Claude Code im Repo starten und schreiben: „Lies `product/zuruf/CLAUDE.md` und `product/zuruf/UEBERGABE.md` und mach beim nächsten Schritt weiter.“
