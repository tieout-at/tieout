# Clean-up log (Bereinigung)

Step 0 of the v2 rebuild, 23.10.2026, Maxi S. with Claude. Every removal or move with path, reason and where it stays. Nothing was lost: the full v1 state is under the tag `v1-archiv` (commit 61c35ef, PR #97) and the branch `v1`.

## Repository tieout-at/tieout (branch `neuordnung`, merged into `main`)

| Path | What happened | Reason | Where it stays |
|---|---|---|---|
| `product/app/` (140 files) | deleted | v1 app; v2 is rebuilt from zero in `app/` with Attio as template | tag `v1-archiv`, branch `v1`, live at app.tieout.workers.dev |
| `product/ui-fundament/` (60 files) | deleted | design system v2 as reference, superseded by the decision for Attio (23.10.) | tag `v1-archiv` |
| `product/docs/Plan_MVP.md`, `product/docs/Umfang_v1.md` | deleted | plan and scope of v1, replaced by the rebuild plan (in `tieout-intern`) and `docs/SPEZIFIKATION.md` (step 0b) | tag `v1-archiv` |
| `product/docs/Inspiration_Muster.md`, `product/docs/UI-Messblatt.md`, `product/docs/Pruefberichte_UI.md` | deleted | UI references, measurement sheet and review reports of v1, superseded by the Attio measurements (`docs/DESIGN.md` in step 1) | tag `v1-archiv` |
| `product/README.md` | deleted | overview of the v1 product, replaced by `README.md` and `docs/` | tag `v1-archiv` |
| `.github/workflows/produkt-app.yml` | deleted | checked `product/app`, which no longer exists on `main`; checks for `app/` and `kern/` come with steps 1 and 2 | tag `v1-archiv` |
| `product/zuruf/` (94 files) → `agent/` | moved, code unchanged | new structure; typecheck and 54 tests green in the new place | history follows with `git log --follow` |
| `product/docs/Demo_Faelle.md` → `docs/Demo_Faelle.md` | moved, one sentence changed: a gate name became "measured with real companies" | `docs/` names no gates; amounts unchanged | tag `v1-archiv` for the old wording |
| `.github/workflows/produkt-zuruf.yml` → `.github/workflows/agent.yml` | moved, paths set to `agent/` | new structure | tag `v1-archiv` |
| `.gitignore`, `.github/workflows/agent.yml` | comments in English, gate name removed; `/intern/` stays ignored so that old clones with a nested `intern/` cannot commit it | rules: comments in English, no gates in public files | tag `v1-archiv` |
| `README.md` | rewritten short | v2 under construction, v1 live; removed: tech stack table and architecture diagram (linked to the v1 README under the tag); v1 run commands replaced by one line for the tag; the five "how it works" steps condensed into the three website steps; promises (problem, twin, final invoice, principles) kept | tag `v1-archiv` |
| `CLAUDE.md` | rewritten short | new map and rules; removed: offers, gates and gate dates (not for a public repository, now only in `tieout-intern`), paths into `product/` | tag `v1-archiv` |
| `app/README.md`, `kern/README.md`, `docs/_STATUS.md`, `docs/_UEBERGABE.md`, this file | new | new structure | |

## Repository tieout-at/intern

| Path | What happened | Reason |
|---|---|---|
| `_STATUS.md`, `_UEBERGABE.md` | uncommitted changes of 23.10. (restart decision) committed and pushed before the move (d7e9b66) | would have been lost with the old folder |
| `docs/Plan_Neustart.md` | new: copy of the approved plan from `C:\Users\maxis\.claude\plans\` | the plan belongs in the project, not only on one computer; private because it contains price points |
| `README.md`, `_STATUS.md`, `_UEBERGABE.md` | updated | product handover now in the public `docs/_UEBERGABE.md`; clone location next to `tieout` |

## Local folders

| Path | What happened | Reason | Check before |
|---|---|---|---|
| `C:\Users\maxis\dev\schlusswerk-team\intern\` → `C:\Users\maxis\dev\tieout-intern` | fresh clone, plus the untracked notes `docs/research_notes/codex-ui-polishing-2026-10-23/` (7 files, kept local and untracked as before) copied over | sibling folder instead of nested | 16 files before, 16 after, content identical (line endings aside) |
| Attio screen recording in `C:\Users\maxis\dev\schlusswerk-team\` → `C:\Users\maxis\dev\_vorlagen\Attio.mp4` | moved and renamed (318.500.928 bytes), never in Git (`*.mp4` ignored) | reference outside the repository | size identical |
| `product/app/qa-shots/` in `schlusswerk-team`, `tieout-dashboard`, `tieout-uebersicht` → `C:\Users\maxis\dev\_vorlagen\v1-qa-shots\` | copied (237 screenshots, 35 MB; git-ignored, never on GitHub) | v1 screenshots for the comparison before the switch-over | 161 + 28 + 48 files, no name collisions |
| `C:\Users\maxis\dev\schlusswerk` | deleted (go Maxi S.) | old local repository without remote (1 commit, 22.10.) | 26 of 28 files exist identically in the tieout history; the other 2 are older versions (`CLAUDE.md`, solution list v1) of files that continue under `v1-archiv` |
| `C:\Users\maxis\dev\tieout-dashboard`, `C:\Users\maxis\dev\tieout-uebersicht` | removed with `git worktree remove` (go Maxi S.) | git worktrees of the old folder (branches `ui/dashboard-geld`, `app/schlussbesprechung`) | no uncommitted changes; both branches merged into `main` and on GitHub |
| `C:\Users\maxis\dev\schlusswerk-team\.claude\worktrees\distracted-hawking-973182`, `...\festive-payne-3f6c93` | removed with `git worktree remove` (go Maxi S.); an empty, locked folder of the second one goes with `schlusswerk-team` | worktrees of finished sessions | no uncommitted changes; branches on GitHub |
| `C:\Users\maxis\dev\schlusswerk-team` | go Maxi S.; deleted after the step 0 chat is closed (the chat ran inside it) | old working folder, replaced by `tieout` and `tieout-intern` | all local branches merged into `main` or on GitHub (six local-only branches are all contained in `main`); no `.env` files |
| `C:\Users\maxis\OneDrive - WU Wien\000_Hack WU` → `_archiv_Hack WU` | renamed (go Maxi S.) | early working folder (dossiers v1 to v3, first status files), kept as archive | 114 files before, 114 after |

## Cloudflare

| What | What happened | Reason |
|---|---|---|
| Worker `app`, Settings, Builds, Production | "Disable builds" switched on (23.10., evening) instead of switching the production branch to `v1` | the branch list stays empty because the Git connection still shows the old name `schlusswerk/schlusswerk`; with builds off the live version 4f4d1872 (= #97 = `v1-archiv`) stays, whatever happens on `main`. Checked after merging #98: no new build, version 4f4d1872 still active |
| Worker `app`, Settings, Builds, Previews Base | "Builds for Preview branches" switched off | preview builds still ran for every branch and failed without `product/app` (red check on every pull request) |
