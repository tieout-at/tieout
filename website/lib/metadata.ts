import type { Metadata } from "next";
import { getMessages, type Locale } from "./i18n";

// Vorschau: nicht indexieren, solange Impressum und Datenschutz Platzhalter sind.
export function siteMetadata(locale: Locale): Metadata {
  const m = getMessages(locale).meta;
  return {
    title: m.title,
    description: m.description,
    robots: { index: false, follow: false },
    alternates: { languages: { de: "/", en: "/en/" } },
    icons: {
      icon: [
        { url: "/favicon.svg", type: "image/svg+xml" },
        { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      ],
      apple: "/apple-touch-icon.png",
    },
  };
}
