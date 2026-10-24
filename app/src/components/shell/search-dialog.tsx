"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMemo } from "react";
import { ArrowDown, ArrowUp, Building2, Construction, CornerDownLeft, SearchCheck, type LucideIcon } from "lucide-react";

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { BUSINESS, BUSINESS_TABS, PROJECTS, STEPS, projectHref } from "@/lib/example";
import { ALL } from "@/lib/navigation";
import { expand, score } from "@/lib/search";
import { useShell } from "./shell-state";

type Entry = { id: string; title: string; href: string; icon: LucideIcon; keywords: string[]; hint?: string };
type Group = { heading: string; entries: Entry[] };

/** A find as the search knows it (from `findSearchEntries()` in `lib/finds.ts`, computed at build time). */
export type SearchFind = { id: string; title: string; hint: string; href: string; keywords: string[] };

// Words a project tab answers to, so "LV" finds Positionen and "RB 11" finds Belege.
const TAB_KEYWORDS: Record<string, string[]> = {
  zeitstrahl: ["Baustelle", "WhatsApp", "fehlt", "verrechnet"],
  belege: ["Regiebericht", "Aufmaßblatt", "Abschlagsrechnung", "Plan", "Foto", "E-Mail"],
  positionen: ["Leistungsverzeichnis", "Einheitspreis", "beauftragt", "erbracht", "verrechnet", "offen"],
  vertrag: ["Vertragspunkt", "Nachlass", "Haftrücklass", "Regiesatz"],
  funde: ["Vorprüfung", "Kürzungsrisiko", "Belegstand"],
  schlussrechnung: ["Änderungsliste", "Rechnungsabschluss", "Restforderung", "Beweispaket"],
};

function buildGroups(finds: SearchFind[]): Group[] {
  const pages: Group = {
    heading: "Seiten",
    entries: ALL.map((d) => ({ id: d.id, title: d.title, href: d.href, icon: d.icon, keywords: d.keywords ?? [] })),
  };
  const projects: Group[] = PROJECTS.map((p) => ({
    heading: p.name,
    entries: STEPS.flatMap((step) =>
      step.tabs.map((tab) => ({
        id: `projekt-${p.slug}-${tab.slug}`,
        title: tab.title,
        href: projectHref(p, tab.slug),
        icon: Construction,
        hint: `${p.name} · ${step.title}`,
        keywords: [p.name, p.client, step.title, ...(TAB_KEYWORDS[tab.slug] ?? [])],
      })),
    ),
  }));
  const business: Group = {
    heading: "Betrieb",
    entries: BUSINESS_TABS.map((tab) => ({
      id: `betrieb-${tab.slug || "vertraege"}`,
      title: tab.title,
      href: `/betrieb/${tab.slug ? `${tab.slug}/` : ""}`,
      icon: Building2,
      hint: BUSINESS.name,
      keywords: [BUSINESS.name, "Betrieb"],
    })),
  };
  const found: Group = { heading: "Funde", entries: finds.map((f) => ({ ...f, icon: SearchCheck })) };
  return [pages, found, ...projects, business];
}


export function SearchDialog({ finds }: { finds: SearchFind[] }) {
  const { searchOpen, setSearchOpen } = useShell();
  return (
    <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
      <DialogContent aria-describedby={undefined}>
        <DialogTitle className="sr-only">Suche</DialogTitle>
        {searchOpen && <SearchPanel finds={finds} onDone={() => setSearchOpen(false)} />}
      </DialogContent>
    </Dialog>
  );
}

function SearchPanel({ finds, onDone }: { finds: SearchFind[]; onDone: () => void }) {
  const GROUPS = useMemo(() => buildGroups(finds), [finds]);
  const BY_ID = useMemo(() => new Map(GROUPS.flatMap((g) => g.entries).map((e) => [e.id, e])), [GROUPS]);
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(GROUPS[0].entries[0].id);
  const { expansions } = expand(query);

  function open(id: string) {
    const entry = BY_ID.get(id);
    if (!entry) return;
    onDone();
    router.push(entry.href);
  }

  return (
    <Command
      label="Suche"
      value={selected}
      onValueChange={setSelected}
      filter={(_value, search, keywords) => score(search, keywords ?? [])}
    >
      <CommandInput value={query} onValueChange={setQuery} placeholder="Seiten, Projekte, Funde suchen …" autoFocus />
      {expansions.length > 0 && (
        <p className="px-4 pt-3 text-xs text-fg-secondary">
          {expansions.map((e) => (
            <span key={e.short} className="mr-3">
              {e.short} = <span className="text-fg">{e.full}</span>
            </span>
          ))}
        </p>
      )}
      <CommandList>
        <CommandEmpty>Keine Treffer.</CommandEmpty>
        {GROUPS.map((group) => (
          <CommandGroup key={group.heading} heading={group.heading}>
            {group.entries.map((entry) => {
              const Icon = entry.icon;
              return (
                <CommandItem key={entry.id} value={entry.id} keywords={[entry.title, ...entry.keywords]} onSelect={() => open(entry.id)}>
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-sm text-fg-secondary shadow-ring">
                    <Icon className="size-3.5" aria-hidden />
                  </span>
                  <span className="truncate">{entry.title}</span>
                  {entry.hint && <span className="truncate text-xs text-fg-muted">{entry.hint}</span>}
                </CommandItem>
              );
            })}
          </CommandGroup>
        ))}
      </CommandList>
      <div className="flex h-11 items-center gap-2 bg-white/90 pr-2 pl-3 shadow-[inset_0_1px_0_0_#eeeff1] max-md:h-14">
        <Kbd className="size-5 px-0" aria-hidden>
          <ArrowUp className="size-3" />
        </Kbd>
        <Kbd className="size-5 px-0" aria-hidden>
          <ArrowDown className="size-3" />
        </Kbd>
        <span className="flex-1 text-xs text-fg-secondary">Auswählen</span>
        <Button variant="primary" onClick={() => open(selected)} className="pr-1.5 pl-2">
          Öffnen
          <CornerDownLeft className="size-3.5" aria-hidden />
        </Button>
      </div>
    </Command>
  );
}
