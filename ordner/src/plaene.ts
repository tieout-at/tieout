// The plans of a project as drawings on a sheet of 1754 by 1240. Same base for every index of a plan, so two indexes lie
// exactly on top of each other in the comparison. The floor plans are invented; only what the twin read from the plan
// (plan number, index, date, title, change, clouds) is taken from it.

import { datumText, type Datensatz } from "@tieout/kern";
import { e, type Beleg, type Blatt } from "./seiten.ts";

type Plan = Datensatz["plaene"][number];

const TINTE = "#23262e";
const NEU = "#c23b3b";
const wand = (d: string, breite = 11) => `<path d="${d}" stroke="${TINTE}" stroke-width="${breite}" fill="none" stroke-linejoin="miter"/>`;
const text = (x: number, y: number, t: string, g = 20, a = "middle") => `<text x="${x}" y="${y}" font-size="${g}" text-anchor="${a}">${e(t)}</text>`;
const hk = (x: number, y: number, b: number, farbe = TINTE) => {
  const rippen = Array.from({ length: Math.floor(b / 12) }, (_, i) => `M${x + 8 + i * 12} ${y}v18`).join("");
  return `<rect x="${x}" y="${y}" width="${b}" height="18" fill="#fff" stroke="${farbe}" stroke-width="2.6"/><path d="${rippen}" stroke="${farbe}" stroke-width="1.3"/>`;
};
const rohr = (d: string, farbe = "#6d7280") => `<path d="${d}" stroke="${farbe}" stroke-width="2.4" fill="none" stroke-dasharray="14 7"/>`;

/** A revision cloud around a rectangle, as a change is marked on a real plan. */
function wolke(x: number, y: number, b: number, h: number, s = 30): string {
  const nx = Math.round(b / s);
  const ny = Math.round(h / s);
  const dx = b / nx;
  const dy = h / ny;
  const bogen = (a: number, c: number) => `a${s * 0.56} ${s * 0.56} 0 0 1 ${a} ${c}`;
  const d = `M${x} ${y}${Array(nx).fill(bogen(dx, 0)).join("")}${Array(ny).fill(bogen(0, dy)).join("")}${Array(nx).fill(bogen(-dx, 0)).join("")}${Array(ny).fill(bogen(0, -dy)).join("")}z`;
  return `<path d="${d}" fill="none" stroke="${NEU}" stroke-width="2.6"/>`;
}

function achsen(xs: number[], y: number, unten: number): string {
  return xs
    .map((x, i) => `<path d="M${x} ${y}V${unten}" stroke="#9ca0a8" stroke-width="1" stroke-dasharray="26 6 4 6"/><circle cx="${x}" cy="${y - 20}" r="20" fill="#fff" stroke="#9ca0a8" stroke-width="1.5"/>${text(x, y - 13, String.fromCharCode(65 + i), 19)}`)
    .join("");
}

function masskette(x1: number, x2: number, y: number, t: string): string {
  return `<path d="M${x1} ${y}H${x2}M${x1} ${y - 9}v18M${x2} ${y - 9}v18" stroke="#6d7280" stroke-width="1.4"/>${text((x1 + x2) / 2, y - 7, t, 16)}`;
}

/** One flat of Typ C, drawn at (x, y) in its own width of 570; `spiegeln` mirrors it around its middle. */
function wohnung(x: number, spiegeln: boolean, teil: "grund" | "c" | "d"): string {
  const y = 150;
  const innen = (() => {
    if (teil === "grund")
      return `${wand("M0 0H570V430H0Z")}${wand("M230 0V170M0 170H90M150 170H230M230 110H165V170M230 260V430M0 260H230", 6)}
      <path d="M315 0h90M0 340" stroke="#fff" stroke-width="13"/><path d="M315 -5h90M315 5h90" stroke="${TINTE}" stroke-width="1.6"/>
      ${text(100, 100, "Bad")}${text(198, 150, "WC", 17)}${text(115, 222, "Vorraum")}${text(135, 340, "Zimmer")}${hk(30, 400, 90)}${rohr("M75 400V300H250V60")}`;
    if (teil === "c") return `${text(400, 228, "Wohnküche", 26)}${hk(315, 16, 90)}${rohr("M360 34V60H250")}`;
    return `<path d="M412 0V430" stroke="${NEU}" stroke-width="7" fill="none"/>
      ${text(322, 228, "Wohnen", 24)}${text(492, 228, "Küche", 24)}${hk(275, 16, 90)}${rohr("M320 34V60H250")}
      ${hk(447, 16, 90, NEU)}${rohr("M492 34V60H420", NEU)}${text(492, 150, "1 Heizkörper neu", 18)}`;
  })();
  return `<g transform="translate(${spiegeln ? x + 570 : x} ${y}) scale(${spiegeln ? -1 : 1} 1)">${spiegeln ? innen.replace(/<text x="(\d+)"([^>]*)>/g, (_, a, r) => `<text transform="translate(${2 * +a} 0) scale(-1 1)" x="${a}"${r}>`) : innen}</g>`;
}

