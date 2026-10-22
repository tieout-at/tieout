# Website

Arbeitstitel **EndPoint.** Struktur, CI und Platzhalter-Regeln: [`STRUKTUR.md`](STRUKTUR.md).

## Starten

```bash
npm install
npm run dev
```

Dann http://localhost:3210 öffnen (Deutsch) bzw. http://localhost:3210/en/ (Englisch).

| Befehl | Zweck |
|---|---|
| `npm run dev` | Entwicklung mit Live-Reload |
| `npm run build` | statischer Export nach `out/` (läuft auf jedem Webspace) |
| `npm run typecheck` | TypeScript prüfen |
| `npm run check:platzhalter` | listet alle `[[PLATZHALTER]]`. Vor dem Livegang muss die Liste leer sein |

## Aufbau

```
app/(de)/            Deutsch: /, /impressum, /datenschutz
app/(en)/en/         Englisch: /en, /en/impressum, /en/datenschutz
app/globals.css      Design-Tokens (Papier, Tinte, Ultramarin), Raster, alle Styles
components/nav/      Header mit DE/EN, Messpunkt-Navigation
components/sections/ Abschnitte 01 bis 09
components/twin/     interaktiver Zwilling (isometrisches SVG)
components/ui/       Maßkette, Platzhalter, Einblenden
messages/            alle Texte: de.json, en.json
data/zwilling.json   synthetische Daten für den Zwilling
```

Texte nur in `messages/` ändern, nie im Code. Neue Platzhalter immer als `[[PLATZHALTER: …]]` (Deutsch) bzw. `[[PLACEHOLDER: …]]` (Englisch).

## Stand

Vorschau, nicht öffentlich: `noindex`, Hinweis „Vorschau. Nicht öffentlich.“ unten links. Formular versendet noch nichts. Impressum, Datenschutz, Rechtsform, Domain, Team-Rollen und Video sind Platzhalter.
