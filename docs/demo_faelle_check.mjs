// Recomputes every amount of docs/Demo_Faelle.md (solution list v3) in integer cents and checks
// that every euro amount written in that file is one this script computes or takes as an input.
// Run from the repository root: node docs/demo_faelle_check.mjs
// Rounding: commercial, per line. Quantities in hundredths, rates in basis points (as in v1 geld.ts).

import { readFileSync } from "node:fs";

const amounts = new Map(); // cents -> names, for the audit
const add = (name, cents) => {
  if (!Number.isInteger(cents)) throw new Error(`${name} is not an integer number of cents`);
  if (!amounts.has(cents)) amounts.set(cents, []);
  amounts.get(cents).push(name);
  return cents;
};
const failures = [];
const expect = (name, actual, wanted) => {
  if (actual !== wanted) failures.push(`${name}: computed ${eur(actual)}, expected ${eur(wanted)}`);
};

const roundDiv = (num, den) => (num >= 0 ? Math.floor((num + den / 2) / den) : -Math.floor((-num + den / 2) / den));
const qty = (n) => Math.round(n * 100); // quantity or hours in hundredths
const line = (quantity, priceCents) => roundDiv(qty(quantity) * priceCents, 100);
const pct = (base, bp) => roundDiv(base * bp, 10000);
const sum = (xs) => xs.reduce((s, x) => s + x, 0);
export const eur = (c) => {
  const s = Math.abs(c);
  const whole = String(Math.floor(s / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${c < 0 ? "−" : ""}${whole},${String(s % 100).padStart(2, "0")} €`;
};
const share = (part, whole, digits = 1) => ((part / whole) * 100).toFixed(digits).replace(".", ",") + " %";
const isoWeek = (iso) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7)); // Thursday of the same week
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
};

// ---------- Regie with contract rates ----------
const regie = (name, c, hFitter, hHelper, materialAtCost) => {
  const fitter = add(`${name} fitter`, line(hFitter, c.fitter));
  const helper = hHelper ? add(`${name} helper`, line(hHelper, c.helper)) : 0;
  const surcharge = materialAtCost ? add(`${name} material surcharge`, pct(materialAtCost, c.materialBp)) : 0;
  const material = materialAtCost ? add(`${name} material`, materialAtCost + surcharge) : 0;
  if (materialAtCost) add(`${name} material at cost`, materialAtCost);
  const total = add(name, fitter + helper + material);
  return { fitter, helper, material, surcharge, total, hours: hFitter + hHelper, materialAtCost: materialAtCost || 0 };
};

// ---------- Company-wide inputs ----------
const DEMO_DATE = "2026-10-22";
const HORNFELD = { fitter: add("Hornfeld Regie fitter rate", 6480), helper: add("Hornfeld Regie helper rate", 5420), materialBp: 1500 };
const AHORNBRUNN = { fitter: add("Ahornbrunn Regie fitter rate", 6140), helper: add("Ahornbrunn Regie helper rate", 5120), materialBp: 1000 };
const PFEILBERG = { fitter: add("Pfeilberg Regie fitter rate", 6360), helper: add("Pfeilberg Regie helper rate", 5340), materialBp: 1500 };
const HORNFELD_2024 = { fitter: add("Hornfeld 2024 Regie fitter rate", 6240), helper: add("Hornfeld 2024 Regie helper rate", 5210), materialBp: 1500 };
const MLK = add("Mittellohnkosten", 4580); // K3, own calculation (assumption)
const MLP = add("Mittellohnpreis", 5860); // K3, own calculation (assumption)
const MATERIAL_SURCHARGE_K = 1200; // own calculation, surcharge on material for a Nachtrag (assumption)
add("official Regie rate 2026 fitter", 7066);
add("official Regie rate 2026 helper", 6096);

// ============ P1 Wohnpark Mooshaim ============
const P1 = { contract: add("P1 contract sum", 74682000), draft: add("P1 Entwurf", 75231480) };

// F1: 14 radiators with accessories (plan H-201 index C -> D)
const F1rows = [
  { pos: "22.04.12B", text: "Plattenheizkörper Typ 22 VK, 600/1000", unit: "Stk", lv: 86, measured: 100, invoiced: 86, ep: 28640 },
  { pos: "22.05.03A", text: "Thermostatkopf mit eingebautem Fühler", unit: "Stk", lv: 168, measured: 182, invoiced: 168, ep: 2480 },
  { pos: "22.05.06A", text: "Heizkörper-Anschlussarmatur, absperrbar", unit: "Stk", lv: 168, measured: 182, invoiced: 168, ep: 3860 },
  { pos: "22.03.02A", text: "Anbindeleitung Mehrschichtverbundrohr 16 × 2,0", unit: "m", lv: 1512, measured: 1638, invoiced: 1512, ep: 1390 },
].map((r) => ({ ...r, extra: r.measured - r.invoiced, ep: add(`EP ${r.pos}`, r.ep) }));
F1rows.forEach((r) => (r.amount = add(`F1 ${r.pos}`, line(r.extra, r.ep))));
const F1 = add("F1", sum(F1rows.map((r) => r.amount)));
// K7 plausibility of 22.04.12B
const K7labour = add("K7 22.04.12B labour", line(1.1, MLP));
const K7other = add("K7 22.04.12B other", 22194);
expect("K7 22.04.12B", K7labour + K7other, F1rows[0].ep);

const F2 = regie("F2", HORNFELD, 12, 12, 31260); // Regiebericht 9
const F3 = regie("F3", HORNFELD, 6, 6, 9640); // Regiebericht 15
const F4row = { lv: 640, measured: 808, invoiced: 640, ep: add("EP 24.02.05A", 1980) };
const F4 = add("F4", line(F4row.measured - F4row.invoiced, F4row.ep));
const F5row = { lv: 120, measured: 142, invoiced: 120, ep: add("EP 24.08.02A", 9240) };
const F5 = add("F5", line(F5row.measured - F5row.invoiced, F5row.ep));
const F6 = regie("F6", HORNFELD, 5, 5, 4260); // Regiebericht 12, not signed
const F7 = regie("F7", HORNFELD, 4, 4, 0); // WhatsApp-Meldung W4, no Regiebericht
const F8labour = add("F8 labour", line(64, MLP));
const F8materialAtCost = add("F8 material at cost", 286000);
const F8surcharge = add("F8 material surcharge", pct(F8materialAtCost, MATERIAL_SURCHARGE_K));
const F8material = add("F8 material", F8materialAtCost + F8surcharge);
const F8 = add("F8", F8labour + F8material);

const P1belegt = add("P1 zusätzlich verrechenbar", F1 + F2.total + F3.total + F4 + F5);
const P1missing = add("P1 Beleg fehlt", F6.total + F7.total);
const P1klaerung = add("P1 in Klärung", P1missing + F8);

// Website table: the two forgotten Regieberichte in one row
add("website row Regieberichte (F2 + F3)", F2.total + F3.total);
add("website timeline, missing today (F1 + F5 + F6 + F7)", F1 + F5 + F6.total + F7.total);

// Website events that were invoiced (no find)
const RB3 = regie("Regiebericht 3", HORNFELD, 8, 0, 8400);
const planE = add("Plan L-310 E extra duct", line(38, add("EP 26.03.05A", 5240)));

// Vorprüfung
const G1 = add("G1", F1);
const G2 = add("G2", line(3, HORNFELD.fitter));
const G3 = add("G3", line(12, add("price Z-01", 14800)));
const P1vp = add("P1 Vorprüfung", G1 + G2 + G3);
const P1atRisk = add("P1 davon mit Kürzungsrisiko", G1 + G2);

// Cascade: payments per Abschlagsrechnung
const RATES = { discount: 300, power: 60, levy: 50, coverRetention: 500, warrantyRetention: 300 };
const ARs = [
  { no: 1, date: "2026-03-31", amount: 16840000, cut: 0 },
  { no: 2, date: "2026-06-30", amount: 27690000, cut: 0 },
  { no: 3, date: "2026-09-30", amount: 24160000, cut: G3 },
];
for (const a of ARs) {
  add(`AR ${a.no}`, a.amount);
  a.base = add(`AR ${a.no} after cut`, a.amount - a.cut);
  a.discount = add(`AR ${a.no} Nachlass`, pct(a.base, RATES.discount));
  a.afterDiscount = add(`AR ${a.no} after Nachlass`, a.base - a.discount);
  a.power = add(`AR ${a.no} Baustrom`, pct(a.afterDiscount, RATES.power));
  a.levy = add(`AR ${a.no} Bauschadensumlage`, pct(a.afterDiscount, RATES.levy));
  a.beforeRetention = a.afterDiscount - a.power - a.levy;
  a.retention = add(`AR ${a.no} Deckungsrücklass`, pct(a.beforeRetention, RATES.coverRetention));
  a.payment = add(`AR ${a.no} payment`, a.beforeRetention - a.retention);
}
const ARsum = add("AR cumulative", sum(ARs.map((a) => a.amount)));
const payments = add("P1 payments", sum(ARs.map((a) => a.payment)));
const levyOnARs = add("P1 Bauschadensumlage on ARs", sum(ARs.map((a) => a.levy)));
["discount", "power", "retention"].forEach((k) => add(`AR sum ${k}`, sum(ARs.map((a) => a[k]))));

const work = add("P1 Gesamtleistung", P1.draft + P1belegt);
const discount = add("P1 Nachlass", pct(work, RATES.discount));
const afterDiscount = add("P1 after Nachlass", work - discount);
const power = add("P1 Baustrom", pct(afterDiscount, RATES.power));
const levy = add("P1 Bauschadensumlage", pct(afterDiscount, RATES.levy));
const beforeWarranty = add("P1 before Haftrücklass", afterDiscount - power - levy);
const warranty = add("P1 Haftrücklass", pct(beforeWarranty, RATES.warrantyRetention));
const finalAmount = add("P1 Schlussrechnungsbetrag", beforeWarranty - warranty);
const rest = add("P1 Restforderung", finalAmount - payments);
// E14: same calculation without the deduction that has no contract item
const beforeWarrantyC = add("P1 laut Vertrag before Haftrücklass", afterDiscount - power);
const warrantyC = add("P1 laut Vertrag Haftrücklass", pct(beforeWarrantyC, RATES.warrantyRetention));
const finalAmountC = add("P1 laut Vertrag Schlussrechnungsbetrag", beforeWarrantyC - warrantyC);
const restC = add("P1 Restforderung laut Vertrag", finalAmountC - payments);
const restDiff = add("P1 difference laut Vertrag", restC - rest);
const warrantyDiff = add("P1 Haftrücklass on the Bauschadensumlage", warrantyC - warranty);
expect("difference laut Vertrag = Bauschadensumlage less its Haftrücklass", restDiff, levy - warrantyDiff);

// Schlussbesprechungs-Blatt: floors
const floor = {
  F1, F4, F5, // contract price, no floor below it
  F2: add("F2 floor", line(F2.hours, MLK) + F2.materialAtCost),
  F3: add("F3 floor", line(F3.hours, MLK) + F3.materialAtCost),
  F6: add("F6 floor", line(F6.hours, MLK) + F6.materialAtCost),
  F7: add("F7 floor", line(F7.hours, MLK)),
  F8: add("F8 floor", line(64, MLK) + F8materialAtCost),
};
["F2", "F3", "F6", "F7"].forEach((k) => add(`${k} floor hours`, line({ F2, F3, F6, F7 }[k].hours, MLK)));
add("F8 floor hours", line(64, MLK));
const claimBelegt = P1belegt, floorBelegt = add("floor belegt", floor.F1 + floor.F2 + floor.F3 + floor.F4 + floor.F5);
const floorMissing = add("floor Beleg fehlt", floor.F6 + floor.F7);
const claimTotal = add("Forderung total", P1belegt + P1klaerung);
const floorTotal = add("Untergrenze total", floorBelegt + floorMissing + floor.F8);
const room = add("Spielraum", claimTotal - floorTotal);
["belegt", "Beleg fehlt", "Nachtrag"].forEach((g, i) =>
  add(`Spielraum ${g}`, [claimBelegt - floorBelegt, P1missing - floorMissing, F8 - floor.F8][i]),
);

// Evidence source: finds without proof of work in the ERP
// Evidence source, reported per money word (never on the sum of both lists)
const P1outside = add("P1 nur außerhalb ERP, zusätzlich verrechenbar", F1 + F2.total + F3.total + F4);

// ============ P2 Bürohaus Kiefernau (Hornfeld Bau, in Ausführung) ============
const P2 = { contract: add("P2 contract sum", 61240000), ar1: add("P2 AR 1", 14830000), ar2: add("P2 AR 2", 19680000) };
add("zero", 0);
const P2F1 = regie("P2-F1", HORNFELD, 5, 5, 18620); // WhatsApp-Meldung 24.09., Regiebericht 6 signed 02.10.
add("P2-F1 before the Regiebericht (hours only)", P2F1.fitter + P2F1.helper);
const P2F2 = regie("P2-F2", HORNFELD, 8, 0, 24800); // Regiebericht 4
const P2F3 = add("P2-F3", line(760 - 610, add("EP 22.03.08A", 2160))); // measured up to Aufmaßblatt 5, invoiced in AR 1 and 2
const P2belegt = add("P2 zusätzlich verrechenbar", P2F1.total + P2F2.total + P2F3);

// ============ P3 Volksschule Ahornbrunn (Marktgemeinde Ahornbrunn, in Ausführung) ============
const P3 = { contract: add("P3 contract sum", 53860000), ar1: add("P3 AR 1", 12140000), ar2: add("P3 AR 2", 16390000) };
const P3F1 = regie("P3-F1", AHORNBRUNN, 10, 10, 16480); // Regiebericht 3
const P3F2 = add("P3-F2", line(468 - 420, add("EP 22.07.04A", 3860)));
const P3F3 = regie("P3-F3", AHORNBRUNN, 4, 0, 0); // Regiebericht 5, not signed
const P3belegt = add("P3 zusätzlich verrechenbar", P3F1.total + P3F2);
const P3klaerung = add("P3 in Klärung", P3F3.total);

// ============ P4 Wohnhof Erlenhain (Hornfeld Bau, abgeschlossen) ============
const settle = (name, s) => {
  add(`${name} Schlussrechnung`, s.invoice);
  const cuts = add(`${name} cuts`, sum(s.cuts));
  const afterCuts = add(`${name} after cuts`, s.invoice - cuts);
  const disc = add(`${name} Nachlass`, pct(afterCuts, s.discount));
  const afterDisc = add(`${name} after Nachlass`, afterCuts - disc);
  const pw = s.power ? add(`${name} Baustrom`, pct(afterDisc, s.power)) : 0;
  const lv = s.levy ? add(`${name} Bauschadensumlage`, pct(afterDisc, s.levy)) : 0;
  const beforeW = add(`${name} before Haftrücklass`, afterDisc - pw - lv);
  const w = add(`${name} Haftrücklass`, pct(beforeW, s.warranty));
  const remaining = add(`${name} remaining`, beforeW - w);
  add(`${name} paid on ARs`, s.paid);
  const finalPayment = add(`${name} final payment`, remaining - s.paid);
  return { cuts, afterCuts, disc, afterDisc, pw, lv, beforeW, w, remaining, finalPayment };
};
const P4cut1 = add("P4 cut 1", line(12, add("EP 22.04.10A", 21460)));
const P4printed = add("P4 24.05.03A printed", 1864640);
const P4correct = add("P4 24.05.03A correct", line(96, add("EP 24.05.03A", 19340)));
const P4cut2 = add("P4 cut 2", P4printed - P4correct);
const P4 = { contract: add("P4 contract sum", 66840000) };
const P4s = settle("P4", { invoice: 68421240, cuts: [P4cut1, P4cut2], discount: 300, power: 60, levy: 50, warranty: 300, paid: 54800000 });
const P4nachtraege = [add("P4 N1", 648000), add("P4 N2", 234000), add("P4 N3", 186000)];
const P4accepted = add("P4 Nachträge accepted", P4nachtraege[0] + P4nachtraege[1]);
const P4offered = add("P4 Nachträge offered", sum(P4nachtraege));

// ============ P5 Pflegeheim Eibenau (Pfeilberg Bau, abgeschlossen) ============
const P5cut1 = regie("P5 cut 1", PFEILBERG, 14, 10, 15200);
const P5cut2 = add("P5 cut 2", line(450 - 400, add("EP 26.02.03A", 3280)));
const P5 = { contract: add("P5 contract sum", 92150000) };
const P5s = settle("P5", { invoice: 94836000, cuts: [P5cut1.total, P5cut2], discount: 200, power: 0, levy: 0, warranty: 300, paid: 84200000 });
const P5nachtraege = [add("P5 N1", 984000), add("P5 N2", 426000)];
const P5accepted = add("P5 Nachträge accepted", sum(P5nachtraege));

// ============ Auftraggeber history ============
const hornfeldCuts = add("Hornfeld cuts", P4cut1 + P4cut2 + G3);
const hornfeldLevy = add("Hornfeld deductions without contract item", P4s.lv + levyOnARs);
const pfeilbergCuts = add("Pfeilberg cuts", P5cut1.total + P5cut2);

// ============ Company ============
const openContracts = add("open contract sums", P1.contract + P2.contract + P3.contract);
const allContracts = add("all contract sums", openContracts + P4.contract + P5.contract);
const companyBelegt = add("company zusätzlich verrechenbar", P1belegt + P2belegt + P3belegt);
const companyMissing = add("company Beleg fehlt", P1missing + P3klaerung);
const companyKlaerung = add("company in Klärung", P1klaerung + P3klaerung);
const P2outside = add("P2 nur außerhalb ERP", P2F1.total + P2F2.total);
const P3outside = add("P3 nur außerhalb ERP", P3F1.total);
const companyOutside = add("company nur außerhalb ERP, zusätzlich verrechenbar", P1outside + P2outside + P3outside);
// "in Klärung" lies outside the ERP in full (unsigned Regie, WhatsApp, e-mail)

// ============ Expected values written into Demo_Faelle.md ============
const E = {
  F1: 664860, F2: 178749, F3: 82486, F4: 332640, F5: 203280, F6: 64399, F7: 47600, F8: 695360,
  P1belegt: 1462015, P1klaerung: 807359, P1missing: 111999, P1vp: 861900, P1atRisk: 684300,
  work: 76693495, rest: 8927441, restC: 9288245, payments: 62439699,
  claimTotal: 2269374, floorTotal: 2072380, room: 196994,
  P2belegt: 485273, P3belegt: 316008, P3klaerung: 24560,
  companyBelegt: 2263296, companyKlaerung: 831919, companyMissing: 136559,
  P4final: 8622312, P5final: 5643183,
};
const got = {
  F1, F2: F2.total, F3: F3.total, F4, F5, F6: F6.total, F7: F7.total, F8,
  P1belegt, P1klaerung, P1missing, P1vp, P1atRisk, work, rest, restC, payments, claimTotal, floorTotal, room,
  P2belegt, P3belegt, P3klaerung, companyBelegt, companyKlaerung, companyMissing,
  P4final: P4s.finalPayment, P5final: P5s.finalPayment,
};
for (const k of Object.keys(E)) expect(k, got[k], E[k]);

// ---------- Report ----------
const out = [];
const p = (...xs) => out.push(xs.join(" "));
p("P1 F1 rows:", F1rows.map((r) => `${r.pos} ${r.extra} × ${eur(r.ep)} = ${eur(r.amount)}`).join("; "), "→", eur(F1));
for (const [k, f] of Object.entries({ F2, F3, F6, F7, RB3, P2F1, P2F2, P3F1, P3F3, "P5 cut 1": P5cut1 }))
  p(k, `fitter ${eur(f.fitter)}, helper ${eur(f.helper)}, material ${eur(f.material)} (surcharge ${eur(f.surcharge)}) = ${eur(f.total)}`);
p("F4", eur(F4), "F5", eur(F5), "F8", `${eur(F8labour)} + ${eur(F8material)} (surcharge ${eur(F8surcharge)}) = ${eur(F8)}`);
p("Plan E", eur(planE));
p("P1 zusätzlich verrechenbar", eur(P1belegt), "=", share(P1belegt, P1.contract, 2), "of the contract sum");
p("P1 in Klärung", eur(P1klaerung), "Beleg fehlt", eur(P1missing), "Nachtrag", eur(F8));
p("P1 Vorprüfung", eur(P1vp), "at risk", eur(P1atRisk), share(P1atRisk, P1belegt), "of belegt; already cut", eur(G3));
for (const a of ARs)
  p(`AR ${a.no}`, eur(a.amount), "cut", eur(a.cut), "Nachlass", eur(a.discount), "after", eur(a.afterDiscount), "Baustrom", eur(a.power), "BSU", eur(a.levy), "DRL", eur(a.retention), "pay", eur(a.payment));
p("AR cumulative", eur(ARsum), "payments", eur(payments), "BSU on ARs", eur(levyOnARs));
p("AR sums", ["discount", "power", "retention"].map((k) => `${k} ${eur(sum(ARs.map((a) => a[k])))}`).join("; "), "Haftrücklass on BSU", eur(warrantyDiff));
p("Cascade", eur(work), eur(discount), eur(afterDiscount), eur(power), eur(levy), eur(beforeWarranty), eur(warranty), eur(finalAmount), "rest", eur(rest));
p("laut Vertrag", eur(beforeWarrantyC), eur(warrantyC), eur(finalAmountC), "rest", eur(restC), "difference", eur(restDiff));
p("Floors", Object.entries(floor).map(([k, v]) => `${k} ${eur(v)}`).join("; "));
p("Forderung", eur(claimTotal), "Untergrenze", eur(floorTotal), "Spielraum", eur(room), share(room, claimTotal));
p("P1 outside ERP", eur(P1outside), share(P1outside, P1belegt), "of zusätzlich verrechenbar");
p("P2", eur(P2F1.total), eur(P2F2.total), eur(P2F3), "→", eur(P2belegt));
p("P3", eur(P3F1.total), eur(P3F2), "→", eur(P3belegt), "Klärung", eur(P3klaerung));
for (const [n, s] of [["P4", P4s], ["P5", P5s]]) p(n, Object.entries(s).map(([k, v]) => `${k} ${eur(v)}`).join("; "));
p("P4 cuts", eur(P4cut1), eur(P4cut2), "P5 cuts", eur(P5cut1.total), eur(P5cut2));
p("P4 Nachträge accepted", eur(P4accepted), "of", eur(P4offered), share(P4accepted, P4offered));
p("Hornfeld cuts", eur(hornfeldCuts), "deductions", eur(hornfeldLevy), "Pfeilberg cuts", eur(pfeilbergCuts), "P5 Nachträge", eur(P5accepted));
p("Company", eur(companyBelegt), eur(companyKlaerung), "Beleg fehlt", eur(companyMissing), "contracts open", eur(openContracts), "all", eur(allContracts));
p("Company outside ERP", eur(companyOutside), share(companyOutside, companyBelegt), "of zusätzlich verrechenbar; P2", eur(P2outside), "P3", eur(P3outside));
p("Weeks", ["2026-03-12", "2026-04-07", "2026-05-13", "2026-06-24", "2026-08-13", "2026-09-08"].map((d) => `${d} KW ${isoWeek(d)}`).join("; "));
p("Quantity changes", `F4 +${share(F4row.measured - F4row.lv, F4row.lv)}`, `F5 +${share(F5row.measured - F5row.lv, F5row.lv)}`, `22.04.12B +${share(14, 86)}`, `P3-F2 +${share(48, 420)}`, `Plan E +${share(38, 220)}`);
p("Demo date", DEMO_DATE, "days to 30.10.2026:", (new Date("2026-10-30") - new Date(DEMO_DATE)) / 86400000, "(red: at most 21)");
p("Days to final payment", "P4", (new Date("2026-02-18") - new Date("2025-11-20")) / 86400000, "P5", (new Date("2025-09-12") - new Date("2025-06-30")) / 86400000);

// ---------- Audit of Demo_Faelle.md ----------
const file = new URL("./Demo_Faelle.md", import.meta.url);
let md = "";
try {
  md = readFileSync(file, "utf8");
} catch {
  failures.push("docs/Demo_Faelle.md not found");
}
const v2section = md.indexOf("## Changes compared to v2");
const audited = v2section >= 0 ? md.slice(0, v2section) : md;
const unknown = [];
let count = 0;
for (const m of audited.matchAll(/(\d{1,3}(?:\.\d{3})*,\d{2})\s?€/g)) {
  count++;
  const cents = Number(m[1].replace(/\./g, "").replace(",", ""));
  if (!amounts.has(cents)) unknown.push(m[1]);
}
if (unknown.length) failures.push(`amounts in Demo_Faelle.md that this script does not compute: ${[...new Set(unknown)].join(", ")}`);

// ---------- Every date in Demo_Faelle.md is a working day (Monday to Friday, no Austrian public holiday) ----------
const easter = { 2024: "2024-03-31", 2025: "2025-04-20", 2026: "2026-04-05" };
const holidays = new Set();
for (const [y, e] of Object.entries(easter)) {
  for (const md of ["01-01", "01-06", "05-01", "08-15", "10-26", "11-01", "12-08", "12-25", "12-26"]) holidays.add(y + "-" + md);
  for (const offset of [1, 39, 50, 60]) {
    const d = new Date(e + "T00:00:00Z");
    d.setUTCDate(d.getUTCDate() + offset); // Ostermontag, Christi Himmelfahrt, Pfingstmontag, Fronleichnam
    holidays.add(d.toISOString().slice(0, 10));
  }
}
const badDates = [];
let dates = 0;
for (const m of audited.matchAll(/\b(\d{2})\.(\d{2})\.(20\d{2})\b/g)) {
  dates++;
  const iso = m[3] + "-" + m[2] + "-" + m[1];
  const day = new Date(iso + "T00:00:00Z").getUTCDay();
  if (day === 0 || day === 6 || holidays.has(iso)) badDates.push(m[0]);
}
if (badDates.length) failures.push("dates on a weekend or public holiday: " + [...new Set(badDates)].join(", "));

// ---------- Amount audit of SPEZIFIKATION.md: every euro amount must be in the solution list ----------
// Section 12 records the first customer test, which ran on solution list v2; it is history and not audited.
let spec = "";
try {
  spec = readFileSync(new URL("./SPEZIFIKATION.md", import.meta.url), "utf8");
} catch {
  failures.push("docs/SPEZIFIKATION.md not found");
}
const historyStart = spec.indexOf("\n## 12.");
const specAudited = historyStart >= 0 ? spec.slice(0, historyStart) : spec;
const listAmounts = new Set([...audited.matchAll(/(\d{1,3}(?:\.\d{3})*,\d{2})\s?€/g)].map((m) => m[1]));
const specUnknown = [...specAudited.matchAll(/(\d{1,3}(?:\.\d{3})*,\d{2})\s?€/g)].map((m) => m[1]).filter((a) => !listAmounts.has(a));
if (specUnknown.length) failures.push(`amounts in SPEZIFIKATION.md (sections 0 to 11) that are not in Demo_Faelle.md: ${[...new Set(specUnknown)].join(", ")}`);

console.log(out.join("\n"));
console.log(`\nAudit: ${dates} dates in Demo_Faelle.md checked for working days, ${badDates.length} not.`);
console.log(`Audit: ${count} euro amounts in Demo_Faelle.md (before "Changes compared to v2"), ${unknown.length} unknown.`);
if (failures.length) {
  console.log("\nFAILED:\n- " + failures.join("\n- "));
  process.exit(1);
}
console.log("All amounts recomputed: OK");
