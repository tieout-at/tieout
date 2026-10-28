-- tieout v2, step 10, part A: companies, members, and the history of decisions, tasks, settings and files.
-- Applied once, as a whole, in the SQL editor of the Supabase project tieout-app (Frankfurt). Tested in backend/test/
-- against a local Postgres (PGlite) with stand-ins for Supabase's auth and storage schemas.
--
-- Rules this file enforces in the database, so no browser can get around them:
-- - Data silo per company: every row carries firma_id, and every policy compares it with eigene_firma().
-- - History is append only: signed-in users may read and add, never change or delete.
-- - The server writes who and when: firma_id, user_id, person and zeit are set here, never taken from the browser.
-- - Decisions follow the decision bar (app/src/lib/decisions.ts): one step at a time, "Prüfung" by the Abrechnung,
--   "Freigabe" by the Geschäftsführung, and never by the person who checked (four eyes).
-- Synthetic data only until the legal clearance and the works council say otherwise. The v1 tables (zuruf_*) stay.

begin;

-- Companies and their members ------------------------------------------------------------------------------------

create table public.firma (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 200),
  angelegt_am timestamptz not null default now()
);

-- One company per account. Members are added by us in the dashboard (invite only, sign-up is off), never by the app.
create table public.mitglied (
  user_id uuid primary key references auth.users (id) on delete cascade,
  firma_id uuid not null references public.firma (id),
  name text not null check (char_length(name) between 1 and 200),
  rollen text[] not null check (cardinality(rollen) between 1 and 3 and rollen <@ array['abrechnung', 'geschaeftsfuehrung', 'bauleitung']),
  angelegt_am timestamptz not null default now()
);
create index mitglied_firma on public.mitglied (firma_id);

-- The company of the signed-in user, null for anyone else. Security definer, so the policies can read mitglied
-- without a policy on mitglied reading itself. Not named meine_firma(): agent/worker/supabase.sql (v1, not applied)
-- defines that name with another type.
create function public.eigene_firma() returns uuid
language sql stable security definer set search_path = ''
as $$ select m.firma_id from public.mitglied m where m.user_id = auth.uid() $$;

create function public.eigene_rollen() returns text[]
language sql stable security definer set search_path = ''
as $$ select coalesce((select m.rollen from public.mitglied m where m.user_id = auth.uid()), '{}') $$;

revoke all on function public.eigene_firma() from public, anon;
revoke all on function public.eigene_rollen() from public, anon;
grant execute on function public.eigene_firma() to authenticated;
grant execute on function public.eigene_rollen() to authenticated;

-- Stamps every new row with the member's company, id, name and the server's time. Refuses anyone without a company.
create function public.stempeln() returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  ich public.mitglied;
begin
  select * into ich from public.mitglied where user_id = auth.uid();
  if not found then
    raise exception 'Nur Mitglieder einer Firma können eintragen.' using errcode = '42501';
  end if;
  new.firma_id := ich.firma_id;
  new.user_id := ich.user_id;
  new.person := ich.name;
  new.zeit := now();
  return new;
end
$$;
revoke all on function public.stempeln() from public, anon, authenticated;

-- Decisions on finds ---------------------------------------------------------------------------------------------

-- The same work under an earlier key: a WhatsApp-Meldung that later got its Regiebericht ("p2/regie:6" was
-- "p2/meldung:P2-W1"). Written by us only, never by the browser, so nobody can pass another find off as an earlier
-- key. Stage 0: the links of the sample data in kern/ (fruehereSchluessel, compared by test/alias.test.ts), the same
-- for every company; per company once the twin lives on the server.
create table public.fund_alias (
  schluessel text not null check (char_length(schluessel) between 1 and 200),
  frueher text not null check (char_length(frueher) between 1 and 200),
  primary key (schluessel, frueher)
);
insert into public.fund_alias (schluessel, frueher) values ('p2/regie:6', 'p2/meldung:P2-W1');

