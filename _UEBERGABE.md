# Übergabe für den nächsten Chat (Produkt-App)

**Stand:** Freitag, 23. Oktober 2026. Repository heißt jetzt `tieout-at/tieout` auf GitHub (alte Adresse leitet weiter). Geschrieben von Claude für Maxi S.
**Zuerst lesen:** `CLAUDE.md`, `_STATUS.md`, `product/README.md`, `product/app/CLAUDE.md`, `product/app/src/ui/README.md`. Danach diese Datei.

## 1. Wo wir stehen

App **tieout** (klein, ohne Punkt) auf `main`, online und **offen** unter **https://app.tieout.workers.dev** (endgültige Adresse, steht in der Abgabe-Mail an die Juroren, 23.10.). Cloudflare Access schützt nur noch die Vorschau-Adressen der Branches („Previews only“). Jeder Merge auf main ist nach 2 bis 3 Minuten für die Juroren sichtbar, deshalb nach jedem Merge im Browser prüfen. Worker und Subdomain nicht umbenennen und nicht in ein anderes Cloudflare-Konto umziehen, sonst ändert sich die Adresse. Am 22./23.10. gebaut und gemergt:

| Was | PR |
|---|---|
| Marke tieout: Logo und Wortmarke in der Seitenleiste (`src/ui/Logo.tsx`, Geometrie wie die Website), Akzent Ultramarin #1D3BFF. Grautöne, Grund, Dunkelmodus bewusst unverändert | #41, #49 |
| Zuruf-Agent von Santino (Paket `product/zuruf`) | #25 |
| Restliste Prüfbericht: Handy, Rechenweg als Tabelle, Kennzahlen ohne Kasten, ein Seitentitel, Zählung „von 14“ | #48 |
| Einstellungen (Thema, Freigaben zurücksetzen) statt „Demo zurücksetzen“. Anmeldung mit Supabase fertig, aber per Schalter aus | #49 |
| Handy: Projekt im Pfad, obere Leiste blendet rechts aus | #51 |
| Worker heißt `app`, Konto-Subdomain `tieout` | #54 |
| Gruppen einklappen in Firmenliste, Befunden, Ledger (Linear „Group by“), Spalten bleiben stehen | #56 |
| Zuruf-Agent in der App hinter Schalter `ZURUF_ECHT` (Standard aus): echter Chat statt Szene, neue Zurufe ohne Betrag in Zeitachse und Liste „offen“, Ablage im Browser, Grenzen 40 Aufrufe pro Tag und 20 US-Dollar pro Monat. Z6 heißt wie in der Lösungsliste. Lokal mit Abo schon ein echter Zuruf erfolgreich | #50 |
| Tempo: Filter und Suche in Ledger und Matrix 32 bis 72 ms statt 88 bis 176 ms (gemessen von der Sitzung), pixelgleich | #59 |
| Next.js 16.4.2 (Sicherheitsupdate), übrig nur `uuid` mittel über exceljs | #63 |
| Projektlinks mit Schrägstrich (keine 307-Umleitung) | #68 |

**Schlussprüfung 23.10.** (unabhängiger Prüfer auf der Live-Adresse, Ergebnis vom Haupt-Chat nachgesehen): kein Muss-Befund. 297 interne Adressen abgerufen, kein 404. Alle Beträge auf Startseite, 8 Projektseiten, Befundlisten und 21 Befundseiten centgenau wie `Demo_Faelle.md`. Auf allen 284 Seiten kein „·“, kein Gedankenstrich, kein „Claim“, kein Platzhalter, „Synthetisch“ überall, `noindex` überall. Screenshots hell, dunkel, 600 px ohne Fehler. Offene Punkte für den UI-Durchgang und v1.0:
- **Kaskade und Vorprüfung** (Restforderung 170.060,89 €, Leistungssumme, Zahlungen, Abzüge G1 bis G4) stehen auf keiner Seite. Im Rechenkern fertig, Bildschirm folgt in v1.0. Für das Demo-Skript fehlt er.
- **Ledger bei 600 px:** nur 5 von 9 Spalten sichtbar, Rest per Wischen (rechter Rand blendet aus). Für das Handy eine schmale Fassung überlegen.
- **Startseite P6 bis P8:** Ampel und Datum bewusst leer (gelegt oder abgeschlossen, Bedeutung im Gruppenkopf). Prüfen, ob „gelegt 15.09.“ dort hilft.
- **V1 Container 1.180,00 €:** Rechenweg „Lohn 16 h × 56,80 € + Material 271,20 €“ steht nicht in der Lösungsliste (Summe stimmt). Quelle klären oder Rechenweg kürzen; Lösungsliste nur mit Go. Slug `anmeldung-…` passt nicht zu „Verloren“.
- **P2 bis P5:** Zahlungen genau so hoch wie die AR, ohne Nachlass oder Rücklass (anders als W21). Lösungsliste regelt das nicht, fällt nur bei Plausibilität auf.
- **GU-Historie** („gleicher Grund schon in P7“) laut Lösungsliste ab v1.0.

