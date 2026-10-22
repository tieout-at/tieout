# Website: Struktur v0

**Stand:** 22.10.2026. Noch nicht gebaut. Dieses Dokument legt Aufbau, Inhalte, Interaktion und Platzhalter fest, bevor Code entsteht.
**Arbeitstitel:** EndPoint. (mit Punkt). Name nicht final, Markenprüfung offen.

---

## 1. Ziel der Seite

Die Seite erklärt in wenigen Sekunden, was wir bauen: **den digitalen Zwilling eines Elektro- oder HKLS-Betriebs.** Die Schlussrechnung ist die erste Anwendung, nicht das Produkt.

GTM, Angebote und Preise sind offen. Deshalb gilt:
- kein „Check anfragen“, keine Preise, keine Pakete;
- ein neutraler CTA: **„Kontakt aufnehmen“** `[[PLATZHALTER: finaler CTA]]`;
- die Seite soll für mehrere Leser funktionieren: Inhaber, Abrechner und Projektleiter, Bau-Insider (Gate R1), Partner, Investoren, Wettbewerbe (#glaubandich).

---

## 2. Design

| Element | Festlegung |
|---|---|
| Farben | **Papier** `#F4F6F9`, **Tinte** `#0A1020`, **Ultramarin** `#1D3BFF`. Dazu nur Rasterlinien: Hauptraster `#D5DCE6`, Feinraster `#E8ECF2` |
| Schrift | Überschriften und Text: Inter Tight (600 für Headlines, eng gesetzt). Zahlen, Maße, Labels: IBM Plex Mono |
| Hintergrund | Architektenpapier: Hauptraster 48 px, Feinraster 12 px |
| Motiv | **Maßketten** (`\|← 8 PROJEKTE →\|`) als wiederkehrendes Element für Zahlen, Abstände und Übergänge |
| Knöpfe | Primär: Ultramarin mit weißer Schrift. Sekundär: Tinte als Linie (Ghost-Button) |
| Ecken | eckig oder 2 px, kein Rundungs-Look |
| Dunkelmodus | später `[[PLATZHALTER: Dark Mode ja/nein]]`, Vorschlag: Lichtpause (weiße Linien auf Tinte) |

Das Produkt-UI (`product/ui-fundament`) nutzt Inter und ein kühles Blau. Die Tokens werden angeglichen, sobald die CI final ist.

---

## 3. Sprache

- **Deutsch ist Standard**, Englisch per Umschalter in der Navigation (`DE | EN`).
- URLs: `/` (Deutsch), `/en` (Englisch). Der Umschalter bleibt im selben Abschnitt.
- Alle Texte liegen in `de.json` und `en.json`, nie fest im Code.
- Anrede: `[[PLATZHALTER: Sie oder ihr]]`, Vorschlag „Sie“.
- Regeln aus dem Dossier gelten weiter: kein Wort „Claim“, keine erfundenen Zahlen, Aussagen über die Welt nur mit Quelle.

---

## 4. Seitenplan

```
/                One-Pager (Abschnitte unten)
/en              derselbe One-Pager auf Englisch
/impressum       Platzhalter
/datenschutz     Platzhalter
/[ghost]         offen, siehe Abschnitt 9
```

---

## 5. Abschnitte des One-Pagers

| # | Abschnitt | Inhalt | Interaktion | Platzhalter |
|---|---|---|---|---|
| 0 | **Navigation** | Wortmarke „EndPoint.“, Anker: Zwilling, Anwendungen, Team, Kontakt; `DE \| EN`; CTA | bleibt beim Scrollen oben, Fortschritt als Maßkette am Rand | CTA-Text |
| 1 | **Hero** | „Ihr Betrieb. Auf einem Plan.“ / „Your business. On one plan.“ Unterzeile: der digitale Zwilling für Elektro- und HKLS-Betriebe | Die Rasterlinien zeichnen sich beim Laden, daraus wächst der Zwilling (Abschnitt 6) | Unterzeile final |
| 2 | **Problem** | Wissen liegt verstreut (ERP, Mails, Papier, Köpfe), vieles läuft informell, geht ein PL, geht sein Wissen, Auftraggeber prüfen mit KI | Karten klappen beim Scrollen auf, Quellen als Fußnote | Zahlen nur mit Quelle aus dem Dossier |
| 3 | **Der Zwilling** | Das Herzstück: interaktive Visualisierung Firma → Projekt → Beleg | siehe Abschnitt 6 | Daten synthetisch, als solche gekennzeichnet |
| 4 | **Drei Wege hinein** | Anbinden (ERP, CRM, Mails), Einspielen (Dateien, Pläne), Zurufen (WhatsApp mit Foto und Sprache) | Hover zeigt Beispieldaten; „Zurufen“ zeigt einen WhatsApp-Verlauf, der sich selbst tippt | — |
| 5 | **Anwendungen** | Erste Anwendung: Schlussrechnung. Weitere als „in Planung“: Portfolio, Historie pro Auftraggeber, Fristen | Mini-Demo: Klick auf eine Zahl öffnet den Beleg („Jede Zahl führt zum Original“) | weitere Anwendungen |
| 6 | **Produktvideo** | 16:9-Rahmen mit Standbild und Play-Knopf | Platzhalter, später Einbettung | `[[PLATZHALTER: Produktvideo]]` |
| 7 | **Prinzipien** | KI liefert Fakten mit Quelle, Mensch bestätigt, Rechnung ist Code; nichts wird überschrieben; Datensilo pro Firma; wir sprechen nie mit Ihrem Auftraggeber | Jede Aussage als Plan-Legende mit Symbol | Hosting-Aussage erst, wenn entschieden |
| 8 | **Team** | 4 Karten (Abschnitt 7), dazu eine Karte „Bau-Insider: wir suchen Sie“ | Hover: Foto in Linienzeichnung → Farbe | Fotos, Rollen, Kurztexte |
| 9 | **Kontakt** | Formular: Name, Firma, Rolle, Nachricht, Einwilligungs-Häkchen (§ 174 TKG); dazu `kontakt@[[DOMAIN]]` | Validierung, Bestätigung als Maßkette „Eingang bestätigt“ | Formular-Backend, Mailadresse |
| 10 | **Footer** | Wortmarke, Rechtsform, Adresse, Impressum, Datenschutz, LinkedIn, © 2026 | — | Rechtsform, Adresse, Firmenbuch, UID |

---

## 6. Der Zwilling als interaktive Visualisierung

**Ziel:** Das, was Kuro, reebuild und Stratos nur behaupten, zeigen wir. Keine der drei Seiten hat eine echte interaktive Twin-Visualisierung (Kuro: geschichtetes Plattform-Diagramm und Scroll-Galerie; reebuild: statische Infografik; Stratos: statisches SVG). Hier können wir auffallen.

**Stil:** isometrisch, als Strichzeichnung auf dem Planraster, wie eine Architekten-Axonometrie. Keine realistischen Texturen. Ultramarin markiert, wo etwas offen ist.

**Ebenen und Interaktion:**

1. **Aufbau beim Scrollen:** Das 2D-Raster kippt in die Isometrie, Linien extrudieren zu Gebäuden. Der Plan wird zum Modell.
2. **Firma:** 8 Projekte als Drahtgitter-Gebäude auf dem Raster. Höhe = Auftragssumme, Ultramarin-Füllung = offener Anteil. Auftraggeber als Knoten am Rand, mit Linien zu ihren Projekten. Hover zeigt eine Maßkette mit Name, Summe und Status.
3. **Projekt:** Klick auf ein Gebäude, die Kamera fährt hinein, die Geschosse fahren auseinander (Explosionszeichnung). Auf den Geschossen sitzen Pins: Foto, Zuruf, Regie, Planänderung.
4. **Datenströme:** Aus Quellen am Rand (Mail, Foto, WhatsApp, ERP, Plan) fliegen Punkte ein und docken an Positionen an. So sieht man, wie der Zwilling sich füllt.
5. **Beleg:** Klick auf einen Pin öffnet eine Karte mit dem (synthetischen) Original und einer Linie zur betroffenen Zahl.
6. **Zeitachse:** Ein Regler unten spult durch die Projektzeit. Das Gebäude wächst, Ereignisse tauchen in Reihenfolge auf.
7. **Zurück:** Breadcrumb `Firma / Projekt / Position` als Maßkette oben links.

**Daten:** aus dem Demo-Generator des Produkts (`product/app/src/demo/w21`), damit Website, Demo und Video dieselben Zahlen zeigen. Kennzeichnung „Synthetische Beispieldaten“ sichtbar in der Ecke.

**Mobil und Barrierefreiheit:** vereinfachte Version ohne Kamerafahrt (Tippen statt Hover), bei `prefers-reduced-motion` ohne Animation, alles per Tastatur erreichbar, Textalternative zur Grafik.

**Technik (Vorschlag):** Three.js mit React Three Fiber, orthografische Kamera für den echten Isometrie-Look, Linien statt Flächen. Alternative mit weniger Aufwand: isometrisches SVG mit GSAP. Entscheidung nach einem Prototyp von einem Tag.

---

## 7. Team

| Name | LinkedIn | Rolle | Foto | Kurztext |
|---|---|---|---|---|
| Maximilian Dieringer | [Profil](https://www.linkedin.com/in/maximilian-dieringer/) | `[[PLATZHALTER]]` | `[[PLATZHALTER]]` | `[[PLATZHALTER]]` |
| Maximilian Seipl | [Profil](https://www.linkedin.com/in/maximilian-seipl/) | `[[PLATZHALTER]]` | `[[PLATZHALTER]]` | `[[PLATZHALTER]]` |
| Santino Schrader | [Profil](https://www.linkedin.com/in/santino-schrader/) | `[[PLATZHALTER]]` | `[[PLATZHALTER]]` | `[[PLATZHALTER]]` |
| Simon Fuhrbach | [Profil](https://www.linkedin.com/in/simonfuhrbach/) | `[[PLATZHALTER]]` | `[[PLATZHALTER]]` | `[[PLATZHALTER]]` |
| Bau-Insider | — | „Wir suchen Sie“ | Linienzeichnung | `[[PLATZHALTER]]` |

Rollen und Texte schreibt jeder selbst. Wir übernehmen nichts automatisch von LinkedIn.

---

## 8. Platzhalter

**Regel:** Alles, was wir noch nicht wissen, kommt als Platzhalter in den Text, nie als erfundene Tatsache. Format: `[[PLATZHALTER: Beschreibung]]`. In der Entwicklungsansicht wird jeder Platzhalter gelb markiert, damit nichts übersehen wird.

| Platzhalter | Wo | Wer klärt |
|---|---|---|
| Name und Domain | überall | Team |
| CTA-Text | Navigation, Hero, Kontakt | Team (hängt an GTM) |
| Rechtsform, Firmenbuch, UID, Adresse | Impressum, Footer | nach Gründung |
| Impressum und Datenschutzerklärung | eigene Seiten | Co-Founder A mit Anwalt |
| Formular-Backend und Kontaktmail | Kontakt | Bau |
| Hosting-Aussage | Prinzipien | Bau |
| Produktvideo | Abschnitt 6 | Team |
| Team-Rollen, Fotos, Texte | Team | jeder selbst |
| Anrede Sie oder ihr | alle Texte | Team |

**Vor dem Livegang:** Die Seite bleibt nicht öffentlich (Passwortschutz, `noindex`), solange Impressum und Datenschutz Platzhalter sind. Ein Platzhalter-Impressum auf einer öffentlichen Seite verstößt gegen die Impressumspflicht (§ 5 ECG, § 25 MedienG). Vor dem Livegang darf `grep -r "PLATZHALTER"` nichts mehr finden.

---

## 9. Offene Entscheidungen

| # | Frage | Vorschlag |
|---|---|---|
| 1 | **„Ghost“:** Was ist gemeint? (a) Ghost als Blog-System für News und Artikel, (b) ein Geist als verstecktes Easter Egg, (c) Ghost-Buttons als Stilmittel | offen, Rückfrage an Maxi |
| 2 | Finaler CTA | „Kontakt aufnehmen“, bis GTM steht |
| 3 | Technik der Visualisierung | Prototyp R3F vs. SVG, je 1 Tag |
| 4 | Framework | Next.js wie das Produkt (`product/app`), `next-intl` für DE/EN |
| 5 | Hosting | EU-Anbieter, damit die Prinzipien stimmen |
| 6 | Analytics | cookielos (z. B. Plausible, Umami), dann kein Cookie-Banner nötig |
| 7 | Dark Mode | später |
