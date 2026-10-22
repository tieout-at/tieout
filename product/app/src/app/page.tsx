// Firmenübersicht: alle Projekte der Firma mit Ampel, Datum und Beträgen aus dem Rechenkern.
// „Jetzt verrechenbar“ ist die Hauptzahl, „angemeldet und offen“ steht getrennt daneben, nie zusammengezählt.

import type { Metadata } from "next";
import Link from "next/link";
import { firma } from "@/daten/demo";
import type { Ampel, ProjektDatumArt, ProjektZeile } from "@/engine";
import { anzahl, betrag, datum } from "@/ui/format";
import { Kennzahl, Kennzahlen } from "@/ui/Kennzahl";
import { Panel } from "@/ui/Panel";
import { Seitenkopf } from "@/ui/Seitenkopf";
import { Statusmarke, type Ton } from "@/ui/Statusmarke";
import { Zeilennavigation } from "@/ui/Zeilennavigation";

export const metadata: Metadata = { title: "Projekte" };

const DATUM_TEXT: Record<ProjektDatumArt, string> = {
  legen_bis: "Schlussrechnung legen bis",
  letzte_ar: "letzte Abschlagsrechnung",
  gelegt: "Schlussrechnung gelegt",
  schlusszahlung: "Schlusszahlung",
};

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
      <td>
        <Statusmarke ton={a.ton}>{a.wort}</Statusmarke>
      </td>
      <td className="sw-td-2">
        {p.datum && (
          <div className="sw-cell">
            <b className="sw-num">{datum(p.datum.wert)}</b>
            <span>{DATUM_TEXT[p.datum.art]}</span>
          </div>
        )}
      </td>
      <td className="r">{betrag(p.auftragssumme)}</td>
      <td className="r">{p.jetzt !== null && betrag(p.jetzt)}</td>
      <td className="r">{p.offen !== null && betrag(p.offen)}</td>
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
            <table className="sw-table" style={{ tableLayout: "fixed", minWidth: 960 }}>
              <colgroup>
                <col />
                <col style={{ width: 140 }} />
                <col style={{ width: 176 }} />
                <col style={{ width: 128 }} />
                <col style={{ width: 164 }} />
                <col style={{ width: 176 }} />
              </colgroup>
              <thead>
                <tr>
                  <th>Projekt</th>
                  <th>Ampel</th>
                  <th>Datum</th>
                  <th className="r">Auftrag</th>
                  <th className="r">Jetzt verrechenbar</th>
                  <th className="r">Angemeldet und offen</th>
                </tr>
              </thead>
              <tbody>
                <tr className="grp">
                  <td colSpan={3}>
                    Im Abgleich<span className="sw-count">{offen.length}</span>
                  </td>
                  <td className="r">{betrag(e.summen.auftragssummeOffen)}</td>
                  <td className="r">{betrag(e.summen.jetzt)}</td>
                  <td className="r">{betrag(e.summen.offen)}</td>
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
                  <td className="r">{betrag(e.summen.auftragssumme)}</td>
                  <td />
                  <td />
                </tr>
              </tbody>
            </table>
          </Zeilennavigation>
        </Panel>
      </main>
    </>
  );
}
