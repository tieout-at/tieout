import { Page } from "@/components/shell/page";
import { TaskList } from "./task-list";

export const metadata = { title: "Aufgaben" };

export default function AufgabenPage() {
  return (
    <Page destination="aufgaben">
      <TaskList />
    </Page>
  );
}
