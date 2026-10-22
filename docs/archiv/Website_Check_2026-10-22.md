# Website-Check EndPoint. (Stand 22.10.2026, main nach PR #23 und #24)

Geprüft: https://endpoint-preview.pages.dev (DE) und `/en/` im eingebauten Browser, Breite rund 800 px; Texte in `website/messages/de.json` und `en.json`; abgeglichen mit `CLAUDE.md`, `website/STRUKTUR.md`, `docs/dossier-v3.md`, `docs/research_notes/Zielgruppe_Challenge.md`, `product/docs/Demo_Faelle.md`. Nur gelesen, nichts geändert.
Herkunft: **gemessen** = selbst auf der Seite oder im Code gesehen; **gelesen** = aus einem Dokument mit Fundstelle; **Annahme** = meine Einschätzung.

## Ergebnis in fünf Sätzen

1. Der Hero besteht den 10-Sekunden-Test für das „Was“: „Schlussrechnungen, die nichts liegen lassen“ plus Unterzeile und „Demo buchen“ sind klar, der Inhaber verliert den Faden erst im Lösungsteil („digitaler Zwilling“, „AVA“, „Ebene 1 / Ebene 2“) und findet nirgends, was er selbst tun oder hergeben muss.
2. Der gröbste Fehler ist inhaltlich: Für dasselbe „Projekt Wien 21“ zeigt die Seite einmal **+5.546 €** (Zeitleiste) und einmal **+27.410 €** (Ergebnis), und im Produkt ist Wien 21 ein **HKLS**-Los, während die Website dort Steckdosen und Leuchten (Elektro) zeigt.
3. Die Seite verspricht mehr, als das Produkt halten darf: „kein verdienter Euro vergessen“ und „Alle 6 Änderungen belegt und verrechnet“ inklusive einer Regie **ohne Unterschrift**, und der Vertrauensteil (Mensch bestätigt, Beleg per Klick, wir sprechen nie mit Ihrem GU, Datensilo) ist seit v2 ganz gestrichen.
4. Das Produkt ergibt Sinn, aber der stärkste Einwand trifft genau das Aushängeschild: Ein Zuruf, der nie aufgeschrieben wurde, steht auch in keinem Ordner, also kann ein rückwirkender Durchlauf ihn kaum finden; ob das Geld eher in Mails, Plänen und Regiescheinen liegt, muss R2/R3 zeigen, und danach sollte sich die Seite richten.
5. Regeln sind weitgehend eingehalten (kein „Claim“, keine Preise, kein „Check anfragen“, keine Gedankenstriche), offen sind sichtbare Platzhalter auf einer öffentlich erreichbaren Seite, „·“ als Trenner, der CTA „Demo buchen“ entgegen `CLAUDE.md` und ein Dummy-Kalender, der Termine anbietet, die es nicht gibt.

---

## 1. Versteht ein Inhaber (Elektro oder HKLS, 20 bis 100 Leute) in 10 Sekunden, was es ist, was es bringt, was er tun soll?

**Kurz: Was und Was-tun ja, Was-bringt-es halb, Was-kostet-es-mich (Aufwand, Daten, Risiko) nein.**

| Frage | Antwort auf der Seite | Urteil |
|---|---|---|
| Was ist es? | Hero: „Schlussrechnungen, die nichts liegen lassen.“ Unterzeile: „prüft Ihre Schlussrechnung gegen alles, was im Projekt passiert ist“ (gemessen, `hero.title1/2`, `hero.sub`) | klar |
| Was bringt es? | Karten „+ 780 €“, „+ 2.736 €“ (gemessen) | greifbar, aber es sind Einzelbeispiele; kein „so viel pro Projekt“, was vor R3 richtig ist (Dossier 9, Headline-Regel) |
| Was soll er tun? | „Demo buchen“ oben rechts und im Hero (gemessen) | klar |
| Was muss er hergeben, wer sieht seine Daten, redet ihr mit meinem GU? | nirgends (gemessen; Prinzipien-Teil entfallen laut `STRUKTUR.md` Update v2) | fehlt |

