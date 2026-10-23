// Neutrale Zeile aus der GU-Historie: derselbe Auftraggeber hat aus demselben Grund schon in einem anderen Projekt
// gekürzt oder abgezogen. Nur Fakt mit Sprung zum Original dort, keine Bewertung des Auftraggebers.
// Mit „ohneLink“ als reiner Text, wo die Zeile schon in einem Link steht (Karte der Vorprüfung).

import { History } from "lucide-react";
import Link from "next/link";
import { Fragment } from "react";
import type { SchonBeiAuftraggeber } from "@/daten/demo";
import { Ico } from "./Ico";

export function GleicherGrund({ treffer, ohneLink = false }: { treffer: SchonBeiAuftraggeber[]; ohneLink?: boolean }) {
  if (!treffer.length) return null;
  return (
    <span className="gleich">
      <Ico icon={History} />
      <span>
        Gleicher Grund bei diesem Auftraggeber schon in{" "}
        {treffer.map((t, i) => (
          <Fragment key={t.kurz}>
            {i > 0 && (i === treffer.length - 1 ? " und " : ", ")}
            {ohneLink ? (
              <b>{t.kurz}</b>
            ) : (
              <Link href={t.href} className="gleich__link">
                {t.kurz}
              </Link>
            )}
          </Fragment>
        ))}
      </span>
    </span>
  );
}
