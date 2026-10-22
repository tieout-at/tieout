// Gemeinsame Inhalte und Bausteine für Bauteil-Vorschauen und Bildschirme. Alle Zahlen aus Produkt/Demo_Faelle.md v1.
// Läuft im Browser (window) und in Node (über new Function). Gibt das Objekt SWC zurück.
var SWC = (function () {
  var I = function (n) { return '<span data-icon="' + n + '"></span>'; };
  function euro(cent) {
    var neg = cent < 0, v = Math.abs(cent), e = Math.floor(v / 100), c = String(v % 100).padStart(2, "0");
    return (neg ? "−" : "") + String(e).replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "," + c + " €";
  }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }

  // ---------- Personen ----------
  var P = { M: ["MS", "Maximilian S.", "Prüfung"], I: ["IN", "Insider", "Freigabe"] };
  function person(k) { return '<span class="sw-person"><span class="sw-avatar">' + P[k][0] + "</span>" + P[k][1] + "</span>"; }

  // ---------- Dokumente (alle synthetisch) ----------
  // typ: lv, plan, mail, foto, aufmass, rb, vertrag, tabelle, ar
  var D = {
    lv12b: { typ: "lv", file: "LV_HKLS_W21-B.pdf", page: "S. 14 / 62", label: "LV", icon: "file-text", pos: "22.04.12B", text: "Plattenheizkörper Typ 22, 600/1000, inkl. Ventilunterteil", menge: "86 Stk", ep: "456,00 €" },
    lv05a: { typ: "lv", file: "LV_HKLS_W21-B.pdf", page: "S. 31 / 62", label: "LV", icon: "file-text", pos: "24.02.05A", text: "Mehrschicht-Verbundrohr 20 × 2,0 inkl. Formteile", menge: "640 m", ep: "18,40 €" },
    lv03c: { typ: "lv", file: "LV_HKLS_W21-B.pdf", page: "S. 19 / 62", label: "LV", icon: "file-text", pos: "22.06.03C", text: "Rohrdämmung 13 mm für Rohr 15 mm", menge: "900 m", ep: "9,85 €" },
    lv04a: { typ: "lv", file: "LV_HKLS_W21-B.pdf", page: "S. 47 / 62", label: "LV", icon: "file-text", pos: "26.03.04A", text: "Wickelfalzrohr DN 200 inkl. Formteile", menge: "210 m", ep: "44,30 €" },
    lv10a: { typ: "lv", file: "LV_HKLS_W21-B.pdf", page: "S. 14 / 62", label: "LV", icon: "file-text", pos: "22.04.10A", text: "Plattenheizkörper Typ 11, 600/800", menge: "42 Stk", ep: "318,00 €" },
    planC: { typ: "plan", idx: "C", file: "H-201_Heizung_Stiege2_C.pdf", page: "Blatt 1 / 1", label: "Plan C", icon: "map" },
    planD: { typ: "plan", idx: "D", file: "H-201_Heizung_Stiege2_D.pdf", page: "Blatt 1 / 1", label: "Plan D", icon: "map" },
    planL: { typ: "plan", idx: "E", file: "L-310_Lueftung_E.pdf", page: "Blatt 1 / 1", label: "Plan E", icon: "map", lueftung: true },
    mail0704: { typ: "mail", file: "2026-04-07_Bauleitung_Planindex-D.eml", page: "S. 1 / 1", label: "Mail", icon: "mail", von: "Ing. P. Moser, Bauleitung Hochbau Beispiel GmbH", an: "Bauleitung Haustechnik Beispiel GmbH", datum: "Di, 07.04.2026, 16:12", betreff: "W21-B Stiege 2 · Planindex D Heizung", vor: "Hallo Herr Wagner, anbei der Planindex D für Stiege 2. Durch die Teilung der Räume in Top 7 bis 13 kommen pro Top zwei Heizkörper dazu.", mark: "Bitte die zusätzlichen Heizkörper gleich mitmachen", nach: ", damit wir beim Estrich nicht warten müssen. Die Abrechnung klären wir am Ende." },
    mail1403: { typ: "mail", file: "2026-03-14_Anmeldung_Technikraum.eml", page: "S. 1 / 1", label: "Mail", icon: "mail", von: "Bauleitung Haustechnik Beispiel GmbH", an: "Ing. P. Moser, Bauleitung Hochbau Beispiel GmbH", datum: "Sa, 14.03.2026, 08:05", betreff: "W21-B Technikraum Keller · Mehrkosten", vor: "Sehr geehrter Herr Moser, durch die Umplanung des Technikraums müssen Verteiler und Leitungen versetzt werden.", mark: "Wir melden hiermit Mehrkosten an", nach: " und reichen das Angebot nach." },
    mail0207: { typ: "mail", file: "2026-07-02_Bauleitung_Termin-Stiege2.eml", page: "S. 1 / 1", label: "Mail", icon: "mail", von: "Ing. P. Moser, Bauleitung Hochbau Beispiel GmbH", an: "Bauleitung Haustechnik Beispiel GmbH", datum: "Do, 02.07.2026, 11:30", betreff: "W21-B Stiege 2 · Terminplan", vor: "Hallo Herr Wagner, der Bauherr möchte früher übergeben.", mark: "Bitte die Fertigstellung Stiege 2 um drei Wochen vorziehen", nach: ". Personal bitte entsprechend einplanen." },
    foto2291: { typ: "foto", file: "IMG_2291.jpg", page: "Foto", label: "Foto", icon: "image" },
    ab12: { typ: "aufmass", file: "AB-12_Aufmass_Heizung.pdf", page: "S. 2 / 3", label: "Aufmaß", icon: "ruler", blatt: "AB-12 · Heizung Stiege 1–3", datum: "18.09.2026", rows: [["22.04.10A", "Plattenheizkörper Typ 11, 600/800", "42", "Stk"], ["22.04.12B", "Plattenheizkörper Typ 22, 600/1000", "100", "Stk"], ["22.04.14A", "Badheizkörper 500/1200", "38", "Stk"]], hl: 1, agFehlt: true },
    ab04: { typ: "aufmass", file: "AB-04_Aufmass_Sanitaer.pdf", page: "S. 1 / 2", label: "Aufmaß", icon: "ruler", blatt: "AB-04 · Sanitär Stiege 1", datum: "12.06.2026", rows: [["24.02.05A", "Mehrschicht-Verbundrohr 20 × 2,0", "396", "m"], ["24.02.06A", "Mehrschicht-Verbundrohr 26 × 3,0", "122", "m"]], hl: 0 },
    ab09: { typ: "aufmass", file: "AB-09_Aufmass_Sanitaer.pdf", page: "S. 1 / 2", label: "Aufmaß", icon: "ruler", blatt: "AB-09 · Sanitär Stiege 2–3", datum: "28.08.2026", rows: [["24.02.05A", "Mehrschicht-Verbundrohr 20 × 2,0", "416", "m"], ["24.02.06A", "Mehrschicht-Verbundrohr 26 × 3,0", "131", "m"]], hl: 0 },
    ab10: { typ: "aufmass", file: "AB-10_Aufmass_Daemmung.pdf", page: "S. 1 / 1", label: "Aufmaß", icon: "ruler", blatt: "AB-10 · Dämmung Heizung", datum: "04.09.2026", rows: [["22.06.03C", "Rohrdämmung 13 mm für Rohr 15 mm", "1.140", "m"], ["22.06.04C", "Rohrdämmung 13 mm für Rohr 18 mm", "610", "m"]], hl: 0 },
    ab13: { typ: "aufmass", file: "AB-13_Aufmass_Lueftung.pdf", page: "S. 1 / 1", label: "Aufmaß", icon: "ruler", blatt: "AB-13 · Lüftung", datum: "21.09.2026", rows: [["26.03.04A", "Wickelfalzrohr DN 200 inkl. Formteile", "286", "m"], ["26.03.05A", "Wickelfalzrohr DN 250 inkl. Formteile", "64", "m"]], hl: 0 },
    rb07: { typ: "rb", nr: "RB-07", file: "RB-07_Regie_Bauwasser.pdf", page: "S. 1 / 1", label: "Regie", icon: "file-text", datum: "22.04.2026", text: "Provisorische Bauwasserversorgung umlegen", rows: [["Monteur", "18 h"], ["Material", "186,40 €"]], sig: true },
    rb11: { typ: "rb", nr: "RB-11", file: "RB-11_Regie_Steigleitung.pdf", page: "S. 1 / 1", label: "Regie", icon: "file-text", datum: "04.06.2026", text: "Steigleitung umlegen, Kollision mit Lüftung", rows: [["Monteur", "24 h"], ["Helfer", "16 h"], ["Material", "642,80 €"]], sig: true, hlRow: 0 },
    rb14: { typ: "rb", nr: "RB-14", file: "RB-14_Regie_Notabsperrung.pdf", page: "S. 1 / 1", label: "Regie", icon: "file-text", datum: "17.07.2026", text: "Notabsperrung nach Wasserschaden Fremdgewerk", rows: [["Monteur", "8 h"], ["Material", "96,20 €"]], sig: true },
    rb12: { typ: "rb", nr: "RB-12", file: "RB-12_Regie_Entleerung.pdf", page: "S. 1 / 1", label: "Regie", icon: "file-text", datum: "09.06.2026", text: "Zusätzliche Entleerungen Heizung Stiege 1", rows: [["Monteur", "10 h"], ["Helfer", "6 h"], ["Material", "84,50 €"]], sig: false },
    rb15: { typ: "rb", nr: "RB-15", file: "RB-15_Regie_Strangventile.pdf", page: "S. 1 / 1", label: "Regie", icon: "file-text", datum: "02.09.2026", text: "Nachrüstung Strangregulierventile", rows: [["Monteur", "8 h"], ["Material", "221,00 €"]], sig: false },
    stdKW23: { typ: "tabelle", file: "Stundenliste_KW23.xlsx", page: "Blatt 1", label: "Stunden", icon: "table", titel: "Stundenliste KW 23 · Montagetrupp 2", head: ["Datum", "Tätigkeit", "Stunden"], rows: [["03.06.2026", "Steigleitung Stiege 2 umlegen", "9"], ["04.06.2026", "Steigleitung Stiege 2 umlegen", "8"], ["05.06.2026", "Steigleitung Stiege 2 umlegen", "4"]], sumRow: ["Summe Monteur", "", "21"] },
    vertrag72: { typ: "vertrag", file: "Bauvertrag_W21-B_HKLS.pdf", page: "S. 6 / 18", label: "Vertrag", icon: "file-text", pkt: "7.2 Preise", vor: "Die Preise sind veränderlich.", mark: "Der Lohnanteil wird nach ÖNORM B 2111 mit dem Index Lohn umgerechnet", nach: "; Basis ist der Monat der Angebotsabgabe." },
    vertrag43: { typ: "vertrag", file: "Bauvertrag_W21-B_HKLS.pdf", page: "S. 4 / 18", label: "Vertrag", icon: "file-text", pkt: "4.3 Baustelleneinrichtung", vor: "Die Baustelleneinrichtung ist mit der Pauschale Pos. 01.01.01A abgegolten.", mark: "Ein Versetzen der Container ist in der Pauschale enthalten", nach: "." },
    index: { typ: "tabelle", file: "Indexblatt_Lohn_2026.pdf", page: "S. 1 / 1", label: "Index", icon: "table", titel: "Index Lohn (synthetisch)", head: ["Monat", "Index", "Änderung"], rows: [["11/2025 (Basis)", "100,0", "–"], ["05/2026", "103,8", "+3,8 %"]] },
    k3: { typ: "tabelle", file: "Kalkulation_K3_W21-B.xlsx", page: "Blatt K3", label: "K3", icon: "table", titel: "K3 Mittellohnpreis (eigene Kalkulation)", head: ["Bestandteil", "", "€/h"], rows: [["Mittellohn", "", "38,60"], ["Lohnnebenkosten", "", "13,90"], ["Umlage", "", "4,30"]], sumRow: ["Mittellohnpreis", "", "56,80"] }
  };

  // ---------- Befunde ----------
  // [id, art, posnr, kurz, unterzeile, cent, liste, risiko, belege, rechenweg]
  function R(label, wert, quelle, stand) { return [label, wert, quelle || "", stand || ""]; }
  var F = [
    { id: "J1", art: "Mehrmenge aus Planänderung", nr: "22.04.12B", kurz: "Plattenheizkörper Typ 22, 600/1000", sub: "+14 Stk über LV", cent: 638400, liste: "jetzt", risiko: "Aufmaß AB-12 ist vom GU nicht gegengezeichnet. Plan D und Mail vom 07.04. beilegen, gemeinsames Aufmaß nachholen.",
      belege: [["–", "lv12b", "LV-Position 22.04.12B", "86 Stk zu 456,00 €"], ["12.02.2026", "planC", "Plan H-201, Index C", "1 Heizkörper je Top (Top 7–13)"], ["03.04.2026", "planD", "Plan H-201, Index D", "Räume geteilt, je Top 2 zusätzliche Heizkörper"], ["07.04.2026", "mail0704", "Mail Bauleitung GU", "„Bitte die zusätzlichen Heizkörper gleich mitmachen“"], ["14.05.2026", "foto2291", "Foto Stiege 2, Top 9", "Heizkörper montiert"], ["18.09.2026", "ab12", "Aufmaßblatt AB-12", "100 Stk, vom GU nicht gegengezeichnet"]],
      calc: [R("LV-Menge", "86 Stk", "LV Pos. 22.04.12B", "human"), R("Aufmaß", "100 Stk", "AB-12 · S. 2", "machine"), R("Verrechnet", "86 Stk", "AR1–AR3", "human"), R("Differenz", "100 − 86 = 14 Stk"), R("Einheitspreis", "456,00 €", "LV Pos. 22.04.12B", "human")], sum: "14 Stk × 456,00 € = 6.384,00 €", doc: "mail0704" },
    { id: "J8", art: "Preisumrechnung", nr: "", kurz: "Lohnanteil ab 01.05.2026 (ÖNORM B 2111)", sub: "Index Lohn +3,8 %", cent: 724800, liste: "jetzt",
      belege: [["14.11.2025", "vertrag72", "Bauvertrag Pkt. 7.2", "veränderliche Preise, Index Lohn"], ["–", "index", "Indexblatt Lohn", "+3,8 % ab 05/2026"]],
      calc: [R("Lohnanteil der Leistungen ab 01.05.2026", "190.736,84 €", "Aufmaßblätter ab Mai", "machine"), R("Index Lohn", "+3,8 %", "Indexblatt", "human")], sum: "190.736,84 € × 3,8 % = 7.248,00 €", doc: "vertrag72" },
    { id: "J7", art: "Mehrmenge", nr: "26.03.04A", kurz: "Wickelfalzrohr DN 200 inkl. Formteile", sub: "+76 m über LV", cent: 336680, liste: "jetzt", hinweis: "+36,2 %",
      belege: [["–", "lv04a", "LV-Position 26.03.04A", "210 m zu 44,30 €"], ["21.09.2026", "ab13", "Aufmaßblatt AB-13", "286 m"], ["–", "planL", "Plan L-310, Index E", "Leitungsführung Lüftung"]],
      calc: [R("LV-Menge", "210 m", "LV Pos. 26.03.04A", "human"), R("Aufmaß", "286 m", "AB-13", "human"), R("Verrechnet", "210 m", "AR1–AR3", "human"), R("Einheitspreis", "44,30 €", "LV", "human")], sum: "76 m × 44,30 € = 3.366,80 €", doc: "ab13" },
    { id: "J5", art: "Mehrmenge", nr: "24.02.05A", kurz: "Mehrschicht-Verbundrohr 20 × 2,0", sub: "+172 m über LV", cent: 316480, liste: "jetzt", hinweis: "+26,9 %",
      belege: [["–", "lv05a", "LV-Position 24.02.05A", "640 m zu 18,40 €"], ["12.06.2026", "ab04", "Aufmaßblatt AB-04", "396 m"], ["28.08.2026", "ab09", "Aufmaßblatt AB-09", "416 m"]],
      calc: [R("LV-Menge", "640 m", "LV Pos. 24.02.05A", "human"), R("Aufmaß", "396 + 416 = 812 m", "AB-04, AB-09", "human"), R("Verrechnet", "640 m", "AR1–AR3", "human"), R("Einheitspreis", "18,40 €", "LV", "human")], sum: "172 m × 18,40 € = 3.164,80 €", doc: "ab09" },
    { id: "J3", art: "Regie", nr: "RB-11", kurz: "Steigleitung umlegen (Kollision Lüftung)", sub: "unterschrieben, in keiner Abschlagsrechnung", cent: 297480, liste: "jetzt", risiko: "Bericht 24 h Monteur, Stundenliste KW 23 nur 21 h. Stunden korrigieren oder Liste nachreichen.",
      belege: [["04.06.2026", "rb11", "Regiebericht RB-11", "24 h Monteur, 16 h Helfer, unterschrieben"], ["05.06.2026", "stdKW23", "Stundenliste KW 23", "21 h Monteur"]],
      calc: [R("Monteur", "24 h × 62,50 € = 1.500,00 €", "RB-11", "machine"), R("Helfer", "16 h × 52,00 € = 832,00 €", "RB-11", "human"), R("Material", "642,80 €", "RB-11", "human")], sum: "Summe 2.974,80 €", doc: "rb11" },
    { id: "J6", art: "Mehrmenge", nr: "22.06.03C", kurz: "Rohrdämmung 13 mm für Rohr 15 mm", sub: "+240 m über LV", cent: 236400, liste: "jetzt", hinweis: "+26,7 %",
      belege: [["–", "lv03c", "LV-Position 22.06.03C", "900 m zu 9,85 €"], ["04.09.2026", "ab10", "Aufmaßblatt AB-10", "1.140 m"]],
      calc: [R("LV-Menge", "900 m", "LV Pos. 22.06.03C", "human"), R("Aufmaß", "1.140 m", "AB-10", "human"), R("Verrechnet", "900 m", "AR1–AR3", "human"), R("Einheitspreis", "9,85 €", "LV", "human")], sum: "240 m × 9,85 € = 2.364,00 €", doc: "ab10" },
    { id: "J2", art: "Regie", nr: "RB-07", kurz: "Provisorische Bauwasserversorgung umlegen", sub: "unterschrieben, in keiner Abschlagsrechnung", cent: 131140, liste: "jetzt",
      belege: [["22.04.2026", "rb07", "Regiebericht RB-07", "18 h Monteur, unterschrieben"]],
      calc: [R("Monteur", "18 h × 62,50 € = 1.125,00 €", "RB-07", "human"), R("Material", "186,40 €", "RB-07", "human")], sum: "Summe 1.311,40 €", doc: "rb07" },
    { id: "J4", art: "Regie", nr: "RB-14", kurz: "Notabsperrung nach Wasserschaden Fremdgewerk", sub: "unterschrieben, in keiner Abschlagsrechnung", cent: 59620, liste: "jetzt",
      belege: [["17.07.2026", "rb14", "Regiebericht RB-14", "8 h Monteur, unterschrieben"]],
      calc: [R("Monteur", "8 h × 62,50 € = 500,00 €", "RB-14", "human"), R("Material", "96,20 €", "RB-14", "human")], sum: "Summe 596,20 €", doc: "rb14" },
    { id: "O3", art: "Änderung", nr: "", kurz: "Umplanung Technikraum Keller", sub: "angemeldet 14.03., nie bepreist", cent: 835280, liste: "offen",
      belege: [["14.03.2026", "mail1403", "Mail Anmeldung Mehrkosten", "„Wir melden hiermit Mehrkosten an“"], ["–", "k3", "Kalkulation K3", "Mittellohnpreis 56,80 €/h"]],
      calc: [R("Lohn", "96 h × 56,80 € = 5.452,80 €", "K3 Mittellohnpreis", "machine"), R("Material", "2.900,00 €", "eigene Kalkulation", "machine")], sum: "Untergrenze 8.352,80 €", doc: "mail1403" },
    { id: "O1", art: "Regie", nr: "RB-12", kurz: "Zusätzliche Entleerungen Heizung Stiege 1", sub: "nicht unterschrieben", cent: 102150, liste: "offen",
      belege: [["09.06.2026", "rb12", "Regiebericht RB-12", "keine Unterschrift des GU"]],
      calc: [R("Monteur", "10 h × 62,50 € = 625,00 €", "RB-12", "machine"), R("Helfer", "6 h × 52,00 € = 312,00 €", "RB-12", "machine"), R("Material", "84,50 €", "RB-12", "machine")], sum: "Summe 1.021,50 €", doc: "rb12" },
    { id: "O2", art: "Regie", nr: "RB-15", kurz: "Nachrüstung Strangregulierventile", sub: "nicht unterschrieben", cent: 72100, liste: "offen",
      belege: [["02.09.2026", "rb15", "Regiebericht RB-15", "keine Unterschrift des GU"]],
      calc: [R("Monteur", "8 h × 62,50 € = 500,00 €", "RB-15", "machine"), R("Material", "221,00 €", "RB-15", "machine")], sum: "Summe 721,00 €", doc: "rb15" },
    { id: "V1", art: "Pauschale", nr: "", kurz: "Container zweimal versetzt", sub: "laut Vertrag Pkt. 4.3 pauschal", cent: 118000, liste: "verloren",
      belege: [["14.11.2025", "vertrag43", "Bauvertrag Pkt. 4.3", "Versetzen in der Pauschale enthalten"]],
      calc: [R("Aufwand laut Regie", "1.180,00 €", "eigene Aufzeichnung", "human")], sum: "nicht verrechenbar: 1.180,00 €", doc: "vertrag43" },
    { id: "A1", art: "Terminänderung", nr: "", kurz: "Stiege 2 drei Wochen vorziehen", sub: "Hinweis ohne Betrag", cent: null, liste: "anwalt",
      belege: [["02.07.2026", "mail0207", "Mail Bauleitung GU", "„Fertigstellung Stiege 2 um drei Wochen vorziehen“"]],
      calc: [], sum: "kein Betrag, Würdigung nur durch den Anwalt", doc: "mail0207" }
  ];
  var LISTEN = [["jetzt", "Jetzt verrechenbar", "pos"], ["offen", "Angemeldet und offen", "warn"], ["verloren", "Verloren", ""], ["anwalt", "Braucht Anwalt", "law"]];
  var GRUENDE = ["Bereits verrechnet", "Kein Anspruch laut Vertrag", "Beleg falsch zugeordnet", "Duplikat"];

  // Anfangsstände (synthetischer Verlauf)
  function startStand() {
    var s = {};
    F.forEach(function (f) { s[f.id] = { st: f.liste === "anwalt" ? "anwalt" : "pruefen", log: [] }; });
    ["J2", "J4", "J5", "J6", "J7"].forEach(function (id) {
      s[id] = { st: "frei", log: [["Übernommen", "M", "21.10.2026, 17:40"], ["Freigegeben", "I", "22.10.2026, 09:12"]] };
    });
    return s;
  }

  // ---------- Bausteine ----------
  function brand() { return '<div class="sw-brand">Schlusswerk</div>'; }
  function sidebar(active, counts) {
    counts = counts || {};
    var nav = [["cockpit", "layout-dashboard", "Übersicht", ""], ["ordner", "folder", "Ordner", "165"], ["ledger", "table", "Ledger", "380", true], ["befunde", "list-checks", "Befunde", "12"], ["vorpruefung", "shield-check", "Vorprüfung aus GU-Sicht", "4"], ["blatt", "clipboard-list", "Schlussbesprechung", "", true], ["export", "download", "Export", "", true]];
    return '<aside class="sw-sidebar">' + brand() +
      '<button class="sw-switch" type="button"><span class="sw-switch__t"><b>Wohnhausanlage Wien 21</b><span>Bauplatz B · HKLS-Los</span></span>' + I("chevrons-up-down") + "</button>" +
      '<nav class="sw-nav" aria-label="Arbeitsschritte">' + nav.map(function (n) {
        return '<a href="#' + n[0] + '"' + (n[4] ? ' aria-disabled="true" title="folgt in der App (Phase 2/3)"' : "") + (n[0] === active ? ' aria-current="page"' : "") + ">" + I(n[1]) + n[2] + (n[3] ? '<span class="sw-count">' + n[3] + "</span>" : "") + "</a>";
      }).join("") + "</nav>" +
      '<div style="flex:1"></div><nav class="sw-nav"><a href="#theme" id="theme">' + I("sun-moon") + "Hell / Dunkel</a></nav></aside>";
  }
  function pagehead(crumbs, title) {
    return '<header class="sw-pagehead"><div class="sw-pagehead__path">' + crumbs.map(function (c) { return '<span class="sw-crumb">' + (c[1] ? '<a href="#' + c[1] + '">' + c[0] + "</a>" : c[0]) + "</span><span class=\"sw-crumb\">/</span>"; }).join("") + "<b>" + title + "</b></div>" +
      '<div class="sw-pagehead__actions"><span class="sw-synth" title="Synthetischer Demo-Datensatz: Firmen und Beträge erfunden, keine echten Funde">Synthetisch</span>' +
      '<button class="sw-btn sw-btn--sm" aria-disabled="true" title="Excel-Export folgt in Phase 3">' + I("download") + "Excel</button>" +
      '<button class="sw-btn sw-btn--sm" aria-disabled="true" title="Bericht folgt in Phase 3">Bericht</button></div></header>';
  }
  function facts() {
    return '<div class="sw-row meta sw-muted" style="gap:var(--space-4)"><span>GU <b class="sw-secondary" style="font-weight:500">Hochbau Beispiel GmbH</b></span><span>Auftrag <b class="sw-secondary" style="font-weight:500">1.240.000,00 €</b></span><span>ÖNORM B 2110 · Einheitspreise · veränderliche Preise</span><span>Schlussrechnung legen bis <b class="sw-secondary" style="font-weight:500">31.10.2026</b></span></div>';
  }
  function steps(frei) {
    return '<div class="sw-steps">' +
      '<div class="sw-step sw-step--done"><span class="sw-step__n">' + I("check") + '</span><div class="sw-step__t"><b>Einlesen</b><span class="meta">165 Dokumente, davon 12 Duplikate</span></div></div>' +
      '<div class="sw-step sw-step--done"><span class="sw-step__n">' + I("check") + '</span><div class="sw-step__t"><b>Datensätze</b><span class="meta">Jedes Feld mit Quelle, 31 korrigiert</span></div></div>' +
      '<div class="sw-step sw-step--done"><span class="sw-step__n">' + I("check") + '</span><div class="sw-step__t"><b>Abgleich</b><span class="meta">380 LV-Positionen, 16 Regieberichte</span></div></div>' +
      '<div class="sw-step sw-step--now"><span class="sw-step__n">4</span><div class="sw-step__t"><b>Prüfen und Freigeben</b><span class="meta">' + frei + " von 12 Posten freigegeben</span></div></div></div>";
  }
  function kpis() {
    return '<div class="sw-kpis">' +
      '<div class="sw-kpi"><span class="label">Jetzt verrechenbar</span><span class="kpi">27.410,00 €</span><span class="sw-kpi__ctx meta">8 Posten · 4 Mehrmengen, 3 Regie, 1 Preisumrechnung</span></div>' +
      '<div class="sw-kpi"><span class="label">Angemeldet und offen</span><span class="kpi">10.095,30 €</span><span class="sw-kpi__ctx meta">3 Posten · dazu 1 Hinweis „Braucht Anwalt“</span></div>' +
      '<div class="sw-kpi"><span class="label">Verloren</span><span class="kpi">1.180,00 €</span><span class="sw-kpi__ctx meta">1 Posten · laut Vertrag pauschal</span></div></div>';
  }
  function standHtml(s) {
    var st = s.st;
    if (st === "frei") return '<span class="sw-status sw-status--done">' + I("circle-check") + "Freigegeben</span>";
    if (st === "uebernommen") return '<span class="sw-status">' + I("user-check") + "Übernommen</span>";
    if (st === "verworfen") return '<span class="sw-status">' + I("circle-x") + "Verworfen</span>";
    if (st === "anwalt") return '<span class="sw-status sw-status--law">' + I("scale") + "Braucht Anwalt</span>";
    if (st === "zurueck") return '<span class="sw-status">' + I("pause") + "Zurückgestellt</span>";
    return '<span class="sw-status">' + I("circle-dashed") + "Prüfen</span>";
  }
  function row(f, s, sel) {
    var risk = f.risiko ? '<span class="sw-risk" title="Kürzungsrisiko aus GU-Sicht">' + I("alert") + "</span>" : "";
    return '<tr data-open="' + f.id + '" tabindex="0"' + (sel ? ' aria-selected="true"' : "") + '><td class="sw-td-2"><div class="sw-cell"><b>' + (f.nr ? '<span class="sw-pos-nr">' + f.nr + "</span>" : "") + f.kurz + "</b><span>" + f.art + " · " + f.sub + " · " + f.belege.length + (f.belege.length === 1 ? " Beleg" : " Belege") + "</span></div></td>" +
      '<td class="r">' + (f.cent === null ? '<span class="sw-muted">–</span>' : euro(f.cent)) + risk + "</td><td>" + standHtml(s) + "</td></tr>";
  }
  function befundTable(stand, filter, selId) {
    var colg = '<colgroup><col><col style="width:150px"><col style="width:150px"></colgroup>';
    var body = LISTEN.map(function (L) {
      var items = F.filter(function (f) { return f.liste === L[0] && (!filter || filter(f, stand[f.id])); });
      if (!items.length) return "";
      var sum = items.reduce(function (a, f) { return a + (f.cent || 0); }, 0);
      return '<tr class="grp"><td><span class="sw-chip' + (L[2] ? " sw-chip--" + L[2] : "") + '">' + L[1] + '</span><span class="sw-count">' + items.length + '</span></td><td class="r">' + (L[0] === "anwalt" ? "" : euro(sum)) + "</td><td></td></tr>" +
        items.map(function (f) { return row(f, stand[f.id], f.id === selId); }).join("");
    }).join("");
    return '<table class="sw-table" style="table-layout:fixed">' + colg + '<thead><tr><th>Posten</th><th class="r">Betrag</th><th>Stand</th></tr></thead><tbody>' + (body || '<tr><td colspan="3" class="sw-muted">Keine Treffer.</td></tr>') + "</tbody></table>";
  }

  // ---------- Belegseiten ----------
  function synth() { return '<span class="sw-page__synth">Synthetisch</span>'; }
  function planSvg(d) {
    var s = "", i, x;
    for (i = 0; i < 7; i++) {
      x = 30 + i * 68;
      s += '<rect x="' + x + '" y="56" width="68" height="112" fill="none" stroke="var(--doc-figure)" stroke-width="1.2"/>';
      s += '<text x="' + (x + 34) + '" y="72" font-size="10" text-anchor="middle" fill="var(--doc-figure)" font-family="JetBrains Mono,monospace">Top ' + (7 + i) + "</text>";
      if (d.idx === "D") {
        s += '<line x1="' + (x + 23) + '" y1="80" x2="' + (x + 23) + '" y2="168" stroke="var(--doc-figure)" stroke-width="0.8" stroke-dasharray="3 2"/>';
        s += '<rect x="' + (x + 4) + '" y="156" width="15" height="6" fill="var(--doc-figure)"/>';
        s += '<rect x="' + (x + 27) + '" y="156" width="15" height="6" fill="var(--doc-mark-line)"/><rect x="' + (x + 48) + '" y="156" width="15" height="6" fill="var(--doc-mark-line)"/>';
        s += '<rect x="' + (x + 24) + '" y="152" width="42" height="14" rx="2" fill="none" stroke="var(--doc-mark-line)" stroke-width="1.2"/>';
      } else if (d.lueftung) {
        s += '<line x1="' + x + '" y1="112" x2="' + (x + 68) + '" y2="112" stroke="var(--doc-figure)" stroke-width="3"/>';
      } else {
        s += '<rect x="' + (x + 26) + '" y="156" width="15" height="6" fill="var(--doc-figure)"/>';
      }
    }
    var cap = d.idx === "D" ? "Index D: Räume geteilt, je Top 3 statt 1 Heizkörper (+14 Stk, markiert)" : d.lueftung ? "Index E: Zuluftleitung DN 200 über alle Tops" : "Index C: 1 Heizkörper je Top (7 Stk)";
    var titel = d.lueftung ? "Lüftung Regelgeschoß Stiege 2 · Leitungsführung" : "Heizung Regelgeschoß Stiege 2 · Heizkörper";
    return '<svg viewBox="0 0 540 250" role="img" aria-label="' + titel + ", " + cap + '" style="width:100%;height:auto;display:block"><rect width="540" height="250" fill="var(--doc-paper)"/>' + s +
      '<text x="30" y="36" font-size="12" font-weight="600" fill="var(--doc-figure)" font-family="Inter,sans-serif">' + titel + "</text>" +
      '<text x="30" y="192" font-size="11" fill="' + (d.idx === "D" ? "var(--doc-mark-line)" : "var(--doc-ink-secondary)") + '" font-family="Inter,sans-serif">' + cap + "</text>" +
      '<rect x="330" y="208" width="190" height="34" fill="var(--doc-paper)" stroke="var(--doc-figure)"/><text x="338" y="222" font-size="10" fill="var(--doc-figure)" font-family="JetBrains Mono,monospace">' + d.file.replace(".pdf", "") + "</text>" +
      '<text x="338" y="236" font-size="10" fill="var(--doc-figure)" font-family="JetBrains Mono,monospace">Index ' + d.idx + " · " + (d.idx === "C" ? "12.02.2026" : d.idx === "D" ? "03.04.2026" : "10.06.2026") + "</text></svg>";
  }
  function dt(head, rows, hl, sumRow) {
    return '<table class="sw-dt"><thead><tr>' + head.map(function (h) { return "<th>" + h + "</th>"; }).join("") + "</tr></thead><tbody>" +
      rows.map(function (r, i) { return "<tr" + (i === hl ? ' class="hl"' : "") + ">" + r.map(function (c) { return "<td>" + c + "</td>"; }).join("") + "</tr>"; }).join("") +
      (sumRow ? '<tr class="sum">' + sumRow.map(function (c) { return "<td>" + c + "</td>"; }).join("") + "</tr>" : "") + "</tbody></table>";
  }
  function page(key) {
    var d = D[key];
    if (!d) return '<div class="sw-page">' + synth() + "<p>Kein Beleg.</p></div>";
    var h = '<div class="sw-page">' + synth();
    if (d.typ === "mail") h += '<div class="sw-page__head"><span>Von</span><b>' + d.von + "</b><span>An</span><span>" + d.an + "</span><span>Datum</span><span>" + d.datum + "</span><span>Betreff</span><b>" + d.betreff + "</b></div><p>" + d.vor + '</p><p><span class="sw-mark">' + d.mark + "</span>" + d.nach + "</p><p>Mit freundlichen Grüßen</p>";
    else if (d.typ === "plan") h += planSvg(d);
    else if (d.typ === "foto") h += '<div class="sw-photo"><span>Beispielfoto (synthetisch)<br>Heizkörper Typ 22, Stiege 2, Top 9</span></div><div class="sw-page__head" style="margin-top:var(--space-3);border:0"><span>Datei</span><span>IMG_2291.jpg</span><span>Aufnahme</span><span>14.05.2026, 09:42</span><span>Ort</span><span>Stiege 2, Top 9</span></div>';
    else if (d.typ === "aufmass") h += "<b>Aufmaßblatt " + d.blatt + '</b><div class="sw-doc-meta">erstellt ' + d.datum + "</div>" + dt(["Pos.", "Kurztext", "Menge", "EH"], d.rows, d.hl) +
      '<div class="sw-sig"><div>Auftragnehmer: unterschrieben, ' + d.datum + "</div>" + (d.agFehlt ? '<div class="sw-mark--risk">Auftraggeber (GU): keine Unterschrift</div>' : "<div>Auftraggeber (GU): gegengezeichnet</div>") + "</div>";
    else if (d.typ === "rb") h += "<b>Regiebericht " + d.nr + '</b><div class="sw-doc-meta">' + d.datum + " · " + d.text + "</div>" + dt(["Leistung", "Menge"], d.rows, d.hlRow) +
      '<div class="sw-sig"><div>Auftragnehmer: unterschrieben</div>' + (d.sig ? "<div>Bauleitung GU: unterschrieben, " + d.datum + "</div>" : '<div class="sw-mark--risk">Bauleitung GU: keine Unterschrift</div>') + "</div>";
    else if (d.typ === "vertrag") h += "<b>Bauvertrag W21-B HKLS</b><div class=\"sw-doc-meta\">vom 14.11.2025 · Pkt. " + d.pkt + "</div><p>" + d.vor + ' <span class="sw-mark">' + d.mark + "</span>" + d.nach + "</p>";
    else if (d.typ === "lv") h += "<b>Leistungsverzeichnis HKLS · W21-B</b><div class=\"sw-doc-meta\">ÖNORM A 2063 · LG " + d.pos.slice(0, 2) + "</div>" + dt(["Pos.", "Kurztext", "Menge", "EP"], [[d.pos, d.text, d.menge, d.ep]], 0);
    else if (d.typ === "tabelle") h += "<b>" + d.titel + '</b><div class="sw-doc-meta">' + d.file + "</div>" + dt(d.head, d.rows, -1, d.sumRow);
    return h + "</div>";
  }

  // ---------- Prüfkaskade (Aufbau wie reebuild R-A) ----------
  function cascade(open) {
    function ok(t) { return '<span class="sw-check sw-check--ok">' + I("check") + t + "</span>"; }
    function miss(t) { return '<span class="sw-check sw-check--miss">' + I("alert") + t + "</span>"; }
    function tr(cls, label, ref, satz, pr, betrag) { return "<tr" + (cls ? ' class="' + cls + '"' : "") + "><td>" + label + (ref ? '<span class="ref">' + ref + "</span>" : "") + '</td><td class="r">' + (satz || "") + "</td><td>" + (pr || "") + '</td><td class="r">' + betrag + "</td></tr>"; }
    var ar = '<tr><td style="padding-left:var(--space-6)">AR1 312.400,00 € (31.03.)</td><td></td><td class="meta sw-muted">nach 3 %, 0,8 %, 0,5 %, 5 % Rücklass</td><td class="r">284.134,21 €</td></tr>' +
      '<tr><td style="padding-left:var(--space-6)">AR2 418.900,00 € (30.06.)</td><td></td><td class="meta sw-muted">nach 3 %, 0,8 %, 0,5 %, 5 % Rücklass</td><td class="r">380.998,14 €</td></tr>' +
      '<tr><td style="padding-left:var(--space-6)">AR3 356.200,00 € (30.09.)</td><td></td><td class="meta sw-muted">nach Kürzung 2.196,00 € laut Korrekturblatt</td><td class="r">321.973,90 €</td></tr>';
    return '<table class="sw-table sw-cascade"><colgroup><col><col style="width:90px"><col style="width:240px"><col style="width:150px"></colgroup><thead><tr><th>Zeile</th><th class="r">Satz</th><th>Prüfung</th><th class="r">Betrag</th></tr></thead><tbody>' +
      tr("", "Leistungssumme laut Entwurf", "Entwurf 1.218.640,00 € + jetzt verrechenbar 27.410,00 €", "", "", "1.246.050,00 €") +
      tr("", "Nachlass", "auf die Leistungssumme · Vertrag Pkt. 5.1", "3,00 %", ok("laut Vertrag"), "−37.381,50 €") +
      tr("sub", "Summe nach Nachlass", "", "", "", "1.208.668,50 €") +
      '<tr class="grp"><td colspan="4">Abzüge laut GU-Abzugsschreiben</td></tr>' +
      tr("", "Baustrom und Bauwasser", "auf die Summe nach Nachlass", "0,80 %", ok("laut Vertrag Pkt. 4.6"), "−9.669,35 €") +
      tr("", "Bauschadensumlage", "auf die Summe nach Nachlass", "0,50 %", miss("kein Vertragspunkt gefunden"), "−6.043,34 €") +
      tr("sub", "Summe Abzüge", "", "", "", "−15.712,69 €") +
      tr("sub", "Betrag vor Einbehalten", "", "", "", "1.192.955,81 €") +
      '<tr class="grp"><td colspan="4">Einbehalte</td></tr>' +
      tr("", "Haftrücklass", "auf den Betrag vor Einbehalten · durch Bankgarantie ablösbar", "3,00 %", ok("laut Vertrag Pkt. 9.2"), "−35.788,67 €") +
      tr("sub", "Summe Einbehalte", "", "", "", "−35.788,67 €") +
      tr("sub", "Schlussrechnungsbetrag vor Abzug der Zahlungen", "", "", "", "1.157.167,14 €") +
      '<tr class="grp"><td colspan="4">Zahlungen</td></tr>' +
      '<tr data-toggle="ar" tabindex="0" aria-expanded="' + (open ? "true" : "false") + '" style="cursor:pointer"><td>' + I(open ? "chevrons-up-down" : "chevron-right") + ' Zahlungen auf AR1–AR3<span class="ref">laut Zahlungsavisos · aufklappen</span></td><td></td><td></td><td class="r">−987.106,25 €</td></tr>' +
      (open ? ar : "") +
      tr("total", "Restforderung", "", "", "", "170.060,89 €") + "</tbody></table>";
  }

  // ---------- Vorprüfung (Aufbau wie BuildPass/Textura) ----------
  var G = [
    ["22.04.12B", "Plattenheizkörper Typ 22", "14 Stk Mehrmenge", "Aufmaß nicht gegengezeichnet", "AB-12 ohne Unterschrift des GU", "Plan D und Mail 07.04. beilegen, gemeinsames Aufmaß nachholen", 638400, "", "J1"],
    ["RB-11", "Steigleitung umlegen", "3 h Monteur", "Stunden weichen ab", "Bericht 24 h, Stundenliste KW 23: 21 h", "Stunden korrigieren oder Liste nachreichen", 18750, "", "J3"],
    ["24.05.02A", "Position aus AR3", "36,00 €", "Rechenfehler", "48 Stk × 112,60 € = 5.404,80 €, verrechnet 5.440,80 €", "Betrag korrigieren, sonst wird der Fehler übernommen", 3600, "bereits in AR3 gekürzt", ""],
    ["Z-01", "Kernbohrungen DN 100", "ganze Position", "Außerhalb des LV", "12 Stk ohne Nachtragsauftrag", "Anweisung suchen oder herausnehmen", 216000, "bereits in AR3 gekürzt", ""]
  ];
  function vorpruefTable() {
    return '<table class="sw-table" style="table-layout:fixed"><colgroup><col style="width:23%"><col style="width:12%"><col style="width:21%"><col><col style="width:120px"></colgroup><thead><tr><th>Position</th><th>Würde gekürzt</th><th>Grund</th><th>Notiz und Abhilfe</th><th class="r">Betrag</th></tr></thead><tbody>' +
      G.map(function (g) {
        return "<tr" + (g[8] ? ' data-open="' + g[8] + '" tabindex="0"' : "") + '><td class="sw-td-2"><div class="sw-cell"><b><span class="sw-pos-nr">' + g[0] + "</span>" + g[1] + "</b><span>" + (g[7] || (g[8] ? "Befund " + g[8] : "")) + '</span></div></td><td class="calc">' + g[2] + '</td><td><span class="sw-chip sw-chip--plain">' + g[3] + '</span></td><td class="sw-td-2"><div class="sw-cell"><b style="font-weight:400;white-space:normal">' + g[4] + '</b><span style="white-space:normal">' + g[5] + '</span></div></td><td class="r">' + euro(g[6]) + "</td></tr>";
      }).join("") + '<tr class="sum"><td>Summe</td><td></td><td></td><td class="meta sw-muted" style="font-weight:400">davon bereits in AR3 gekürzt: 2.196,00 €</td><td class="r">8.767,50 €</td></tr></tbody></table>';
  }

  // ---------- Belegmatrix (Projektzwilling als Arbeitsfläche) ----------
  function chip(key, txt, passiv) { var d = D[key]; return passiv ? '<span class="sw-source" style="cursor:default" title="Position ohne Befund">' + I(d.icon) + (txt || d.file) + "</span>" : '<button class="sw-source" data-src="' + key + '">' + I(d.icon) + (txt || d.file) + "</button>"; }
  function none() { return '<span class="sw-source sw-source--empty">kein Beleg</span>'; }
  function matrix() {
    var rows = [
      ["22.04.12B", "Plattenheizkörper Typ 22", chip("lv12b", "LV · S. 14"), chip("ab12", "AB-12 · S. 2"), "AR1–AR3", chip("planD", "H-201 · Index D"), chip("mail0704", "Mail 07.04."), "J1"],
      ["22.04.10A", "Plattenheizkörper Typ 11", chip("lv10a", "LV · S. 14", true), chip("ab12", "AB-12 · S. 2", true), "AR2", chip("planC", "H-201 · Index C", true), none(), ""],
      ["24.02.05A", "Mehrschicht-Verbundrohr 20 × 2,0", chip("lv05a", "LV · S. 31"), chip("ab04", "AB-04") + " " + chip("ab09", "AB-09"), "AR1–AR3", none(), none(), "J5"],
      ["22.06.03C", "Rohrdämmung 13 mm", chip("lv03c", "LV · S. 19"), chip("ab10", "AB-10"), "AR1–AR3", none(), none(), "J6"],
      ["26.03.04A", "Wickelfalzrohr DN 200", chip("lv04a", "LV · S. 47"), chip("ab13", "AB-13"), "AR1–AR3", chip("planL", "L-310 · Index E"), none(), "J7"]
    ];
    return '<table class="sw-table sw-matrix" style="table-layout:fixed"><colgroup><col style="width:26%"><col style="width:13%"><col style="width:19%"><col style="width:10%"><col style="width:17%"><col style="width:15%"></colgroup><thead><tr><th>LV-Position</th><th>LV</th><th>Aufmaß</th><th>Verrechnet in</th><th>Plan</th><th>Mail</th></tr></thead><tbody>' +
      rows.map(function (r) {
        return '<tr><td class="sw-td-2"><div class="sw-cell"><b><span class="sw-pos-nr">' + r[0] + "</span>" + r[1] + "</b><span>" + (r[7] ? "Befund " + r[7] : "ohne Befund") + "</span></div></td><td>" + r[2] + "</td><td>" + r[3] + '</td><td class="calc">' + r[4] + "</td><td>" + r[5] + "</td><td>" + r[6] + "</td></tr>";
      }).join("") + "</tbody></table>";
  }
  function upload() {
    return '<div class="sw-upload"><span class="sw-upload__h">Bestehender Stand</span><span></span><span class="sw-upload__h">Neuer Upload</span>' +
      '<div class="sw-doc">' + I("map") + '<div class="sw-doc__t"><b>H-201_Heizung_Stiege2_C.pdf</b><span>Index C · 12.02.2026</span></div></div><div class="sw-link sw-link--changed"></div><div class="sw-doc">' + I("map") + '<div class="sw-doc__t"><b>H-201_Heizung_Stiege2_D.pdf</b><span>Index D · 03.04.2026</span></div><span class="sw-chip sw-chip--plain">Neue Version</span></div>' +
      '<div class="sw-doc">' + I("ruler") + '<div class="sw-doc__t"><b>AB-12_Aufmass_Heizung.pdf</b><span>3 Seiten</span></div></div><div class="sw-link"></div><div class="sw-doc">' + I("ruler") + '<div class="sw-doc__t"><b>AB-12_Aufmass_Heizung (1).pdf</b><span>3 Seiten, identisch</span></div><span class="sw-chip sw-chip--plain">Duplikat</span></div>' +
      '<span></span><span></span><div class="sw-doc">' + I("file-text") + '<div class="sw-doc__t"><b>GU_Korrekturblatt_AR3.pdf</b><span>2 Seiten · eigener Dokumenttyp</span></div><span class="sw-chip sw-chip--pos">Zugeordnet</span></div></div>';
  }

  return { I: I, euro: euro, esc: esc, P: P, person: person, D: D, F: F, LISTEN: LISTEN, GRUENDE: GRUENDE, startStand: startStand, sidebar: sidebar, pagehead: pagehead, facts: facts, steps: steps, kpis: kpis, standHtml: standHtml, befundTable: befundTable, page: page, cascade: cascade, vorpruefTable: vorpruefTable, matrix: matrix, upload: upload, chip: chip };
})();
