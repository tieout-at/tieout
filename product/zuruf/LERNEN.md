# Lernen: Fehler und die Regeln daraus

Jeder Fehler des Agenten oder unserer Arbeit kommt hierher, neuester oben. Vor jeder Änderung am Agenten lesen. Eine Regel gilt erst, wenn ein Szenario oder Test sie absichert.

## Vorlage

```
### JJJJ-MM-TT: kurzer Titel
- Was: was ist passiert (Szenario-ID, Zitat aus dem Gespräch)
- Ursache: warum (Prompt, Code, Daten, Testaufbau)
- Regel: was ab jetzt gilt
- Abgesichert durch: szenarien/<id>.json, Test
- Status: offen | behoben | beobachten
```

## Einträge

### 2026-10-22: Einbau in die App

### L21 Knöpfe und Zusammenfassung kannten nur die vorläufige Firma
- Was: Mit der Firma der App (`opts.firma`) zeigten die Projektknöpfe die Kennung statt des Namens („p2-w22-bt3“), und die KI-Antwort wurde gegen die vorläufige Liste in `firma.ts` geprüft (Projekte der App wären verworfen worden).
- Ursache: `texte.ts` (`projektKnopf`, `punktZeilen`) und `verstehen.ts` (`alsEintrag`, Kandidaten) riefen `projektNachId` ohne Firma auf, also immer mit `FIRMA`.
- Regel: Jede Stelle, die ein Projekt nachschlägt, bekommt die Firma übergeben. `FIRMA` ist nur noch Vorgabe für Tests und Lernschleife.
- Abgesichert durch: Test „nutzt die übergebene Firma für Knöpfe und Zusammenfassung“ in `agent.test.ts`.
- Status: behoben.

### 2026-10-22: Aus dem eigenen Test im Simulator

### L19 Quelle zeigte alle Nachrichten des Gesprächs
- Was: Bei zwei Punkten (Heizkörper, Steckdose) standen in beiden Karten alle Nachrichten als Quelle.
- Regel: Quelle pro Eintrag sind nur die Nachrichten, aus denen seine Angaben stammen. Fotos zählen dazu, wenn es nur einen Punkt gibt.
- Abgesichert durch: Test „Quelle pro Eintrag“ in `abnahme1.test.ts`.
- Status: behoben, noch kein Lernschleifen-Lauf danach.

### L20 Zusammenfassung mit mehreren Punkten schwer lesbar
- Was: Jeder Punkt in einer langen Zeile, auf dem Handy mühsam.
- Regel: Pro Punkt eine Kopfzeile „1) Baustelle, Ort“, darunter eingerückte Unterzeilen.
- Abgesichert durch: gleicher Test.
- Status: behoben, noch kein Lernschleifen-Lauf danach.

### 2026-10-22: Lauf 4 (50 sichtbar) und Abnahme 2, beide über das Claude-Abo
- Lauf 4: 47/50, 0 erfunden, Felder 99 %, Rückfragen Max 2, Note Median 4,5 / Min 2. Antwortzeit über das Abo Median 9,5 s (über die API 2,5 s, nicht vergleichbar).
- Abnahme 2 (frisches Holdout `h2-*`, nie gelesen): 9/10, 0 erfunden, Felder 98 %, Rückfragen Max 1, Note Median 4 / Min 2. Durchgefallen: laerm_bruchstueck. Note 2 trotz bestandener Prüfungen: mehrere_punkte. Abnahme 1 war 6/10.
- Noch nicht ausgewertet (würde das Holdout verbrauchen): die beiden schwachen Holdout-Fälle. Nächster Schritt: Subagent wertet abstrakt aus.

### L17 Bündel: erster Teil der Meldung verloren
- Was: `z-korrektur-top-und-stunden-nach-passt`. Sprachnachricht (Heizkörper) und Sekunden später Text (Bodenablauf) kamen als Bündel. Die KI las den Text als Nachtrag zu einem leeren Zuruf und gab nur den Bodenablauf zurück. Der Heizkörper fehlte in der Zusammenfassung, wurde mit „Passt“ bestätigt und war weg. Die spätere Korrektur fand ihn nicht und fing von vorn an. Note 2.
- Ursache: Die erste Nachricht des Bündels stand im Prompt als „offener Zuruf“ mit leerem Stand.
- Regel: Gebündelte Nachrichten stehen im Prompt als „NEUE NACHRICHTEN … zusammen EINE Meldung, kein Punkt darf fehlen“. Code als Sicherheitsnetz: Ohne offenen Zuruf wird „Nachtrag“ bei einem Bündel zu „zuruf“.
- Abgesichert durch: Test L17 in `abnahme1.test.ts`, Szenario `z-korrektur-top-und-stunden-nach-passt` (jetzt Note 4).
- Status: behoben.

