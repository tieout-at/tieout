/**
 * The core in the browser (step 6b): what the pages show, computed again with the decisions this browser recorded
 * (stage 0, until sign-in and the backend in step 10). `live.ts` loads this module only once there is a decision, so a
 * page without one keeps exactly the figures it was built with. The builders are the ones the build uses; the app
 * never adds an amount of its own.
 */

import { pruefeFirma } from "@tieout/kern";

import type { Decision } from "./decisions";
import { findHighlights } from "./finds";
import { findCalculations, findRows, firm, projectCalculations, projectRows, startView } from "./kern-data";
import { projectHighlights } from "./records";
import { positionsView } from "./positions";
import { reportsView } from "./reports";
import { invoiceList, invoiceView } from "./invoice";
import { twinProjects, twinView } from "./twin";

export type Live = ReturnType<typeof live>;

const once = <T,>(make: () => T): (() => T) => {
  let value: { v: T } | null = null;
  return () => (value ??= { v: make() }).v;
};

const perKey = <T,>(make: (key: string) => T): ((key: string) => T) => {
  const values = new Map<string, T>();
  return (key) => {
    if (!values.has(key)) values.set(key, make(key));
    return values.get(key)!;
  };
};

export function live(decisions: readonly Decision[]) {
  const b = pruefeFirma(firm(), decisions);
  return {
    findRows: once(() => findRows(b)),
    findCalculations: once(() => findCalculations(b)),
    projectRows: once(() => projectRows(b)),
    projectCalculations: once(() => projectCalculations(b)),
    /** Money and "Als Nächstes" on Start. */
    startView: once(() => startView(b)),
    /** The figures of "Berichte". */
    reportsView: once(() => reportsView(b)),
    /** The tab "Schlussrechnung" of a project, by the core's project id. */
    /** The list "Schlussrechnungen". */
    invoiceList: once(() => invoiceList(b)),
    invoiceView: perKey((projektId) => invoiceView(projektId, b)),
    /** The highlights of a project's "Überblick", by the core's project id. */
    projectHighlights: perKey((projektId) => projectHighlights(projektId, b)),
    /** The tab "Positionen" of an open project, by the core's project id. */
    positionsView: perKey((projektId) => positionsView(projektId, b)),
    /** "Auf einen Blick" of a find page, by its slug. */
    findHighlights: perKey((slug) => findHighlights(slug, b)),
    /** The "Übersicht" of an open project, by its slug. */
    twinView: perKey((slug) => twinProjects(b).map((id) => twinView(id, b)).find((v) => v?.project.slug === slug) ?? null),
  };
}
