-- tieout v2, step 10, part F (review finding, 28.10.2026): two free texts the browser fills get the checks the others
-- already have. A find key carries no control characters and none that turn the reading direction (they can disguise a
-- text), and a setting of an Ablauf takes only the values the app offers: a role for "zustaendig", a number of days or
-- percent for "frist" and "schwelle".

begin;

alter table public.entscheidung add constraint entscheidung_schluessel_zeichen check (fund_schluessel !~ '[[:cntrl:]\u200e\u200f\u202a-\u202e\u2066-\u2069]');
alter table public.aufgabe add constraint aufgabe_schluessel_zeichen check (fund_schluessel !~ '[[:cntrl:]\u200e\u200f\u202a-\u202e\u2066-\u2069]');
alter table public.ablauf_einstellung add constraint ablauf_einstellung_wert check (
  (feld = 'zustaendig' and wert in ('Abrechnung', 'Bauleitung', 'Geschäftsführung'))
  or (feld in ('frist', 'schwelle') and wert ~ '^[0-9]{1,3}$')
);

commit;
