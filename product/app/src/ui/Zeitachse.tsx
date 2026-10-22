"use client";

// Zeitachse (Vorlage: Linear-Aktivität mit Symbol auf der Linie, Attio-Zeitleiste mit Monatsköpfen, Linear-Filter
// als Reiter mit Zähler). Neueste zuerst; jeder Eintrag öffnet seinen Beleg im Original.

import { FileText, Image as Bild, Mail, Map as Karte, MessageCircle, Receipt, Ruler, Smartphone, Wrench, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Ereignis, EreignisArt } from "@/daten/zeitachse";
import { Ico } from "./Ico";
import { zeigeToast } from "./Toast";
import { ZurufSzene, type SzeneZuruf } from "./ZurufSzene";

const SYMBOL: Record<EreignisArt, LucideIcon> = {
  zuruf: MessageCircle,
  mail: Mail,
  regie: Wrench,
  aufmass: Ruler,
  plan: Karte,
  foto: Bild,
  rechnung: Receipt,
  vertrag: FileText,
};

type Filter = "alle" | "befund" | EreignisArt;

const FILTER: { f: Filter; text: string }[] = [
  { f: "alle", text: "Alle" },
  { f: "befund", text: "Mit Befund" },
  { f: "zuruf", text: "Zurufe" },
  { f: "mail", text: "Mails" },
  { f: "regie", text: "Regie" },
  { f: "aufmass", text: "Aufmaß" },
  { f: "plan", text: "Pläne" },
  { f: "foto", text: "Fotos" },
  { f: "rechnung", text: "Rechnungen" },
];

const MONAT = ["Jänner", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

function passt(e: Ereignis, f: Filter): boolean {
  return f === "alle" || (f === "befund" ? e.befunde > 0 : e.art === f);
}

export function Zeitachse({ ereignisse, basis, szene }: { ereignisse: Ereignis[]; basis: string; szene?: SzeneZuruf }) {
  const [filter, setFilter] = useState<Filter>("alle");
  // Während die Szene läuft, fehlt ihr Zuruf in der Zeitachse; nach „Ja“ erscheint er markiert.
  const [spielt, setSpielt] = useState(false);
  const [neu, setNeu] = useState<string | null>(null);
  const sichtbar = ereignisse.filter((e) => passt(e, filter) && !(spielt && e.id === szene?.id));

  useEffect(() => {
    if (neu) document.querySelector(`[data-id="${neu}"]`)?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [neu]);

  const monate: { key: string; titel: string; liste: Ereignis[] }[] = [];
  for (const e of sichtbar) {
    const key = e.zeit.slice(0, 7);
    if (monate.at(-1)?.key !== key) monate.push({ key, titel: `${MONAT[Number(key.slice(5, 7)) - 1]} ${key.slice(0, 4)}`, liste: [] });
    monate.at(-1)!.liste.push(e);
  }

  return (
    <section className="zeit" aria-label="Zeitachse">
      <div className="zeit-leiste">
      <div className="sw-tabs zeit-filter" role="tablist" aria-label="Filter">
        {FILTER.map(({ f, text }) => {
          const n = ereignisse.filter((e) => passt(e, f)).length;
          if (n === 0) return null;
          return (
            <button key={f} type="button" role="tab" className="sw-tab" aria-selected={filter === f} onClick={() => setFilter(f)}>
              {text}
              <span className="sw-count">{n}</span>
            </button>
          );
        })}
      </div>
        {szene && (
          <button
            type="button"
            className="sw-btn sw-btn--sm"
            onClick={() => {
              setNeu(null);
              setSpielt(true);
            }}
          >
            <Ico icon={Smartphone} />
            Zuruf vorspielen
          </button>
        )}
      </div>
      {spielt && szene && (
        <ZurufSzene
          z={szene}
          onZu={() => setSpielt(false)}
          onJa={() => {
            setSpielt(false);
            setFilter((f) => (f === "alle" || f === "zuruf" ? f : "alle"));
            setNeu(szene.id);
            zeigeToast(`Zuruf ${szene.nr} in der Zeitachse`);
          }}
        />
      )}
      {monate.map((m) => (
        <div key={m.key} className="zeit-monat">
          <h3 className="zeit-monat__kopf label">
            {m.titel}
            <span className="sw-count">{m.liste.length}</span>
          </h3>
          <ol className="zeit-liste">
            {m.liste.map((e) => (
              <li key={e.id} className="zeit-ev" data-id={e.id} data-art={e.art} data-neu={e.id === neu || undefined}>
                <span className="zeit-ev__datum">
                  {e.zeit.slice(8, 10)}.{e.zeit.slice(5, 7)}.
                  {e.zeit.length > 10 && <span>{e.zeit.slice(11, 16)}</span>}
                </span>
                <span className="zeit-ev__knoten">
                  <Ico icon={SYMBOL[e.art]} />
                </span>
                <Link className="zeit-ev__inhalt" href={`${basis}/ordner/${e.id}`}>
                  <span className="zeit-ev__titel">
                    <b>{e.titel}</b>
                    {e.marke && <span className={e.marke.ton === "warn" ? "sw-dotlabel sw-dotlabel--warn zeit-ev__marke" : "sw-dotlabel zeit-ev__marke"}>{e.marke.text}</span>}
                  </span>
                  <span className="zeit-ev__text">{e.text}</span>
                </Link>
                <span className="zeit-ev__befund">{e.befunde > 0 && (e.befunde === 1 ? "1 Befund" : `${e.befunde} Befunde`)}</span>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </section>
  );
}