create table public.entscheidung (
  id bigint generated always as identity primary key,
  firma_id uuid not null references public.firma (id),
  -- The business key of the find ("p1/plan:H-201:D").
  fund_schluessel text not null check (char_length(fund_schluessel) between 1 and 200),
  stand text not null check (stand in ('geprueft', 'freigegeben', 'in_schlussrechnung', 'nicht_verrechnen')),
  grund text check (grund is null or (char_length(grund) <= 1000 and grund !~ '[‎‏‪-‮⁦-⁩]')),
  -- Set by the server: the role the step needs, who took it, and when.
  rolle text not null check (rolle in ('abrechnung', 'geschaeftsfuehrung')),
  user_id uuid not null,
  person text not null,
  zeit timestamptz not null default now(),
  check (stand <> 'nicht_verrechnen' or grund is not null)
);
create index entscheidung_fund on public.entscheidung (firma_id, fund_schluessel, zeit desc);

-- Runs after stempeln() (triggers fire in name order: "a_" before "b_"): the step must be one the find can take from
-- its latest decision, by a member holding the role the step needs, and a release never by the person who checked.
create function public.entscheidung_pruefen() returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  schluessel text[];
  k text;
  bisher text;
  pruefer uuid;
begin
  -- Blanks of every kind (tab, non-breaking space) are no reason.
  new.grund := nullif(regexp_replace(new.grund, '^[\s  -​　﻿]+|[\s  -​　﻿]+$', '', 'g'), '');
  new.rolle := case new.stand when 'freigegeben' then 'geschaeftsfuehrung' else 'abrechnung' end;
  if not new.rolle = any (public.eigene_rollen()) then
    raise exception 'Diesen Schritt macht die %.', case new.rolle when 'abrechnung' then 'Abrechnung' else 'Geschäftsführung' end using errcode = '42501';
  end if;

  -- The find under its key and every key of the same work, as fund_alias links them.
  select array_agg(distinct s.k order by s.k) into schluessel from (
    select new.fund_schluessel as k
    union select a.frueher from public.fund_alias a where a.schluessel = new.fund_schluessel
    union select a.schluessel from public.fund_alias a where a.frueher = new.fund_schluessel
  ) s;

  -- One decision per work at a time: two clicks in the same second never both pass the check below. Every key is
  -- locked, in sorted order so two requests never wait for each other. The time is taken once the lock is held, so
  -- the order of the entries is the order in which they passed the check.
  foreach k in array schluessel loop
    perform pg_advisory_xact_lock(hashtextextended(new.firma_id::text || '/' || k, 0));
  end loop;
  new.zeit := clock_timestamp();

  select e.stand into bisher from public.entscheidung e
    where e.firma_id = new.firma_id and e.fund_schluessel = any (schluessel)
    order by e.zeit desc, e.id desc limit 1;
  bisher := coalesce(bisher, 'gefunden');

  if not (
    (bisher = 'gefunden' and new.stand in ('geprueft', 'nicht_verrechnen'))
    or (bisher = 'geprueft' and new.stand in ('freigegeben', 'nicht_verrechnen'))
    or (bisher = 'freigegeben' and new.stand in ('in_schlussrechnung', 'nicht_verrechnen'))
    or (bisher = 'nicht_verrechnen' and new.stand = 'geprueft')
  ) then
    raise exception 'Von % geht es nicht zu %.', bisher, new.stand using errcode = '23514';
  end if;

  if new.stand = 'freigegeben' then
    select e.user_id into pruefer from public.entscheidung e
      where e.firma_id = new.firma_id and e.fund_schluessel = any (schluessel) and e.stand = 'geprueft'
      order by e.zeit desc, e.id desc limit 1;
    if pruefer = new.user_id then
      raise exception 'Vier Augen: wer geprüft hat, gibt nicht frei.' using errcode = '42501';
    end if;
  end if;
  return new;
