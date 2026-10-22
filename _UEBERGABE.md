# Handover for the next chat (product app)

**As of:** Friday, 23 October 2026. Written by Claude for Maxi S. The GitHub repository is now `tieout-at/tieout` (the old address redirects).
**Read first:** `CLAUDE.md`, `_STATUS.md`, `product/README.md`, `product/app/CLAUDE.md`, `product/app/src/ui/README.md`. Then this file. Documentation is in English, conversations with the team in German (CLAUDE.md rule 1).

## 1. Where we stand

App **tieout** (lower case, no dot) on `main`, online and **open** at **https://app.tieout.workers.dev** (final address, it is in the submission email to the jury, 23.10.). Cloudflare Access now only protects the branch preview addresses ("Previews only"). Every merge to main is visible to the jury after 2 to 3 minutes, so check in the browser after every merge. Do not rename the worker or the subdomain and do not move it to another Cloudflare account, otherwise the address changes. A failed Cloudflare build keeps the last working version online.

Built and merged on 22./23.10.:

| What | PR |
|---|---|
| Brand tieout: logo and wordmark in the sidebar (`src/ui/Logo.tsx`, same geometry as the website), accent ultramarine #1D3BFF. Greys, background and dark mode deliberately unchanged | #41, #49 |
| Voice note agent (Zuruf-Agent) by Santino, package `product/zuruf` | #25 |
| Remaining review items: mobile, calculation as a table, key figures without a box, one page title size, count "x of 14" | #48 |
| Settings page (theme, reset approvals) instead of "Demo zurücksetzen". Sign-in with Supabase finished but switched off | #49 |
| Mobile: project stays in the path, top bar fades out on the right | #51 |
| Worker renamed `app`, account subdomain `tieout` | #54 |
| Collapsible groups in company list, findings and ledger (Linear "Group by"), columns stay fixed | #56 |
| Voice note agent in the app behind the switch `ZURUF_ECHT` (default off): real chat instead of the scripted scene, new voice notes without amount in timeline and "open" list, storage in the browser, limits 40 AI calls per day and 20 USD per month. Z6 now reads as in the solution list. One real voice note already ran locally via the Claude subscription | #50 |
| Speed: filter and search in ledger and matrix 32 to 72 ms instead of 88 to 176 ms (measured by the session), pixel-identical | #59 |
| Next.js 16.4.2 (security update); only `uuid` (moderate, via exceljs) remains | #63 |
| Project links with trailing slash (no 307 redirect) | #68 |

**Final review 23.10.** (independent reviewer on the live address, result checked by the main chat): no must-fix finding. 297 internal addresses fetched, no 404. All amounts on the start page, the 8 project pages, the finding lists and 21 finding pages match `Demo_Faelle.md` to the cent. On all 284 pages no "·", no dash, no "Claim", no placeholder; "Synthetisch" everywhere, `noindex` everywhere. Screenshots light, dark and 600 px without errors. Open points for the UI pass and v1.0:
- **Cascade and pre-check** (remaining claim 170,060.89 €, performance total, payments, deductions G1 to G4) appear on no page. Done in the calculation core, the screen follows in v1.0. The demo script needs it.
- **Ledger at 600 px:** only 5 of 9 columns visible, the rest by swiping (right edge fades out). Consider a narrow mobile version.
- **Start page P6 to P8:** traffic light and date deliberately empty (submitted or closed, meaning in the group header). Check whether "gelegt 15.09." helps there.
- **V1 container 1,180.00 €:** calculation "Lohn 16 h × 56,80 € + Material 271,20 €" is not in the solution list (total matches). Clarify the source or shorten the calculation; the solution list changes only with Maxi S.'s go. Slug `anmeldung-…` does not fit "Verloren".
- **P2 to P5:** payments exactly equal the partial invoices, without discount or retention (unlike W21). The solution list does not cover it, only noticeable on plausibility.
- **GC history** ("same reason already in P7") from v1.0 according to the solution list.

## 2. Tasks for the next chat

1. **Razor-sharp UI pass** (Maxi S. enters the points himself). **Since 23.10. evening: all points, order and status in `product/docs/UI_Runde_1.md`. Read that first.** First, in parallel where it makes sense. Rules from section 5 apply. The app is live for the jury: merge only with green CI and check in the browser after each merge.
2. **API key and voice note agent online** (goal: anyone with the link can try the real agent, budget at most 25 €):
   - Maxi S. creates a key "tieout" in console.anthropic.com, tops up credit and sets the monthly limit just under 25 € (the console uses US dollars). Claude writes a click guide; paying and entering the key is done by Maxi S.
   - Supabase SQL editor: run `product/zuruf/worker/supabase.sql` (part 1, the counter, is required). Claude may run SQL itself (permission Maxi S.), then verify with a read query.
   - Cloudflare, worker `app`, Settings, Variables and Secrets, all as secrets: `SUPABASE_SECRET_KEY` (secret key of `tieout-app`), `ANTHROPIC_API_KEY`, finally `ZURUF_ECHT` = `an` (with go).
   - Check: `https://app.tieout.workers.dev/api/zuruf/status` returns `{"verfuegbar":true}`, the button in the W21 timeline reads "Zuruf schicken". Limits in code: 40 AI calls per day, 20 USD per month, then silently back to the scripted scene.
