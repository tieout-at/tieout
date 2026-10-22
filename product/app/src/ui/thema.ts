// Hell und dunkel: Standard ist die Einstellung des Geräts, ein Wechsel wird im Browser gemerkt.
// Dasselbe für die eingeklappte Seitenleiste. Das Skript im <head> setzt beides vor dem ersten Bild,
// damit nichts aufblitzt.

const SCHLUESSEL = "sw-thema";
const NAV = "sw-nav";

export const THEMA_SKRIPT = `(function(){try{var d=document.documentElement,t=localStorage.getItem("${SCHLUESSEL}");if(t!=="hell"&&t!=="dunkel")t=matchMedia("(prefers-color-scheme: dark)").matches?"dunkel":"hell";d.dataset.theme=t==="dunkel"?"dark":"light";if(localStorage.getItem("${NAV}")==="zu")d.dataset.nav="zu"}catch(e){}})()`;

function merken(schluessel: string, wert: string) {
  try {
    localStorage.setItem(schluessel, wert);
  } catch {
    // privater Modus: gilt nur für diese Seite
  }
}

export function themaWechseln() {
  const neu = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = neu;
  merken(SCHLUESSEL, neu === "dark" ? "dunkel" : "hell");
}

export function navWechseln() {
  const d = document.documentElement;
  const zu = d.dataset.nav !== "zu";
  if (zu) d.dataset.nav = "zu";
  else delete d.dataset.nav;
  merken(NAV, zu ? "zu" : "auf");
}
