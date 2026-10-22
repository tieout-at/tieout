// Dünne Schicht über Claude: eine Anfrage, strukturierte Antwort nach Zod-Schema.
// Modell und Aufwand an einer Stelle, damit Lernschleife und Agent dasselbe nutzen.
//
// Zwei Wege, umschaltbar mit ZURUF_KI in .env oder Umgebung:
// - "api" (Standard): Claude API mit ANTHROPIC_API_KEY. Pflicht für den echten Betrieb (Phase 3).
// - "abo": Claude Code im Kopflos-Modus (claude -p) mit dem eigenen Claude-Abo. Nur zum Entwickeln und Testen.
//   Langsamer (Prozessstart), zählt gegen das Abo-Limit, kein Prompt-Cache über Aufrufe.

import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const MODELL = "claude-opus-5-5";
export type Aufwand = "low" | "medium" | "high";

let client: Anthropic | undefined;
let envGeladen = false;

/** Lädt product/zuruf/.env einmal. Werte aus der Umgebung gehen vor. */
function ladeEnv(): void {
  if (envGeladen) return;
  envGeladen = true;
  const datei = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", ".env");
  if (existsSync(datei)) {
    const vorher = { ...process.env };
    process.loadEnvFile(datei);
    for (const [k, v] of Object.entries(vorher)) if (v) process.env[k] = v;
  }
  // Leere Werte aus der Vorlage nicht als Key verwenden.
  if (process.env.ANTHROPIC_API_KEY === "") delete process.env.ANTHROPIC_API_KEY;
}

export function kiWeg(): "api" | "abo" {
  ladeEnv();
  return process.env.ZURUF_KI === "abo" ? "abo" : "api";
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

export async function frageStrukturiert<S extends z.ZodType>(opts: Anfrage<S>): Promise<z.infer<S>> {
  return kiWeg() === "abo" ? frageUeberAbo(opts) : frageUeberApi(opts);
}

async function frageUeberApi<S extends z.ZodType>(opts: Anfrage<S>): Promise<z.infer<S>> {
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

// ---------- Abo: Claude Code kopflos ----------

/** Pfad zu Claude Code. Unter Windows direkt die claude.exe, damit cmd.exe die JSON-Argumente nicht verstümmelt. */
function claudeBefehl(): string {
  if (process.env.ZURUF_CLAUDE_PFAD) return process.env.ZURUF_CLAUDE_PFAD;
  if (process.platform === "win32" && process.env.APPDATA) {
    const exe = path.join(process.env.APPDATA, "npm", "node_modules", "@anthropic-ai", "claude-code", "bin", "claude.exe");
    if (existsSync(exe)) return exe;
  }
  return "claude";
}

function nachrichtenAlsText(nachrichten: Anthropic.Beta.BetaMessageParam[]): string {
  return nachrichten
    .map((m) => (typeof m.content === "string" ? m.content : (m.content ?? []).map((b) => ("text" in b ? b.text : "")).join("\n")))
    .join("\n\n");
}

/** Nicht mehr als so viele Claude-Code-Prozesse gleichzeitig, sonst bremst das Abo-Limit und der Rechner. */
const MAX_PARALLEL_ABO = Number(process.env.ZURUF_ABO_PARALLEL ?? 3);
let laufend = 0;
const warteschlange: (() => void)[] = [];

async function platz<T>(f: () => Promise<T>): Promise<T> {
  if (laufend >= MAX_PARALLEL_ABO) await new Promise<void>((r) => warteschlange.push(r));
  laufend++;
  try {
    return await f();
  } finally {
    laufend--;
    warteschlange.shift()?.();
  }
}

const AboAntwort = z.object({
  is_error: z.boolean().optional(),
  subtype: z.string().optional(),
  result: z.unknown().optional(),
  structured_output: z.unknown().optional(),
  usage: z
    .object({
      input_tokens: z.number().optional(),
      output_tokens: z.number().optional(),
      cache_creation_input_tokens: z.number().optional(),
      cache_read_input_tokens: z.number().optional(),
    })
    .optional(),
});

async function frageUeberAbo<S extends z.ZodType>(opts: Anfrage<S>): Promise<z.infer<S>> {
  const schema = z.toJSONSchema(opts.schema, { target: "draft-7" });
  const args = [
    "-p",
    "--model", MODELL,
    "--effort", opts.aufwand,
    "--system-prompt", opts.system,
    "--tools", "",
    "--strict-mcp-config",
    "--no-session-persistence",
    "--disable-slash-commands",
    "--setting-sources", "",
    "--output-format", "json",
    "--json-schema", JSON.stringify(schema),
  ];
  // Ohne API-Key in der Umgebung, sonst rechnet Claude Code über die API statt über das Abo ab.
  const env = { ...process.env };
  delete env.ANTHROPIC_API_KEY;
  delete env.ANTHROPIC_AUTH_TOKEN;

  const ausgabe = await platz(
    () =>
      new Promise<string>((resolve, reject) => {
        // Im Temp-Ordner starten, damit keine CLAUDE.md aus dem Repo in den Kontext gerät.
        const kind = spawn(claudeBefehl(), args, { cwd: tmpdir(), env, stdio: ["pipe", "pipe", "pipe"] });
        let out = "";
        let err = "";
        kind.stdout.on("data", (d) => (out += d));
        kind.stderr.on("data", (d) => (err += d));
        kind.on("error", reject);
        kind.on("close", (code) => (code === 0 ? resolve(out) : reject(new Error(`claude -p endete mit ${code}: ${(err || out).slice(0, 400)}`))));
        kind.stdin.end(nachrichtenAlsText(opts.nachrichten));
      }),
  );

  const antwort = AboAntwort.parse(JSON.parse(ausgabe));
  verbrauch.anfragen++;
  const u = antwort.usage ?? {};
  verbrauch.eingabe += (u.input_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0) + (u.cache_read_input_tokens ?? 0) * 0.1;
  verbrauch.ausgabe += u.output_tokens ?? 0;
  if (antwort.is_error) throw new Error(`claude -p meldet Fehler (${antwort.subtype}): ${String(antwort.result).slice(0, 300)}`);
  const geparst = opts.schema.safeParse(antwort.structured_output);
  if (!geparst.success) throw new Error(`Antwort passt nicht zum Schema: ${geparst.error.message.slice(0, 300)}`);
  return geparst.data as z.infer<S>;
}
