# Website: Struktur v1

**Stand:** 22.10.2026. Grundlage für den Bau. Noch kein Code.
**Arbeitstitel:** EndPoint. (mit Punkt). Name nicht final, Markenprüfung offen.
**Zuständig:** Maxi (allein). Gearbeitet wird auf dem Branch `website/build`, nur im Ordner `website/`. `product/` und alles andere fasst die Website-Arbeit nicht an.

---

## 1. Ziel

Die Seite erklärt in wenigen Sekunden: **EndPoint. ist der digitale Zwilling eines Elektro- oder HKLS-Betriebs.** Die Schlussrechnung ist die erste Anwendung, nicht das Produkt.

- GTM, Angebote und Preise sind offen: keine Preise, keine Pakete, kein „Check anfragen“.
- CTA neutral: **„Kontakt aufnehmen“** `[[PLATZHALTER: finaler CTA]]`.
- Leser: Inhaber, Abrechner und Projektleiter, Bau-Insider (Gate R1), Partner, Investoren, Wettbewerbe.
- Die Seite ist selbst ein Beweis: präzise, interaktiv, technisch sauber.

---

## 2. Design

| Element | Festlegung |
|---|---|
| Farben | **Papier** `#F4F6F9`, **Tinte** `#0A1020`, **Ultramarin** `#1D3BFF`. Nur für Linien: Hauptraster `#D5DCE6`, Feinraster `#E8ECF2` |
| Schrift | Inter Tight (Headlines 600, eng gesetzt; Text 400). IBM Plex Mono für Zahlen, Maße, Labels, Nummern |
| Hintergrund | Architektenpapier: Hauptraster 48 px, Feinraster 12 px, über die ganze Seite |
| Leitmotiv | **Maßketten** (`\|← 8 PROJEKTE →\|`) für Zahlen, Übergänge und Navigation |
| Knöpfe | Primär: Ultramarin, weiße Schrift. Sekundär: Linie in Tinte |
| Ecken | eckig (0 bis 2 px) |
| Bewegung | ruhig und präzise: Linien zeichnen sich, nichts hüpft. `prefers-reduced-motion` schaltet Animationen ab |
| Dark Mode | später `[[PLATZHALTER: Dark Mode]]`, Vorschlag Lichtpause (weiße Linien auf Tinte) |

---

## 3. Sprache

- **Deutsch Standard** (`/`), **Englisch** per Umschalter `DE | EN` (`/en`). Der Umschalter bleibt im selben Abschnitt.
- Alle Texte in `messages/de.json` und `messages/en.json`, nie fest im Code.
- Anrede `[[PLATZHALTER: Sie oder ihr]]`, Vorschlag „Sie“.
- Kein Wort „Claim“, keine erfundenen Zahlen, Aussagen über die Welt nur mit Quelle.

---

## 4. Seitenplan

```
/              One-Pager Deutsch
/en            One-Pager Englisch
/impressum     Platzhalter (DE und EN)
/datenschutz   Platzhalter (DE und EN)
```

---

## 5. Seitenaufbau

```
┌──────────────────────────────────────────────────────────┐
│ EndPoint.     Zwilling  Anwendungen  Team   DE|EN  [CTA] │  Navigation
├──────────────────────────────────────────────────────┬───┤
│ 01 HERO        Ihr Betrieb. Auf einem Plan.          │ ⌖ │  Messpunkt-
│                Raster zeichnet sich → Zwilling       │ │ │  Navigation
│ 02 PROBLEM     4 Karten, Quellen als Fußnote         │ • │  (Abschnitt 7)
│ 03 ZWILLING    interaktive Isometrie (Abschnitt 6)   │ • │
│ 04 WEGE        Anbinden · Einspielen · Zurufen       │ • │
│ 05 ANWENDUNGEN Schlussrechnung + „in Planung“        │ • │
│ 06 VIDEO       16:9 Platzhalter                      │ • │
│ 07 PRINZIPIEN  Plan-Legende                          │ • │
│ 08 TEAM        4 Gründer + Insider gesucht           │ • │
│ 09 KONTAKT     Formular mit Einwilligung             │ • │
├──────────────────────────────────────────────────────┴───┤
│ Footer: Rechtsform · Adresse · Impressum · Datenschutz   │
└──────────────────────────────────────────────────────────┘
```

