"use client";

import { usePathname } from "next/navigation";

import { normalisePath } from "@/lib/navigation";
import { UnderlineTabs } from "./underline-tabs";

export type TabLink = { title: string; href: string; count?: number };

/** Tabs as links between pages, in the one tab style of the app (`UnderlineTabs`). */
export function TabLinks({ tabs, label, className }: { tabs: TabLink[]; label: string; className?: string }) {
  const path = normalisePath(usePathname());
  return <UnderlineTabs label={label} className={className} groups={[{ items: tabs.map((t) => ({ key: t.href, title: t.title, href: t.href, count: t.count, active: path === t.href })) }]} />;
}
