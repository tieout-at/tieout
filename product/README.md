# Product

**Name: tieout** (lowercase, no period, as on website v7 of 22.10.2026; previously Tieout). Internally, the npm packages keep the name `schlusswerk` for now; the Worker is called `app`.

The twin: data model company → project → objects (with source, history, status), ingestion, ledger, closing run (Abschluss-Lauf), outputs. Stages and the demo script are in `docs/dossier-v3.md`, section 15 (private repository tieout-at/intern).

Principles: The AI delivers facts with a source, the human confirms, the calculation is deterministic code. Every number leads to the original with one click. Synthetic data only.

**Work in progress.** Responsible so far: Maxi S. In the product files, "Maxi" means Maxi S.

## Status

| Part | Status |
|---|---|
| Plan and scope | `docs/Plan_MVP.md`, `docs/Umfang_v1.md`, aligned with dossier v3, approved by Maxi S. (22.10.) |
| Solution list | `docs/Demo_Faelle.md` v2: company with 8 projects, W21 fully worked out (list 1 27.410,00 €, list 2 11.282,30 €), 6 field reports (Zurufe), general contractor (GU) history, questions for the insider. **Authoritative for all amounts** |
| Data model and calculation core | `app/src/domain`, `app/src/engine`: company → client (Auftraggeber) → project, field reports, 7 small projects. Tests match solution list v2 to the cent (W21 and company), independently reviewed (PR #4) |
| App | Company overview, project overview, findings (Befunde), finding page with the original (drawn from the dataset, A4), evidence chain (Beweiskette) and two-stage approval (history in the browser, undo, reset demo). Collapsible sidebar. Three independent reviews (code, design against Linear/Attio/reebuild, final review), findings incorporated (PR #5) |
| Screens v0.9 (Maxi S., night of 22.10.) | New sidebar (company at the top, projects as a tree with a traffic-light dot), timeline with filters, WhatsApp scene (simulated: a voice message becomes an entry in the timeline), ledger with all bill of quantities (LV) items, folder with evidence matrix (Belegmatrix, item × evidence type) and document list, evidence (Beleg) in the original per document and field report (`/projekte/[projekt]/ordner/[beleg]`). PR #14, #15, #16, #18 and this one |
| Polish v0.10 (Maxi S. with Claude, late 22.10.) | Flow 1 to 4 on the project overview with figures and links, no traffic-light dots and colored areas, status as a word, all tables 36 px with fixed columns (nothing shifts), tokens for font sizes. PRs #24, #27, #28, #29, #33, #35, independently reviewed. Next steps: `_UEBERGABE.md` in tieout-at/intern (rebranding Tieout., UI aligned with the website, speed, field report agent) |
| Field report agent in the app (late 22.10.) | Agent by Santino (`zuruf/`, PR #25) behind the switch `ZURUF_ECHT` in the Worker, at runtime (default off: demo pixel-identical, scene simulated; limit reached: also simulated). On: real chat in the timeline, new field reports in the timeline and in the list „offen“ (open) (without amount, „Regiebericht fehlt“ (time-and-materials report missing)), evidence with a quote per statement (`…/zuruf/?id=`). Stored in the browser, calculation core untouched. Route `/api/zuruf/nachricht` (`zuruf/worker/route.ts`) in the Worker behind the sign-in, off online (variable `ZURUF_ECHT`), daily counter in Supabase (`zuruf/worker/supabase.sql`). Z6 is named as in the solution list „Heizkörper im Wohnzimmer versetzt“ (radiator in the living room moved). Scene and evidence page now say the same sentence as the solution list |
| Brand Tieout (23.10.) | Logo and wordmark at the top of the sidebar (`app/src/ui/Logo.tsx`, same geometry as the website), page title „Tieout“, accent ultramarine #1D3BFF instead of blue. Grays, background and dark mode deliberately unchanged (decision Maxi S.). Since website v7 lowercase and without a period: „tieout“ in wordmark, page title and description. |
| Remaining items from the review report (23.10.) | Phone: company list with header, traffic light and date; wide tables fade out on the right while more columns follow. Calculation as a list like the other tables (header, 36 px, amounts right-aligned). Key figures without lines. One page title for project, finding and evidence. „Zu entscheiden“ (to decide) counts like „x von y freigegeben“ (x of y approved) without „Braucht Anwalt“ (needs lawyer) |
| Settings and sign-in (23.10.) | Settings page (theme, reset approvals) instead of „Demo zurücksetzen“ (reset demo) in the sidebar. Sign-in with Supabase (project `tieout-app`, Frankfurt, invitation only, invite via sign-in link, check script `app/worker/index.ts`) is done, but switched off via `ANMELDUNG_EIN`: judges and investors open the app via link |
| Speed (23.10.) | Measured locally with Edge headless, before and after alternating. Ledger and evidence matrix filter in two steps: matches on screen immediately, the rest of the 380 rows afterwards (`useStufenweise`); rows memoized; matrix cells as plain links with a shared click handler and prefetch on hover (`useLinkFolgen`) instead of over 1,000 `next/link`; ledger sends only the displayed fields. Response to filter and search fast 32 to 72 ms instead of 88 to 176 ms, throttled (CPU 4x) 112 to 240 ms instead of 608 to 992 ms; prefetch in the folder 140 instead of 291 KB. Pixel-identical (69 images). Measurement scripts and figures in the PR |
| Sidebar (UI round 1, 24.10.) | Rebuilt from scratch, option C chosen by Maxi S.: every project carries a building glyph (`ui/Bauglyphe.tsx`, residential by storeys, office tower, school, care home, row houses, hotel) on a blueprint tile; redraws on hover, scan line in the current project, red corner for a pressing deadline. Company as a workspace tile with menu (settings, theme), search with Ctrl K across projects, screens and items (`ui/Suche.tsx`), projects in two groups (in reconciliation, closed and collapsed), expandable per project, one counter only (open items). Collapsed: narrow rail with glyphs. Phone: top bar with menu, sidebar as a drawer. "Synthetisch" moved from the page header to "Beispieldaten" in the sidebar footer. Visible terms: Posten, Belege, LV-Positionen (routes and code renamed later). Styles in `ui/styles/seitenleiste.css` |
| Demo data trimmed (23.10., variant A) | W21 folder from 165 to 81 documents: only cited plans (H-101, H-201, L-310, each index C/D/E), 16 mails with text (6 cited, 10 everyday mails with correct ISO calendar weeks), 8 photos with subject and place (IMG_2291 for J1), 4 duplicates, 25 fields corrected by hand. Timeline 159 to 83 entries, static pages 314 to 230. All amounts unchanged. V1 (container) labelled „Kran“ like the mail, contract item 4.3 and finding use the same word „Pauschale“, finding page `…/befunde/vertrag-mail-0520-container` |
| Rename (UI round 1, step 1a, 24.10.) | Terms decided by Maxi S. 23.10. now also in routes, file names and docs: Befunde → Posten, Ordner → Belege, Ledger → LV-Positionen, Zuruf → WhatsApp-Meldung (the agent: WhatsApp-Agent). The agent folder `product/zuruf` keeps its name and code. Old links redirect with 302 (temporary, terms decided for now). The calculation core and the data model keep their names (`Befund`, `Zuruf`, `ledger`), see `app/CLAUDE.md`. Back control and Esc on item and evidence pages |
| UI foundation | In the app (`app/src/ui`, rules in `app/src/ui/README.md`), **the app is the source**; the Artifact remains reference v2. White background, no boxes, little text. Gate 2 (acceptance) by Maxi S. on the running app open. `fundament.test.ts` blocks free colors, styles, separator dots, forbidden words |
| Checks | GitHub Actions on every PR: types, lint, tests, build. Protecting main requires a paid GitHub plan (open). Screenshots: `app/scripts/qa/screens.mjs` |
| Online | https://app.tieout.workers.dev, open without sign-in since 23.10. (branch previews stay protected), rebuilt on every merge to main (since 22.10.). See "Online (Cloudflare)" |

Next goals: v0.9 Sat 31.10. (#glaubandich), v1.0 calendar week 45, stage 0 freeze Sun 6.12.

## Next steps (in order)

1. Gate 2 with Maxi S. on the running app.
2. Screens up to v0.9: built (22.10.). Open: independent review, real PDFs for evidence (pdf.js with highlighting from the source coordinates).
3. Add team addresses to the access rule (see "Online (Cloudflare)").
4. Open findings from the reviewers: show pre-check (Vorprüfung)/cascade only for W21, document IDs unique across the company, submitted final invoice (Schlussrechnung) and cumulative interim invoices (AR) in the data model, keys of the deduction reasons in the correction sheet, review status (Prüfstand) per value in the calculation.
5. Phase 3 up to v1.0 (calendar week 45): pre-check, final meeting sheet (Schlussbesprechungs-Blatt), draft of the final invoice, Excel export, GU history.

## Structure

| Path | Content |
|---|---|
| `docs/` | Plan, scope, solution list, patterns from reebuild and Kuro, UI measurement sheet, review reports |
| `app/` | Code: Next.js 16, TypeScript, Vitest. Rules for agents in `app/CLAUDE.md` |
| `app/src/app/` | Screens (routes): `/` company overview, `/projekte/[projekt]`, `…/posten`, `…/posten/[posten]`, `…/positionen`, `…/zeitachse`, `…/belege`, `…/belege/[beleg]`, `…/whatsapp`. Old addresses (`…/befunde`, `…/ordner`, `…/ledger`, `…/zuruf`) redirect with 302 (`app/src/umleitung.ts`, in the Worker) |
| `app/src/zustand/` | Approval as history (pure logic with tests) and storage in the browser, plus new WhatsApp messages (`meldungen.ts`); later a database |
| `app/src/whatsapp/` | Integration of the WhatsApp agent: switch, company for the agent, mapping work event → WhatsApp message |
| `zuruf/` | WhatsApp agent (by Santino; folder name kept so his work merges cleanly): core, simulator, learning loop, route for the app (`worker/`). Rules in `zuruf/CLAUDE.md` |
| `app/src/ui/` | Components from the UI foundation (React) and styles (`styles/tokens.css`, `bauteile.css`, layout per area such as `rahmen.css`, `tabellen.css`) |
| `app/src/daten/` | Data access for the screens; today the synthetic company twin, later the database per company |
| `ui-fundament/` | Design system v2 as reference and the scripts that generated it (`LIESMICH.md`) |

## Running

```bash
cd product/app
npm ci
npm test
npm run build
npm run start
```

Then open http://localhost:3000. `npm run build` writes the finished pages as files to `app/out/` (static export), `npm run start` serves exactly these files. `npm run generate` writes the synthetic datasets to `app/data/generated/` (not in the repository). Before every pull request: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`.

## Online (Cloudflare)

The demo runs on Cloudflare as a Worker with static files (Workers Builds, free plan) The address is open without sign-in since 23.10. (it is in the submission email to the jury). Branch previews are protected by Cloudflare Access: whoever opens a preview address enters their email address and receives a code. Only approved addresses get in.

| What | Where |
|---|---|
| Demo (state of `main`) | https://app.tieout.workers.dev |
| Preview per branch and pull request | Cloudflare posts the address as a comment in the pull request |
| Settings | Cloudflare dashboard (account of Maxi S.), Workers & Pages, `app` (previously `schlusswerk-demo`) |
| Configuration in the repository | `app/wrangler.jsonc` |

How it works:
- Every merge to `main` rebuilds the demo and puts it online (2 to 3 minutes). Every other branch gets its own preview address, also protected.
- Cloudflare builds directly from the repository (root directory `product/app`, build `npm run build`, deploy `npx wrangler deploy`, preview `npx wrangler preview`). The GitHub checks (`.github/workflows/produkt-app.yml`) continue to run independently.
- Signing in: open the address, enter your email, type in the code from the email. The session lasts 24 hours.
- Managing access: Cloudflare dashboard, Zero Trust, Access controls, Policies, rule „Team Schlusswerk (E-Mail-Code)“. Add or remove email addresses there and save; takes effect immediately. The second rule „Cloudflare account members“ lets members of the Cloudflare account in via „Cloudflare“. Zero Trust Free: $0, up to 50 people.
- Approvals in the demo are still stored only in the user's browser (localStorage); there is no database online. Synthetic data only.

Locally on Windows, the browser console reports some 404s for `__next.*.txt` files during prefetch. This is a bug in the Next.js export on Windows (wrong path separators); the pages still load. Cloudflare builds on Linux, where it does not occur.

## Rules

- UI only from the UI foundation, no custom colors or spacing.
- All amounts from the calculation core. The solution list changes only with a go-ahead; the code follows it.
- Before every pull request: typecheck, lint, tests, build green; screens checked in a real browser (light, dark, 1440 and 390 px) and looked at by an independent reviewer.
