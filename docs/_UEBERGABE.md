# Handover: step 10, Backend, parts D to F

**As of:** Wednesday, 28 October 2026, after parts A to C of step 10. Written by Claude for Maxi S.
**Folder:** open `C:\Users\maxis\dev\tieout` as the project in Claude Code. Strategy next to it in `../tieout-intern` (read only).
**Precondition:** the local branch `backend-10` with 7 commits (parts A to C, the last `f4381a8`), not pushed. Work on in this branch. `main` is at #129 (step 9 merged and live).

## Where step 10 stands

Read row 10 and the first open point of `docs/_STATUS.md`, then `backend/README.md`. In short:

- **Supabase** project `tieout-app` (ref `skvctanwhocirlmozmon`, Frankfurt, Free plan). Migrations `001_basis.sql` and `002_live.sql` applied in the SQL editor; a migration is never changed after it was applied, a change is a new file. Sign-up is off; Maxi S. invites every account himself (Authentication, Users, "Add user", "Send invitation"), Claude then adds the row in `mitglied` (name, roles, company) in the SQL editor. Claude never creates accounts and never types a password or key.
- **Company today:** "Testfirma A" with Maxi S.'s two accounts, one as Abrechnung ("Maximilian Seipl"), one as Geschäftsführung ("Maxi S. Zweitkonto"). Their e-mail addresses are not written in this public repository. F2 carries two test decisions (geprüft 14:32, freigegeben 14:41); they stay, history is append only.
- **App:** `app/src/lib/account.ts` (sign-in and account), `app/src/lib/server-store.ts` (lists of the company, live channel), `app/src/lib/decisions.ts` (asks the server store first, else the browser as before), `components/shell/server-notice.tsx` ("Nicht gespeichert." with the reason), `components/shell/saved-where.tsx`. Local check of the build with an account: launch name `app-build-anmeldung` (port 3100, in the redirect list of Supabase).
- **Checked live 28.10.:** sign-in, members, a check by the Abrechnung stored with the server's name and time, a release by the Abrechnung refused, the release by the Geschäftsführung live on the other screen after about 2 s. The second account acted in the SQL editor with its own rights (see `backend/test/livetest.sql` for the pattern), not by a click in its own browser.

## Steps

1. **Part D, roles in the interface.** The decision bar, the board and the task modal offer only what the signed-in person's roles allow (Abrechnung checks, takes up again and sets "Nicht verrechnen"; Geschäftsführung releases; nobody releases what they checked), and say why a step is not theirs instead of letting the database refuse it. The Verlauf shows the person and the role (`whoText` already gives "Maximilian Seipl (Abrechnung)"); the comment on `Decision.wer` in `decisions.ts` still says "never a person's name" and must follow. The database's refusal "Von geprueft geht es nicht zu …" names the raw state words: say it in the app's words (`DECISION_TEXT`). A reason per correction ("17,00 h auf 12,00 h, laut Stundenzettel") in the Verlauf of a field: in the sample data of `kern/`, no amount may change (amount audit before and after). Without an account everything stays as today (the demo shows the roles as words, not persons).
2. **Part E, one file with its source.** Upload one PDF, JPEG or PNG (up to 20 MB) to a Beleg of the company: first the row in `datei` (the trigger sets id and path `<firma_id>/<id>`), then the file to the bucket `dateien` at that path, never with `upsert`. SHA-256, size and type are computed in the browser and the page says so (a check on the server comes before real data, `backend/README.md`). The original viewer opens the stored file by a signed address, with name, who uploaded it and when. Synthetic files only.
3. **Part F, finish.** A bug review and a security review of the whole diff of `backend-10` against `main` by an independent reviewer (access per company, input checks, the live channel, the sign-in redirect, what the publishable key allows), every finding re-measured and fixed. A second company ("Testfirma B", one more invitation by Maxi S.) to show the silo live: its member sees none of Testfirma A's rows, also not on the live channel. Speed: today each page is 4.5 KB heavier (compressed) than `main`; check again with D and E. Amount audit against the live app, check green, screens at 1440 and 390 px, the short customer test with the three roles (with an account and without). Then push, pull request, Cloudflare preview (its address `*-app.tieout.workers.dev` is in the redirect list), merge and the live check, each with the go of Maxi S. Then `_STATUS.md` and this file for step 11.

## Good to know

- **E-mail limit:** the built-in e-mail of Supabase sends only a few links an hour, and only to team members. Plan a test so that it needs at most two links an hour; the app says "Gerade gehen keine E-Mails mehr hinaus. Bitte in einer Stunde noch einmal." when it is used up. An invitation link lives one hour. Own SMTP comes before the first external user (a new service: proposal and go first).
- **Two persons at once:** one browser keeps one session per address. Use Maxi S.'s Edge for one account and the built-in browser pane for the other, or one account in the SQL editor with its own rights.
- **Deleting an account** in Supabase deletes its row in `mitglied` too; after a new invitation the row must be added again.
- **The demo stays apart:** decisions made without an account stay in the browser and never show under a company (checked on F2).
- **Unicode in SQL:** the Edit and Write tools and the browser turned `\u200e` and similar escapes into the invisible characters themselves. Write such SQL with a script that builds the backslash (`String.fromCharCode(92)`), and compare the SHA-256 of the file before running it in the SQL editor.
- **Supabase SQL editor:** a "Leave site?" dialog blocks navigation when a query is unsaved; open a new tab instead. Text goes in with `monaco.editor.getModels()[0].setValue(...)`, the button "Run" runs it, results are read from the grid cells.
- **Abläufe fix** (hand tool moves blocks, blue outline on a chosen block): built in its own session on the branch `claude/ablaeufe-hand-c49fd2`, waiting there for the go of Maxi S.; it touches `app/src/components/ablauf/`, so merge it before or after `backend-10` and check that both still work together.
- Later, not in this step: a server job or the WhatsApp agent needs a deliberate way to write (today only members write); delete the two old `schlusswerk-demo` addresses from the redirect list (go).

## Decisions waiting for Maxi S.

- From 8e: a figure "sicher verrechenbar" and a hint "davon noch nicht freigegeben" at the Restforderung.
- From 8d: project status colours, the red mark at the Bauschadensumlage, the thin bars on the Übersicht, the dates of the Nachträge N1 to N3.
- Committing the report of customer test 5 in `../tieout-intern` (local file, see `_STATUS.md`).

## Done when

- One find checked by the Abrechnung and released by the Geschäftsführung, each by a click in their own browser, visible to both; two companies see only their own data; one file uploaded with its source and opened from the original viewer; the interface offers each person only their steps; the demo without sign-in works as before; amounts unchanged; check, backend tests and amount audit green; bug, security and speed review passed; merged and checked live with the go of Maxi S.
- `_STATUS.md` updated, this file rewritten for step 11.

## Start prompt for the next chat (copy into a new chat in `C:\Users\maxis\dev\tieout`)

> Ich bin Maxi S. Schritt 10, Backend, Teile D bis F. Lies `CLAUDE.md` und `docs/_UEBERGABE.md`, arbeite auf dem lokalen Branch `backend-10` weiter. Sag mir vor jedem Teil in zwei Sätzen, was passiert, und hol dir mein Go vor allem, was nach außen geht (Push, Merge, Cloudflare, Supabase, neue Dienste). Konten lege ich selbst an. Beträge nur aus dem Kern. Deutsch, einfach, Ergebnis zuerst.