### L18 Reparatur ohne Anweiser, obwohl der Chef geschickt hat
- Was: `abgeschlossen-tulln-verteiler`. Die Regel „bei Reparatur bleibt angewiesenVon leer“ war zu grob; „da Chef hat mi gschickt“ ging verloren. Dazu klang „War es wirklich Tulln?“ misstrauisch.
- Regel: Bei Reparatur nur ohne Anweisung leer; wer den Einsatz geschickt hat, ist der Anweiser. Frage jetzt „Tulln ist bei uns schon abgeschlossen. Trotzdem dort eintragen?“ mit „Ja, dort“.
- Status: behoben.

### Szenario-Erwartung zu streng
- `m-erstkontakt-zweite-meldung-statt-ja` erwartete beim zweiten Punkt 1 Person, die Nachricht sagt das aber nicht. Der Agent hat richtig nicht geraten. Erwartung entfernt. Lehre: Bei durchgefallenen Szenarien immer zuerst prüfen, ob die Erwartung selbst stimmt.

### 2026-10-22: Muster aus der ersten Abnahme (A1 bis A12)

Ein Subagent hat die Holdout-Gespräche gelesen und nur abstrakte Muster gemeldet. Die Hauptsitzung kennt die Inhalte nicht. Das alte Holdout ist danach verbraucht und liegt jetzt bei den sichtbaren Szenarien (`z-*.json`); ein frisches Holdout (`zurueck/h2-*.json`) ist geschrieben. Zu jedem Muster gibt es ein neues sichtbares Szenario (`m-*.json`) und einen Test in `abnahme1.test.ts`.

### A1 und A2 Datenverlust bei Nachtrag und Korrektur (schwerster Fehler bisher)
- Was: Ein Nachtrag zu einer offenen Zusammenfassung wurde als neue Meldung behandelt, der erste Punkt still als unbestätigt abgelegt. Eine spätere Korrektur griff nur auf „zuletzt gespeichert“ zu, ordnete nach Position zu und überschrieb dadurch einen anderen, bestätigten Punkt. Der war danach weg. Der gemeldete „erfundene Wert“ war nur ein Folgefehler.
- Ursache: `neuer_zuruf` legte ab und begann neu; `korrektur_gespeichert` kannte nur `letzteGespeicherte` und `ersetzt[i]` nach Index.
- Regel: Nachträge werden angehängt, nie still abgelegt. Ohne neue Baustelle gilt die des offenen Zurufs. Korrekturen nennen die Id des gespeicherten Eintrags (`bezugId`), Kontext sind alle eigenen Einträge der letzten 3 Stunden. Unbeteiligte bleiben unverändert, nicht mehr belegte Angaben bleiben wie gespeichert. Korrekturen stellen keine Rückfragen.
- Abgesichert durch: Tests A1, A2; Szenarien `m-nachtrag-zweiter-punkt-favoriten`, `m-korrektur-erster-von-zwei-moedling`.
- Status: behoben, in Lauf 4 und Abnahme 2 prüfen.

### A3 Teilkorrektur löscht den Rest des Felds
- Regel (Prompt): Eine Korrektur ersetzt nur den genannten Teil („Top 19 statt 17“ lässt die Stiege stehen).
- Abgesichert durch: Szenario `m-korrektur-nur-top-stiege-bleibt`.
- Status: beobachten.

### A4 Rückfragen-Grenze pro Entwurf statt pro Absender
- Was: Mit mehreren Entwürfen in einem Gespräch kamen 4 Rückfragen.
- Regel: Höchstens 2 Rückfragen pro Absender in 30 Minuten.
- Abgesichert durch: Test A4.
- Status: behoben.

