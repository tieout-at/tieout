// Schlussrechnung eines Projekts (UI-Runde 1, Schritt 3b, Option A „Rechnungsblatt“; Vorlage: reebuild R-A
// Prüfkaskade, Stripe-Rechnung als Blatt, Kuro-Fundstellen als Belegchips).
// Links das Blatt: Entwurf der Bauleitung plus Liste 1, Kaskade bis zur Restforderung, jede Zeile mit ihrem Beleg.
// Rechts die Vorprüfung aus GU-Sicht (steckt teils in Liste 1, nie addiert) und der Stand der Freigabe.
// Variante (a) des Bauplans: die Kaskade zählt immer die ganze Liste 1, der Stand steht je Posten daneben.
// Alle Beträge aus dem Rechenkern. Beim Drucken wird daraus das Beweispaket (Posten, Rechenweg, Belege).

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Fragment } from "react";
import { excelDaten, firma, hatSchlussrechnung, postenSlug, projekt, schlussrechnungIds, schonBeiAuftraggeber } from "@/daten/demo";
import { prozentText } from "@/engine/geld";
import { KUERZUNGSGRUND_TEXT, type Beleg, type KaskadenZeile } from "@/engine";
import { anzahl, betrag, datum } from "@/ui/format";
import { teileTitel } from "@/ui/posten-texte";
import { ExcelKnopf } from "@/ui/Excel";
import { GleicherGrund } from "@/ui/GleicherGrund";
import { DruckKnopf, FreigabeStufen } from "@/ui/Schlussrechnung";
import { Seitenkopf } from "@/ui/Seitenkopf";
import { FreigegebenZahl, StandZelle } from "@/ui/Stand";

type Props = { params: Promise<{ projekt: string }> };

export const dynamicParams = false;
export function generateStaticParams() {
  return schlussrechnungIds();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { d } = projekt((await params).projekt);
  return { title: `Schlussrechnung ${d.projekt.kurz}` };
}

const PRUEFUNG: Record<NonNullable<KaskadenZeile["pruefung"]>, { text: string; klasse: string } | null> = {
  laut_vertrag: null,
  abweichung: { text: "weicht vom Vertrag ab", klasse: "sr-pruefung sr-pruefung--warn" },
  abzug_ohne_vertragspunkt: { text: "Abzug ohne Vertragspunkt", klasse: "sr-pruefung sr-pruefung--warn" },
};

/** Gemeinsamer Anfang aller Belegtitel einer Zeile (z. B. „Zahlungsavis“), damit die Chips kurz bleiben. */
function gemeinsamerAnfang(belege: Beleg[]): string {
  if (belege.length < 2) return "";
  const woerter = belege.map((b) => b.titel.split(" "));
  const anfang: string[] = [];
  for (let i = 0; i < woerter[0].length - 1; i++) {
    if (woerter.every((w) => w.length > i + 1 && w[i] === woerter[0][i])) anfang.push(woerter[0][i]);
    else break;
  }
  return anfang.join(" ");
}

function BelegChip({ basis, b, ohne }: { basis: string; b: Beleg; ohne: string }) {
  return (
    <Link href={`${basis}/belege/${b.quelle.dokumentId}/`} className="sw-source" title={`${b.text}, Seite ${b.quelle.seite}${b.datum ? `, ${datum(b.datum)}` : ""}`}>
      {ohne ? b.titel.slice(ohne.length + 1) : b.titel}
    </Link>
  );
}