const WOLKEN_H201 = (x: number) => wolke(x + 425, 142, 124, 74);

function h201(index: string, stellen: string[], notiz: string, faden: boolean): string {
  const links = 90;
  const rechts = 840;
  const grund = `<g opacity="${faden ? 0.2 : 1}">${achsen([links, links + 230, links + 570, rechts, rechts + 340, rechts + 570], 96, 620)}
  ${wohnung(links, false, "grund")}${wohnung(rechts, true, "grund")}
  ${wand(`M${links + 570} 150H${rechts}M${links + 570} 580H${rechts}`, 11)}${text((links + 570 + rechts) / 2, 372, "Stiege 1", 22)}
  ${masskette(links, links + 570, 640, "8,40")}${masskette(rechts, rechts + 570, 640, "8,40")}</g>`;
  const stand =
    index === "C"
      ? `${wohnung(links, false, "c")}${wohnung(rechts, true, "c")}<g data-place="${e(stellen.join("|"))}">${text(links + 400, 415, notiz.split(": ")[0], 17)}${text(links + 400, 437, notiz.split(": ")[1] ?? "", 15)}</g>`
      :`${wohnung(links, false, "d")}${wohnung(rechts, true, "d")}<g data-place="${e(stellen.join("|"))}">${WOLKEN_H201(links)}</g><g data-place="${e(stellen.join("|"))}" transform="translate(${2 * rechts + 570} 0) scale(-1 1)">${WOLKEN_H201(rechts)}</g>`;
  const legende = `<g opacity="${faden ? 0.2 : 1}">${text(links, 760, "Legende", 20, "start")}${hk(links, 780, 90)}${text(links + 110, 796, "Plattenheizkörper", 18, "start")}${rohr(`M${links} 836h90`)}${text(links + 110, 842, "Anbindeleitung im Estrich", 18, "start")}<path d="M${links} 880h90" stroke="${TINTE}" stroke-width="6"/>${text(links + 110, 886, "Wand", 18, "start")}</g>`;
  return `${grund}${stand}${text(links, 700, "Wohnung Typ C, Regelgeschoß, Maßstab 1:50", 20, "start")}${legende}`;
}

function l310(index: string, stellen: string[], faden: boolean): string {
  const stellplaetze = Array.from({ length: 9 }, (_, i) => `<path d="M${180 + i * 130} 180v150M${180 + i * 130} 470v150" stroke="#9ca0a8" stroke-width="2"/>`).join("");
  const grund = `<g opacity="${faden ? 0.2 : 1}">${achsen([120, 420, 720, 1020, 1320], 96, 680)}
  ${wand("M120 150H1320V650H120Z", 14)}${stellplaetze}${text(980, 440, "Fahrgasse", 24)}${text(190, 215, "Tiefgarage", 22, "start")}
  ${wand("M1090 300H1250V500H1090Z", 7)}${text(1170, 408, "Lüftung", 20)}</g>`;
  const leitung = (d: string, f = "#3b5fa8") => `<path d="${d}" stroke="${f}" stroke-width="14" fill="none" stroke-linejoin="round"/>`;
  const stand =
    index === "E"
      ? `${leitung("M1090 355H860V240H420V355H170", NEU)}<g data-place="${e(stellen.join("|"))}">${wolke(390, 205, 505, 190, 34)}</g>${text(640, 305, "Leitung umgeführt", 20)}`
      : leitung("M1090 355H170");
  return `${grund}${stand}${text(120, 720, "Lüftung Tiefgarage, Grundriss, Maßstab 1:100", 20, "start")}`;
}