3. **Plan the launch video** (details from Maxi S.). The video may show more than is built; mark what the app lacks as an outlook in the video, because the jury clicks through the app afterwards.

## 3. Good to know

- **Supabase:** project `tieout-app` (organisation `tieout`, Frankfurt, Free, ref `skvctanwhocirlmozmon`), sign-ups disabled, site URL and redirects on `app.tieout.workers.dev`. No tables yet apart from those in `supabase.sql`. For this the project `icons` was paused (Free allows 2 active projects). Free pauses after about a week without use; then set up a daily ping. Default emails only go to members of the organisation and at most 2 per hour; emails to customers need their own sending with the domain tieout.at.
- **Sign-in** is finished but off (`ANMELDUNG_EIN = false` in `product/app/src/anmeldung/konfig.ts`) because the jury and investors should get in by link. To switch on: set the switch to `true`, set the secret `SUPABASE_SECRET_KEY`, invite people in the settings (sign-in link to pass on). Google sign-in is started (Google Cloud project `tieout-login`, consent screen done, OAuth client missing), only needed when sign-in is switched on again.
- **A database for documents and photos** is not needed for the demo (synthetic data, generated at build time). Only for real companies (after gate R4 and works council): tables per company with RLS, photos in Supabase Storage.
- **Domain app.tieout.at:** only possible once the zone tieout.at is in the same Cloudflare account as the app (today account of Maxi D., app in the account of Maxi S.). Clarify with Maxi D.: shared account or move. Add it as an extra domain; the workers.dev address must keep working (it is in the jury email).
- **Claude Code locally:** for the voice note agent with the subscription (`ZURUF_KI=abo`), `claude` must be signed in. The new version is in `C:\Users\maxis\.local\bin`.

## 4. How to work in parallel

Proven on 22./23.10.: the main chat handles shared files (`tokens.css`, `bauteile.css`, `layout.tsx`, `Seitenleiste.tsx`, `Zeilennavigation.tsx`, worker), merges and then starts sessions with their own worktree that only touch their files. Sessions do not merge themselves but report; the main chat merges one after another and checks after each merge. When main moves under a session, the main chat tells it exactly which files are affected.

Lessons: measuring sessions (speed) need a time limit in the brief, otherwise they measure for over an hour. Never run `npm ci` in the main checkout while another chat's dev server is running there (Windows locks a file, npm deletes node_modules and stops halfway); use a separate worktree for dependency changes.

## 5. Working practice that has proven itself

- **Per screen:** build, check in the browser (light, dark, 1440 px, narrow), fix, PR, merge yourself with green CI (permission Maxi S.).
- **Dev server:** `.claude/launch.json` (ignored), start with `preview_start` "app-dev". If a dev server from another chat already runs in this folder, use it; Next.js does not start a second one. Sessions in worktrees use their own ports (3102 and up).
- **Click tests in a real browser:** Claude in Chrome (Maxi's Edge) on `http://localhost:3100`, measure via JavaScript (column widths, visible rows).
- **Screenshots:** `node product/app/scripts/qa/shot.mjs <name> <url> <width,height> [dunkel]`, pixel comparison with `sharp`.
- **Package lock on Windows:** after `npm install` check that `npm ci --dry-run` is clean. npm on Windows drops Linux extras (`@emnapi/*`) from `package-lock.json`, then CI fails. Copy the missing entries from main.
- **Cloudflare:** worker `app`; access protection belongs to the worker (Access tab), not to the address.
- Rules that often apply: no "·" and no dashes in visible text, colours only from `tokens.css`, inline styles only for column widths (`fundament.test.ts`), amounts only from the calculation core, no totals computed in the UI, solution list only with go.

## 6. Start prompt for the new chat

> Ich bin Maxi S. Lies `_UEBERGABE.md` und die dort genannten Dateien, hol den neuesten Stand von main. Zuerst gehen wir haarscharf über die UI, die Punkte gebe ich dir gleich. Danach API-Schlüssel und Zuruf-Agent online (Abschnitt 2, Punkt 2), dann Launch-Video planen. Die App ist schon offen für die Juroren unter https://app.tieout.workers.dev: nur bei grüner CI mergen und nach jedem Merge im Browser prüfen. Profi-Niveau wie Linear, Attio, reebuild. Wenig Text, keine „·“ und keine Gedankenstriche. Beträge nur aus dem Rechenkern, die Lösungsliste ändert sich nur mit meinem Go. Kosten nur mit meinem Go. PRs bei grüner CI selbst mergen. Deutsch, einfach, Ergebnis zuerst.
