"use client";

import Link from "next/link";
import { ArrowLeft, FolderCheck } from "lucide-react";

import { PdfButton } from "@/components/fund/pdf-button";
import { BUSINESS } from "@/lib/example";
import { readEingaenge, readDecisions } from "@/lib/decisions";
import type { Gap } from "@/lib/invoice";
import { useLive } from "@/lib/live";
import { loadScan } from "@/lib/scans";
import { SheetCrop } from "./sheet-crop";

/**
 * "Mappe für die Baustelle": what is open on a project and who signs it. The business prints the PDF, the Bauleitung
 * takes it along; tieout contacts nobody. A gap closed in this browser leaves the folder at once.
 */
export function FolderView({ built, projektId, project, client, back, asOf, sample }: { built: Gap[]; projektId: string; project: string; client: string; back: string; asOf: string; sample: boolean }) {
  const gaps = (useLive()?.gapsView(projektId) ?? built).filter((g) => g.folder && !g.closed);
  const make = async () => {
    const [{ folderPdf }, { browserSheets }, { savePdf }] = await Promise.all([import("@/lib/folder-pdf"), import("@/lib/sheet-pdf"), import("@/lib/pdf")]);
    const fresh = (await import("@/lib/kern-live")).live(readDecisions(), readEingaenge()).gapsView(projektId);
    const bytes = await folderPdf({ business: BUSINESS.name, project, client, asOf, gaps: fresh, sample }, browserSheets(loadScan));
    savePdf(bytes, `Mappe_${project.replace(/[^\p{L}\p{N}]+/gu, "_")}.pdf`);
  };
  return (
    <div className="flex flex-col">
      <div className="flex min-h-12 items-center gap-2 px-4 py-2 shadow-line-bottom">
        <Link href={back} className="link-quiet inline-flex items-center gap-1.5 text-fg-secondary">
          <ArrowLeft className="size-4" aria-hidden />
          Zurück
        </Link>
        {gaps.length > 0 && <PdfButton make={make} label="Mappe als PDF" />}
      </div>
      <div className="mx-auto flex w-full max-w-[860px] flex-col gap-5 px-6 py-6 max-md:px-4">
        <header className="flex flex-col gap-1">
          <h1 className="text-lg font-semibold">Mappe für die Baustelle</h1>
          <p className="text-fg-secondary">
            {project} · {client}
          </p>
        </header>
        {gaps.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl px-6 py-12 text-center shadow-ring">
            <FolderCheck className="size-5 text-fg-muted" aria-hidden />
            <p className="font-medium">Keine offene Unterschrift</p>
            <p className="max-w-96 text-xs text-fg-secondary">Sobald ein Regiebericht oder ein Aufmaßblatt auf eine Unterschrift wartet, liegt es hier.</p>
          </div>
        ) : (
          <>
            <ul className="grid gap-4 sm:grid-cols-2">
              {gaps.map((g) => (
                <li key={g.key} className="flex min-w-0 flex-col gap-2 rounded-xl p-3 shadow-ring">
                  <span className="font-medium">{g.sheet?.title ?? "Regiebericht, neu"}</span>
                  <span className="text-xs text-fg-secondary">
                    {g.signer ? `${g.signer.charAt(0).toUpperCase()}${g.signer.slice(1)} unterschreibt` : ""}
                    {g.template ? `. Aus der WhatsApp-Meldung vorbereitet, Arbeitstag ${g.template.day}: ${g.template.work}` : ""}
                    {g.enclosures.length ? `. Beilagen: ${g.enclosures.map((e) => e.title).join(", ")}` : ""}
                  </span>
                  {g.sheet && <SheetCrop project={g.project.slug} sheet={g.sheet} />}
                </li>
              ))}
            </ul>
            <p className="text-xs text-fg-muted">Der Betrieb druckt die Mappe, die Bauleitung nimmt sie mit. tieout kontaktiert niemanden. Die Mappe zeigt keine Beträge.</p>
          </>
        )}
      </div>
    </div>
  );
}
