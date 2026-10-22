# Website

Öffentliche Website von **tieout** (klein, ohne Punkt): Next.js 16 mit statischem Export, Deutsch und Englisch, ohne Abhängigkeit zum Produktcode. Struktur, CI und Platzhalter-Regeln: [`STRUKTUR.md`](STRUKTUR.md).

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
| `npm run deploy` | baut und lädt auf Cloudflare Pages (Projekt `tieout-at`) |
| `npm run check:platzhalter` | listet alle `[[PLATZHALTER]]`. Vor dem Livegang muss die Liste leer sein |

## Aufbau

```
app/(de)/            Deutsch: /, /impressum, /datenschutz
app/(en)/en/         Englisch: /en, /en/impressum, /en/datenschutz
app/globals.css      Design-Tokens (Papier, Tinte, Ultramarin), Raster, alle Styles
components/nav/      Header mit DE/EN, Messpunkt-Navigation
components/sections/ Abschnitte: Hero, Lösung, Video, Team, Demo
components/flow/     animierter Ablauf Eingänge → Zwilling → Schlussrechnung (SVG, Beispielprojekte wechseln alle 5 s)
components/problem/  Projekt-Zeitleiste mit Schalter Heute | Mit tieout
components/ui/       Logo, Maßkette, Platzhalter, Einblenden, Fit (Laptop-Anordnung am Handy verkleinert)
messages/            alle Texte: de.json, en.json
public/hero/         Hero-Fotos (Unsplash, Quellen in QUELLEN.md)
public/team/         Teamfotos (LinkedIn, mit Zustimmung des Teams)
public/logos/        Logos von Hochschulen und Arbeitgebern, in Ultramarin eingefärbt
```

Texte nur in `messages/` ändern, nie im Code. Neue Platzhalter immer als `[[PLATZHALTER: …]]` (Deutsch) bzw. `[[PLACEHOLDER: …]]` (Englisch).

## Online

**https://tieout-at.pages.dev** (Deutsch) und `/en/` (Englisch). Offen erreichbar, ohne Passwort (Entscheidung Maxi D., 22.10.2026).

- Gehostet im privaten Cloudflare-Konto von Maxi D., Pages-Projekt `tieout-at` (`tieout.pages.dev` war bei Cloudflare schon vergeben). Das alte Projekt `endpoint-preview` leitet alle Adressen per 301 auf `tieout-at.pages.dev` weiter.
- Eigene Domain **tieout.at** (registriert bei easyname, 22.10.2026). In Cloudflare als Zone angelegt (Free), `tieout.at` und `www.tieout.at` als CNAME auf `tieout-at.pages.dev` und als Custom Domains am Pages-Projekt `tieout-at`. Offen: bei easyname die Nameserver auf `cheryl.ns.cloudflare.com` und `hugh.ns.cloudflare.com` umstellen. Erst dann ist die Seite unter tieout.at erreichbar.
- `npm run deploy` aktualisiert die öffentliche Seite.
- Geschützte Vorschau: entfällt vorerst. Der Cloudflare-Access-Schutz hing am alten Projekt. Wer sie wieder braucht, legt im Cloudflare-Dashboard unter Zero Trust eine Access-Anwendung für `vorschau.tieout-at.pages.dev` an und ergänzt ein Skript mit `--branch vorschau`.
- `noindex` bleibt gesetzt: Suchmaschinen nehmen die Seite nicht auf. Wer den Link hat, kann sie aber öffnen.
- Umzug auf ein Firmenkonto: dort ein Pages-Projekt anlegen und die Skripte mit dem neuen Projektnamen ausführen.

## Stand

Vorschau, per Link öffentlich erreichbar, `noindex`. Hinweis „Vorschau“ unten links. Offen: Formular und Kalender versenden noch nichts, Impressum, Datenschutz, Rechtsform und Video sind Platzhalter, das Postfach kontakt@tieout.at existiert noch nicht, tieout.at wartet auf die Nameserver-Umstellung bei easyname.
