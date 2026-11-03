# Handover (Übergabe)

This file is the memory between sessions. Overwrite it at the end of every session, do not append.

**Status:** 3.11.2026 (paths and integration updated for v2; code unchanged since 23.10.2026)
**Phase:** 1 Core and simulator done; next are phase 2 (voice and photo) or phase 3 (real number), and the integration into v2 as step 21 of `../docs/_STATUS.md`.

## Where it stands (Stand)

- The agent understands a typed message (real run on 30.10.2026: every field right, about 10 s per reply). Tests and scenario checks are green and run in CI (`.github/workflows/agent.yml`).
- It has no WhatsApp number, no voice, no photo yet, and knows only its own small sample company (`src/firma.ts`, Haustechnik Beispiel GmbH with Wien 21 and four more projects).
- The v2 app does not use it yet. `worker/route.ts` is the route the v1 app used (archived under the tag `v1-archiv`); it is the starting point for step 21 (`PLAN.md`, section Integration).
- `npm run app-server` (`worker/lokal.ts`) still reads the company file of the v1 app and only runs on the branch `v1`.

## What is in the folder (Inhalt)

| Path | What |
|---|---|
| `src/typen.ts` | data model: message, item with quote, entry, work event with version |
| `src/verstehen.ts`, `src/ki.ts`, `src/llm.ts` | the AI reads intent and items (Claude Opus 5.5, structured output); `llm.ts` loads `.env` and chooses API or subscription (Node only) |
| `src/agent.ts`, `src/texte.ts` | conversation control as fixed code and all sentences of the agent as fixed text |
| `src/belege.ts` | an item without a literal quote from the message is discarded |
| `src/speicher.ts`, `src/speicher-datei.ts` | storage interface; file storage for Node |
| `src/lernschleife.ts`, `scripts/` | learning loop: persona plays the sender, checks in code, a second model rates |
| `szenarien/` | 50 visible scenarios; `szenarien/zurueck/` holds 10 held back (do not read, only `npm run lauf -- --zurueck` at acceptance) |
| `sim/` | simulator: chat on the left, office view with quotes on the right |
| `worker/` | route for an app worker, its tests, the counter tables for Supabase |

## Commands (Befehle)

```
cd agent
npm ci
npm run typecheck
npm test
npm run szenarien:pruefen
npm run lauf -- --ohne-bewerter
npm run lauf
npm run sim
```

`npm run sim` opens http://localhost:4321. The AI runs with `ZURUF_KI=api` (key `ANTHROPIC_API_KEY`) or `ZURUF_KI=abo` (one's own Claude subscription via `claude -p`, only for development). Both go into `agent/.env`, template `.env.example`. Never commit the key.

## State of the learning loop (Stand der Lernschleife)

| Run | Passed | Rating median / min | Invented | Fields correct |
|---|---|---|---|---|
| 1 visible | 28/30 | 4 / 1 | 1 | 99 % |
| 2 visible | 25/30 | 4 / 2 | 0 | 97 % |
| 3 visible | 30/30 | 5 / 3 | 0 | 100 % |
| Acceptance 1 held back | 6/10 | 3.5 / 2 | 1 | 95 % |
| 4 visible, subscription | 47/50 | 4.5 / 2 | 0 | 99 % |
| Acceptance 2 held back, subscription | 9/10 | 4 / 2 | 0 | 98 % |

Acceptance 1 found the most serious bug so far: data loss on addendum plus correction (`LERNEN.md` A1, A2), fixed with tests. 33 learning points in `LERNEN.md`.

## Next step (Nächster Schritt)

1. Have the two weak cases of acceptance 2 (`laerm_bruchstueck` failed, `mehrere_punkte` rating 2) analysed only abstractly by a subagent (`npm run lauf -- --zurueck --mit-protokoll`); then move the holdout `h2-*` to the visible ones and have a fresh `h3-*` written.
2. Fixes, full run over the visible ones, acceptance 3.
3. Phase 2 (voice and photo) or phase 3 (real number), decided by the team.
4. Step 21: the agent in the v2 app (`PLAN.md`, section Integration).

## Open questions (Offene Fragen)

- Response time: about 10 s per message is rather long for WhatsApp (Annahme). Check effort and prompt length; a faster model only with a go from the team.
- The questions in `GESTALTUNG.md`, section Offen.
