// Erzeugt tokens.css, components/<Name>/preview.html + README.md und lokale Prüfseiten. Inhalte aus content.js.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const here = dirname(fileURLToPath(import.meta.url));
const P = (p) => join(here, "project", p);
const tokens = JSON.parse(readFileSync(P("tokens.json"), "utf8"));
const TITLE = "Schlusswerk UI-Fundament";
const src = readFileSync(join(here, "content.js"), "utf8").replace(/(\d) €/g, "$1 €");
const C = new Function(src + "; return SWC;")();
const I = C.I;

// ---------- tokens.css im kompilierten Aufbau (format.md) ----------
const themes = tokens.color.themes.map(t => t.id);
const colorDecl = (t) => tokens.color.tokens.map(c => `  --${c.name}: ${typeof c.value === "string" ? c.value : (c.value[t] ?? c.value[themes[0]])};`).join("\n");
const shadowDecl = (t) => tokens.shadow.tokens.map(s => `  --${s.name}: ${typeof s.value === "string" ? s.value : (s.value[t] ?? s.value[themes[0]])};`).join("\n");
const plain = ["spacing", "radius", "size"].flatMap(f => tokens[f].tokens.map(x => `  --${x.name}: ${x.value};`)).join("\n");
const fam = Object.entries(tokens.type.families).map(([k, v]) => `  --font-${k}: ${v};`).join("\n");
const styles = tokens.type.groups.flatMap(g => g.styles.map(s => `.${s.name} { font-family: var(--font-${s.family || g.family}); font-size: ${s.fontSize}; line-height: ${s.lineHeight}; font-weight: ${s.fontWeight};${s.letterSpacing ? ` letter-spacing: ${s.letterSpacing};` : ""} }`)).join("\n");
const css = `/* ${TITLE} — generated from tokens.json */
:root, [data-theme="${themes[0]}"] {
${colorDecl(themes[0])}
${shadowDecl(themes[0])}
}
${themes.slice(1).map(t => `[data-theme="${t}"] {\n${colorDecl(t)}\n${shadowDecl(t)}\n}`).join("\n")}
:root {
${plain}
${fam}
}
${styles}
`;
writeFileSync(P("tokens.css"), css);

const FONTS = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400..600&family=JetBrains+Mono:wght@400;500&display=swap">';
const doc = (name, group, height, body) => `<!-- @dsCard group="${group}" height=${height} -->
<!doctype html>
<html>
<head><meta charset="utf-8"><title>${name} — Vorschau</title>${FONTS}</head>
<body>
${body}
<script>window.Schlusswerk && window.Schlusswerk.mount();</script>
</body>
</html>
`;

const stand = C.startStand();
const J1 = C.F[0];
const out = [];
const add = (name, group, height, body, readme) => out.push({ name, group, height, body, readme });

add("AppShell", "Rahmen", 560, `<div style="display:flex;height:560px;overflow:hidden">${C.sidebar("cockpit")}<div style="flex:1;min-width:0;display:flex;flex-direction:column">${C.pagehead([["W21-B HKLS", ""]], "Übersicht")}<div class="sw-stack" style="padding:var(--space-5) var(--space-6);gap:var(--space-5)">${C.facts()}${C.steps(5)}${C.kpis()}</div></div></div>`,
`# AppShell

Der Rahmen jeder Seite: Seitenleiste links, eine Kopfzeile von 48 px, darunter der Inhalt auf \`bg\`.

**Vorlage:** Attio (helle Seitenleiste auf \`surface-subtle\`, Inhalt weiß), Linear (Kopfzeile mit Pfad und Aktionen in einer Zeile, 13 px), reebuild-Produkt (App-Grund \`#f4f4f8\` mit weißen Panels).

**Verwenden**
- Seitenleiste \`sidebar-w\`, Kopf \`head-h\`, Inhalt mit \`space-6\` Rand und \`space-5\` Abstand zwischen Panels.
- Projektfakten (GU, Auftrag, Vertragsart, Datum der Schlussrechnung) stehen nur auf der Übersicht, nicht in jeder Kopfzeile.
- Unter 900 px wird die Seitenleiste zu einer waagrechten Leiste oben.
`);

