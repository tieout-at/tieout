// Erzeugt project/tokens.json und prüft Kontraste (WCAG 2) für alle Textpaare in hell und dunkel.
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const here = dirname(fileURLToPath(import.meta.url));

const C = (name, light, dark, usage) => ({ name, value: { light, dark }, usage });
const colors = [
  // Flächen
  C("bg", "#f4f4f8", "#08090a", "App-Grund hinter Panels. Hell: reebuild-Produkt (Pixelmessung), dunkel: Linear."),
  C("surface", "#ffffff", "#0f1011", "Panels, Tabellen, Karten, Kopfzeile. Hell: reebuild/Attio, dunkel: Linear."),
  C("surface-subtle", "#fafafb", "#141516", "Seitenleiste, Tabellenkopf, Summenzeilen. Attio (hell), Linear (dunkel)."),
  C("surface-hover", "#f0f0f4", "#1a1b1d", "Zeile oder Eintrag unter dem Mauszeiger."),
  C("surface-selected", "#e8e9ef", "#222326", "Gewählte Zeile, aktiver Navigationseintrag, neutrale Marke."),
  // Linien
  C("line", "#e6e6ec", "#232425", "Haarlinien zwischen Zeilen und Bereichen. Linien statt Schatten (Konsens). Dunkel: Weiß 8 % auf surface (Linear)."),
  C("line-strong", "#d4d4dc", "#2e2e32", "Panel-Rahmen, Trenner zu Summenzeilen. Hell: reebuild-Produkt, dunkel: Linear #2e2e32."),
  C("field-border", "#838892", "#6b707a", "Rand von Eingabefeldern und Sekundärknöpfen (mind. 3:1 auf surface)."),
  // Text
  C("text", "#101112", "#f7f8f8", "Haupttext, Zahlen. Auf bg, surface, surface-subtle, surface-hover, surface-selected. Attio (hell), Linear (dunkel)."),
  C("text-secondary", "#3b4049", "#d0d6e0", "Zweite Ebene: Unterzeilen, Metadaten mit Gewicht. Auf allen Flächen. Klar getrennt von text-muted (Linear: vier getrennte Stufen). Dunkel: Linear #d0d6e0."),
  C("text-muted", "#5f656e", "#8f949d", "Beschriftungen, Spaltenköpfe, Zeitangaben. Auf allen Flächen (≥ 4,5:1). Linear #8a8f98 leicht aufgehellt für 4,5:1 auf surface-selected."),
  C("text-disabled", "#9ca1aa", "#5c6068", "Nur deaktivierte Elemente; trägt keine Information."),
  // Aktion
  C("action", "#242629", "#f7f8f8", "Primärknopf (Tinte). Attio-Knopf #242629 hell, Linear hell-auf-dunkel."),
  C("action-hover", "#101112", "#ffffff", "Primärknopf beim Überfahren."),
  C("on-action", "#ffffff", "#08090a", "Text und Symbole auf action."),
  // Akzent (Platzhalter)
  C("accent", "#2563e0", "#6d9cf8", "PLATZHALTER bis zur Markenabstimmung (Attio-Blau #266df0, für 4,5:1 auf bg leicht abgedunkelt). Fokusring, Links, gewählte Beleg-Chips. Nie für Status."),
  C("accent-soft", "#e9f0fd", "#16223a", "Hintergrund gewählter Beleg-Chips und Markierungen im Werkzeug."),
  C("on-accent", "#ffffff", "#08090a", "Text auf accent."),
  // Semantik (Rossum-Prüfstände, reebuild „laut Vertrag / Abweichung“)
  C("pos", "#13703f", "#4cc38a", "Bestätigt, laut Vertrag, jetzt verrechenbar. Als Text auf surface und pos-soft."),
  C("pos-soft", "#e6f4ec", "#0f2a1d", "Hintergrund positiver Marken."),
  C("warn", "#935500", "#e7a83e", "Maschinell ungeprüft, Abweichung, angemeldet und offen. Als Text auf surface und warn-soft."),
  C("warn-soft", "#fcf1df", "#2d2210", "Hintergrund von Warn-Marken."),
  C("neg", "#b42318", "#f6786d", "Blockiert, Rechenfehler, verloren. Als Text auf surface und neg-soft."),
  C("neg-soft", "#fdecea", "#2f1512", "Hintergrund negativer Marken."),
  C("law", "#6438bd", "#b69cf2", "Nur „Braucht Anwalt“. Als Text auf surface und law-soft."),
  C("law-soft", "#f1ecfb", "#231a37", "Hintergrund der Anwalt-Marke."),
  // Dokumente (Papier bleibt in beiden Themen hell, wie in jedem PDF-Betrachter)
  C("doc-paper", "#ffffff", "#ffffff", "Seite im Dokumentbetrachter, in beiden Themen hell."),
  C("doc-ink", "#1b1c1f", "#1b1c1f", "Text auf doc-paper."),
  C("doc-viewer", "#e9eaee", "#050506", "Fläche hinter den Seiten im Betrachter."),
  C("doc-mark", "#cfe0fc", "#cfe0fc", "Markierte Fundstelle im Original (Kuro K-A, Rossum). Mit doc-mark-line unterstrichen."),
  C("doc-mark-line", "#2563e0", "#2563e0", "Unterstreichung und Rahmen der Fundstelle."),
  C("doc-risk", "#fcf1df", "#fcf1df", "Fundstelle, die ein Kürzungsrisiko belegt (z. B. fehlende GU-Unterschrift)."),
  C("doc-risk-line", "#935500", "#935500", "Rahmen und Unterstrich einer Risiko-Fundstelle."),
  C("doc-line", "#dfe1e6", "#dfe1e6", "Linien und Tabellenränder auf doc-paper."),
  C("doc-ink-secondary", "#4a4f58", "#4a4f58", "Kopfzeilen, Beschriftungen auf doc-paper."),
  C("doc-muted", "#5f656e", "#5f656e", "Kennzeichnung „SYNTHETISCH“ und Miniatur-Symbole auf doc-paper (≥ 4,5:1)."),
  C("doc-figure", "#2b2f36", "#2b2f36", "Linien und Symbole in Plänen auf doc-paper."),
  C("doc-figure-soft", "#e3e5e9", "#e3e5e9", "Flächen in Platzhalter-Abbildungen (Beispielfoto) auf doc-paper.")
];

