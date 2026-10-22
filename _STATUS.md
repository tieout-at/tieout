# Status

**As of:** Thursday, 22 October 2026
**Maintenance:** update every Sunday after the metrics round (30 minutes, dossier v3 section 14).

## Decided

- Dossier v3 is the current reference. v2 is archive.
- Core product: company twin with project twins, first application the final invoice (Schlussrechnung).
- Gates R1 to R5 and the final decision (Sun 31.1.2027) remain unchanged.
- We stay on the subcontractor side. A switch to the general contractor (GU) side was examined and rejected.

## Gates

| Gate | Date | Status |
|---|---|---|
| R1 Insider | Term sheet Fri 20.11., hard deadline Fri 4.12. | open |
| R4 Legal | Fri 4.12. | open |
| R2 Folder | Fri 11.12. | open |
| R3 Money | Fri 22.1.2027 | open |
| R5 Payment | Fri 29.1.2027 | open |

## This week (CW 43, per dossier v3 section 14)

- Go through dossier v3 with the team
- Repo outside OneDrive (done) and create `Umfang_v1.md`
- Define the demo click path, start the generator for synthetic data
- Draft founders' agreement (A), draft #glaubandich text (B)

## Open for Maxi (website)

- Product understanding for the website: done (see dossier v3 sections 0 and 3)
- 22.10.: working title "tieout", lower case and without a full stop (formerly "Tieout.", "EndPoint."), CI Planraster (paper, ink, ultramarine), website online at tieout-at.pages.dev (old address endpoint-preview.pages.dev redirects). Domain tieout.at bought (easyname, owner Maxi D.), zone created in Cloudflare and connected to the website. Open: switch the name servers at easyname to cheryl/hugh.ns.cloudflare.com as soon as the CloudPit access is available
- 22.10.: GTM and monetisation open, therefore no prices and no "Check anfragen" (request a check) on the website
- Open: trademark check, name servers for tieout.at at easyname, mailbox kontakt@tieout.at, legal notice (Impressum) and privacy policy
- Question for the team: Is "Zwilling" (twin) too abstract for owners? Alternatively test "Wissensdatenbank des Betriebs" (knowledge base of the business)

## Product

- 22.10.: product status from Maxi S. taken over into `product/`: plan and scope (adapted to v3), solution list of the demo cases, calculation core with 58 tests, UI foundation. Overview in `product/README.md`.
- 22.10. evening (Maxi S.): data model company → client → project with voice notes (Zurufe) and 7 small projects (tests match solution list v2 to the cent). Demo app with company overview, project overview, findings and finding page with original and two-step approval. CI checks every PR. Status and next steps in `product/README.md`.
- 22.10. night (Maxi S. with Claude): new sidebar, timeline, WhatsApp scene, ledger with 380 items, folder with evidence matrix. Online on main, independently reviewed. Target group sharpened (`docs/research_notes/Zielgruppe_Challenge.md`), name proposals in PR #19 (team decides). Next chat: `_UEBERGABE.md`.
- Open for the team: hosting of the demo (Vercel Hobby does not deploy private org repos), GitHub plan for protecting main, name, logo, accent colour (placeholder in the app).
- 22.10. late (Maxi S. with Claude, four parallel sessions): styles split per area (#24), steps 1 to 4 on the project overview with real numbers and links (#27), polish without traffic-light dots and colour areas (#28), all tables uniformly 36 px without shifting (#29), central tokens (#33), review findings (#35). Independently reviewed: all amounts accurate to the cent, no broken links. Website check with contradictions on the website: `docs/archiv/Website_Check_2026-10-22.md`.
- 22.10.: name and logo are set: **tieout**, domain tieout.at (not yet live). LinkedIn company page linkedin.com/company/tieout-at (linked in the footer), banner in `brand/linkedin/`. Next product steps (rebranding, link, UI aligned to the website, speed, voice note agent (Zuruf-Agent) by Santino from PR #25): `_UEBERGABE.md`.
- Open: who builds what (product, website), decision in the Sunday round 25.10.
- 22.10.: planning of the voice note agent (Zuruf-Agent: WhatsApp, stage 2 brought forward, synthetic only) in `product/zuruf/` on branch `zuruf/plan`. Team go-ahead on `GESTALTUNG.md` and `PLAN.md` open.

## Not yet created

- Dossier v1 (v2 refers to v1 section 18 for sources on legal, market and exits; not in this folder)

## Folders

- 23.10.: tidied up. `business/` and `video/` (declarations of intent only) merged in `docs/README.md` under "Planned", website check of 22.10. moved to the archive, banner drafts moved to `brand/linkedin/entwuerfe/`. New README with architecture diagram. GitHub organisation shows logo and display name tieout.

- 22.10.: tidied up. v2 moved to `docs/archiv/`, Kuro/reebuild facts from v2 moved to `docs/research_notes/Kuro_reebuild_Fakten.md`.
- 22.10.: private GitHub repository created, located in the organisation `tieout-at` (formerly `schlusswerk`) (github.com/tieout-at/tieout) (monorepo: `docs/`, `product/`, `website/`, `brand/`). Repo outside OneDrive: done.