### A5 Ungeduld überhört
- Regel: Die KI meldet `ungeduldig`. Danach keine Rückfrage mehr, sofort zusammenfassen, Fehlendes als „Offen“.
- Abgesichert durch: Test A5, Szenario `m-ungeduld-duschkoepfe-garderobe`.
- Status: behoben.

### A6 Reparatur als Zusatzarbeit eingestuft, Einstufung schwankt
- Regel: Neue Art `reparatur_schaden`: keine Anweiser-Frage, Hinweis „Verursacher klärt das Büro“. Eine einmal erkannte Art kippt nicht zurück auf „Auftrag“.
- Abgesichert durch: Test A6, Szenario `m-schaden-trockenbauer-kaltwasser`.
- Status: behoben.

### A7 Doppelfrage nach dem Aufwand, auch bei Mengenarbeit
- Regel: Nur „Wie lang hat es gedauert?“, und nur bei Zusatzarbeit ohne Menge, Leute und Stunden.
- Abgesichert durch: Test A7, Szenario `m-klar-kondensatleitung-meter`.
- Status: behoben.

### A8 Gefragt, aber nicht beantwortet, steht nicht als offen da
- Regel: Jede Rückfrage, deren Feld leer bleibt, kommt nach `offen` und in die Zeile „Offen: …“.
- Abgesichert durch: Test A5.
- Status: behoben.

### A9 Angekündigte Aufzählung unterbrochen
- Regel: Die KI meldet `angekuendigtePunkte`. Bis alle da sind, nur „Hab Punkt k, schick weiter.“
- Abgesichert durch: Test A9, Szenario `m-aufzaehlung-drei-nachrichten-21er`.
- Status: behoben.

### A10 Foto allein löst sofort eine Rückfrage aus
- Ursache: Der Testaufbau schickte fast gleichzeitige Nachrichten einzeln. Auf WhatsApp kommen Foto und Text oft Sekunden auseinander.
- Regel: Der Kanal sammelt Nachrichten kurz (Bündel), der Agent antwortet einmal (`verarbeiteBuendel`). Die Lernschleife stellt `ersteNachrichten` als Bündel zu. Für Phase 3: Sammelfenster im Webhook (Länge noch festzulegen, Annahme 15 bis 30 Sekunden).
- Abgesichert durch: Test A10, Szenario `m-foto-dann-sprache-revisionsoeffnung`.
- Status: behoben im Agenten, Sammelfenster im Kanal offen.

### A11 Zweite Geldfrage: gleicher Satz und volle Zusammenfassung noch einmal
- Regel: Beim zweiten Mal ein anderer, kürzerer Satz. War die Zusammenfassung gerade die letzte Nachricht, nur „Deine Meldung oben ist noch offen.“ mit Knöpfen.
- Abgesichert durch: Test A11, Szenario `m-zwei-aergerfragen-badewanne`.
- Status: behoben.

### A12 Meldung vor der Zustimmung nicht quittiert, Begrüßung zu lang
- Regel: „Deine Meldung hab ich. Ich leg sie ab, sobald du ja sagst.“ Begrüßung auf zwei Sätze plus Frage gekürzt.
- Abgesichert durch: Test A12, Szenario `m-erstkontakt-zweite-meldung-statt-ja`.
- Status: behoben.

### A13 Auslöser und Vermittler beim Anweiser
- Regel (Prompt): Der Vermittler ist der Anweiser, der Auslöser gehört in `grund`.
- Status: beobachten.

### Prüfwerkzeug
- Bewerter sieht jetzt auch die Hinweise fürs Büro.
- Ein fehlender Eintrag heißt „verloren“, nicht mehr „erfunden“ (Zuordnung nur bei passender Leistung).

### 2026-10-22: Lauf 3 und erste Abnahme
- Sichtbar (30): alle bestanden, Felder 100 % richtig, 0 erfunden, Rückfragen Median 0 / Max 2, Note Median 5 / Min 3, Antwort Median 3,1 s, 1,45 USD.
- Zurückgehalten (10): nur 6 bestanden, Note Median 3,5 / Min 2, 1 erfundener Wert, Rückfragen Max 4, Felder 95 %. Durchgefallen: abgeschlossenes_projekt, korrektur, projekt_unklar, dialekt.
- Lehre: Die sichtbaren Szenarien sind nach drei Runden zum Teil auswendig gelernt. Die Zahlen auf ihnen sagen wenig über neue Fälle. Gegenmittel: Holdout-Fehler nur als abstrakte Muster ansehen (Subagent fasst zusammen, ohne Inhalte), daraus neue sichtbare Szenarien schreiben, danach ein frisches Holdout.
- Kennzahl „Nachrichten bis Bestätigung“ (Median 3) misst auch Szenarien mit Korrektur und Rückfrage mit. Für das Ziel „Median 2“ nur Szenarien ohne nötige Rückfrage zählen. Offen.

