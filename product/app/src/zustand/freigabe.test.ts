import { describe, expect, it } from "vitest";
import { standAus, type Eintrag } from "./freigabe";

const e = (aktion: Eintrag["aktion"], schluessel = "regie:RB-07"): Eintrag => ({ schluessel, aktion, rolle: "M", zeit: "2026-10-22T10:00:00+02:00" });

describe("Freigabe: Stand aus dem Verlauf", () => {
  it("Prüfen → Übernommen → Freigegeben", () => {
    expect(standAus([], "regie:RB-07", "jetzt")).toBe("pruefen");
    expect(standAus([e("uebernehmen")], "regie:RB-07", "jetzt")).toBe("uebernommen");
    expect(standAus([e("uebernehmen"), e("freigeben")], "regie:RB-07", "jetzt")).toBe("freigegeben");
  });

  it("Freigeben ohne Übernehmen zählt nicht (zwei Stufen)", () => {
    expect(standAus([e("freigeben")], "regie:RB-07", "jetzt")).toBe("pruefen");
  });

  it("Zurück an die Prüfung, dann erneut entscheiden", () => {
    expect(standAus([e("uebernehmen"), e("zurueck"), e("verwerfen")], "regie:RB-07", "jetzt")).toBe("verworfen");
  });

  it("Hinweise „Braucht Anwalt“ starten so und bleiben so", () => {
    expect(standAus([e("uebernehmen", "hinweis:x")], "hinweis:x", "anwalt")).toBe("anwalt");
  });

  it("Einträge anderer Posten wirken nicht", () => {
    expect(standAus([e("uebernehmen", "regie:RB-11")], "regie:RB-07", "jetzt")).toBe("pruefen");
  });
});
