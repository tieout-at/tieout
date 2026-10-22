# Website

Public website of **tieout** (lowercase, no trailing dot): Next.js 16 with static export, German and English, with no dependency on the product code. Structure, visual identity and placeholder rules: [`STRUKTUR.md`](STRUKTUR.md) (German).

## Run

```bash
npm install
npm run dev
```

Then open http://localhost:3210 (German) or http://localhost:3210/en/ (English).

| Command | Purpose |
|---|---|
| `npm run dev` | development with live reload |
| `npm run build` | static export to `out/` (runs on any web host) |
| `npm run typecheck` | check TypeScript |
| `npm run deploy` | build and upload to Cloudflare Pages (project `tieout-at`) |
| `npm run check:platzhalter` | list all `[[PLATZHALTER]]`; must be empty before going fully live |

## Layout

```
app/(de)/            German: /, /impressum, /datenschutz
app/(en)/en/         English: /en, /en/impressum, /en/datenschutz
app/globals.css      design tokens (paper, ink, ultramarine), grid, all styles
components/nav/      header with DE/EN switch, section navigation
components/sections/ sections: hero, problem and solution, video, team, demo
components/flow/     animated flow inputs → twin → final invoice (SVG, sample projects rotate every 5 s)
components/problem/  project timeline with "today | with tieout" switch
components/ui/       logo, dimension line, placeholder, reveal, Fit (laptop layout scaled down on phones)
messages/            all copy: de.json, en.json
public/hero/         hero photos (Unsplash, sources in QUELLEN.md)
public/team/         team photos (LinkedIn, with the team's consent)
public/logos/        logos of universities and employers, recoloured in ultramarine
```

Change copy only in `messages/`, never in the code. New placeholders are always written as `[[PLATZHALTER: …]]` (German) or `[[PLACEHOLDER: …]]` (English).

## Hosting

- Cloudflare Pages, project `tieout-at`; `npm run deploy` updates the live site.
- Domain **tieout.at** via Cloudflare DNS (`tieout.at` and `www.tieout.at` as custom domains of the project). The old address `endpoint-preview.pages.dev` redirects with 301.
- The site sets `noindex` until imprint and privacy policy are final.
