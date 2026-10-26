import {
  Calculator,
  Camera,
  ClipboardList,
  Clock,
  FilePen,
  FileSignature,
  FileText,
  ListChecks,
  Mail,
  Map as MapIcon,
  MessageCircle,
  Receipt,
  ReceiptText,
  Ruler,
  type LucideIcon,
} from "lucide-react";

import type { TwinBeleg } from "@/lib/twin";

const ICON: Partial<Record<TwinBeleg["art"], LucideIcon>> = {
  leistungsverzeichnis: ListChecks,
  vertrag: FileSignature,
  preisbasis: Calculator,
  plan: MapIcon,
  indexblatt: MapIcon,
  email: Mail,
  foto: Camera,
  fotodokumentation: Camera,
  aufmassblatt: Ruler,
  regiebericht: ClipboardList,
  stundenzettel: Clock,
  grosshaendlerrechnung: Receipt,
  abschlagsrechnung: ReceiptText,
  zahlungsavis: ReceiptText,
  schlussrechnung: ReceiptText,
  entwurf: FilePen,
  nachtrag: FilePen,
  whatsapp: MessageCircle,
};

export function belegIcon(art: TwinBeleg["art"]): LucideIcon {
  return ICON[art] ?? FileText;
}

/** The kind's icon from its German name as the lists show it ("Aufmaßblatt", "E-Mail"), for rows that carry only the name. */
const BY_TEXT: Record<string, TwinBeleg["art"]> = {
  Vertrag: "vertrag",
  Leistungsverzeichnis: "leistungsverzeichnis",
  Preisbasis: "preisbasis",
  Aufmaßblatt: "aufmassblatt",
  Regiebericht: "regiebericht",
  Stundenzettel: "stundenzettel",
  Abschlagsrechnung: "abschlagsrechnung",
  Zahlungsavis: "zahlungsavis",
  Korrekturblatt: "korrekturblatt",
  Abzugsschreiben: "abzugsschreiben",
  Entwurf: "entwurf",
  Schlussrechnung: "schlussrechnung",
  Nachtrag: "nachtrag",
  Großhändlerrechnung: "grosshaendlerrechnung",
  "E-Mail": "email",
  Foto: "foto",
  Fotodokumentation: "fotodokumentation",
  Plan: "plan",
  Indexblatt: "indexblatt",
};

export function belegIconByText(kind: string): LucideIcon {
  return BY_TEXT[kind] ? belegIcon(BY_TEXT[kind]) : FileText;
}
