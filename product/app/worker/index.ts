// Prüfskript vor den statischen Seiten (Cloudflare Worker mit Assets, `run_worker_first` in wrangler.jsonc).
// Ohne gültige Supabase-Sitzung geht es zur Anmeldeseite; die Seiten selbst bleiben fertige Dateien aus `out/`.
// Dazu zwei kleine Schnittstellen für die Einstellungen: Mitglieder auflisten und einladen mit Anmeldelink (nur angemeldet).
// Solange src/anmeldung/konfig.ts leer ist, lässt das Skript alles durch (Schutz dann wie bisher über Cloudflare Access).

import { createServerClient, parseCookieHeader, serializeCookieHeader } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Firma } from "../../whatsapp/src/firma.ts";
import { zurufAnfrage, type Zaehler, type ZurufUmgebung } from "../../whatsapp/worker/route.ts";
import agentFirma from "../data/generated/agent-firma.json";
import { ANMELDESEITE, ANMELDUNG_AN, SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "../src/anmeldung/konfig";
import { neueAdresse } from "../src/umleitung";

/** Dazu ZURUF_ECHT und ANTHROPIC_API_KEY für den WhatsApp-Agenten (Secrets, zur Laufzeit gelesen; ohne sie: vorgespielt). */
interface Env extends ZurufUmgebung {
  ASSETS: { fetch(anfrage: Request): Promise<Response> };
  /** Geheimer Schlüssel (Cloudflare-Secret), nur für Mitglieder und Einladungen. */
  SUPABASE_SECRET_KEY?: string;
}

const OFFEN = [/^\/anmelden(\/|$)/, /^\/_next\/static\//, /^\/favicon\.ico$/, /^\/robots\.txt$/];

const worker = {
  async fetch(anfrage: Request, env: Env): Promise<Response> {
    const url = new URL(anfrage.url);
    // Old addresses from before the rename (befunde, ordner, ledger, zuruf): permanent redirect, before the sign-in check.
    const neu = neueAdresse(url.pathname);
    if (neu) return Response.redirect(`${url.origin}${neu}${url.search}`, 301);
    // WhatsApp-Agent ohne Login (App per Link): hier, vor den Assets. Mit Login erst nach der Sitzungsprüfung in `schnittstelle`.
    if (!ANMELDUNG_AN) {
      const z = await zuruf(anfrage, env);
      if (z) return z;
    }
    if (!ANMELDUNG_AN || OFFEN.some((m) => m.test(url.pathname))) return env.ASSETS.fetch(anfrage);

    const kekse: { name: string; value: string; options: Record<string, unknown> }[] = [];
    const sb = createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      cookies: {
        getAll: () => parseCookieHeader(anfrage.headers.get("Cookie") ?? "").map((k) => ({ name: k.name, value: k.value ?? "" })),
        setAll: (liste) => {
          kekse.push(...liste);
        },
      },
    });
    const { data } = await sb.auth.getClaims();
    const angemeldet = Boolean(data?.claims?.sub);

    let antwort: Response;
    if (!angemeldet) {
      const seite = anfrage.method === "GET" && (anfrage.headers.get("Accept") ?? "").includes("text/html");
      antwort = seite
        ? Response.redirect(`${url.origin}${ANMELDESEITE}?weiter=${encodeURIComponent(url.pathname + url.search)}`, 302)
        : json({ fehler: "Nicht angemeldet" }, 401);
    } else if (url.pathname.startsWith("/api/")) {
      antwort = await schnittstelle(anfrage, url, env);
    } else {
      antwort = await env.ASSETS.fetch(anfrage);
    }

    if (kekse.length === 0) return antwort;
    const mitKeksen = new Response(antwort.body, antwort);
    for (const k of kekse) mitKeksen.headers.append("Set-Cookie", serializeCookieHeader(k.name, k.value, k.options));
    return mitKeksen;
  },
};

export default worker;

