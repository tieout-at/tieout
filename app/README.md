# app

The v2 app: Next.js (static export), React, TypeScript, Tailwind, shadcn components on Base UI, Lucide icons, Inter self-hosted. Online at https://app-neu.tieout.workers.dev until the switch-over (step 12). Design rules and every measured value: [`docs/DESIGN.md`](../docs/DESIGN.md). Status of the rebuild: [`docs/_STATUS.md`](../docs/_STATUS.md).

v1 runs at https://app.tieout.workers.dev; its code is under the tag [`v1-archiv`](https://github.com/tieout-at/tieout/tree/v1-archiv/product/app).

## Commands

| Command | What |
|---|---|
| `npm run dev` | local at http://localhost:3100 |
| `npm run check` | typecheck, lint, tests, build (the same as CI) |
| `npm run build` | static export to `out/`, then `scripts/flatten-prefetch.mjs` and the word check `scripts/check-words.mjs` |
| `npm run screens` | screenshots of every screen with the local Edge into `qa-shots/` (needs the app on port 3100) |

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
| `src/lib/table.ts` | sort, filter and which fixed sum fits the visible rows (tested); `src/components/table/` draws the table |
| `src/lib/twin.ts` | view model of the Übersicht (Belege, Ebene 1, the Abgleich per position, findings, money), computed from `kern/` while the pages are built |
| `src/app/uebersicht/` | the Übersicht (Digitaler Zwilling): Wohnpark Mooshaim at `/uebersicht/`, every other open project at `/uebersicht/<slug>/`; closed projects have none |
| `src/components/zwilling/` | its stage: `model.ts` (indices and sentences), `layout.ts` (pure layout and line routing, tested with real, small, large, long and empty data), `use-stage-geometry.ts` and `use-trace-lines.ts` (measure once, draw a trace), the columns, the cards and the sheet for phones; every tunable number in `config.ts` |
| `src/lib/search.ts` | abbreviations ("RB 11" becomes "Regiebericht 11") and matching |
| `wrangler.jsonc` | Cloudflare worker `app-neu`, static files from `out/` |

`@emnapi/core` and `@emnapi/runtime` are pinned only so that a lock file written on Windows passes `npm ci` on Linux (CI and Cloudflare): npm leaves out the packages bundled in Tailwind's WebAssembly fallback.
