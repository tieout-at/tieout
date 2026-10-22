# Zuruf-Agent: Plan

Stand: 22.10.2026, Entwurf. Grundlage: Dossier v3, Abschnitte 3.4, 4, 11, 15.

## Ziel

Ein WhatsApp-Agent, dem ein Monteur in Sekunden zurufen kann, was er gemacht hat, und der daraus einen sauberen Eintrag mit Quelle im Projektzwilling macht. Erst im Simulator, dann an einer echten WhatsApp-Testnummer, am Ende eingebaut in die App. Wie er mit Menschen spricht, steht in `GESTALTUNG.md`.

**Fertig heißt:** Ein Teammitglied schickt vom eigenen Handy eine Sprachnachricht zu einer erfundenen Baustelle, bestätigt mit einem Tipp, und der Eintrag erscheint mit Foto, Ton und Transkript in der Zeitachse der App. Die Messwerte aus `GESTALTUNG.md` halten auf allen Szenarien, auch auf den zurückgehaltenen.

## Verhältnis zum Plan des Teams

- Dossier v3 15.2: Stufe 2 (Zuruf) ist als Prototyp ab Januar geplant, nach R3. Der MVP (`../docs/Umfang_v1.md`) hat nur eine vorgespielte WhatsApp-Szene, der echte Agent steht dort auf „nicht drin“.
- Dieser Ordner zieht den Prototyp vor, getrennt vom MVP. Wer daran wie viel Zeit arbeitet, gehört in die Sonntagsrunde am 25.10. (Bau-Aufteilung, offene Frage 14). Der MVP v0.9 am 31.10. darf darunter nicht leiden.
- Nur synthetische Daten. Echte Mitarbeiter und echte Baustellen erst nach R4 und Klärung mit dem Betriebsrat.

## Entscheidungen

| Datum | Entscheidung |
|---|---|
| 22.10.2026 | Reihenfolge: erst Simulator mit Lernschleife, dann echte Nummer |
| 22.10.2026 | Kanal: WhatsApp Cloud API direkt bei Meta, kein Zwischenanbieter |
| 22.10.2026 | Testleute: noch niemand vom Bau. Erst synthetische Personas und das Team |
| 22.10.2026 | Eigener Ordner `product/zuruf/`, TypeScript wie `../app/`, eigenes `package.json` |
| 22.10.2026 (Vorschlag) | Die KI liest und formuliert, der Code entscheidet. Welche Felder fehlen, ob nachgefragt wird und wann gespeichert wird, ist deterministischer Code. So ist das Verhalten testbar |
| 22.10.2026 | Antworten des Agenten sind feste Sätze im Code, nicht KI-formuliert. Vorhersehbar, kurz, keine Ausrutscher bei Geld und Recht. Die KI liest nur |
| 22.10.2026 | Modell Claude Opus 5.5 für Agent, Persona und Bewerter (Standard laut Claude-API-Referenz). Ein günstigeres Modell nur mit Go des Teams |
| 22.10.2026 | Der Agent fragt nur bei Zusatz- oder Änderungsarbeit nach, wer angeschafft hat. Bei normaler Arbeit laut Auftrag nicht |
| 22.10.2026 (Vorschlag) | Jedes erkannte Feld trägt das Zitat aus dem Zuruf, das es belegt. Der Code prüft, dass das Zitat wirklich im Transkript steht. Ohne Zitat bleibt das Feld leer („nicht raten“) |

## Aufbau

```
Kanal: Simulator (Browser, lokal) | WhatsApp Cloud API (Webhook)
  → Eingang: Nachricht vereinheitlichen (Text, Ton, Bild, Zeitstempel, Absender)
  → Verstehen: Sprache zu Text, Foto beschreiben
  → Herauslesen (KI): Projekt, Ort, Leistung, Menge, Aufwand, Anweiser, je mit Zitat
  → Gesprächsführung (Code): fehlt etwas Wichtiges? Rückfrage oder speichern
  → Formulieren (Code): feste, kurze Sätze nach GESTALTUNG.md, Knöpfe (src/texte.ts)
  → Ablage: Zuruf und Leistungsereignis mit Quelle, nur anhängen, nie überschreiben
```

Der Agent kennt die aktiven Projekte, Bauteile oder Tops und die LV-Kurztexte aus einem kleinen synthetischen Firmen-Zwilling (Haustechnik Beispiel GmbH, Projekt Wien 21 aus `../app/src/demo/w21/` plus erfundene weitere). Ablage in Phase 1 als Datei (eine Zeile pro Ereignis), Datenbank erst bei der Integration.

