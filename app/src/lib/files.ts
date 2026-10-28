"use client";

/**
 * Files a signed-in company stores for a Beleg (step 10, part E): the original scan or photo behind what the twin read.
 * First the row in `datei` (the server sets id, company, person, time and the place `<firma_id>/<id>`), then the file
 * to that place in the private bucket `dateien`, never with `upsert`, so nothing is overwritten. The original viewer
 * opens a stored file by a signed address that lives ten minutes.
 *
 * Name, type, size and SHA-256 are computed here in the browser before the upload, and the page says so. A check on the
 * server that reads the stored file comes before real data (`backend/README.md`).
 */

import { supabase } from "./account";

export const MAX_BYTES = 20 * 1024 * 1024;

export type FileType = "application/pdf" | "image/jpeg" | "image/png";

export const TYPE_TEXT: Record<FileType, string> = { "application/pdf": "PDF", "image/jpeg": "JPEG", "image/png": "PNG" };

/** A stored file as the original viewer lists it. */
export type StoredFile = { id: string; name: string; typ: FileType; groesse: number; sha256: string; person: string; zeit: string; pfad: string };

/** The type by the first bytes of the file, not by its name or what the browser claims: PDF, JPEG or PNG, else null. */
export function sniffType(head: Uint8Array): FileType | null {
  const starts = (...bytes: number[]) => bytes.every((b, i) => head[i] === b);
  if (starts(0x25, 0x50, 0x44, 0x46, 0x2d)) return "application/pdf"; // %PDF-
  if (starts(0xff, 0xd8, 0xff)) return "image/jpeg";
  if (starts(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return "image/png";
  return null;
}

/**
 * The name as the database takes it (`001_basis.sql`): no slash or backslash, no control characters, none that turn
 * the reading direction, at most 255 characters; each such character becomes "_".
 */
export function cleanName(name: string): string {
  const clean = name.replace(/[/\\\p{Cc}‎‏‪-‮⁦-⁩]/gu, "_").trim();
  return (clean || "Datei").slice(0, 255);
}

export function hex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** "1,2 MB", "840 KB": for a line under a file. */
export function sizeText(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toLocaleString("de-AT", { maximumFractionDigits: 1 })} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** What is wrong with a file before anything is sent, in the app's words; null when it may go up. */
export function fileRefusal(size: number, type: FileType | null): string | null {
  if (size === 0) return "Die Datei ist leer.";
  if (size > MAX_BYTES) return "Die Datei ist größer als 20 MB.";
  if (!type) return "Nur PDF, JPEG oder PNG. Diese Datei ist keine davon.";
  return null;
}

/** The files of the own company for one Beleg, newest first (the policies return nothing of another company). */
export async function listFiles(project: string, belegId: string): Promise<StoredFile[]> {
  const sb = await supabase();
  const { data, error } = await sb
    .from("datei")
    .select("id, name, typ, groesse, sha256, person, zeit, pfad")
    .eq("projekt_id", project)
    .eq("beleg_id", belegId)
    .order("zeit", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as StoredFile[];
}

/**
 * Stores one file for a Beleg: checks it, computes its checksum, adds the row, then puts the file at the row's place.
 * Returns the stored file or why it did not go up.
 */
export async function storeFile(project: string, belegId: string, file: File): Promise<{ ok: true; file: StoredFile } | { ok: false; why: string }> {
  const typ = sniffType(new Uint8Array(await file.slice(0, 8).arrayBuffer()));
  const refused = fileRefusal(file.size, typ);
  if (refused || !typ) return { ok: false, why: refused ?? "" };
  const bytes = await file.arrayBuffer();
  const sha256 = hex(await crypto.subtle.digest("SHA-256", bytes));
  const sb = await supabase();
  const { data: row, error } = await sb
    .from("datei")
    .insert({ projekt_id: project, beleg_id: belegId, name: cleanName(file.name), typ, groesse: file.size, sha256 })
    .select("id, name, typ, groesse, sha256, person, zeit, pfad")
    .single();
  if (error || !row) return { ok: false, why: "Der Server hat die Datei nicht angenommen. Bitte die Seite neu laden." };
  const stored = row as StoredFile;
  const { error: up } = await sb.storage.from("dateien").upload(stored.pfad, new Blob([bytes], { type: typ }), { contentType: typ, upsert: false });
  if (up) return { ok: false, why: "Die Datei kam nicht ganz an. Bitte noch einmal hochladen." };
  return { ok: true, file: stored };
}

/** A signed address of a stored file, valid ten minutes; null when the file is not (or no longer) there. */
export async function fileAddress(pfad: string): Promise<string | null> {
  const sb = await supabase();
  const { data, error } = await sb.storage.from("dateien").createSignedUrl(pfad, 600);
  return error ? null : data.signedUrl;
}

/**
 * Fetches a stored file by its signed address and gives it to the viewer as an address of this page (Supabase serves
 * files with a policy that keeps the browser's PDF reader out of a frame). The checksum is computed again on the way:
 * `intact` says whether the file is the one whose SHA-256 was noted at the upload. Null when it is not there.
 */
export async function openFile(f: StoredFile): Promise<{ url: string; intact: boolean } | null> {
  const signed = await fileAddress(f.pfad);
  if (!signed) return null;
  const res = await fetch(signed);
  if (!res.ok) return null;
  const bytes = await res.arrayBuffer();
  const intact = hex(await crypto.subtle.digest("SHA-256", bytes)) === f.sha256;
  return { url: URL.createObjectURL(new Blob([bytes], { type: f.typ })), intact };
}
