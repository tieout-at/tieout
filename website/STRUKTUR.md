# Website: Structure v1

**Status:** 22.10.2026. Built (v1 preview), see `README.md`. Deviations from the plan are in section 10.
**Working title:** tieout (lowercase, no period). Name not final, trademark check open.
**Responsible:** Maxi (alone). Work happens on the branch `website/build`, only in the folder `website/`. Website work does not touch `product/` or anything else.

> **Update v2 (22.10.2026, feedback Maxi D.):** Structure now: 01 Hero (text on the left, three photos with product excerpts on the right), 02 Problem and solution with an animated flow (inputs ERP, email, PDF, plans, Excel, photo, voice message, WhatsApp → twin of the business made of projects → final invoice (Schlussrechnung) with checks), 03 Product video, 04 About us (LinkedIn photos, all co-founders, logos in ultramarine), 05 Book a demo. The main product presented externally is the final invoice; the twin is the foundation. No navigation at the top, measuring-point navigation on the left, slide toggle DE/EN. Dropped: legend/principles, construction insider card, clickable twin. Image sources: `public/hero/QUELLEN.md`.

> **Update v3 (22.10.2026):** Hero without target group tiles, three photos each with one benefit (forgotten work, additional quantity from a plan change, all evidence (Belege) in one place). Problem and solution stacked, without figures (no reliable source found for AT/DE). Inputs MECE by data type: systems, documents, communication. Twin as a business with company knowledge, project overview and drill-down to the item with evidence. Measuring-point navigation on the right with all names. Demo with appointment selection (dummy, calendar integration open), gradient from paper to ultramarine.

> **Update v4 (22.10.2026):** Logo „Ecke“ (corner; two plan corners, dot in ultramarine). Hero card 2 shows a change ordered by email instead of additional quantity. Problem as an animated project timeline with the toggle „Heute | Mit Tieout.“ (today | with Tieout.). Twin on two levels (business, project). Blue transition like Dryft at the video. Demo with month calendar and free slots (dummy).

> **Update v8 (22.10.2026):** Side navigation compact on laptops (1240 to 1559 px), hidden below that. Video fits laptop screens. Timeline restarts every time it is scrolled into view, about 3 seconds, without a replay button. Favicon: logo on white. LinkedIn banner under `brand/linkedin/`. Where the sections further down deviate from the updates, the updates apply.

> **Update v7 (22.10.2026):** Name lowercase and without a period: **tieout**. „Regie“ (time-and-materials work) replaced by Stundenarbeit or Stundenzettel (hourly work, timesheet). Sample figures for project Wien 21 consistent throughout: 5.546 € open (timeline, project table, result), hourly rate 65 €/h. Amounts in the format „1.290 €“. Team with roles (CEO, COO, CTO, CFO), career stations as per LinkedIn. On the phone, every amount in the timeline appears directly below its event. Domain tieout.at connected in Cloudflare, nameserver switch at easyname open.

> **Update v6 (22.10.2026):** Working title now **Tieout.** (previously EndPoint.). Domains: only tieout.at available (DNS), tieout.com and tieout.ai taken. Project level in the twin as a breakdown (item, bill of quantities (LV), built, billed, open). Sections with equal spacing, blue at the video with a hard edge like Dryft. Demo: header across the full width, below it calendar and form of equal height. Logo selection for Tieout open.

---

## 1. Goal

The page explains within a few seconds: **tieout is the digital twin of an electrical or HVAC/plumbing (HKLS) business.** The final invoice is the first application, not the product.

- GTM, offers and prices are open: no prices, no packages, no „Check anfragen“ (request a Check).
- CTA: **„Demo buchen“** (book a demo) with appointment selection (decision Maxi D., 22.10.). No prices, no packages.
- Readers: owners, billing staff and project managers, construction insiders (Gate R1), partners, investors, competitions.
- The page is itself proof: precise, interactive, technically clean.

---

## 2. Design

