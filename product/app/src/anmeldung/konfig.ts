// Supabase-Projekt für die Anmeldung. Beide Werte sind öffentlich (stehen ohnehin in jeder ausgelieferten Seite),
// kein Geheimnis. Der geheime Schlüssel liegt nur als Cloudflare-Secret SUPABASE_SECRET_KEY beim Worker.
// Leer = Anmeldung aus: Die App läuft wie bisher ohne Login (lokal, in Tests, bis das Projekt angelegt ist).
// Gelesen von der App (Browser) und vom Worker (worker/index.ts).

export const SUPABASE_URL = "";
export const SUPABASE_PUBLISHABLE_KEY = "";

export const ANMELDUNG_AN = SUPABASE_URL !== "" && SUPABASE_PUBLISHABLE_KEY !== "";

/** „Mit Google fortfahren“ zeigen (erst, wenn Google im Supabase-Projekt eingerichtet ist). */
export const GOOGLE_AN = false;

/** Seiten, die ohne Anmeldung erreichbar sind (Worker und App nutzen dieselbe Liste). */
export const ANMELDESEITE = "/anmelden/";
