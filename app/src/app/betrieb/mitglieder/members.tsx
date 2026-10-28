"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Users } from "lucide-react";

import { EmptyState } from "@/components/shell/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { rolesOf, rolesText, supabase, useAccount, type Role } from "@/lib/account";

type Member = { name: string; rollen: Role[] };

/**
 * The members of the signed-in person's company with their roles, as the database holds them (only the own company:
 * the policy on `mitglied` decides). In the demo the page explains what will be here.
 */
export function Members() {
  const account = useAccount();
  const [members, setMembers] = useState<Member[] | null>(null);
  const firma = account.stand === "konto" ? account.firma : null;

  useEffect(() => {
    if (!firma) return;
    let live = true;
    void supabase()
      .then((sb) => sb.from("mitglied").select("name, rollen").order("name"))
      .then(({ data }) => {
        if (live) setMembers((data ?? []).map((m) => ({ name: String(m.name), rollen: rolesOf(m.rollen) })));
      });
    return () => {
      live = false;
    };
  }, [firma]);

  if (!firma)
    return (
      <EmptyState icon={Users} title="Mitglieder" text="Abrechnung, Geschäftsführung und Bauleitung, jede Person mit ihrer Rolle. Mit Anmeldung stehen hier die Mitglieder Ihrer Firma.">
        {account.stand === "beispiel" && (
          <Link href="/anmelden/" className={buttonVariants()}>
            Anmelden
          </Link>
        )}
      </EmptyState>
    );

  return (
    <section aria-labelledby="mitglieder" className="mx-auto flex w-full max-w-[720px] flex-col gap-3 px-6 py-8 max-md:px-4">
      <div className="flex flex-col gap-1">
        <h2 id="mitglieder" className="text-base font-semibold">
          Mitglieder von {firma}
        </h2>
        <p className="text-xs text-fg-secondary">Konten und Rollen legt tieout an. Die Prüfung macht die Abrechnung, die Freigabe die Geschäftsführung, nie dieselbe Person.</p>
      </div>
      <ul className="flex flex-col rounded-xl bg-surface shadow-ring">
        {(members ?? []).map((m, i) => (
          <li key={`${i}-${m.name}`} className="flex h-11 items-center gap-2 px-3 shadow-line-bottom last:shadow-none">
            <span aria-hidden className="flex size-6 shrink-0 items-center justify-center rounded-full bg-fill-hover text-xs font-semibold">
              {m.name.slice(0, 1).toUpperCase()}
            </span>
            <span className="min-w-0 flex-1 truncate">{m.name}</span>
            <span className="text-xs text-fg-secondary">{rolesText(m.rollen)}</span>
          </li>
        ))}
        {members === null && <li className="flex h-11 items-center px-3 text-fg-muted">Mitglieder werden gelesen</li>}
      </ul>
    </section>
  );
}
