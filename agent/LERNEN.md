# Learning: mistakes and the rules derived from them (Lernen)

Every mistake made by the agent or in our work goes here, newest at the top. Read before every change to the agent. A rule only counts once a scenario or test secures it.

## Template (Vorlage)

```
### YYYY-MM-DD: short title
- What: what happened (scenario ID, quote from the conversation)
- Cause: why (prompt, code, data, test setup)
- Rule: what applies from now on
- Secured by: szenarien/<id>.json, test
- Status: open | fixed | observe
```

## Entries (Einträge)

### 2026-10-22: Integration into the app

### L21 Buttons and summary only knew the provisional company
- What: With the app's company (`opts.firma`), the project buttons showed the identifier instead of the name („p2-w22-bt3“), and the AI answer was checked against the provisional list in `firma.ts` (projects of the app would have been discarded).
- Cause: `texte.ts` (`projektKnopf`, `punktZeilen`) and `verstehen.ts` (`alsEintrag`, candidates) called `projektNachId` without a company, so always with `FIRMA`.
- Rule: Every place that looks up a project is passed the company. `FIRMA` is now only the default for tests and the learning loop.
- Secured by: test „nutzt die übergebene Firma für Knöpfe und Zusammenfassung“ in `agent.test.ts`.
- Status: fixed.

### 2026-10-22: From our own test in the simulator

### L19 Source showed all messages of the conversation
- What: With two items (radiator, socket), both cards listed all messages as the source.
- Rule: The source per entry is only the messages its details come from. Photos count if there is only one item.
- Secured by: test „Quelle pro Eintrag“ in `abnahme1.test.ts`.
- Status: fixed, no learning loop run since.

### L20 Summary with several items hard to read
- What: Each item on one long line, tedious on a phone.
- Rule: Per item a header line „1) Baustelle, Ort“ (1) site, location), with indented sub-lines below.
- Secured by: same test.
- Status: fixed, no learning loop run since.

### 2026-10-22: Run 4 (50 visible) and acceptance 2, both via the Claude subscription
- Run 4: 47/50, 0 invented, fields 99 %, follow-up questions max 2, rating median 4.5 / min 2. Response time via the subscription median 9.5 s (via the API 2.5 s, not comparable).
- Acceptance 2 (fresh holdout `h2-*`, never read): 9/10, 0 invented, fields 98 %, follow-up questions max 1, rating median 4 / min 2. Failed: laerm_bruchstueck. Rating 2 despite passed checks: mehrere_punkte. Acceptance 1 was 6/10.
- Not yet analysed (would use up the holdout): the two weak holdout cases. Next step: a subagent analyses them abstractly.

### L17 Bundle: first part of the report lost
- What: `z-korrektur-top-und-stunden-nach-passt`. A voice note (radiator) and seconds later a text (floor drain) arrived as a bundle. The AI read the text as an addendum to an empty Zuruf and only returned the floor drain. The radiator was missing from the summary, was confirmed with „Passt“ and was gone. The later correction did not find it and started from scratch. Rating 2.
- Cause: The first message of the bundle appeared in the prompt as an "open Zuruf" („offener Zuruf“) with an empty state.
- Rule: Bundled messages appear in the prompt as „NEUE NACHRICHTEN … zusammen EINE Meldung, kein Punkt darf fehlen“ (NEW MESSAGES … together ONE report, no item may be missing). Code as a safety net: without an open Zuruf, „Nachtrag“ (addendum) in a bundle becomes „zuruf“.
- Secured by: test L17 in `abnahme1.test.ts`, scenario `z-korrektur-top-und-stunden-nach-passt` (now rating 4).
- Status: fixed.

### L18 Repair without instructing person, although the boss sent him
- What: `abgeschlossen-tulln-verteiler`. The rule "for repairs angewiesenVon stays empty" was too coarse; „da Chef hat mi gschickt“ (the boss sent me) got lost. In addition, „War es wirklich Tulln?“ (Was it really Tulln?) sounded suspicious.
- Rule: For repairs, empty only when there is no instruction; whoever sent him on the job is the instructing person. The question is now „Tulln ist bei uns schon abgeschlossen. Trotzdem dort eintragen?“ (Tulln is already closed on our side. Enter it there anyway?) with „Ja, dort“ (Yes, there).
- Status: fixed.