function schema(titel: string): string {
  const stiegen = Array.from({ length: 4 }, (_, i) => {
    const x = 260 + i * 270;
    return `<path d="M${x} 560V210" stroke="#c23b3b" stroke-width="5"/><path d="M${x + 34} 560V210" stroke="#3b5fa8" stroke-width="5"/>${Array.from({ length: 4 }, (_, n) => `<path d="M${x + 34} ${240 + n * 85}h70" stroke="#6d7280" stroke-width="2.6"/><rect x="${x + 104}" y="${228 + n * 85}" width="56" height="24" fill="#fff" stroke="${TINTE}" stroke-width="2"/>`).join("")}${text(x + 18, 600, `Strang ${i + 1}`, 18)}`;
  }).join("");
  return `${wand("M150 620H1320", 7)}${wand("M150 170H1320", 3)}<path d="M150 560H1250" stroke="${TINTE}" stroke-width="3"/>${stiegen}${text(150, 680, `${titel}, Schema`, 20, "start")}`;
}

function plankopf(d: Datensatz, p: Plan, gezeigt: Set<string>): string {
  ["Plankopf", "Plankopf, Index", "Plankopf, Datum", "Indexfeld"].forEach((s) => gezeigt.add(s));
  const verlauf = d.plaene.filter((x) => x.planNr.wert === p.planNr.wert && x.datum.wert <= p.datum.wert);
  const x = 1270;
  const y = 860;
  const zeilen = verlauf
    .map((v, i) => {
      const yz = y + 182 + i * 48;
      const aktuell = v.belegId === p.belegId;
      // the change in two lines, broken at a word
      const worte = v.aenderung?.wert.split(" ") ?? [];
      const mitte = worte.reduce((n, w, j) => (worte.slice(0, j + 1).join(" ").length <= 34 ? j + 1 : n), 0);
      const inhalt = `${text(x + 14, yz, v.index.wert, 19, "start")}${text(x + 54, yz, datumText(v.datum.wert), 17, "start")}${v.aenderung ? `<text x="${x + 186}" y="${yz}" font-size="14">${e(worte.slice(0, mitte).join(" "))}</text><text x="${x + 186}" y="${yz + 17}" font-size="14">${e(worte.slice(mitte).join(" "))}</text>` : ""}`;
      return aktuell ? `<g data-place="Indexfeld">${inhalt}</g>` : inhalt;
    })
    .join("");
  return `<g><rect x="${x}" y="${y}" width="450" height="${200 + Math.max(verlauf.length, 1) * 48}" fill="#fff" stroke="${TINTE}" stroke-width="2.4"/>
  <g data-place="Plankopf">${text(x + 14, y + 36, "Planung Haustechnik", 18, "start")}${text(x + 14, y + 84, `${p.planNr.wert}  ${d.projekt.name}`, 28, "start")}${text(x + 14, y + 118, p.titel.wert, 18, "start")}</g>
  <g data-place="Plankopf, Index">${text(x + 332, y + 36, `Index ${p.index.wert}`, 26, "start")}</g>
  <g data-place="Plankopf, Datum">${text(x + 14, y + 148, datumText(p.datum.wert), 18, "start")}</g>
  <path d="M${x} ${y + 158}H${x + 450}" stroke="${TINTE}" stroke-width="1.6"/>${zeilen}
  ${text(x + 14, y + 190 + Math.max(verlauf.length, 1) * 48, "Beispieldaten, synthetisch", 13, "start")}</g>`;
}

export function planBlatt(d: Datensatz, b: Beleg, gezeigt: Set<string>): Blatt {
  const p = d.plaene.find((x) => x.belegId === b.id)!;
  const wolken = [...new Set(p.vermerke.map((v) => v.text.quelle.stelle ?? ""))];
  wolken.forEach((s) => gezeigt.add(s));
  const inhalt = (faden: boolean) => {
    const nr = p.planNr.wert;
    const kern = nr === "H-201" ? h201(p.index.wert, wolken, p.vermerke[0]?.text.wert ?? "", faden) :nr === "L-310" ? l310(p.index.wert, wolken, faden) : schema(p.titel.wert);
    return `<div class="plan"><svg viewBox="0 0 1754 1240">${kern}<g opacity="${faden ? 0.2 : 1}">${plankopf(d, p, gezeigt)}</g><rect x="14" y="14" width="1726" height="1212" fill="none" stroke="${TINTE}" stroke-width="2"/></svg></div>`;
  };
  // a plan's cloud belongs to its first drawing even when the plan names no change of its own
  const kannVergleichen = wolken.length > 0 && !!p.aenderung;
  return { html: inhalt(false), quer: true, scan: false, aenderung: kannVergleichen ? inhalt(true) : undefined };
}
