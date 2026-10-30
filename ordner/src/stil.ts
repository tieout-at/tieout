// The look of the paper. Sizes in px of a sheet of 1240 by 1754 (A4 at 150 dpi); the plans are that sheet on its side.

import { fileURLToPath } from "node:url";
import type { Profil } from "./profil.ts";

const schrift = (paket: string, datei: string) => fileURLToPath(new URL(`../node_modules/@fontsource/${paket}/files/${datei}`, import.meta.url)).replace(/\\/g, "/");

const FACES = [
  ["Arimo", 400, schrift("arimo", "arimo-latin-400-normal.woff2")],
  ["Arimo", 700, schrift("arimo", "arimo-latin-700-normal.woff2")],
  ["Courier Prime", 400, schrift("courier-prime", "courier-prime-latin-400-normal.woff2")],
  ["Courier Prime", 700, schrift("courier-prime", "courier-prime-latin-700-normal.woff2")],
  ["Reenie Beanie", 400, schrift("reenie-beanie", "reenie-beanie-latin-400-normal.woff2")],
  ["Nothing You Could Do", 400, schrift("nothing-you-could-do", "nothing-you-could-do-latin-400-normal.woff2")],
] as const;

const KORN =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='320'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='2'/%3E%3CfeColorMatrix values='0 0 0 0 .3 0 0 0 0 .28 0 0 0 0 .24 0 0 0 .07 0'/%3E%3C/filter%3E%3Crect width='320' height='320' filter='url(%23n)'/%3E%3C/svg%3E";

export function stil(p: Profil): string {
  const faces = FACES.map(([f, g, u]) => `@font-face{font-family:"${f}";font-weight:${g};src:url("file:///${u}") format("woff2")}`).join("");
  return `${faces}
*{box-sizing:border-box}
html,body{margin:0;background:#fff}
body{width:var(--b);height:var(--h);overflow:hidden;position:relative;color:#22252c}
.papier{position:absolute;inset:0;background:#fff;padding:96px 92px 70px;display:flex;flex-direction:column;font:400 21px/1.34 Arimo,sans-serif;overflow:hidden}
.scan body,body.scan{background:#c9c9cc}
body.scan .papier{inset:8px 10px 10px 8px;background:#f6f3ec;box-shadow:0 0 12px rgba(0,0,0,.28);transform:rotate(var(--r));font-family:"${p.formular}",monospace;filter:contrast(1.04)}
body.scan .papier:before{content:"";position:absolute;inset:0;pointer-events:none;background-image:url("${KORN}");mix-blend-mode:multiply}
body.scan .papier:after{content:"";position:absolute;left:0;right:0;top:var(--falz);height:10px;pointer-events:none;background:linear-gradient(rgba(0,0,0,0),rgba(0,0,0,.05),rgba(255,255,255,.34),rgba(0,0,0,0))}
.loch{position:absolute;left:30px;width:32px;height:32px;border-radius:50%;background:#c4c4c7;box-shadow:inset 0 1px 3px rgba(0,0,0,.4)}
.inhalt{display:flex;flex-direction:column;flex:1;min-height:0;zoom:var(--z,1)}
h1{font:700 30px/1.2 inherit;margin:0;font-family:inherit}
h2{font:700 25px/1.2 inherit;margin:0;font-family:inherit}
.kopf{display:flex;justify-content:space-between;align-items:flex-start;gap:40px;border-bottom:2px solid #22252c;padding-bottom:18px;margin-bottom:26px}
.kopf .art{text-align:right;white-space:nowrap}
.fremd .kopf{border-bottom:0;padding-bottom:0}
.fremd .kopf h1{font-size:34px;letter-spacing:.01em}
.felder{display:grid;grid-template-columns:230px 1fr;row-gap:8px;margin-bottom:26px}
table{width:100%;border-collapse:collapse;margin-bottom:22px}
th{font-weight:700;text-align:left;border:1.5px solid #33363d;padding:6px 9px;background:rgba(0,0,0,.035)}
td{border:1.5px solid #33363d;padding:6px 9px;vertical-align:top}
td.zahl,th.zahl{text-align:right;white-space:nowrap}
table.eng{table-layout:fixed;font-size:15px;line-height:1.15}
.eng th,.eng td{padding:1px 6px;border-width:1px}
.eng td.kurz{overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.eng th:nth-child(3),.eng th:nth-child(4),.eng th:nth-child(5){width:14%}
.spalten{display:grid;grid-template-columns:1fr 1fr;gap:20px}
.eng.schmal{font-size:13.5px}
.eng.schmal th{width:auto}
.eng.schmal th:first-child{width:28%}
.block{margin-bottom:18px}
.block b{display:block;margin-bottom:3px}
.zeile{display:flex;justify-content:space-between;gap:30px;padding:7px 0;border-bottom:1px solid #b9bbc0}
.zeile.summe{border-bottom:0;border-top:2.5px solid #22252c;font-weight:700;margin-top:8px}
.zeile .wert{display:flex;gap:34px;white-space:nowrap}
.zeile .wert span{min-width:120px;text-align:right}
.absatz{margin:0 0 16px}
.hand{display:inline-block;color:${p.tinte};white-space:nowrap}
.hand i{display:inline-block;font-style:normal}
.unten{margin-top:auto;padding-top:26px}
.sig{display:grid;grid-template-columns:1fr 1fr;gap:58px}
.sig>div{border-top:1.5px solid #33363d;padding-top:6px;min-height:120px;position:relative}
.sig svg{position:absolute;left:30px;top:-58px;width:300px;height:70px}
.sig .am{position:absolute;right:6px;top:-38px}
.stempel{display:inline-block;border:3px solid rgba(160,40,50,.62);color:rgba(160,40,50,.7);padding:5px 14px;font-weight:700;border-radius:4px;transform:rotate(-5deg);mix-blend-mode:multiply}
.fuss{display:flex;justify-content:space-between;font-size:15px;color:#60636b;margin-top:18px}
.mail .von{display:grid;grid-template-columns:130px 1fr;row-gap:5px;padding-bottom:18px;border-bottom:1px solid #9a9ca2;margin-bottom:30px}
.mail .von span:nth-child(odd){color:#555860}
.plan{position:absolute;inset:0;background:#fff}
.plan svg{position:absolute;inset:0;width:100%;height:100%}
.plan text{font-family:Arimo,sans-serif;fill:#30333b}
`;
}
