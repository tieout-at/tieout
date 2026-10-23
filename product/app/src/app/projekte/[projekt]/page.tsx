// Projekt-Übersicht (UI-Runde 1, Schritt 3, Option A „Ergebniskette“; Vorlage: Linear-Projektseite, reebuild R-C,
// Stripe-Zahlungsfortschritt für die Kette). Oben Titel und Fakten, darunter vier Ergebnisse statt Maschinenraum:
// gefunden, abgesichert, freigegeben, Schlussrechnung. Darunter die nächsten Posten (die ganze Liste steht auf
// „Posten“) und rechts die letzte WhatsApp-Meldung. Eine Primäraktion („Weiter prüfen“, beginnt bei J1).
// Alle Zahlen und Beträge aus dem Rechenkern.

import { Camera } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { firma, hatSchlussrechnung, historie, postenSlug, projekt, projektAbrechnung, projektIds, schonBeiAuftraggeber, zuEntscheiden } from "@/daten/demo";
import { BELEGQUELLE_TEXT } from "@/engine";
import { AbrechnungBlatt, AuftraggeberBisher, Kuerzungen, Nachtraege } from "@/ui/Abgeschlossen";
import { Ergebniskette, type Glied } from "@/ui/Ergebniskette";
import { anzahl, betrag, datum, zeitpunkt } from "@/ui/format";
import { Ico } from "@/ui/Ico";
import { Kennzahl, Kennzahlen } from "@/ui/Kennzahl";
import { HINWEIS_ERP, teileTitel } from "@/ui/posten-texte";
import { Seitenkopf } from "@/ui/Seitenkopf";
import { FreigabeStriche, FreigegebenZahl, StandZelle } from "@/ui/Stand";
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

/** So viele Posten zeigt die Übersicht; alle stehen auf der Seite „Posten“. */
const NAECHSTE = 5;

