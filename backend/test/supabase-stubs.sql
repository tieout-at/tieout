-- Stand-ins for what Supabase provides, so migrations/ can run in a local Postgres (PGlite) for the tests: the roles
-- anon and authenticated, auth.users with auth.uid() read from the request's claim, and the storage tables the
-- policies use. Only the parts the migrations touch; never applied to Supabase.

create role anon nologin;
create role authenticated nologin;
grant usage on schema public to anon, authenticated;

create schema auth;
create table auth.users (id uuid primary key);
create function auth.uid() returns uuid
language sql stable
as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
grant usage on schema auth to anon, authenticated;
grant execute on function auth.uid() to anon, authenticated;

create schema storage;
create table storage.buckets (
  id text primary key,
  name text not null,
  public boolean not null default false,
  file_size_limit bigint,
  allowed_mime_types text[]
);
create table storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text not null references storage.buckets (id),
  name text not null,
  unique (bucket_id, name)
);
alter table storage.objects enable row level security;
create function storage.foldername(name text) returns text[]
language sql immutable
as $$ select (string_to_array(name, '/'))[1:cardinality(string_to_array(name, '/')) - 1] $$;
grant usage on schema storage to anon, authenticated;
-- As in Supabase: the roles hold every right on the table, the policies decide.
grant select, insert, update, delete on storage.objects to anon, authenticated;

-- Supabase creates this publication for Realtime; 002_live.sql adds tables to it.
create publication supabase_realtime;
