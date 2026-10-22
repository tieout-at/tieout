# Website

Arbeitstitel **Tieout.** Struktur, CI und Platzhalter-Regeln: [`STRUKTUR.md`](STRUKTUR.md).

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
components/sections/ Abschnitte: Hero, Lösung, Video, Team, Demo
components/flow/     animierter Ablauf Eingänge → Zwilling → Schlussrechnung (SVG, läuft von selbst)
components/ui/       Maßkette, Platzhalter, Einblenden
messages/            alle Texte: de.json, en.json
public/hero/         Hero-Fotos (Unsplash, Quellen in QUELLEN.md)
public/team/         Teamfotos (LinkedIn, mit Zustimmung des Teams)
public/logos/        Logos von Hochschulen und Arbeitgebern, in Ultramarin eingefärbt
```

Texte nur in `messages/` ändern, nie im Code. Neue Platzhalter immer als `[[PLATZHALTER: …]]` (Deutsch) bzw. `[[PLACEHOLDER: …]]` (Englisch).

## Online

**https://endpoint-preview.pages.dev** (Deutsch) und `/en/` (Englisch). Offen erreichbar, ohne Passwort (Entscheidung Maxi D., 22.10.2026).

- Gehostet im privaten Cloudflare-Konto von Maxi D., Pages-Projekt `endpoint-preview`.
- Eigene Domain **tieout.at** (registriert bei easyname, 22.10.2026). In Cloudflare als Zone angelegt (Free), `tieout.at` und `www.tieout.at` als CNAME auf `endpoint-preview.pages.dev` und als Custom Domains am Pages-Projekt. Offen: bei easyname die Nameserver auf `cheryl.ns.cloudflare.com` und `hugh.ns.cloudflare.com` umstellen. Erst dann ist die Seite unter tieout.at erreichbar.
- `npm run deploy` aktualisiert die öffentliche Seite.
- `npm run deploy:geschuetzt` lädt nur auf `vorschau.endpoint-preview.pages.dev`. Diese Adresse bleibt per Cloudflare Access geschützt (Login per Mail-Code) und eignet sich für Entwürfe, die noch nicht offen sein sollen.
- `noindex` bleibt gesetzt: Suchmaschinen nehmen die Seite nicht auf. Wer den Link hat, kann sie aber öffnen.
- Umzug auf ein Firmenkonto: dort ein Pages-Projekt anlegen und die Skripte mit dem neuen Projektnamen ausführen.

## Stand

Vorschau, per Link öffentlich erreichbar, `noindex`. Hinweis „Vorschau“ unten links. Formular versendet noch nichts. Impressum, Datenschutz, Rechtsform, Domain, Team-Rollen und Video sind Platzhalter.