export default async function ProjektUebersicht({ params }: Props) {
  const id = (await params).projekt;
  const { d, e } = projekt(id);
  const { daten } = firma();
  const p = d.projekt;
  const ag = daten.auftraggeber.find((a) => a.id === p.auftraggeberId);
  const basis = `/projekte/${id}`;
  // „Braucht Anwalt“ geht an die Kanzlei und ist damit schon entschieden: zählt weder bei „Zu entscheiden“ noch bei
  // „x von y freigegeben“. Reihenfolge: Posten mit Kürzungsrisiko zuerst, damit „Weiter prüfen“ bei J1 beginnt.
  const entscheiden = zuEntscheiden(id, e);
  const befund = new Map(e.befunde.map((b) => [b.schluessel, b]));
  // Kürzungsrisiko je Posten mit seinem eigenen Betrag (nicht der Postenbetrag), nur wenn genau ein Risiko am Posten hängt.
  const risikoBetrag = new Map<string, number[]>();
  for (const r of e.vorpruefung?.risiken ?? []) if (r.befundSchluessel) risikoBetrag.set(r.befundSchluessel, [...(risikoBetrag.get(r.befundSchluessel) ?? []), r.betrag]);
  const risiko = new Set((e.vorpruefung?.risiken ?? []).map((r) => r.befundSchluessel).filter((s): s is string => s !== null));
  const anwalt = e.befunde.filter((b) => b.liste === "anwalt");
  const sr = hatSchlussrechnung(id);
  // Vorprüfung nur, wo die Lösungsliste sie hat (W21); P3 hat zwar einen Entwurf, aber keine freigegebenen Werte.
  const v = sr ? e.vorpruefung : null;
  const ampel = firma().ergebnis.projekte.find((x) => x.projektId === id)?.ampel;
  const zahl = {
    jetzt: e.befunde.filter((b) => b.liste === "jetzt").length,
    offen: e.befunde.filter((b) => b.liste === "offen").length,
    verloren: e.befunde.filter((b) => b.liste === "verloren").length,
  };
  const nichtsOffen = entscheiden.length === 0;
  // Ohne Abgleich (Schlussrechnung gelegt oder abgeschlossen): Abrechnung aus Rechnung, Korrekturblatt und Avis.
  const abr = projektAbrechnung(id);
  const zahlungsavis = d.zahlungen.find((z) => z.rechnungNr.wert === abr?.rechnung.nr)?.dokumentId ?? "";
  // „Bisher“ nur, wenn der Auftraggeber auch in anderen Projekten etwas gekürzt, abgezogen oder bezahlt hat.
  const bisher = e.abgleich
    ? null
    : historie().auftraggeber.find(
        (h) => h.auftraggeber.id === p.auftraggeberId && [...h.kuerzungen, ...h.abzuege, ...h.schlusszahlung].some((x) => x.projektId !== id),
      );

  // Letzte WhatsApp-Meldung und der Posten, den sie belegt oder ausgelöst hat.
  const meldung = [...d.zurufe].sort((a, b) => b.zeitpunkt.localeCompare(a.zeitpunkt))[0];
  const meldungPosten = meldung
    ? (e.befunde.find((b) => b.art === "regie_zuruf" && b.belege.some((x) => x.quelle.dokumentId === meldung.id)) ??
      e.befunde.find((b) => b.belege.some((x) => x.quelle.dokumentId === meldung.id)))
    : undefined;

  const glieder: Glied[] = e.abgleich
    ? [
        {
          titel: "Gefunden",
          wert: anzahl(entscheiden.length, "Posten", "Posten"),
          zeile:
            [zahl.jetzt && `${zahl.jetzt} jetzt`, zahl.offen && `${zahl.offen} angemeldet`, zahl.verloren && `${zahl.verloren} verloren`].filter(Boolean).join(", ") ||
            "nichts offen",
          href: `${basis}/posten/`,
          stand: "erledigt",
        },
        v
          ? {
              titel: "Vorgeprüft",
              wert: anzahl(v.risiken.length, "Risiko", "Risiken"),
              zeile: <span className="ek-warn">Kürzungsrisiko {betrag(v.summe)}</span>,
              href: `${basis}/schlussrechnung/`,
              stand: "erledigt",
            }
          : {
              titel: "Belegt",
              wert: anzahl(e.import.eindeutig, "Beleg", "Belege"),
              zeile: d.zurufe.length ? `davon ${anzahl(d.zurufe.length, "WhatsApp-Meldung", "WhatsApp-Meldungen")}` : "jede Zahl mit Original",
              href: `${basis}/belege/`,
              stand: "erledigt",
            },
        nichtsOffen
          ? {
              titel: "Freigegeben",
              wert: "nichts offen",
              zeile: "keine Posten zu entscheiden",
              href: `${basis}/positionen/`,
              stand: "erledigt",
            }
          : {
              titel: "Freigegeben",
              wert: <FreigegebenZahl projektId={id} posten={entscheiden} />,
              zeile: <FreigabeStriche projektId={id} posten={entscheiden} />,
              href: `${basis}/posten/`,
              stand: "jetzt",
            },
        sr && e.kaskade
          ? {
              titel: "Schlussrechnung",
              wert: betrag(e.kaskade.restforderung),
              zeile: "Restforderung laut Entwurf",
              href: `${basis}/schlussrechnung/`,
              stand: "offen",
            }
          : p.schlussrechnungLegenBis
            ? {
                titel: "Schlussrechnung",
                wert: datum(p.schlussrechnungLegenBis),
                zeile: "legen bis",
                href: `${basis}/posten/`,
                stand: "offen",
              }
            : {
                titel: "Nächste AR",
                wert: betrag(e.summen.jetzt),
                zeile: "jetzt verrechenbar",
                href: `${basis}/positionen/`,
                stand: "offen",
              },
      ]
    : [];

  return (
    <>
      <Seitenkopf
        pfad={[{ text: daten.firma.name, href: "/" }, { text: p.kurz }]}
        titel="Übersicht"
        aktion={e.abgleich ? <WeiterPruefen projektId={id} posten={entscheiden} className="sw-btn sw-btn--accent sw-btn--sm" /> : undefined}
      />
      <main className="scr-body ab-uebersicht ue">
        <div className="ptitle">
          <h2 className="page-title">
            <span className="sw-pos-nr">{p.kurz}</span>
            {p.name}
          </h2>
          <div className="sw-row meta sw-muted facts">
            {p.schlussrechnungLegenBis && (
              <span>
                Schlussrechnung legen bis <b className={ampel === "rot" ? "ue-frist" : undefined}>{datum(p.schlussrechnungLegenBis)}</b>
              </span>
            )}
            {!p.schlussrechnungLegenBis && e.abgleich && e.grenze && (
              <span>
                Letzte Abschlagsrechnung <b>{datum(e.grenze)}</b>
              </span>
            )}
            {!e.abgleich && (
              <span>
                <b>{p.status === "abgeschlossen" ? "Abgeschlossen" : "Schlussrechnung gelegt"}</b>
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

        {!e.abgleich && abr && (
          <>
            <Ergebniskette
              glieder={[
                { titel: "Gelegt", wert: betrag(abr.rechnung.summe), zeile: `Schlussrechnung ${datum(abr.rechnung.datum)}`, href: `${basis}/belege/${d.schlussrechnung!.dokumentId}/`, stand: "erledigt" },
                {
                  titel: "Gekürzt",
                  wert: betrag(abr.gekuerzt),
                  zeile: anzahl(abr.kuerzungen.length, "Position laut Korrekturblatt", "Positionen laut Korrekturblatt"),
                  href: `${basis}/belege/${zahlungsavis}/#pos-kuerzung`,
                  stand: "erledigt",
                },
                { titel: "Einbehalten", wert: betrag(abr.einbehalten), zeile: "Haftrücklass", href: `${basis}/belege/${zahlungsavis}/#pos-haftruecklass`, stand: "erledigt" },
                {
                  titel: "Bezahlt",
                  wert: betrag(abr.schlusszahlung.betrag),
                  zeile: `${datum(abr.schlusszahlung.datum)}, nach ${anzahl(abr.schlusszahlung.tage, "Tag", "Tagen")}`,
                  href: `${basis}/belege/${zahlungsavis}/#pos-zahlbetrag`,
                  stand: "erledigt",
                },
              ]}
            />
            <div className="sr-raster">
              <AbrechnungBlatt basis={basis} name={`${p.name}, ${p.los}`} a={abr} gleicherGrund={schonBeiAuftraggeber(id, "abzug_ohne_vertragspunkt")} />
              <aside className="ab-spalte">
                <Kuerzungen basis={basis} a={abr} gleich={(grund) => schonBeiAuftraggeber(id, grund)} />
                <Nachtraege basis={basis} a={abr} />
                {bisher && <AuftraggeberBisher h={bisher} />}
              </aside>
            </div>
          </>
        )}

        {!e.abgleich && !abr && (
          <>
            <Kennzahlen>
              {p.schlussrechnungGelegt && <Kennzahl label="Schlussrechnung gelegt" wert={datum(p.schlussrechnungGelegt)} kontext={ag ? `an ${ag.name}` : ""} />}
              <Kennzahl label="Schlusszahlung" wert={p.schlusszahlung ? datum(p.schlusszahlung) : "offen"} kontext={p.schlusszahlung ? "Projekt abgeschlossen" : "noch kein Zahlungsavis"} />
            </Kennzahlen>
            {bisher && (
              <div className="ab-spalte ab-spalte--allein">
                <AuftraggeberBisher h={bisher} />
              </div>
            )}
          </>
        )}

        {e.abgleich && (
          <>
            <Ergebniskette glieder={glieder} />
            {/* Am Handy ist der Seitenkopf ohne Aktion: dort steht „Weiter prüfen“ unter der Kette. */}
            <WeiterPruefen projektId={id} posten={entscheiden} className="sw-btn sw-btn--accent ue-handy-knopf" />
            <div className={meldung ? "ue-raster" : "ue-raster ue-raster--voll"}>
              <section className="ue-naechste" aria-labelledby="ue-naechste-titel">
                <div className="ue-abschnitt">
                  <h2 id="ue-naechste-titel" className="section-title">
                    Als Nächstes prüfen
                  </h2>
                  {!nichtsOffen && (
                    <Link href={`${basis}/posten/`} className="ue-alle">
                      Alle {anzahl(entscheiden.length, "Posten", "Posten")}
                      {anwalt.length > 0 && ` und ${anzahl(anwalt.length, "Hinweis", "Hinweise")}`}
                    </Link>
                  )}
                </div>
                {nichtsOffen ? (
                  <p className="ue-leer">Nichts offen. Alles bis zur letzten Abschlagsrechnung ist verrechnet.</p>
                ) : (
                  <ol className="ue-posten">
                    {entscheiden.slice(0, NAECHSTE).map((x) => {
                      const b = befund.get(x.schluessel)!;
                      const t = teileTitel(b.titel);
                      return (
                        <li key={x.schluessel}>
                          <Link href={x.href} className="ue-posten__zeile">
                            <span className="ue-posten__nr">{t.kennung ?? ""}</span>
                            <span className="ue-posten__titel">
                              <b title={t.text}>{t.text}</b>
                              <span>{b.untertitel}</span>
                            </span>
                            <span className="ue-quellen" aria-label="Belegquellen">
                              {(e.belegquellen[b.schluessel] ?? []).map((q) => (
                                <span key={q} className={q === "whatsapp" ? "ue-quelle ue-quelle--wa" : "ue-quelle"}>
                                  {BELEGQUELLE_TEXT[q]}
                                </span>
                              ))}
                            </span>
                            <span className="ue-posten__stand">
                              <StandZelle projektId={id} schluessel={b.schluessel} liste={b.liste} leerBeiPruefen />
                              {risiko.has(b.schluessel) && (
                                  <span className="ue-risiko">
                                    Risiko{risikoBetrag.get(b.schluessel)?.length === 1 && ` ${betrag(risikoBetrag.get(b.schluessel)![0])}`}
                                  </span>
                                )}
                            </span>
                            <span className="ue-posten__betrag">{b.betrag !== null && betrag(b.betrag)}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ol>
                )}
                {!nichtsOffen && (
                  <Kennzahlen>
                    <Kennzahl label="Jetzt verrechenbar" wert={betrag(e.summen.jetzt)} kontext={anzahl(zahl.jetzt, "Posten", "Posten")} />
                    <Kennzahl label="Angemeldet und offen" wert={betrag(e.summen.offen)} kontext={anzahl(zahl.offen, "Posten", "Posten")} />
                    {sr && (
                      <Kennzahl label="Nur außerhalb ERP" wert={betrag(e.ausserhalbErp.betrag)} kontext={`${e.ausserhalbErp.anzahl} von ${e.ausserhalbErp.vonAnzahl} Posten`} hinweis={HINWEIS_ERP} />
                    )}
                    {e.summen.verloren > 0 && <Kennzahl label="Verloren" wert={betrag(e.summen.verloren)} kontext={anzahl(zahl.verloren, "Posten", "Posten")} />}
                  </Kennzahlen>
                )}
              </section>

              {meldung && (
                <aside className="ue-meldung" aria-labelledby="ue-meldung-titel">
                  <div className="ue-abschnitt">
                    <h2 id="ue-meldung-titel" className="section-title">
                      Letzte WhatsApp-Meldung
                    </h2>
                    <Link href={`${basis}/zeitachse/`} className="ue-alle">
                      {anzahl(d.zurufe.length, "Meldung", "Meldungen")}
                    </Link>
                  </div>
                  <div className="ue-meldung__karte">
                    <span className="ue-meldung__wer">
                      {zeitpunkt(meldung.zeitpunkt)}, {meldung.absender}
                    </span>
                    <Link href={`${basis}/belege/${meldung.id}/`} className="ue-meldung__blase">
                      {meldung.foto && (
                        <span className="ue-meldung__foto">
                          <Ico icon={Camera} />
                          Foto angehängt
                        </span>
                      )}
                      <span>{meldung.transkript.wert}</span>
                    </Link>
                    <span className="ue-meldung__ja">Bestätigt vom Absender</span>
                    {meldungPosten && (
                      <Link href={`${basis}/posten/${postenSlug(meldungPosten.schluessel)}/`} className="ue-meldung__posten">
                        <span>{meldungPosten.art === "regie_zuruf" ? "Neuer Posten ohne Regiebericht" : "Beleg für den Posten"}</span>
                        {meldungPosten.betrag !== null && <b>{betrag(meldungPosten.betrag)}</b>}
                      </Link>
                    )}
                  </div>
                </aside>
              )}
            </div>
          </>
        )}
      </main>
    </>
  );
}
