# Schlusswerk: Dossier v3

**As of:** Thursday, 22 October 2026 (revised 16:00: twin for the whole company, project twins inside it)
**For:** Maxi, the two co-founders and every new AI chat without prior knowledge.
**Relationship to v2:** `archiv/dossier-v2.md` stays unchanged as an archive. v3 adopts all decisions from v2, except where they are explicitly changed in Section 0.1. What is new is the core product: a digital twin for the whole company, in which every project has its own project twin. The first application on it is the final invoice (Schlussrechnung). Markers: **[new v3]** and **[changed v3]**. Where v2 and v3 differ, v3 applies. The profiles of Kuro and reebuild (v2, Sections 8.1 to 8.6) are now in `research_notes/Kuro_reebuild_Fakten.md`. The sources on law and market remain in v2.

**Labels:** **(unverified)** = experience or general knowledge without a checked source. **(assumption)** = model assumption, must be measured. **G / S / A** for sources as in v2. **(earlier chat)** = fact from the research of 22 Oct, sources in Section 17, not rechecked.

**Terms:** **Company twin (Firmen-Zwilling)** = the twin of the whole business. **Project twin (Projektzwilling)** = the twin of one project, contained in the company twin. **Twin (Zwilling)** on its own means both together. **Application (Anwendung)** = a job that runs on the knowledge in the twin (use case).

---

## 0. The core product on one page

> **Schlusswerk is the digital twin of an electrical or HVAC/plumbing (Elektro or HKLS) subcontractor business.** It brings the knowledge about the whole business together in one knowledge base: customers, contracts, prices and all projects. You open the company twin, go into a project and find the project twin there with its analyses and applications. **The first application is the final invoice (Schlussrechnung):** the project twin knows what was built, changed, instructed and paid. From this the final invoice is produced, and the company knows what it should really bill.

```
              Connect  ·  Import  ·  Call in
                            ↓
┌────────────────────────────────────────────────────────┐
│  COMPANY TWIN  (the whole business)                    │
│  Customers and GUs, contracts, rulebook and history    │
│  per GU, price basis (K7), LV archive, all projects    │
│                                                        │
│   ┌────────────┐  ┌────────────┐  ┌────────────┐       │
│   │ Project A  │  │ Project B  │  │ Project C  │  ...  │
│   │   twin     │  │   twin     │  │   twin     │       │
│   └────────────┘  └────────────┘  └────────────┘       │
└────────────────────────────────────────────────────────┘
                            ↓
       Applications: final invoice (first), more later
```

| Question | Answer |
|---|---|
| **What is it?** | A twin for the whole business. You can go into every project and find its project twin there |
| **What does it deliver?** | Applications on the collected knowledge. The first: money for work that was performed but not billed is found and documented as a final invoice |
| **How does the knowledge get in?** | **Connect (Anbinden)** (ERP, CRM, emails, calls), **Import (Einspielen)** (files, plans, when there is no system), **Call in (Zurufen)** (photo and voice message via WhatsApp to an agent) |
| **How is it sold?** | **Check** (one project, retroactively), **Desk** (all closing projects, the twin grows), **Live** (filled continuously) |
| **For whom?** | Electrical and HVAC/plumbing businesses in Austria with 30 to 150 people that build for general contractors (GUs), property developers (Bauträger) and public clients |
| **Why should this work?** | Lead hypothesis (assumption): a lot on construction sites happens informally, by phone, by word of mouth and via WhatsApp, and is documented nowhere. Without this context no final invoice can be backed up. Whoever formalises it has a data foundation that neither the ERP nor GU tools have |
| **What do we build on?** | On top of the existing ERP and CRM. We replace nothing. If there is no system, data is imported manually |

**The decisions in five points:**
1. **The subcontractor side.** The GU side is taken (Kuro, reebuild, Capmo, PlanRadar). The fact that GUs check with AI is our argument (v2, 8.5).
2. **Entry via the Check, gates unchanged.** The Check builds the first project twin from a project folder and delivers the final invoice. From this the company twin grows project by project.
3. **Build in stages.** Stage 0 is enough for all gates. Call-in via WhatsApp and connection come afterwards (Section 15).
4. **What is sold first is the money.** The twin is the core product, but an owner first buys the result of the final invoice. The twin is the explanation of why it works, and the outlook (Section 9). This is a recommendation, not a decided rule.
5. **New risks [new v3]:** larger build scope, a bigger step of trust for data access, data protection and works council for WhatsApp, dependence on ERP interfaces, loss of focus. Section 11.

### 0.1 Changes compared with v2

| Topic | v2 | v3 | Note |
|---|---|---|---|
| Core product | Final invoice Desk, Check in 10 working days | Twin for the whole company with project twins, final invoice as first application | The Check remains the entry (Stage 0) |
| Knowledge base | Ledger per project, history per GU only in the Annual Desk | Company level with customers, rulebook, history per GU, price basis, LV archive and all projects | grows with every project |
| Live capture | rejected from the start, Live Desk only in year 2 | Call-in via WhatsApp and connection are part of the product, built in Stages 2 and 3 | Resumed without new evidence, as a team decision of 22 Oct. The old reasons are listed as risks in Section 11 |
| Data sources | file exports only, no API in v1 | Stage 0 still files, connection from Stage 3 | Gates need no connection |
| Data access | "only the project folder" | Entry still with one released project folder. The company twin grows only with projects the company releases | Trust argument stays, wording changes |
| Photo and capture | do not adopt a photo app | Capture by photo yes, via WhatsApp instead of our own app | no new app |
| Platform story | not from day 1 | The twin is core product and architecture, proven and sold through one job | Section 9 |
| Customer access | none in v1 | WhatsApp from Stage 2, read-only web view from Stage 2 (assumption) | We operate Stages 0 and 1 ourselves |
| Output | lists, evidence package (Beweispaket), final meeting sheet (Schlussbesprechungs-Blatt) | additionally **draft of the final invoice** | Legal question for the lawyer (R4) |
| Coding of findings | (a) to (d) | additionally **source of the evidence** | measures the lead hypothesis |

**Unchanged from v2:** subcontractor side, gates and dates, entry prices, legal guardrails, never contact the GU, no word "Claim", insider as mandatory gate, no cold calling (§ 174 TKG), estimating (Kalkül) parked, Germany only from 2028.

---

## 1. The business in brief

**Offer:** Check 1,500 to 3,500 € per project. Desk 800 to 2,500 € per month for all closing projects. Live (continuous capture via call-in and connection) comes in year 2 as a surcharge. At least 80 % of revenue is fixed.

**Boundaries:** Schlusswerk never writes to the GU. The agent only talks to employees of the customer company. Disputes go through a partner law firm. The word "Claim" appears in no customer material. There is no evaluation per employee.

**Incorporation:** The company only exists once a construction insider signs with equity (at the latest Fri 4 Dec 2026). Five gates decide by Sun 31 Jan 2027 (Section 13).

**Exit:** Realistically, if successful, 10 to 40 million €. The chance of an exit above 10 million € by October 2032 is about 3 % today, 18 to 20 % after passing the gates, and below 0.5 % for above 100 million €. The twin makes a platform story possible but does not change these numbers until willingness to pay for further applications has been measured. Whether this satisfies the goal "YC and unicorn" is something the team must decide consciously (open fundamental question).

---

## 2. Problem and customer

**Problem:** At the end of a project, subcontractors lose money they have already earned:
- daywork (Regie) that was performed but not billed or never signed;
- quantity overruns that are not in the quantity survey (Aufmaß) (in unit price contracts this is billing, not a change order (Nachtrag));
- agreed price escalation and metal surcharges;
- changes that were notified but never priced.

