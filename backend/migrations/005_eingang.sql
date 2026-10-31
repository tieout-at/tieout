-- tieout v2, step 14: a signature came back from the site ("Unterschrift liegt vor"). One row per entry, appended and
-- never changed; the latest entry per gap counts, gueltig = false takes it back. The core writes the fact into its copy
-- of the twin, so a Regiebericht counts as signed and the invoice moves. Abrechnung or Bauleitung enter it, and an entry
-- needs the signed sheet: a stored file of the own company at this very Beleg, so every signature leads to its original.
-- Stage 0 cannot tie the file to the project too (the key says "p1", the file "wohnpark-mooshaim"; step 16 brings the
-- projects into the database): a file at a Beleg of the same name in another project of the company is taken.

begin;

create table public.eingang (
  id bigint generated always as identity primary key,
  firma_id uuid not null references public.firma (id),
  -- The business key of the gap ("p1/unterschrift:rb-12", "p1/regiebericht:W4").
  luecke_schluessel text not null check (luecke_schluessel ~ '^[a-z0-9-]{1,50}/((unterschrift|gegenzeichnung):[a-z0-9-]{1,80}|regiebericht:[A-Za-z0-9-]{1,80})$'),
  gueltig boolean not null,
  datei_id uuid references public.datei (id),
  -- The day the sheet was signed, as the person entered it.
  unterschrieben_am date,
  user_id uuid not null,
  person text not null,
  zeit timestamptz not null default now(),
  -- Taking an entry back names no file and no day.
  check (gueltig or (datei_id is null and unterschrieben_am is null))
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
    join storage.objects o on o.bucket_id = 'dateien' and o.name = d.pfad
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
grant insert (luecke_schluessel, gueltig, datei_id, unterschrieben_am) on public.eingang to authenticated;
create policy lesen on public.eingang for select to authenticated using (firma_id = public.eigene_firma());
create policy eintragen on public.eingang for insert to authenticated with check (firma_id = public.eigene_firma());

-- New entries reach the other people of the company live, as in 002_live.sql.
alter publication supabase_realtime add table public.eingang;

commit;
