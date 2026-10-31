"use client";

/**
 * Decisions, tasks, ticks and settings of a signed-in company, kept in the database instead of this browser (step 10,
 * part C). `decisions.ts` asks here first: with an account the lists come from Supabase and every new entry goes
 * there; without one this file stays idle and the browser keeps them as before (the demo).
 *
 * The database decides (`backend/migrations/001_basis.sql`): who may take which step, four eyes, the company, the
 * person and the time. This file shows a new entry at once and replaces it with the database's row; if the database
 * refuses, the entry goes away again and the page is told why. Everyone of the company sees new entries live.
 */

import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";
import type { Eingang } from "@tieout/kern";

import { currentAccount, onAccountChange, ROLE_TEXT, supabase, type Role } from "./account";
import { DECISION_TEXT, refusal, type DecisionState } from "./decision-rules";
import type { Decision, Setting, Task, TaskCheck } from "./decisions";

/** The page's event for "an entry was added or read"; `decisions.ts` listens to it as well. */
export const CHANGED = "tieout:entries";
/** The page's event for "the database refused an entry"; `detail` is the reason in the app's words. */
export const REFUSED = "tieout:abgelehnt";

export type ListKey = "entscheidungen" | "aufgaben" | "erledigt" | "einstellungen" | "eingaenge";

const TABLE: Record<ListKey, string> = {
  entscheidungen: "entscheidung",
  aufgaben: "aufgabe",
  erledigt: "aufgabe_erledigt",
  einstellungen: "ablauf_einstellung",
  eingaenge: "eingang",
};

/** Server rows in the shapes of `decisions.ts`, so every page and the core read them unchanged. */
type Row = Record<string, unknown>;

