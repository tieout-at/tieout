// Firmenübersicht: alle Projekte der Firma mit Ampel, Datum und Beträgen aus dem Rechenkern.
// „Jetzt verrechenbar“ ist die Hauptzahl, „angemeldet und offen“ steht getrennt daneben, nie zusammengezählt.

import type { Metadata } from "next";
import Link from "next/link";
import { firma } from "@/daten/demo";
import type { Ampel, ProjektDatumArt, ProjektZeile } from "@/engine";
import { betrag, datum } from "@/ui/format";
import { Kennzahl, Kennzahlen } from "@/ui/Kennzahl";
import { Panel } from "@/ui/Panel";
import { Seitenkopf } from "@/ui/Seitenkopf";
import { Statusmarke, type Ton } from "@/ui/Statusmarke";
import { Zeilennavigation } from "@/ui/Zeilennavigation";

export const metadata: Metadata = { title: "Projekte" };

const STATUS_TEXT: Record<ProjektZeile["status"], string> = {
  in_ausfuehrung: "In Ausführung",
  sr_vorbereiten: "Schlussrechnung vorbereiten",
  sr_gelegt: "Schlussrechnung gelegt",
  abgeschlossen: "Abgeschlossen",
};

const DATUM_TEXT: Record<ProjektDatumArt, string> = {
  legen_bis: "legen bis",
  letzte_ar: "letzte AR",
  gelegt: "gelegt",
  schlusszahlung: "Schlusszahlung",
};

const AMPEL: Record<Ampel, { ton: Ton; titel: string }> = {
  rot: { ton: "neg", titel: "Ampel rot: Schlussrechnung in höchstens 21 Tagen zu legen, Beträge offen" },
  gelb: { ton: "warn", titel: "Ampel gelb: Beträge offen" },
  gruen: { ton: "pos", titel: "Ampel grün: nichts offen" },
  grau: { ton: "neutral", titel: "Ampel grau: Schlussrechnung gelegt oder abgeschlossen, kein Abgleich" },
};

function Betrag({ cent }: { cent: number | null }) {
  return cent === null ? null : <>{betrag(cent)}</>;
}

function Zeile({ p }: { p: ProjektZeile }) {
  const href = `/projekte/${p.projektId}`;
  const a = AMPEL[p.ampel];
  return (
    <tr data-href={href} tabIndex={0}>
      <td className="sw-td-2">
        <div className="sw-cell">
          <b>
            <span className="sw-pos-nr">{p.kurz}</span>
            <Link href={href} className="row-link" tabIndex={-1}>
              {p.name}
            </Link>
          </b>
          <span>{p.auftraggeber.name}</span>
        </div>
      </td>
      <td>
        <Statusmarke ton={a.ton} titel={a.titel}>
          {STATUS_TEXT[p.status]}
        </Statusmarke>
      </td>
      <td className="sw-td-2">
        {p.datum && (
          <div className="sw-cell">
            <b className="sw-num">{datum(p.datum.wert)}</b>
            <span>{DATUM_TEXT[p.datum.art]}</span>
          </div>
        )}
      </td>
      <td className="r calc">{betrag(p.auftragssumme)}</td>
      <td className="r">
        <Betrag cent={p.jetzt} />
      </td>
      <td className="r">
        <Betrag cent={p.offen} />
      </td>
    </tr>
  );
}

export default function Firmenuebersicht() {
  const { daten, ergebnis: e } = firma();
  const offen = e.projekte.filter((p) => p.jetzt !== null);
  const zu = e.projekte.filter((p) => p.jetzt === null);
  const posten = (liste: "jetzt" | "offen") =>
    Object.values(e.ergebnisse).reduce((s, x) => s + x.befunde.filter((b) => b.liste === liste).length, 0);
  const mitJetzt = offen.filter((p) => (p.jetzt ?? 0) > 0).length;
  const mitOffen = offen.filter((p) => (p.offen ?? 0) > 0).length;
  const naechste = offen
    .filter((p) => p.datum?.art === "legen_bis")
    .sort((a, b) => a.datum!.wert.localeCompare(b.datum!.wert))[0];

  return (
    <>
      <Seitenkopf pfad={[{ text: daten.firma.name }]} titel="Projekte" />
      <main className="scr-body">
        <Kennzahlen>
          <Kennzahl label="Jetzt verrechenbar" wert={betrag(e.summen.jetzt)} kontext={`${posten("jetzt")} Posten in ${mitJetzt} Projekten`} />
          <Kennzahl label="Angemeldet und offen" wert={betrag(e.summen.offen)} kontext={`${posten("offen")} Posten in ${mitOffen} Projekten`} />
          {naechste?.datum && (
            <Kennzahl
              label="Nächste Schlussrechnung"
              wert={datum(naechste.datum.wert)}
              kontext={`${naechste.kurz} ${naechste.name}`}
            />
          )}
        </Kennzahlen>
        <Panel titel="Projekte" rechts={<span className="sw-count">{e.summen.projekte}</span>}>
          <Zeilennavigation>
            <table className="sw-table" style={{ tableLayout: "fixed", minWidth: 1000 }}>
              <colgroup>
                <col />
                <col style={{ width: 216 }} />
                <col style={{ width: 120 }} />
                <col style={{ width: 132 }} />
                <col style={{ width: 168 }} />
                <col style={{ width: 184 }} />
              </colgroup>
              <thead>
                <tr>
                  <th>Projekt</th>
                  <th>Status</th>
                  <th>Datum</th>
                  <th className="r">Auftrag</th>
                  <th className="r">Jetzt verrechenbar</th>
                  <th className="r">Angemeldet und offen</th>
                </tr>
              </thead>
              <tbody>
                <tr className="grp">
                  <td colSpan={3}>
                    Offen<span className="sw-count">{offen.length}</span>
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
