"use client";

// Markiert die Zeile, auf die der Anker der Adresse zeigt („#pos-22.04.12B“). CSS „:target“ greift nach einer
// Navigation innerhalb der App nicht, deshalb setzt dieses Bauteil das Merkmal selbst und holt die Zeile ins Bild.

import { useEffect } from "react";

export function AnkerMarke() {
  useEffect(() => {
    const markieren = () => {
      document.querySelectorAll("[data-ziel]").forEach((el) => el.removeAttribute("data-ziel"));
      const id = decodeURIComponent(location.hash.slice(1));
      const el = id ? document.getElementById(id) : null;
      if (!el) return;
      el.setAttribute("data-ziel", "");
      el.scrollIntoView({ block: "center" });
    };
    markieren();
    window.addEventListener("hashchange", markieren);
    return () => window.removeEventListener("hashchange", markieren);
  }, []);
  return null;
}
