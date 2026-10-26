import { describe, expect, it } from "vitest";

import { projectOverview } from "./project-view";

describe("projectOverview", () => {
  it("hands over the Restforderung and the same laut Vertrag of the main project, as the core has them", () => {
    const v = projectOverview("p1");
    expect(v.rest?.announced.text).toBe("89.274,41 €");
    expect(v.rest?.contract.text).toBe("92.882,45 €");
  });

  it("has no Restforderung for a project without an Entwurf or a closed one", () => {
    expect(projectOverview("p2").rest).toBeNull();
    expect(projectOverview("p4").rest).toBeNull();
  });
});