**Wo die Seite ihn verliert (gemessen, Gewichtung Annahme):**
1. **Lösung, erster Satz:** „verbindet alle Daten Ihres Betriebs zu einem digitalen Zwilling“. „Alle Daten“ klingt nach großem IT-Projekt und Vollzugriff, genau den Einwand, den das Dossier selbst erwartet („Ihr wollt Zugriff auf unser ganzes Geschäft?“, Dossier 9, Einwände). Ob „Zwilling“ bei Inhabern trägt, ist laut Dossier 9 und `_STATUS.md` ungeprüft.
2. **Fachwörter ohne Erklärung:** „AVA“, „Plan Index D“, „Preisbasis“, „Ebene 1 · Ihr Betrieb“. Für den Abrechner normal, für den Inhaber ok, für Investoren und Partner nicht (Annahme).
3. **Leere Flächen beim Scrollen:** Zeitleiste und Team erscheinen erst nach der Einblend-Animation; beim normalen Scrollen sah ich zuerst leere Kästen, und das Ergebnis zeigt „+ €0“, bis der Zähler läuft (gemessen, Screenshots). Wer schnell scrollt, sieht an der wichtigsten Stelle eine Null.
4. **„EndPoint.“ im Fließtext:** „EndPoint. prüft Ihre Schlussrechnung“ liest sich wie ein Satzende mit klein weitergeführtem Satz (gemessen, Hero und Lösung). Als Logo gut, im Satz störend (Annahme).
5. **Abgeschnittener Text im Hero:** „IN DIE SCHLUSSRECHN ÜBERNOMMEN“ bei rund 800 px Breite (gemessen, Screenshot Hero, Karte 01).

## 2. Passt die Seite zur Zielgruppen-Empfehlung (#17) und zu Dossier v3?

**Kurz: Im Kern ja (Subunternehmer, Schlussrechnung zuerst, keine Preise), in fünf Punkten nein.**

| # | Widerspruch | Seite (gemessen) | Dokument (gelesen) |
|---|---|---|---|
| a | **Region** | Projekte „Linz Süd“, „Graz Ost“ neben Wien, Mödling, Baden, St. Pölten (`solution.flow.projects`) | Beachhead „Sitz in Wien oder Niederösterreich“ (`Zielgruppe_Challenge.md`, Steckbrief); Dossier 2: OÖ und Steiermark erst ab Mitte 2027. Ein Wiener Betrieb mit Baustellen in Linz und Graz ist untypisch für 20 bis 100 Leute (Annahme) |
| b | **Gewerk** | Wien 21 zeigt Steckdosen, Auslässe, Leuchten, Kabeltrasse (Elektro) | In `product/docs/Demo_Faelle.md` (Zeile 148) ist W21 „Wohnhausanlage Wien 21, Bauplatz B, **HKLS-Los**“. Website und Demo-App erzählen zwei verschiedene Projekte unter einem Namen |
| c | **Beträge** | Zeitleiste „+ € 5.546“ und „4 von 6 Änderungen nicht verrechnet“; Ergebnis „+ 27.410 €“; beides „Projekt Wien 21“ | 27.410,00 € ist Liste 1 aus `Demo_Faelle.md` (Zeile 43 bis 57, 8 Posten). 780, 2.736, 390, 1.640, 1.290, 4.120 und „1.248 Belege“ kommen dort nicht vor (gemessen per Suche). `CLAUDE.md`: „Beträge der Demo nur aus `product/docs/Demo_Faelle.md` und dem Rechenkern“ |
| d | **CTA** | „Demo buchen“ / „Demo anfragen“ | `CLAUDE.md` (Website): „CTA neutral (Kontakt aufnehmen)“; `STRUKTUR.md` Abschnitt 1 ebenso. `STRUKTUR.md` Update v2 hat auf „Demo buchen“ umgestellt (Feedback Maxi D.). Die Dokumente widersprechen sich, eins muss angepasst werden. Inhaltlich halte ich „Demo buchen“ für den besseren CTA (Annahme), er nennt kein Angebot und keinen Preis |
| e | **Reihenfolge** | Schlussrechnung zuerst, Zwilling als Erklärung | `CLAUDE.md` und Dossier 9 [geändert 22.10.]: „Zwilling zuerst“. Dossier 0 Punkt 4 und Dossier 9 (Empfehlung davor): „Zuerst verkauft wird das Geld“. Die Seite folgt der älteren Empfehlung, die ich für richtig halte; `CLAUDE.md` und Dossier 9 sollten nachgezogen werden |

