// Skript für den <head>: setzt Thema und eingeklappte Seitenleiste vor dem ersten Bild (kein Aufblitzen).
// Eigene Datei, weil das Root-Layout auf dem Server läuft und ./thema.ts Client-Code enthält.

export const SCHLUESSEL = "sw-thema";
export const NAV = "sw-nav";

export const THEMA_SKRIPT = `(function(){try{var d=document.documentElement,t=localStorage.getItem("${SCHLUESSEL}");if(t!=="hell"&&t!=="dunkel")t=matchMedia("(prefers-color-scheme: dark)").matches?"dunkel":"hell";d.dataset.theme=t==="dunkel"?"dark":"light";if(localStorage.getItem("${NAV}")==="zu")d.dataset.nav="zu"}catch(e){}})()`;