add("Seitenleiste", "Rahmen", 400, `<div style="display:flex;height:400px">${C.sidebar("befunde")}</div>`,
`# Seitenleiste

Navigation durch einen Check in fester Reihenfolge, mit Zählern; noch nicht gebaute Schritte sind sichtbar, aber deaktiviert.

**Vorlage:** Attio-Navigation (hell, Symbol + Wort), Linear (aktiver Eintrag als graue Fläche, Zähler rechts, 28 px Einträge), reebuild (Projekt-Umschalter oben).

**Verwenden**
- Reihenfolge = Ablauf: Übersicht, Ordner, Ledger, Befunde, Vorprüfung aus GU-Sicht, Schlussbesprechung, Export.
- Einträge sind echte Links (\`<a href>\`), damit Tastatur und Fokus funktionieren. Aktiv: \`aria-current="page"\`. Noch nicht verfügbar: \`aria-disabled="true"\` mit Tooltip.
- Nur die Wortmarke „Schlusswerk“, bis es ein Logo gibt. Hell/Dunkel-Schalter unten mit \`sun-moon\`.
`);

add("Seitenkopf", "Rahmen", 64, C.pagehead([["W21-B HKLS", ""], ["Befunde", "befunde"]], "22.04.12B · Plattenheizkörper Typ 22"),
`# Seitenkopf

Eine Zeile mit 48 px: Pfad und Titel links, Kennzeichnung „Synthetisch“ und höchstens zwei Aktionen rechts.

**Vorlage:** Linear-Kopfzeile (Pfad „Team / Issue“, Titel, Aktionen in einer Zeile), Attio (44–48 px).

**Verwenden**
- Pfad in \`text-muted\`, Titel in \`text\` mit Gewicht 600.
- Die Kennzeichnung „Synthetisch“ steht in jeder Kopfzeile, solange Demo-Daten geladen sind (Pflicht aus dem Umfang).
- Aktionen, die es noch nicht gibt, deaktiviert mit Tooltip; nie als bedienbar vortäuschen.
`);

add("Knopf", "Aktionen", 104, `<div class="sw-pad sw-stack"><div class="sw-row"><button class="sw-btn sw-btn--primary">Übernehmen <span class="sw-kbd">1</span></button><button class="sw-btn">Verwerfen <span class="sw-kbd">2</span></button><button class="sw-btn">${I("scale")}Braucht Anwalt <span class="sw-kbd">3</span></button><button class="sw-btn sw-btn--ghost">Zurückstellen <span class="sw-kbd">H</span></button></div><div class="sw-row"><button class="sw-btn sw-btn--sm">${I("download")}Excel</button><button class="sw-btn sw-btn--sm" aria-disabled="true">Bericht</button><button class="sw-btn sw-btn--ghost sw-btn--sm">Öffnen</button></div></div>`,
`# Knopf

Primär in Tinte, sonst mit Rand; ein Tastenhinweis zeigt die Kurztaste.

**Vorlage:** reebuild (Radius 6, Gewicht 500, Primärknopf fast schwarz), Attio (Primärknopf \`#242629\`), Linear-Triage (Tasten 1/2/3/H).

**Verwenden**
- \`sw-btn--primary\` höchstens einmal pro Bereich. Verb zuerst: „Übernehmen“, „Freigeben als Insider“.
- Größen: \`control-h\` (32) im Inhalt, \`sw-btn--sm\` (\`tab-h\`, 28) in Kopfzeilen und Panel-Köpfen.
- Rand \`field-border\` (≥ 3:1). Deaktiviert: \`aria-disabled="true"\` und Tooltip mit Grund.
- Kurztasten reagieren nicht mit Strg, Alt oder Cmd und nicht auf gehaltene Tasten.
`);

add("Statusmarke", "Status", 80, `<div class="sw-pad sw-row">${C.LISTEN.map(l => `<span class="sw-chip${l[2] ? " sw-chip--" + l[2] : ""}">${l[1]}</span>`).join("")}<span class="sw-chip sw-chip--plain">Aufmaß nicht gegengezeichnet</span></div>`,
`# Statusmarke

Pille mit Punkt und Wort: zu welcher Liste ein Posten gehört. Nur für Listen und Kürzungsgründe, nicht für den Bearbeitungsstand.

**Vorlage:** Linear-Labels (Pille mit Rand, farbiger Punkt, Text in normaler Farbe).

**Verwenden**
- Listen: „Jetzt verrechenbar“ (\`pos\`), „Angemeldet und offen“ (\`warn\`), „Verloren“ (neutral), „Braucht Anwalt“ (\`law\`).
- Kürzungsgründe aus der festen Liste ohne Punkt (\`sw-chip--plain\`).
- In Tabellen steht die Liste als Gruppenkopf, nicht in jeder Zeile.
`);

