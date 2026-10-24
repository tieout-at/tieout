import { Building2 } from "lucide-react";

import { Page } from "@/components/shell/page";
import { RecordHead } from "@/components/shell/record-head";
import { TabLinks } from "@/components/shell/tab-links";
import { BUSINESS, BUSINESS_TABS } from "@/lib/example";

// Ebene 1 of the twin: the business with its contracts, price basis and members (SPEZIFIKATION.md 2.2).
export default function BetriebLayout({ children }: { children: React.ReactNode }) {
  return (
    <Page destination="betrieb" heading={false}>
      <RecordHead icon={Building2} title={BUSINESS.name} facts={[BUSINESS.trade, BUSINESS.place, "Beispieldaten"]} />
      <div className="no-scrollbar overflow-x-auto px-6 pb-2 shadow-line-bottom max-md:px-4">
        <TabLinks label="Bereiche des Betriebs" tabs={BUSINESS_TABS.map((t) => ({ title: t.title, href: `/betrieb/${t.slug ? `${t.slug}/` : ""}` }))} />
      </div>
      <div className="flex-1">{children}</div>
    </Page>
  );
}
