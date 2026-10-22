# Schlusswerk: Dossier v3

**Stand:** Donnerstag, 22. Oktober 2026 (überarbeitet 16:00 Uhr: Zwilling für das ganze Unternehmen, Projektzwillinge darin)
**Für:** Maxi, die zwei Co-Founder und jeden neuen KI-Chat ohne Vorwissen.
**Verhältnis zu v2:** `archiv/Schlusswerk Dossier v2.md` bleibt unverändert als Archiv. v3 übernimmt alle Entscheidungen aus v2, außer dort, wo sie in Abschnitt 0.1 ausdrücklich geändert sind. Neu ist das Kernprodukt: ein digitaler Zwilling für das ganze Unternehmen, in dem jedes Projekt seinen eigenen Projektzwilling hat. Die erste Anwendung darauf ist die Schlussrechnung. Markierungen: **[neu v3]** und **[geändert v3]**. Wo v2 und v3 abweichen, gilt v3. Die Steckbriefe zu Kuro und reebuild (v2, Abschnitt 8.1 bis 8.6) stehen jetzt in `research_notes/Kuro_reebuild_Fakten.md`. Die Quellen zu Recht und Markt bleiben in v2.

**Kennzeichnung:** **(unbelegt)** = Erfahrung oder Allgemeinwissen ohne geprüfte Quelle. **(Annahme)** = Modellannahme, muss gemessen werden. **G / S / A** bei Quellen wie in v2. **(früherer Chat)** = Fakt aus der Recherche vom 22.10., Quellen in Abschnitt 17, nicht neu geprüft.

**Begriffe:** **Firmen-Zwilling** = der Zwilling des ganzen Betriebs. **Projektzwilling** = der Zwilling eines Projekts, enthalten im Firmen-Zwilling. **Zwilling** allein meint beides zusammen. **Anwendung** = ein Job, der auf dem Wissen im Zwilling läuft (englisch Use Case).

---

## 0. Das Kernprodukt auf einer Seite

> **Schlusswerk ist der digitale Zwilling eines Elektro- oder HKLS-Subunternehmerbetriebs.** Er führt das Wissen über das ganze Geschäft in einer Wissensdatenbank zusammen: Kunden, Verträge, Preise und alle Projekte. Man öffnet den Firmen-Zwilling, geht in ein Projekt hinein und findet dort den Projektzwilling mit seinen Analysen und Anwendungen. **Die erste Anwendung ist die Schlussrechnung:** Der Projektzwilling weiß, was gebaut, geändert, angewiesen und bezahlt wurde. Daraus entsteht die Schlussrechnung, und die Firma weiß, was sie wirklich abrechnen sollte.

```
              Anbinden  ·  Einspielen  ·  Zurufen
                            ↓
┌────────────────────────────────────────────────────────┐
│  FIRMEN-ZWILLING  (das ganze Business)                 │
│  Kunden und GUs, Verträge, Regelwerk und Historie      │
│  pro GU, Preisbasis (K7), LV-Archiv, alle Projekte     │
│                                                        │
│   ┌────────────┐  ┌────────────┐  ┌────────────┐       │
│   │ Projekt A  │  │ Projekt B  │  │ Projekt C  │  ...  │
│   │  Zwilling  │  │  Zwilling  │  │  Zwilling  │       │
│   └────────────┘  └────────────┘  └────────────┘       │
└────────────────────────────────────────────────────────┘
                            ↓
       Anwendungen: Schlussrechnung (zuerst), weitere später
```

| Frage | Antwort |
|---|---|
| **Was ist es?** | Ein Zwilling für das ganze Business. In jedes Projekt kann man hineingehen und hat dort seinen Projektzwilling |
| **Was bringt er?** | Anwendungen auf dem gesammelten Wissen. Die erste: Geld, das erbracht und nicht verrechnet wurde, wird gefunden und als Schlussrechnung belegt |
| **Wie kommt das Wissen hinein?** | **Anbinden** (ERP, CRM, Mails, Calls), **Einspielen** (Dateien, Pläne, wenn es kein System gibt), **Zurufen** (Foto und Sprachnachricht per WhatsApp an einen Agenten) |
| **Wie wird es verkauft?** | **Check** (ein Projekt, rückwirkend), **Desk** (alle schließenden Projekte, der Zwilling wächst), **Live** (laufend gefüllt) |
| **Für wen?** | Elektro- und HKLS-Betriebe in Österreich mit 30 bis 150 Leuten, die für GUs, Bauträger und öffentliche Auftraggeber bauen |
| **Warum soll das tragen?** | Leithypothese (Annahme): Auf dem Bau läuft viel informell, per Telefon, Zuruf und WhatsApp, und ist nirgends dokumentiert. Ohne diesen Kontext lässt sich keine Schlussrechnung belegen. Wer ihn formalisiert, hat eine Datengrundlage, die weder ERP noch GU-Werkzeuge haben |
| **Wo setzen wir auf?** | On top auf dem vorhandenen ERP und CRM. Wir ersetzen nichts. Gibt es kein System, wird manuell eingespielt |

**Die Entscheidungen in fünf Punkten:**
1. **Seite der Subunternehmer.** Die GU-Seite ist besetzt (Kuro, reebuild, Capmo, PlanRadar). Dass die GUs mit KI prüfen, ist unser Argument (v2, 8.5).
2. **Einstieg über den Check, Gates unverändert.** Der Check baut den ersten Projektzwilling aus einem Projektordner und liefert die Schlussrechnung. Daraus wächst der Firmen-Zwilling Projekt für Projekt.
3. **Bau in Stufen.** Stufe 0 reicht für alle Gates. Zuruf per WhatsApp und Anbindung kommen danach (Abschnitt 15).
4. **Zuerst verkauft wird das Geld.** Der Zwilling ist das Kernprodukt, aber ein Inhaber kauft zuerst das Ergebnis der Schlussrechnung. Der Zwilling ist die Erklärung, warum es funktioniert, und der Ausblick (Abschnitt 9). Das ist eine Empfehlung, keine beschlossene Regel.
5. **Neue Risiken [neu v3]:** größerer Bauumfang, größerer Vertrauensschritt beim Datenzugang, Datenschutz und Betriebsrat bei WhatsApp, Abhängigkeit von ERP-Schnittstellen, Fokusverlust. Abschnitt 11.

### 0.1 Änderungen gegenüber v2

| Thema | v2 | v3 | Hinweis |
|---|---|---|---|
| Kernprodukt | Schlussrechnungs-Desk, Check mit 10 Arbeitstagen | Zwilling für das ganze Unternehmen mit Projektzwillingen, Schlussrechnung als erste Anwendung | Der Check bleibt als Einstieg (Stufe 0) |
| Wissensbasis | Ledger pro Projekt, Historie pro GU erst im Jahresdesk | Firmenebene mit Kunden, Regelwerk, Historie pro GU, Preisbasis, LV-Archiv und allen Projekten | wächst mit jedem Projekt |
| Live-Erfassung | verworfen ab Start, Live-Desk erst Jahr 2 | Zuruf per WhatsApp und Anbindung gehören zum Produkt, gebaut in Stufen 2 und 3 | Wiederaufnahme ohne neue Evidenz, als Teamentscheidung vom 22.10. Die alten Gründe stehen als Risiken in Abschnitt 11 |
| Datenquellen | nur Dateiexporte, keine API in v1 | Stufe 0 weiter Dateien, Anbindung ab Stufe 3 | Gates brauchen keine Anbindung |
| Datenzugang | "nur der Projektordner" | Einstieg weiter mit einem freigegebenen Projektordner. Der Firmen-Zwilling wächst nur mit Projekten, die die Firma freigibt | Vertrauensargument bleibt, Wortlaut ändert sich |
| Foto und Erfassung | Foto-App nicht übernehmen | Erfassung per Foto ja, über WhatsApp statt eigener App | keine neue App |
| Plattform-Story | nicht ab Tag 1 | Der Zwilling ist Kernprodukt und Architektur, bewiesen und verkauft wird über einen Job | Abschnitt 9 |
| Kundenzugang | keiner in v1 | WhatsApp ab Stufe 2, Lese-Ansicht im Web ab Stufe 2 (Annahme) | Stufe 0 und 1 bedienen wir selbst |
| Ausgabe | Listen, Beweispaket, Schlussbesprechungs-Blatt | zusätzlich **Entwurf der Schlussrechnung** | Rechtsfrage an den Anwalt (R4) |
| Kodierung der Funde | (a) bis (d) | zusätzlich **Quelle des Belegs** | misst die Leithypothese |

**Unverändert aus v2:** Sub-Seite, Gates und Termine, Einstiegspreise, Recht-Leitplanken, nie Kontakt zum GU, kein Wort "Claim", Insider als Pflicht-Gate, keine Telefon-Kaltakquise (§ 174 TKG), Kalkül geparkt, Deutschland erst ab 2028.

---

## 1. Das Business in Kürze

**Angebot:** Check 1.500 bis 3.500 € pro Projekt. Desk 800 bis 2.500 € pro Monat für alle schließenden Projekte. Live (laufende Erfassung per Zuruf und Anbindung) kommt im Jahr 2 als Aufpreis. Mindestens 80 % des Umsatzes sind fix.

**Grenzen:** Schlusswerk schreibt nie an den GU. Der Agent spricht nur mit Mitarbeitern der Kundenfirma. Streitfälle gehen über eine Partnerkanzlei. Das Wort "Claim" steht in keinem Kundenmaterial. Es gibt keine Auswertung pro Mitarbeiter.

**Gründung:** Die Firma existiert erst, wenn ein Bau-Insider mit Anteilen unterschreibt (spätestens Fr 4.12.2026). Fünf Gates entscheiden bis So 31.1.2027 (Abschnitt 13).

**Exit:** Realistisch bei Erfolg 10 bis 40 Mio. €. Die Chance auf einen Exit über 10 Mio. € bis Oktober 2032 liegt heute bei etwa 3 %, nach bestandenen Gates bei 18 bis 20 %, über 100 Mio. € unter 0,5 %. Der Zwilling macht eine Plattform-Story möglich, ändert diese Zahlen aber nicht, bis Zahlungsbereitschaft für weitere Anwendungen gemessen ist. Ob das dem Ziel "YC und Unicorn" genügt, muss das Team bewusst entscheiden (offene Grundsatzfrage).

---

## 2. Problem und Kunde

**Problem:** Subunternehmer verlieren am Projektende Geld, das sie schon verdient haben:
- Regie, die erbracht, aber nicht verrechnet oder nie unterschrieben wurde;
- Mengenüberschreitungen, die nicht im Aufmaß stehen (bei Einheitspreisverträgen ist das Abrechnung, kein Nachtrag);
- vereinbarte Preisgleitung und Metallzuschläge;
- angemeldete, aber nie bepreiste Änderungen.