add("Stand", "Status", 72, `<div class="sw-pad sw-row" style="gap:var(--space-5)">${["pruefen", "uebernommen", "frei", "verworfen", "anwalt", "zurueck"].map(s => C.standHtml({ st: s })).join("")}</div>`,
`# Stand

Wie weit ein Posten bearbeitet ist: Symbol plus Wort, ohne Rahmen.

**Vorlage:** Linear-Statusspalte (Kreis-Symbol plus Wort), reebuild-Freigabe (Stufen).

**Verwenden**
- Prüfen → Übernommen (M) → Freigegeben (I). Daneben: Verworfen (mit Grund), Braucht Anwalt, Zurückgestellt.
- Nur „Freigegeben“ ist farbig (\`pos\`), „Braucht Anwalt“ in \`law\`; alles andere neutral. Der Akzent wird nie für Status verwendet.
`);

add("Pruefstand", "Status", 72, `<div class="sw-pad sw-row"><span class="sw-state sw-state--machine">${I("bot")}Maschinell</span><span class="sw-state sw-state--human">${I("user-check")}Bestätigt</span><span class="sw-state sw-state--blocked">${I("lock")}Blockiert</span></div>`,
`# Prüfstand

Zeigt an einem einzelnen Wert, ob ihn die Maschine gelesen, ein Mensch bestätigt oder eine Regel blockiert hat.

**Vorlage:** Rossum (gelb = ausgelesen und ungeprüft, grün = vom Menschen geprüft, rot = blockiert die Bestätigung), Harvey Review Tables (Zelle nach Freigabe gesperrt).

**Verwenden**
- Rechts neben jedem Wert im Rechenweg eines Befunds und an Ledger-Zellen.
- Export erst, wenn kein „Blockiert“ offen ist.
`);

add("Kennzahl", "Daten", 150, `<div class="sw-pad">${C.kpis()}</div>`,
`# Kennzahl

Die drei Listen als Beträge: Label, Betrag, eine Kontextzeile.

**Vorlage:** reebuild-Projektübersicht (Label in Großbuchstaben, großer Betrag, eine Zeile Kontext). Abweichung: reebuild setzt weiche Schatten, wir einen Rand \`line-strong\` (Linear, Attio).

**Verwenden**
- Label \`label\`, Betrag \`kpi\` mit Tabellenziffern, Kontext \`meta\`.
- Genau drei Karten; die Vorprüfung gehört nicht in diese Reihe, weil sie sich mit „Jetzt verrechenbar“ überschneidet.
- Beträge immer mit geschütztem Leerzeichen vor dem €: „27.410,00 €“.
`);

add("Schrittleiste", "Daten", 100, `<div class="sw-pad">${C.steps(5)}</div>`,
`# Schrittleiste

Wo der Check steht: vier feste Schritte, erledigt mit Häkchen, der aktuelle gefüllt.

**Vorlage:** reebuild-Ablauf „Erfassen → Replizieren → Abgleichen → Kontrollieren und Freigeben“, Kuro „x von y“.

**Verwenden**
- Unter jedem Schritt eine Zeile mit Zahlen. Der letzte zählt „x von 12 Posten freigegeben“ (nur Stufe 2 zählt).
`);

