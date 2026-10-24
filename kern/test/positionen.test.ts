// Position table of Ebene 2 against the extract in solution list v3 ("Position table extract").

import { describe, expect, it } from "vitest";
import { beispielFirma } from "../src/beispiel";
import { positionstabelle } from "../src/positionen";
import { abgleich } from "../src/regeln";
import { ausListe } from "./hilfen";

const firma = beispielFirma();
const p1 = firma.projekte[0];
const tabelle = positionstabelle(p1, abgleich(p1));

describe("P1 Wohnpark Mooshaim: position table", () => {
  it("one row per position of the Leistungsverzeichnis plus the services without a position", () => {
    expect(tabelle.zeilen.filter((z) => z.art === "position")).toHaveLength(286);
    expect(tabelle.zeilen.filter((z) => z.art === "regie")).toHaveLength(15);
  });

  it("exactly the 11 rows with something open, with Beauftragt, Erbracht, Verrechnet, Offen and Belegstand", () => {
    const offen = tabelle.zeilen.filter((z) => z.offen > 0).map((z) => [z.text.split(",")[0].split(" (")[0], z.zellen.beauftragt, z.zellen.erbracht, z.zellen.verrechnet, z.offen, z.belegstand]);
    expect(offen).toEqual([
      ["22.03.02A Anbindeleitung Mehrschichtverbundrohr 16 × 2", "1.512 m", "1.638 m", "1.512 m", ausListe("1.751,40 €"), "belegt"],
      ["22.04.12B Plattenheizkörper Typ 22 VK", "86 Stk", "100 Stk", "86 Stk", ausListe("4.009,60 €"), "belegt"],
      ["22.05.03A Thermostatkopf mit eingebautem Fühler", "168 Stk", "182 Stk", "168 Stk", ausListe("347,20 €"), "belegt"],
      ["22.05.06A Heizkörper-Anschlussarmatur", "168 Stk", "182 Stk", "168 Stk", ausListe("540,40 €"), "belegt"],
      ["24.02.05A Mehrschichtverbundrohr 20 × 2", "640 m", "808 m", "640 m", ausListe("3.326,40 €"), "belegt"],
      ["24.08.02A Brandschutzmanschette für Kunststoffrohr DN 110", "120 Stk", "142 Stk", "120 Stk", ausListe("2.032,80 €"), "belegt"],
      ["Regiebericht 9", "–", "12 h Monteur, 12 h Helfer", "0 h", ausListe("1.787,49 €"), "belegt"],
      ["Regiebericht 12", "–", "5 h Monteur, 5 h Helfer", "0 h", ausListe("643,99 €"), "beleg_fehlt"],
      ["Regiebericht 15", "–", "6 h Monteur, 6 h Helfer", "0 h", ausListe("824,86 €"), "belegt"],
      ["WhatsApp-Meldung 08.09.2026", "–", "4 h Monteur, 4 h Helfer", "0 h", ausListe("476,00 €"), "beleg_fehlt"],
      ["Technikraum umgeplant: zweiter Pufferspeicher", "–", "–", "–", ausListe("6.953,60 €"), "nachtrag_nicht_gelegt"],
    ]);
  });

  it("the row of the Änderung names its e-mail", () => {
    expect(tabelle.zeilen.find((z) => z.art === "aenderung")!.text).toBe("Technikraum umgeplant: zweiter Pufferspeicher, Verteiler versetzt (E-Mail 16.03.2026)");
  });

  it("footer: 'Zusätzlich verrechenbar' and 'In Klärung' separately", () => {
    expect(tabelle.fusszeile).toEqual({ zusaetzlichVerrechenbar: ausListe("14.620,15 €"), inKlaerung: ausListe("8.073,59 €") });
  });

  it("the invoiced plan change of Plan L-310 Index E: beauftragt 220 m, erbracht 258 m, all invoiced", () => {
    const z = tabelle.zeilen.find((x) => x.positionNr === "26.03.05A")!;
    expect([z.zellen.beauftragt, z.zellen.erbracht, z.zellen.verrechnet, z.offen]).toEqual(["220 m", "258 m", "258 m", 0]);
  });
});

describe("P2 Bürohaus Kiefernau: position table during construction", () => {
  const p2 = firma.projekte[1];
  const t = positionstabelle(p2, abgleich(p2));

  it("22.03.08A: erbracht up to the last Abschlagsrechnung 760 m, 60 m after it, verrechnet 610 m", () => {
    const z = t.zeilen.find((x) => x.positionNr === "22.03.08A")!;
    expect([z.zellen.beauftragt, z.zellen.erbracht, z.zellen.verrechnet, z.nachGrenze, z.offen]).toEqual(["880 m", "760 m", "610 m", 6_000, ausListe("3.240,00 €")]);
  });

  it("Regiebericht 7 (work after the last Abschlagsrechnung) has no row yet", () => {
    expect(t.zeilen.filter((z) => z.art === "regie").map((z) => z.text.split(",")[0])).toEqual(["Regiebericht 1", "Regiebericht 2", "Regiebericht 3", "Regiebericht 4", "Regiebericht 5", "Regiebericht 6"]);
  });
});
