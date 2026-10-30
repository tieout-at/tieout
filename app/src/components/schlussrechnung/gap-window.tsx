"use client";

import Link from "next/link";
import { BookOpenCheck, CircleCheck, FolderCheck, ListTodo } from "lucide-react";
import { useState } from "react";

import { TaskDialog } from "@/components/aufgaben/task-dialog";
import { FileView, StoredFiles, type ShownFile } from "@/components/fund/stored-files";
import { PeekHeader } from "@/components/table/peek";
import { Button } from "@/components/ui/button";
import { SideWindow } from "@/components/ui/side-window";
import { SavedWhere } from "@/components/shell/saved-where";
import { keep } from "@/components/charts/tones";
import { useAccount, useActor } from "@/lib/account";
import { entryRefused } from "@/lib/decision-rules";
import { appendEingang, localTime } from "@/lib/decisions";
import type { StoredFile } from "@/lib/files";
import type { Gap } from "@/lib/invoice";
import type { TaskTarget } from "@/lib/tasks";
import { SheetCrop } from "./sheet-crop";

const WAY = "flex items-start gap-2.5 rounded-lg px-3 py-2.5 shadow-ring";

export const targetOfGap = (g: Gap): TaskTarget => ({
  key: g.find?.key ?? `${g.project.id}/${g.riskKey ?? g.key}`,
  label: `${g.find?.number ?? g.about} ${g.project.name}`,
  name: g.find?.name ?? g.title,
  href: g.href,
  project: g.project.name,
  taskText: g.remedy,
  deadline: g.project.deadline,
});

/** What closing the gap does, in one line; nothing where closing it moves no money by itself. */
function gain(g: Gap): string | null {
  if (g.closed) return null;
  if (g.effect === "in_rechnung") return `Bringt ${g.amount.text} aus „in Klärung“ in die Rechnung`;
  if (g.effect === "kuerzungsrisiko") return `Nimmt ${g.amount.text} aus dem Kürzungsrisiko`;
  return null;
}

