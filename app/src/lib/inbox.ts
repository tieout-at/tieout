/**
 * The pages "WhatsApp-Meldungen" and "E-Mails" of "Ihre Daten" (SPEZIFIKATION.md 1.2 and 4.2: Attio's "Calls" and
 * "Emails", read only): every message of every project with what the twin read from it, whether its work is invoiced
 * or missing (the core's `zeitstrahl`), and the finds it proves with their amounts. tieout sends nothing: an e-mail comes
 * from the folder, a WhatsApp-Meldung from the agent. Every amount is the core's.
 */

import { BELEGSTAND_TEXT, EMAIL_KATEGORIE_TEXT, EREIGNISSTAND_TEXT, datumText, euro, stunden, zeitstrahl, type Belegstand, type Ereignisstand, type FirmenErgebnis } from "@tieout/kern";

import { findSlug, projectSlug } from "./example";
import { business, firm, nameAndFacts } from "./kern-data";
import { originalPage, type OriginalPage } from "./originals";

export type InboxFind = { number: string; href: string; name: string; amount: string; belegstand: { state: Belegstand; text: string } | null };

export type InboxItem = {
  /** Address in the page (`#w4`, `#mail-0407`) and key of its original. */
  id: string;
  project: { slug: string; name: string };
  date: { iso: string; text: string };
  /** "14:30" for a message, null for an e-mail. */
  time: string | null;
  /** Role only, never a name ("Monteur, Trupp 1", "Bauleitung Hornfeld Bau"). */
  sender: string;
  /** "für Hornfeld Bau" for an e-mail of the Auftraggeber whose sender does not name it; else null. */
  side: string | null;
  title: string;
  /** The words that matter: the transcript, or the quoted sentence of an e-mail. */
  preview: string | null;
  /** Hours named in a message, per crew; null for an e-mail or a message without hours. */
  hours: string | null;
  place: string | null;
  /** E-mail category ("Anweisung", "Anmeldung", "Termin", "Sonstiges"). */
  category: string | null;
  /** What the original below does not show already (each fact once). */
  facts: { label: string; value: string }[];
  stand: { state: Ereignisstand; text: string } | null;
  finds: InboxFind[];
  rechtsfrage: boolean;
  /** Further copies of the same file in the folder. */
  copies: number;
  original: OriginalPage | null;
};

export type InboxView = { items: InboxItem[]; projects: string[] };

const zeit = (z: string) => ({ iso: z.slice(0, 10), text: datumText(z.slice(0, 10)) });

/** Finds by their number per project, with the find page's short name and amount. */
function findsOf(b: FirmenErgebnis, projektId: string, projectName: string, numbers: string[]): InboxFind[] {
  const funde = b.ergebnisse[projektId].abgleich.funde;
  return numbers.flatMap((nr) => {
    const f = funde.find((x) => x.nr === nr);
    if (!f) return [];
    return [{ number: nr, href: `/funde/${findSlug(projectName, nr)}/`, name: nameAndFacts(f).name, amount: euro(f.betrag), belegstand: f.belegstand ? { state: f.belegstand, text: BELEGSTAND_TEXT[f.belegstand] } : null }];
  });
}

export function whatsappView(b: FirmenErgebnis = business()): InboxView {
  const items = firm().projekte.flatMap((d) => {
    const strahl = new Map(zeitstrahl(d, b.ergebnisse[d.projekt.id]).ereignisse.map((x) => [x.id, x]));
    const project = { slug: projectSlug(d.projekt.name), name: d.projekt.name };
    return d.meldungen.map((m): InboxItem => {
      const x = strahl.get(m.id);
      const hours = [m.stundenMonteur.wert ? `Monteur ${stunden(m.stundenMonteur.wert)}` : "", m.stundenHelfer.wert ? `Helfer ${stunden(m.stundenHelfer.wert)}` : ""].filter(Boolean).join(", ");
      return {
        id: m.id,
        project,
        date: zeit(m.zeitpunkt),
        time: m.zeitpunkt.slice(11, 16),
        sender: m.absender,
        side: null,
        title: m.taetigkeit.wert,
        preview: m.transkript.wert,
        category: null,
        hours: hours || null,
        place: m.ort.wert,
        facts: [
          ...(m.bezugRegiebericht ? [{ label: "Regiebericht", value: `Regiebericht ${m.bezugRegiebericht.wert}` }] : []),
          ...(m.foto ? [{ label: "Foto", value: `${m.foto}, Bild nicht in den Beispieldaten` }] : []),
          { label: "Bestätigt", value: `${m.bestaetigt.rolle}, ${datumText(m.bestaetigt.zeitpunkt.slice(0, 10))}, ${m.bestaetigt.zeitpunkt.slice(11, 16)}` },
        ],
        stand: x?.stand ? { state: x.stand, text: EREIGNISSTAND_TEXT[x.stand] } : null,
        finds: x ? findsOf(b, d.projekt.id, d.projekt.name, x.funde) : [],
        rechtsfrage: false,
        copies: 0,
        original: originalPage(d, m.id, 1),
      };
    });
  });
  return finish(items);
}

export function emailView(b: FirmenErgebnis = business()): InboxView {
  const items = firm().projekte.flatMap((d) => {
    const e = b.ergebnisse[d.projekt.id];
    const strahl = new Map(zeitstrahl(d, e).ereignisse.map((x) => [x.id, x]));
    const project = { slug: projectSlug(d.projekt.name), name: d.projekt.name };
    const client = b.projekte.find((p) => p.projektId === d.projekt.id)?.auftraggeber.kurzname ?? "Auftraggeber";
    const doppelt = new Set(e.ordner.duplikatIds);
    const hash = new Map(d.belege.map((x) => [x.id, x.inhaltHash]));
    return d.emails
      .filter((m) => !doppelt.has(m.belegId))
      .map((m): InboxItem => {
        const x = strahl.get(m.belegId);
        const copies = d.belege.filter((y) => doppelt.has(y.id) && y.inhaltHash === hash.get(m.belegId)).length;
        const a = m.anmeldung;
        return {
          id: m.belegId,
          project,
          date: zeit(m.datum.wert),
          time: null,
          sender: m.absender.wert,
          // the side is named only where the sender does not say it ("Planung Haustechnik")
          side: m.absender.wert.includes(client) || m.von === "betrieb" ? null : `für ${client}`,
          hours: null,
          place: null,
          title: m.betreff.wert,
          preview: m.zitat?.wert ?? null,
          category: EMAIL_KATEGORIE_TEXT[m.kategorie.wert],
          facts: [
            ...(m.bezugPositionen.wert.length ? [{ label: "Positionen", value: m.bezugPositionen.wert.join(", ") }] : []),
            ...(a ? [{ label: "Angemeldet", value: a.gegenstand.wert }, { label: "Nachtrag", value: a.nachtragGelegt.wert ? "gelegt" : "nicht gelegt" }] : []),
          ],
          stand: x?.stand ? { state: x.stand, text: EREIGNISSTAND_TEXT[x.stand] } : null,
          finds: x ? findsOf(b, d.projekt.id, d.projekt.name, x.funde) : [],
          rechtsfrage: x?.rechtsfrage ?? false,
          copies,
          original: originalPage(d, m.belegId, 1),
        };
      });
  });
  return finish(items);
}

/** Newest first, the projects that have any in the order of the business. */
function finish(items: InboxItem[]): InboxView {
  items.sort((a, b) => b.date.iso.localeCompare(a.date.iso) || (b.time ?? "").localeCompare(a.time ?? "") || a.id.localeCompare(b.id));
  return { items, projects: [...new Set(items.map((i) => i.project.name))] };
}
