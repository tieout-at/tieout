-- tieout v2, step 10, part E: a stored file belongs to one Beleg of a project ("rb-9" in "wohnpark-mooshaim"), so the
-- original viewer of that Beleg can open it. The browser names the Beleg; company, person, time, id and place are
-- still set by the server (001_basis.sql). Rows without a Beleg stay allowed, as before.

begin;

alter table public.datei add column beleg_id text check (beleg_id is null or beleg_id ~ '^[a-z0-9-]{1,80}$');
create index datei_beleg on public.datei (firma_id, projekt_id, beleg_id, zeit desc);
grant insert (beleg_id) on public.datei to authenticated;

commit;
