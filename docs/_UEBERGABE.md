# Handover: after step 10, before step 11

**As of:** Wednesday, 28 October 2026, after parts D to F of step 10. Written by Claude for Maxi S.
**Folder:** open `C:\Users\maxis\dev\tieout` as the project in Claude Code. Strategy next to it in `../tieout-intern` (read only).
**Precondition:** step 10 is merged into `main` and live (check row 10 of `docs/_STATUS.md`; if the pull request of `backend-10` is still open, finish it first: Cloudflare preview, merge, live check, each with the go of Maxi S.).

## Where things stand

- The app at https://app.tieout.workers.dev has sign-in for companies (`/anmelden/`), and without sign-in the demo with the sample data as before. With an account, decisions, tasks, ticks, settings of the Abläufe and files live in the company's database at Supabase (`backend/README.md`), live for every member, and the interface offers each person only the steps of their roles.
- **Supabase** project `tieout-app` (Frankfurt, Free plan), migrations 001 to 004 applied. "Testfirma A" with two accounts of Maxi S. (Abrechnung; Geschäftsführung), "Testfirma B" with a third (both roles). Their e-mail addresses are not written in this public repository. Maxi S. invites every account himself; Claude adds the row in `mitglied` in the SQL editor and never creates accounts or types a password or key.
- **Checked:** two companies see only their own rows, in the database and on the live channel (with a counter check); four eyes; one synthetic PDF stored and opened as "unverändert"; amounts unchanged.

- **Launch film done (30.10.):** in `website/public/film/` (#134), Maxi D. builds it into the website; nothing to do in `app/`.

## What comes next

Step 11 ("Frag tieout") starts only after a team go (`_STATUS.md`). Until then, or before it, these are the candidates; Maxi S. picks one per chat:

1. **Before the first real customer** (each a proposal with a go, some cost money or add a service): Supabase plan, AVV with Supabase, own SMTP and maybe a code instead of a link, a check of stored files on the server, short-lived signed addresses. Real data only after the legal clearance and the works council (CLAUDE.md rule 4).
2. **Small fixes from the customer test of step 10** (open point "Step 10" in `_STATUS.md`): Stundenzettel head and unit, wording "korrigierte E-Mail", clickable Verlauf, the Abhilfe link of F1, a notice for the Geschäftsführung, the scan next to a correction.
3. **Decisions waiting for Maxi S.** (below).

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

> Ich bin Maxi S. Lies `CLAUDE.md`, `docs/_UEBERGABE.md` und `docs/_STATUS.md`. Schritt 10 ist fertig. Sag mir in zwei Sätzen, was als Nächstes am meisten bringt, und hol dir mein Go vor allem, was nach außen geht. Deutsch, einfach, Ergebnis zuerst.
