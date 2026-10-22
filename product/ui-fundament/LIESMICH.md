# UI-Fundament: Quellen

Online (privat im claude.ai-Konto von Maxi S.; für andere erst nach Teilen über das Menü der Seite sichtbar):
- [Design-System „Schlusswerk UI-Fundament“ v2](https://claude.ai/artifact/2yx5HB3X95GRzud9xi7Kqk)
- [Schlüsselbildschirme v2](https://claude.ai/artifact/1mec2zqoGB7KHNRpMoHP9n)

Ohne Zugang: `Schlusswerk-Bildschirme.html` in diesem Ordner im Browser öffnen, Vorschau jedes Bauteils unter `project/components/<Name>/preview.html`.

Die Referenz-Screenshots (Produkte von reebuild, Kuro, Linear usw., etwa 16 MB) liegen bewusst nicht im Repository: fremdes Material. Die Messwerte daraus stehen in `../docs/UI-Messblatt.md` und `../../docs/research_notes/UI_Referenzen.md`.

| Datei | Was |
|---|---|
| `make-tokens.mjs` | schreibt `project/tokens.json` und prüft alle Farbkontraste (80 Paare, hell und dunkel) |
| `content.js` | **eine** Quelle für Inhalte und Bausteine (Befunde, Belege, Kaskade, Matrix); von Vorschauen und Bildschirmen gemeinsam genutzt |
| `gen-components.mjs` | schreibt `project/tokens.css` und alle 18 Bauteile (`project/components/<Name>/preview.html` + `README.md`) |
| `gen-screens.mjs` | baut `Schlusswerk-Bildschirme.html` (Pfad als Argument) nur aus Bauteilen |
| `qa-screens.ps1`, `measure-probe.ps1`, `overflow.ps1` | Screenshots mit Edge headless; Höhen, Überlauf |
| `screenshots/` | Stand v2, hell und dunkel |
| `project/` | genau der Inhalt des Design-System-Artifacts |

Reihenfolge nach einer Änderung: `node make-tokens.mjs` → `node gen-components.mjs` → `node gen-screens.mjs "<Pfad>\Schlusswerk-Bildschirme.html"` → Screenshots und Messung → veröffentlichen (Design-System: nur geänderte Dateien unter `project/`, `design-system.json` zuletzt mit neuem `lastChange`).

Dateien nur mit Node oder dem Write-Werkzeug ändern, nicht mit PowerShell `Set-Content` (zerstört Umlaute). Die Skripte erwarten die Dateien im selben Ordner wie sich selbst.