| # | Abschnitt | Inhalt | Interaktion | Platzhalter |
|---|---|---|---|---|
| 00 | **Navigation** | Wortmarke „EndPoint.“, Anker, `DE \| EN`, CTA | bleibt oben, wird beim Scrollen schmaler | CTA-Text |
| 01 | **Hero** | „Ihr Betrieb. Auf einem Plan.“ / „Your business. On one plan.“ Unterzeile: der digitale Zwilling für Elektro- und HKLS-Betriebe | Rasterlinien zeichnen sich, eine Maßkette misst „8 Projekte“, Übergang in den Zwilling | Unterzeile |
| 02 | **Problem** | Wissen verstreut (ERP, Mails, Papier, Köpfe); vieles informell (Telefon, Zuruf, WhatsApp); geht ein PL, geht sein Wissen; Auftraggeber prüfen mit KI | Karten zeichnen sich beim Scrollen ein | Zahlen nur mit Quelle (Dossier Abschnitt 2) |
| 03 | **Zwilling** | Herzstück, siehe Abschnitt 6 | interaktiv | Daten synthetisch, gekennzeichnet |
| 04 | **Drei Wege hinein** | Anbinden (ERP, CRM, Mails), Einspielen (Dateien, Pläne), Zurufen (WhatsApp mit Foto und Sprache, Bestätigung durch den Absender) | Umschalten zwischen den drei Wegen; „Zurufen“ zeigt einen WhatsApp-Verlauf, der sich selbst tippt, und den Eintrag, der im Zwilling landet | — |
| 05 | **Anwendungen** | Erste Anwendung: Schlussrechnung. „In Planung“: Portfolio über alle Projekte, Historie pro Auftraggeber, Fristen | Mini-Demo: Klick auf eine Zahl öffnet den Beleg („Jede Zahl führt zum Original“) | Liste weiterer Anwendungen |
| 06 | **Produktvideo** | 16:9-Rahmen auf dem Raster, Standbild, Play-Knopf | Platzhalter, später Einbettung | `[[PLATZHALTER: Produktvideo]]` |
| 07 | **Prinzipien** | KI liefert Fakten mit Quelle, Mensch bestätigt, Rechnung ist Code; nichts wird überschrieben; Datensilo pro Firma; keine Auswertung pro Mitarbeiter; wir sprechen nie mit Ihrem Auftraggeber | als Plan-Legende mit Symbolen | Hosting-Aussage erst, wenn entschieden |
| 08 | **Team** | 4 Gründer (Abschnitt 8) und eine Karte „Bau-Insider: wir suchen Sie“ | Hover: Foto als Linienzeichnung → Farbe; LinkedIn-Link | Fotos, Rollen, Texte |
| 09 | **Kontakt** | Formular: Name, Firma, Rolle, Nachricht, Einwilligungs-Häkchen (§ 174 TKG); `kontakt@[[DOMAIN]]` | Validierung direkt am Feld, Bestätigung als Maßkette „Eingang bestätigt“ | Backend, Mailadresse |
| — | **Footer** | Wortmarke, Rechtsform, Adresse, Impressum, Datenschutz, LinkedIn, © 2026 | — | Rechtsform, Adresse, Firmenbuch, UID |

---

## 6. Der Zwilling (Abschnitt 03)

**Ziel:** zeigen, was Kuro, reebuild und Stratos nur behaupten. Keine der drei Seiten hat eine interaktive Twin-Visualisierung (Stand 22.10.2026: Kuro zeigt ein Schichtendiagramm und eine Scroll-Galerie, reebuild eine statische Infografik, Stratos ein statisches SVG).

**Stil:** isometrische Strichzeichnung auf dem Planraster, wie eine Architekten-Axonometrie. Tinte für Linien, Ultramarin für „offen“. Keine Texturen.

