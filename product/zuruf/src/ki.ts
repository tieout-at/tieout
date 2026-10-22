// Dünne Schicht über Claude: eine Anfrage, strukturierte Antwort nach Zod-Schema.
// Modell und Aufwand an einer Stelle, damit Lernschleife und Agent dasselbe nutzen.
// Läuft überall (Node, Cloudflare Worker): kein node:fs, kein node:child_process. Der Weg über das Abo und das Laden
// der .env stehen in llm.ts (nur Node).

import type Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import type { z } from "zod";

export const MODELL = "claude-opus-5-5";
export type Aufwand = "low" | "medium" | "high";

export interface Verbrauch {
  anfragen: number;
  eingabe: number;
  ausgabe: number;
}

export const verbrauch: Verbrauch = { anfragen: 0, eingabe: 0, ausgabe: 0 };

/**
 * Kosten in US-Dollar nach Listenpreis Claude Opus 5.5 ($4 / $20 pro Million Token, Stand Skill-Referenz 6.10.2026).
 * Beim Abo ist das nur ein Vergleichswert: Bezahlt wird über das Abo-Limit, nicht über Guthaben.
 */
export function kostenUsd(v: Verbrauch = verbrauch): number {
  return (v.eingabe * 4 + v.ausgabe * 20) / 1_000_000;
}

export class Ablehnung extends Error {}

export interface Anfrage<S extends z.ZodType> {
  schema: S;
  system: string;
  nachrichten: Anthropic.Beta.BetaMessageParam[];
  aufwand: Aufwand;
  maxTokens?: number;
}

/** Eine strukturierte Anfrage an die KI. Wer sie stellt (API oder Abo), entscheidet der Aufrufer. */
export type KiFrage = <S extends z.ZodType>(opts: Anfrage<S>) => Promise<z.infer<S>>;

/** Anfrage über die Claude API mit dem übergebenen Client (Schlüssel aus Umgebung oder Cloudflare-Secret). */
export function apiFrage(client: Anthropic): KiFrage {
  return async (opts) => {
    const antwort = await client.beta.messages.parse({
      model: MODELL,
      max_tokens: opts.maxTokens ?? 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: [{ type: "text", text: opts.system, cache_control: { type: "ephemeral" } }],
      messages: opts.nachrichten,
      output_config: { effort: opts.aufwand, format: betaZodOutputFormat(opts.schema) },
    });
    verbrauch.anfragen++;
    verbrauch.eingabe +=
      antwort.usage.input_tokens + (antwort.usage.cache_creation_input_tokens ?? 0) + (antwort.usage.cache_read_input_tokens ?? 0) * 0.1;
    verbrauch.ausgabe += antwort.usage.output_tokens;
    if (antwort.stop_reason === "refusal") throw new Ablehnung("Anfrage abgelehnt");
    if (antwort.parsed_output == null) throw new Error(`Keine gültige Antwort (stop_reason ${antwort.stop_reason})`);
    return antwort.parsed_output;
  };
}
