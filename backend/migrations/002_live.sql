-- tieout v2, step 10, part C: new decisions, tasks, ticks and settings reach the other people of the company live.
-- Adds the four tables to Supabase's publication for Realtime. Realtime sends a new row only to subscribers whose
-- policies allow them to read it (the "lesen" policies of 001_basis.sql), so a company still sees only its own rows.

alter publication supabase_realtime add table public.entscheidung, public.aufgabe, public.aufgabe_erledigt, public.ablauf_einstellung;
