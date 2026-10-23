# WhatsApp agent: plan

Status: 22.10.2026, draft. Basis: Dossier v3, sections 3.4, 4, 11, 15.

## Goal (Ziel)

A WhatsApp agent to which a fitter can call out in seconds what he has done, and which turns that into a clean entry with a source in the project twin. First in the simulator, then on a real WhatsApp test number, finally integrated into the app. How it talks to people is set out in `GESTALTUNG.md`.

**Done means:** A team member sends a voice note about a fictitious site from their own phone, confirms with one tap, and the entry appears with photo, audio and transcript in the app's timeline. The metrics from `GESTALTUNG.md` hold on all scenarios, including the held-back ones.

## Relation to the team's plan (Verhältnis zum Plan des Teams)

- Dossier v3 15.2: Stage 2 (WhatsApp agent) is planned as a prototype from January, after R3. The MVP (`../docs/Umfang_v1.md`) only has a staged WhatsApp scene, the real agent is listed there as "not included" („nicht drin“).
- This folder brings the prototype forward, separate from the MVP. Who works on it and for how long belongs in the Sunday meeting on 25.10. (build split, open question 14). The MVP v0.9 on 31.10. must not suffer from it.
- Synthetic data only. Real employees and real sites only after R4 and clarification with the works council.

## Decisions (Entscheidungen)

| Date | Decision |
|---|---|
| 22.10.2026 | Order: first simulator with learning loop, then real number |
| 22.10.2026 | Channel: WhatsApp Cloud API directly with Meta, no intermediary provider |
| 22.10.2026 | Testers: nobody from construction yet. First synthetic personas and the team |
| 22.10.2026 | Own folder `product/whatsapp/`, TypeScript like `../app/`, own `package.json` |
| 22.10.2026 (proposal) | The AI reads and phrases, the code decides. Which fields are missing, whether to ask a follow-up and when to save is deterministic code. This makes the behaviour testable |
| 22.10.2026 | The agent's replies are fixed sentences in code, not phrased by the AI. Predictable, short, no slips on money and law. The AI only reads |
| 22.10.2026 | Model Claude Opus 5.5 for agent, persona and rater (default according to the Claude API reference). A cheaper model only with a go from the team |
| 22.10.2026 | The agent only asks who gave the instruction for additional or change work. Not for normal work under the contract |
| 22.10.2026 | Switch `ZURUF_KI`: `abo` uses Claude Code (`claude -p`) with one's own Claude subscription, only for development and testing. `api` (default) uses the API key and is mandatory in production. Before acceptance runs and demos, re-measure once with `api`, because response times and fine tuning differ |
| 22.10.2026 (proposal) | Every recognised field carries the quote from the message that supports it. The code checks that the quote really appears in the transcript. Without a quote the field stays empty ("do not guess") |

## Architecture (Aufbau)

```
Channel: simulator (browser, local) | WhatsApp Cloud API (webhook)
  → Intake: normalise the message (text, audio, image, timestamp, sender)
  → Understanding: speech to text, describe photo
  → Extraction (AI): project, location, work performed, quantity, effort, instructing person, each with a quote
  → Conversation control (code): is something important missing? Follow-up question or save
  → Phrasing (code): fixed, short sentences following GESTALTUNG.md, buttons (src/texte.ts)
  → Storage: WhatsApp message and work event (Leistungsereignis) with source, append only, never overwrite
```

The agent knows the active projects, building sections or units (Tops) and the short texts of the bill of quantities (LV) from a small synthetic company twin (Haustechnik Beispiel GmbH, project Wien 21 from `../app/src/demo/w21/` plus further invented ones). In phase 1 storage is a file (one line per event), a database only at integration.

## Phases (Phasen)

| Phase | Content | Acceptance |
|---|---|---|
| **0 Foundations** | Folder, rules, design, plan. Create an Anthropic API key with a spending limit | Team has read `GESTALTUNG.md` and given a go |
| **1 Core and simulator** | Message data model, small company twin, extraction with quote, conversation control, simulator in the browser (text only), 30 scenarios plus 10 held back, learning loop | Metrics from `GESTALTUNG.md` reached on all scenarios |
| **2 Voice and photo** | Speech to text: compare two to three providers with our own test recordings (EU providers preferred). The team records the test recordings with invented content, including dialect and construction noise underneath. Have photos described | With a poor recording the agent asks instead of guessing. Provider chosen with justification |
| **3 Real number** | Meta test number, webhook, reply buttons, downloading media, the team's test phones | 20 WhatsApp messages from a real phone, same metrics as in the simulator |
| **4 Integration** | Proposal to Maxi S.: types Zuruf and Leistungsereignis in `../app/src/domain/typen.ts`, WhatsApp messages in timeline and "open" („offen“) list, replace the mock scene with a recorded real run | Pull request with a go from Maxi S. |

The team sets the dates. Phase 1 only needs the Anthropic key, phase 3 additionally the Meta account.

## Learning loop (Lernschleife)

This is how the system learns from mistakes without anyone from construction being involved.

1. **Scenario** (`szenarien/*.json`): persona (role, way of speaking, patience), the truth (what really happened), disruptions (dialect, two topics, wrong site, delayed message, photo only), expectation (fields, maximum follow-up questions, forbidden content).
2. **Play:** A language model plays the fitter. It only knows the persona and the truth, not the agent's rules. It talks to the agent until confirmed or aborted.
3. **Rate:** Hard checks in code (fields correct, nothing invented, number of follow-up questions, reply length, forbidden words) plus a rating according to `GESTALTUNG.md` by a second model that reads the conversation blind.
4. **Learn:** Every mistake is entered in `LERNEN.md` (what, cause, rule, scenario). Then the smallest change, then all scenarios again. What was green before must stay green.
5. **Against flattering the numbers:** 10 scenarios are written by a subagent, and they are not read during the work (`szenarien/zurueck/`). They only run at the acceptance of a phase.

