# backend: the database of tieout v2

Supabase project `tieout-app` (Frankfurt). Signed-in companies keep their decisions, tasks, settings of the Abläufe and files here instead of in one browser; the demo without sign-in stays in the browser as before. Amounts are never stored: `kern/` computes them in the browser from the decisions.

| Path | What |
|---|---|
| `migrations/` | SQL, applied once each in the Supabase SQL editor, in order; never changed after it was applied (a change is a new file) |
| `test/` | the rules of every migration played through in a local Postgres (PGlite) with stand-ins for Supabase's `auth` and `storage` (`supabase-stubs.sql`) |

`npm run check` runs typecheck, lint and tests; CI workflow `Backend` per pull request.

## Rules the database enforces

- **Data silo per company:** every row carries `firma_id`; members see only their own company. One company per account; members are invited by us, sign-up is off.
- **Append only:** signed-in users may read and add, never change or delete. The server sets company, person and time.
- **Decisions** follow the decision bar: one step at a time; "Prüfung" by the Abrechnung, "Freigabe" by the Geschäftsführung and never by the person who checked; "Nicht verrechnen" with a reason.
- **Files** in the private bucket `dateien`, at `<firma_id>/<id>` only, after their row with name, type, size and SHA-256; PDF, JPEG, PNG up to 20 MB; never overwritten.

Known limit: the earlier keys of a find (`fruehere_schluessel`) come from the browser, because the twin's sample data live in `kern/`, not in the database.
