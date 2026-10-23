"use client";

// Excel mit Freigabestand (UI-Runde 2, Option E2, gewählt von Maxi S. 23.10.): beim Klick im Browser erzeugt.
// Beträge und Summen kommen fertig aus dem Rechenkern (`excelDaten`), der Browser ergänzt nur den Stand der Freigabe
// je Posten, so wie er auf dem Bildschirm steht. exceljs wird erst beim Klick geladen.

import { Download } from "lucide-react";
import { useState } from "react";
import type { ExcelDaten } from "@/daten/demo";
import { schritte, standAus, type Stand } from "@/zustand/freigabe";
import { useVerlauf } from "@/zustand/speicher";
import { Ico } from "./Ico";
import { LISTEN, teileTitel } from "./posten-texte";

const STAND_TEXT: Record<Stand, string> = {
  pruefen: "offen",
  zurueckgestellt: "zurückgestellt",
  uebernommen: "übernommen",
  freigegeben: "freigegeben",
  verworfen: "verworfen",
  anwalt: "braucht Anwalt",
};

const EURO = '#,##0.00 "€";-#,##0.00 "€"';
const zeit = (iso: string | undefined) => (iso ? new Date(iso).toLocaleString("de-AT", { dateStyle: "short", timeStyle: "short" }) : "");