### 2026-10-22: Lauf 2 (30 Szenarien, 25 bestanden, Note Median 4, Minimum 2, 0 erfundene Werte, 1,62 USD)

Die Noten stiegen deutlich (12 mal Note 5 statt 6), erfundene Werte auf 0. Drei der fünf neuen Fehlschläge hat der Fix L10 selbst verursacht. Lehre: Jede harte Regel im Code braucht auch eine Gegenprobe für den Normalfall (hier: Dialekt).

### L12 Worttreue zu streng für Dialekt
- Was: `mehrere-punkte-zwei-baustellen`, `dialekt-steirisch-urinale`, `dialekt-wienerisch-heizkoerper`. Weil „Bauleiter“ nicht wörtlich gesagt war („Bauleita“), ersetzte der Code den Wert durch das Zitat. So landeten Satzfetzen wie „da Bauleita vom GU gsogt“ und „des woa da Schuiwart“ in den Daten.
- Ursache: L10 prüfte Wörter exakt. Außerdem waren die Zitate zu lang (mit Verb).
- Regel: Ein Wort gilt als gesagt, wenn es fast so vorkommt (Abstand höchstens 30 % der Wortlänge) oder im kleinen Dialekt-Wörterbuch steht (Gmoa, Kuchl ...). Neue Wörter wie „Bauleiter“ aus „der vom GU“ bleiben verboten. Werte in Schriftdeutsch, Zitate nur die Person bzw. der Ort, ohne Verb.
- Abgesichert durch: Tests „Dialekt: da Bauleita vom GU“, „Dialekt-Wörterbuch“, weiter „Worttreue“ aus L10.
- Status: behoben, in Lauf 3 prüfen.

### L13 Anweiser übersehen, wenn nur gesagt wird, wer es wollte
- Was: `klar-wc-vorwand-w10`. „weil architekt andere höhe will“, trotzdem Rückfrage „Wer hat das angeschafft?“. Antwort: „steht eh oben architekt“. Note 2. Die Ursache war die Prompt-Regel aus L10 („wessen Wunsch es war, ist nicht der Anweiser“).
- Regel: Hat niemand ausdrücklich angeschafft, gilt der, der es wollte, als Anweiser.
- Abgesichert durch: Prompt, Szenario `klar-wc-vorwand-w10`.
- Status: behoben, in Lauf 3 prüfen.

### L14 Grund der Arbeit geht verloren
- Was: „weil de Kuchl woanders hinkummt“, „weil s Lager hin woa“, „weil da Elektriker mit seiner Trasse ned vorbeikummt“ fehlten in Zusammenfassung und Ablage. Für das Büro ist der Grund oft das Wichtigste.
- Regel: Neues Feld `grund`, nie aus Fotos. In der Zusammenfassung in Klammern hinter der Leistung.
- Abgesichert durch: Tests „Grund steht in der Zusammenfassung“, „Grund nicht aus dem Foto“.
- Status: behoben.

### L15 Seufzer als Unsinn abgewiesen
- Was: `frage-geld-kriegen-wir-das-bezahlt`. Auf „na hoffentlich“ kam „Das ist nichts für mich …“.
- Regel: Wartet eine Zusammenfassung auf Bestätigung, ist eine Nachricht ohne Inhalt ein Kommentar: „Verstehe.“ und die offene Zusammenfassung mit Knöpfen, in einer Nachricht.
- Abgesichert durch: Test „Seufzer bei offener Zusammenfassung“.
- Status: behoben.

### L16 Bei mehreren Lücken die falsche zuerst gefragt
- Was: `laerm-bruchstueck-flex`. Zuerst offene Frage nach dem Ort, die Leute blieben dann offen, obwohl ein Knopf gereicht hätte.
- Regel: Jede unklare Angabe zählt als eigene Rückfrage (höchstens 2 insgesamt). Reihenfolge: Leute, Stunden, Menge, Anweiser, Ort, Tag, Leistung.
- Abgesichert durch: Test „bei mehreren unklaren Stellen zuerst die Leute“.
- Status: behoben.

