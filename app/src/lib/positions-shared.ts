/**
 * What the client components of the tab "Positionen" need from `positions.ts` without loading the core: the kinds of
 * evidence of the Belegabdeckung in the order of the website table, their words and icons, and the row types.
 * `positions.test.ts` checks that the kinds are the core's `NACHWEISARTEN`.
 */

import { Camera, ClipboardList, ListChecks, Mail, Map as MapIcon, MessageCircle, ReceiptText, Ruler, type LucideIcon } from "lucide-react";
import type { Nachweisart } from "@tieout/kern";

export type { PositionRow, PositionsView } from "./positions";

export type CoverageKind = Nachweisart;

export const COVERAGE_KINDS: { id: CoverageKind; title: string; short: string; column: "beauftragt" | "erbracht" | "verrechnet" }[] = [
  { id: "leistungsverzeichnis", title: "Leistungsverzeichnis", short: "Leistungs­verzeichnis", column: "beauftragt" },
  { id: "plan", title: "Plan", short: "Plan", column: "erbracht" },
  { id: "email", title: "E-Mail", short: "E-Mail", column: "erbracht" },
  { id: "whatsapp", title: "WhatsApp-Meldung", short: "WhatsApp", column: "erbracht" },
  { id: "foto", title: "Foto", short: "Foto", column: "erbracht" },
  { id: "aufmass", title: "Aufmaß", short: "Aufmaß", column: "erbracht" },
  { id: "regie", title: "Regie und Stunden", short: "Regie", column: "erbracht" },
  { id: "rechnung", title: "Rechnung", short: "Rechnung", column: "verrechnet" },
];

export const COVERAGE_ICON: Record<CoverageKind, LucideIcon> = {
  leistungsverzeichnis: ListChecks,
  plan: MapIcon,
  email: Mail,
  whatsapp: MessageCircle,
  foto: Camera,
  aufmass: Ruler,
  regie: ClipboardList,
  rechnung: ReceiptText,
};
