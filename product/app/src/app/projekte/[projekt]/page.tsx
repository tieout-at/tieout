// Projekt-Übersicht (bisher „Cockpit“): ein Satz mit Zahlen, Fakten, Schrittleiste, die drei Listen als Beträge,
// die Posten zum Entscheiden und Seitenpanels. Alle Beträge aus dem Rechenkern.

import type { Metadata } from "next";
import { firma, projekt, projektIds } from "@/daten/demo";
import type { Ergebnis } from "@/engine";
import { BefundTabelle } from "@/ui/BefundTabelle";
import { anzahl, betrag, datum } from "@/ui/format";
import { Kennzahl, Kennzahlen } from "@/ui/Kennzahl";
import { Panel } from "@/ui/Panel";
import { Schrittleiste } from "@/ui/Schrittleiste";
import { Seitenkopf } from "@/ui/Seitenkopf";
import { FreigegebenZaehler } from "@/ui/Stand";

type Props = { params: Promise<{ projekt: string }> };

export const dynamicParams = false;
export function generateStaticParams() {
  return projektIds();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { d } = projekt((await params).projekt);
  return { title: `${d.projekt.kurz} Übersicht` };
}

function kontext(e: Ergebnis, liste: "jetzt" | "offen" | "verloren"): string {
  return anzahl(e.befunde.filter((b) => b.liste === liste).length, "Posten", "Posten");
}

export default async function ProjektUebersicht({ params }: Props) {
  const { d, e } = projekt((await params).projekt);
  const { daten } = firma();
  const p = d.projekt;
  const ag = daten.auftraggeber.find((a) => a.id === p.auftraggeberId);
  const entscheiden = e.befunde.filter((b) => b.liste !== "anwalt").map((b) => ({ schluessel: b.schluessel, liste: b.liste }));
  const risiken = new Set((e.vorpruefung?.risiken ?? []).map((r) => r.befundSchluessel).filter((s): s is string => s !== null));
  const zurufe = d.zurufe.length;
  const zurufePosten = e.befunde.filter((b) => b.art === "regie_zuruf").length;
  const zurufIds = new Set(d.zurufe.map((z) => z.id));
  const zurufeAlsBeleg = new Set(
    e.befunde.filter((b) => b.art !== "regie_zuruf").flatMap((b) => b.belege.map((x) => x.quelle.dokumentId).filter((id) => zurufIds.has(id))),
  ).size;

  return (
    <>
      <Seitenkopf pfad={[{ text: daten.firma.name, href: "/" }, { text: p.kurz }]} titel="Übersicht" export={e.abgleich} />
      <main className="scr-body">
        <div className="sw-row meta sw-muted facts">
          {ag && (
            <span>
              {ag.art === "gu" ? "GU" : "Auftraggeber"} <b>{ag.name}</b>
            </span>
          )}
          <span>
            Auftrag <b>{betrag(d.vertrag.auftragssumme.wert)}</b>
          </span>
          <span>{d.vertrag.norm.wert}</span>
          {d.vertrag.preisgleitung && <span>veränderliche Preise</span>}
          {p.schlussrechnungLegenBis && (
            <span>
              Schlussrechnung legen bis <b>{datum(p.schlussrechnungLegenBis)}</b>
            </span>
          )}
          {e.grenze && (
            <span>
              letzte AR <b>{datum(e.grenze)}</b>
            </span>
          )}
          {p.schlussrechnungGelegt && (
            <span>
              Schlussrechnung gelegt <b>{datum(p.schlussrechnungGelegt)}</b>
            </span>
          )}
          {p.schlusszahlung && (
            <span>
              Schlusszahlung <b>{datum(p.schlusszahlung)}</b>
            </span>
          )}
        </div>

        {!e.abgleich && (
          <Kennzahlen>
            {p.schlussrechnungGelegt && <Kennzahl label="Schlussrechnung gelegt" wert={datum(p.schlussrechnungGelegt)} kontext="kein Abgleich" />}
            {p.schlusszahlung && <Kennzahl label="Schlusszahlung" wert={datum(p.schlusszahlung)} kontext="abgeschlossen" />}
          </Kennzahlen>
        )}
        {e.abgleich && (
          <>
            <Schrittleiste
              schritte={[
                {
                  titel: "Einlesen",
                  zeile: `${anzahl(e.import.dokumente, "Dokument", "Dokumente")}${zurufe ? `, ${anzahl(zurufe, "Zuruf", "Zurufe")}` : ""}`,
                  erledigt: true,
                },
                {
                  titel: "Datensätze",
                  zeile: `${e.import.korrigierteFelder} Felder korrigiert`,
                  erledigt: true,
                },
                {
                  titel: "Abgleich",
                  zeile: anzahl(e.ledger.length, "LV-Position", "LV-Positionen"),
                  erledigt: true,
                },
                { titel: "Prüfen und Freigeben", zeile: <FreigegebenZaehler projektId={p.id} posten={entscheiden} />, erledigt: false },
              ]}
            />
            <Kennzahlen>
              <Kennzahl label="Jetzt verrechenbar" wert={betrag(e.summen.jetzt)} kontext={kontext(e, "jetzt")} />
              <Kennzahl label="Angemeldet und offen" wert={betrag(e.summen.offen)} kontext={kontext(e, "offen")} />
              <Kennzahl label="Verloren" wert={betrag(e.summen.verloren)} kontext={kontext(e, "verloren")} />
            </Kennzahlen>
            <div className="cols">
              <Panel titel="Zu entscheiden" rechts={<span className="sw-count">{e.befunde.length}</span>}>
                <BefundTabelle projektId={p.id} befunde={e.befunde} risiken={risiken} />
              </Panel>
              <div className="side">
                {e.vorpruefung && e.vorpruefung.risiken.length > 0 && (
                  <Panel titel="Vorprüfung aus GU-Sicht">
                    <div className="sw-pad">
                      <span className="kpi">{betrag(e.vorpruefung.summe)}</span>
                    </div>
                    <div className="kv">
                      <div>
                        <span>Positionen mit Kürzungsrisiko</span>
                        <b>{e.vorpruefung.risiken.length}</b>
                      </div>
                      <div>
                        <span>davon bereits gekürzt</span>
                        <b>{betrag(e.vorpruefung.bereitsGekuerzt.betrag)}</b>
                      </div>
                    </div>
                  </Panel>
                )}
                <Panel titel="Regieberichte" rechts={<span className="sw-count">{e.regie.gesamt}</span>}>
                  <div className="kv">
                    <div>
                      <span>verrechnet</span>
                      <b>{e.regie.verrechnet}</b>
                    </div>
                    <div>
                      <span>unterschrieben, offen</span>
                      <b>{e.regie.unterschriebenNichtVerrechnet}</b>
                    </div>
                    <div>
                      <span>nicht unterschrieben</span>
                      <b>{e.regie.nichtUnterschrieben}</b>
                    </div>
                    {e.regie.nachGrenze > 0 && (
                      <div>
                        <span>nach der letzten AR</span>
                        <b>{e.regie.nachGrenze}</b>
                      </div>
                    )}
                  </div>
                </Panel>
                {zurufe > 0 && (
                  <Panel titel="Zurufe" rechts={<span className="sw-count">{zurufe}</span>}>
                    <div className="kv">
                      <div>
                        <span>als Beleg</span>
                        <b>{zurufeAlsBeleg}</b>
                      </div>
                      <div>
                        <span>ohne Regiebericht</span>
                        <b>{zurufePosten}</b>
                      </div>
                    </div>
                  </Panel>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}