Roles of the subagents in Claude Code: writing scenarios (targeted where the agent was last weak), investigating failed conversations for the cause, reading replies independently against `GESTALTUNG.md`, researching facts about Meta and providers with sources. Deciding and changing is done by the main session.

Limit: synthetic fitters are not real fitters. The loop finds logic errors and slips in tone, not whether someone on the site will really use it. Only a test with people from construction checks that.

## Access (step by step, when the time comes) (Zugänge)

**Phase 1: Anthropic API key**
1. Create an account on console.anthropic.com (this is not the same as the Claude subscription).
2. Under Billing, set a small credit balance and a monthly spending limit.
3. Under API Keys, create a key and enter it in `product/whatsapp/.env` as `ANTHROPIC_API_KEY=`. Never into the chat, never into Git.

**Phase 3: WhatsApp Cloud API**
1. On developers.facebook.com, create a developer account with a Facebook account, create an app of type Business, add the WhatsApp product. Meta then creates a test business account and a test number.
2. Under WhatsApp, API Setup, enter up to five of your own mobile numbers as recipients and confirm them by code.
3. Enter the webhook address. For development via a tunnel to your own computer, later on EU hosting.
4. For continuous operation, create a system user with a permanent token, as `WHATSAPP_TOKEN=` in `.env`.

## Facts on the WhatsApp Cloud API (Fakten zur WhatsApp Cloud API)

Research as of 22.10.2026. Check again with Meta before phase 3.

| Fact | Source |
|---|---|
| When WhatsApp is added to an app, Meta creates a test business account and a test number that can message up to five recipients free of charge | [Meta, Get Started](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started/) |
| Per-message pricing since 1.7.2025; non-template messages are free within the open customer service window | [Meta, Pricing](https://developers.facebook.com/docs/whatsapp/pricing) (page last changed 30.3.2026 according to research) |
| From 1.10.2026 service messages are also said to cost money, with 1,000 free per month and number | (unbelegt) third-party providers only: [respond.io](https://respond.io/id/blog/whatsapp-pricing-change-2026.md), [EngageLab](https://www.engagelab.com/blog/whatsapp-pricing-2026-service-message-cost). Check with Meta |
| Free-form messages and buttons only within 24 hours of the user's last message; after that only approved templates | (unbelegt) third-party providers only, e.g. [Interactive Messages](https://singhamandeep.com/?p=1542). Consistent with rule 8 (never write first) |
| Reply buttons: at most three per message, label at most 20 characters | (unbelegt) same source. Check with Meta |
| "Local Storage" option: message content at rest in the EU (Germany), processing for up to 60 minutes also outside. Only configurable as long as the number is not registered | [Meta, Local Storage](https://developers.facebook.com/documentation/business-messaging/whatsapp/local-storage/) |
| Groups via the Cloud API | (unbelegt) open |

## Risks (Risiken)

| Risk | Countermeasure |
|---|---|
| Not enough time for the MVP v0.9 (31.10.) | Sunday meeting decides; WhatsApp agent work pauses if the MVP needs it |
| Synthetic tests fake quality | held-back scenarios; as early as possible a real fitter with invented content (via R1 or co-founder B) |
| Dialect and noise make transcripts poor | Phase 2 compares providers with our own recordings; agent asks instead of guessing |
| Model costs in the learning loop | spending limit in the account; small runs, full runs only at acceptance |
| Meta changes rules or prices | the channel is replaceable, the core does not depend on WhatsApp |
| Data protection and works council (Dossier v3 risk 12) | synthetic only; R4 question list; no evaluation per person in the data model |

## Integration (go from Maxi S. 22.10.2026, implemented) (Integration)

- Data model: no second type. `product/app/src/whatsapp/abbildung.ts` maps a work event (Leistungsereignis) onto the app type `Zuruf`; every item keeps its quote as its source (`Quelle.stelle`).
- Amounts: new WhatsApp messages without an amount. Hours stay 0 (the agent does not distinguish between fitter and helper), on the "open" („offen“) list as „Neu per WhatsApp, ohne Betrag“ (new via WhatsApp, without amount), status „Regiebericht fehlt“ (time-and-materials report missing). The calculation core never sees them, the demo totals stay unchanged.
- Server: route `POST /api/zuruf/nachricht` (`worker/route.ts`), without server state (the browser sends the conversation state along). Runs in the app's worker behind the login (Supabase session, main chat) and locally in `worker/lokal.ts`. AI only via `apiFrage` (ki.ts) with the key as a Cloudflare secret; `llm.ts` and `speicher-datei.ts` are Node only.
- Protection: switch `ZURUF_ECHT` in the worker, read at runtime (default off), at most 40 AI calls per day and 20 US dollars per month based on the actual cost of each reply, for everyone together (never per person); the hard limit is the monthly limit in the Anthropic console just under 25 € (requirement from Maxi S.). Limit reached or agent unreachable: the app plays the staged scene, without an error message.
- Storage: interface `MeldungAblage` (`product/app/src/zustand/meldungen.ts`), currently in the browser; later Supabase (table per company, append only, Row Level Security).
- Company: from the app's company twin (`product/app/src/whatsapp/firma.ts`, written by the generator as `data/generated/agent-firma.json`). `src/firma.ts` remains for tests and the learning loop.
