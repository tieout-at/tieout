// Hell und dunkel: Standard ist die Einstellung des Geräts, ein Wechsel wird im Browser gemerkt.
// Das Skript im <head> setzt das Thema vor dem ersten Bild, damit nichts aufblitzt.

const SCHLUESSEL = "sw-thema";

export const THEMA_SKRIPT = `(function(){try{var t=localStorage.getItem("${SCHLUESSEL}");if(t!=="hell"&&t!=="dunkel")t=matchMedia("(prefers-color-scheme: dark)").matches?"dunkel":"hell";document.documentElement.dataset.theme=t==="dunkel"?"dark":"light"}catch(e){}})()`;

export function themaWechseln() {
  const neu = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = neu;
  try {
    localStorage.setItem(SCHLUESSEL, neu === "dark" ? "dunkel" : "hell");
  } catch {
    // privater Modus: Thema gilt nur für diese Seite
  }
}
