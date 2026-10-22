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
| `npm run deploy:vorschau` | baut und lädt auf die geschützte Vorschau (Cloudflare Pages) |
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

## Online-Vorschau

**https://vorschau.endpoint-preview.pages.dev** (Deutsch) und `/en/` (Englisch).

- Geschützt mit Cloudflare Access: Wer die Seite öffnet, meldet sich mit einer freigegebenen Mailadresse an und bekommt einen Einmal-Code.
- Gehostet im privaten Cloudflare-Konto von Maxi D., Pages-Projekt `endpoint-preview`. Hochgeladen wird nur als Vorschau-Branch `vorschau`, denn Cloudflare schützt per Schalter nur Vorschauen. Die Hauptadresse `endpoint-preview.pages.dev` bleibt bewusst leer.
- Freigegeben (Stand 22.10.): Maximilian Dieringer, Santino Schrader, Simon Fuhrbach. Maximilian Seipl fehlt noch. Weitere Personen kommen in Zero Trust → Access → Applications → `endpoint-preview` → Policies dazu.
- Umzug auf ein Firmenkonto: dort ein Pages-Projekt anlegen und `deploy:vorschau` mit dem neuen Projektnamen ausführen.

## Stand

Vorschau, nicht öffentlich: `noindex`, Hinweis „Vorschau. Nicht öffentlich.“ unten links. Formular versendet noch nichts. Impressum, Datenschutz, Rechtsform, Domain, Team-Rollen und Video sind Platzhalter.
