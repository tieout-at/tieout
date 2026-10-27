import Link from "next/link";
import { Workflow } from "lucide-react";

import { Page } from "@/components/shell/page";
import { flowViews } from "@/lib/flows";

export const metadata = { title: "Abläufe" };

/**
 * "Abläufe" (step 9): Attio's list of workflows with the three ready Abläufe. Each row opens its canvas; "Zuletzt" is
 * the latest run the data allows.
 */
export default function AblaeufePage() {
  const views = flowViews();
  return (
    <Page destination="ablaeufe">
      <div className="w-full max-w-[1040px] px-6 pt-6 pb-10 max-md:px-4 max-md:pt-4">
        <h2 className="text-xl leading-6 font-semibold">Wie Ihr Betrieb seine Rechnungen prüft</h2>
        <p className="mt-1.5 text-fg-secondary">Drei Abläufe, fertig eingerichtet. Ein Klick zeigt die Schritte und jeden Lauf.</p>
        <table className="mt-5 w-full border-collapse text-sm max-md:hidden">
          <thead>
            <tr className="shadow-line-bottom">
              <th className="h-10 px-3 text-left font-medium text-fg-secondary">Ablauf</th>
              <th className="h-10 w-24 px-3 text-left font-medium text-fg-secondary">Läufe</th>
              <th className="h-10 w-28 px-3 text-left font-medium text-fg-secondary">Status</th>
              <th className="h-10 w-72 px-3 text-left font-medium text-fg-secondary">Zuletzt</th>
            </tr>
          </thead>
          <tbody>
            {views.map((v) => {
              const last = v.runs[0];
              return (
                <tr key={v.id} className="group relative shadow-line-bottom hover:bg-fill-subtle">
                  <td className="px-3 py-2.5">
                    <Link href={`/ablaeufe/${v.slug}/`} className="flex items-center gap-2.5 outline-none after:absolute after:inset-0 focus-visible:after:outline-2 focus-visible:after:outline-accent">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-fill-hover text-fg-secondary shadow-ring">
                        <Workflow className="size-4" aria-hidden />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-medium">{v.title}</span>
                        <span className="block text-xs leading-4 text-fg-secondary">{v.summary}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-3 font-mono text-[13px] tabular-nums">{v.runs.length}</td>
                  <td className="px-3 text-fg-secondary">aktiv</td>
                  <td className="px-3 text-fg-secondary">{last ? `${last.date}, ${last.title}` : "noch kein Lauf"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <ul className="mt-4 flex flex-col gap-2 md:hidden">
          {views.map((v) => (
            <li key={v.id}>
              <Link href={`/ablaeufe/${v.slug}/`} className="flex min-h-14 items-center gap-3 rounded-[14px] bg-surface px-3 py-2.5 shadow-button outline-none focus-visible:outline-2 focus-visible:outline-accent">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-fill-hover text-fg-secondary shadow-ring">
                  <Workflow className="size-4" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{v.title}</span>
                  <span className="block text-xs leading-4 text-fg-secondary">{v.runs.length === 1 ? "1 Lauf" : `${v.runs.length} Läufe`}{v.runs[0] ? `, zuletzt ${v.runs[0].date}` : ""}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Page>
  );
}