## Phasen

| Phase | Inhalt | Abnahme |
|---|---|---|
| **0 Grundlagen** | Ordner, Regeln, Gestaltung, Plan. Anthropic API Key mit Ausgabenlimit anlegen | Team hat `GESTALTUNG.md` gelesen und Go gegeben |
| **1 Kern und Simulator** | Datenmodell Zuruf, kleiner Firmen-Zwilling, Herauslesen mit Zitat, Gesprächsführung, Simulator im Browser (nur Text), 30 Szenarien plus 10 zurückgehaltene, Lernschleife | Messwerte aus `GESTALTUNG.md` auf allen Szenarien erreicht |
| **2 Sprache und Foto** | Sprache zu Text: zwei bis drei Anbieter mit eigenen Testaufnahmen vergleichen (EU-Anbieter bevorzugt). Testaufnahmen spricht das Team mit erfundenem Inhalt ein, auch mit Dialekt und Baulärm darunter. Fotos beschreiben lassen | Bei schlechter Aufnahme fragt der Agent nach, statt zu raten. Anbieter gewählt mit Begründung |
| **3 Echte Nummer** | Meta Testnummer, Webhook, Antwortknöpfe, Medien herunterladen, Testhandys des Teams | 20 Zurufe vom echten Handy, gleiche Messwerte wie im Simulator |
| **4 Integration** | Vorschlag an Maxi S.: Typen Zuruf und Leistungsereignis in `../app/src/domain/typen.ts`, Zurufe in Zeitachse und Liste „offen“, Mock-Szene durch aufgezeichneten echten Ablauf ersetzen | Pull Request mit Go von Maxi S. |

Termine legt das Team fest. Phase 1 braucht nur den Anthropic Key, Phase 3 zusätzlich das Meta-Konto.

## Lernschleife

So lernt das System aus Fehlern, ohne dass jemand vom Bau dabei ist.

1. **Szenario** (`szenarien/*.json`): Persona (Rolle, Sprechweise, Geduld), die Wahrheit (was wirklich passiert ist), Störungen (Dialekt, zwei Themen, falsche Baustelle, verspätete Nachricht, nur Foto), Erwartung (Felder, höchstens Rückfragen, verbotene Inhalte).
2. **Spielen:** Ein Sprachmodell spielt den Monteur. Es kennt nur Persona und Wahrheit, nicht die Regeln des Agenten. Es redet mit dem Agenten, bis bestätigt oder abgebrochen ist.
3. **Bewerten:** Harte Prüfungen im Code (Felder richtig, nichts erfunden, Zahl der Rückfragen, Antwortlänge, verbotene Wörter) plus eine Bewertung nach `GESTALTUNG.md` durch ein zweites Modell, das das Gespräch blind liest.
4. **Lernen:** Jeder Fehler wird in `LERNEN.md` eingetragen (was, Ursache, Regel, Szenario). Dann die kleinste Änderung, dann alle Szenarien neu. Was vorher grün war, muss grün bleiben.
5. **Gegen Schönrechnen:** 10 Szenarien schreibt ein Subagent, und sie werden während der Arbeit nicht gelesen (`szenarien/zurueck/`). Sie laufen nur bei der Abnahme einer Phase.

Rollen der Subagents in Claude Code: Szenarien schreiben (gezielt dort, wo der Agent zuletzt schwach war), durchgefallene Gespräche auf die Ursache untersuchen, Antworten unabhängig gegen `GESTALTUNG.md` lesen, Fakten zu Meta und Anbietern mit Quelle recherchieren. Entscheiden und ändern tut die Hauptsitzung.

Grenze: Synthetische Monteure sind nicht echte Monteure. Die Schleife findet Logikfehler und Ton-Ausrutscher, nicht ob jemand auf der Baustelle das wirklich benutzt. Das prüft erst ein Test mit Leuten vom Bau.

## Zugänge (Schritt für Schritt, wenn es so weit ist)

**Phase 1: Anthropic API Key**
1. Auf console.anthropic.com ein Konto anlegen (das ist nicht dasselbe wie das Claude-Abo).
2. Unter Billing ein kleines Guthaben und ein monatliches Ausgabenlimit setzen.
3. Unter API Keys einen Key anlegen und in `product/zuruf/.env` als `ANTHROPIC_API_KEY=` eintragen. Nie in den Chat, nie in Git.