**Ursachen:**
- Ein überlasteter PL schreibt die Schlussrechnung spät und aus dem Gedächtnis (unbelegt).
- Es fehlen Fachkräfte: In der Bauelektrik bleiben über 70 % der offenen Stellen unbesetzt ([KOFA 07/2026](https://www.iwkoeln.de/fileadmin/user_upload/Studien/KOFA_kompakt_und_Studien/2026/KOFA_Kompakt-07-2026-Handwerk.pdf)). Geht ein PL, geht sein Wissen mit (Annahme; Kuro argumentiert ähnlich, G in v2).
- Die Daten liegen verstreut: im ERP, in Mails, auf Papier, in Fotos, in Köpfen.
- Vieles wird gar nicht dokumentiert, weil es informell läuft (Leithypothese unten).
- Ein Teil wird bewusst in der Schlussbesprechung getauscht. Wie groß dieser Teil ist, misst Gate R3.

**Leithypothese (Annahme von Maxi, noch nicht gemessen):** Auf dem Bau ist viel Kommunikation informell: Telefonate, Zuruf auf der Baustelle, WhatsApp, "man kennt sich". Dadurch ist wenig dokumentiert, und der KI fehlt der Kontext. Eine Anwendung wie die Schlussrechnung braucht aber genau diesen Kontext: Was wurde wann, von wem und wie angewiesen und ausgeführt? Folgerung: Erst formalisieren (Zwilling), dann Anwendungen darauf bauen.
Test: Sub-Gespräche ("Wo steht das heute?") und die Quellenkodierung ab R3 (Abschnitt 15.5).

**Warum jetzt:** Die Auftraggeber prüfen mit KI. reebuild liest Nachunternehmer-Rechnungen positionsgenau gegen LV, Bauvertrag und Aufmaß und erzeugt automatisch ein Korrekturblatt (G, [reebuild Projektentwickler](https://www.reebuild.com/projektentwickler)). Kuro prüft für die größten GUs die Angebote der Nachunternehmer. Der Sub schreibt weiter von Hand.

**Wedge-Kunde:**

| Merkmal | Definition |
|---|---|
| Gewerk | HKLS oder Elektro; Start mit dem Gewerk des Insiders |
| Größe | 30 bis 150 Leute, ideal 40 bis 100; 5 bis 25 Mio. € Umsatz |
| Geschäft | mindestens 60 % ÖNORM-B-2110-Verträge mit GUs, Bauträgern und öffentlichen Auftraggebern |
| Volumen | mindestens 8 Schlussrechnungen pro Jahr, Aufträge 150.000 € bis 3 Mio. € (unbelegt pro Firma) |
| Region | Wien und NÖ zuerst, OÖ und Steiermark ab Mitte 2027 |
| Systeme | ERP, AVA oder CRM vorhanden oder nicht: egal, Einspielen geht immer. Welche Systeme die Zielkunden nutzen, ist unbelegt (Frage in Sub-Gesprächen) |

**Rollen:**
- **Unterschreibt:** Inhaber oder kaufmännische Leitung. Er ist auch der Hauptnutzer des Firmen-Zwillings.
- **Champion:** der Abrechner oder ein Senior-PL.
- **Blocker:** ein PL, der sich kontrolliert fühlt; der Betriebsrat; Poliere und Monteure, falls sie Zurufe als Überwachung erleben.

**Auslöser:** Eine Schlussrechnung ist in 4 bis 8 Wochen fällig, oder ein GU hat in den letzten 12 Monaten eine Schlussrechnung gekürzt. Den zweiten Fall bearbeiten wir nur über die Kanzlei.

---

## 3. Produkt

### 3.1 Aufbau: Firma, Projekt, Anwendung

| Ebene | Was | Inhalt |
|---|---|---|
| **Firmen-Zwilling** | das ganze Business | Kunden und GUs mit Verträgen, Regelwerk und Historie pro GU; Preisbasis (K7-Blätter, Kalkulationssätze); LV-Archiv; firmenweite Dokumente; Liste aller Projekte mit Status |
| **Projektzwilling** | ein Projekt | LV, Aufmaß, Regie, Pläne, Mails, Calls, Fotos, Zurufe, Rechnungen, Zahlungen, Fortschritt, Kosten |
| **Anwendung** | ein Job auf dem Wissen | auf Projektebene: Schlussrechnung (zuerst). Auf Firmenebene: Portfolio, Historie pro GU und weitere (3.7) |

**Navigation:** Man startet im Firmen-Zwilling, sieht alle Projekte mit Status und Geld, geht in ein Projekt und ist im Projektzwilling mit seinen Analysen und Anwendungen. Von dort geht man zurück auf die Firmenebene.

**Der Firmen-Zwilling wächst mit jedem Projekt.** Er entsteht aus den Projektzwillingen und aus den angebundenen Systemen. Nach dem ersten Check enthält er ein Projekt. Mit dem Desk wächst er um jedes schließende Projekt, im Live-Betrieb um alle laufenden.

**Vier Prinzipien:**
1. **Jede Aussage hat eine Quelle:** Datei, Seite, Stelle. Bei Zurufen: Nachricht, Foto, Tonaufnahme.
2. **Die KI liefert Fakten und Vorschläge, ein Mensch bestätigt, die Rechnung ist deterministischer Code.**
3. **Der Zwilling hat ein Gedächtnis:** Nichts wird überschrieben. Jede Änderung ist eine neue Version mit Zeitpunkt, Herkunft und Status (Entwurf, bestätigt, verworfen).
4. **Der Zwilling gehört der Firma:** Datensilo pro Firma, Freigabe pro Projekt, Rollen und Rechte (Annahme), Löschung bei Vertragsende.

**Leitplanke Personaldaten [neu v3]:** Mitarbeiter erscheinen im Zwilling nur als Absender und Rolle. Es gibt keine Personal-, Lohn- oder Leistungsdaten einzelner Personen und keine Auswertung pro Mitarbeiter (§ 96a ArbVG). Lohnminuten stammen aus den K7-Blättern, nicht aus Einzelpersonen.

**Abgrenzung:** Der Zwilling ersetzt kein ERP und kein CRM. Das ERP bleibt führend für Stammdaten und Buchhaltung. Der Zwilling liest, ergänzt und gibt Ergebnisse über Exportdateien zurück (Excel, ÖNORM, BMD-Format prüfen).

### 3.2 Drei Wege in den Zwilling

| Weg | Was kommt rein | Wie | Stufe |
|---|---|---|---|
| **Anbinden** | Stammdaten, Kunden und GUs, Projekte, LV, Aufmaß, Rechnungen, Zahlungen aus ERP, AVA oder CRM; Mails und Kalender; aufgezeichnete Calls (als Transkript) | Schnittstelle oder Export je System. Mails zuerst über eine Projekt-Weiterleitungsadresse (Annahme), Postfach-Anbindung später | 3 (in Stufe 0 per Datei) |
| **Einspielen** | pro Projekt: PDFs, Pläne mit Index, Excel, Scans, Mails (.msg/.eml), WhatsApp-Export, Fotos mit EXIF, Verträge. Firmenweit: Rahmenverträge, K7-Blätter, LV-Archiv | Upload durch die Firma oder durch uns | 0 |
| **Zurufen** | Foto und Sprachnachricht von der Baustelle, später Text und Standort | WhatsApp-Nummer mit Agent (3.4) | 2 |

Hinweis: Die Annahme, dass Mails mit dem ERP gesynkt sind und deshalb von selbst im Zwilling landen, ist ungeprüft. In vielen Betrieben liegen Mails im Postfach, nicht im ERP (unbelegt). Offene Frage 9.

### 3.3 Was im Zwilling steckt

**Firmenebene:**

| Objekt | Beispiele |
|---|---|
| Firma | Gewerk, Standorte, Rollen der Nutzer (ohne Personaldaten) |
| Kunde und GU | Ansprechpartner, Rahmenverträge, Regelwerk (ÖNORM B 2110 plus Abweichungen), Historie: Kürzungen, akzeptierte Nachträge, Zahlungsverhalten |
| Preisbasis | K7-Blätter, Kalkulationssätze, Einheitspreise aus früheren LVs |
| LV-Archiv | frühere Leistungsverzeichnisse und Angebote |
| Projektliste | alle Projekte mit Status, Auftragssumme, offener Betrag, nächster Frist |

**Projektebene:**

| Objekt | Beispiele |
|---|---|
| Projekt und Vertrag | Bauvertrag, Regelwerk, Preisbasis, Fristen |
| LV-Position | Menge, Einheitspreis, K7-Lohnminuten, Status erbracht / verrechnet / bezahlt |
| Leistungsereignis | Aufmaß, Regie, Mehrmenge, Änderung, Zuruf |
| Dokument | Plan mit Index, Protokoll, Lieferschein, Vertrag |
| Geld | Abschlagsrechnung, Zahlung, Einbehalt, Eingangsrechnung (Material) |
| Kommunikation | Mail, Call-Transkript, WhatsApp-Nachricht |
| Medien | Foto, Tonaufnahme |

Jedes Objekt trägt Quelle, Zeitpunkt, Kanal, Status und bestätigt-von.

**Fortschritt und Kosten:** Der Fortschritt ist der Leistungsstand pro LV-Position gegen die LV-Menge. Kosten (Eingangsrechnungen, Lieferscheine, Lohnminuten aus Regie) werden als Datenbasis mitgeführt, vor allem für Regie und Material. Ein Echtzeit-Budget- oder Controlling-Modul ist damit nicht gemeint und bleibt verworfen, bis eine Anwendung es braucht.

### 3.4 Zuruf per WhatsApp

**Ablauf:**
1. Ein Monteur oder Polier schickt Foto und/oder Sprachnachricht an die Schlusswerk-Nummer seiner Firma. Beispiel: "Steckdose in Raum 5 versetzt, der Bauherr wollte es so, zwei Mann, sechs Stunden."
2. Der Agent wandelt die Sprache in Text und liest das Foto.
3. Er ordnet zu: Projekt (er kennt die aktiven Projekte der Firma aus dem Firmen-Zwilling), Bereich oder Raum, LV-Position oder "neue Position", Menge, Aufwand, wer es angewiesen hat. Ist etwas unklar, fragt er kurz nach ("Welche Baustelle: A, B oder C?", "Wer hat das angewiesen?").
4. Er schickt eine Zusammenfassung zurück. Der Absender bestätigt mit einem Tipp.
5. Der Projektzwilling legt ein Leistungsereignis an. Foto, Ton und Transkript hängen als Quelle daran.
6. Einträge, die für die Abrechnung zählen, aber noch einen Beleg brauchen (zum Beispiel eine Unterschrift des GU auf dem Regiebericht), stehen auf der Liste "offen". Der Abrechner sieht sie im Abschluss-Lauf.

**Regeln:**
- Der Agent spricht nur mit Mitarbeitern der Kundenfirma, nie mit dem GU.
- Der Agent erfasst, er entscheidet nie über Abrechenbarkeit.
- Keine Auswertung pro Mitarbeiter, kein Scoring (§ 96a ArbVG). Der Absender ist nur Herkunft des Eintrags.
- Teilnahme freiwillig pro Mitarbeiter. Ein Weg ohne WhatsApp (Upload-Link) ist vorzusehen (Annahme).
- Kein neues Tool für den PL: Die Triage macht der Agent, nicht der PL.

**Warum es tragen kann (Annahme):** Baustellen kommunizieren schon über WhatsApp. Der Zuruf dauert Sekunden und ist als Quelle für die Abrechnung später nutzbar, auch wenn nie ein Regiebericht geschrieben wurde.

**Offene Punkte, alle ungeprüft:**
- WhatsApp Business Plattform von Meta nötig: Freischaltung, Kosten, Nachrichtenregeln (unbelegt).
- WhatsApp entfernt bei Bildern in der Regel EXIF-Daten. Der Zeitpunkt kommt dann aus dem Nachrichtenzeitstempel, der Beweiswert ist geringer als bei einem Original-Foto aus dem Ordner (unbelegt, testen).
- Verstehen von Sprachnachrichten im österreichischen Dialekt und mit Baustellen-Fachwörtern: Qualität testen (Annahme).
- Datenschutz: Meta als Dienstleister, Mitarbeiterdaten, Personen auf Fotos, AVV. Fragen an den Anwalt (Abschnitt 4).

**Einsatzregel:** Prototyp auf synthetischen Daten. Echte Kundendaten über WhatsApp erst nach R4 (Recht) und nach Klärung mit dem Betriebsrat des Pilotkunden.

### 3.5 Den Zwilling sichtbar machen

| Ebene | Ansicht | Inhalt | Stufe |
|---|---|---|---|
| Firma | Projektübersicht | alle Projekte mit Ampel, offen verrechenbarer Betrag, anstehende Schlussrechnungen, Fristen | 1 |
| Firma | GU-Historie | pro GU: Kürzungen, akzeptierte Nachträge, Zahlungsverhalten | 1 (nach den ersten Projekten) |
| Projekt | Beleg-Panel | jede Zahl führt zum Original (Datei, Seite, Stelle; bei Zuruf Foto und Ton) | 0 |
| Projekt | Ledger | LV-Position mit erbracht, verrechnet, bezahlt (Ampel) | 0 |
| Projekt | Zeitachse | alle Ereignisse in Reihenfolge: Mail, Regie, Foto, Zuruf, Planindex, Rechnung, Zahlung | 1 |
| Projekt | LV-Baum | Bereiche mit Status: Wo ist Geld offen? | 1 |
| Projekt | Plan-Ansicht mit Pins | Fotos und Zurufe am Plan oder Geschoss verortet (braucht Pläne als Bild oder BIM) | 3 (Annahme) |

Stufe 0 und 1 bedienen wir selbst, der Kunde bekommt Bericht, Excel und Export. Ab Stufe 2 gibt es eine Lese-Ansicht für Abrechner und Inhaber (Annahme). Für die Website sind diese Ansichten das Bildmaterial.

### 3.6 Anwendung 1: Schlussrechnung (Projektebene)

**Zwei Betriebsarten:**
- **Rückwirkend (Check, Stufe 0):** Die Firma gibt den Projektordner. Wir bauen den Projektzwilling daraus und fahren den Abschluss-Lauf. Einstiegsprodukt, kurz vor der Schlussrechnung, 10 Arbeitstage. Das ist der Check aus v2.
- **Laufend (ab Stufe 2 und 3):** Der Projektzwilling wird während des Projekts gefüllt. Der Abschluss-Lauf braucht dann weniger Zeit (Annahme, Messwert nach den ersten Piloten).

**Abschluss-Lauf:**
1. **Übergabe und Einlesen:** vorher AVV unterschrieben. Jedes Dokument wird ein Datensatz mit Quelle, Duplikate und neue Versionen werden erkannt.
2. **Vertragsprofil:** Regelwerk, Preisbasis, Fristen. Das Regelwerk des GU und seine Historie kommen aus dem Firmen-Zwilling (beim ersten Projekt noch leer). Wo der Vertrag mehrdeutig ist, gilt die früheste plausible Frist. Schlusswerk sagt nie, ob eine Frist präklusiv ist.
3. **Vollständigkeit:** offene Entwürfe, Regie ohne Unterschrift, Planindex-Lücken, fehlende Belege.
4. **Abgleich:** LV × Aufmaß × Regie × Zurufe × Rechnungen × Zahlungen. Die KI liefert die Fakten, die Rechnung ist Code.
5. **Erkennung:** Regie nicht unterschrieben oder nicht verrechnet; Mengen über der LV-Menge; Planindex-Änderungen; Anweisungen in Mails und Zurufen; vereinbarte Preisgleitung.
6. **Bepreisung:** aus dem eigenen LV-Einheitspreis und den K7-Lohnminuten (Preisbasis im Firmen-Zwilling).
7. **Vorprüfung aus GU-Sicht:** dieselben Prüfungen wie ein GU-Werkzeug auf der eigenen Rechnung: Positionen ohne Aufmaß-Nachweis, Regie ohne Unterschrift, Rechenfehler, Positionen außerhalb des LV, fehlende Belege für Einbehalte und Nachlässe.
8. **Entwurf der Schlussrechnung:** alle Positionen mit Menge, Preis, Zuschlägen, Gleitung, Abzügen, Abschlägen, Einbehalten und Zahlbetrag. Jede Zeile hat einen Beleg.
9. **Prüfung durch den Insider** vor jeder Auslieferung, **Freigabe jeder Zeile durch den Abrechner, Versand durch die Firma selbst.**
10. **Kodier-Session** (bei Design-Partnern, 45 Minuten): Jeder gefundene Euro wird kodiert als (a) nicht bemerkt, (b) für die Beziehung liegen gelassen, (c) im Vergleich getauscht oder (d) vertraglich ausgeschlossen. Zusätzlich die Quelle des Belegs (15.5).
11. **Lernen:** Jede Korrektur des Insiders wird eine Regel im Prüfkatalog (Schlusswerk) oder im Regelwerk pro GU (Firmen-Zwilling). Das Projekt bleibt im Firmen-Zwilling, auch nach der Schlusszahlung.

**Reihenfolge der Posten:** 1. Regie, 2. Mengenüberschreitungen, 3. Preisgleitung, 4. angemeldete Änderungen. Behinderung, Forcierung und strittige Klauseln gehen nur über den Anwalt.

**Eingaben Stufe 0:** ÖNORM-A-2063-LV oder PDF, K-Blätter, Aufmaß (Excel/PDF), Regie-Scans, Abschlagsrechnungen und Zahlungen, Pläne mit Index, Mails (.msg/.eml, nur der Projektordner), WhatsApp-Export, Fotos mit EXIF, Verträge.

**Ausgaben:**
- Ledger pro LV-Position;
- drei Listen (jetzt verrechenbar / angemeldet und offen / verloren);
- Beweispaket pro Posten mit Link auf das Original;
- Vorprüfung aus GU-Sicht;
- Schlussbesprechungs-Blatt mit Untergrenze pro Posten;
- Entwurf der Schlussrechnung;
- Export: Excel, ÖNORM, BMD-Buchungsimport prüfen (reebuild bindet BMD, BRZ, RZL an, G).

### 3.7 Weitere Anwendungen (Kandidaten, nicht entschieden)

Nicht Teil der Gates und nicht vor R5. Jede wird einzeln entschieden.

**Auf Projektebene:**
- Anmeldungsentwürfe für Regie und Änderungen, die der PL selbst versendet (v2: Live-Desk).
- Abschlagsrechnungen aus dem Leistungsstand.
- Fristenkalender und Sicherstellungs-Tracker nach § 1170b ABGB.
- Abnahme- und Übergabedokumentation.

**Auf Firmenebene (nur möglich, weil der Zwilling das ganze Business kennt):**
- Portfolio: offen verrechenbarer Betrag, anstehende Schlussrechnungen und Fristen über alle Projekte.
- Historie und Regelwerk pro GU: Was kürzt welcher GU, was akzeptiert er, wie zahlt er?
- Projektstand für den Inhaber: Fortschritt und Kosten pro Projekt.
- Wissen sichern: Die Projekthistorie bleibt im Betrieb, wenn ein PL geht (Annahme).
- "Frag den Zwilling": Abfrage in natürlicher Sprache, höchstens als Hilfsfunktion, nie als Kernfunktion.

**Später, nicht vor Jahr 2 (Stratos-Muster: interne plus externe Daten):** externe Daten im Zwilling, zum Beispiel Baupreisindizes für die Preisgleitung oder öffentliche Vergaben (unbelegt).

**Geparkt:** Kalkül (Angebote aus dem LV-Archiv bepreisen). Das LV-Archiv im Firmen-Zwilling macht es technisch naheliegend, die Regel aus v2 bleibt: erst nach 15 zahlenden Desks und bestandenem Kalkulator-Test.

### 3.8 Angebote: Check, Desk, Live

| Angebot | Was die Firma bekommt | Zustand des Zwillings | Wann |
|---|---|---|---|
| **Check** | ein Projekt rückwirkend aus dem Projektordner: Projektzwilling, Abschluss-Lauf, alle Ausgaben aus 3.6 | 1 Projekt | ab Start |
| **Desk** (Jahresdesk) | jedes schließende Projekt und jede Teilschlussrechnung; Projektübersicht, Historie pro GU, Fristenkalender nach der Schlusszahlung, Sicherstellungs-Tracker nach § 1170b ABGB | wächst mit jedem Projekt | ab erstem bezahlten Kunden |
| **Live** (Zwilling Live) | Zuruf per WhatsApp, Anbindung an ERP und Mails, laufende Erkennung | alle laufenden Projekte | Jahr 2, nach 2 gelieferten Checks und bestandenem R4 |
| Streitpaket | gleiche Engine, rechtliche Würdigung durch die Partnerkanzlei; Kunde bezahlt beide direkt | nach Bedarf | nur über die Kanzlei |

### 3.9 Was Schlusswerk nie tut

- Kontakt zum GU, auch nicht durch den Agenten;
- rechtliche Würdigung oder Aussagen zur Präklusion;
- Inkasso oder Abtretung;
- Bonus auf strittige Beträge;
- Preise zwischen Firmen poolen;
- Mitarbeiter bewerten oder pro Mitarbeiter auswerten;
- ein ERP oder CRM ersetzen;
- den Agenten über die Abrechenbarkeit entscheiden lassen;
- das Wort "Claim" in Kundenmaterial.

---

## 4. Recht (Design-Hypothese, keine Rechtsberatung)

Gelesen im Gesetzestext (RIS): § 134 GewO, § 1170b ABGB, § 879 ABGB. Alles andere ist unbelegt, bis das Gutachten vorliegt (Gate R4, Fr 4.12.).

| Regel | Folge für Schlusswerk |
|---|---|
| § 8 RAO (Parteienvertretung, unbelegt) | Kernfrage an den Anwalt: Sind Check, Ledger, Bewertung **und Entwurf der Schlussrechnung** vorbehaltene Tätigkeit? |
| Winkelschreiberei (unbelegt) | keine Rechtsurkunden verfassen; Vorlagen kommen vom Kunden |
| § 134 GewO (gelesen) | Ingenieurbüros dürfen beraten und berechnen; das passt zur Bewertung. Möglicher Lizenzweg über den Insider (unbelegt) |
| § 879 Abs 2 Z 2 ABGB (gelesen) | nie Anteil an Streitsachen; Bonus nur auf unstrittig bezahlte Posten |
| § 1170b ABGB (gelesen) | Sicherstellung bis 20 % (unter 3 Monaten 40 %), unverzichtbar; Feature im Desk |
| § 174 TKG 2021 | keine Werbe-Mails und keine Werbeanrufe ohne vorherige Einwilligung, auch an Unternehmen; auch ein Anruf, der nur nach der Einwilligung fragt, ist unzulässig (gelesen: [WKO](https://www.wko.at/noe/internetrecht/e-mail-fax-telefonwerbung-telekommunikationsgesetz-detail); Prüfer: RIS § 174 und § 4 Z 13). Vor jeder elektronischen Nachricht den Anwalt fragen. Ob Antworten und Rückfragen des WhatsApp-Agenten an Mitarbeiter der Kunden darunter fallen, ist unbelegt |
| § 96a ArbVG | kein PL-Scoring. Mögliche Betriebsvereinbarung für die Zuruf-Erfassung, wenn ein Betriebsrat besteht (unbelegt) |
| DSGVO bei WhatsApp | Meta als Dienstleister, Mitarbeiterdaten, Personen auf Fotos, Drittlandbezug, AVV (unbelegt) |
| **[neu v3]** DSGVO beim Firmen-Zwilling | Der Zwilling enthält Personendaten Dritter (Ansprechpartner beim GU, Mails) und wächst über Projekte hinweg. Zweckbindung, Rollen und Rechte, Löschkonzept (unbelegt) |
| Aufgezeichnete Calls | Aufzeichnung braucht vermutlich die Einwilligung der Beteiligten. Wir lesen nur Aufnahmen, die der Kunde rechtmäßig besitzt, und lassen das schriftlich bestätigen (unbelegt, Anwalt) |

**Fragenliste an den Anwalt (KW 47 schriftlich, Gutachten KW 48):**
1. § 8 RAO und Winkelschreiberei: Check, Ledger, Bewertung, Entwurf der Schlussrechnung.
2. Erfolgsbonus und Ingenieurbüro-Weg.
3. § 174 TKG bei Briefen, Recruiting und Agenten-Antworten.
4. WhatsApp und Meta unter der DSGVO, AVV, Hosting.
5. Aufgezeichnete Calls als Quelle.
6. Betriebsrat und Betriebsvereinbarung bei Zuruf-Erfassung.
7. Haftung bei Dauerdienst (Desk, Live) gegenüber Check.
8. **[neu v3]** Firmenweiter Zwilling: Personendaten Dritter, Zweckbindung, Rollen und Rechte, Löschung.

**Haftung:**
- Versprechen ist "Prüfung und Entwürfe", keine Garantie.
- Haftungsdeckel: 12 Monatsgebühren.
- Vermögensschadenhaftpflicht 1 Mio. €, Prämie höchstens 8.000 € pro Jahr (Gate R4).
- Der Entwurf der Schlussrechnung ist ein Entwurf: Freigabe durch den Abrechner, Versand durch die Firma.

**Datenschutz:**
- AVV vor dem ersten Projektordner;
- EU-Hosting, Datensilo pro Firma;
- **[geändert v3]** Einstieg nur mit dem freigegebenen Projektordner. Der Firmen-Zwilling wächst nur mit Projekten, die die Firma freigibt;
- Rollen und Rechte pro Projekt (Annahme);
- Der Zwilling besteht während der Vertragslaufzeit. Löschkonzept pro Projekt und bei Vertragsende. Aufbewahrungspflichten klären (unbelegt);
- KI-Modelle und Sprach-zu-Text über eine EU-Region. Das ist eine Annahme zur Machbarkeit und muss vor dem ersten echten Ordner geprüft werden. Kuro wirbt mit EU-Hosting und ISO 27001, reebuild mit Hosting in Deutschland (G).

Deutschland (RDG, VOB/B, GAEB, kostenbasierte Bepreisung nach BGH VII ZR 34/18) kommt erst ab 2028, nach einem Gutachten.

---

## 5. Preise und Zahlen

| Angebot | Preis |
|---|---|
| Erster Check für 3 Design-Partner | gratis, nur gegen die Kodier-Session |
| Einzel-Check | 1.500 € (Auftrag unter 0,5 Mio. €) / 2.500 € (0,5 bis 1,5 Mio. €) / 3.500 € (über 1,5 Mio. €); wird angerechnet, wenn binnen 60 Tagen ein Desk folgt |
| Jahresdesk S / M / L | 800 / 1.400 / 2.500 € pro Monat (bis 6 / 15 / 35 Abschlüsse pro Jahr) |
| Erfolgsbonus (optional) | höchstens 8 % der gefundenen und bezahlten Posten, max. 5.000 € pro Projekt, nur nach Anwaltsfreigabe |
| Live (Zwilling Live) | Jahr 2, plus 600 bis 900 € pro Monat als Platzhalter (Annahme) |
| Streitpaket | 3.000 bis 6.000 € pro Fall |

**Umwandlungsregel:** Ein Design-Partner wird zahlend, wenn sein Check mindestens 30.000 € oder 1,5 % der Auftragssumme an "nicht bemerktem" Geld findet.

**Preislogik:** Check, Desk und Live folgen dem Wachstum des Zwillings: ein Projekt, alle schließenden Projekte, alle laufenden Projekte. Das Modell "Abo pro aktivem Projekt" war in v2 verworfen, weil es ab Tag 1 Postfach und tägliche Triage durch den PL verlangte. Mit dem Agenten entfällt der Grund teilweise. Die Preisstruktur für Live wird neu geprüft, sobald Stufe 2 steht. Bis dahin gelten die Preise oben.

**Preis nach außen:** Kuro und reebuild veröffentlichen keine Preise und verkaufen über "Demo buchen" bzw. "Schreiben Sie uns" (G). Vorschlag: Nur den Einstiegspreis zeigen ("Check ab 1.500 €, fix"). Der Desk gibt es im Gespräch. Der Fixpreis ist bei Inhabern, die jeden Euro verhandeln, ein Vertrauenssignal (Annahme).

**Kennzahlen (alle Annahme):**

| Kennzahl | Wert |
|---|---|
| ACV | 14.000 € zum Start, 18.000 bis 19.000 € in der Reife |
| Bruttomarge | 55 bis 65 % im Jahr 2027, 75 bis 80 % in der Reife. Live bringt laufende Kosten (WhatsApp, Sprach-zu-Text, Hosting), noch nicht eingerechnet |
| Prüfaufwand pro Check | 6 bis 10 h am Anfang, später 2 bis 3 h |
| CAC | 8.000 bis 15.000 € früh, etwa 6.000 € in der Reife |
| Kosten der Gates bis 31.1. | 3.000 bis 6.000 € |

**Finanzierung (Basisfall):** bezahlte Checks, dann Pre-Seed 0,8 bis 1,5 Mio. € Mitte 2027, dann Seed 3 bis 5 Mio. € Anfang 2029. reebuild wurde in der Frühphase von aws und FFG gefördert (G, [Trending Topics](https://www.trendingtopics.eu/reebuild-3-millionen-euro-seed/)). Programme und Beträge für uns sind unbelegt.

---

## 6. Markt und Exit

**Markt:**
- Relevante Firmen (Annahme): Österreich 650 bis 700, Deutschland 4.200 bis 5.000.
- SAM Elektro/HKLS in AT plus DE: **70 bis 100 Mio. €**; mit weiteren Gewerken in DACH 150 bis 200 Mio. €.
- Österreich-Deckel: 120 bis 150 Kunden, also 2 bis 2,5 Mio. € ARR.
- 10 Mio. € ARR brauchen 550 bis 700 Firmen. Im Basisfall ist das Ende 2032, im konservativen Fall nicht vor 2035.
- Deutschland frühestens 2028, nur wenn alle drei gelten: 40 zahlende AT-Kunden, ein RDG-Gutachten liegt vor, das Produkt ist umgebaut (GAEB, VOB/B, kostenbasierte Bepreisung).
- Die Zahlen beruhen auf der Schlussrechnung als einziger Anwendung. Weitere Anwendungen auf dem Firmen-Zwilling könnten den ACV erhöhen. Das ist eine Annahme ohne Messwert und fließt nicht in die Rechnung ein.

**Signal aus reebuild:** 120+ Bau- und Immobilienfirmen in AT, DE und darüber hinaus nutzen reebuilds KI-Backoffice, "ab 10 Mitarbeitern" (G). Mittelständische Baufirmen kaufen also solche Software. Ob Elektro- und HKLS-Betriebe darunter sind, ist unbekannt.

**Exit:**

| Szenario | ARR | Exit-Wert | Käufer |
|---|---|---|---|
| Unten | 1 bis 2,5 Mio. € | 3 bis 8 Mio. € | Beratung, BuildTec-Zukauf, Constellation |
| Wahrscheinlich bei PMF | 3 bis 6 Mio. € | **15 bis 30 Mio. €** | BuildTec, Nemetschek (NEVARIS), ib-data (ABK) |
| Oben | 8 bis 10 Mio. € | 60 bis 100 Mio. € | Nemetschek, RIB, Fachverlag (Libra-Muster) |

reebuild kommt als möglicher Käufer oder Partner dazu (gleiche Buchhaltungs-Anbindungen, Ziel "Agentic Backoffice", G). Ein Sub-Modul würde ihre GU-Kunden verärgern, das ist ein Kanalkonflikt (Annahme). ERP- und AVA-Anbieter sind als Anbindungspartner und als Käufer interessant, weil der Zwilling auf ihren Daten aufsetzt (Annahme).

**Wahrscheinlichkeitskette (unverändert aus v2):**

| Schritt | Wahrscheinlichkeit |
|---|---|
| Insider bis 4.12. | 45 % |
| Gates R2 bis R5, gegeben Insider | 35 % |
| Team hält zusammen | 80 % |
| → Gates bestanden und Team bleibt dabei | etwa 13 % |
| 2,5 bis 3 Mio. € ARR bis 2031 | 35 % |
| Verkauf über 10 Mio. € | 55 % |
| → **Exit über 10 Mio. € bis Okt. 2032** | **etwa 3 % (90 %-Intervall 1 bis 6 %)** |

Der Zwilling ändert die Kette nicht. Er vergrößert den Bauumfang und damit das Risiko vor R2 bis R5. Deshalb ist der Bau gestuft (Abschnitt 15).

---

## 7. Konkurrenz

| Anbieter | Seite | Was sie tun | Bedrohung für uns |
|---|---|---|---|
| **reebuild** (Wien) | Bauträger, Baufirmen | Rechnungen und NU-Rechnungen gegen LV, Bauvertrag, Aufmaß prüfen; Korrekturblatt; BMD/BRZ/RZL; "digitaler Zwilling" pro Dokument; Foto-App für Lieferscheine | **hoch bis mittel:** hat Engine, AT-Formate und Kunden, die selbst Subs sind. Wahrscheinlichster Schließzug: "Ausgangsrechnung prüfen" (Annahme) |
| **Kuro** (Berlin) | große GUs | Projektunterlagen als Graph, Widerspruchsanalyse, NU-Angebotsprüfung, Raumbuch, Vergabe | **niedrig direkt:** Angebotsphase. Zwilling der Gegenseite, stärkt den Druck auf Subs |
| PlanRadar, Capmo | GU-Plattformen | Nachforderungsmanagement, KI-Nachtragsprüfung, KI-Agenten (PlanRadar seit August, früherer Chat); Subs sind Gratis-Gäste | **hoch:** Mit mobiler Erfassung und Projektzwilling kommen wir ihnen näher. Sie haben Daten und Nutzer auf der Baustelle |
| ABK, NEVARIS, RIB iTWO, ORCA, BuildTec | AVA/ERP | halten die Daten; gleichen laut Vergleichsportal automatisch gegen das LV ab, sehen aber nur, was erfasst ist (früherer Chat) | **mittel bis hoch:** Die Firmenebene ist ihr Revier. Sie könnten den Abgleich oder eine Wissensdatenbank nachbauen. Zugleich sind sie Anbindungspartner, der Zugang hängt an ihren Schnittstellen |
| Dimacon | Sub-Seite | digitaler Regiebericht gegen vergessene Leistungen (früherer Chat, S) | **mittel:** löst nur Regie, nicht über alle Quellen. Direkter Berührungspunkt mit dem Zuruf |
| Conmeet | Bau-ERP | ERP mit Nachtragsmanagement, 6 Mio. € Seed, Deutschland (früherer Chat, S) | niedrig bis mittel |
| Cosuno, Forgent, Sidoun | Angebote, Planer-AVA | Angebote und LVs | niedrig; liefern Dateien, mögliche Kanäle |
| Document Crunch, Trunk Tools, Adaptive | US, GU-Seite | Änderungs- und Change-Order-Erkennung | niedrig in DACH für 2 bis 3 Jahre |
| Stratos, Dryft, Tacto | andere Branchen | Kundendaten anbinden, Zwilling auf Unternehmensebene, Anwendungen darauf | keine; Vorbilder für das Muster (Abschnitt 8) |

**Die Lücke:** Keiner der geprüften Anbieter gleicht auf der Sub-Seite erbracht gegen verrechnet ab, bepreist aus LV und K7 der Firma und liest dabei auch Belege außerhalb des ERP (Mails, Fotos, Regie auf Papier, Zurufe). Positionierung: neutrale Wissens- und Prüfschicht über allen Systemen des Subs, nicht eine weitere Bausoftware. Das Fenster ist auf 12 bis 24 Monate geschätzt.

**Kernrisiko der Lücke (früherer Chat):** Liegt fast alles Belegbare schon im ERP, baut der ERP-Anbieter das Feature, und wir haben kein Produkt. Liegt viel außerhalb, ist das unser Vorteil. Deshalb messen wir ab dem ersten Check die Quelle jedes Funds.

**Beobachtungsliste:** 1. reebuild, 2. PlanRadar, 3. Capmo, 4. die ERP-Anbieter der Design-Partner.

**Burggraben (5/10, unverändert bis R3):**
- **Was trägt:** Ledger-Historie pro Firma, Regelwerk pro GU, österreichische Formattiefe, geliehenes Vertrauen (Insider, Kanzlei), Gegenposition zu GU-finanzierten Plattformen.
- **Was dazukommen könnte [neu v3]:** Der Firmen-Zwilling sammelt mit jedem Projekt Wissen an. Dadurch steigen die Wechselkosten (Annahme). Zurufe und informelle Quellen könnten exklusive Daten werden, wenn der Quellenanteil außerhalb der Systeme hoch ist (R3 misst).
- **Was fehlt:** Netzwerkeffekt zwischen Firmen.

---

## 8. Lernen von Kuro, reebuild und Stratos

Die Steckbriefe, Muster, die Antwort zur GU-Seite (8.5) und die Investorenstory (8.6) stehen unverändert in `research_notes/Kuro_reebuild_Fakten.md` (aus v2, Abschnitt 8). Hier steht nur, was der Zwilling davon ändert.

### 8.1 Gemeinsamer Bauplan der Vorbilder

Kuro, reebuild, Stratos, Dryft und Tacto folgen demselben Muster: Daten des Kunden anbinden, in ein Branchen-Datenmodell bringen, darauf Analysen, Agenten und Workflows legen (früherer Chat). Unterschiede liegen in Branche, Daten und Job. Das Muster allein ist kein Burggraben mehr. Gewonnen wird über einen klar bezahlten Job mit Geld-Ergebnis, über Daten und Regelwerk, die mit jedem Kunden besser werden, und über Zugang zu einer Zielgruppe, die andere nicht bedienen. Für uns: Job Schlussrechnung, Seite Subunternehmer, Regelwerk ÖNORM und GU-Verhalten, dazu informelle Quellen.

| Vorbild | Kunde, Daten, Job (früherer Chat, nicht neu geprüft) | Lehre für uns |
|---|---|---|
| **Stratos** | B2B, auch Bau und Chemie; interne Daten plus externe Marktdaten als "Commercial Digital Twin" für das ganze Unternehmen; Wachstumsentscheidungen (stratos.ai) | Vorbild für die Navigation Firma → Detail und für Anwendungen auf einem Unternehmens-Zwilling (Angabe von Maxi, 22.10.). Der Zwilling ist das Mittel, verkauft wird die Entscheidung bzw. das Geld |
| **reebuild** | Bauunternehmen und Bauträger; Rechnungen, Lieferscheine, Kosten; "digitaler Zwilling" pro Dokument, Abgleich gegen LV, Lieferschein, Vertrag; Foto-App mit 2.350 täglichen Nutzern (G, v2) | Wir heben die Einheit vom Dokument über das Projekt auf das ganze Unternehmen. Erfassung per Handy auf der Baustelle wird genutzt |
| **Kuro** | GUs; Pläne, Baubeschreibungen, Gutachten, 3D-Modelle; Projektunterlagen als Graph; Integrationen iTwo, RIB, Revit, Egnyte, CDE (G, v2) | Anbindung an Fremdsysteme ist Standard, nicht Differenzierung. Revit zeigt den BIM-Pfad für Stufe 3. Forward-Deployed-Modell passt zu Stufe 0 und 1 |
| Dryft | Fertigung; ERP-Daten; automatisiert Entscheidungen wie Lieferanten nachfassen (dryft.ai) | Ein Zwilling auf ERP-Daten, der Entscheidungen auslöst, ist ein bekanntes Muster |
| Tacto | Mittelstand, Einkauf; Einkaufsdaten plus Marktsignale | gleiches Muster im Einkauf |

Steckbriefe zu Stratos, Dryft und Tacto sind nur Kurzfassungen. Maxi ergänzt sie bei Bedarf aus öffentlichen Quellen.

### 8.2 Was sich gegenüber v2 Abschnitt 8.3 und 8.4 ändert

| Muster | v2 | v3 |
|---|---|---|
| "Digitaler Zwilling" pro Dokument (reebuild) | Architektur v1: Dokument → Datensatz → Ledger | Dokument → Datensatz → **Projektzwilling → Firmen-Zwilling**. Das Ledger ist eine Ansicht des Projektzwillings |
| Foto-App (reebuild) | nicht übernehmen | Erfassung per Foto ja, über WhatsApp statt eigener App (Stufe 2) |
| Plattform-Story ab Tag 1 | nicht übernehmen | Der Zwilling ist Kernprodukt, verkauft und bewiesen wird über einen Job (Abschnitt 9) |
| Forward Deployed (Kuro) | v1 ohne Kundenzugang | gilt für Stufe 0 und 1 |
| Echtzeit-Budget, Lager, ESG (reebuild) | nicht übernehmen | bleibt nicht übernommen |
| KI-Chat als Kernfunktion (Kuro) | nicht übernehmen, höchstens "Frag den Ordner" | bleibt. "Frag den Zwilling" ist ein Kandidat in 3.7 |
| Kalkulation und Angebot (Kuro) | geparkt | geparkt |
| Telefon-Kaltakquise (reebuild-SDR) | nicht übernehmen (§ 174 TKG) | bleibt |

---

## 9. Vertrieb und Positionierung

**Kanäle für die ersten 10 Kunden:** alles legal nach § 174 TKG, also persönlich, Brief, Events, Partner.

| Quelle | Ziel | Wie |
|---|---|---|
| 2 Baurechtskanzleien plus 1 Ingenieurbüro | 4 | persönlicher Besuch mit Demo; "ihr behaltet die Rechtsarbeit"; keine Provisionen |
| 2 Innungsabende (Elektro und SHK, Wien und NÖ) | 3 | Thema "Das Geld am Ende des Projekts"; Anwalt und Insider reden, wir zeigen die Demo; Anmeldung mit Einwilligung |
| Netzwerk des Insiders | 2 | persönliche Vorstellung |
| Briefe an Gewinner öffentlicher Lose plus Bürobesuch | 1 | Brief nennt das Los, bietet einen Check an |

**Später:** ÖNORM- und Kalkulationstrainer, Kundentage im Großhandel, Messen. Verbände der Bauindustrie und GUs sind kein Kanal.

**Zyklus:** 1 bis 3 Monate vom ersten Treffen bis zum Vertrag (unbelegt). Etwa 10 Verkaufswochen bis Weihnachten. Zwischen 20.12. und 6.1. steht das Handwerk still.

**Positionierung nach außen (Empfehlung, Entscheidung bei der Website-Arbeit):**
- **Kernprodukt ist der Zwilling, der Einstieg ist das Geld.** Ein Inhaber kauft zuerst das Ergebnis: Schlussrechnung belegt, nichts bleibt liegen. Den Zwilling braucht er, um zu verstehen, warum das klappt, und als Ausblick: Heute ein Projekt, mit der Zeit der ganze Betrieb an einem Ort.
- **Reihenfolge auf der Website (Vorschlag):** 1. Ergebnis (Schlussrechnung), 2. Wie es funktioniert (Zwilling, Firma und Projekt), 3. Ausblick (Desk, Live).
- **Headline:** Vor R3 bleibt sie beim Ergebnis: "Schlussrechnung in 10 Tagen geprüft, jede Position belegt." Nach R3 nur mit echtem Wert: "Im Schnitt X € pro Projekt gefunden."
- **Begriff:** Ob "digitaler Zwilling" bei Inhabern von Handwerksbetrieben trägt, ist ungeprüft. Alternativen zum Testen: "Betriebsgedächtnis", "Projektakte". Dasselbe gilt für den Namen: "Schlusswerk" beschreibt die erste Anwendung, nicht das Kernprodukt (offene Frage 13).
- **Vertrauensleiste:** EU-Hosting, AVV, Datensilo pro Firma, "ihr gebt nur die Projekte frei, die ihr wollt", "wir reden nie mit eurem GU", keine Auswertung pro Mitarbeiter. ISO 27001 erst nach dem Pre-Seed.

**Einwände:**

| Einwand | Antwort |
|---|---|
| "Wir verrechnen eh alles." | "Dann zeigt der Check das schwarz auf weiß." |
| "Wir brauchen den nächsten Auftrag." | Regie und Mengen sind Abrechnung, kein Streit. Ihr tauscht aus einer vollständigen Liste. "Euer GU prüft eure Rechnung schon mit Software. Prüft sie vorher selbst." |
| "Daten vertraulich." | AVV, EU-Hosting, Silo, nur freigegebene Projekte, unsichtbar für den GU |
| "Ihr wollt Zugriff auf unser ganzes Geschäft?" | "Nein. Wir starten mit einem Projekt. Der Zwilling wächst nur mit den Projekten, die ihr freigebt." |
| "Seid ihr Anwälte?" | Nein. Berechnung und Software; Rechtsfragen gehen an euren Anwalt |
| "KI macht Fehler." | Jeder Posten hat Beleg und Rechenweg, die Rechnung ist deterministisch, Insider und Abrechner prüfen |
| "Ihr seid Studenten." | Darauf antworten der Insider im Raum und die Zahl auf dem eigenen Projekt |
| "Wir haben schon ein ERP." | "Das ERP sieht nur, was jemand eingetragen hat. Wir lesen zusätzlich, was daneben liegt: Mails, Fotos, Regie auf Papier. Das ERP bleibt führend." |
| "WhatsApp mit Firmendaten, das ist uns zu heikel." | "Es ist ein zusätzlicher Weg, kein Muss. Der Check läuft auch aus einem Ordner." Erst sagen, wenn R4 geklärt ist |
| "Das ist Kontrolle über meine Leute." | "Es gibt keine Auswertung pro Mitarbeiter, nur pro Projekt und Position." Nur zusagen, wenn es technisch so gebaut ist |

---

## 10. Team

| Person | Fokus bis 31.1. |
|---|---|
| **Maxi** | R1 Insider (Vorrang), Produkt (Demo, Stufe 0, Datenmodell Firma und Projekt), R3 mit dem Insider, Website, CI, Name, Hosting (Reihenfolge offen) |
| **Co-Founder A** | R4 Recht und Versicherung inkl. erweiterter Fragenliste, AVV, synthetische Demo-Daten (Firma mit mehreren Projekten, inkl. Zurufe), Konkurrenz-Demos, Marktzählung |
| **Co-Founder B** | Feld: Innungen, Kanzleien, Sub-Gespräche (inkl. Fragen zu ERP, Mails, WhatsApp, Firmenzugang), R2 Ordner, R5 Zahlung, #glaubandich |
| **Insider** (ab Term Sheet) | Prüfkatalog, Prüfung jedes Checks, alle Kundentermine ab Dezember |

**Regeln:**
- Gründervertrag bis Fr 6.11.: 4 Jahre Vesting, 1 Jahr Cliff, Leaver-Regeln, wer bei bestandenen Gates Vollzeit geht.
- Commitment: 15 bis 20 Stunden pro Person und Woche, Kennzahlen-Runde jeden Sonntag.
- Maxi baut höchstens die Hälfte seiner Zeit, solange R1 offen ist. Lehre aus dem Playbook: "Das Tool darf das eigentliche Projekt nicht auffressen."
- Mit Firmen-Zwilling, WhatsApp-Agent und Website ist der Bauumfang größer als in v2. Die Bau-Aufteilung (wer übernimmt Datenmodell, WhatsApp-Prototyp, Website) wird in der Sonntagsrunde am 25.10. entschieden (offene Frage 14).

**Insider (Pflicht):**
- **Option A:** pensionierter PL oder Abrechnungsleiter (60 bis 68), 2 Tage pro Woche; 6 bis 8 % Anteile, 3 Jahre Vesting, 6 Monate Cliff, plus 30 % jeder bezahlten Check-Gebühr.
- **Option B:** aktiver Abrechnungs- oder Nachtragsmanager (40 bis 55); 15 bis 20 % Anteile, Vollzeit nach dem Pre-Seed.
- **Wo suchen:** ÖNORM-Trainer, beeidete Sachverständige, Landesinnungen, Großhandel, TU-Institute, Roman und alle Kontakte.
- **Ablauf:** Briefe, Kaffee, der Kandidat streicht in der Demo an, was falsch ist, dann ein bezahlter Probetag.

**Dazu:** pensionierter Kalkulator als Advisor (0,5 bis 1 %), Baurechtskanzlei (keine Anteile, keine Provisionen), Ingenieurbüro, Versicherungsmakler.

---

## 11. Risiken und offene Fragen

| # | Risiko (Red Team) | Einschätzung | Antwort | Test |
|---|---|---|---|---|
| 1 | Kein Ordner | ~65 %, tödlich | Einstieg kurz vor der Schlussrechnung; Anfrage über Kanzlei, Insider, Innung | R2 |
| 2 | Geld wird bewusst liegen gelassen | ~50 % | Abrechnung statt Streit; Schlussbesprechungs-Blatt | R3 |
| 3 | Erfolgshonorare kommen spät | ~70 % | mindestens 80 % fix | R5 |
| 4 | Glaubwürdigkeit ohne Insider | ~70 % | Insider als Pflicht-Gate | R1 |
| 5 | Recht und Haftung | ~40 % | Check als Berechnung, Kunde versendet, Kanzlei | R4 |
| 6 | Kalkül ist nur ein Feature | ~55 % | geparkt | n/a |
| 7 | Konkurrenz (reebuild, PlanRadar, Capmo, ERP-Anbieter) | ~45 % | Gegenposition, Formattiefe, Regelwerk pro GU, informelle Quellen | Demos bis 6.11. |
| 8 | Markt kleiner als gedacht | ~60 % | Deutschland 2028, zweites Gewerk 2030 | Zählung 13.11. |
| 9 | Exit klein | ~50 % | 80 % fix, Käufer mit Sub-Kundenbasis | Gespräche auf der BAU 2027 |
| 10 | Timing | ~40 % | Insider und Ordner vor Weihnachten | 5 GF-Termine bis 18.12. |
| 11 | **[neu v3]** Bauumfang zu groß für drei Studenten mit 15 bis 20 h pro Woche (Firmen-Zwilling, Projektzwilling, WhatsApp, Anbindung) | hoch (nicht gemessen) | Stufen; Stufe 0 reicht für alle Gates; WhatsApp und Anbindung erst nach R3 | Bau-Stand in der Sonntagsrunde |
| 12 | **[neu v3]** Datenschutz, Betriebsrat, Akzeptanz von WhatsApp und Sprachaufnahmen (die alten Gründe aus v2 "PL und Betriebsrat blockieren") | hoch (nicht gemessen) | keine Auswertung pro Mitarbeiter, freiwillig, Weg ohne WhatsApp, R4-Fragenliste | Anwalt; Sub-Gespräche; Pilot |
| 13 | **[neu v3]** ERP-Schnittstellen fehlen oder werden blockiert | mittel bis hoch | Einspielen per Datei bleibt immer möglich; Anbindung erst je Design-Partner | Sub-Gespräche (Frage 9) |
| 14 | **[neu v3]** Informelle Daten sind schlecht verwertbar (Dialekt, Fotoqualität, Zuordnung, Fehldeutung) | mittel | Bestätigungsschritt durch den Absender; Mensch entscheidet; Prototyp testen | WhatsApp-Prototyp |
| 15 | **[neu v3]** Leithypothese falsch: Das Belegbare liegt schon im ERP, der ERP-Anbieter baut das Feature | mittel | Quellenkodierung ab R3; Positionierung bei Bedarf auf Check und Regelwerk | R3 |
| 16 | **[neu v3]** Zugang zum ganzen Business ist ein größerer Vertrauensschritt als ein Projektordner und verlängert den Verkaufszyklus; der Begriff "Zwilling" ist für Inhaber zu abstrakt | mittel bis hoch | Einstieg mit einem freigegebenen Projekt; Zwilling wächst mit Freigabe; Ergebnis zuerst verkaufen | Sub-Gespräche; Reaktion auf die Demo |
| 17 | **[neu v3]** Fokusverlust: Das Team baut Breite statt den einen Job zu beweisen | mittel | Keine weitere Anwendung vor R5; Gates unverändert; Stufen | Sonntagsrunde |

**Offene Fragen:**
1. Wie viel Geld bleibt pro Projekt "nicht bemerkt" liegen? (R3)
2. Wo finden wir den Insider, und wie sieht das Term Sheet aus (inkl. Pensionsfrage)?
3. Wie kommen wir an 3 Ordner?
4. Wie viele Schlussrechnungen hat eine Zielfirma pro Jahr?
5. Was sagt der Anwalt zu RAO, Bonus, Ingenieurbüro-Weg und § 174 TKG bei Briefen und Recruiting?
6. Was genau kürzen GU-Werkzeuge wie reebuild? Beim Demo-Termin und bei Subs nachfragen: Wer hat schon ein automatisches Korrekturblatt bekommen?
7. Welches Importformat hat BMD für Ausgangsrechnungen?
8. Welche EU-Region für die KI-Modelle und das Sprach-zu-Text, zu welchen Kosten?
9. Welche ERP, AVA und CRM nutzen die Zielkunden, und wo liegen Mails, Aufmaß und Regie heute?
10. Wie viel des gefundenen Geldes war nur außerhalb des ERP belegt? (R3, Quellenkodierung)
11. Nutzen Poliere und Monteure WhatsApp für Absprachen, und würden sie an eine Firmennummer schicken?
12. Antworten des Anwalts zu WhatsApp, Calls, Betriebsvereinbarung, Entwurf der Schlussrechnung und firmenweitem Zwilling (Abschnitt 4).
13. Wie nennen wir den Zwilling gegenüber Kunden? Der Name "Schlusswerk" beschreibt die erste Anwendung, nicht das Kernprodukt. Entscheidung beim Namens-Thema.
14. Wer baut was ab Stufe 1 (Datenmodell, WhatsApp-Prototyp, Website)?
15. **[neu v3]** Wie viel Firmenwissen (Kunden und GU-Historie, Kalkulationsbasis) wollen Inhaber überhaupt in einer Plattform haben? Interviewfrage für die Sub-Gespräche.
16. **[neu v3]** Kommen externe Daten (Stratos-Muster) in den Zwilling, und wann? Frühestens Jahr 2.

---

## 12. Verworfen und warum

Entschieden. Nur mit neuer Evidenz wieder aufnehmen und das ausdrücklich sagen. Zeilen mit **[geändert v3]** weichen von v2 ab.

| Verworfen | Ursprünglich | Warum verworfen | Was stattdessen gilt |
|---|---|---|---|
| **Kalkül als Modul** | Start Monat 9 bis 12, 450 bis 490 €/Monat plus 35 bis 45 € pro LV | Angriff 6 | geparkt, bis 15 zahlende Desks laufen **und** der Kalkulator-Test besteht |
| **Abo pro aktivem Projekt [geändert v3]** | 95 €/Projekt/Monat, mind. 690 € | verlangte ab Tag 1 Postfach und tägliche Triage durch den PL | bleibt als Startpreis verworfen; Abo pro **schließendem** Projekt. Neubewertung für Live ab Stufe 2 (Abschnitt 5) |
| **10 % Erfolgshonorar als Standard** (ursprünglich 5 % auf alles) | 10 %, Deckel 15.000 € | Cash erst 2028 bis 2029, strittig, kein ARR | mind. 80 % fix; Bonus max. 8 %, max. 5.000 €, nur nach Anwaltsfreigabe |
| **Das Wort "Claim", Name "Claimwerk"** | "Claims X-ray" | klingt nach Kampf und Rechtsberatung | "Schlusswerk", "Schlussrechnung", "verrechenbar" |
| **Röntgen alter Projekte als Einstieg** | Check eines geschlossenen Ordners | zeigt vor allem verjährtes Geld | Check **vor** der Schlussrechnung. Ein abgeschlossenes Projekt dient nur als Beweis für Insider und Design-Partner (wie bei Kuro/Köster) |
| **Reiner Streit-Desk** | Einstieg bei gekürzter Schlussrechnung | adversarial, rechtlich heikler | Streitpaket nur über die Kanzlei |
| **Live-Monitoring ab Start [geändert v3]** | Postfach, tägliche Erkennung | PL und Betriebsrat blockieren | **Wiederaufgenommen als Produktbestandteil:** Zuruf per WhatsApp (Stufe 2) und Anbindung (Stufe 3). Teamentscheidung vom 22.10., keine neue Evidenz. Vollzugriff aufs Postfach mit täglicher Triage durch den PL bleibt verworfen; Mails zuerst per Projekt-Weiterleitung oder ERP-Sync. Die alten Gründe stehen als Risiko 12 |
| **Plattform-Story ab Tag 1 [geändert v3]** | "Backoffice-KI für Subs" | beide Vorbilder starteten schmal | Der Zwilling ist Kernprodukt und Architektur. Verkauft und bewiesen wird über einen Job: die Schlussrechnung. Weitere Anwendungen erst nach R5 |
| **Eigene Foto- oder Baustellen-App** | Foto-App nach reebuild-Muster | neue App, neue Hürde für Poliere | Erfassung über WhatsApp, keine neue App |
| **KI-Chat als Kernfunktion** | nach Kuro-Muster | schöne Demo, kein Geld-Job | bleibt verworfen. Der WhatsApp-Agent erfasst, er beantwortet nicht. "Frag den Zwilling" ist ein Kandidat in 3.7 |
| **Enpal-Kontakte als Kundenquelle** | Warm Intros | B2C-Installateure, falsches Segment | Kontakte nur zum Finden von Leuten; keine Enpal-Daten |
| **Deutschland vor 2028** | Start im Jahr 2 über Bayern | VOB/B, GAEB, kostenbasierte Bepreisung, RDG | ab 2028 nach 40 AT-Kunden und Gutachten |
| **Öffentliche Lose als Zielregel** | zuerst Einzelvergaben | unbelegt | nur Interviewfrage |
| **Provisionen an oder von Kanzleien** | Empfehlungsgebühren | vermutlich verboten | keine Provisionen |
| **Alte Markt- und Umsatzzahlen** | 810 Mio. € DACH, 2,2 Mrd. € EU, 20.000 € ACV usw. | überhöht | 70 bis 100 Mio. € SAM, ACV 14.000 / 18.000 bis 19.000 € |
| **Alte Rückgewinnungsannahme** | 55 % auf 80 % | erfunden | R3 misst |
| **Alte Exit-Erwartung** | 25 bis 50 Mio. €, stark 70 bis 100 Mio. € | brauchte frühes starkes Wachstum | 10 bis 40 Mio. € |
| **Alte Gates** | K1 13.11., Endentscheid 8.1. | zu früh | R1 bis R5, Endentscheid 31.1.2027 |
| **Kalkül-Teaser und Fristen-Countdown in der Demo**, "10 % von gefundenem Geld" | alte Demo | Kalkül geparkt, Fristen erst im Desk | Demo zeigt Firmen-Zwilling, Zuruf, Schlussrechnung, Export |
| **Wechsel auf die GU-Seite** | nach Kuro und reebuild naheliegend | besetzt durch finanzierte Teams mit Domäne; unser Vorsprung gilt nur auf der Sub-Seite | Sub-Seite; die GU-KI ist unser Argument |
| **SDR- und Telefonvertrieb nach reebuild-Muster** | "Demo buchen"-Maschine mit Kaltakquise | § 174 TKG; Studenten ohne Insider verbrennen den Markt | persönlich, Brief, Events, Partner; Webformular mit Einwilligung |

---

## 13. Die fünf Gates (Termine unverändert)

| Gate | Test | Wer | Datum | Bestanden | Kill oder Pivot |
|---|---|---|---|---|---|
| **R1 Insider** | 15+ Kandidaten, 8+ Treffen, bezahlter Probetag für die Top 2 | Maxi | Term Sheet Fr 20.11., harte Grenze Fr 4.12. | Beteiligungsvertrag mit einem Insider nach Profil, mind. 1 Tag pro Woche, ab Dezember in allen Kundenterminen | kein Insider bis 4.12.: stoppen |
| **R4 Recht** | 1-Stunden-Gutachten Baurecht Wien (erweiterte Fragenliste, Abschnitt 4); Maklerangebot 1 Mio. € | Co-Founder A | Fr 4.12. | schriftlich: Check, Ledger, Bewertung (und Entwurf der Schlussrechnung) nicht vorbehalten; Prämie max. 8.000 €/Jahr | Kern-Check vorbehalten: stoppen. Bonus unzulässig: nur Fixpreis. Kein Versicherer: nur Abrechnungsvollständigkeit |
| **R2 Ordner** | Anfrage an 8 Firmen über Kanzleien, Insider, Innung; AVV | Co-Founder B + Insider | Fr 11.12. | 3+ Ordner von 3+ Firmen, je 70 %+ brauchbar | max. 1 Ordner oder unter 50 % brauchbar: stoppen. 2 Ordner: einmal 2 Wochen verlängern |
| **R3 Geld** | 3 Checks, jeden Euro kodieren (a) bis (d) **und nach Quelle des Belegs** | Maxi + Insider | Fr 22.1.2027 | auf 2 von 3 Projekten (a) ≥ 30.000 € **oder** 1,5 % der Auftragssumme, **und** (a) ≥ 50 % aller Funde | Median (a) unter 0,75 % oder (a) unter 40 %: stoppen. Dazwischen: S-Tarif, Retest bis 31.3. |
| **R5 Zahlung** | Fixpreis-Check und Jahresdesk anbieten | Co-Founder B | Fr 29.1.2027 | 2+ Firmen zahlen je ≥ 1.500 € **und** 1+ Jahresdesk oder Absichtserklärung | 0 bezahlt: stoppen. 1 ohne Absichtserklärung: stoppen, außer R3 lag oben |

Die Gates testen, ob Subs für das Ergebnis der Schlussrechnung zahlen. Das geht aus einem manuell eingespielten Projektordner. Der Firmen-Zwilling mit Anbindung und WhatsApp ist dafür nicht nötig und darf die Gates nicht verzögern.

**Endentscheid So 31.1.2027:**
- Alle fünf bestanden: Vollzeit und Geld einsammeln.
- Eines im Pivot-Band: eine weitere 8-Wochen-Runde auf dem Pivot.
- Zwei oder mehr gescheitert: Schlusswerk ist tot. Rückfälle sind das Abnahme- und Prüfregister für Energieanlagen oder der Hausverwaltungs-Service.

Die Kill-Regeln gelten sofort, nicht erst am 31.1. Ohne Insider am 4.12. wird nicht weitergebaut.

---

## 14. Plan bis 31.1.2027, Woche für Woche

**Kürzel:** **M** = Maxi, **A** = Co-Founder A, **B** = Co-Founder B, **I** = Insider (ab Term Sheet), **Bau** = Produktarbeit (Abschnitt 15).

**Fester Rhythmus:** jeden Sonntag 30 Minuten Kennzahlen-Runde mit Gesprächen, Briefen, Kandidaten, Ordnern und Bau-Stand. Danach `_STATUS.md` aktualisieren.

| KW | Daten | M | A | B | Bau | Frist / Gate |
|---|---|---|---|---|---|---|
| 43 | Do 22. bis So 25.10. | Dossier v3 mit dem Team durchgehen; Repo außerhalb OneDrive und `Umfang_v1.md` anlegen; **Bau-Aufteilung klären (So 25.10.)** | Entwurf Gründervertrag | Entwurf #glaubandich-Text | Demo-Klickpfad festlegen (Firma → Projekt → Anwendung); Generator für synthetische Daten starten (Firma mit 8 Projekten, eines voll ausgearbeitet, inkl. Zurufen) | |
| 44 | 26.10. bis 1.11. (Mo Feiertag) | Insider-Liste 15+; 25 bis 30 Briefe raus bis Fr 30.10. | synthetische Daten fertig (inkl. fiktivem GU-Korrekturblatt und Zurufen); 10 Kanzleien listen; Anwaltstermin für KW 48 fixieren | #glaubandich einreichen; Landesinnungen Wien/NÖ persönlich besuchen oder anschreiben (Brief) | **Demo v0.9:** Firmenübersicht, Projekt-Ledger, Beleg-Panel, drei Listen, Zeitachse, WhatsApp-Szene als Mock, vorberechnet | **#glaubandich Sa 31.10.** |
| 45 | 2. bis 8.11. | 8+ Kaffeetermine, Kandidat streicht Fehler in der Demo an | Demos bei PlanRadar, Capmo, NEVARIS, ABK **und reebuild** (offen als Gründerteam); 5 Kanzleien besuchen (mit B) | 6 Sub-Gespräche mit Leitfaden und Ordner-Frage (plus Fragen 9, 11, 15); Kodierschema (a) bis (d) plus Quelle fertig | Demo v1.0 hackathon-fertig (Firmen-Zwilling, WhatsApp-Szene, Schlussbesprechungs-Blatt, Vorprüfung GU-Sicht, Entwurf Schlussrechnung, Export); **Datenmodell Firma → Projekt → Objekte** (Quelle, Verlauf, Status) | **Gründervertrag Fr 6.11.** |
| 46 | 9. bis 15.11. | Probetage für die Top 2; Hackathon (Planannahme Mitte Nov.) | Marktzählung: 30 Projekte, Größen in WKO Firmen A bis Z; Makleranfrage Versicherung | weitere Sub-Gespräche; AVV-Vorlage mit A finalisieren | Stufe 0: LV-Parser (ÖNORM A 2063 und PDF), Aufmaß-Excel | **Marktzählung Fr 13.11.** |
| 47 | 16. bis 22.11. | Term Sheet an den besten Kandidaten | erweiterte Fragenliste an den Anwalt schriftlich (Abschnitt 4) | Ordner-Anfrage an 8 Firmen über Kanzleien, Kandidat und Innung, mit AVV | Stufe 0: Regie-Scans (OCR, Unterschriftsstatus), Rechnungen, Rechenkern Ledger | **R1 Term Sheet Fr 20.11.** |
| 48 | 23. bis 29.11. | Insider-Vertrag unterschreiben; mit I den Prüfkatalog v0 (100 bis 200 Fragen) | Anwaltsgutachten (1 h); Versicherungsangebot | Ordner nachfassen; Innungsabend Jänner/Februar mit Anwalt fixieren | Stufe 0: Bepreisung LV × K7, Mail-Extraktion, Beweispaket-PDF | |
| 49 | 30.11. bis 6.12. | Probelauf mit I auf synthetischen Daten und einem anonymisierten Projekt von I | R4 schriftlich festhalten | GF-Termine für KW 50 bis 51 buchen | **Stufe-0-Freeze So 6.12.** | **R4 und R1 hart Fr 4.12.** |
| 50 | 7. bis 13.12. (Di Feiertag) | 3 Checks starten (M baut nach, I prüft) | AVVs unterschreiben lassen; EU-Region der KI-Modelle bestätigt | Ordner einsammeln; Zwischenstand an die Partner | Fehler aus echten Ordnern beheben; Testsystem nur mit synthetischen Daten | **R2 Ordner Fr 11.12.** |
| 51 | 14. bis 20.12. | Checks laufen; was geht, vor der Pause abschließen | Wettbewerbs-Update (reebuild, PlanRadar, Capmo) | 5 GF-Termine bis Fr 18.12. | Planindex-Diff, Duplikaterkennung | 5 GF-Termine |
| 52 bis 53 | 21.12. bis 3.1. | keine Verkaufstermine; v1.1 bauen | Pause | Pause | v1.1: Vorprüfung aus GU-Sicht auf echten Daten, Entwurf der Schlussrechnung, Excel- und ÖNORM-Export, BMD-Format prüfen, Kodierbogen im Werkzeug. **Falls Kapazität da: WhatsApp-Prototyp auf Testnummer mit synthetischen Daten, sonst nach R3** | |
| 1 | 4. bis 10.1. | ab Do 7.1.: Check 1 ausliefern, Kodier-Session (mit I und B) | Messe- und BAU-Termine (Käufergespräche) vorbereiten | Angebotsunterlagen: Fixpreis-Check, Jahresdesk S/M/L | Fixes aus Check 1 | |
| 2 | 11. bis 17.1. | Check 2 und 3 ausliefern, Kodier-Sessions | Rechtsfragen aus den Checks an die Kanzlei | Angebote an Design-Partner nach jeder Lieferung | Kennzahlen-Auswertung (Funde nach a bis d und nach Quelle, Stunden pro Check) | |
| 3 | 18. bis 24.1. | R3 auswerten, Zahlen unabhängig prüfen lassen | Pre-Seed- und Förderoptionen (aws, Wirtschaftsagentur) kurz kartieren | Nachfassen, Unterschriften | Stillstand für neue Features | **R3 Geld Fr 22.1.** |
| 4 | 25. bis 31.1. | Endentscheid vorbereiten (Dossier v4) | | Zahlungseingänge, Absichtserklärungen | | **R5 Fr 29.1., Endentscheid So 31.1.** |

**Nach dem Endentscheid (Vorschlag, nicht entschieden):** Stufe 2 mit einem Design-Partner als Pilot ab Februar 2027, nur nach R4 und mit Zustimmung des Betriebsrats, falls vorhanden.

**Offen und noch nicht im Plan:** Website, CI, endgültiger Name, Hosting (Maxi). Termine werden mit dem Team festgelegt, sobald die Bau-Aufteilung geklärt ist.

---

## 15. Was wir bauen

### 15.1 Grundsätze

- **Ein Zwilling-Kern, fünf Stufen.** Stufe 0 ist das interne Werkzeug aus v2 (v1). Die Demo ist dieselbe Software mit synthetischen Daten und vorberechnetem Rückfall.
- **Das Datenmodell gilt ab Tag 1 für die Ebenen Firma, Projekt, Objekt** (mit Quelle, Verlauf, Status), auch in Stufe 0. So wird später nichts neu gebaut. In Stufe 0 ist die Firmenebene schmal: Firma, Kunden und GUs, Projektliste.
- **Die KI liefert Fakten mit Quelle, ein Mensch bestätigt, die Rechnung ist Code.** Jede Zahl im Bericht ist anklickbar und führt zum Original.
- **Wir bedienen das Werkzeug selbst** in Stufe 0 und 1 (Kuro-Muster "Forward Deployed"). Wir lernen dabei, was Kunden später selbst bedienen.
- **Datenschutz:** Testsystem von Tag 1 nur mit synthetischen Daten; echte Ordner nur in der EU-Umgebung, getrennt pro Firma; Löschung nach Vertragsende; Git-Repository nicht in OneDrive.
- **Architektur:**

```
Quellen → [1 Einlesen] → [2 Datensatz mit Quelle] → [3 Projektzwilling → Firmen-Zwilling: Verlauf, Ledger] → [4 Prüfen und Freigeben] → Anwendung: Schlussrechnung
```

### 15.2 Stufen

| Stufe | Name | Inhalt | Wann | Voraussetzung |
|---|---|---|---|---|
| **0** | Einspielen | Projektordner-Import, Datensatz pro Dokument, LV, Aufmaß, Regie, Rechnungen, Ledger, Bepreisung, Abschluss-Lauf, Ausgaben (Bericht, Listen, Beweispaket, Excel, ÖNORM, Entwurf Schlussrechnung). Datenmodell Firma → Projekt. Wir bedienen selbst | Freeze 6.12., v1.1 bis 6.1. | nötig für R2, R3, R5 |
| **1** | Sichtbar | Navigation Firma → Projekt, Projektübersicht, Zeitachse, LV-Baum, Beleg-Panel als Web-Ansicht | Demo ab 31.10. (vorberechnet), echt nach R3 | Stufe 0 |
| **2** | Zuruf | WhatsApp-Agent: Foto, Sprache, Zuordnung, Bestätigung; Lese-Ansicht für Abrechner und Inhaber | Prototyp ab Jan. (synthetisch), Pilot nach R3 und R4 | R4 und Betriebsrat des Pilotkunden geklärt |
| **3** | Anbinden | ERP/AVA/CRM, Mails, Calls, später BIM und Plan-Pins. Zuerst das eine System, das die Design-Partner nutzen | nach R5 | Design-Partner mit passendem System |
| **4** | Weitere Anwendungen | Kandidaten aus 3.7, einzeln entschieden, auch auf Firmenebene | nach R5 | erstes zahlendes Desk |

### 15.3 Demo (synthetisch, bis 31.10. bzw. Hackathon)

**Datensatz:** Eine fiktive Haustechnik GmbH mit 8 Projekten. Eines ist voll ausgearbeitet: "Wohnhausanlage Wien 21, Bauplatz B, HKLS-Los, 1,24 Mio. €, fiktiver GU". Die anderen 7 haben nur Status, Auftragssumme und offenen Betrag, damit die Firmenübersicht lebt. Das ausgearbeitete Projekt enthält:
- ein LV mit 380 Positionen und K7-Blättern;
- Aufmaß;
- 16 Regieberichte (11 verrechnet, 3 unterschrieben, aber nicht verrechnet, 2 nicht unterschrieben);
- 3 Abschlagsrechnungen;
- 60 Mails;
- 40 Fotos mit EXIF;
- Planindizes C, D und E;
- ein GU-Abzugsschreiben;
- ein fiktives automatisches GU-Korrekturblatt;
- 6 Zurufe per WhatsApp (Foto und Sprachnachricht), davon 2 ohne Regiebericht.

**Skript (3 Minuten):**

| Zeit | Bildschirm | Satz |
|---|---|---|
| 0:00 bis 0:25 | **Firmen-Zwilling:** Projektliste mit Ampel, Summe "offen verrechenbar" über alle Projekte (aus den synthetischen Daten berechnet); Klick in die Wohnhausanlage | "Das ist der Zwilling eures Betriebs. Alle Projekte an einem Ort. Wir gehen in eines hinein." |
| 0:25 bis 0:55 | **Projektzwilling,** WhatsApp-Szene: Monteur schickt Foto und Sprachnachricht, Agent antwortet mit Zusammenfassung, ein Tipp auf "Ja", der Eintrag erscheint in der Zeitachse | "Steckdosen in Raum 5 versetzt, weil der Bauherr es wollte. Zwanzig Sekunden, kein Regiebericht später." |
| 0:55 bis 1:30 | Ledger mit Ampel; **Jetzt verrechenbar: 27.410 €**; Klick auf eine Mengenüberschreitung: Planindex C→D, Mail "bitte gleich mitmachen", Foto, 14 × EP plus K7 = 6.384 € | "Kein Streit. Arbeit, die gemacht und nicht verrechnet wurde." |
| 1:30 bis 2:00 | Vorprüfung aus GU-Sicht: 4 Positionen, die der GU kürzen würde, mit fehlendem Beleg | "Euer GU prüft mit Software. Prüft vorher selbst." |
| 2:00 bis 2:35 | Entwurf der Schlussrechnung und Schlussbesprechungs-Blatt mit Untergrenzen; ein Posten "braucht Anwalt" | "Wenn ihr tauscht, dann aus der vollständigen Liste." |
| 2:35 bis 3:00 | Zurück auf die Firmenebene: GU-Historie füllt sich; Export; Preis; Insider (nur wenn unterschrieben) | "Jedes Projekt bleibt im Zwilling. Beim nächsten Projekt mit diesem GU kennen wir seine Kürzungen." |

Die Zahlen sind synthetisch. Für #glaubandich und den Hackathon gilt: Die Story bleibt beim Problem und der synthetischen Demo, ohne erfundene Funde.

### 15.4 Stufe 0 im Detail (Freeze So 6.12., v1.1 bis 6.1.)

| Baustein | Bis | Inhalt |
|---|---|---|
| Datenmodell | KW 45 bis 46 | Firma → Kunde/GU → Projekt → Objekte aus 3.3, jeweils mit Quelle (Datei, Seite, Stelle), Verlauf und Status; manuelle Korrektur durch M/I wird gespeichert |
| Ordner-Import | KW 46 | Dateien hochladen, Typ erkennen, Duplikate und Versionen (Planindex) erkennen |
| LV und Aufmaß | KW 46 | ÖNORM A 2063 (Spezifikation bei Austrian Standards kaufen, Kosten unbelegt), PDF-LV, Aufmaß-Excel |
| Regie und Rechnungen | KW 47 | OCR, Unterschriftsstatus, Stunden und Material; Abschlagsrechnungen und Zahlungen |
| Rechenkern Ledger | KW 47 | deterministisch, mit Tests auf den synthetischen Daten |
| Bepreisung | KW 48 | LV-Einheitspreis × Menge; K7-Lohnminuten für zusätzliche Mengen |
| Mails und Pläne | KW 48 | Anweisungen in Mails finden; Planindex-Liste (automatischer Diff in v1.1) |
| Prüfkatalog v0 | KW 48 bis 49 | 100 bis 200 Prüffragen Elektro/HKLS mit I (Annahme zur Zahl); jede Korrektur wird eine Regel |
| Ausgaben | KW 49 | Bericht (PDF), drei Listen, Beweispaket pro Posten, Schlussbesprechungs-Blatt, Kodierbogen (a) bis (d) plus Quelle, Excel |
| v1.1 | 6.1. | Vorprüfung aus GU-Sicht, Entwurf der Schlussrechnung, ÖNORM-Export, BMD-Format geprüft, Planindex-Diff |

**Nicht in Stufe 0:**
- Kundenlogin;
- Postfach- und ERP-Anbindung (Mails und Daten nur als Dateien);
- WhatsApp-Agent (nur als Szene in der Demo);
- Firmen-Anwendungen (Portfolio, GU-Historie) als echte Funktion;
- eigene Foto-App;
- KI-Chat;
- automatischer Fristenkalender und § 1170b-Tracker (bei Bedarf als Tabelle von Hand);
- DWG und BIM;
- GAEB und Deutschland;
- Kalkül;
- Bonusabrechnung;
- Echtzeit-Budget.

### 15.5 Messen pro Check

- Stunden M und Stunden I;
- Seiten und Dokumente;
- Anteil der Felder, die von Hand korrigiert wurden;
- gefundene € nach (a) bis (d);
- **Quelle des Belegs je Fund:** im ERP oder als Datei, in einer Mail, auf Papier, auf einem Foto, nur mündlich oder per WhatsApp;
- Tage bis zur bezahlten Schlussrechnung.

Auswertung: Anteil der Funde, die nur außerhalb eines ERP belegt sind. Er prüft die Leithypothese und das Kernrisiko aus Abschnitt 7. Die Schwelle, ab der wir die Hypothese als bestätigt ansehen, legen wir in der Sonntagsrunde vor R3 fest und tragen sie hier ein.

Kennzahlen für Story und Investoren, nach dem Muster von reebuilds "530 Mio. € Rechnungsvolumen": Anzahl Projekte im Zwilling, geprüfte Auftragssumme in €, gefundene € pro Mio. € Auftragssumme (kodiert), Tage bis zur bezahlten Schlussrechnung, Anteil der Funde außerhalb des ERP.

---

## 16. Startprompt für einen neuen Chat

> Lies zuerst `_STATUS.md` und `Schlusswerk Dossier v3.md` im Projektordner, komplett, auch Abschnitt 0.1 (Änderungen gegenüber v2) und Abschnitt 12 "Verworfen". Für Steckbriefe zu Kuro und reebuild lies bei Bedarf `research_notes/Kuro_reebuild_Fakten.md`, für Quellen zu Recht, Markt und Exit `archiv/Schlusswerk Dossier v2.md`. Wir sind drei Studenten in Wien (Maxi, WU Wien, baut mit KI-Coding-Agenten, plus zwei Co-Founder, keiner mit Bauhintergrund). Wir bauen den digitalen Zwilling für österreichische Elektro- und HKLS-Subunternehmer: ein Zwilling für das ganze Unternehmen, in dem jedes Projekt seinen Projektzwilling hat, mit der Schlussrechnung als erster Anwendung. Das Dossier v3 ist der entschiedene Stand. Schlag nichts aus Abschnitt 12 wieder vor, außer du hast neue Evidenz und sagst das ausdrücklich. Alles mit "(unbelegt)", "(Annahme)", S oder A ist ungeprüft. Heute ist [Datum]. Seit dem Dossier ist passiert: [Gate-Stand, Insider, Ordner, Gespräche, Zahlen]. Hilf uns jetzt bei: [Aufgabe, z. B. Woche X aus Abschnitt 14]. Deutsch, direkt, ohne Floskeln. Vertrieb: keine Kaltmails, keine Kaltanrufe (§ 174 TKG).

---

## 17. Quellen

**Recht, Markt, Wettbewerb, Exits:** in `archiv/Schlusswerk Dossier v2.md` (Abschnitte 4 bis 7 mit Links). v2 verweist für weitere Quellen auf Dossier v1, Abschnitt 18; v1 liegt nicht in diesem Ordner. **Kuro und reebuild:** Steckbriefe und Quellen in `research_notes/Kuro_reebuild_Fakten.md`.

**Ergänzungen aus der Recherche vom 22.10.2026 (früherer Chat, nicht neu geprüft):**
- [Startbase: reebuild 3 Mio. Seed](https://www.startbase.de/news/reebuild-holt-sich-3-millionen-euro-fuer-ki-automatisierung-in-der-baubranche)
- [find-your-software: Bausoftware-Vergleich 2026](https://find-your-software.de/branchen/software-fuer-bau/)
- [konii: PlanRadar KI-Agenten](https://www.konii.de/?p=213180)
- [App Store: Dimacon digitaler Regiebericht](https://apps.apple.com/de/app/dimacon/id1578438258)
- [buildingnet: Conmeet 6 Mio.](https://www.buildingnet.de/digitalisierung/conmeet--ki-software-fuer-den-bau.htm)
- [KI-Syndikat: Bauwesen-Tools inkl. Document Crunch](https://www.ki-syndikat.de/tools/kategorie/bauwesen/)
- [Adaptive](https://www.adaptive.build/)
- [BauNachtrag](https://www.baunachtrag.ch/)
- Vorbilder für das Zwilling-Muster: [stratos.ai](https://stratos.ai/), [dryft.ai](https://dryft.ai/)