export default async function Schlussrechnung({ params }: Props) {
  const id = (await params).projekt;
  if (!hatSchlussrechnung(id)) notFound();
  const { d, e } = projekt(id);
  const { daten } = firma();
  const k = e.kaskade!;
  const v = e.vorpruefung;
  const basis = `/projekte/${id}`;
  const liste1 = e.befunde.filter((b) => b.liste === "jetzt");
  const postenHref = (schluessel: string) => `${basis}/posten/${postenSlug(schluessel)}/`;
  const ag = daten.auftraggeber.find((a) => a.id === d.projekt.auftraggeberId);
  const letzte = k.zeilen.length - 1;
  const art = new Map(d.dokumente.map((x) => [x.id, x.art]));

  return (
    <>
      <Seitenkopf pfad={[{ text: daten.firma.name, href: "/" }, { text: d.projekt.kurz, href: `${basis}/` }]} titel="Schlussrechnung"
        aktion={
          <span className="sw-row">
            <ExcelKnopf daten={excelDaten(id)!} />
            <DruckKnopf />
          </span>
        }
      />
      <main className="scr-body sr">
        <section className="sr-kopf">
          <div className="sr-kopf__zahl">
            <span className="label">Restforderung</span>
            <span className="sr-kopf__betrag">{betrag(k.restforderung)}</span>
            <span className="sr-kopf__ctx">
              enthält Liste 1 mit {betrag(e.summen.jetzt)}, davon <FreigegebenZahl projektId={id} posten={liste1} /> Posten freigegeben
            </span>
            <span className="sr-kopf__ctx sw-muted">
              {d.projekt.schlussrechnungLegenBis && <>Legen bis {datum(d.projekt.schlussrechnungLegenBis)} </>}
              an {ag?.name}
            </span>
          </div>
          <FreigabeStufen projektId={id} posten={liste1.map((b) => ({ schluessel: b.schluessel, liste: b.liste }))} href={`${basis}/posten/`} />
        </section>

        <div className="sr-raster">
          <section className="sr-mappe" aria-label="Schlussrechnung, Entwurf der Bauleitung">
            <div className="sr-blatt">
              <div className="sr-blatt__kopf">
                <span>
                  <b>Schlussrechnung</b> {d.projekt.name}, {d.projekt.los}
                </span>
                <span className="sr-marke sr-nur-schirm">Entwurf der Bauleitung</span>
              </div>
              <table className="sr-kaskade">
                <colgroup>
                  <col />
                  <col style={{ width: 72 }} />
                  <col style={{ width: 144 }} />
                </colgroup>
                <thead className="sr-nur-vorlesen">
                  <tr>
                    <th>Zeile und Beleg</th>
                    <th>Satz</th>
                    <th>Betrag</th>
                  </tr>
                </thead>
                <tbody>
                  {k.zeilen.map((z, i) => {
                    const p = z.pruefung ? PRUEFUNG[z.pruefung] : null;
                    const belege = (
                      <span className="sr-belege">
                        {gemeinsamerAnfang(z.belege) && <span className="sr-belege__anfang">{gemeinsamerAnfang(z.belege)}</span>}
                        {z.belege.map((b) => (
                          <BelegChip key={`${b.quelle.dokumentId}-${b.titel}`} basis={basis} b={b} ohne={gemeinsamerAnfang(z.belege)} />
                        ))}
                      </span>
                    );
                    // Erste Zeile der Kaskade: Entwurf und Liste 1 getrennt, damit jeder Chip zu seiner Zahl führt.
                    if (i === 0 && d.entwurf)
                      return (
                        <Fragment key={z.bezeichnung}>
                          <tr className="sr-zeile">
                            <td>
                              <span className="sr-nur-schirm">Entwurf der Bauleitung</span>
                              <span className="sr-nur-druck">Leistungen</span>
                              <span className="sr-nur-schirm">{belege}</span>
                            </td>
                            <td />
                            <td className="r">{betrag(d.entwurf.summe.wert)}</td>
                          </tr>
                          <tr className="sr-zeile sr-zeile--darin">
                            <td colSpan={2}>
                              <details className="sr-liste1" open>
                                <summary>
                                  <span className="sr-nur-schirm">plus Liste 1 jetzt verrechenbar</span>
                                  <span className="sr-nur-druck">plus weitere Leistungen</span>, {anzahl(liste1.length, "Posten", "Posten")}
                                </summary>
                                <ul>
                                  {liste1.map((b) => (
                                    <li key={b.schluessel}>
                                      <Link href={postenHref(b.schluessel)}>
                                        {teileTitel(b.titel).kennung && <span className="sw-pos-nr">{teileTitel(b.titel).kennung}</span>}
                                        <span className="sr-liste1__titel">{teileTitel(b.titel).text}</span>
                                      </Link>
                                      <StandZelle projektId={id} schluessel={b.schluessel} liste={b.liste} />
                                      <span className="sr-liste1__betrag">{b.betrag !== null && betrag(b.betrag)}</span>
                                    </li>
                                  ))}
                                </ul>
                              </details>
                            </td>
                            <td className="r">{betrag(e.summen.jetzt)}</td>
                          </tr>
                          <tr className="sr-zeile sr-zeile--start">
                            <td>
                              Leistungssumme<span className="sr-nur-schirm"> inkl. Liste 1</span>
                            </td>
                            <td />
                            <td className="r">{betrag(z.betrag)}</td>
                          </tr>
                        </Fragment>
                      );
                    const klasse = i === letzte ? "sr-zeile sr-zeile--rest" : z.art === "summe" ? "sr-zeile sr-zeile--summe" : "sr-zeile";
                    return (
                      <tr key={z.bezeichnung} className={klasse} data-warn={p ? "" : undefined}>
                        <td>
                          {z.bezeichnung}
                          {p && <span className={`${p.klasse} sr-nur-schirm`}>{p.text}</span>}
                          {z.pruefung === "abzug_ohne_vertragspunkt" && (
                            <span className="sr-historie sr-nur-schirm">
                              <GleicherGrund treffer={schonBeiAuftraggeber(id, "abzug_ohne_vertragspunkt")} />
                            </span>
                          )}
                          {z.belege.length > 0 && belege}
                        </td>
                        <td className="sr-satz">{z.satz !== null ? prozentText(z.satz, 2) : ""}</td>
                        <td className="r">{betrag(z.betrag)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {v && (
            <aside className="sr-vorpruefung" aria-labelledby="sr-vp-titel">
              <div className="sr-vorpruefung__kopf">
                <h2 id="sr-vp-titel" className="section-title">
                  Vorprüfung aus GU-Sicht
                </h2>
                <span className="meta sw-muted">
                  {betrag(v.summe)} in {anzahl(v.risiken.length, "Position", "Positionen")}, steckt teils in Liste 1, nicht addieren
                </span>
              </div>
              <ul className="sr-risiken">
                {v.risiken.map((r) => {
                  // Schon gekürzt: zum Korrekturblatt des GU; sonst zum Posten oder zum ersten Beleg.
                  const korrektur = r.bereitsGekuerzt ? r.belege.find((x) => art.get(x.quelle.dokumentId) === "gu_korrektur") : undefined;
                  const beleg = korrektur ?? r.belege[0];
                  const ziel = korrektur || !r.befundSchluessel ? (beleg ? `${basis}/belege/${beleg.quelle.dokumentId}/` : `${basis}/belege/`) : postenHref(r.befundSchluessel);
                  return (
                    <li key={r.schluessel}>
                      <Link href={ziel} className="sr-risiko" data-gekuerzt={r.bereitsGekuerzt || undefined}>
                        <span className="sr-risiko__kopf">
                          <b>{r.bezug}</b>
                          <span>{betrag(r.betrag)}</span>
                        </span>
                        <span className="sr-risiko__grund">
                          {KUERZUNGSGRUND_TEXT[r.grund]}
                          {r.bereitsGekuerzt && ", bereits gekürzt"}
                        </span>
                        <span className="sr-risiko__abhilfe">{r.abhilfe}</span>
                        {!r.bereitsGekuerzt && <GleicherGrund treffer={schonBeiAuftraggeber(id, r.grund)} ohneLink />}
                      </Link>
                    </li>
                  );
                })}
              </ul>
              {v.bereitsGekuerzt.anzahl > 0 && (
                <p className="sr-vorpruefung__fuss">
                  Bereits gekürzt {betrag(v.bereitsGekuerzt.betrag)}, {v.korrekturblatt.erkannt} von {v.korrekturblatt.zeilen} Kürzungen erkannt
                </p>
              )}
            </aside>
          )}
        </div>

        <section className="sr-paket" aria-label="Beweispaket">
          <h2 className="section-title">Beweispaket {d.projekt.kurz}<span className="sr-nur-schirm">, Liste 1</span></h2>
          {liste1.map((b) => (
            <article key={b.schluessel} className="sr-paket__posten">
              <h3>
                {b.titel}
                <span>{b.betrag !== null && betrag(b.betrag)}</span>
              </h3>
              {b.rechenweg && <p>{b.rechenweg.text}</p>}
              <ol>
                {b.belege.map((x) => (
                  <li key={`${x.quelle.dokumentId}-${x.titel}-${x.text}`}>
                    <b>{x.titel}</b> {x.text}
                    {x.datum && <> ({datum(x.datum)})</>}, Seite {x.quelle.seite}
                  </li>
                ))}
              </ol>
            </article>
          ))}
        </section>
      </main>
    </>
  );
}

