import type { Metadata } from "next";

import { DASHBOARDS } from "@/lib/reports";
import { Dashboard } from "../dashboard";

type Props = { params: Promise<{ bericht: string }> };

export const dynamicParams = false;

// the first dashboard is "/berichte/" itself
export function generateStaticParams() {
  return DASHBOARDS.slice(1).map((d) => ({ bericht: d.slug }));
}

function find(slug: string) {
  const d = DASHBOARDS.find((x) => x.slug === slug);
  if (!d) throw new Error(`Unknown dashboard ${slug}`);
  return d;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `${find((await params).bericht).title} · Berichte` };
}

export default async function DashboardPage({ params }: Props) {
  return <Dashboard slug={find((await params).bericht).slug} />;
}
