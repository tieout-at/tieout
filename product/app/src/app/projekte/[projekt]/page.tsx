// Projekt-Übersicht: Titel und Fakten, Schrittleiste, Kennzahlen, die Posten zum Entscheiden und Seitenpanels.
// Eine Primäraktion („Weiter prüfen“). Alle Beträge aus dem Rechenkern.

import type { Metadata } from "next";
import { befundSlug, firma, projekt, projektIds } from "@/daten/demo";
import type { Ergebnis } from "@/engine";
import { BefundTabelle } from "@/ui/BefundTabelle";
import { anzahl, betrag, datum } from "@/ui/format";
import { Kennzahl, Kennzahlen } from "@/ui/Kennzahl";
import { Panel } from "@/ui/Panel";
import { Schrittleiste } from "@/ui/Schrittleiste";
import { Seitenkopf } from "@/ui/Seitenkopf";
import { FreigegebenZaehler } from "@/ui/Stand";
import { WeiterPruefen } from "@/ui/WeiterPruefen";

type Props = { params: Promise<{ projekt: string }> };

export const dynamicParams = false;
export function generateStaticParams() {
  return projektIds();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { d } = projekt((await params).projekt);
  return { title: `${d.projekt.kurz} ${d.projekt.name}` };
}

function posten(e: Ergebnis, liste: "jetzt" | "offen"): string {
  return anzahl(e.befunde.filter((b) => b.liste === liste).length, "Posten", "Posten");
}

export default async function ProjektUebersicht({ params }: Props) {
  const id = (await params).projekt;
  const { d, e } = projekt(id);
  const { daten } = firma();
  const p = d.projekt;
  const ag = daten.auftraggeber.find((a) => a.id === p.auftraggeberId);
  const href = (schluessel: string) => `/projekte/${id}/befunde/${befundSlug(schluessel)}`;
  const entscheiden = e.befunde.filter((b) => b.liste !== "anwalt").map((b) => ({ schluessel: b.schluessel, liste: b.liste, href: href(b.schluessel) }));
  const risiken = new Set((e.vorpruefung?.risiken ?? []).map((r) => r.befundSchluessel).filter((s): s is string => s !== null));
  const zurufe = d.zurufe.length;
  const zurufIds = new Set(d.zurufe.map((z) => z.id));
  const zurufePosten = e.befunde.filter((b) => b.art === "regie_zuruf").length;
  const zurufeAlsBeleg = new Set(
    e.befunde.filter((b) => b.art !== "regie_zuruf").flatMap((b) => b.belege.map((x) => x.quelle.dokumentId).filter((x) => zurufIds.has(x))),
  ).size;

  return (
    <>
      <Seitenkopf
        pfad={[{ text: daten.firma.name, href: "/" }, { text: p.kurz }]}
        titel="Übersicht"
        aktion={e.abgleich ? <WeiterPruefen projektId={id} posten={entscheiden} /> : undefined}
      />
      <main className="scr-body">
        <div className="ptitle">
          <h2 className="page-title">
            <span className="sw-pos-nr">{p.kurz}</span>
            {p.name}
          </h2>
          <div className="sw-row meta sw-muted facts">
            {p.schlussrechnungLegenBis && (
              <span>
                Schlussrechnung legen bis <b>{datum(p.schlussrechnungLegenBis)}</b>
              </span>
            )}
            {ag && (
              <span>
                {ag.art === "gu" ? "GU" : "Auftraggeber"} <b>{ag.name}</b>
              </span>
            )}
            <span>
              Auftrag <b>{betrag(d.vertrag.auftragssumme.wert)}</b>
            </span>
            <span>{p.los}</span>
            <span>{d.vertrag.norm.wert}</span>
            {d.vertrag.preisgleitung && <span>veränderliche Preise</span>}
          </div>
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
                { titel: "Einlesen", zeile: `${anzahl(e.import.dokumente, "Dokument", "Dokumente")}${zurufe ? `, ${anzahl(zurufe, "Zuruf", "Zurufe")}` : ""}`, erledigt: true },
                { titel: "Datensätze", zeile: `${e.import.korrigierteFelder} Felder korrigiert`, erledigt: true },
                { titel: "Abgleich", zeile: anzahl(e.ledger.length, "LV-Position", "LV-Positionen"), erledigt: true },
                { titel: "Prüfen und Freigeben", zeile: <FreigegebenZaehler projektId={id} posten={entscheiden} />, erledigt: false },
              ]}
            />
            <Kennzahlen>
              <Kennzahl label="Jetzt verrechenbar" wert={betrag(e.summen.jetzt)} kontext={posten(e, "jetzt")} />
              <Kennzahl label="Angemeldet und offen" wert={betrag(e.summen.offen)} kontext={posten(e, "offen")} />
              {p.schlussrechnungLegenBis ? (
                <Kennzahl label="Schlussrechnung legen bis" wert={datum(p.schlussrechnungLegenBis)} kontext="Schlussrechnung vorbereiten" />
              ) : (
                e.grenze && <Kennzahl label="Letzte Abschlagsrechnung" wert={datum(e.grenze)} kontext="In Ausführung" />
              )}
            </Kennzahlen>
            <div className="cols">
              <Panel titel="Zu entscheiden" rechts={<span className="sw-count">{e.befunde.length}</span>}>
                <BefundTabelle projektId={id} befunde={e.befunde} risiken={risiken} href={(b) => href(b.schluessel)} />
              </Panel>
              <div className="side">
                {e.vorpruefung && e.vorpruefung.risiken.length > 0 && (
                  <Panel titel="Vorprüfung aus GU-Sicht">
                    <div className="sw-pad sw-stack">
                      <span className="label">Kürzungsrisiko</span>
                      <span className="kpi">{betrag(e.vorpruefung.summe)}</span>
                    </div>
                    <div className="kv">
                      <div>
                        <span>Positionen</span>
                        <b>{e.vorpruefung.risiken.length}</b>
                      </div>
                      <div>
                        <span>Bereits gekürzt</span>
                        <b>{betrag(e.vorpruefung.bereitsGekuerzt.betrag)}</b>
                      </div>
                    </div>
                  </Panel>
                )}
                <Panel titel="Regieberichte" rechts={<span className="sw-count">{e.regie.gesamt}</span>}>
                  <div className="kv">
                    <div>
                      <span>Verrechnet</span>
                      <b>{e.regie.verrechnet}</b>
                    </div>
                    <div>
                      <span>Unterschrieben, offen</span>
                      <b>{e.regie.unterschriebenNichtVerrechnet}</b>
                    </div>
                    <div>
                      <span>Nicht unterschrieben</span>
                      <b>{e.regie.nichtUnterschrieben}</b>
                    </div>
                    {e.regie.nachGrenze > 0 && (
                      <div>
                        <span>Nach der letzten AR</span>
                        <b>{e.regie.nachGrenze}</b>
                      </div>
                    )}
                  </div>
                </Panel>
                {zurufe > 0 && (
                  <Panel titel="Zurufe" rechts={<span className="sw-count">{zurufe}</span>}>
                    <div className="kv">
                      <div>
                        <span>Als Beleg</span>
                        <b>{zurufeAlsBeleg}</b>
                      </div>
                      <div>
                        <span>Ohne Regiebericht</span>
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
