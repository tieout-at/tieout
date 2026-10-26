"use client";

import { usePathname } from "next/navigation";
import { CalendarRange, FileSignature, FileText, LayoutDashboard, ReceiptText, Rows3, SearchCheck, type LucideIcon } from "lucide-react";

import { OVERVIEW_TAB, STEPS, projectHref, type Project } from "@/lib/example";
import { normalisePath } from "@/lib/navigation";
import { UnderlineTabs } from "./underline-tabs";

const ICON: Record<string, LucideIcon> = {
  "": LayoutDashboard,
  zeitstrahl: CalendarRange,
  belege: FileText,
  positionen: Rows3,
  vertrag: FileSignature,
  funde: SearchCheck,
  schlussrechnung: ReceiptText,
};

/**
 * Tabs of the project page (step 8d, Attio's record tabs): icon and word, a count where a tab holds a list, the open tab
 * underlined in ink by a line that slides along. The three website steps are parted by a thin line only; their names
 * stand in the sidebar and in the tooltip, not as small grey words between the tabs. On phones the row scrolls sideways
 * and stays at the top while the page scrolls.
 */
export function StepBar({ project, counts = {} }: { project: Project; counts?: Record<string, number> }) {
  const path = normalisePath(usePathname());
  const groups = [{ title: "", tabs: [OVERVIEW_TAB] }, ...STEPS.map((step) => ({ title: step.title, tabs: step.tabs }))];
  return (
    <UnderlineTabs
      label="Reiter"
      sticky
      groups={groups.map((g) => ({
        title: g.title,
        items: g.tabs.map((t) => {
          const href = projectHref(project, t.slug);
          return { key: href, title: t.title, href, icon: ICON[t.slug], count: counts[t.slug], active: path === href, hint: g.title || undefined };
        }),
      }))}
    />
  );
}