/** The body of the window: the gap, the sheet with the place to sign, and what a person can do about it. */
function Body({ gap, onClose }: { gap: Gap; onClose: () => void }) {
  const account = useAccount();
  const refused = entryRefused(useActor());
  const [task, setTask] = useState(false);
  const [made, setMade] = useState<string | null>(null);
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [shown, setShown] = useState<ShownFile | null>(null);
  const signedIn = account.stand === "konto";
  const belegId = gap.sheet?.belegId ?? gap.template?.message ?? null;
  const file = files[0]?.id;
  const line = gain(gap);

  const enter = () => appendEingang({ lueckeSchluessel: gap.key, zeit: localTime(), wer: "Abrechnung", gueltig: true, ...(file ? { dateiId: file } : {}) });
  const takeBack = () => appendEingang({ lueckeSchluessel: gap.key, zeit: localTime(), wer: "Abrechnung", gueltig: false });

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto">
      <PeekHeader chip={gap.find?.number} title={gap.title} sub={gap.project.name} onClose={onClose} />
      <div className="flex flex-col gap-3 px-4 py-3">
        {gap.sheet && <SheetCrop project={gap.project.slug} sheet={gap.sheet} />}
        {gap.template && (
          <dl className="grid grid-cols-[96px_minmax(0,1fr)] gap-x-3 gap-y-1 rounded-md bg-fill-subtle px-3 py-2 text-xs shadow-ring">
            <dt className="text-fg-secondary">Arbeitstag</dt>
            <dd>{gap.template.day}</dd>
            <dt className="text-fg-secondary">Ort</dt>
            <dd>{gap.template.place}</dd>
            <dt className="text-fg-secondary">Tätigkeit</dt>
            <dd>{gap.template.work}</dd>
            <dt className="text-fg-secondary">Stunden</dt>
            <dd>
              Monteur {gap.template.fitter} h, Helfer {gap.template.helper} h
            </dd>
          </dl>
        )}
        {line && <p className="rounded-md bg-money-soft px-3 py-1.5 text-xs text-state-green-edge">{keep(line)}</p>}
        {!gap.closed && !gap.closable && <p className="text-xs text-fg-secondary">{gap.remedy}</p>}
        {gap.enclosures.length > 0 && <p className="text-xs text-fg-secondary">Kommt mit: {gap.enclosures.map((e) => e.title).join(", ")}.</p>}

        {gap.closed ? (
          <div className={WAY}>
            <CircleCheck className="mt-0.5 size-4 shrink-0 text-state-green-edge" aria-hidden />
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="font-medium">Unterschrift liegt vor</span>
              <span className="text-xs text-fg-secondary">
                Eingetragen von {gap.closed.who}, {gap.closed.when}. {gap.find ? `${gap.find.number} geht seinen Weg weiter: prüfen, freigeben.` : ""}
              </span>
            </span>
            {!refused && (
              <Button onClick={takeBack} className="shrink-0">
                Zurücknehmen
              </Button>
            )}
          </div>
        ) : (
          <>
            {gap.folder && (
              <div className={WAY}>
                <FolderCheck className="mt-0.5 size-4 shrink-0 text-fg-secondary" aria-hidden />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="font-medium">Liegt in der Mappe</span>
                  <span className="text-xs text-fg-secondary">
                    {gap.signer ? `${gap.signer.charAt(0).toUpperCase()}${gap.signer.slice(1)} unterschreibt auf der Baustelle.` : ""}
                    {gap.template ? " Der Regiebericht ist aus der WhatsApp-Meldung vorbereitet." : ""}
                  </span>
                </span>
                <Link href={gap.project.folderHref} className="inline-flex h-7 shrink-0 items-center rounded-md bg-surface px-2 font-medium shadow-button outline-none hover:bg-fill-hover focus-visible:outline-2 focus-visible:outline-accent max-md:h-9">
                  Mappe öffnen
                </Link>
              </div>
            )}
            <div className={WAY}>
              <ListTodo className="mt-0.5 size-4 shrink-0 text-fg-secondary" aria-hidden />
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="font-medium">Aufgabe an {gap.inCharge === "Bauleitung" ? "die Bauleitung" : "die Abrechnung"}</span>
                <span className="text-xs text-fg-secondary">{made ?? "Mit Text und Frist, sie steht unter Aufgaben."}</span>
              </span>
              <Button onClick={() => setTask(true)} className="shrink-0">
                Anlegen
              </Button>
            </div>
            {gap.closable && (
              <div className="flex flex-col gap-2">
                <div className={WAY}>
                  <BookOpenCheck className="mt-0.5 size-4 shrink-0 text-fg-secondary" aria-hidden />
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="font-medium">Unterschrift liegt vor</span>
                    <span className="text-xs text-fg-secondary">
                      {refused ?? (signedIn && !file ? "Erst das unterschriebene Blatt hinterlegen, dann eintragen." : "tieout rechnet neu. Zurücknehmen geht jederzeit.")} <SavedWhere variant="satz" />
                    </span>
                  </span>
                  <Button variant="primary" onClick={enter} disabled={!!refused || (signedIn && !file)} className="shrink-0">
                    Eintragen
                  </Button>
                </div>
                {belegId && !refused && (
                  <div className="overflow-hidden rounded-lg empty:hidden">
                    <StoredFiles project={gap.project.slug} belegId={belegId} shown={shown?.file ?? null} onShow={setShown} onFiles={setFiles} />
                  </div>
                )}
                {shown && <FileView shown={shown} />}
              </div>
            )}
          </>
        )}
        <p className="text-xs text-fg-muted">tieout kontaktiert niemanden. Gedruckt und unterschrieben wird beim Betrieb.</p>
      </div>
      <TaskDialog open={task} onOpenChange={setTask} targets={[targetOfGap(gap)]} defaults={{ zustaendig: gap.inCharge, bis: "" }} onMade={(t) => setMade(`Aufgabe für ${t.zustaendig} angelegt.`)} />
    </div>
  );
}

/** "Lücke schließen": the closable window of a gap, the same from the Vorprüfung, from "in Klärung" and from a find. */
export function GapWindow({ gap, onClose }: { gap: Gap | null; onClose: () => void }) {
  return (
    <SideWindow open={!!gap} onClose={onClose} title="Lücke schließen">
      {gap && <Body key={gap.key} gap={gap} onClose={onClose} />}
    </SideWindow>
  );
}