| Element | Specification |
|---|---|
| Colors | **Paper** `#F4F6F9`, **Ink** `#0A1020`, **Ultramarine** `#1D3BFF`. For lines only: main grid `#D5DCE6`, fine grid `#E8ECF2` |
| Typeface | Inter Tight (headlines 600, tightly set; text 400). IBM Plex Mono for numbers, dimensions, labels, item numbers |
| Background | Architect's paper: main grid 48 px, fine grid 12 px, across the whole page |
| Leitmotif | **Dimension chains** (`\|← 8 PROJEKTE →\|`) for numbers, transitions and navigation |
| Buttons | Primary: ultramarine, white text. Secondary: outline in ink |
| Corners | square (0 to 2 px) |
| Motion | calm and precise: lines draw themselves, nothing bounces. `prefers-reduced-motion` turns animations off |
| Dark mode | later `[[PLATZHALTER: Dark Mode]]`, proposal blueprint (white lines on ink) |

---

## 3. Language

- **German as default** (`/`), **English** via the toggle `DE | EN` (`/en`). The toggle keeps you in the same section.
- All texts in `messages/de.json` and `messages/en.json`, never hard-coded.
- Form of address `[[PLATZHALTER: Sie oder ihr]]`, proposal „Sie“ (formal you).
- No word „Claim“, no invented figures, statements about the world only with a source.

---

## 4. Site map

```
/              One-pager German
/en            One-pager English
/impressum     Placeholder (DE and EN)
/datenschutz   Placeholder (DE and EN)
```

---

## 5. Page structure

```
┌──────────────────────────────────────────────────────────┐
│ tieout      Zwilling  Anwendungen  Team   DE|EN  [CTA] │  Navigation
├──────────────────────────────────────────────────────┬───┤
│ 01 HERO        Ihr Betrieb. Auf einem Plan.          │ ⌖ │  Measuring-
│                grid draws itself → twin              │ │ │  point nav
│ 02 PROBLEM     4 cards, sources as footnote          │ • │  (section 7)
│ 03 ZWILLING    interactive isometry (section 6)      │ • │
│ 04 WEGE        Anbinden · Einspielen · Zurufen       │ • │
│ 05 ANWENDUNGEN final invoice + „in Planung“          │ • │
│ 06 VIDEO       16:9 placeholder                      │ • │
│ 07 PRINZIPIEN  plan legend                           │ • │
│ 08 TEAM        4 founders + insider wanted           │ • │
│ 09 KONTAKT     form with consent                     │ • │
├──────────────────────────────────────────────────────┴───┤
│ Footer: legal form · address · Impressum · Datenschutz   │
└──────────────────────────────────────────────────────────┘
```

| # | Section | Content | Interaction | Placeholder |
|---|---|---|---|---|
| 00 | **Navigation** | Wordmark „tieout“, anchors, `DE \| EN`, CTA | stays at the top, becomes narrower on scroll | CTA text |
| 01 | **Hero** | „Ihr Betrieb. Auf einem Plan.“ / „Your business. On one plan.“ Subline: the digital twin for electrical and HVAC/plumbing businesses | grid lines draw themselves, a dimension chain measures „8 Projekte“ (8 projects), transition into the twin | Subline |
| 02 | **Problem** | Knowledge scattered (ERP, mails, paper, heads); much is informal (phone, verbal instructions (Zuruf), WhatsApp); when a project manager leaves, their knowledge leaves; clients review with AI | cards draw in on scroll | Figures only with a source (dossier section 2) |
| 03 | **Twin** | Centerpiece, see section 6 | interactive | Data synthetic, labeled |
| 04 | **Three ways in** | Anbinden (connect: ERP, CRM, mails), Einspielen (import: files, plans), Zurufen (call in: WhatsApp with photo and voice, confirmation by the sender) | switching between the three ways; „Zurufen“ shows a WhatsApp conversation that types itself, and the entry that lands in the twin | — |
| 05 | **Applications** | First application: final invoice. „In Planung“ (planned): portfolio across all projects, history per client, deadlines | Mini demo: clicking a number opens the evidence („Jede Zahl führt zum Original“, every number leads to the original) | List of further applications |
| 06 | **Product video** | 16:9 frame on the grid, still image, play button | Placeholder, embedding later | `[[PLATZHALTER: Produktvideo]]` |
| 07 | **Principles** | AI delivers facts with a source, the human confirms, the calculation is code; nothing is overwritten; data silo per company; no evaluation per employee; we never talk to your client | as a plan legend with symbols | Hosting statement only once decided |
| 08 | **Team** | 4 founders (section 8) and a card „Bau-Insider: wir suchen Sie“ (construction insider: we are looking for you) | Hover: photo as line drawing → color; LinkedIn link | Photos, roles, texts |
| 09 | **Contact** | Form: name, company, role, message, consent checkbox (§ 174 TKG); `kontakt@[[DOMAIN]]` | Validation directly at the field, confirmation as a dimension chain „Eingang bestätigt“ (receipt confirmed) | Backend, email address |
| — | **Footer** | Wordmark, legal form, address, Impressum, privacy policy (Datenschutz), LinkedIn, © 2026 | — | Legal form, address, company register (Firmenbuch), VAT ID (UID) |

