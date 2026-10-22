# Schlusswerk: Dossier v2

**As of:** Thursday, 22 October 2026
**For:** Maxi, the two co-founders and every new AI chat without prior context.
**Relation to v1:** `Schlusswerk Dossier.md` (v1) remains unchanged as an archive. v2 is shorter and contains all decisions from v1. New are section 8 ("Learned from Kuro and reebuild"), the plan up to 31.1.2027 with a build plan (sections 14 and 15) and a few additions marked **[new]**. Where v1 and v2 differ, v2 applies.

---

## 0. Result first

1. **We stay on the side of the subcontractors.** The general contractor (GU) side is better funded and demonstrably sells. But it is not clearly better for us: it is occupied, and our only possible edge (an insider from a subcontractor business, pricing from the sub's bill of quantities (LV) and K7 cost sheets) only counts on the sub side. Reasoning in 8.5.
2. **The other side now demonstrably has AI.** reebuild checks subcontractors' invoices against the LV, construction contract and measurement record (Aufmaß) for developers and construction companies, and automatically writes a correction sheet. Kuro checks subcontractors' bids for the largest GUs. This makes our sales argument a proven fact rather than a claim.
3. **We adopt five patterns:**
   - every document becomes a record with a source link;
   - the check catalogue and rule set are built with practitioners;
   - proof first on a real, completed project;
   - export to accounting (BMD);
   - one number in the headline.

   **[new]** The Check gets a "pre-check from the GU's perspective": it shows what the GU is likely to cut before the final invoice (Schlussrechnung) goes out.
4. **Not adopted:**
   - reebuild's cold telephone prospecting (not permitted in Austria under § 174 TKG);
   - real-time modules (Live only from year 2, see section 12);
   - an AI chat as a core function.
5. **New risk:** reebuild (Vienna, 120+ customers, already reads LV, construction contract and Aufmaß, BMD integration) can occupy the sub side faster than PlanRadar or Capmo. The window remains at an estimated 12–24 months. From now on reebuild is the first name on the watch list and at the same time a possible acquirer.
6. **Plan:** Gates and dates from v1 remain unchanged. Section 14 shows week by week who does what. Section 15 shows what we build by when: the demo by 31.10. or for the hackathon, v1 as an internal Check tool by Sun 6.12.

**Labels:** **(unverified)** = experience or general knowledge without a checked source. **(assumption)** = model assumption, must be measured. In section 8: **G** = read (link), **S** = snippet only, **A** = assumption. All figures from Kuro and reebuild are self-reported. The complete fact list with links is in `research_notes/Kuro_reebuild_Fakten.md`.

---

## 1. Summary

Schlusswerk is a final invoice desk for Austrian electrical and HVAC/plumbing (Elektro and HKLS) subcontractors with 30–150 people. Before the final invoice goes to the GU, Schlusswerk reconciles the LV, Aufmaß, daywork (Regie) reports, interim invoices (Abschlagsrechnungen), plans, emails and photos. For each LV item it shows what has been performed, what has been invoiced and what has been paid.

The result:
- a "billable now" (jetzt verrechenbar) list, priced from the company's own LV and K7 sheets;
- an evidence package (Beweispaket) per item;
- a sheet for the final account meeting (Schlussbesprechung);
- **[new]** a pre-check from the GU's perspective.

Prices: 1,500–3,500 € per Check or, as an annual desk (Jahresdesk), 800–2,500 € per month. At least 80 % of revenue is fixed.

Limits: Schlusswerk never writes to the GU. Disputes go through a partner law firm. The word "Claim" does not appear in any customer material.

The company only exists once a construction insider signs with equity (by Fri 4.12.2026 at the latest). Five gates decide by Sun 31.1.2027.

Realistic exit if successful: 10–40 million €. The chance of an exit above 10 million € by October 2032 is about 3 % today, 18–20 % after passing the gates, and below 0.5 % for above 100 million €. Whether this satisfies the goal "YC and unicorn" must be a conscious team decision (open fundamental question).

---

## 2. Problem and customer

**Problem:** At the end of a project, subcontractors lose money they have already earned:
- daywork that was performed but not invoiced or never signed;
- quantity overruns that are not in the Aufmaß (with unit price contracts this is billing, not a change order (Nachtrag));
- agreed price escalation and metal surcharges;
- changes that were notified but never priced.

**Causes:**
- An overloaded project manager (PL) writes the final invoice late and from memory (unverified).
- There is a shortage of skilled workers: in building electrics more than 70 % of vacancies remain unfilled ([KOFA 07/2026](https://www.iwkoeln.de/fileadmin/user_upload/Studien/KOFA_kompakt_und_Studien/2026/KOFA_Kompakt-07-2026-Handwerk.pdf)).
- The data is scattered.
- Part of it is deliberately traded away in the final account meeting. Nobody knows how large this part is; gate R3 measures it.

**[new] Why now:** Clients check with AI. reebuild reads subcontractor invoices item by item against the LV, construction contract and Aufmaß, tracks retentions, deductions, guarantees and discounts, and automatically produces a correction sheet for the subcontractor (G, [reebuild Projektentwickler](https://www.reebuild.com/projektentwickler)). The sub still writes by hand.

**Wedge customer:**

| Attribute | Definition |
|---|---|
| Trade | HKLS or electrical; start with the insider's trade |
| Size | 30–150 people, ideally 40–100; 5–25 million € revenue |
| Business | at least 60 % ÖNORM B 2110 contracts with GUs, developers and public clients |
| Volume | at least 8 final invoices per year, contracts 150,000 € to 3 million € (unverified per company) |
| Region | Vienna and Lower Austria (NÖ) first, Upper Austria (OÖ) and Styria from mid-2027 |

**Roles:**
- **Signs:** owner or commercial management.
- **Champion:** the billing clerk (Abrechner) or a senior PL.
- **Blocker:** a PL who feels controlled; the works council (Betriebsrat).

**Trigger:** A final invoice is due in 4–8 weeks, or a GU has cut a final invoice in the last 12 months. We handle the second case only through the law firm.

---

## 3. Product

### 3.1 Final invoice Check (core product, 10 working days)

1. **Handover:** only what the company collects for the final invoice anyway. The data processing agreement (AVV) is signed beforehand.
2. **Ingestion [refined]:** Every document becomes a structured record. Every field shows its source (file, page, location). Duplicates and new versions are detected (pattern from Kuro and reebuild, section 8).
3. **Contract profile:** rule set (ÖNORM B 2110 plus the GU's deviations), price basis and deadlines. Where the contract is ambiguous, the earliest plausible deadline applies, and Schlusswerk never says whether a deadline is preclusive.
4. **Reconciliation:** LV × Aufmaß × Regie × invoices × payments. The AI supplies the facts, the calculation is deterministic code.
5. **Detection:**
   - daywork not signed or not invoiced;
   - quantities above the LV quantity;
   - plan index changes;
   - instructions in emails;
   - agreed price escalation.
6. **Pricing:** from the company's own LV unit price and the K7 labour minutes.
7. **[new] Pre-check from the GU's perspective:** The same checks that a GU tool like reebuild performs are run on the company's own final invoice:
   - items without Aufmaß evidence;
   - daywork without signature;
   - calculation errors;
   - items outside the LV;
   - missing evidence for retentions and discounts.

   Goal: fewer cuts, without a dispute.
8. **Review by the insider** before every delivery.
9. **Approval and sending by the company itself.**
10. **Coding session** (with design partners, 45 minutes): Every euro found is coded as (a) not noticed, (b) left on the table for the relationship, (c) traded in a settlement or (d) contractually excluded.
11. **Learning:** Every correction by the insider becomes a rule in the check catalogue or in the rule set per GU.

**Order of items:**
1. daywork;
2. quantity overruns;
3. price escalation;
4. notified changes.

Disruption, acceleration and disputed clauses go through the lawyer only.

**Inputs:**
- ÖNORM A 2063 LV or PDF;
- K sheets;
- Aufmaß (Excel/PDF);
- daywork scans;
- interim invoices and payments;
- plans with index;
- emails (.msg/.eml, project folder only);
- WhatsApp export;
- photos with EXIF;
- contracts.

Rule: **no API dependency in v1**, file exports only.

**Outputs:**
- ledger per LV item;
- three lists (billable now / notified and open / lost);
- evidence package per item with a link to the original;
- final account meeting sheet with a floor per item;
- **[new]** pre-check from the GU's perspective;
- export: Excel, ÖNORM; **[new]** check BMD posting import, because reebuild integrates BMD, BRZ and RZL as standard (G).

### 3.2 Further offerings

| Offering | Content | When |
|---|---|---|
| Annual desk | every closing project and every partial final invoice; deadline calendar after the final payment; security (Sicherstellung) tracker under § 1170b ABGB; history per GU | from the first paying customer |
| Dispute package | same engine, legal assessment by the partner law firm; customer pays both directly | as needed, only through the law firm |
| Live desk | project mail folder, ongoing detection, notification drafts that the PL sends himself | year 2, only after 2 delivered Checks |

### 3.3 What Schlusswerk never does

- contact with the GU;
- legal assessment or statements on preclusion;
- debt collection or assignment;
- bonus on disputed amounts;
- pooling prices between companies;
- rating employees;
- the word "Claim" in customer material.

---

## 4. Law (design hypothesis, not legal advice)

Read in the statutory text (RIS): § 134 GewO, § 1170b ABGB, § 879 ABGB. Everything else is unverified until the legal opinion is available (gate R4, Fri 4.12.).

| Rule | Consequence for Schlusswerk |
|---|---|
| § 8 RAO (representation of parties, unverified) | Core question for the lawyer: are Check, ledger and valuation a reserved activity? |
| Unauthorised legal practice (Winkelschreiberei, unverified) | do not draft legal documents; templates come from the customer |
| § 134 GewO (read) | engineering offices (Ingenieurbüros) may advise and calculate; this fits the valuation. Possible licence route via the insider (unverified) |
| § 879 Abs 2 Z 2 ABGB (read) | never a share in litigation; bonus only on undisputed, paid items |
| § 1170b ABGB (read) | security up to 20 % (40 % under 3 months), cannot be waived; feature in the annual desk |
| § 174 TKG 2021 | no advertising emails and no advertising calls without prior consent, including to businesses; even a call that only asks for consent is not permitted (read: [WKO](https://www.wko.at/noe/internetrecht/e-mail-fax-telefonwerbung-telekommunikationsgesetz-detail); verifier: RIS § 174 and § 4 Z 13). Ask the lawyer before every electronic message |
| § 96a ArbVG | no PL scoring |

**Liability:**
- The promise is "review and drafts", not a guarantee.
- Liability cap: 12 monthly fees.
- Financial loss liability insurance (Vermögensschadenhaftpflicht) 1 million €, premium at most 8,000 € per year (gate R4).

**Data protection:**
- AVV before the first folder;
- EU hosting;
- data silo per company;
- project folder only;
- deletion at end of contract.

**[new]** The AI models run via an EU region. This is a feasibility assumption and must be checked before the first real folder. Kuro advertises EU hosting and ISO 27001, reebuild hosting in Germany (G). Customers expect this.

Germany (RDG, VOB/B, GAEB, cost-based pricing under BGH VII ZR 34/18) only comes from 2028, after a legal opinion.

---

## 5. Prices and figures

| Offering | Price |
|---|---|
| First Check for 3 design partners | free, only in exchange for the coding session |
| Single Check | 1,500 € (contract under 0.5 million €) / 2,500 € (0.5–1.5 million €) / 3,500 € (over 1.5 million €); credited if an annual desk follows within 60 days |
| Annual desk S / M / L | 800 / 1,400 / 2,500 € per month (up to 6 / 15 / 35 closings per year) |
| Success bonus (optional) | at most 8 % of the items found and paid, max. 5,000 € per project, only after the lawyer's approval |
| Live desk (year 2) | plus 600–900 € per month |
| Dispute package | 3,000–6,000 € per case |

**Conversion rule:** A design partner becomes paying if their Check finds at least 30,000 € or 1.5 % of the contract sum in "not noticed" money.

**[new] Price shown externally:** Kuro and reebuild do not publish prices and sell via "Book a demo" or "Write to us" (G). Proposal: show only the entry price ("Check from 1,500 €, fixed"). The annual desk is offered in conversation. With owners who negotiate every euro, the fixed price is a trust signal (assumption).

**Key figures (all assumption):**

| Key figure | Value |
|---|---|
| ACV | 14,000 € at launch, 18,000–19,000 € at maturity |
| Gross margin | 55–65 % in 2027, 75–80 % at maturity |
| Review effort per Check | 6–10 h at the beginning, later 2–3 h |
| CAC | 8,000–15,000 € early, about 6,000 € at maturity |
| Cost of the gates until 31.1. | 3,000–6,000 € |

**Financing (base case):**
1. paid Checks;
2. pre-seed 0.8–1.5 million € in mid-2027;
3. seed 3–5 million € in early 2029.

**[new]** reebuild was funded in its early phase by aws and FFG (G, [Trending Topics](https://www.trendingtopics.eu/reebuild-3-millionen-euro-seed/)). Austrian early-stage funding for construction AI is therefore attainable. Programmes and amounts for us remain unverified.

---

## 6. Market and exit

**Market:**
- Relevant companies (assumption): Austria 650–700, Germany 4,200–5,000.
- SAM electrical/HKLS in AT plus DE: **70–100 million €**; with further trades in DACH 150–200 million €.
- Austria ceiling: 120–150 customers, i.e. 2–2.5 million € ARR.
- 10 million € ARR requires 550–700 companies. In the base case this is end of 2032, in the conservative case not before 2035.
- Germany 2028 at the earliest, only if all three hold: 40 paying AT customers, an RDG legal opinion is available, the product has been rebuilt (GAEB, VOB/B, cost-based pricing).

**[new] Signal from reebuild:** 120+ construction and real estate companies in AT, DE and beyond use reebuild's AI back office; according to the website the software is intended "from 10 employees" (G). So mid-sized construction companies do buy such software. Whether electrical and HKLS businesses are among them is unknown.

**Exit:**

| Scenario | ARR | Exit value | Acquirer |
|---|---|---|---|
| Low | 1–2.5 million € | 3–8 million € | consulting, BuildTec acquisition, Constellation |
| Likely at PMF | 3–6 million € | **15–30 million €** | BuildTec, Nemetschek (NEVARIS), ib-data (ABK) |
| High | 8–10 million € | 60–100 million € | Nemetschek, RIB, specialist publisher (Libra pattern) |

**[new]** reebuild is added as a possible acquirer or partner: Vienna, same accounting integrations, goal "Agentic Backoffice" (G). A sub module would anger their GU customers, which is a channel conflict (assumption).

**Probability chain (unchanged from v1):**

| Step | Probability |
|---|---|
| Insider by 4.12. | 45 % |
| Gates R2–R5, given insider | 35 % |
| Team stays together | 80 % |
| → Gates passed and team stays on board | about 13 % |
| 2.5–3 million € ARR by 2031 | 35 % |
| Sale above 10 million € | 55 % |
| → **Exit above 10 million € by Oct. 2032** | **about 3 % (90 % interval 1–6 %)** |

The rounds of Kuro and reebuild show investor interest in construction AI in DACH. They do not change the bottlenecks: insider, folders and money in the folder.

---

## 7. Competition

| Provider | Side | What they do | Threat to us |
|---|---|---|---|
| **reebuild** (Vienna) **[new]** | developers, construction companies | check incoming invoices and subcontractor (NU) invoices against LV, construction contract, Aufmaß; correction sheet; BMD/BRZ/RZL | **high to medium:** has the engine for AT formats and construction companies as customers who are themselves subs. Most likely closing move: "check outgoing invoice" for their own customers (assumption) |
| **Kuro** (Berlin) **[new]** | large GUs | estimating, contradiction analysis, NU bid review, room schedule, public procurement | **low directly:** bid phase, not billing. Plans purchasing and accounting (G); strengthens the other side |
| PlanRadar, Capmo | GU platforms | change claim management, AI change order review, subs are free guests | high: could ship "AI for specialist contractors" as a feature |
| ABK, NEVARIS, RIB, BuildTec | AVA/ERP | hold the data, manual change order registers | medium: could rebuild the reconciliation; we integrate via files |
| Cosuno, Forgent, Sidoun, ORCA | bids, planner AVA | bids and LVs | low; supply files, possible channels |
| Document Crunch, Trunk Tools | US, GU side | change detection | low in DACH for 2–3 years |

**The gap:** None of the providers checked reconciles performed against invoiced on the sub side and prices from the company's LV and K7. The window is estimated at 12–24 months.

**Watch list:**
1. reebuild;
2. PlanRadar;
3. Capmo.

**Moat (5/10):**
- **What holds:** ledger history per company, rule set per GU, Austrian format depth, borrowed trust (insider, law firm), counter-position to GU-funded platforms.
- **What is missing:** network effect and exclusive data.

---

## 8. Learned from Kuro and reebuild

### 8.1 Profiles

| | **Kuro** (Berlin) | **reebuild** (Vienna) |
|---|---|---|
| Customer | general contractors, mainly estimating (G) | construction companies, project developers/developers, portfolio holders (G) |
| Product | project documents become a data model (graph); contradiction analysis of plans/building specification/contract; NU bid review (PDF to GAEB); room schedule back into BIM; agent for public procurement; AI chat; version comparison (G, [Website](https://www.kuro.technology)) | 9 modules: invoice review, approvals, filing, NU review with correction sheet, delivery notes with photo app, budget, costs, price database, warehouse (G, [Website](https://www.reebuild.com)) |
| Workflow | upload → automatic answers to standard questions → every answer links to the original → corrections become rules (G, [Köster](https://www.kuro.technology/referenzen/koester)) | capture → "digital twin" per document → reconciliation with LV, delivery note, invoice, construction contract, framework price → approval and posting record (infographic on reebuild.com, screenshot by Maxi, 22.10.) |
| Customers | 12 "use Kuro", including 6 of the 20 largest GUs in DACH; Goldbeck, Köster, Geiger, Riedel, Implenia (G, [startbase](https://www.startbase.de/news/10-millionen-euro-finanzierungsrunde-fuer-kuro/)); HOCHTIEF Infrastructure (S). Whether all of them pay is not stated | 120+; Pittel+Brausewetter, 3SI Immogroup, Rödl & Herdegen, Kratzert (G); 345,000+ documents, 530+ million € invoice volume, 2,350+ daily users (G) |
| Value proposition | 90 h per bid; 70 % found something overlooked; Köster 6 h per week and employee (G) | 3 instead of 20+ min per invoice; "7x faster"; 5 → 1.5 days to approval (G) |
| Prices | not public (G) | not public, "from 10 employees" (G) |
| Integrations | iTwo, RIB, Revit, Egnyte, CDE (G) | DATEV, BMD, BRZ, RZL; ZUGFeRD, XRechnung, Peppol (G) |
| Founders | Lea Scherer (CEO according to startbase, co-managing director according to references) and Jonas Minkler (CPO according to dealroom); business administration and computer science in Munich, previously leadership teams at Capmo and alcemy (G). In 2024 the co-founder was called "Lea Leibold" in the press (G); that it is the same person (A; register Sept. 2024: "Jonas Minkler, L. Sch.", S) | founder information is contradictory: in 2023 Trending Topics names Paul Lind, Alexander Kornell and Lucas Iser (Iser as "co-founder") (G); English reports from 13.10.2026 name Kornell, Cimadom and Papay as founders in 2022 (G, [thesaasnews](https://www.thesaasnews.com/news/reebuild-raises-3m-seed)). Lind according to the press a co-founder until May 2026 (G). Today Kornell CEO, Cimadom CRO (both from family construction businesses), Papay CTO, Lederer COO (G) |
| Team | 16 in Berlin (G); openings: Forward Deployed Engineer, Head of Eng, PM, 2× AI Engineer (G, [Join us](https://www.kuro.technology/join-us)) | around 25 in Vienna (G); sales team with team lead, SDR, customer success (G/S) |
| Financing | founder grant WISTA/Senate 2024 (G); UG registered 4.9.2024, GmbH from 4.11.2024 (S, Northdata) → 10 million € on 30.9.2026, lead UVC, plus Foundamental, Realyze, helloworld (G). Round type inconsistent: Series A or seed (G/S) | pre-seed January 2023, six figures, jointly from PlanRadar founder Dolinsek, several investors via the Weilburg Family Office (including Storebox founder Dietrich) and ROI Ventures (G); extension Sept. 2023 with Hansmann, Steinberger and others (G); aws, FFG (G) → seed 3 million € on 13.10.2026, lead Fortino, plus Rise PropTech, CuriosityVC (G) |
| First customers | 2024: 100+ expert interviews, prototype, "small parts of estimating, immediate added value", modularly purchasable (G, [Adlershof](https://www.adlershof.de/en/news/kuro-a-new-start-up-is-breathing-life-into-the-construction-industry)); at Köster first proof on historical projects, 1,000+ check questions with estimators, in-house training, founders know Köster people personally (G) | 2023: pilot with around 25 construction companies before market launch (G); podcast topic "Leberkassemmeln as a door opener on the construction site" (G, title only); 2026: SDR with cold telephone prospecting, LinkedIn, email, target 120 demos in the first year (G, [JOIN](https://join.com/companies/reebuild/16366213-sales-development-representative-german-speaking)) |
| Message | "AI foundation for general contractors", "Build Bigger", "Builders for Builders"; skilled labour shortage, productising knowledge (G) | "The AI-supported back office", "From delivery note to checked invoice. 7x faster.", "zero administrative effort on the construction site" (G) |
| Technology | knowledge graph, LLMs, plans as graphs; EU hosting, ISO 27001 (G); concrete stack not public | AI agents prepare, humans decide; developed in Vienna, hosted in Germany (G); stack not public |
| Next steps | purchasing, accounting, compliance; long term an AI ERP for construction (G) | AI modules from estimating to accounting, "Agentic Backoffice"; markets Austria and Germany, then further European countries (G) |

### 8.2 What both do the same way

1. **One narrow, measurable job first:** at Kuro the documents for a bid, at reebuild the incoming invoice. Only after that comes the platform.
2. **A document becomes a record with a source.** The AI prepares, the human decides, and every statement can be traced back to the original.
3. **The customer's rule set is the product:** check criteria, component catalogues, framework prices. Corrections become rules.
4. **Domain credibility in the founding team:** leadership roles at Capmo and alcemy at Kuro ("for 14 years at the interface of construction, digitalisation and AI", self-reported), family construction businesses at reebuild.
5. **What is sold is time, with a number in the headline.**

### 8.3 What we adopt

| Area | Pattern (source) | For Schlusswerk |
|---|---|---|
| **Positioning** | target group in the headline: "AI foundation for general contractors" (Kuro, G) | "The final invoice desk for electrical and HKLS businesses." |
| | one number in the headline (both, G) | Before R3: "Final invoice checked in 10 days, every item evidenced." After R3 only with a real value: "On average X € found per project." |
| | pride in the industry: "Builders for Builders" (Kuro, G) | "Whoever did the work should get paid for it." |
| | visible trust: EU hosting, ISO 27001, GDPR (Kuro); hosting in DE (reebuild) (G) | trust bar: EU hosting, AVV, data silo, "we never talk to your GU". ISO 27001 only after the pre-seed |
| | address roles separately: management, estimating, IT (Kuro, G) | owner (money), billing clerk (less work, evidence), PL (no new tool) |
| **Sales** | proof on historical projects before rollout (Kuro at Köster, G) | The first free Check runs on a real project of the design partner. What is sold for money is still the Check **before** the final invoice (section 12 stands) |
| | 100+ expert interviews before the product (Kuro, G) | every insider, law firm and sub conversation with an interview guide; target 30 conversations by Christmas |
| | pilot with many companies before market launch (reebuild, 25 companies, G) | 3 design partners are the gate; waiting list with consent for all others |
| | personal closeness, on site: founders know Köster people (G); "Leberkassemmel" (G, title only) | office visit to the billing clerk, early in the morning, with breakfast; always with the insider or law firm as the door opener |
| | angels from the Vienna construction tech scene as door openers; cap table without competitors of the customers (reebuild, G) | mentors and angels only without GU ties; no GU-side investors on the cap table |
| | one clear CTA: "Book a demo" (both, G) | "Request a Check" with a consent checkbox for follow-up |
| **Pricing logic** | no public prices; modular, purchasable individually (Kuro 2024, G) | Check as a small single module, annual desk as a package; only the entry price is public (section 5) |
| | value measured in time (both) | We measure in euros and show time as the second number. If R3 lands in the middle band, time becomes the main message |
| **Product** | "digital twin" per document (reebuild, G) | architecture v1: document → record with source → ledger (section 15) |
| | check catalogue: 1,000+ questions on 40+ trades with estimators (Kuro, G) | check catalogue electrical/HKLS with the insider, v0 with 100–200 check questions (assumption) |
| | version comparison and duplicates: "You always get everything again" (Kuro/Köster, G) | plan index diff and duplicate detection in the folder import |
| | correction sheet for the NU (reebuild, G) | counterpart: pre-check from the GU's perspective and supplementary sheet to the final invoice |
| | accounting export BMD/BRZ/RZL (reebuild, G) | check the BMD import format by end of January; in v1 Excel and ÖNORM |
| | "In the end, I decide" (Köster estimator, G) | approval of every line by the billing clerk remains mandatory |
| **Team** | Forward Deployed Engineers, "built onsite" (Kuro, G) | v1 is an internal tool. Maxi builds next to the insider, not for him. The first hire after the pre-seed is a former PL as Check analyst, not an SDR |
| | domain expertise in the founding team (both) | confirmed: the insider remains kill gate R1 |
| | one co-founder left (reebuild, Lind, G) | founders' agreement with vesting and leaver rules by Fri 6.11. remains mandatory |
| **Fundraising story** | Kuro: skilled labour shortage, "an industry that forgets faster than it learns", top logos, expansion into a platform (G). reebuild: hard volume figures, "Agentic Backoffice", expansion (G) | our story see 8.6 |
| | investor has known the founders for years (UVC at Kuro, G) | build contacts with construction investors loosely now, no raise before R5 |

### 8.4 What we do not adopt

| Pattern | Why not |
|---|---|
| cold telephone prospecting and outreach by email (reebuild SDR, G) | not permitted in Austria under § 174 TKG without consent. Whether reebuild mainly uses it for Germany is open (A) |
| real-time budget, warehouse, photo app, ESG data (reebuild) | live operation from the start has been rejected (section 12). The photo app with 2,350 daily users shows that construction site apps are used. But our reason for rejection was the mailbox and the daily triage by the PL. That is not enough to reopen it |
| AI chat as a core function (Kuro) | nice demo, but not a money job. At most later as "Ask the folder" for the billing clerk |
| estimating and bidding (Kuro) | Kuro reads tender documents. Our rejected "Kalkül" prices new bids from the archive, which is a different job. **No new evidence for Kalkül, remains parked** |
| room schedule, BIM, public procurement as a product (Kuro) | GU jobs. We use procurement data only internally, to address letters to winners of HKLS and electrical lots |
| platform story from day 1 ("AI ERP") | both started with a narrow job and only expanded after having customers |

### 8.5 Would the GU side be clearly better?

**No, not for us.** First the points that honestly speak for the GU side:
- **Demand is proven there.** Since its registration in autumn 2024, Kuro has 12 customers, including 6 of the 20 largest GUs. reebuild has 120+ customers. Neither says whether all of them pay and at what price. On the sub side there is no comparable evidence.
- **The money flows there:** 13 million € in two weeks for two GU or client tools.
- **Fewer, larger buyers** with an IT department. How high the contract values are is open.

Why we stay anyway:
- **The GU side is occupied.** Bids: Kuro, Cosuno. Invoice and NU review: reebuild. Change orders: Capmo, PlanRadar. There, teams with leadership experience in construction software or from construction families win. Three students without a network would run into a fight against funded teams there.
- **Our possible edge only applies on the sub side:** an insider from a subcontractor business, pricing from the sub's LV and K7, rule set per GU from the sub's perspective.
- **The other side having AI is our argument.** The more GUs check with AI, the more urgently the sub needs its own desk.

**What this means in concrete terms:** If R5 fails because subs do not pay, that is the strongest signal against the sub side. But a switch to the GU side would then not be an easy fallback, because it is occupied. The fallbacks remain as in v1 (section 13). The side switch is now listed as checked and rejected in section 12.

### 8.6 Our story for investors and competitions (draft)

> The clients are arming up. Kuro checks subcontractors' bids for the largest general contractors. reebuild checks every subcontractor invoice against the LV and construction contract for developers and construction companies and writes the correction sheet automatically. The electrical or HKLS business with 60 people still writes its final invoice from the memory of an overloaded project manager, and that is where its margin lies. Schlusswerk is its final invoice desk: every LV item reconciled in 10 days, every euro evidenced, before the invoice goes out. We never talk to the GU. The customer decides and sends.

Key figures we count from the first Check, following the pattern of reebuild's "530 million € invoice volume":
- checked contract sum in €;
- € found per million € of contract sum, coded by (a) to (d);
- days until the final invoice is paid.

For #glaubandich and the hackathon: the story stays with the problem and the synthetic demo, without invented findings.

---

## 9. Sales

**Channels for the first 10 customers:** everything legal under § 174 TKG, i.e. in person, letter, events, partners.

| Source | Target | How |
|---|---|---|
| 2 construction law firms plus 1 engineering office | 4 | personal visit with demo; "you keep the legal work"; no commissions |
| 2 guild (Innung) evenings (electrical and SHK, Vienna and Lower Austria) | 3 | topic "The money at the end of the project"; lawyer and insider speak, we show the demo; registration with consent |
| insider's network | 2 | personal introduction |
| letters to winners of public lots plus office visit | 1 | letter names the lot, offers a Check |

**Later:** ÖNORM and estimating trainers, customer days at wholesalers, trade fairs. Associations of the construction industry and GUs are not a channel.

**Cycle:**
- 1–3 months from the first meeting to the contract (unverified).
- About 10 sales weeks until Christmas.
- Between 20.12. and 6.1. the trades come to a standstill.

**Objections:**

| Objection | Answer |
|---|---|
| "We invoice everything anyway." | "Then the Check shows it in black and white." |
| "We need the next contract." | Daywork and quantities are billing, not a dispute. You trade from a complete list. **[new]** "Your GU already checks your invoice with software. Check it yourselves first." |
| "Data is confidential." | AVV, EU hosting, silo, project folder only, invisible to the GU |
| "Are you lawyers?" | No. Calculation and software; legal questions go to your lawyer |
| "AI makes mistakes." | Every item has evidence and a calculation path, the calculation is deterministic, the insider and the billing clerk review |
| "You are students." | The insider in the room and the number on your own project answer that |

---

## 10. Team

| Person | Focus until 31.1. |
|---|---|
| **Maxi** | R1 insider (priority), product (demo, v1), R3 with the insider |
| **Co-founder A** | R4 law and insurance, AVV, synthetic demo data, competitor demos, market count |
| **Co-founder B** | field: guilds, law firms, sub conversations, R2 folders, R5 payment, #glaubandich |
| **Insider** (from term sheet) | check catalogue, review of every Check, all customer meetings from December |

**Rules:**
- Founders' agreement by Fri 6.11.: 4 years vesting, 1 year cliff, leaver rules, who goes full time if the gates are passed.
- Commitment: 15–20 hours per person and week, key figures round every Sunday.
- **[new]** Maxi spends at most half of his time building while R1 is open. Lesson from the playbook: "The tool must not eat up the actual project."

**Insider (mandatory):**
- **Option A:** retired PL or head of billing (60–68), 2 days per week; 6–8 % equity, 3 years vesting, 6 months cliff, plus 30 % of every paid Check fee.
- **Option B:** active billing or change order manager (40–55); 15–20 % equity, full time after the pre-seed.
- **Where to search:** ÖNORM trainers, sworn experts, state guilds, wholesalers, TU institutes, Roman and all contacts.
- **Process:** letters, coffee, the candidate marks what is wrong in the demo, then a paid trial day.

**In addition:**
- retired estimator as advisor (0.5–1 %);
- construction law firm (no equity, no commissions);
- engineering office;
- insurance broker.

---

## 11. Risks and open questions

| # | Risk (red team) | Probability | Answer | Test |
|---|---|---|---|---|
| 1 | No folder | ~65 %, fatal | entry shortly before the final invoice; request via law firm, insider, guild | R2 |
| 2 | Money is deliberately left on the table | ~50 % | billing instead of dispute; final account meeting sheet | R3 |
| 3 | Success fees come late | ~70 % | at least 80 % fixed | R5 |
| 4 | Credibility without insider | ~70 % | insider as mandatory gate | R1 |
| 5 | Law and liability | ~40 % | Check as calculation, customer sends, law firm | R4 |
| 6 | Kalkül is just a feature | ~55 % | parked | — |
| 7 | Competition **[added: reebuild]** | ~45 % | counter-position, format depth, rule set per GU | demos by 6.11., now including reebuild |
| 8 | Market smaller than expected | ~60 % | Germany 2028, second trade 2030 | count 13.11. |
| 9 | Small exit | ~50 % | 80 % fixed, acquirers with a sub customer base | conversations at BAU 2027 |
| 10 | Timing | ~40 % | insider and folders before Christmas | 5 management meetings by 18.12. |

**Open questions:**
1. How much money per project is left "not noticed"? (R3)
2. Where do we find the insider, and what does the term sheet look like (including the pension question)?
3. How do we get 3 folders?
4. How many final invoices does a target company have per year?
5. What does the lawyer say about RAO, bonus, the engineering office route and § 174 TKG for letters and recruiting?
6. **[new]** What exactly do GU tools like reebuild cut? Ask at the demo meeting and among subs: who has already received an automatic correction sheet?
7. **[new]** Which import format does BMD have for outgoing invoices?
8. **[new]** Which EU region for the AI models, at what cost?

---

## 12. Rejected and why

Decided. Only reopen with new evidence and say so explicitly. The rows from v1 are carried over unchanged. New are the last three rows from 22.10.2026; there, the research on Kuro and reebuild brought no evidence for reopening.

| Rejected | Originally | Why rejected | What applies instead |
|---|---|---|---|
| **Kalkül as a module** | start month 9–12, 450–490 €/month plus 35–45 € per LV | attack 6 | parked until 15 paying annual desks are running **and** the estimator test passes |
| **Subscription per active project** | 95 €/project/month, min. 690 € | requires mailbox and daily triage from day 1 | subscription per **closing** project |
| **10 % success fee as standard** (originally 5 % on everything) | 10 %, cap 15,000 € | cash only in 2028–29, disputed, no ARR | min. 80 % fixed; bonus max. 8 %, max. 5,000 €, only after the lawyer's approval |
| **The word "Claim"**, name "Claimwerk" | "Claims X-ray" | sounds like a fight and legal advice | "Schlusswerk", "Schlussrechnung", "verrechenbar" |
| **X-ray of old projects as entry** | Check of a closed folder | mainly shows time-barred money | Check **before** the final invoice. A completed project serves only as proof for the insider and design partners (as with Kuro/Köster), not as a product sold |
| **Pure dispute desk** | entry at a cut final invoice | adversarial, legally more delicate | dispute package only through the law firm |
| **Live monitoring from the start** | mailbox, daily detection | PL and works council block it | live desk from year 2 after 2 Checks |
| **Enpal contacts as a customer source** | warm intros | B2C installers, wrong segment | contacts only for finding people; no Enpal data |
| **Germany before 2028** | start in year 2 via Bavaria | VOB/B, GAEB, cost-based pricing, RDG | from 2028 after 40 AT customers and a legal opinion |
| **Public lots as a targeting rule** | single-trade awards first | unverified | interview question only |
| **Commissions to or from law firms** | referral fees | presumably prohibited | no commissions |
| **Old market and revenue figures** | 810 million € DACH, 2.2 billion € EU, 20,000 € ACV etc. | inflated | 70–100 million € SAM, ACV 14,000 / 18,000–19,000 € |
| **Old recovery assumption** | 55 % to 80 % | invented | R3 measures |
| **Old exit expectation** | 25–50 million €, strong case 70–100 million € | required early strong growth | 10–40 million € |
| **Old gates** | K1 13.11., final decision 8.1. | too early | R1–R5, final decision 31.1.2027 |
| **Kalkül teaser and deadline countdown in the demo**, "10 % of money found" | old demo | Kalkül parked, live desk only in year 2 | demo shows Check, final account meeting, export |
| **[new] Switch to the GU side** | obvious after Kuro and reebuild | occupied by funded teams with domain expertise; our edge only applies on the sub side (8.5) | sub side; the GU AI is our argument |
| **[new] SDR and telephone sales following the reebuild pattern** | "Book a demo" machine with cold prospecting | § 174 TKG; students without an insider burn the market | in person, letter, events, partners; web form with consent |
| **[new] Platform story from day 1** ("back office AI for subs") | appear broader to investors | both role models started narrow | one job: the final invoice |

---

## 13. The five gates (unchanged)

| Gate | Test | Who | Date | Passed | Kill or pivot |
|---|---|---|---|---|---|
| **R1 Insider** | 15+ candidates, 8+ meetings, paid trial day for the top 2 | Maxi | term sheet Fri 20.11., hard limit Fri 4.12. | equity agreement with an insider matching the profile, at least 1 day per week, in all customer meetings from December | no insider by 4.12.: stop |
| **R4 Law** | 1-hour legal opinion on construction law, Vienna; broker quote 1 million € | Co-founder A | Fri 4.12. | in writing: Check, ledger, valuation not reserved; premium max. 8,000 €/year | core Check reserved: stop. Bonus not permitted: fixed price only. No insurer: billing completeness only |
| **R2 Folders** | request to 8 companies via law firms, insider, guild; AVV | Co-founder B + insider | Fri 11.12. | 3+ folders from 3+ companies, each 70 %+ usable | max. 1 folder or under 50 % usable: stop. 2 folders: extend once by 2 weeks |
| **R3 Money** | 3 Checks, code every euro (a) to (d) | Maxi + insider | Fri 22.1.2027 | on 2 of 3 projects (a) ≥ 30,000 € **or** 1.5 % of the contract sum, **and** (a) ≥ 50 % of all findings | median (a) under 0.75 % or (a) under 40 %: stop. In between: S tier, retest by 31.3. |
| **R5 Payment** | offer fixed-price Check and annual desk | Co-founder B | Fri 29.1.2027 | 2+ companies pay ≥ 1,500 € each **and** 1+ annual desk or letter of intent | 0 paid: stop. 1 without letter of intent: stop, unless R3 was at the top |

**Final decision Sun 31.1.2027:**
- All five passed: full time and raise money.
- One in the pivot band: another 8-week round on the pivot.
- Two or more failed: Schlusswerk is dead. Fallbacks are the acceptance and inspection register for energy installations or the property management service.

---

## 14. Plan until 31.1.2027, week by week

**Abbreviations:**
- **M** = Maxi, **A** = Co-founder A, **B** = Co-founder B, **I** = insider (from term sheet);
- **Build** = product work (details in section 15).

**Fixed rhythm:** every Sunday a 30-minute key figures round covering conversations, letters, candidates, folders and build status. Then update `_STATUS.md`.

| CW | Dates | M | A | B | Build | Deadline / gate |
|---|---|---|---|---|---|---|
| 43 | Thu 22.–Sun 25.10. | go through dossier v2 with the team; set up repo outside OneDrive and `Umfang_v1.md` | draft founders' agreement | draft #glaubandich text | define demo click path; start generator for synthetic data | |
| 44 | 26.10.–1.11. (Mon public holiday) | insider list 15+; 25–30 letters out by Fri 30.10. | synthetic data finished (including fictitious GU correction sheet); list 10 law firms; fix lawyer appointment for CW 48 | submit #glaubandich; visit state guilds Vienna/Lower Austria in person or write to them (letter) | **Demo v0.9:** ledger, evidence panel, three lists, precomputed | **#glaubandich Sat 31.10.** |
| 45 | 2.–8.11. | 8+ coffee meetings, candidate marks errors in the demo | demos at PlanRadar, Capmo, NEVARIS, ABK **and reebuild** (openly as a founding team); visit 5 law firms (with B) | 6 sub conversations with interview guide and folder question; coding scheme (a)–(d) finished | demo v1.0 hackathon-ready (final account meeting sheet, pre-check from GU perspective, export); v1 data model | **Founders' agreement Fri 6.11.** |
| 46 | 9.–15.11. | trial days for the top 2; hackathon (planning assumption mid-Nov.) | market count: 30 projects, sizes in WKO Firmen A–Z; broker request for insurance | further sub conversations; finalise AVV template with A | v1: LV parser (ÖNORM A 2063 and PDF), Aufmaß Excel | **Market count Fri 13.11.** |
| 47 | 16.–22.11. | term sheet to the best candidate | list of questions to the lawyer in writing | folder request to 8 companies via law firms, candidate and guild, with AVV | v1: daywork scans (OCR, signature status), invoices, ledger calculation core | **R1 term sheet Fri 20.11.** |
| 48 | 23.–29.11. | sign insider contract; with I the check catalogue v0 (100–200 questions) | lawyer's opinion (1 h); insurance quote | follow up on folders; fix guild evening January/February with lawyer | v1: pricing LV × K7, mail extraction, evidence package PDF | |
| 49 | 30.11.–6.12. | trial run of v1 with I on synthetic data and an anonymised project from I | record R4 in writing | book management meetings for CW 50–51 | **v1 freeze Sun 6.12.** (section 15) | **R4 and R1 hard Fri 4.12.** |
| 50 | 7.–13.12. (Tue public holiday) | start 3 Checks (M rebuilds, I reviews) | have AVVs signed; EU region of the AI models confirmed | collect folders; interim status to the partners | fix errors from real folders; test system with synthetic data only | **R2 folders Fri 11.12.** |
| 51 | 14.–20.12. | Checks running; finish what is possible before the break | competition update (reebuild, PlanRadar, Capmo) | 5 management meetings by Fri 18.12. | plan index diff, duplicate detection | 5 management meetings |
| 52–53 | 21.12.–3.1. | no sales meetings; build v1.1 | break | break | v1.1: pre-check from GU perspective on real data, Excel and ÖNORM export, check BMD format, coding form in the tool | |
| 1 | 4.–10.1. | from Thu 7.1.: deliver Check 1, coding session (with I and B) | prepare trade fair and BAU meetings (acquirer conversations) | offer documents: fixed-price Check, annual desk S/M/L | fixes from Check 1 | |
| 2 | 11.–17.1. | deliver Checks 2 and 3, coding sessions | legal questions from the Checks to the law firm | offers to design partners after each delivery | key figures evaluation (findings by a–d, hours per Check) | |
| 3 | 18.–24.1. | evaluate R3, have the figures independently verified | briefly map pre-seed and funding options (aws, Wirtschaftsagentur) | follow-up, signatures | freeze on new features | **R3 money Fri 22.1.** |
| 4 | 25.–31.1. | prepare final decision (dossier v3) | | incoming payments, letters of intent | | **R5 Fri 29.1., final decision Sun 31.1.** |

**If a gate fails:** The kill rules from section 13 apply immediately, not only on 31.1. Without an insider on 4.12., building stops.

---

## 15. What we build: demo and v1

### 15.1 Principles

- **Two stages, one codebase:** The demo is v1 with synthetic data and a precomputed fallback. v1 is the internal tool with which M and I perform real Checks.
- **v1 has no customer access.** The customer receives a report (PDF), an Excel file and the export file. This is the Kuro "Forward Deployed" pattern: we operate the tool ourselves and learn in the process what customers will later operate themselves.
- **Architecture following the reebuild pattern** (screenshot "How reebuild works"):

  ```
  Folder → [1 Ingest] → [2 Record per document, with source] → [3 Reconcile with LV, Aufmaß, Regie, invoices, contract] → [4 Review and approve] → Report, lists, evidence package, export
  ```

- **The AI supplies facts with sources, the calculation is code.** Every number in the report is clickable and leads to the original (file, page, location).
- **Data protection:**
  - test system from day 1, with synthetic data only;
  - real folders only in the EU environment, separated per company;
  - deletion after end of contract;
  - Git repository not in OneDrive.

### 15.2 Demo (synthetic, by 31.10. or the hackathon)

**Dataset:** "Residential complex Vienna 21, building plot B, HKLS lot, 1.24 million €, fictitious GU". It contains:
- an LV with 380 items and K7 sheets;
- Aufmaß;
- 16 daywork reports (11 invoiced, 3 signed but not invoiced, 2 not signed);
- 3 interim invoices;
- 60 emails;
- 40 photos with EXIF;
- plan indices C, D and E;
- a GU deduction letter;
- **[new]** a fictitious automatic GU correction sheet.

**Script (3 minutes):**

| Time | Screen | Line |
|---|---|---|
| 0:00–0:20 | "Final invoice due in 9 days" | "Contract of 1.24 million € completed. Before the invoice goes out, we look at what the company really earned." |
| 0:20–1:00 | drag the folder in; documents become records, the ledger fills up | "LV, Aufmaß, daywork, emails, plans, photos. Read and reconciled." |
| 1:00–1:40 | **Billable now: 27,410 €**; click on a quantity overrun: plan index C→D, email "please do this at the same time", photo, 14 × unit price plus K7 = 6,384 € | "No dispute. Work that was done and not invoiced." |
| 1:40–2:10 | **[new] Pre-check from the GU's perspective:** 4 items the GU would cut, with missing evidence | "Your GU checks with software. Check it yourselves first." |
| 2:10–2:40 | final account meeting sheet with floors; one item "needs a lawyer" | "If you trade, then from the complete list." |
| 2:40–3:00 | export; price; insider (only if signed) | "8–15 projects per year. None closes short." |

### 15.3 v1: internal Check tool (freeze Sun 6.12., v1.1 by 6.1.)

| Component | By | Content |
|---|---|---|
| Folder import | CW 46 | upload files, detect type, detect duplicates and versions (plan index) |
| Record per document | CW 46 | fields with source (file, page, location); manual correction by M/I is saved |
| LV and Aufmaß | CW 46 | ÖNORM A 2063 (buy the specification from Austrian Standards, cost unverified), PDF LV, Aufmaß Excel |
| Daywork and invoices | CW 47 | OCR, signature status, hours and material; interim invoices and payments |
| Ledger calculation core | CW 47 | deterministic, with tests on the synthetic data |
| Pricing | CW 48 | LV unit price × quantity; K7 labour minutes for additional quantities |
| Emails and plans | CW 48 | find instructions in emails; plan index list (automatic diff in v1.1) |
| Check catalogue v0 | CW 48–49 | 100–200 check questions electrical/HKLS with I (assumption regarding the number); every correction becomes a rule |
| Outputs | CW 49 | report (PDF), three lists, evidence package per item, final account meeting sheet, coding form (a)–(d), Excel |
| v1.1 | 6.1. | pre-check from GU perspective, ÖNORM export, BMD format checked, plan index diff |

**Not in v1:**
- customer login;
- mailbox integration or live desk;
- photo app;
- AI chat;
- automatic deadline calendar and § 1170b tracker (if needed as a manual spreadsheet);
- DWG;
- GAEB and Germany;
- Kalkül;
- bonus billing.

**Measure per Check:**
- hours M and hours I;
- pages and documents;
- share of fields corrected by hand;
- € found by (a) to (d);
- days until the final invoice is paid.

---

## 16. Start prompt for a new chat

> First read `_STATUS.md` and `Schlusswerk Dossier v2.md` in the project folder, completely, including section 12 "Rejected". We are three students in Vienna (Maxi, WU Wien, builds with AI coding agents, plus two co-founders, none with a construction background) and are building Schlusswerk, a final invoice desk for Austrian electrical and HKLS subcontractors. Dossier v2 is the decided state. Do not propose anything from section 12 again unless you have new evidence and say so explicitly. Everything marked "(unverified)", "(assumption)", S or A is unchecked. Today is [date]. Since the dossier, the following has happened: [gate status, insider, folders, conversations, figures]. Help us now with: [task, e.g. week X from section 14]. German, direct, without filler phrases. Sales: no cold emails, no cold calls (§ 174 TKG).

---

## 17. Sources

**Kuro and reebuild:** complete list with labels in `research_notes/Kuro_reebuild_Fakten.md`. Most important sources:

- Kuro:
  - [kuro.technology](https://www.kuro.technology), [Reference Köster](https://www.kuro.technology/referenzen/koester), [Reference Geiger](https://www.kuro.technology/referenzen/geiger), [About](https://www.kuro.technology/about), [Join us](https://www.kuro.technology/join-us)
  - Press: [startbase](https://www.startbase.de/news/10-millionen-euro-finanzierungsrunde-fuer-kuro/), [dealroom](https://dealroom.co/news/157842-kuro-raises-10m-to-build-the-ai-backbone-for-construction-contractors/), [Adlershof 2024](https://www.adlershof.de/en/news/kuro-a-new-start-up-is-breathing-life-into-the-construction-industry)
- reebuild:
  - [reebuild.com](https://www.reebuild.com), [Bauunternehmen](https://www.reebuild.com/bauunternehmen), [Projektentwickler](https://www.reebuild.com/projektentwickler), [Über uns](https://www.reebuild.com/ueber-uns)
  - Press: [Trending Topics 2026](https://www.trendingtopics.eu/reebuild-3-millionen-euro-seed/), [Trending Topics 01/2023](https://www.trendingtopics.eu/reebuild-gruender-von-planradar-und-storebox-steigen-in-pre-seed-startup-ein/), [Trending Topics 09/2023](https://www.trendingtopics.eu/reebuild-investment-hansmann-steinberger-angels-proptech)
  - Job ads: [JOIN SDR](https://join.com/companies/reebuild/16366213-sales-development-representative-german-speaking), [JOIN Founders Associate](https://join.com/companies/reebuild/16425146-founders-associate-german-speaking)

**All further sources** (law, market, competition, exits) remain unchanged in v1, section 18.
