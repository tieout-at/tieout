// Quellen eines Rechenschritts als kleine Chips (UI-Runde 1, Schritt 4, k4: jede Zahl führt zum Original).
// Vorlage: Kuro K-B (Quelle als Chip neben dem Wert), Harvey Review Table. Der Chip ist ein Link auf die Belegseite
// mit Anker; liegt der Beleg schon im Betrachter des Postens, öffnet die Arbeitsfläche ihn dort (data-beleg).

import type { Datensatz, Quelle } from "@/domain/typen";

const MAX = 3;

/** Kurzname eines Belegs für den Chip, z. B. „AB-12“, „LV S. 6“, „Vertrag 6.3“, „Z6“. */
function kurzname(d: Datensatz, q: Quelle): string {
  const zuruf = d.zurufe.find((z) => z.id === q.dokumentId);
  if (zuruf) return zuruf.nr;
  const dok = d.dokumente.find((x) => x.id === q.dokumentId);
  if (!dok) return q.dokumentId;
  const punkt = q.stelle?.match(/Pkt\. ([\d.]+)/)?.[1];
  const seite = dok.seiten > 1 ? ` S. ${q.seite}` : "";
  switch (dok.art) {
    case "aufmass":
    case "regie":
      return dok.id.toUpperCase();
    case "abschlag":
      return d.abschlaege.find((r) => r.dokumentId === dok.id)?.nr.wert ?? "AR";
    case "vertrag":
      return punkt ? `Vertrag ${punkt}` : `Vertrag${seite}`;
    case "lv":
      return `LV${seite}`;
    case "sr_entwurf":
      return `Entwurf${seite}`;
    case "k7":
      return "K7";
    case "indexblatt":
      return "Indexblatt";
    case "mail":
      return "Mail";
    default:
      return dok.dateiname;
  }
}

function anker(q: Quelle): string {
  const nr = q.stelle?.match(/\d\d\.\d\d\.\d\d[A-Z]|Z-\d+/)?.[0];
  return nr ? `#pos-${nr}` : "";
}

export function Quellen({ d, basis, quellen }: { d: Datensatz; basis: string; quellen: Quelle[] | undefined }) {
  if (!quellen?.length) return null;
  // Gleicher Chip nur einmal (z. B. zwei Stellen im Indexblatt, Vertrag Pkt. 6.3 für Monteur und Helfer)
  const eindeutig = quellen.filter((q, i) => quellen.findIndex((x) => kurzname(d, x) === kurzname(d, q)) === i);
  const zeigen = eindeutig.length > MAX + 1 ? eindeutig.slice(0, MAX) : eindeutig;
  const rest = eindeutig.slice(zeigen.length);
  const dateiname = (q: Quelle) => d.dokumente.find((x) => x.id === q.dokumentId)?.dateiname ?? kurzname(d, q);
  return (
    <span className="rw-quellen">
      {zeigen.map((q) => (
        <a
          key={`${q.dokumentId}-${q.stelle ?? q.seite}`}
          href={`${basis}/belege/${q.dokumentId}/${anker(q)}`}
          className="sw-source"
          data-beleg={q.dokumentId}
          title={`${dateiname(q)}, Seite ${q.seite}${q.stelle ? `, ${q.stelle}` : ""}`}
        >
          {kurzname(d, q)}
        </a>
      ))}
      {rest.length > 0 && (
        <span className="rw-quellen__mehr" title={rest.map((q) => kurzname(d, q)).join(", ")}>
          +{rest.length}
        </span>
      )}
    </span>
  );
}
