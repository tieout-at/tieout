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
