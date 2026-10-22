"use client";

// Einstellungen in Abschnitten mit Zeilen: Bezeichnung links, Wert rechts (Linear „Settings“).
// Mitglieder und Einladen laufen über den Worker (/api/…), weil dafür der geheime Schlüssel nötig ist.

import { useEffect, useReducer, useState, useSyncExternalStore } from "react";
import { anzeigename, initialen, supabase, useNutzer } from "@/anmeldung/client";
import { ANMELDESEITE, ANMELDUNG_AN } from "@/anmeldung/konfig";
import { allesZuruecksetzen, wiederherstellen } from "@/zustand/speicher";
import { type Thema, themaGemerkt, themaSetzen } from "./thema";
import { zeigeToast } from "./Toast";

interface Mitglied {
  id: string;
  email: string;
  name: string;
  bild: string;
  eingeladen: string | null;
  zuletzt: string | null;
}

const DATUM = new Intl.DateTimeFormat("de-AT", { day: "2-digit", month: "2-digit", year: "numeric" });

function Avatar({ name, bild, gross }: { name: string; bild?: string; gross?: boolean }) {
  const klasse = gross ? "avatar avatar--gross" : "avatar";
  // eslint-disable-next-line @next/next/no-img-element
  return bild ? <img className={klasse} src={bild} alt="" referrerPolicy="no-referrer" /> : <span className={klasse}>{initialen(name)}</span>;
}

export function Einstellungen() {
  return (
    <div className="einst">
      {ANMELDUNG_AN && <Profil />}
      <Darstellung />
      {ANMELDUNG_AN && <Mitglieder />}
      <Daten />
    </div>
  );
}

function Profil() {
  const nutzer = useNutzer();
  const [name, setName] = useState<string | null>(null);
  if (!nutzer) return null;
  const aktuell = anzeigename(nutzer);
  const wert = name ?? aktuell;

  async function speichern(e: React.FormEvent) {
    e.preventDefault();
    const { error } = (await supabase()?.auth.updateUser({ data: { name: wert.trim() } })) ?? {};
    zeigeToast(error ? "Nicht gespeichert" : "Gespeichert");
    if (!error) setName(null);
  }

  async function abmelden() {
    await supabase()?.auth.signOut({ scope: "local" });
    window.location.replace(ANMELDESEITE);
  }

  return (
    <section className="einst__abschnitt">
      <h2 className="section-title">Profil</h2>
      <div className="einst__zeile">
        <span className="einst__label">Bild</span>
        <Avatar name={aktuell} bild={nutzer.user_metadata?.avatar_url as string | undefined} gross />
      </div>
      <form className="einst__zeile" onSubmit={speichern}>
        <label className="einst__label" htmlFor="name">
          Name
        </label>
        <span className="einst__wert">
          <input id="name" className="einst__feld" value={wert} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          {name !== null && name.trim() !== aktuell && (
            <button type="submit" className="sw-btn sw-btn--primary">
              Speichern
            </button>
          )}
        </span>
      </form>
      <div className="einst__zeile">
        <span className="einst__label">E-Mail</span>
        <span className="einst__wert">{nutzer.email}</span>
      </div>
      <div className="einst__zeile">
        <span className="einst__label">Sitzung</span>
        <span className="einst__wert">
          <button type="button" className="sw-btn" onClick={abmelden}>
            Abmelden
          </button>
        </span>
      </div>
    </section>
  );
}

const keinHoerer = () => () => {};

function Darstellung() {
  // Gemerkte Wahl aus dem Browser (beim Vorberechnen: „Wie Gerät“); nach einem Klick neu lesen.
  const [, neuLesen] = useReducer((x: number) => x + 1, 0);
  const thema = useSyncExternalStore<Thema>(keinHoerer, themaGemerkt, () => "system");
  const wahl: [Thema, string][] = [
    ["system", "Wie Gerät"],
    ["hell", "Hell"],
    ["dunkel", "Dunkel"],
  ];
  return (
    <section className="einst__abschnitt">
      <h2 className="section-title">Darstellung</h2>
      <div className="einst__zeile">
        <span className="einst__label">Thema</span>
        <span className="sw-tabs" role="group" aria-label="Thema">
          {wahl.map(([t, text]) => (
            <button
              key={t}
              type="button"
              className="sw-tab"
              aria-pressed={thema === t}
              onClick={() => {
                themaSetzen(t);
                neuLesen();
              }}
            >
              {text}
            </button>
          ))}
        </span>
      </div>
    </section>
  );
}