---

## 6. The twin (section 03)

**Goal:** show what Kuro, reebuild and Stratos only assert. None of the three sites has an interactive twin visualization (as of 22.10.2026: Kuro shows a layer diagram and a scroll gallery, reebuild a static infographic, Stratos a static SVG).

**Style:** isometric line drawing on the plan grid, like an architect's axonometric drawing. Ink for lines, ultramarine for „offen“ (open). No textures.

**Flow:**
1. **Build-up:** On scroll the 2D grid tilts into isometry, lines extrude into buildings.
2. **Company:** 8 projects as wireframe buildings. Height = contract value, ultramarine fill = open share. Clients as nodes at the edge, connected to their projects. Hover: dimension chain with name, total, status.
3. **Project:** Click → camera move inside, floors move apart (exploded view), pins for photo, field report (Zuruf), time-and-materials work (Regie), plan change.
4. **Data streams:** Dots fly in from sources at the edge (mail, photo, WhatsApp, ERP, plan) and dock onto items.
5. **Evidence:** Clicking a pin opens a card with the synthetic original and a line to the affected number.
6. **Timeline:** A slider scrubs through the project time, events appear in order.
7. **Back:** Breadcrumb `Firma / Projekt / Position` as a dimension chain.

**Data:** a separate, static file `website/data/zwilling.json` with synthetic values. It is based on the product's demo cases, but the website does not import any code from `product/`. Visible label „Synthetische Beispieldaten“ (synthetic sample data).

**Mobile and accessibility:** simplified view (tap instead of hover, no camera move), without animation under `prefers-reduced-motion`, keyboard operable, text alternative.

**Technology (decided 22.10.):** isometric SVG with its own projection, without a 3D library. Lightweight, sharp on every screen, good on mobile devices. Camera move replaced by switching the view.

---

## 7. Measuring-point navigation (the „Ghost“)

Model: a side section navigation with a marker that moves along on scroll. In our case serious and in the language of plans.

| State | Appearance |
|---|---|
| **Collapsed** | On the right edge a vertical dimension chain with one tick per section. The active section carries the **measuring point**: a small crosshair in ultramarine, like a survey point |
| **Expanded** (hover, focus, tap) | Next to every tick the number and name in Plex Mono: `01 START`, `02 PROBLEM`, `03 ZWILLING` … The active section in ultramarine, the others in ink at 50 % |
| **On scroll** | The measuring point glides along the dimension chain. Between the ticks a fine ultramarine stroke shows the progress within the current section |
| **Click** | scrolls smoothly to the section |

Details:
- Labels come from the language files (DE and EN).
- On mobile devices only the collapsed dimension chain, expandable by tapping.
- Accessible: as `<nav aria-label>` with links, active section with `aria-current`.
- No mascot, no pixel graphics. The measuring point is the only „creature“ on the page.

---

## 8. Team

