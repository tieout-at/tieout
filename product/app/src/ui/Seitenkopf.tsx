// Seitenkopf (Vorlage: Linear-Kopfzeile, Attio 44–48 px): Pfad und Titel links, höchstens eine Primäraktion rechts.
// Was es noch nicht gibt, steht nicht da. Die Kennzeichnung „Beispieldaten“ steht seit 23.10. unten in der Seitenleiste.

import Link from "next/link";
import { Fragment } from "react";

export interface Pfadteil {
  text: string;
  href?: string;
}

export function Seitenkopf({ pfad, titel, aktion }: { pfad: Pfadteil[]; titel: string; aktion?: React.ReactNode }) {
  return (
    <header className="sw-pagehead">
      <div className="sw-pagehead__path">
        {pfad.map((p) => {
          // Am Handy bleibt nur das Projekt im Pfad stehen (Kurzzeichen vor dem Titel).
          const klasse = p.href && /^\/projekte\/[^/]+\/?$/.test(p.href) ? "sw-crumb sw-crumb--projekt" : "sw-crumb";
          return (
            <Fragment key={p.text}>
              <span className={klasse}>{p.href ? <Link href={p.href}>{p.text}</Link> : p.text}</span>
              <span className={klasse}>/</span>
            </Fragment>
          );
        })}
        <h1>{titel}</h1>
      </div>
      <div className="sw-pagehead__actions">
        {aktion}
      </div>
    </header>
  );
}
