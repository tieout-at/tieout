// Schalter ZURUF_ECHT für die Oberfläche, fest beim Build (statische Seite). Standard aus: alles wie bisher,
// die Szene wird nur vorgespielt. An (NEXT_PUBLIC_ZURUF_ECHT=an): echter Chat gegen den Agenten, neue Einträge in
// Zeitachse und Befunden. Online bleibt er aus, bis Maxi S. Go gibt; der Worker hat dafür seinen eigenen Schalter.

export const ZURUF_ECHT = process.env.NEXT_PUBLIC_ZURUF_ECHT === "an";

/** Adresse der Route. Online dieselbe Adresse wie die Seite; lokal der Server aus product/zuruf (npm run app-server). */
export const ZURUF_URL = process.env.NEXT_PUBLIC_ZURUF_URL ?? "/api/zuruf/nachricht";