Was passt (gelesen und gemessen): Sub-Seite, kein Wort zum GU-Wechsel; Elektro und HKLS gemeinsam ist vertretbar, solange das Gewerk nicht entschieden ist (Empfehlung: nach R1); keine Größenangabe auf der Seite, also auch kein Widerspruch zu 20 bis 100; „Keine Daten von Ihnen nötig“ für die Demo passt zu R4 (nur synthetische Daten).

Zusätzlich fehlt die **Vertrauensleiste**, die Dossier 9 ausdrücklich vorsieht („EU-Hosting, AVV, Datensilo pro Firma, ihr gebt nur die Projekte frei, die ihr wollt, wir reden nie mit eurem GU, keine Auswertung pro Mitarbeiter“). Hosting und AVV erst nennen, wenn entschieden (`STRUKTUR.md` Abschnitt 5, Zeile 07); der Rest ist Produktprinzip (`CLAUDE.md` Regel 5 und 7) und kann heute schon stehen.

## 3. Ergibt das Produkt Sinn? Die drei stärksten Einwände

**Kurz: Ja, als Werkzeug für den Abrechner vor der Schlussrechnung. Ob jemand dafür zahlt, hängt an Einwand A, ob es technisch liefert, an Einwand B.** Nichts aus Dossier 12 wird hier neu vorgeschlagen.

### Einwand A: „Mein Projektleiter oder Abrechner macht das schon. Und was am Ende fehlt, tauschen wir sowieso in der Schlussbesprechung.“
- **Stärke: hoch.** Der Schmerz ist für Österreich nicht belegt („Keine österreichische Quelle zu Schlussrechnungskürzungen gefunden“, `Zielgruppe_Challenge.md` Abschnitt 4). Dossier 2 nennt den bewussten Tausch selbst als Ursache, deren Größe erst R3 misst. Die Seite blendet das aus und zeigt „Alle 6 Änderungen belegt und verrechnet“.
- **Was ihn entkräftet:** Ein **Blindvergleich** im Check (R2/R3): Der Abrechner schreibt seine Liste für ein Projekt wie immer, dann kommt unsere. Zählen: Euro, die nur wir gefunden haben, pro Projekt, gegen seinen eigenen Stand als Blindwert. Dazu die fünf R1-Fragen aus `Zielgruppe_Challenge.md` Abschnitt 5 (bestanden bei mindestens 5 von 8 mit Eurobetrag). Auf der Seite: statt „verrechnet“ ehrlich „belegt, die Entscheidung liegt bei Ihnen“; das nimmt auch den Tausch ernst.

### Einwand B: „Was nie aufgeschrieben wurde, findet auch eure KI nicht.“
- **Stärke: hoch, und logisch, nicht nur gefühlt.** Die Leithypothese sagt, das Geld liegt im Informellen: Telefon, Zuruf, WhatsApp (Dossier 2, als Annahme markiert). Ein rückwirkender Durchlauf über einen Projektordner sieht davon nur, was zufällig in einer Mail oder einem Foto gelandet ist. Der Zuruf-Weg per WhatsApp kommt erst ab Stufe 2, also nach den Gates (Dossier 0 Punkt 3, Dossier 15). Die Seite wirbt aber im ersten Bild mit genau so einem Fall: „Per Zuruf vom Bauherrn beauftragt, nie verrechnet“ (Hero, Karte 01). Ein skeptischer Inhaber fragt: „Woher wisst ihr davon, wenn es nirgends steht?“ (Annahme).
- **Was ihn entkräftet:** Die Quellenkodierung ab R3 (Dossier 15.5): Welcher Anteil der gefundenen Euro stammt aus Mails, Plänen, Aufmaß und Regiescheinen, die schon im Ordner liegen, und welcher aus Zurufen? Liegt der Großteil in vorhandenen Dokumenten, ist das Produkt heute verkaufbar und die Seite sollte mit Mail- und Planänderungs-Fällen führen. Bis dahin: Hero-Karte 01 durch einen Fall ersetzen, der aus einem Ordner belegbar ist (z. B. die per Mail angeordneten Auslässe aus Karte 02 nach vorne). Fachlich zusätzlich vom Insider prüfen lassen, ob „Bauherr“ statt „Bauleitung des Auftraggebers“ bei Subunternehmern stimmig wirkt; ich würdige das rechtlich nicht (`CLAUDE.md` Regel 5).

