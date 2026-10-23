# WhatsApp agent: rules for Claude Code

The WhatsApp agent is the third way into the twin (Dossier v3, section 3.4): a fitter or site foreman sends a photo or voice note via WhatsApp, the agent assigns it, summarises it, the sender confirms with one tap, and a work event with a source is created in the project twin.

The rules in `../../CLAUDE.md` (repo root) and `../app/CLAUDE.md` apply in addition.

## Reading order at every start (Lesereihenfolge)

1. `UEBERGABE.md`: where we stand, what the next step is. **Always first.**
2. `PLAN.md`: goal, phases, acceptance, decisions.
3. `GESTALTUNG.md`: how the agent talks to people. Applies to every prompt, every reply, every test.
4. `LERNEN.md`: mistakes that have already happened, and the rules derived from them. Do not repeat them.

## Boundary with the MVP (Abgrenzung zum MVP)

- In the MVP (`../app/`, `../docs/Umfang_v1.md`) the WhatsApp scene is a mock. The real agent is listed there as "not included" („nicht drin“). This folder builds it in parallel without disturbing the MVP.
- Do not change anything in `../app/` or `../docs/` without a go from Maxi S. Integration happens through a proposal in `PLAN.md` (section Integration) and a separate pull request.
- Never amounts in the agent. The agent records facts (project, location, work performed, quantity, effort, person who gave the instruction). Pricing is done by the calculation core, decisions are made by a human.

## Hard rules (Harte Regeln)

- **Synthetic data only.** Fictitious company (Haustechnik Beispiel GmbH), fictitious construction sites, fictitious people. Real phone numbers only for the team's own test phones, no real construction site content. Real customer data only after R4 and the works council.
- The agent only talks to employees of the customer company, never to the general contractor (GU). It never decides whether something is billable, never makes legal assessments, says nothing about deadlines or preclusion.
- No evaluation per employee (§ 96a ArbVG): no counts, rankings, reminders to individuals. The sender is only the origin of the entry.
- The agent never writes first. It only replies in a conversation the employee has started (§ 174 TKG unresolved, Dossier v3 section 4).
- Nothing is overwritten. Corrections are new versions with a reference to the old one.
- No unofficial WhatsApp libraries (Baileys, whatsapp-web.js). Only Meta's official Cloud API.
- Secrets only in `.env` (it is ignored). `.env.example` shows the names without values.
- Never the word "Claim", not even in prompts or test data.

## Way of working (Arbeitsweise)

- One branch per work package (`whatsapp/...`), into `main` only via pull request.
- Naming: the visible terms are "WhatsApp-Agent" and "WhatsApp-Meldung" (decision Maxi S. 23.10.2026). Inside this package the old word stays where it is wired to the AI or to infrastructure: the agent actions (`neuer_zuruf`, `kein_zuruf`), prompts, scenario files, the route `/api/zuruf/…`, the switches `ZURUF_ECHT` and `ZURUF_KI`, and the Supabase objects in `worker/supabase.sql`.
- Before writing code with the Claude API, load the skill `claude-api` (model names, parameters, caching).
- Every change to the agent's behaviour: first a scenario in `szenarien/` that shows the bug, then the change, then run the learning loop (procedure in `PLAN.md`, section Lernschleife).
- Every bug found goes into `LERNEN.md`, with cause, rule and the scenario that will catch it in future.
- Subagents for work that can run in parallel: writing scenarios, testing as a persona, rating conversations, researching facts. Always give subagents `GESTALTUNG.md` and the scenario, not your own guess.
- Facts about Meta, prices, law: with source and date. Without a source, "(unbelegt)" (unverified).

## End of every session (account switch possible at any time) (Ende jeder Sitzung)

1. Update `UEBERGABE.md`: status, last step, next step, open questions, running experiments.
2. New bugs into `LERNEN.md`.
3. Commit to the working branch and push (after a go from the human), so that another account on another computer can continue.
