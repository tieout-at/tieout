"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LogIn, MailCheck } from "lucide-react";

import { Illustration } from "@/components/shell/empty-state";
import { field } from "@/components/fund/decision-confirm";
import { Button, buttonVariants } from "@/components/ui/button";
import { rolesText, sendLink, signOut, startSignIn, useAccount } from "@/lib/account";

/**
 * Attio's sign-in in tieout's frame: one address, a link by e-mail, no password. Accounts are set up by tieout
 * (sign-up is off), so the page says the same for every address and never tells whether one has an account.
 */
export function SignInForm() {
  const account = useAccount();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<{ step: "ask" } | { step: "sending" } | { step: "sent"; to: string } | { step: "error"; why: string }>({ step: "ask" });

  useEffect(() => startSignIn(), []);

  if (account.stand === "konto" || account.stand === "ohne_firma") {
    return (
      <Frame icon={LogIn} title={account.stand === "konto" ? account.firma : "Konto ohne Firma"}>
        <p className="text-fg-secondary">
          {account.stand === "konto"
            ? `${account.person}, ${rolesText(account.rollen)}. Die Seiten zeigen die Beispieldaten von tieout.`
            : `${account.email} gehört noch zu keiner Firma. tieout ordnet das Konto zu.`}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link href="/" className={buttonVariants({ variant: "primary" })}>
            Zum Start
          </Link>
          <Button onClick={() => void signOut()}>Abmelden</Button>
        </div>
      </Frame>
    );
  }

  if (state.step === "sent") {
    return (
      <Frame icon={MailCheck} title="Link ist unterwegs">
        <p className="text-fg-secondary">
          Wenn es für {state.to} ein Konto gibt, kommt in wenigen Minuten eine E-Mail mit dem Link. Öffnen Sie ihn in diesem Browser.
        </p>
        <Button onClick={() => setState({ step: "ask" })}>Andere Adresse</Button>
      </Frame>
    );
  }

  const sending = state.step === "sending";
  return (
    <Frame icon={LogIn} title="Anmelden">
      <p className="text-fg-secondary">Für Firmen mit Konto. Die Beispieldaten sind ohne Anmeldung offen.</p>
      <form
        className="flex w-full flex-col gap-2 text-left"
        onSubmit={async (e) => {
          e.preventDefault();
          const to = email.trim();
          if (!to || sending) return;
          setState({ step: "sending" });
          const result = await sendLink(to, `${window.location.origin}/`);
          setState(result.ok ? { step: "sent", to } : { step: "error", why: result.why });
        }}
      >
        <label className="flex flex-col gap-1 text-xs text-fg-secondary">
          E-Mail-Adresse
          <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@firma.at" className={field} />
        </label>
        {state.step === "error" && (
          <p role="alert" className="text-xs text-fg">
            {state.why}
          </p>
        )}
        <Button type="submit" variant="primary" size="lg" disabled={sending || account.stand === "laden" || !email.trim()} className="w-full">
          {sending ? "Link wird geschickt" : "Link schicken"}
        </Button>
      </form>
      <Link href="/" className="text-xs text-fg-secondary underline-offset-2 hover:underline">
        Ohne Anmeldung weiter zu den Beispieldaten
      </Link>
    </Frame>
  );
}

function Frame({ icon, title, children }: { icon: React.ComponentProps<typeof Illustration>["icon"]; title: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-full items-center justify-center px-4 py-12">
      <div className="flex w-full max-w-[340px] flex-col items-center gap-5 text-center">
        <Illustration icon={icon} />
        <h2 className="text-xl font-semibold">{title}</h2>
        {children}
      </div>
    </div>
  );
}