export function ExcelKnopf({ daten }: { daten: ExcelDaten }) {
  const verlauf = useVerlauf(daten.projekt.id);
  const [laeuft, setLaeuft] = useState(false);

  async function erzeugen() {
    setLaeuft(true);
    try {
      const { default: ExcelJS } = await import("exceljs");
      const wb = new ExcelJS.Workbook();
      wb.creator = "tieout";
      const jetzt = new Date();
      const kopf = (ws: import("exceljs").Worksheet, titel: string) => {
        ws.addRow([titel]).font = { bold: true, size: 14 };
        ws.addRow([`${daten.projekt.name}, ${daten.projekt.los}`, `Auftraggeber ${daten.projekt.auftraggeber}`]);
        ws.addRow([`Stand ${zeit(jetzt.toISOString())}`, daten.summen.synthetisch ? "Synthetische Beispieldaten" : ""]);
        ws.addRow([]);
      };
      const tabelle = (ws: import("exceljs").Worksheet, spalten: { kopf: string; breite: number; euro?: boolean }[], zeilen: (string | number | { text: string; hyperlink: string } | null)[][]) => {
        const k = ws.addRow(spalten.map((s) => s.kopf));
        k.font = { bold: true };
        k.eachCell((c) => (c.border = { bottom: { style: "thin" } }));
        spalten.forEach((s, i) => {
          ws.getColumn(i + 1).width = s.breite;
          if (s.euro) ws.getColumn(i + 1).numFmt = EURO;
        });
        for (const z of zeilen) ws.addRow(z);
      };
      const euro = (cent: number | null) => (cent === null ? null : cent / 100);
      const link = (href: string, text: string) => ({ text, hyperlink: `${location.origin}${href}` });
      const stand = (schluessel: string, liste: ExcelDaten["posten"][number]["liste"]) => {
        const s = standAus(verlauf, schluessel, liste);
        const e = schritte(verlauf, schluessel);
        return {
          text: STAND_TEXT[s],
          pruefung: zeit(e.findLast((x) => x.aktion === "uebernehmen")?.zeit),
          freigabe: zeit(e.findLast((x) => x.aktion === "freigeben")?.zeit),
          frei: s === "freigegeben",
        };
      };
      const liste1 = daten.posten.filter((p) => p.liste === "jetzt");
      const frei = liste1.filter((p) => stand(p.schluessel, p.liste).frei).length;

      const sr = wb.addWorksheet("Schlussrechnung");
      kopf(sr, `Schlussrechnung ${daten.projekt.kurz}, Entwurf`);
      sr.addRow([`Liste 1: ${frei} von ${liste1.length} Posten freigegeben`]);
      sr.addRow([]);
      tabelle(
        sr,
        [{ kopf: "Zeile", breite: 52 }, { kopf: "Satz", breite: 10 }, { kopf: "Betrag", breite: 18, euro: true }, { kopf: "Prüfung", breite: 26 }, { kopf: "Beleg", breite: 48 }],
        daten.kaskade.map((z) => [
          z.bezeichnung,
          z.satz === null ? "" : `${(z.satz / 100).toLocaleString("de-AT", { minimumFractionDigits: 2 })} %`,
          euro(z.betrag),
          z.pruefung === "abzug_ohne_vertragspunkt" ? "Abzug ohne Vertragspunkt" : z.pruefung === "abweichung" ? "weicht vom Vertrag ab" : z.pruefung === "laut_vertrag" ? "laut Vertrag" : "",
          z.belege,
        ]),
      );

      const po = wb.addWorksheet("Posten");
      kopf(po, "Posten");
      tabelle(
        po,
        [
          { kopf: "Liste", breite: 22 },
          { kopf: "Nr.", breite: 12 },
          { kopf: "Posten", breite: 48 },
          { kopf: "Art", breite: 24 },
          { kopf: "Betrag", breite: 16, euro: true },
          { kopf: "Rechenweg", breite: 60 },
          { kopf: "Belegquelle", breite: 28 },
          { kopf: "Stand", breite: 16 },
          { kopf: "Übernommen", breite: 16 },
          { kopf: "Freigegeben", breite: 16 },
          { kopf: "In tieout", breite: 14 },
        ],
        daten.posten.map((p) => {
          const t = teileTitel(p.titel);
          const s = stand(p.schluessel, p.liste);
          return [LISTEN.find((l) => l.liste === p.liste)?.text ?? p.liste, t.kennung ?? "", t.text, p.art, euro(p.betrag), p.rechenweg, p.quellen, s.text, s.pruefung, s.freigabe, link(p.href, "öffnen")];
        }),
      );

      const bs = wb.addWorksheet("Schlussbesprechung");
      kopf(bs, "Schlussbesprechung");
      tabelle(
        bs,
        [{ kopf: "Gruppe", breite: 14 }, { kopf: "Posten", breite: 52 }, { kopf: "Forderung", breite: 16, euro: true }, { kopf: "Untergrenze", breite: 16, euro: true }, { kopf: "Untergrenze aus", breite: 40 }, { kopf: "Stand", breite: 16 }, { kopf: "Ergebnis", breite: 16, euro: true }],
        daten.besprechung.map((p) => {
          const liste = daten.posten.find((x) => x.schluessel === p.schluessel)?.liste ?? "offen";
          return [p.gruppe, p.titel, euro(p.forderung), euro(p.untergrenze), p.rechenweg, stand(p.schluessel, liste).text, null];
        }),
      );
      const summe = bs.addRow(["Summe", "", euro(daten.summen.besprechung.forderung), euro(daten.summen.besprechung.untergrenze), `Spielraum ${(daten.summen.besprechung.spielraum / 100).toLocaleString("de-AT", { minimumFractionDigits: 2 })} €`]);
      summe.font = { bold: true };

      const vp = wb.addWorksheet("Vorprüfung");
      kopf(vp, "Vorprüfung aus GU-Sicht");
      vp.addRow(["Steckt teils in Liste 1, nicht addieren"]);
      vp.addRow([]);
      tabelle(
        vp,
        [{ kopf: "Bezug", breite: 14 }, { kopf: "Grund", breite: 40 }, { kopf: "Was", breite: 30 }, { kopf: "Abhilfe", breite: 60 }, { kopf: "Betrag", breite: 16, euro: true }, { kopf: "Bereits gekürzt", breite: 16 }],
        daten.vorpruefung.map((r) => [r.bezug, r.grund, r.was, r.abhilfe, euro(r.betrag), r.bereitsGekuerzt ? "ja" : ""]),
      );
      vp.addRow(["Summe", "", "", "", euro(daten.summen.vorpruefung)]).font = { bold: true };

      const be = wb.addWorksheet("Belege");
      kopf(be, "Belege");
      tabelle(
        be,
        [{ kopf: "Datei", breite: 56 }, { kopf: "Art", breite: 16 }, { kopf: "Datum", breite: 12 }, { kopf: "In tieout", breite: 14 }],
        daten.belege.map((b) => [b.dateiname, b.art, b.datum.split("-").reverse().join("."), link(b.href, "öffnen")]),
      );

      const blob = new Blob([await wb.xlsx.writeBuffer()], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${daten.projekt.kurz}_Schlussrechnung_Stand_${jetzt.toISOString().slice(0, 10)}.xlsx`;
      a.click();
      URL.revokeObjectURL(a.href);
    } finally {
      setLaeuft(false);
    }
  }

  return (
    <button type="button" className="sw-btn sw-btn--sm" onClick={erzeugen} disabled={laeuft}>
      <Ico icon={Download} />
      {laeuft ? "Erzeuge Excel" : "Excel"}
    </button>
  );
}
