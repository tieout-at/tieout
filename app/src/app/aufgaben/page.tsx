import { Page } from "@/components/shell/page";
import { findRows } from "@/lib/kern-data";
import { targetOf } from "@/lib/tasks";
import { TaskList } from "./task-list";

export const metadata = { title: "Aufgaben" };

// The finds a new task can be made on come from `kern/` while the page is built; the tasks themselves live in the browser.
export default function AufgabenPage() {
  return (
    <Page destination="aufgaben">
      <TaskList targets={findRows().map(targetOf)} />
    </Page>
  );
}
