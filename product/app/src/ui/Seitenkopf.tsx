// Seitenkopf (Vorlage: Linear-Kopfzeile, Attio 44–48 px): Pfad und Titel links, „Synthetisch“ und höchstens eine
// Primäraktion rechts. Was es noch nicht gibt, steht nicht da.

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
        {pfad.map((p) => (
          <Fragment key={p.text}>
            <span className="sw-crumb">{p.href ? <Link href={p.href}>{p.text}</Link> : p.text}</span>
            <span className="sw-crumb">/</span>
          </Fragment>
        ))}
        <h1>{titel}</h1>
      </div>
      <div className="sw-pagehead__actions">
        <span className="sw-synth" title="Synthetischer Datensatz: Firmen und Beträge erfunden, keine echten Funde">
          Synthetisch
        </span>
        {aktion}
      </div>
    </header>
  );
}