add("Tabelle", "Daten", 520, `<div class="sw-pad"><div class="sw-panel"><div class="sw-panel__head"><span class="section-title">Befunde</span><div class="sw-tabs" role="tablist"><button class="sw-tab" role="tab" aria-selected="true">Alle <span class="sw-count">13</span></button><button class="sw-tab" role="tab">Zu entscheiden <span class="sw-count">7</span></button><button class="sw-tab" role="tab">Freigegeben <span class="sw-count">5</span></button></div></div>${C.befundTable(stand, null, "J1")}</div></div>`,
`# Tabelle

Dichte Arbeitstabelle, nach Liste gruppiert mit Zwischensumme; eine Zeile pro Posten, Herkunft klein am Wert.

**Vorlage:** Linear (13 px, „Group by“ mit Gruppenkopf, j/k-Navigation, keine Kästen), reebuild „Ausgelesene Positionen“ (Pos.-Nr., Bezeichnung), Hebbia (Herkunft direkt am Wert), Siteline (Gerechnetes in \`text-secondary\`), Ramp (Hinweis direkt an der Zeile).

**Verwenden**
- Feste Spaltenbreiten (\`table-layout: fixed\`), damit nichts überläuft; lange Texte kürzen mit „…“.
- Zeilenhöhe über den Innenabstand: einzeilig \`row-h\` (36), mit Unterzeile \`row-h-2\` (48).
- Positionsnummer in \`mono\`, gedämpft, vor dem Titel (wie Linear „DRV-8852“).
- Kürzungsrisiko als kleines Warnsymbol am Betrag, nicht als zusätzliche Marke.
- Jede Zeile ist fokussierbar (\`tabindex="0"\`), Enter öffnet, j/k wechselt.
`);

add("BelegChip", "Belege", 72, `<div class="sw-pad sw-row">${C.chip("planD", "H-201_Heizung_Stiege2_D.pdf · Blatt 1")}<button class="sw-source" aria-pressed="true">${I("mail")}2026-04-07_Bauleitung_Planindex-D.eml</button>${C.chip("ab12", "AB-12_Aufmass_Heizung.pdf · S. 2")}<span class="sw-source sw-source--empty">kein Beleg</span></div>`,
`# Beleg-Chip

Verweis auf eine Fundstelle: voller Dateiname und Seite; ein Klick öffnet das Original an dieser Stelle.

**Vorlage:** Kuro „Fundstellen“ (Chip „Leistungsbeschreibung_GU.pdf, S. 14“ unter jeder Aussage), Hebbia (Quellenspalte).

**Verwenden**
- Voller Dateiname wie im Betrachter, dazu „S. x“ oder „Blatt x“. Kompakt (nur so breit wie der Text).
- Symbol nach Typ: Plan \`map\`, Mail \`mail\`, Aufmaß \`ruler\`, Foto \`image\`, Tabelle \`table\`, sonst \`file-text\`.
- Rand \`field-border\` (≥ 3:1), gewählt \`accent\` auf \`accent-soft\`. Fehlender Beleg: gestrichelt „kein Beleg“.
`);

add("Belegmatrix", "Belege", 340, `<div class="sw-pad"><div class="sw-panel">${C.matrix()}</div></div>`,
`# Belegmatrix

Der Projektzwilling als Arbeitsfläche: Zeile = LV-Position, Spalte = Belegart, Zelle = Fundstelle zum Anklicken.

**Vorlage:** Hebbia Matrix und Harvey Review Tables (Objekte × Fragen, jede Zelle mit Quelle), Idee des „Digital Twin“ von Stratos (alle Daten eines Objekts verbunden).

**Verwenden**
- Lücken sichtbar machen: „kein Beleg“ ist eine Aussage, kein leeres Feld.
- Positionen mit Befund verlinken auf den Befund; Zellen öffnen das Original.

**Nicht:** Netz- oder Hub-Grafiken. Der Zwilling wird als Tabelle gezeigt, an der man arbeiten kann.
`);

