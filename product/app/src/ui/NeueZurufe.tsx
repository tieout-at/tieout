"use client";

// Neue Zurufe aus dem echten Chat (Schalter ZURUF_ECHT im Worker an), gelesen aus dem Browser:
// Zeilen auf der Liste „offen“ (ohne Betrag: Stunden und Regiebericht klärt das Büro) und die Belegseite eines neuen
// Zurufs mit den Nachrichten im Original, jede Angabe mit ihrem Zitat.

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Angabe, Eintrag, Leistungsereignis, Nachricht } from "../../../zuruf/src/typen";
import { alsZuruf, offenText, type NeuerZuruf } from "@/zuruf/abbildung";
import { useNeueZurufe } from "@/zustand/zurufe";
import { zeitpunkt } from "./format";
import { GruppenTitel } from "./Gruppe";

const href = (basis: string, n: NeuerZuruf) => `${basis}/zuruf/?id=${encodeURIComponent(n.ereignis.id)}`;

/** Gruppe „Neu per Zuruf“ hinter „Angemeldet und offen“ in der Befundtabelle. Ohne neue Zurufe: nichts. */
export function NeueZurufZeilen({ projektId, basis }: { projektId: string; basis: string }) {
  const neue = useNeueZurufe(projektId, true);
  if (!neue.length) return null;
  return (
    <tbody data-gruppe="zuruf-neu">
      <tr className="grp">
        <td>
          <GruppenTitel>
            <span className="sw-dotlabel sw-dotlabel--warn">Neu per Zuruf, ohne Betrag</span>
            <span className="sw-count">{neue.length}</span>
          </GruppenTitel>
        </td>
        <td className="befund-art nur-breit" />
        <td className="r" />
        <td className="nur-breit" />
        <td className="nur-breit" />
      </tr>
      {neue.map((n) => {
        const z = alsZuruf(n);
        const ziel = href(basis, n);
        return (
          <tr key={z.id} data-href={ziel} tabIndex={0}>
            <td title={z.taetigkeit.wert}>
              <span className="sw-pos-nr">{z.nr}</span>
              <Link href={ziel} className="row-link" tabIndex={-1}>
                {z.taetigkeit.wert}
              </Link>
            </td>
            <td className="befund-art neben nur-breit">Zuruf</td>
            <td className="r" />
            <td className="risk nur-breit" />
            <td className="nur-breit sw-muted" title={`Offen: ${offenText(n.ereignis)}`}>
              Regiebericht fehlt
            </td>
          </tr>
        );
      })}
    </tbody>
  );
}

const ANGABEN: [keyof Eintrag, string][] = [
  ["projektId", "Baustelle"],
  ["ort", "Ort"],
  ["leistung", "Leistung"],
  ["menge", "Menge"],
  ["personen", "Leute"],
  ["dauerStunden", "Stunden"],
  ["angewiesenVon", "Angewiesen von"],
  ["datum", "Datum"],
  ["material", "Material"],
  ["grund", "Grund"],
];

function wert(a: Angabe<unknown>, kurz: Record<string, string>, feld: keyof Eintrag): string {
  if (feld === "projektId") return kurz[String(a.wert)] ?? String(a.wert);
  if (feld === "menge") {
    const m = a.wert as { wert: number; einheit: string };
    return `${String(m.wert).replace(".", ",")} ${m.einheit}`;
  }
  return String(a.wert).replace(".", ",");
}

/** Zitate in einer Nachricht markieren (gleiche Markierung wie auf den Belegseiten). */
function MitZitaten({ text, zitate }: { text: string; zitate: string[] }) {
  const treffer = zitate
    .map((z) => ({ z, i: text.toLowerCase().indexOf(z.toLowerCase()) }))
    .filter((t) => t.z && t.i >= 0)
    .sort((a, b) => a.i - b.i);
  const teile: React.ReactNode[] = [];
  let pos = 0;
  for (const { z, i } of treffer) {
    if (i < pos) continue;
    teile.push(text.slice(pos, i), <span key={i} className="sw-mark">{text.slice(i, i + z.length)}</span>);
    pos = i + z.length;
  }
  teile.push(text.slice(pos));
  return <>{teile}</>;
}