**Causes:**
- An overloaded project manager (PL) writes the final invoice late and from memory (unverified).
- There is a shortage of skilled workers: in building electrics more than 70 % of vacancies remain unfilled ([KOFA 07/2026](https://www.iwkoeln.de/fileadmin/user_upload/Studien/KOFA_kompakt_und_Studien/2026/KOFA_Kompakt-07-2026-Handwerk.pdf)). When a PL leaves, his knowledge leaves with him (assumption; Kuro argues similarly, G in v2).
- The data is scattered: in the ERP, in emails, on paper, in photos, in people's heads.
- Much is not documented at all because it happens informally (lead hypothesis below).
- Part of it is deliberately traded away in the final meeting (Schlussbesprechung). How large this part is, Gate R3 measures.

**Lead hypothesis (assumption by Maxi, not yet measured):** In construction a lot of communication is informal: phone calls, word of mouth on site, WhatsApp, "we know each other". As a result little is documented, and the AI lacks context. An application like the final invoice, however, needs exactly this context: what was instructed and carried out, when, by whom and how? Conclusion: first formalise (twin), then build applications on top.
Test: subcontractor interviews ("Where is this recorded today?") and source coding from R3 (Section 15.5).

**Why now:** Clients check with AI. reebuild reads subcontractor invoices line by line against the bill of quantities (LV), construction contract and quantity survey and automatically generates a correction sheet (G, [reebuild Projektentwickler](https://www.reebuild.com/projektentwickler)). Kuro checks subcontractor bids for the largest GUs. The subcontractor still writes by hand.

**Wedge customer:**

| Attribute | Definition |
|---|---|
| Trade | HVAC/plumbing or electrical; start with the insider's trade |
| Size | 30 to 150 people, ideally 40 to 100; 5 to 25 million € revenue |
| Business | at least 60 % ÖNORM B 2110 contracts with GUs, property developers and public clients |
| Volume | at least 8 final invoices per year, contracts 150,000 € to 3 million € (unverified per company) |
| Region | Vienna and Lower Austria (NÖ) first, Upper Austria (OÖ) and Styria from mid-2027 |
| Systems | ERP, AVA or CRM present or not: does not matter, import always works. Which systems target customers use is unverified (question in subcontractor interviews) |

**Roles:**
- **Signs:** owner or commercial management. He is also the main user of the company twin.
- **Champion:** the billing clerk (Abrechner) or a senior PL.
- **Blocker:** a PL who feels controlled; the works council; site foremen (Poliere) and fitters (Monteure), if they perceive call-ins as surveillance.

**Trigger:** A final invoice is due in 4 to 8 weeks, or a GU has cut a final invoice in the last 12 months. We handle the second case only through the law firm.

---

## 3. Product

### 3.1 Structure: company, project, application

| Level | What | Content |
|---|---|---|
| **Company twin** | the whole business | Customers and GUs with contracts, rulebook and history per GU; price basis (K7 sheets, costing rates); LV archive; company-wide documents; list of all projects with status |
| **Project twin** | one project | LV, quantity survey, daywork, plans, emails, calls, photos, call-ins, invoices, payments, progress, costs |
| **Application** | a job on the knowledge | at project level: final invoice (first). At company level: portfolio, history per GU and more (3.7) |

**Navigation:** You start in the company twin, see all projects with status and money, go into a project and are in the project twin with its analyses and applications. From there you go back to the company level.

**The company twin grows with every project.** It emerges from the project twins and from the connected systems. After the first Check it contains one project. With the Desk it grows by every closing project, in Live operation by all running ones.

**Four principles:**
1. **Every statement has a source:** file, page, location. For call-ins: message, photo, audio recording.
2. **The AI delivers facts and suggestions, a human confirms, the invoice is deterministic code.**
3. **The twin has a memory:** nothing is overwritten. Every change is a new version with timestamp, origin and status (draft, confirmed, rejected).
4. **The twin belongs to the company:** data silo per company, release per project, roles and permissions (assumption), deletion at contract end.

**Guardrail on personnel data [new v3]:** Employees appear in the twin only as sender and role. There is no personnel, payroll or performance data on individuals and no evaluation per employee (§ 96a ArbVG). Labour minutes come from the K7 sheets, not from individuals.

**Scope boundary:** The twin replaces no ERP and no CRM. The ERP remains the lead system for master data and accounting. The twin reads, adds and returns results via export files (Excel, ÖNORM, check BMD format).

### 3.2 Three ways into the twin

| Way | What comes in | How | Stage |
|---|---|---|---|
| **Connect** | master data, customers and GUs, projects, LV, quantity survey, invoices, payments from ERP, AVA or CRM; emails and calendar; recorded calls (as transcript) | interface or export per system. Emails first via a project forwarding address (assumption), mailbox connection later | 3 (in Stage 0 via file) |
| **Import** | per project: PDFs, plans with revision index, Excel, scans, emails (.msg/.eml), WhatsApp export, photos with EXIF, contracts. Company-wide: framework contracts, K7 sheets, LV archive | upload by the company or by us | 0 |
| **Call in** | photo and voice message from the site, later text and location | WhatsApp number with agent (3.4) | 2 |

Note: The assumption that emails are synced with the ERP and therefore end up in the twin by themselves is unchecked. In many businesses emails sit in the mailbox, not in the ERP (unverified). Open question 9.

### 3.3 What is in the twin

**Company level:**

| Object | Examples |
|---|---|
| Company | trade, locations, user roles (without personnel data) |
| Customer and GU | contact persons, framework contracts, rulebook (ÖNORM B 2110 plus deviations), history: cuts, accepted change orders, payment behaviour |
| Price basis | K7 sheets, costing rates, unit prices from earlier LVs |
| LV archive | earlier bills of quantities and bids |
| Project list | all projects with status, contract sum, open amount, next deadline |

**Project level:**

| Object | Examples |
|---|---|
| Project and contract | construction contract, rulebook, price basis, deadlines |
| LV item | quantity, unit price, K7 labour minutes, status performed / billed / paid |
| Performance event | quantity survey, daywork, additional quantity, change, call-in |
| Document | plan with revision index, minutes, delivery note, contract |
| Money | interim invoice (Abschlagsrechnung), payment, retention (Einbehalt), incoming invoice (material) |
| Communication | email, call transcript, WhatsApp message |
| Media | photo, audio recording |

Every object carries source, timestamp, channel, status and confirmed-by.

**Progress and costs:** Progress is the performance status per LV item against the LV quantity. Costs (incoming invoices, delivery notes, labour minutes from daywork) are kept as a data basis, above all for daywork and material. This does not mean a real-time budget or controlling module, which stays rejected until an application needs it.

### 3.4 Call-in via WhatsApp

**Flow:**
1. A fitter or site foreman sends a photo and/or voice message to his company's Schlusswerk number. Example: "Socket in room 5 moved, the client wanted it that way, two men, six hours."
2. The agent converts the speech to text and reads the photo.
3. It assigns: project (it knows the company's active projects from the company twin), area or room, LV item or "new item", quantity, effort, who instructed it. If something is unclear, it asks briefly ("Which site: A, B or C?", "Who instructed this?").
4. It sends a summary back. The sender confirms with one tap.
5. The project twin creates a performance event. Photo, audio and transcript are attached as the source.
6. Entries that count for billing but still need evidence (for example a GU signature on the daywork report) are on the "open" list. The billing clerk sees them in the close-out run (Abschluss-Lauf).

**Rules:**
- The agent only talks to employees of the customer company, never to the GU.
- The agent records, it never decides on billability.
- No evaluation per employee, no scoring (§ 96a ArbVG). The sender is only the origin of the entry.
- Participation is voluntary per employee. A route without WhatsApp (upload link) must be provided (assumption).
- No new tool for the PL: the agent does the triage, not the PL.

**Why it can work (assumption):** Sites already communicate via WhatsApp. A call-in takes seconds and can later be used as a source for billing, even if no daywork report was ever written.

**Open points, all unchecked:**
- Meta's WhatsApp Business Platform is required: activation, costs, messaging rules (unverified).
- WhatsApp usually strips EXIF data from images. The timestamp then comes from the message timestamp, and the evidential value is lower than for an original photo from the folder (unverified, test).
- Understanding voice messages in Austrian dialect and with site jargon: test the quality (assumption).
- Data protection: Meta as processor, employee data, people in photos, data processing agreement (AVV). Questions for the lawyer (Section 4).

**Usage rule:** Prototype on synthetic data. Real customer data via WhatsApp only after R4 (law) and after clarification with the pilot customer's works council.

### 3.5 Making the twin visible

| Level | View | Content | Stage |
|---|---|---|---|
| Company | Project overview | all projects with traffic light, open billable amount, upcoming final invoices, deadlines | 1 |
| Company | GU history | per GU: cuts, accepted change orders, payment behaviour | 1 (after the first projects) |
| Project | Evidence panel | every number leads to the original (file, page, location; for call-ins photo and audio) | 0 |
| Project | Ledger | LV item with performed, billed, paid (traffic light) | 0 |
| Project | Timeline | all events in order: email, daywork, photo, call-in, plan revision index, invoice, payment | 1 |
| Project | LV tree | areas with status: where is money open? | 1 |
| Project | Plan view with pins | photos and call-ins located on the plan or floor (needs plans as image or BIM) | 3 (assumption) |

We operate Stages 0 and 1 ourselves; the customer receives a report, Excel and export. From Stage 2 there is a read-only view for billing clerks and owners (assumption). For the website these views are the visual material.

### 3.6 Application 1: final invoice (project level)

**Two operating modes:**
- **Retroactive (Check, Stage 0):** The company hands over the project folder. We build the project twin from it and run the close-out run. Entry product, shortly before the final invoice, 10 working days. This is the Check from v2.
- **Continuous (from Stages 2 and 3):** The project twin is filled during the project. The close-out run then needs less time (assumption, measured value after the first pilots).

**Close-out run:**
1. **Handover and ingestion:** AVV signed beforehand. Every document becomes a record with source; duplicates and new versions are detected.
2. **Contract profile:** rulebook, price basis, deadlines. The GU's rulebook and history come from the company twin (still empty for the first project). Where the contract is ambiguous, the earliest plausible deadline applies. Schlusswerk never says whether a deadline is preclusive.
3. **Completeness:** open drafts, daywork without signature, gaps in the plan revision index, missing evidence.
4. **Reconciliation:** LV × quantity survey × daywork × call-ins × invoices × payments. The AI delivers the facts, the invoice is code.
5. **Detection:** daywork not signed or not billed; quantities above the LV quantity; plan revision index changes; instructions in emails and call-ins; agreed price escalation.
6. **Pricing:** from the company's own LV unit price and the K7 labour minutes (price basis in the company twin).
7. **Pre-check from the GU's perspective:** the same checks as a GU tool runs on one's own invoice: items without quantity survey proof, daywork without signature, calculation errors, items outside the LV, missing evidence for retentions and discounts.
8. **Draft of the final invoice:** all items with quantity, price, surcharges, escalation, deductions, interim payments, retentions and payable amount. Every line has evidence.
9. **Review by the insider** before every delivery, **approval of every line by the billing clerk, sending by the company itself.**
10. **Coding session** (with design partners, 45 minutes): every euro found is coded as (a) not noticed, (b) left for the sake of the relationship, (c) traded in a settlement or (d) contractually excluded. In addition, the source of the evidence (15.5).
11. **Learning:** every correction by the insider becomes a rule in the check catalogue (Schlusswerk) or in the rulebook per GU (company twin). The project remains in the company twin, even after the final payment.

**Order of items:** 1. daywork, 2. quantity overruns, 3. price escalation, 4. notified changes. Disruption, acceleration and disputed clauses go only through the lawyer.

**Inputs Stage 0:** ÖNORM A 2063 LV or PDF, K sheets, quantity survey (Excel/PDF), daywork scans, interim invoices and payments, plans with revision index, emails (.msg/.eml, only the project folder), WhatsApp export, photos with EXIF, contracts.

**Outputs:**
- Ledger per LV item;
- three lists (billable now / notified and open / lost);
- evidence package per item with a link to the original;
- pre-check from the GU's perspective;
- final meeting sheet with a floor per item;
- draft of the final invoice;
- export: Excel, ÖNORM, check BMD booking import (reebuild connects BMD, BRZ, RZL, G).

### 3.7 Further applications (candidates, not decided)

Not part of the gates and not before R5. Each is decided individually.

**At project level:**
- Draft notifications for daywork and changes that the PL sends himself (v2: Live Desk).
- Interim invoices from the performance status.
- Deadline calendar and security tracker under § 1170b ABGB.
- Acceptance and handover documentation.

**At company level (only possible because the twin knows the whole business):**
- Portfolio: open billable amount, upcoming final invoices and deadlines across all projects.
- History and rulebook per GU: what does which GU cut, what does he accept, how does he pay?
- Project status for the owner: progress and costs per project.
- Securing knowledge: the project history stays in the business when a PL leaves (assumption).
- "Ask the twin": natural language query, at most as a helper function, never as a core function.

**Later, not before year 2 (Stratos pattern: internal plus external data):** external data in the twin, for example construction price indices for price escalation or public tenders (unverified).

**Parked:** Estimating (Kalkül) (pricing bids from the LV archive). The LV archive in the company twin makes it technically obvious; the rule from v2 stays: only after 15 paying Desks and a passed estimator test.

### 3.8 Offers: Check, Desk, Live

| Offer | What the company gets | State of the twin | When |
|---|---|---|---|
| **Check** | one project retroactively from the project folder: project twin, close-out run, all outputs from 3.6 | 1 project | from launch |
| **Desk** (Annual Desk, Jahresdesk) | every closing project and every partial final invoice; project overview, history per GU, deadline calendar after the final payment, security tracker under § 1170b ABGB | grows with every project | from the first paying customer |
| **Live** (Twin Live) | call-in via WhatsApp, connection to ERP and emails, continuous detection | all running projects | year 2, after 2 delivered Checks and passed R4 |
| Dispute package | same engine, legal assessment by the partner law firm; customer pays both directly | as needed | only through the law firm |

### 3.9 What Schlusswerk never does

- contact the GU, not even through the agent;
- legal assessment or statements on preclusion;
- debt collection or assignment;
- bonus on disputed amounts;
- pool prices between companies;
- assess employees or evaluate per employee;
- replace an ERP or CRM;
- let the agent decide on billability;
- the word "Claim" in customer material.

---

## 4. Law (design hypothesis, not legal advice)

Read in the statutory text (RIS): § 134 GewO, § 1170b ABGB, § 879 ABGB. Everything else is unverified until the legal opinion is available (Gate R4, Fri 4 Dec).

| Rule | Consequence for Schlusswerk |
|---|---|
| § 8 RAO (representation of parties, unverified) | Core question for the lawyer: are Check, ledger, valuation **and draft of the final invoice** a reserved activity? |
| Unauthorised legal drafting (Winkelschreiberei) (unverified) | draft no legal instruments; templates come from the customer |
| § 134 GewO (read) | Engineering offices may advise and calculate; this fits the valuation. Possible licensing route via the insider (unverified) |
| § 879 Abs 2 Z 2 ABGB (read) | never a share in litigation; bonus only on undisputed paid items |
| § 1170b ABGB (read) | security for payment (Sicherstellung) up to 20 % (under 3 months 40 %), cannot be waived; feature in the Desk |
| § 174 TKG 2021 | no advertising emails and no advertising calls without prior consent, also to businesses; even a call that only asks for consent is not permitted (read: [WKO](https://www.wko.at/noe/internetrecht/e-mail-fax-telefonwerbung-telekommunikationsgesetz-detail); checker: RIS § 174 and § 4 Z 13). Ask the lawyer before every electronic message. Whether replies and follow-up questions from the WhatsApp agent to customer employees fall under it is unverified |
| § 96a ArbVG | no PL scoring. Possible works agreement for call-in capture if a works council exists (unverified) |
| GDPR for WhatsApp | Meta as processor, employee data, people in photos, third-country link, AVV (unverified) |
| **[new v3]** GDPR for the company twin | The twin contains personal data of third parties (contact persons at the GU, emails) and grows across projects. Purpose limitation, roles and permissions, deletion concept (unverified) |
| Recorded calls | Recording probably needs the consent of those involved. We only read recordings the customer lawfully holds and have this confirmed in writing (unverified, lawyer) |

**List of questions for the lawyer (CW 47 in writing, legal opinion CW 48):**
1. § 8 RAO and Winkelschreiberei: Check, ledger, valuation, draft of the final invoice.
2. Success bonus and the engineering office route.
3. § 174 TKG for letters, recruiting and agent replies.
4. WhatsApp and Meta under the GDPR, AVV, hosting.
5. Recorded calls as a source.
6. Works council and works agreement for call-in capture.
7. Liability for an ongoing service (Desk, Live) compared with the Check.
8. **[new v3]** Company-wide twin: personal data of third parties, purpose limitation, roles and permissions, deletion.

**Liability:**
- The promise is "review and drafts", not a guarantee.
- Liability cap: 12 monthly fees.
- Professional indemnity insurance (Vermögensschadenhaftpflicht) 1 million €, premium at most 8,000 € per year (Gate R4).
- The draft of the final invoice is a draft: approval by the billing clerk, sending by the company.

**Data protection:**
- AVV before the first project folder;
- EU hosting, data silo per company;
- **[changed v3]** Entry only with the released project folder. The company twin grows only with projects the company releases;
- roles and permissions per project (assumption);
- The twin exists for the duration of the contract. Deletion concept per project and at contract end. Clarify retention obligations (unverified);
- AI models and speech-to-text via an EU region. This is a feasibility assumption and must be checked before the first real folder. Kuro advertises EU hosting and ISO 27001, reebuild hosting in Germany (G).

Germany (RDG, VOB/B, GAEB, cost-based pricing under BGH VII ZR 34/18) comes only from 2028, after a legal opinion.

---

## 5. Prices and numbers

| Offer | Price |
|---|---|
| First Check for 3 design partners | free, only in exchange for the coding session |
| Single Check | 1,500 € (contract under 0.5 million €) / 2,500 € (0.5 to 1.5 million €) / 3,500 € (over 1.5 million €); credited if a Desk follows within 60 days |
| Annual Desk S / M / L | 800 / 1,400 / 2,500 € per month (up to 6 / 15 / 35 close-outs per year) |
| Success bonus (optional) | at most 8 % of items found and paid, max. 5,000 € per project, only after the lawyer's approval |
| Live (Twin Live) | year 2, plus 600 to 900 € per month as a placeholder (assumption) |
| Dispute package | 3,000 to 6,000 € per case |

**Conversion rule:** A design partner becomes paying if his Check finds at least 30,000 € or 1.5 % of the contract sum in "not noticed" money.

**Pricing logic:** Check, Desk and Live follow the growth of the twin: one project, all closing projects, all running projects. The model "subscription per active project" was rejected in v2 because it required a mailbox and daily triage by the PL from day 1. With the agent this reason partly falls away. The price structure for Live will be re-examined once Stage 2 is in place. Until then the prices above apply.

**External pricing [suspended 22 Oct: GTM open, no prices externally, see Section 9]:** Kuro and reebuild publish no prices and sell via "Book a demo" or "Write to us" (G). Proposal: show only the entry price ("Check from 1,500 €, fixed"). The Desk is offered in conversation. The fixed price is a trust signal for owners who negotiate every euro (assumption).

**Key metrics (all assumption):**

| Metric | Value |
|---|---|
| ACV | 14,000 € at launch, 18,000 to 19,000 € at maturity |
| Gross margin | 55 to 65 % in 2027, 75 to 80 % at maturity. Live brings running costs (WhatsApp, speech-to-text, hosting), not yet included |
| Review effort per Check | 6 to 10 h at the start, later 2 to 3 h |
| CAC | 8,000 to 15,000 € early, about 6,000 € at maturity |
| Cost of the gates until 31 Jan | 3,000 to 6,000 € |

**Financing (base case):** paid Checks, then pre-seed 0.8 to 1.5 million € in mid-2027, then seed 3 to 5 million € in early 2029. reebuild was funded in its early phase by aws and FFG (G, [Trending Topics](https://www.trendingtopics.eu/reebuild-3-millionen-euro-seed/)). Programmes and amounts for us are unverified.

---

## 6. Market and exit

**Market:**
- Relevant companies (assumption): Austria 650 to 700, Germany 4,200 to 5,000.
- SAM electrical/HVAC-plumbing in AT plus DE: **70 to 100 million €**; with further trades in DACH 150 to 200 million €.
- Austria cap: 120 to 150 customers, i.e. 2 to 2.5 million € ARR.
- 10 million € ARR requires 550 to 700 companies. In the base case that is end of 2032, in the conservative case not before 2035.
- Germany at the earliest 2028, only if all three hold: 40 paying AT customers, an RDG legal opinion is available, the product has been rebuilt (GAEB, VOB/B, cost-based pricing).
- The numbers are based on the final invoice as the only application. Further applications on the company twin could increase the ACV. This is an assumption without a measured value and does not enter the calculation.

**Signal from reebuild:** 120+ construction and real estate companies in AT, DE and beyond use reebuild's AI back office, "from 10 employees" (G). So mid-sized construction companies do buy such software. Whether electrical and HVAC/plumbing businesses are among them is unknown.

**Exit:**

| Scenario | ARR | Exit value | Buyers |
|---|---|---|---|
| Low | 1 to 2.5 million € | 3 to 8 million € | consultancy, BuildTec acquisition, Constellation |
| Likely at PMF | 3 to 6 million € | **15 to 30 million €** | BuildTec, Nemetschek (NEVARIS), ib-data (ABK) |
| High | 8 to 10 million € | 60 to 100 million € | Nemetschek, RIB, specialist publisher (Libra pattern) |

reebuild is added as a possible buyer or partner (same accounting connections, goal "Agentic Backoffice", G). A subcontractor module would annoy their GU customers; that is a channel conflict (assumption). ERP and AVA vendors are interesting as connection partners and as buyers because the twin builds on their data (assumption).

**Probability chain (unchanged from v2):**

| Step | Probability |
|---|---|
| Insider by 4 Dec | 45 % |
| Gates R2 to R5, given insider | 35 % |
| Team stays together | 80 % |
| → Gates passed and team stays on board | about 13 % |
| 2.5 to 3 million € ARR by 2031 | 35 % |
| Sale above 10 million € | 55 % |
| → **Exit above 10 million € by Oct 2032** | **about 3 % (90 % interval 1 to 6 %)** |

The twin does not change the chain. It enlarges the build scope and with it the risk before R2 to R5. That is why the build is staged (Section 15).

---

## 7. Competition

| Provider | Side | What they do | Threat to us |
|---|---|---|---|
| **reebuild** (Vienna) | property developers, construction companies | check invoices and subcontractor (NU) invoices against LV, construction contract, quantity survey; correction sheet; BMD/BRZ/RZL; "digital twin" per document; photo app for delivery notes | **high to medium:** has the engine, AT formats and customers who are themselves subcontractors. Most likely move to close the gap: "check outgoing invoice" (assumption) |
| **Kuro** (Berlin) | large GUs | project documents as a graph, contradiction analysis, subcontractor bid checking, room book, tendering | **low directly:** bid phase. Twin of the other side, increases pressure on subcontractors |
| PlanRadar, Capmo | GU platforms | management of additional payment requests (Nachforderungsmanagement), AI change order checking, AI agents (PlanRadar since August, earlier chat); subcontractors are free guests | **high:** with mobile capture and project twin we come closer to them. They have data and users on site |
| ABK, NEVARIS, RIB iTWO, ORCA, BuildTec | AVA/ERP | hold the data; according to a comparison portal they reconcile automatically against the LV, but only see what has been entered (earlier chat) | **medium to high:** the company level is their territory. They could replicate the reconciliation or a knowledge base. At the same time they are connection partners; access depends on their interfaces |
| Dimacon | subcontractor side | digital daywork report against forgotten work (earlier chat, S) | **medium:** solves only daywork, not across all sources. Direct overlap with call-in |
| Conmeet | construction ERP | ERP with change order management, 6 million € seed, Germany (earlier chat, S) | low to medium |
| Cosuno, Forgent, Sidoun | bids, planner AVA | bids and LVs | low; deliver files, possible channels |
| Document Crunch, Trunk Tools, Adaptive | US, GU side | change and change order detection | low in DACH for 2 to 3 years |
| Stratos, Dryft, Tacto | other industries | connect customer data, twin at company level, applications on top | none; models for the pattern (Section 8) |

**The gap:** None of the providers checked reconciles performed against billed on the subcontractor side, prices from the company's LV and K7, and at the same time reads evidence outside the ERP (emails, photos, daywork on paper, call-ins). Positioning: a neutral knowledge and review layer above all of the subcontractor's systems, not another piece of construction software. The window is estimated at 12 to 24 months.

**Core risk of the gap (earlier chat):** If almost everything that can be evidenced is already in the ERP, the ERP vendor builds the feature and we have no product. If a lot lies outside, that is our advantage. This is why we measure the source of every finding from the first Check.

**Watch list:** 1. reebuild, 2. PlanRadar, 3. Capmo, 4. the design partners' ERP vendors.

**Moat (5/10, unchanged until R3):**
- **What holds:** ledger history per company, rulebook per GU, Austrian format depth, borrowed trust (insider, law firm), counter-position to GU-financed platforms.
- **What could be added [new v3]:** The company twin accumulates knowledge with every project. This raises switching costs (assumption). Call-ins and informal sources could become exclusive data if the share of sources outside the systems is high (R3 measures).
- **What is missing:** network effect between companies.

---

## 8. Learning from Kuro, reebuild and Stratos

The profiles, patterns, the answer on the GU side (8.5) and the investor story (8.6) are unchanged in `research_notes/Kuro_reebuild_Fakten.md` (from v2, Section 8). Here we only note what the twin changes about them.

### 8.1 Common blueprint of the role models

Kuro, reebuild, Stratos, Dryft and Tacto follow the same pattern: connect the customer's data, bring it into an industry data model, and put analyses, agents and workflows on top (earlier chat). The differences lie in industry, data and job. The pattern alone is no longer a moat. You win through a clearly paid job with a money result, through data and rules that get better with every customer, and through access to a target group others do not serve. For us: job final invoice, side subcontractor, rulebook ÖNORM and GU behaviour, plus informal sources.

| Role model | Customer, data, job (earlier chat, not rechecked) | Lesson for us |
|---|---|---|
| **Stratos** | B2B, including construction and chemicals; internal data plus external market data as a "Commercial Digital Twin" for the whole company; growth decisions (stratos.ai) | Model for the navigation company → detail and for applications on a company twin (information from Maxi, 22 Oct). The twin is the means; what is sold is the decision or the money |
| **reebuild** | construction companies and property developers; invoices, delivery notes, costs; "digital twin" per document, reconciliation against LV, delivery note, contract; photo app with 2,350 daily users (G, v2) | We raise the unit from the document via the project to the whole company. Capture by phone on site is used |
| **Kuro** | GUs; plans, building specifications, expert reports, 3D models; project documents as a graph; integrations iTwo, RIB, Revit, Egnyte, CDE (G, v2) | Connection to third-party systems is standard, not differentiation. Revit shows the BIM path for Stage 3. The forward-deployed model fits Stages 0 and 1 |
| Dryft | manufacturing; ERP data; automates decisions such as following up with suppliers (dryft.ai) | A twin on ERP data that triggers decisions is a known pattern |
| Tacto | mid-sized companies, procurement; procurement data plus market signals | same pattern in procurement |

The profiles of Stratos, Dryft and Tacto are only short versions. Maxi adds to them from public sources as needed.

### 8.2 What changes compared with v2 Sections 8.3 and 8.4

| Pattern | v2 | v3 |
|---|---|---|
| "Digital twin" per document (reebuild) | Architecture v1: document → record → ledger | Document → record → **project twin → company twin**. The ledger is a view of the project twin |
| Photo app (reebuild) | do not adopt | Capture by photo yes, via WhatsApp instead of our own app (Stage 2) |
| Platform story from day 1 | do not adopt | The twin is the core product; sold and proven through one job (Section 9) |
| Forward deployed (Kuro) | v1 without customer access | applies to Stages 0 and 1 |
| Real-time budget, warehouse, ESG (reebuild) | do not adopt | stays not adopted |
| AI chat as core function (Kuro) | do not adopt, at most "Ask the folder" | stays. "Ask the twin" is a candidate in 3.7 |
| Estimating and bidding (Kuro) | parked | parked |
| Cold calling (reebuild SDR) | do not adopt (§ 174 TKG) | stays |

---

## 9. Sales and positioning

**Channels for the first 10 customers:** everything legal under § 174 TKG, i.e. in person, letter, events, partners.

| Source | Target | How |
|---|---|---|
| 2 construction law firms plus 1 engineering office | 4 | personal visit with demo; "you keep the legal work"; no commissions |
| 2 trade guild (Innung) evenings (electrical and SHK, Vienna and Lower Austria) | 3 | topic "The money at the end of the project"; lawyer and insider speak, we show the demo; registration with consent |
| Insider's network | 2 | personal introduction |
| Letters to winners of public lots plus office visit | 1 | letter names the lot, offers a Check |

**Later:** ÖNORM and costing trainers, customer days at wholesalers, trade fairs. Associations of the construction industry and GUs are not a channel.

**Cycle:** 1 to 3 months from first meeting to contract (unverified). About 10 sales weeks until Christmas. Between 20 Dec and 6 Jan the trades stand still.

**External positioning (recommendation, decision during the website work):**
- **The core product is the twin, the entry is the money.** An owner first buys the result: final invoice backed up, nothing left on the table. He needs the twin to understand why this works, and as an outlook: today one project, over time the whole business in one place.
- **Order on the website (proposal):** 1. result (final invoice), 2. how it works (twin, company and project), 3. outlook (Desk, Live).
- **Headline:** Before R3 it stays with the result: "Final invoice checked in 10 days, every item backed up." After R3 only with a real value: "On average X € found per project."
- **Term:** Whether "digital twin" works with owners of trade businesses is unchecked. Alternatives to test: "company memory" (Betriebsgedächtnis), "project file" (Projektakte). The same applies to the name: "Schlusswerk" describes the first application, not the core product (open question 13).
- **Trust bar:** EU hosting, AVV, data silo per company, "you only release the projects you want", "we never talk to your GU", no evaluation per employee. ISO 27001 only after the pre-seed.

**[changed 22 Oct, website] What now applies to the website (team decision, replaces the points above where they differ):**
- **GTM and monetisation are open.** The website names no offer (Check, Desk, Live), no prices and no CTA "Request a Check". The CTA is "Book a demo" with date selection (decision Maxi D., 22 Oct), without offer and price.
- **Order:** twin first (company → project → evidence, interactive), the final invoice as the first application, further ones as "planned".
- **Working title:** "tieout", lowercase and without a full stop (previously "Tieout.", before that "EndPoint.", changed 22 Oct). Domain tieout.at. CI: plan grid with paper, ink and ultramarine. Details in `website/STRUKTUR.md`.
- **Placeholders:** What we do not know yet (legal form, imprint, roles, video, domain) appears as `[[PLATZHALTER: …]]` in the text, never as an invented fact. The preview is openly reachable by link (noindex), decision Maxi D. of 22 Oct. Before active distribution, imprint and privacy policy are filled with real information (imprint obligation).
- **Team section:** The four founders are shown, plus an open card for the construction insider.

**Objections:**

| Objection | Answer |
|---|---|
| "We bill everything anyway." | "Then the Check shows it in black and white." |
| "We need the next contract." | Daywork and quantities are billing, not a dispute. You trade from a complete list. "Your GU already checks your invoice with software. Check it yourselves first." |
| "Data is confidential." | AVV, EU hosting, silo, only released projects, invisible to the GU |
| "You want access to our whole business?" | "No. We start with one project. The twin only grows with the projects you release." |
| "Are you lawyers?" | No. Calculation and software; legal questions go to your lawyer |
| "AI makes mistakes." | Every item has evidence and a calculation path, the invoice is deterministic, insider and billing clerk review |
| "You are students." | The insider in the room and the number on their own project answer that |
| "We already have an ERP." | "The ERP only sees what someone entered. We additionally read what lies next to it: emails, photos, daywork on paper. The ERP remains the lead system." |
| "WhatsApp with company data is too sensitive for us." | "It is an additional route, not a must. The Check also runs from a folder." Only say this once R4 is clarified |
| "This is control over my people." | "There is no evaluation per employee, only per project and item." Only promise this if it is technically built that way |

---

## 10. Team

| Person | Focus until 31 Jan |
|---|---|
| **Maxi** | R1 insider (priority), product (demo, Stage 0, data model company and project), R3 with the insider, website, CI, name, hosting (order open) |
| **Co-founder A** | R4 law and insurance incl. extended list of questions, AVV, synthetic demo data (company with several projects, incl. call-ins), competitor demos, market count |
| **Co-founder B** | Field: trade guilds, law firms, subcontractor interviews (incl. questions on ERP, emails, WhatsApp, company access), R2 folders, R5 payment, #glaubandich |
| **Insider** (from term sheet) | check catalogue, review of every Check, all customer meetings from December |

**Rules:**
- Founders' agreement by Fri 6 Nov: 4 years vesting, 1 year cliff, leaver rules, who goes full time if the gates are passed.
- Commitment: 15 to 20 hours per person per week, metrics round every Sunday.
- Maxi spends at most half his time building as long as R1 is open. Lesson from the playbook: "The tool must not eat up the actual project."
- With the company twin, WhatsApp agent and website, the build scope is larger than in v2. The build split (who takes on data model, WhatsApp prototype, website) will be decided in the Sunday round on 25 Oct (open question 14).

**Insider (mandatory):**
- **Option A:** retired PL or head of billing (60 to 68), 2 days per week; 6 to 8 % equity, 3 years vesting, 6 months cliff, plus 30 % of every paid Check fee.
- **Option B:** active billing or change order manager (40 to 55); 15 to 20 % equity, full time after the pre-seed.
- **Where to search:** ÖNORM trainers, sworn experts, regional trade guilds, wholesalers, TU institutes, Roman and all contacts.
- **Process:** letters, coffee, the candidate marks what is wrong in the demo, then a paid trial day.

**In addition:** retired estimator as advisor (0.5 to 1 %), construction law firm (no equity, no commissions), engineering office, insurance broker.

---

## 11. Risks and open questions

| # | Risk (red team) | Estimate | Response | Test |
|---|---|---|---|---|
| 1 | No folder | ~65 %, fatal | Entry shortly before the final invoice; request via law firm, insider, trade guild | R2 |
| 2 | Money is deliberately left on the table | ~50 % | Billing instead of dispute; final meeting sheet | R3 |
| 3 | Success fees come late | ~70 % | at least 80 % fixed | R5 |
| 4 | Credibility without insider | ~70 % | Insider as mandatory gate | R1 |
| 5 | Law and liability | ~40 % | Check as calculation, customer sends, law firm | R4 |
| 6 | Estimating is only a feature | ~55 % | parked | n/a |
| 7 | Competition (reebuild, PlanRadar, Capmo, ERP vendors) | ~45 % | Counter-position, format depth, rulebook per GU, informal sources | Demos by 6 Nov |
| 8 | Market smaller than thought | ~60 % | Germany 2028, second trade 2030 | Count 13 Nov |
| 9 | Small exit | ~50 % | 80 % fixed, buyers with a subcontractor customer base | Talks at BAU 2027 |
| 10 | Timing | ~40 % | Insider and folder before Christmas | 5 managing director (GF) meetings by 18 Dec |
| 11 | **[new v3]** Build scope too large for three students with 15 to 20 h per week (company twin, project twin, WhatsApp, connection) | high (not measured) | Stages; Stage 0 is enough for all gates; WhatsApp and connection only after R3 | Build status in the Sunday round |
| 12 | **[new v3]** Data protection, works council, acceptance of WhatsApp and voice recordings (the old reasons from v2 "PL and works council block") | high (not measured) | No evaluation per employee, voluntary, route without WhatsApp, R4 list of questions | Lawyer; subcontractor interviews; pilot |
| 13 | **[new v3]** ERP interfaces are missing or blocked | medium to high | Import via file always remains possible; connection only per design partner | Subcontractor interviews (question 9) |
| 14 | **[new v3]** Informal data is hard to use (dialect, photo quality, assignment, misinterpretation) | medium | Confirmation step by the sender; human decides; test prototype | WhatsApp prototype |
| 15 | **[new v3]** Lead hypothesis wrong: what can be evidenced is already in the ERP, the ERP vendor builds the feature | medium | Source coding from R3; if needed, positioning on Check and rulebook | R3 |
| 16 | **[new v3]** Access to the whole business is a bigger step of trust than a project folder and lengthens the sales cycle; the term "twin" is too abstract for owners | medium to high | Entry with one released project; twin grows with release; sell the result first | Subcontractor interviews; reaction to the demo |
| 17 | **[new v3]** Loss of focus: the team builds breadth instead of proving the one job | medium | No further application before R5; gates unchanged; stages | Sunday round |

**Open questions:**
1. How much money per project is left "not noticed"? (R3)
2. Where do we find the insider, and what does the term sheet look like (incl. the pension question)?
3. How do we get 3 folders?
4. How many final invoices does a target company have per year?
5. What does the lawyer say about RAO, bonus, engineering office route and § 174 TKG for letters and recruiting?
6. What exactly do GU tools like reebuild cut? Ask at the demo meeting and with subcontractors: who has already received an automatic correction sheet?
7. Which import format does BMD have for outgoing invoices?
8. Which EU region for the AI models and speech-to-text, at what cost?
9. Which ERP, AVA and CRM do target customers use, and where do emails, quantity survey and daywork sit today?
10. How much of the money found was evidenced only outside the ERP? (R3, source coding)
11. Do site foremen and fitters use WhatsApp for arrangements, and would they send to a company number?
12. The lawyer's answers on WhatsApp, calls, works agreement, draft of the final invoice and company-wide twin (Section 4).
13. What do we call the twin towards customers? The name "Schlusswerk" describes the first application, not the core product. Decision with the naming topic.
14. Who builds what from Stage 1 (data model, WhatsApp prototype, website)?
15. **[new v3]** How much company knowledge (customer and GU history, costing basis) do owners want in a platform at all? Interview question for the subcontractor interviews.
16. **[new v3]** Will external data (Stratos pattern) come into the twin, and when? Year 2 at the earliest.

---

## 12. Rejected and why

Decided. Only resume with new evidence and say so explicitly. Rows marked **[changed v3]** differ from v2.

| Rejected | Originally | Why rejected | What applies instead |
|---|---|---|---|
| **Estimating as a module** | Start month 9 to 12, 450 to 490 €/month plus 35 to 45 € per LV | Attack 6 | parked until 15 paying Desks are running **and** the estimator test is passed |
| **Subscription per active project [changed v3]** | 95 €/project/month, min. 690 € | required a mailbox and daily triage by the PL from day 1 | stays rejected as the launch price; subscription per **closing** project. Re-evaluation for Live from Stage 2 (Section 5) |
| **10 % success fee as standard** (originally 5 % on everything) | 10 %, cap 15,000 € | cash only in 2028 to 2029, disputed, no ARR | min. 80 % fixed; bonus max. 8 %, max. 5,000 €, only after the lawyer's approval |
| **The word "Claim", name "Claimwerk"** | "Claims X-ray" | sounds like a fight and legal advice | "Schlusswerk", "final invoice" (Schlussrechnung), "billable" (verrechenbar) |
| **X-ray of old projects as entry** | Check of a closed folder | mainly shows time-barred money | Check **before** the final invoice. A completed project serves only as proof for the insider and design partners (as with Kuro/Köster) |
| **Pure dispute Desk** | Entry at a cut final invoice | adversarial, legally more delicate | Dispute package only through the law firm |
| **Live monitoring from the start [changed v3]** | mailbox, daily detection | PL and works council block | **Resumed as part of the product:** call-in via WhatsApp (Stage 2) and connection (Stage 3). Team decision of 22 Oct, no new evidence. Full mailbox access with daily triage by the PL stays rejected; emails first via project forwarding or ERP sync. The old reasons are listed as risk 12 |
| **Platform story from day 1 [changed v3]** | "Back office AI for subcontractors" | both role models started narrow | The twin is core product and architecture. Sold and proven through one job: the final invoice. Further applications only after R5 |
| **Own photo or site app** | photo app following the reebuild pattern | new app, new hurdle for site foremen | Capture via WhatsApp, no new app |
| **AI chat as core function** | following the Kuro pattern | nice demo, no money job | stays rejected. The WhatsApp agent records, it does not answer. "Ask the twin" is a candidate in 3.7 |
| **Enpal contacts as customer source** | warm intros | B2C installers, wrong segment | contacts only for finding people; no Enpal data |
| **Germany before 2028** | start in year 2 via Bavaria | VOB/B, GAEB, cost-based pricing, RDG | from 2028 after 40 AT customers and a legal opinion |
| **Public lots as targeting rule** | single awards first | unverified | interview question only |
| **Commissions to or from law firms** | referral fees | probably prohibited | no commissions |
| **Old market and revenue numbers** | 810 million € DACH, 2.2 bn € EU, 20,000 € ACV etc. | inflated | 70 to 100 million € SAM, ACV 14,000 / 18,000 to 19,000 € |
| **Old recovery assumption** | 55 % to 80 % | invented | R3 measures |
| **Old exit expectation** | 25 to 50 million €, strong case 70 to 100 million € | needed strong early growth | 10 to 40 million € |
| **Old gates** | K1 13 Nov, final decision 8 Jan | too early | R1 to R5, final decision 31 Jan 2027 |
| **Estimating teaser and deadline countdown in the demo**, "10 % of money found" | old demo | estimating parked, deadlines only in the Desk | Demo shows company twin, call-in, final invoice, export |
| **Switch to the GU side** | obvious after Kuro and reebuild | occupied by funded teams with domain knowledge; our edge only applies on the subcontractor side | subcontractor side; the GU's AI is our argument |
| **SDR and phone sales following the reebuild pattern** | "Book a demo" machine with cold outreach | § 174 TKG; students without an insider burn the market | in person, letter, events, partners; web form with consent |

---

## 13. The five gates (dates unchanged)

| Gate | Test | Who | Date | Passed | Kill or pivot |
|---|---|---|---|---|---|
| **R1 Insider** | 15+ candidates, 8+ meetings, paid trial day for the top 2 | Maxi | Term sheet Fri 20 Nov, hard deadline Fri 4 Dec | Equity agreement with an insider matching the profile, min. 1 day per week, in all customer meetings from December | no insider by 4 Dec: stop |
| **R4 Law** | 1-hour legal opinion, construction law Vienna (extended list of questions, Section 4); broker offer 1 million € | Co-founder A | Fri 4 Dec | in writing: Check, ledger, valuation (and draft of the final invoice) not reserved; premium max. 8,000 €/year | core Check reserved: stop. Bonus not permitted: fixed price only. No insurer: billing completeness only |
| **R2 Folders** | Request to 8 companies via law firms, insider, trade guild; AVV | Co-founder B + insider | Fri 11 Dec | 3+ folders from 3+ companies, each 70 %+ usable | max. 1 folder or under 50 % usable: stop. 2 folders: extend once by 2 weeks |
| **R3 Money** | 3 Checks, code every euro (a) to (d) **and by source of the evidence** | Maxi + insider | Fri 22 Jan 2027 | on 2 of 3 projects (a) ≥ 30,000 € **or** 1.5 % of the contract sum, **and** (a) ≥ 50 % of all findings | median (a) below 0.75 % or (a) below 40 %: stop. In between: S tier, retest by 31 Mar |
| **R5 Payment** | Offer fixed price Check and Annual Desk | Co-founder B | Fri 29 Jan 2027 | 2+ companies pay ≥ 1,500 € each **and** 1+ Annual Desk or letter of intent | 0 paid: stop. 1 without letter of intent: stop, unless R3 was at the top |

The gates test whether subcontractors pay for the result of the final invoice. This works from a manually imported project folder. The company twin with connection and WhatsApp is not needed for this and must not delay the gates.

**Final decision Sun 31 Jan 2027:**
- All five passed: full time and raise money.
- One in the pivot band: another 8-week round on the pivot.
- Two or more failed: Schlusswerk is dead. Fallbacks are the acceptance and inspection register for electrical installations or the property management service.

The kill rules apply immediately, not only on 31 Jan. Without an insider on 4 Dec, building stops.

---

## 14. Plan until 31 Jan 2027, week by week

**Abbreviations:** **M** = Maxi, **A** = Co-founder A, **B** = Co-founder B, **I** = Insider (from term sheet), **Build** = product work (Section 15).

**Fixed rhythm:** every Sunday a 30-minute metrics round covering interviews, letters, candidates, folders and build status. Then update `_STATUS.md`.

| CW | Dates | M | A | B | Build | Deadline / Gate |
|---|---|---|---|---|---|---|
| 43 | Thu 22 to Sun 25 Oct | Go through Dossier v3 with the team; set up repo outside OneDrive and `Umfang_v1.md`; **clarify build split (Sun 25 Oct)** | Draft founders' agreement | Draft #glaubandich text | Define demo click path (company → project → application); start generator for synthetic data (company with 8 projects, one fully worked out, incl. call-ins) | |
| 44 | 26 Oct to 1 Nov (Mon public holiday) | Insider list 15+; 25 to 30 letters out by Fri 30 Oct | Synthetic data finished (incl. fictitious GU correction sheet and call-ins); list 10 law firms; fix lawyer appointment for CW 48 | Submit #glaubandich; visit regional trade guilds Vienna/Lower Austria in person or write to them (letter) | **Demo v0.9:** company overview, project ledger, evidence panel, three lists, timeline, WhatsApp scene as mock, precomputed | **#glaubandich Sat 31 Oct** |
| 45 | 2 to 8 Nov | 8+ coffee meetings, candidate marks errors in the demo | Demos at PlanRadar, Capmo, NEVARIS, ABK **and reebuild** (openly as founding team); visit 5 law firms (with B) | 6 subcontractor interviews with guide and folder question (plus questions 9, 11, 15); coding scheme (a) to (d) plus source finished | Demo v1.0 hackathon-ready (company twin, WhatsApp scene, final meeting sheet, pre-check from the GU's perspective, draft final invoice, export); **data model company → project → objects** (source, history, status) | **Founders' agreement Fri 6 Nov** |
| 46 | 9 to 15 Nov | Trial days for the top 2; hackathon (planning assumption mid-Nov) | Market count: 30 projects, sizes in WKO Firmen A bis Z; broker request for insurance | More subcontractor interviews; finalise AVV template with A | Stage 0: LV parser (ÖNORM A 2063 and PDF), quantity survey Excel | **Market count Fri 13 Nov** |
| 47 | 16 to 22 Nov | Term sheet to the best candidate | Extended list of questions to the lawyer in writing (Section 4) | Folder request to 8 companies via law firms, candidate and trade guild, with AVV | Stage 0: daywork scans (OCR, signature status), invoices, ledger calculation core | **R1 term sheet Fri 20 Nov** |
| 48 | 23 to 29 Nov | Sign insider contract; with I the check catalogue v0 (100 to 200 questions) | Lawyer's legal opinion (1 h); insurance offer | Follow up on folders; fix trade guild evening January/February with lawyer | Stage 0: pricing LV × K7, email extraction, evidence package PDF | |
| 49 | 30 Nov to 6 Dec | Trial run with I on synthetic data and an anonymised project of I | Record R4 in writing | Book GF meetings for CW 50 to 51 | **Stage 0 freeze Sun 6 Dec** | **R4 and R1 hard Fri 4 Dec** |
| 50 | 7 to 13 Dec (Tue public holiday) | Start 3 Checks (M rebuilds, I reviews) | Have AVVs signed; EU region of the AI models confirmed | Collect folders; interim status to the partners | Fix errors from real folders; test system only with synthetic data | **R2 folders Fri 11 Dec** |
| 51 | 14 to 20 Dec | Checks running; finish what is possible before the break | Competition update (reebuild, PlanRadar, Capmo) | 5 GF meetings by Fri 18 Dec | Plan revision index diff, duplicate detection | 5 GF meetings |
| 52 to 53 | 21 Dec to 3 Jan | No sales meetings; build v1.1 | Break | Break | v1.1: pre-check from the GU's perspective on real data, draft of the final invoice, Excel and ÖNORM export, check BMD format, coding sheet in the tool. **If capacity allows: WhatsApp prototype on test number with synthetic data, otherwise after R3** | |
| 1 | 4 to 10 Jan | From Thu 7 Jan: deliver Check 1, coding session (with I and B) | Prepare trade fair and BAU meetings (buyer talks) | Offer documents: fixed price Check, Annual Desk S/M/L | Fixes from Check 1 | |
| 2 | 11 to 17 Jan | Deliver Checks 2 and 3, coding sessions | Legal questions from the Checks to the law firm | Offers to design partners after each delivery | Metrics evaluation (findings by a to d and by source, hours per Check) | |
| 3 | 18 to 24 Jan | Evaluate R3, have numbers checked independently | Briefly map pre-seed and funding options (aws, Wirtschaftsagentur) | Follow up, signatures | Freeze on new features | **R3 money Fri 22 Jan** |
| 4 | 25 to 31 Jan | Prepare final decision (Dossier v4) | | Incoming payments, letters of intent | | **R5 Fri 29 Jan, final decision Sun 31 Jan** |

**After the final decision (proposal, not decided):** Stage 2 with one design partner as pilot from February 2027, only after R4 and with the consent of the works council, if one exists.

**Open and not yet in the plan:** website, CI, final name, hosting (Maxi). Dates will be set with the team once the build split is clarified.

---

## 15. What we build

### 15.1 Principles

- **One twin core, five stages.** Stage 0 is the internal tool from v2 (v1). The demo is the same software with synthetic data and a precomputed fallback.
- **The data model applies from day 1 to the levels company, project, object** (with source, history, status), also in Stage 0. That way nothing has to be rebuilt later. In Stage 0 the company level is narrow: company, customers and GUs, project list.
- **The AI delivers facts with sources, a human confirms, the invoice is code.** Every number in the report is clickable and leads to the original.
- **We operate the tool ourselves** in Stages 0 and 1 (Kuro pattern "Forward Deployed"). In doing so we learn what customers will later operate themselves.
- **Data protection:** test system from day 1 only with synthetic data; real folders only in the EU environment, separated per company; deletion after contract end; Git repository not in OneDrive.
- **Architecture:**

```
Sources → [1 Ingest] → [2 Record with source] → [3 Project twin → company twin: history, ledger] → [4 Review and approve] → Application: final invoice
```

### 15.2 Stages

| Stage | Name | Content | When | Prerequisite |
|---|---|---|---|---|
| **0** | Import | Project folder import, record per document, LV, quantity survey, daywork, invoices, ledger, pricing, close-out run, outputs (report, lists, evidence package, Excel, ÖNORM, draft final invoice). Data model company → project. We operate it ourselves | Freeze 6 Dec, v1.1 by 6 Jan | needed for R2, R3, R5 |
| **1** | Visible | Navigation company → project, project overview, timeline, LV tree, evidence panel as web view | Demo from 31 Oct (precomputed), real after R3 | Stage 0 |
| **2** | Call-in | WhatsApp agent: photo, voice, assignment, confirmation; read-only view for billing clerks and owners | Prototype from Jan (synthetic), pilot after R3 and R4 | R4 and the pilot customer's works council clarified |
| **3** | Connect | ERP/AVA/CRM, emails, calls, later BIM and plan pins. First the one system the design partners use | after R5 | Design partner with a suitable system |
| **4** | Further applications | Candidates from 3.7, decided individually, also at company level | after R5 | first paying Desk |

### 15.3 Demo (synthetic, by 31 Oct or the hackathon)

**Dataset:** A fictitious building services company (Haustechnik GmbH) with 8 projects. One is fully worked out: "Residential complex Vienna 21, plot B, HVAC/plumbing lot, 1.24 million €, fictitious GU". The other 7 have only status, contract sum and open amount, so that the company overview comes alive. The worked-out project contains:
- an LV with 380 items and K7 sheets;
- quantity survey;
- 16 daywork reports (11 billed, 3 signed but not billed, 2 not signed);
- 3 interim invoices;
- 60 emails;
- 40 photos with EXIF;
- plan revision indices C, D and E;
- a GU deduction letter;
- a fictitious automatic GU correction sheet;
- 6 call-ins via WhatsApp (photo and voice message), 2 of them without a daywork report.

**Script (3 minutes):**

| Time | Screen | Line |
|---|---|---|
| 0:00 to 0:25 | **Company twin:** project list with traffic lights, total "open billable" across all projects (calculated from the synthetic data); click into the residential complex | "This is the twin of your business. All projects in one place. Let's go into one." |
| 0:25 to 0:55 | **Project twin,** WhatsApp scene: fitter sends photo and voice message, agent replies with a summary, one tap on "Yes", the entry appears in the timeline | "Sockets in room 5 moved because the client wanted it. Twenty seconds, no daywork report later." |
| 0:55 to 1:30 | Ledger with traffic lights; **Billable now: 27,410 €**; click on a quantity overrun: plan revision index C→D, email "please do it right away", photo, 14 × unit price (EP) plus K7 = 6,384 € | "No dispute. Work that was done and not billed." |
| 1:30 to 2:00 | Pre-check from the GU's perspective: 4 items the GU would cut, with missing evidence | "Your GU checks with software. Check it yourselves first." |
| 2:00 to 2:35 | Draft of the final invoice and final meeting sheet with floors; one item "needs a lawyer" | "If you trade, then from the complete list." |
| 2:35 to 3:00 | Back to the company level: GU history fills up; export; price; insider (only if signed) | "Every project stays in the twin. On the next project with this GU we know his cuts." |

The numbers are synthetic. For #glaubandich and the hackathon: the story stays with the problem and the synthetic demo, without invented findings.

### 15.4 Stage 0 in detail (freeze Sun 6 Dec, v1.1 by 6 Jan)

| Component | By | Content |
|---|---|---|
| Data model | CW 45 to 46 | Company → customer/GU → project → objects from 3.3, each with source (file, page, location), history and status; manual correction by M/I is saved |
| Folder import | CW 46 | Upload files, detect type, detect duplicates and versions (plan revision index) |
| LV and quantity survey | CW 46 | ÖNORM A 2063 (buy the specification from Austrian Standards, cost unverified), PDF LV, quantity survey Excel |
| Daywork and invoices | CW 47 | OCR, signature status, hours and material; interim invoices and payments |
| Ledger calculation core | CW 47 | deterministic, with tests on the synthetic data |
| Pricing | CW 48 | LV unit price × quantity; K7 labour minutes for additional quantities |
| Emails and plans | CW 48 | Find instructions in emails; plan revision index list (automatic diff in v1.1) |
| Check catalogue v0 | CW 48 to 49 | 100 to 200 check questions electrical/HVAC-plumbing with I (assumption on the number); every correction becomes a rule |
| Outputs | CW 49 | Report (PDF), three lists, evidence package per item, final meeting sheet, coding sheet (a) to (d) plus source, Excel |
| v1.1 | 6 Jan | Pre-check from the GU's perspective, draft of the final invoice, ÖNORM export, BMD format checked, plan revision index diff |

**Not in Stage 0:**
- customer login;
- mailbox and ERP connection (emails and data only as files);
- WhatsApp agent (only as a scene in the demo);
- company applications (portfolio, GU history) as a real function;
- own photo app;
- AI chat;
- automatic deadline calendar and § 1170b tracker (if needed, as a table by hand);
- DWG and BIM;
- GAEB and Germany;
- estimating;
- bonus billing;
- real-time budget.

### 15.5 Measuring per Check

- hours M and hours I;
- pages and documents;
- share of fields corrected by hand;
- € found by (a) to (d);
- **source of the evidence per finding:** in the ERP or as a file, in an email, on paper, in a photo, only verbal or via WhatsApp;
- days until the paid final invoice.

Evaluation: share of findings evidenced only outside an ERP. It tests the lead hypothesis and the core risk from Section 7. The threshold at which we consider the hypothesis confirmed will be set in the Sunday round before R3 and entered here.

Metrics for the story and investors, following the pattern of reebuild's "530 million € invoice volume": number of projects in the twin, contract sum checked in €, € found per million € of contract sum (coded), days until the paid final invoice, share of findings outside the ERP.

---

## 16. Start prompt for a new chat

> First read `_STATUS.md` and `dossier-v3.md` in the project folder, completely, including Section 0.1 (changes compared with v2) and Section 12 "Rejected". For profiles of Kuro and reebuild read `research_notes/Kuro_reebuild_Fakten.md` if needed, for sources on law, market and exit `archiv/dossier-v2.md`. We are three students in Vienna (Maxi, WU Wien, builds with AI coding agents, plus two co-founders, none with a construction background). We are building the digital twin for Austrian electrical and HVAC/plumbing (Elektro and HKLS) subcontractors: a twin for the whole company, in which every project has its project twin, with the final invoice (Schlussrechnung) as the first application. Dossier v3 is the decided state. Do not propose anything from Section 12 again unless you have new evidence and say so explicitly. Everything marked "(unverified)", "(assumption)", S or A is unchecked. Today is [date]. Since the dossier the following has happened: [gate status, insider, folders, interviews, numbers]. Help us now with: [task, e.g. week X from Section 14]. German, direct, no filler. Sales: no cold emails, no cold calls (§ 174 TKG).

---

## 17. Sources

**Law, market, competition, exits:** in `archiv/dossier-v2.md` (Sections 4 to 7 with links). For further sources v2 refers to Dossier v1, Section 18; v1 is not in this folder. **Kuro and reebuild:** profiles and sources in `research_notes/Kuro_reebuild_Fakten.md`.

**Additions from the research of 22 Oct 2026 (earlier chat, not rechecked):**
- [Startbase: reebuild 3 Mio. Seed](https://www.startbase.de/news/reebuild-holt-sich-3-millionen-euro-fuer-ki-automatisierung-in-der-baubranche)
- [find-your-software: Bausoftware-Vergleich 2026](https://find-your-software.de/branchen/software-fuer-bau/)
- [konii: PlanRadar KI-Agenten](https://www.konii.de/?p=213180)
- [App Store: Dimacon digitaler Regiebericht](https://apps.apple.com/de/app/dimacon/id1578438258)
- [buildingnet: Conmeet 6 Mio.](https://www.buildingnet.de/digitalisierung/conmeet--ki-software-fuer-den-bau.htm)
- [KI-Syndikat: Bauwesen-Tools inkl. Document Crunch](https://www.ki-syndikat.de/tools/kategorie/bauwesen/)
- [Adaptive](https://www.adaptive.build/)
- [BauNachtrag](https://www.baunachtrag.ch/)
- Role models for the twin pattern: [stratos.ai](https://stratos.ai/), [dryft.ai](https://dryft.ai/)