add("Dokumentbetrachter", "Belege", 480, `<div class="sw-pad"><div class="sw-viewer" style="height:440px"><div class="sw-viewer__bar"><span class="sw-viewer__file">AB-12_Aufmass_Heizung.pdf</span><div class="sw-viewer__tools"><button class="sw-btn sw-btn--ghost sw-btn--sm">${I("chevron-left")}</button><span>S. 2 / 3</span><button class="sw-btn sw-btn--ghost sw-btn--sm">${I("chevron-right")}</button><button class="sw-btn sw-btn--ghost sw-btn--sm">${I("zoom-out")}</button><span>100 %</span><button class="sw-btn sw-btn--ghost sw-btn--sm">${I("zoom-in")}</button></div></div>
<div class="sw-viewer__body"><div class="sw-viewer__canvas">${C.page("ab12")}</div><div class="sw-viewer__rail">${J1.belege.map(b => `<button class="sw-thumb"${b[1] === "ab12" ? ' aria-current="true"' : ""}><span class="sw-thumb__page">${C.page(b[1])}</span>${C.D[b[1]].label}</button>`).join("")}</div></div></div></div>`,
`# Dokumentbetrachter

Das Original neben dem Befund: Fundstelle markiert, Risiko-Stellen eigens markiert, die Belege der Kette als echte Miniaturen.

**Vorlage:** Kuro „Risiken erkennen“ (Dateiname, „S. 14 / 86“, markierte Stelle, Seitenminiaturen mit umrandeter aktiver Seite), Rossum (Rahmen um den Wert im Original).

**Verwenden**
- Kopf: voller Dateiname in \`mono\`, Blättern, „S. x / y“, Zoom.
- Papier \`doc-paper\` in beiden Themen. Fundstelle \`doc-mark\` mit Unterstrich \`doc-mark-line\`; Stelle mit Kürzungsrisiko (z. B. fehlende GU-Unterschrift) \`doc-risk\` mit Rahmen \`doc-risk-line\`.
- Jede Seite trägt die Marke „Synthetisch“ (\`doc-muted\`, ≥ 4,5:1), solange Demo-Daten geladen sind.
- Fotos ohne echtes Bild als ehrlich beschrifteter Platzhalter.
`);

add("Beweiskette", "Belege", 420, `<div class="sw-pad" style="max-width:520px"><div class="sw-chain">${J1.belege.map((b, i) => { const d = C.D[b[1]]; return `<div class="sw-ev"${i === 3 ? ' aria-current="true"' : ""}><span class="sw-ev__date">${b[0]}</span><span class="sw-ev__rail"></span><div class="sw-ev__body"><b>${b[2]}</b><span>${b[3]}</span><button class="sw-source"${i === 3 ? ' aria-pressed="true"' : ""}>${I(d.icon)}${d.file}</button></div></div>`; }).join("")}</div></div>`,
`# Beweiskette

Alle Belege eines Postens in zeitlicher Reihenfolge, das LV als erster Beleg.

**Vorlage:** Linear-Aktivität (Zeitstrahl mit Punkten), Payapps „Variation History“ (Verlauf eines Nachtrags).

**Verwenden**
- Datum links (Tabellenziffern, „–“ wenn zeitlos wie das LV), Titel \`ui-strong\`, Aussage in einem Satz, dann der Beleg-Chip.
- Die Aussage beschreibt nur, was im Dokument steht. Keine Bewertung.
`);

add("Freigabeleiste", "Aktionen", 180, `<div class="sw-stack" style="gap:0"><div class="sw-decide"><div class="sw-row"><button class="sw-btn sw-btn--primary">Übernehmen <span class="sw-kbd">1</span></button><button class="sw-btn">Verwerfen <span class="sw-kbd">2</span></button><button class="sw-btn">${I("scale")}Braucht Anwalt <span class="sw-kbd">3</span></button><button class="sw-btn sw-btn--ghost">Zurückstellen <span class="sw-kbd">H</span></button></div><div class="sw-decide__line">${C.standHtml({ st: "pruefen" })}<span>Noch nicht entschieden.</span></div></div>
<div class="sw-decide"><div class="sw-row"><button class="sw-btn sw-btn--primary">Freigeben als Insider <span class="sw-kbd">F</span></button><button class="sw-btn">Zurück an Prüfung</button></div><div class="sw-decide__line">${C.standHtml({ st: "uebernommen" })}<span>Übernommen</span>${C.person("M")}<span>22.10.2026, 14:12</span><span class="sw-muted">· wartet auf Freigabe durch</span>${C.person("I")}</div></div></div>`,
`# Freigabeleiste

Die Entscheidung über einen Posten in zwei Stufen, immer sichtbar am unteren Rand der Befund-Spalte: übernehmen (Prüfung, M), dann freigeben (Insider, I).

**Vorlage:** Linear-Triage (1 annehmen, 2 ablehnen mit Grund, H zurückstellen), reebuild-Freigabe-Workflow (nummerierte Stufen mit zuständiger Person, „freigegeben von …“ mit Zeit), Attio (Verlauf jeder Änderung).

**Verwenden**
- Stufe 1 (M): Übernehmen 1, Verwerfen 2 (fragt nach Grund aus fester Liste), Braucht Anwalt 3, Zurückstellen H.
- Stufe 2 (I): „Freigeben als Insider“ F oder „Zurück an Prüfung“.
- Unter den Knöpfen: Stand, Person mit Kürzel, echte Uhrzeit, nächster Schritt. Jede Entscheidung bekommt einen Eintrag im Verlauf; Rückgängig nimmt den letzten Eintrag zurück.
`);

