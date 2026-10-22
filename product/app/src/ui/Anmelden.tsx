"use client";

// Anmeldung: Google oder Link per E-Mail. Nur eingeladene Adressen kommen hinein
// (Selbstregistrierung ist im Supabase-Projekt aus, `shouldCreateUser: false`).
// Einladungen kommen als einmaliger Anmeldelink aus den Einstellungen; diese Seite nimmt ihn entgegen.

import Link from "next/link";
import { useEffect, useState } from "react";
import { sitzungAusAdresse, supabase, weiterZiel } from "@/anmeldung/client";
import { ANMELDESEITE, ANMELDUNG_AN, GOOGLE_AN } from "@/anmeldung/konfig";
import { LogoMark, Wortmarke } from "./Logo";

function meldung(text: string): string {
  if (/signups? not allowed|user not found/i.test(text)) return "Diese Adresse ist nicht eingeladen.";
  if (/not authorized/i.test(text)) return "Mail an diese Adresse geht noch nicht. Bitte um einen Anmeldelink.";
  if (/expired|invalid/i.test(text)) return "Link abgelaufen. Bitte neu anfordern.";
  if (/rate limit|security purposes|too many/i.test(text)) return "Zu viele Versuche. Bitte kurz warten.";
  return "Anmeldung fehlgeschlagen.";
}

function zurueckAdresse(): string {
  const ziel = new URL(ANMELDESEITE, window.location.origin);
  ziel.searchParams.set("weiter", weiterZiel());
  return ziel.toString();
}

export function Anmelden() {
  const [gesendet, setGesendet] = useState(false);
  const [email, setEmail] = useState("");
  const [fehler, setFehler] = useState("");
  const [laeuft, setLaeuft] = useState(false);

  useEffect(() => {
    const sb = supabase();
    if (!sb) return;
    (async () => {
      const f = await sitzungAusAdresse(sb);
      if (f) return setFehler(meldung(f));
      const { data } = await sb.auth.getSession();
      if (data.session) window.location.replace(weiterZiel());
    })();
  }, []);

  async function linkSenden(e: React.FormEvent) {
    e.preventDefault();
    const sb = supabase();
    if (!sb) return;
    setLaeuft(true);
    setFehler("");
    const { error } = await sb.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: false, emailRedirectTo: zurueckAdresse() } });
    setLaeuft(false);
    if (error) return setFehler(meldung(error.message));
    setGesendet(true);
  }

  async function google() {
    const sb = supabase();
    if (!sb) return;
    const { error } = await sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo: zurueckAdresse() } });
    if (error) setFehler(meldung(error.message));
  }

  return (
    <main className="login">
      <div className="login__spalte">
        <div className="login__marke">
          <LogoMark size={26} />
          <Wortmarke />
        </div>

        {!ANMELDUNG_AN ? (
          <>
            <h1 className="login__titel">Anmelden</h1>
            <p className="login__text">Die Anmeldung ist noch nicht eingerichtet.</p>
            <Link className="login__knopf" href="/">
              Zur App
            </Link>
          </>
        ) : gesendet ? (
          <>
            <h1 className="login__titel">Mail prüfen</h1>
            <p className="login__text">Link gesendet an {email.trim()}. Auf diesem Gerät öffnen.</p>
            <button
              type="button"
              className="login__zurueck"
              onClick={() => {
                setGesendet(false);
                setFehler("");
              }}
            >
              Andere Adresse
            </button>
          </>
        ) : (
          <>
            <h1 className="login__titel">Anmelden</h1>
            <p className="login__text">Nur auf Einladung.</p>
            {GOOGLE_AN && (
              <>
                <button type="button" className="login__knopf login__knopf--linie" onClick={google}>
                  Mit Google fortfahren
                </button>
                <div className="login__oder">oder</div>
              </>
            )}
            <form className="login__form" onSubmit={linkSenden}>
              <label className="login__label" htmlFor="email">
                E-Mail
              </label>
              <input id="email" className="login__feld" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              <button type="submit" className="login__knopf" disabled={laeuft}>
                Link per E-Mail
              </button>
            </form>
          </>
        )}

        <p className="login__fehler" role="alert">
          {fehler}
        </p>
      </div>
    </main>
  );
}
