// Seitenkopf (Vorlage: Linear-Kopfzeile, Attio 44–48 px): Pfad und Titel links, „Synthetisch“ und Aktionen rechts.

import { Download } from "lucide-react";
import Link from "next/link";
import { Fragment } from "react";
import { Ico } from "./Ico";

export interface Pfadteil {
  text: string;
  href?: string;
}

export function Seitenkopf({ pfad, titel, export: mitExport = false }: { pfad: Pfadteil[]; titel: string; export?: boolean }) {
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
        <span className="sw-synth" title="Synthetischer Demo-Datensatz: Firmen und Beträge erfunden, keine echten Funde">
          Synthetisch
        </span>
        {mitExport && (
          <>
            <button className="sw-btn sw-btn--sm" type="button" aria-disabled="true" title="Excel-Export folgt in v1.0">
              <Ico icon={Download} />
              Excel
            </button>
            <button className="sw-btn sw-btn--sm" type="button" aria-disabled="true" title="Bericht folgt in v1.0">
              Bericht
            </button>
          </>
        )}
      </div>
    </header>
  );
}