### Einwand C: „Ich schicke dem GU keine Rechnung, die eine KI zusammengesucht hat. Eine falsche Position kostet mich mehr Vertrauen, als sie bringt.“ (dazu: „Wer sieht meine Daten?“)
- **Stärke: mittel.** Das Produkt ist dafür gebaut: KI liefert Fakten mit Quelle, der Mensch bestätigt, die Rechnung ist deterministischer Code, jede Zahl führt zum Original (`CLAUDE.md` Regel 7; Demo-App mit zweistufiger Freigabe, `_STATUS.md` Produkt 22.10.). Das Problem ist, dass die **Seite** davon nichts zeigt. Der Prinzipien-Teil wurde in v2 gestrichen (`STRUKTUR.md` Update v2), und die Lösung verspricht „prüft damit jede Schlussrechnung“, ohne den Menschen zu erwähnen.
- **Was ihn entkräftet:** Auf der Seite: vier Sätze Vertrauen (Sie bestätigen jede Position; jede Zahl mit Klick zum Original; wir sprechen nie mit Ihrem Auftraggeber; Ihre Daten bleiben in Ihrem Bereich, nur freigegebene Projekte). Im Test: Fehlerquote messen, also Anteil der von uns vorgeschlagenen Positionen, die der Abrechner im Check verwirft. Gate: R5 (zahlt jemand) ist der eigentliche Beweis.

**Für Investoren zusätzlich (gelesen):** Der erste Markt ist klein, grob 150 bis 350 Betriebe pro Gewerk in Wien und NÖ (`Zielgruppe_Challenge.md` Abschnitt 1, selbst als Annahme markiert). Die Seite muss das nicht lösen, aber das Pitch-Material sollte zeigen, dass HKLS und andere Bundesländer ohne Umbau folgen.

## 4. Regelverstöße auf der Seite

