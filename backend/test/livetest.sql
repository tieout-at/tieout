-- Live test of the rules of migrations/001_basis.sql on the real Supabase project: paste into the SQL editor and run.
-- It makes five test people and two test companies, plays 26 cases through as those people (as PostgREST would, with
-- the role and the claim of the token), and then stops on purpose with the result as its error message, so the
-- database takes everything back. First run 28.10.2026: 26 of 26 right, nothing left behind.
do $t$
declare
  a1 uuid := '00000000-0000-4000-8000-0000000000a1'; -- company A, Abrechnung
  a2 uuid := '00000000-0000-4000-8000-0000000000a2'; -- company A, Geschäftsführung
  a3 uuid := '00000000-0000-4000-8000-0000000000a3'; -- company A, both
  b1 uuid := '00000000-0000-4000-8000-0000000000b1'; -- company B, both
  x1 uuid := '00000000-0000-4000-8000-0000000000c1'; -- signed in, no company
  fa uuid; fb uuid; pfad text;
  erg text[] := '{}'; r text; n_ok int := 0; n int := 0;
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

  insert into auth.users (id, aud, role, email) values
    (a1, 'authenticated', 'authenticated', 'livetest-a1@tieout.invalid'), (a2, 'authenticated', 'authenticated', 'livetest-a2@tieout.invalid'),
    (a3, 'authenticated', 'authenticated', 'livetest-a3@tieout.invalid'), (b1, 'authenticated', 'authenticated', 'livetest-b1@tieout.invalid'),
    (x1, 'authenticated', 'authenticated', 'livetest-x1@tieout.invalid');
  insert into public.firma (name) values ('Livetest A') returning id into fa;
  insert into public.firma (name) values ('Livetest B') returning id into fb;
  insert into public.mitglied (user_id, firma_id, name, rollen) values
    (a1, fa, 'Live A1', '{abrechnung}'), (a2, fa, 'Live A2', '{geschaeftsfuehrung}'),
    (a3, fa, 'Live A3', '{abrechnung,geschaeftsfuehrung}'), (b1, fb, 'Live B1', '{abrechnung,geschaeftsfuehrung}');

  -- number | person | statement (no "|" inside) | expected (LIKE)
  for r in select unnest(array[
    '01|a1|insert into public.entscheidung (fund_schluessel, stand) values (''p1/live'', ''geprueft'') returning person|Live A1',
    '02|b1|select count(*)::text from public.entscheidung|0',
    '03|b1|select count(*)::text from public.mitglied|1',
    '04|b1|select string_agg(name, '','') from public.firma|Livetest B',
    '05|a2|insert into public.entscheidung (fund_schluessel, stand) values (''p1/live'', ''freigegeben'') returning stand|freigegeben',
    '06|a1|insert into public.entscheidung (fund_schluessel, stand) values (''p1/live'', ''in_schlussrechnung'') returning stand|in_schlussrechnung',
    '07|a1|insert into public.entscheidung (fund_schluessel, stand) values (''p1/l2'', ''geprueft'') returning stand|geprueft',
    '08|a1|insert into public.entscheidung (fund_schluessel, stand) values (''p1/l2'', ''freigegeben'') returning stand|FEHLER:%Geschäftsführung%',
    '09|a3|insert into public.entscheidung (fund_schluessel, stand) values (''p1/l3'', ''geprueft'') returning stand|geprueft',
    '10|a3|insert into public.entscheidung (fund_schluessel, stand) values (''p1/l3'', ''freigegeben'') returning stand|FEHLER:%Vier Augen%',
    '11|a2|insert into public.entscheidung (fund_schluessel, stand) values (''p1/l4'', ''freigegeben'') returning stand|FEHLER:%gefunden%',
    '12|a1|update public.entscheidung set grund = ''x'' returning id::text|FEHLER:%permission denied%',
    '13|a1|delete from public.entscheidung returning id::text|FEHLER:%permission denied%',
    '14|a1|insert into public.entscheidung (fund_schluessel, stand, user_id) values (''p1/l5'', ''geprueft'', ''00000000-0000-4000-8000-0000000000a2'') returning stand|FEHLER:%permission denied%',
    '15|x1|insert into public.entscheidung (fund_schluessel, stand) values (''p1/l6'', ''geprueft'') returning stand|FEHLER:%Nur Mitglieder%',
    '16|-|select count(*)::text from public.entscheidung|FEHLER:%permission denied%',
    '17|a1|insert into public.entscheidung (fund_schluessel, stand) values (''p2/meldung:P2-W1'', ''geprueft'') returning stand|geprueft',
    '18|a1|insert into public.entscheidung (fund_schluessel, stand) values (''p2/regie:6'', ''geprueft'') returning stand|FEHLER:%Von geprueft%',
    '19|a1|select count(*)::text from public.fund_alias|FEHLER:%permission denied%',
    '20|a1|insert into public.entscheidung (fund_schluessel, stand, grund) values (''p1/l7'', ''nicht_verrechnen'', concat(chr(9), chr(160))) returning stand|FEHLER:%check%',
    '21|a1|insert into public.aufgabe (id, fund_schluessel, fund, href, text, zustaendig) values (''t1'', ''p1/l1'', ''F1'', ''javascript:alert(1)'', ''x'', ''Bauleitung'') returning id|FEHLER:%check%',
    '22|b1|insert into public.aufgabe_erledigt (aufgabe_id, erledigt) values (''t-a'', true) returning aufgabe_id|FEHLER:%foreign key%'
  ]) loop
    declare
      teil text[] := string_to_array(r, '|');
      nutzer uuid := case teil[2] when 'a1' then a1 when 'a2' then a2 when 'a3' then a3 when 'b1' then b1 when 'x1' then x1 else null end;
      ist text := pg_temp.versuch(nutzer, teil[3]);
      gut boolean := ist like teil[4];
    begin
      n := n + 1; if gut then n_ok := n_ok + 1; end if;
      erg := erg || (teil[1] || (case when gut then ' ok' else ' FALSCH' end) || ': ' || left(ist, 90));
    end;
  end loop;

  -- Files: A stores a row and the file at its place; B does not see it and cannot store anything without a row.
  pfad := pg_temp.versuch(a1, 'insert into public.datei (projekt_id, name, typ, groesse, sha256) values (''p1'', ''Regiebericht 11.pdf'', ''application/pdf'', 1000, repeat(''a'', 64)) returning pfad');
  r := pg_temp.versuch(a1, 'insert into storage.objects (bucket_id, name) values (''dateien'', ' || quote_literal(pfad) || ') returning name');
  n := n + 1; if r = pfad then n_ok := n_ok + 1; end if; erg := erg || ('23 ' || case when r = pfad then 'ok' else 'FALSCH' end || ': Datei abgelegt ' || left(r, 60));
  r := pg_temp.versuch(b1, 'select count(*)::text from storage.objects where bucket_id = ''dateien''');
  n := n + 1; if r = '0' then n_ok := n_ok + 1; end if; erg := erg || ('24 ' || case when r = '0' then 'ok' else 'FALSCH' end || ': B sieht Dateien ' || r);
  r := pg_temp.versuch(a2, 'select count(*)::text from storage.objects where bucket_id = ''dateien''');
  n := n + 1; if r = '1' then n_ok := n_ok + 1; end if; erg := erg || ('25 ' || case when r = '1' then 'ok' else 'FALSCH' end || ': A sieht Dateien ' || r);
  r := pg_temp.versuch(b1, 'insert into storage.objects (bucket_id, name) values (''dateien'', ' || quote_literal(fb::text || '/fremd') || ') returning name');
  n := n + 1; if r like 'FEHLER:%row-level security%' then n_ok := n_ok + 1; end if; erg := erg || ('26 ' || case when r like 'FEHLER:%row-level security%' then 'ok' else 'FALSCH' end || ': ohne Zeile ' || left(r, 60));

  raise exception 'LIVETEST % von % richtig (alles zurückgenommen) %', n_ok, n, chr(10) || array_to_string(erg, chr(10));
end
$t$;