**Phase 3: WhatsApp Cloud API**
1. Auf developers.facebook.com mit einem Facebook-Konto ein Entwicklerkonto anlegen, eine App vom Typ Business erstellen, das Produkt WhatsApp hinzufügen. Meta legt dabei ein Test-Geschäftskonto und eine Testnummer an.
2. Unter WhatsApp, API Setup bis zu fünf eigene Handynummern als Empfänger eintragen und per Code bestätigen.
3. Webhook-Adresse eintragen. Zum Entwickeln über einen Tunnel auf den eigenen Rechner, später auf EU-Hosting.
4. Für Dauerbetrieb einen Systembenutzer mit dauerhaftem Token anlegen, als `WHATSAPP_TOKEN=` in `.env`.

## Fakten zur WhatsApp Cloud API

Stand der Recherche 22.10.2026. Vor Phase 3 erneut bei Meta prüfen.

| Fakt | Quelle |
|---|---|
| Beim Hinzufügen von WhatsApp zu einer App legt Meta ein Test-Geschäftskonto und eine Testnummer an, die bis zu fünf Empfänger kostenlos anschreiben kann | [Meta, Get Started](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started/) |
| Preise pro Nachricht seit 1.7.2025; Nachrichten ohne Vorlage sind innerhalb des offenen Kundenservice-Fensters kostenlos | [Meta, Pricing](https://developers.facebook.com/docs/whatsapp/pricing) (Seite laut Recherche zuletzt geändert 30.3.2026) |
| Ab 1.10.2026 sollen auch Service-Nachrichten kosten, mit 1.000 freien pro Monat und Nummer | (unbelegt) nur Drittanbieter: [respond.io](https://respond.io/id/blog/whatsapp-pricing-change-2026.md), [EngageLab](https://www.engagelab.com/blog/whatsapp-pricing-2026-service-message-cost). Bei Meta prüfen |
| Freie Nachrichten und Knöpfe nur innerhalb von 24 Stunden nach der letzten Nachricht des Nutzers; danach nur genehmigte Vorlagen | (unbelegt) nur Drittanbieter, z. B. [Interactive Messages](https://singhamandeep.com/?p=1542). Passt zu Regel 8 (nie zuerst schreiben) |
| Antwortknöpfe: höchstens drei pro Nachricht, Beschriftung höchstens 20 Zeichen | (unbelegt) gleiche Quelle. Bei Meta prüfen |
| Option „Local Storage“: Nachrichteninhalt ruhend in der EU (Deutschland), Verarbeitung bis zu 60 Minuten auch außerhalb. Nur einstellbar, solange die Nummer nicht registriert ist | [Meta, Local Storage](https://developers.facebook.com/documentation/business-messaging/whatsapp/local-storage/) |
| Gruppen über die Cloud API | (unbelegt) offen |

## Risiken

| Risiko | Gegenmittel |
|---|---|
| Zeit fehlt beim MVP v0.9 (31.10.) | Sonntagsrunde entscheidet; Zuruf-Arbeit pausiert, wenn der MVP es braucht |
| Synthetische Tests täuschen Qualität vor | zurückgehaltene Szenarien; so früh wie möglich ein echter Monteur mit erfundenem Inhalt (über R1 oder Co-Founder B) |
| Dialekt und Lärm machen Transkripte schlecht | Phase 2 vergleicht Anbieter mit eigenen Aufnahmen; Agent fragt nach statt zu raten |
| Kosten der Modelle in der Lernschleife | Ausgabenlimit im Konto; kleine Läufe, volle Läufe nur bei Abnahme |
| Meta ändert Regeln oder Preise | Kanal ist austauschbar, der Kern hängt nicht an WhatsApp |
| Datenschutz und Betriebsrat (Dossier v3 Risiko 12) | nur synthetisch; R4-Fragenliste; keine Auswertung pro Person im Datenmodell |

## Integration (Vorschlag für Phase 4, braucht Go von Maxi S.)

- `typen.ts`: neue Typen `Zuruf` (Kanal, Zeitstempel, Absender als Rolle, Ton, Foto, Transkript) und `Leistungsereignis` (Projekt, Ort, Leistung, Menge, Aufwand, Anweiser, je als `Feld<T>` mit Quelle auf den Zuruf; Prüfstand „bestätigt“ durch den Absender, nicht durch das Büro).
- `Quelle` braucht eine Variante für Zurufe (Nachricht, Zeitstempel, Ausschnitt im Transkript), heute zeigt sie auf Dokument und Seite.
- Zeitachse und Liste „offen“ zeigen Zurufe; Beträge kommen weiter nur aus dem Rechenkern und der Lösungsliste.
