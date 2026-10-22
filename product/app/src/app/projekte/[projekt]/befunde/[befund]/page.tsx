// Befund mit Beleg-Panel: Betrag, Kürzungsrisiko, Rechenweg, Beweiskette, zweistufige Freigabe;
// rechts das Original mit markierter Fundstelle.

import { Info, TriangleAlert } from "lucide-react";
import type { Metadata } from "next";
import { befund, befundSlug, firma, projekt, projektIds } from "@/daten/demo";
import type { DokumentArt } from "@/domain/typen";
import { prozentText } from "@/engine/geld";
import { KUERZUNGSGRUND_TEXT, type Beleg } from "@/engine";
import { ART_TEXT, LISTEN, teileTitel } from "@/ui/befund-texte";
import { Befundflaeche, type BelegAnsicht, type BelegTyp } from "@/ui/Befundflaeche";
import { Belegseite, belegDatei } from "@/ui/Belegseite";
import { betrag, datum } from "@/ui/format";
import { Freigabeleiste } from "@/ui/Freigabeleiste";
import { Ico } from "@/ui/Ico";
import { Seitenkopf } from "@/ui/Seitenkopf";

type Props = { params: Promise<{ projekt: string; befund: string }> };

export const dynamicParams = false;
export function generateStaticParams() {
  return projektIds().flatMap(({ projekt: id }) => projekt(id).e.befunde.map((b) => ({ projekt: id, befund: befundSlug(b.schluessel) })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { projekt: id, befund: slug } = await params;
  const { d, b } = befund(id, slug);
  return { title: `${d.projekt.kurz} ${b.titel}` };
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

  // Belege des Befunds, dazu nur die Belege des Kürzungsrisikos aus Dokumenten, die der Befund noch nicht zeigt
  // (z. B. Stundenliste); nach Datum, Belege ohne Datum am Ende
  const imBefund = new Set(b.belege.map((x) => x.quelle.dokumentId));
  const dazu = (risiko?.belege ?? []).filter((x, i, l) => !imBefund.has(x.quelle.dokumentId) && l.findIndex((y) => y.quelle.dokumentId === x.quelle.dokumentId) === i);
  const alle: Beleg[] = [...b.belege, ...dazu].sort((x, y) => (x.datum ?? "9999").localeCompare(y.datum ?? "9999"));

  const belege: BelegAnsicht[] = alle.map((x, i) => {
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
  // Start beim aussagekräftigsten Beleg: Aufmaß oder Bericht, sonst der erste, der nicht das LV ist
  const start = Math.max(
    0,
    belege.findIndex((x) => x.typ === "aufmass" || x.typ === "tabelle") >= 0
      ? belege.findIndex((x) => x.typ === "aufmass" || x.typ === "tabelle")
      : belege.findIndex((x) => x.typ !== "lv"),
  );

  const schritte = (b.rechenweg?.schritte ?? []).filter((s) => !s.summe && s.betrag !== 0);
  const summe = b.rechenweg?.schritte.find((s) => s.summe);
  const nurBetrag = (wert: string, cent?: number) => cent !== undefined && wert.replace(/\s/g, "") === betrag(cent).replace(/\s/g, "");

  const kopf = (
    <>
      <div className="fhead">
        <div className="sw-row">
          <span className={liste.ton === "neutral" ? "sw-dotlabel" : `sw-dotlabel sw-dotlabel--${liste.ton}`}>{liste.text}</span>
          <span className="meta sw-muted">{ART_TEXT[b.art]}</span>
        </div>
        <h2 className="page-title">
          {t.kennung && <span className="sw-pos-nr">{t.kennung}</span>}
          {t.text}
        </h2>
        {b.betrag !== null && <span className="kpi">{betrag(b.betrag)}</span>}
      </div>
      {risiko && (
        <div className="flag flag--warn">
          <Ico icon={TriangleAlert} />
          <div>
            <b>
              Kürzungsrisiko {betrag(risiko.betrag)}, {KUERZUNGSGRUND_TEXT[risiko.grund]}
            </b>
            <span>{risiko.detail}</span>
            <span>{risiko.abhilfe}</span>
          </div>
        </div>
      )}
      {hinweis && (
        <div className="flag">
          <Ico icon={Info} />
          <div>
            <b>Mengenänderung +{prozentText(hinweis.aenderung)}</b>
            <span>{hinweis.text}</span>
          </div>
        </div>
      )}
      {b.rechenweg && (
        <table className="sw-table tab-liste rechenweg">
          <thead>
            <tr>
              <th>Rechenweg</th>
              <th className="r">Ansatz</th>
              <th className="r">Betrag</th>
            </tr>
          </thead>
          <tbody>
            {schritte.map((s) => (
              <tr key={s.bezeichnung}>
                <td>{s.bezeichnung}</td>
                <td className="r calc">{nurBetrag(s.wert, s.betrag) ? "" : s.wert}</td>
                <td className="r">{s.betrag !== undefined && betrag(s.betrag)}</td>
              </tr>
            ))}
            <tr className="sum">
              <td>Betrag</td>
              <td className="r calc">{summe?.wert ?? ""}</td>
              <td className="r">{b.betrag !== null && betrag(b.betrag)}</td>
            </tr>
          </tbody>
        </table>
      )}
      {b.rechenweg?.plausibilitaet && <p className="meta sw-muted plain">{b.rechenweg.plausibilitaet}</p>}
    </>
  );

  return (
    <>
      <Seitenkopf
        pfad={[
          { text: daten.firma.name, href: "/" },
          { text: d.projekt.kurz, href: `/projekte/${id}/` },
          { text: "Befunde", href: `/projekte/${id}/befunde` },
        ]}
        titel={t.kennung ?? ART_TEXT[b.art]}
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