**Ablauf:**
1. **Aufbau:** Beim Scrollen kippt das 2D-Raster in die Isometrie, Linien extrudieren zu Gebäuden.
2. **Firma:** 8 Projekte als Drahtgitter-Gebäude. Höhe = Auftragssumme, Ultramarin-Füllung = offener Anteil. Auftraggeber als Knoten am Rand, verbunden mit ihren Projekten. Hover: Maßkette mit Name, Summe, Status.
3. **Projekt:** Klick → Kamerafahrt hinein, Geschosse fahren auseinander (Explosionszeichnung), Pins für Foto, Zuruf, Regie, Planänderung.
4. **Datenströme:** Punkte fliegen aus Quellen am Rand (Mail, Foto, WhatsApp, ERP, Plan) ein und docken an Positionen an.
5. **Beleg:** Klick auf einen Pin öffnet eine Karte mit dem synthetischen Original und einer Linie zur betroffenen Zahl.
6. **Zeitachse:** Regler spult durch die Projektzeit, Ereignisse erscheinen in Reihenfolge.
7. **Zurück:** Breadcrumb `Firma / Projekt / Position` als Maßkette.

**Daten:** eine eigene, statische Datei `website/data/zwilling.json` mit synthetischen Werten. Sie orientiert sich an den Demo-Fällen des Produkts, die Website importiert aber keinen Code aus `product/`. Sichtbare Kennzeichnung „Synthetische Beispieldaten“.

**Mobil und Barrierefreiheit:** vereinfachte Ansicht (Tippen statt Hover, keine Kamerafahrt), ohne Animation bei `prefers-reduced-motion`, per Tastatur bedienbar, Textalternative.

**Technik:** zuerst ein Prototyp von einem Tag mit React Three Fiber (orthografische Kamera, Linien). Reicht die Leistung auf Mobilgeräten nicht, wird es isometrisches SVG mit GSAP.

---

## 7. Messpunkt-Navigation (der „Ghost“)

Vorbild: eine seitliche Abschnitts-Navigation mit einem Marker, der beim Scrollen mitwandert. Bei uns seriös und in der Sprache der Pläne.

| Zustand | Aussehen |
|---|---|
| **Eingeklappt** | Am rechten Rand eine senkrechte Maßkette mit einem Teilstrich pro Abschnitt. Der aktive Abschnitt trägt den **Messpunkt**: ein kleines Fadenkreuz in Ultramarin, wie ein Vermessungspunkt |
| **Ausgeklappt** (Hover, Fokus, Tippen) | Neben jedem Teilstrich Nummer und Name in Plex Mono: `01 START`, `02 PROBLEM`, `03 ZWILLING` … Der aktive Abschnitt in Ultramarin, die anderen in Tinte mit 50 % |
| **Beim Scrollen** | Der Messpunkt gleitet entlang der Maßkette. Zwischen den Teilstrichen zeigt ein feiner Ultramarin-Strich den Fortschritt im aktuellen Abschnitt |
| **Klick** | springt weich zum Abschnitt |

Details:
- Labels kommen aus den Sprachdateien (DE und EN).
- Auf Mobilgeräten nur die eingeklappte Maßkette, ausklappbar per Tippen.
- Barrierefrei: als `<nav aria-label>` mit Links, aktiver Abschnitt mit `aria-current`.
- Kein Maskottchen, keine Pixel-Grafik. Der Messpunkt ist das einzige „Wesen“ der Seite.

---

## 8. Team

