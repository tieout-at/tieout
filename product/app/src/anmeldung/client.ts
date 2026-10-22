"use client";

// Supabase im Browser: Sitzung liegt in Cookies, damit der Worker sie vor jeder Seite prüfen kann.
// Rückruf-Adressen (Google, Einladung, Link aus der Mail) wertet `sitzungAusAdresse` selbst aus.

import { createBrowserClient } from "@supabase/ssr";
import type { EmailOtpType, SupabaseClient, User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { ANMELDUNG_AN, SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./konfig";

let client: SupabaseClient | null = null;

export function supabase(): SupabaseClient | null {
  if (!ANMELDUNG_AN) return null;
  client ??= createBrowserClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { detectSessionInUrl: false, flowType: "pkce" },
  });
  return client;
}

/** Meldet an, wenn die Adresse von Google, aus einer Einladung oder aus dem Link in der Mail kommt. */
export async function sitzungAusAdresse(sb: SupabaseClient): Promise<string | null> {
  const url = new URL(window.location.href);
  const hash = new URLSearchParams(url.hash.slice(1));
  const fehler = url.searchParams.get("error_description") ?? hash.get("error_description");
  if (fehler) return fehler;

  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const typ = url.searchParams.get("type") as EmailOtpType | null;
  const zugang = hash.get("access_token");
  const erneuern = hash.get("refresh_token");

  let error: { message: string } | null = null;
  if (code) ({ error } = await sb.auth.exchangeCodeForSession(code));
  else if (tokenHash && typ) ({ error } = await sb.auth.verifyOtp({ token_hash: tokenHash, type: typ }));
  else if (zugang && erneuern) ({ error } = await sb.auth.setSession({ access_token: zugang, refresh_token: erneuern }));
  else return null;

  window.history.replaceState(null, "", url.pathname + (url.searchParams.get("weiter") ? `?weiter=${encodeURIComponent(url.searchParams.get("weiter")!)}` : ""));
  return error ? error.message : null;
}

/** Angemeldete Person (null, solange unbekannt oder ohne Anmeldung). */
export function useNutzer(): User | null {
  const [nutzer, setNutzer] = useState<User | null>(null);
  useEffect(() => {
    const sb = supabase();
    if (!sb) return;
    sb.auth.getUser().then(({ data }) => setNutzer(data.user));
    const { data } = sb.auth.onAuthStateChange((_e, s) => setNutzer(s?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, []);
  return nutzer;
}

export function anzeigename(n: User): string {
  const m = n.user_metadata ?? {};
  return (m.name as string) || (m.full_name as string) || n.email?.split("@")[0] || "";
}

export function initialen(name: string): string {
  const teile = name.trim().split(/[\s._-]+/).filter(Boolean);
  return ((teile[0]?.[0] ?? "") + (teile[1]?.[0] ?? "")).toUpperCase() || "?";
}

/** Nur sichere Ziele innerhalb der App (kein offener Redirect). */
export function weiterZiel(): string {
  const w = new URL(window.location.href).searchParams.get("weiter");
  return w && w.startsWith("/") && !w.startsWith("//") ? w : "/";
}
