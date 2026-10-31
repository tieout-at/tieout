-- Live test of migrations/005_eingang.sql on the real Supabase project: paste into the SQL editor and run. Same way as
-- livetest.sql: test people and companies, each case as that person, and a stop on purpose with the result as its error
-- message, so the database takes everything back.
do $t$
declare
  a1 uuid := '00000000-0000-4000-8000-0000000000a1'; -- company A, Abrechnung
  a2 uuid := '00000000-0000-4000-8000-0000000000a2'; -- company A, Geschäftsführung
  a4 uuid := '00000000-0000-4000-8000-0000000000a4'; -- company A, Bauleitung
  b1 uuid := '00000000-0000-4000-8000-0000000000b1'; -- company B, Abrechnung
  fa uuid; fb uuid;
  r text; d12 text; d9 text; d13 text; db text; pfad text;
  erg text[] := '{}'; n_ok int := 0; n int := 0;
  ein text := 'insert into public.eingang (luecke_schluessel, gueltig, datei_id) values ';
begin
  create function pg_temp.versuch(nutzer uuid, befehl text) returns text language plpgsql as $f$
  declare r text;
  begin
    if nutzer is null then
      perform set_config('request.jwt.claims', '', true);
      perform set_config('role', 'anon', true);
    else
      perform set_config('request.jwt.claims', json_build_object('sub', nutzer, 'role', 'authenticated')::text, true);
      perform set_config('role', 'authenticated', true);
    end if;
    execute befehl into r;
    execute 'reset role';
    return coalesce(r, 'ok');
  exception when others then
    return 'FEHLER: ' || sqlerrm;
  end $f$;

  create function pg_temp.datei(nutzer uuid, beleg text, ablegen boolean) returns text language plpgsql as $f$
  declare z text; p text;
  begin
    z := pg_temp.versuch(nutzer, 'insert into public.datei (projekt_id, beleg_id, name, typ, groesse, sha256) values (''wohnpark-mooshaim'', ' || quote_literal(beleg) || ', ''b.pdf'', ''application/pdf'', 10, repeat(''a'', 64)) returning id::text || ''|'' || pfad');
    p := split_part(z, '|', 2);
    if ablegen then perform pg_temp.versuch(nutzer, 'insert into storage.objects (bucket_id, name) values (''dateien'', ' || quote_literal(p) || ') returning name'); end if;
    return split_part(z, '|', 1);
  end $f$;

  insert into auth.users (id, aud, role, email) values
    (a1, 'authenticated', 'authenticated', 'livetest-a1@tieout.invalid'), (a2, 'authenticated', 'authenticated', 'livetest-a2@tieout.invalid'),
    (a4, 'authenticated', 'authenticated', 'livetest-a4@tieout.invalid'), (b1, 'authenticated', 'authenticated', 'livetest-b1@tieout.invalid');
  insert into public.firma (name) values ('Livetest A') returning id into fa;
  insert into public.firma (name) values ('Livetest B') returning id into fb;
  insert into public.mitglied (user_id, firma_id, name, rollen) values
    (a1, fa, 'Live A1', '{abrechnung}'), (a2, fa, 'Live A2', '{geschaeftsfuehrung}'), (a4, fa, 'Live A4', '{bauleitung}'), (b1, fb, 'Live B1', '{abrechnung}');

  d12 := pg_temp.datei(a1, 'rb-12', true);
  d9 := pg_temp.datei(a1, 'rb-9', true);
  d13 := pg_temp.datei(a1, 'rb-13', false);
  db := pg_temp.datei(b1, 'rb-12', true);

  -- number | person | statement (no "|" inside) | expected (LIKE)
  for r in select unnest(array[
    '01|a1|' || ein || '(''p1/unterschrift:rb-12'', true, ''' || d12 || ''') returning person|Live A1',
    '02|a4|' || ein || '(''p1/unterschrift:rb-12'', true, ''' || d12 || ''') returning person|Live A4',
    '03|a2|' || ein || '(''p1/unterschrift:rb-12'', true, ''' || d12 || ''') returning person|FEHLER:%Abrechnung oder die Bauleitung%',
    '04|a1|' || ein || '(''p1/unterschrift:rb-12'', true, null) returning person|FEHLER:%Ohne das unterschriebene Blatt%',
    '05|a1|' || ein || '(''p1/unterschrift:rb-12'', true, ''' || d9 || ''') returning person|FEHLER:%Ohne das unterschriebene Blatt%',
    '06|a1|' || ein || '(''p1/unterschrift:rb-13'', true, ''' || d13 || ''') returning person|FEHLER:%Ohne das unterschriebene Blatt%',
    '07|a1|' || ein || '(''p1/unterschrift:rb-12'', true, ''' || db || ''') returning person|FEHLER:%Ohne das unterschriebene Blatt%',
    '08|b1|select count(*)::text from public.eingang|0',
    '09|a2|select count(*)::text from public.eingang|2',
    '10|a1|' || ein || '(''p1/unterschrift:rb-12'', false, null) returning person|Live A1',
    '11|a1|update public.eingang set gueltig = true returning id::text|FEHLER:%permission denied%',
    '12|a1|delete from public.eingang returning id::text|FEHLER:%permission denied%',
    '13|-|select count(*)::text from public.eingang|FEHLER:%permission denied%',
    '14|a1|insert into public.eingang (luecke_schluessel, gueltig, firma_id) values (''p1/unterschrift:rb-12'', false, ''' || fb || ''') returning person|FEHLER:%permission denied%'
  ]) loop
    declare
      teil text[] := string_to_array(r, '|');
      nutzer uuid := case teil[2] when 'a1' then a1 when 'a2' then a2 when 'a4' then a4 when 'b1' then b1 else null end;
      ist text := pg_temp.versuch(nutzer, teil[3]);
      gut boolean := ist like teil[4];
    begin
      n := n + 1; if gut then n_ok := n_ok + 1; end if;
      erg := erg || (teil[1] || (case when gut then ' ok' else ' FALSCH' end) || ': ' || left(ist, 90));
    end;
  end loop;

  select count(*)::text into r from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'eingang';
  n := n + 1; if r = '1' then n_ok := n_ok + 1; end if; erg := erg || ('15 ' || case when r = '1' then 'ok' else 'FALSCH' end || ': live ' || r);

  raise exception 'LIVETEST % von % richtig (alles zurückgenommen) %', n_ok, n, chr(10) || array_to_string(erg, chr(10));
end
$t$;