## 2. Aufträge für den nächsten Chat

1. **UI haarscharf überarbeiten** (Maxi S. gibt die Punkte selbst ein). Zuerst, parallel wo sinnvoll. Regeln aus Abschnitt 5 gelten.
2. **API-Schlüssel und Zuruf-Agent online** (Wunsch: jeder mit Link kann den echten Agenten ausprobieren, Budget höchstens 25 €):
   - Maxi S. legt in console.anthropic.com einen Schlüssel „tieout“ an, lädt Guthaben auf und setzt das Monatslimit knapp unter 25 € (die Konsole rechnet in US-Dollar). Claude schreibt dafür eine Klick-Anleitung, Bezahlen und Schlüssel eintragen macht Maxi S.
   - Supabase SQL-Editor: `product/zuruf/worker/supabase.sql` einspielen (Teil 1 Zähler ist Pflicht). Claude darf SQL selbst ausführen (Erlaubnis Maxi S.), danach per Lese-Abfrage prüfen.
   - Cloudflare, Worker `app`, Settings, Variables and Secrets, alles als Secret: `SUPABASE_SECRET_KEY` (geheimer Schlüssel von `tieout-app`), `ANTHROPIC_API_KEY`, zuletzt `ZURUF_ECHT` = `an` (mit Go).
   - Prüfen: `https://app.tieout.workers.dev/api/zuruf/status` zeigt `{"verfuegbar":true}`, in der Zeitachse von W21 heißt der Knopf „Zuruf schicken“. Grenzen im Code: 40 KI-Aufrufe pro Tag, 20 US-Dollar pro Monat, danach still zurück auf die vorgespielte Szene.
3. **Launch-Video planen** (Details von Maxi S.). Das Video darf mehr zeigen als gebaut ist; was in der App fehlt, im Video als Ausblick kenntlich machen, weil Juroren danach selbst klicken.

## 3. Wichtig zu wissen

- **Supabase:** Projekt `tieout-app` (Organisation `tieout`, Frankfurt, Free, Ref `skvctanwhocirlmozmon`), Selbstregistrierung aus, Site-URL und Weiterleitungen auf `app.tieout.workers.dev`. Keine Tabellen außer denen aus `supabase.sql`. Dafür wurde das Projekt `icons` pausiert (Free erlaubt 2 aktive Projekte). Free pausiert nach rund einer Woche ohne Nutzung, dann täglichen Ping einrichten. Standard-Mails gehen nur an Mitglieder der Organisation und höchstens 2 pro Stunde; für Mails an Kunden braucht es eigenen Versand mit Domain tieout.at.
- **Anmeldung** ist fertig, aber aus (`ANMELDUNG_EIN = false` in `product/app/src/anmeldung/konfig.ts`), weil Juroren und Investoren per Link hineinsollen. Einschalten: Schalter auf `true`, Secret `SUPABASE_SECRET_KEY` setzen, Personen in den Einstellungen einladen (Anmeldelink zum Weitergeben). Google-Login ist angefangen (Google-Cloud-Projekt `tieout-login`, Zustimmungsbildschirm fertig, OAuth-Client fehlt), nur nötig, wenn der Login wieder an soll.
- **Datenbank für Dokumente und Fotos** braucht die Demo nicht (synthetische Daten, beim Build erzeugt). Erst für echte Firmen (nach Gate R4 und Betriebsrat): Tabellen je Firma mit RLS, Fotos in Supabase Storage.
- **Domain app.tieout.at:** geht erst, wenn die Zone tieout.at im selben Cloudflare-Konto liegt wie die App (heute Konto Maxi D., App im Konto Maxi S.). Mit Maxi D. klären: gemeinsames Konto oder Umzug.
- **Claude Code lokal:** Für den Zuruf-Agenten mit Abo (`ZURUF_KI=abo`) muss `claude` angemeldet sein. Am 22.10. war die Anmeldung abgelaufen; neue Version liegt in `C:\Users\maxis\.local\bin`.

