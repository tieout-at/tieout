// Dünne Schicht über der Claude API: eine Anfrage, strukturierte Antwort nach Zod-Schema.
// Modell und Aufwand an einer Stelle, damit Lernschleife und Agent dasselbe nutzen.

import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import type { z } from "zod";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const MODELL = "claude-opus-5-5";
export type Aufwand = "low" | "medium" | "high";

let client: Anthropic | undefined;

/** Lädt product/zuruf/.env, falls die Umgebung den Key nicht schon setzt. */
function ladeEnv(): void {
  if (process.env.ANTHROPIC_API_KEY) return;
  const datei = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", ".env");
  if (existsSync(datei)) process.loadEnvFile(datei);
  // Leere Werte aus der Vorlage nicht als Key verwenden.
  if (process.env.ANTHROPIC_API_KEY === "") delete process.env.ANTHROPIC_API_KEY;
}

function holeClient(): Anthropic {
  if (!client) {
    ladeEnv();
    client = new Anthropic();
  }
  return client;
}

export interface Verbrauch {
  anfragen: number;
  eingabe: number;
  ausgabe: number;
}

export const verbrauch: Verbrauch = { anfragen: 0, eingabe: 0, ausgabe: 0 };

/** Kosten in US-Dollar nach Listenpreis Claude Opus 5.5 ($4 / $20 pro Million Token, Stand Skill-Referenz 6.10.2026). */
export function kostenUsd(v: Verbrauch = verbrauch): number {
  return (v.eingabe * 4 + v.ausgabe * 20) / 1_000_000;
}

export class Ablehnung extends Error {}

export async function frageStrukturiert<S extends z.ZodType>(opts: {
  schema: S;
  system: string;
  nachrichten: Anthropic.Beta.BetaMessageParam[];
  aufwand: Aufwand;
  maxTokens?: number;
}): Promise<z.infer<S>> {
  const antwort = await holeClient().beta.messages.parse({
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
  return antwort.parsed_output as z.infer<S>;
}
