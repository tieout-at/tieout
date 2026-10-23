"use client";

// Seitenleiste (UI-Runde 1, Option C „Bauglyphe“, Entscheidung Maxi S. 23.10.; Vorlage: Linear „Your teams“, Attio-Navigation).
// Oben Marke und Firma als Arbeitsbereich, darunter Suche (Strg K), dann die Projekte in zwei Gruppen: im Abgleich
// und abgeschlossen. Jedes Projekt trägt seine Bauglyphe und klappt seine Bildschirme auf. Nur ein Zähler: offene Posten.
// Eingeklappt bleibt eine schmale Leiste mit den Glyphen; am Handy wird die Leiste eine Schublade.
// Nur was gebaut ist, steht in der Navigation; Einträge mit `folgt` werden ausgeblendet.

import {
  ChevronRight,
  ChevronsUpDown,
  FileText,
  FolderOpen,
  History,
  LayoutGrid,
  ListChecks,
  Menu,
  Moon,
  PanelLeft,
  Search,
  Settings,
  Table,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { NavProjekt } from "@/daten/demo";
import { anzeigename, initialen, useNutzer } from "@/anmeldung/client";
import { standAus } from "@/zustand/freigabe";
import { useVerlauf } from "@/zustand/speicher";
import { Bauglyphe } from "./Bauglyphe";
import { Ico } from "./Ico";
import { LogoMark, Wortmarke } from "./Logo";
import { Suche } from "./Suche";
import { navWechseln, themaWechseln, useNavZu } from "./thema";

interface Eintrag {
  href: string;
  icon: LucideIcon;
  text: string;
  /** Noch nicht gebaut: wird nicht angezeigt (Grund als Notiz für Entwickler). */
  folgt?: string;
  /** Aktiv auch auf Unterseiten. */
  praefix?: boolean;
  posten?: boolean;
}

/** Bildschirme eines Projekts in fester Reihenfolge; dieselbe Liste nutzt die Suche. */
export function projektNav(p: Pick<NavProjekt, "id" | "abgleich">): Eintrag[] {
  const basis = `/projekte/${p.id}`;
  const keinAbgleich = p.abgleich ? undefined : "Kein Abgleich: Schlussrechnung gelegt oder abgeschlossen";
  return [
    { href: `${basis}/`, icon: LayoutGrid, text: "Übersicht" },
    { href: `${basis}/posten/`, icon: ListChecks, text: "Posten", praefix: true, posten: true, folgt: keinAbgleich },
    { href: `${basis}/schlussrechnung/`, icon: FileText, text: "Schlussrechnung", folgt: "Schlussrechnung folgt in UI-Runde 1, Schritt 3b" },
    { href: `${basis}/belege/`, icon: FolderOpen, text: "Belege", praefix: true },
    { href: `${basis}/positionen/`, icon: Table, text: "LV-Positionen", folgt: keinAbgleich },
    { href: `${basis}/zeitachse/`, icon: History, text: "Zeitachse" },
  ].filter((e) => !e.folgt);
}

function istAktiv(e: Eintrag, pfad: string): boolean {
  const ziel = e.href.replace(/\/$/, "");
  const hier = pfad.replace(/\/$/, "");
  return e.praefix ? hier === ziel || hier.startsWith(`${ziel}/`) : hier === ziel;
}

/** Offene Posten: weder freigegeben noch verworfen (Stand aus dem Browser, wie „x von y freigegeben“). */
function OffenePosten({ p }: { p: NavProjekt }) {
  const verlauf = useVerlauf(p.id);
  const offen = p.entscheiden.filter((x) => {
    const s = standAus(verlauf, x.schluessel, x.liste);
    return s !== "freigegeben" && s !== "verworfen";
  }).length;
  if (offen === 0) return null;
  return (
    <span className="nav-pille" title={`${offen} Posten offen`}>
      {offen}
    </span>
  );
}

const FRIST = new Intl.DateTimeFormat("de-AT", { day: "2-digit", month: "2-digit" });
function fristText(iso: string): string {
  return FRIST.format(new Date(`${iso}T12:00:00`));
}

function ProjektZeile({ p, pfad, offen, umschalten }: { p: NavProjekt; pfad: string; offen: boolean; umschalten: () => void }) {
  const hier = pfad.startsWith(`/projekte/${p.id}/`) || pfad === `/projekte/${p.id}`;
  return (
    <div className="nav-projekt" data-hier={hier || undefined} data-offen={offen || undefined}>
      <div className="nav-projekt__zeile">
        <Link href={`/projekte/${p.id}/`} className="nav-projekt__kopf" title={p.name}>
          <Bauglyphe art={p.gebaeude} geschosse={p.geschosse} ruhig={!p.abgleich} dringend={!!p.frist} />
          <span className="nav-text">{p.name}</span>
          {p.frist && (
            <span className="nav-frist" title={`Schlussrechnung legen bis ${fristText(p.frist)}`}>
              {fristText(p.frist)}
            </span>
          )}
        </Link>
        <button type="button" className="nav-projekt__pfeil" onClick={umschalten} aria-expanded={offen} aria-label={`${p.name} ${offen ? "zuklappen" : "aufklappen"}`}>
          <Ico icon={ChevronRight} />
        </button>
      </div>
      {offen && (
        <div className="nav-sub">
          {projektNav(p).map((e) => (
            <Link key={e.href} href={e.href} aria-current={istAktiv(e, pfad) ? "page" : undefined} title={e.text}>
              <Ico icon={e.icon} />
              <span className="nav-text">{e.text}</span>
              {e.posten && <OffenePosten p={p} />}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function FirmaMenue({ firma, untertitel }: { firma: string; untertitel: string }) {
  const [auf, setAuf] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!auf) return;
    const weg = (ev: MouseEvent | KeyboardEvent) => {
      if (ev instanceof KeyboardEvent ? ev.key === "Escape" : !ref.current?.contains(ev.target as Node)) setAuf(false);
    };
    document.addEventListener("mousedown", weg);
    document.addEventListener("keydown", weg);
    return () => {
      document.removeEventListener("mousedown", weg);
      document.removeEventListener("keydown", weg);
    };
  }, [auf]);
  const kuerzel = firma
    .split(/\s+/)
    .filter((w) => /^[A-ZÄÖÜ]/.test(w) && !/^(GmbH|AG|KG|OG)$/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
  return (
    <div className="nav-firma" ref={ref}>
      <button type="button" className="nav-firma__knopf" onClick={() => setAuf(!auf)} aria-expanded={auf} aria-haspopup="menu" title={firma}>
        <span className="nav-firma__kachel" aria-hidden="true">
          {kuerzel}
        </span>
        <span className="nav-firma__text">
          <b>{firma}</b>
          <span>{untertitel}</span>
        </span>
        <Ico icon={ChevronsUpDown} />
      </button>
      {auf && (
        <div className="nav-menue" role="menu">
          <Link href="/einstellungen/" role="menuitem" onClick={() => setAuf(false)}>
            <Ico icon={Settings} />
            Einstellungen
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              themaWechseln();
              setAuf(false);
            }}
          >
            <Ico icon={Moon} />
            Hell oder dunkel
          </button>
          <p className="nav-menue__hinweis">Beispieldaten: Firmen, Projekte und Beträge sind erfunden.</p>
        </div>
      )}
    </div>
  );
}

export function Seitenleiste({ firma, untertitel, projekte }: { firma: string; untertitel: string; projekte: NavProjekt[] }) {
  const pfad = usePathname();
  const zu = useNavZu();
  const nutzer = useNutzer();
  const projektId = pfad.match(/^\/projekte\/([^/]+)/)?.[1];
  const imAbgleich = projekte.filter((p) => p.abgleich);
  const fertig = projekte.filter((p) => !p.abgleich);

  // Aufgeklappt ist immer das Projekt, in dem man steht; weitere klappt man selbst auf.
  const [offen, setOffen] = useState<Set<string>>(() => new Set(projektId ? [projektId] : []));
  const [fertigOffen, setFertigOffen] = useState(() => fertig.some((p) => p.id === projektId));
  const [suche, setSuche] = useState(false);
  const [schublade, setSchublade] = useState(false);

  // Beim Wechsel in ein anderes Projekt klappt es auf; am Handy schließt die Schublade nach jedem Seitenwechsel.
  // (Zustand während des Renderns anpassen statt im Effekt, React-Empfehlung.)
  const [letzterPfad, setLetzterPfad] = useState(pfad);
  if (pfad !== letzterPfad) {
    setLetzterPfad(pfad);
    setSchublade(false);
    if (projektId && !offen.has(projektId)) setOffen(new Set(offen).add(projektId));
    if (projektId && fertig.some((p) => p.id === projektId)) setFertigOffen(true);
  }
  useEffect(() => {
    const d = document.documentElement;
    if (schublade) d.dataset.schublade = "auf";
    else delete d.dataset.schublade;
  }, [schublade]);

  // Kurztasten: „[“ klappt die Seitenleiste ein und aus (Linear), Strg K oder Cmd K öffnet die Suche.
  useEffect(() => {
    const taste = (ev: KeyboardEvent) => {
      if ((ev.ctrlKey || ev.metaKey) && !ev.altKey && ev.key.toLowerCase() === "k") {
        ev.preventDefault();
        setSuche(true);
        return;
      }
      if (ev.key === "Escape") setSchublade(false);
      // „[“ liegt auf österreichischen Tastaturen auf AltGr+8 (Chromium meldet das als Strg+Alt).
      if (ev.key !== "[" || ev.metaKey || ev.repeat) return;
      if ((ev.ctrlKey || ev.altKey) && !ev.getModifierState("AltGraph") && !(ev.ctrlKey && ev.altKey)) return;
      if (ev.target instanceof Element && ev.target.closest("input, textarea, select")) return;
      navWechseln();
    };
    window.addEventListener("keydown", taste);
    return () => window.removeEventListener("keydown", taste);
  }, []);

  const umschalten = (id: string) =>
    setOffen((alt) => {
      const neu = new Set(alt);
      if (neu.has(id)) neu.delete(id);
      else neu.add(id);
      return neu;
    });

  const zeile = (p: NavProjekt) => <ProjektZeile key={p.id} p={p} pfad={pfad} offen={offen.has(p.id)} umschalten={() => umschalten(p.id)} />;

  return (
    <>
      <div className="sw-mobilkopf">
        <button type="button" className="nav-toggle" onClick={() => setSchublade(true)} aria-label="Navigation öffnen">
          <Ico icon={Menu} />
        </button>
        <Link href="/" className="sw-brand" aria-label="tieout">
          <LogoMark />
          <Wortmarke />
        </Link>
        <button type="button" className="nav-toggle" onClick={() => setSuche(true)} aria-label="Suchen">
          <Ico icon={Search} />
        </button>
      </div>
      <div className="sw-schleier" onClick={() => setSchublade(false)} aria-hidden="true" />
      <aside className="sw-sidebar" aria-label="Navigation">
        <div className="brand-row">
          <Link href="/" className="sw-brand" aria-label="tieout" title="tieout">
            <LogoMark />
            <Wortmarke />
          </Link>
          <button type="button" className="nav-toggle nav-toggle--breit" onClick={navWechseln} title="Seitenleiste ein- oder ausklappen ( [ )" aria-label="Seitenleiste ein- oder ausklappen" aria-expanded={!zu}>
            <Ico icon={PanelLeft} />
          </button>
          <button type="button" className="nav-toggle nav-toggle--handy" onClick={() => setSchublade(false)} aria-label="Navigation schließen">
            <Ico icon={X} />
          </button>
        </div>
        <FirmaMenue firma={firma} untertitel={untertitel} />
        <nav className="sw-nav" aria-label="Allgemein">
          <button type="button" className="nav-suche" onClick={() => setSuche(true)} title="Suchen (Strg K)">
            <Ico icon={Search} />
            <span className="nav-text">Suchen</span>
            <span className="sw-kbd nav-kbd">Strg K</span>
          </button>
        </nav>
        <nav className="nav-gruppe" aria-label="Projekte">
          <Link href="/" className="nav-gruppe__kopf" aria-current={pfad === "/" ? "page" : undefined}>
            <span className="nav-text">Projekte</span>
            <span className="sw-count">{imAbgleich.length}</span>
          </Link>
          <div className="sw-nav nav-baum">{imAbgleich.map(zeile)}</div>
        </nav>
        {fertig.length > 0 && (
          <nav className="nav-gruppe" aria-label="Abgeschlossen">
            <button type="button" className="nav-gruppe__kopf" onClick={() => setFertigOffen(!fertigOffen)} aria-expanded={fertigOffen}>
              <Ico icon={ChevronRight} />
              <span className="nav-text">Abgeschlossen</span>
              <span className="sw-count">{fertig.length}</span>
            </button>
            <div className="sw-nav nav-baum" data-zu={!fertigOffen || undefined}>
              {fertig.map(zeile)}
            </div>
          </nav>
        )}
        <div className="nav-fill" />
        <div className="nav-fuss">
          <span className="nav-beispiel" title="Synthetischer Datensatz: Firmen, Projekte und Beträge sind erfunden, keine echten Funde">
            <span className="nav-beispiel__raute" aria-hidden="true" />
            <span className="nav-text">Beispieldaten</span>
          </span>
          <Link href="/einstellungen/" className="nav-fuss__knopf" aria-current={pfad.startsWith("/einstellungen") ? "page" : undefined} title={nutzer ? anzeigename(nutzer) : "Einstellungen"} aria-label="Einstellungen">
            {nutzer ? <span className="avatar">{initialen(anzeigename(nutzer))}</span> : <Ico icon={Settings} />}
          </Link>
        </div>
      </aside>
      {suche && <Suche projekte={projekte} projektId={projektId} schliessen={() => setSuche(false)} />}
    </>
  );
}