## 4. Wie parallel arbeiten

Bewährt am 22./23.10.: Der Haupt-Chat macht gemeinsame Dateien (`tokens.css`, `bauteile.css`, `layout.tsx`, `Seitenleiste.tsx`, `Zeilennavigation.tsx`, Worker), merged und startet dann Sitzungen mit eigenem Worktree, die nur ihre Dateien berühren. Sitzungen mergen nicht selbst, sondern melden; der Haupt-Chat merged nacheinander und prüft nach jedem Merge. Ändert sich main unter einer Sitzung, schickt der Haupt-Chat ihr genau, welche Dateien betroffen sind.

Lehre: Messsitzungen (Tempo) brauchen eine Zeitgrenze im Auftrag, sonst messen sie über eine Stunde.

## 5. Arbeitsweise, die sich bewährt hat

- **Ablauf je Bildschirm:** bauen, im Browser prüfen (hell, dunkel, 1440 px, schmal), fixen, PR, bei grüner CI selbst mergen (Erlaubnis Maxi S.).
- **Dev-Server:** `.claude/launch.json` (ignoriert), Start mit `preview_start` „app-dev“. Läuft schon ein Dev-Server in diesem Ordner (anderer Chat), den nutzen; Next.js startet keinen zweiten. Sitzungen in Worktrees nehmen eigene Ports (3102 und folgende).
- **Klicktests im echten Browser:** Claude in Chrome (Maxis Edge) auf `http://localhost:3100`, Messung per JavaScript (Spaltenbreiten, sichtbare Zeilen).
- **Screenshots:** `node product/app/scripts/qa/shot.mjs <name> <url> <breite,höhe> [dunkel]`, Pixelvergleich mit `sharp`.
- **Paketliste unter Windows:** Nach `npm install` prüfen, ob `npm ci --dry-run` sauber ist. npm unter Windows wirft Linux-Zusatzpakete (`@emnapi/*`) aus der `package-lock.json`, dann bricht die CI ab. Fehlende Einträge aus main übernehmen.
- **Cloudflare:** Worker `app`, Zugangsschutz hängt am Worker (Reiter Access), nicht an der Adresse.
- Regeln, die oft greifen: keine „·“ und keine Gedankenstriche im sichtbaren Text, Farben nur aus `tokens.css`, Inline-Stile nur für Spaltenbreiten (`fundament.test.ts`), Beträge nur aus dem Rechenkern, keine Summen in der Oberfläche, Lösungsliste nur mit Go.

## 6. Startprompt für den neuen Chat

> Ich bin Maxi S. Lies `_UEBERGABE.md` und die dort genannten Dateien, hol den neuesten Stand von main. Zuerst gehen wir haarscharf über die UI, die Punkte gebe ich dir gleich. Danach API-Schlüssel und Zuruf-Agent online (Abschnitt 2, Punkt 2), dann Launch-Video planen. Die App ist schon offen für die Juroren: nach jedem Merge im Browser prüfen. Profi-Niveau wie Linear, Attio, reebuild. Wenig Text, keine „·“ und keine Gedankenstriche. Beträge nur aus dem Rechenkern, die Lösungsliste ändert sich nur mit meinem Go. Kosten nur mit meinem Go. PRs bei grüner CI selbst mergen. Deutsch, einfach, Ergebnis zuerst.
