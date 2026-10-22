# Kuro and reebuild: fact list

**Origin:** Taken over unchanged from `archiv/dossier-v2.md`, sections 8.1 to 8.6 and 17 (as of 22.10.2026). This is the only part of v2 that dossier v3 still refers to.

**Marking:** **G** = read (link), **S** = snippet only, **A** = assumption. All figures from Kuro and reebuild are self-reported. Where v3 differs (e.g. photo capture, platform story, live capture), v3 sections 8.2 and 12 apply.

## 8.1 Profiles

| | **Kuro** (Berlin) | **reebuild** (Vienna) |
|---|---|---|
| Customer | General contractors, mainly estimating (G) | Construction companies, project developers/property developers, portfolio holders (G) |
| Product | Project documents become a data model (graph); contradiction analysis of plans/construction specification/contract; subcontractor (NU) bid review (PDF to GAEB); room book back into BIM; agent for public procurement; AI chat; version comparison (G, [Website](https://www.kuro.technology)) | 9 modules: invoice review, approvals, filing, subcontractor review with correction sheet, delivery notes with photo app, budget, costs, price database, warehouse (G, [Website](https://www.reebuild.com)) |
| Flow | Upload → automatic answers to standard questions → every answer links to the original → corrections become rules (G, [Köster](https://www.kuro.technology/referenzen/koester)) | Capture → "digitaler Zwilling" (digital twin) per document → matching against bill of quantities (LV), delivery note, invoice, construction contract, framework price → approval and booking entry (infographic on reebuild.com, screenshot by Maxi, 22.10.) |
| Customers | 12 "setzen Kuro ein" (use Kuro), of which 6 of the 20 largest general contractors (GUs) in DACH; Goldbeck, Köster, Geiger, Riedel, Implenia (G, [startbase](https://www.startbase.de/news/10-millionen-euro-finanzierungsrunde-fuer-kuro/)); HOCHTIEF Infrastructure (S). Whether all of them pay is not stated | 120+; Pittel+Brausewetter, 3SI Immogroup, Rödl & Herdegen, Kratzert (G); 345,000+ documents, 530+ million € invoice volume, 2,350+ daily users (G) |
| Value proposition | 90 h per bid; 70 % found something overlooked; Köster 6 h per week and employee (G) | 3 instead of 20+ min per invoice; "7x schneller" (7x faster); 5 → 1.5 days to approval (G) |
| Prices | not public (G) | not public, "ab 10 Mitarbeitern" (from 10 employees) (G) |
| Integrations | iTwo, RIB, Revit, Egnyte, CDE (G) | DATEV, BMD, BRZ, RZL; ZUGFeRD, XRechnung, Peppol (G) |
| Founders | Lea Scherer (CEO according to startbase, co-managing director according to references) and Jonas Minkler (CPO according to dealroom); business administration and computer science in Munich, previously leadership teams at Capmo and alcemy (G). In 2024 the press called the co-founder "Lea Leibold" (G); that this is the same person (A; register Sept. 2024: "Jonas Minkler, L. Sch.", S) | Founder information is contradictory: in 2023 Trending Topics names Paul Lind, Alexander Kornell and Lucas Iser (Iser as "Mitgründer" (co-founder)) (G); English reports of 13.10.2026 name Kornell, Cimadom and Papay as founders in 2022 (G, [thesaasnews](https://www.thesaasnews.com/news/reebuild-raises-3m-seed)). According to the press, Lind was co-founder until May 2026 (G). Today Kornell CEO, Cimadom CRO (both from family construction businesses), Papay CTO, Lederer COO (G) |
| Team | 16 in Berlin (G); openings: Forward Deployed Engineer, Head of Eng, PM, 2× AI Engineer (G, [Join us](https://www.kuro.technology/join-us)) | around 25 in Vienna (G); sales team with team lead, SDR, customer success (G/S) |
| Funding | Gründerstipendium (founder grant) WISTA/Senate 2024 (G); UG registered 4.9.2024, GmbH from 4.11.2024 (S, Northdata) → 10 million € on 30.9.2026, lead UVC, plus Foundamental, Realyze, helloworld (G). Round type inconsistent: Series A or seed (G/S) | Pre-seed January 2023, six figures, jointly from PlanRadar founder Dolinsek, several investors via the Weilburg Family Office (including Storebox founder Dietrich) and ROI Ventures (G); extension Sept. 2023 with Hansmann, Steinberger and others (G); aws, FFG (G) → seed 3 million € on 13.10.2026, lead Fortino, plus Rise PropTech, CuriosityVC (G) |
| First customers | 2024: 100+ expert interviews, prototype, "kleine Teile der Kalkulation, sofortiger Mehrwert" (small parts of estimating, immediate added value), purchasable modularly (G, [Adlershof](https://www.adlershof.de/en/news/kuro-a-new-start-up-is-breathing-life-into-the-construction-industry)); at Köster first proof on historical projects, 1,000+ review questions with estimators, in-house training, founders know Köster people personally (G) | 2023: pilot with around 25 construction companies before market launch (G); podcast topic "Leberkassemmeln als Door Opener am Bau" (meat loaf rolls as door openers in construction) (G, title only); 2026: SDR with telephone cold acquisition, LinkedIn, email, target 120 demos in the first year (G, [JOIN](https://join.com/companies/reebuild/16366213-sales-development-representative-german-speaking)) |
| Message | "KI-Fundament für Generalunternehmer" (AI foundation for general contractors), "Build Bigger", "Builders for Builders"; skilled labour shortage, productising knowledge (G) | "Das KI-gestützte Backoffice" (the AI-supported back office), "Vom Lieferschein zur geprüften Rechnung. 7x schneller." (From delivery note to checked invoice. 7x faster.), "null Verwaltungsaufwand am Bau" (zero administrative effort in construction) (G) |
| Technology | Knowledge graph, LLMs, plans as graphs; EU hosting, ISO 27001 (G); concrete stack not public | AI agents prepare, humans decide; developed in Vienna, hosted in Germany (G); stack not public |
| Next steps | Procurement, accounting, compliance; long term an AI ERP for construction (G) | AI modules from estimating to accounting, "Agentic Backoffice"; markets Austria and Germany, then further European countries (G) |

## 8.2 What both do the same way

1. **One narrow, measurable job first:** at Kuro the documents for a bid, at reebuild the incoming invoice. The platform only comes afterwards.
2. **A document becomes a record with a source.** The AI prepares, the human decides, and every statement can be traced back to the original.
3. **The customer's rule set is the product:** review criteria, component catalogues, framework prices. Corrections become rules.
4. **Domain credibility in the founding team:** leadership roles at Capmo and alcemy at Kuro ("seit 14 Jahren an der Schnittstelle von Bau, Digitalisierung und KI" (for 14 years at the intersection of construction, digitalisation and AI), self-reported), family construction businesses at reebuild.
5. **What is sold is time, with a number in the headline.**

## 8.3 What we adopt

| Area | Pattern (source) | For Schlusswerk |
|---|---|---|
| **Positioning** | Target group is in the headline: "KI-Fundament für Generalunternehmer" (Kuro, G) | "Der Schlussrechnungs-Desk für Elektro- und HKLS-Betriebe." (The final invoice desk for electrical and HVAC/plumbing businesses.) |
| | A number in the headline (both, G) | Before R3: "Schlussrechnung in 10 Tagen geprüft, jede Position belegt." (Final invoice (Schlussrechnung) checked in 10 days, every item backed by evidence.) After R3 only with a real value: "Im Schnitt X € pro Projekt gefunden." (On average X € found per project.) |
| | Pride in the industry: "Builders for Builders" (Kuro, G) | "Wer die Arbeit gemacht hat, soll sie bezahlt bekommen." (Whoever did the work should get paid for it.) |
| | Visible trust: EU hosting, ISO 27001, GDPR (Kuro); hosting in DE (reebuild) (G) | Trust bar: EU hosting, data processing agreement (AVV), data silo, "wir reden nie mit eurem GU" (we never talk to your GU). ISO 27001 only after the pre-seed |
| | Address roles separately: managing director, estimating, IT (Kuro, G) | Owner (money), invoicing clerk (less work, evidence), project manager (no new tool) |
| **Sales** | Proof on historical projects before rollout (Kuro at Köster, G) | The first free Check runs on a real project of the design partner. What is sold for money remains the Check **before** the final invoice (section 12 stands) |
| | 100+ expert interviews before the product (Kuro, G) | Every insider, law firm and subcontractor conversation with an interview guide; target 30 conversations by Christmas |
| | Pilot with many companies before market launch (reebuild, 25 companies, G) | 3 design partners are the gate; waiting list with consent for everyone else |
| | Personal closeness, on site: founders know Köster people (G); "Leberkassemmel" (G, title only) | Office visit to the invoicing clerk, early in the morning, with breakfast; always with an insider or law firm as the door opener |
| | Angels from the Viennese construction tech scene as door openers; cap table without competitors of the customers (reebuild, G) | Mentors and angels only without GU ties; no GU-side investors in the cap table |
| | One clear CTA: "Demo buchen" (book a demo) (both, G) | "Check anfragen" (request a Check) with a consent checkbox for the follow-up |
| **Pricing logic** | No public prices; modular, purchasable individually (Kuro 2024, G) | Check as a small individual module, annual Desk (Jahresdesk) as a package; only the entry price becomes public (section 5) |
| | Value measured in time (both) | We measure in euros and show time as the second number. If R3 lands in the middle band, time becomes the main message |
| **Product** | "Digitaler Zwilling" (digital twin) per document (reebuild, G) | Architecture v1: document → record with source → ledger (section 15) |
| | Review catalogue: 1,000+ questions on 40+ trades with estimators (Kuro, G) | Review catalogue electrical/HVAC/plumbing with the insider, v0 with 100–200 review questions (assumption) |
| | Version comparison and duplicates: "Man kriegt immer alles nochmal" (you always get everything again) (Kuro/Köster, G) | Plan index diff and duplicate detection in the folder import |
| | Correction sheet for the subcontractor (reebuild, G) | Counterpart: pre-check from the GU's perspective and supplementary sheet for the final invoice |
| | Accounting export BMD/BRZ/RZL (reebuild, G) | Check the BMD import format by the end of January; in v1 Excel and ÖNORM |
| | "Am Ende entscheide ich" (in the end I decide) (Köster estimator, G) | Approval of every line by the invoicing clerk remains mandatory |
| **Team** | Forward Deployed Engineers, "built onsite" (Kuro, G) | v1 is an internal tool. Maxi builds next to the insider, not for him. The first hire after the pre-seed is a former project manager as Check analyst, not an SDR |
| | Domain in the founding team (both) | confirmed: the insider remains kill gate R1 |
| | A co-founder left (reebuild, Lind, G) | Founders' agreement with vesting and leaver rules by Fri 6.11. remains mandatory |
| **Fundraising story** | Kuro: skilled labour shortage, "eine Branche, die schneller vergisst, als sie lernt" (an industry that forgets faster than it learns), top logos, expansion into a platform (G). reebuild: hard volume figures, "Agentic Backoffice", expansion (G) | Our story see 8.6 |
| | Investor has known the founders for years (UVC at Kuro, G) | Build contacts with construction investors loosely now, no raise before R5 |

## 8.4 What we do not adopt

| Pattern | Why not |
|---|---|
| Telephone cold acquisition and outreach by email (reebuild SDR, G) | not permitted in Austria under § 174 TKG without consent. Whether reebuild uses it mainly for Germany is open (A) |
| Real-time budget, warehouse, photo app, ESG data (reebuild) | Live operation from the start is rejected (section 12). The photo app with 2,350 daily users shows that construction site apps are used. Our reason for rejection, however, was the inbox and the daily triage by the project manager. That is not enough to reopen it |
| AI chat as a core function (Kuro) | Nice demo, but not a money job. At most later as "Frag den Ordner" (ask the folder) for the invoicing clerk |
| Estimating and bids (Kuro) | Kuro reads tender documents. Our rejected "Kalkül" prices new bids from the archive, which is a different job. **No new evidence for Kalkül, stays parked** |
| Room book, BIM, public procurement as a product (Kuro) | GU jobs. We use procurement data only internally to address letters to winners of HVAC/plumbing and electrical lots |
| Platform story from day 1 ("KI-ERP" (AI ERP)) | Both started with a narrow job and only expanded after having customers |

## 8.5 Would the GU side be clearly better?

**No, not for us.** First the points that honestly speak for the GU side:
- **Demand is proven there.** Since its registration in autumn 2024, Kuro has 12 customers, including 6 of the 20 largest GUs. reebuild has 120+ customers. Neither of them says whether all of them pay and at what price. On the subcontractor side there is no comparable evidence.
- **The money flows there:** 13 million € in two weeks for two GU or client tools.
- **Fewer, larger buyers** with an IT department. How high the contract values are is open.

Why we stay anyway:
- **The GU side is taken.** Bids: Kuro, Cosuno. Invoice and subcontractor review: reebuild. Change orders: Capmo, PlanRadar. Teams with leadership experience in construction software or from construction families win there. Three students without a network would run into a fight against funded teams there.
- **Our possible advantage only applies on the subcontractor side:** an insider from the subcontractor business, pricing from the subcontractor's LV and K7, rule set per GU from the subcontractor's perspective.
- **The other side using AI is our argument.** The more strongly GUs check with AI, the more urgently the subcontractor needs its own Desk.

**What this means concretely:** If R5 fails because subcontractors do not pay, that is the strongest signal against the subcontractor side. A switch to the GU side would then not be an easy fallback, however, because it is taken. The fallbacks remain as in v1 (section 13). The side switch is now listed as examined and rejected in section 12.

## 8.6 Our story for investors and competitions (draft)

> The clients are arming themselves. Kuro checks the subcontractors' bids for the largest general contractors. reebuild checks every subcontractor invoice against the LV and construction contract for property developers and construction companies and writes the correction sheet automatically. The electrical or HVAC/plumbing business with 60 people keeps writing its final invoice from the memory of an overloaded project manager, and that is where its margin lies. Schlusswerk is its final invoice desk: every LV item matched in 10 days, every euro backed by evidence, before the invoice goes out. We never talk to the GU. The customer decides and sends.

Key figures we count from the first Check, following the pattern of reebuild's "530 Mio. € Rechnungsvolumen" (530 million € invoice volume):
- checked contract sum in €;
- € found per million € of contract sum, coded by (a) to (d);
- days until the final invoice is paid.

For #glaubandich and the hackathon: the story stays with the problem and the synthetic demo, without invented findings.

## Sources

- Kuro:
  - [kuro.technology](https://www.kuro.technology), [Reference Köster](https://www.kuro.technology/referenzen/koester), [Reference Geiger](https://www.kuro.technology/referenzen/geiger), [About](https://www.kuro.technology/about), [Join us](https://www.kuro.technology/join-us)
  - Press: [startbase](https://www.startbase.de/news/10-millionen-euro-finanzierungsrunde-fuer-kuro/), [dealroom](https://dealroom.co/news/157842-kuro-raises-10m-to-build-the-ai-backbone-for-construction-contractors/), [Adlershof 2024](https://www.adlershof.de/en/news/kuro-a-new-start-up-is-breathing-life-into-the-construction-industry)
- reebuild:
  - [reebuild.com](https://www.reebuild.com), [Bauunternehmen](https://www.reebuild.com/bauunternehmen), [Projektentwickler](https://www.reebuild.com/projektentwickler), [Über uns](https://www.reebuild.com/ueber-uns)
  - Press: [Trending Topics 2026](https://www.trendingtopics.eu/reebuild-3-millionen-euro-seed/), [Trending Topics 01/2023](https://www.trendingtopics.eu/reebuild-gruender-von-planradar-und-storebox-steigen-in-pre-seed-startup-ein/), [Trending Topics 09/2023](https://www.trendingtopics.eu/reebuild-investment-hansmann-steinberger-angels-proptech)
  - Job ads: [JOIN SDR](https://join.com/companies/reebuild/16366213-sales-development-representative-german-speaking), [JOIN Founders Associate](https://join.com/companies/reebuild/16425146-founders-associate-german-speaking)

Sources on legal, market, competition and exits: v2 refers to dossier v1, section 18. v1 is not in this folder.
