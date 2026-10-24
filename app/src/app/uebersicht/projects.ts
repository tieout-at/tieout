import type { ProjectLink } from "@/components/zwilling/zwilling";
import { twinProjects, twinView, type TwinView } from "@/lib/twin";

/**
 * The open projects that have an overview, in the order of `twinProjects()`: the first lives at /uebersicht/, every
 * other one at /uebersicht/<slug>/. Computed while the pages are built.
 */
export function overviewProjects(): { view: TwinView; link: ProjectLink }[] {
  return twinProjects().map((id, i) => {
    const view = twinView(id)!;
    const p = view.project;
    return { view, link: { slug: p.slug, name: p.name, href: i === 0 ? "/uebersicht/" : `/uebersicht/${p.slug}/`, colour: p.status.colour, status: p.status.text } };
  });
}
