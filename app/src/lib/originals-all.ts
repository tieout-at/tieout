/** Server side only: the original pages of a whole project, for the static file `/originale/<projekt>.json`. */

import { business, firm } from "./kern-data";
import { originalPage, type OriginalPage } from "./originals";

/** Every page of every Beleg and WhatsApp-Meldung of a project, by `belegId:seite`. */
export function projectOriginals(projektId: string): Record<string, OriginalPage> {
  const d = firm().projekte.find((x) => x.projekt.id === projektId);
  if (!d) return {};
  // a duplicate has no fields of its own; the lists name its original instead
  const copies = new Set(business().ergebnisse[projektId].ordner.duplikatIds);
  const pages: Record<string, OriginalPage> = {};
  const sources = [...d.belege.filter((b) => !copies.has(b.id)).map((b) => ({ id: b.id, pages: b.seiten })), ...d.meldungen.map((m) => ({ id: m.id, pages: 1 }))];
  for (const s of sources)
    for (let n = 1; n <= s.pages; n++) {
      const o = originalPage(d, s.id, n);
      if (o) pages[o.key] = o;
    }
  return pages;
}
