-- tieout v2, step 14: a signature came back from the site ("Unterschrift liegt vor"). One row per entry, appended and
-- never changed; the latest entry per gap counts, gueltig = false takes it back. The core writes the fact into its copy
-- of the twin, so a Regiebericht counts as signed and the invoice moves. Abrechnung or Bauleitung enter it, and an entry
-- needs the signed sheet: a stored file of the own company at this very Beleg, so every signature leads to its original.

begin;

create table public.eingang (
  id bigint generated always as identity primary key,
  firma_id uuid not null references public.firma (id),
  -- The business key of the gap ("p1/unterschrift:rb-12", "p1/regiebericht:W4").
  luecke_schluessel text not null check (luecke_schluessel ~ '^[a-z0-9-]{1,50}/(unterschrift|gegenzeichnung|regiebericht):[A-Za-z0-9-]{1,80}$'),
  gueltig boolean not null,
  datei_id uuid references public.datei (id),
  user_id uuid not null,
  person text not null,
  zeit timestamptz not null default now()
);
create index eingang_luecke on public.eingang (firma_id, luecke_schluessel, id desc);

-- Runs after stempeln(): the role, and for a new entry the file of this Beleg in the own company.
create function public.eingang_pruefen() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.eigene_rollen() && array['abrechnung', 'bauleitung'] then
    raise exception 'Diesen Schritt macht die Abrechnung oder die Bauleitung.' using errcode = '42501';
  end if;
  if new.gueltig and not exists (
    select 1 from public.datei d
    where d.id = new.datei_id and d.firma_id = new.firma_id and d.beleg_id = lower(split_part(new.luecke_schluessel, ':', 2))
  ) then
    raise exception 'Ohne das unterschriebene Blatt geht das nicht.' using errcode = '23514';
  end if;
  return new;
end
$$;
revoke all on function public.eingang_pruefen() from public, anon, authenticated;

create trigger a_stempeln before insert on public.eingang for each row execute function public.stempeln();
create trigger b_pruefen before insert on public.eingang for each row execute function public.eingang_pruefen();

alter table public.eingang enable row level security;
revoke all on public.eingang from public, anon, authenticated;
grant select on public.eingang to authenticated;
grant insert (luecke_schluessel, gueltig, datei_id) on public.eingang to authenticated;
create policy lesen on public.eingang for select to authenticated using (firma_id = public.eigene_firma());
create policy eintragen on public.eingang for insert to authenticated with check (firma_id = public.eigene_firma());

-- WhatsApp-Meldung W4 becomes Regiebericht 16 once its signed sheet is entered; a decision on either key is the same work.
insert into public.fund_alias (schluessel, frueher) values ('p1/regie:16', 'p1/meldung:W4');

-- New entries reach the other people of the company live, as in 002_live.sql.
alter publication supabase_realtime add table public.eingang;

commit;
