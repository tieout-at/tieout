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
