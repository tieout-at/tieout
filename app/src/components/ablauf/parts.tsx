"use client";

import { Check, CircleDashed, FileText, Filter, FolderInput, GitCompareArrows, LoaderCircle, MessageCircle, Package, ReceiptText, ShieldCheck, SquareCheck, UserCheck, type LucideIcon } from "lucide-react";

import type { FlowIcon, FlowKind, FlowNode, FlowRun, Line, NodeResult, Tone } from "@/lib/flows";
import { cn } from "@/lib/utils";

export const ICONS: Record<FlowIcon, LucideIcon> = {
  folder: FolderInput,
  file: FileText,
  compare: GitCompareArrows,
  shield: ShieldCheck,
  receipt: ReceiptText,
  release: UserCheck,
  package: Package,
  task: SquareCheck,
  invoice: ReceiptText,
  message: MessageCircle,
  filter: Filter,
};

export const KIND_TEXT: Record<FlowKind, string> = {
  ausloeser: "Auslöser",
  schritt: "Laufschritt",
  bedingung: "Bedingung",
  aufgabe: "Aufgabe",
};

const DOT: Record<Tone, string> = {
  green: "bg-state-green",
  yellow: "bg-state-yellow",
  orange: "bg-state-orange",
  red: "bg-state-red",
  grey: "bg-state-grey",
};

export function Dot({ tone }: { tone: Tone }) {
  return <span aria-hidden className={cn("size-2 shrink-0 rounded-full", DOT[tone])} />;
}

/** Where a block stands while a run plays: waiting, running, done (or reached but stopped). */
export type NodeState = "idle" | "wait" | "run" | "done";

/** The 24 px chip of a block: grey, colour stays reserved for meaning (DESIGN.md, Icons). */
export function Chip({ icon, className }: { icon: FlowIcon; className?: string }) {
  const Icon = ICONS[icon];
  return (
    <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-[7px] bg-fill-hover text-fg-secondary shadow-ring", className)}>
      <Icon className="size-4" aria-hidden />
    </span>
  );
}

/** The second line of a block: what it does, what it produced, or that the run did not reach it. */
export function ResultLine({ node, result, state, className }: { node: FlowNode; result: NodeResult | undefined; state: NodeState; className?: string }) {
  if (state === "run")
    return (
      <span className={cn("flex min-w-0 items-center gap-1.5 text-accent", className)}>
        <LoaderCircle className="size-3.5 shrink-0 animate-spin motion-reduce:animate-none" aria-hidden />
        <span className="truncate">läuft</span>
      </span>
    );
  if (!result || state === "wait") return <span className={cn("block truncate text-fg-secondary", className)}>{node.does}</span>;
  return (
    <span className={cn("flex min-w-0 items-center gap-1.5", result.ran ? "text-fg" : "text-fg-muted", className)}>
      {result.ran ? <Check className="size-3.5 shrink-0" aria-hidden /> : <CircleDashed className="size-3.5 shrink-0" aria-hidden />}
      <span className="truncate">{result.text}</span>
    </span>
  );
}

export function Lines({ lines }: { lines: Line[] }) {
  if (!lines.length) return null;
  return (
    <dl className="mt-1">
      {lines.map((l) => (
        <div key={l.label} className="flex min-h-7 items-center justify-between gap-3 py-0.5">
          <dt className="flex min-w-0 items-center gap-2 text-fg-secondary">
            {l.tone && <Dot tone={l.tone} />}
            <span>{l.label}</span>
          </dt>
          <dd className="font-mono text-[13px] tabular-nums">{l.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Every block in the order a run reaches it: down the main column, a side block after the block it hangs on. */
export function playOrder(nodes: FlowNode[], checksAt: string | null): string[] {
  const main = nodes.filter((n) => n.side === "main").toSorted((a, b) => a.row - b.row);
  return main.flatMap((m) => [m.id, ...(checksAt === m.id ? ["pruefungen"] : []), ...nodes.filter((n) => n.side !== "main" && n.row === m.row).map((n) => n.id)]);
}

export function runLabel(run: FlowRun): string {
  return `${run.title}, ${run.on}, ${run.date}`;
}