| Regel | Befund (gemessen) | Urteil |
|---|---|---|
| „Claim“ (Regel 4) | Kein sichtbares Vorkommen. Der JSON-Schlüssel `footer.claim` ist nur Code | ok |
| Preise, Pakete (Regel 9) | Keine | ok |
| „Check anfragen“ (Regel 9) | Nicht vorhanden; CTA ist „Demo buchen“ / „Demo anfragen“ | ok, aber Widerspruch zu `CLAUDE.md` „Kontakt aufnehmen“, siehe 2d |
| Gedankenstriche (Regel 1) | Keine „—“ oder „–“ in `messages/`, `components/`, `app/`. In EN steht „− €5,546“ als Minuszeichen, kein Gedankenstrich | ok |
| „·“ im Text | DE: Abschnittsmarken „02 · Problem“, „03 · Lösung“, „04 · Produktvideo“, „05 · Über uns“, „06 · Demo“; „Projekt Wien 21 · Position 03.12.004“; „+ 6 Stk · 2.736 €“; „Ebene 1 · Ihr Betrieb“; „Projekt Wien 21 · Beispiel“; Footer „[[PLATZHALTER: Rechtsform]] · [[PLATZHALTER: Adresse]]“. EN gleich | Als Trenner in Labels vertretbar, laut Auftrag aber zu melden. Vorschlag: in Abschnittsmarken weglassen („02 Problem“), in Fließtext und Footer durch Zeilenumbruch oder Komma ersetzen |
| `[[PLATZHALTER: …]]` (Regel 10) | Sichtbar: Video (Rahmen), Kontakt-Mail „kontakt@[Domain]“ (DE und EN), „Kalender-Anbindung“ unter dem Kalender, „Formular-Backend“ in der Erfolgsmeldung, Footer Rechtsform, Adresse, LinkedIn, Impressum und Datenschutz komplett | An der richtigen Stelle (nichts erfunden), aber Regel 10 verlangt vor Veröffentlichung null Treffer. Die Seite ist per Link öffentlich (Entscheidung Maxi D. 22.10., `website/README.md`). Vor aktiver Verbreitung (Innungsabend, Pitch, LinkedIn) muss das Impressum echt sein (Dossier 9: Impressumspflicht) |
| Unbelegte Zahlen und Aussagen | „Auftraggeber prüfen Rechnungen zunehmend mit Software“: auf der Seite ohne Quelle; Beleg im Dossier nur für reebuild und Kuro (Dossier 2, „Warum jetzt“), „zunehmend“ ist unbelegt. „kein verdienter Euro vergessen“ (Hero, Meta-Description): absolute Zusage ohne Messung. Alle Eurobeträge sind als „Beispieldaten“ markiert, weichen aber von `Demo_Faelle.md` ab (siehe 2c) | korrigieren |
| Dummy-Kalender | Oktober 2026 zeigt buchbare Tage 23. bis 30.10. mit freien Zeiten, die nirgends hinführen; die Erfolgsmeldung sagt „Das Formular versendet noch nichts“ | Kein Regelverstoß, aber ein Inhaber, der wirklich bucht, wartet auf einen Termin, den es nicht gibt. Vor Verbreitung entfernen oder anbinden |
| EN-Seite | „kontakt@domain“ (deutsches Postfach auf EN), „Vienna 21“ neben „Mödling“, „Baden“, Rest sauber übersetzt | klein |

## 5. Qualität im Vergleich zu Linear, Attio, reebuild: drei Stellen, die am meisten nach Vorlage oder KI aussehen

Vergleich aus meiner Kenntnis der Seiten, heute nicht neu geöffnet, daher **Einschätzung (Annahme)**. Gemeinsam ist den drei Vorbildern: Sie zeigen ihr echtes Produkt groß und früh, und jede Zahl oder Behauptung sitzt in einem echten Screen.

1. **Hero mit Stockfotos und schwebenden Karten.** Drei Unsplash-Bilder (`public/hero/QUELLEN.md`: offene Steckdose, Pläne, Bauleute mit Tablet) mit weißen Karten „+ 780 €“ darüber. Das Muster „Foto plus schwebendes UI-Kärtchen“ ist das häufigste Vorlagen-Hero; die Steckdose wirkt wie Altbau-Sanierung, nicht wie Wohnbau für einen GU, und Bauarbeiter mit Tablet ist das Klischeebild schlechthin. **Vorschlag:** ein echter Ausschnitt aus der Demo-App (`product/app`, Befund-Seite mit Original-Beleg nebeneinander), synthetische Daten sichtbar markiert. Ein Klick auf die Zahl öffnet den Beleg: „Jede Zahl führt zum Original“ zeigen statt sagen. Aufwand mittel.
2. **Ergebniskarte mit fünf blauen Häkchen und hochzählendem Betrag.** „Vergessene Regie gefunden ✓ Mehrmengen erkannt ✓ Planänderungen eingerechnet ✓ Vorab geprüft wie vom Auftraggeber ✓ Zu jeder Position ein Beleg ✓“ plus Zähler „+ €0 → 27.410“. Häkchenlisten und Zähler sind KI-Landingpage-Standard und sagen nichts Prüfbares. Dasselbe Muster wiederholt sich bei „Demo buchen“ mit drei Häkchen. **Vorschlag:** statt Häkchen drei echte Zeilen einer Schlussrechnung mit Position, Menge, Betrag und je einem Beleg-Symbol (das, was Wien 21 laut `Demo_Faelle.md` wirklich enthält), Betrag statisch. Aufwand klein.
3. **Typo-Baukasten: Mono-Abschnittsnummern „02 · PROBLEM“ und zweifarbige Headline.** Kleine Mono-Großbuchstaben mit Nummer und Mittelpunkt über jeder Sektion, Headline mit zweiter Zeile in Akzentfarbe („Schlussrechnungen, / die nichts liegen lassen.“), „Wer EndPoint. baut.“ mit vier gleichen „Co-Founder“-Karten. Das sieht man 2025/26 auf sehr vielen generierten Seiten. Das Planraster ist eigenständig, der Rest nicht. **Vorschlag:** die Maßketten aus der CI (`STRUKTUR.md` Abschnitt 2, „Leitmotiv Maßketten“) wirklich als Abschnittsmarke nutzen statt „02 ·“; Headline einfarbig; im Team je eine Zeile, wer was macht, und sobald R1 steht, der Bau-Insider sichtbar dabei (die Insider-Karte wurde in v2 gestrichen, für einen Handwerksinhaber ist sie aber das stärkste Vertrauenssignal neben vier Studenten, Annahme). Aufwand klein bis mittel.

