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
