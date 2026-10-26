# tieout: rules for Claude Code

This folder is the public repository github.com/tieout-at/tieout (opened for the hackathon jury; the hackathon has ended, and the product is now developed without a deadline until it is ready for customers and investors). Strategy, prices, gates, the dossier and team status live in the private repository tieout-at/intern, cloned next to this folder as `../tieout-intern` (read it, never copy from it into this repository). Read this file, then `docs/_UEBERGABE.md` and `docs/_STATUS.md`.

## Where things stand

v2 is rebuilt from zero (decided 23.10.2026): UI modelled on Attio's layout, behaviour and spacing (brand, icons and texts are our own), content along the three steps of the website section 03 (`website/messages/de.json`, key `solution`): Ihre Daten, Digitaler Zwilling, Ergebnis. Since step 8c (26.10.2026) the public link https://app.tieout.workers.dev (Cloudflare worker `app`) serves v2 from `main`; v1 is frozen at https://app-v1.tieout.workers.dev (worker `app-v1`, builds off), its code under the tag `v1-archiv` and the branch `v1`. One chat per step; the steps are in `docs/_STATUS.md`.

| Path | What |
|---|---|
| `app/` | v2 app (Next.js), from step 1 |
| `kern/` | v2 calculation and data model, from step 2; tests against `docs/Demo_Faelle.md` |
| `agent/` | WhatsApp agent (Santino), taken over unchanged from v1 `product/zuruf`; its own `CLAUDE.md` applies there |
| `website/` | public website; `website/STRUKTUR.md` is binding |
| `brand/` | logo and graphics |
| `docs/` | `_STATUS.md`, `_UEBERGABE.md`, `_BEREINIGUNG.md` (clean-up log), `SPEZIFIKATION.md`, `Demo_Faelle.md` (solution list) with `demo_faelle_check.mjs` (recomputes every amount; run before every change to either file); later `DESIGN.md` |

## Rules

1. **Language:** docs, READMEs and code comments in English; app text in German with full words (Leistungsverzeichnis, Aufmaßblatt 12, Regiebericht 11, Abschlagsrechnung 3, Einheitspreis, Auftraggeber by name); conversation with the team in German, simple, result first. No filler, no emojis, no dashes as punctuation.
2. **Public repository:** no prices, packages, gates, gate dates, strategy or internal notes here. They belong in `../tieout-intern`. No secrets (`.env` only). Before any publication, `grep -r "PLATZHALTER"` finds nothing in the published part; unknowns are written as `[[PLATZHALTER: …]]`, never invented.
3. **Product principles:** the AI delivers facts with a source, a human confirms, the invoice is deterministic code. Every number leads to its original with one click. History is append only. Data silo per company.
4. **Amounts:** only from `kern/` and `docs/Demo_Faelle.md`. The solution list changes only with a go from Maxi S. Synthetic data only, no real customer data, until the legal clearance and the works council say otherwise.
5. **Never:** the word "Claim" (we say Schlussrechnung, verrechenbar, Beweispaket), contact with the general contractor, legal assessments or statements on preclusion, evaluation of employees (§ 96a ArbVG), pooling prices between companies, debt collection, faking a feature.
6. **Sales:** no cold emails, no cold calls (§ 174 TKG).
7. **Decided and rejected:** dossier v3 in `../tieout-intern/docs/dossier-v3.md`; section 12 is not proposed again without new evidence.
8. **Working practice:** one chat per step, started from `docs/_UEBERGABE.md`, ended with updated `_STATUS.md` and `_UEBERGABE.md`. Before each part two sentences on what happens, a go from Maxi S. before pushing, deleting or anything outward facing. Every change through a branch and a pull request. Never code in OneDrive. No worktrees or parallel sessions unless Maxi S. asks.
9. **Done means:** typecheck, lint, tests, build green; amount audit green; browser light at 1440 px and 390 px; screenshot next to the reference shown to Maxi S.; a bug review and a security review of the step's diff, findings re-measured and fixed; no slower than before (bundle and page load checked when code changes); status updated.
10. **Building a page:** follow "Principles for every new page" in `docs/DESIGN.md` (clear and not packed, picture first, the extra where it fits, interactive where clearer, scalable, fit for onboarding, colour and money rules, phones, speed and security).