### Prüfwerkzeug: Länge falsch gezählt
- Was: Die Längenprüfung zählte den vorangestellten Hinweis (Geldfrage) als Zeilen der Zusammenfassung.
- Regel: Nur der Körper nach „… so:“ oder „… offen:“ zählt.
- Status: behoben in `lernschleife.ts`.

### 2026-10-22: Lauf 1 (30 Szenarien, 28 bestanden, Note Median 4, Minimum 1, 1,64 USD)

### L1 Menge und Leistung aus dem Foto geschlossen
- Was: `nur-foto-ohne-text`. Bildbeschreibung „zwei neuen Bögen“ wurde zu Menge „2 Stk“, „frisch montiert“ zur Leistung „montiert“. Die Menge überstand sogar die Korrektur und wurde bestätigt gespeichert. Note 1.
- Ursache: Die Belegprüfung akzeptierte jedes wörtliche Zitat, auch aus einer Bildbeschreibung. Ein Foto zeigt einen Zustand, nicht was gemacht wurde.
- Regel: Aus Fotos zählen nur Baustelle und Ort. Alles andere muss aus Text oder Sprache kommen. Steht die Leistung nur im Foto, fragt der Agent „Was hast du gemacht?“.
- Abgesichert durch: `belege.ts` (AUS_FOTO_ERLAUBT), Test „Foto: keine Menge oder Leistung“, Szenario `nur-foto-ohne-text`.
- Status: behoben, in Lauf 2 prüfen.

### L2 Unverständliches still weggelassen
- Was: `laerm-bruchstueck-flex`. „[unverständlich] Mann“ und „Top [unverständlich] zwanzig“: keine Rückfrage, nicht als offen markiert, bestätigt gespeichert mit `offen: []`.
- Ursache: Die KI hatte keinen Weg zu sagen „hier wurde etwas gesagt, aber nicht verstanden“.
- Regel: Die KI meldet solche Felder als `unklar`. Der Code fragt sie nach (bei Personen mit Knöpfen Allein / Zu zweit / Zu dritt) und zeigt sie sonst als „Offen: …“ in der Zusammenfassung und in der Liste „offen“.
- Abgesichert durch: Test „fragt Unverständliches nach“, Szenario `laerm-bruchstueck-flex`.
- Status: behoben, in Lauf 2 prüfen.

### L3 Nein im Dialekt nicht erkannt, Endlosschleife bei der Zustimmung
- Was: `erstkontakt-ablehnung`. „na, des wü i ned“ und „na hob i gsogt“ wurden ignoriert, dreimal dieselbe Frage. Note 2.
- Ursache: Zustimmung nur per Knopf. Beim ersten Fix auch: „eh“ stand in den Ja-Wörtern, dadurch war „i schreib des eh auf“ zweideutig (vom neuen Test gefunden).
- Regel: Ja und Nein auch als Text, Dialekt eingeschlossen. Nach der Begrüßung höchstens einmal nachfragen, danach schweigen und nichts speichern. Bei Nein ausdrücklich sagen, dass auch die erste Nachricht verworfen ist.
- Abgesichert durch: Tests „erkennt Nein im Dialekt“, „fragt höchstens einmal nach“, Szenario `erstkontakt-ablehnung`.
- Status: behoben, in Lauf 2 prüfen.

### L4 Wortgleiche Wiederholung bei Privatem
- Was: `kein-zuruf-leberkaessemmeln`. Auf „hoppla falscher chat“ kam derselbe abweisende Satz noch einmal. Note 3.
- Regel: Kein Satz zweimal hintereinander. Beim zweiten Mal reicht „Kein Problem.“ Erster Satz freundlicher.
- Abgesichert durch: Test „wiederholt bei Privatem nicht“.
- Status: behoben.

### L5 „Liegt beim Büro für die Abrechnung“ klingt nach „wird bezahlt“
- Was: Bewerter in `abgeschlossen-tulln-verteiler` und `frage-geld-kriegen-wir-das-bezahlt`: Die Abschlussnachricht legt nahe, dass abgerechnet wird. Bei Tulln (übergeben) kann es Gewährleistung sein.
- Regel: Neutral: „Abgelegt. Das Büro schaut es sich an.“ Auch in der Begrüßung kein „für die Abrechnung“ mehr.
- Abgesichert durch: Test „Geldfrage und Zusammenfassung in einer Nachricht“.
- Status: behoben.