### Scenario expectation too strict
- `m-erstkontakt-zweite-meldung-statt-ja` expected 1 person for the second item, but the message does not say so. The agent correctly did not guess. Expectation removed. Lesson: with failed scenarios, always first check whether the expectation itself is correct.

### 2026-10-22: Patterns from the first acceptance (A1 bis A12)

A subagent read the holdout conversations and only reported abstract patterns. The main session does not know the contents. The old holdout is used up after that and now sits with the visible scenarios (`z-*.json`); a fresh holdout (`zurueck/h2-*.json`) has been written. For every pattern there is a new visible scenario (`m-*.json`) and a test in `abnahme1.test.ts`.

### A1 and A2 Data loss on addendum and correction (most serious bug so far)
- What: An addendum to an open summary was treated as a new report, and the first item was silently filed as unconfirmed. A later correction only accessed "last saved", matched by position and thereby overwrote another, confirmed item. That item was gone afterwards. The reported "invented value" was only a follow-on error.
- Cause: `neuer_zuruf` filed and started anew; `korrektur_gespeichert` only knew `letzteGespeicherte` and `ersetzt[i]` by index.
- Rule: Addenda are appended, never silently filed. Without a new site, the site of the open Zuruf applies. Corrections name the id of the saved entry (`bezugId`), context is all of the sender's own entries from the last 3 hours. Uninvolved entries stay unchanged, details no longer supported stay as saved. Corrections do not ask follow-up questions.
- Secured by: tests A1, A2; scenarios `m-nachtrag-zweiter-punkt-favoriten`, `m-korrektur-erster-von-zwei-moedling`.
- Status: fixed, check in run 4 and acceptance 2.

### A3 Partial correction deletes the rest of the field
- Rule (prompt): A correction only replaces the part named („Top 19 statt 17“, "Top 19 instead of 17", leaves the staircase as it is).
- Secured by: scenario `m-korrektur-nur-top-stiege-bleibt`.
- Status: observe.

### A4 Follow-up question limit per draft instead of per sender
- What: With several drafts in one conversation, 4 follow-up questions came.
- Rule: At most 2 follow-up questions per sender within 30 minutes.
- Secured by: test A4.
- Status: fixed.

### A5 Impatience ignored
- Rule: The AI reports `ungeduldig`. After that no more follow-up questions, summarise immediately, missing items as „Offen“ (Open).
- Secured by: test A5, scenario `m-ungeduld-duschkoepfe-garderobe`.
- Status: fixed.

### A6 Repair classified as additional work, classification fluctuates
- Rule: New type `reparatur_schaden`: no question about the instructing person, note „Verursacher klärt das Büro“ (the office clarifies who caused it). A type once recognised does not flip back to "contract work" („Auftrag“).
- Secured by: test A6, scenario `m-schaden-trockenbauer-kaltwasser`.
- Status: fixed.

### A7 Double question about effort, even for quantity-based work
- Rule: Only „Wie lang hat es gedauert?“ (How long did it take?), and only for additional work without quantity, people and hours.
- Secured by: test A7, scenario `m-klar-kondensatleitung-meter`.
- Status: fixed.

### A8 Asked but not answered does not appear as open
- Rule: Every follow-up question whose field stays empty goes into `offen` and into the line „Offen: …“.
- Secured by: test A5.
- Status: fixed.

### A9 Announced list interrupted
- Rule: The AI reports `angekuendigtePunkte`. Until all have arrived, only „Hab Punkt k, schick weiter.“ (Got item k, keep sending.)
- Secured by: test A9, scenario `m-aufzaehlung-drei-nachrichten-21er`.
- Status: fixed.

### A10 Photo alone immediately triggers a follow-up question
- Cause: The test setup sent almost simultaneous messages individually. On WhatsApp, photo and text often arrive seconds apart.
- Rule: The channel collects messages briefly (bundle), the agent replies once (`verarbeiteBuendel`). The learning loop delivers `ersteNachrichten` as a bundle. For phase 3: collection window in the webhook (length still to be set, Annahme 15 to 30 seconds).
- Secured by: test A10, scenario `m-foto-dann-sprache-revisionsoeffnung`.
- Status: fixed in the agent, collection window in the channel open.

