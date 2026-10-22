// Firmenübersicht: alle Projekte der Firma mit Ampel, Datum und Beträgen aus dem Rechenkern.
// „Jetzt verrechenbar“ ist die Hauptzahl, „angemeldet und offen“ steht getrennt daneben, nie zusammengezählt.

import type { Metadata } from "next";
import Link from "next/link";
import { firma } from "@/daten/demo";
import type { Ampel, ProjektZeile } from "@/engine";
import { anzahl, betrag, datum } from "@/ui/format";
import { Kennzahl, Kennzahlen } from "@/ui/Kennzahl";
import { Panel } from "@/ui/Panel";
import { Seitenkopf } from "@/ui/Seitenkopf";
import type { Ton } from "@/ui/Statusmarke";
import { Zeilennavigation } from "@/ui/Zeilennavigation";

export const metadata: Metadata = { title: "Projekte" };

/** Ampel als Punkt plus eigenes Wort (Bauteil „Projektliste mit Ampel“, src/ui/README.md). */
const AMPEL: Record<Ampel, { ton: Ton; wort: string }> = {
  rot: { ton: "neg", wort: "Bald legen" },
  gelb: { ton: "warn", wort: "Beträge offen" },
  gruen: { ton: "pos", wort: "Nichts offen" },
  grau: { ton: "neutral", wort: "Kein Abgleich" },
};

function Zeile({ p }: { p: ProjektZeile }) {
  const href = `/projekte/${p.projektId}`;
  const a = AMPEL[p.ampel];
  return (
    <tr data-href={href} tabIndex={0}>
      <td className="sw-td-2">
        <div className="sw-cell">
          <b title={p.name}>
            <span className="sw-pos-nr">{p.kurz}</span>
            <Link href={href} className="row-link" tabIndex={-1}>
              {p.name}
            </Link>
          </b>
          <span>{p.auftraggeber.name}</span>
        </div>
      </td>
      <td className="nur-breit">{p.ampel !== "grau" && <span className={a.ton === "neutral" ? "sw-dotlabel" : `sw-dotlabel sw-dotlabel--${a.ton}`}>{a.wort}</span>}</td>
      <td className="sw-num nur-breit">{p.datum?.art === "legen_bis" && datum(p.datum.wert)}</td>
      <td className="r nur-breit">{betrag(p.auftragssumme)}</td>
      <td className="r">{p.jetzt !== null && betrag(p.jetzt)}</td>
      <td className="r nur-breit">{p.offen !== null && betrag(p.offen)}</td>
    </tr>
  );
}

export default function Firmenuebersicht() {
  const { daten, ergebnis: e } = firma();
  const offen = e.projekte.filter((p) => p.jetzt !== null);
  const zu = e.projekte.filter((p) => p.jetzt === null);
  const naechste = e.naechsteSchlussrechnung ? e.projekte.find((p) => p.projektId === e.naechsteSchlussrechnung!.projektId) : undefined;

  return (
    <>
      <Seitenkopf pfad={[{ text: daten.firma.name }]} titel="Projekte" />
      <main className="scr-body">
        <Kennzahlen>
          <Kennzahl
            label="Jetzt verrechenbar"
            wert={betrag(e.summen.jetzt)}
            kontext={`${anzahl(e.summen.postenJetzt, "Posten", "Posten")} in ${anzahl(e.summen.projekteMitJetzt, "Projekt", "Projekten")}`}
          />
          <Kennzahl
            label="Angemeldet und offen"
            wert={betrag(e.summen.offen)}
            kontext={`${anzahl(e.summen.postenOffen, "Posten", "Posten")} in ${anzahl(e.summen.projekteMitOffen, "Projekt", "Projekten")}`}
          />
          {e.naechsteSchlussrechnung && naechste && (
            <Kennzahl label="Schlussrechnung legen bis" wert={datum(e.naechsteSchlussrechnung.datum)} kontext={`${naechste.kurz} ${naechste.name}`} />
          )}
        </Kennzahlen>
        <Panel titel="Projekte" rechts={<span className="sw-count">{e.summen.projekte}</span>}>
          <Zeilennavigation>
            <table className="sw-table tab-firma liste-mobil" style={{ tableLayout: "fixed" }}>
              <colgroup>
                <col />
                <col style={{ width: 132 }} />
                <col style={{ width: 104 }} />
                <col style={{ width: 132 }} />
                <col style={{ width: 148 }} />
                <col style={{ width: 164 }} />
              </colgroup>
              <thead>
                <tr>
                  <th>Projekt</th>
                  <th>Ampel</th>
                  <th>Legen bis</th>
                  <th className="r">Auftrag</th>
                  <th className="r">Jetzt verrechenbar</th>
                  <th className="r">Angemeldet und offen</th>
                </tr>
              </thead>
              <tbody>
                <tr className="grp">
                  <td colSpan={6}>
                    Im Abgleich<span className="sw-count">{offen.length}</span>
                  </td>
                </tr>
                {offen.map((p) => (
                  <Zeile key={p.projektId} p={p} />
                ))}
                <tr className="grp">
                  <td colSpan={6}>
                    Schlussrechnung gelegt oder abgeschlossen<span className="sw-count">{zu.length}</span>
                  </td>
                </tr>
                {zu.map((p) => (
                  <Zeile key={p.projektId} p={p} />
                ))}
                <tr className="sum">
                  <td colSpan={3}>Alle Projekte</td>
                  <td className="r nur-breit">{betrag(e.summen.auftragssumme)}</td>
                  <td className="r">{betrag(e.summen.jetzt)}</td>
                  <td className="r nur-breit">{betrag(e.summen.offen)}</td>
                </tr>
              </tbody>
            </table>
          </Zeilennavigation>
        </Panel>
      </main>
    </>
  );
}
