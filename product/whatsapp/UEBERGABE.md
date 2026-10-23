# Handover (Übergabe)

This file is the memory between sessions and Claude accounts. Overwrite it at the end of every session, do not append.

**Status:** 22.10.2026, late
**Branch:** `claude/zuruf-einbau-9345a1` (integration into the app), `zuruf/plan` is merged (PR #25)
**Phase:** 1 Core and simulator, integration into the app behind the switch `ZURUF_ECHT` (off)

## Integration into the app (go from Maxi S. 22.10.) (Einbau in die App)

- Route `POST /api/zuruf/nachricht` and `GET /api/zuruf/status` in `worker/route.ts`: switch read at runtime, 40 AI calls per day and 20 US dollars per month (actual cost per reply, `antwortKostenUsd` in ki.ts), time in Vienna local time, conversation state comes from the browser and goes back updated. Tests in `worker/route.test.ts`.
- Local: `npm run app-server` (port 3103, AI according to `ZURUF_KI`, company from `../app/data/generated/agent-firma.json`, run `npm run generate` in `product/app` first). For the app, `product/app/.env.local` with `NEXT_PUBLIC_ZURUF_API=http://localhost:3103/api/zuruf` (the local server always reports itself as available).
- Online: hooked into `product/app/worker/index.ts` (without login before the assets, with login after the session; `zurufAnfrage`), `nodejs_compat` in `wrangler.jsonc`, counter in Supabase (`worker/supabase.sql`: table `zuruf_tageszaehler`, functions `zuruf_stand`, `zuruf_buche`). If the table, the secret `ANTHROPIC_API_KEY` or `ZURUF_ECHT=an` (secret, read at runtime) is missing, the status reports "not available" („nicht verfügbar“) and the app plays the staged scene. Online off until a go from Maxi S.
- The app installs this package as well (`postinstall` in `product/app/package.json`), so that the worker bundle and type check find `zod` and the SDK.
- Node only, never in worker or browser: `src/llm.ts` (subscription, .env), `src/speicher-datei.ts` (JSONL). Runs everywhere: `src/ki.ts`, `src/agent.ts`, `src/speicher.ts`, `worker/route.ts` (checked bundled: no `node:` imports; with the SDK in the worker 289 KiB gzip).
- Real run 23.10. (subscription, local): „21er Stiege 3 Top 18, Waschtisch im Bad versetzt, Fliesen kommen anders, Bauleiter vom GU hat angschafft, zu zweit vier Stunden“ was fully recognised (location, work performed, reason, 2 people, 4 hours, instructing person), after „Passt“ Z7 in timeline, "open" („offen“) list and evidence page. On Windows, `llm.ts` now takes the native installation first (`%USERPROFILE%.localinclaude.exe`); an older version in the PATH had an expired login.
- The app's browser code only imports types from this package (`src/typen.ts`, `src/firma.ts`); only the app's worker uses `worker/route.ts`. Own CI: `.github/workflows/produkt-whatsapp.yml`.
- Next step: storage B in Supabase (`worker/supabase.sql`, table `zuruf_ereignis`, append only, RLS per company via `app_metadata.firma`) instead of browser storage, with the same interface `MeldungAblage`.

## Done (Erledigt)

- Phase 0: folder, rules, design, plan. Anthropic API key is in `product/whatsapp/.env` (ignored), test successful.
- Package `product/whatsapp/` (TypeScript, Node 22, Vitest, `@anthropic-ai/sdk`, `zod`).
- `src/typen.ts` data model (message, item with quote, entry, work event with version).
- `src/firma.ts` small synthetic company twin (5 projects, Wien 21 and Wien 10 deliberately easy to confuse, Tulln closed).
- `src/belege.ts` evidence check: an item without a literal quote is discarded. Tests in `belege.test.ts`.
- `src/verstehen.ts` AI reads intent and items (Claude Opus 5.5, effort low, structured output, fallback "default").
- `src/agent.ts` conversation control as fixed code (consent, stop, at most 2 follow-up questions, project by button, instructing person only for additional work, summary, correction as a new version, end of day files open items as unconfirmed). Tests in `agent.test.ts` (11 cases, AI replaced by fixed answers).
- `src/texte.ts` all of the agent's sentences as fixed text.
- `src/lernschleife.ts` + `scripts/lauf.ts`: persona plays the sender, checks in code, rater score 1 to 5, report in `laeufe/` (ignored).
- Scenarios: 30 visible in `szenarien/`, 10 held back in `szenarien/zurueck/` (do not read, only `npm run lauf -- --zurueck` at acceptance).
- `sim/` simulator: `npm run sim`, then http://localhost:4321. Chat on the left, office view with quotes on the right.

## Commands (Befehle)

```powershell
cd product/whatsapp
npm ci
npm run typecheck
npm test
npm run szenarien:pruefen
npm run lauf -- --ohne-bewerter
npm run lauf
npm run sim
npm run app-server
```

## State of the learning loop (Stand der Lernschleife)

| Run | Passed | Rating median / min | Invented | Fields correct | Cost |
|---|---|---|---|---|---|
| 1 visible | 28/30 | 4 / 1 | 1 | 99 % | 1.64 USD |
| 2 visible | 25/30 | 4 / 2 | 0 | 97 % | 1.62 USD |
| 3 visible | 30/30 | 5 / 3 | 0 | 100 % | 1.45 USD |
| Acceptance 1 held back | 6/10 | 3.5 / 2 | 1 | 95 % | 0.84 USD |
| 4 visible, API (aborted) | 30/32 | 5 / 3 | 1 | 100 % | 2.04 USD |
| 4 visible, subscription | 47/50 | 4.5 / 2 | 0 | 99 % | subscription |
| Acceptance 2 held back, subscription | 9/10 | 4 / 2 | 0 | 98 % | subscription |

API credit has been used up since run 4 (approx. 9 USD spent). Since then everything runs via the Claude subscription (`ZURUF_KI=abo`). After run 4 (subscription), L17 was fixed (bundle lost the first part of the report).

Acceptance 1 found the most serious bug so far: data loss on addendum plus correction (LERNEN.md A1, A2). Fixed, with tests. The old holdout is used up and now sits visibly as `szenarien/z-*.json`. Fresh holdout: `szenarien/zurueck/h2-*.json` (do not read).

33 learning points in `LERNEN.md`. 42 unit tests green (`agent.test.ts`, `belege.test.ts`, `abnahme1.test.ts`). 60 scenarios (50 visible, 10 held back).

## AI via subscription or API (KI über Abo oder API)

`product/whatsapp/.env` contains `ZURUF_KI=abo`: agent, persona and rater run via Claude Code with the Claude subscription (`claude` must be logged in, `claude auth status`). Costs no API credit, but counts against the subscription limit and is slower (approx. 5 to 16 s per reply instead of 2.5 s). A run over 4 scenarios took 1:13 min, so over 50 scenarios roughly 15 to 20 min and approx. 200 calls. With `ZURUF_KI=api` everything runs via the API key again (credit was used up on 22.10.). On another account: log in to `claude` there, then that account's subscription applies.

## Simulator

Chat in WhatsApp style (light and dark), sender via a row of buttons, office view with source per entry. Start: `npm run sim`, then http://localhost:4321. Restart after code changes (the page itself reloads without a restart).

## Next step (Nächster Schritt)

1. Have the two weak cases from acceptance 2 (laerm_bruchstueck failed, mehrere_punkte rating 2) analysed only abstractly: subagent with `npm run lauf -- --zurueck --mit-protokoll`, the main session does not read the transcript. Then move holdout `h2-*` to the visible ones and have a fresh `h3-*` written.
2. Fixes, full run over the visible ones, acceptance 3.
3. Open from A10: collection window in the WhatsApp channel (phase 3).
4. Then phase 2 (voice and photo) or phase 3 (real number), decision by the team.

## Open questions (Offene Fragen)

- Response time: first trial run 9.5 seconds per message. Rather too long for WhatsApp (Annahme). Check: effort, shorten prompt, faster model only with a go from the human.
- Build split and time budget alongside the MVP v0.9 (Sunday meeting 25.10.).
- Questions from `GESTALTUNG.md`, section Offen.

## For a new session or a new account (Für eine neue Sitzung oder einen neuen Account)

1. Fetch the branch. Windows PowerShell 5.1 does not know `&&`, so run commands individually or with `;` and `if ($?)`:

   ```powershell
   git fetch origin; if ($?) { git checkout zuruf/plan }
   ```

   On a computer without the repo, first `git clone https://github.com/schlusswerk/schlusswerk.git`, then `cd schlusswerk`. In Git Bash, on Mac and Linux, `git fetch origin && git checkout zuruf/plan` also works.

2. Start Claude Code in the repo and write: „Lies `product/whatsapp/CLAUDE.md` und `product/whatsapp/UEBERGABE.md` und mach beim nächsten Schritt weiter.“ (Read `product/whatsapp/CLAUDE.md` and `product/whatsapp/UEBERGABE.md` and continue with the next step.)

3. On a new computer you need `product/whatsapp/.env` with `ANTHROPIC_API_KEY=` (template `.env.example`). Never commit the key.
