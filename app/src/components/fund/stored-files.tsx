"use client";

import { FileText, ImageIcon, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useAccount } from "@/lib/account";
import { fileAddress, listFiles, sizeText, storeFile, TYPE_TEXT, type StoredFile } from "@/lib/files";
import { localMinute } from "@/lib/server-store";

const when = (iso: string) => {
  const z = localMinute(iso);
  return `${z.slice(8, 10)}.${z.slice(5, 7)}.${z.slice(0, 4)}, ${z.slice(11, 16)}`;
};

const small =
  "inline-flex h-6 shrink-0 items-center gap-1 rounded-md px-1.5 text-xs font-medium text-fg shadow-button outline-none hover:bg-fill-hover focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-50 max-md:h-9";

export type ShownFile = { file: StoredFile; url: string };

/**
 * The files the company stored for this Beleg, under the head of the original viewer (step 10, part E). Only with an
 * account: the demo has no files and loads nothing for them. "Datei hinterlegen" takes one PDF, JPEG or PNG up to
 * 20 MB; "Ansehen" shows it in the viewer by a signed address.
 */
export function StoredFiles({ project, belegId, shown, onShow }: { project: string; belegId: string; shown: StoredFile | null; onShow: (f: ShownFile | null) => void }) {
  const account = useAccount();
  const signedIn = account.stand === "konto";
  const [files, setFiles] = useState<StoredFile[] | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!signedIn) return;
    let live = true;
    listFiles(project, belegId)
      .then((list) => live && setFiles(list))
      .catch(() => live && setFiles([]));
    return () => {
      live = false;
    };
  }, [signedIn, project, belegId]);

  if (!signedIn) return null;

  const show = async (f: StoredFile) => {
    if (shown?.id === f.id) return onShow(null);
    const url = await fileAddress(f.pfad);
    if (url) onShow({ file: f, url });
    else setNote(`${f.name} ist nicht im Speicher: das Hochladen brach ab. Bitte noch einmal hochladen.`);
  };

  const upload = async (file: File) => {
    setBusy(true);
    setNote(`${file.name} wird hochgeladen.`);
    const r = await storeFile(project, belegId, file).catch(() => ({ ok: false as const, why: "Die Datei ging nicht hinaus. Bitte später noch einmal." }));
    setBusy(false);
    if (!r.ok) return setNote(r.why);
    setFiles((list) => [r.file, ...(list ?? [])]);
    setNote(`Hochgeladen, gespeichert für ${account.firma}. Typ, Größe und Prüfsumme hat Ihr Browser berechnet.`);
    void show(r.file);
  };

  return (
    <div className="flex shrink-0 flex-col gap-1 bg-surface px-4 py-2 text-xs shadow-line-bottom">
      <div className="flex items-center gap-2">
        <span className="flex-1 text-fg-secondary">{files === null ? "Dateien werden geladen." : files.length ? `${files.length === 1 ? "1 Datei" : `${files.length} Dateien`} zu diesem Beleg` : "Noch keine Datei zu diesem Beleg"}</span>
        <button type="button" className={small} disabled={busy} onClick={() => input.current?.click()}>
          <Upload className="size-3.5 text-fg-secondary" aria-hidden />
          Datei hinterlegen
        </button>
        <input
          ref={input}
          type="file"
          accept="application/pdf,image/jpeg,image/png,.pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (f) void upload(f);
          }}
        />
      </div>
      {files && files.length > 0 && (
        <ul className="flex flex-col gap-1">
          {files.map((f) => {
            const Icon = f.typ === "application/pdf" ? FileText : ImageIcon;
            return (
              <li key={f.id} className="flex items-center gap-2">
                <Icon className="size-3.5 shrink-0 text-fg-secondary" aria-hidden />
                <span className="min-w-0 flex-1 truncate" title={`${f.name}, SHA-256 ${f.sha256}`}>
                  <span className="text-fg">{f.name}</span>
                  <span className="text-fg-secondary">
                    {" "}
                    · {TYPE_TEXT[f.typ]}, {sizeText(f.groesse)} · {f.person}, {when(f.zeit)}
                  </span>
                </span>
                <button type="button" className={small} aria-pressed={shown?.id === f.id} onClick={() => void show(f)}>
                  {shown?.id === f.id ? "Gelesene Seite" : "Ansehen"}
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {note && (
        <p role="status" className="text-fg-secondary">
          {note}
        </p>
      )}
    </div>
  );
}

/** A stored file in the viewer: a PDF in the browser's own reader, a photo as it is, with who stored it and its checksum. */
export function FileView({ shown }: { shown: ShownFile }) {
  const { file, url } = shown;
  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      <p className="text-xs text-fg-secondary">
        Hochgeladen von {file.person} am {when(file.zeit)}. SHA-256 {file.sha256.slice(0, 12)}…, im Browser berechnet.
      </p>
      {file.typ === "application/pdf" ? (
        <iframe src={url} title={file.name} className="min-h-[480px] w-full flex-1 rounded-md bg-surface shadow-ring" />
      ) : (
        // a signed address on Supabase that lives ten minutes: Next's image optimisation does not apply
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={file.name} className="h-auto w-full rounded-md shadow-ring" />
      )}
    </div>
  );
}
