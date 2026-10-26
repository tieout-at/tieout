import { ReportsDashboard } from "@/components/berichte/dashboard";
import { Page } from "@/components/shell/page";
import { reportsView } from "@/lib/reports";

// "Berichte" (step 8d): one calm dashboard of four questions; the three tabs of step 8 are gone.
export default function BerichtePage() {
  return (
    <Page destination="berichte">
      <ReportsDashboard built={reportsView()} />
    </Page>
  );
}