### A11 Second money question: same sentence and full summary again
- Rule: The second time a different, shorter sentence. If the summary was just the last message, only „Deine Meldung oben ist noch offen.“ (Your report above is still open.) with buttons.
- Secured by: test A11, scenario `m-zwei-aergerfragen-badewanne`.
- Status: fixed.

### A12 Report before consent not acknowledged, greeting too long
- Rule: „Deine Meldung hab ich. Ich leg sie ab, sobald du ja sagst.“ (I have your report. I will file it as soon as you say yes.) Greeting shortened to two sentences plus a question.
- Secured by: test A12, scenario `m-erstkontakt-zweite-meldung-statt-ja`.
- Status: fixed.

### A13 Trigger and intermediary for the instructing person
- Rule (prompt): The intermediary is the instructing person, the trigger belongs in `grund`.
- Status: observe.

### Checking tool
- The rater now also sees the notes for the office.
- A missing entry is called "lost" („verloren“), no longer "invented" („erfunden“) (matching only with matching work performed).

### 2026-10-22: Run 3 and first acceptance
- Visible (30): all passed, fields 100 % correct, 0 invented, follow-up questions median 0 / max 2, rating median 5 / min 3, response median 3.1 s, 1.45 USD.
- Held back (10): only 6 passed, rating median 3.5 / min 2, 1 invented value, follow-up questions max 4, fields 95 %. Failed: abgeschlossenes_projekt, korrektur, projekt_unklar, dialekt.
- Lesson: After three rounds the visible scenarios are partly learned by heart. The numbers on them say little about new cases. Countermeasure: look at holdout failures only as abstract patterns (a subagent summarises without contents), write new visible scenarios from them, then a fresh holdout.
- The metric "messages until confirmation" (median 3) also includes scenarios with correction and follow-up question. For the target "median 2", count only scenarios without a necessary follow-up question. Open.

### 2026-10-22: Run 2 (30 scenarios, 25 passed, rating median 4, minimum 2, 0 invented values, 1.62 USD)

The ratings rose clearly (12 times rating 5 instead of 6), invented values down to 0. Three of the five new failures were caused by fix L10 itself. Lesson: every hard rule in code also needs a counter-check for the normal case (here: dialect).

### L12 Word fidelity too strict for dialect
- What: `mehrere-punkte-zwei-baustellen`, `dialekt-steirisch-urinale`, `dialekt-wienerisch-heizkoerper`. Because „Bauleiter“ was not said literally („Bauleita“), the code replaced the value with the quote. That is how sentence fragments such as „da Bauleita vom GU gsogt“ and „des woa da Schuiwart“ ended up in the data.
- Cause: L10 checked words exactly. In addition, the quotes were too long (including the verb).
- Rule: A word counts as said if it occurs almost like that (distance at most 30 % of the word length) or is in the small dialect dictionary (Gmoa, Kuchl ...). New words such as „Bauleiter“ from „der vom GU“ remain forbidden. Values in standard German, quotes only the person or the location, without verb.
- Secured by: tests „Dialekt: da Bauleita vom GU“, „Dialekt-Wörterbuch“, plus „Worttreue“ from L10.
- Status: fixed, check in run 3.

### L13 Instructing person overlooked when it is only said who wanted it
- What: `klar-wc-vorwand-w10`. „weil architekt andere höhe will“ (because the architect wants a different height), yet the follow-up question „Wer hat das angeschafft?“ (Who ordered that?). Answer: „steht eh oben architekt“ (it says architect up there already). Rating 2. The cause was the prompt rule from L10 ("whose wish it was is not the instructing person").
- Rule: If nobody explicitly ordered it, whoever wanted it counts as the instructing person.
- Secured by: prompt, scenario `klar-wc-vorwand-w10`.
- Status: fixed, check in run 3.

