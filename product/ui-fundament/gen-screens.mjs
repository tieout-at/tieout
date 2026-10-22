// Baut die Schlüsselbildschirme nur aus den Bauteilen des UI-Fundaments (tokens.json, bundle.css, bundle.js, content.js).
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const here = dirname(fileURLToPath(import.meta.url));
const P = (p) => join(here, "project", p);
const tokens = JSON.parse(readFileSync(P("tokens.json"), "utf8"));
const bundleCss = readFileSync(P("components/bundle.css"), "utf8");
const bundleJs = readFileSync(P("components/bundle.js"), "utf8");
const content = readFileSync(join(here, "content.js"), "utf8").replace(/(\d) €/g, "$1 €");
const OUT = process.argv[2];

const val = (c, t) => (typeof c.value === "string" ? c.value : c.value[t]);
const decl = (t) => [...tokens.color.tokens.map(c => `--${c.name}:${val(c, t)}`), ...tokens.shadow.tokens.map(s => `--${s.name}:${val(s, t)}`)].join(";");
const plain = ["spacing", "radius", "size"].flatMap(f => tokens[f].tokens.map(x => `--${x.name}:${x.value}`)).concat(Object.entries(tokens.type.families).map(([k, v]) => `--font-${k}:${v}`)).join(";");
const styles = tokens.type.groups.flatMap(g => g.styles.map(s => `.${s.name}{font-family:var(--font-${s.family || g.family});font-size:${s.fontSize};line-height:${s.lineHeight};font-weight:${s.fontWeight};${s.letterSpacing ? `letter-spacing:${s.letterSpacing};` : ""}}`)).join("\n");
const tokenCss = `:root{${decl("light")};${plain}}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){${decl("dark")};color-scheme:dark}}
:root[data-theme="dark"]{${decl("dark")};color-scheme:dark}
${styles}`;

