import { describe, expect, it } from "vitest";
import { neueAdresse } from "./umleitung";

describe("Alte Adressen", () => {
  it.each([
    ["/projekte/w21-b-hkls/befunde/", "/projekte/w21-b-hkls/posten/"],
    ["/projekte/w21-b-hkls/befunde", "/projekte/w21-b-hkls/posten"],
    ["/projekte/w21-b-hkls/befunde/mehrmenge-22-04-12B/", "/projekte/w21-b-hkls/posten/mehrmenge-22-04-12B/"],
    ["/projekte/w21-b-hkls/befunde/zuruf-Z6/", "/projekte/w21-b-hkls/posten/whatsapp-Z6/"],
    ["/projekte/w21-b-hkls/befunde/zuruf-Z6/index.txt", "/projekte/w21-b-hkls/posten/whatsapp-Z6/index.txt"],
    ["/projekte/w21-b-hkls/posten/zuruf-Z6/", "/projekte/w21-b-hkls/posten/whatsapp-Z6/"],
    ["/projekte/w21-b-hkls/ordner/", "/projekte/w21-b-hkls/belege/"],
    ["/projekte/w21-b-hkls/ordner/w21-lv/", "/projekte/w21-b-hkls/belege/w21-lv/"],
    ["/projekte/w21-b-hkls/ordner/zuruf-z5/", "/projekte/w21-b-hkls/belege/whatsapp-z5/"],
    ["/projekte/w21-b-hkls/belege/zuruf-z5/", "/projekte/w21-b-hkls/belege/whatsapp-z5/"],
    ["/projekte/p2-w22-bt3/ledger/", "/projekte/p2-w22-bt3/positionen/"],
    ["/projekte/w21-b-hkls/zuruf/", "/projekte/w21-b-hkls/whatsapp/"],
  ])("%s → %s", (alt, neu) => {
    expect(neueAdresse(alt)).toBe(neu);
  });

  it.each(["/", "/projekte/w21-b-hkls/", "/projekte/w21-b-hkls/posten/", "/projekte/w21-b-hkls/zeitachse/", "/api/zuruf/status", "/projekte/w21-b-hkls/belege/w21-mail-zuruf/"])(
    "%s bleibt",
    (pfad) => {
      expect(neueAdresse(pfad)).toBeNull();
    },
  );
});
