-- Supabase (Projekt tieout-app, Frankfurt) für den Zuruf-Agenten. Einspielen im SQL-Editor, einmal, in dieser Reihenfolge.
-- Nur synthetische Daten bis Gate R4. Nichts wird überschrieben: kein UPDATE, kein DELETE für angemeldete Nutzer.

-- 1. Zähler der KI-Aufrufe und Kosten je Tag (Grenzen 40 Aufrufe pro Tag und 20 US-Dollar pro Monat, für alle
--    zusammen, nie pro Person). Nur der Worker mit dem geheimen Schlüssel zählt; Nutzer sehen und ändern ihn nicht.
create table if not exists public.zuruf_tageszaehler (
  tag date primary key,
  ki_aufrufe integer not null default 0 check (ki_aufrufe >= 0),
  kosten_usd numeric(12, 6) not null default 0 check (kosten_usd >= 0)
);
alter table public.zuruf_tageszaehler enable row level security;
-- Keine Policy: mit RLS sieht anon/authenticated nichts. Der geheime Schlüssel umgeht RLS.

-- Stand für die Grenzen: Aufrufe heute, Kosten im Monat des Tages.
create or replace function public.zuruf_stand(p_tag date)
returns table (heute integer, monat_usd numeric)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    coalesce((select ki_aufrufe from public.zuruf_tageszaehler where tag = p_tag), 0),
    coalesce((select sum(kosten_usd) from public.zuruf_tageszaehler where tag >= date_trunc('month', p_tag)::date and tag <= p_tag), 0);
$$;

-- Buchen nach einer Nachricht: Aufrufe und Kosten dazuzählen (atomar).
create or replace function public.zuruf_buche(p_tag date, p_aufrufe integer, p_usd numeric) returns void
language sql
security invoker
set search_path = ''
as $$
  insert into public.zuruf_tageszaehler as z (tag, ki_aufrufe, kosten_usd) values (p_tag, p_aufrufe, p_usd)
  on conflict (tag) do update set ki_aufrufe = z.ki_aufrufe + excluded.ki_aufrufe, kosten_usd = z.kosten_usd + excluded.kosten_usd;
$$;
revoke all on function public.zuruf_stand(date) from public, anon, authenticated;
revoke all on function public.zuruf_buche(date, integer, numeric) from public, anon, authenticated;

-- 2. Ablage neuer Zurufe (Schritt B, ersetzt später den Browser-Speicher). Datensilo je Firma.
--    Die Firma eines Nutzers steht in app_metadata.firma (setzt nur der Server beim Einladen, Nutzer können es nicht ändern).
create or replace function public.meine_firma() returns text
language sql
stable
set search_path = ''
as $$ select auth.jwt() -> 'app_metadata' ->> 'firma' $$;

create table if not exists public.zuruf_ereignis (
  id bigint generated always as identity primary key,
  firma_id text not null,
  projekt_id text not null,
  -- Leistungsereignis des Agenten (Kennung und Fassung); jede Fassung ist eine eigene Zeile.
  ereignis_id text not null,
  version integer not null check (version >= 1),
  inhalt jsonb not null,
  -- Die Nachrichten, aus denen das Ereignis entstand (Quelle mit Zitat).
  nachrichten jsonb not null default '[]'::jsonb,
  erfasst timestamptz not null,
  angelegt_am timestamptz not null default now(),
  unique (firma_id, ereignis_id, version)
);
create index if not exists zuruf_ereignis_projekt on public.zuruf_ereignis (firma_id, projekt_id, angelegt_am);
alter table public.zuruf_ereignis enable row level security;

create policy "zuruf_ereignis lesen in der eigenen Firma" on public.zuruf_ereignis
  for select to authenticated
  using (firma_id = (select public.meine_firma()));

create policy "zuruf_ereignis anhängen in der eigenen Firma" on public.zuruf_ereignis
  for insert to authenticated
  with check (firma_id = (select public.meine_firma()));

-- Nur anhängen: Ändern und Löschen gibt es für Nutzer nicht (auch nicht über eine fehlende Policy hinweg).
revoke update, delete, truncate on public.zuruf_ereignis from anon, authenticated;

-- 3. Firma für die bisher eingeladenen Nutzer setzen (Demo: alle gehören zur Haustechnik Beispiel GmbH).
--    Neue Einladungen: im Worker beim Anlegen app_metadata: { firma: 'haustechnik-beispiel' } mitgeben.
-- update auth.users set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"firma":"haustechnik-beispiel"}'::jsonb;
