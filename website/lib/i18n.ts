import de from "@/messages/de.json";
import en from "@/messages/en.json";

export type Locale = "de" | "en";
export type Messages = typeof de;

const messages: Record<Locale, Messages> = { de, en };

export function getMessages(locale: Locale): Messages {
  return messages[locale];
}

/** Pfad zur Startseite der jeweiligen Sprache. */
export function homePath(locale: Locale): string {
  return locale === "de" ? "/" : "/en/";
}

export function legalPath(locale: Locale, page: "impressum" | "datenschutz"): string {
  return locale === "de" ? `/${page}/` : `/en/${page}/`;
}