async function holeMitglieder(): Promise<{ mitglieder?: Mitglied[]; fehler: string }> {
  const r = await fetch("/api/mitglieder", { cache: "no-store" }).catch(() => null);
  const d = r ? await r.json().catch(() => null) : null;
  if (!r?.ok || !d?.mitglieder) return { fehler: d?.fehler ?? "Mitglieder nur online" };
  return { mitglieder: d.mitglieder, fehler: "" };
}

function Mitglieder() {
  const [liste, setListe] = useState<Mitglied[] | null>(null);
  const [fehler, setFehler] = useState("");
  const [email, setEmail] = useState("");
  const [laeuft, setLaeuft] = useState(false);

  function laden() {
    holeMitglieder().then((e) => {
      setFehler(e.fehler);
      if (e.mitglieder) setListe(e.mitglieder);
    });
  }
  useEffect(laden, []);

  const [link, setLink] = useState<{ email: string; url: string } | null>(null);

  async function anmeldelink(adresse: string) {
    setLaeuft(true);
    const r = await fetch("/api/einladen", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: adresse }) }).catch(() => null);
    const d = r ? await r.json().catch(() => null) : null;
    setLaeuft(false);
    if (!r?.ok || !d?.link) return zeigeToast(d?.fehler ?? "Einladung fehlgeschlagen");
    setLink({ email: adresse.trim(), url: d.link });
    laden();
  }

  async function einladen(e: React.FormEvent) {
    e.preventDefault();
    await anmeldelink(email);
    setEmail("");
  }

  async function kopieren() {
    if (!link) return;
    await navigator.clipboard.writeText(link.url).catch(() => null);
    zeigeToast(`Anmeldelink für ${link.email} kopiert`);
  }

  return (
    <section className="einst__abschnitt">
      <h2 className="section-title">
        Mitglieder {liste && <span className="sw-count">{liste.length}</span>}
      </h2>
      <form className="einst__einladen" onSubmit={einladen}>
        <input className="einst__feld" type="email" required placeholder="E-Mail-Adresse" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="E-Mail-Adresse einladen" />
        <button type="submit" className="sw-btn sw-btn--primary" disabled={laeuft}>
          Einladen
        </button>
      </form>
      {link && (
        <div className="einst__link" title="Einmaliger Anmeldelink, 24 Stunden gültig">
          <span className="sw-secondary">{link.email}</span>
          <code>{link.url}</code>
          <button type="button" className="sw-btn" onClick={kopieren}>
            Link kopieren
          </button>
        </div>
      )}
      {fehler && <p className="einst__hinweis">{fehler}</p>}
      {liste && (
        <table className="sw-table tab-liste tab-mitglieder">
          <thead>
            <tr>
              <th>Name</th>
              <th>E-Mail</th>
              <th style={{ width: 160 }}>Stand</th>
              <th style={{ width: 120 }} />
            </tr>
          </thead>
          <tbody>
            {liste.map((m) => (
              <tr key={m.id}>
                <td>
                  <span className="einst__person">
                    <Avatar name={m.name || m.email} bild={m.bild} />
                    {m.name || m.email.split("@")[0]}
                  </span>
                </td>
                <td className="sw-secondary">{m.email}</td>
                <td className="sw-secondary">{m.zuletzt ? `Zuletzt ${DATUM.format(new Date(m.zuletzt))}` : "Eingeladen"}</td>
                <td className="r">
                  <button type="button" className="sw-btn sw-btn--ghost sw-btn--sm" disabled={laeuft} onClick={() => anmeldelink(m.email)} title="Neuen Anmeldelink erzeugen">
                    Anmeldelink
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

function Daten() {
  return (
    <section className="einst__abschnitt">
      <h2 className="section-title">Daten</h2>
      <div className="einst__zeile">
        <span className="einst__label">Freigaben</span>
        <span className="einst__wert">
          <button
            type="button"
            className="sw-btn"
            title="Alle Freigaben in diesem Browser löschen"
            onClick={() => {
              const vorher = allesZuruecksetzen();
              zeigeToast("Freigaben zurückgesetzt", () => wiederherstellen(vorher));
            }}
          >
            Zurücksetzen
          </button>
        </span>
      </div>
    </section>
  );
}
