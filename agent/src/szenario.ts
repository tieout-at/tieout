// Format der Testszenarien für die Lernschleife (szenarien/*.json).
// Ein Szenario beschreibt eine erfundene Person, was wirklich passiert ist, und was wir vom Agenten erwarten.

import { z } from "zod";

const NachrichtVorgabe = z.object({
  art: z.enum(["text", "sprache", "foto"]),
  /** Text, Transkript (so wie gesprochen, auch Dialekt) oder Bildbeschreibung. */
  inhalt: z.string().min(1),
});

const WahrerEintrag = z.object({
  projektId: z.string(),
  ort: z.string().optional(),
  leistung: z.string(),
  menge: z.object({ wert: z.number(), einheit: z.string() }).optional(),
  personen: z.number().optional(),
  dauerStunden: z.number().optional(),
  angewiesenVon: z.string().optional(),
  datum: z.string().optional(),
  material: z.string().optional(),
});

/** Erwartung an einen gespeicherten Eintrag. Zahlen und Projekt werden exakt geprüft, Text über Stichwörter (eines muss vorkommen). */
const ErwarteterEintrag = z.object({
  projektId: z.string().optional(),
  ortStichwoerter: z.array(z.string()).optional(),
  leistungStichwoerter: z.array(z.string()).optional(),
  personen: z.number().optional(),
  dauerStunden: z.number().optional(),
  mengeWert: z.number().optional(),
  angewiesenVonStichwoerter: z.array(z.string()).optional(),
  datum: z.string().optional(),
  /** Diese Felder dürfen NICHT gefüllt sein, weil der Absender sie nicht genannt hat. */
  mussLeerSein: z
    .array(z.enum(["projektId", "ort", "leistung", "menge", "personen", "dauerStunden", "angewiesenVon", "datum", "material", "grund"]))
    .optional(),
});

export const SzenarioSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  titel: z.string(),
  kategorie: z.enum([
    "klar",
    "projekt_unklar",
    "anweiser_fehlt",
    "dialekt",
    "mehrere_punkte",
    "korrektur",
    "frage_geld_recht",
    "nur_foto",
    "erstkontakt",
    "stopp",
    "abgeschlossenes_projekt",
    "kein_zuruf",
    "laerm_bruchstueck",
    "spaete_nachricht",
    "nachtrag",
    "ungeduld",
    "reparatur_schaden",
    "aufzaehlung",
  ]),
  persona: z.object({
    rolle: z.enum(["monteur", "polier", "obermonteur"]),
    /** Wie die Person schreibt und spricht: Dialekt, Länge, Tippfehler, Ungeduld. */
    sprechweise: z.string(),
    /** Was die Person tut, wenn der Agent fragt, falsch liegt oder zusammenfasst. */
    verhalten: z.string(),
  }),
  /** Zeitpunkt der ersten Nachricht. */
  start: z.string(),
  /** Hat die Person schon zugestimmt (bestehender Nutzer)? false = erster Kontakt. */
  einwilligung: z.boolean(),
  /** Kommen fast gleichzeitig an (z. B. Foto und Sekunden später Text) und werden als ein Bündel zugestellt. */
  ersteNachrichten: z.array(NachrichtVorgabe).min(1),
  /** Was wirklich passiert ist. Die Persona kennt das, der Agent nicht. */
  wahrheit: z.object({
    eintraege: z.array(WahrerEintrag),
    /** Was die Person selbst nicht weiß (sagt „weiß ich nicht“, wenn gefragt). */
    weissNicht: z.array(z.string()).default([]),
  }),
  erwartung: z.object({
    /** Wie viele Einträge am Ende gespeichert sein sollen (0 z. B. bei „stopp“ oder privatem Kram). */
    anzahlGespeichert: z.number().int().min(0),
    status: z.enum(["bestaetigt", "unbestaetigt", "egal"]).default("bestaetigt"),
    eintraege: z.array(ErwarteterEintrag).default([]),
    maxRueckfragen: z.number().int().min(0).max(2).default(2),
    /** Wörter oder Inhalte, die in keiner Antwort des Agenten vorkommen dürfen (zusätzlich zu den festen Verboten). */
    verboteneInhalte: z.array(z.string()).default([]),
    /** Was der Agent in diesem Szenario unbedingt tun soll, in Worten, für den Bewerter. */
    sollVerhalten: z.string(),
  }),
});

export type Szenario = z.infer<typeof SzenarioSchema>;
export type ErwarteterEintrag = z.infer<typeof ErwarteterEintrag>;