### L14 Reason for the work gets lost
- What: „weil de Kuchl woanders hinkummt“ (because the kitchen moves somewhere else), „weil s Lager hin woa“ (because the bearing was broken), „weil da Elektriker mit seiner Trasse ned vorbeikummt“ (because the electrician can't get past with his cable route) were missing from summary and storage. For the office the reason is often the most important thing.
- Rule: New field `grund`, never from photos. In the summary in brackets after the work performed.
- Secured by: tests „Grund steht in der Zusammenfassung“, „Grund nicht aus dem Foto“.
- Status: fixed.

### L15 Sigh rejected as nonsense
- What: `frage-geld-kriegen-wir-das-bezahlt`. „na hoffentlich“ (well, hopefully) got the reply „Das ist nichts für mich …“ (That's not something for me …).
- Rule: If a summary is waiting for confirmation, a message without content is a comment: „Verstehe.“ (I see.) and the open summary with buttons, in one message.
- Secured by: test „Seufzer bei offener Zusammenfassung“.
- Status: fixed.

### L16 With several gaps, the wrong one asked first
- What: `laerm-bruchstueck-flex`. First an open question about the location, the people then stayed open, although a button would have been enough.
- Rule: Every unclear detail counts as its own follow-up question (at most 2 in total). Order: people, hours, quantity, instructing person, location, day, work performed.
- Secured by: test „bei mehreren unklaren Stellen zuerst die Leute“.
- Status: fixed.

### Checking tool: length counted wrongly
- What: The length check counted the prepended note (money question) as lines of the summary.
- Rule: Only the body after „… so:“ or „… offen:“ counts.
- Status: fixed in `lernschleife.ts`.

### 2026-10-22: Run 1 (30 scenarios, 28 passed, rating median 4, minimum 1, 1.64 USD)

### L1 Quantity and work performed inferred from the photo
- What: `nur-foto-ohne-text`. The image description „zwei neuen Bögen“ (two new bends) became quantity „2 Stk“ (2 pcs), „frisch montiert“ (freshly installed) became work performed „montiert“. The quantity even survived the correction and was saved as confirmed. Rating 1.
- Cause: The evidence check accepted any literal quote, including one from an image description. A photo shows a state, not what was done.
- Rule: From photos only site and location count. Everything else must come from text or voice. If the work performed is only in the photo, the agent asks „Was hast du gemacht?“ (What did you do?).
- Secured by: `belege.ts` (AUS_FOTO_ERLAUBT), test „Foto: keine Menge oder Leistung“, scenario `nur-foto-ohne-text`.
- Status: fixed, check in run 2.

### L2 Unintelligible parts silently dropped
- What: `laerm-bruchstueck-flex`. „[unverständlich] Mann“ ([unintelligible] men) and „Top [unverständlich] zwanzig“ (Top [unintelligible] twenty): no follow-up question, not marked as open, saved as confirmed with `offen: []`.
- Cause: The AI had no way to say "something was said here, but not understood".
- Rule: The AI reports such fields as `unklar`. The code asks about them (for people with buttons Allein / Zu zweit / Zu dritt, i.e. alone / two of us / three of us) and otherwise shows them as „Offen: …“ in the summary and in the "open" („offen“) list.
- Secured by: test „fragt Unverständliches nach“, scenario `laerm-bruchstueck-flex`.
- Status: fixed, check in run 2.

### L3 No in dialect not recognised, endless loop on consent
- What: `erstkontakt-ablehnung`. „na, des wü i ned“ (no, I don't want that) and „na hob i gsogt“ (I said no) were ignored, the same question three times. Rating 2.
- Cause: Consent only by button. In the first fix also: „eh“ was among the yes words, which made „i schreib des eh auf“ (I write it down anyway) ambiguous (found by the new test).
- Rule: Yes and no also as text, dialect included. After the greeting ask again at most once, then stay silent and save nothing. On no, say explicitly that the first message has also been discarded.
- Secured by: tests „erkennt Nein im Dialekt“, „fragt höchstens einmal nach“, scenario `erstkontakt-ablehnung`.
- Status: fixed, check in run 2.

### L4 Verbatim repetition for private matters
- What: `kein-zuruf-leberkaessemmeln`. „hoppla falscher chat“ (oops, wrong chat) got the same dismissive sentence again. Rating 3.
- Rule: No sentence twice in a row. The second time „Kein Problem.“ (No problem.) is enough. First sentence friendlier.
- Secured by: test „wiederholt bei Privatem nicht“.
- Status: fixed.

### L5 „Liegt beim Büro für die Abrechnung“ sounds like "will be paid"
- What: Rater in `abgeschlossen-tulln-verteiler` and `frage-geld-kriegen-wir-das-bezahlt`: the closing message („Liegt beim Büro für die Abrechnung“, "It is with the office for billing") suggests that it will be billed. With Tulln (handed over) it may be a warranty case.
- Rule: Neutral: „Abgelegt. Das Büro schaut es sich an.“ (Filed. The office will look at it.) No more „für die Abrechnung“ in the greeting either.
- Secured by: test „Geldfrage und Zusammenfassung in einer Nachricht“.
- Status: fixed.

### L6 Note and summary as two messages
- What: For money or GU questions, two messages came one after the other. Rule 1.
- Rule: Note and next reply in one message.
- Secured by: same test as L5.
- Status: fixed.

### L7 Material duplicated or invented
- What: `projekt-unklar-bereich-turnsaal`, `frage-recht-dem-gu-melden`, `nur-foto-ein-wort-regie`: „…umgebaut, 3 Stk, Thermostatarmaturen“ (…converted, 3 pcs, thermostatic fittings), „Lüftungsgerät“ (ventilation unit) as material, although it could not be installed.
- Rule: Material only if explicitly named as installed and not already in the work performed. The summary omits material that is in the work performed.
- Secured by: prompt and `texte.ts`. No dedicated test yet.
- Status: observe.

### L8 Asked who gave the instruction for waiting time
- What: `frage-recht-dem-gu-melden`. „Wer hat das angeschafft?“ (Who ordered that?) for a waiting time; the answer „niemand“ (nobody) got lost.
- Rule: The AI distinguishes contract work, additional work/change and obstruction/waiting time. Only for additional work/change is the instructing person asked about. Obstruction gets a note for the office. „niemand“ is saved as „niemand (laut Absender)“ (nobody (according to sender)).
- Secured by: test „Behinderung: keine Frage nach dem Anweiser“.
- Status: fixed.

### L9 Buttons for the instructing person without a real choice
- What: `nur-foto-ein-wort-regie`: only „Weiß nicht“ (Don't know) and „Keiner extra“ (Nobody in particular).
- Rule: Buttons „Bauleiter GU“ (GU site manager), „Bauherr“ (client), „Weiß nicht“. Anything else by text or voice. For additional work without people and hours, ask once about the effort.
- Status: fixed, observe (more follow-up questions possible).

### L10 Who gave the instruction was reinterpreted
- What: „der vom GU“ (the guy from the GU) became „Bauleiter vom GU“; „weil die Schule das will, Bauleiter GU sagt machen“ (because the school wants it, GU site manager says do it) became „Schule (Bauherr), freigegeben von Bauleiter GU“; „da Chef hat mi gschickt“ became „Bewohnerin (über Büro/Chef)“. Precisely this field matters for billing.
- Cause: The evidence check only checked the quote, not the value.
- Rule: Word fidelity for location and instructing person: if the value contains words the sender never said, it is replaced by the quote. Prompt: the direct instructing person, not whose wish it was.
- Secured by: `belege.ts` (WORTTREU), test „Worttreue“.
- Status: fixed.

### L11 „stopp“ in the middle of the conversation unclear
- What: `stopp-mitten-im-gespraech`. The reply did not say that the Zuruf in progress was discarded; re-entry only with the code word „start“.
- Rule: On stopp, say that what was started has been discarded. After that: whoever writes again is asked once „Soll ich wieder aufnehmen?“ (Shall I start recording again?) (button or yes/no), no code word needed.
- Secured by: test „stopp sagt, dass der angefangene Zuruf verworfen ist“.
- Status: fixed.

### Observations without errors
- Response time median 3.4 s per message (without persona). First single test 9.5 s. Probably fine for WhatsApp, measure later.
- Messages until confirmation: median 3, target 2. Mainly due to follow-up questions and corrections. Observe.
