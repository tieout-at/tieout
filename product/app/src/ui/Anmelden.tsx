"use client";

// Anmeldung: Google oder Code per E-Mail. Nur eingeladene Adressen kommen hinein
// (Selbstregistrierung ist im Supabase-Projekt aus, `shouldCreateUser: false`).

import Link from "next/link";
import { useEffect, useState } from "react";
import { sitzungAusAdresse, supabase, weiterZiel } from "@/anmeldung/client";
import { ANMELDESEITE, ANMELDUNG_AN, GOOGLE_AN } from "@/anmeldung/konfig";
import { LogoMark, Wortmarke } from "./Logo";

function meldung(text: string): string {
  if (/signups? not allowed|user not found/i.test(text)) return "Diese Adresse ist nicht eingeladen.";
  if (/expired|invalid/i.test(text)) return "Code falsch oder abgelaufen.";
  if (/rate limit|security purposes|too many/i.test(text)) return "Zu viele Versuche. Bitte kurz warten.";
  return "Anmeldung fehlgeschlagen.";
}

export function Anmelden() {
  const [schritt, setSchritt] = useState<"adresse" | "code">("adresse");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
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

  async function codeSenden(e: React.FormEvent) {
    e.preventDefault();
    const sb = supabase();
    if (!sb) return;
    setLaeuft(true);
    setFehler("");
    const { error } = await sb.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: false } });
    setLaeuft(false);
    if (error) return setFehler(meldung(error.message));
    setSchritt("code");
  }

  async function codePruefen(e: React.FormEvent) {
    e.preventDefault();
    const sb = supabase();
    if (!sb) return;
    setLaeuft(true);
    setFehler("");
    const { error } = await sb.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: "email" });
    if (error) {
      setLaeuft(false);
      return setFehler(meldung(error.message));
    }
    window.location.replace(weiterZiel());
  }

  async function google() {
    const sb = supabase();
    if (!sb) return;
    const ziel = new URL(ANMELDESEITE, window.location.origin);
    ziel.searchParams.set("weiter", weiterZiel());
    const { error } = await sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo: ziel.toString() } });
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
        ) : schritt === "adresse" ? (
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
            <form className="login__form" onSubmit={codeSenden}>
              <label className="login__label" htmlFor="email">
                E-Mail
              </label>
              <input id="email" className="login__feld" type="email" autoComplete="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} />
              <button type="submit" className="login__knopf" disabled={laeuft}>
                Code per E-Mail
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="login__titel">Code eingeben</h1>
            <p className="login__text">Gesendet an {email.trim()}</p>
            <form className="login__form" onSubmit={codePruefen}>
              <label className="login__label" htmlFor="code">
                Code
              </label>
              <input
                id="code"
                className="login__feld login__feld--code"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6,8}"
                maxLength={8}
                required
                autoFocus
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              />
              <button type="submit" className="login__knopf" disabled={laeuft}>
                Anmelden
              </button>
            </form>
            <button
              type="button"
              className="login__zurueck"
              onClick={() => {
                setSchritt("adresse");
                setCode("");
                setFehler("");
              }}
            >
              Andere Adresse
            </button>
          </>
        )}

        <p className="login__fehler" role="alert">
          {fehler}
        </p>
      </div>
    </main>
  );
}
