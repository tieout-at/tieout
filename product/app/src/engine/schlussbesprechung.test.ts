// Schlussbesprechungs-Blatt W21 gegen die Lösungsliste (Demo_Faelle.md, „Final meeting sheet“), auf den Cent.

import { describe, expect, it } from "vitest";
import { erzeugeW21 } from "@/demo/w21/erzeuge";
import { SOLL_BESPRECHUNG, SOLL_UNTERGRENZEN } from "@/demo/w21/loesung";
import { pruefe } from "./pruefe";
import { schlussbesprechung } from "./schlussbesprechung";

const d = erzeugeW21();
const e = pruefe(d);
const s = schlussbesprechung(d, e.befunde);

describe("Schlussbesprechung W21", () => {
  it("Untergrenze je Posten wie in der Lösungsliste", () => {
    const ist = Object.fromEntries(s.gruppen.flatMap((g) => g.posten.map((p) => [p.schluessel, p.untergrenze])));
    expect(ist).toEqual(SOLL_UNTERGRENZEN);
  });

  it("Gruppen belegt, Beleg fehlt, angemeldet und die Summen", () => {
    expect({
      gruppen: s.gruppen.map((g) => ({ stand: g.stand, anzahl: g.posten.length, forderung: g.forderung, untergrenze: g.untergrenze })),
      forderung: s.forderung,
      untergrenze: s.untergrenze,
      spielraum: s.spielraum,
    }).toEqual(SOLL_BESPRECHUNG);
  });

  it("Forderung je Posten = Betrag des Postens, Untergrenze nie darüber", () => {
    for (const p of s.gruppen.flatMap((g) => g.posten)) {
      expect(p.forderung).toBe(e.befunde.find((b) => b.schluessel === p.schluessel)!.betrag);
      expect(p.untergrenze).toBeLessThanOrEqual(p.forderung);
    }
  });

  it("Rechenweg der Untergrenze lesbar", () => {
    const rb07 = s.gruppen[0].posten.find((p) => p.schluessel === "regie:RB-07")!;
    expect(rb07.rechenweg).toBe("18 h × 56,80 € + Material 186,40 €");
    expect(s.gruppen[0].posten.find((p) => p.schluessel === "preisumrechnung")!.rechenweg).toBe("Vertragspreis");
  });

  it("Gegenprobe: Anwalt und Liste 3 nicht auf dem Blatt", () => {
    const schluessel = s.gruppen.flatMap((g) => g.posten.map((p) => p.schluessel));
    expect(schluessel).not.toContain("hinweis:mail-0702-termin");
    expect(schluessel).not.toContain("vertrag:mail-0520-container");
  });
});