end
$$;
revoke all on function public.entscheidung_pruefen() from public, anon, authenticated;

create trigger a_stempeln before insert on public.entscheidung for each row execute function public.stempeln();
create trigger b_pruefen before insert on public.entscheidung for each row execute function public.entscheidung_pruefen();

-- Tasks and ticks ------------------------------------------------------------------------------------------------

create table public.aufgabe (
  -- The id the browser gave the task, unique within the company.
  id text not null check (char_length(id) between 1 and 100),
  firma_id uuid not null references public.firma (id),
  fund_schluessel text not null check (char_length(fund_schluessel) between 1 and 200),
  -- "F1 Wohnpark Mooshaim" and the find page; only an address inside the app.
  fund text not null check (char_length(fund) between 1 and 300 and fund !~ '[‎‏‪-‮⁦-⁩]'),
  href text not null check (char_length(href) <= 500 and href ~ '^/[A-Za-z0-9/_.#?=&%-]*$' and href !~ '^//'),
  -- Some text that is not blank, and no characters that turn the reading direction (they can disguise a text).
  text text not null check (char_length(text) <= 2000 and text ~ '[^\s  -​　﻿]' and text !~ '[‎‏‪-‮⁦-⁩]'),
  zustaendig text not null check (zustaendig in ('Abrechnung', 'Bauleitung', 'Geschäftsführung')),
  bis date,
  user_id uuid not null,
  person text not null,
  zeit timestamptz not null default now(),
  primary key (firma_id, id)
);
create trigger a_stempeln before insert on public.aufgabe for each row execute function public.stempeln();

create table public.aufgabe_erledigt (
  id bigint generated always as identity primary key,
  firma_id uuid not null references public.firma (id),
  aufgabe_id text not null,
  erledigt boolean not null,
  user_id uuid not null,
  person text not null,
  zeit timestamptz not null default now(),
  -- With firma_id set by the server, only a task of the own company can be ticked.
  foreign key (firma_id, aufgabe_id) references public.aufgabe (firma_id, id)
);
create index aufgabe_erledigt_aufgabe on public.aufgabe_erledigt (firma_id, aufgabe_id);
create trigger a_stempeln before insert on public.aufgabe_erledigt for each row execute function public.stempeln();

-- Settings of the Abläufe (step 9): the latest entry of a block and field counts ----------------------------------

create table public.ablauf_einstellung (
  id bigint generated always as identity primary key,
  firma_id uuid not null references public.firma (id),
  block text not null check (char_length(block) between 1 and 100 and block ~ '^[a-z0-9/_-]+$'),
  feld text not null check (feld in ('zustaendig', 'frist', 'schwelle')),
  wert text not null check (char_length(wert) between 1 and 100),
  user_id uuid not null,
  person text not null,
  zeit timestamptz not null default now()
);
create index ablauf_einstellung_block on public.ablauf_einstellung (firma_id, block, feld, zeit desc);
create trigger a_stempeln before insert on public.ablauf_einstellung for each row execute function public.stempeln();

-- Files: one row per upload with its source; the file itself lies in the private bucket "dateien" -----------------

create table public.datei (
  id uuid primary key default gen_random_uuid(),
  firma_id uuid not null references public.firma (id),
  projekt_id text not null check (projekt_id ~ '^[a-z0-9-]{1,50}$'),
  name text not null check (char_length(name) between 1 and 255 and name !~ '[/\\[:cntrl:]]' and name !~ '[‎‏‪-‮⁦-⁩]'),
  typ text not null check (typ in ('application/pdf', 'image/jpeg', 'image/png')),
  groesse bigint not null check (groesse between 1 and 20971520),
  -- SHA-256 of the file as the browser computed it before the upload.
  sha256 text not null check (sha256 ~ '^[0-9a-f]{64}$'),
  -- "<firma_id>/<id>": the only place in the bucket this file may be stored.
  pfad text not null unique,
  user_id uuid not null,
  person text not null,
  zeit timestamptz not null default now()
);
create index datei_firma on public.datei (firma_id, zeit desc);

