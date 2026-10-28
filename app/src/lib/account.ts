"use client";

/**
 * Sign-in for companies with an account (step 10). The demo stays as it is: without a session in this browser the
 * Supabase client is never loaded, so the pages cost what they cost before. The client loads only when this browser
 * holds a session, when it comes back from a sign-in link, or when the page "Anmelden" asks for it.
 *
 * Who belongs to which company and in which role lives in the database (`backend/migrations/001_basis.sql`, tables
 * `mitglied` and `firma`); the rules there decide what a member may see and do, never this file.
 */

import { useSyncExternalStore } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

/** Project tieout-app (Frankfurt). Both values are public by design: every page that signs in carries them. The
 * publishable key opens nothing by itself; the policies of the database decide every row. No secret lives here. */
export const SUPABASE_URL = "https://skvctanwhocirlmozmon.supabase.co";
export const SUPABASE_KEY = "sb_publishable_WhOVwkI6q-iuCFwbJLYlUA_bsEi1xT0";
const STORAGE_KEY = "sb-skvctanwhocirlmozmon-auth-token";

export type Role = "abrechnung" | "geschaeftsfuehrung" | "bauleitung";

export const ROLE_TEXT: Record<Role, string> = {
  abrechnung: "Abrechnung",
  geschaeftsfuehrung: "Geschäftsführung",
  bauleitung: "Bauleitung",
};

export type Account =
  /** No session in this browser: the demo with the sample data. */
  | { stand: "beispiel" }
  | { stand: "laden" }
  /** Signed in, with the company and roles the database holds for this person. */
  | { stand: "konto"; email: string; person: string; firma: string; rollen: Role[] }
  /** Signed in, but the database names no company for this person (yet): sees nothing, can add nothing. */
  | { stand: "ohne_firma"; email: string };

/** Whether the client must load on this page: a stored session, or the answer of a sign-in link in the address. */
export function mayHaveSession(storage: Pick<Storage, "getItem"> | null, hash: string, search: string): boolean {
  let stored = false;
  try {
    stored = !!storage?.getItem(STORAGE_KEY);
  } catch {
    stored = false;
  }
  return stored || /(?:^|[#&])(?:access_token|error_description)=/.test(hash) || /[?&]code=/.test(search);
}

/** The roles of a member row, in the order the app names them; anything unknown is left out. */
export function rolesOf(value: unknown): Role[] {
  const list = Array.isArray(value) ? value : [];
  return (Object.keys(ROLE_TEXT) as Role[]).filter((r) => list.includes(r));
}

/** "Abrechnung und Geschäftsführung" */
export function rolesText(rollen: readonly Role[]): string {
  const words = rollen.map((r) => ROLE_TEXT[r]);
  return words.length > 1 ? `${words.slice(0, -1).join(", ")} und ${words.at(-1)}` : (words[0] ?? "");
}

let client: Promise<SupabaseClient> | null = null;

/** The Supabase client, loaded as a chunk of its own on first use. */
export function supabase(): Promise<SupabaseClient> {
  client ??= import("@supabase/supabase-js").then(({ createClient }) =>
    createClient(SUPABASE_URL, SUPABASE_KEY, {
      // Implicit flow: the link of the e-mail brings the session in the address, which the client reads and removes.
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: "implicit", storageKey: STORAGE_KEY },
    }),
  );
  return client;
}

const LADEN: Account = { stand: "laden" };
let snapshot: Account = LADEN;
const listeners = new Set<() => void>();
let started = false;

function set(next: Account) {
  snapshot = next;
  for (const l of listeners) l();
}

/** Reads who is signed in and their company from the database. */
async function load(sb: SupabaseClient) {
  const { data } = await sb.auth.getSession();
  const user = data.session?.user;
  if (!user) return set({ stand: "beispiel" });
  const { data: row } = await sb.from("mitglied").select("name, rollen, firma:firma_id (name)").eq("user_id", user.id).maybeSingle();
  const firma = (row?.firma as { name?: string } | null)?.name;
  set(row && firma ? { stand: "konto", email: user.email ?? "", person: row.name as string, firma, rollen: rolesOf(row.rollen) } : { stand: "ohne_firma", email: user.email ?? "" });
}

async function connect() {
  const sb = await supabase();
  sb.auth.onAuthStateChange((event) => {
    // Called inside the client's lock: the database is read after it, never within it.
    if (event === "SIGNED_OUT") set({ stand: "beispiel" });
    else if (event === "SIGNED_IN" || event === "USER_UPDATED") setTimeout(() => void load(sb), 0);
  });
  await load(sb);
}

function start(force: boolean) {
  if (started) return;
  if (!force && !mayHaveSession(window.localStorage, window.location.hash, window.location.search)) return set({ stand: "beispiel" });
  started = true;
  connect().catch(() => set({ stand: "beispiel" }));
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  start(false);
  return () => listeners.delete(listener);
}

/** Who works in this browser: the demo, or a person of a company. `"laden"` while it is being read and on the server. */
export function useAccount(): Account {
  return useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => LADEN,
  );
}

/** Loads the client on the page "Anmelden" even without a session, so a link can be sent from there. */
export function startSignIn() {
  start(true);
}

/**
 * Sends a sign-in link. Only for addresses with an account (sign-up is off); the answer is the same for every
 * address, so the page never tells whether an address has an account.
 */
export async function sendLink(email: string, back: string): Promise<{ ok: true } | { ok: false; why: string }> {
  const sb = await supabase();
  const { error } = await sb.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: false, emailRedirectTo: back } });
  if (!error) return { ok: true };
  if (error.status === 429 || /rate limit/i.test(error.message)) return { ok: false, why: "Zu viele Versuche. Bitte in einer Stunde noch einmal." };
  // An address without an account answers like one with: no hint which addresses have an account.
  if (/signups? not allowed|user not found/i.test(error.message)) return { ok: true };
  return { ok: false, why: "Der Link ging nicht hinaus. Bitte später noch einmal." };
}

export async function signOut() {
  const sb = await supabase();
  await sb.auth.signOut();
  set({ stand: "beispiel" });
}
