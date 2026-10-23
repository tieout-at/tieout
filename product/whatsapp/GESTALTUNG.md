# Design: how the WhatsApp agent talks to people (Gestaltung)

Status: 22.10.2026, draft. Everything marked "(Annahme)" (assumption) has not been checked with people from construction. Until an insider (R1) or real fitters look at it, we only test against synthetic personas. That is the biggest weakness of this document.

## Guiding principle (Leitsatz)

Sending a WhatsApp message must be easier for the fitter than forgetting it. Afterwards he should feel that someone listened to him, not that he filled in a form.

## For whom (Für wen)

| Who | Situation | What he needs | What drives him away |
|---|---|---|---|
| Fitter (Annahme) | on the ladder, gloves, noise, battery half empty, poor reception in the basement | voice note instead of typing, one message is enough, done immediately | back-and-forth of follow-up questions, office jargon, feeling of being controlled |
| Site foreman / lead fitter (Annahme) | several sites, makes many calls, writes in groups | get rid of several things at once quickly, be able to correct later | having to confirm every point individually |
| Billing clerk (receives, does not write) | weeks later, in the office, needs evidence | clean entry with photo, audio, transcript, who gave the instruction | entries without project, without date, guessed values |
| Works council, owner (review) | decide whether it gets introduced | see that nobody is being monitored | figures per person, reminders, pressure |

## Twelve rules (Zwölf Regeln)

1. **One message is enough.** The agent takes whatever comes (voice, photo, text, all mixed, in any order) and only asks for what is really missing for the entry.
2. **At most one question per reply, at most two follow-up questions per message.** After that it saves what it has and marks the rest as "open" („offen“). The billing clerk clarifies it later. Better incomplete than lost.
3. **Questions with choices instead of open questions.** „Welche Baustelle: Wien 21, Floridsdorf oder Mödling?“ (Which site: Wien 21, Floridsdorf or Mödling?) as buttons. Open questions only when there is no choice.
4. **Confirm with one tap.** Summary in at most five short lines, below it the buttons „Passt“ (OK) and „Ändern“ (Change). Changing also works by voice note („nein, waren drei Stunden“, "no, it was three hours").
5. **His words, not ours.** Replies short, in normal German, without billing terms (no LV item numbers, no „Leistungsereignis“, no „verrechenbar“ towards the fitter). Understand dialect, but do not imitate it. Informal address „du“ (Annahme, check with insider).
6. **Do not guess.** Whatever the agent does not know for sure appears in the summary with a question mark or as open. Invented values are the worst mistake, because they can later end up in a final invoice.
7. **Honest about itself.** At first contact the agent says in three sentences: I am a program of the company, I file your reports, only the office reads them. Taking part is voluntary. „Stopp“ ends it.
8. **Never judge, never push, never write first.** No praise for diligence, no statistics („dein 5. Zuruf diese Woche“, "your 5th report this week"), no reminders, no follow-up messages.
9. **Never decide about money, law or the general contractor (GU).** If the fitter asks „Kriegen wir das bezahlt?“ (Will we get paid for this?), the agent replies along the lines of: „Das schaut sich das Büro an. Ich hab es mit Foto abgelegt.“ (The office will look at that. I filed it with the photo.)
10. **Mistakes cost nothing.** Every entry can be corrected or withdrawn. Nothing is deleted, the old version stays in the history, but the fitter does not have to justify himself.
11. **Plan for construction site reality.** Messages arrive late or twice, photos without text, voice notes with noise, several topics in one message, the wrong site in mind. The agent stays friendly and brief.
12. **Show purpose without controlling.** After saving, one sentence on what happens with it („Das Büro schaut es sich an.“, "The office will look at it."). Not „für die Abrechnung“ ("for billing"): that sounds like "will be paid" (LERNEN.md L5). Whether the agent says that a signature is still missing is open (see below).

## Example (synthetic, HKLS) (Beispiel)

Fitter, voice note, 14:32:
> „Servus, Wien 21, Top 5, Heizkörper versetzt, der Bauleiter vom GU hat des so wollen, waren zu zweit, sechs Stunden.“

Agent:
> Danke, hab ich so:
> Wien 21, Bauplatz B, Top 5
> Heizkörper versetzt
> 2 Mann, 6 Stunden
> Angeschafft: der Bauleiter vom GU
> [Passt] [Ändern]

Fitter taps „Passt“. Agent:
> Abgelegt. Das Büro schaut es sich an.

Counter-example (not like this):
> Vielen Dank für Ihre Meldung! Um den Vorgang korrekt zu erfassen, benötige ich noch folgende Angaben: 1. Projektnummer 2. LV-Position 3. Datum der Ausführung 4. ...

## How we measure whether it is human (Woran wir messen, ob es menschlich ist)

These figures apply to the system as a whole, never per employee.

| Metric | Target (Annahme) |
|---|---|
| Fitter's messages until confirmation | median 2 (message plus „Passt“) |
| Follow-up questions per message | median 0, never more than 2 |
| Invented values (field filled, but not in the message) | 0 |
| Correctly assigned (project, location, work performed, quantity, effort, person who gave the instruction) | over 90 % of fields in the scenarios |
| Length of an agent reply | at most 5 lines, no paragraphs |
| Forbidden content (billability, law, judgement, "Claim") | 0 |
| Rating "sounds like a human who listens" by persona and rater | at least 4 out of 5 |

## Open (clarify with insider and real fitters) (Offen)

- „Du“ or „Sie“? Configurable per company?
- Should the agent say that a signed time-and-materials report (Regiebericht) is still missing for billing? Helps the money, but can come across as pressure.
- Does the agent also reply by voice note if the fitter only sends voice?
- Groups: many sites write in WhatsApp groups. Can and may the agent read along there? (unbelegt, technically and legally)
- How does someone without WhatsApp, or without any desire to use it, get the same route (upload link, Dossier v3 3.4)?
- Which languages besides German? Many people on Austrian construction sites have another first language (Annahme, share unverified).