| Name | GitHub | LinkedIn | Role | Photo | Short text |
|---|---|---|---|---|---|
| Maximilian Dieringer | @MaximilianDieringer | [Profile](https://www.linkedin.com/in/maximilian-dieringer/) | `[[PLATZHALTER]]` | `[[PLATZHALTER]]` | `[[PLATZHALTER]]` |
| Maximilian Seipl | @maxi589 | [Profile](https://www.linkedin.com/in/maximilian-seipl/) | `[[PLATZHALTER]]` | `[[PLATZHALTER]]` | `[[PLATZHALTER]]` |
| Santino Schrader | @Snoft | [Profile](https://www.linkedin.com/in/santino-schrader/) | `[[PLATZHALTER]]` | `[[PLATZHALTER]]` | `[[PLATZHALTER]]` |
| Simon Fuhrbach | @simonfuhrbach-source | [Profile](https://www.linkedin.com/in/simonfuhrbach/) | `[[PLATZHALTER]]` | `[[PLATZHALTER]]` | `[[PLATZHALTER]]` |
| Construction insider | — | — | „Wir suchen Sie“ (we are looking for you) | Line drawing | `[[PLATZHALTER]]` |

Everyone writes their own role and text. Nothing is taken over automatically from LinkedIn.

---

## 9. Placeholders

**Rule:** Anything unknown appears as `[[PLATZHALTER: Beschreibung]]` in the text, never as an invented fact. In development mode placeholders are visibly marked.

| Placeholder | Where | Who clarifies |
|---|---|---|
| Name and domain | everywhere | Team |
| CTA text | Navigation, hero, contact | Team (depends on GTM) |
| Legal form, company register, VAT ID, address | Impressum, footer | after incorporation |
| Impressum, privacy policy | separate pages | Co-founder with lawyer |
| Form backend, contact email | Contact | Maxi |
| Hosting statement | Principles | Maxi |
| Product video | Section 06 | Team |
| Team roles, photos, texts | Team | everyone themselves |
| Form of address Sie or ihr | all texts | Team |

**Online (decision Maxi D., 22.10.2026):** The page is openly reachable via link (`tieout-at.pages.dev`, later `tieout.at`), with `noindex` and a preview notice. Risk deliberately accepted: Impressum and privacy policy are still placeholders, although the imprint obligation (§ 5 ECG, § 25 MedienG) applies to every accessible website. Before active distribution (linking, LinkedIn, applications) fill in the Impressum with real details. Fully live only once `npm run check:platzhalter` finds nothing.

---

## 10. Technology

| Topic | Decision |
|---|---|
| Framework | Next.js (App Router) with TypeScript, like the product |
| Styling | one CSS file with tokens from section 2 (`app/globals.css`), without Tailwind |
| Languages | two route groups `(de)` and `(en)`, texts in `messages/de.json` and `messages/en.json`, without an additional library |
| Twin | isometric SVG (section 6) |
| Animation | CSS animations and IntersectionObserver, `prefers-reduced-motion` respected |
| Form | for now without sending (placeholder), backend later |
| Analytics | later, cookieless (e.g. Plausible, Umami), so that no cookie banner is needed |
| Hosting | open. Static export (`out/`), runs on any web space |

**Folders:**

```
website/
├── STRUKTUR.md          this document
├── README.md
├── app/[locale]/        pages (DE, EN), Impressum, Datenschutz
├── components/
│   ├── sections/        Hero, Problem, Zwilling, Wege, Anwendungen, Video, Prinzipien, Team, Kontakt
│   ├── twin/            twin visualization
│   ├── nav/             navigation, language toggle, measuring-point navigation
│   └── ui/              dimension chain, button, card, placeholder
├── data/zwilling.json   synthetic data for the visualization
├── messages/            de.json, en.json
└── public/              images, favicon, preview image
```

---

## 11. Build order

| Step | Content | Result |
|---|---|---|
| 1 | Scaffold: Next.js, Tailwind tokens, grid background, DE/EN | empty page on the plan grid, toggle works |
| 2 | Navigation, measuring-point navigation, all sections with placeholder text | complete page as a shell |
| 3 | Hero and dimension chain component | first impression in place |
| 4 | Twin prototype (R3F or SVG) | technology decided |
| 5 | Build out the twin: company, project, data streams, evidence, timeline | centerpiece finished |
| 6 | remaining sections: problem, ways, applications, principles, team, contact, video | page complete in content |
| 7 | Review mobile, accessibility, performance, English | presentable |
| 8 | Impressum, privacy policy, password protection, preview hosting | shareable within the team |

After every step: commit and push to `website/build`. Merge into `main` once a state is presentable.

---

## 12. Open decisions

| # | Question | Proposal |
|---|---|---|
| 1 | Final CTA | „Demo buchen“ (22.10.), calendar integration open |
| 2 | Form of address | „Sie“ |
| 3 | Twin technology | after the prototype in step 4 |
| 4 | Hosting | EU provider, in line with the principles |
| 5 | Analytics | cookieless |
| 6 | Dark mode | later |
