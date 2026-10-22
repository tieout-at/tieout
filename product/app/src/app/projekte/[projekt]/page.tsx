// Projekt-Übersicht (Vorlage: reebuild R-C, Linear-Projektseite): Titel und Fakten, Ablauf mit vier Schritten,
// Kennzahlen, die Posten zum Entscheiden und rechts eine ruhige Eigenschaftenliste. Eine Primäraktion („Weiter prüfen“).
// Alle Zahlen und Beträge aus dem Rechenkern.

import type { Metadata } from "next";
import Link from "next/link";
import { befundSlug, firma, projekt, projektIds } from "@/daten/demo";
import type { Ergebnis } from "@/engine";
import { BefundTabelle } from "@/ui/BefundTabelle";
import { anzahl, betrag, datum } from "@/ui/format";
import { Kennzahl, Kennzahlen } from "@/ui/Kennzahl";
import { Panel } from "@/ui/Panel";
import { Schrittleiste } from "@/ui/Schrittleiste";
import { Seitenkopf } from "@/ui/Seitenkopf";
import { FreigabeStriche, FreigegebenZahl } from "@/ui/Stand";
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

/** Eine Zeile der Eigenschaftenliste (Linear-Projekt rechts): Wort links, Zahl rechts. */
function Eigenschaft({ text, wert }: { text: string; wert: React.ReactNode }) {
  return (
    <div className="ab-prop">
      <span>{text}</span>
      <b>{wert}</b>
    </div>
  );
}

export default async function ProjektUebersicht({ params }: Props) {
  const id = (await params).projekt;
  const { d, e } = projekt(id);
  const { daten } = firma();
  const p = d.projekt;
  const ag = daten.auftraggeber.find((a) => a.id === p.auftraggeberId);
  const basis = `/projekte/${id}`;
  const href = (schluessel: string) => `${basis}/befunde/${befundSlug(schluessel)}/`;
  // „Braucht Anwalt“ geht an die Kanzlei und ist damit schon entschieden: zählt weder bei „Zu entscheiden“ noch bei
  // „x von y freigegeben“, steht in der Tabelle als eigene Gruppe mit eigenem Zähler.
  const entscheiden = e.befunde.filter((b) => b.liste !== "anwalt").map((b) => ({ schluessel: b.schluessel, liste: b.liste, href: href(b.schluessel) }));
  const risiken = new Set((e.vorpruefung?.risiken ?? []).map((r) => r.befundSchluessel).filter((s): s is string => s !== null));
  const zurufe = d.zurufe.length;
  const zurufIds = new Set(d.zurufe.map((z) => z.id));
  const zurufePosten = e.befunde.filter((b) => b.art === "regie_zuruf").length;
  const zurufeAlsBeleg = new Set(
    e.befunde.filter((b) => b.art !== "regie_zuruf").flatMap((b) => b.belege.map((x) => x.quelle.dokumentId).filter((x) => zurufIds.has(x))),
  ).size;
  const einlesenZeile = [zurufe ? anzahl(zurufe, "Zuruf", "Zurufe") : "", e.import.duplikate ? anzahl(e.import.duplikate, "Duplikat", "Duplikate") : ""].filter(Boolean).join(", ");

  return (
    <>
      <Seitenkopf
        pfad={[{ text: daten.firma.name, href: "/" }, { text: p.kurz }]}
        titel="Übersicht"
        aktion={e.abgleich ? <WeiterPruefen projektId={id} posten={entscheiden} /> : undefined}
      />
      <main className="scr-body ab-uebersicht">
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
            {!p.schlussrechnungLegenBis && e.abgleich && e.grenze && (
              <span>
                Letzte Abschlagsrechnung <b>{datum(e.grenze)}</b>
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
                { titel: "Einlesen", zahl: e.import.dokumente, einheit: e.import.dokumente === 1 ? "Dokument" : "Dokumente", zeile: einlesenZeile, erledigt: true, href: `${basis}/ordner` },
                {
                  titel: "Datensätze",
                  zahl: e.import.eindeutig,
                  einheit: "eindeutig",
                  zeile: anzahl(e.import.korrigierteFelder, "Feld korrigiert", "Felder korrigiert"),
                  erledigt: true,
                  href: `${basis}/ordner`,
                  hinweis: "Ein Datensatz je Dokument ohne Duplikate, jedes Feld mit Quelle",
                },
                { titel: "Abgleich", zahl: e.ledger.length, einheit: e.ledger.length === 1 ? "LV-Position" : "LV-Positionen", zeile: anzahl(e.befunde.length, "Befund", "Befunde"), erledigt: true, href: `${basis}/ledger` },
                {
                  titel: "Prüfen und Freigeben",
                  zahl: <FreigegebenZahl projektId={id} posten={entscheiden} />,
                  einheit: "freigegeben",
                  zeile: <FreigabeStriche projektId={id} posten={entscheiden} />,
                  erledigt: false,
                  href: `${basis}/befunde`,
                },
              ]}
            />
            <Kennzahlen>
              <Kennzahl label="Jetzt verrechenbar" wert={betrag(e.summen.jetzt)} kontext={posten(e, "jetzt")} />
              <Kennzahl label="Angemeldet und offen" wert={betrag(e.summen.offen)} kontext={posten(e, "offen")} />
              {e.vorpruefung && e.vorpruefung.risiken.length > 0 && (
                <Kennzahl
                  label="Kürzungsrisiko aus GU-Sicht"
                  wert={betrag(e.vorpruefung.summe)}
                  kontext={`${anzahl(e.vorpruefung.risiken.length, "Position", "Positionen")}, bereits gekürzt ${betrag(e.vorpruefung.bereitsGekuerzt.betrag)}`}
                />
              )}
            </Kennzahlen>
            <div className="cols">
              <Panel titel="Zu entscheiden" rechts={<span className="sw-count">{entscheiden.length}</span>}>
                <BefundTabelle projektId={id} befunde={e.befunde} summen={e.summen} risiken={risiken} href={(b) => href(b.schluessel)} />
              </Panel>
              <aside className="ab-props">
                <section className="ab-props__gruppe">
                  <h3 className="ab-props__kopf">
                    Regieberichte <span className="sw-count">{e.regie.gesamt}</span>
                  </h3>
                  <Eigenschaft text="Verrechnet" wert={e.regie.verrechnet} />
                  <Eigenschaft text="Unterschrieben, offen" wert={e.regie.unterschriebenNichtVerrechnet} />
                  <Eigenschaft text="Nicht unterschrieben" wert={e.regie.nichtUnterschrieben} />
                  {e.regie.nachGrenze > 0 && <Eigenschaft text="Nach der letzten AR" wert={e.regie.nachGrenze} />}
                </section>
                {zurufe > 0 && (
                  <section className="ab-props__gruppe">
                    <h3 className="ab-props__kopf">
                      <Link href={`${basis}/zeitachse`}>Zurufe</Link> <span className="sw-count">{zurufe}</span>
                    </h3>
                    <Eigenschaft text="Als Beleg" wert={zurufeAlsBeleg} />
                    <Eigenschaft text="Ohne Regiebericht" wert={zurufePosten} />
                  </section>
                )}
              </aside>
            </div>
          </>
        )}
      </main>
    </>
  );
}