---

## Priorisierte Änderungen (höchstens acht)

| # | Änderung | Warum | Aufwand |
|---|---|---|---|
| 1 | **Ein Projekt, eine Zahl:** Wien 21 durchgehend aus `Demo_Faelle.md` erzählen (HKLS-Posten, 27.410 € Liste 1), Zeitleiste und Ergebnis auf dieselben Posten; oder die Website-Geschichte bewusst ein Elektro-Projekt mit anderem Namen | Widerspruch 5.546 € zu 27.410 € auf derselben Seite; `CLAUDE.md` Beträge nur aus Demo_Faelle | mittel |
| 2 | **Vertrauensblock zurück**, vier Sätze unter der Lösung: Sie bestätigen jede Position; jede Zahl mit Klick zum Original; wir sprechen nie mit Ihrem Auftraggeber; nur die Projekte, die Sie freigeben, Datensilo pro Firma. Hosting und AVV erst nach Entscheidung | Einwand C; Dossier 9 Vertrauensleiste | klein |
| 3 | **Überversprechen entschärfen:** „kein verdienter Euro vergessen“ raus (Hero, Meta); „Alle 6 Änderungen belegt und verrechnet“ → „belegt und im Entwurf“; Regie ohne Unterschrift als „gefunden, Entscheidung bei Ihnen“ | Einwand A; nichts zusagen, was nicht gemessen ist | klein |
| 4 | **Hero-Fall wechseln:** Karte 01 auf einen aus Dokumenten belegbaren Fall (per Mail angeordnete Auslässe), Zuruf-Fall nach hinten; „Bauherr“ vom Insider prüfen lassen | Einwand B: Zurufe sind rückwirkend kaum auffindbar | klein |
| 5 | **Echter Produktausschnitt statt Stockfotos** im Hero (Befund mit Original-Beleg aus `product/app`, als Beispieldaten markiert) | Qualitätsstelle 1; zeigt das Produktprinzip | mittel |
| 6 | **Zielgruppe angleichen:** Projekte nur Wien und NÖ (Linz Süd, Graz Ost ersetzen); ein Satz „Was Sie brauchen: einen Projektordner, sonst nichts“, ohne Angebot oder Preis zu nennen | Empfehlung #17; der Inhaber erfährt sonst nie den Aufwand | klein |
| 7 | **Ohne Animation lesbar:** Zeitleiste, Team und Betrag zeigen sofort den Endzustand, Animation nur als Zugabe; abgeschnittenes Label im Hero fixen | Beim Scrollen gemessen: leere Kästen und „+ €0“ | klein |
| 8 | **Vor jeder aktiven Verbreitung:** Impressum und Datenschutz echt, Dummy-Kalender entfernen oder anbinden, Formular anbinden, `grep PLATZHALTER` leer; CTA-Widerspruch in `CLAUDE.md`/`STRUKTUR.md` vs. Seite durch Teamentscheid auflösen; „·“ und „EndPoint.“ im Fließtext bereinigen | Regel 10, Impressumspflicht, Dokumentkonsistenz | mittel |
