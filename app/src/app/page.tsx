import Link from "next/link";
import { Construction } from "lucide-react";

import { SectionEmpty } from "@/components/shell/empty-state";
import { Page } from "@/components/shell/page";
import { PROJECTS, projectHref } from "@/lib/example";
import { Greeting, Today } from "./start-client";

// Start (decision E3): money and "Als Nächstes" come with the core in step 7. The deadlines are dates from the
// solution list, not amounts, so they are shown already.
export default function StartPage() {
  return (
    <Page destination="start" heading={false}>
      <div className="mx-auto flex w-full max-w-[592px] flex-col gap-12 px-4 pt-12 pb-16 md:pt-14">
        <Greeting />
        <section aria-labelledby="fristen" className="flex flex-col gap-2">
          <div className="flex h-7 items-center justify-between px-1">
            <h2 id="fristen" className="text-fg-secondary">
              Fristen
            </h2>
            <Today />
          </div>
          <ul className="flex flex-col">
            {PROJECTS.map((p) => (
              <li key={p.slug}>
                <Link
                  href={projectHref(p)}
                  className="flex min-h-11 items-center gap-2 rounded-md px-1 py-2 outline-none hover:bg-fill-hover focus-visible:outline-2 focus-visible:outline-accent max-md:flex-wrap"
                >
                  <Construction className="size-4 shrink-0 text-fg-secondary" aria-hidden />
                  <span>{p.name}</span>
                  <span className="text-fg-muted">{p.client}</span>
                  <span className="ml-auto text-xs text-fg-secondary max-md:ml-6 max-md:w-full">Schlussrechnung legen bis {p.finalInvoiceBy}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="aufgaben" className="flex flex-col gap-2">
          <div className="flex h-7 items-center justify-between px-1">
            <h2 id="aufgaben" className="text-fg-secondary">
              Aufgaben
            </h2>
            <Link
              href="/aufgaben/"
              className="flex items-center rounded-sm px-1 text-xs text-fg-secondary hover:bg-fill-hover hover:text-fg max-md:-my-2 max-md:h-11"
            >
              Alle anzeigen
            </Link>
          </div>
          <SectionEmpty title="Keine offenen Aufgaben" text="Aus jeder Lücke wird eine Aufgabe mit Frist." />
        </section>
      </div>
    </Page>
  );
}