/**
 * WhatsApp-Agent (product/whatsapp) für /api/zuruf/…, sonst null. Echt nur mit ZURUF_ECHT=an, Schlüssel und Zähler in
 * Supabase; sonst meldet der Status „nicht verfügbar“ und die App spielt die Szene vor, ohne KI-Aufruf.
 * Schutz ohne Login: Schalter, 40 KI-Aufrufe pro Tag, 20 US-Dollar pro Monat, Monatslimit in der Anthropic-Konsole.
 */
function zuruf(anfrage: Request, env: Env): Promise<Response | null> {
  const admin = env.SUPABASE_SECRET_KEY ? adminClient(env.SUPABASE_SECRET_KEY) : null;
  return zurufAnfrage(anfrage, env, agentFirma as Firma, admin ? supabaseZaehler(admin) : null);
}

function adminClient(schluessel: string): SupabaseClient {
  return createClient(SUPABASE_URL, schluessel, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function schnittstelle(anfrage: Request, url: URL, env: Env): Promise<Response> {
  const z = await zuruf(anfrage, env);
  if (z) return z;
  if (!env.SUPABASE_SECRET_KEY) return json({ fehler: "Mitglieder sind noch nicht eingerichtet" }, 503);
  const admin = adminClient(env.SUPABASE_SECRET_KEY);

  if (url.pathname === "/api/mitglieder" && anfrage.method === "GET") {
    const { data, error } = await admin.auth.admin.listUsers({ perPage: 200 });
    if (error) return json({ fehler: error.message }, 500);
    const mitglieder = data.users.map((n) => ({
      id: n.id,
      email: n.email ?? "",
      name: (n.user_metadata?.name as string) || (n.user_metadata?.full_name as string) || "",
      bild: (n.user_metadata?.avatar_url as string) || "",
      eingeladen: n.invited_at ?? null,
      zuletzt: n.last_sign_in_at ?? null,
    }));
    return json({ mitglieder });
  }

  // Einladen ohne Mail: Person anlegen (falls neu) und einen einmaligen Anmeldelink erzeugen, den das Team weitergibt.
  // Mit Gmail-Adresse geht es danach jederzeit über „Mit Google fortfahren“.
  if (url.pathname === "/api/einladen" && anfrage.method === "POST") {
    const { email } = (await anfrage.json().catch(() => ({}))) as { email?: string };
    const adresse = (email ?? "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adresse)) return json({ fehler: "Keine gültige E-Mail-Adresse" }, 400);
    const neu = await admin.auth.admin.createUser({ email: adresse, email_confirm: true });
    if (neu.error && !/already|registered|exists/i.test(neu.error.message)) return json({ fehler: neu.error.message }, 400);
    const { data, error } = await admin.auth.admin.generateLink({ type: "magiclink", email: adresse, options: { redirectTo: `${url.origin}${ANMELDESEITE}` } });
    if (error) return json({ fehler: error.message }, 400);
    return json({ link: data.properties.action_link });
  }

  return json({ fehler: "Unbekannt" }, 404);
}

/**
 * KI-Aufrufe und Kosten in Supabase (product/whatsapp/worker/supabase.sql: zuruf_stand, zuruf_buche).
 * Fehlt die Tabelle oder geht etwas schief, gelten die Grenzen als erreicht: dann spielt die App die Szene vor.
 */
function supabaseZaehler(admin: SupabaseClient): Zaehler {
  return {
    stand: async (tag) => {
      const { data, error } = await admin.rpc("zuruf_stand", { p_tag: tag }).single<{ heute: number; monat_usd: number | string }>();
      if (error || !data) return { heute: Number.POSITIVE_INFINITY, monatUsd: Number.POSITIVE_INFINITY };
      return { heute: Number(data.heute), monatUsd: Number(data.monat_usd) };
    },
    buche: async (tag, aufrufe, usd) => {
      const { error } = await admin.rpc("zuruf_buche", { p_tag: tag, p_aufrufe: aufrufe, p_usd: usd });
      if (error) throw new Error(`Zähler: ${error.message}`);
    },
  };
}

function json(daten: unknown, status = 200): Response {
  return new Response(JSON.stringify(daten), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } });
}