add("Pruefkaskade", "Daten", 640, `<div class="sw-pad"><div class="sw-panel">${C.cascade(true)}</div></div>`,
`# Prüfkaskade

Die Schlussrechnung aus GU-Sicht von der Leistungssumme bis zur Restforderung, jede Zeile mit Bezugsgröße, Quelle und Vertragsabgleich.

**Vorlage:** reebuild „Inhaltliche Prüfung“ (Gruppen Nachlass / leistungsmindernde Abzüge / Einbehalte mit Zwischensummen, Bezugsgröße in Klammern, „laut Vertrag“ grün, „Abweichung“ orange), BuildPass (Kaskade bis „zahlbar“), Document Crunch („fehlt im Vertrag“ als eigene Aussage).

**Verwenden**
- Gruppen: Abzüge laut GU-Abzugsschreiben, Einbehalte, Zahlungen; jede mit Summe.
- Unter jeder Zeile die Bezugsgröße („auf die Summe nach Nachlass“).
- Prüfung nur als Tatsache: „laut Vertrag Pkt. x“ oder „kein Vertragspunkt gefunden“. Keine Aussage, ob ein Abzug zulässig ist.
- Die Zeile „Zahlungen“ klappt die einzelnen Abschlagsrechnungen auf.
`);

add("UploadVerlauf", "Belege", 220, `<div class="sw-pad">${C.upload()}</div>`,
`# Upload-Verlauf

Was ein Ordner-Upload geändert hat: neue Versionen, Duplikate, neu zugeordnete Dokumente.

**Vorlage:** Kuro „Änderungen verstehen“ (alter und neuer Stand verbunden, Status pro Dokument), PlanRadar (Planversionen).

**Verwenden**
- Oben ein Satz mit Zahlen („165 Dokumente, davon 12 Duplikate“). Linie in \`accent\` bei neuer Version.
- Status-Wörter: „Neu“, „Neue Version“, „Duplikat“, „Zugeordnet“, „Prüfen“.
`);

add("Toast", "Aktionen", 72, `<div class="sw-pad"><div class="sw-toast" role="status">Übernommen: 22.04.12B Plattenheizkörper Typ 22<button>${I("undo")}Rückgängig</button></div></div>`,
`# Toast

Kurze Bestätigung nach einer Entscheidung, mit Rückgängig; verschwindet nach 5 Sekunden.

**Vorlage:** Linear (dunkler Toast unten, Rückgängig im Toast), Playbook-Regel „Rückgängig statt Bestätigungsdialog“.

**Verwenden**
- Ein Satz mit dem festen Begriff: „Übernommen: …“, „Freigegeben: …“, „Braucht Anwalt: …“.
- Rückgängig nimmt den letzten Eintrag im Verlauf zurück; mehrere Schritte nacheinander sind möglich.
`);

for (const c of out) {
  mkdirSync(P(`components/${c.name}`), { recursive: true });
  writeFileSync(P(`components/${c.name}/preview.html`), doc(c.name, c.group, c.height, c.body));
  writeFileSync(P(`components/${c.name}/README.md`), c.readme);
}
const bundleCss = readFileSync(P("components/bundle.css"), "utf8");
const bundleJs = readFileSync(P("components/bundle.js"), "utf8");
for (const theme of ["light", "dark"]) {
  const pg = `<!doctype html><html data-theme="${theme}"><head><meta charset="utf-8">${FONTS}<style>${css}\n${bundleCss}\n.qa{border-bottom:4px solid var(--line-strong);padding-bottom:var(--space-2)}.qa h6{margin:0;padding:var(--space-1) var(--space-4);font:600 12px system-ui;background:var(--surface-selected);color:var(--text)}</style></head><body>
${out.map(c => `<section class="qa"><h6>${c.name} · ${c.group}</h6>${c.body}</section>`).join("\n")}
<script>${bundleJs}</script></body></html>`;
  writeFileSync(join(here, `qa-${theme}.html`), pg);
}
console.log(out.length, "Bauteile geschrieben; tokens.css und Prüfseiten erzeugt");
