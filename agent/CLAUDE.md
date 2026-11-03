# Zuruf agent: rules for Claude Code

The Zuruf agent is one of the ways into the digital twin: a fitter or site foreman sends a photo or voice note via WhatsApp, the agent assigns it, summarises it, the sender confirms with one tap, and a work event with a source is created in the project twin.

The rules in `../CLAUDE.md` (repo root) apply in addition.

## Reading order at every start (Lesereihenfolge)

1. `UEBERGABE.md`: where we stand, what the next step is. **Always first.**
2. `PLAN.md`: goal, phases, acceptance, decisions.
3. `GESTALTUNG.md`: how the agent talks to people. Applies to every prompt, every reply, every test.
4. `LERNEN.md`: mistakes that have already happened, and the rules derived from them. Do not repeat them.

## Boundary with the MVP (Abgrenzung zum MVP)

- The v2 app (`../app/`) does not use the agent yet; its page "WhatsApp-Meldungen" shows the synthetic Meldungen of the core. This folder builds the agent on its own without disturbing the app.
- Do not change anything in `../app/`, `../kern/` or `../docs/` from here without a go from the team. Integration is step 21 (`PLAN.md`, section Integration) and comes as a separate pull request.
- Never amounts in the agent. The agent records facts (project, location, work performed, quantity, effort, person who gave the instruction). Pricing is done by the calculation core, decisions are made by a human.

## Hard rules (Harte Regeln)

- **Synthetic data only.** Fictitious company (Haustechnik Beispiel GmbH), fictitious construction sites, fictitious people. Real phone numbers only for the team's own test phones, no real construction site content. Real customer data only after the legal clearance and the works council.
- The agent only talks to employees of the customer company, never to the general contractor (GU). It never decides whether something is billable, never makes legal assessments, says nothing about deadlines or preclusion.
- No evaluation per employee (§ 96a ArbVG): no counts, rankings, reminders to individuals. The sender is only the origin of the entry.
- The agent never writes first. It only replies in a conversation the employee has started (§ 174 TKG unresolved).
- Nothing is overwritten. Corrections are new versions with a reference to the old one.
- No unofficial WhatsApp libraries (Baileys, whatsapp-web.js). Only Meta's official Cloud API.
- Secrets only in `.env` (it is ignored). `.env.example` shows the names without values.
- Never the word "Claim", not even in prompts or test data.

## Way of working (Arbeitsweise)

- One branch per work package (`zuruf/...`), into `main` only via pull request.
- Before writing code with the Claude API, load the skill `claude-api` (model names, parameters, caching).
- Every change to the agent's behaviour: first a scenario in `szenarien/` that shows the bug, then the change, then run the learning loop (procedure in `PLAN.md`, section Lernschleife).
- Every bug found goes into `LERNEN.md`, with cause, rule and the scenario that will catch it in future.
- Subagents for work that can run in parallel: writing scenarios, testing as a persona, rating conversations, researching facts. Always give subagents `GESTALTUNG.md` and the scenario, not your own guess.
- Facts about Meta, prices, law: with source and date. Without a source, "(unbelegt)" (unverified).

## End of every session (account switch possible at any time) (Ende jeder Sitzung)

1. Update `UEBERGABE.md`: status, last step, next step, open questions, running experiments.
2. New bugs into `LERNEN.md`.
3. Commit to the working branch and push (after a go from the human), so that another account on another computer can continue.
