# Übergabe für den nächsten Chat (Produkt-App)

**Stand:** Donnerstag, 22. Oktober 2026, nachts. Geschrieben von Claude für Maxi S.
**Zuerst lesen:** `CLAUDE.md`, `_STATUS.md`, `product/README.md`, `product/app/CLAUDE.md`, `product/app/src/ui/README.md`. Danach diese Datei.

## 1. Wo wir stehen

Die erste Version der Demo ist auf `main` und online (https://schlusswerk-demo.maximilian-seipl.workers.dev, Zugang per E-Mail-Code). Gebaut und gemergt am 22.10.:

| Bildschirm | Route | PR |
|---|---|---|
| Seitenleiste neu: Firma oben, Projekte als Baum mit Ampelpunkt | alle | #14 |
| Zeitachse mit Filtern, Beleg im Original je Eintrag | `/projekte/[p]/zeitachse`, `/projekte/[p]/ordner/[beleg]` | #15 |
| WhatsApp-Szene (vorgespielt, Z6 wird Eintrag in der Zeitachse) | in der Zeitachse, Knopf „Zuruf vorspielen“ | #16 |
| Ledger mit allen 380 Positionen, Filter, Suche | `/projekte/[p]/ledger` | #18 |
| Ordner mit Belegmatrix (Position × Belegart, Sprung zur Zeile im Original) und Dokumentliste | `/projekte/[p]/ordner` | #20 |

Ein unabhängiger Prüfer hat alles einmal angesehen: Beträge aller 8 Projekte stimmen mit `product/docs/Demo_Faelle.md`, keine kaputten Links. Seine Muss- und Sollte-Befunde sind eingearbeitet (#20).

Nebenbei fertig: Zielgruppe (`docs/research_notes/Zielgruppe_Challenge.md`, #17 gemergt; Empfehlung: ein Gewerk, 20 bis 100 Leute, Wien und NÖ). Name und Logo (`docs/research_notes/Name_und_Logo.md`, **#19 offen**, Entscheidung im Team; Empfehlung Lotwerk vor Testat und Schlusswerk, „EndPoint.“ fällt durch).

## 2. Offen aus dem Prüfbericht (bewusst nicht gemacht)

- Szene: Lösungsliste sagt „Heizkörper im Wohnzimmer versetzt“, die App sagt „Heizkörper versetzt“ (das Feld `taetigkeit` von Z6 enthält „im Wohnzimmer“ nicht). Lösung nur mit Go von Maxi S.: entweder Datensatz anpassen oder Lösungsliste.
- Viele Größen in `anordnung.css` sind rohe px-Werte statt Tokens (Radius, Schriftgrößen 11/12 px).
- Vier LV-Kurztexte im Katalog enthalten „DN 15–25“ (Bis-Strich). `fundament.test.ts` prüft nur Code, nicht Daten.
- Chat in Szene (Sicht des Monteurs) und auf der Beleg-Seite (Sicht des Agenten) sind spiegelverkehrt.
- `npm run build` meldete eine Empfehlung von Next.js für ein Sicherheits-Update (`next upgrade --agent=security`). Nicht ausgeführt, eigener Schritt mit Go.

## 3. Aufträge von Maxi S. für den nächsten Chat

Wortlaut sinngemäß, Reihenfolge von Claude vorgeschlagen:

1. **Website ansehen** (https://endpoint-preview.pages.dev/en/#loesung, Code in `website/`): Ist die erste Version gut, und **ergibt das Produkt überhaupt Sinn**? Ehrlich challengen, mit Zielgruppen-Notiz (#17) abgleichen.
2. **Die Schritte 1 bis 4 als professioneller Ablauf** (heute `Schrittleiste.tsx` auf der Projekt-Übersicht: Einlesen, Datensätze, Abgleich, Prüfen und Freigeben). Soll eindrucksvoller aussehen, aber seriös, kein KI-Kitsch. Vorlagen suchen (reebuild, Linear, Attio, Ramp, Stripe), dann entscheiden. Auch auf der Website so zeigen, wenn es dort passt.
3. **Alle Tabellen professionell:** Abstände wie Linear und Attio (dicht, gleichmäßig verteilt, keine zu großen Lücken), gleiche Zeilenhöhen, nichts verschiebt sich beim Öffnen und Schließen (Filter, Szene, Seitenleiste ein- und ausklappen, Freigabe). Betrifft `BefundTabelle.tsx`, `LedgerTabelle.tsx`, `Ordner.tsx`, Projektliste in `src/app/page.tsx`, Rechenweg und Kaskade.
4. **UI-Politur gegen KI-Kitsch:** zu viele Punkte und Punkt-Labels (`sw-dotlabel`, Ampelpunkte, „kein Beleg“), wiederholte Hinweise, unruhige Farben. Ruhiger, weniger Text.

## 4. Wie parallel arbeiten (ohne Merge-Konflikte)

Maxi S. will, dass der Haupt-Chat orchestriert und Teile in parallelen Sitzungen laufen. Hauptrisiko für Konflikte: **eine große gemeinsame Datei `product/app/src/ui/styles/anordnung.css` (1.222 Zeilen)** und `bauteile.css`. Vorschlag:

1. **Erst im Haupt-Chat (ein PR, vor allem anderen):** `anordnung.css` in Dateien je Bereich teilen, ohne Inhalt zu ändern, z. B. `styles/rahmen.css` (Seitenleiste, Kopf, Layout), `styles/tabellen.css` (alle Tabellen, Ledger, Matrix), `styles/ablauf.css` (Schrittleiste, Übersicht), `styles/zeitachse.css` (Zeitachse, Szene), `styles/beleg.css` (Betrachter, Belegseite). Import in `src/app/globals.css`. Screenshots vorher und nachher vergleichen. Mergen.
2. **Dann parallel, je eigene Sitzung mit eigenem Worktree und Branch**, jede berührt nur ihre Dateien:
   - Tabellen: `tabellen.css`, `BefundTabelle.tsx`, `LedgerTabelle.tsx`, `Ordner.tsx`, Tabelle in `src/app/page.tsx`.
   - Ablauf 1 bis 4: `ablauf.css`, `Schrittleiste.tsx`, `src/app/projekte/[projekt]/page.tsx` (ohne deren Tabelle anzufassen, oder die Tabelle dort zuerst in ein Bauteil auslagern).
   - Politur gegen KI-Kitsch: `rahmen.css`, `zeitachse.css`, `Seitenleiste.tsx`, `Zeitachse.tsx`, `Statusmarke.tsx`.
   - Website-Check: nur lesen und Bericht, oder nur `website/`.
   `tokens.css` und `bauteile.css` gehören dem Haupt-Chat: Wer ein neues Token braucht, meldet es, der Haupt-Chat ergänzt es zentral.
3. Haupt-Chat merged nacheinander, prüft nach jedem Merge im Browser, am Ende ein unabhängiger Prüfer.

## 5. Arbeitsweise, die sich bewährt hat

- **Ablauf je Bildschirm:** bauen, im Browser prüfen (hell, dunkel, 1440 px, schmal), fixen, PR, bei grüner CI selbst mergen (Erlaubnis Maxi S.). Prüfer nur einmal am Ende.
- **Dev-Server mit Hot Reload:** `.claude/launch.json` (nicht im Repo, ist ignoriert) braucht den Eintrag `{"name":"app-dev","runtimeExecutable":"npm","runtimeArgs":["--prefix","product/app","run","dev","--","-p","3100"],"port":3100}`. Start mit dem Browser-Werkzeug `preview_start` `app-dev`.
- **`npm run build` überschreibt `.next` des Dev-Servers:** danach den Dev-Server neu starten, sonst Fehlermeldungen und falsche Screenshots.
- **Screenshots:** Das Browser-Fenster der App ist klein. Große Bilder mit `node product/app/scripts/qa/shot.mjs <name> <url> <breite,höhe> [dunkel]` (Edge headless, wartet auf die Datei, legt sie nach `product/app/qa-shots/`, ignoriert). Interaktionen (Klicks, Szene) mit dem Browser-Werkzeug und `javascript_tool` prüfen; der erste Klick kurz nach dem Laden geht manchmal vor der Hydration verloren.
- **CI:** GitHub Actions „pruefen“ plus Cloudflare-Vorschau je Branch, beide rund 1 Minute.
- Regeln, die oft greifen: keine „·“ und keine Gedankenstriche im sichtbaren Text, Farben nur aus `tokens.css`, Inline-Stile nur für Spaltenbreiten (`fundament.test.ts` prüft das), Beträge nur aus dem Rechenkern, keine Summen in der Oberfläche.

## 6. Startprompt für den neuen Chat

> Ich bin Maxi S. Lies `_UEBERGABE.md` und die dort genannten Dateien, hol den neuesten Stand von main. Dann: Abschnitt 3 abarbeiten, parallel wie in Abschnitt 4 (zuerst die CSS-Teilung im Haupt-Chat, dann die Sitzungen starten und orchestrieren). Profi-Niveau wie Linear, Attio, reebuild. Weißer Grund, keine Kästen, wenig Text, keine „·“ und keine Gedankenstriche. Beträge nur aus dem Rechenkern, die Lösungsliste ändert sich nur mit meinem Go. PRs bei grüner CI selbst mergen. Deutsch, einfach, Ergebnis zuerst.
