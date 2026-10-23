// Old addresses from before the rename (UI round 1, step 1a, decision Maxi S. 23.10.2026) lead to the new ones,
// because the jury and the team have links. Temporary (302): the terms are decided for now, and browsers keep a 301. The Worker answers them before anything else (worker/index.ts).
// Pure function, no access to the assets: what does not exist afterwards ends on the normal 404 page.

const ABSCHNITT: Record<string, string> = { befunde: "posten", ordner: "belege", ledger: "positionen", zuruf: "whatsapp" };

/** New path for an old one (path without host), otherwise null. The rest of the path (e.g. index.txt) is kept. */
export function neueAdresse(pfad: string): string | null {
  const m = /^\/projekte\/([^/]+)\/([^/]+)(\/.*)?$/.exec(pfad);
  if (!m) return null;
  const [, projekt, abschnitt, rest = ""] = m;
  const neu = ABSCHNITT[abschnitt] ?? abschnitt;
  // Slugs of WhatsApp messages: item "zuruf-Z6" and document "zuruf-z5" are now "whatsapp-…".
  const neuerRest = neu === "posten" || neu === "belege" ? rest.replace(/^\/zuruf-/, "/whatsapp-") : rest;
  if (neu === abschnitt && neuerRest === rest) return null;
  return `/projekte/${projekt}/${neu}${neuerRest}`;
}
