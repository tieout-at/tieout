# Handover for the next chat (product app)

**As of:** Thursday, 22 October 2026, late. Written by Claude for Maxi S.
**Read first:** `CLAUDE.md`, `_STATUS.md`, `product/README.md`, `product/app/CLAUDE.md`, `product/app/src/ui/README.md`. Then this file.

## 1. Where we stand

Demo on `main` and online (https://schlusswerk-demo.maximilian-seipl.workers.dev, access via email code). Built and merged late on 22.10. with four parallel sessions:

| What | PR |
|---|---|
| `anordnung.css` split into seven area files (`rahmen`, `marken`, `ablauf`, `tabellen`, `befund`, `beleg`, `zeitachse`), pixel-identical | #24 |
| Steps 1 to 4 on the project overview: columns on one line, the real number and a link per step; pre-check as a key figure; on the right a property list instead of boxes | #27 |
| Polish: no traffic-light dots in the sidebar, status only as a word, "Synthetisch" (synthetic) calm, evidence chain plain, approval bar does not jump, chat in scene and evidence page aligned the same way (fitter on the right) | #28 |
| Tables: one row height 36 px, header 32 px, fixed columns, nothing shifts (measured); matrix without "kein Beleg" (no evidence); ledger with "Nächste AR" (next partial invoice) | #29 |
| Central tokens for font sizes and table header, old styles deleted | #33 |
| Review findings: evidence chain without duplicates and sorted by date, group totals from the calculation core, links with trailing slash | #35 |

An independent reviewer then looked at everything: all amounts of the 8 projects match `product/docs/Demo_Faelle.md` to the cent, 313 links without 404, no "·", dashes or "Claim" in the visible text, no must-fix finding.

Website check (read only): `docs/archiv/Website_Check_2026-10-22.md`. Core, re-measured by the main chat: for "Projekt Wien 21" the website shows 5.546 € once and 27.410 € once, electrical items instead of HVAC/plumbing (HKLS), amounts that are not in `Demo_Faelle.md`, projects in Linz and Graz, "kein verdienter Euro vergessen" (no earned euro forgotten); the trust section is missing. The website belongs to Maxi D., changes there only after agreement in the team.

**Name and logo are set (22.10., Maxi S.): Tieout.**, domain tieout.at (not yet live). Logo as SVG already in `website/components/ui/Logo.tsx` (two plan corners in ink, square in ultramarine, word mark "Tieout" with an ultramarine full stop). The app is still called "Schlusswerk" and uses "H" as a placeholder mark.

## 2. Tasks from Maxi S. for the next chat

Order proposed by Claude. Goal afterwards: product ready for the launch video (details on that later from Maxi S.).

1. **Rebranding to Tieout. in the app:** mark at the top of the sidebar with the logo from `website/components/ui/Logo.tsx` (as a component in `src/ui/`, not copied and modified), page titles, visible texts, `product/README.md`. Internal names (repo, package `schlusswerk`) stay for now.
2. **Align the UI with the website, stay professional:** the website's CI is in `website/app/globals.css` (paper #F4F6F9, ink #0A1020, ultramarine #1D3BFF, font Inter Tight, mono IBM Plex Mono) and `website/STRUKTUR.md`. Change only in `tokens.css` and `bauteile.css` so that all screens follow. Open decision for Maxi S.: Maxi S. wanted a "white background", the website uses paper #F4F6F9. Proposal: content white, sidebar and header in paper, ink as text and primary button, ultramarine only as an accent (selection, links, highlighting). Before and after screenshots, light and dark.
3. **Professional link:** today `schlusswerk-demo.maximilian-seipl.workers.dev`. Proposal: `app.tieout.at` as the Worker's own domain as soon as tieout.at is on Cloudflare (then switch Cloudflare Access to the new address). Interim without a domain: renaming the Worker in `product/app/wrangler.jsonc` (e.g. `tieout-demo`) stays under `maximilian-seipl.workers.dev`, which is hardly better. Maxi S. does the steps in the Cloudflare dashboard himself; Claude prepares and writes the instructions. Externally visible, so only with a go-ahead.
4. **Smooth and fast:** measure first, then change. Load time and size per page (online and locally with `npm run build`), click times for filters in the ledger (380 rows) and in the matrix, switching between findings. Target and result as numbers before and after.
5. **Integrate Santino's voice note agent (Zuruf-Agent):** separate chat or separate session with the prompt in the appendix. Only after items 1 and 2, because the integration touches the scene and the timeline.
6. **Remainder from the review report** (should and could):
   - Mobile (600 px): company list shows only one amount column without a header, traffic light and date are missing; ledger cut off on the right without a hint; top bar cut off, project name missing in the path.
   - The calculation breakdown on the finding page does not match the other tables (37 px, no header, grey footer, amount sometimes centred, sometimes right-aligned).
   - Key figures look like a box (lines at top, bottom, dividers).
   - Title sizes inconsistent (project 20 px, finding and evidence 15 px).
   - "0 von 14 freigegeben" (0 of 14 approved) appears above "Zu entscheiden 15" (to decide 15) (the case "Braucht Anwalt" (needs a lawyer) only counts at the bottom).
   - The scene says "Danke. So habe ich es verstanden: …" (Thanks. This is how I understood it: …), the evidence page says the same thing in different wording.

## 3. Open, waiting for a go-ahead from Maxi S.

- Scene: the solution list says "Heizkörper im Wohnzimmer versetzt" (radiator in the living room moved), the app says "Heizkörper versetzt" (radiator moved) (field `taetigkeit` of Z6). Adjust either the record or the solution list.
- `npm run build` recommends a security update of Next.js (`next upgrade --agent=security`). Separate step.
- PR #25 (voice note agent, Santino): the Cloudflare check was red, cause not yet clarified. See appendix.

## 4. How to work in parallel

Proven on 22.10.: the main chat first does the shared files (`tokens.css`, `bauteile.css`, brand mark), merges, and then starts sessions with their own worktree that only touch their own files. Files per area are listed in `product/app/CLAUDE.md`. The sessions write requests for `tokens.css` and `bauteile.css` into their PR under "Für den Haupt-Chat" (for the main chat), the main chat collects them in one PR. The main chat merges one after another, checks after each merge, and at the end an independent reviewer checks.

Proposal for the next chat: first items 1 and 2 in the main chat (shared files). Then in parallel: voice note agent (appendix), speed (measurement, `next.config`, data access), remaining list from the review report (tables, finding, steps). Link (item 3) with Maxi S. in the main chat.

## 5. Working method that has proven itself

- **Flow per screen:** build, check in the browser (light, dark, 1440 px, narrow), fix, PR, merge yourself when CI is green (permission from Maxi S.).
- **Dev server:** `.claude/launch.json` (ignored) with `{"name":"app-dev","runtimeExecutable":"npm","runtimeArgs":["--prefix","product/app","run","dev","--","-p","3100"],"port":3100}`, start with `preview_start` "app-dev". Sessions in worktrees use their own ports (3101 and following).
- **`npm run build` overwrites the dev server's `.next`:** restart the dev server afterwards.
- **Screenshots:** `node product/app/scripts/qa/shot.mjs <name> <url> <breite,höhe> [dunkel]` (Edge headless, stored in `product/app/qa-shots/`, ignored). A pixel comparison with `sharp` (available in `node_modules`) shows exactly where something changes. The orange badge "1 Insight" at the bottom left is the Next.js developer tool, not the app.
- **Comparison for pure refactorings:** compare CSS rules with `postcss` before and after as a set, plus screenshots.
- **CI:** GitHub Actions "pruefen" plus Cloudflare preview per branch, both around 1 minute.
- Rules that often apply: no "·" and no dashes in the visible text, colours only from `tokens.css`, inline styles only for column widths (`fundament.test.ts`), amounts only from the calculation core, no totals in the interface.

## 6. Start prompt for the new chat

> I am Maxi S. Read `_UEBERGABE.md` and the files named there, fetch the latest state of main. Then work through section 2, in parallel as in section 4: first the rebranding to Tieout. and the alignment with the website in the main chat (show me the proposal for colours and background first), then start and orchestrate the sessions, the voice note agent with the prompt in the appendix. Professional level like Linear, Attio, reebuild, smooth and fast. Little text, no "·" and no dashes. Amounts only from the calculation core, the solution list changes only with my go-ahead. Nothing external (domain, Cloudflare, costs) without my go-ahead. Merge PRs yourself when CI is green. At the end, tell me honestly whether the product is ready for the launch video. German, simple, result first.

## Appendix: prompt for integrating the voice note agent (Santino, PR #25)

Revised by the main chat on 22.10. from Santino's version: clarify the Cloudflare check, five questions before the go-ahead (data model, server part, amounts, storage, costs), new style rules.

---

First read `CLAUDE.md` (repo root), `_UEBERGABE.md`, `product/app/CLAUDE.md`, then `product/zuruf/CLAUDE.md`, `product/zuruf/UEBERGABE.md` and `product/zuruf/PLAN.md` (section "Integration"). Fetch the latest state of main beforehand. German, simple, result first.

### Context

In pull request #25 (`zuruf/plan` into `main`), Santino built the prototype of the voice note agent (Zuruf-Agent), in its own folder `product/zuruf/`: a fitter reports via WhatsApp (here still a simulator) a photo, voice or text, the agent asks back at most twice, summarises, the sender confirms with "Passt" (fine), and a work event (Leistungsereignis) is stored in which every statement has a verbatim quote as its source. The AI only reads, the conversation flow is fixed code (`src/agent.ts`). 42 unit tests, learning loop with 50 scenarios, acceptance on held-back scenarios 9/10. The PR does not touch `product/app` and `product/docs`.

### Task 1: review and merge PR #25

1. `git fetch origin`, check out branch `zuruf/plan` in its own worktree. In `product/zuruf`: `npm ci`, `npm run typecheck`, `npm test` (must be green, needs no AI).
2. Check that the PR changes nothing outside `product/zuruf/` (except one line in `_STATUS.md`) and contains no `.env`, keys or real data (not even in the branch's Git history).
3. The Cloudflare check "Workers Builds" was red on #25 (as of 22.10.). Find the cause and tell me whether it comes from the PR. If so: fix it in the PR. Merge only with green CI. Then fetch main.

### Task 2: integrate the agent into the app (own branch, own PR)

Goal: in the app (`product/app`), the real agent runs on request instead of the pre-recorded WhatsApp scene, and its entries appear in the timeline, folder and the "offen" (open) list with a source. As long as the switch is off, the demo must not change.

**Step 1: read and propose, change nothing.** Read `product/app/src/domain/typen.ts` (the type `Zuruf` already exists there), `src/daten/zeitachse.ts`, `src/daten/ordner.ts`, `src/engine/belegquelle.ts`, `src/engine/befunde.ts` (daywork (Regie) from voice note), the scene `src/ui/ZurufSzene.tsx` and `product/zuruf/src/typen.ts` (work event, statement with quote). Then propose to me in short paragraphs and wait for my go-ahead:

1. **Data model:** How does a work event map onto the app type `Zuruf`? One mapping, not a second parallel type.
2. **Server:** The app is currently a purely static site (`output: "export"` in `next.config`, Cloudflare only serves files). Route handlers and server actions do not exist there. Propose where the AI calls run without the API key ever reaching the browser (e.g. a small separate Cloudflare Worker only for the agent next to the static site), and what that means for the build. The static demo must stay as it is.
3. **Amounts:** The agent never delivers amounts. Decide with me whether a new voice note appears in the app without an amount (only "offen, Regiebericht fehlt" (open, daywork report missing)) or whether the calculation core calculates an amount and the item is then clearly marked as "nicht Teil der Demo-Fälle" (not part of the demo cases). The totals of the demo (solution list) must never change in the process.
4. **Storage:** New entries are stored in the browser like the approvals (`src/zustand/speicher.ts`), no database. How do they get into the precomputed lists (timeline, folder, "offen")? Which parts run in the browser for this?
5. **Costs and protection:** Online, every chat costs money via the API key. Propose a cap (e.g. messages per day). Online, the switch stays off until I give the go-ahead.

**Step 2: implement (only after my go-ahead).**

- Use the agent as a library, do not copy it: `product/zuruf/src/agent.ts`, `verstehen.ts`, `belege.ts`, `texte.ts`, `speicher.ts` are free of UI. The company (`product/zuruf/src/firma.ts`) is provisional: projects come from the app's company record (`src/demo/firma`), not maintained twice.
- Switch `ZURUF_ECHT` (default off). Off: everything as today, pre-recorded scene. On: the scene becomes a real chat with the agent. Stored entries land in the timeline and, if something is missing, on the "offen" list, each with a click to the original (message and quote).
- AI only on the server side. `ZURUF_KI=abo` starts `claude -p` and uses `node:fs`, which is only for local testing. Online only `ZURUF_KI=api` with the key as a Cloudflare secret. Cleanly separate parts using `node:fs` or `node:child_process` from the rest so that they never end up in the Worker or the browser.
- If something about the agent or the conversation flow does not fit: do not rebuild it in the app, but record it in `product/zuruf/LERNEN.md` and fix it in `product/zuruf`, with a test.

**Hard rules**

- Amounts only from the calculation core and `product/docs/Demo_Faelle.md`. Do not change the solution list. The 6 voice notes of the demo stay as they are.
- UI only from `product/app/src/ui` and the styles in `src/ui/styles/` (scene and timeline in `zeitachse.css`). Only add to `tokens.css` and `bauteile.css` if necessary. `fundament.test.ts` stays green. Calm like the rest: little text, no boxes, no "·" and no dashes.
- Synthetic data only. No evaluation per employee (§ 96a ArbVG). The word "Claim" nowhere.
- Do not read the scenarios in `product/zuruf/szenarien/zurueck/` (acceptance).

**Before the PR**

- In `product/app`: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` green. In `product/zuruf`: `npm test` green.
- With `ZURUF_ECHT` off, the app looks exactly as before: screenshots before and after with `product/app/scripts/qa/screens.mjs` or `shot.mjs`, compare pixels.
- With `ZURUF_ECHT` on, play through one real voice note locally once and show me screenshots of the chat, timeline and "offen" list.
- Afterwards update `product/README.md` (section "Stand") and `product/zuruf/UEBERGABE.md`. Merge the PR yourself when CI is green.
