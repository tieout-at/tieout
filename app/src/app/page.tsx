import { Page } from "@/components/shell/page";
import { findRows, startView } from "@/lib/kern-data";
import { targetOf } from "@/lib/tasks";
import { TaskPreview } from "./aufgaben/task-list";
import { AsOf, Greeting, NextSteps, ProjectMoney, StartMoney } from "./start-client";

// Start (decision E3, calmer and with one real chart in step 8d): the Ergebnis first, then the money per project on an
// axis, then what is next and the tasks side by side. Money and "Als Nächstes" are computed by `kern/` while the page is
// built and again in the browser after a decision there; the deadlines stand in the rows of the chart.
export default function StartPage() {
  const view = startView();
  return (
    <Page destination="start" heading={false}>
      <div className="mx-auto flex w-full max-w-[1040px] flex-col gap-6 px-6 pt-10 pb-16 max-md:px-4 max-md:pt-6">
        <div className="flex items-end justify-between gap-x-4 gap-y-1 px-1 max-md:flex-col max-md:items-start">
          <Greeting />
          <AsOf text={view.asOf} />
        </div>
        <StartMoney built={view} />
        <ProjectMoney built={view} />
        <div className="grid gap-6 md:grid-cols-2">
          <NextSteps built={view} />
          <TaskPreview targets={findRows().map(targetOf)} />
        </div>
      </div>
    </Page>
  );
}
