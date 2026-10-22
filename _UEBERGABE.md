# Übergabe für den nächsten Chat (Produkt-App)

**Stand:** Donnerstag, 22. Oktober 2026, spät. Geschrieben von Claude für Maxi S.
**Zuerst lesen:** `CLAUDE.md`, `_STATUS.md`, `product/README.md`, `product/app/CLAUDE.md`, `product/app/src/ui/README.md`. Danach diese Datei.

## 1. Wo wir stehen

Demo auf `main` und online (https://schlusswerk-demo.maximilian-seipl.workers.dev, Zugang per E-Mail-Code). Am 22.10. spät mit vier parallelen Sitzungen gebaut und gemergt:

| Was | PR |
|---|---|
| `anordnung.css` in sieben Bereichsdateien geteilt (`rahmen`, `marken`, `ablauf`, `tabellen`, `befund`, `beleg`, `zeitachse`), pixelgleich | #24 |
| Ablauf 1 bis 4 auf der Projektübersicht: Spalten auf einer Linie, je Schritt die echte Zahl und ein Link; Vorprüfung als Kennzahl; rechts Eigenschaftenliste statt Kästen | #27 |
| Politur: keine Ampelpunkte in der Seitenleiste, Status nur als Wort, „Synthetisch“ ruhig, Beweiskette schlicht, Freigabeleiste springt nicht, Chat in Szene und Beleg gleich ausgerichtet (Monteur rechts) | #28 |
| Tabellen: eine Zeilenhöhe 36 px, Kopf 32 px, feste Spalten, nichts verschiebt sich (gemessen); Matrix ohne „kein Beleg“; Ledger mit „Nächste AR“ | #29 |
| Zentrale Tokens für Schriftgrößen und Tabellenkopf, alte Stile gelöscht | #33 |
| Prüfbefunde: Beweiskette ohne Dubletten und nach Datum, Gruppensummen aus dem Rechenkern, Links mit Schrägstrich | #35 |

Ein unabhängiger Prüfer hat danach alles angesehen: alle Beträge der 8 Projekte stimmen centgenau mit `product/docs/Demo_Faelle.md`, 313 Links ohne 404, keine „·“, Gedankenstriche oder „Claim“ im sichtbaren Text, kein Muss-Befund.

Website-Check (nur gelesen): `docs/research_notes/Website_Check_2026-10-22.md`. Kern, vom Haupt-Chat nachgemessen: Die Website zeigt für „Projekt Wien 21“ einmal 5.546 € und einmal 27.410 €, Elektro-Posten statt HKLS, Beträge, die nicht in `Demo_Faelle.md` stehen, Projekte in Linz und Graz, „kein verdienter Euro vergessen“; der Vertrauensteil fehlt. Website gehört Maxi D., Änderungen dort nur nach Absprache im Team.

**Name und Logo stehen (22.10., Maxi S.): Tieout.**, Domain tieout.at (noch nicht live). Logo als SVG schon in `website/components/ui/Logo.tsx` (zwei Plan-Ecken in Tinte, Quadrat in Ultramarin, Wortmarke „Tieout“ mit ultramarinem Punkt). Die App heißt noch „Schlusswerk“ und nutzt „H“ als Platzhalter-Marke.

## 2. Aufträge von Maxi S. für den nächsten Chat

Reihenfolge von Claude vorgeschlagen. Ziel danach: Produkt fertig für das Launch-Video (Details dazu später von Maxi S.).

1. **Rebranding auf Tieout. in der App:** Marke oben in der Seitenleiste mit Logo aus `website/components/ui/Logo.tsx` (als Bauteil in `src/ui/`, nicht kopiert und verändert), Seitentitel, sichtbare Texte, `product/README.md`. Interne Namen (Repo, Paket `schlusswerk`) bleiben vorerst.
2. **UI an die Website angleichen, professionell bleiben:** CI der Website steht in `website/app/globals.css` (Papier #F4F6F9, Tinte #0A1020, Ultramarin #1D3BFF, Schrift Inter Tight, Mono IBM Plex Mono) und `website/STRUKTUR.md`. Nur in `tokens.css` und `bauteile.css` ändern, damit alle Bildschirme mitziehen. Offene Entscheidung für Maxi S.: Maxi S. wollte „weißen Grund“, die Website nutzt Papier #F4F6F9. Vorschlag: Inhalt weiß, Seitenleiste und Kopf in Papier, Tinte als Text und Primärknopf, Ultramarin nur als Akzent (Auswahl, Links, Markierung). Vorher und nachher Screenshots hell und dunkel.
3. **Professioneller Link:** heute `schlusswerk-demo.maximilian-seipl.workers.dev`. Vorschlag: `app.tieout.at` als eigene Domain des Workers, sobald tieout.at bei Cloudflare liegt (Cloudflare Access dann auf die neue Adresse umstellen). Übergang ohne Domain: Worker in `product/app/wrangler.jsonc` umbenennen (z. B. `tieout-demo`) bleibt unter `maximilian-seipl.workers.dev`, das ist kaum besser. Schritte im Cloudflare-Dashboard macht Maxi S. selbst; Claude bereitet vor und schreibt die Anleitung. Nach außen, also erst mit Go.
4. **Flüssig und schnell:** erst messen, dann ändern. Ladezeit und Größe je Seite (online und lokal mit `npm run build`), Klickzeiten bei Filtern im Ledger (380 Zeilen) und in der Matrix, Wechsel zwischen Befunden. Ziel und Ergebnis als Zahlen vorher und nachher.
5. **Zuruf-Agent von Santino einbauen:** eigener Chat oder eigene Sitzung mit dem Prompt im Anhang. Erst nach Punkt 1 und 2, weil der Einbau Szene und Zeitachse berührt.
6. **Rest aus dem Prüfbericht** (Sollte und Kann):
   - Handy (600 px): Firmenliste zeigt nur eine Betragsspalte ohne Kopf, Ampel und Datum fehlen; Ledger rechts abgeschnitten ohne Hinweis; obere Leiste abgeschnitten, Projektname fehlt im Pfad.
   - Rechenweg auf der Befundseite passt nicht zu den anderen Tabellen (37 px, ohne Kopf, graue Fußzeile, Betrag mal mittig, mal rechts).
   - Kennzahlen wirken wie ein Kasten (Linien oben, unten, Trenner).
   - Titelgrößen uneinheitlich (Projekt 20 px, Befund und Beleg 15 px).
   - „0 von 14 freigegeben“ steht über „Zu entscheiden 15“ (der Fall „Braucht Anwalt“ zählt nur unten).
   - Szene sagt „Danke. So habe ich es verstanden: …“, die Belegseite dieselbe Sache mit anderem Wortlaut.

## 3. Offen, wartet auf Go von Maxi S.

- Szene: Lösungsliste sagt „Heizkörper im Wohnzimmer versetzt“, die App „Heizkörper versetzt“ (Feld `taetigkeit` von Z6). Entweder Datensatz oder Lösungsliste anpassen.
- `npm run build` empfiehlt ein Sicherheits-Update von Next.js (`next upgrade --agent=security`). Eigener Schritt.
- PR #25 (Zuruf-Agent, Santino): Cloudflare-Prüfung war rot, Ursache noch nicht geklärt. Siehe Anhang.

## 4. Wie parallel arbeiten

Bewährt am 22.10.: Der Haupt-Chat macht zuerst die gemeinsamen Dateien (`tokens.css`, `bauteile.css`, Marke), merged, und startet dann Sitzungen mit eigenem Worktree, die nur ihre Dateien berühren. Dateien je Bereich stehen in `product/app/CLAUDE.md`. Wünsche an `tokens.css` und `bauteile.css` schreiben die Sitzungen in ihren PR unter „Für den Haupt-Chat“, der Haupt-Chat sammelt sie in einem PR. Der Haupt-Chat merged nacheinander, prüft nach jedem Merge, am Ende ein unabhängiger Prüfer.

Vorschlag für den nächsten Chat: erst Punkt 1 und 2 im Haupt-Chat (gemeinsame Dateien). Dann parallel: Zuruf-Agent (Anhang), Tempo (Messung, `next.config`, Datenzugriff), Restliste Prüfbericht (Tabellen, Befund, Ablauf). Link (Punkt 3) mit Maxi S. im Haupt-Chat.

## 5. Arbeitsweise, die sich bewährt hat

- **Ablauf je Bildschirm:** bauen, im Browser prüfen (hell, dunkel, 1440 px, schmal), fixen, PR, bei grüner CI selbst mergen (Erlaubnis Maxi S.).
- **Dev-Server:** `.claude/launch.json` (ignoriert) mit `{"name":"app-dev","runtimeExecutable":"npm","runtimeArgs":["--prefix","product/app","run","dev","--","-p","3100"],"port":3100}`, Start mit `preview_start` „app-dev“. Sitzungen in Worktrees nehmen eigene Ports (3101 und folgende).
- **`npm run build` überschreibt `.next` des Dev-Servers:** danach Dev-Server neu starten.
- **Screenshots:** `node product/app/scripts/qa/shot.mjs <name> <url> <breite,höhe> [dunkel]` (Edge headless, Ablage `product/app/qa-shots/`, ignoriert). Pixelvergleich mit `sharp` (liegt in `node_modules`) zeigt genau, wo sich etwas ändert. Das orange Abzeichen „1 Insight“ unten links ist das Next.js-Entwicklerwerkzeug, nicht die App.
- **Vergleich bei reinen Umbauten:** CSS-Regeln mit `postcss` vorher und nachher als Menge vergleichen, dazu Screenshots.
- **CI:** GitHub Actions „pruefen“ plus Cloudflare-Vorschau je Branch, beide rund 1 Minute.
- Regeln, die oft greifen: keine „·“ und keine Gedankenstriche im sichtbaren Text, Farben nur aus `tokens.css`, Inline-Stile nur für Spaltenbreiten (`fundament.test.ts`), Beträge nur aus dem Rechenkern, keine Summen in der Oberfläche.

## 6. Startprompt für den neuen Chat

> Ich bin Maxi S. Lies `_UEBERGABE.md` und die dort genannten Dateien, hol den neuesten Stand von main. Dann Abschnitt 2 abarbeiten, parallel wie in Abschnitt 4: zuerst Rebranding auf Tieout. und die Angleichung an die Website im Haupt-Chat (zeig mir vorher den Vorschlag zu Farben und Grund), dann die Sitzungen starten und orchestrieren, den Zuruf-Agenten mit dem Prompt im Anhang. Profi-Niveau wie Linear, Attio, reebuild, flüssig und schnell. Wenig Text, keine „·“ und keine Gedankenstriche. Beträge nur aus dem Rechenkern, die Lösungsliste ändert sich nur mit meinem Go. Nichts nach außen (Domain, Cloudflare, Kosten) ohne mein Go. PRs bei grüner CI selbst mergen. Sag mir am Ende ehrlich, ob das Produkt bereit für das Launch-Video ist. Deutsch, einfach, Ergebnis zuerst.

## Anhang: Prompt für den Einbau des Zuruf-Agenten (Santino, PR #25)

Vom Haupt-Chat am 22.10. aus Santinos Fassung überarbeitet: Cloudflare-Prüfung klären, fünf Fragen vor dem Go (Datenmodell, Server-Teil, Beträge, Ablage, Kosten), neue Stilregeln.

---

Lies zuerst `CLAUDE.md` (Repo-Wurzel), `_UEBERGABE.md`, `product/app/CLAUDE.md`, dann `product/zuruf/CLAUDE.md`, `product/zuruf/UEBERGABE.md` und `product/zuruf/PLAN.md` (Abschnitt „Integration“). Hol vorher den neuesten Stand von main. Deutsch, einfach, Ergebnis zuerst.

### Kontext

Santino hat in Pull Request #25 (`zuruf/plan` nach `main`) den Prototyp des Zuruf-Agenten gebaut, im eigenen Ordner `product/zuruf/`: Ein Monteur meldet per WhatsApp (hier noch Simulator) Foto, Sprache oder Text, der Agent fragt höchstens zweimal nach, fasst zusammen, der Absender bestätigt mit „Passt“, gespeichert wird ein Leistungsereignis, bei dem jede Angabe ein wörtliches Zitat als Quelle hat. Die KI liest nur, die Gesprächsführung ist fester Code (`src/agent.ts`). 42 Unit-Tests, Lernschleife mit 50 Szenarien, Abnahme auf zurückgehaltenen Szenarien 9/10. `product/app` und `product/docs` fasst der PR nicht an.

### Aufgabe 1: PR #25 prüfen und mergen

1. `git fetch origin`, Branch `zuruf/plan` in einem eigenen Worktree auschecken. In `product/zuruf`: `npm ci`, `npm run typecheck`, `npm test` (muss grün sein, braucht keine KI).
2. Prüfen, dass der PR nichts außerhalb von `product/zuruf/` ändert (außer einer Zeile in `_STATUS.md`) und keine `.env`, Schlüssel oder echten Daten enthält (auch nicht in der Git-Historie des Branches).
3. Die Cloudflare-Prüfung „Workers Builds“ war auf #25 rot (Stand 22.10.). Ursache finden und mir sagen, ob sie vom PR kommt. Wenn ja: im PR beheben. Nur mit grüner CI mergen. Dann main holen.

### Aufgabe 2: Agent in die App einbauen (eigener Branch, eigener PR)

Ziel: In der App (`product/app`) läuft statt der vorgespielten WhatsApp-Szene auf Wunsch der echte Agent, und seine Einträge erscheinen in Zeitachse, Ordner und Liste „offen“ mit Quelle. Solange der Schalter aus ist, darf sich die Demo nicht verändern.

**Schritt 1: lesen und vorschlagen, nichts ändern.** Lies `product/app/src/domain/typen.ts` (dort gibt es schon den Typ `Zuruf`), `src/daten/zeitachse.ts`, `src/daten/ordner.ts`, `src/engine/belegquelle.ts`, `src/engine/befunde.ts` (Regie aus Zuruf), die Szene `src/ui/ZurufSzene.tsx` und `product/zuruf/src/typen.ts` (Leistungsereignis, Angabe mit Zitat). Dann schlag mir in kurzen Absätzen vor und warte auf mein Go:

1. **Datenmodell:** Wie bildet sich ein Leistungsereignis auf den App-Typ `Zuruf` ab? Eine Abbildung, kein zweiter Parallel-Typ.
2. **Server:** Die App ist heute eine rein statische Seite (`output: "export"` in `next.config`, Cloudflare liefert nur Dateien aus). Route Handler und Server Actions gibt es dort nicht. Schlag vor, wo die KI-Aufrufe laufen, ohne dass der API-Schlüssel je in den Browser kommt (z. B. ein kleiner eigener Cloudflare Worker nur für den Agenten neben der statischen Seite), und was das für den Build heißt. Die statische Demo muss so bleiben, wie sie ist.
3. **Beträge:** Der Agent liefert nie Beträge. Entscheide mit mir, ob ein neuer Zuruf in der App ohne Betrag erscheint (nur „offen, Regiebericht fehlt“) oder ob der Rechenkern einen Betrag rechnet und der Posten dann deutlich als „nicht Teil der Demo-Fälle“ markiert ist. Die Summen der Demo (Lösungsliste) dürfen sich dabei nie ändern.
4. **Ablage:** Neue Einträge liegen im Browser wie die Freigaben (`src/zustand/speicher.ts`), keine Datenbank. Wie kommen sie in die vorberechneten Listen (Zeitachse, Ordner, „offen“)? Welche Teile laufen dafür im Browser?
5. **Kosten und Schutz:** Online kostet jeder Chat Geld über den API-Schlüssel. Schlag eine Obergrenze vor (z. B. Nachrichten pro Tag). Online bleibt der Schalter aus, bis ich Go gebe.

**Schritt 2: umsetzen (erst nach meinem Go).**

- Den Agenten als Bibliothek nutzen, nicht kopieren: `product/zuruf/src/agent.ts`, `verstehen.ts`, `belege.ts`, `texte.ts`, `speicher.ts` sind frei von UI. Die Firma (`product/zuruf/src/firma.ts`) ist vorläufig: Projekte kommen aus dem Firmen-Datensatz der App (`src/demo/firma`), nicht doppelt gepflegt.
- Schalter `ZURUF_ECHT` (Standard aus). Aus: alles wie heute, vorgespielte Szene. An: Die Szene wird ein echter Chat gegen den Agenten. Gespeicherte Einträge landen in der Zeitachse und, wenn etwas fehlt, auf der Liste „offen“, jeweils mit Klick auf das Original (Nachricht und Zitat).
- KI nur serverseitig. `ZURUF_KI=abo` startet `claude -p` und nutzt `node:fs`, das ist nur zum lokalen Testen. Online nur `ZURUF_KI=api` mit dem Schlüssel als Cloudflare-Secret. Teile mit `node:fs` oder `node:child_process` sauber vom Rest trennen, damit sie nie im Worker oder im Browser landen.
- Wenn etwas an Agent oder Gesprächsführung nicht passt: nicht in der App umbauen, sondern in `product/zuruf/LERNEN.md` eintragen und in `product/zuruf` beheben, mit Test.

**Harte Regeln**

- Beträge nur aus dem Rechenkern und `product/docs/Demo_Faelle.md`. Die Lösungsliste nicht ändern. Die 6 Zurufe der Demo bleiben, wie sie sind.
- UI nur aus `product/app/src/ui` und den Stilen in `src/ui/styles/` (Szene und Zeitachse in `zeitachse.css`). `tokens.css` und `bauteile.css` nur ergänzen, wenn nötig. `fundament.test.ts` bleibt grün. Ruhig wie der Rest: wenig Text, keine Kästen, keine „·“ und keine Gedankenstriche.
- Nur synthetische Daten. Keine Auswertung pro Mitarbeiter (§ 96a ArbVG). Das Wort „Claim“ nirgends.
- Die Szenarien in `product/zuruf/szenarien/zurueck/` nicht lesen (Abnahme).

**Vor dem PR**

- In `product/app`: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` grün. In `product/zuruf`: `npm test` grün.
- Mit `ZURUF_ECHT` aus sieht die App exakt aus wie vorher: Screenshots vorher und nachher mit `product/app/scripts/qa/screens.mjs` oder `shot.mjs`, Pixel vergleichen.
- Mit `ZURUF_ECHT` an einmal lokal einen echten Zuruf durchspielen und mir Screenshots von Chat, Zeitachse und Liste „offen“ zeigen.
- Danach `product/README.md` (Abschnitt „Stand“) und `product/zuruf/UEBERGABE.md` nachziehen. PR bei grüner CI selbst mergen.