const hex = (h) => { h = h.replace("#", ""); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255); };
const lum = (h) => { const [r, g, b] = hex(h).map(c => c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const get = (n, t) => colors.find(c => c.name === n).value[t];

const pairs = [
  ...["text", "text-secondary", "text-muted"].flatMap(t => ["bg", "surface", "surface-subtle", "surface-hover", "surface-selected"].map(g => [t, g, 4.5])),
  ["on-action", "action", 4.5], ["on-action", "action-hover", 4.5], ["on-accent", "accent", 4.5],
  ["accent", "surface", 4.5], ["accent", "bg", 4.5], ["accent", "accent-soft", 4.5],
  ["pos", "surface", 4.5], ["pos", "pos-soft", 4.5], ["warn", "surface", 4.5], ["warn", "warn-soft", 4.5],
  ["neg", "surface", 4.5], ["neg", "neg-soft", 4.5], ["law", "surface", 4.5], ["law", "law-soft", 4.5],
  ["doc-ink", "doc-paper", 4.5], ["doc-ink", "doc-mark", 4.5], ["doc-ink", "doc-risk", 4.5], ["doc-ink-secondary", "doc-paper", 4.5], ["doc-muted", "doc-paper", 4.5], ["doc-risk-line", "doc-paper", 3], ["doc-figure", "doc-paper", 3],
  ["field-border", "surface", 3], ["field-border", "bg", 3], ["accent", "surface-subtle", 3], ["doc-mark-line", "doc-paper", 3]
];
let fail = 0;
for (const t of ["light", "dark"]) for (const [f, g, min] of pairs) {
  const r = ratio(get(f, t), get(g, t));
  if (r < min) { fail++; console.log("FEHLT", t, f, "auf", g, r.toFixed(2), "<", min); }
}
// Status-Paare unterscheidbar nicht nur über den Farbton: pos gegen neg in der Helligkeit
for (const t of ["light", "dark"]) console.log(t, "pos/neg Helligkeitsabstand", ratio(get("pos", t), get("neg", t)).toFixed(2), "(Status trägt immer Wort + Symbol)");
for (const t of ["light", "dark"]) console.log(t, "text-secondary/text-muted Abstand", ratio(get("text-secondary", t), get("text-muted", t)).toFixed(2));
console.log(fail ? fail + " Paare unter Mindestwert" : "Alle " + pairs.length * 2 + " Paare erfüllen den Mindestkontrast");

const tokens = {
  name: "Schlusswerk", version: 1,
  meta: { source: "Messblatt 22.10.2026: reebuild, Linear, Attio, Harvey, Ramp, Kuro, Stratos (Produkt/UI-Messblatt.md)" },
  color: { themes: [{ id: "light", name: "Hell" }, { id: "dark", name: "Dunkel" }], tokens: colors },
  type: {
    fonts: [],
    families: { sans: "Inter, system-ui, -apple-system, \"Segoe UI\", sans-serif", mono: "\"JetBrains Mono\", ui-monospace, Consolas, monospace" },
    groups: [
      { name: "Anzeige", family: "sans", styles: [
        { name: "kpi", fontSize: "28px", lineHeight: "32px", fontWeight: 600, letterSpacing: "-0.02em", sample: "27.410,00 €", usage: "Große Beträge in Kennzahlkarten und im Befundkopf. Tabellenziffern. reebuild h2 32/w600, Attio Display." },
        { name: "page-title", fontSize: "20px", lineHeight: "28px", fontWeight: 600, letterSpacing: "-0.015em", sample: "Schlussrechnungs-Check", usage: "Seitentitel in der Kopfzeile. reebuild 20, Linear 20/w590." }
      ] },
      { name: "Text", family: "sans", styles: [
        { name: "section-title", fontSize: "15px", lineHeight: "22px", fontWeight: 600, letterSpacing: "-0.01em", sample: "Befunde", usage: "Titel von Panels und Abschnitten. Linear 15." },
        { name: "body", fontSize: "14px", lineHeight: "21px", fontWeight: 400, sample: "12 Posten aus 165 Dokumenten.", usage: "Fließtext, Zusammenfassungssatz, Mails im Betrachter. reebuild 14/21." },
        { name: "ui", fontSize: "13px", lineHeight: "20px", fontWeight: 400, letterSpacing: "-0.01em", sample: "Plattenheizkörper Typ 22, 600/1000", usage: "Tabellen, Listen, Navigation. Linear 13/19.5, −1 %." },
        { name: "ui-strong", fontSize: "13px", lineHeight: "20px", fontWeight: 500, letterSpacing: "-0.01em", sample: "Übernehmen", usage: "Knöpfe, Zeilentitel, aktive Navigation. Attio w500." },
        { name: "meta", fontSize: "12px", lineHeight: "18px", fontWeight: 400, sample: "Aufmaßblatt AB-12 · 18.09.2026", usage: "Unterzeilen, Datumsangaben, Hinweise. reebuild 12/18." },
        { name: "label", fontSize: "11px", lineHeight: "16px", fontWeight: 500, letterSpacing: "0.06em", sample: "JETZT VERRECHENBAR", usage: "Labels über Kennzahlen und Spaltenköpfe, in Großbuchstaben. reebuild-Kennzahlkarten, Kuro-Labels mit Sperrung." }
      ] },
      { name: "Mono", family: "mono", styles: [
        { name: "mono", fontSize: "12px", lineHeight: "18px", fontWeight: 400, sample: "22.04.12B · AB-12_Aufmass_Heizung.pdf", usage: "Positionsnummern, Dateinamen, Seitenangaben. Attio JetBrains Mono, Linear Berkeley Mono." }
      ] }
    ]
  },
  spacing: { tokens: [
    { name: "space-1", value: "4px", usage: "Abstand Punkt zu Wort in Marken; Symbol zu Text." },
    { name: "space-2", value: "8px", usage: "Abstand zwischen Marken, Knöpfen in einer Reihe." },
    { name: "space-3", value: "12px", usage: "Zellabstand links/rechts in Tabellen; Innenabstand kleiner Karten." },
    { name: "space-4", value: "16px", usage: "Innenabstand von Panels und Kennzahlkarten." },
    { name: "space-5", value: "20px", usage: "Abstand zwischen Panels." },
    { name: "space-6", value: "24px", usage: "Seitenrand des Inhalts." },
    { name: "space-8", value: "32px", usage: "Abstand großer Abschnitte." }
  ] },
  radius: { tokens: [
    { name: "radius-sm", value: "4px", usage: "Marken, Beleg-Chips, Tastenhinweise. Linear/Attio 4." },
    { name: "radius-md", value: "6px", usage: "Knöpfe, Eingabefelder, Navigationseinträge. reebuild 6 (Konsens)." },
    { name: "radius-lg", value: "8px", usage: "Panels, Karten, Dokumentseiten-Rahmen. Linear/Attio/Harvey 8." },
    { name: "radius-full", value: "9999px", usage: "Statuspunkt, Avatar." }
  ] },
  shadow: { note: "Linien statt Schatten (Konsens). Schatten nur für Ebenen, die über dem Inhalt schweben.", tokens: [
    { name: "shadow-overlay", value: { light: "0 8px 24px rgba(16,17,18,0.12), 0 0 0 1px rgba(16,17,18,0.06)", dark: "0 8px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)" }, usage: "Toast, Menü, Dialog." },
    { name: "shadow-page", value: { light: "0 1px 3px rgba(16,17,18,0.16)", dark: "0 1px 3px rgba(0,0,0,0.6)" }, usage: "Dokumentseite im Betrachter." }
  ] },
  size: { tokens: [
    { name: "control-h", value: "32px", usage: "Höhe von Knöpfen und Eingabefeldern im Werkzeug (Linear/Attio 28–32)." },
    { name: "row-h", value: "36px", usage: "Höhe einer einzeiligen Tabellenzeile, gesteuert über Innenabstand (Linear 36)." },
    { name: "row-h-2", value: "48px", usage: "Höhe einer Tabellenzeile mit Unterzeile." },
    { name: "head-h", value: "48px", usage: "Höhe der Kopfzeile: Pfad, Titel und Aktionen in einer Zeile (Linear/Attio 44–48)." },
    { name: "panel-head-h", value: "44px", usage: "Höhe jedes Panel-Kopfs, überall gleich." },
    { name: "chip-h", value: "22px", usage: "Höhe von Statusmarken und Beleg-Chips." },
    { name: "tab-h", value: "28px", usage: "Höhe von Reitern, kleinen Knöpfen im Panel-Kopf und Navigationseinträgen." },
    { name: "sidebar-w", value: "232px", usage: "Breite der Seitenleiste (Attio/Linear 220–240)." }
  ] }
};
mkdirSync(join(here, "project"), { recursive: true });
writeFileSync(join(here, "project", "tokens.json"), JSON.stringify(tokens, null, 2));
console.log("tokens.json geschrieben,", colors.length, "Farben");
