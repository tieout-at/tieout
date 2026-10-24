// Amount audit: every amount that docs/_STATUS.md lists under "Amounts that must not change" comes out of kern/ to the
// cent. The test reads the section, so a new or changed amount there fails until it is mapped here, and a changed amount
// in kern/ fails at once. Amounts change only with a go from Maxi S.

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { beispielFirma } from "../src/beispiel";
import { pruefeFirma } from "../src/firma";
import { centAus, euro } from "../src/geld";

const status = readFileSync(new URL("../../docs/_STATUS.md", import.meta.url), "utf8");
const abschnitt = status.slice(status.indexOf("## Amounts that must not change"), status.indexOf("\n## ", status.indexOf("## Amounts that must not change") + 5));
const imAbschnitt = [...abschnitt.matchAll(/(\d{1,3}(?:\.\d{3})*,\d{2}) €/g)].map((m) => m[1] + " €");

const f = pruefeFirma(beispielFirma());
const p = (id: string) => f.ergebnisse[id];

/** What kern/ computes for each line of the section, in the order of the section. */
const AUS_KERN: [string, string, number][] = [
  ["Company", "zusätzlich verrechenbar", f.summen.zusaetzlichVerrechenbar],
  ["Company", "in Klärung", f.summen.inKlaerung],
  ["Wohnpark Mooshaim", "zusätzlich verrechenbar", p("p1").abgleich.summen.zusaetzlichVerrechenbar],
  ["Wohnpark Mooshaim", "davon mit Kürzungsrisiko", p("p1").vorpruefung!.davonMitKuerzungsrisiko],
  ["Wohnpark Mooshaim", "in Klärung", p("p1").abgleich.summen.inKlaerung],
  ["Wohnpark Mooshaim", "Vorprüfung", p("p1").vorpruefung!.summe],
  ["Wohnpark Mooshaim", "Restforderung", p("p1").rechnungsabschluss!.restforderung],
  ["Wohnpark Mooshaim", "Restforderung laut Vertrag", p("p1").rechnungsabschluss!.lautVertrag.restforderung],
  ["Wohnpark Mooshaim", "Schlussbesprechungs-Blatt Forderung", p("p1").schlussbesprechung!.forderung],
  ["Wohnpark Mooshaim", "Untergrenze", p("p1").schlussbesprechung!.untergrenze],
  ["Bürohaus Kiefernau", "zusätzlich verrechenbar", p("p2").abgleich.summen.zusaetzlichVerrechenbar],
  ["Volksschule Ahornbrunn", "zusätzlich verrechenbar", p("p3").abgleich.summen.zusaetzlichVerrechenbar],
  ["Volksschule Ahornbrunn", "in Klärung", p("p3").abgleich.summen.inKlaerung],
];

describe("amounts that must not change (docs/_STATUS.md)", () => {
  it("the section lists exactly the amounts mapped here, in this order", () => {
    expect(imAbschnitt.length).toBe(AUS_KERN.length);
  });

  it.each(AUS_KERN.map(([wo, was, cent], i) => [wo, was, imAbschnitt[i], cent] as const))("%s, %s: %s", (_wo, _was, soll, cent) => {
    expect(euro(cent)).toBe(soll);
    expect(cent).toBe(centAus(soll));
  });

  it("Bürohaus Kiefernau has nothing in Klärung", () => {
    expect(p("p2").abgleich.summen.inKlaerung).toBe(0);
  });
});