| Name | GitHub | LinkedIn | Rolle | Foto | Kurztext |
|---|---|---|---|---|---|
| Maximilian Dieringer | @MaximilianDieringer | [Profil](https://www.linkedin.com/in/maximilian-dieringer/) | `[[PLATZHALTER]]` | `[[PLATZHALTER]]` | `[[PLATZHALTER]]` |
| Maximilian Seipl | @maxi589 | [Profil](https://www.linkedin.com/in/maximilian-seipl/) | `[[PLATZHALTER]]` | `[[PLATZHALTER]]` | `[[PLATZHALTER]]` |
| Santino Schrader | @Snoft | [Profil](https://www.linkedin.com/in/santino-schrader/) | `[[PLATZHALTER]]` | `[[PLATZHALTER]]` | `[[PLATZHALTER]]` |
| Simon Fuhrbach | @simonfuhrbach-source | [Profil](https://www.linkedin.com/in/simonfuhrbach/) | `[[PLATZHALTER]]` | `[[PLATZHALTER]]` | `[[PLATZHALTER]]` |
| Bau-Insider | — | — | „Wir suchen Sie“ | Linienzeichnung | `[[PLATZHALTER]]` |

Rollen und Texte schreibt jeder selbst. Nichts wird automatisch von LinkedIn übernommen.

---

## 9. Platzhalter

**Regel:** Unbekanntes steht als `[[PLATZHALTER: Beschreibung]]` im Text, nie als erfundene Tatsache. Im Entwicklungsmodus werden Platzhalter sichtbar markiert.

| Platzhalter | Wo | Wer klärt |
|---|---|---|
| Name und Domain | überall | Team |
| CTA-Text | Navigation, Hero, Kontakt | Team (hängt an GTM) |
| Rechtsform, Firmenbuch, UID, Adresse | Impressum, Footer | nach Gründung |
| Impressum, Datenschutzerklärung | eigene Seiten | Co-Founder mit Anwalt |
| Formular-Backend, Kontaktmail | Kontakt | Maxi |
| Hosting-Aussage | Prinzipien | Maxi |
| Produktvideo | Abschnitt 06 | Team |
| Team-Rollen, Fotos, Texte | Team | jeder selbst |
| Anrede Sie oder ihr | alle Texte | Team |

**Vor dem Livegang:** Passwortschutz und `noindex`, solange Impressum oder Datenschutz Platzhalter sind (Impressumspflicht nach § 5 ECG, § 25 MedienG). Live erst, wenn `grep -r "PLATZHALTER" website/` nichts mehr findet.

---

## 10. Technik

| Thema | Entscheidung |
|---|---|
| Framework | Next.js (App Router) mit TypeScript, wie das Produkt |
| Styling | Tailwind CSS, Farben und Abstände als Tokens aus Abschnitt 2 |
| Sprachen | `next-intl`, `messages/de.json` und `messages/en.json` |
| 3D | React Three Fiber und drei (nach Prototyp, siehe Abschnitt 6) |
| Animation | Framer Motion oder GSAP für Scroll-Effekte |
| Formular | vorerst ohne Versand (Platzhalter), Backend später |
| Analytics | später, cookielos (z. B. Plausible, Umami), damit kein Cookie-Banner nötig ist |
| Hosting | offen; lokal entwickeln, Vorschau-Hosting später |

**Ordner:**

```
website/
├── STRUKTUR.md          dieses Dokument
├── README.md
├── app/[locale]/        Seiten (DE, EN), Impressum, Datenschutz
├── components/
│   ├── sections/        Hero, Problem, Zwilling, Wege, Anwendungen, Video, Prinzipien, Team, Kontakt
│   ├── twin/            Zwilling-Visualisierung
│   ├── nav/             Navigation, Sprachumschalter, Messpunkt-Navigation
│   └── ui/              Maßkette, Knopf, Karte, Platzhalter
├── data/zwilling.json   synthetische Daten für die Visualisierung
├── messages/            de.json, en.json
└── public/              Bilder, Favicon, Vorschaubild
```

---

## 11. Bau-Reihenfolge

| Schritt | Inhalt | Ergebnis |
|---|---|---|
| 1 | Gerüst: Next.js, Tailwind-Tokens, Raster-Hintergrund, DE/EN | leere Seite im Planraster, Umschalter funktioniert |
| 2 | Navigation, Messpunkt-Navigation, alle Abschnitte mit Platzhaltertext | komplette Seite als Rohbau |
| 3 | Hero und Maßketten-Komponente | erster Eindruck steht |
| 4 | Prototyp Zwilling (R3F oder SVG) | Technik entschieden |
| 5 | Zwilling ausbauen: Firma, Projekt, Datenströme, Beleg, Zeitachse | Herzstück fertig |
| 6 | übrige Abschnitte: Problem, Wege, Anwendungen, Prinzipien, Team, Kontakt, Video | Seite inhaltlich vollständig |
| 7 | Mobil, Barrierefreiheit, Performance, Englisch durchgehen | vorzeigbar |
| 8 | Impressum, Datenschutz, Passwortschutz, Vorschau-Hosting | teilbar im Team |

Nach jedem Schritt: Commit und Push auf `website/build`. Merge in `main`, wenn ein Stand vorzeigbar ist.

---

## 12. Offene Entscheidungen

| # | Frage | Vorschlag |
|---|---|---|
| 1 | Finaler CTA | „Kontakt aufnehmen“, bis GTM steht |
| 2 | Anrede | „Sie“ |
| 3 | Technik Zwilling | nach Prototyp in Schritt 4 |
| 4 | Hosting | EU-Anbieter, passend zu den Prinzipien |
| 5 | Analytics | cookielos |
| 6 | Dark Mode | später |