### L6 Hinweis und Zusammenfassung als zwei Nachrichten
- Was: Bei Geld- oder GU-Fragen kamen zwei Nachrichten hintereinander. Regel 1.
- Regel: Hinweis und nächste Antwort in eine Nachricht.
- Abgesichert durch: gleicher Test wie L5.
- Status: behoben.

### L7 Material doppelt oder erfunden
- Was: `projekt-unklar-bereich-turnsaal`, `frage-recht-dem-gu-melden`, `nur-foto-ein-wort-regie`: „…umgebaut, 3 Stk, Thermostatarmaturen“, „Lüftungsgerät“ als Material, obwohl es nicht gesetzt werden konnte.
- Regel: Material nur, wenn ausdrücklich als verbaut genannt und nicht schon in der Leistung. Die Zusammenfassung lässt Material weg, das in der Leistung steht.
- Abgesichert durch: Prompt und `texte.ts`. Noch kein eigener Test.
- Status: beobachten.

### L8 Bei Wartezeit gefragt, wer angeschafft hat
- Was: `frage-recht-dem-gu-melden`. „Wer hat das angeschafft?“ bei einer Wartezeit; die Antwort „niemand“ ging verloren.
- Regel: Die KI unterscheidet Auftrag, Zusatz/Änderung und Behinderung/Wartezeit. Nur bei Zusatz/Änderung wird nach dem Anweiser gefragt. Behinderung bekommt einen Hinweis fürs Büro. „niemand“ wird als „niemand (laut Absender)“ gespeichert.
- Abgesichert durch: Test „Behinderung: keine Frage nach dem Anweiser“.
- Status: behoben.

### L9 Knöpfe beim Anweiser ohne echte Auswahl
- Was: `nur-foto-ein-wort-regie`: nur „Weiß nicht“ und „Keiner extra“.
- Regel: Knöpfe „Bauleiter GU“, „Bauherr“, „Weiß nicht“. Anderes per Text oder Sprache. Bei Zusatzarbeit ohne Leute und Stunden einmal nach dem Aufwand fragen.
- Status: behoben, beobachten (mehr Rückfragen möglich).

### L10 Wer angeschafft hat, wurde umgedeutet
- Was: „der vom GU“ wurde „Bauleiter vom GU“; „weil die Schule das will, Bauleiter GU sagt machen“ wurde „Schule (Bauherr), freigegeben von Bauleiter GU“; „da Chef hat mi gschickt“ wurde „Bewohnerin (über Büro/Chef)“. Gerade dieses Feld zählt für die Abrechnung.
- Ursache: Die Belegprüfung prüfte nur das Zitat, nicht den Wert.
- Regel: Worttreue für Ort und Anweiser: Enthält der Wert Wörter, die der Absender nie gesagt hat, wird er durch das Zitat ersetzt. Prompt: direkter Anweiser, nicht wessen Wunsch es war.
- Abgesichert durch: `belege.ts` (WORTTREU), Test „Worttreue“.
- Status: behoben.

### L11 „stopp“ mitten im Gespräch unklar
- Was: `stopp-mitten-im-gespraech`. Antwort sagte nicht, dass der angefangene Zuruf verworfen ist; Wiedereinstieg nur mit dem Codewort „start“.
- Regel: Bei stopp sagen, dass das Angefangene verworfen ist. Danach: Wer wieder schreibt, wird einmal gefragt „Soll ich wieder aufnehmen?“ (Knopf oder ja/nein), kein Codewort nötig.
- Abgesichert durch: Test „stopp sagt, dass der angefangene Zuruf verworfen ist“.
- Status: behoben.

### Beobachtungen ohne Fehler
- Antwortzeit Median 3,4 s pro Nachricht (ohne Persona). Erster Einzeltest 9,5 s. Für WhatsApp vermutlich in Ordnung, später messen.
- Nachrichten bis zur Bestätigung: Median 3, Ziel 2. Grund vor allem Rückfragen und Korrekturen. Beobachten.
