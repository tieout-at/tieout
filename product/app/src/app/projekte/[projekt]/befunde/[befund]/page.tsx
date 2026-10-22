// Befund mit Beleg-Panel: Betrag, Rechenweg, Beweiskette, zweistufige Freigabe; rechts das Original mit Markierung.

import { TriangleAlert } from "lucide-react";
import type { Metadata } from "next";
import { befund, befundSlug, firma, projektIds, projekt } from "@/daten/demo";
import type { DokumentArt } from "@/domain/typen";
import { prozentText } from "@/engine/geld";
import { ART_TEXT, LISTEN, teileTitel } from "@/ui/befund-texte";
import { Befundflaeche, type BelegAnsicht, type BelegTyp } from "@/ui/Befundflaeche";
import { Belegseite, belegDatei } from "@/ui/Belegseite";
import { betrag, datum } from "@/ui/format";
import { Freigabeleiste } from "@/ui/Freigabeleiste";
import { Ico } from "@/ui/Ico";
import { Seitenkopf } from "@/ui/Seitenkopf";
import { Statusmarke } from "@/ui/Statusmarke";

type Props = { params: Promise<{ projekt: string; befund: string }> };

export const dynamicParams = false;
export function generateStaticParams() {
  return projektIds().flatMap(({ projekt: id }) => projekt(id).e.befunde.map((b) => ({ projekt: id, befund: befundSlug(b.schluessel) })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { projekt: id, befund: slug } = await params;
  const { b } = befund(id, slug);
  return { title: teileTitel(b.titel).text };
}

const KURZ: Partial<Record<DokumentArt, string>> = {
  lv: "LV",
  mail: "Mail",
  foto: "Foto",
  aufmass: "Aufmaß",
  regie: "Regie",
  abschlag: "AR",
  sr_entwurf: "Entwurf",
  vertrag: "Vertrag",
  indexblatt: "Index",
  stundenliste: "Stunden",
  gu_korrektur: "Korrektur",
  gu_abzug: "GU",
  zahlung: "Zahlung",
  k7: "K7",
};

const TYP: Partial<Record<DokumentArt, BelegTyp>> = {
  lv: "lv",
  plan: "plan",
  mail: "mail",
  foto: "foto",
  aufmass: "aufmass",
  regie: "tabelle",
  stundenliste: "tabelle",
  abschlag: "tabelle",
  sr_entwurf: "tabelle",
  k7: "tabelle",
  indexblatt: "tabelle",
};

export default async function BefundSeite({ params }: Props) {
  const { projekt: id, befund: slug } = await params;
  const { d, e, b } = befund(id, slug);
  const { daten } = firma();
  const t = teileTitel(b.titel);
  const liste = LISTEN.find((l) => l.liste === b.liste)!;
  const risiko = e.vorpruefung?.risiken.find((r) => r.befundSchluessel === b.schluessel);
  const hinweis = e.hinweise.find((h) => h.befundSchluessel === b.schluessel);

  const belege: BelegAnsicht[] = b.belege.map((x, i) => {
    const zuruf = d.zurufe.find((z) => z.id === x.quelle.dokumentId);
    const dok = d.dokumente.find((y) => y.id === x.quelle.dokumentId);
    const plan = dok?.art === "plan" ? d.plaene.find((p) => p.dokumentId === dok.id) : undefined;
    const datei = belegDatei(d, x);
    return {
      key: `${i}-${x.quelle.dokumentId}`,
      titel: x.titel,
      text: x.text,
      datum: x.datum ? datum(x.datum) : null,
      datei: datei.datei,
      seite: datei.seite,
      seiten: datei.seiten,
      kurz: zuruf ? "Zuruf" : plan ? `Plan ${plan.index.wert}` : dok ? (KURZ[dok.art] ?? "Beleg") : "Beleg",
      typ: zuruf ? "zuruf" : dok ? (TYP[dok.art] ?? "sonst") : "sonst",
      seiteInhalt: <Belegseite d={d} beleg={x} />,
    };
  });
  const start = Math.max(0, belege.findIndex((x) => x.typ !== "lv"));

  const kopf = (
    <>
      <div className="fhead">
        <div className="sw-row">
          <Statusmarke ton={liste.ton}>{liste.text}</Statusmarke>
          <span className="meta sw-muted">{ART_TEXT[b.art]}</span>
        </div>
        <h1 className="section-title">
          {t.kennung && <span className="sw-pos-nr">{t.kennung}</span>}
          {t.text}
        </h1>
        {b.betrag !== null && <span className="kpi">{betrag(b.betrag)}</span>}
      </div>
      {risiko && (
        <div className="callout">
          <Ico icon={TriangleAlert} />
          <div>
            <b>Kürzungsrisiko aus GU-Sicht</b>
            {risiko.detail}. {risiko.abhilfe}.
          </div>
        </div>
      )}
      {hinweis && (
        <div className="callout callout--neutral">
          <Ico icon={TriangleAlert} />
          <div>
            <b>Mengenänderung +{prozentText(hinweis.aenderung)}</b>
            {hinweis.text}
          </div>
        </div>
      )}
      {b.rechenweg && b.rechenweg.schritte.length > 0 && (
        <section className="sw-panel">
          <table className="sw-table">
            <tbody>
              {b.rechenweg.schritte
                .filter((s, i, alle) => !(alle.length > 1 && i === alle.length - 1 && s.betrag === b.betrag))
                .map((s) => (
                <tr key={s.bezeichnung}>
                  <td>{s.bezeichnung}</td>
                  <td className="r">{s.wert}</td>
                </tr>
              ))}
              <tr className="sum">
                <td colSpan={2}>{b.rechenweg.text}</td>
              </tr>
            </tbody>
          </table>
        </section>
      )}
      {b.rechenweg?.plausibilitaet && <p className="meta sw-muted plain">{b.rechenweg.plausibilitaet}</p>}
    </>
  );

  return (
    <>
      <Seitenkopf
        pfad={[
          { text: daten.firma.name, href: "/" },
          { text: d.projekt.kurz, href: `/projekte/${id}` },
          { text: "Befunde", href: `/projekte/${id}/befunde` },
        ]}
        titel={t.kennung ? `${t.kennung} ${t.text}` : t.text}
      />
      <Befundflaeche
        kopf={kopf}
        belege={belege}
        start={start}
        freigabe={<Freigabeleiste projektId={id} schluessel={b.schluessel} liste={b.liste} titel={t.kennung ?? t.text} />}
      />
    </>
  );
}
