-- 010: Portuguese words for the blocked-word list (migration 007), now that the app is also in Portuguese.
-- Whole words unless prefix = true. Common words that are harmless in Portugal (e.g. "bicha" = queue, "pica")
-- are left out on purpose. Admins can add more in the SQL editor (see 007).
insert into public.blocked_terms (term, prefix) values
  ('caralho', true), ('foda', false), ('fodas', false), ('fodase', false), ('fodasse', false), ('foder', false),
  ('fodido', false), ('fodida', false), ('merda', false), ('merdas', false), ('cona', false), ('conas', false),
  ('piça', false), ('cabrão', false), ('cabrao', false), ('paneleiro', true), ('panasca', true), ('viado', false),
  ('vadia', false), ('pornografia', false), ('otário', false), ('otario', false),
  ('crlh', false)
on conflict (term) do nothing;
