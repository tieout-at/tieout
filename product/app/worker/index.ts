// Prüfskript vor den statischen Seiten (Cloudflare Worker mit Assets, `run_worker_first` in wrangler.jsonc).
// Ohne gültige Supabase-Sitzung geht es zur Anmeldeseite; die Seiten selbst bleiben fertige Dateien aus `out/`.
// Dazu zwei kleine Schnittstellen für die Einstellungen: Mitglieder auflisten und einladen mit Anmeldelink (nur angemeldet).
// Solange src/anmeldung/konfig.ts leer ist, lässt das Skript alles durch (Schutz dann wie bisher über Cloudflare Access).

import { createServerClient, parseCookieHeader, serializeCookieHeader } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Firma } from "../../zuruf/src/firma.ts";
import { zurufAnfrage, type Tageszaehler, type ZurufUmgebung } from "../../zuruf/worker/route.ts";
import zurufFirma from "../data/generated/zuruf-firma.json";
import { ANMELDESEITE, ANMELDUNG_AN, SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "../src/anmeldung/konfig";

/** Dazu ZURUF_ECHT (Variable, Standard aus) und ANTHROPIC_API_KEY (Secret) für den Zuruf-Agenten. */
interface Env extends ZurufUmgebung {
  ASSETS: { fetch(anfrage: Request): Promise<Response> };
  /** Geheimer Schlüssel (Cloudflare-Secret), nur für Mitglieder und Einladungen. */
  SUPABASE_SECRET_KEY?: string;
}

const OFFEN = [/^\/anmelden(\/|$)/, /^\/_next\/static\//, /^\/favicon\.ico$/, /^\/robots\.txt$/];

const worker = {
  async fetch(anfrage: Request, env: Env): Promise<Response> {
    const url = new URL(anfrage.url);
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

async function schnittstelle(anfrage: Request, url: URL, env: Env): Promise<Response> {
  if (!env.SUPABASE_SECRET_KEY) return json({ fehler: "Mitglieder sind noch nicht eingerichtet" }, 503);
  const admin = createClient(SUPABASE_URL, env.SUPABASE_SECRET_KEY, { auth: { persistSession: false, autoRefreshToken: false } });

  // Zuruf-Agent (product/zuruf): nur mit ZURUF_ECHT=an, Schlüssel und Zähler; sonst 404 oder „nicht eingerichtet“.
  const zuruf = await zurufAnfrage(anfrage, env, zurufFirma as Firma, supabaseZaehler(admin));
  if (zuruf) return zuruf;

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

/** KI-Aufrufe pro Tag in Supabase (product/zuruf/worker/supabase.sql). Fehlt die Tabelle, gilt die Grenze als erreicht. */
function supabaseZaehler(admin: SupabaseClient): Tageszaehler {
  return {
    stand: async (tag) => {
      const { data, error } = await admin.from("zuruf_tageszaehler").select("ki_aufrufe").eq("tag", tag).maybeSingle();
      return error ? Number.POSITIVE_INFINITY : ((data?.ki_aufrufe as number | undefined) ?? 0);
    },
    erhoehe: async (tag) => {
      const { error } = await admin.rpc("zuruf_zaehle", { p_tag: tag });
      if (error) throw new Error(`Zähler: ${error.message}`);
    },
  };
}

function json(daten: unknown, status = 200): Response {
  return new Response(JSON.stringify(daten), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } });
}