/** "2026-10-28T12:05", the browser's local time, as `localTime()` in decisions.ts writes it. */
export function localMinute(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** "Maximilian Seipl (Abrechnung)": the person who took the step and the role it needs. */
export function whoText(person: unknown, rolle: unknown): string {
  const role = ROLE_TEXT[rolle as Role];
  return role ? `${String(person)} (${role})` : String(person);
}

export const FROM_ROW: Record<ListKey, (r: Row) => unknown> = {
  entscheidungen: (r): Decision => ({
    fundSchluessel: String(r.fund_schluessel),
    zeit: localMinute(String(r.zeit)),
    wer: whoText(r.person, r.rolle),
    von: String(r.user_id),
    stand: r.stand as Decision["stand"],
    ...(r.grund ? { grund: String(r.grund) } : {}),
  }),
  aufgaben: (r): Task => ({
    id: String(r.id),
    fundSchluessel: String(r.fund_schluessel),
    fund: String(r.fund),
    href: String(r.href),
    zeit: localMinute(String(r.zeit)),
    wer: String(r.person),
    text: String(r.text),
    zustaendig: String(r.zustaendig),
    bis: r.bis ? String(r.bis) : null,
  }),
  erledigt: (r): TaskCheck => ({ aufgabeId: String(r.aufgabe_id), zeit: localMinute(String(r.zeit)), wer: String(r.person), erledigt: r.erledigt === true }),
  einstellungen: (r): Setting => ({ block: String(r.block), feld: r.feld as Setting["feld"], wert: String(r.wert), zeit: localMinute(String(r.zeit)) }),
  eingaenge: (r): Eingang => ({ lueckeSchluessel: String(r.luecke_schluessel), zeit: localMinute(String(r.zeit)), wer: String(r.person), gueltig: r.gueltig === true, ...(r.unterschrieben_am ? { am: String(r.unterschrieben_am) } : {}), ...(r.datei_id ? { dateiId: String(r.datei_id) } : {}) }),
};

/** Only the columns the browser may fill (the grants of the migration); the database adds the rest. */
export const TO_ROW: Record<ListKey, (e: never) => Row> = {
  entscheidungen: (d: Decision) => ({ fund_schluessel: d.fundSchluessel, stand: d.stand, grund: d.grund ?? null }),
  aufgaben: (t: Task) => ({ id: t.id, fund_schluessel: t.fundSchluessel, fund: t.fund, href: t.href, text: t.text, zustaendig: t.zustaendig, bis: t.bis }),
  erledigt: (c: TaskCheck) => ({ aufgabe_id: c.aufgabeId, erledigt: c.erledigt }),
  einstellungen: (s: Setting) => ({ block: s.block, feld: s.feld, wert: s.wert }),
  eingaenge: (e: Eingang) => ({ luecke_schluessel: e.lueckeSchluessel, gueltig: e.gueltig, datei_id: e.dateiId ?? null, unterschrieben_am: e.am ?? null }),
};

/** In order of their entry, so that "the latest entry counts" holds within one minute too. */
const ORDER: Record<ListKey, string> = { entscheidungen: "folge", aufgaben: "zeit", erledigt: "id", einstellungen: "id", eingaenge: "id" };

/**
 * The database's reason in the app's words: its own German messages as they are; "Von geprueft geht es nicht zu …"
 * (someone decided in the meantime) with the words of the decision bar; anything technical in one line.
 */
export function refusalReason(message: string): string {
  const step = /^Von (\w+) geht es nicht zu (\w+)\.$/.exec(message);
  if (step && Object.hasOwn(DECISION_TEXT, step[1]) && Object.hasOwn(DECISION_TEXT, step[2])) {
    const [from, to] = [step[1] as DecisionState, step[2] as DecisionState];
    if (from === to) return `Der Fund steht schon auf ${DECISION_TEXT[from]}.`;
    const why = refusal(from, to);
    return `Der Fund steht inzwischen auf ${DECISION_TEXT[from]}.${why ? ` ${why}` : ""}`;
  }
  if (/^(Diesen Schritt|Vier Augen|Nur Mitglieder|Ohne das unterschriebene Blatt)/.test(message)) return message;
  if (/check constraint/i.test(message)) return "Der Eintrag passt nicht zu den Regeln der Datenbank und wurde nicht gespeichert.";
  return "Der Server hat den Eintrag nicht gespeichert. Bitte die Seite neu laden.";
}

let lists: Record<ListKey, unknown[]> | null = null;
const pending: Record<ListKey, unknown[]> = { entscheidungen: [], aufgaben: [], erledigt: [], einstellungen: [], eingaenge: [] };
let firma: string | null = null;
/** Every list of the company came from the database; before that a page must not hand out a document. */
let complete = false;
let channel: RealtimeChannel | null = null;
let started = false;
/** The state of the account this file last followed. */
let seen: string | null = null;

function changed() {
  window.dispatchEvent(new Event(CHANGED));
}

async function fetchList(sb: SupabaseClient, key: ListKey): Promise<boolean> {
  const { data, error } = await sb.from(TABLE[key]).select("*").order(ORDER[key], { ascending: true });
  if (error || !lists) return false;
  lists[key] = (data ?? []).map((r) => FROM_ROW[key](r as Row));
  return true;
}

async function fetchAll(sb: SupabaseClient) {
  const done = await Promise.all((Object.keys(TABLE) as ListKey[]).map((k) => fetchList(sb, k)));
  complete = done.every(Boolean);
  changed();
}

async function activate(name: string) {
  firma = name;
  lists = { entscheidungen: [], aufgaben: [], erledigt: [], einstellungen: [], eingaenge: [] };
  const sb = await supabase();
  // signed out or switched while the client loaded: nothing to do for this company any more
  if (firma !== name) return;
  // Live first, then the lists, so an entry made in between is not missed. An entry of another person of the company
  // arrives without reloading (the policies decide what is sent).
  const live = sb.channel(`firma-${name}`);
  for (const key of Object.keys(TABLE) as ListKey[])
    live.on("postgres_changes", { event: "INSERT", schema: "public", table: TABLE[key] }, () => void fetchList(sb, key).then(changed));
  live.subscribe();
  channel = live;
  document.addEventListener("visibilitychange", onVisible);
  await fetchAll(sb);
}

function onVisible() {
  if (document.visibilityState === "visible" && lists) void supabase().then(fetchAll);
}

function deactivate() {
  firma = null;
  complete = false;
  lists = null;
  for (const k of Object.keys(pending) as ListKey[]) pending[k] = [];
  document.removeEventListener("visibilitychange", onVisible);
  // the channel of this company, taken before it is forgotten: removed once the client answers (review finding)
  const old = channel;
  channel = null;
  if (old) void supabase().then((sb) => sb.removeChannel(old));
  changed();
}

function follow() {
  const a = currentAccount();
  const name = a.stand === "konto" ? a.firma : null;
  // from "laden" to the demo the lists of this browser count again: the page is told, as on any other change
  const was = seen;
  seen = a.stand;
  if (name === firma) return void (was !== null && was !== a.stand && changed());
  if (firma) deactivate();
  if (name) void activate(name);
}

function start() {
  if (started || typeof window === "undefined") return;
  started = true;
  onAccountChange(follow);
  follow();
}

/** Said when an entry is made while the account of this browser is still being read. */
export const WAITING = "Das Konto wird noch geladen. Bitte gleich noch einmal.";

/**
 * Whether the account of this browser is still being read: then an entry goes neither to the database (the company is
 * not known yet) nor to the browser (it would land under the demo, or over its entries). Review finding, 28.10.2026.
 */
export function serverWaiting(): boolean {
  start();
  return currentAccount().stand === "laden";
}

/** Tells the page that an entry was not kept, and why (the notice "Nicht gespeichert."). */
export function refuse(why: string) {
  window.dispatchEvent(new CustomEvent(REFUSED, { detail: why }));
}

/** Whether what this browser knows is whole: no company, or all of its lists arrived. */
export function serverComplete(): boolean {
  start();
  return currentAccount().stand !== "laden" && (!firma || complete);
}

/** Whether entries of this browser go to the database: signed in with a company. */
export function serverActive(): boolean {
  start();
  return firma !== null;
}

/** The list for `key` with the entries still on their way, or null without an account (then the browser's list counts). */
export function serverRead(key: ListKey): unknown[] | null {
  start();
  // While a session is being read, nothing: never the demo entries of this browser under a company's name.
  if (currentAccount().stand === "laden") return [];
  if (!firma || !lists) return null;
  return [...lists[key], ...pending[key]];
}

/**
 * Adds an entry for the signed-in company: shown at once, then written to the database and replaced by its row.
 * Returns false without an account (then the browser keeps the entry).
 */
export function serverAppend(key: ListKey, entry: unknown): boolean {
  if (!serverActive()) return false;
  pending[key].push(entry);
  changed();
  void supabase().then(async (sb) => {
    const { error } = await sb.from(TABLE[key]).insert((TO_ROW[key] as (e: unknown) => Row)(entry));
    if (!error) await fetchList(sb, key);
    pending[key] = pending[key].filter((x) => x !== entry);
    changed();
    if (error) refuse(refusalReason(error.message));
  });
  return true;
}
