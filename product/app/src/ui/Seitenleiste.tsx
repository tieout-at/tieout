"use client";

// Seitenleiste (Vorlage: Attio-Navigation hell, Linear: aktiver Eintrag als Fläche, Zähler rechts).
// Zwei Abschnitte: Firma (immer) und Projekt (sobald man in einem Projekt ist). Reihenfolge = Ablauf.
// Nur was gebaut ist, steht in der Navigation (Linear, Attio); Einträge mit `folgt` werden ausgeblendet.

import {
  BookUser,
  ClipboardList,
  Download,
  FolderOpen,
  History,
  LayoutDashboard,
  LayoutList,
  ListChecks,
  PanelLeft,
  RotateCcw,
  ShieldCheck,
  SunMoon,
  Table,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavProjekt } from "@/daten/demo";
import { Ico } from "./Ico";
import { navWechseln, themaWechseln } from "./thema";
import { zeigeToast } from "./Toast";
import { allesZuruecksetzen } from "@/zustand/speicher";
import { useEffect } from "react";

interface Eintrag {
  href: string;
  icon: LucideIcon;
  text: string;
  zaehler?: number;
  /** Noch nicht gebaut: wird nicht angezeigt (Grund als Notiz für Entwickler). */
  folgt?: string;
  /** Aktiv auch auf Unterseiten. */
  praefix?: boolean;
}

function NavLink({ e, pfad }: { e: Eintrag; pfad: string }) {
  const aktiv = e.praefix ? pfad === e.href || pfad.startsWith(`${e.href}/`) : pfad === e.href;
  const inhalt = (
    <>
      <Ico icon={e.icon} />
      <span className="nav-text">{e.text}</span>
      {e.zaehler !== undefined && <span className="sw-count">{e.zaehler.toLocaleString("de-AT")}</span>}
    </>
  );
  return (
    <Link href={e.href} aria-current={aktiv ? "page" : undefined} title={e.text}>
      {inhalt}
    </Link>
  );
}

export function Seitenleiste({
  firma,
  untertitel,
  auftraggeber,
  projekte,
}: {
  firma: string;
  untertitel: string;
  auftraggeber: number;
  projekte: NavProjekt[];
}) {
  const pfad = usePathname();

  // Kurztaste „[“ klappt die Seitenleiste ein und aus (Linear); nicht mit Strg, Alt, Cmd oder in Eingabefeldern.
  useEffect(() => {
    const taste = (ev: KeyboardEvent) => {
      if (ev.key !== "[" || ev.ctrlKey || ev.altKey || ev.metaKey || ev.repeat) return;
      if (ev.target instanceof Element && ev.target.closest("input, textarea, select")) return;
      navWechseln();
    };
    window.addEventListener("keydown", taste);
    return () => window.removeEventListener("keydown", taste);
  }, []);
  const projektId = pfad.match(/^\/projekte\/([^/]+)/)?.[1];
  const p = projekte.find((x) => x.id === projektId);

  const firmaNav: Eintrag[] = [
    { href: "/", icon: LayoutList, text: "Projekte", zaehler: projekte.length },
    { href: "/auftraggeber", icon: BookUser, text: "Auftraggeber", zaehler: auftraggeber, folgt: "Auftraggeber mit Historie folgen in v1.0" },
  ];
  const basis = p ? `/projekte/${p.id}` : "";
  const projektNav: Eintrag[] = p
    ? [
        { href: basis, icon: LayoutDashboard, text: "Übersicht" },
        { href: `${basis}/ordner`, icon: FolderOpen, text: "Ordner", zaehler: p.dokumente, folgt: "Ordner folgt in Phase 2" },
        { href: `${basis}/ledger`, icon: Table, text: "Ledger", zaehler: p.ledger, folgt: "Ledger folgt in Phase 2" },
        { href: `${basis}/zeitachse`, icon: History, text: "Zeitachse", folgt: "Zeitachse folgt in Phase 2" },
        { href: `${basis}/befunde`, icon: ListChecks, text: "Befunde", zaehler: p.befunde, praefix: true, folgt: p.abgleich ? undefined : "Kein Abgleich: Schlussrechnung gelegt oder abgeschlossen" },
        { href: `${basis}/vorpruefung`, icon: ShieldCheck, text: "Vorprüfung aus GU-Sicht", zaehler: p.risiken, folgt: "Vorprüfung folgt in v1.0" },
        { href: `${basis}/schlussbesprechung`, icon: ClipboardList, text: "Schlussbesprechung", folgt: "Schlussbesprechungs-Blatt folgt in v1.0" },
        { href: `${basis}/export`, icon: Download, text: "Export", folgt: "Export folgt in v1.0" },
      ]
    : [];

  return (
    <aside className="sw-sidebar">
      <div className="brand-row">
        <div className="sw-brand">
          <span className="brand-mark" aria-hidden="true">
            S
          </span>
          <span className="brand-name">Schlusswerk</span>
        </div>
        <button type="button" className="nav-toggle" onClick={navWechseln} title="Seitenleiste ein- oder ausklappen ( [ )" aria-label="Seitenleiste ein- oder ausklappen">
          <Ico icon={PanelLeft} />
        </button>
      </div>
      <div className="nav-group">
        <span className="label">Firma</span>
        <div className="sw-switch sw-switch--static">
          <span className="sw-switch__t">
            <b>{firma}</b>
            <span>{untertitel}</span>
          </span>
        </div>
        <nav className="sw-nav" aria-label="Firma">
          {firmaNav.filter((e) => !e.folgt).map((e) => (
            <NavLink key={e.href} e={e} pfad={pfad} />
          ))}
        </nav>
      </div>
      {p && (
        <div className="nav-group">
          <span className="label">Projekt</span>
          <div className="sw-switch sw-switch--static">
            <span className="sw-switch__t">
              <b>{p.name}</b>
              <span>{p.los}</span>
            </span>
          </div>
          <nav className="sw-nav" aria-label="Projekt">
            {projektNav.filter((e) => !e.folgt).map((e) => (
              <NavLink key={e.href} e={e} pfad={pfad} />
            ))}
          </nav>
        </div>
      )}
      <div className="nav-fill" />
      <nav className="sw-nav" aria-label="Demo und Darstellung">
        <button
          type="button"
          title="Alle Freigaben dieser Demo im Browser löschen"
          onClick={() => {
            allesZuruecksetzen();
            zeigeToast("Demo zurückgesetzt");
          }}
        >
          <Ico icon={RotateCcw} />
          <span className="nav-text">Demo zurücksetzen</span>
        </button>
        <button type="button" onClick={themaWechseln} title="Hell / Dunkel">
          <Ico icon={SunMoon} />
          <span className="nav-text">Hell / Dunkel</span>
        </button>
      </nav>
    </aside>
  );
}
