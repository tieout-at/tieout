# backend: the database of tieout v2

Supabase project `tieout-app` (Frankfurt). Signed-in companies keep their decisions, tasks, settings of the Abläufe and files here instead of in one browser; the demo without sign-in stays in the browser as before. Amounts are never stored: `kern/` computes them in the browser from the decisions.

| Path | What |
|---|---|
| `migrations/` | SQL, applied once each in the Supabase SQL editor, in order; never changed after it was applied (a change is a new file) |
| `test/livetest.sql` | the same rules on the real project: run in the SQL editor, it takes everything back (28.10.2026: 26 of 26) |
| `test/` | the rules of every migration played through in a local Postgres (PGlite) with stand-ins for Supabase's `auth` and `storage` (`supabase-stubs.sql`) |

`npm run check` runs typecheck, lint and tests; CI workflow `Backend` per pull request.

## Rules the database enforces

- **Data silo per company:** every row carries `firma_id`; members see only their own company. One company per account; members are invited by us, sign-up is off.
- **Append only:** signed-in users may read and add, never change or delete. The server sets company, person and time.
- **Decisions** follow the decision bar: one step at a time; "Prüfung" by the Abrechnung, "Freigabe" by the Geschäftsführung and never by the person who checked; "Nicht verrechnen" with a reason.
- **Earlier keys** of the same work (a WhatsApp-Meldung that later got its Regiebericht) live in `fund_alias`, written by us only; the browser cannot pass another find off as an earlier key.
- **Files** in the private bucket `dateien`, at `<firma_id>/<id>` only, after their row with name, type, size and SHA-256, the project and (since `003_datei_beleg.sql`) the Beleg they belong to; PDF, JPEG, PNG up to 20 MB; never overwritten.

`005_eingang.sql` (step 14): a signature that came back, appended; Abrechnung or Bauleitung enter it, a new entry needs a stored file at this Beleg of the own company.

Known limits, decided on purpose:

- Name, type, size and SHA-256 of a file are what the browser computed before the upload; the app says so. A check on the server (an Edge Function reading the stored file) comes before real data.
- Only members write. The service role and the postgres role cannot add decisions either (no `auth.uid()`), so a server job or the WhatsApp agent will need a deliberate way in when it comes.
- Uploads never set `upsert`: there is no update policy, so a second upload to the same place is refused.
- A member may ask Storage for a signed address of a file of the own company with any lifetime; such an address keeps working after the member leaves the company. The app asks for ten minutes. A short limit on the server comes with the server check of files.
- Sign-in links are used once: a mail scanner that opens links (as some company mail systems do) can use one up before the person clicks it. With own SMTP, before the first external user, we look at a code to type in instead of a link.
- The page orders decisions by their minute, the database by the order they passed its check; in the hour the clocks go back in autumn the two can differ for a find decided twice within that hour.
- If an upload breaks off after its row was added, the row stays without a file (append only); the original viewer says so and the file is uploaded again under a new row.
- `agent/worker/supabase.sql` (v1, not applied) still reads the company from the token (`app_metadata.firma`); when the agent is switched on it moves to `mitglied`. Both files apply side by side (tested).