create function public.datei_pfad() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  new.id := gen_random_uuid();
  new.pfad := new.firma_id::text || '/' || new.id::text;
  return new;
end
$$;
revoke all on function public.datei_pfad() from public, anon, authenticated;
create trigger a_stempeln before insert on public.datei for each row execute function public.stempeln();
create trigger b_pfad before insert on public.datei for each row execute function public.datei_pfad();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('dateien', 'dateien', false, 20971520, array['application/pdf', 'image/jpeg', 'image/png']);

-- Who may do what ------------------------------------------------------------------------------------------------

alter table public.firma enable row level security;
alter table public.mitglied enable row level security;
alter table public.entscheidung enable row level security;
alter table public.aufgabe enable row level security;
alter table public.aufgabe_erledigt enable row level security;
alter table public.ablauf_einstellung enable row level security;
alter table public.datei enable row level security;
alter table public.fund_alias enable row level security;

revoke all on public.firma, public.mitglied, public.fund_alias, public.entscheidung, public.aufgabe, public.aufgabe_erledigt, public.ablauf_einstellung, public.datei from public, anon, authenticated;
grant select on public.firma, public.mitglied, public.entscheidung, public.aufgabe, public.aufgabe_erledigt, public.ablauf_einstellung, public.datei to authenticated;
-- Only the columns the browser may fill; everything else comes from the server.
grant insert (fund_schluessel, stand, grund) on public.entscheidung to authenticated;
grant insert (id, fund_schluessel, fund, href, text, zustaendig, bis) on public.aufgabe to authenticated;
grant insert (aufgabe_id, erledigt) on public.aufgabe_erledigt to authenticated;
grant insert (block, feld, wert) on public.ablauf_einstellung to authenticated;
grant insert (projekt_id, name, typ, groesse, sha256) on public.datei to authenticated;

create policy lesen on public.firma for select to authenticated using (id = public.eigene_firma());
create policy lesen on public.mitglied for select to authenticated using (firma_id = public.eigene_firma());
create policy lesen on public.entscheidung for select to authenticated using (firma_id = public.eigene_firma());
create policy lesen on public.aufgabe for select to authenticated using (firma_id = public.eigene_firma());
create policy lesen on public.aufgabe_erledigt for select to authenticated using (firma_id = public.eigene_firma());
create policy lesen on public.ablauf_einstellung for select to authenticated using (firma_id = public.eigene_firma());
create policy lesen on public.datei for select to authenticated using (firma_id = public.eigene_firma());

create policy eintragen on public.entscheidung for insert to authenticated with check (firma_id = public.eigene_firma());
create policy eintragen on public.aufgabe for insert to authenticated with check (firma_id = public.eigene_firma());
create policy eintragen on public.aufgabe_erledigt for insert to authenticated with check (firma_id = public.eigene_firma());
-- How a company checks its invoices is set by the Abrechnung or the Geschäftsführung, not by the site.
create policy eintragen on public.ablauf_einstellung for insert to authenticated
  with check (firma_id = public.eigene_firma() and public.eigene_rollen() && array['abrechnung', 'geschaeftsfuehrung']);
create policy eintragen on public.datei for insert to authenticated with check (firma_id = public.eigene_firma());

-- Bucket "dateien": read the own company's files; store a file only at the place its row names, once (no update
-- and no delete policy, so nothing is overwritten or removed).
create policy dateien_lesen on storage.objects for select to authenticated
  using (bucket_id = 'dateien' and (storage.foldername(name))[1] = public.eigene_firma()::text);
create policy dateien_hochladen on storage.objects for insert to authenticated
  with check (
    bucket_id = 'dateien'
    and exists (select 1 from public.datei d where d.pfad = objects.name and d.firma_id = public.eigene_firma() and d.user_id = auth.uid())
  );

commit;
