"use client";

// Suche (Strg K; Vorlage: Linear- und Attio-Befehlsfenster): springt zu Projekt, Bildschirm oder Posten.
// Durchsucht nur, was die Seitenleiste ohnehin kennt (klein, im Browser). Pfeiltasten wählen, Enter öffnet, Esc schließt.

import { ChevronRight, ListChecks, Search, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { NavProjekt } from "@/daten/demo";
import { Bauglyphe } from "./Bauglyphe";
import { Ico } from "./Ico";
import { projektNav } from "./Seitenleiste";

interface Treffer {
  gruppe: "Projekte" | "Bildschirme" | "Posten" | "Allgemein";
  text: string;
  zusatz?: string;
  href: string;
  bild: React.ReactNode;
  /** Kleingeschrieben, ohne Umlaute: worin gesucht wird. */
  heu: string;
}

const flach = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ß/g, "ss");

function alleTreffer(projekte: NavProjekt[], projektId: string | undefined): Treffer[] {
  const liste: Treffer[] = [];
  // Das Projekt, in dem man steht, zuerst.
  const reihe = [...projekte].sort((a, b) => Number(b.id === projektId) - Number(a.id === projektId));
  for (const p of reihe) {
    const glyphe = <Bauglyphe art={p.gebaeude} geschosse={p.geschosse} ruhig={!p.abgleich} />;
    liste.push({ gruppe: "Projekte", text: p.name, zusatz: p.kurz, href: `/projekte/${p.id}/`, bild: glyphe, heu: flach(`${p.name} ${p.kurz}`) });
    for (const e of projektNav(p).slice(1))
      liste.push({ gruppe: "Bildschirme", text: e.text, zusatz: p.name, href: e.href, bild: <Ico icon={e.icon} />, heu: flach(`${e.text} ${p.name} ${p.kurz}`) });
    for (const x of p.posten) liste.push({ gruppe: "Posten", text: x.titel, zusatz: p.kurz, href: x.href, bild: <Ico icon={ListChecks} />, heu: flach(`${x.titel} ${p.kurz}`) });
  }
  liste.push({ gruppe: "Allgemein", text: "Einstellungen", href: "/einstellungen/", bild: <Ico icon={Settings} />, heu: "einstellungen thema" });
  return liste;
}

export function Suche({ projekte, projektId, schliessen }: { projekte: NavProjekt[]; projektId?: string; schliessen: () => void }) {
  const router = useRouter();
  const [frage, setFrage] = useState("");
  const [wahl, setWahl] = useState(0);
  const eingabe = useRef<HTMLInputElement>(null);
  const listeRef = useRef<HTMLDivElement>(null);
  const alle = useMemo(() => alleTreffer(projekte, projektId), [projekte, projektId]);

  const treffer = useMemo(() => {
    const woerter = flach(frage).split(/\s+/).filter(Boolean);
    // Ohne Eingabe: Projekte und die Bildschirme des aktuellen Projekts.
    if (woerter.length === 0) return alle.filter((t) => t.gruppe === "Projekte" || (t.gruppe === "Bildschirme" && projektId && t.href.includes(`/${projektId}/`)));
    return alle.filter((t) => woerter.every((w) => t.heu.includes(w))).slice(0, 40);
  }, [alle, frage, projektId]);

  useEffect(() => {
    eingabe.current?.focus();
    const vorher = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = vorher;
    };
  }, []);
  useEffect(() => {
    listeRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
  }, [wahl]);

  const oeffnen = (t: Treffer | undefined) => {
    if (!t) return;
    schliessen();
    router.push(t.href);
  };

  return (
    <div className="suche" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && schliessen()}>
      <div className="suche__fenster" role="dialog" aria-modal="true" aria-label="Suchen">
        <div className="suche__feld">
          <Ico icon={Search} />
          <input
            ref={eingabe}
            id="suche-eingabe"
            value={frage}
            onChange={(e) => {
              setFrage(e.target.value);
              setWahl(0);
            }}
            placeholder="Projekt, Bildschirm oder Posten"
            aria-controls="suche-liste"
            aria-activedescendant={treffer[wahl] ? `suche-${wahl}` : undefined}
            autoComplete="off"
            spellCheck={false}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setWahl((w) => Math.min(w + 1, treffer.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setWahl((w) => Math.max(w - 1, 0));
              } else if (e.key === "Enter") {
                e.preventDefault();
                oeffnen(treffer[wahl]);
              } else if (e.key === "Escape") {
                e.preventDefault();
                schliessen();
              }
            }}
          />
          <span className="sw-kbd">Esc</span>
        </div>
        <div className="suche__liste" id="suche-liste" role="listbox" ref={listeRef}>
          {treffer.length === 0 && <p className="suche__leer">Nichts gefunden.</p>}
          {treffer.map((t, i) => {
            const kopf = i === 0 || treffer[i - 1].gruppe !== t.gruppe;
            return (
              <div key={`${t.href}-${i}`}>
                {kopf && <div className="suche__gruppe">{t.gruppe}</div>}
                <div
                  id={`suche-${i}`}
                  role="option"
                  aria-selected={i === wahl}
                  className="suche__treffer"
                  onMouseMove={() => setWahl(i)}
                  onClick={() => oeffnen(t)}
                >
                  {t.bild}
                  <span className="suche__text">{t.text}</span>
                  {t.zusatz && <span className="suche__zusatz">{t.zusatz}</span>}
                  {i === wahl && <Ico icon={ChevronRight} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
