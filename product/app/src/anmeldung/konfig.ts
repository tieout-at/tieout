// Supabase-Projekt für die Anmeldung. Beide Werte sind öffentlich (stehen ohnehin in jeder ausgelieferten Seite),
// kein Geheimnis. Der geheime Schlüssel liegt nur als Cloudflare-Secret SUPABASE_SECRET_KEY beim Worker.
// Projekt tieout-app (Organisation tieout, Frankfurt). Leer = Anmeldung aus: Die App läuft wie bisher ohne Login.
// Gelesen von der App (Browser) und vom Worker (worker/index.ts).

export const SUPABASE_URL: string = "https://skvctanwhocirlmozmon.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY: string = "sb_publishable_WhOVwkI6q-iuCFwbJLYlUA_bsEi1xT0";

/** Login vorerst aus (Entscheidung Maxi S., 22.10.): Juroren und Investoren öffnen die App per Link ohne Anmeldung.
 * Auf true stellen, dann prüft der Worker vor jeder Seite die Sitzung und die Einstellungen zeigen Profil und Mitglieder. */
const ANMELDUNG_EIN = false;

export const ANMELDUNG_AN = ANMELDUNG_EIN && SUPABASE_URL !== "" && SUPABASE_PUBLISHABLE_KEY !== "";

/** „Mit Google fortfahren“ zeigen (erst, wenn Google im Supabase-Projekt eingerichtet ist). */
export const GOOGLE_AN = false;

/** Seiten, die ohne Anmeldung erreichbar sind (Worker und App nutzen dieselbe Liste). */
export const ANMELDESEITE = "/anmelden/";
