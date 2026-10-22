"use client";

// Seitenleiste (Vorlage: Attio-Navigation hell, Linear: aktiver Eintrag als Fläche, Zähler rechts).
// Zwei Abschnitte: Firma (immer) und Projekt (sobald man in einem Projekt ist). Reihenfolge = Ablauf.
// Was es noch nicht gibt, ist sichtbar, aber deaktiviert mit Tooltip.

import {
  BookUser,
  ClipboardList,
  Download,
  FolderOpen,
  History,
  LayoutDashboard,
  LayoutList,
  ListChecks,
  ShieldCheck,
  SunMoon,
  Table,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavProjekt } from "@/daten/demo";
import { Ico } from "./Ico";
import { themaWechseln } from "./thema";

interface Eintrag {
  href: string;
  icon: LucideIcon;
  text: string;
  zaehler?: number;
  /** Grund, warum der Eintrag noch nicht geht (Tooltip). */
  folgt?: string;
  /** Aktiv auch auf Unterseiten. */
  praefix?: boolean;
}

function NavLink({ e, pfad }: { e: Eintrag; pfad: string }) {
  const aktiv = e.praefix ? pfad === e.href || pfad.startsWith(`${e.href}/`) : pfad === e.href;
  const inhalt = (
    <>
      <Ico icon={e.icon} />
      {e.text}
      {e.zaehler !== undefined && <span className="sw-count">{e.zaehler.toLocaleString("de-AT")}</span>}
    </>
  );
  if (e.folgt) {
    return (
      <a aria-disabled="true" title={e.folgt} role="link" tabIndex={0} onClick={(ev) => ev.preventDefault()}>
        {inhalt}
      </a>
    );
  }
  return (
    <Link href={e.href} aria-current={aktiv ? "page" : undefined}>
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
        { href: `${basis}/befunde`, icon: ListChecks, text: "Befunde", zaehler: p.befunde, praefix: true, folgt: p.abgleich ? "Befunde mit Beleg-Panel folgen im nächsten Schritt" : "Kein Abgleich: Schlussrechnung gelegt oder abgeschlossen" },
        { href: `${basis}/vorpruefung`, icon: ShieldCheck, text: "Vorprüfung aus GU-Sicht", zaehler: p.risiken, folgt: "Vorprüfung folgt in v1.0" },
        { href: `${basis}/schlussbesprechung`, icon: ClipboardList, text: "Schlussbesprechung", folgt: "Schlussbesprechungs-Blatt folgt in v1.0" },
        { href: `${basis}/export`, icon: Download, text: "Export", folgt: "Export folgt in v1.0" },
      ]
    : [];

  return (
    <aside className="sw-sidebar">
      <div className="sw-brand">Schlusswerk</div>
      <div className="nav-group">
        <span className="label">Firma</span>
        <div className="sw-switch sw-switch--static">
          <span className="sw-switch__t">
            <b>{firma}</b>
            <span>{untertitel}</span>
          </span>
        </div>
        <nav className="sw-nav" aria-label="Firma">
          {firmaNav.map((e) => (
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
            {projektNav.map((e) => (
              <NavLink key={e.href} e={e} pfad={pfad} />
            ))}
          </nav>
        </div>
      )}
      <div className="nav-fill" />
      <nav className="sw-nav" aria-label="Darstellung">
        <button type="button" onClick={themaWechseln}>
          <Ico icon={SunMoon} />
          Hell / Dunkel
        </button>
      </nav>
    </aside>
  );
}
