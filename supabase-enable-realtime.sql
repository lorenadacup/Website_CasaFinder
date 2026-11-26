-- Enable realtime for properties and users tables
alter publication supabase_realtime add table public.properties;
alter publication supabase_realtime add table public.users;
