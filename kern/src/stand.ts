// The twin as it was known on a given day: only Belege and messages dated up to that day, and a signature only from the
// day it was given. Used for the Verlauf of a find ("Lauf je Abschlagsrechnung": what the Abgleich showed on 30.09.2026)
// and to replay a run on an earlier day.

import type { Datensatz, Datum } from "./modell";

export function zumStichtag(d: Datensatz, tag: Datum): Datensatz {
  const bis = (datum: Datum) => datum <= tag;
  const belegIds = new Set(d.belege.filter((b) => bis(b.datum)).map((b) => b.id));
  const hat = (id: string) => belegIds.has(id);
  return {
    ...d,
    belege: d.belege.filter((b) => hat(b.id)),
    aufmass: d.aufmass
      .filter((a) => bis(a.datum.wert))
      .map((a) => ({
        ...a,
        erfasstAm: a.erfasstAm && bis(a.erfasstAm.wert) ? a.erfasstAm : null,
        ...(a.gegengezeichnetAm && !bis(a.gegengezeichnetAm.wert) ? { gegengezeichnet: { ...a.gegengezeichnet, wert: false }, gegengezeichnetAm: null } : {}),
      })),
    regie: d.regie
      .filter((r) => bis(r.datum.wert))
      .map((r) => (r.unterschriebenAm && !bis(r.unterschriebenAm.wert) ? { ...r, unterschrieben: { ...r.unterschrieben, wert: false }, unterschriebenAm: null } : r)),
    stundenzettel: d.stundenzettel.filter((s) => hat(s.belegId)),
    abschlaege: d.abschlaege.filter((r) => bis(r.datum.wert)),
    entwurf: d.entwurf && bis(d.entwurf.datum.wert) ? d.entwurf : null,
    schlussrechnung: d.schlussrechnung && bis(d.schlussrechnung.datum.wert) ? d.schlussrechnung : null,
    zahlungen: d.zahlungen.filter((z) => bis(z.datum.wert)),
    korrekturblaetter: d.korrekturblaetter.filter((k) => bis(k.datum.wert)),
    abzugsschreiben: d.abzugsschreiben && bis(d.abzugsschreiben.datum.wert) ? d.abzugsschreiben : null,
    nachtraege: d.nachtraege.filter((n) => hat(n.belegId)),
    plaene: d.plaene.filter((p) => bis(p.datum.wert)),
    emails: d.emails.filter((m) => bis(m.datum.wert)),
    fotos: d.fotos.filter((f) => bis(f.zeitpunkt.wert.slice(0, 10))),
    fotodokumentationen: d.fotodokumentationen.filter((f) => bis(f.datum.wert)),
    grosshaendlerrechnungen: d.grosshaendlerrechnungen.filter((g) => bis(g.datum.wert)),
    indexblatt: d.indexblatt && bis(d.indexblatt.stand.wert) ? d.indexblatt : null,
    meldungen: d.meldungen.filter((m) => bis(m.zeitpunkt.slice(0, 10))),
  };
}
