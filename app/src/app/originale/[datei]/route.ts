import { PROJECTS } from "@/lib/example";
import { projectOriginals } from "@/lib/originals-all";

// Every page of every Beleg of a project as the original viewer draws it, one static file per project
// (`/originale/wohnpark-mooshaim.json`). Loaded only when someone opens an original from the Zeitstrahl or the
// Belegabdeckung, so the pages stay small (Wohnpark Mooshaim: about 700 KB, measured 26.10.2026).
export const dynamic = "force-static";

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ datei: `${p.slug}.json` }));
}

export async function GET(_: Request, { params }: { params: Promise<{ datei: string }> }) {
  const slug = (await params).datei.replace(/\.json$/, "");
  const project = PROJECTS.find((p) => p.slug === slug);
  if (!project) return new Response("Nicht gefunden", { status: 404 });
  return Response.json(projectOriginals(project.id));
}
