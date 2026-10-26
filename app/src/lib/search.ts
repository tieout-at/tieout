/**
 * Search (Strg K): understands the abbreviations people type ("LV", "AR 3", "RB 11", "AB 12"; SPEZIFIKATION.md 4.1)
 * and shows the full words. Umlauts may be typed or left out ("Ablaufe", "Ablaeufe" and "Abläufe" match).
 */

export const ABBREVIATIONS: Record<string, string> = {
  LV: "Leistungsverzeichnis",
  AR: "Abschlagsrechnung",
  RB: "Regiebericht",
  AB: "Aufmaßblatt",
  EP: "Einheitspreis",
  AG: "Auftraggeber",
  SR: "Schlussrechnung",
};

const PATTERN = new RegExp(`(?<![\\p{L}\\d])(${Object.keys(ABBREVIATIONS).join("|")})(?:[\\s.\\-]*(\\d+))?(?![\\p{L}\\d])`, "giu");

export type Expansion = { short: string; full: string };

/**
 * Replaces abbreviations by their full words: "RB 11" becomes "Regiebericht 11". Lower case counts only with a
 * number ("rb 11"), so the start of a word ("ab" for Abläufe) is never taken for an abbreviation.
 */
export function expand(query: string): { text: string; expansions: Expansion[] } {
  const expansions: Expansion[] = [];
  const text = query.replace(PATTERN, (match: string, abbr: string, number?: string) => {
    if (!number && abbr !== abbr.toUpperCase()) return match;
    const full = `${ABBREVIATIONS[abbr.toUpperCase()]}${number ? ` ${number}` : ""}`;
    expansions.push({ short: match.trim(), full });
    return full;
  });
  return { text, expansions };
}

/** Lower case, umlauts folded both ways (ä and ae become a), ß becomes ss. */
export function normalise(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä|ae/g, "a")
    .replace(/ö|oe/g, "o")
    .replace(/ü|ue/g, "u")
    .replace(/ß/g, "ss");
}

function words(text: string): string[] {
  return normalise(text)
    .split(/[^\p{L}\d]+/u)
    .filter(Boolean);
}

/**
 * How well a query matches a destination, from 0 (no match) to 1. `terms[0]` is the title, the rest are keywords.
 * Every word of the query must be found; plain numbers are optional, because pages have no numbers yet. A query of
 * numbers only ("08.09", a date) must find every one of them (customer test 3).
 */
export function score(query: string, terms: string[]): number {
  const wanted = words(expand(query).text);
  if (wanted.length === 0) return 1;
  const title = normalise(terms[0] ?? "");
  const hay = terms.flatMap(words);
  let sum = 0;
  let counted = 0;
  const numbers: number[] = [];
  for (const w of wanted) {
    let best = 0;
    for (const h of hay) {
      if (h === w) best = Math.max(best, 1);
      else if (h.startsWith(w)) best = Math.max(best, 0.8);
      else if (h.includes(w)) best = Math.max(best, 0.5);
    }
    if (/^\d+$/.test(w)) {
      numbers.push(best);
      continue;
    }
    if (best === 0) return 0;
    sum += best;
    counted += 1;
  }
  if (counted === 0) return numbers.length && numbers.every((b) => b > 0) ? 0.7 * (numbers.reduce((a, b) => a + b, 0) / numbers.length) : 0;
  const average = sum / counted;
  return title.startsWith(normalise(expand(query).text.trim())) ? Math.min(1, average + 0.1) : average * 0.9;
}
