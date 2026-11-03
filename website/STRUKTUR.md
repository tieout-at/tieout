# Website: structure and rules

**As of:** 3.11.2026, live at https://tieout.at (and https://tieout-at.pages.dev). How to run, build and deploy: [`README.md`](README.md). This file holds the rules every change to the website follows.

## 1. Goal

In a few seconds the page says what tieout does: **Schlussrechnungen für Elektro- und HKLS-Betriebe, die nichts liegen lassen**, built on the digital twin of the business. The call to action is **„Demo buchen“**. No prices, no packages, no offers.

## 2. Page

One page per language, sections in this order (labels of the side navigation in brackets):

| # | Section | Content | Component |
|---|---|---|---|
| 01 | Hero (Start) | headline, subline, three photos, each with one benefit | `sections/Hero.tsx` |
| 02 | Problem | the project timeline of Wien 21 with the switch „Heute \| Mit tieout“ | `problem/Timeline.tsx` |
| 03 | Lösung | the flow: Ihre Daten → Digitaler Zwilling → Ergebnis, sample projects rotate | `flow/Flow.tsx`, `sections/Solution.tsx` |
| 04 | Produktvideo (Video) | the launch film, 16:9 on laptops, 4:5 on phones | `sections/Video.tsx` |
| 05 | Über uns (Team) | four founders with role, stations and logos | `sections/Team.tsx` |
| 06 | Demo | month calendar with free slots and the contact form | `sections/Calendar.tsx`, `sections/Contact.tsx` |
| | Footer | Impressum, Datenschutz, LinkedIn | `Footer.tsx` |

Site map: `/`, `/en/`, `/impressum/`, `/datenschutz/` and their English pages under `/en/`.

The three steps of section 03 (`messages/de.json`, key `solution`) are also the structure of the app.

## 3. Design

| Element | Rule |
|---|---|
| Colours | paper `#F4F6F9`, ink `#0A1020`, ultramarine `#1D3BFF`; lines only: grid `#D5DCE6`, fine grid `#E8ECF2` |
| Type | Inter Tight (headlines 600, text 400); IBM Plex Mono for numbers, dimensions and labels |
| Background | architect's paper: grid 48 px, fine grid 12 px |
| Leitmotif | dimension lines for numbers, transitions and the side navigation (measuring point in ultramarine) |
| Buttons | primary ultramarine with white text, secondary outline in ink; corners square (0 to 2 px) |
| Motion | calm: lines draw themselves, nothing bounces; `prefers-reduced-motion` turns animations off |
| Phones | the laptop layout of timeline and flow is scaled down (`ui/Fit.tsx`); no horizontal scrolling at 390 px |

Logo and brand files: [`../brand/README.md`](../brand/README.md).

## 4. Language and content

- German at `/`, English at `/en/`; the switch `DE | EN` keeps the section.
- All copy in `messages/de.json` and `messages/en.json`, never in the code. The type `Messages` is derived from `de.json`, so both files have the same keys.
- Form of address „Sie“. Never the word „Claim“. No invented figures; statements about the market only with a source.
- The website tells its own example (project Wien 21, electrical, 5.546 € open), independent of the app's sample company; decided on 23.10.2026.
- No sample-data labels on the website (decided by Maxi D. on 3.11.2026). All amounts are invented.
- Team texts come from each founder; photos from LinkedIn with their consent.

## 5. Placeholders

Anything unknown is written as `[[PLATZHALTER: …]]` (German) or `[[PLACEHOLDER: …]]` (English), never invented; `ui/Ph.tsx` marks them visibly. `npm run check:platzhalter` lists them.

Open on purpose: the Impressum and Datenschutz details (no company is registered yet), the form backend and the calendar connection. The page is reachable by link and sets `noindex` while these are open.

## 6. Technology

- Next.js 16 (App Router, static export to `out/`), TypeScript, one CSS file with the tokens (`app/globals.css`), no Tailwind, no dependency on the product code.
- Route groups `(de)` and `(en)`; texts without an i18n library (`lib/i18n.ts`).
- Animations in CSS and SVG with IntersectionObserver.
- Hosting on Cloudflare Pages, project `tieout-at` (`README.md`, section Hosting). Photos are from Unsplash (`public/hero/QUELLEN.md`), the films are in `public/film/`.
