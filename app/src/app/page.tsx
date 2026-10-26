import Link from "next/link";
import { Construction } from "lucide-react";

import { Page } from "@/components/shell/page";
import { PROJECTS, projectHref } from "@/lib/example";
import { findRows, projectRows, startView } from "@/lib/kern-data";
import { targetOf } from "@/lib/tasks";
import { TaskPreview } from "./aufgaben/task-list";
import { Greeting, NextSteps, StartMoney, Today } from "./start-client";

// Start (decision E3): the Ergebnis first. Money and "Als Nächstes" are computed by `kern/` while the page is built and
// again in the browser after a decision there; the deadlines are dates from the solution list.
export default function StartPage() {
  const view = startView();
  const near = new Set(projectRows().filter((r) => r.status.colour === "rot").map((r) => r.id));
  return (
    <Page destination="start" heading={false}>
      <div className="mx-auto flex w-full max-w-[592px] flex-col gap-10 px-4 pt-12 pb-16 md:pt-14">
        <div className="flex flex-col gap-6">
          <Greeting />
          <StartMoney built={view} />
        </div>
        <NextSteps built={view} />
        <section aria-labelledby="fristen" className="flex flex-col gap-2">
          <div className="flex h-7 items-center justify-between px-1">
            <h2 id="fristen" className="text-fg-secondary">
              Fristen
            </h2>
            <Today />
          </div>
          <ul className="flex flex-col">
            {PROJECTS.filter((p) => p.finalInvoiceBy).map((p) => (
              <li key={p.slug}>
                <Link
                  href={projectHref(p)}
                  className="flex min-h-11 items-center gap-2 rounded-md px-1 py-2 outline-none hover:bg-fill-hover focus-visible:outline-2 focus-visible:outline-accent max-md:flex-wrap"
                >
                  <Construction className="size-4 shrink-0 text-fg-secondary" aria-hidden />
                  <span>{p.name}</span>
                  <span className="text-fg-muted">{p.client}</span>
                  <span className="ml-auto flex items-center gap-1.5 text-xs text-fg-secondary max-md:ml-6 max-md:w-full">
                    {/* the dot only when the deadline is near, as in the project head */}
                    {near.has(p.id) && <span aria-hidden className="size-2 rounded-full bg-state-red" />}
                    Schlussrechnung legen bis {p.finalInvoiceBy}
                    {near.has(p.id) && <span className="sr-only">, Frist nah</span>}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <TaskPreview targets={findRows().map(targetOf)} />
      </div>
    </Page>
  );
}
