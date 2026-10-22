"use client";

// Zeitachse (Vorlage: Linear-Aktivität mit Symbol auf der Linie, Attio-Zeitleiste mit Monatsköpfen, Linear-Filter
// als Reiter mit Zähler). Neueste zuerst; jeder Eintrag öffnet seinen Beleg im Original.

import { FileText, Image as Bild, Mail, Map as Karte, MessageCircle, Receipt, Ruler, Smartphone, Wrench, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Ereignis, EreignisArt } from "@/daten/zeitachse";
import { alsZuruf, type NeuerZuruf } from "@/zuruf/abbildung";
import { useZurufVerfuegbar } from "@/zuruf/schalter";
import { useNeueZurufe } from "@/zustand/zurufe";
import { Ico } from "./Ico";
import { zeigeToast } from "./Toast";
import { ZurufChat } from "./ZurufChat";
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

/** Neuer Zuruf aus dem Browser als Ereignis, beschriftet wie die Zurufe der Demo. */
function alsEreignis(n: NeuerZuruf): Ereignis {
  const z = alsZuruf(n);
  return { id: z.id, zeit: z.zeitpunkt, art: "zuruf", titel: z.taetigkeit.wert, text: `Zuruf ${z.nr}, ${z.absender}`, marke: { text: "Offen", ton: "warn" }, befunde: 0 };
}

/** Für den echten Chat (Schalter ZURUF_ECHT im Worker): Projekt, Zahl der Demo-Zurufe und Kurznamen je Projekt. */
export interface ZurufEcht {
  projektId: string;
  demoAnzahl: Record<string, number>;
  kurz: Record<string, string>;
}

export function Zeitachse({ ereignisse: vorberechnet, basis, szene, echt }: { ereignisse: Ereignis[]; basis: string; szene?: SzeneZuruf; echt?: ZurufEcht }) {
  // Echter Agent nur, wenn der Worker ihn als verfügbar meldet; sonst (und bis zur Antwort) die vorgespielte Szene.
  const [verfuegbar, abschalten] = useZurufVerfuegbar(!!echt);
  // Neue Zurufe liegen im Browser und kommen zu den vorberechneten Ereignissen dazu.
  const neue = useNeueZurufe(echt?.projektId ?? "", !!echt);
  const neuIds = new Map(neue.map((n) => [alsZuruf(n).id, n.ereignis.id]));
  const ereignisse = neue.length
    ? [...vorberechnet, ...neue.map(alsEreignis)].sort((a, b) => b.zeit.localeCompare(a.zeit) || a.id.localeCompare(b.id))
    : vorberechnet;
  const [chat, setChat] = useState(false);
  const [filter, setFilter] = useState<Filter>("alle");
  // Während die Szene läuft, fehlt ihr Zuruf in der Zeitachse; nach „Ja“ erscheint er markiert.
  const [spielt, setSpielt] = useState(false);
  const [neu, setNeu] = useState<string | null>(null);
  const ausloeser = useRef<HTMLButtonElement>(null);
  const sichtbar = ereignisse.filter((e) => passt(e, filter) && !(spielt && e.id === szene?.id));

  useEffect(() => {
    if (!neu) return;
    const el = document.querySelector<HTMLElement>(`[data-id="${neu}"]`);
    el?.scrollIntoView({ block: "center", behavior: "smooth" });
    el?.querySelector<HTMLElement>("a")?.focus({ preventScroll: true });
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
      <div className="sw-tabs zeit-filter" role="group" aria-label="Filter">
        {FILTER.map(({ f, text }) => {
          const n = ereignisse.filter((e) => passt(e, f)).length;
          if (n === 0) return null;
          return (
            <button key={f} type="button" className="sw-tab" aria-pressed={filter === f} onClick={() => setFilter(f)}>
              {text}
              <span className="sw-count">{n}</span>
            </button>
          );
        })}
      </div>
        {verfuegbar && echt ? (
          <button
            ref={ausloeser}
            type="button"
            className="sw-btn sw-btn--sm"
            onClick={() => {
              setNeu(null);
              setChat(true);
            }}
          >
            <Ico icon={Smartphone} />
            Zuruf schicken
          </button>
        ) : szene && (
          <button
            ref={ausloeser}
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
      {chat && echt && (
        <ZurufChat
          projektId={echt.projektId}
          demoAnzahl={echt.demoAnzahl}
          kurz={echt.kurz}
          onZu={() => {
            setChat(false);
            ausloeser.current?.focus();
          }}
          onAus={() => {
            // Grenze erreicht oder Agent nicht erreichbar: ohne Meldung die vorgespielte Fassung.
            setChat(false);
            abschalten();
            if (szene) setSpielt(true);
          }}
          onNeu={(id, nr, projekt) => {
            if (projekt !== echt.projektId) return zeigeToast(`Zuruf ${nr} in ${echt.kurz[projekt] ?? projekt} abgelegt`);
            setFilter((f) => (f === "alle" || f === "zuruf" ? f : "alle"));
            setNeu(id);
            zeigeToast(`Zuruf ${nr} in der Zeitachse`);
          }}
        />
      )}
      {spielt && szene && (
        <ZurufSzene
          z={szene}
          onZu={() => {
            setSpielt(false);
            ausloeser.current?.focus();
          }}
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
                <Link className="zeit-ev__inhalt" href={neuIds.has(e.id) ? `${basis}/zuruf/?id=${encodeURIComponent(neuIds.get(e.id)!)}` : `${basis}/ordner/${e.id}`}>
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