function Chat({ e, nachrichten, absender }: { e: Leistungsereignis; nachrichten: Nachricht[]; absender: string }) {
  const zitate = Object.values(e.eintrag).map((a) => (a as Angabe<unknown>).zitat);
  return (
    <div className="chat">
      <div className="chat__kopf">
        <b>{absender}</b>
        <span>WhatsApp, {zeitpunkt(e.erfasst.slice(0, 16))}</span>
      </div>
      {nachrichten.map((m) => (
        <div key={m.id} className={m.art === "knopf" ? "chat__msg chat__msg--aus chat__msg--kurz" : "chat__msg chat__msg--aus"}>
          {m.art === "foto" && <span className="chat__label">Foto, Beschreibung</span>}
          <span>
            <MitZitaten text={m.inhalt} zitate={zitate} />
          </span>
          <span className="chat__zeit">{m.zeit.slice(11, 16)}</span>
        </div>
      ))}
    </div>
  );
}

/** Belegseite eines neuen Zurufs: links die Angaben mit Zitat, rechts die Nachrichten im Original. */
export function NeuerZurufBeleg({ projektId, kurz }: { projektId: string; kurz: Record<string, string> }) {
  const id = useSearchParams().get("id");
  const n = useNeueZurufe(projektId, true).find((x) => x.ereignis.id === id);
  if (!n) {
    return (
      <main className="scr-body">
        <p className="sw-muted">Dieser Zuruf liegt nicht in diesem Browser.</p>
      </main>
    );
  }
  const z = alsZuruf(n);
  const e = n.ereignis;
  const fakten: [string, string][] = [
    ["Art", "Zuruf"],
    ["Kanal", "WhatsApp, Demo-Chat"],
    ["Absender", z.absender],
    ["Zeitpunkt", zeitpunkt(z.zeitpunkt)],
    ["Stand", e.status === "bestaetigt" ? "Vom Absender bestätigt" : "Nicht bestätigt"],
    ["Offen", offenText(e)],
    ...(e.version > 1 ? ([["Fassung", `${e.version}, ersetzt die vorige`]] as [string, string][]) : []),
  ];
  return (
    <div className="split">
      <div className="split-left">
        <div className="split-scroll">
          <div className="fhead">
            <h2 className="section-title">{z.taetigkeit.wert}</h2>
          </div>
          <div className="kv">
            {fakten.map(([k, v]) => (
              <div key={k}>
                <span>{k}</span>
                <b>{v}</b>
              </div>
            ))}
          </div>
          <section className="sw-stack" aria-label="Angaben mit Zitat">
            <span className="label">Angaben mit Zitat</span>
            <div className="kv">
              {ANGABEN.filter(([f]) => e.eintrag[f]).map(([f, name]) => {
                const a = e.eintrag[f] as Angabe<unknown>;
                return (
                  <div key={f} title={`„${a.zitat}“`}>
                    <span>{name}</span>
                    <b>{wert(a, kurz, f)}</b>
                  </div>
                );
              })}
            </div>
          </section>
          {e.hinweise.length > 0 && (
            <section className="sw-stack" aria-label="Hinweise">
              <span className="label">Hinweise</span>
              {e.hinweise.map((h) => (
                <p key={h} className="sw-muted">
                  {h}
                </p>
              ))}
            </section>
          )}
        </div>
      </div>
      <div className="split-right">
        <div className="sw-viewer">
          <div className="sw-viewer__bar">
            <span className="sw-viewer__file">{`WhatsApp ${z.nr}`}</span>
          </div>
          <div className="sw-viewer__body beleg-body">
            <div className="sw-viewer__canvas">
              <div className="doc-zoom">
                <div className="sw-page sw-page--chat">
                  <span className="sw-page__synth">Synthetisch</span>
                  <Chat e={e} nachrichten={n.nachrichten} absender={z.absender} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
