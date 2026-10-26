# app

The v2 app: Next.js (static export), React, TypeScript, Tailwind, shadcn components on Base UI, Lucide icons, Inter self-hosted. Online at https://app.tieout.workers.dev (Cloudflare worker `app`) since the switch-over in step 8c. Design rules and every measured value: [`docs/DESIGN.md`](../docs/DESIGN.md). Status of the rebuild: [`docs/_STATUS.md`](../docs/_STATUS.md).

v1 is archived at https://app-v1.tieout.workers.dev (worker `app-v1`, frozen); its code is under the tag [`v1-archiv`](https://github.com/tieout-at/tieout/tree/v1-archiv/product/app).

## Commands

| Command | What |
|---|---|
| `npm run dev` | local at http://localhost:3100 |
| `npm run check` | typecheck, lint, tests, build (the same as CI) |
| `npm run build` | static export to `out/`, then `scripts/flatten-prefetch.mjs` and the word check `scripts/check-words.mjs` |
| `node scripts/serve-out.mjs 3103` | serves `out/` for screenshots and customer tests (`serve` ran out of file handles on Windows) |
| `npm run screens` | screenshots of every screen with the local Edge into `qa-shots/` (needs the app on port 3100); `node scripts/screens.mjs <url> qa-shots fundseite` takes only the screens whose name starts with `fundseite` |

## Map

| Path | What |
|---|---|
| `src/app/` | one folder per page; `projekte/[projekt]/` is the project page with its step bar and tabs ("Überblick" first), `auftraggeber/[auftraggeber]/` the Auftraggeber page |
| `src/components/shell/` | sidebar, header, search (Strg K), empty states, record head, step bar |
| `src/components/ui/` | buttons, menus, popovers, dialogs (shadcn on Base UI, restyled to the tokens) |
| `src/lib/navigation.ts` | every page of the sidebar in one place; sidebar, header and search read from it |
| `src/lib/example.ts` | names of the sample company from `docs/Demo_Faelle.md`, no amounts; a test checks them against `kern/` |
| `src/lib/kern-data.ts` | rows and fixed sums of the tables, computed from `kern/` (`@tieout/kern`, linked as `file:../kern`) while the pages are built |
| `src/lib/records.ts` | record pages (project, Auftraggeber): Angaben with the place in the original, highlights, Verlauf, history; drawn by `src/components/record/` |
| `src/lib/finds.ts` | the find page `/funde/<projekt>-f1/`: Rechenweg with the source of every quantity and price, Belege split into work and price, Kürzungsrisiko with Abhilfe, Verlauf, and the original pages each source points to; drawn by `src/components/fund/` |
| `src/lib/originals.ts` | the original viewer: a page of a Beleg drawn from the values the twin read from it (no scans in the sample data, and the page says so), and which part of it a source marks |
| `src/lib/decisions.ts` | decisions and tasks on a find, append only, kept in the browser until the backend (step 10) |
| `src/lib/table.ts` | sort, filter and which fixed sum fits the visible rows (tested); `src/components/table/` draws the table |
| `src/lib/twin.ts` | view model of the Übersicht (Belege, Ebene 1, the Abgleich per position, findings, money), computed from `kern/` while the pages are built |
| `src/app/uebersicht/` | the Übersicht (Digitaler Zwilling): Wohnpark Mooshaim at `/uebersicht/`, every other open project at `/uebersicht/<slug>/`; closed projects have none |
| `src/components/zwilling/` | its stage: `model.ts` (indices and sentences), `layout.ts` (pure layout and line routing, tested with real, small, large, long and empty data), `use-stage-geometry.ts` and `use-trace-lines.ts` (measure once, draw a trace), the columns, the cards and the sheet for phones; every tunable number in `config.ts` |
| `src/lib/search.ts` | abbreviations ("RB 11" becomes "Regiebericht 11") and matching |
| `wrangler.jsonc` | Cloudflare worker `app`, static files from `out/` |

`@emnapi/core` and `@emnapi/runtime` are pinned only so that a lock file written on Windows passes `npm ci` on Linux (CI and Cloudflare): npm leaves out the packages bundled in Tailwind's WebAssembly fallback.