const html = `<title>Schlusswerk Bildschirme</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400..600&family=JetBrains+Mono:wght@400;500&display=swap">
<style>
${tokenCss}
${bundleCss}
/* Anordnung der Bildschirme: nur Layout, alle Werte aus Tokens */
html,body{height:100%}
body{background:var(--bg)}
.scr{display:flex;height:100%;min-height:640px}
.scr-main{flex:1;min-width:0;display:flex;flex-direction:column;min-height:0}
#view{flex:1;display:flex;flex-direction:column;min-height:0}
.scr-body{flex:1;overflow:auto;padding:var(--space-5) var(--space-6) var(--space-8);display:flex;flex-direction:column;gap:var(--space-5)}
.scr-body>*{flex:none}
.cols{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:var(--space-5);align-items:start}
.side{display:flex;flex-direction:column;gap:var(--space-5)}
.lead{margin:0}
.lead b{font-weight:600}
.lead a{color:var(--accent);text-decoration:none;font-weight:500}
.lead a:hover{text-decoration:underline}
.kv{display:flex;flex-direction:column}
.kv>div{display:flex;justify-content:space-between;gap:var(--space-3);padding:var(--space-2) var(--space-4);border-bottom:1px solid var(--line)}
.kv>div:last-child{border-bottom:0}
.kv span{color:var(--text-secondary)}
.kv b{font-weight:500;font-variant-numeric:tabular-nums}
.split{flex:1;display:grid;grid-template-columns:minmax(420px,560px) minmax(0,1fr);min-height:0}
.split-left{display:flex;flex-direction:column;min-height:0;border-right:1px solid var(--line-strong);background:var(--surface)}
.split-scroll{flex:1;overflow:auto;padding:var(--space-4) var(--space-5);display:flex;flex-direction:column;gap:var(--space-4)}
.split-scroll>*{flex:none}
.split-right{display:flex;min-height:0;padding:var(--space-4)}
.split-right .sw-viewer{flex:1}
.fhead{display:flex;flex-direction:column;gap:var(--space-2)}
.fhead h1{margin:0}
.callout{display:flex;gap:var(--space-2);padding:var(--space-3);border-radius:var(--radius-md);background:var(--warn-soft);color:var(--text)}
.callout .sw-ico{color:var(--warn);margin-top:2px}
.callout b{display:block;font-weight:600;color:var(--warn)}
.toast-wrap{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(var(--space-6) + env(safe-area-inset-bottom,0px));z-index:5}
.hint{display:flex;gap:var(--space-2);align-items:flex-start;padding:var(--space-3) var(--space-4);border-bottom:1px solid var(--line)}
.hint:last-child{border-bottom:0}
.hint .sw-ico{color:var(--warn);margin-top:2px}
.hint span{color:var(--text-secondary)}
.annahme{display:inline-flex;margin-left:var(--space-1)}
.zoom{min-width:40px;text-align:center;font-variant-numeric:tabular-nums}
@media (max-width:900px){
  .scr{flex-direction:column}
  .sw-sidebar{width:auto;min-height:0;flex-direction:row;align-items:center;overflow-x:auto;border-right:0;border-bottom:1px solid var(--line-strong);padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
  .sw-sidebar .sw-switch,.sw-sidebar>div[style]{display:none}
  .sw-nav{flex-direction:row}
  .sw-nav a{white-space:nowrap}
  .cols{grid-template-columns:minmax(0,1fr)}
  .split{grid-template-columns:minmax(0,1fr);overflow:auto}
  .split-right{min-height:560px}
  .sw-steps{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}
  .sw-step:nth-child(2){border-right:0}
  .sw-pagehead,.scr-body{padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
  .sw-pagehead .sw-btn{display:none}
  .tw{overflow-x:auto}
}
</style>
<div class="scr">
  <div id="side"></div>
  <div class="scr-main"><div id="head"></div><div id="view"></div></div>
</div>
<div class="toast-wrap" id="toast" hidden></div>
<script>
${bundleJs}
</script>
<script>
${content}
</script>
<script>
(function(){
var S=window.Schlusswerk, C=SWC, I=C.I, euro=C.euro;
var st={view:"cockpit",sel:"J1",doc:null,tab:"alle",zoom:100,arOpen:false,reasons:false,stand:C.startStand(),undo:[]};
var VIEWS=["cockpit","ordner","befunde","befund","vorpruefung"];
function byId(id){return C.F.filter(function(f){return f.id===id})[0]}
function frei(){return C.F.filter(function(f){return st.stand[f.id].st==="frei"}).length}
function zuEntscheiden(){return C.F.filter(function(f){var s=st.stand[f.id].st;return s==="pruefen"||s==="uebernommen"}).length}
function now(){var d=new Date(),p=function(n){return String(n).padStart(2,"0")};return p(d.getDate())+"."+p(d.getMonth()+1)+"."+d.getFullYear()+", "+p(d.getHours())+":"+p(d.getMinutes())}
function head(){
 var t={cockpit:[[],"Übersicht"],ordner:[[["Übersicht","cockpit"]],"Ordner"],befunde:[[["Übersicht","cockpit"]],"Befunde"],befund:[[["Befunde","befunde"]],(byId(st.sel).nr?byId(st.sel).nr+" · ":"")+byId(st.sel).kurz],vorpruefung:[[["Übersicht","cockpit"]],"Vorprüfung aus GU-Sicht"]}[st.view];
 return C.pagehead([["W21-B HKLS",""]].concat(t[0]),t[1]);
}
function cockpit(){
 return '<div class="scr-body"><p class="lead body">12 Posten aus 165 Dokumenten. <b>27.410,00 €</b> jetzt verrechenbar, '+zuEntscheiden()+' Posten warten auf eine Entscheidung. <a href="#vorpruefung">4 Positionen mit Kürzungsrisiko</a></p>'+C.facts()+C.steps(frei())+C.kpis()+
 '<div class="cols"><div class="sw-panel tw"><div class="sw-panel__head"><span class="section-title">Zu entscheiden</span><a class="sw-btn sw-btn--ghost sw-btn--sm" href="#befunde">Alle Befunde</a></div>'+
 C.befundTable(st.stand,function(f,s){return s.st==="pruefen"||s.st==="uebernommen"},null)+'</div>'+
 '<div class="side"><div class="sw-panel"><div class="sw-panel__head"><span class="section-title">Vorprüfung aus GU-Sicht</span><a class="sw-btn sw-btn--ghost sw-btn--sm" href="#vorpruefung">Öffnen</a></div><div class="sw-pad sw-stack" style="gap:var(--space-1)"><span class="kpi">8.767,50 €</span><span class="meta sw-secondary">4 Positionen mit Kürzungsrisiko, davon 2 bereits in AR3 gekürzt (2.196,00 €)</span><span class="meta sw-muted">Überschneidet sich mit „Jetzt verrechenbar“, nicht addieren.</span></div></div>'+
 '<div class="sw-panel"><div class="sw-panel__head"><span class="section-title">Regieberichte</span><span class="sw-count">16</span></div><div class="kv"><div><span>verrechnet</span><b>11</b></div><div><span>unterschrieben, nicht verrechnet</span><b>3</b></div><div><span>nicht unterschrieben</span><b>2</b></div></div></div></div></div></div>';
}
function befunde(){
 var tabs=[["alle","Alle",13,null],["offen","Zu entscheiden",zuEntscheiden(),function(f,s){return s.st==="pruefen"||s.st==="uebernommen"}],["frei","Freigegeben",frei(),function(f,s){return s.st==="frei"}],["risiko","Mit Kürzungsrisiko",2,function(f){return !!f.risiko}]];
 var cur=tabs.filter(function(t){return t[0]===st.tab})[0]||tabs[0];
 return '<div class="scr-body"><p class="lead body">12 Posten mit Betrag und 1 Hinweis für den Anwalt, nach Liste gruppiert. Klick oder Enter öffnet den Beleg, j/k wechselt die Zeile.</p>'+
 '<div class="sw-panel tw"><div class="sw-panel__head"><span class="section-title">Befunde</span><div class="sw-tabs" role="tablist">'+tabs.map(function(t){return '<button class="sw-tab" role="tab" data-tab="'+t[0]+'" aria-selected="'+(t[0]===cur[0])+'">'+t[1]+' <span class="sw-count">'+t[2]+'</span></button>'}).join("")+'</div></div>'+
 C.befundTable(st.stand,cur[3],st.sel)+'</div></div>';
}
function ordner(){
 return '<div class="scr-body"><p class="lead body">165 Dokumente, davon 12 Duplikate. Jede LV-Position ist mit ihren Belegen verbunden: Klick auf einen Beleg öffnet das Original.</p>'+
 '<div class="sw-panel tw"><div class="sw-panel__head"><span class="section-title">Belegmatrix</span><span class="meta sw-muted">Auszug: 5 von 380 Positionen</span></div>'+C.matrix()+'</div>'+
 '<div class="sw-panel"><div class="sw-panel__head"><span class="section-title">Upload vom 22.10.2026, 09:14</span><span class="meta sw-muted">3 Planindizes · 12 Duplikate · 1 Korrekturblatt</span></div><div class="sw-pad">'+C.upload()+'</div></div></div>';
}
function decideBar(f){
 var s=st.stand[f.id], last=s.log[s.log.length-1];
 var who=last?'<span>'+last[0]+'</span>'+C.person(last[1])+'<span>'+last[2]+'</span>':'<span>Noch nicht entschieden.</span>';
 var btn;
 if(f.liste==="anwalt"){btn='<span class="meta sw-secondary">Hinweis ohne Betrag. Würdigung nur durch den Anwalt, Schlusswerk bewertet nicht.</span>';}
 else if(s.st==="pruefen"||s.st==="zurueck"){
  btn=st.reasons?'<div class="sw-stack" style="gap:var(--space-2)"><span class="meta sw-secondary">Grund für „Verwerfen“:</span><div class="sw-reasons">'+C.GRUENDE.map(function(g){return '<button class="sw-reason" data-reason="'+g+'">'+g+'</button>'}).join("")+'<button class="sw-btn sw-btn--ghost sw-btn--sm" data-reason="">Abbrechen</button></div></div>':
  '<div class="sw-row"><button class="sw-btn sw-btn--primary" data-dec="uebernommen">Übernehmen <span class="sw-kbd">1</span></button><button class="sw-btn" data-dec="verwerfen">Verwerfen <span class="sw-kbd">2</span></button><button class="sw-btn" data-dec="anwalt">'+I("scale")+'Braucht Anwalt <span class="sw-kbd">3</span></button><button class="sw-btn sw-btn--ghost" data-dec="zurueck">Zurückstellen <span class="sw-kbd">H</span></button></div>';
 } else if(s.st==="uebernommen"){
  btn='<div class="sw-row"><button class="sw-btn sw-btn--primary" data-dec="frei">Freigeben als Insider <span class="sw-kbd">F</span></button><button class="sw-btn" data-dec="pruefen">Zurück an Prüfung</button></div>';
 } else {
  btn='<div class="sw-row"><button class="sw-btn" data-dec="pruefen">Wieder öffnen</button></div>';
 }
 return '<div class="sw-decide">'+btn+'<div class="sw-decide__line">'+C.standHtml(s)+who+(s.st==="uebernommen"?'<span class="sw-muted">· wartet auf Freigabe durch</span>'+C.person("I"):"")+(s.grund?'<span class="sw-muted">· Grund: '+s.grund+'</span>':"")+'</div></div>';
}
function befund(){
 var f=byId(st.sel), doc=st.doc||f.doc, d=C.D[doc], keys=f.belege.map(function(b){return b[1]}), ix=keys.indexOf(doc);
 var calc=f.calc.length?'<div class="sw-panel"><table class="sw-table"><tbody>'+f.calc.map(function(c){return '<tr><td>'+c[0]+'<span class="sw-origin">'+(c[2]||"")+'</span></td><td class="r">'+c[1]+'</td><td style="width:110px">'+(c[3]==="machine"?'<span class="sw-state sw-state--machine">'+I("bot")+'Maschinell</span>':c[3]==="human"?'<span class="sw-state sw-state--human">'+I("user-check")+'Bestätigt</span>':"")+'</td></tr>'}).join("")+'<tr class="sum"><td colspan="3">'+f.sum+'</td></tr></tbody></table></div>':'<p class="meta sw-secondary" style="margin:0">'+f.sum+'</p>';
 var L=C.LISTEN.filter(function(l){return l[0]===f.liste})[0];
 return '<div class="split"><div class="split-left"><div class="split-scroll">'+
 '<div class="fhead"><div class="sw-row"><span class="sw-chip'+(L[2]?" sw-chip--"+L[2]:"")+'">'+L[1]+'</span><span class="meta sw-muted">'+f.art+(f.hinweis?" · Mengenänderung "+f.hinweis:"")+'</span></div><h1 class="section-title">'+(f.nr?'<span class="sw-pos-nr">'+f.nr+'</span>':"")+f.kurz+'</h1>'+(f.cent!==null?'<span class="kpi">'+euro(f.cent)+'</span>':"")+'</div>'+
 (f.risiko?'<div class="callout">'+I("alert")+'<div><b>Kürzungsrisiko aus GU-Sicht</b>'+f.risiko+'</div></div>':"")+
 (f.hinweis?'<div class="callout" style="background:var(--surface-subtle)">'+I("alert")+'<div><b style="color:var(--text-secondary)">Mengenänderung über 20 % ('+f.hinweis+')</b>Der GU kann hier einen neuen Einheitspreis prüfen. <span class="sw-muted">(Annahme zur ÖNORM B 2110, Insider prüft)</span></div></div>':"")+
 calc+
 '<div class="sw-stack" style="gap:var(--space-2)"><span class="label">Beweiskette · '+f.belege.length+(f.belege.length===1?" Beleg":" Belege")+'</span><div class="sw-chain">'+f.belege.map(function(b){var dd=C.D[b[1]];return '<div class="sw-ev" data-doc="'+b[1]+'"'+(doc===b[1]?' aria-current="true"':"")+'><span class="sw-ev__date">'+b[0]+'</span><span class="sw-ev__rail"></span><div class="sw-ev__body"><b>'+b[2]+'</b><span>'+b[3]+'</span><button class="sw-source"'+(doc===b[1]?' aria-pressed="true"':"")+'>'+I(dd.icon)+dd.file+(dd.page.indexOf("/")>0?" · "+dd.page.split(" /")[0]:"")+'</button></div></div>'}).join("")+'</div></div>'+
 '</div>'+decideBar(f)+'</div>'+
 '<div class="split-right"><div class="sw-viewer"><div class="sw-viewer__bar"><span class="sw-viewer__file">'+d.file+'</span><div class="sw-viewer__tools"><button class="sw-btn sw-btn--ghost sw-btn--sm" data-step="-1" aria-label="Voriger Beleg"'+(ix<=0?" disabled":"")+'>'+I("chevron-left")+'</button><span>'+d.page+'</span><button class="sw-btn sw-btn--ghost sw-btn--sm" data-step="1" aria-label="Nächster Beleg"'+(ix>=keys.length-1?" disabled":"")+'>'+I("chevron-right")+'</button><button class="sw-btn sw-btn--ghost sw-btn--sm" data-zoom="-10" aria-label="Verkleinern">'+I("zoom-out")+'</button><span class="zoom">'+st.zoom+' %</span><button class="sw-btn sw-btn--ghost sw-btn--sm" data-zoom="10" aria-label="Vergrößern">'+I("zoom-in")+'</button></div></div>'+
 '<div class="sw-viewer__body"><div class="sw-viewer__canvas"><div style="width:100%;max-width:560px;transform:scale('+(st.zoom/100)+');transform-origin:top center">'+C.page(doc)+'</div></div><div class="sw-viewer__rail">'+f.belege.map(function(b){return '<button class="sw-thumb" data-doc="'+b[1]+'"'+(doc===b[1]?' aria-current="true"':"")+'><span class="sw-thumb__page">'+C.page(b[1])+'</span>'+C.D[b[1]].label+'</button>'}).join("")+'</div></div></div></div></div>';
}
function vorpruefung(){
 return '<div class="scr-body"><p class="lead body">4 Positionen mit Kürzungsrisiko: <b>8.767,50 €</b>, davon 2 bereits in AR3 gekürzt (2.196,00 €). Bei 1 Abzug des GU ist kein Vertragspunkt zu finden.</p>'+
 '<div class="sw-panel tw"><div class="sw-panel__head"><span class="section-title">Positionen mit Kürzungsrisiko</span><span class="meta sw-muted">Grund aus fester Liste</span></div>'+C.vorpruefTable()+'</div>'+
 '<div class="sw-panel"><div class="sw-panel__head"><span class="section-title">Hinweise ohne Betrag</span><span class="meta sw-muted">Annahme zur ÖNORM B 2110, Insider prüft</span></div>'+
 [["24.02.05A","Mehrschicht-Verbundrohr","+26,9 %","J5"],["22.06.03C","Rohrdämmung 13 mm","+26,7 %","J6"],["26.03.04A","Wickelfalzrohr DN 200","+36,2 %","J7"]].map(function(h){return '<div class="hint">'+I("alert")+'<div><b style="font-weight:500"><span class="sw-pos-nr">'+h[0]+'</span>'+h[1]+': Mengenänderung '+h[2]+'</b><br><span>Der GU kann hier einen neuen Einheitspreis prüfen.</span></div></div>'}).join("")+'</div>'+
 '<div class="sw-panel tw"><div class="sw-panel__head"><span class="section-title">Schlussrechnung aus GU-Sicht</span><span class="meta sw-muted">Bauvertrag vom 14.11.2025</span></div>'+C.cascade(st.arOpen)+'</div></div>';
}
function render(){
 if(VIEWS.indexOf(st.view)<0)st.view="cockpit";
 document.getElementById("side").outerHTML=C.sidebar(st.view==="befund"?"befunde":st.view).replace('<aside class="sw-sidebar">','<aside class="sw-sidebar" id="side">');
 document.getElementById("head").innerHTML=head();
 var v=document.getElementById("view");
 v.innerHTML=st.view==="cockpit"?cockpit():st.view==="befunde"?befunde():st.view==="befund"?befund():st.view==="ordner"?ordner():vorpruefung();
 S.mount();
}
var tt=null;
function toast(msg){var t=document.getElementById("toast");t.innerHTML='<div class="sw-toast" role="status">'+msg+'<button id="undo">'+I("undo")+'Rückgängig</button></div>';t.hidden=false;S.mount(t);clearTimeout(tt);tt=setTimeout(function(){t.hidden=true},5000)}
function setStand(id,neu,grund){
 var s=st.stand[id];st.undo.push([id,JSON.parse(JSON.stringify(s))]);
 var wer=neu==="frei"?"I":"M", wort={uebernommen:"Übernommen",frei:"Freigegeben",verworfen:"Verworfen",anwalt:"Braucht Anwalt",zurueck:"Zurückgestellt",pruefen:"Wieder geöffnet"}[neu];
 s.st=neu==="verworfen"?"verworfen":neu;s.grund=grund||null;s.log=s.log.concat([[wort,wer,now()]]);
 st.reasons=false;render();var f=byId(id);toast(wort+": "+(f.nr?f.nr+" ":"")+f.kurz);
}
function go(hash){var h=(hash||"").replace("#","");if(h==="theme")return;if(VIEWS.indexOf(h)>=0){st.view=h;render()}}
window.addEventListener("hashchange",function(){go(location.hash)});
document.addEventListener("click",function(e){
 var a=e.target.closest("a[href^='#']");
 if(a){e.preventDefault();if(a.getAttribute("aria-disabled")==="true")return;var h=a.getAttribute("href").slice(1);
  if(h==="theme"){var r=document.documentElement,dark=r.dataset.theme?r.dataset.theme==="dark":matchMedia("(prefers-color-scheme: dark)").matches;r.dataset.theme=dark?"light":"dark";return}
  st.view=h;render();return}
 var o=e.target.closest("[data-open]");if(o){st.sel=o.dataset.open;st.doc=null;st.zoom=100;st.reasons=false;st.view="befund";render();return}
 var src=e.target.closest("[data-src]");if(src){var key=src.dataset.src,hit=C.F.filter(function(f){return f.belege.some(function(b){return b[1]===key})})[0];if(hit){st.sel=hit.id;st.doc=key;st.view="befund";render()}return}
 var k=e.target.closest("[data-doc]");if(k){st.doc=k.dataset.doc;render();return}
 var tb=e.target.closest("[data-tab]");if(tb){st.tab=tb.dataset.tab;render();return}
 var stp=e.target.closest("[data-step]");if(stp){var f=byId(st.sel),keys=f.belege.map(function(b){return b[1]}),i=keys.indexOf(st.doc||f.doc)+(+stp.dataset.step);if(i>=0&&i<keys.length){st.doc=keys[i];render()}return}
 var z=e.target.closest("[data-zoom]");if(z){st.zoom=Math.max(60,Math.min(150,st.zoom+(+z.dataset.zoom)));render();return}
 var tg=e.target.closest("[data-toggle]");if(tg){st.arOpen=!st.arOpen;render();return}
 var d=e.target.closest("[data-dec]");if(d){var dec=d.dataset.dec;if(dec==="verwerfen"){st.reasons=true;render();return}setStand(st.sel,dec);return}
 var rs=e.target.closest("[data-reason]");if(rs){if(!rs.dataset.reason){st.reasons=false;render();return}setStand(st.sel,"verworfen",rs.dataset.reason);return}
 if(e.target.closest("#undo")){var u=st.undo.pop();if(u){st.stand[u[0]]=u[1];render()}document.getElementById("toast").hidden=true;return}
});
document.addEventListener("keydown",function(e){
 if(e.ctrlKey||e.metaKey||e.altKey||e.repeat)return;
 var t=e.target;
 if(t.closest&&t.closest("input,textarea"))return;
 if(e.key==="Enter"&&t.matches&&t.matches("tr[data-open],tr[data-toggle]")){e.preventDefault();t.click();return}
 if((e.key==="j"||e.key==="k")&&document.querySelector("tr[data-open]")){var rows=[].slice.call(document.querySelectorAll("tr[data-open]")),i=rows.indexOf(document.activeElement);i=e.key==="j"?Math.min(rows.length-1,i+1):Math.max(0,i-1);rows[i].focus();return}
 if(st.view!=="befund")return;
 var s=st.stand[st.sel].st,f=byId(st.sel);if(f.liste==="anwalt")return;
 if((s==="pruefen"||s==="zurueck")&&!st.reasons){if(e.key==="1")setStand(st.sel,"uebernommen");if(e.key==="2"){st.reasons=true;render()}if(e.key==="3")setStand(st.sel,"anwalt");if(e.key==="h"||e.key==="H")setStand(st.sel,"zurueck")}
 else if(s==="uebernommen"&&(e.key==="f"||e.key==="F"))setStand(st.sel,"frei");
});
try{var h0=location.hash.replace("#","");if(VIEWS.indexOf(h0)>=0)st.view=h0}catch(e){}
render();
})();
</script>
`;
writeFileSync(OUT, html);
console.log("geschrieben", OUT, Math.round(html.length / 1024), "KB");
