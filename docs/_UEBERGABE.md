# Handover: after step 10, on to step 13

**As of:** Friday, 30 October 2026. Written by Claude for Maxi S.
**Folder:** open `C:\Users\maxis\dev\tieout` as the project in Claude Code. Strategy next to it in `../tieout-intern` (read only).
**Precondition:** the plan from step 13 is in `docs/_STATUS.md` (section "Plan from step 13", steps 13 to 21). Read its four rules before building: they keep the product transferable to a stranger's setup.

## Where things stand

- The app at https://app.tieout.workers.dev has sign-in for companies (`/anmelden/`), and without sign-in the demo with the sample data as before. With an account, decisions, tasks, ticks, settings of the Abläufe and files live in the company's database at Supabase (`backend/README.md`), live for every member, and the interface offers each person only the steps of their roles.
- **Supabase** project `tieout-app` (Frankfurt, Free plan), migrations 001 to 004 applied. "Testfirma A" with two accounts of Maxi S. (Abrechnung; Geschäftsführung), "Testfirma B" with a third (both roles). Their e-mail addresses are not written in this public repository. Maxi S. invites every account himself; Claude adds the row in `mitglied` in the SQL editor and never creates accounts or types a password or key.
- **Checked:** two companies see only their own rows, in the database and on the live channel (with a counter check); four eyes; one synthetic PDF stored and opened as "unverändert"; amounts unchanged.

- **Launch film done (30.10.):** in `website/public/film/` (#134), Maxi D. builds it into the website; nothing to do in `app/`.

## What comes next

Step 13 (Echter Ordner) is next, then the steps in the order of `_STATUS.md`. Step 11 ("Frag tieout") stays behind a team go. The first draft board of step 13 is local: `app/qa-shots/entwurf/ordner/board.html` (Aufmaßblatt 12 as a scan, plan comparison index C to D, the scan moving with the calculation path of F1). It uses the handwriting font from Google Fonts as a draft; the product serves its fonts itself.

- **Moved into the plan:** the small fixes from the customer test of step 10 go into step 14; the points before the first real customer (Supabase plan, AVV, own e-mail sending, a check of stored files on the server, short-lived signed addresses) go into steps 16 and 19. Real data only after the legal clearance and the works council (CLAUDE.md rule 4).
- **Before the first meeting with a real construction professional:** rehearse the click path of `SPEZIFIKATION.md` 7.3 against the app as it is, and cut the open questions (section 9 there and `Demo_Faelle.md`) to at most ten. No date or name is written down yet.
- **The agent, measured on 30.10.:** understands a typed message (one real run, every field right, 10 s, tests and scenarios green). It has no WhatsApp, no voice, no photo, no link to the v2 app, and knows only the old sample company; `agent/UEBERGABE.md` is out of date. Step 21. It belongs to Santino, so he hears before anything changes there.
- **Decisions waiting for Maxi S.** (below).

## Good to know

- **Local check with an account:** launch name `app-build-anmeldung` (port 3100, serves `app/out`; build first). The app may stop it when idle; start it again before a sign-in link is clicked.
- **E-mail limit:** a few links an hour, and an invitation link lives one hour. Plan a test with at most two links an hour.
- **Two persons at once:** one browser keeps one session per address. The second person acts in the SQL editor with its own rights (pattern in `backend/test/livetest.sql`), or in a second browser.
- **Supabase SQL editor:** text goes in with `monaco.editor.getModels()[0].setValue(...)`, "Run" runs it. A "Leave site?" dialog blocks navigation when a query is unsaved; open a new tab. Unicode escapes in SQL: build the backslash in a script (`String.fromCharCode(92)`) and compare the SHA-256 before running.
- **Test data in Supabase stay** (append only): decisions on F1 and F2 of A, one file of A, F1 checked in B.
- A server job or the WhatsApp agent needs a deliberate way to write (today only members write).

## Decisions waiting for Maxi S.

- Supabase plan before the first real customer (price in `../tieout-intern`, not here).
- From 8e: a figure "sicher verrechenbar" and a hint "davon noch nicht freigegeben" at the Restforderung.
- From 8d: project status colours, the red mark at the Bauschadensumlage, the thin bars on the Übersicht, the dates of the Nachträge N1 to N3.
- Committing the report of customer test 5 in `../tieout-intern`.

## Start prompt for the next chat (copy into a new chat in `C:\Users\maxis\dev\tieout`)

> Ich bin Maxi S. Lies `CLAUDE.md`, `docs/_UEBERGABE.md` und `docs/_STATUS.md`, dort den Abschnitt „Plan from step 13“. Mach mit Schritt 13 weiter und hol dir mein Go vor allem, was nach außen geht. Deutsch, einfach, Ergebnis zuerst.
