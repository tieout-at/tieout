# UI foundation: sources

Online (private in the claude.ai account of Maxi S.; visible to others only after sharing via the page menu):
- [Design system „Schlusswerk UI-Fundament“ v2](https://claude.ai/artifact/2yx5HB3X95GRzud9xi7Kqk)
- [Key screens v2](https://claude.ai/artifact/1mec2zqoGB7KHNRpMoHP9n)

Without access: open `Schlusswerk-Bildschirme.html` in this folder in the browser; preview of every component under `project/components/<Name>/preview.html`.

The reference screenshots (products by reebuild, Kuro, Linear etc., about 16 MB) are deliberately not in the repository: third-party material. The measurements taken from them are in `../docs/UI-Messblatt.md` and `../../docs/research_notes/UI_Referenzen.md`.

| File | What |
|---|---|
| `make-tokens.mjs` | writes `project/tokens.json` and checks all color contrasts (80 pairs, light and dark) |
| `content.js` | **one** source for content and building blocks (findings, evidence, cascade, matrix); shared by previews and screens |
| `gen-components.mjs` | writes `project/tokens.css` and all 18 components (`project/components/<Name>/preview.html` + `README.md`) |
| `gen-screens.mjs` | builds `Schlusswerk-Bildschirme.html` (path as argument) from components only |
| `qa-screens.ps1`, `measure-probe.ps1`, `overflow.ps1` | screenshots with Edge headless; heights, overflow |
| `screenshots/` | state v2, light and dark |
| `project/` | exactly the content of the design system Artifact |

Order after a change: `node make-tokens.mjs` → `node gen-components.mjs` → `node gen-screens.mjs "<Pfad>\Schlusswerk-Bildschirme.html"` → screenshots and measurement → publish (design system: only changed files under `project/`, `design-system.json` last with a new `lastChange`).

Change files only with Node or the Write tool, not with PowerShell `Set-Content` (destroys umlauts). The scripts expect the files in the same folder as themselves.
